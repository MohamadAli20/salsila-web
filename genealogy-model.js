'use strict';
function validateWorkspace(w){
 if(!w||w.version!==1||!Array.isArray(w.people)||!Array.isArray(w.connections)||!Array.isArray(w.history)||w.people.length>500||w.connections.length>1000||w.history.length>5000)throw Error('Use a valid Salsila workspace export (up to 500 people).');
 const str=(s,n=300)=>typeof s==='string'&&s.length<=n;
 if(!str(w.title)||!w.title.trim())throw Error('Add a tree title.');
 const ids=new Set(),edges=new Set(),out=new Map();
 for(const p of w.people){if(!str(p.id,100)||!p.id||ids.has(p.id)||!str(p.name)||!p.name.trim()||!['living','deceased','unknown'].includes(p.life))throw Error('Invalid person record.');ids.add(p.id);}
 for(const c of w.connections){
  if(!str(c.id,100)||!c.id||edges.has(c.id)||!ids.has(c.parent)||!ids.has(c.child)||c.parent===c.child||!str(c.source,2000)||!c.source.trim()||!str(c.url,2000)||!['document','reference','oral-history'].includes(c.sourceType)||!['draft','review-requested'].includes(c.stage)||!Array.isArray(c.reviews)||c.reviews.length>100)throw Error('Invalid connection or missing source.');
  if(c.url){let u;try{u=new URL(c.url);}catch{throw Error('Use a full HTTP or HTTPS source URL.');}if(!['http:','https:'].includes(u.protocol))throw Error('Source links must use HTTP or HTTPS.');}
  if(w.connections.some(x=>x!==c&&x.parent===c.parent&&x.child===c.child))throw Error('This connection already exists.');
  for(const r of c.reviews)if(!['supports','disputes','needs-evidence'].includes(r.kind)||!str(r.note,2000)||!r.note.trim()||!str(r.date,100))throw Error('Invalid research note.');
  edges.add(c.id);out.set(c.parent,[...(out.get(c.parent)||[]),c.child]);
 }
 const visiting=new Set(),done=new Set();function visit(id){if(visiting.has(id))throw Error('This connection creates circular ancestry.');if(done.has(id))return;visiting.add(id);for(const child of out.get(id)||[])visit(child);visiting.delete(id);done.add(id);}for(const id of ids)visit(id);
 for(const h of w.history)if(!str(h.action,2000)||!str(h.date,100))throw Error('Invalid change history.');return w;
}
function workspaceStatus(c){return c.reviews.some(r=>r.kind==='disputes')?'Disputed in notes':c.stage==='review-requested'?'Review requested · local':'Draft';}
function addWorkspaceConnection(w,connection){const next=structuredClone(w);next.connections.push(connection);validateWorkspace(next);return next;}
