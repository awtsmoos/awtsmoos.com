// B"H
/**
 * @module combat
 * @description THE TEFILLAH OF WAR
 * "My sword and my bow" — Krias Shema and Shmoneh Esray.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { TORAH_PASSAGES } from '../../../tochen/skills/TorahPassages.js';
import SpiritualWeaponManifestor from '../../../tochen/combat/SpiritualWeaponManifestor.js';

export default {
    learnedSkills: ["shema_yisrael", "shmoneh_esray"], // Spiritual arsenal

    learnSkill(skillId) {
        const skill = TORAH_PASSAGES[skillId];
        if (!skill) return;
        
        if (this.level < skill.levelRequired) {
            this.olam.ayshPeula("ui event", "effectsOverlay", { text: `Level ${skill.levelRequired} required!`, color: "red" });
            return;
        }

        if (!this.learnedSkills.includes(skillId)) {
            this.learnedSkills.push(skillId);
            this.olam.ayshPeula("ui event", "effectsOverlay", { text: `Learned: ${skill.name}!`, color: "#00ff00" });
            this.updateSkillsUI();
        }
    },

    castSkill(skillId) {
        const skill = TORAH_PASSAGES[skillId];
        if (!skill || !this.learnedSkills.includes(skillId)) return;

        if (this.koach < skill.cost) {
            this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Low Koach!", color: "blue" });
            return;
        }

        // B"H: Knowledge of the passage in the inventory is enough!
        if (skill.bookRequired && !this.hasItemInAnyPocket(skill.bookRequired)) {
            this.olam.ayshPeula("ui event", "effectsOverlay", { text: `Requires ${skill.bookRequired} in pocket!`, color: "orange" });
            return;
        }

        this.koach -= skill.cost;
        this.updateStatsUI();

        let visualData = null;
        if (skill.weaponAffinity) {
            visualData = SpiritualWeaponManifestor.compileVisuals(skill.weaponAffinity, skill.color);
        }

        const basePower = this.calculatePower();
        let bonusDamage = skill.damage || 0;

        // B"H: Payload of light for the projectile
        const payload = {
            damage: basePower + bonusDamage,
            isAttack: true,
            color: skill.color,
            aoe: skill.aoe,
            element: skill.element,
            weaponType: skill.weaponAffinity,
            rangeType: skill.rangeType,
            visuals: visualData,
            doubleEdged: skill.doubleEdged
        };

        this.throwBall(this.olam.randomLetter(), payload);
        this.olam.ayshPeula("ui event", "effectsOverlay", { text: skill.name.toUpperCase(), color: skill.color });
    },

    hasItemInAnyPocket(itemId) {
        if (!this.inventory) return false;
        const allSlots = [...(this.inventory.slots || []), ...Object.values(this.inventory.equipment || {})];
        return allSlots.some(item => {
            if (!item) return false;
            // Handle both raw item objects and references
            const actualId = item.id || (item.index !== undefined ? (item.sourceType === 'inventory' ? (this.inventory.slots[item.index]?.id) : (this.inventory.actionSlots[item.index]?.id)) : null);
            return actualId === itemId;
        });
    },

    applyDamage(target, payload) {
        let multiplier = 1;
        const dist = this.mesh.position.distanceTo(target.position);

        // B"H: Range-based spiritual mechanics
        if (payload.weaponType === "sword") {
            if (dist < 10) multiplier = 2.5; // Sword is for the close enemy
            if (payload.doubleEdged) {
                // Double-edged sword hits hard but drains a bit of hp from the user?
                // Or maybe it just hits multiple targets. For now: bonus damage.
                multiplier *= 1.2;
            }
        } else if (payload.weaponType === "bow") {
            if (dist > 30) multiplier = 3.0; // Bow is for the far enemy
        }

        if (payload.element && target.elementalType === payload.element) {
            multiplier *= 2;
        }
        
        const finalDamage = payload.damage * multiplier;
        if (target.takeDamage) target.takeDamage(finalDamage);
    },

    gainXp(amount) {
        this.xp += amount;
        if (this.xp >= this.maxXp) {
            this.levelUp();
        }
        this.updateStatsUI();
    },

    levelUp() {
        this.level++;
        this.xp = 0;
        this.maxXp = Math.floor(this.maxXp * 1.5);
        this.maxHp += 20;
        this.hp = this.maxHp;
        this.maxKoach += 15;
        this.koach = this.maxKoach;
        this.olam.ayshPeula("ui event", "effectsOverlay", { text: "LEVEL UP!", color: "#ffd700" });
    },

    die() {
        if (this.isDead) return;
        this.isDead = true;
        // B"H: silent

        
        if (this.type === "mazik") {
            this.spawnHebrewParticles(this.mesh.position, 30, this.color || "#ff0000");
            if (this.xpValue) {
                const player = this.olam.player || this.olam.chossid;
                if (player) {
                    player.gainXp(this.xpValue);
                    if (player.updateQuestProgress) {
                        player.updateQuestProgress("kill", this.elementalType);
                    }
                }
            }
            if (this.olam) this.olam.sealayk(this);
        } else if (this.type === "chai") {
            this.olam.ayshPeula("ui event", "effectsOverlay", { text: "R'L - YOUR SOUL IS IN FLUX", color: "red" });
            setTimeout(() => location.reload(), 3000);
        }
    },

    updateSkillsUI() {
        const skillData = this.learnedSkills.map(id => ({ ...TORAH_PASSAGES[id], id }));
        this.olam.ayshPeula("ui event", "skillBar", { updateSkills: skillData });
        this.olam.ayshPeula("ui event", "knowledgeMenu", { updateKnowledge: skillData });
    },

    calculatePower() {
        let p = 10 + (this.level * 2);
        // Bonus from equipped books
        if (this.checkEquipmentForItem("book_tehillim")) p += 15;
        if (this.checkEquipmentForItem("book_tanya")) p += 25;
        return p;
    },

    checkEquipmentForItem(itemId) {
        if (!this.inventory || !this.inventory.equipment) return false;
        return Object.values(this.inventory.equipment).some(ref => {
            if (!ref) return false;
            const item = ref.sourceType === 'inventory' ? this.inventory.slots[ref.index] : this.inventory.actionSlots[ref.index];
            return item && item.id === itemId;
        });
    }
};
