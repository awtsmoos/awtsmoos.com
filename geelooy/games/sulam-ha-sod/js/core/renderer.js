// B"H
/**
 * Chapter 2: the camera becomes a traveling eye. The Awtsmoos pulls the
 * horizon leftward as the player climbs rightward, revealing the hidden map
 * in slices of color, danger, and luminous coins.
 */
export class Renderer {
  /** @param {HTMLCanvasElement} canvas drawing surface */
  constructor(canvas){ this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.camera = {x:0}; }
  /** @param {import('./physics.js').PhysicsWorld} world visible state */
  draw(world){
    this.camera.x = Math.max(0, Math.min(world.width - 960, world.player.x - 430));
    const c = this.ctx; c.clearRect(0,0,960,540); this.sky(c, world); c.save(); c.translate(-this.camera.x,0);
    for(const p of world.level.platforms) this.rect(c,p,'#39215f','#9df7ff');
    this.door(c, world.level.door, world.keyCount > 0);
    for(const coin of world.coins) this.spark(c,coin.x,coin.y,'#ffd36a','₪');
    for(const key of world.keys) this.spark(c,key.x,key.y,'#9df7ff','⚿');
    for(const e of world.enemies) this.enemy(c,e);
    this.hero(c,world.player); c.restore();
  }
  sky(c, world){
    c.fillStyle = '#10091f'; c.fillRect(0,0,960,540); c.fillStyle = '#ffffff10';
    for(let i=0;i<70;i++){ c.fillRect(((i*97)-this.camera.x*.25)%1040,(i*53)%280,2,2); }
    c.fillStyle = '#eadfff'; c.font = '18px serif'; c.fillText(world.message, 28, 42);
    c.fillStyle = '#9df7ff'; c.fillText(`${Math.floor(world.player.x)} / ${world.width}`, 28, 68);
  }
  rect(c,r,fill,stroke){ c.fillStyle = fill; c.strokeStyle = stroke; c.lineWidth = 3; c.fillRect(r.x,r.y,r.w,r.h); c.strokeRect(r.x,r.y,r.w,r.h); }
  hero(c,p){
    this.rect(c,p,'#f8f0ff','#ffe28a'); c.fillStyle = '#16091f'; c.fillRect(p.x+8,p.y+12,6,6); c.fillRect(p.x+21,p.y+12,6,6);
  }
  enemy(c,e){
    this.rect(c,e,'#7f183b','#ff6ad5'); c.fillStyle = '#ffd36a'; c.fillRect(e.x+7,e.y+8,6,6); c.fillRect(e.x+23,e.y+8,6,6);
  }
  spark(c,x,y,fill,label){
    c.beginPath(); c.arc(x+13,y+13,13,0,Math.PI*2); c.fillStyle = fill; c.fill(); c.fillStyle = '#14081f';
    c.font = '18px serif'; c.textAlign = 'center'; c.fillText(label,x+13,y+19); c.textAlign = 'start';
  }
  door(c,d,open){ this.rect(c,d,open ? '#214f48' : '#49305f',open ? '#9df7ff' : '#ffd36a'); c.fillStyle = '#fff'; c.font = '18px serif'; c.fillText(open ? 'OPEN' : 'KEY', d.x-2, d.y-8); }
}
