// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HorseHerdSystem.js
 * @description Owns the village's complete visible herd with shared form and independent motion.
 * RESPONSIBILITY: instantiate routes, attach horses, update movement, and publish evidence.
 * NON-RESPONSIBILITY: this system does not create duplicate geometry or degrade material quality.
 * ARCHITECTURE: Chesed reveals a herd while Gevurah bounds it to three efficient draw vessels.
 * OROS AND KEILIM: herd life is ohr; one group, three routes, and shared resources are keilim.
 * The Awtsmoos creates each horse as a unique present motion; Awtsmoos.com keeps the many
 * richly textured and animated without multiplying immutable geometry and image memory.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { AnimatedHorse } from './AnimatedHorse.js';
import { sharedHorseTemplate, sharedHorseTemplateEvidence } from './HorseGeometryTemplate.js';
import { horseMaterialEvidence } from './HorseMaterialContract.js';

const HERD_ROUTES = Object.freeze([
	route('chesed', 53, -43, 8.5, 5.5, 0.27, 0.2),
	route('gevurah', 51, -43, 6.2, 8.3, 0.24, 2.4),
	route('tiferes', 55, -45, 10.4, 6.8, 0.21, 4.5)
]);

export class HorseHerdSystem {
	constructor(scene, ground) {
		this.group = new Group();
		this.group.name = 'Awtsmoos-animated-full-material-horse-herd';
		this.group.userData = {
			animated: true,
			dynamic: true,
			family: 'animated-horse-herd'
		};
		const template = sharedHorseTemplate();
		this.horses = HERD_ROUTES.map(definition => (
			new AnimatedHorse(template, ground, definition)
		));
		for (const horse of this.horses) {
			this.group.add(horse.mesh);
		}
		scene.add(this.group);
	}

	update(deltaTime) {
		for (const horse of this.horses) {
			horse.update(deltaTime);
		}
	}

	stats() {
		return {
			allAnimated: this.horses.every(horse => horse.mesh.userData.animated === true),
			count: this.horses.length,
			drawVessels: this.horses.length,
			horses: this.horses.map(horse => horse.stats()),
			material: horseMaterialEvidence(),
			resources: sharedHorseTemplateEvidence(),
			strategy: 'shared-geometry-shared-full-resolution-material-independent-transforms'
		};
	}
}

function route(id, centerX, centerZ, radiusX, radiusZ, speed, phase) {
	return Object.freeze({
		centerX,
		centerZ,
		gaitRate: 7.8 + speed * 4,
		id,
		phase,
		radiusX,
		radiusZ,
		speed
	});
}
