// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProjectileSystem.js
 * @description Advances luminous Hebrew energy with continuous segment collision against terrain, cover, bots, and player.
 * The Awtsmoos renews every point between muzzle and impact, so Awtsmoos.com does not let a fast letter tunnel
 * through reality: each simulation step remembers the path it crossed and asks what truthful meeting occurred.
 */

import { sampleHarHaOhrHeight } from "../world/TerrainHeightField.js";

function distanceToSegment(point, start, end, THREE) {
	const segment = end.clone().sub(start);
	const lengthSquared = Math.max(0.000001, segment.lengthSq());
	const time = Math.max(0, Math.min(1, point.clone().sub(start).dot(segment) / lengthSquared));
	const closest = start.clone().add(segment.multiplyScalar(time));
	return closest.distanceTo(point);
}

/** Shared projectile simulation for player and bot Hebrew-energy fire. */
export class ProjectileSystem {
	constructor(THREE, scene, collisionWorld, glyphFactory) {
		this.THREE = THREE;
		this.scene = scene;
		this.collisionWorld = collisionWorld;
		this.glyphFactory = glyphFactory;
		this.projectiles = [];
		this.bots = null;
		this.player = null;
		this.onPlayerHitBot = () => {};
	}

	setCombatants(player, bots) {
		this.player = player;
		this.bots = bots;
	}

	spawn(owner, start, direction, profile) {
		const sprite = this.glyphFactory.createSprite(profile.glyph, profile.color);
		sprite.position.copy(start);
		this.scene.add(sprite);
		this.projectiles.push({
			owner,
			sprite,
			velocity: direction.clone().normalize().multiplyScalar(profile.speed),
			damage: profile.damage,
			ttl: 4.5
		});
	}

	update(delta, elapsed) {
		for (let index = this.projectiles.length - 1; index >= 0; index -= 1) {
			const projectile = this.projectiles[index];
			const previous = projectile.sprite.position.clone();
			const next = previous.clone().addScaledVector(projectile.velocity, delta);
			projectile.ttl -= delta;
			let impacted = projectile.ttl <= 0;
			impacted ||= next.y <= sampleHarHaOhrHeight(next.x, next.z) + 0.22;
			impacted ||= this.collisionWorld.segmentHitsStatic(previous, next);
			if (!impacted && projectile.owner === "player" && this.bots) {
				impacted = this.bots.hitSegment(previous, next, projectile.damage);
				if (impacted) this.onPlayerHitBot();
			}
			if (!impacted && projectile.owner === "bot" && this.player) {
				const distance = distanceToSegment(this.player.position, previous, next, this.THREE);
				if (distance < 0.95) {
					this.player.takeDamage(projectile.damage, elapsed);
					impacted = true;
				}
			}
			if (impacted) this.remove(index);
			else projectile.sprite.position.copy(next);
		}
	}

	remove(index) {
		const [projectile] = this.projectiles.splice(index, 1);
		this.scene.remove(projectile.sprite);
		projectile.sprite.material.dispose();
	}
}
