create function stamp_updated() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create table matters (
 id uuid primary key default gen_random_uuid(), name text not null unique check(length(trim(name))>0),
 owner text not null default '', jurisdiction text not null default 'NZ', purpose text not null default '',
 disclosure_due date, retention_review date, legal_hold boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table documents (
 id uuid primary key default gen_random_uuid(), matter_id uuid not null references matters,
 source_id text not null check(length(trim(source_id))>0), name text not null check(length(trim(name))>0),
 custodian text not null default '', source text not null default '', family_id text not null default '', parent_id text not null default '',
 md5 text not null default '' check(md5='' or md5 ~ '^[a-f0-9]{32}$'), document_date date,
 tags text not null default '', redacted boolean not null default false, protected boolean not null default false,
 owner text not null default '', due_date date, text_content text not null default '', text_sha256 text not null default '',
 original jsonb not null default '{}', revision integer not null default 1 check(revision>0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(matter_id,source_id)
);
create table decisions (
 id uuid primary key default gen_random_uuid(), document_id uuid not null references documents,
 revision integer not null, disposition text not null check(disposition in ('disclose','privileged','irrelevant')),
 adverse boolean not null default false, reason text not null check(length(trim(reason))>0),
 reviewer text not null check(length(trim(reviewer))>0), created_at timestamptz not null default now(),
 sequence bigserial unique
);
create table notes (id uuid primary key default gen_random_uuid(), document_id uuid not null references documents,
 body text not null check(length(trim(body))>0), actor text not null, created_at timestamptz not null default now());
create table imports (id uuid primary key default gen_random_uuid(), matter_id uuid not null references matters,
 file_name text not null, sha256 text not null, rows integer not null, actor text not null, created_at timestamptz not null default now());
create table activity (id uuid primary key default gen_random_uuid(), entity text not null, record_id uuid not null,
 actor text not null, before_record jsonb, after_record jsonb, created_at timestamptz not null default now(), sequence bigserial unique);
create function record_change() returns trigger language plpgsql as $$ begin
 insert into activity(entity,record_id,actor,before_record,after_record) values(TG_TABLE_NAME,new.id,coalesce(nullif(current_setting('app.actor',true),''),'system'),case when TG_OP='UPDATE' then to_jsonb(old) else null end,to_jsonb(new)); return new; end $$;
create function immutable_record() returns trigger language plpgsql as $$ begin raise exception 'Append-only record'; end $$;
do $$ declare t text; begin
 foreach t in array array['matters','documents'] loop
 execute format('create trigger stamp before update on %I for each row execute function stamp_updated()',t);
 end loop;
 foreach t in array array['matters','documents','decisions','notes','imports'] loop
 execute format('create trigger audit after insert or update on %I for each row execute function record_change()',t);
 end loop;
 foreach t in array array['decisions','notes','imports','activity'] loop
 execute format('create trigger immutable before update or delete on %I for each row execute function immutable_record()',t);
 end loop;
 foreach t in array array['matters','documents','decisions','notes','imports','activity'] loop
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 end loop;
end $$;
create index documents_matter on documents(matter_id);
create index documents_search on documents using gin(to_tsvector('english',name || ' ' || text_content));
create view review_register as
 select d.*,m.name as matter,m.disclosure_due,r.disposition,r.adverse,r.reason,r.reviewer,
 r.created_at as reviewed_at,
 case when r.id is null then 'unreviewed' when r.revision<>d.revision then 'stale' else 'current' end as review_status
 from documents d join matters m on m.id=d.matter_id
 left join lateral(select * from decisions x where x.document_id=d.id order by x.sequence desc limit 1) r on true;
create view family_gaps as
 select d.id,d.matter_id,d.source_id,d.name,d.parent_id,'missing parent'::text as issue
 from documents d where d.parent_id<>'' and not exists(select 1 from documents p where p.matter_id=d.matter_id and p.source_id=d.parent_id);
create view disclosure_register as
 select r.id,r.matter_id,r.source_id,r.name,r.custodian,r.family_id,r.document_date,r.disposition,r.adverse,r.review_status,
 case when r.review_status<>'current' then 'review required'
 when r.disposition<>'disclose' then 'withheld by reviewer'
 when r.redacted or r.protected then 'check redacted or protected source'
 when r.custodian='' then 'custodian required'
 when exists(select 1 from family_gaps g where g.id=r.id) then 'missing parent'
 when r.family_id<>'' and exists(select 1 from review_register f where f.matter_id=r.matter_id and f.family_id=r.family_id and (f.review_status<>'current' or f.disposition<>'disclose' or f.redacted or f.protected)) then 'family review required'
 else 'candidate for lawyer review' end as readiness
 from review_register r;
create view attention as
 select r.id,r.matter_id,r.source_id,r.name,r.owner,r.due_date,r.review_status,
 concat_ws('; ',case when r.owner='' then 'unassigned' end,case when r.review_status<>'current' then r.review_status end,
 case when r.due_date<current_date then 'overdue review' end,
 case when r.disclosure_due<current_date then 'matter deadline passed' end) as issue
 from review_register r where r.owner='' or r.review_status<>'current' or r.due_date<current_date or r.disclosure_due<current_date;
create view compliance_checks as
 select id,matter_id,source_id,'review'::text as rule,'Record a current human decision'::text as issue from review_register where review_status<>'current'
 union all select id,matter_id,source_id,'custodian','Record document custody' from documents where custodian=''
 union all select id,matter_id,source_id,'family',issue from family_gaps
 union all select id,id,name,'retention','Review purpose and retention; preserve legal holds' from matters where purpose='' or retention_review is null or retention_review<current_date
 union all select id,matter_id,source_id,'source','Inspect protected or redacted source before any disclosure' from documents where protected or redacted;
