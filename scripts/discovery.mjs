#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';
import {table} from './lib/format.mjs';
import {page,table as htmlTable,writeOut} from './lib/render.mjs';
export const usage={
 help:'help',matters:'matters','add-matter':'add-matter <name> --owner=<name> --purpose=<purpose>',matter:'matter <name-or-id>',
 'set-matter':'set-matter <matter> --owner= --purpose= --disclosure-due=YYYY-MM-DD --retention-review=YYYY-MM-DD --legal-hold=true|false',
 documents:'documents [--matter=<matter>]', 'add-document':'add-document <matter> <source-id> <name> --custodian=<name>',document:'document <source-id-or-name> [--matter=<matter>]',
 assign:'assign <document> --owner=<name> --due=YYYY-MM-DD',review:'review <document> --disposition=disclose|privileged|irrelevant --reason=<text> --actor=<reviewer> [--adverse=true]',
 'set-document':'set-document <document> --custodian=<name> --date=YYYY-MM-DD --actor=<name>',
 'review-queue':'review-queue [--matter=]', 'privilege-log':'privilege-log [--matter=]', 'adverse-documents':'adverse-documents [--matter=]',
 'family-gaps':'family-gaps [--matter=]',duplicates:'duplicates [--matter=]',chronology:'chronology [--matter=]',search:'search <words> [--matter=]',
 attention:'attention [--matter=]',compliance:'compliance [--matter=]','disclosure-readiness':'disclosure-readiness [--matter=]',
 'weekly-review':'weekly-review [--matter=]',log:'log <document> <note> --actor=<name>',history:'history <document>',imports:'imports',
 import:'import goldfynch <file.csv> --matter=<matter> --actor=<name> [--dry-run]',export:'export --out=<private-file.json>',
 'ingest-text':'ingest-text <document> <file.txt> --actor=<name>',
 'draft-disclosure':'draft-disclosure <matter>', 'draft-review':'draft-review <matter>'
};
const writes=new Set(['add-matter','set-matter','add-document','set-document','assign','review','log','import','ingest-text']);
const hash=s=>createHash('sha256').update(s).digest('hex');
const required=(v,n)=>{if(typeof v!=='string'||!v.trim())throw Error(`${n} is required`);return v.trim();};
function boolean(v,n){if(!['true','false'].includes(v))throw Error(`${n} must be true or false`);return v==='true';}
function date(v,n){if(v==='')return null;if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw Error(`${n} must be a valid YYYY-MM-DD date`);return v;}
function csvBool(v,n){if(!v)return false;if(/^(true|yes|1)$/i.test(v))return true;if(/^(false|no|0)$/i.test(v))return false;throw Error(`${n} must be true/false`);}
export function argumentsOf(args){const opts={},pos=[];for(const a of args){if(a.startsWith('--')){const i=a.indexOf('=');opts[i<0?a.slice(2):a.slice(2,i)]=i<0?true:a.slice(i+1);}else pos.push(a);}return {pos,opts};}
async function resolve(db,entity,query,matter){required(query,entity);const conditions=entity==='matters'?'lower(name)=lower($1) or id::text=$1':'lower(name)=lower($1) or lower(source_id)=lower($1) or id::text=$1';const suffix=matter?' and matter_id=$2':'';const params=matter?[query,matter]:[query];let rows=await db.query(`select * from ${entity} where (${conditions})${suffix} order by name`,params);if(!rows.length)rows=await db.query(`select * from ${entity} where (id::text ilike $1 or name ilike $1)${suffix} order by name`,matter?[query+'%',matter]:[query+'%']);if(rows.length!==1)throw Error(`${rows.length?'Ambiguous':'No matching'} ${entity}: ${query}${rows.length?'\n'+rows.map(r=>`${r.id} | ${r.name}`).join('\n'):''}`);return rows[0];}
async function dispatch(db,command,pos,o){
 const matter=o.matter?(await resolve(db,'matters',o.matter)).id:null;
 const doc=()=>resolve(db,'documents',pos[0],matter);
 const filtered=async(sql)=>db.query(sql+(matter?' where matter_id=$1':'')+' order by source_id',matter?[matter]:[]);
 const reports={
 documents:'select id,matter_id,source_id,name,custodian,owner,revision from documents',
 'review-queue':"select * from (select matter_id,source_id,name,owner,due_date,review_status from review_register where review_status<>'current') q",
 'privilege-log':"select * from (select matter_id,source_id,name,reason,reviewer,review_status from review_register where disposition='privileged') q",
 'adverse-documents':"select * from (select matter_id,source_id,name,disposition,review_status,reason from review_register where adverse) q",
 'family-gaps':'select matter_id,source_id,name,parent_id,issue from family_gaps',
 attention:'select matter_id,source_id,name,owner,due_date,issue from attention',
 compliance:'select matter_id,source_id,rule,issue from compliance_checks',
 'disclosure-readiness':'select matter_id,source_id,name,readiness from disclosure_register'
 };
 if(reports[command])return filtered(reports[command]);
 switch(command){
 case 'help': return Object.entries(usage).map(([command,usage])=>({command,usage}));
 case 'matters':return db.query('select * from matters order by name');
 case 'add-matter':return db.query('insert into matters(name,owner,purpose) values($1,$2,$3) returning *',[required(pos[0],'name'),required(o.owner,'owner'),required(o.purpose,'purpose')]);
 case 'matter':{const m=await resolve(db,'matters',pos[0]);return {matter:m,documents:await db.query('select source_id,name,review_status from review_register where matter_id=$1 order by source_id',[m.id])};}
 case 'set-matter':{const m=await resolve(db,'matters',pos[0]);const fields={'owner':'owner','purpose':'purpose','disclosure-due':'disclosure_due','retention-review':'retention_review','legal-hold':'legal_hold'};const changes=Object.entries(fields).filter(([k])=>o[k]!==undefined);if(!changes.length)throw Error('Specify a matter field');const values=changes.map(([k])=>k==='legal-hold'?boolean(o[k],k):k.endsWith('due')||k==='retention-review'?date(o[k],k):required(o[k],k));return db.query(`update matters set ${changes.map(([,v],i)=>`${v}=$${i+1}`).join(',')} where id=$${values.length+1} returning *`,[...values,m.id]);}
 case 'add-document':{const m=await resolve(db,'matters',pos[0]);return db.query('insert into documents(matter_id,source_id,name,custodian) values($1,$2,$3,$4) returning *',[m.id,required(pos[1],'source id'),required(pos[2],'name'),required(o.custodian,'custodian')]);}
 case 'document':{const d=await doc();return {document:d,decisions:await db.query('select * from decisions where document_id=$1 order by sequence',[d.id]),notes:await db.query('select * from notes where document_id=$1 order by created_at,id',[d.id])};}
 case 'assign':{const d=await doc();return db.query('update documents set owner=$1,due_date=$2 where id=$3 returning id,source_id,owner,due_date',[required(o.owner,'owner'),date(required(o.due,'due'),'due'),d.id]);}
 case 'set-document':{const d=await doc();const custodian=required(o.custodian,'custodian'),day=date(required(o.date,'date'),'date');return db.query('update documents set custodian=$1,document_date=$2,revision=revision+1 where id=$3 returning source_id,custodian,document_date,revision',[custodian,day,d.id]);}
 case 'review':{const d=await doc();return db.query('insert into decisions(document_id,revision,disposition,adverse,reason,reviewer) values($1,$2,$3,$4,$5,$6) returning *',[d.id,d.revision,required(o.disposition,'disposition'),o.adverse===undefined?false:boolean(o.adverse,'adverse'),required(o.reason,'reason'),required(o.actor,'actor')]);}
 case 'log':{const d=await doc();return db.query('insert into notes(document_id,body,actor) values($1,$2,$3) returning *',[d.id,required(pos[1],'note'),required(o.actor,'actor')]);}
 case 'history':{const d=await doc();return db.query("select entity,actor,before_record,after_record,created_at from activity where record_id=$1 or after_record->>'document_id'=$2 order by sequence",[d.id,d.id]);}
 case 'duplicates':return db.query(`select matter_id,md5,count(*) as copies,string_agg(source_id,', ' order by source_id) as documents from documents where md5<>'' ${matter?'and matter_id=$1':''} group by matter_id,md5 having count(*)>1 order by md5`,matter?[matter]:[]);
 case 'chronology':return db.query(`select matter_id,source_id,name,document_date from documents ${matter?'where matter_id=$1':''} order by document_date nulls last,source_id`,matter?[matter]:[]);
 case 'search':{const q=required(pos[0],'words');return db.query(`select matter_id,source_id,name,left(text_content,300) as excerpt from documents where to_tsvector('english',name || ' ' || text_content) @@ plainto_tsquery('english',$1) ${matter?'and matter_id=$2':''} order by source_id`,matter?[q,matter]:[q]);}
 case 'weekly-review':return {attention:await dispatch(db,'attention',[],o),disclosure:await dispatch(db,'disclosure-readiness',[],o),compliance:await dispatch(db,'compliance',[],o)};
 case 'imports':return db.query('select * from imports order by created_at,id');
 case 'ingest-text':{const d=await doc();const content=fs.readFileSync(required(pos[1],'text path'),'utf8');const sha=hash(content);return db.query('update documents set text_content=$1,text_sha256=$2,revision=revision+case when text_sha256<>$2 then 1 else 0 end where id=$3 returning source_id,revision,text_sha256',[content,sha,d.id]);}
 case 'import':{
  if(pos[0]!=='goldfynch')throw Error('Supported import: goldfynch');if(!matter)throw Error('--matter is required');
  const file=required(pos[1],'CSV file'),raw=fs.readFileSync(file,'utf8'),rows=parseCsv(raw);if(!rows.length)throw Error('CSV contains no document rows');
  const seen=new Set();let changed=0;
  for(const [i,r] of rows.entries()){
   const sid=required(pick(r,'GF ID'),`row ${i+2} GF ID`),name=required(pick(r,'File Name'),`row ${i+2} File Name`);
   if(seen.has(sid))throw Error(`Duplicate GF ID: ${sid}`);seen.add(sid);
   const md5=pick(r,'MD5 Hash').trim().toLowerCase();if(md5&&!/^[a-f0-9]{32}$/.test(md5))throw Error(`Invalid MD5 Hash for ${sid}`);
   const values=[matter,sid,name,pick(r,'Custodian'),pick(r,'Source'),pick(r,'Family ID'),pick(r,'Parent ID'),md5,pick(r,'Tags'),csvBool(pick(r,'Redacted?'),'Redacted?'),csvBool(pick(r,'Protected?'),'Protected?'),JSON.stringify(r)];
   const result=await db.query(`insert into documents(matter_id,source_id,name,custodian,source,family_id,parent_id,md5,tags,redacted,protected,original)
    values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)
    on conflict(matter_id,source_id) do update set name=excluded.name,custodian=excluded.custodian,source=excluded.source,family_id=excluded.family_id,parent_id=excluded.parent_id,md5=excluded.md5,tags=excluded.tags,redacted=excluded.redacted,protected=excluded.protected,original=excluded.original,revision=documents.revision+1,text_content='',text_sha256=''
    where documents.original is distinct from excluded.original returning id`,values);changed+=result.length;
  }
  await db.query('insert into imports(matter_id,file_name,sha256,rows,actor) values($1,$2,$3,$4,$5)',[matter,path.basename(file),hash(raw),rows.length,required(o.actor,'actor')]);
  return {rows:rows.length,changed,unchanged:rows.length-changed,dry_run:Boolean(o['dry-run']),source_sha256:hash(raw)};
 }
 case 'export':{const out=path.resolve(required(o.out,'--out'));if(fs.existsSync(out))throw Error('Export path already exists');const result={format:'discovery-review-v1',exported_at:new Date().toISOString()};for(const t of ['matters','documents','decisions','notes','imports','activity'])result[t]=await db.query(`select * from ${t} order by id`);fs.mkdirSync(path.dirname(out),{recursive:true,mode:0o700});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n',{mode:0o600,flag:'wx'});return {file:out,documents:result.documents.length};}
 case 'draft-disclosure':case 'draft-review':{
  const m=await resolve(db,'matters',pos[0]);const conditions={...o,matter:m.id};let sections;
  if(command==='draft-disclosure'){
   const rows=await db.query("select source_id,name,custodian,document_date,adverse from disclosure_register where matter_id=$1 and readiness='candidate for lawyer review' order by source_id",[m.id]);
   const held=await db.query("select count(*) as count from disclosure_register where matter_id=$1 and readiness<>'candidate for lawyer review'",[m.id]);
   sections=[{title:'Candidate document schedule',note:`Draft only. ${held[0].count} records withheld from this schedule. A lawyer checks scope, completeness, privilege and source copies before service. No source contents are attached.`,html:htmlTable(rows)}];
  }else{const r=await dispatch(db,'weekly-review',[],conditions);sections=Object.entries(r).map(([title,rows])=>({title,html:htmlTable(rows)}));}
  const file=writeOut('drafts',`${command}-${m.id}-${randomUUID()}`,page({title:command==='draft-disclosure'?'Draft discovery schedule':'Draft weekly review',subtitle:m.name,sections}));return {file,draft:true};
 }
 default:throw Error(`Unknown command: ${command}. Run help.`);
 }
}
export async function execute(db,args){const {pos,opts}=argumentsOf(args);const command=pos.shift()||'help';if(!usage[command])throw Error(`Unknown command: ${command}`);const write=writes.has(command);if(write)required(opts.actor,'--actor');await db.exec(write?'BEGIN':'BEGIN READ ONLY');try{if(write)await db.query("select set_config('app.actor',$1,true)",[opts.actor]);const result=await dispatch(db,command,pos,opts);await db.exec(opts['dry-run']?'ROLLBACK':'COMMIT');return result;}catch(e){await db.exec('ROLLBACK');throw e;}}
export function output(value){if(Array.isArray(value)){if(!value.length)return '(none)';return table(value,Object.keys(value[0]).filter(k=>!['id','matter_id'].includes(k)).map(key=>({key,label:key.replaceAll('_',' '),width:65,format:v=>v&&typeof v==='object'?JSON.stringify(v):v})));}return Object.entries(value).map(([k,v])=>Array.isArray(v)?`${k}\n${output(v)}`:`${k}: ${typeof v==='object'?JSON.stringify(v):v}`).join('\n\n');}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{db=await getDb();const result=await execute(db,process.argv.slice(2));console.log(process.argv.includes('--json')?JSON.stringify(result,null,2):output(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}}
