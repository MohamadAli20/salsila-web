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
for expected in ['M4780,3595 H5740','M5920,3340 V3500','M5920,3420 H6200 V4020 H5920 V4100','M5000,3245 H5705']:
 assert expected in paths, f'Missing moved-family connector: {expected}'
people={g.get('data-id'):g for g in r.findall('.//s:g',ns) if g.get('data-id')}
assert 'ebra' in people and 'ebra-alicasan' in people
assert not any('Dobleng linya' in (t.text or '') for t in r.findall('.//s:text',ns))
rows={i:y for i,x,y,u,v in boxes}
assert rows['ebra-alicasan']==rows['mohamad-ali']
for index,(i,x,y,u,v) in enumerate(boxes):
 for other,a,b,c,d in boxes[index+1:]:
  assert not(max(x,a)<min(u,c) and max(y,b)<min(v,d)),f'Overlapping people: {i}, {other}'
print(f'Calanda diagram: {len(boxes)} person boxes; no box overlap or connector through boxes; moved-family connections and Ebra row verified.')

assert not r.findall(".//s:path[@data-relationship='kararatan-parent-of-ebra']",ns), 'Extra parent detour must remain removed'
