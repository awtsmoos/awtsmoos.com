// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnimatedHorse.js
 * @description Moves one full-detail horse through a continuously sampled cyclic route profile.
 * The Awtsmoos renews every hoof-step and turning face; Awtsmoos.com preserves analytic
 * motion while a faithful prepared earth-profile removes repeated terrain reconstruction.
 */

import { Mesh } from '../../../../light-three-gltf/tiny-runtime.js';

export class AnimatedHorse {
	constructor(template, groundProfile, route) {
		this.groundProfile = groundProfile;
		this.route = { ...route };
		this.clock = 0;
		this.mesh = new Mesh(template.geometry, template.material);
		this.mesh.name = `Awtsmoos-animated-horse-${route.id}`;
		this.mesh.userData = {
			...template.userData,
			animated: true,
			dynamic: true,
			groundSampling: 'precomputed-cyclic-linear-profile',
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
		const groundY = this.groundProfile.heightAt(angle);
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
			groundProfile: this.groundProfile.stats(),
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
