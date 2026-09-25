//B"H
//Boruch Hashem
//Blessed is He

import { KabbalahNative3DPool } from './kabbalah-native-3d-pool.js';

/**
 * @file kabbalah-native-3d-projector.js
 * @description Projects authoritative 2D simulation entities into native depth without duplicating gameplay rules.
 * The Awtsmoos renews one battle state; Awtsmoos.com lets player, enemies, projectiles, pickups, wells and sparks reveal the same truth in depth.
 */
export class KabbalahNative3DProjector {
	constructor(scene, reducedMotion = false) {
		this.reducedMotion = reducedMotion;
		this.pools = createPools(scene);
		this.count = 0;
	}

	sync(game) {
		const enemies = (game.enemies || []).flatMap(enemy => enemy.segments?.length ? enemy.segments : [enemy]);
		this.syncPool('player', game.player ? [game.player] : [], game, 0.8);
		this.syncPool('enemies', enemies, game, 0.55);
		this.syncPool('bullets', game.bullets || [], game, 0.52);
		this.syncPool('enemyBullets', game.enemyBullets || [], game, 0.48);
		this.syncPool('pickups', [...(game.powerups || []), ...(game.letters || [])], game, 0.72);
		this.syncPool('wells', game.gravityWells || [], game, 0.1, 2.2);
		this.syncPool('orbitals', game.orbitals || [], game, 1.1);
		this.syncPool('shapes', game.metatronShapes || [], game, 0.35, 1.4);
		const particles = (game.particles || []).slice(0, this.reducedMotion ? 24 : 120);
		this.syncPool('particles', particles, game, 0.9);
		const trail = game.player?.trail || game.trails || [];
		this.syncPool('trail', trail.slice(-(this.reducedMotion ? 10 : 40)), game, 0.22);
		this.count = 1 + enemies.length + (game.bullets?.length || 0)
			+ (game.enemyBullets?.length || 0) + particles.length;
	}

	syncPool(name, items, game, height, scaleBoost = 1) {
		this.pools[name].sync(items, (mesh, entity, index) => {
			const point = worldPoint(entity, game);
			const scale = entityScale(entity, game) * scaleBoost;
			mesh.position.set(point.x, height + (index % 3) * 0.015, point.z);
			mesh.scale.set(scale, scale, scale);
			const angle = Number(entity?.angle ?? entity?.rotation ?? 0);
			mesh.rotation.y = Number.isFinite(angle) ? -angle : 0;
		});
	}

	view() {
		return { entities: this.count };
	}

	destroy() {
		Object.values(this.pools).forEach(pool => pool.destroy());
	}
}

function createPools(scene) {
	const definition = (name, kind, color, glow) => new KabbalahNative3DPool(scene, { name, kind, color, glow });
	return {
		player: definition('player', 'sphere', 0xf6d365, 1.1),
		enemies: definition('enemy', 'sphere', 0xff416c, 0.65),
		bullets: definition('bullet', 'bolt', 0xfff08a, 1.4),
		enemyBullets: definition('enemy-bullet', 'bolt', 0xb05cff, 1.1),
		pickups: definition('pickup', 'cube', 0x65ffbf, 0.8),
		wells: definition('gravity-well', 'ring', 0x874cff, 1.1),
		orbitals: definition('orbital', 'sphere', 0x67c7ff, 1),
		shapes: definition('metatron', 'ring', 0xffffff, 0.8),
		particles: definition('particle', 'sphere', 0x8ee8ff, 1.4),
		trail: definition('trail', 'sphere', 0xffd86b, 0.65)
	};
}

function worldPoint(entity, game) {
	const width = Math.max(1, Number(game.width) || innerWidth || 1);
	const height = Math.max(1, Number(game.height) || innerHeight || 1);
	const x = Number(entity?.x ?? entity?.position?.x ?? entity?.pos?.x ?? width / 2);
	const y = Number(entity?.y ?? entity?.position?.y ?? entity?.pos?.y ?? height / 2);
	return { x: (x / width - 0.5) * 18, z: (y / height - 0.5) * 10 };
}

function entityScale(entity, game) {
	const base = Number(entity?.radius ?? entity?.r ?? entity?.size ?? 8);
	const span = Math.max(1, Math.min(Number(game.width) || 1, Number(game.height) || 1));
	return Math.max(0.07, Math.min(1.6, base / span * 18));
}
