//B"H
import { Vec2 } from '../math.js';
import { SPRITES } from '../constants.js';
import { EnemyBullet } from './projectiles.js';

class Segment {
  constructor(type, hp, letter=null) {
    this.pos = new Vec2(0,0);
    this.type = type;
    this.hp = hp;
    this.maxHp = hp;
    this.letter = letter;
    this.radius = type === SPRITES.SNAKE_HEAD || type === SPRITES.TURRET ? 35 : 25;
    this.flash = 0;
  }
}

export class SnakeEnemy {
  constructor(path, difficulty) {
    this.segments = [];
    this.path = path;
    this.pathIndex = 0;
    this.speed = 3 + (difficulty * 0.3);
    this.turnSpeed = 0.03 + (difficulty * 0.005);
    this.velocity = new Vec2(0, 1);
    this.active = true;
    this.time = Math.random() * 100;
  }

  addSegment(type, hp, letter) {
    const s = new Segment(type, hp, letter);
    if(this.segments.length > 0) {
        const p = this.segments[this.segments.length-1];
        s.pos.set(p.pos.x, p.pos.y - 40);
    } else {
        s.pos.set(this.path[0].x, this.path[0].y);
    }
    this.segments.push(s);
  }

  update(h, game) {
      this.time += 0.05;
      const head = this.segments[0];
      if(!head) { this.active = false; return; }

      // Path Following
      if(this.pathIndex < this.path.length) {
          const target = this.path[this.pathIndex];
          const dir = Vec2.sub(target, head.pos);
          if(dir.mag() < 50) this.pathIndex++;
          else {
              dir.normalize();
              const perp = new Vec2(-dir.y, dir.x);
              perp.mult(Math.sin(this.time) * 0.8);
              dir.add(perp).normalize();
              
              this.velocity.x += (dir.x - this.velocity.x) * this.turnSpeed;
              this.velocity.y += (dir.y - this.velocity.y) * this.turnSpeed;
              this.velocity.normalize().mult(this.speed);
          }
      } else {
          this.velocity.y = 2; // Fly away
          if(head.pos.y > h + 200) this.active = false;
      }
      
      head.pos.add(this.velocity);
      if(head.flash > 0) head.flash--;

      // IK
      for(let i=1; i<this.segments.length; i++) {
          const c = this.segments[i], p = this.segments[i-1];
          const delta = Vec2.sub(p.pos, c.pos);
          const dist = delta.mag();
          if(dist > 0) {
              delta.normalize().mult(dist - 40);
              c.pos.add(delta);
          }
          if(c.flash > 0) c.flash--;
      }
  }
}

export class TurretEnemy {
    constructor(x, y, hp) {
        this.segments = [new Segment(SPRITES.TURRET, hp)];
        this.segments[0].pos.set(x, y);
        this.active = true;
        this.cooldown = 120 + Math.random() * 60;
        this.velocity = new Vec2(0, 0.5); // Drift slow
    }
    
    update(h, game) {
        const s = this.segments[0];
        s.pos.add(this.velocity);
        if(s.flash > 0) s.flash--;
        
        if(s.pos.y > h + 50) this.active = false;
        
        this.cooldown--;
        if(this.cooldown <= 0 && game && s.pos.y > 0 && s.pos.y < h) {
            this.cooldown = 180;
            // Fire at player
            const dir = Vec2.sub(game.player.pos, s.pos).normalize().mult(5);
            game.enemyBullets.push(new EnemyBullet(s.pos.x, s.pos.y, dir.x, dir.y));
        }
    }
}

export class SwarmerEnemy {
    constructor(x, y, hp) {
        this.segments = [new Segment(SPRITES.SWARMER, hp)];
        this.segments[0].pos.set(x, y);
        this.segments[0].radius = 15;
        this.active = true;
        this.velocity = new Vec2(0, 3);
        this.time = Math.random() * 100;
    }
    
    update(h, game) {
        const s = this.segments[0];
        
        // Swarm behavior: Seek player + Noise
        if(game) {
            const dir = Vec2.sub(game.player.pos, s.pos).normalize().mult(0.1);
            this.velocity.add(dir);
            
            // Noise
            this.time += 0.1;
            this.velocity.x += Math.sin(this.time) * 0.2;
        }
        
        // Clamp speed
        if(this.velocity.mag() > 5) this.velocity.normalize().mult(5);
        
        s.pos.add(this.velocity);
        if(s.flash > 0) s.flash--;
        if(s.pos.y > h + 50 || s.pos.x < -50 || s.pos.x > game.width + 50) this.active = false;
    }
}

export class SeraphEnemy {
    constructor(x, y, hp) {
        this.segments = [new Segment(SPRITES.SERAPH, hp)];
        this.segments[0].pos.set(x, y);
        this.active = true;
        this.startX = x;
        this.time = 0;
        this.cooldown = 60;
    }
    
    update(h, game) {
        const s = this.segments[0];
        this.time += 0.03;
        
        s.pos.y += 1.5;
        s.pos.x = this.startX + Math.sin(this.time) * 150;
        
        if(s.flash > 0) s.flash--;
        if(s.pos.y > h + 50) this.active = false;
        
        this.cooldown--;
        if(this.cooldown <= 0 && game) {
            this.cooldown = 90;
            // Fire burst
            for(let i=-1; i<=1; i++) {
                game.enemyBullets.push(new EnemyBullet(s.pos.x, s.pos.y, i*2, 6));
            }
        }
    }
}
