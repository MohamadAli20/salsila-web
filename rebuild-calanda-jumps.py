"""Rebuild visual bridges; data-route retains the orthogonal connection for audits."""
from pathlib import Path
import xml.etree.ElementTree as E,re
E.register_namespace('', 'http://www.w3.org/2000/svg')
p=Path('calanda-bayango.svg');r=E.parse(p).getroot();ns={'s':'http://www.w3.org/2000/svg'};tag=lambda t:'{'+ns['s']+'}'+t
for e in r.findall('.//s:path',ns):
 if e.get('data-route'):e.set('d',e.attrib.pop('data-route'))
old=r.find("s:g[@id='connection-jumps']",ns)
if old is not None:r.remove(old)
code=Path('check-calanda.py').read_text();exec(code[code.index('def segments'):code.index('collisions=[]')])
boxes=[]
for g in r.findall('.//s:g',ns):
 q=g.find('s:rect',ns)
 if q is not None and (g.get('data-id') or g.get('data-chart-id')):
  x,y,w,h=[float(q.get(k,0)) for k in ('x','y','width','height')];boxes.append((x,y,x+w,y+h))
paths=r.findall('.//s:path',ns);routes=[list(segments(e.get('d','')))for e in paths];bridges=[]
for i,e in enumerate(paths):
 out=[];changed=False
 for (x,y),(u,v) in routes[i]:
  out.append(f'M{x:g},{y:g}');hits=[]
  if y==v and abs(u-x)>30:
   for j,ss in enumerate(routes):
    if i==j:continue
    for (a,b),(c,d) in ss:
     if a==c and min(x,u)+14<a<max(x,u)-14 and min(b,d)+14<y<max(b,d)-14 and not any(l<a+12 and rr>a-12 and t<y+5 and bb>y-13 for l,t,rr,bb in boxes):hits.append(a)
  last=None;sign=1 if u>x else -1
  for a in sorted(set(hits),reverse=u<x):
   if last is not None and abs(a-last)<24:continue
   arc=f'M{a-sign*9:g},{y:g} Q{a:g},{y-18:g} {a+sign*9:g},{y:g}'
   out.append(f'L{a-sign*9:g},{y:g} Q{a:g},{y-18:g} {a+sign*9:g},{y:g}');bridges.append((arc,e));changed=True;last=a
  out.append(f'L{u:g},{v:g}')
 if changed:e.set('data-route',e.get('d'));e.set('d',' '.join(out))
layer=E.SubElement(r,tag('g'),{'id':'connection-jumps','pointer-events':'none','aria-hidden':'true'})
for arc,e in bridges:
 for color,width in [('#fffefa','9'),(e.get('stroke','#507a63'),'3')]:E.SubElement(layer,tag('path'),{'d':arc,'fill':'none','stroke':color,'stroke-width':width,'stroke-linecap':'round','data-jump-decoration':'true'})
p.write_text(E.tostring(r,encoding='unicode'));print('Curved bridges:',len(bridges))
