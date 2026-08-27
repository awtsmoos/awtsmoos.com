//B"H
import { circleIntersect, Vec2 } from '../math.js';
import { SEFIROT, COLORS, SOUNDS, SPRITES, CONFIG } from '../constants.js';
import { Particle } from '../entities/particles.js';
import { LetterDrop, PowerUp } from '../entities/pickups.js';

export class CollisionSystem {
    constructor(game) {
        this.game = game;
    }

    update() {
        const player = this.game.player;
        
        // 1. Shofar Blast (AOE)
        if (player.shofarActive) {
            const range = 250;
            this.game.enemies.forEach(e => {
                e.segments.forEach(s => {
                   if(s.pos.dist(player.pos) < range) {
                       s.hp -= 5;
                       s.flash = 5;
                   }
                });
            });
            this.game.enemyBullets.forEach(b => {
                if(b.pos.dist(player.pos) < range) {
                    b.active = false;
                    this.game.particles.push(new Particle(b.pos.x, b.pos.y, COLORS.WHITE, 3));
                }
            });
        }

        // 2. Player Bullets vs Enemies
        this.game.bullets.forEach(b => {
            if (!b.active) return;
            
            for (const enemy of this.game.enemies) {
                if (!enemy.active) continue;
                for (const seg of enemy.segments) {
                    const hitDist = seg.radius + b.radius;
                    if (Math.abs(b.pos.x - seg.pos.x) < hitDist && Math.abs(b.pos.y - seg.pos.y) < hitDist) { // AABB Optimization
                        if(b.pos.dist(seg.pos) < hitDist) {
                            this.handleHit(b, enemy, seg);
                            if (!b.isBeam) {
                                b.active = false;
                            }
                            break; 
                        }
                    }
                }
                if (!b.active && !b.isBeam) break;
            }
            
            // Metatron
            for (const m of this.game.metatronShapes) {
                 if(b.pos.dist(m.pos) < 60) {
                     m.hp -= b.weapon.damage * 10;
                     if(!b.isBeam) b.active = false;
                     if(m.hp <= 0) {
                         m.active = false;
                         this.game.spawnExplosion(m.pos.x, m.pos.y, COLORS.CYAN);
                         this.game.score += 500;
                     }
                 }
            }
        });

        // 3. Enemy Bullets vs Player
        if (player.stance === 'GEVURAH' && !player.isBitul && !player.isDashing) {
            this.game.enemyBullets.forEach(b => {
                if(b.active && b.pos.dist(player.pos) < player.radius + b.radius) {
                    if(player.shieldActive) {
                        b.active = false;
                        player.shieldActive = false;
                        this.game.audio.play(SOUNDS.HIT);
                    } else {
                        b.active = false;
                        this.damagePlayer(10);
                    }
                }
            });
        }

        // 4. Player vs Enemies (Crash)
        if (!player.isBitul && !player.isDashing) {
            for (const enemy of this.game.enemies) {
                for (const seg of enemy.segments) {
                    if (player.pos.dist(seg.pos) < player.radius + seg.radius) {
                        this.damagePlayer(20);
                        this.game.shake = 10;
                    }
                }
            }
        }
        
        // 5. Pickups
        this.game.powerups.forEach(p => {
            if(p.active && player.pos.dist(p.pos) < player.radius + p.radius + 20) {
                p.active = false;
                this.handlePickup(p);
            }
        });
        
        this.game.letters.forEach(l => {
            if(l.active && player.pos.dist(l.pos) < player.radius + l.radius + 20) {
                l.active = false;
                this.game.collectedLetters.push(l.char);
                if(this.game.collectedLetters.length > 5) this.game.collectedLetters.shift();
                this.game.checkSpell();
                this.game.audio.play(SOUNDS.NOTE);
            }
        });
    }

    handleHit(bullet, enemy, seg) {
        let dmg = bullet.weapon.damage * 10;
        
        // Sefirot Multipliers
        dmg *= (1 + this.game.player.stats[SEFIROT.GEVURAH] * 0.1);
        
        // Tachlit Chochmah Logic (101 Hits)
        if(this.game.tachlitManager) {
            dmg *= this.game.tachlitManager.registerHit(enemy);
        }
        
        seg.hp -= dmg;
        seg.flash = 5;
        this.game.audio.play(SOUNDS.HIT);
        
        // Spawn particles
        if(Math.random() > 0.5) this.game.particles.push(new Particle(seg.pos.x, seg.pos.y, COLORS.WHITE, 3));
        
        if (seg.hp <= 0) {
            // Drop logic
            if(seg.letter) {
                 this.game.letters.push(new LetterDrop(seg.pos.x, seg.pos.y, seg.letter));
            } else if (Math.random() < 0.05) {
                this.game.powerups.push(new PowerUp(seg.pos.x, seg.pos.y, 'COIN'));
            }

            // Head death kills whole enemy
            if(enemy.segments.indexOf(seg) === 0) {
                 enemy.active = false; 
                 this.game.score += 100 * this.game.wave;
                 this.game.combo++;
                 this.game.comboTimer = 100;
                 this.game.spawnExplosion(seg.pos.x, seg.pos.y, COLORS.RED);
                 this.game.audio.play(SOUNDS.EXPLOSION);
            } else {
                const idx = enemy.segments.indexOf(seg);
                if(idx > -1) enemy.segments.splice(idx, 1);
            }
        }
    }
    
    damagePlayer(amount) {
        this.game.player.energy = Math.max(0, this.game.player.energy - amount);
        this.game.shake = 15;
        this.game.aberration = 0.5;
        this.game.audio.play(SOUNDS.HIT);
        this.game.player.levelUpSefira(SEFIROT.GEVURAH);
    }
    
    handlePickup(p) {
        this.game.audio.play(SOUNDS.POWERUP);
        if(p.type === 'COIN') {
            this.game.score += 100;
        } else if (p.type === 'RAPID') {
            this.game.player.stats[SEFIROT.NETZACH] += 2;
        } else if (p.type === 'SHIELD') {
            this.game.player.activateShield();
        }
    }
}