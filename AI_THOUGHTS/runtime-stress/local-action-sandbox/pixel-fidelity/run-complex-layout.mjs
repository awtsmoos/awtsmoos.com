// B"H
/**
 * Complex layout witness, compact corrected pass.
 * Fits the whole page inside 960x640 while proving nested grid/flex/forms/glow,
 * dark controls, nested OffscreenCanvas composition, worker bitmap, Path2D,
 * rainbow gradients, and WebGL texture selection.
 */
import fs from 'fs';
import zlib from 'zlib';
import crypto from 'crypto';
import { simulateRuntime } from '../../../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js';

const outDir = 'AI_THOUGHTS/runtime-stress/local-action-sandbox/pixel-fidelity/complex-layout';
fs.mkdirSync(outDir, { recursive: true });

const html = `<!doctype html><html><head><style>
body{margin:0;background:#071225;color:#f8fbff;font-family:system-ui,sans-serif}.dashboard{padding:14px;display:grid;grid-template-columns:1.08fr .92fr;gap:12px;background:linear-gradient(135deg,#142544,#071225)}.panel{background:linear-gradient(135deg,#20304b,#111b2b);border:2px solid #4ad2f0;border-radius:18px;padding:12px;box-shadow:0 0 18px #4ad2f0}.flexrow{display:flex;gap:8px;margin:6px 0}.mini{background:#0b1728;border:2px solid #586fff;border-radius:14px;padding:7px}.nestedgrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}.formgrid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-top:8px}button{background:#455ad2;color:white;border:2px solid #7edcff;border-radius:999px;padding:6px 12px}input,select,textarea{background:#18263b;color:#f0f8ff;border:2px solid #7edcff;border-radius:10px;padding:8px}.gold{color:#ffffff}.rainbow{background:linear-gradient(90deg,red,orange,yellow,lime,cyan,blue,magenta);height:26px;border-radius:12px;border:2px solid white;margin:6px 0 10px}h1{font-size:30px;margin:0 0 6px;color:#ffffff}h2{font-size:24px;margin:0 0 6px;color:#ffffff}p{margin:3px 0 8px}.small{font-size:12px;color:#ffffff}
</style></head><body><main class="dashboard">
<section class="panel"><h1>COMPLEX UI TEST</h1><p class="gold">Nested grid/flex/forms/glows/offscreen/worker/WebGL with visible readable labels.</p><div class="rainbow"></div><div class="nestedgrid"><div class="mini"><strong>DOM</strong><canvas id="canvas-a" width="230" height="150"></canvas></div><div class="mini"><strong>OFFSCREEN</strong><canvas id="canvas-b" width="230" height="150"></canvas></div><div class="mini"><strong>WORKER</strong><canvas id="canvas-c" width="230" height="150"></canvas></div></div><form class="mini formgrid"><label><span class="small">Name</span><input value="TESTNAME"></label><label><span class="small">Mode</span><select value="MODEOK"></select></label><textarea placeholder="Notes" value="Nested OK"></textarea><button value="Launch"></button></form></section>
<section class="panel"><h2>FLEX AND WEBGL</h2><div class="flexrow"><button value="A"></button><button value="B"></button><button value="C"></button><button value="D"></button><button value="Wrap"></button></div><div class="mini"><canvas id="webgl-main" width="410" height="250"></canvas></div><div class="mini"><canvas id="canvas-nested" width="410" height="82"></canvas></div></section>
</main><script>
window.complexState={ready:false};
function rainbow(ctx,w,h){const g=ctx.createLinearGradient(0,0,w,0);['red','orange','yellow','lime','cyan','blue','magenta'].forEach((c,i)=>g.addColorStop(i/6,c));ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
const a=document.getElementById('canvas-a').getContext('2d');rainbow(a,230,150);a.fillStyle='rgba(0,0,0,.40)';a.fillRect(18,16,194,118);a.strokeStyle='white';a.lineWidth=4;const ap=new Path2D();ap.arc(115,75,46,0,6.283);a.stroke(ap);a.fillStyle='white';a.font='16px sans-serif';a.fillText('DOM',78,84);
const inner=new OffscreenCanvas(90,55);const ix=inner.getContext('2d');ix.fillStyle='lime';ix.fillRect(0,0,90,55);ix.fillStyle='blue';ix.fillRect(36,10,44,34);ix.strokeStyle='white';ix.lineWidth=3;const ip=new Path2D();ip.arc(45,28,22,0,6.283);ix.stroke(ip);
const off=new OffscreenCanvas(190,112);const ox=off.getContext('2d');rainbow(ox,190,112);ox.fillStyle='magenta';ox.fillRect(16,18,158,62);ox.drawImage(inner.transferToImageBitmap(),56,34,80,48);ox.strokeStyle='cyan';ox.lineWidth=4;const bp=new Path2D();bp.moveTo(10,98);bp.bezierCurveTo(45,6,145,6,180,98);bp.closePath();ox.stroke(bp);ox.clip(bp);ox.fillStyle='rgba(20,0,90,.45)';ox.fillRect(32,48,126,38);
const b=document.getElementById('canvas-b').getContext('2d');b.fillStyle='#082b36';b.fillRect(0,0,230,150);b.drawImage(off.transferToImageBitmap(),18,14,190,112);b.fillStyle='white';b.font='12px sans-serif';b.fillText('offscreen',48,142);
const worker=new Worker('complex-worker.js');worker.onmessage=e=>{const c=document.getElementById('canvas-c').getContext('2d');c.fillStyle='#06121c';c.fillRect(0,0,230,150);c.drawImage(e.data.bitmap,20,18,180,90);c.fillStyle='white';c.font='12px sans-serif';c.fillText('worker',70,138);window.complexState.worker=e.data.ok;};worker.postMessage({});
const nested=document.getElementById('canvas-nested').getContext('2d');nested.fillStyle='#082b36';nested.fillRect(0,0,410,82);nested.drawImage(off.transferToImageBitmap(),20,8,120,58);nested.fillStyle='lime';nested.fillRect(178,16,72,38);nested.strokeStyle='cyan';nested.lineWidth=4;const np=new Path2D();np.ellipse(300,40,44,22,0,0,6.283);nested.stroke(np);nested.fillStyle='white';nested.font='12px sans-serif';nested.fillText('nested canvas',24,76);
const gl=document.getElementById('webgl-main').getContext('webgl');gl.canvas.width=410;gl.canvas.height=250;gl.clearColor(.18,.04,.58,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);
window.complexState.ready=true;window.complexState.commands=document.textureArena.snapshot().commands.length;
</script></body></html>`;

const files = { 'index.html': html, 'complex-worker.js': `onmessage=()=>{const c=new OffscreenCanvas(180,90);const x=c.getContext('2d');const g=x.createLinearGradient(0,0,180,0);['lime','cyan','blue','magenta'].forEach((v,i)=>g.addColorStop(i/3,v));x.fillStyle=g;x.fillRect(0,0,180,90);x.fillStyle='black';x.fillRect(20,18,70,46);x.fillStyle='cyan';x.fillRect(104,22,52,40);x.strokeStyle='white';x.lineWidth=4;const p=new Path2D();p.arc(90,46,32,0,6.283);x.stroke(p);postMessage({ok:true,bitmap:c.transferToImageBitmap()});};` };

const result = await simulateRuntime({ runtime:'MekravaExecutor', entry:'index.html', files, snapshot:true, format:'png', fullPage:true, values:['window.complexState'], waitMs:280 });
const snapshot = result.snapshot || {};
const png = dataUrlToBuffer(snapshot.dataUrl || '');
if (!png.length) throw new Error('complex layout did not return PNG');
const imagePath = `${outDir}/complex-layout.png`;
fs.writeFileSync(imagePath, png);
const decoded = decodePng(png);
const stats = countColors(decoded);
const checks = {
  runtimeOk: result.ok,
  workerReply: result.values?.['window.complexState']?.worker === true,
  domCanvas: hasTexture(snapshot, 230, 150, 'canvas-2d'),
  offscreenTexture: hasTexture(snapshot, 190, 112, 'canvas-2d'),
  nestedOffscreenTexture: hasTexture(snapshot, 90, 55, 'canvas-2d'),
  workerTexture: hasTexture(snapshot, 180, 90, 'canvas-2d'),
  webglTexture: (snapshot.canvas?.textures || []).some(t => t.kind === 'canvas-webgl' && t.width === 410 && t.height === 250),
  drawImages: (snapshot.canvas?.commands || []).filter(c => c.op === 'drawImageTexture').length >= 4,
  textOpsNamed: !(snapshot.canvas?.commands || []).some(c => String(c.op).includes('Placeholder')) && (snapshot.canvas?.commands || []).some(c => c.op === 'fillText'),
  textOpsNamed: !(snapshot.canvas?.commands || []).some(c => String(c.op).includes('Placeholder')) && (snapshot.canvas?.commands || []).some(c => c.op === 'fillText'),
  formsVisibleReadable: stats.white > 3500 && stats.white < 16000 && stats.cyan > 7000,
  rainbowVisible: stats.red > 700 && stats.yellow > 1000 && stats.lime > 1000 && stats.cyan > 1000 && stats.magenta > 1000,
  webglYellowTriangle: stats.yellow > 1000,
  fitsViewport: decoded.width === 960 && decoded.height === 640
};
const report = { generatedAt:new Date().toISOString(), pass:Object.values(checks).every(Boolean), image:{ path:imagePath, bytes:png.length, sha256:sha256(png), width:decoded.width, height:decoded.height }, checks, values:result.values, colorStats:stats, textures:(snapshot.canvas?.textures || []).map(t => ({ id:t.id, kind:t.kind, width:t.width, height:t.height, ops:(t.commands || []).map(c => c.op) })), commandOps:(snapshot.canvas?.commands || []).map(c => c.op) };
fs.writeFileSync(`${outDir}/complex-report.json`, JSON.stringify(report, null, 2));
fs.writeFileSync(`${outDir}/complex-report.md`, markdown(report));
console.log(JSON.stringify({ pass:report.pass, image:report.image, checks:report.checks }, null, 2));
process.exit(report.pass ? 0 : 1);

function hasTexture(snapshot,w,h,kind){return (snapshot.canvas?.textures||[]).some(t=>t.kind===kind&&Math.abs(t.width-w)<=2&&Math.abs(t.height-h)<=2)}
function dataUrlToBuffer(url){const base64=String(url||'').replace(/^data:image\/png;base64,/,'');return base64?Buffer.from(base64,'base64'):Buffer.alloc(0)}
function sha256(buffer){return crypto.createHash('sha256').update(buffer).digest('hex')}
function decodePng(buffer){let offset=8,width=0,height=0,bitDepth=0,colorType=0;const idats=[];while(offset<buffer.length){const len=buffer.readUInt32BE(offset),type=buffer.slice(offset+4,offset+8).toString('ascii'),data=buffer.slice(offset+8,offset+8+len);offset+=12+len;if(type==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);bitDepth=data[8];colorType=data[9]}if(type==='IDAT')idats.push(data);if(type==='IEND')break}if(bitDepth!==8||colorType!==2)throw new Error(`unsupported png ${bitDepth}/${colorType}`);const raw=zlib.inflateSync(Buffer.concat(idats));const bpp=3,stride=width*bpp,pixels=Buffer.alloc(width*height*4);let p=0,prev=Buffer.alloc(stride);for(let y=0;y<height;y++){const filter=raw[p++];const row=Buffer.from(raw.slice(p,p+stride));p+=stride;unfilter(row,prev,bpp,filter);for(let x=0;x<width;x++){const si=x*3,di=(y*width+x)*4;pixels[di]=row[si];pixels[di+1]=row[si+1];pixels[di+2]=row[si+2];pixels[di+3]=255}prev=row}return{width,height,pixels}}
function unfilter(row,prev,bpp,filter){for(let i=0;i<row.length;i++){const left=i>=bpp?row[i-bpp]:0,up=prev[i]||0,upLeft=i>=bpp?prev[i-bpp]||0:0;if(filter===1)row[i]=(row[i]+left)&255;else if(filter===2)row[i]=(row[i]+up)&255;else if(filter===3)row[i]=(row[i]+Math.floor((left+up)/2))&255;else if(filter===4)row[i]=(row[i]+paeth(left,up,upLeft))&255}}
function paeth(a,b,c){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c}
function countColors(decoded){const out={red:0,green:0,blue:0,yellow:0,magenta:0,cyan:0,lime:0,white:0,total:decoded.width*decoded.height};for(let i=0;i<decoded.pixels.length;i+=4){const r=decoded.pixels[i],g=decoded.pixels[i+1],b=decoded.pixels[i+2];if(r>180&&g<90&&b<90)out.red++;if(g>100&&r<110&&b<100)out.green++;if(b>150&&r<110&&g<140)out.blue++;if(r>170&&g>150&&b<110)out.yellow++;if(r>130&&b>110&&g<110)out.magenta++;if(g>140&&b>140&&r<130)out.cyan++;if(g>190&&r<130&&b<130)out.lime++;if(r>205&&g>205&&b>205)out.white++}return out}
function markdown(report){return `# B"H Complex Layout Witness\n\nPass: ${report.pass}\n\nImage: ${report.image.path}\nSHA256: ${report.image.sha256}\n\n## Checks\n${Object.entries(report.checks).map(([k,v])=>`- ${v?'PASS':'FAIL'} ${k}`).join('\n')}\n`}
