// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotDirector.js
 * @description Directs local multiplayer-style enemy tactics while visual manifestation lives in a separate factory.
 * The Awtsmoos creates every apparent opponent and every choice anew; Awtsmoos.com lets this director coordinate
 * pursuit, strafing, firing, defeat, and return without confusing tactical orchestration with the bodies it commands.
 */

import { sampleHarHaOhrHeight } from "../world/TerrainHeightField.js";
import { WEAPON_PROFILES } from "../combat/WeaponProfiles.js";
import { createBotCombatant } from "./BotCombatantFactory.js";

function segmentDistance(point, start, end) {
	const segment = end.clone().sub(start);
	const denominator = Math.max(0.000001, segment.lengthSq());
	const time = Math.max(0, Math.min(1, point.clone().sub(start).dot(segment) / denominator));
	return start.clone().add(segment.multiplyScalar(time)).distanceTo(point);
}

/** Controls every simulated multiplayer bot for the active campaign node. */
export class BotDirector {
	constructor(THREE, scene, collisionWorld, projectiles, player, difficulty) {
		this.THREE = THREE;
		this.scene = scene;
		this.collisionWorld = collisionWorld;
		this.projectiles = projectiles;
		this.player = player;
		this.difficulty = difficulty;
		this.bots = [];
		this.kills = 0;
		this.spawnSquad(difficulty.botCount);
	}

	spawnSquad(count) {
		for (let index = 0; index < count; index += 1) {
			const angle = (index / count) * Math.PI * 2;
			const radius = 58 + (index % 3) * 22;
			const x = Math.cos(angle) * radius;
			const z = Math.sin(angle) * radius;
			this.bots.push(createBotCombatant(this.THREE, this.scene, index, x, z));
		}
	}

	update(delta) {
		for (const bot of this.bots) {
			if (!bot.alive) {
				bot.respawn -= delta;
				if (bot.respawn <= 0) this.revive(bot);
				continue;
			}
			this.updateLivingBot(bot, delta);
		}
	}

	updateLivingBot(bot, delta) {
		const toPlayer = this.player.position.clone().sub(bot.group.position);
		const distance = toPlayer.length();
		const forward = toPlayer.setY(0).normalize();
		const tangent = new this.THREE.Vector3(-forward.z, 0, forward.x).multiplyScalar(bot.strafe);
		const chase = distance > 24 ? 1 : distance < 11 ? -0.8 : 0.18;
		const movement = forward.multiplyScalar(chase).addScaledVector(tangent, 0.55 * this.difficulty.aggression);
		bot.group.position.addScaledVector(movement.normalize(), this.difficulty.speed * delta);
		this.collisionWorld.resolveHorizontal(bot.group.position, 0.8);
		bot.group.position.y = sampleHarHaOhrHeight(bot.group.position.x, bot.group.position.z) + 1.2;
		bot.group.lookAt(this.player.position.x, bot.group.position.y, this.player.position.z);
		bot.cooldown -= delta;
		if (distance < 78 && bot.cooldown <= 0) this.tryFire(bot);
	}

	tryFire(bot) {
		const start = bot.group.position.clone().add(new this.THREE.Vector3(0, 0.65, 0));
		if (this.collisionWorld.segmentHitsStatic(start, this.player.position)) {
			bot.cooldown = this.difficulty.reaction * 0.7;
			return;
		}
		const direction = this.player.position.clone().sub(start).normalize();
		direction.x += (Math.random() - 0.5) * this.difficulty.spread;
		direction.y += (Math.random() - 0.5) * this.difficulty.spread;
		direction.z += (Math.random() - 0.5) * this.difficulty.spread;
		const profile = { ...WEAPON_PROFILES.shin, damage: this.difficulty.damage };
		this.projectiles.spawn("bot", start, direction, profile);
		bot.cooldown = this.difficulty.reaction + 0.18 + Math.random() * 0.22;
	}

	hitSegment(start, end, damage) {
		for (const bot of this.bots) {
			if (!bot.alive || segmentDistance(bot.group.position, start, end) > 1.5) continue;
			const shieldDamage = Math.min(bot.shield, damage);
			bot.shield -= shieldDamage;
			bot.health -= damage - shieldDamage;
			if (bot.health <= 0) this.defeat(bot);
			return true;
		}
		return false;
	}

	defeat(bot) {
		bot.alive = false;
		bot.group.visible = false;
		bot.respawn = 6;
		this.kills += 1;
	}

	revive(bot) {
		bot.health = 80;
		bot.shield = 50;
		bot.alive = true;
		bot.group.visible = true;
		bot.group.position.x = (Math.random() - 0.5) * 150;
		bot.group.position.z = (Math.random() - 0.5) * 150;
	}

	get livingCount() {
		return this.bots.filter(bot => bot.alive).length;
	}
}
