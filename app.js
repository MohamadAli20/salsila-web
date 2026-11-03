'use strict';
const $=id=>document.getElementById(id);
let chart=null,chartMode=true,chartRoot=null;
let data,region='binidayan',view='tree',selected='',profileTab='overview',focusRoot=null;
let zoom=1,pan={x:0,y:0},positions=new Map(),bounds={width:1,height:1},collapsed=new Set();
let comparedPair=null;
const canvas=$('canvas'),tree=$('tree'),NS='http://www.w3.org/2000/svg';
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const person=id=>data.people.find(p=>p.id===id)||chartPerson(id);
function chartPerson(id){
 const label=chart?.labels.find(p=>p.id===id);if(!label)return;
 const personal=label.recordSource==='family-account';
 return {id:label.id,name:label.name,region:'binidayan',title:label.profileTitle||(label.publicFigure?'Public figure · biography available':personal?'Family account · supplied by you':'Sayawa · Pondag · Ampaso · chart transcription'),source:personal?'family-account':'sayawa-chart',aliases:label.aliases||[],biography:label.biography,publicFigure:label.publicFigure,badge:label.badge,note:(label.transcriptionNote?label.transcriptionNote+' ':'')+(label.aliases?.length?'Earlier or alternate names: '+label.aliases.join(', ')+'. ':'')+(personal?'This family account has not been independently verified. Unknown identities and ancestry routes remain unresolved.':'Reviewed against the updated text transcription. Unspecified red links connect source boxes; arrows do not by themselves establish biological parentage. Grouped labels are retained as written.')};
}

const regionData=()=>data.regions.find(r=>r.id===region);
const branches=id=>data.unions.filter(u=>u.partners[0]===id);
const childIds=id=>branches(id).flatMap(u=>u.children);
function toast(message){$('toast').textContent=message;$('toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').style.display='none',4000);}
function validate(d){
 if(!d||d.version!==1||!Array.isArray(d.people)||!Array.isArray(d.unions)||!Array.isArray(d.regions)||!Array.isArray(d.sources))throw Error('Please use a Salsilah v1 data export.');
 if(d.people.length>2000||d.unions.length>2000||!d.people.length||!d.regions.length)throw Error('Use 1–2,000 people and at most 2,000 partnerships.');
 const ids=new Set(),regions=new Set(),sources=new Set(),unionIds=new Set();
 for(const r of d.regions){if(typeof r.id!=='string'||regions.has(r.id)||typeof r.name!=='string')throw Error('Invalid or duplicate region.');regions.add(r.id);}
 for(const s of d.sources){if(typeof s.id!=='string'||sources.has(s.id)||typeof s.title!=='string'||typeof s.url!=='string')throw Error('Invalid source.');const url=new URL(s.url);if(!['https:','http:'].includes(url.protocol))throw Error('Source URLs must use HTTP or HTTPS.');sources.add(s.id);}
 for(const p of d.people){if(typeof p.id!=='string'||!p.id||ids.has(p.id)||typeof p.name!=='string'||!p.name.trim()||!regions.has(p.region)||!sources.has(p.source))throw Error('Invalid person, region, or source.');ids.add(p.id);}
 const children=new Map(),parentUnion=new Set();
 for(const u of d.unions){if(typeof u.id!=='string'||unionIds.has(u.id)||!Array.isArray(u.partners)||u.partners.length!==2||new Set(u.partners).size!==2||u.partners.some(id=>!ids.has(id))||!Array.isArray(u.children)||new Set(u.children).size!==u.children.length||u.children.some(id=>!ids.has(id))||!sources.has(u.source))throw Error('Invalid partnership or missing person.');unionIds.add(u.id);for(const id of u.children){if(parentUnion.has(id))throw Error('A person cannot have two conflicting parent partnerships.');parentUnion.add(id);}for(const id of u.partners)children.set(id,[...(children.get(id)||[]),...u.children]);}
 const visiting=new Set(),done=new Set();function visit(id){if(visiting.has(id))throw Error('Circular ancestry found.');if(done.has(id))return;visiting.add(id);for(const child of children.get(id)||[])visit(child);visiting.delete(id);done.add(id);}for(const id of ids)visit(id);
 for(const r of d.regions)if(!ids.has(r.root)||d.people.find(p=>p.id===r.root).region!==r.id)throw Error('Each region needs a valid founding person.');
 // The viewer follows a primary partner per union. Reject ambiguous repeated placement.
 for(const r of d.regions){const seen=new Set();function walk(id){if(seen.has(id))throw Error('This viewer cannot yet display a person twice in the same branch.');seen.add(id);for(const u of d.unions.filter(u=>u.partners[0]===id))for(const child of u.children)walk(child);}walk(r.root);}
 return d;
}
function structuredId(id){
 if(data.people.some(p=>p.id===id))return id;const l=chart?.labels.find(l=>l.id===id);if(!l)return null;if(l.personId&&data.people.some(p=>p.id===l.personId))return l.personId;
 const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');const matches=data.people.filter(p=>normalize(p.name)===normalize(l.name));return matches.length===1?matches[0].id:null;
}
function describeRelationship(a,b,type){
 if(a.startsWith('chart-')||b.startsWith('chart-')){
 const reported=(chart.reportedRelationships||[]).find(r=>r.type==='reported-second-cousins'&&((r.from===a&&r.targetId===b)||(r.from===b&&r.targetId===a)));
 if(reported)return {label:'Reported second cousins · family account',detail:reported.note};
 const confirmed=chart.edges.find(e=>e.relationship==='parent-child'&&((e.from===a&&e.to===b)||(e.from===b&&e.to===a)));
 if(confirmed)return {label:'Parent / child',detail:confirmed.relationshipSource};
 const link=chart.edges.find(e=>((e.from===a&&e.to===b)||(e.from===b&&e.to===a))&&e.type==='connection');
 if(type==='connection'||link)return {label:'Connected boxes',detail:'Connecting line recorded in the source transcription. No gender or specific relationship label is assigned.'};
 return {label:type==='lineage'?'Directed chart branch':'Relationship not established',detail:'The transcription records drawing connections. Biological parentage and cousin degree are not established by these lines.'};
 }
 const first=structuredId(a),second=structuredId(b);if(type==='partnership')return {label:'Connected people',detail:'Connection recorded in the source · draft transcription.'};
 if(first&&second){const relation=findKinship(data,first,second);if(relation.label!=='Relationship not established')return relation;}
 return {label:type==='lineage'?'Lineage connection':'Relationship not established',detail:type==='lineage'?'Source-chart link. Immediate parentage or cousin degree is not established for this line.':'More structured parent records are needed to calculate this relationship.'};
}
function showEdgeTooltip(info,event){const tip=$('edge-tooltip');tip.replaceChildren(el('strong','',info.label),el('span','',info.names||''),el('small','',info.detail));tip.hidden=false;const rect=event.currentTarget.getBoundingClientRect();const x=event.clientX||rect.left+rect.width/2,y=event.clientY||rect.top;tip.style.left=Math.min(Math.max(12,x+12),window.innerWidth-300)+'px';tip.style.top=Math.max(12,Math.min(y+16,window.innerHeight-tip.offsetHeight-12))+'px';}
function interactiveLine(svg,path,a,b,type='lineage',custom=null){
 if(!a||!b)return;svg.removeAttribute('aria-hidden');const info={...(custom||describeRelationship(a,b,type)),names:custom?.names||person(a).name+(type==='lineage'?' → ':' ─ ')+person(b).name};const hit=document.createElementNS(NS,'path');hit.setAttribute('d',path.getAttribute('d'));hit.classList.add('relationship-hit');hit.setAttribute('tabindex','0');hit.setAttribute('role','button');hit.setAttribute('aria-label',info.names+': '+info.label);hit.setAttribute('aria-describedby','edge-tooltip');
 const title=document.createElementNS(NS,'title');title.textContent=info.label+' — '+info.names;hit.append(title);for(const event of ['pointerenter','pointermove','focus','click'])hit.addEventListener(event,e=>{showEdgeTooltip(info,e);path.classList.add('hovered-edge');});for(const event of ['pointerleave','blur'])hit.addEventListener(event,()=>{$('edge-tooltip').hidden=true;path.classList.remove('hovered-edge');});hit.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showEdgeTooltip(info,e);}if(e.key==='Escape')$('edge-tooltip').hidden=true;});svg.append(hit);
}
function syncCompareOptions(){
 const records=chartMode&&region==='binidayan'?chart.labels:data.people.filter(p=>p.region===region);for(const id of ['compare-a','compare-b']){const picker=$(id),value=picker.value;picker.replaceChildren(new Option('Choose a person…',''));for(const p of [...records].sort((a,b)=>a.name.localeCompare(b.name)))picker.add(new Option(p.name,p.id));if([...picker.options].some(o=>o.value===value))picker.value=value;}
}
function drawComparison(){tree.querySelectorAll('.comparison-layer').forEach(n=>n.remove());tree.querySelectorAll('.compare-endpoint').forEach(n=>n.classList.remove('compare-endpoint'));if(!comparedPair)return;if(chartMode){for(const card of tree.querySelectorAll('.native-node'))if([comparedPair.a,comparedPair.b].includes(card.dataset.chartId))card.classList.add('compare-endpoint');return;}const {a,b,info}=comparedPair,pa=positions.get(a),pb=positions.get(b);if(!pa||!pb)return;const svg=document.createElementNS(NS,'svg');svg.classList.add('comparison-layer');svg.setAttribute('width',bounds.width);svg.setAttribute('height',bounds.height);const ax=pa.x+(pa.width||174)/2,ay=pa.y+(pa.height||86)/2,bx=pb.x+(pb.width||174)/2,by=pb.y+(pb.height||86)/2;const path=document.createElementNS(NS,'path');path.setAttribute('d',`M ${ax} ${ay} Q ${(ax+bx)/2} ${Math.min(ay,by)-90} ${bx} ${by}`);path.classList.add('comparison-line');svg.append(path);interactiveLine(svg,path,a,b,'comparison',info);tree.append(svg);}
function compareRelatives(){const a=$('compare-a').value,b=$('compare-b').value;if(!a||!b){toast('Choose two people to compare.');return;}const info=describeRelationship(a,b,'comparison');$('compare-result').replaceChildren(el('strong','',info.label),el('span','',person(a).name+' ↔ '+person(b).name),el('small','',info.detail));comparedPair={a,b,info};if(!positions.has(a)||!positions.has(b)){$('compare-result').append(el('small','','Open the full tree or more generations to see both people on the diagram.'));}drawComparison();if(positions.has(a)&&positions.has(b)){const pa=positions.get(a),pb=positions.get(b),left=Math.min(pa.x,pb.x)-35,top=Math.min(pa.y,pb.y)-110,right=Math.max(pa.x+(pa.width||174),pb.x+(pb.width||174))+35,bottom=Math.max(pa.y+(pa.height||86),pb.y+(pb.height||86))+35;zoom=Math.min(1.1,(canvas.clientWidth-35)/(right-left),(canvas.clientHeight-80)/(bottom-top));pan={x:(canvas.clientWidth-(right-left)*zoom)/2-left*zoom,y:(canvas.clientHeight-(bottom-top)*zoom)/2-top*zoom};transform();}}
function transform(){tree.style.transform=`translate(${pan.x}px,${pan.y}px) scale(${zoom})`;$('zoom-label').textContent=Math.round(zoom*100)+'%';}
function fit(){const actionHeight=$('canvas-selection').hidden?0:$('canvas-selection').offsetHeight,usableHeight=Math.max(80,canvas.clientHeight-64-actionHeight-28);zoom=Math.max(.02,Math.min(1,(canvas.clientWidth-45)/bounds.width,usableHeight/bounds.height));pan={x:(canvas.clientWidth-bounds.width*zoom)/2,y:64+Math.max(0,(usableHeight-bounds.height*zoom)/2)};transform();}
function setZoom(next,anchor={x:canvas.clientWidth/2,y:canvas.clientHeight/2}){next=Math.max(.02,Math.min(2.5,next));pan={x:anchor.x-(anchor.x-pan.x)*next/zoom,y:anchor.y-(anchor.y-pan.y)*next/zoom};zoom=next;transform();}
function line(svg,d,color='#a7b59a'){const path=document.createElementNS(NS,'path');path.setAttribute('d',d);path.setAttribute('fill','none');path.setAttribute('stroke',color);path.setAttribute('stroke-width','1.2');svg.append(path);return path;}
function syncBranchControls(){
 const r=regionData(),root=focusRoot||r.root;
 $('lineage-title').textContent=r.lineage||r.name+' lineage';
 const picker=$('branch');picker.replaceChildren();
 function add(id,depth){const p=person(id);if(childIds(id).length||id===r.root)picker.add(new Option((depth?'↳ ':'')+p.name+(id===r.root?' · starting branch':''),id));for(const child of childIds(id))add(child,depth+1);}add(r.root,0);picker.value=root;
 const chart=data.sources.find(s=>s.id===r.chartSource);$('chart-link').textContent='Original chart ↗';$('chart-link').hidden=!chart;if(chart)$('chart-link').href=chart.url;document.querySelector('.tree-context>span').textContent='Selected records · pending review';
 const path=[],seen=new Set();let current=root;while(current&&!seen.has(current)){seen.add(current);path.unshift(current);const u=data.unions.find(u=>u.children.includes(current));current=u?.partners[0];}
 const crumbs=$('breadcrumb');crumbs.replaceChildren();for(const [i,id]of path.entries()){if(i)crumbs.append(el('span','crumb-separator','/'));const b=el('button',id===root?'current':'',person(id).name);b.onclick=()=>openBranch(id);crumbs.append(b);}
}
function openBranch(id){chartMode=false;focusRoot=id===regionData().root?null:id;selected=id;collapsed.clear();$('search').value='';$('depth').value='2';profileTab='overview';renderProfile();setView('tree');}
function syncModeControls(){
 syncCompareOptions(); const full=chartMode&&region==='binidayan';$('chart-mode-bar').hidden=region!=='binidayan';$('full-chart-mode').classList.toggle('active',full);$('branch-mode').classList.toggle('active',!full);$('full-chart-mode').setAttribute('aria-pressed',String(full));$('branch-mode').setAttribute('aria-pressed',String(!full));
 document.querySelector('.branch-picker').hidden=full;$('root-bar').hidden=!full;document.querySelector('.tree-tools').hidden=view!=='tree'||(full&&!chartRoot);if(full)syncRootPicker();
 for(const option of $('depth').options)option.textContent=option.value==='99'?(full?'All descendants':'All generations'):option.value+(full?' steps':' generations');
 $('depth').setAttribute('aria-label',full?'Number of chart steps':'Number of generations');
 $('tree-legend').textContent=full?'→ Chart branch    ─ Connected names':'— Parent–child    ○○ Connection';
 const count=data.people.filter(p=>p.region===region&&!p.id.startsWith('unknown-')).length;
 $('member-count').textContent=full?chart.labels.length+' entries · '+chart.edges.length+' chart connections':count+' people · Partial structured transcription';
}
function syncRootPicker(){
 const picker=$('root-person');if(picker.options.length!==chart.labels.length+1){picker.replaceChildren(new Option('Entire family tree',''));for(const p of [...chart.labels].sort((a,b)=>a.name.localeCompare(b.name))){const duplicates=chart.labels.filter(l=>l.name===p.name).length>1;picker.add(new Option(p.name+(duplicates?' · '+(p.y<500?'upper branch':'lower branch'):''),p.id));}}picker.value=chartRoot||'';$('reset-root').hidden=!chartRoot;
}
function startFromPerson(id){chartRoot=id||null;chartMode=true;focusRoot=null;collapsed.clear();$('search').value='';$('depth').value='99';if(id)selected=id;profileTab='overview';renderProfile();setView('tree');}
function renderDescendants(autofit=true){renderChartLayout(autofit);}
function junctionDescription(edge){return {label:'Branch from shared junction',names:person(edge.from).name+' ─ '+person(edge.otherOrigin).name+' → '+person(edge.to).name,detail:'Arrow from the connecting line between these boxes. Shared branches follow the text transcription.'};}
function renderFullChart(autofit=true){renderChartLayout(autofit);}
function renderChartLayout(autofit=true){
 const projection=chartRoot?buildDescendantView(chart,chartRoot,Number($('depth').value)):null;
 const layout=layoutChart(chart,withAncestryGapContext(chart,projection?.ids));positions=layout.positions;bounds=layout.bounds;tree.replaceChildren();
 const svg=document.createElementNS(NS,'svg');svg.classList.add('native-connections');svg.setAttribute('width',bounds.width);svg.setAttribute('height',bounds.height);
 const defs=document.createElementNS(NS,'defs'),marker=document.createElementNS(NS,'marker');marker.setAttribute('id','lineage-arrow');marker.setAttribute('viewBox','0 0 8 8');marker.setAttribute('refX','7');marker.setAttribute('refY','4');marker.setAttribute('markerWidth','5');marker.setAttribute('markerHeight','5');marker.setAttribute('orient','auto');const arrow=document.createElementNS(NS,'path');arrow.setAttribute('d','M 0 0 L 8 4 L 0 8 Z');arrow.setAttribute('fill','#7b947b');marker.append(arrow);defs.append(marker);svg.append(defs);
 for(const route of layout.routes){const e=route.edge,path=line(svg,route.d,e.type==='ancestry-gap'?'#a27a27':e.type==='connection'?'#ad5750':'#829b7d');path.setAttribute('stroke-width',e.type==='connection'?'2.5':'1.8');path.dataset.from=e.from;path.dataset.to=e.to;if(e.type==='ancestry-gap'){path.classList.add('pending-ancestry');path.setAttribute('stroke-dasharray','7 5');}if(e.otherOrigin)path.dataset.otherOrigin=e.otherOrigin;if(e.to==='chart-personal-samurong'&&layout.positions.has('chart-126'))path.setAttribute('stroke-dasharray','6 4');
  // Only the final segment carries the arrow, including when crossings split
  // the route into several visible pieces.
  if(e.type==='lineage'){const last=route.points.at(-1),before=route.points.at(-2);const tip=line(svg,`M ${before.x} ${Math.max(before.y,last.y-10)} L ${last.x} ${last.y}`,'#829b7d');tip.setAttribute('marker-end','url(#lineage-arrow)');tip.dataset.from=e.from;tip.dataset.to=e.to;}
  svg.append(path);interactiveLine(svg,path,e.from,e.to,e.type,e.type==='ancestry-gap'?{label:'Missing ancestry · pending',detail:e.note}:e.otherOrigin?junctionDescription(e):null);
 }
 tree.append(svg);
 for(const label of chart.labels){const pos=positions.get(label.id);if(!pos)continue;const isContext=projection&&!projection.levels.has(label.id),b=el('button','chart-hit native-node'+(label.id===selected?' selected':'')+(isContext?' context-partner':'')+(label.publicFigure?' public-figure':'')+(label.unknownName||label.ancestryGap?' unknown-person':''));b.dataset.chartId=label.id;b.title=label.name;b.setAttribute('aria-label','Family tree entry: '+label.name);b.style.left=pos.x+'px';b.style.top=pos.y+'px';b.style.width=pos.width+'px';b.style.height=pos.height+'px';
  const copy=el('span','native-copy');copy.append(el('strong','',label.name));copy.append(el('small','',label.publicFigure?(label.badge||'PUBLIC FIGURE')+' · INFO ⓘ':label.layoutBadge?label.layoutBadge.toUpperCase():label.ancestryGap?'GENERATIONS UNKNOWN':label.unknownName?'NAME NOT YET KNOWN':label.recordSource==='family-account'?'FAMILY ACCOUNT':isContext?'CONNECTED BOX':label.id===chartRoot?'STARTING PERSON':'SALSILAH · RANAO'));b.append(el('span','native-initial',label.name.split(/\s+/).slice(0,2).map(n=>n[0]).join('')),copy);b.onclick=()=>{selected=label.id;profileTab='overview';renderProfile();highlightNative(label.id);if(label.publicFigure)showPersonInfo(chartPerson(label.id));};tree.append(b);
 }
 const rootName=chartRoot?person(chartRoot).name:null;
 $('lineage-title').textContent=rootName?rootName+' · Family branches':'Sayawa · Pondag · Ampaso · Full tree';$('breadcrumb').replaceChildren(el('span','',rootName?'Starting from '+rootName:'Sayawa · Pondag · Ampaso · Bayang connections'));document.querySelector('.tree-context>span').textContent='Arranged by family connections · gaps mark separate crossing routes';$('return-tree').hidden=true;$('canvas-subtitle').textContent=rootName?'BRANCHES FROM '+rootName.toUpperCase():'SAYAWA · PONDAG · AMPASO · FAMILY TREE';$('chart-link').hidden=false;$('chart-link').href='docs/updated-transcription.txt';$('chart-link').textContent='Read text transcription ↗';
 renderGenerationNote();renderAncestryNote();syncQuickStart();if(autofit)fit();applyChartSearch(false);drawComparison();highlightNative(selected);
}
function highlightNative(id){syncQuickStart();const connected=new Set([id]);for(const e of chart.edges||[])if(e.from===id||e.to===id||e.otherOrigin===id){connected.add(e.from);connected.add(e.to);if(e.otherOrigin)connected.add(e.otherOrigin);}for(const hit of tree.querySelectorAll('.native-node')){hit.classList.toggle('selected',hit.dataset.chartId===id);hit.classList.toggle('related-node',connected.has(hit.dataset.chartId)&&hit.dataset.chartId!==id);}for(const path of tree.querySelectorAll('.native-connections>path')){const active=path.dataset.from===id||path.dataset.to===id||path.dataset.otherOrigin===id;path.classList.toggle('active-edge',active);}}

function applyChartSearch(center=true){const q=$('search').value.toLowerCase().trim();const matches=chart.labels.filter(l=>positions.has(l.id)&&[l.name,...(l.aliases||[])].some(name=>name.toLowerCase().includes(q)));for(const hit of tree.querySelectorAll('.chart-hit'))hit.classList.toggle('match',!!q&&matches.some(l=>l.id===hit.dataset.chartId));$('tree-empty').hidden=!q||matches.length>0;if(q&&matches.length&&center){const p=positions.get(matches[0].id);zoom=Math.max(zoom,.8);pan={x:canvas.clientWidth/2-(p.x+p.width/2)*zoom,y:canvas.clientHeight/2-(p.y+p.height/2)*zoom};transform();}$('member-count').textContent=q?matches.length+' matching chart entries':chartRoot?positions.size+' entries · '+$('depth').selectedOptions[0].text:chart.labels.length+' entries · '+chart.edges.length+' chart connections';}
function setChartMode(full){comparedPair=null;$('compare-result').replaceChildren();chartRoot=null;chartMode=full;focusRoot=null;$('search').value='';selected=full&&chart?chart.labels.find(l=>l.name==='Sayawa').id:regionData().root;renderProfile();setView('tree');}
function renderTree(autofit=true){
 $('edge-tooltip').hidden=true;
 syncModeControls();if(chartMode&&region==='binidayan'&&chart){renderFullChart(autofit);return;}
 $('generation-note').hidden=true;$('ancestry-note').hidden=true;syncBranchControls();tree.replaceChildren();positions=new Map();const widths=new Map(),groups=new Map(),limit=Number($('depth').value),root=focusRoot||regionData().root;
 function measure(id,depth){const gs=depth+1>=limit||collapsed.has(id)?[]:branches(id);groups.set(id,gs);let w=0;for(const u of gs){let uw=0;for(const child of u.children)uw+=measure(child,depth+1);w+=Math.max(180,uw);}w=Math.max(180,w);widths.set(id,w);return w;}
 bounds={width:measure(root,0),height:86};
 function place(id,left,depth){const pos={x:left+widths.get(id)/2-81,y:depth*185,depth,left};positions.set(id,pos);bounds.height=Math.max(bounds.height,pos.y+86);let x=left;for(const u of groups.get(id)){for(const child of u.children){place(child,x,depth+1);x+=widths.get(child);}}}place(root,0,0);
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('width',bounds.width);svg.setAttribute('height',bounds.height);svg.setAttribute('aria-hidden','true');
 const labels=[];
 for(const [id,pos]of positions){let gx=pos.left;for(const u of groups.get(id)){const size=Math.max(180,u.children.reduce((n,c)=>n+widths.get(c),0)),middle=gx+size/2;line(svg,`M ${pos.x+81} ${pos.y+86} V ${pos.y+101} H ${middle} V ${pos.y+118}`);for(const c of u.children){const cp=positions.get(c);const path=line(svg,`M ${middle} ${pos.y+145} V ${pos.y+161} H ${cp.x+81} V ${cp.y}`);interactiveLine(svg,path,id,c);}labels.push({u,x:middle-76,y:pos.y+118});gx+=size;}}
 tree.append(svg);
 for(const {u,x,y}of labels){const partner=person(u.partners[1]),button=el('button','partner-label','○○  '+partner.name);button.style.left=x+'px';button.style.top=y+'px';button.title='View partner: '+partner.name;button.onclick=()=>selectPerson(partner.id);tree.append(button);}
 for(const [id,pos]of positions){const p=person(id),button=el('button','person'+(id===selected?' selected':''));button.dataset.id=id;button.style.left=pos.x+'px';button.style.top=pos.y+'px';button.setAttribute('aria-pressed',String(id===selected));const initial=el('span','initial',p.name.split(/\s+/).slice(0,2).map(x=>x[0]).join(''));const copy=el('span','copy');copy.append(el('strong','',p.name),el('small','',p.title||regionData().name));button.append(initial,copy);button.onclick=()=>selectPerson(id);tree.append(button);
 if(childIds(id).length&&(groups.get(id).length||collapsed.has(id))){const toggle=el('button','collapse',collapsed.has(id)?'+':'−');toggle.style.left=pos.x+71+'px';toggle.style.top=pos.y+77+'px';toggle.title=(collapsed.has(id)?'Expand':'Collapse')+' descendants of '+p.name;toggle.setAttribute('aria-label',toggle.title);toggle.onclick=()=>{collapsed.has(id)?collapsed.delete(id):collapsed.add(id);renderTree();};tree.append(toggle);}}
 $('canvas-subtitle').textContent=regionData().name.toUpperCase()+' · RANAO';$('return-tree').hidden=!focusRoot;if(autofit)fit();applySearch(false);drawComparison();syncQuickStart();
}
function renderAncestryNote(){
 const panel=$('ancestry-note');panel.replaceChildren();panel.hidden=!(chart.ancestryGaps||[]).some(e=>positions.has(e.from)&&positions.has(e.to));if(panel.hidden)return;
 panel.append(el('strong','','Missing ancestry · to be completed'),el('span','','Dashed gold lines connect Digadong to Kalanda Ginaronia through an unknown ancestry span. The placeholder is not a single known ancestor; names and the number of intervening generations remain unknown.'),el('span','','Family account: Bayango Gandamazir and Kalanda Ginaronia are reported second cousins. Their common ancestor has not yet been identified.'));
}
function renderGenerationNote(){
 const panel=$('generation-note');panel.replaceChildren();const constraint=(chart.layoutConstraints||[]).find(c=>c.members.every(id=>positions.has(id)));panel.hidden=!constraint;if(!constraint)return;
 const report=generationGapReport(chart,constraint);panel.append(el('strong','','Reported first cousins · same display level'));
 for(const entry of report.paths)panel.append(el('span','',entry.path.map(id=>person(id).name).join(' → ')+' · '+entry.steps+' recorded steps'));
 panel.append(el('span','',report.difference===null?'Missing generation count is not established.':report.difference+'-step discrepancy in the recorded paths. This may reflect a missing generation, an indirect chart link, or an account that needs clarification; the exact number of missing generations is not established.'));
 const focus=el('button','button','View cousin level 🔍');focus.onclick=()=>{
  const [a,b]=constraint.members.map(id=>positions.get(id)),left=Math.min(a.x,b.x)-25,right=Math.max(a.x+a.width,b.x+b.width)+25,top=Math.min(a.y,b.y)-30;
  const height=canvas.clientHeight-$('canvas-selection').offsetHeight;
  zoom=Math.min(1.2,(canvas.clientWidth-30)/(right-left));pan={x:(canvas.clientWidth-(right-left)*zoom)/2-left*zoom,y:Math.max(65,height/2-60)-top*zoom};transform();
 };panel.append(focus);
}
$('canvas-magnify').onclick=()=>{
 const p=positions.get(selected);if(!p)return;const height=canvas.clientHeight-$('canvas-selection').offsetHeight;
 zoom=Math.max(zoom,1.1);pan={x:canvas.clientWidth/2-(p.x+(p.width||162)/2)*zoom,y:Math.max(70,height/2)-(p.y+(p.height||86)/2)*zoom};transform();
};
function syncQuickStart(){
 const p=person(selected),available=!!p&&positions.has(selected)&&view==='tree';
 $('canvas-selection').hidden=!available;if(!available)return;
 $('canvas-selection-name').textContent=p.name;
 const current=chartMode?chartRoot===selected:(focusRoot||regionData().root)===selected;
 const complete=current&&(!chartMode||$('depth').value==='99');
 $('canvas-start').disabled=complete||(!chartMode&&!childIds(selected).length);
 $('canvas-start').textContent=complete?'Starting here':current?'Show all ↓':'Start here ↓';
 const count=chartMode?descendantRecords(chart,selected).length:0;
 $('canvas-descendants').hidden=!chartMode;
 $('canvas-descendants').disabled=!count;
 $('canvas-descendants').textContent='Descendants ('+count+')';
 $('canvas-start').setAttribute('aria-label','Start family tree from '+p.name);
}
function showDescendants(id){
 const p=person(id),records=descendantRecords(chart,id),dialog=$('person-info');dialog.replaceChildren();
 const header=el('div','person-info-header'),title=el('h2','','Descendants of '+p.name);title.id='person-info-title';const close=el('button','button','Close ×');close.onclick=()=>dialog.close();header.append(title,close);dialog.append(header,el('p','note-caption',records.length+' entries across all recorded chart steps. These source paths do not by themselves prove biological generations.'));
 const filter=el('input','descendant-filter');filter.type='search';filter.placeholder='Search descendants…';filter.setAttribute('aria-label','Search descendants');dialog.append(filter);const list=el('div','descendant-list');dialog.append(list);
 function render(){const q=filter.value.toLowerCase().trim(),matches=records.filter(r=>(r.name+' '+r.aliases.join(' ')).toLowerCase().includes(q));list.replaceChildren();for(const entry of matches){const b=el('button','relative');b.append(el('strong','',entry.name),el('small','','Chart steps from '+p.name+': '+entry.steps));b.onclick=()=>{dialog.close();startFromPerson(id);selectPerson(entry.id);};list.append(b);}if(!matches.length)list.append(el('p','','No matching descendants.'));}
 filter.oninput=render;render();dialog.showModal();
}
$('canvas-descendants').onclick=()=>showDescendants(selected);
$('canvas-start').onclick=()=>{if(chartMode)startFromPerson(selected);else openBranch(selected);};
function selectPerson(id){if(chartMode&&chartRoot&&id.startsWith('chart-')&&!positions.has(id)){chartRoot=null;renderTree();}selected=id;profileTab='overview';for(const b of tree.querySelectorAll('.person')){b.classList.toggle('selected',b.dataset.id===id);b.setAttribute('aria-pressed',String(b.dataset.id===id));}if(chartMode&&id.startsWith('chart-')){highlightNative(id);const pos=positions.get(id);if(pos){zoom=Math.max(zoom,.65);pan={x:canvas.clientWidth/2-(pos.x+pos.width/2)*zoom,y:canvas.clientHeight/2-(pos.y+pos.height/2)*zoom};transform();}}renderProfile();if(person(id)?.publicFigure)showPersonInfo(person(id));}
function sourceCard(source,mini=false){const card=el('article',mini?'source-mini':'source-card');if(!mini)card.append(el('div','eyebrow',(source.type==='chart'?'ORIGINAL CHART':source.type==='research'?'RESEARCH REFERENCE':'GENEALOGY SOURCE')+' · '+(source.region||source.id).toUpperCase()));const title=el(mini?'div':'h3','',source.title);card.append(title,el('p','',source.author||''),el('p','',source.description||''));const a=el('a','','Open original source ↗');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';card.append(a);return card;}
function biographyLink(source){
 let url;try{url=new URL(source.url);if(!['http:','https:'].includes(url.protocol))return null;}catch{return null;}
 const a=el('a','biography-link',source.title);a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';return a;
}
function biographySection(p){
 const bio=p.biography,section=el('section','profile-section biography');section.append(el('h3','',bio.heading||'About this person'),el('p','',bio.summary||''));
 if(bio.facts?.length){const list=el('ul');for(const fact of bio.facts){const li=el('li','',fact.text);if(fact.sourceUrl){const link=biographyLink({title:'Source ↗',url:fact.sourceUrl});if(link)li.append(' ',link);}list.append(li);}section.append(list);}
 if(bio.identityNote)section.append(el('p','identity-note',bio.identityNote));
 const sources=el('div','biography-sources');for(const source of bio.sources||[]){const link=biographyLink(source);if(link)sources.append(link);}section.append(sources);return section;
}
function showPersonInfo(p){
 if(!p?.biography)return;
 const dialog=$('person-info');dialog.replaceChildren();const header=el('div','person-info-header'),title=el('h2','',p.name);title.id='person-info-title';const close=el('button','button','Close ×');close.type='button';close.onclick=()=>dialog.close();header.append(title,close);dialog.append(header,el('div','eyebrow',p.badge||'PUBLIC FIGURE'),biographySection(p));
 const start=el('button','button primary','Start here ↓');start.onclick=()=>{dialog.close();startFromPerson(p.id);};dialog.append(start);if(!dialog.open)dialog.showModal();
}
function renderProfile(){
 const p=person(selected);if(!p)return;syncQuickStart();const panel=$('profile');panel.replaceChildren();const heading=el('div','profile-top');heading.append(el('span','profile-initial',p.name[0]));const title=el('div');title.append(el('h2','',p.name),el('p','',p.title||data.regions.find(r=>r.id===p.region).name));heading.append(title);panel.append(heading);
 const tabs=el('div','profile-tabs');for(const tab of ['overview','sources']){const b=el('button',profileTab===tab?'active':'',tab[0].toUpperCase()+tab.slice(1));b.onclick=()=>{profileTab=tab;renderProfile();};tabs.append(b);}panel.append(tabs);
 if(profileTab==='sources'){const source=data.sources.find(s=>s.id===p.source);if(source)panel.append(sourceCard(source,true));else panel.append(el('p','research-card','Source: family account supplied by you on 3 November 2026. These additions are separate from the original chart transcription.'));if(p.biography)panel.append(biographySection(p));panel.append(el('p','note-caption','Biographical sources support the listed facts; they do not independently establish every family connection.'));return;}
 if(p.biography)panel.append(biographySection(p));
 const family=el('section','profile-section');family.append(el('h3','','Family connections'));const place=el('div','fact-row');place.append(el('span','','Region'),el('strong','',data.regions.find(r=>r.id===p.region).name));family.append(place);
 function relatives(label,ids){if(!ids.length)return;family.append(el('div','small-heading',label));for(const id of ids){const member=person(id);const b=el('button','relative',member.name+'  ↗');b.onclick=()=>selectPerson(id);family.append(b);}}
 if(p.id.startsWith('chart-')){const links=(chart.edges||[]).flatMap(e=>e.otherOrigin?[e,{...e,from:e.otherOrigin,otherOrigin:e.from}]:[e]);relatives('Lineage links into this entry',links.filter(e=>e.to===p.id&&e.type==='lineage'&&e.relationship!=='parent-child').map(e=>e.from));relatives('Lineage links from this entry',links.filter(e=>e.from===p.id&&e.type==='lineage'&&e.relationship!=='parent-child').map(e=>e.to));relatives('Parent · confirmed by your clarification',links.filter(e=>e.to===p.id&&e.relationship==='parent-child').map(e=>e.from));relatives('Child · confirmed by your clarification',links.filter(e=>e.from===p.id&&e.relationship==='parent-child').map(e=>e.to));relatives('Connected names',links.filter(e=>(e.from===p.id||e.to===p.id)&&e.type==='connection').map(e=>e.from===p.id?e.to:e.from));}
 const parentUnion=data.unions.find(u=>u.children.includes(p.id));relatives('Recorded parents',parentUnion?parentUnion.partners:[]);const pairs=data.unions.filter(u=>u.partners.includes(p.id));relatives('Connected person',[...new Set(pairs.flatMap(u=>u.partners.filter(id=>id!==p.id)))]);relatives('Recorded children',[...new Set(pairs.flatMap(u=>u.children))]);panel.append(family);
 for(const claim of chart?.reportedRelationships||[])if(claim.from===p.id||claim.targetId===p.id)family.append(el('div','research-card','Family account · unresolved: '+(claim.from===p.id?claim.targetName:person(claim.from).name)+'. '+claim.note));
 if(p.id.startsWith('chart-'))for(const route of chart.unresolvedConnections||[])if(route.from===p.id||route.to===p.id)family.append(el('div','research-card','Unresolved route: '+route.reason));
 for(const gap of chart?.ancestryGaps||[])if(gap.from===p.id||gap.to===p.id)family.append(el('div','research-card','Missing ancestry · pending: '+person(gap.from===p.id?gap.to:gap.from).name+'. '+gap.note));
 const research=el('section','profile-section');research.append(el('h3','','Research notes'),el('div','research-card',p.note||p.status));panel.append(research);
 const notes=el('section','profile-section');notes.append(el('h3','','Your personal note'));const input=el('textarea');input.setAttribute('aria-label','Personal research note for '+p.name);input.placeholder='A memory, a question, a detail to verify…';input.maxLength=3000;try{input.value=localStorage.getItem('salsilah-note-'+p.id)||'';}catch{}input.onchange=()=>{try{localStorage.setItem('salsilah-note-'+p.id,input.value);toast('Personal note saved in this browser.');}catch{toast('Browser storage is unavailable.');}};notes.append(input,el('p','note-caption','Saved on this device only. Not published or included in exports.'));panel.append(notes);
 const isChart=p.id.startsWith('chart-');const focus=el('button','button primary',isChart?'Start from this person ↓':'Explore this branch ↗');focus.disabled=!isChart&&!childIds(p.id).length;focus.onclick=()=>{if(isChart){startFromPerson(p.id);}else{if(p.region!==region)setRegion(p.region);openBranch(p.id);}};panel.append(focus);
}
function renderDirectory(){const list=$('people-list');list.replaceChildren();const q=$('search').value.toLowerCase().trim();const records=chartMode&&region==='binidayan'?chart.labels.map(l=>chartPerson(l.id)):data.people;const people=records.filter(p=>p.region===region&&!p.id.startsWith('unknown-')&&(p.name+' '+(p.title||'')+' '+(p.aliases||[]).join(' ')).toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name));for(const p of people){const row=el('button','directory-person'),name=el('span');name.append(el('strong','',p.name),el('small','',p.title||'Source-linked record'));row.append(name,el('span','',regionData().name+' ↗'));row.onclick=()=>selectPerson(p.id);list.append(row);}if(!people.length)list.append(el('p','no-results','No people match your search.'));}
function renderSources(){const list=$('source-list');list.replaceChildren();const q=$('search').value.toLowerCase().trim();const sources=data.sources.filter(s=>(s.region||s.id)===region&&(s.title+' '+s.author+' '+s.description).toLowerCase().includes(q));for(const s of sources)list.append(sourceCard(s));if(!sources.length)list.append(el('p','no-results','No sources match your search.'));}
function applySearch(center=true){if(view==='tree'&&chartMode&&region==='binidayan'&&chart){applyChartSearch(center);return;}const query=$('search').value.toLowerCase().trim();let match;for(const b of tree.querySelectorAll('.person')){const p=person(b.dataset.id),yes=!!query&&(p.name+' '+(p.title||'')).toLowerCase().includes(query);b.classList.toggle('match',yes);b.classList.toggle('dimmed',!!query&&!yes);if(yes&&!match)match=positions.get(p.id);}$('tree-empty').hidden=!query||!!match;if(match&&center&&view==='tree'){zoom=Math.max(zoom,.75);pan={x:canvas.clientWidth/2-(match.x+81)*zoom,y:canvas.clientHeight/2-(match.y+43)*zoom};transform();}if(view==='people')renderDirectory();if(view==='sources')renderSources();}
function setView(next){view=next;for(const b of document.querySelectorAll('[data-view]')){b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-current',b.dataset.view===view?'page':'false');}for(const name of ['tree','people','sources'])$(name+'-view').hidden=view!==name;$('view-title').textContent={tree:'genealogy',people:'people',sources:'sources'}[view];$('section-kicker').textContent={tree:'THE FAMILY TREE',people:'THE PEOPLE DIRECTORY',sources:'OUR SOURCE LIBRARY'}[view];document.querySelector('.tree-tools').hidden=view!=='tree';if(view==='tree')renderTree();if(view==='people')renderDirectory();if(view==='sources')renderSources();}
function setRegion(id){comparedPair=null;$('compare-result').replaceChildren();chartRoot=null;region=id;chartMode=id==='binidayan';focusRoot=null;collapsed.clear();selected=chartMode&&chart?chart.labels.find(l=>l.name==='Sayawa').id:regionData().root;$('depth').value='2';$('search').value='';$('region-title').textContent=regionData().name;for(const b of document.querySelectorAll('[data-region]')){b.classList.toggle('active',b.dataset.region===id);b.setAttribute('aria-pressed',String(b.dataset.region===id));}const count=data.people.filter(p=>p.region===id&&!p.id.startsWith('unknown-')).length;$('member-count').textContent=count+' people · Selected branches';renderProfile();setView(view);}
for(const b of document.querySelectorAll('[data-region]'))b.onclick=()=>setRegion(b.dataset.region);for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>setView(b.dataset.view);
$('search').oninput=()=>{if(view==='tree'&&chartMode&&region==='binidayan'){applyChartSearch();if(!$('search').value.trim())fit();return;}if(view==='tree'){if($('search').value.trim()){focusRoot=null;collapsed.clear();$('depth').value='99';renderTree(false);applySearch();}else{renderTree();}}else applySearch();};$('compare-go').onclick=compareRelatives;$('root-person').onchange=()=>startFromPerson($('root-person').value);$('reset-root').onclick=()=>startFromPerson(null);$('canvas-expand').onclick=()=>{const expanded=document.body.classList.toggle('workspace-expanded');$('canvas-expand').textContent=expanded?'Restore layout ↙':'Expand canvas ⤢';requestAnimationFrame(()=>fit());};$('full-chart-mode').onclick=()=>setChartMode(true);$('branch-mode').onclick=()=>setChartMode(false);$('read-chart').onclick=()=>{if(chartMode){zoom=1;const first=positions.get(chartRoot||chart.labels[0].id);pan={x:25-first.x,y:75-first.y};transform();}else setZoom(1);};$('depth').onchange=()=>renderTree();$('expand').onclick=()=>{collapsed.clear();$('depth').value='99';renderTree();};$('plus').onclick=()=>setZoom(zoom*1.25);$('minus').onclick=()=>setZoom(zoom/1.25);$('fit').onclick=fit;$('return-tree').onclick=()=>openBranch(regionData().root);$('branch').onchange=()=>openBranch($('branch').value);
// Track touches even on cards so two fingers can zoom anywhere in the tree.
const pointers=new Map();let gesture=null,suppressTreeClick=false;
function resetGesture(){
 const points=[...pointers.values()];
 if(points.length>=2){const [a,b]=points;gesture={distance:Math.hypot(b.x-a.x,b.y-a.y),x:(a.x+b.x)/2,y:(a.y+b.y)/2,zoom,pan:{...pan}};}
 else if(points.length===1){const p=points[0];gesture={x:p.x,y:p.y,pan:{...pan},canDrag:p.canDrag};}
 else gesture=null;
}
canvas.addEventListener('pointerdown',e=>{
 if(e.pointerType==='mouse'&&e.button!==0)return;
 const canDrag=!e.target.closest('button,.relationship-hit');
 if(e.pointerType!=='touch'&&!canDrag)return;
 if(!pointers.size)suppressTreeClick=false;
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,canDrag});
 $('edge-tooltip').hidden=true;
 if(canDrag)canvas.setPointerCapture(e.pointerId);
 if(pointers.size>=2){suppressTreeClick=true;for(const id of pointers.keys())canvas.setPointerCapture(id);}
 resetGesture();
});
canvas.addEventListener('pointermove',e=>{
 const p=pointers.get(e.pointerId);if(!p||!gesture)return;
 p.x=e.clientX;p.y=e.clientY;
 if(pointers.size>=2){
 const [a,b]=[...pointers.values()],r=canvas.getBoundingClientRect();
 const next=Math.max(.02,Math.min(2.5,gesture.zoom*Math.hypot(b.x-a.x,b.y-a.y)/Math.max(1,gesture.distance)));
 pan={x:(a.x+b.x)/2-r.left-(gesture.x-r.left-gesture.pan.x)*next/gesture.zoom,y:(a.y+b.y)/2-r.top-(gesture.y-r.top-gesture.pan.y)*next/gesture.zoom};zoom=next;transform();
 }else if(gesture.canDrag){
 const dx=p.x-gesture.x,dy=p.y-gesture.y;
 if(Math.hypot(dx,dy)>5)suppressTreeClick=true;
 pan={x:gesture.pan.x+dx,y:gesture.pan.y+dy};transform();
 }
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(pointers.delete(e.pointerId))resetGesture();});
canvas.addEventListener('click',e=>{if(suppressTreeClick){e.preventDefault();e.stopImmediatePropagation();suppressTreeClick=false;}},true);
canvas.addEventListener('wheel',e=>{e.preventDefault();const r=canvas.getBoundingClientRect();setZoom(zoom*Math.exp(-e.deltaY*.001),{x:e.clientX-r.left,y:e.clientY-r.top});},{passive:false});canvas.addEventListener('keydown',e=>{const d={ArrowLeft:[30,0],ArrowRight:[-30,0],ArrowUp:[0,30],ArrowDown:[0,-30]}[e.key];if(d){e.preventDefault();pan.x+=d[0];pan.y+=d[1];transform();}if(e.key==='+'||e.key==='=')setZoom(zoom*1.2);if(e.key==='-')setZoom(zoom/1.2);});document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();$('search').focus();}});let lastCanvasWidth=canvas.clientWidth;window.addEventListener('resize',()=>{const width=canvas.clientWidth;if(width!==lastCanvasWidth){lastCanvasWidth=width;if(view==='tree'&&!$('search').value.trim())fit();}});
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({...data,chartGraph:chart},null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download='salsilah-family.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Family data exported. Personal notes stay on this device.');};$('import-button').onclick=()=>$('import-file').click();$('import-file').onchange=async()=>{const file=$('import-file').files[0];if(!file)return;try{if(file.size>2000000)throw Error('Please choose a JSON file smaller than 2 MB.');const incoming=validate(JSON.parse(await file.text()));const incomingChart=incoming.chartGraph?validateChart(incoming.chartGraph,incoming):chart;if(!incoming.regions.some(r=>r.id==='binidayan')||!incoming.regions.some(r=>r.id==='bayang'))throw Error('This edition requires Binidayan and Bayang regions.');if(!confirm('Open this family data for this session? The published source file will stay unchanged.'))return;data=incoming;chart=incomingChart;setRegion(region);toast('Data imported for this session. Export to keep a copy.');$('save-note').textContent='Imported data is active for this session only. Export a copy before refreshing.';}catch(error){toast(error.message);}$('import-file').value='';};
function validateChart(c,d){
 if(!c||c.width!==1650||c.height!==1275||c.image!=='assets/sayawa-chart.png'||!Array.isArray(c.labels)||c.labels.length>2000)throw Error('Invalid source chart index.');
 const ids=new Set();for(const l of c.labels){if(typeof l.id!=='string'||ids.has(l.id)||typeof l.name!=='string'||!l.name.trim()||(l.recordSource!=='family-account'&&(![l.x,l.y,l.width,l.height].every(Number.isFinite)||l.x<0||l.y<0||l.width<=0||l.height<=0||l.x+l.width>c.width||l.y+l.height>c.height)))throw Error('Invalid chart label or position.');if(l.personId&&!d.people.some(p=>p.id===l.personId))throw Error('Chart label references a missing person.');ids.add(l.id);}if(!Array.isArray(c.edges))throw Error('Chart connections are missing.');for(const e of c.edges)if(!ids.has(e.from)||!ids.has(e.to)||(e.otherOrigin&&(!ids.has(e.otherOrigin)||e.otherOrigin===e.to))||e.from===e.to||!['lineage','connection'].includes(e.type))throw Error('Invalid chart connection.');if(c.ancestryGaps!==undefined&&!Array.isArray(c.ancestryGaps))throw Error('Invalid pending ancestry routes.');for(const e of c.ancestryGaps||[])if(!ids.has(e.from)||!ids.has(e.to)||e.from===e.to||e.type!=='ancestry-gap'||e.recordSource!=='family-account')throw Error('Invalid pending ancestry route.');return c;
}
async function init(){try{const response=await fetch('family.json',{cache:'no-cache'});if(!response.ok)throw Error('The family data could not be loaded.');data=validate(await response.json());const chartResponse=await fetch('chart-index.json',{cache:'no-cache'});if(!chartResponse.ok)throw Error('The chart index could not be loaded.');chart=validateChart(await chartResponse.json(),data);setRegion(region);}catch(error){$('tree-empty').hidden=false;$('tree-empty').textContent=error.message;toast(error.message);}}
init();
