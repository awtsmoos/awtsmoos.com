//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { animateAnimal } from '../procedural/animal-factory.js';
import { createCityDistrictLandmarks } from './city-district-landmarks.js';

/**
 * @module CityDistrictBuilder
 * @description
 * The Awtsmoos renews seven recognizable neighborhoods around one shared plaza while Awtsmoos.com keeps saved citizens in the canonical population layer;
 * this builder owns district architecture, mastery glow, and symbolic landmarks only, with photographed masonry carrying covenant hue as an accent rather than a flat structural color.
 */
export class CityDistrictBuilder {
	constructor(assets) {
		this.assets = assets;
		this.roots = [];
		this.animals = [];
	}

	build(stage, definitions, progress) {
		definitions.forEach((definition, index) => {
			const record = progress.game(definition.id);
			const angle = index / definitions.length * Math.PI * 2 - Math.PI / 2;
			const root = this.district(definition, record, index);
			root.position.set(Math.cos(angle) * 4.4, 0, Math.sin(angle) * 4.4);
			root.rotation.y = -angle + Math.PI / 2;
			stage.add(root, true);
			this.roots.push(root);
		});
		return this;
	}

	district(definition, record, index) {
		const root = new THREE.Group();
		const mastery = record.mastery / 100;
		root.name = `district-${definition.id}`;
		root.userData.baseY = 0;
		root.userData.phase = index * 0.72;
		root.add(this.platform(definition, mastery));
		root.add(...createCityDistrictLandmarks(
			this.assets,
			definition,
			mastery,
			animal => this.animals.push(animal)
		));
		this.assets.parts.mark(root, {
			semanticType: 'district',
			districtId: definition.id,
			mastery: record.mastery,
			restored: record.plays > 0
		});
		if (mastery > 0) {
			const glow = this.assets.parts.color(definition.hue, 0.62).getHex();
			this.assets.setGlow(root, glow, 0.1 + mastery * 0.35);
		}
		return root;
	}

	platform(definition, mastery) {
		const lightness = 0.16 + mastery * 0.08;
		return this.assets.parts.part({
			materialRole: 'masonry',
			tint: this.assets.parts.color(definition.hue, lightness).getHex(),
			name: 'district-platform',
			position: [0, 0.08, 0],
			scale: [2.7, 0.18, 2.25],
			receiveShadow: true
		});
	}

	animate(elapsed) {
		this.roots.forEach(root => {
			root.position.y = root.userData.baseY +
				Math.sin(elapsed * 0.8 + root.userData.phase) * 0.035;
		});
		this.animals.forEach(animal => animateAnimal(animal, elapsed));
	}
}
