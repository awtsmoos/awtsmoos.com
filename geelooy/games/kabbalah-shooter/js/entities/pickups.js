//B"H
import { Vec2 } from '../math.js';

export class PowerUp {
  constructor(x, y, type) {
    this.pos = new Vec2(x, y);
    this.type = type; 
    this.active = true;
    this.radius = 20;
    this.rot = 0;
  }
  update() {
    this.pos.y += 2;
    this.rot += 0.05;
    if(this.pos.y > 2000) this.active = false;
  }
}

export class LetterDrop {
    constructor(x, y, char) {
        this.pos = new Vec2(x, y);
        this.char = char;
        this.active = true;
        this.radius = 25;
        this.timer = 0;
    }
    update() {
        this.pos.y += 1.5;
        this.timer += 0.1;
        if(this.pos.y > 2000) this.active = false;
    }
}
