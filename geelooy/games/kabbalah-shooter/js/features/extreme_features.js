//B"H

import { SPRITES, COLORS, SPELLS } from '../constants.js';
import { Vec2, lerp } from '../math.js';
import { Particle, FloatingText } from '../entities/particles.js';
import { Bullet } from '../entities/projectiles.js';

export class ExtremeFeatureManager {
    constructor(game) {
        this.game = game;
        this.activePlagues = [];
        this.mikvahPools = [];
        this.tefillinBindings = [];
        this.menorahAngles = [-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3];
        
        // Feature States
        this.shemaActive = false;
        this.shemaTimer = 0;
        this.azazelTarget = null;
        this.dreidelSpin = 0;
        this.isDreidelSpinning = false;
        this.eruvPoints = [];
        this.eruvActive = false;
        this.nerTamidUsed = false;
        this.moonPhase = 0; 
        this.fourCups = 0;
        this.challahKnots = 0;
        this.ushpizinDay = new Date().getDay(); 
        this.shabbatMode = false; // Kollel
        this.flagWave = 0;
        this.angels = [];
    }

    triggerPlague(name) {
        this.activePlagues.push({name, timer: 600});
        if(name === 'BLOOD') this.game.themeColor = COLORS.BLOOD;
    }
    
    triggerShema() {
        this.shemaActive = true;
        this.shemaTimer = 120; // 2 seconds of build up
        this.game.audio.play('shofar');
        this.game.shake = 5;
    }
    
    startDreidel() {
        if(this.isDreidelSpinning) return;
        this.isDreidelSpinning = true;
        this.dreidelSpin = 100;
        this.game.texts.push(new FloatingText(this.game.player.pos.x, this.game.player.pos.y, "GORAL!!!", COLORS.CYAN));
    }
    
    activateAzazel() {
        if(this.game.enemies.length > 0) {
            this.azazelTarget = this.game.enemies[0];
            this.game.texts.push(new FloatingText(this.azazelTarget.segments[0].pos.x, this.azazelTarget.segments[0].pos.y, "AZAZEL", COLORS.RED));
        }
    }
    
    spawnMikvah() {
        this.mikvahPools.push({
            pos: new Vec2(Math.random()*this.game.width, Math.random()*this.game.height),
            radius: 100, life: 600
        });
    }

    update() {
        // Moon Phase (Kiddush Levana)
        this.moonPhase = (Date.now() / 10000) % Math.PI * 2;
        
        // Shema Logic (Unity Nuke)
        if(this.shemaActive) {
            this.shemaTimer--;
            const center = new Vec2(this.game.width/2, this.game.height/2);
            this.game.enemies.forEach(e => {
                e.segments.forEach(s => {
                    const d = Vec2.sub(center, s.pos);
                    s.pos.add(d.mult(0.1)); // Suck in
                });
            });
            if(this.shemaTimer <= 0) {
                // EXPLODE
                this.game.enemies.forEach(e => e.active = false);
                this.game.spawnExplosion(center.x, center.y, COLORS.WHITE);
                this.game.score += 10000;
                this.shemaActive = false;
                this.game.aberration = 0;
                this.game.texts.push(new FloatingText(center.x, center.y, "ECHAD!", COLORS.WHITE));
            } else {
                this.game.aberration = (120 - this.shemaTimer) * 0.1;
            }
        }

        // Dreidel Spin
        if(this.isDreidelSpinning) {
            this.dreidelSpin *= 0.95;
            this.game.player.pos.x += Math.sin(this.dreidelSpin) * 10;
            // Fire chaos bullets
            if(this.game.frameCount % 3 === 0) {
                const angle = Math.random() * Math.PI * 2;
                const b = new Bullet(this.game.player.pos.x, this.game.player.pos.y, Math.cos(angle)*10, Math.sin(angle)*10, this.game.player.currentWeapon, false, SPRITES.BULLET);
                this.game.bullets.push(b);
            }
            if(this.dreidelSpin < 0.1) {
                this.isDreidelSpinning = false;
                // Random effect
                const r = Math.random();
                if(r < 0.25) { this.game.score += 5000; this.game.texts.push(new FloatingText(this.game.player.pos.x, this.game.player.pos.y, "GIMEL (ALL)", COLORS.GOLD)); }
                else if(r < 0.5) { this.game.texts.push(new FloatingText(this.game.player.pos.x, this.game.player.pos.y, "NUN (NOTHING)", COLORS.WHITE)); }
                else if(r < 0.75) { this.game.player.energy = 50; this.game.texts.push(new FloatingText(this.game.player.pos.x, this.game.player.pos.y, "HEY (HALF)", COLORS.CYAN)); }
                else { this.activePlagues.push({name:'FROGS', timer: 300}); this.game.texts.push(new FloatingText(this.game.player.pos.x, this.game.player.pos.y, "SHIN (BAD)", COLORS.RED)); }
            }
        }

        // Eruv Builder
        if(this.game.player.isDashing) {
            this.eruvPoints.push(new Vec2(this.game.player.pos.x, this.game.player.pos.y));
            if(this.eruvPoints.length > 50) this.eruvPoints.shift();
            // Check loop
            if(this.eruvPoints.length > 20 && this.eruvPoints[0].dist(this.eruvPoints[this.eruvPoints.length-1]) < 50) {
                this.eruvActive = true;
                // Kill inside
                const center = this.game.player.pos; // Approximate
                this.game.enemies.forEach(e => {
                    if(e.segments[0] && e.segments[0].pos.dist(center) < 200) e.active = false;
                });
                this.game.texts.push(new FloatingText(center.x, center.y, "ERUV UP", COLORS.GOLD));
                this.eruvPoints = [];
            }
        } else {
            if(this.game.frameCount % 5 === 0 && this.eruvPoints.length > 0) this.eruvPoints.shift();
        }

        // Havdalah Beam
        if(this.game.player.currentWeapon.name === 'HAVDALAH' && this.game.frameCount % 4 === 0) {
             const t = this.game.frameCount * 0.2;
             const colors = [COLORS.RED, COLORS.YELLOW, COLORS.ORANGE];
             for(let i=0; i<3; i++) {
                 const xOff = Math.sin(t + i*2) * 20;
                 const b = new Bullet(this.game.player.pos.x + xOff, this.game.player.pos.y, 0, -25, this.game.player.currentWeapon, true, SPRITES.BULLET);
                 // Need to tint bullet, Bullet class supports sprite but not dynamic tint per instance easily without update.
                 // We'll rely on global render, or ignore color for now.
                 this.game.bullets.push(b);
             }
        }

        // Update features
        this.activePlagues.forEach(p => p.timer--);
        this.activePlagues = this.activePlagues.filter(p => p.timer > 0);
        
        // Mikvah
        this.mikvahPools.forEach(m => {
            m.life--;
            if(this.game.player.pos.dist(m.pos) < m.radius) {
                this.game.player.adjustTanya(2);
                this.game.player.energy = Math.min(this.game.player.maxEnergy, this.game.player.energy+2);
            }
        });
        this.mikvahPools = this.mikvahPools.filter(m => m.life > 0);
        
        // Moshiach Flag Physics
        const speed = this.game.player.pos.dist(this.game.player.targetPos);
        this.flagWave += speed * 0.1;

        // Azazel Logic
        if(this.azazelTarget && !this.azazelTarget.active) this.azazelTarget = null;
    }

    render(renderer) {
        // Render Mikvah
        this.mikvahPools.forEach(m => renderer.drawSprite(SPRITES.MIKVAH_POOL, m.pos.x, m.pos.y, m.radius*2, m.radius*2, this.game.frameCount*0.01, COLORS.WATER));
        
        // Render Eruv
        this.eruvPoints.forEach(p => renderer.drawSprite(SPRITES.PARTICLE, p.x, p.y, 10, 10, 0, COLORS.WHITE));

        // Render Flag
        const fx = this.game.player.pos.x - 20;
        const fy = this.game.player.pos.y + 20;
        const wave = Math.sin(this.flagWave)*10;
        renderer.drawSprite(SPRITES.FLAG, fx + wave, fy, 40, 40, wave*0.05, COLORS.GOLD);
        
        // Render Ner Tamid
        if(!this.nerTamidUsed) {
            renderer.drawSprite(SPRITES.CANDLE, this.game.player.pos.x, this.game.player.pos.y - 40, 20, 40, 0, COLORS.ORANGE);
        }
        
        // Azazel Mark
        if(this.azazelTarget && this.azazelTarget.segments[0]) {
             renderer.drawSprite(SPRITES.CIRCLE, this.azazelTarget.segments[0].pos.x, this.azazelTarget.segments[0].pos.y, 60, 60, this.game.frameCount*0.1, COLORS.RED);
        }
        
        // Angels (Shalom Aleichem)
        this.angels.forEach(a => {
             renderer.drawSprite(SPRITES.ANGEL, a.x, a.y, 40, 40, 0, COLORS.WHITE);
        });
    }
}
