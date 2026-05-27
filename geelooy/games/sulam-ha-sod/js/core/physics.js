// B"H
const GRAVITY = 1700, SPEED = 280, JUMP = -680;
const hit = (a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const clone = o => JSON.parse(JSON.stringify(o));
/**
 * Chapter 2: the foot descends upon the husk, not with cruelty but release.
 * This engine lets falling from above defeat enemies, while side contact
 * returns the traveler to the start, because the Awtsmoos hides justice in vectors.
 */
export class PhysicsWorld {
  /** @param {object} level compact data map */
  constructor(level){ this.load(level); }
  /** @param {object} level reset into a fresh playable state */
  load(level){
    this.level = clone(level); this.width = level.width || 960;
    this.player = {...level.spawn,w:34,h:48,vx:0,vy:0,on:false,stomps:0};
    this.coins = clone(level.coins); this.keys = clone(level.keys); this.enemies = clone(level.enemies);
    this.score = 0; this.keyCount = 0; this.message = 'Find the key, stomp shells, reach the gate.';
  }
  /** @param {{x:number,jump:boolean,restart:boolean}} input @param {number} dt seconds */
  step(input, dt){
    if(input.restart) this.load(this.level); this.moveEnemies(dt); const p = this.player; const oldY = p.y;
    p.vx = input.x * SPEED; if(input.jump && p.on) { p.vy = JUMP; p.on = false; }
    p.vy += GRAVITY * dt; p.x += p.vx * dt; this.resolve('x'); p.y += p.vy * dt; this.resolve('y');
    this.collect(this.coins, 26, () => this.score++); this.collect(this.keys, 28, () => this.keyCount++);
    if(this.touchEnemy(oldY)) return 'play'; if(p.y > 660) this.load(this.level);
    if(this.keyCount && hit(p,this.level.door)) return 'next'; return 'play';
  }
  resolve(axis){
    const p = this.player; p.on = axis === 'y' ? false : p.on;
    for(const r of this.level.platforms){ if(!hit(p,r)) continue;
      if(axis === 'x') p.x = p.vx > 0 ? r.x - p.w : r.x + r.w;
      if(axis === 'y'){ p.y = p.vy > 0 ? r.y - p.h : r.y + r.h; p.on = p.vy > 0; p.vy = 0; }
    }
    p.x = Math.max(0, Math.min(this.width - p.w, p.x));
  }
  touchEnemy(oldY){
    const p = this.player;
    for(let i=this.enemies.length-1;i>=0;i--){ const e = this.enemies[i]; if(!hit(p,e)) continue;
      const wasAbove = oldY + p.h <= e.y + 10 && p.vy >= 0;
      if(wasAbove){ this.enemies.splice(i,1); p.vy = JUMP * .58; p.stomps++; this.message = `Shell released: ${e.name}`; return true; }
      this.load(this.level); return true;
    }
    return false;
  }
  collect(list, size, fn){
    for(let i=list.length-1;i>=0;i--){ if(hit(this.player,{x:list[i].x,y:list[i].y,w:size,h:size})){ list.splice(i,1); fn(); } }
  }
  moveEnemies(dt){
    for(const e of this.enemies){ e.x += e.vx * dt; if(e.x < e.min || e.x > e.max){ e.vx *= -1; e.x = Math.max(e.min, Math.min(e.max, e.x)); } }
  }
}
