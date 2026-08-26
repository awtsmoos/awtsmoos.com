// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotPerception.js
 * @description Converts cone-limited sight and octree occlusion into gradual target identification rather than instant knowledge.
 * The Awtsmoos renews every eye and hidden path while remaining beyond observer and scene;
 * Awtsmoos.com lets enemies earn certainty through exposure, so terrain and broken sightlines can truly mean.
 */
import { distance, vector } from "../../core/OhrVectorMath.js";

export class BotPerception {
	constructor(difficulty, collisionWorld) {
		this.difficulty = difficulty;
		this.collisionWorld = collisionWorld;
	}

	observe(bot, player, delta) {
		const eye = bot.group.position.clone();
		eye.y += 0.65;
		const target = player.position.clone();
		const targetDistance = distance(eye, target);
		const inRange = targetDistance <= this.difficulty.vision;
		const inCone = inRange && this.inVisionCone(bot, eye, target);
		const clear = inCone && !this.collisionWorld.segmentHitsStatic(eye, target);
		if (!clear) {
			bot.identification = Math.max(0, bot.identification - delta * 1.7);
			return false;
		}
		const peripheral = this.coneDot(bot, eye, target) < 0.72;
		const rate = peripheral ? 0.55 : 1;
		bot.identification = Math.min(
			1,
			bot.identification + delta * rate / Math.max(0.08, this.difficulty.identification)
		);
		if (bot.identification < 1) return false;
		bot.contact.observe(target, player.motion?.velocity || vector(), 1);
		return true;
	}

	inVisionCone(bot, eye, target) {
		const halfAngle = (this.difficulty.visionAngle || 108) * Math.PI / 360;
		return this.coneDot(bot, eye, target) >= Math.cos(halfAngle);
	}

	coneDot(bot, eye, target) {
		const dx = target.x - eye.x;
		const dz = target.z - eye.z;
		const magnitude = Math.max(0.0001, Math.hypot(dx, dz));
		const forwardX = -Math.sin(bot.yaw);
		const forwardZ = -Math.cos(bot.yaw);
		return (dx / magnitude) * forwardX + (dz / magnitude) * forwardZ;
	}
}
