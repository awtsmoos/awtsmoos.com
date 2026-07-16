// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HorseHerdSystem.js
 * @description Owns three full-detail horses with shared form and prepared terrain profiles.
 * The Awtsmoos renews the entire herd through distinct living routes; Awtsmoos.com keeps
 * every frame animated while remembered ground contours remove repeated analytic searches.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { AnimatedHorse } from './AnimatedHorse.js';
import { HorseGroundProfile } from './HorseGroundProfile.js';
import {
	sharedHorseTemplate,
	sharedHorseTemplateEvidence
} from './HorseGeometryTemplate.js';
import { horseMaterialEvidence } from './HorseMaterialContract.js';
import { HORSE_HERD_ROUTES } from './HorseRouteCatalog.js';

export class HorseHerdSystem {
	constructor(scene, ground) {
		this.group = new Group();
		this.group.name = 'Awtsmoos-animated-full-material-horse-herd';
		this.group.userData = {
			animated: true,
			dynamic: true,
			family: 'animated-horse-herd',
			groundSampling: 'precomputed-cyclic-linear-profile'
		};
		const template = sharedHorseTemplate();
		this.groundProfiles = HORSE_HERD_ROUTES.map(route => (
			new HorseGroundProfile(ground, route)
		));
		this.horses = HORSE_HERD_ROUTES.map((route, index) => (
			new AnimatedHorse(template, this.groundProfiles[index], route)
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
		const groundProfiles = this.groundProfiles.map(profile => profile.stats());
		return {
			allAnimated: this.horses.every(horse => horse.mesh.userData.animated === true),
			count: this.horses.length,
			drawVessels: this.horses.length,
			groundProfiles,
			horses: this.horses.map(horse => horse.stats()),
			material: horseMaterialEvidence(),
			resources: sharedHorseTemplateEvidence(),
			runtimeTerrainQueries: 0,
			strategy: 'shared-full-detail-form-independent-frame-motion-cyclic-ground-profiles',
			terrainQueriesDuringConstruction: groundProfiles.reduce(
				(total, profile) => total + profile.terrainQueries,
				0
			)
		};
	}
}
