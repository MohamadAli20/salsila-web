import xml.etree.ElementTree as E,re
r=E.parse('calanda-bayango.svg').getroot();ns={'s':r.tag.split('}')[0][1:]};boxes=[]
for g in r.findall('.//s:g',ns):
 q=g.find('s:rect',ns);i=g.get('data-id',g.get('data-chart-id'))
 if q is None or not i:continue
 tr=list(map(float,re.findall(r'-?\d+(?:\.\d+)?',g.get('transform',''))));dx,dy=tr if len(tr)==2 else(0,0);x,y,w,h=[float(q.get(k,0)) for k in('x','y','width','height')];boxes.append((i,x+dx,y+dy,x+dx+w,y+dy+h))
def segments(d):
 tok=re.findall(r'[MLHVmlhv]|-?\d+(?:\.\d+)?',d);pos=(0,0);j=0;cmd=None
 while j<len(tok):
  if tok[j].isalpha():cmd=tok[j];j+=1
  if cmd in ('M','L'):pt=(float(tok[j]),float(tok[j+1]));j+=2
  elif cmd=='H':pt=(float(tok[j]),pos[1]);j+=1
  elif cmd=='V':pt=(pos[0],float(tok[j]));j+=1
  else:raise ValueError(cmd)
  if cmd!='M':yield pos,pt
  pos=pt
  if cmd=='M':cmd='L'
collisions=[]
for p in r.findall('.//s:path',ns):
 d=p.get('data-route',p.get('d',''))
 if p.get('data-jump-decoration'):continue
 for (x,y),(u,v) in segments(d):
  for i,a,b,c,e in boxes:
   hit=(abs(x-u)<.01 and a+.5<x<c-.5 and max(min(y,v),b+.5)<min(max(y,v),e-.5))or(abs(y-v)<.01 and b+.5<y<e-.5 and max(min(x,u),a+.5)<min(max(x,u),c-.5))
   if hit:collisions.append((i,d))

assert not collisions, f"Connectors cross person boxes: {collisions}"

paths={p.get('data-route',p.get('d')) for p in r.findall('.//s:path',ns)}
for expected in ['M4600,3845 L5560,3845','M5740,3340 V3750','M5740,3670 L6020,3670 M6020,3670 L6020,4270 M6020,4270 L5740,4270 M5740,4270 L5740,4350','M4820,3495 H5350 V3260 H5525']:
 assert any(list(segments(expected))==list(segments(actual)) for actual in paths), f'Missing moved-family connector: {expected}'
people={g.get('data-id'):g for g in r.findall('.//s:g',ns) if g.get('data-id')}
assert 'ebra' in people and 'ebra-alicasan' in people
assert not any('Dobleng linya' in (t.text or '') for t in r.findall('.//s:text',ns))
rows={i:y for i,x,y,u,v in boxes}
assert rows['ebra-alicasan']==rows['mohamad-ali']
assert rows['samurong']==rows['chart-personal-usman-mother']
for index,(i,x,y,u,v) in enumerate(boxes):
 for other,a,b,c,d in boxes[index+1:]:
  assert not(max(x,a)<min(u,c) and max(y,b)<min(v,d)),f'Overlapping people: {i}, {other}'
print(f'Calanda diagram: {len(boxes)} person boxes; no box overlap or connector through boxes; moved-family connections and Ebra row verified.')

assert not r.findall(".//s:path[@data-relationship='kararatan-parent-of-ebra']",ns), 'Extra parent detour must remain removed'

second_ids={'hadji-said','salsila-imam','ameroden-tuan','ameroden-paki','salsila-sabundar','salsila-saharalbanon','salsila-other-children','ameroden-makapondag','ameroden-bagur','ameroden-babaida','ameroden-tabonawan-father','chart-personal-tabunawan','chart-personal-usman-mother','chart-personal-usman-ali','chart-personal-mamadra'}
sibling_ids={'salsila-saharalbanon', 'ameroden-paki', 'ameroden-tuan', 'salsila-imam', 'salsila-sabundar', 'salsila-other-children'}
assert len({y for i,x,y,u,v in boxes if i in sibling_ids})==1,'Children of Sayyidna must share one horizontal row'
assert len({x for i,x,y,u,v in boxes if i in second_ids-sibling_ids-{'chart-personal-mamadra','chart-personal-tabunawan'}-{'ameroden-babaida', 'ameroden-makapondag', 'ameroden-bagur', 'ameroden-tabonawan-father'}})==1,'Other second-column names keep their vertical alignment'

box_map={i:(x,y,u,v) for i,x,y,u,v in boxes}
def center(i):
 x,y,u,v=box_map[i];return (x+u)/2
assert center('ameroden-tabonawan-father')==center('ameroden-paki')
assert center('ameroden-makapondag')==center('ameroden-tuan')
assert box_map['ameroden-makapondag'][1]==box_map['ameroden-bagur'][1]
assert box_map['ameroden-babaida'][1]>box_map['ameroden-bagur'][3]

assert rows['chart-personal-mamadra']==rows['chart-personal-usman-ali'], 'Mamadra and Usman must share one row'

assert rows["sultan-tampasok"]==rows["maruhom-sapaatullah"], "Amana’s children share one row"

assert box_map["sultan-tampasok"][0]<1190, "Tampasok remains in first column"

for person in ["sultan-tampasok","alongan","maruhom-pongkaiman","ginarapandi","mangotara","sultan-dimaporo","mohammad-ali-dimaporo"]:
 assert center(person)==610, "First-column boxes must be centered"

assert rows["chart-personal-tabunawan"]==rows["chart-personal-usman-mother"], "Tabunawan and partner must share a row"

# A moved label must remain inside its own person card.
for person in r.findall('.//s:g',ns):
 card=person.find('s:rect',ns)
 if card is None or not(person.get('data-id')or person.get('data-chart-id')):continue
 x,y,w,h=[float(card.get(k))for k in ('x','y','width','height')]
 for label in person.findall('s:text',ns):
  if label.text:
   assert x<=float(label.get('x'))<=x+w and y<=float(label.get('y'))<=y+h, f"Label outside person box: {label.text}"

assert rows["ama-ni-bayango"]==rows["mampay"]==rows["ambua"], "Gandamasir and Mampay align with Bae Ambua"
assert rows["kararatan"]==rows["ina-ni-ebra"], "Kararatan aligns with Tantowaraga"

for person in r.findall('.//s:g',ns):
 if not(person.get('data-id')or person.get('data-chart-id')):continue
 if person.find('s:rect',ns) is None:continue
 badges=person.findall("s:g[@data-source-badge]",ns)
 assert badges, f"Missing source marker: {person.attrib}"
 assert all(b.get('data-source-key')in {'S','K','A','D'}for b in badges)
 assert person.get('data-chart-id'), 'Every card must support opening details'

for person in r.findall(".//s:g[@data-id]",ns):
 if person.get("data-id") in {'aminah', 'mohamad-ali', 'abdul-aziz', 'sittie-aisah', 'khomeni', 'abdul-rahman', 'saadodin', 'calanda', 'alicasan', 'saifudin', 'norodin', 'bayango', 'nor-ain'}:
  assert [b.get("data-source-key") for b in person.findall("s:g[@data-source-badge]",ns)]==["D"], "Descendant records use documentary attribution"
