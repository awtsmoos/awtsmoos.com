//B"H
import { SPRITES, COLORS } from '../constants.js';
import { Vec2 } from '../math.js';
import { FloatingText, Particle } from '../entities/particles.js';

export class PasachEliyahuManager {
    constructor(game) {
        this.game = game;
        
        // States
        this.isEssenceMode = false; // Ant Hu Chad
        this.miracleMode = false; // Teva vs Nes
        this.isUnderwater = false; // Tviah
        this.waterLevel = 0;
        this.lensActive = false; // Daat Elyon
        this.chantProgress = 0;
        this.coinsCollected = 0;
        this.tikkunStones = 0;
        
        this.hiddenEnemies = [];
    }
    
    activateTviah() {
        this.isUnderwater = true;
        this.game.texts.push(new FloatingText(this.game.width/2, this.game.height/2, "MAYIM RABIM", COLORS.BLUE));
    }
    
    toggleMiracleMode() {
        this.miracleMode = !this.miracleMode;
        const msg = this.miracleMode ? "NES (MIRACLE)" : "TEVA (NATURE)";
        const col = this.miracleMode ? COLORS.GOLD : COLORS.GREEN;
        this.game.texts.push(new FloatingText(this.game.player.pos.x, this.game.player.pos.y, msg, col));
    }
    
    spawnMatbea() {
        this.game.powerups.push({
            pos: new Vec2(Math.random()*this.game.width, -50),
            type: 'COIN',
            active: true,
            radius: 15,
            rot: 0,
            update: function() { this.pos.y += 3; this.rot += 0.1; if(this.pos.y > 2000) this.active=false; }
        });
    }

    update() {
        // Tviah Physics
        if(this.isUnderwater) {
            this.waterLevel = Math.min(1.0, this.waterLevel + 0.01);
            // Fluid drag
            this.game.player.vel.mult(0.9);
            this.game.enemies.forEach(e => e.speed *= 0.8);
        } else {
            this.waterLevel = Math.max(0, this.waterLevel - 0.01);
        }

        // Essence Mode (Ant Hu Chad)
        if(this.isEssenceMode) {
             this.game.enemies.forEach(e => {
                 if(e.active && e.segments[0].pos.dist(this.game.player.pos) < 200) {
                     e.active = false;
                     this.game.spawnImplosion(e.segments[0].pos.x, e.segments[0].pos.y, COLORS.WHITE);
                 }
             });
        }
        
        // Miracle Mode Chaos
        if(this.miracleMode && this.game.frameCount % 60 === 0) {
            // Teleport an enemy
            if(this.game.enemies.length > 0) {
                const e = this.game.enemies[Math.floor(Math.random()*this.game.enemies.length)];
                if(e.segments[0]) {
                    e.segments.forEach(s => s.pos.x = Math.random() * this.game.width);
                    this.game.spawnExplosion(e.segments[0].pos.x, e.segments[0].pos.y, COLORS.GOLD);
                }
            }
        }
        
        // Ratzo Boost (Up = Invincible)
        if(this.game.player.pos.y < 200) {
            this.game.player.shieldActive = true;
            if(this.game.frameCount % 10 === 0) this.game.score = Math.max(0, this.game.score - 10);
        }
        
        // Shov Anchor (Down = Regen)
        if(this.game.player.pos.y > this.game.height - 100) {
            this.game.player.energy = Math.min(this.game.player.maxEnergy, this.game.player.energy + 0.5);
        }
        
        // Spawn Hidden Enemies (Sitimin)
        if(this.game.frameCount % 300 === 0 && Math.random() < 0.3) {
            this.hiddenEnemies.push({
                pos: new Vec2(Math.random()*this.game.width, -50),
                vel: new Vec2(0, 2),
                active: true
            });
        }
        
        this.hiddenEnemies.forEach(h => {
            h.pos.add(h.vel);
            if(h.pos.y > this.game.height) h.active = false;
        });
        this.hiddenEnemies = this.hiddenEnemies.filter(h => h.active);
    }
    
    render(renderer) {
        // Render Matbea (Coins)
        this.game.powerups.forEach(p => {
            if(p.type === 'COIN') {
                renderer.drawSprite(SPRITES.COIN, p.pos.x, p.pos.y, 30, 30, p.rot, COLORS.GOLD);
            }
        });
        
        // Render Hidden Enemies (Only visible with Lens)
        const alpha = this.lensActive ? 0.8 : 0.05;
        this.hiddenEnemies.forEach(h => {
             renderer.drawSprite(SPRITES.SNAKE_HEAD, h.pos.x, h.pos.y, 40, 40, 0, [0.5, 0.5, 1.0, alpha]);
        });
        
        // Render Anchor if Shov
        if(this.game.player.pos.y > this.game.height - 100) {
            renderer.drawSprite(SPRITES.ANCHOR, this.game.player.pos.x, this.game.player.pos.y + 40, 40, 40, 0, COLORS.BLUE);
        }
        
        // Render Crown if Keter (Essence)
        if(this.isEssenceMode) {
             renderer.drawSprite(SPRITES.CROWN, this.game.player.pos.x, this.game.player.pos.y - 50, 60, 40, 0, COLORS.WHITE);
        }
    }
}
