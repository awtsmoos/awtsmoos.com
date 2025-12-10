//B"H
import { Vec2 } from '../math.js';
import { SPRITES, COLORS, SOUNDS } from '../constants.js';
import { Bullet } from '../entities/projectiles.js';
import { FloatingText, Particle } from '../entities/particles.js';
import { STANCE } from '../entities/player.js';

export class RedemptionManager {
    constructor(game) {
        this.game = game;
        this.moonPhase = 0;
        this.isFullMoon = false;
        this.rainActive = false;
        this.riverSplit = false;
        this.prisonActive = false;
        this.prisonHealth = 100;
        this.yechidaMode = false;
        this.tankActive = false;
    }

    update() {
        // 1. Solomon Moon Cycle
        this.moonPhase = (Date.now() / 1000) % 30; // 30 sec cycle
        this.isFullMoon = this.moonPhase > 14 && this.moonPhase < 16;
        
        if(this.isFullMoon) {
             // 2. Menucha (Auto Convert)
             this.game.enemies.forEach(e => {
                 if(e.active && Math.random() < 0.05) this.redeemEnemy(e);
             });
        }

        // 3. Stance Effects
        if(this.game.player.stance === STANCE.PEACE) {
            // Peace Field
            const range = 150 + this.game.player.allies.length * 10;
            this.game.enemies.forEach(e => {
                if(e.segments[0] && e.segments[0].pos.dist(this.game.player.pos) < range) {
                    // Slow down
                    e.speed *= 0.9;
                    // Charge redemption
                    if(!e.redemptionCharge) e.redemptionCharge = 0;
                    e.redemptionCharge += 1;
                    if(e.redemptionCharge > 60) this.redeemEnemy(e);
                }
            });
        }

        // 4. Rainmaker (Rashbi)
        if(this.rainActive) {
            this.game.enemies.forEach(e => e.speed *= 0.5);
            if(Math.random() < 0.2) {
                this.game.particles.push(new Particle(Math.random()*this.game.width, 0, COLORS.BLUE, 3));
            }
        }

        // 5. Prison (19 Kislev)
        if(this.prisonActive) {
            this.prisonHealth -= 0.5;
            if(this.prisonHealth <= 0) {
                this.prisonActive = false;
                this.game.spawnExplosion(this.game.player.pos.x, this.game.player.pos.y, COLORS.WHITE);
                this.game.enemies.forEach(e => this.redeemEnemy(e));
                this.game.texts.push(new FloatingText(this.game.player.pos.x, this.game.player.pos.y, "DIDAN NOTZACH!", COLORS.GOLD));
            }
        }
        
        // 6. Yechida Mode (Unity)
        if(Math.abs(this.game.player.tanyaBalance) < 5 && this.game.player.energy > 90) {
            if(!this.yechidaMode) {
                this.yechidaMode = true;
                this.game.texts.push(new FloatingText(this.game.width/2, this.game.height/2, "YECHIDA", COLORS.WHITE));
            }
        } else {
            this.yechidaMode = false;
        }
        
        if(this.yechidaMode) {
            this.game.timeScale = 0.5;
            this.game.player.energy = 100;
            this.game.enemies.forEach(e => {
                if(Math.random() < 0.1) this.redeemEnemy(e);
            });
        }
    }

    redeemEnemy(enemy) {
        if(!enemy.active) return;
        enemy.active = false;
        
        // 7. Rabim Hayu Imadi (Add to allies)
        if(this.game.player.allies.length < 50) {
            const ally = {
                pos: {x: enemy.segments[0].pos.x, y: enemy.segments[0].pos.y},
                type: SPRITES.CHASSID_ALLY
            };
            this.game.player.allies.push(ally);
        }
        
        // 8. Transformation Spark
        this.game.score += 500;
        for(let i=0; i<5; i++) {
             const p = new Particle(enemy.segments[0].pos.x, enemy.segments[0].pos.y, COLORS.GOLD, 5);
             p.vel = new Vec2((Math.random()-0.5)*5, (Math.random()-0.5)*5);
             this.game.particles.push(p);
        }
        this.game.audio.play(SOUNDS.REDEEM);
        this.game.texts.push(new FloatingText(enemy.segments[0].pos.x, enemy.segments[0].pos.y, "PIDYON", COLORS.GOLD));
    }
    
    activateMitzvahTank() {
        this.tankActive = true;
        this.game.player.radius = 40;
        setTimeout(() => {
            this.tankActive = false;
            this.game.player.radius = 20;
        }, 10000);
    }
    
    render(renderer) {
        // Render Allies
        this.game.player.allies.forEach(a => {
            renderer.drawSprite(SPRITES.PLAYER, a.pos.x, a.pos.y, 20, 20, 0, COLORS.GOLD);
        });
        
        // Render Prison
        if(this.prisonActive) {
            renderer.drawSprite(SPRITES.PRISON_CELL, this.game.player.pos.x, this.game.player.pos.y, 100, 100, 0, [1,1,1,0.5]);
        }
        
        // Render Peace Halo
        if(this.game.player.stance === STANCE.PEACE) {
            const range = 150 + this.game.player.allies.length * 10;
            renderer.drawSprite(SPRITES.CIRCLE, this.game.player.pos.x, this.game.player.pos.y, range*2, range*2, Date.now()*0.001, [1, 1, 1, 0.2]);
        }
        
        // Render Tank
        if(this.tankActive) {
             renderer.drawSprite(SPRITES.MITZVAH_TANK, this.game.player.pos.x, this.game.player.pos.y, 80, 80, 0, COLORS.YELLOW);
        }
    }
}
