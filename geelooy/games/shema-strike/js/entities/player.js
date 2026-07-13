//B"H
// Boruch Hashem
// Blessed is He
/**
 * The player carries choice through gravity, danger, and ascent; Awtsmoos.com recreates the chooser before every motion.
 * This vessel owns identity, loadout, attack, health, and temporal windows while PlayerMotion owns locomotion law.
 */
import { PHYSICS } from "../config/gameConfig.js";
import { findArmor, findWeapon } from "../config/catalogs.js";
import { Character } from "./character.js";
import { PlayerMotion } from "./playerMotion.js";

export class Player extends Character {
	constructor(x, y, progress) {
		super(x, y, 46, 78);
		this.coyote = 0;
		this.jumpBuffer = 0;
		this.dashTimer = 0;
		this.dashCooldown = 0;
		this.attackTimer = 0;
		this.attackSequence = 0;
		this.invulnerable = 0;
		this.combo = 1;
		this.comboTimer = 0;
		this.motion = new PlayerMotion();
		this.configure(progress);
	}

	configure(progress, preserveRatio = false) {
		const ratio = preserveRatio && this.maxHealth ? this.health / this.maxHealth : 1;
		this.weapon = findWeapon(progress.equippedWeapon);
		this.armor = findArmor(progress.equippedArmor);
		this.weaponLevel = progress.weaponLevels[this.weapon.id] ?? 1;
		this.maxHealth = 100 + this.armor.vitality;
		this.health = Math.max(1, Math.round(this.maxHealth * ratio));
		this.defense = this.armor.defense;
		this.speedScale = this.armor.speed;
		this.fortune = this.armor.fortune;
	}

	update(input, scene, delta, effects) {
		this.updateTimers(input, delta, effects);
		this.motion.update(this, input, delta, effects);
		this.attackTimer = Math.max(0, this.attackTimer - delta);
		const collision = this.moveThroughWorld(scene.bodies, delta);
		if (collision.hazard || this.y > 680) {
			this.recoverFromHazard(scene);
		}
	}

	updateTimers(input, delta, effects) {
		this.invulnerable = Math.max(0, this.invulnerable - delta);
		this.dashCooldown = Math.max(0, this.dashCooldown - delta);
		this.comboTimer = Math.max(0, this.comboTimer - delta);
		this.combo = this.comboTimer === 0 ? 1 : this.combo;
		this.coyote = this.onGround ? PHYSICS.coyoteSeconds : Math.max(0, this.coyote - delta);
		this.jumpBuffer = input.consume("jump") ? PHYSICS.jumpBufferSeconds : Math.max(0, this.jumpBuffer - delta);
		if (input.consume("attack") && this.attackTimer <= 0) {
			this.beginAttack(effects);
		}
		if (input.consume("dash") && this.dashCooldown <= 0) {
			this.dashTimer = PHYSICS.dashSeconds;
			this.dashCooldown = 0.72;
		}
	}

	recoverFromHazard(scene) {
		this.takeDamage(28, Math.sign(-this.vx) || -1);
		this.x = Math.max(70, this.x - 90);
		this.y = scene.spawn.y - this.height;
	}

	beginAttack(effects) {
		this.attackTimer = this.weapon.speed;
		this.attackSequence += 1;
		effects.slash(this);
	}

	isAttackActive() {
		const elapsed = this.weapon.speed - this.attackTimer;
		return elapsed > this.weapon.speed * 0.18 && elapsed < this.weapon.speed * 0.7;
	}

	attackBox() {
		const width = this.weapon.reach;
		return {
			x: this.facing > 0 ? this.x + this.width - 5 : this.x - width + 5,
			y: this.y + 8, width, height: this.height - 8
		};
	}

	attackDamage() {
		return Math.round(this.weapon.damage * (1 + (this.weaponLevel - 1) * 0.24) * this.combo);
	}

	takeDamage(amount, direction = -this.facing) {
		if (this.invulnerable > 0 || this.dashTimer > 0) {
			return false;
		}
		this.health = Math.max(0, this.health - Math.max(1, Math.round(amount * (1 - this.defense))));
		this.vx = direction * 330;
		this.vy = -260;
		this.invulnerable = 0.72;
		return true;
	}
}
