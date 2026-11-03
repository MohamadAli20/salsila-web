import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const graph=JSON.parse(readFileSync('chart-index.json','utf8'));
const layoutChart=vm.runInNewContext(readFileSync('chart-layout.js','utf8')+';layoutChart;');
const descendants=vm.runInNewContext(readFileSync('descendants.js','utf8')+';buildDescendantView;');
const gapContext=vm.runInNewContext(readFileSync('chart-layout.js','utf8')+';withAncestryGapContext;');
function verify(ids=null,density='compressed'){
 ids=gapContext(graph,ids);
 const result=layoutChart(graph,ids,density),boxes=[...result.positions.values()],segments=result.routes.flatMap(r=>r.pieces.map(([a,b])=>({a,b,r})));
 assert.equal(result.positions.size,ids?.size||graph.labels.length);
 assert.equal(result.routes.length,[...graph.edges,...(graph.ancestryGaps||[])].filter(e=>(!ids||[e.from,e.to,e.otherOrigin].filter(Boolean).every(id=>ids.has(id)))).length,'A connection was lost');
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert(!(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y),'Overlapping cards');}
 for(const s of segments)for(const b of boxes){const xlo=Math.min(s.a.x,s.b.x),xhi=Math.max(s.a.x,s.b.x),ylo=Math.min(s.a.y,s.b.y),yhi=Math.max(s.a.y,s.b.y);assert(!(xhi>b.x+.01&&xlo<b.x+b.width-.01&&yhi>b.y+.01&&ylo<b.y+b.height-.01),'Line enters a card');}
 for(let i=0;i<segments.length;i++)for(let j=i+1;j<segments.length;j++){
  const a=segments[i],b=segments[j];if(a.r.net===b.r.net)continue;
  const ah=a.a.y===a.b.y,bh=b.a.y===b.b.y;
  if(ah===bh){const same=ah?a.a.y===b.a.y:a.a.x===b.a.x,alo=ah?Math.min(a.a.x,a.b.x):Math.min(a.a.y,a.b.y),ahi=ah?Math.max(a.a.x,a.b.x):Math.max(a.a.y,a.b.y),blo=ah?Math.min(b.a.x,b.b.x):Math.min(b.a.y,b.b.y),bhi=ah?Math.max(b.a.x,b.b.x):Math.max(b.a.y,b.b.y);assert(!(same&&Math.min(ahi,bhi)-Math.max(alo,blo)>.1),'Unrelated lines overlap');}
  else{const h=ah?a:b,v=ah?b:a;assert(!(v.a.x>Math.min(h.a.x,h.b.x)+.1&&v.a.x<Math.max(h.a.x,h.b.x)-.1&&h.a.y>Math.min(v.a.y,v.b.y)+.1&&h.a.y<Math.max(v.a.y,v.b.y)-.1),'Unrelated visible routes cross without a gap');}
 }
 return result;
}
const full=verify();
const samurong='chart-personal-samurong',dimaporo='chart-126';
assert.equal(full.positions.get(samurong).y,full.positions.get(dimaporo).y,'Reported cousins must share a display row');
const deepFamily=verify(descendants(graph,'chart-060',99).ids);
assert.equal(deepFamily.positions.get(samurong).y,deepFamily.positions.get(dimaporo).y,'Cousin alignment must work in the Maruhom branch');
const gap=vm.runInNewContext(readFileSync('descendants.js','utf8')+';generationGapReport;')(graph,graph.layoutConstraints[0]);
assert.equal(gap.difference,1);assert.equal(gap.confirmedMissingGenerations,null,'Layout must not turn a path discrepancy into a proven missing generation');
assert.equal(gap.paths.find(p=>p.id===samurong).steps,2);assert.equal(gap.paths.find(p=>p.id===dimaporo).steps,3);

for(const label of graph.labels)verify(descendants(graph,label.id,2).ids);
for(const name of ['Maruhom','Anginta','Amai Pondag','Batawi Datumulok','Datu Manong'])verify(descendants(graph,graph.labels.find(l=>l.name===name).id,99).ids);
const maruhom=graph.labels.find(l=>l.name==='Maruhom').id,anginta=graph.labels.find(l=>l.name==='Anginta').id,amai=graph.labels.find(l=>l.name==='Amai Pondag').id;
const family=verify(descendants(graph,maruhom,2).ids);
assert(family.positions.get(anginta).y>family.positions.get(maruhom).y,'Anginta must appear below Maruhom');
assert.equal(family.positions.get(anginta).y,family.positions.get(amai).y,'Spouses must appear together');
assert(graph.edges.some(e=>e.from===maruhom&&e.to===anginta&&e.relationship==='parent-child'));
assert(graph.edges.some(e=>[e.from,e.to].includes(anginta)&&[e.from,e.to].includes(amai)&&e.relationship==='spouse'));
console.log(`Verified all ${full.positions.size} cards and ${full.routes.length} connections, all ${graph.labels.length} focused views, 5 deep views, no box collisions or unrelated visible line overlaps, and Maruhom → Anginta — Amai Pondag placement.`);

const spacious=verify(null,"spacious");
assert(full.bounds.width<spacious.bounds.width,"Compressed layout must be narrower");
assert(full.bounds.height<spacious.bounds.height,"Compressed layout must be shorter");
assert.equal(full.routes.length,spacious.routes.length);
for(const label of graph.labels)verify(descendants(graph,label.id,2).ids,"spacious");
console.log(`Compressed bounds ${full.bounds.width}×${full.bounds.height}; spacious ${spacious.bounds.width}×${spacious.bounds.height}. Both spacings preserve all connections.`);

const {familyNeighborhood,pruneChartBranches}=vm.runInNewContext(readFileSync('descendants.js','utf8')+';({familyNeighborhood,pruneChartBranches});');
for(const label of graph.labels){verify(familyNeighborhood(graph,label.id,1));verify(pruneChartBranches(graph,new Set(graph.labels.map(l=>l.id)),new Set([label.id])));}
const near=familyNeighborhood(graph,'chart-personal-samurong');
for(const id of ['chart-personal-samurong-mother','chart-personal-ginaronai','chart-personal-kalanda'])assert(near.has(id));
assert(familyNeighborhood(graph,'chart-personal-samurong',2).size>near.size);
const folded=pruneChartBranches(graph,new Set(graph.labels.map(l=>l.id)),new Set(['chart-personal-samurong']));
assert(folded.has('chart-personal-samurong'));assert(!folded.has('chart-personal-kalanda'));
console.log('Verified family neighborhoods, progressive expansion, and collapsed branch layouts.');
