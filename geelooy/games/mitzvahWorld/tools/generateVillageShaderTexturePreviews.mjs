// B"H
/**
 * Optional preview generator for RAM shader material laws.
 * Runtime does not use these PNGs; it creates THREE.DataTexture in memory.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const OUT = 'assets/textures/realisticVillageShaderPreviews';
const SIZE = Number(process.argv[2] || 128);
const KINDS = ['grass_meadow','dry_grass','dirt_path','mud_dark','gravel_pebble','cobble_stone','plaster_limestone','weathered_wood','dark_beam_wood','clay_roof_tiles','woven_rug','burlap_sack','straw_thatch','yellow_brick','flower_petal','leaf_vein','lamp_shade','lichen_rock'];
const CHANNELS = ['albedo','normal','roughness','height','ao'];
const clamp01 = v => Math.max(0, Math.min(1, v));
const mix = (a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp01((x-a)/Math.max(.00001,b-a));return t*t*(3-2*t)};
const fract=x=>x-Math.floor(x);
const hash2=(x,y,s=1)=>fract(Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453123);
function noise(x,y,s=1){const ix=Math.floor(x),iy=Math.floor(y),fx=smooth(0,1,x-ix),fy=smooth(0,1,y-iy);return mix(mix(hash2(ix,iy,s),hash2(ix+1,iy,s),fx),mix(hash2(ix,iy+1,s),hash2(ix+1,iy+1,s),fx),fy)}
function fbm(x,y,s=1){let v=0,a=.52,f=1;for(let i=0;i<5;i++){v+=noise(x*f,y*f,s+i*19.7)*a;f*=2.07;a*=.48}return v}
function voronoi(u,v,cells,s){const x=u*cells,y=v*cells,ix=Math.floor(x),iy=Math.floor(y);let best=9,second=9,id=0;for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){const cx=ix+ox+hash2(ix+ox,iy+oy,s),cy=iy+oy+hash2(ix+ox,iy+oy,s+4),d=Math.hypot(x-cx,y-cy);if(d<best){second=best;best=d;id=hash2(ix+ox,iy+oy,s+11)}else if(d<second)second=d}return{edge:second-best,id}}
const rgb=(r,g,b)=>[r,g,b], cmix=(a,b,t)=>[mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[2],b[2],t)], seam=(x,w=.018)=>1-smooth(0,w,Math.min(fract(x),1-fract(x)));
function heightAt(k,u,v,s=3){const n=fbm(u*12,v*12,s); if(k==='cobble_stone')return clamp01(.18+voronoi(u,v,8,s).id*.32+smooth(.03,.13,voronoi(u,v,8,s).edge)*.44); if(k==='gravel_pebble')return clamp01(.22+voronoi(u,v,22,s).id*.32+smooth(.04,.16,voronoi(u,v,22,s).edge)*.28); if(k.includes('wood'))return clamp01(.36+Math.sin(v*42+fbm(u*7,v*19,s)*7)*.17+n*.19-seam(u*6,.035)*.28); if(k==='clay_roof_tiles')return clamp01(.36+n*.25-seam(v*9,.045)*.25+Math.sin(u*Math.PI*16)*.08); return clamp01(.32+n*.42)}
function albedo(k,u,v,s=3){const h=heightAt(k,u,v,s),n=fbm(u*18,v*18,s+2); if(k==='grass_meadow')return cmix(rgb(.2,.45,.15),rgb(.68,.82,.28),h); if(k==='dry_grass'||k==='straw_thatch')return cmix(rgb(.52,.45,.21),rgb(.86,.74,.34),h); if(k==='dirt_path')return cmix(rgb(.28,.18,.11),rgb(.62,.43,.25),h); if(k==='mud_dark')return cmix(rgb(.16,.12,.09),rgb(.42,.31,.20),h); if(k==='gravel_pebble')return cmix(rgb(.34,.34,.32),rgb(.78,.76,.68),h); if(k==='cobble_stone')return cmix(rgb(.35,.34,.31),rgb(.64,.62,.55),h); if(k==='plaster_limestone')return cmix(rgb(.57,.51,.38),rgb(.92,.84,.64),h-n*.1); if(k==='weathered_wood')return cmix(rgb(.28,.16,.08),rgb(.70,.44,.23),h); if(k==='dark_beam_wood')return cmix(rgb(.12,.07,.035),rgb(.42,.25,.12),h); if(k==='clay_roof_tiles')return cmix(rgb(.42,.16,.09),rgb(.86,.39,.18),h); if(k==='woven_rug')return cmix(Math.floor(u*9)%2?rgb(.6,.16,.14):rgb(.1,.22,.44),rgb(.96,.70,.25),n*.35); if(k==='burlap_sack')return cmix(rgb(.42,.31,.19),rgb(.78,.62,.38),h); if(k==='yellow_brick')return cmix(rgb(.62,.42,.10),rgb(.98,.78,.24),h); if(k==='flower_petal')return cmix(rgb(1,.88,.18),rgb(1,.55,.82),fbm(u*8,v*8)); if(k==='leaf_vein')return cmix(rgb(.08,.24,.07),rgb(.45,.82,.25),h); if(k==='lamp_shade')return cmix(rgb(.85,.56,.22),rgb(1,.86,.48),h); if(k==='lichen_rock')return cmix(rgb(.30,.30,.27),rgb(.72,.70,.62),h); return [h,h,h]}
function texel(k,ch,x,y){const u=(x+.5)/SIZE,v=(y+.5)/SIZE;if(ch==='albedo')return albedo(k,u,v);if(ch==='height'){const h=heightAt(k,u,v);return[h,h,h]}if(ch==='roughness'){const r=.75+fbm(u*26,v*26,30)*.2;return[r,r,r]}if(ch==='ao'){const a=.72+heightAt(k,u,v)*.28;return[a,a,a]}const e=1/SIZE,l=heightAt(k,u-e,v),r=heightAt(k,u+e,v),d=heightAt(k,u,v-e),up=heightAt(k,u,v+e);let nx=(l-r)*6,ny=(d-up)*6,nz=1,len=Math.hypot(nx,ny,nz)||1;return[nx/len*.5+.5,ny/len*.5+.5,nz/len*.5+.5]}
function png(name,pixels){const raw=[];for(const row of pixels){raw.push(0);for(const p of row)raw.push(Math.round(clamp01(p[0])*255),Math.round(clamp01(p[1])*255),Math.round(clamp01(p[2])*255),255)}const chunk=(t,d)=>{const len=Buffer.alloc(4);len.writeUInt32BE(d.length);const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(Buffer.concat([Buffer.from(t),d]))>>>0);return Buffer.concat([len,Buffer.from(t),d,crc])};fs.writeFileSync(name,Buffer.concat([Buffer.from('\x89PNG\r\n\x1a\n','binary'),chunk('IHDR',Buffer.from([0,0,0,SIZE,0,0,0,SIZE,8,6,0,0,0])),chunk('IDAT',zlib.deflateSync(Buffer.from(raw))),chunk('IEND',Buffer.alloc(0))]))}
function crc32(buf){let c=~0;for(const b of buf){c^=b;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1}return~c}
fs.mkdirSync(OUT,{recursive:true});
for(const k of KINDS)for(const ch of CHANNELS){const pix=[];for(let y=0;y<SIZE;y++){const row=[];for(let x=0;x<SIZE;x++)row.push(texel(k,ch,x,y));pix.push(row)}png(path.join(OUT,`${k}_${ch}.png`),pix)}
console.log('B"H generated shader preview PNGs',KINDS.length*CHANNELS.length,'runtime still uses RAM DataTexture');
