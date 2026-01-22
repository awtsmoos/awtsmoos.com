// B"H
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    takeDamage(amount) {
        if (!this.olam) return;

        // B"H: Calculate mitigation via clothes/defense
        const defense = this.calculateDefense ? this.calculateDefense() : (this.baseDefense || 0);
        const actualDamage = Math.max(1, amount - defense);

        this.hp -= actualDamage;

        // Visual Feedback (Floating Text)
        this.olam.ayshPeula("ui event", "effectsOverlay", { 
            text: `-${actualDamage}`, 
            color: "#ff0000",
            position: this.mesh.position // Pass position to worker/UI if possible in future
        });

        // Hurt Animation/Sound
        this.playSound("awtsmoos://dingSound", { volume: 0.5, pitch: 0.5 }); // Placeholder hurt sound
        
        if (this.hp <= 0) {
            this.die();
        }

        if (this.type === 'chossid') this.updateStatsUI();
    },

    die() {
        console.log(`B"H - ${this.name} has returned to the dust.`);
        if (this.type === 'chossid') {
            this.olam.ayshPeula("ui event", "effectsOverlay", { text: "OUCH! Respawning...", color: "red" });
            this.hp = this.maxHp;
            this.setPosition(new THREE.Vector3(0, 10, 0));
        } else {
            // Drop XP
            if (this.xpValue) {
                const player = this.olam.player;
                if (player) player.gainXp(this.xpValue);
            }
            this.olam.sealayk(this);
        }
    },

    gainXp(amount) {
        this.xp += amount;
        this.olam.ayshPeula("ui event", "effectsOverlay", { text: `+${amount} XP`, color: "#ffd700" });
        
        // Level Up Logic: 100 * level
        const nextLevelXp = this.level * 100;
        if (this.xp >= nextLevelXp) {
            this.xp -= nextLevelXp;
            this.levelUp();
        }
        this.updateStatsUI();
    },

    levelUp() {
        this.level++;
        this.maxHp += 10;
        this.maxKoach += 5;
        this.hp = this.maxHp;
        this.koach = this.maxKoach;
        
        this.playSound("awtsmoos://dingSound"); // Level up sound
        this.olam.ayshPeula("ui event", "effectsOverlay", { text: `LEVEL UP! (${this.level})`, color: "#00ff00" });
        
        if (this.spawnHebrewParticles) {
            this.spawnHebrewParticles(this.mesh.position, 50);
        }
    },

    calculateStatsFromGear() {
        let defense = 0;
        let power = 0;
        
        if (this.inventory && this.inventory.equipment) {
            Object.values(this.inventory.equipment).forEach(ref => {
                if (!ref) return;
                // Need to find actual item data. 
                // We'll trust that enrichItemData attached 'stats' to the item if available.
                // Since inventory is on main thread UI often, we need to access the slot data here in worker logic.
                let item = null;
                if (ref.sourceType === 'inventory') item = this.inventory.slots[ref.index];
                else if (ref.sourceType === 'action') item = this.inventory.actionSlots[ref.index];
                
                if (item && item.stats) {
                    if (item.stats.defense) defense += item.stats.defense;
                    if (item.stats.power) power += item.stats.power;
                }
            });
        }
        return { defense, power };
    },
    
    calculateDefense() {
        const gearStats = this.calculateStatsFromGear();
        return (this.baseDefense || 0) + gearStats.defense;
    },

    calculatePower() {
        const gearStats = this.calculateStatsFromGear();
        return (this.basePower || 10) + gearStats.power;
    },

    updateStatsUI() {
        if (this.olam) {
            this.olam.ayshPeula("ui event", "gameHUD", {
                updateStats: {
                    hp: this.hp,
                    maxHp: this.maxHp,
                    koach: this.koach,
                    maxKoach: this.maxKoach,
                    xp: this.xp,
                    level: this.level
                }
            });
        }
    },
    
    // Shoot functionality extended
    shootHebrewLetter() {
        if (this.koach < 5) {
             this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Not enough Koach!", color: "blue" });
             return;
        }
        this.koach -= 5;
        this.updateStatsUI();
        
        // Reuse projectiles.js logic but add damage payload
        const power = this.calculatePower();
        this.throwBall(this.olam.randomLetter(), { damage: power, isAttack: true });
    }
};
