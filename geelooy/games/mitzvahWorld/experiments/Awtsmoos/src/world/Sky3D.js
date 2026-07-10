// B"H
import { BufferAttribute, BufferGeometry, Mesh, MeshStandardMaterial, Group } from '../../../light-three-gltf/tiny-runtime.js';
import { normalize, v } from '../math/Geometry3D.js';

const SUN = [-46, 42, -76];

/** Sky3D: the button is gone; the real sun remains, enormous and quiet. */
export function createSky3D() {
  const g = new Group(); g.name = 'Awtsmoos_atmosphere_real_sun_haze_depth';
  g.add(skyDome()); g.add(haze('lower-gold-haze', [0, 5, -92], 250, 52, [.95,.86,.62,.20])); g.add(haze('upper-blue-mist', [0, 22, -105], 220, 74, [.72,.9,1,.10]));
  g.add(sphere('real-spherical-sun', SUN, 4.2, [1,.88,.32,1])); for (const f of flares()) g.add(disc(...f));
  for (let i = 0; i < 12; i++) g.add(haze(`wide-cloud-wisp-${i}`, [-64+i*12, 20+(i%4)*2.1, -66+(i%5)*8], 18+(i%3)*8, 3.8+(i%2)*2, [1,1,.96,.10]));
  return g;
}
function flares(){ return [['sun-atmosphere-fire',SUN,34,[1,.55,.18,.15]],['sun-white-core-bloom',[-45,42,-75],13,[1,.97,.78,.36]],['flare-amber-long',[-31,30,-52],10,[1,.70,.20,.17]],['flare-cyan-soft',[-18,22,-33],6,[.40,.88,1,.11]],['flare-violet-ghost',[0,15,-10],4,[.82,.55,1,.08]],['flare-honey-near',[18,10,15],9,[1,.75,.28,.07]]]; }
function skyDome(radius=145,rings=32,segments=80){ const p=[],n=[],c=[],ind=[]; for(let r=0;r<=rings;r++)for(let s=0;s<=segments;s++){const t=r/rings,a=s/segments*Math.PI*2,phi=t*Math.PI*.56,y=Math.sin(phi)*radius-34,rr=Math.cos(phi)*radius;p.push(Math.cos(a)*rr,y,Math.sin(a)*rr);n.push(0,1,0);c.push(...skyColor(t,a));} for(let r=0;r<rings;r++)for(let s=0;s<segments;s++){const a=r*(segments+1)+s,b=a+1,d=a+segments+1,e=d+1;ind.push(a,d,b,b,d,e);} return mesh('high-gradient-atmosphere-dome',p,n,c,ind,[1,1,1,1]); }
function skyColor(t,a){ const h=1-t,zen=Math.pow(t,.62),sun=Math.max(0,Math.cos(a+2.05))*Math.pow(h,2.4); return [.06+zen*.16+h*.60+sun*.42,.25+zen*.35+h*.46+sun*.28,.55+zen*.40+h*.10+sun*.05,1]; }
function haze(name,center,w,h,color){ const [x,y,z]=center,hw=w/2,hh=h/2; return mesh(name,[x-hw,y-hh,z,x+hw,y-hh,z,x+hw,y+hh,z,x-hw,y+hh,z],[0,0,1,0,0,1,0,0,1,0,0,1],[...color,...color,...color,...color],[0,1,2,0,2,3],[1,1,1,color[3]]); }
function disc(name,center,radius,color){ const c=v(center[0],center[1],center[2]),normal=normalize(v(-center[0],-center[1],-center[2])),right=normalize(v(normal.z,0,-normal.x)),up=normalize(v(normal.y*right.z,normal.z*right.x-normal.x*right.z,-normal.y*right.x)); const p=[c.x,c.y,c.z],n=[normal.x,normal.y,normal.z],colors=[...color],ind=[]; for(let i=0;i<=80;i++){const a=i/80*Math.PI*2;p.push(c.x+(right.x*Math.cos(a)+up.x*Math.sin(a))*radius,c.y+(right.y*Math.cos(a)+up.y*Math.sin(a))*radius,c.z+(right.z*Math.cos(a)+up.z*Math.sin(a))*radius);n.push(normal.x,normal.y,normal.z);colors.push(...color);if(i>0)ind.push(0,i,i+1);} return mesh(name,p,n,colors,ind,[1,1,1,color[3]??1]); }
function sphere(name,center,radius,color){ const p=[],n=[],c=[],ind=[]; for(let y=0;y<=18;y++)for(let x=0;x<=36;x++){const u=x/36*Math.PI*2,vv=y/18*Math.PI,sx=Math.sin(vv)*Math.cos(u),sy=Math.cos(vv),sz=Math.sin(vv)*Math.sin(u);p.push(center[0]+sx*radius,center[1]+sy*radius,center[2]+sz*radius);n.push(sx,sy,sz);c.push(...color);} for(let y=0;y<18;y++)for(let x=0;x<36;x++){const a=y*37+x,b=a+1,d=a+37,e=d+1;ind.push(a,d,b,b,d,e);} return mesh(name,p,n,c,ind,color); }
function mesh(name,positions,normals,colors,indices,color){ const g=new BufferGeometry(); g.setAttribute('position',new BufferAttribute(new Float32Array(positions),3)); g.setAttribute('normal',new BufferAttribute(new Float32Array(normals),3)); g.setAttribute('color',new BufferAttribute(new Float32Array(colors),4)); g.setIndex(new BufferAttribute(new Uint16Array(indices),1)); const m=new Mesh(g,new MeshStandardMaterial({name,color})); m.name=name; m.material.transparent=(color[3]??1)<1; m.material.opacity=color[3]??1; m.material.alphaMode=m.material.transparent?'BLEND':'OPAQUE'; m.setBaseTransform(); return m; }
