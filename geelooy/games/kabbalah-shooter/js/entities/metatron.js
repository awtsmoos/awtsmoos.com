//B"H
import { Vec2, Vec3 } from '../math.js';

export class MetatronShape {
    constructor(x, y, type) {
        this.pos = new Vec2(x, y);
        this.type = type; // SPRITE ID
        this.active = true;
        this.hp = 200;
        this.angle = new Vec3(Math.random(), Math.random(), Math.random());
        this.rotSpeed = new Vec3(0.01, 0.02, 0.01);
    }
    
    update() {
        this.angle.x += this.rotSpeed.x;
        this.angle.y += this.rotSpeed.y;
        this.pos.y += 0.5;
        if(this.pos.y > 2000) this.active = false;
    }
}
