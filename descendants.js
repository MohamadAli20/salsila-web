'use strict';
// Build a spanning descendant view from directed chart links, retaining connected boxes
// as context without walking backwards into their incoming or unrelated branches.
function buildDescendantView(graph, rootId, maxGenerations=99){
 const ids=new Set(graph.labels.map(p=>p.id));if(!ids.has(rootId))throw Error('Unknown starting person.');
 const limit=Math.max(1,Math.min(99,Number(maxGenerations)||99)),out=new Map(),mates=new Map();
 for(const e of graph.edges){const otherOrigin=e.otherOrigin||e.otherParent;if(e.type==='lineage'){if(!out.has(e.from))out.set(e.from,[]);out.get(e.from).push(e.to);if(otherOrigin){if(!out.has(otherOrigin))out.set(otherOrigin,[]);out.get(otherOrigin).push(e.to);}}else if(e.type==='connection'||e.type==='partnership'){for(const [a,b]of [[e.from,e.to],[e.to,e.from]]){if(!mates.has(a))mates.set(a,[]);mates.get(a).push(b);}}}
 const levels=new Map([[rootId,0]]),parents=new Map(),children=new Map(),queue=[rootId];
 for(let i=0;i<queue.length;i++){const id=queue[i],depth=levels.get(id);children.set(id,[]);if(depth+1>=limit)continue;
  const family=[id,...(mates.get(id)||[])];for(const child of out.get(id)||[]){if(family.includes(child)||levels.has(child))continue;levels.set(child,depth+1);parents.set(child,id);children.get(id).push(child);queue.push(child);}}
 const companions=new Map(),used=new Set(levels.keys());
 for(const id of queue){const list=[];for(const mate of mates.get(id)||[])if(!used.has(mate)){used.add(mate);list.push(mate);}companions.set(id,list);}
 return {rootId,levels,parents,children,companions,ids:used};
}

// Includes every reachable directed branch, independently of the current UI
// depth. Connected context cards are not counted as descendants.
function descendantRecords(graph,rootId){
 const projection=buildDescendantView(graph,rootId,99),labels=new Map(graph.labels.map(l=>[l.id,l]));
 return [...projection.levels].filter(([id])=>id!==rootId).map(([id,steps])=>({id,name:labels.get(id).name,aliases:labels.get(id).aliases||[],steps})).sort((a,b)=>a.steps-b.steps||a.name.localeCompare(b.name));
}

// Compare recorded path lengths, not visual rows or proven biological ages.
function generationGapReport(graph,constraint){
 function pathTo(target){const projection=buildDescendantView(graph,constraint.anchor,99);if(!projection.levels.has(target))return null;const path=[target];let current=target;while(projection.parents.has(current)){current=projection.parents.get(current);path.unshift(current);}return {steps:projection.levels.get(target),path};}
 const paths=constraint.members.map(id=>({id,...(pathTo(id)||{steps:null,path:[]})}));
 return {anchor:constraint.anchor,paths,difference:paths.every(p=>p.steps!==null)?Math.max(...paths.map(p=>p.steps))-Math.min(...paths.map(p=>p.steps)):null,confirmedMissingGenerations:null};
}
