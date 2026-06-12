# B"H
import os,json,math,struct,zlib
OUT='assets/textures/realisticVillage'; S=128; os.makedirs(OUT,exist_ok=True)
def c(v): return max(0,min(255,int(v)))
def sm(t): return t*t*(3-2*t)
def rnd(x,y,s):
 v=math.sin(x*127.1+y*311.7+s*91.3)*43758.5453; return v-math.floor(v)
def noi(x,y,s):
 ix=int(math.floor(x));iy=int(math.floor(y));fx=sm(x-ix);fy=sm(y-iy)
 a=rnd(ix,iy,s)*(1-fx)+rnd(ix+1,iy,s)*fx; b=rnd(ix,iy+1,s)*(1-fx)+rnd(ix+1,iy+1,s)*fx
 return a*(1-fy)+b*fy
def fbm(x,y,s): return noi(x,y,s)*.55+noi(x*2,y*2,s+7)*.3+noi(x*4,y*4,s+19)*.15
def png(path,pix):
 raw=bytearray()
 for row in pix:
  raw.append(0)
  for p in row: raw.extend([c(p[0]),c(p[1]),c(p[2]),255])
 def ch(t,d): return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
 open(path,'wb').write(b'\x89PNG\r\n\x1a\n'+ch(b'IHDR',struct.pack('>IIBBBBB',S,S,8,6,0,0,0))+ch(b'IDAT',zlib.compress(bytes(raw),5))+ch(b'IEND',b''))
def make(name,base,kind,seed):
 pix=[]; h=[]
 for y in range(S):
  row=[]; hr=[]
  for x in range(S):
   n=fbm(x/16,y/16,seed); f=fbm(x/5,y/5,seed+99); r,g,b=base
   if kind=='wood': val=math.sin(y*.15+fbm(x/12,y/20,seed)*5)*36+(-35 if min(x%48,48-x%48)<3 else 0); col=(r+val+n*18,g+val*.65+n*14,b+val*.35+n*9)
   elif kind=='roof': col=(r+n*38+math.sin(x*.19)*22+(-32 if y%28<4 else 0),g+n*24,b+n*16)
   elif kind=='stone': col=(r+n*55+(-45 if f>.8 else 0),g+n*55+(-45 if f>.8 else 0),b+n*55+(-45 if f>.8 else 0))
   elif kind=='cobble': mortar=.55 if min(x%36,36-x%36,y%30,30-y%30)<3 else 0; col=(r+n*42+mortar*48,g+n*42+mortar*48,b+n*42+mortar*48)
   elif kind=='rug': col=(r+n*45+(35 if (x//16)%2==0 else -10),g+n*24,b+n*38)
   elif kind=='cloth': weave=(math.sin(x*.9)+math.sin(y*.9))*12; col=(r+n*28+weave,g+n*24+weave,b+n*18+weave)
   elif kind=='grass': col=(r+n*65+(28 if f>.83 else 0),g+n*85,b+n*38)
   else: col=(r+n*60+(-35 if f>.8 else 0),g+n*45+(-30 if f>.8 else 0),b+n*25)
   row.append(col); hr.append(n)
  pix.append(row); h.append(hr)
 png(os.path.join(OUT,name+'_albedo.png'),pix)
 return h
def normal(name,h):
 pix=[]
 for y in range(S):
  row=[]
  for x in range(S):
   dx=(h[y][(x-1)%S]-h[y][(x+1)%S])*6; dy=(h[(y-1)%S][x]-h[(y+1)%S][x])*6; dz=1; l=(dx*dx+dy*dy+dz*dz)**.5
   row.append(((dx/l*.5+.5)*255,(dy/l*.5+.5)*255,(dz/l*.5+.5)*255))
  pix.append(row)
 png(os.path.join(OUT,name+'_normal.png'),pix)
spec={'grass_meadow':((72,128,54),'grass'),'dry_grass':((143,132,66),'dirt'),'dirt_path':((104,73,45),'dirt'),'mud_dark':((72,55,38),'dirt'),'gravel_pebble':((112,112,104),'stone'),'cobble_stone':((117,116,105),'cobble'),'plaster_limestone':((194,181,143),'stone'),'weathered_wood':((114,74,38),'wood'),'dark_beam_wood':((72,42,22),'wood'),'clay_roof_tiles':((151,74,42),'roof'),'woven_rug':((128,42,36),'rug'),'burlap_sack':((142,112,72),'cloth'),'straw_thatch':((174,151,78),'dirt')}
man={'BH':'B"H','size':S,'textures':{}}
for i,(k,(base,kind)) in enumerate(spec.items()):
 h=make(k,base,kind,i*11+3); normal(k,h); man['textures'][k]={'albedo':k+'_albedo.png','normal':k+'_normal.png','kind':kind}
open(os.path.join(OUT,'manifest.json'),'w').write(json.dumps(man,indent=2))
print('OK', len(spec), 'textures')
