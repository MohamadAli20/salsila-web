'use strict';
// Build a spanning descendant view from directed chart links, retaining partners
// as context without walking backwards into their ancestors or siblings.
function buildDescendantView(graph, rootId, maxGenerations=99){
 const ids=new Set(graph.labels.map(p=>p.id));if(!ids.has(rootId))throw Error('Unknown starting person.');
 const limit=Math.max(1,Math.min(99,Number(maxGenerations)||99)),out=new Map(),mates=new Map();
 for(const e of graph.edges){if(e.type==='lineage'){if(!out.has(e.from))out.set(e.from,[]);out.get(e.from).push(e.to);if(e.otherParent){if(!out.has(e.otherParent))out.set(e.otherParent,[]);out.get(e.otherParent).push(e.to);}}else if(e.type==='partnership'){for(const [a,b]of [[e.from,e.to],[e.to,e.from]]){if(!mates.has(a))mates.set(a,[]);mates.get(a).push(b);}}}
 const levels=new Map([[rootId,0]]),parents=new Map(),children=new Map(),queue=[rootId];
 for(let i=0;i<queue.length;i++){const id=queue[i],depth=levels.get(id);children.set(id,[]);if(depth+1>=limit)continue;
  const family=[id,...(mates.get(id)||[])];for(const child of out.get(id)||[]){if(family.includes(child)||levels.has(child))continue;levels.set(child,depth+1);parents.set(child,id);children.get(id).push(child);queue.push(child);}}
 const companions=new Map(),used=new Set(levels.keys());
 for(const id of queue){const list=[];for(const mate of mates.get(id)||[])if(!used.has(mate)){used.add(mate);list.push(mate);}companions.set(id,list);}
 return {rootId,levels,parents,children,companions,ids:used};
}
