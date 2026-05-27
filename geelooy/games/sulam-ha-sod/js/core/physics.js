// B"H
import { collectCurrency } from '../systems/currency.js';
import { SpikeOracle } from '../systems/spikes.js';
import { enemyMask, steerEnemy } from '../systems/enemyArchetypes.js';
import { RotatingPlatformField } from '../systems/rotatingPlatforms.js';
import { TrickPlatformField } from '../systems/trickPlatforms.js';
import { SpatialHash } from '../systems/spatialHash.js';
import { SacredRandom, seedFromText } from '../systems/sacredRandom.js';
import { buyNextSkin, equippedSkin } from '../systems/market.js';
const GRAVITY = 1700, SPEED = 280, JUMP = -680;
const hit = (a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const clone = o => JSON.parse(JSON.stringify(o));
/**
 * Chapter 35: physics became lightning by refusing unnecessary witnesses.
 * Platforms and enemies now enter spatial courts every frame; only nearby
 * bodies are questioned, so the Awtsmoos turns choppy chaos into sharp motion.
 */
export class PhysicsWorld {
  /** @param {object} level compact data map */
  constructor(level){ this.load(level); }
  /** @param {object} level reset into a fresh playable state */
  load(level){
    const old = this.currency || {perutah:0,dinar:0,sela:0,maneh:0,shefa:0,chain:0,bestChain:0};
    const market = this.market || {owned:['plain'],equipped:'plain',open:false,message:'Press B to bargain with the brutal market.'};
    this.level = clone(level); this.width = level.width || 960; this.rng = new SacredRandom(seedFromText(level.name + level.law));
    this.player = {...level.spawn,w:34,h:48,vx:0,vy:0,on:false,stomps:0,skin:equippedSkin(market)};
    this.coins = clone(level.coins); this.keys = clone(level.keys); this.enemies = clone(level.enemies);
    this.currency = old; this.market = market; this.rotors = new RotatingPlatformField(level.rotatingPlatforms || []);
    this.tricks = new TrickPlatformField(level.trickPlatforms || []); this.spatial = new SpatialHash(180); this.enemySpatial = new SpatialHash(220);
    this.spikes = new SpikeOracle(level.spikes || [], this.rng); this.keyCount = 0; this.score = this.currency.shefa || 0;
    this.performance = {platformChecks:0,enemyChecks:0,totalPlatforms:0,totalEnemies:0,difficulty:this.difficulty()};
    this.message = market.message || level.law || 'Find the key, read the floor, reach the gate.';
  }
  /** @returns {number} 1-based difficulty estimate from current level density */
  difficulty(){ return 1 + Math.floor(((this.level.spikes?.length||0)+(this.level.rotatingPlatforms?.length||0)+(this.level.trickPlatforms?.length||0)+(this.level.enemies?.length||0)) / 5); }
  /** @param {{x:number,jump:boolean,restart:boolean,buy:boolean}} input @param {number} dt seconds */
  step(input, dt){
    if(input.restart) this.load(this.level); if(input.buy) this.buySkin(); this.moveEnemies(dt); this.rotors.step(dt); this.tricks.step(dt,this.player); this.spikes.step(dt, this.player); this.reindex();
    const p = this.player, oldY = p.y; p.vx = input.x * SPEED + p.vx * .08;
    if(input.jump && p.on) { p.vy = JUMP; p.on = false; }
    p.vy += GRAVITY * dt; p.x += p.vx * dt; this.resolve('x'); p.y += p.vy * dt; this.resolve('y');
    this.collect(this.coins, 26, coin => { const k = collectCurrency(this.currency, coin); this.score = this.currency.shefa; this.message = `${k.sound}: ${k.kind} joins the chain.`; });
    this.collect(this.keys, 28, () => { this.keyCount++; this.message = 'The key remembers the door.'; });
    if(this.touchEnemy(oldY)) return 'play'; if(this.touchSpike()) return 'play'; if(p.y > 660) this.loseMoneyAndReset('The abyss charged a brutal fall fee.');
    if(this.keyCount && hit(p,this.level.door)) return 'next'; return 'play';
  }
  /** Rebuild dynamic spatial indices after moving bodies. */
  reindex(){
    const platforms = [...this.level.platforms, ...this.rotors.bodies(), ...this.tricks.bodies()];
    this.performance.totalPlatforms = platforms.length; this.performance.totalEnemies = this.enemies.length; this.performance.platformChecks = 0; this.performance.enemyChecks = 0;
    this.spatial.build(platforms); this.enemySpatial.build(this.enemies);
  }
  resolve(axis){
    const p = this.player; p.on = axis === 'y' ? false : p.on; const nearby = this.spatial.query({x:p.x-8,y:p.y-8,w:p.w+16,h:p.h+16}); this.performance.platformChecks += nearby.length;
    for(const r of nearby){ if(!hit(p,r)) continue;
      if(axis === 'x') p.x = p.vx > 0 ? r.x - p.w : r.x + r.w;
      if(axis === 'y'){
        p.y = p.vy > 0 ? r.y - p.h : r.y + r.h; p.on = p.vy > 0; p.vy = 0;
        if(r.tilt) this.rotors.throwIfCruel(p,r);
        if(r.warn && p.on){ const msg = this.tricks.land(r); if(msg) this.message = msg; this.reindex(); }
      }
    }
    p.x = Math.max(0, Math.min(this.width - p.w, p.x));
  }
  touchEnemy(oldY){
    const p = this.player; const nearby = this.enemySpatial.query({x:p.x-16,y:p.y-16,w:p.w+32,h:p.h+32}); this.performance.enemyChecks += nearby.length;
    for(const e of nearby){ if(!hit(p,e)) continue;
      const i = this.enemies.indexOf(e), mask = enemyMask(e), wasAbove = oldY + p.h <= e.y + 10 && p.vy >= 0;
      if(wasAbove){ this.enemyStomp(i, e, mask); return true; }
      this.loseMoneyAndReset(`${e.name || 'husk'} collected a cruelty tax.`); return true;
    }
    return false;
  }
  enemyStomp(i, e, mask){
    const p = this.player; if(i >= 0) this.enemies.splice(i,1); p.vy = JUMP * .58; p.stomps++;
    if(mask.revives) this.enemies.push({...e,type:'husk',w:24,h:24,y:e.y+8,vx:-e.vx*.8,name:'gilgul echo'});
    this.message = `${e.name || 'husk'} ${mask.stomp}.`; this.reindex();
  }
  touchSpike(){ for(const s of this.spikes.active()) if(hit(this.player,s)){ this.loseMoneyAndReset('Spikes burst: Shefa spilled into the floor.'); return true; } return false; }
  loseMoneyAndReset(reason){
    const loss = Math.max(1, Math.ceil((this.currency.shefa || 0) * .18)); this.currency.shefa = Math.max(0, (this.currency.shefa || 0) - loss);
    this.currency.chain = 0; this.market.message = `${reason} Lost ${loss} in-game Shefa.`; this.load(this.level);
  }
  buySkin(){ const bought = buyNextSkin(this.market, this.currency); this.player.skin = equippedSkin(this.market); this.message = this.market.message; return bought; }
  collect(list, size, fn){ for(let i=list.length-1;i>=0;i--) if(hit(this.player,{x:list[i].x,y:list[i].y,w:size,h:size})){ const item = list.splice(i,1)[0]; fn(item); } }
  moveEnemies(dt){ for(const e of this.enemies){ steerEnemy(e, this.player, dt); e.x += e.vx * dt; if(e.x < e.min || e.x > e.max){ e.vx *= -1; e.x = Math.max(e.min, Math.min(e.max, e.x)); } } }
}
