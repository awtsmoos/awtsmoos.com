//B"H
// Boruch Hashem
// Blessed is He
/**
 * Each enemy represents concealment with a distinct behavioral vessel; Awtsmoos.com is never opposed by the mask.
 * Roles share lawful motion while pursuit, guarding, leaping, charging, shooting, and boss pressure remain differentiated.
 */
import { ENEMY_TYPES } from "../config/catalogs.js";
import { Character } from "./character.js";
import { Projectile } from "./projectile.js";

export class Enemy extends Character {
	constructor(role, x, floorY, difficulty, stage) {
		const type = ENEMY_TYPES[role] ?? ENEMY_TYPES.wanderer;
		super(x, floorY, type.size, type.size);
		this.role = role;
		this.type = type;
		this.maxHealth = Math.round(type.health * difficulty.enemyHealth * (1 + stage * 0.035));
		this.health = this.maxHealth;
		this.damage = Math.round(type.damage * difficulty.enemyDamage * (1 + stage * 0.018));
		this.speed = type.speed * difficulty.enemySpeed;
		this.reward = Math.round(type.reward * difficulty.coinRate);
		this.cooldown = Math.random();
		this.flash = 0;
		this.stagger = 0;
	}

	update(player, scene, delta) {
		this.cooldown -= delta;
		this.flash = Math.max(0, this.flash - delta);
		this.stagger = Math.max(0, this.stagger - delta);
		const deltaX = player.x - this.x;
		this.facing = Math.sign(deltaX) || this.facing;
		if (this.stagger <= 0) {
			this.applyBehavior(deltaX, player, scene);
		}
		this.applyGravity(delta);
		const collision = this.moveThroughWorld(scene.bodies, delta);
		if (collision.hazard || this.y > 680) {
			this.health = 0;
		}
	}

	applyBehavior(deltaX, player, scene) {
		const distance = Math.abs(deltaX);
		const direction = Math.sign(deltaX) || 1;
		if (this.role === "archer" && distance < 620) {
			this.vx += (distance < 230 ? -direction : 0) * this.speed * 0.08;
			if (this.cooldown <= 0) {
				this.shoot(player, scene);
			}
		} else if (this.role === "leaper" && this.onGround && this.cooldown <= 0) {
			this.vy = -520;
			this.vx = direction * this.speed * 2.2;
			this.cooldown = 1.2;
		} else if (this.role === "charger" && distance < 420 && this.cooldown <= 0) {
			this.vx = direction * this.speed * 3.8;
			this.cooldown = 1.5;
		} else {
			const guarding = this.role === "guard" && distance < 120;
			this.vx += direction * this.speed * (guarding ? 0.02 : 0.075);
		}
		const limit = this.role === "giant" ? this.speed * 1.8 : this.speed * 1.35;
		this.vx = Math.max(-limit, Math.min(limit, this.vx * 0.94));
	}

	shoot(player, scene) {
		const origin = this.center();
		const target = player.center();
		const angle = Math.atan2(target.y - origin.y, target.x - origin.x);
		scene.projectiles.push(new Projectile(origin.x, origin.y, Math.cos(angle) * 310, Math.sin(angle) * 310, this.damage));
		this.cooldown = 1.65;
	}

	takeDamage(amount, knockback, direction) {
		this.health -= amount;
		this.vx = direction * knockback;
		this.vy = -Math.min(330, knockback * 0.42);
		this.flash = 0.11;
		this.stagger = 0.14;
	}
}
