//B"H
import { SPRITES, COLORS, SOUNDS } from '../constants.js';
import { Vec2 } from '../math.js';
import { FloatingText, Particle } from '../entities/particles.js';
import { Bullet } from '../entities/projectiles.js';

export class TachlitChochmahManager {
    constructor(game) {
        this.game = game;
        
        // State
        this.benLevel = 0.5; // 0 = Eved (Servant), 1 = Ben (Son)
        this.isYechida = false;
        
        this.reutaCharge = 0;
        this.reutaActive = false;
        
        this.katontiScale = 1.0;
        
        this.maasimTovimEnemies = [];
        this.hitCounts = new Map(); // For 101 hits mechanic
        
        this.messengers = [];
    }

    update() {
        const player = this.game.player;
        
        // 1. Katonti (Humility) - Shrink based on score
        const targetScale = Math.max(0.5, 1.0 - (this.game.score / 50000));
        this.katontiScale += (targetScale - this.katontiScale) * 0.01;
        player.radius = 20 * this.katontiScale; // Adjust hitbox

        // 2. Ben vs Eved Dynamic
        // Shooting manually pushes towards Ben (Intellect/Control)
        // Using Auto-aim (Orbitals) or Shield pushes towards Eved (Nullification)
        if(this.game.touchCount > 0 && !player.isBitul) {
             this.benLevel = Math.min(1.0, this.benLevel + 0.001);
        } else if (player.shieldActive || player.isBitul) {
             this.benLevel = Math.max(0.0, this.benLevel - 0.002);
        }
        
        // 3. Yechida Mode (Essence)
        // Triggered when perfectly balanced
        if(Math.abs(this.benLevel - 0.5) < 0.1 && player.energy > 80) {
            if(!this.isYechida) {
                this.isYechida = true;
                this.game.texts.push(new FloatingText(player.pos.x, player.pos.y - 50, "YECHIDA MODE", COLORS.WHITE));
                this.game.audio.play(SOUNDS.ASCEND);
            }
        } else {
            this.isYechida = false;
        }
        
        // 4. Reuta D'Libba (Heart's Desire) - Hold to charge
        if(this.game.touchCount > 0 && !this.game.player.shofarActive) {
            this.reutaCharge++;
            if(this.reutaCharge > 120 && !this.reutaActive) {
                this.reutaActive = true;
                this.game.texts.push(new FloatingText(player.pos.x, player.pos.y, "HEART READY", COLORS.RED));
            }
        } else {
            if(this.reutaActive) {
                this.fireHeartBlast();
                this.reutaActive = false;
            }
            this.reutaCharge = 0;
        }

        // 5. Maasim Tovim Enemies
        if(this.game.frameCount % 500 === 0 && Math.random() < 0.5) {
            this.maasimTovimEnemies.push({
                pos: new Vec2(Math.random()*this.game.width, -50),
                vel: new Vec2(0, 1.5),
                active: true
            });
        }
        
        this.maasimTovimEnemies.forEach(e => {
            e.pos.add(e.vel);
            if(e.pos.y > this.game.height + 50) e.active = false;
            
            if(e.pos.dist(player.pos) < 50) {
                e.active = false;
                this.game.score += 1000;
                this.game.player.adjustTanya(5);
                this.game.texts.push(new FloatingText(player.pos.x, player.pos.y, "MITZVAH!", COLORS.GOLD));
                this.game.audio.play(SOUNDS.POWERUP);
            }
            
            this.game.bullets.forEach(b => {
                if(b.active && b.pos.dist(e.pos) < 30) {
                    b.active = false;
                    e.active = false;
                    this.game.score = Math.max(0, this.game.score - 500);
                    this.game.texts.push(new FloatingText(e.pos.x, e.pos.y, "OY VEY!", COLORS.RED));
                    this.game.audio.play(SOUNDS.HIT);
                }
            });
        });
        this.maasimTovimEnemies = this.maasimTovimEnemies.filter(e => e.active);
        
        // 6. Messengers
        this.messengers.forEach(m => {
            m.pos.add(m.vel);
            if(m.life > 0) m.life--;
            else m.active = false;
        });
        this.messengers = this.messengers.filter(m => m.active);
    }
    
    fireHeartBlast() {
        const p = this.game.player;
        const b = new Bullet(p.pos.x, p.pos.y, 0, -20, p.currentWeapon, false, SPRITES.HEART_FLAME);
        b.radius = 40;
        b.weapon = { ...b.weapon, damage: 50 }; 
        this.game.bullets.push(b);
        this.game.audio.play(SOUNDS.SPELL);
    }
    
    sendMessenger() {
        this.messengers.push({
            pos: new Vec2(this.game.player.pos.x, this.game.player.pos.y),
            vel: new Vec2(0, -10),
            active: true,
            life: 100
        });
    }

    registerHit(enemy) {
        if(!this.hitCounts.has(enemy)) this.hitCounts.set(enemy, 0);
        const count = this.hitCounts.get(enemy) + 1;
        this.hitCounts.set(enemy, count);
        
        if(count === 101) {
             this.game.texts.push(new FloatingText(enemy.segments[0].pos.x, enemy.segments[0].pos.y, "101!", COLORS.CYAN));
             return 1000;
        }
        return 1;
    }
    
    render(renderer) {
        this.maasimTovimEnemies.forEach(e => {
            renderer.drawSprite(SPRITES.HAND_DEED, e.pos.x, e.pos.y, 40, 40, Math.sin(this.game.frameCount*0.1)*0.2, COLORS.GOLD);
        });
        
        this.messengers.forEach(m => {
            renderer.drawSprite(SPRITES.MESSENGER_ANGEL, m.pos.x, m.pos.y, 30, 30, 0, COLORS.CYAN);
        });

        // REUTA CHARGE VISUAL
        if(this.reutaCharge > 0) {
            const p = this.game.player.pos;
            const pct = Math.min(1.0, this.reutaCharge / 120);
            
            // Outer Ring Growing
            const r = 30 + (pct * 20);
            const alpha = 0.2 + (pct * 0.6);
            renderer.drawSprite(SPRITES.CIRCLE, p.x, p.y, r*2, r*2, -this.game.frameCount*0.2, [1, 0.2, 0.2, alpha]);
            
            if(this.reutaActive) {
                // Pulse when ready
                const pulse = 1.0 + Math.sin(this.game.frameCount * 0.5) * 0.1;
                renderer.drawSprite(SPRITES.HEART_FLAME, p.x, p.y, 40*pulse, 40*pulse, 0, [1, 0, 0, 0.8]);
            }
        }
    }
}