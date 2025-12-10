//B"H
import { Vec2 } from './math.js';
import { Player, STANCE } from './entities/player.js';
import { Bullet, Orbital } from './entities/projectiles.js';
import { Particle, FloatingText } from './entities/particles.js';
import { AudioSynth } from './audio.js';
import { CONFIG, COLORS, SPELLS, SOUNDS, WORLDS, SEFIROT, SPRITES } from './constants.js';
import { SpawnerSystem } from './systems/spawner.js';
import { CollisionSystem } from './systems/collision.js';
import { ExtremeFeatureManager } from './features/extreme_features.js';
import { RedemptionManager } from './features/redemption.js';
import { LuminosityManager } from './features/luminosity.js';
import { PasachEliyahuManager } from './features/pasach_eliyahu.js';
import { TachlitChochmahManager } from './features/tachlit_chochmah.js';

export class Game {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.CONFIG = CONFIG;
    this.audio = new AudioSynth();
    
    // Systems
    this.spawner = new SpawnerSystem(this);
    this.collider = new CollisionSystem(this);
    this.extremeManager = new ExtremeFeatureManager(this);
    this.redemptionManager = new RedemptionManager(this);
    this.luminosityManager = new LuminosityManager(this);
    this.pasachManager = new PasachEliyahuManager(this);
    this.tachlitManager = new TachlitChochmahManager(this);
    
    // State
    this.isPlaying = false;
    this.isPaused = false;
    
    const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
    let traitKey = 'SCHOLAR';
    if(saved) {
        try { const data = JSON.parse(saved); this.highScore = data; } catch(e){}
    }
    
    this.player = new Player(width/2, height-100, traitKey);
    this.bullets = [];
    this.enemyBullets = []; // NEW
    this.enemies = [];
    this.particles = [];
    this.powerups = [];
    this.texts = [];
    this.letters = [];
    this.stars = [];
    this.gravityWells = []; 
    this.orbitals = [];
    this.metatronShapes = [];
    
    this.shadowPos = new Vec2(width/2, height-100);
    this.shadowHistory = [];
    
    this.wave = 1;
    this.score = 0;
    this.highScore = this.highScore || 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.collectedLetters = [];
    this.timeScale = 1.0;
    this.touchCount = 0;
    this.frameCount = 0;
    this.worldLevel = WORLDS.ASSIYAH;
    this.themeColor = COLORS.CYAN;
    this.shake = 0;
    this.aberration = 0; 
    
    this.initStars();
    this.spawner.spawnWave();
    this.orbitals.push(new Orbital(this.player, 0));
  }
  
  initStars() {
      for(let i=0; i<150; i++) {
          this.stars.push({
              x: Math.random()*this.width, y: Math.random()*this.height,
              z: Math.random()*2 + 0.5
          });
      }
  }
  
  handleInput(count, x, y) {
      this.touchCount = count;
      if(count > 0) {
          this.player.targetPos.set(x, y - 50);
          if(this.player.isBitul) {
              this.player.isBitul = false;
              this.player.idleTimer = 0;
          }
          const now = Date.now();
          if(now - this.player.lastTapTime < 300) {
              if(this.player.tryDash()) {
                  this.audio.play(SOUNDS.DASH);
                  this.spawnExplosion(this.player.pos.x, this.player.pos.y, COLORS.CYAN);
              } else {
                  const mode = this.player.toggleStance();
                  this.texts.push(new FloatingText(this.player.pos.x, this.player.pos.y, mode, COLORS.WHITE));
              }
              this.extremeManager.startDreidel(); 
          } else {
              if(count === 4 && this.player.tryShofar()) {
                   this.audio.play(SOUNDS.SHOFAR);
                   this.texts.push(new FloatingText(this.player.pos.x, this.player.pos.y, "TEKIAH!!!", COLORS.GOLD));
              }
          }
          this.player.lastTapTime = now;
      }
  }

  update() {
    this.frameCount++;
    this.audio.playMusic(this.combo, this.timeScale);
    
    // Feature Updates
    this.extremeManager.update();
    this.redemptionManager.update();
    this.luminosityManager.update();
    this.pasachManager.update();
    this.tachlitManager.update();
    
    if(this.extremeManager.shabbatMode) {
        this.timeScale = 0; 
    } else {
        let targetTimeScale = 1.0;
        if(this.touchCount >= 3) {
            targetTimeScale = CONFIG.TIME_DILATION_FACTOR;
            if(this.frameCount % 10 === 0) this.audio.play(SOUNDS.TIME_SLOW);
        }
        this.timeScale += (targetTimeScale - this.timeScale) * 0.1;
    }
    
    if(this.shake > 0) this.shake *= 0.9;
    if(this.aberration > 0) this.aberration *= 0.9;
    
    if(this.combo > 0) {
        let decay = 1;
        if(this.player.stats[SEFIROT.YESOD] > 0) decay = 0.5;
        this.comboTimer -= decay * this.timeScale;
        if(this.comboTimer <= 0) this.combo = 0;
    }
    
    const isShmita = this.wave % 7 === 0;
    const isShooting = this.touchCount > 0 && !this.player.isBitul && !isShmita && !this.extremeManager.isDreidelSpinning;
    this.player.update(this.height, this.worldLevel, isShooting);
    this.orbitals.forEach(o => o.update(this.frameCount));
    
    this.shadowHistory.push(new Vec2(this.player.pos.x, this.player.pos.y));
    if(this.shadowHistory.length > 30) {
        const p = this.shadowHistory.shift();
        this.shadowPos.x += (p.x - this.shadowPos.x) * 0.1 * this.timeScale;
        this.shadowPos.y += (p.y - this.shadowPos.y) * 0.1 * this.timeScale;
    }

    if(isShooting && this.player.stance === STANCE.WAR) {
        let netzach = this.player.stats[SEFIROT.NETZACH];
        if(this.player.tanyaBalance < -20) netzach *= 1.5; 
        const rate = Math.max(1, Math.floor(CONFIG.FIRE_RATE_DEFAULT / (netzach * (this.timeScale < 1 ? 2 : 1))));
        if(this.frameCount % rate === 0) {
            this.fireBullet();
            this.orbitals.forEach(o => this.fireBullet(o.pos));
        }
    }
    
    this.updateEntities();

    if(this.enemies.length === 0 && this.metatronShapes.length === 0) this.spawner.spawnWave();
    
    // Spawn Wellspring occasionally
    if(this.frameCount % 1000 === 0) this.luminosityManager.spawnWellspring();
    if(this.frameCount % 800 === 0) this.pasachManager.spawnMatbea();

    this.collider.update();
  }

  updateEntities() {
    if(this.player.isBitul) {
        if(this.frameCount % 10 === 0) {
            this.spawnImplosion(this.player.pos.x, this.player.pos.y, COLORS.WHITE);
            this.audio.play(SOUNDS.BITUL);
        }
        const range = this.player.stats[SEFIROT.HOD];
        this.letters.forEach(l => {
             const d = Vec2.sub(this.player.pos, l.pos);
             if(d.mag() < range) l.pos.add(d.normalize().mult(5 * this.timeScale));
        });
    }

    this.gravityWells.forEach(w => {
        w.update();
        this.enemies.forEach(e => {
            e.segments.forEach(s => {
                const d = Vec2.sub(w.pos, s.pos);
                if(d.mag() < w.radius * 2) s.pos.add(d.normalize().mult(CONFIG.GRAVITY_WELL_FORCE * this.timeScale));
            });
        });
    });
    this.gravityWells = this.gravityWells.filter(w => w.active);

    this.bullets = this.bullets.filter(b => { 
        const oldVel = b.vel.copy(b.vel);
        b.vel.mult(this.timeScale);
        const xBefore = b.pos.x;
        b.update(); 
        if(Math.abs(b.pos.x - xBefore) > 100 && b.wrapCount < CONFIG.UFARATZTA_LIMIT) {
             const clone = new Bullet(b.pos.x, b.pos.y, -b.vel.x, b.vel.y, b.weapon, b.isBeam, b.sprite);
             clone.wrapCount = b.wrapCount;
             this.bullets.push(clone);
        }
        b.vel = oldVel;
        return b.active; 
    });
    
    this.enemyBullets = this.enemyBullets.filter(b => {
        b.update();
        return b.active;
    });

    this.enemies = this.enemies.filter(e => { 
        const oldSpeed = e.speed ? e.speed : 0;
        if(e.speed) e.speed *= this.timeScale;
        e.update(this.height, this); 
        if(e.speed) e.speed = oldSpeed;
        return e.active; 
    });
    
    this.metatronShapes.forEach(m => m.update());
    this.metatronShapes = this.metatronShapes.filter(m => m.active);
    this.particles = this.particles.filter(p => { p.update(); return p.life > 0; });
    this.powerups = this.powerups.filter(p => { 
        if(p.update) p.update(); 
        else { p.pos.y += 2; if(p.pos.y > 2000) p.active = false; }
        return p.active; 
    });
    this.texts = this.texts.filter(t => { t.update(); return t.life > 0; });
    this.letters = this.letters.filter(l => { l.update(); return l.active; });

    const worldSpeed = (this.worldLevel + 1) * 1.5 * this.timeScale;
    this.stars.forEach(s => {
        s.y += s.z * (1 + (this.combo * 0.1)) * worldSpeed * 0.5; 
        if(s.y > this.height) { s.y = -10; s.x = Math.random()*this.width; }
    });
  }

  fireBullet(origin=null) {
      if(this.player.energy <= 0) return;
      if(this.player.currentWeapon.name === 'MENORAH' || this.player.currentWeapon.name === 'HAVDALAH') return;

      const pos = origin || this.player.pos;
      const spreadLevel = this.player.stats[SEFIROT.CHESED];
      const weapon = this.player.currentWeapon;
      const sprite = this.player.getBulletSprite();
      
      const b = new Bullet(pos.x, pos.y - 20, 0, -weapon.speed, weapon, false, sprite);
      
      // Ben vs Eved Aiming
      if(this.tachlitManager.isYechida) {
          // Yechida: Homing + High Damage
          let closest = this.getClosestEnemy(pos);
          if(closest) b.homingTarget = closest;
          b.weapon.damage *= 2; 
      } else if (this.tachlitManager.benLevel < 0.3) {
           // Eved: Strong Homing, Weak Damage
           let closest = this.getClosestEnemy(pos);
           if(closest) b.homingTarget = closest;
           b.weapon.damage *= 0.5;
      }
      
      this.bullets.push(b);
      for(let i=1; i<spreadLevel; i++) {
          let angle = i * (0.1 + weapon.spread * 0.2);
          let vx = Math.sin(angle) * weapon.speed;
          let vy = -Math.cos(angle) * weapon.speed;
          this.bullets.push(new Bullet(pos.x, pos.y - 20, vx, vy, weapon, false, sprite));
          this.bullets.push(new Bullet(pos.x, pos.y - 20, -vx, vy, weapon, false, sprite));
      }
      this.audio.play(SOUNDS.SHOOT);
  }
  
  getClosestEnemy(pos) {
      let closest = null, minDist = 9999;
      this.enemies.forEach(e => {
         if(e.segments[0]) {
             const d = e.segments[0].pos.dist(pos);
             if(d < minDist) { minDist = d; closest = e; }
         }
      });
      return closest;
  }

  checkSpell() {
      const word = this.collectedLetters.join('');
      const hud = document.getElementById('spell-hud');
      hud.innerText = word;

      if(SPELLS[word]) {
          const spell = SPELLS[word];
          this.castSpell(spell);
          this.collectedLetters = [];
          hud.innerText = "";
      } else if (this.collectedLetters.length >= 3) {
          this.collectedLetters.shift(); 
          hud.innerText = this.collectedLetters.join('');
      }
  }

  castSpell(spell) {
      this.texts.push(new FloatingText(this.width/2, this.height/3, spell.name, "gold"));
      this.audio.play(SOUNDS.SPELL);
      this.shake = 20;
      this.aberration = 3.0;
      
      if(spell.effect === 'PLAGUE_BLOOD') this.extremeManager.triggerPlague('BLOOD');
      else if(spell.effect === 'REGEN') this.extremeManager.spawnMikvah();
      else if(spell.effect === 'UNITY_NUKE') this.extremeManager.triggerShema();
      else if(spell.effect === 'AZAZEL') this.extremeManager.activateAzazel();
      else if(spell.effect === 'REDEMPTION') { 
          this.audio.play(SOUNDS.REDEEM);
          this.enemies.forEach(e => this.redemptionManager.redeemEnemy(e));
      }
      else if(spell.effect === 'BLAST') {
          this.enemies.forEach(e => e.segments.forEach(s => {
              s.hp -= 500;
              this.spawnExplosion(s.pos.x, s.pos.y, spell.color);
          }));
      }
  }

  spawnExplosion(x, y, color) {
      for(let i=0; i<10; i++) this.particles.push(new Particle(x, y, color, 5 + Math.random()*10));
  }
  
  spawnImplosion(x, y, color) {
      for(let i=0; i<8; i++) {
          const p = new Particle(x + (Math.random()-0.5)*100, y + (Math.random()-0.5)*100, color, 4);
          p.vel = Vec2.sub(new Vec2(x,y), p.pos).mult(0.1); 
          this.particles.push(p);
      }
  }
}
