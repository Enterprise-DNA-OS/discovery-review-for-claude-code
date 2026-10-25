create or replace view disclosure_register as
 select r.id,r.matter_id,r.source_id,r.name,r.custodian,r.family_id,r.document_date,r.disposition,r.adverse,r.review_status,
 case when r.review_status<>'current' then 'review required'
 when r.disposition<>'disclose' then 'withheld by reviewer'
 when r.redacted or r.protected then 'check redacted or protected source'
 when r.custodian='' then 'custodian required'
 when exists(select 1 from family_gaps g where g.id=r.id) then 'missing parent'
 when r.family_id<>'' and exists(select 1 from review_register f where f.matter_id=r.matter_id and f.family_id=r.family_id and (f.review_status<>'current' or f.disposition<>'disclose' or f.redacted or f.protected or exists(select 1 from family_gaps g where g.id=f.id))) then 'family review required'
 else 'candidate for lawyer review' end as readiness
 from review_register r;
