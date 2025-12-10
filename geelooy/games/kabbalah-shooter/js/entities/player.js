//B"H
import { Vec2 } from '../math.js';
import { CONFIG, SEFIROT, WEAPONS, TRAITS, SPRITES, HEBREW_LETTERS } from '../constants.js';

export const STANCE = {
    WAR: 'GEVURAH',
    PEACE: 'CHESED'
};

export class Player {
  constructor(x, y, traitKey='SCHOLAR') {
    this.pos = new Vec2(x, y);
    this.targetPos = new Vec2(x, y);
    this.vel = new Vec2(0,0);
    this.radius = 20;
    this.shieldActive = false;
    this.shieldOrbs = [];
    
    this.stance = STANCE.WAR; 
    this.allies = []; // Rabim Hayu Imadi
    this.garments = 3; // Levushim (Thought/Speech/Action)
    
    // Trait (Gilgul/Reincarnation)
    this.trait = TRAITS[traitKey] || TRAITS.SCHOLAR;
    
    // Stats (Sefirot)
    this.stats = {
        [SEFIROT.KETER]: 0, 
        [SEFIROT.CHACHMAH]: 1, 
        [SEFIROT.BINAH]: 0, 
        [SEFIROT.DAAT]: 0, 
        [SEFIROT.CHESED]: 1, 
        [SEFIROT.GEVURAH]: 1, 
        [SEFIROT.TIFERET]: 0, 
        [SEFIROT.NETZACH]: 1, 
        [SEFIROT.HOD]: 200, 
        [SEFIROT.YESOD]: 0, 
        [SEFIROT.MALCHUT]: 0 
    };
    
    this.tanyaBalance = 0;
    
    if(this.trait.stat) this.stats[this.trait.stat] += 1;

    this.currentWeapon = WEAPONS.YOD;

    // Logic
    this.dashCooldown = 0;
    this.shofarCooldown = 0;
    this.shofarActive = false;
    this.lastTapTime = 0;
    this.isDashing = false;
    this.idleTimer = 0;
    this.isBitul = false;
    this.energy = CONFIG.MAX_ENERGY;
    this.maxEnergy = CONFIG.MAX_ENERGY;
    this.trail = [];
    
    this.bitachonTimer = 0;
    this.bitachonLevel = 0;
  }

  toggleStance() {
      this.stance = this.stance === STANCE.WAR ? STANCE.PEACE : STANCE.WAR;
      return this.stance;
  }

  levelUpSefira(sefira) {
      this.stats[sefira]++;
      if(sefira === SEFIROT.DAAT) {
          if(this.stats[SEFIROT.DAAT] >= 2) this.currentWeapon = WEAPONS.HEY;
          if(this.stats[SEFIROT.DAAT] >= 4) this.currentWeapon = WEAPONS.VAV;
      }
  }
  
  adjustTanya(amount) {
      this.tanyaBalance = Math.max(-50, Math.min(50, this.tanyaBalance + amount));
  }

  getBulletSprite() {
      const idx = HEBREW_LETTERS.indexOf(this.currentWeapon.char);
      if(idx > -1) return SPRITES.LETTER_ALEPH + idx;
      return SPRITES.BULLET;
  }

  activateShield() {
    this.shieldActive = true;
    this.shieldOrbs = [];
    let count = 10 + this.stats[SEFIROT.TIFERET] * 2;
    for(let i=0; i<count; i++) {
        this.shieldOrbs.push({angle: (i/count)*Math.PI*2, active: true});
    }
  }

  tryDash() {
      if(this.dashCooldown <= 0 && !this.isBitul && this.energy > 20) {
          this.isDashing = true;
          this.dashCooldown = CONFIG.DASH_COOLDOWN;
          this.energy -= 20;
          this.levelUpSefira(SEFIROT.HOD); 
          this.adjustTanya(-2);
          return true;
      }
      return false;
  }
  
  tryShofar() {
      if(this.shofarCooldown <= 0) {
          this.shofarActive = true;
          this.shofarCooldown = CONFIG.SHOFAR_COOLDOWN;
          this.adjustTanya(10); 
          return true;
      }
      return false;
  }

  update(height, worldLevel, isShooting) {
    if(this.stance === STANCE.PEACE) isShooting = false;

    if(!isShooting) {
        this.bitachonTimer++;
        if(this.bitachonTimer > CONFIG.BITACHON_CHARGE_TIME) {
            this.bitachonLevel = Math.min(1.0, this.bitachonLevel + 0.01);
            this.adjustTanya(0.05); 
        }
    } else {
        this.bitachonTimer = 0;
        this.bitachonLevel = Math.max(0, this.bitachonLevel - 0.05);
        this.adjustTanya(-0.02); 
    }

    const dist = this.pos.dist(this.targetPos);
    if(dist < 5 && !this.isDashing) {
        this.idleTimer++;
        if(this.idleTimer > CONFIG.BITUL_CHARGE_TIME) {
            this.isBitul = true;
            this.energy = Math.min(this.energy + 0.5, this.maxEnergy); 
        }
    } else {
        this.idleTimer = 0;
        this.isBitul = false;
    }

    let speed = CONFIG.PLAYER_SPEED;
    if(worldLevel === 1 || worldLevel === 4) speed *= 0.5;
    else if (worldLevel === 2) speed *= 1.5;
    
    if(this.tanyaBalance < -25) speed *= 1.2;

    if (this.isDashing) {
        speed = 0.5; 
        if (this.dashCooldown < CONFIG.DASH_COOLDOWN - 10) this.isDashing = false;
    }

    // Ratzo V'Shov
    const screenPercent = this.pos.y / height;
    if(screenPercent < 0.4) {
        this.energy = Math.max(0, this.energy - CONFIG.RATZO_DRAIN);
    } else if (screenPercent > 0.6) {
        this.energy = Math.min(this.maxEnergy, this.energy + CONFIG.SHOV_REGEN);
    }

    const d = Vec2.sub(this.targetPos, this.pos);
    
    if(worldLevel === 1 || worldLevel === 4) {
        this.vel.add(d.normalize().mult(speed * 0.1));
        this.vel.mult(0.95); 
        this.pos.add(this.vel);
    } else {
        this.pos.add(d.mult(speed));
    }
    
    if(this.isDashing || dist > 5) {
        this.trail.push({x: this.pos.x, y: this.pos.y, life: 1.0});
        if(this.trail.length > CONFIG.RESHIMU_LENGTH) this.trail.shift();
    }
    this.trail.forEach(t => t.life -= 0.05);
    this.trail = this.trail.filter(t => t.life > 0);

    if (this.dashCooldown > 0) this.dashCooldown--;
    if (this.shofarCooldown > 0) this.shofarCooldown--;
    if (this.shofarActive && this.shofarCooldown < CONFIG.SHOFAR_COOLDOWN - CONFIG.SHOFAR_DURATION) this.shofarActive = false;

    if (this.shieldActive) {
        this.shieldOrbs.forEach(o => o.angle += 0.05);
        this.shieldOrbs = this.shieldOrbs.filter(o => o.active);
        if (this.shieldOrbs.length === 0) this.shieldActive = false;
    }
    
    // Allies (Rabim Hayu Imadi)
    this.allies.forEach((a, i) => {
        const offset = (i / this.allies.length) * Math.PI * 2 + (Date.now() * 0.002);
        const rad = 60 + this.allies.length * 2;
        a.targetPos = {
            x: this.pos.x + Math.cos(offset) * rad,
            y: this.pos.y + Math.sin(offset) * rad
        };
        a.pos.x += (a.targetPos.x - a.pos.x) * 0.1;
        a.pos.y += (a.targetPos.y - a.pos.y) * 0.1;
    });
  }

  getShieldOrbs() {
      return this.shieldOrbs.map(o => ({
          x: this.pos.x + Math.cos(o.angle) * 60,
          y: this.pos.y + Math.sin(o.angle) * 60,
          radius: 10,
          ref: o
      }));
  }
}
