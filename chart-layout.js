'use strict';
// Layer connected cards together, then route arrows through the clear spaces
// between rows. Long arrows use dedicated outside lanes. At unrelated crossings
// the horizontal stroke has a gap, so crossing routes never imply a junction.
function layoutChart(graph, visibleIds=null){
 const labels=graph.labels.filter(l=>!visibleIds||visibleIds.has(l.id)),ids=new Set(labels.map(l=>l.id));
 const edges=graph.edges.filter(e=>ids.has(e.from)&&ids.has(e.to)&&(!e.otherOrigin||ids.has(e.otherOrigin)));
 const parent=new Map(labels.map(l=>[l.id,l.id])),find=id=>{while(parent.get(id)!==id)id=parent.get(id);return id;};
 for(const e of edges)if(e.type==='connection')parent.set(find(e.from),find(e.to));
 const groups=new Map();for(const l of labels){const root=find(l.id);if(!groups.has(root))groups.set(root,[]);groups.get(root).push(l.id);}
 const adjacent=new Map(labels.map(l=>[l.id,[]]));for(const e of edges)if(e.type==='connection'){adjacent.get(e.from).push(e.to);adjacent.get(e.to).push(e.from);}
 for(const [root,members]of groups){const start=members.find(id=>adjacent.get(id).length===1)||members[0],ordered=[],seen=new Set();function walk(id){if(seen.has(id))return;seen.add(id);ordered.push(id);for(const next of adjacent.get(id))walk(next);}walk(start);groups.set(root,ordered);}
 const incoming=new Map([...groups.keys()].map(k=>[k,new Set()])),outgoing=new Map([...groups.keys()].map(k=>[k,new Set()]));
 for(const e of edges)if(e.type==='lineage'){const a=find(e.from),b=find(e.to);if(a!==b){outgoing.get(a).add(b);incoming.get(b).add(a);}}
 const degree=new Map([...incoming].map(([k,v])=>[k,v.size])),ranks=new Map([...groups.keys()].map(k=>[k,0])),queue=[...degree].filter(([,n])=>!n).map(([k])=>k);
 for(let i=0;i<queue.length;i++){const k=queue[i];for(const next of outgoing.get(k)){ranks.set(next,Math.max(ranks.get(next),ranks.get(k)+1));degree.set(next,degree.get(next)-1);if(!degree.get(next))queue.push(next);}}
 if(queue.length!==groups.size)throw Error('Cannot lay out cyclic family branches.');
 const rows=[];for(const k of queue){const r=ranks.get(k);(rows[r]??=[]).push(k);}
 const order=new Map();for(let r=0;r<rows.length;r++){const bary=k=>{const list=[...incoming.get(k)];return list.length?list.reduce((s,n)=>s+(order.get(n)||0),0)/list.length:0;};rows[r].sort((a,b)=>bary(a)-bary(b));rows[r].forEach((k,i)=>order.set(k,i));}
 const W=210,H=94,GAP=46,PAD=60,TRACK=14;
 const rowWidth=row=>row.reduce((sum,k)=>sum+groups.get(k).length*(W+GAP)+45,0);
 const contentWidth=Math.max(1,...rows.map(rowWidth));
 const nets=new Map(),lineage=edges.filter(e=>e.type==='lineage');
 const netKey=e=>[e.from,e.otherOrigin].filter(Boolean).sort().join('|');
 for(const e of lineage){const key=netKey(e);if(!nets.has(key))nets.set(key,[]);nets.get(key).push(e);}
 const sourceSlots=new Map(),targetSlots=new Map(),outCount=rows.map(()=>0),inCount=rows.map(()=>0);
 for(const [key,list]of nets){const r=ranks.get(find(list[0].from));sourceSlots.set(key,outCount[r]++);}
 for(const e of lineage){const r=ranks.get(find(e.to));targetSlots.set(e,inCount[r]++);}
 const longEdges=lineage.filter(e=>ranks.get(find(e.to))-ranks.get(find(e.from))>1);
 const gutter=PAD+longEdges.length*TRACK,positions=new Map(),rowY=[];
 let y=PAD;
 for(let r=0;r<rows.length;r++){
  rowY[r]=y;let x=gutter+(contentWidth-rowWidth(rows[r]))/2;
  for(const k of rows[r]){for(const id of groups.get(k)){positions.set(id,{x,y,width:W,height:H,rank:r});x+=W+GAP;}x+=45;}
  y+=H+95+(outCount[r]+(inCount[r+1]||0))*TRACK;
 }
 const bounds={width:contentWidth+gutter*2,height:y+PAD},routes=[];
 const ports=new Map();for(const e of lineage){if(!ports.has(e.to))ports.set(e.to,[]);ports.get(e.to).push(e);}
 const sourceX=rows.map(()=>[]);
 for(const [key,list]of nets){const e=list[0],a=positions.get(e.from);let x=a.x+W*.4;if(e.otherOrigin){const b=positions.get(e.otherOrigin),left=a.x<b.x?a:b,right=a.x<b.x?b:a;x=(left.x+W+right.x)/2;}sourceX[a.rank].push(x);}
 const targetX=new Map();for(const e of lineage){const b=positions.get(e.to),list=ports.get(e.to);let x=b.x+W*.6+(list.indexOf(e)-(list.length-1)/2)*18;const blocked=sourceX[b.rank-1]||[];while(blocked.some(n=>Math.abs(n-x)<12))x+=14;targetX.set(e,x);}
 let longIndex=0;
 for(const e of edges){const a=positions.get(e.from),b=positions.get(e.to),key=e.type==='connection'?[e.from,e.to].sort().join('|'):netKey(e);let points;
  if(e.type==='connection'){
   const left=a.x<b.x?a:b,right=a.x<b.x?b:a;points=[{x:left.x+W,y:left.y+H/2},{x:right.x,y:right.y+H/2}];
  }else{
   let sx=a.x+W*.4,sy=a.y+H;
   if(e.otherOrigin){const mate=positions.get(e.otherOrigin),left=a.x<mate.x?a:mate,right=a.x<mate.x?mate:a;sx=(left.x+W+right.x)/2;sy=a.y+H/2;}
   const tx=targetX.get(e),ty=b.y;
   const sr=a.rank,tr=b.rank,sourceY=rowY[sr]+H+28+sourceSlots.get(key)*TRACK;
   if(tr===sr+1)points=[{x:sx,y:sy},{x:sx,y:sourceY},{x:tx,y:sourceY},{x:tx,y:ty}];
   else{
    const targetY=rowY[tr]-28-targetSlots.get(e)*TRACK;
    const lane=longIndex++*TRACK+PAD/2;
    const laneX=(sx+tx)/2<bounds.width/2?lane:bounds.width-lane;
    points=[{x:sx,y:sy},{x:sx,y:sourceY},{x:laneX,y:sourceY},{x:laneX,y:targetY},{x:tx,y:targetY},{x:tx,y:ty}];
   }
  }
  routes.push({edge:e,net:key,points});
 }
 // Break horizontal strokes at unrelated vertical crossings. Related routes
 // share only their actual source trunk; these are explicit source junctions.
 const segments=routes.flatMap(route=>route.points.slice(1).map((b,i)=>({a:route.points[i],b,route})));
 const vertical=segments.filter(s=>s.a.x===s.b.x&&s.a.y!==s.b.y);
 for(const route of routes){const pieces=[];for(let i=1;i<route.points.length;i++){
  const a=route.points[i-1],b=route.points[i];if(a.x===b.x){pieces.push([a,b]);continue;}
  const lo=Math.min(a.x,b.x),hi=Math.max(a.x,b.x),cuts=[];
  for(const v of vertical){if(v.route.net===route.net)continue;const x=v.a.x;if(x>lo+1&&x<hi-1&&a.y>Math.min(v.a.y,v.b.y)-.1&&a.y<Math.max(v.a.y,v.b.y)+.1)cuts.push([Math.max(lo,x-6),Math.min(hi,x+6)]);}
  cuts.sort((c,d)=>c[0]-d[0]);let cursor=lo;for(const [start,end]of cuts){if(start>cursor)pieces.push([{x:cursor,y:a.y},{x:start,y:a.y}]);cursor=Math.max(cursor,end);}if(cursor<hi)pieces.push([{x:cursor,y:a.y},{x:hi,y:a.y}]);
 }
 route.pieces=pieces;route.d=pieces.map(([a,b])=>`M ${a.x} ${a.y} L ${b.x} ${b.y}`).join(' ');
 }
 return {positions,bounds,routes};
}
