//B"H
//Boruch Hashem
//Blessed is He
import * as THREE from '../../../scripts/build/three.module.js';
import { animateAnimal } from '../procedural/animal-factory.js';
import { animatePerson } from '../procedural/person-factory.js';
/**
 * @module CityDistrictBuilder
 * @description
 * Seven commandments become seven recognizable neighborhoods around one shared
 * plaza. The Awtsmoos unites their distinctions; Awtsmoos.com reveals mastery
 * as brighter buildings, living citizens, animals, and restored public space.
 */
export class CityDistrictBuilder {
	constructor(assets) {
		this.assets = assets;
		this.roots = [];
		this.citizens = [];
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
		root.add(...this.landmarks(definition, mastery));
		if (record.plays > 0) {
			root.add(this.citizen(definition, index));
		}
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
		return this.assets.parts.part({
			name: 'district-platform',
			hue: definition.hue,
			lightness: 0.16 + mastery * 0.08,
			position: [0, 0.08, 0],
			scale: [2.7, 0.18, 2.25],
			receiveShadow: true
		});
	}
	landmarks(definition, mastery) {
		const common = {
			hue: definition.hue,
			position: [0, 0.16, 0],
			scale: 0.42 + mastery * 0.12
		};
		const create = {
			'false-powers': () => [this.assets.tower({ ...common, name: 'watch-tower' })],
			'words-of-creation': () => [this.assets.rune({ ...common, position: [-0.65, 0.16, 0] }), this.assets.tree({ ...common, position: [0.8, 0.16, 0], scale: 0.34 })],
			'every-life': () => [this.assets.shelter({ ...common, name: 'rescue-center' })],
			'households': () => [this.assets.house({ ...common, name: 'family-home' })],
			'honest-market': () => [this.assets.stall({ ...common, name: 'fair-market' })],
			'living-sanctuary': () => [this.sanctuaryAnimal(common), this.assets.tree({ ...common, position: [-0.8, 0.16, 0], scale: 0.3 })],
			'court-of-nations': () => [this.assets.court({ ...common, name: 'city-court', scale: 0.32 + mastery * 0.08 })]
		};
		return create[definition.id]?.() || [this.assets.house(common)];
	}
	citizen(definition, index) {
		const citizen = this.assets.person({
			name: `district-citizen-${index}`,
			personName: `Citizen ${index + 1}`,
			hue: definition.hue,
			position: [1.15, 0.18, 0.85],
			scale: 0.28,
			phase: index
		});
		this.citizens.push(citizen);
		return citizen;
	}
	sanctuaryAnimal(common) {
		const animal = this.assets.animal({
			...common,
			name: 'city-animal',
			position: [0.5, 0.16, 0.2],
			scale: 0.3,
			phase: 2
		});
		this.animals.push(animal);
		return animal;
	}
	animate(elapsed) {
		this.roots.forEach(root => {
			root.position.y = root.userData.baseY + Math.sin(elapsed * 0.8 + root.userData.phase) * 0.035;
		});
		this.citizens.forEach(person => animatePerson(person, elapsed, false));
		this.animals.forEach(animal => animateAnimal(animal, elapsed));
	}
}
