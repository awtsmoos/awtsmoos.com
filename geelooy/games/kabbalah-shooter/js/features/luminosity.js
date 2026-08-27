//B"H
import { SPRITES, COLORS } from '../constants.js';
import { Vec2 } from '../math.js';
import { Particle } from '../entities/particles.js';
import { Bullet } from '../entities/projectiles.js';

export class LuminosityManager {
    constructor(game) {
        this.game = game;
        this.globalLuminosity = 0.5;
        this.wellsprings = [];
        this.prisms = [];
        this.lightSources = [];
    }
    
    spawnWellspring() {
        const type = Math.random() > 0.6 ? 'CHOCHMAH' : (Math.random() > 0.5 ? 'BINAH' : 'DAAT');
        this.wellsprings.push({
            pos: new Vec2(Math.random() * this.game.width, -100),
            type: type,
            angle: 0,
            active: true
        });
    }

    update() {
        // Global Lum decay
        this.globalLuminosity = 0.5 + (this.game.player.energy / 100) * 0.5;
        
        // Wellsprings Logic
        this.wellsprings.forEach(w => {
            w.pos.y += 0.5 * this.game.timeScale;
            w.angle += 0.05;
            
            // Emit logic
            if(this.game.frameCount % 10 === 0) {
                if(w.type === 'CHOCHMAH') {
                    // Spiral
                    const vx = Math.cos(w.angle) * 5;
                    const vy = Math.sin(w.angle) * 5;
                    this.game.particles.push(new Particle(w.pos.x, w.pos.y, COLORS.CYAN, 5));
                } else if (w.type === 'BINAH') {
                    // River flow downwards
                    this.game.particles.push(new Particle(w.pos.x + (Math.random()-0.5)*20, w.pos.y, COLORS.BLUE, 8));
                }
            }
            
            if(w.pos.y > this.game.height + 100) w.active = false;
        });
        this.wellsprings = this.wellsprings.filter(w => w.active);
        
        // Prisms
        // Logic for prisms splitting bullets would go here, interacting with game.bullets
    }
    
    render(renderer) {
        this.wellsprings.forEach(w => {
             renderer.drawSprite(SPRITES.WELLSPRING_SOURCE, w.pos.x, w.pos.y, 80, 80, w.angle, COLORS.WHITE);
        });
    }
}
