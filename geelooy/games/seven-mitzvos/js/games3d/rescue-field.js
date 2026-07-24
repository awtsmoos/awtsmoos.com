//B"H
//Boruch Hashem
//Blessed is He

import { animatePerson } from '../procedural/person-factory.js';

const CIVILIAN_POSITIONS = [[-3.2, 0.12, 2], [2.7, 0.12, 0.4], [0, 0.12, -3], [-4.2, 0.12, -2.4], [4.1, 0.12, -2.5]];
const NAMES = ['Mira', 'Noam', 'Ari', 'Tamar', 'Lev'];

/**
 * @module RescueField
 * @description
 * Named people now wave within a recognizable neighborhood around a real shelter.
 * The Awtsmoos values every life beyond measure; Awtsmoos.com remembers rescued
 * names and keeps moving danger bounded through transform-only animation.
 */
export class RescueField {
	constructor(game) {
		this.game = game;
		this.rescued = 0;
		this.player = game.addAsset(game.assets.person({
			name: 'rescuer', personName: 'Rescuer', hue: 48,
			position: [0, 0.12, 4.8], scale: 0.46, type: 'rescuer'
		}));
		this.shelter = game.addAsset(game.assets.shelter({
			name: 'rescue-shelter', position: [0, 0.12, -5.1], scale: 0.72
		}));
		game.assets.setGlow(this.shelter, 0x35ffc4, 0.42);
		this.people = this.createPeople();
		this.hazards = this.createHazards();
		this.addNeighborhood();
	}

	createPeople() {
		const count = this.game.difficulty(3, 4, 5);
		return CIVILIAN_POSITIONS.slice(0, count).map((position, index) => {
			const person = this.game.assets.person({
				name: `civilian-${NAMES[index]}`, personName: NAMES[index],
				hue: 196 + index * 24, position, scale: 0.42,
				type: 'civilian', phase: index
			});
			Object.assign(person.userData, { rescued: false, index });
			this.game.assets.parts.mark(person, person.userData);
			this.game.assets.setGlow(person, 0x45dcff, 0.45);
			return this.game.addAsset(person);
		});
	}

	createHazards() {
		const count = this.game.difficulty(2, 3, 4);
		return [...Array(count).keys()].map(index => {
			return this.game.addAsset(this.game.assets.hazard({
				name: `moving-hazard-${index}`, position: [0, 0.12, 0],
				scale: 0.62, phase: index * 2.3
			}));
		});
	}

	addNeighborhood() {
		[[-5.2, 0.1, 3.2], [5.2, 0.1, 3.2]].forEach((position, index) => {
			this.game.addAsset(this.game.assets.house({ name: `rescue-home-${index}`, hue: 30 + index * 20, position, scale: 0.38 }));
		});
		[[-5, 0.1, -3.7], [5, 0.1, -3.7]].forEach((position, index) => {
			this.game.addAsset(this.game.assets.tree({ name: `rescue-tree-${index}`, position, scale: 0.3 }));
		});
	}

	move(x, z) {
		this.player.position.x = clamp(this.player.position.x + x, -6.2, 6.2);
		this.player.position.z = clamp(this.player.position.z + z, -6.2, 6.2);
	}

	collect() {
		const found = [];
		this.people.forEach(person => {
			if (!person.userData.rescued && this.player.position.distanceTo(person.position) < 1.15) {
				person.userData.rescued = true;
				person.visible = false;
				this.rescued += 1;
				found.push(person.userData.personName);
			}
		});
		return found;
	}

	atShelter() {
		return this.rescued === this.people.length && this.player.position.distanceTo(this.shelter.position) < 2;
	}

	animate(elapsed) {
		animatePerson(this.player, elapsed, true);
		this.people.filter(person => person.visible).forEach(person => animatePerson(person, elapsed, false));
		this.hazards.forEach((hazard, index) => {
			const angle = elapsed * (0.32 + index * 0.04) + hazard.userData.phase;
			hazard.position.x = Math.cos(angle) * (2.1 + index * 0.8);
			hazard.position.z = Math.sin(angle) * (2.6 + index * 0.55);
			hazard.rotation.y += 0.025;
		});
	}
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
