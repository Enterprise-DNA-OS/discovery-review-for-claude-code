insert into matters(id,name,owner,purpose,disclosure_due,retention_review) values
('10000000-0000-4000-8000-000000000001','Harbour Supply dispute','Mere','Fictional contract disclosure review',current_date+14,current_date+180),
('10000000-0000-4000-8000-000000000002','Coastal lease dispute','','',current_date-2,current_date-10) on conflict do nothing;
insert into documents(id,matter_id,source_id,name,custodian,family_id,parent_id,md5,document_date,tags,owner,due_date,text_content,redacted) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','GF001','Supply agreement.txt','Hana','','','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',current_date-90,'contract','Mere',current_date+3,'Supplier must deliver within ten days. Customer may reject damaged stock.',false),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','GF002','Delivery complaint.eml','Hana','F1','','bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',current_date-50,'adverse','Mere',current_date-3,'We acknowledge the shipment arrived late and damaged.',false),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','GF003','Counsel note.txt','Hana','F1','GF002','cccccccccccccccccccccccccccccccc',current_date-49,'privileged','Mere',current_date+2,'Fictional privileged legal advice. Do not disclose.',false),
('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','GF004','Agreement copy.txt','Tane','','','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',current_date-90,'contract','',current_date-1,'Supplier must deliver within ten days.',false),
('20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000002','GF005','Missing parent attachment.pdf','','F9','GF999','',null,'','',current_date-4,'',true)
on conflict do nothing;
insert into decisions(id,document_id,revision,disposition,adverse,reason,reviewer) values
('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',1,'disclose',false,'Relevant signed agreement','Mere'),
('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002',1,'disclose',true,'Evidence of delayed delivery','Mere'),
('30000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000003',1,'privileged',false,'Confidential communication for legal advice; lawyer to confirm','Mere')
on conflict do nothing;
