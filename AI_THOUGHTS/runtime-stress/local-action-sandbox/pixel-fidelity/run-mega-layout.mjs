// B"H
/**
 * Mega layout witness, MiniMax-fix edition.
 *
 * This scene is intentionally compact and explicit: controls receive inline
 * dark glass styles, the lower strip is fully inside the 960x640 frame, WebGL
 * records buffer/program/texture calls, and the renderer paints GPU/TEX visual
 * witnesses from those commands.
 */
import fs from 'fs';
import zlib from 'zlib';
import crypto from 'crypto';
import { simulateRuntime } from '../../../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js';

const outDir = 'AI_THOUGHTS/runtime-stress/local-action-sandbox/pixel-fidelity/mega-layout';
fs.mkdirSync(outDir, { recursive: true });

const darkControl = 'background:#08162a;color:#f7fbff;border:2px solid #00d9ff;border-radius:10px;padding:5px';
const darkButton = 'background:#17264f;color:#f7fbff;border:2px solid #00d9ff;border-radius:999px;padding:5px 11px';
const html = `<!doctype html><html><head><style>
body{margin:0;background:#06101f;color:#f7fbff;font-family:system-ui,sans-serif}.page{padding:9px 12px 22px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto;gap:8px;background:linear-gradient(135deg,#12305b,#06101f)}.card{background:linear-gradient(135deg,#1d3150,#0d192b);border:2px solid #4ad2f0;border-radius:18px;padding:8px;box-shadow:0 0 12px #4ad2f0,0 0 22px #244aff}.wide{grid-column:1/3}.grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px}.flex{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.mini{background:#08162a;border:2px solid #7b8cff;border-radius:14px;padding:5px}.rainbow{height:15px;border:2px solid white;border-radius:12px;background:linear-gradient(90deg,red,orange,yellow,lime,cyan,blue,magenta)}h1{font-size:23px;margin:0 0 2px}h2{font-size:16px;margin:0 0 2px}.small{font-size:11px;color:#fff}.form{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-top:5px}.notice{font-size:11px;margin:1px 0 4px;color:#ffdf7a}
</style></head><body><main class="page">
<section class="card wide"><h1>MEGA MERKAVA STRESS</h1><p class="notice">Grid span, nested flex, dark forms, nested offscreen, worker bitmap, gradients, Path2D, WebGL program plus texture.</p><div class="rainbow"></div></section>
<section class="card"><h2>GRID CANVAS ARRAY</h2><div class="grid"><div class="mini"><strong>DOM</strong><canvas id="dom-canvas" width="236" height="130"></canvas></div><div class="mini"><strong>OFF</strong><canvas id="off-canvas" width="236" height="130"></canvas></div><div class="mini"><strong>WORK</strong><canvas id="worker-canvas" width="236" height="130"></canvas></div></div><form class="mini form"><label><span class="small">NAME</span><input style="${darkControl}" value="NAME"></label><label><span class="small">MODE</span><select style="${darkControl}" value="MODE"></select></label><textarea style="${darkControl}">NOTE</textarea><button style="${darkButton}">GO</button></form></section>
<section class="card"><h2>FLEX WEBGL SURFACE</h2><div class="flex"><button style="${darkButton}" value="A"></button><button style="${darkButton}" value="B"></button><button style="${darkButton}" value="C"></button><button style="${darkButton}" value="D"></button></div><div class="mini"><canvas id="webgl-surface" width="380" height="185"></canvas></div><div class="mini"><canvas id="strip-canvas" width="380" height="58"></canvas></div></section>
<section class="card wide"><h2>LOWER GRID STRIP</h2><div class="grid"><div class="mini"><canvas id="strip-a" width="285" height="52"></canvas></div><div class="mini"><canvas id="strip-b" width="285" height="52"></canvas></div><div class="mini"><canvas id="strip-c" width="285" height="52"></canvas></div></div></section>
</main><script>
window.megaState={ready:false};
function rainbow(ctx,w,h){const g=ctx.createLinearGradient(0,0,w,0);['red','orange','yellow','lime','cyan','blue','magenta'].forEach((c,i)=>g.addColorStop(i/6,c));ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
function label(ctx,text,x,y){ctx.fillStyle='white';ctx.font='12px sans-serif';ctx.fillText(text,x,y)}
const dom=document.getElementById('dom-canvas').getContext('2d');rainbow(dom,236,130);dom.fillStyle='rgba(0,0,0,.45)';dom.fillRect(16,12,204,98);dom.strokeStyle='white';dom.lineWidth=4;const dp=new Path2D();dp.ellipse(118,64,48,30,0,0,6.283);dom.stroke(dp);dom.fillStyle='yellow';dom.fillText('DOM',92,69);
const inner=new OffscreenCanvas(82,52);const ix=inner.getContext('2d');ix.fillStyle='lime';ix.fillRect(0,0,82,52);ix.fillStyle='blue';ix.fillRect(32,10,40,30);ix.strokeStyle='white';ix.lineWidth=3;const ip=new Path2D();ip.arc(41,26,21,0,6.283);ix.stroke(ip);
const off=new OffscreenCanvas(190,102);const ox=off.getContext('2d');rainbow(ox,190,102);ox.fillStyle='magenta';ox.fillRect(16,18,156,54);ox.drawImage(inner.transferToImageBitmap(),56,30,76,44);ox.strokeStyle='cyan';ox.lineWidth=4;const op=new Path2D();op.moveTo(10,90);op.bezierCurveTo(48,4,144,4,180,90);op.closePath();ox.stroke(op);ox.clip(op);ox.fillStyle='rgba(20,0,90,.45)';ox.fillRect(32,44,128,32);
const offCtx=document.getElementById('off-canvas').getContext('2d');offCtx.fillStyle='#082b36';offCtx.fillRect(0,0,236,130);offCtx.drawImage(off.transferToImageBitmap(),18,12,190,102);label(offCtx,'off',74,124);
const worker=new Worker('mega-worker.js');worker.onmessage=e=>{const wc=document.getElementById('worker-canvas').getContext('2d');wc.fillStyle='#06121c';wc.fillRect(0,0,236,130);wc.drawImage(e.data.bitmap,20,14,188,86);label(wc,'worker',62,122);window.megaState.worker=e.data.ok;};worker.postMessage({});
const gl=document.getElementById('webgl-surface').getContext('webgl');gl.canvas.width=380;gl.canvas.height=185;gl.clearColor(.18,.04,.58,1);gl.viewport(0,0,380,185);const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,0,1]),gl.STATIC_DRAW);const tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,2,2,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,0,0,255,255,255,0,255,0,255,0,255,0,200,255,255]));const vs=gl.createShader(gl.VERTEX_SHADER);gl.shaderSource(vs,'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}');gl.compileShader(vs);const fsx=gl.createShader(gl.FRAGMENT_SHADER);gl.shaderSource(fsx,'precision mediump float;void main(){gl_FragColor=vec4(1.0,0.8,0.2,1.0);}');gl.compileShader(fsx);const prog=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fsx);gl.linkProgram(prog);gl.useProgram(prog);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);
const strip=document.getElementById('strip-canvas').getContext('2d');strip.fillStyle='#082b36';strip.fillRect(0,0,380,58);strip.drawImage(off.transferToImageBitmap(),16,6,100,44);strip.fillStyle='lime';strip.fillRect(154,12,62,30);strip.strokeStyle='cyan';strip.lineWidth=4;const sp=new Path2D();sp.ellipse(282,30,36,17,0,0,6.283);strip.stroke(sp);label(strip,'nested',22,54);
for(const [id,color,text] of [['strip-a','red','red'],['strip-b','cyan','cyan'],['strip-c','yellow','yellow']]){const c=document.getElementById(id).getContext('2d');c.fillStyle='#08162a';c.fillRect(0,0,285,52);c.fillStyle=color;c.fillRect(14,10,58,28);c.drawImage(off.transferToImageBitmap(),105,6,78,38);c.strokeStyle='white';c.lineWidth=3;const p=new Path2D();p.arc(236,26,17,0,6.283);c.stroke(p);label(c,text,16,48)}
window.megaState.ready=true;window.megaState.commands=document.textureArena.snapshot().commands.length;
</script></body></html>`;

const files={
  'index.html':html,
  'mega-worker.js':`onmessage=()=>{const c=new OffscreenCanvas(188,86);const x=c.getContext('2d');const g=x.createLinearGradient(0,0,188,0);['lime','cyan','blue','magenta'].forEach((v,i)=>g.addColorStop(i/3,v));x.fillStyle=g;x.fillRect(0,0,188,86);x.fillStyle='black';x.fillRect(18,16,72,42);x.fillStyle='cyan';x.fillRect(110,20,52,36);x.strokeStyle='white';x.lineWidth=4;const p=new Path2D();p.arc(94,42,29,0,6.283);x.stroke(p);postMessage({ok:true,bitmap:c.transferToImageBitmap()});};`
};

const result=await simulateRuntime({runtime:'MekravaExecutor',entry:'index.html',files,snapshot:true,format:'png',fullPage:true,values:['window.megaState'],waitMs:340});
const snapshot=result.snapshot||{};
const png=dataUrlToBuffer(snapshot.dataUrl||'');
if(!png.length)throw new Error('mega layout did not return PNG');
const imagePath=`${outDir}/mega-layout.png`;
fs.writeFileSync(imagePath,png);
const decoded=decodePng(png);
const stats=countColors(decoded);
const commandOps=(snapshot.canvas?.commands||[]).map(c=>c.op);
const checks={
  runtimeOk:result.ok,
  workerReply:result.values?.['window.megaState']?.worker===true,
  domCanvas:hasTexture(snapshot,236,130,'canvas-2d'),
  offscreenTexture:hasTexture(snapshot,190,102,'canvas-2d'),
  nestedOffscreenTexture:hasTexture(snapshot,82,52,'canvas-2d'),
  workerTexture:hasTexture(snapshot,188,86,'canvas-2d'),
  webglTexture:(snapshot.canvas?.textures||[]).some(t=>t.kind==='canvas-webgl'&&t.width===380&&t.height===185),
  webglProgramAndTexture:['webgl.createTexture','webgl.texImage2D','webgl.createShader','webgl.linkProgram','webgl.bufferData'].every(op=>commandOps.includes(op)),
  drawImages:commandOps.filter(op=>op==='drawImageTexture').length>=7,
  namedTextOps:!commandOps.some(op=>String(op).includes('Placeholder'))&&commandOps.includes('fillText'),
  rainbowVisible:stats.red>800&&stats.yellow>1200&&stats.lime>1200&&stats.cyan>1800&&stats.magenta>900,
  darkControlsAndReadableText:stats.white>4200&&stats.white<23000&&stats.cyan>9000,
  fitsViewport:decoded.width===960&&decoded.height===640
};
const report={generatedAt:new Date().toISOString(),pass:Object.values(checks).every(Boolean),image:{path:imagePath,bytes:png.length,sha256:sha256(png),width:decoded.width,height:decoded.height},checks,values:result.values,colorStats:stats,textures:(snapshot.canvas?.textures||[]).map(t=>({id:t.id,kind:t.kind,width:t.width,height:t.height,ops:(t.commands||[]).map(c=>c.op)})),commandOps};
fs.writeFileSync(`${outDir}/mega-report.json`,JSON.stringify(report,null,2));
fs.writeFileSync(`${outDir}/mega-report.md`,markdown(report));
console.log(JSON.stringify({pass:report.pass,image:report.image,checks:report.checks},null,2));
process.exit(report.pass?0:1);

function hasTexture(snapshot,w,h,kind){return(snapshot.canvas?.textures||[]).some(t=>t.kind===kind&&Math.abs(t.width-w)<=2&&Math.abs(t.height-h)<=2)}
function dataUrlToBuffer(url){const base64=String(url||'').replace(/^data:image\/png;base64,/,'');return base64?Buffer.from(base64,'base64'):Buffer.alloc(0)}
function sha256(buffer){return crypto.createHash('sha256').update(buffer).digest('hex')}
function decodePng(buffer){let offset=8,width=0,height=0,bitDepth=0,colorType=0;const idats=[];while(offset<buffer.length){const len=buffer.readUInt32BE(offset),type=buffer.slice(offset+4,offset+8).toString('ascii'),data=buffer.slice(offset+8,offset+8+len);offset+=12+len;if(type==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);bitDepth=data[8];colorType=data[9]}if(type==='IDAT')idats.push(data);if(type==='IEND')break}if(bitDepth!==8||colorType!==2)throw new Error(`unsupported png ${bitDepth}/${colorType}`);const raw=zlib.inflateSync(Buffer.concat(idats));const bpp=3,stride=width*bpp,pixels=Buffer.alloc(width*height*4);let p=0,prev=Buffer.alloc(stride);for(let y=0;y<height;y++){const filter=raw[p++];const row=Buffer.from(raw.slice(p,p+stride));p+=stride;unfilter(row,prev,bpp,filter);for(let x=0;x<width;x++){const si=x*3,di=(y*width+x)*4;pixels[di]=row[si];pixels[di+1]=row[si+1];pixels[di+2]=row[si+2];pixels[di+3]=255}prev=row}return{width,height,pixels}}
function unfilter(row,prev,bpp,filter){for(let i=0;i<row.length;i++){const left=i>=bpp?row[i-bpp]:0,up=prev[i]||0,upLeft=i>=bpp?prev[i-bpp]||0:0;if(filter===1)row[i]=(row[i]+left)&255;else if(filter===2)row[i]=(row[i]+up)&255;else if(filter===3)row[i]=(row[i]+Math.floor((left+up)/2))&255;else if(filter===4)row[i]=(row[i]+paeth(left,up,upLeft))&255}}
function paeth(a,b,c){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c}
function countColors(decoded){const out={red:0,green:0,blue:0,yellow:0,magenta:0,cyan:0,lime:0,white:0,total:decoded.width*decoded.height};for(let i=0;i<decoded.pixels.length;i+=4){const r=decoded.pixels[i],g=decoded.pixels[i+1],b=decoded.pixels[i+2];if(r>180&&g<90&&b<90)out.red++;if(g>100&&r<110&&b<100)out.green++;if(b>150&&r<110&&g<140)out.blue++;if(r>170&&g>150&&b<110)out.yellow++;if(r>130&&b>110&&g<110)out.magenta++;if(g>140&&b>140&&r<130)out.cyan++;if(g>190&&r<130&&b<130)out.lime++;if(r>205&&g>205&&b>205)out.white++}return out}
function markdown(report){return`# B"H Mega Layout Witness\n\nPass: ${report.pass}\n\nImage: ${report.image.path}\nSHA256: ${report.image.sha256}\n\n## Checks\n${Object.entries(report.checks).map(([k,v])=>`- ${v?'PASS':'FAIL'} ${k}`).join('\n')}\n`}
