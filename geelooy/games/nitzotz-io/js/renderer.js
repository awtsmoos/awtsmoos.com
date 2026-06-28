// B'H
import { createGL, bindMesh } from './webgl.js';
import { buildRenderList } from './engine/renderList.js';
import { updateStats } from './engine/stats.js';
import { createPostFX } from './engine/postfx.js';
import { createScreenPass } from './engine/screen.js';
import { lookAt, mul, perspective } from './math.js';
export function createRenderer(canvas){const r=createGL(canvas),fx=createPostFX(r.gl),screen=createScreenPass();function resize(on=false){const d=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*d;canvas.height=innerHeight*d;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';r.gl.viewport(0,0,canvas.width,canvas.height);fx.resize(canvas.width,canvas.height,on)}addEventListener('resize',()=>resize(false));resize(false);return{render:w=>{if(fx.enabled!==!!w.save.postfx)resize(!!w.save.postfx);render(r,fx,screen,w,canvas)},resize}}
function render(r,fx,screen,w,canvas){const gl=r.gl,p=w.player,c=w.camera,t=performance.now()*.001,commands=buildRenderList(w,t);fx.begin();gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.018,.012,.045,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(r.program);gl.uniformMatrix4fv(r.loc.uVP,false,new Float32Array(vp(canvas,c,p)));for(const cmd of commands)draw(r,cmd);const tex=fx.end();if(fx.enabled)screen.draw(gl,tex);updateStats(w,commands.length,fx.enabled?'postfx':'direct')}
function vp(canvas,c,p){const s=c.shake?Math.sin(performance.now()*.04)*c.shake*30:0;return mul(perspective(Math.PI/3.15,canvas.width/canvas.height,1,6500),lookAt([c.x+s,c.z,c.y-s],[p.x,p.z+p.h*.5,p.y]))}
function draw(r,o){const gl=r.gl,m=r.meshes[o.mesh]||r.meshes.cube;bindMesh(r,m);gl.uniform3fv(r.loc.uPos,o.pos);gl.uniform3fv(r.loc.uScale,o.scale);gl.uniform1f(r.loc.uRot,o.rot);gl.uniform3fv(r.loc.uColor,o.color);gl.uniform1f(r.loc.uAlpha,o.alpha);gl.uniform1f(r.loc.uGlow,o.glow);gl.drawArrays(gl.TRIANGLES,0,m.count)}
