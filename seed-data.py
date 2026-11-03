import json
from pathlib import Path
sources=[{'id':'binidayan','title':'Gogodan sa Binidayan','author':'Datu Acmad (Ontay) M. Abdulmadid','url':'https://acmaly88.page.tl/GOGODAN-SA-BINIDAYAN.htm','description':'Published genealogy account, crediting oral accounts and earlier salsila. Transcribed relationships await independent family review.'},{'id':'bayang','title':'Salsila sa Bayang','author':'Datu Acmad (Ontay) Macagaan Abdulamdid; account attributed to Sangcopan','url':'https://acmaly88.page.tl/SALSILA-SA-BAYANG.htm','description':'Published Diwan genealogy with separate marriages and child lists. Source spellings are preserved; relationships await family review.'}]
people=[];unions=[]
def person(id,name,region,title=''):
 people.append({'id':id,'name':name,'region':region,'title':title,'source':region,'status':'Source account · pending family review'})
def union(id,a,b,kids,region):unions.append({'id':id,'partners':[a,b],'children':kids,'source':region})
r='binidayan'
for id,name,title in [('ginarapandi','Ginarapandi',''),('apipa','Apipa',''),('mangotara','Mangotara',''),('pakalangot','Pakalangot',''),('paramanis','Paramanis','Sa Wato'),('dampologan','Dampologan',''),('dangcogan','Dangcogan','Sultan of Wato'),('dimaporo','Dimaporo','Sultan of Binidayan'),('batawi','Shaiek Batawi','Datumulok sa Tugaya'),('camid','Botawan H. Camid','Usngan sa Masiu'),('mariga','Mariga','Inai H. Socor'),('unknown-p','Unrecorded partner(s)','Pakalangot’s four marriages'),('dimaluna','Dimaluna','Sultan sa Binidayan'),('abobacar','H. Abobacar',''),('babayolan','Babayolan',''),('pakalaan','Lokes I Pakalaan',''),('tago','Tago','Panondiongan sa Ranao'),('tarintikan','Tarintikan',''),('rinandang','Rinandang',''),('makatoon','Makatoon','Amai Rangiris'),('makarimpas','Makarimpas','Amai Rohas'),('sapiro','Sapiro','Inabae Pimbayong'),('posaka','Posaka','Inai Putumos'),('batokapalan','Batokapalan','Amai Kowarta'),('matag','Amai Matag','')]:person(id,name,r,title)
union('ginarapandi-apipa','ginarapandi','apipa',['mangotara','pakalangot','paramanis'],r)
union('mangotara-dampologan','mangotara','dampologan',['dangcogan','dimaporo','batawi','camid','mariga'],r)
union('pakalangot-unknown','pakalangot','unknown-p',['dimaluna','abobacar','babayolan','pakalaan','tago','tarintikan'],r)
union('paramanis-rinandang','paramanis','rinandang',['makatoon','makarimpas','sapiro','posaka','batokapalan','matag'],r)
r='bayang'
for id,name,title in [('diwan','Diwan','Bayang'),('labo','Labo','Sa Malaig'),('impah','Paramata Impah',''),('kalodan','Datu sa Kalodan',''),('sidic','Maruhom Sidic',''),('amdag','Amdag',''),('nanak','Nanak',''),('umba','Bae Umba',''),('maulana','Maruhom Sarip Maulana',''),('ameroden','Maruhom Sarip Ameroden',''),('pre','Pre Bai a Labi','Sa Bayang'),('wata','Bae a Wata','Sa Bayang'),('ninig','Ninig','Sa Maguindanao'),('marigay','Bae sa Marigay',''),('maupaat','Maupaat Sarip','Sa Bayang'),('polo','Bae sa Polo',''),('kalawi','Datu sa Kalawi',''),('radapan','Bae sa Radapan',''),('dipatuan','Dipatuan','')]:person(id,name,r,title)
union('diwan-labo','diwan','labo',['kalodan','sidic'],r)
union('diwan-impah','diwan','impah',['amdag','nanak'],r)
union('amdag-umba','amdag','umba',['maulana','ameroden','pre','wata'],r)
union('nanak-ninig','nanak','ninig',['marigay','maupaat'],r)
union('nanak-polo','nanak','polo',['kalawi','radapan','dipatuan'],r)
notes={'pakalangot':'The source groups these children across four marriages without identifying each mother. This display is a grouped account, not a claim that they share one mother. Additional children are mentioned but unnamed.','unknown-p':'Placeholder representing unnamed partners. Not an identified historical person.','ginarapandi':'Spelling in the Binidayan source. Not established as the same name or person as “Ginaronai”.','dimaporo':'Listed as Sultan of Binidayan, a child of Mangotara and Dampologan. Identity and links to later generations require review.','diwan':'The account separates children by marriage. This draft includes two recorded partnerships; it does not claim the branch is complete.'}
for p in people:p['note']=notes.get(p['id'],'A partial transcription of the cited genealogy. Missing relatives do not imply that no other relatives existed.')
value={'version':1,'regions':[{'id':'binidayan','name':'Binidayan','root':'ginarapandi','intro':'The descendants of Ginarapandi · Selected branches'},{'id':'bayang','name':'Bayang','root':'diwan','intro':'The descendants of Diwan · Selected branches'}],'people':people,'unions':unions,'sources':sources}
for r in value['regions']:
 r['lineage']='Sayawa lineage' if r['id']=='binidayan' else 'Diwan lineage'
 if r['id']=='binidayan':r['chartSource']='sayawa-chart'
value['sources'].append({'id':'sayawa-chart','region':'binidayan','type':'chart','title':'Sayawa lineage · Original chart','author':'Hosted by Ontay & Marogong.Net','url':'https://img.webme.com/pic/a/acmaly88/sayawachart-page-001.jpg','description':'A genealogical reference tracing the Sayawa lineage and its family connections in Binidayan and Bayang, Ranao.'})
Path('family.json').write_text(json.dumps(value,indent=2,ensure_ascii=False)+'\n')
