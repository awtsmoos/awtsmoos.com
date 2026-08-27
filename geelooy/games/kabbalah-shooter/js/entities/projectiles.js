//B"H
import { Vec2 } from '../math.js';
import { CONFIG, SPRITES } from '../constants.js';

export class Bullet {
  constructor(x, y, vx, vy, weapon, isBeam=false, spriteId) {
    this.pos = new Vec2(x, y);
    this.vel = new Vec2(vx, vy);
    this.active = true;
    this.radius = 8;
    this.isBeam = isBeam;
    this.weapon = weapon; 
    this.homingTarget = null;
    this.life = 100;
    this.sprite = spriteId;
    this.wrapCount = 0; // Ufaratzta counter
  }
  
  update() {
    if(this.homingTarget && this.homingTarget.active) {
        const head = this.homingTarget.segments[0];
        if(head) {
            const desired = Vec2.sub(head.pos, this.pos).normalize().mult(CONFIG.BULLET_SPEED);
            this.vel.x += (desired.x - this.vel.x) * 0.1;
            this.vel.y += (desired.y - this.vel.y) * 0.1;
        }
    }
    
    this.pos.add(this.vel);
    
    // Ufaratzta Wrapping
    if(this.pos.x < 0) {
        if(this.wrapCount < CONFIG.UFARATZTA_LIMIT) {
             this.pos.x = CONFIG.GAME_WIDTH;
             this.split();
        } else {
             this.active = false;
        }
    }
    if(this.pos.x > CONFIG.GAME_WIDTH) {
        if(this.wrapCount < CONFIG.UFARATZTA_LIMIT) {
            this.pos.x = 0;
            this.split();
        } else {
            this.active = false;
        }
    }
    
    this.life--;
    if(this.pos.y < -50 || this.pos.y > 3000 || this.life <= 0) this.active = false;
  }
  
  split() {
      this.wrapCount++;
      this.vel.y *= 0.8; 
  }
}

export class EnemyBullet {
    constructor(x, y, vx, vy) {
        this.pos = new Vec2(x, y);
        this.vel = new Vec2(vx, vy);
        this.active = true;
        this.radius = 8;
        this.sprite = SPRITES.ENEMY_BULLET;
    }
    
    update() {
        this.pos.add(this.vel);
        if(this.pos.y > 3000 || this.pos.x < -100 || this.pos.x > 2000) this.active = false;
    }
}

export class GravityWell {
    constructor(x, y) {
        this.pos = new Vec2(x, y);
        this.radius = 150;
        this.life = 1.0;
        this.active = true;
    }
    update() {
        this.life -= 0.005;
        if(this.life <= 0) this.active = false;
    }
}

export class Orbital {
    constructor(parent, offsetAngle) {
        this.parent = parent;
        this.angle = offsetAngle;
        this.pos = new Vec2(0,0);
        this.radius = 10;
        this.active = true;
    }
    update(time) {
        this.angle += 0.05;
        this.pos.x = this.parent.pos.x + Math.cos(this.angle) * 80;
        this.pos.y = this.parent.pos.y + Math.sin(this.angle) * 80;
    }
}
