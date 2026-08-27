//B"H
import { Vec2 } from '../math.js';
import { CONFIG } from '../constants.js';

export class Particle {
  constructor(x, y, color, size) {
    this.pos = new Vec2(x, y);
    this.vel = new Vec2((Math.random()-0.5)*10, (Math.random()-0.5)*10);
    this.color = [...color];
    this.size = size;
    this.life = 1.0;
  }
  update() {
    this.pos.add(this.vel);
    this.vel.mult(CONFIG.PARTICLE_DRAG);
    this.life -= 0.03;
  }
}

export class FloatingText {
  constructor(x, y, text, color) {
    this.pos = new Vec2(x, y);
    this.vel = new Vec2((Math.random()-0.5)*2, -3);
    this.text = text;
    this.color = color;
    this.life = 1.0;
  }
  update() {
    this.pos.add(this.vel);
    this.vel.y += 0.05;
    this.life -= 0.015;
  }
}
