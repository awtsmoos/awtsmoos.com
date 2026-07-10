// B"H
import { BufferAttribute, BufferGeometry, Mesh, MeshStandardMaterial, Group } from '../../../light-three-gltf/tiny-runtime.js';
import { normalize, v } from '../math/Geometry3D.js';

const SUN = [-46, 42, -76];

/** Sky3D: a clear bright sphere-sun with controlled bloom, not a vague cotton blob. */
export function createSky3D() {
  const g = new Group(); g.name = 'Awtsmoos_atmosphere_clear_bright_sun_depth';
  g.add(skyDome()); g.add(haze('lower-gold-haze', [0, 5, -92], 250, 52, [.95,.86,.62,.16])); g.add(haze('upper-blue-mist', [0, 22, -105], 220, 74, [.72,.9,1,.08]));
  g.add(disc('sun-crisp-white-gold-facing-disc', SUN, 4.7, [1, .96, .40, .95])); g.add(sphere('real-clear-golden-sun-sphere', SUN, 4.45, [1,.89,.20,1]));
  g.add(disc('sun-tight-bright-corona', SUN, 8.6, [1,.82,.22,.24])); g.add(disc('sun-wide-soft-lens-ring', SUN, 22, [1,.68,.18,.08]));
  for (let i = 0; i < 10; i++) g.add(haze(`thin-real-cloud-wisp-${i}`, [-64+i*14, 20+(i%4)*2.1, -66+(i%5)*8], 18+(i%3)*8, 3.8+(i%2)*2, [1,1,.96,.07]));
  return g;
}
function skyDome(radius=145,rings=32,segments=80){ const p=[],n=[],c=[],ind=[]; for(let r=0;r<=rings;r++)for(let s=0;s<=segments;s++){const t=r/rings,a=s/segments*Math.PI*2,phi=t*Math.PI*.56,y=Math.sin(phi)*radius-34,rr=Math.cos(phi)*radius;p.push(Math.cos(a)*rr,y,Math.sin(a)*rr);n.push(0,1,0);c.push(...skyColor(t,a));} for(let r=0;r<rings;r++)for(let s=0;s<segments;s++){const a=r*(segments+1)+s,b=a+1,d=a+segments+1,e=d+1;ind.push(a,d,b,b,d,e);} return mesh('high-gradient-atmosphere-dome',p,n,c,ind,[1,1,1,1]); }
function skyColor(t,a){ const h=1-t,zen=Math.pow(t,.62),sun=Math.max(0,Math.cos(a+2.05))*Math.pow(h,2.4); return [.08+zen*.18+h*.66+sun*.46,.30+zen*.38+h*.50+sun*.30,.60+zen*.38+h*.12+sun*.06,1]; }
function haze(name,center,w,h,color){ const [x,y,z]=center,hw=w/2,hh=h/2; return mesh(name,[x-hw,y-hh,z,x+hw,y-hh,z,x+hw,y+hh,z,x-hw,y+hh,z],[0,0,1,0,0,1,0,0,1,0,0,1],[...color,...color,...color,...color],[0,1,2,0,2,3],[1,1,1,color[3]]); }
function disc(name,center,radius,color){ const c=v(center[0],center[1],center[2]),normal=normalize(v(-center[0],-center[1],-center[2])),right=normalize(v(normal.z,0,-normal.x)),up=normalize(v(normal.y*right.z,normal.z*right.x-normal.x*right.z,-normal.y*right.x)); const p=[c.x,c.y,c.z],n=[normal.x,normal.y,normal.z],colors=[...color],ind=[]; for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;p.push(c.x+(right.x*Math.cos(a)+up.x*Math.sin(a))*radius,c.y+(right.y*Math.cos(a)+up.y*Math.sin(a))*radius,c.z+(right.z*Math.cos(a)+up.z*Math.sin(a))*radius);n.push(normal.x,normal.y,normal.z);colors.push(...color);if(i>0)ind.push(0,i,i+1);} return mesh(name,p,n,colors,ind,[1,1,1,color[3]??1]); }
function sphere(name,center,radius,color){ const p=[],n=[],c=[],ind=[]; for(let y=0;y<=24;y++)for(let x=0;x<=48;x++){const u=x/48*Math.PI*2,vv=y/24*Math.PI,sx=Math.sin(vv)*Math.cos(u),sy=Math.cos(vv),sz=Math.sin(vv)*Math.sin(u);p.push(center[0]+sx*radius,center[1]+sy*radius,center[2]+sz*radius);n.push(sx,sy,sz);c.push(...color);} for(let y=0;y<24;y++)for(let x=0;x<48;x++){const a=y*49+x,b=a+1,d=a+49,e=d+1;ind.push(a,d,b,b,d,e);} return mesh(name,p,n,c,ind,color); }
function mesh(name,positions,normals,colors,indices,color){ const g=new BufferGeometry(); g.setAttribute('position',new BufferAttribute(new Float32Array(positions),3)); g.setAttribute('normal',new BufferAttribute(new Float32Array(normals),3)); g.setAttribute('color',new BufferAttribute(new Float32Array(colors),4)); g.setIndex(new BufferAttribute(new Uint16Array(indices),1)); const m=new Mesh(g,new MeshStandardMaterial({name,color})); m.name=name; m.material.transparent=(color[3]??1)<1; m.material.opacity=color[3]??1; m.material.alphaMode=m.material.transparent?'BLEND':'OPAQUE'; m.setBaseTransform(); return m; }
