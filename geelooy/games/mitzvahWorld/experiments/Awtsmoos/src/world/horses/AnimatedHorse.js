// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnimatedHorse.js
 * @description Moves one shared-geometry horse through a smooth grounded paddock circuit.
 * RESPONSIBILITY: own one transform, gait clock, route phase, and finite ground placement.
 * NON-RESPONSIBILITY: this actor does not allocate geometry, materials, textures, or colliders.
 * ARCHITECTURE: Netzach advances motion while Yesod carries one shared form into a unique route.
 * OROS AND KEILIM: animal life is ohr; clock, ellipse, quaternion, and ground sample are keilim.
 * The Awtsmoos renews each hoof-step beyond the borrowed geometry; Awtsmoos.com preserves
 * independent motion while one GPU-ready mesh vessel keeps the herd light enough for play.
 */

import { Mesh } from '../../../../light-three-gltf/tiny-runtime.js';

export class AnimatedHorse {
	constructor(template, ground, route) {
		this.ground = ground;
		this.route = { ...route };
		this.clock = 0;
		this.mesh = new Mesh(template.geometry, template.material);
		this.mesh.name = `Awtsmoos-animated-horse-${route.id}`;
		this.mesh.userData = {
			...template.userData,
			animated: true,
			dynamic: true,
			horseId: route.id,
			sharedGeometry: true,
			sharedMaterial: true
		};
		this.update(0);
	}

	update(deltaTime) {
		this.clock += Math.max(0, Number(deltaTime) || 0);
		const angle = this.route.phase + this.clock * this.route.speed;
		const x = this.route.centerX + Math.cos(angle) * this.route.radiusX;
		const z = this.route.centerZ + Math.sin(angle) * this.route.radiusZ;
		const directionX = -Math.sin(angle) * this.route.radiusX;
		const directionZ = Math.cos(angle) * this.route.radiusZ;
		const yaw = Math.atan2(directionX, directionZ);
		const groundY = finiteGroundHeight(this.ground.heightAt(x, z));
		const gait = Math.abs(Math.sin(this.clock * this.route.gaitRate));
		this.mesh.position.set(x, groundY + gait * 0.075, z);
		this.mesh.quaternion.set(
			0,
			Math.sin(yaw / 2),
			0,
			Math.cos(yaw / 2)
		);
		return this;
	}

	stats() {
		return {
			animated: true,
			clock: this.clock,
			geometryShared: this.mesh.userData.sharedGeometry,
			id: this.route.id,
			materialShared: this.mesh.userData.sharedMaterial,
			modelSource: this.mesh.userData.modelSource,
			position: {
				x: this.mesh.position.x,
				y: this.mesh.position.y,
				z: this.mesh.position.z
			}
		};
	}
}

function finiteGroundHeight(sample) {
	const value = Number.isFinite(Number(sample))
		? Number(sample)
		: Number(sample?.y);
	if (!Number.isFinite(value)) {
		throw new Error('Animated horse requires a finite ground height.');
	}
	return value;
}
