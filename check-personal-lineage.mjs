import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const graph=JSON.parse(readFileSync('chart-index.json','utf8')),fixture=JSON.parse(readFileSync('docs/personal-lineage.json','utf8'));
const own=graph.labels.filter(l=>l.recordSource==='family-account');
assert.deepEqual(own.map(l=>l.id).sort(),fixture.labels.toSorted());
assert.deepEqual(graph.edges.filter(e=>e.recordSource==='family-account'),fixture.edges);
const build=vm.runInNewContext(readFileSync('descendants.js','utf8')+';buildDescendantView;');
const mid='chart-personal-missing-ancestor',sam='chart-personal-samurong',father='chart-personal-ginaronai',child='chart-personal-kalanda',kalanda='chart-personal-kalanda';
const levels=build(graph,'chart-060',99).levels;
assert.equal(levels.get(mid),1);assert.equal(levels.get(sam),2,'Samurong must be the reported grandchild of Maruhom');assert.equal(levels.get(child),3);
assert.notEqual(mid,father);assert.equal(graph.labels.filter(l=>l.unknownName).length,3);
for(const l of own){if([sam,'chart-personal-samurong-mother','chart-personal-usman-mother'].includes(l.id))assert.equal(l.gender,'female');else if(['chart-personal-ginaronai','chart-personal-tabunawan','chart-personal-mamadra','chart-personal-gandamasir'].includes(l.id))assert.equal(l.gender,'male');else assert(!Object.hasOwn(l,'gender'));assert(!Object.hasOwn(l,'ethnicity'));assert(!Object.hasOwn(l,'x'),'Do not fabricate original image coordinates for personal records');}
assert(!graph.edges.some(e=>e.from==='chart-019'&&e.to===father),'Digadong clan origin must not become direct parentage');
assert(!graph.edges.some(e=>e.from===sam&&['chart-126','chart-132'].includes(e.to)),'Unresolved cousin report must not turn into a graph edge');
assert.equal(graph.reportedRelationships.filter(r=>r.status==='unresolved').length,5);
assert(build(graph,sam,2).levels.has(child));assert(build(graph,father,2).levels.has(child));
assert(build(graph,child,1).ids.has('chart-personal-bayango'),'Connected spouse record must remain available without inferred gender labels');
const ali=graph.labels.find(l=>l.id==='chart-132');assert(ali.publicFigure);assert(ali.aliases.includes('Sult. Ali'));assert(ali.biography.sources.some(s=>s.url.startsWith('https://www.msumain.edu.ph/')));assert(ali.biography.facts.every(f=>f.sourceUrl));
assert.equal(graph.labels.find(l=>l.id==='chart-126').name,'Dimaporo','Do not conflate the earlier Dimaporo with Ali');
const tuan=graph.labels.find(l=>l.id==='chart-039');assert.equal(tuan.name,'Tuan sa Binidayan');assert(tuan.aliases.includes('Tuan'));assert(!tuan.aliases.includes('Tuan Muhammad Said'));assert(tuan.biography.identityNote.includes('separate entries'));
console.log('Verified reported grandchild chain, distinct unknown identities, unresolved cousin and clan claims, no inferred maternal identity or ethnicity, separate Dimaporo identities, and sourced biographies.');

assert.deepEqual(graph.ancestryGaps,fixture.ancestryGaps);
assert(!build(graph,'chart-019',99).levels.has(kalanda),'Pending ancestry must not become established descent');
assert(!graph.edges.some(e=>e.to==='chart-personal-digadong-gap'||e.from==='chart-personal-digadong-gap'));
assert.equal(graph.labels.find(l=>l.id===kalanda).name,'Calanda Ginaronai');

assert(!build(graph,sam,99).levels.has('chart-personal-bayango'));
assert.equal(graph.labels.find(l=>l.id===father).placeOfOrigin,'Poon a Baebao');
assert(graph.ancestryGaps.some(e=>e.to==='chart-personal-bayango'));
assert(!graph.ancestryGaps.some(e=>e.to===kalanda));
assert(graph.edges.some(e=>e.from===sam&&e.to===father&&e.spouseOrder===2));

const maternal=graph.labels.find(l=>l.id===sam).maternalOriginAccount;
assert.equal(maternal.reportedBy,'Family informant');
assert.equal(maternal.motherNameKnown,false);
assert.equal(maternal.maruhomConnectionEstablished,false);

const mother='chart-personal-samurong-mother';
assert(graph.edges.some(e=>e.from===mother&&e.to===sam&&e.relationship==='parent-child'));
assert(!graph.edges.some(e=>e.from==='chart-060'&&e.to===mother));
assert(build(graph,mother,99).levels.has(kalanda));

const usman='chart-personal-usman-ali',tabunawan='chart-personal-tabunawan',usmanMother='chart-personal-usman-mother',mamadra='chart-personal-mamadra';
assert(graph.edges.some(e=>e.from===tabunawan&&e.to===usman&&e.relationship==='parent-child'));
assert(graph.edges.some(e=>e.from===usmanMother&&e.to===usman&&e.relationship==='parent-child'));
assert(graph.edges.some(e=>e.from===father&&e.to===mamadra&&e.relationship==='half-brother'));
assert(graph.edges.some(e=>e.from===mamadra&&e.to===usman&&e.relationship==='sibling'));
assert(!graph.edges.some(e=>e.to===mamadra&&e.type==='lineage'),'Do not invent Mamadra’s parents');
assert(!build(graph,'chart-038',99).levels.has(usman),'Pending descent is not a verified parent-child chain');
assert(!build(graph,sam,99).levels.has(usman),'Cousin and sibling context cannot create descent');
assert.notEqual(usmanMother,mother);
assert(graph.reportedRelationships.some(r=>r.from===usmanMother&&r.targetId===sam&&r.type==='reported-maternal-cousins'));
const sixth=graph.reportedRelationships.find(r=>r.from===tabunawan&&r.type==='reported-sixth-generation-descendant');
assert.equal(sixth.reportedGeneration,6);assert(sixth.recordAttribution.includes('Kawashima Midori'));assert.equal(sixth.sourceId,'kawashima-usman-sophia');
assert.equal(graph.labels.find(l=>l.id===usman).recordDate,'2026-11-09');
assert(graph.labels.find(l=>l.id===usman).biography.identityNote.includes('Tabunawan'));
console.log('Verified Alicasan attribution, Usman’s recorded parents, distinct maternal identities, reported sibling/cousin connections, and no invented six-generation ancestry.');

assert(graph.ancestryGaps.some(e=>e.from==='chart-personal-said-usman-gap'&&e.to===tabunawan));
assert(!graph.ancestryGaps.some(e=>e.to===usman));
assert.equal(graph.labels.find(l=>l.id===usman).name,'Usman Imam Sheik Al-Aman');

const magonaya='chart-personal-tuan-magonaya',gandamasir='chart-personal-gandamasir';
assert.notEqual(magonaya,'chart-038');assert.notEqual(magonaya,'chart-039');
for(const [a,b] of [['chart-038',magonaya],[magonaya,gandamasir],[gandamasir,'chart-personal-bayango']])assert(graph.edges.some(e=>e.from===a&&e.to===b&&e.relationship==='parent-child'&&!e.sourceId));
assert(!graph.edges.some(e=>e.from==='chart-038'&&e.to===gandamasir),'Keep Tuan sa Magonaya between Hadji Said and Gandamasir');
assert(graph.labels.find(l=>l.id===magonaya).recordAttribution.includes('Family oral account'));

assert(graph.reportedRelationships.some(r=>r.from==='chart-132'&&r.targetId==='chart-personal-kalanda'&&r.type==='reported-second-cousins'));
