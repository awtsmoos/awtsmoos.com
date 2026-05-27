// B"H
import { coinKind } from '../systems/currency.js';
import { enemyMask } from '../systems/enemyArchetypes.js';
/**
 * Chapter 37: the painter stopped repainting the heavens every breath.
 * A cached offscreen starfield, optional worker-prepared bitmap, and lean draw
 * passes make the canvas feel like lightning while the Awtsmoos keeps its glow.
 */
export class Renderer {
  /** @param {HTMLCanvasElement} canvas drawing surface */
  constructor(canvas){
    this.canvas = canvas; this.ctx = canvas.getContext('2d', {alpha:false}); this.camera = {x:0}; this.frame = 0;
    this.bg = this.makeBackground(canvas.width, canvas.height); this.workerReady = false; this.primeWorkerBackground();
  }
  /** @param {number} width canvas width @param {number} height canvas height */
  makeBackground(width,height){
    const cvs = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(width,height) : document.createElement('canvas');
    cvs.width = width; cvs.height = height; const c = cvs.getContext('2d'); c.fillStyle = '#10091f'; c.fillRect(0,0,width,height);
    const g = c.createRadialGradient(width*.5,60,20,width*.5,60,width*.85); g.addColorStop(0,'#2d185e'); g.addColorStop(1,'#10091f'); c.fillStyle = g; c.fillRect(0,0,width,height);
    c.fillStyle = '#ffffff14'; for(let i=0;i<100;i++) c.fillRect((i*97)%width,(i*53)%310,2,2); return cvs;
  }
  /** Try optional worker/offscreen precomputation without requiring it. */
  primeWorkerBackground(){
    try{
      if(typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') return;
      const worker = new Worker(new URL('../render/workerRenderer.js', import.meta.url), {type:'module'});
      worker.onmessage = e => { if(e.data?.type === 'backgroundReady'){ this.workerBg = e.data.bitmap; this.workerReady = true; worker.terminate(); } };
      worker.postMessage({type:'primeBackground',width:this.canvas.width,height:this.canvas.height});
    }catch{ this.workerReady = false; }
  }
  /** @param {import('./physics.js').PhysicsWorld} world visible state */
  draw(world){
    this.frame++; this.camera.x = Math.max(0, Math.min(world.width - 960, world.player.x - 430));
    const c = this.ctx; c.clearRect(0,0,960,540); this.sky(c, world); c.save(); c.translate(-this.camera.x,0);
    for(const p of world.level.platforms) this.rect(c,p,'#39215f','#9df7ff');
    for(const p of world.tricks.bodies()) this.trick(c,p);
    for(const p of world.rotors.bodies()) this.rotor(c,p);
    for(const s of world.spikes.warning()) this.spike(c,s,'#74e8ff55','#9df7ff');
    for(const s of world.spikes.active()) this.spike(c,s,'#ff2f6d','#ffe28a');
    this.door(c, world.level.door, world.keyCount > 0);
    for(const coin of world.coins){ const k = coinKind(coin); this.spark(c,coin.x,coin.y,k.color,k.label); }
    for(const key of world.keys) this.spark(c,key.x,key.y,'#9df7ff','⚿');
    for(const e of world.enemies) this.enemy(c,e); this.hero(c,world.player); c.restore();
  }
  sky(c, world){
    if(this.workerReady && this.workerBg) c.drawImage(this.workerBg,0,0); else c.drawImage(this.bg,0,0);
    c.fillStyle = '#eadfff'; c.font = '18px serif'; c.fillText(world.message, 28, 42);
    c.fillStyle = '#9df7ff'; c.fillText(`checks ${world.performance.platformChecks}/${world.performance.totalPlatforms} · D${world.performance.difficulty}`, 28, 68);
  }
  rect(c,r,fill,stroke){ c.fillStyle = fill; c.strokeStyle = stroke; c.lineWidth = 3; c.fillRect(r.x,r.y,r.w,r.h); c.strokeRect(r.x,r.y,r.w,r.h); }
  rotor(c,r){ c.save(); c.translate(r.x+r.w/2,r.y+r.h/2); c.rotate((r.tilt||0)*.32); this.rect(c,{x:-r.w/2,y:-r.h/2,w:r.w,h:r.h},'#2d4c6b','#ffdf6e'); c.restore(); }
  trick(c,r){
    const fill = r.warn === 'shatter' ? '#44334f' : r.warn === 'vanish' ? '#30404f' : '#3a2f68'; this.rect(c,r,fill,'#d7fffb'); c.fillStyle = '#ffffff88';
    if(r.warn === 'shatter'){ c.fillRect(r.x+8,r.y+5,r.w-16,2); c.fillRect(r.x+r.w/2,r.y+4,2,r.h-8); }
    if(r.warn === 'ambush'){ c.font='14px serif'; c.fillText('?',r.x+r.w/2-4,r.y+16); }
    if(r.warn === 'vanish'){ c.globalAlpha=.55; c.fillRect(r.x+4,r.y+4,r.w-8,r.h-8); c.globalAlpha=1; }
  }
  hero(c,p){
    const skin = p.skin || {}; this.rect(c,p,skin.body || '#f8f0ff',skin.trim || '#ffe28a'); c.fillStyle = '#16091f'; c.fillRect(p.x+8,p.y+12,6,6); c.fillRect(p.x+21,p.y+12,6,6);
    c.beginPath(); c.arc(p.x+p.w/2,p.y+4,15,Math.PI,Math.PI*2); c.fillStyle = skin.kippah || '#1a0b2d'; c.fill();
  }
  enemy(c,e){ const m = enemyMask(e); this.rect(c,e,m.color,'#ff6ad5'); c.fillStyle = m.eye; c.fillRect(e.x+7,e.y+8,6,6); c.fillRect(e.x+Math.max(14,e.w-13),e.y+8,6,6); }
  spike(c,s,fill,stroke){
    c.fillStyle = fill; c.strokeStyle = stroke; c.lineWidth = 2; c.beginPath(); const teeth = Math.max(2, Math.floor(s.w / 18)); c.moveTo(s.x,s.y+s.h);
    for(let i=0;i<teeth;i++){ const x=s.x+i*s.w/teeth; c.lineTo(x+s.w/teeth/2,s.y); c.lineTo(x+s.w/teeth,s.y+s.h); } c.closePath(); c.fill(); c.stroke();
  }
  spark(c,x,y,fill,label){ c.beginPath(); c.arc(x+13,y+13,13,0,Math.PI*2); c.fillStyle = fill; c.fill(); c.fillStyle = '#14081f'; c.font = '18px serif'; c.textAlign = 'center'; c.fillText(label,x+13,y+19); c.textAlign = 'start'; }
  door(c,d,open){ this.rect(c,d,open ? '#214f48' : '#49305f',open ? '#9df7ff' : '#ffd36a'); c.fillStyle = '#fff'; c.font = '18px serif'; c.fillText(open ? 'OPEN' : 'KEY', d.x-2, d.y-8); }
}
