// B"H
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { CartoonProductionModel } from '../../src/studio/CartoonProductionModel.js';

const W = 640, H = 360, FPS = 12, SECONDS = 60, FRAMES = FPS * SECONDS;
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = join(homedir(), 'Movies', 'AwtsmoosAnimatorExports', stamp);
const framesDir = join(outDir, 'frames');
const outFile = join(outDir, 'awtsmoos-animator-one-minute-eye-tags.mp4');
mkdirSync(framesDir, { recursive: true });
const plan = CartoonProductionModel.create('A one minute proof render: eye tag text boxes, fur notes, NLE beats, and cartoon motion.');
writeFileSync(join(outDir, 'production-bible.json'), JSON.stringify(plan, null, 2));

const FONT = {
 A:'01110100011000111111100011000110001',B:'111101000111110100011000111110',C:'011111000010000100001000001111',D:'111101000110001100011000111110',E:'111111000011110100001000011111',F:'111111000011110100001000010000',G:'011111000010000101111000101111',H:'100011000111111100011000110001',I:'111110010000100001000010011111',J:'001110001000010000101001001100',K:'100011001011100100101000110001',L:'100001000010000100001000011111',M:'100011101110101100011000110001',N:'100011100110101100111000110001',O:'011101000110001100011000101110',P:'111101000111110100001000010000',Q:'011101000110001101011001001101',R:'111101000111110100101000110001',S:'011111000001110000010000111110',T:'111110010000100001000010000100',U:'100011000110001100011000101110',V:'100011000110001010100101000100',W:'100011000110101101011010110001',X:'100010101000100010100100110001',Y:'100010101000100001000010000100',Z:'111110001000100010001000011111',
 '0':'011101000110011101011100101110','1':'001000110000100001000010011111','2':'011101000100001000100010011111','3':'111100000100110000010000111110','4':'100011000111111000010000100001','5':'111111000011110000010000111110','6':'011111000011110100011000101110','7':'111110000100010001000100001000','8':'011101000101110100011000101110','9':'011101000110001011110000111110',' ':'000000000000000000000000000000','-':'000000000011111000000000000000','+':'000000010011111001000000000000',':':'000000010000000001000000000000','.':'000000000000000000000010000100','/':'000010001000100010001000100000'};
const rgb = (r,g,b)=>[r,g,b];
function put(buf,x,y,c){ if(x<0||y<0||x>=W||y>=H) return; const i=(y*W+x)*3; buf[i]=c[0]; buf[i+1]=c[1]; buf[i+2]=c[2]; }
function box(buf,x,y,w,h,c){ for(let yy=y; yy<y+h; yy++) for(let xx=x; xx<x+w; xx++) put(buf,xx,yy,c); }
function glyph(buf,ch,x,y,s,c){ const bits=FONT[ch]||FONT[' ']; for(let r=0;r<7;r++) for(let col=0;col<5;col++) if(bits[r*5+col]==='1') box(buf,x+col*s,y+r*s,s,s,c); }
function text(buf,str,x,y,s,c){ [...str.toUpperCase()].forEach((ch,i)=>glyph(buf,ch,x+i*s*6,y,s,c)); }
function frame(n){
 const t=n/FPS, b=Buffer.alloc(W*H*3); box(b,0,0,W,H,rgb(7,17,31));
 box(b,20,20,600,48,rgb(20,41,79)); text(b,'B-H AWTSMOOS ANIMATOR EXPORT',34,32,3,rgb(255,255,255));
 text(b,'1 MIN MOVIE EYE TAG TEXT BOXES',34,54,2,rgb(158,210,255));
 const pulse=Math.floor(20*Math.sin(t*2)); box(b,40+pulse,105,120,70,rgb(45,70,110)); box(b,182-pulse,98,142,82,rgb(30,110,95)); box(b,360+pulse,104,168,78,rgb(120,88,35));
 box(b,65,122,24,24,rgb(255,255,255)); box(b,102,122,24,24,rgb(255,255,255)); box(b,74+Math.floor(5*Math.sin(t*5)),130,10,10,rgb(0,0,0)); box(b,111+Math.floor(5*Math.sin(t*5)),130,10,10,rgb(0,0,0));
 text(b,'EYE TAG 01',55,153,2,rgb(255,255,255)); text(b,'FUR PASS CLOTH JITTER',192,130,2,rgb(255,255,255)); text(b,'200 NLE BEATS',382,132,2,rgb(255,255,255));
 const label=t<12?'ACT I SETUP':t<24?'ACT II ESCALATION':t<36?'ACT III CALLBACKS':t<48?'FUR DETAIL PASS':'TAG BUTTON JOKE';
 text(b,label,45,220,4,rgb(124,255,196)); text(b,`TIME ${Math.floor(t).toString().padStart(2,'0')} / 60`,45,272,3,rgb(255,209,102));
 text(b,'PLUGGED AFTER PIANO VIDEO EXPORTER PATH READ',34,326,2,rgb(255,255,255));
 return Buffer.concat([Buffer.from(`P6\n${W} ${H}\n255\n`), b]);
}
for(let i=0;i<FRAMES;i++) writeFileSync(join(framesDir, `frame_${String(i).padStart(4,'0')}.ppm`), frame(i));
const args=['-y','-framerate',String(FPS),'-i',join(framesDir,'frame_%04d.ppm'),'-f','lavfi','-i','sine=frequency=220:sample_rate=48000:d=60','-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-shortest',outFile];
const result=spawnSync('ffmpeg',args,{encoding:'utf8'});
if(result.status!==0){ console.error(result.stderr||result.stdout); process.exit(result.status||1); }
writeFileSync(join(outDir,'export-path.txt'),`${outFile}\n`);
rmSync(framesDir,{recursive:true,force:true});
console.log(JSON.stringify({ok:true,outDir,outFile,durationSeconds:60},null,2));
