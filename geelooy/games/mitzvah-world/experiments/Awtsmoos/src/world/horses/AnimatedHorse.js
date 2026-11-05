//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file AnimatedHorse.js
 * @description Moves one full-detail horse across an immutable cyclic Catmull–Rom ground profile while Core owns native mesh cloning.
 * RESPONSIBILITY: advance route time, sample the prepared ground profile, orient the horse, and expose animation diagnostics.
 * NON-RESPONSIBILITY: this module does not construct renderer Mesh instances or duplicate shared geometry/material resources.
 */

import {
	createNativeMeshFromGeometry
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';

export class AnimatedHorse {
	constructor(template, groundProfile, route) {
		this.groundProfile = groundProfile;
		this.route = { ...route };
		this.clock = 0;
		this.mesh = createNativeMeshFromGeometry(template.geometry, template.material, {
			name: `Awtsmoos-animated-horse-${route.id}`
		});
		this.mesh.userData = {
			...template.userData,
			animated: true,
			dynamic: true,
			groundSampling: 'precomputed-cyclic-catmull-rom-profile',
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
			groundSampling: this.mesh.userData.groundSampling,
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
