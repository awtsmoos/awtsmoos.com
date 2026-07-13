//B"H
// Boruch Hashem
// Blessed is He
/**
 * Combat dissolves concealment into letters and sparks without gore; Awtsmoos.com is beyond both opposition and victory.
 * Resolved defeats now emit stable events, allowing phase-local objectives and checkpoint restoration to follow actual encounters.
 */
import { Pickup } from "../entities/pickup.js";
import { overlaps } from "../physics/geometry.js";

export class CombatSystem {
	constructor(effects, audio, camera) {
		this.effects = effects;
		this.audio = audio;
		this.camera = camera;
	}

	update(player, scene) {
		this.resolvePlayerAttack(player, scene);
		this.resolveDefeats(player, scene);
		this.resolveEnemyContact(player, scene);
		this.resolveProjectiles(player, scene);
	}

	resolvePlayerAttack(player, scene) {
		if (!player.isAttackActive()) {
			return;
		}
		const attack = player.attackBox();
		for (const enemy of scene.enemies) {
			if (enemy.lastHitSequence === player.attackSequence || !overlaps(attack, enemy)) {
				continue;
			}
			enemy.lastHitSequence = player.attackSequence;
			enemy.takeDamage(player.attackDamage(), player.weapon.knockback, player.facing);
			player.combo = Math.min(2.25, player.combo + 0.08);
			player.comboTimer = 2.4;
			const center = enemy.center();
			this.effects.hit(center.x, center.y, player.weapon.color);
			this.audio.hit();
			this.camera.impulse(enemy.role === "giant" ? 14 : 7);
		}
	}

	resolveDefeats(player, scene) {
		for (const enemy of scene.enemies) {
			if (enemy.health > 0 || enemy.defeatResolved) {
				continue;
			}
			enemy.defeatResolved = true;
			enemy.alive = false;
			scene.defeated += 1;
			scene.ledger?.emit("eliminate", enemy.objectiveTag || enemy.role);
			this.effects.hebrewDefeat(enemy);
			this.camera.impulse(enemy.role === "giant" ? 20 : 10);
			this.createDrops(player, scene, enemy);
		}
		scene.enemies = scene.enemies.filter((enemy) => enemy.alive);
	}

	createDrops(player, scene, enemy) {
		const center = enemy.center();
		const dropCount = enemy.role === "giant" ? 12 : 2 + Math.ceil(enemy.reward / 8);
		for (let index = 0; index < dropCount; index += 1) {
			const offsetX = (Math.random() - 0.5) * 80;
			const offsetY = -Math.random() * 45;
			const value = enemy.reward / dropCount * player.fortune;
			scene.pickups.push(new Pickup("coin", center.x + offsetX, center.y + offsetY, value));
		}
		if (Math.random() < 0.16) {
			scene.pickups.push(new Pickup("heart", center.x, center.y - 35, 18));
		}
	}

	resolveEnemyContact(player, scene) {
		for (const enemy of scene.enemies) {
			if (!enemy.alive || !overlaps(player, enemy)) {
				continue;
			}
			const direction = Math.sign(player.x - enemy.x) || 1;
			if (player.takeDamage(enemy.damage, direction)) {
				this.effects.hit(player.x + player.width * 0.5, player.y + 28, "#ff7895");
				this.camera.impulse(10);
			}
		}
	}

	resolveProjectiles(player, scene) {
		for (const projectile of scene.projectiles) {
			if (!projectile.active || projectile.owner !== "enemy" || !overlaps(player, projectile)) {
				continue;
			}
			projectile.active = false;
			player.takeDamage(projectile.damage, Math.sign(projectile.vx) || 1);
			this.effects.hit(projectile.x, projectile.y, "#9ceeff");
			this.camera.impulse(8);
		}
	}
}
