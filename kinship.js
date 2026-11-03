'use strict';
function findKinship(family, firstId, secondId){
 const people=new Map(family.people.map(p=>[p.id,p]));
 if(!people.has(firstId)||!people.has(secondId))return {label:'Relationship not established',detail:'More parent records are needed.'};
 if(firstId===secondId)return {label:'Same person',detail:people.get(firstId).name};
 const parents=new Map();for(const u of family.unions)for(const child of u.children)parents.set(child,u.partners.filter(id=>!id.startsWith('unknown-')));
 const ancestors=id=>{const distances=new Map([[id,0]]),queue=[id];for(let i=0;i<queue.length;i++){const current=queue[i];for(const p of parents.get(current)||[])if(!distances.has(p)){distances.set(p,distances.get(current)+1);queue.push(p);}}return distances;};
 const aa=ancestors(firstId),bb=ancestors(secondId),a=people.get(firstId).name,b=people.get(secondId).name;
 if(family.unions.some(u=>u.partners.includes(firstId)&&u.partners.includes(secondId)))return {label:'Connected people',detail:a+' and '+b+' share a recorded connection.'};
 function ancestorLabel(n){return n===1?'Parent / child':n===2?'Grandparent / grandchild':n===3?'Great-grandparent / great-grandchild':`${n-2}× great-grandparent / grandchild`;}
 if(aa.has(secondId))return {label:ancestorLabel(aa.get(secondId)),detail:b+' is a recorded ancestor of '+a+'.'};
 if(bb.has(firstId))return {label:ancestorLabel(bb.get(firstId)),detail:a+' is a recorded ancestor of '+b+'.'};
 const common=[...aa].filter(([id])=>bb.has(id)).map(([id,da])=>({id,da,db:bb.get(id)})).sort((x,y)=>(x.da+x.db)-(y.da+y.db)||Math.max(x.da,x.db)-Math.max(y.da,y.db));
 if(!common.length)return {label:'Relationship not established',detail:'No shared ancestor is encoded in the available family records.'};
 const c=common[0],near=Math.min(c.da,c.db),far=Math.max(c.da,c.db);let label;
 if(near===1&&far===1)label='Siblings';
 else if(near===1)label=far===2?'Aunt/uncle · niece/nephew':far===3?'Great-aunt/uncle · grandniece/nephew':'Extended aunt/uncle relationship';
 else{const degree=near-1,removed=far-near;label=degree===1?'First cousins':degree===2?'Second cousins':degree===3?'Third cousins':`${degree}th cousins`;if(removed)label+=removed===1?' · once removed':removed===2?' · twice removed':` · ${removed} times removed`;}
 return {label,detail:'Recorded common ancestor: '+people.get(c.id).name+'. Based on draft parent records.'};
}
