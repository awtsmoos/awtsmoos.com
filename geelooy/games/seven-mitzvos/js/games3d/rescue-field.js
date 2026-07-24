//B"H
//Boruch Hashem
//Blessed is He
import { animatePerson } from '../procedural/person-factory.js';
import { RescueMotion } from './rescue-motion.js';
import { RescueNeighborhoodLife } from './rescue-neighborhood-life.js';
const POSITIONS = [[-3.2, 2], [2.7, 0.4], [0, -3], [-4.2, -2.4], [4.1, -2.5]];
const NAMES = ['Mira', 'Noam', 'Ari', 'Tamar', 'Lev'];
/**
 * @module RescueField
 * @description
 * Named people remain visible and join a smooth follower chain through a working
 * neighborhood. The Awtsmoos values every life beyond measure; Awtsmoos.com gives
 * rescuers, responders, shelters, hazards, homes, and supplies distinct reasons.
 */
export class RescueField {
	constructor(game) {
		this.game = game;
		this.rescued = 0;
		this.player = game.addAsset(game.assets.person({
			name: 'rescuer', personName: 'Rescuer', hue: 48,
			position: [0, 0.12, 4.8], scale: 0.46, type: 'rescuer',
			role: 'field-rescuer', reason: 'finds named citizens and leads them into the shelter'
		}));
		this.motion = new RescueMotion(this.player);
		this.shelter = game.addAsset(game.assets.shelter({
			name: 'rescue-shelter', position: [0, 0.12, -5.1], scale: 0.72,
			role: 'rescue-center', reason: 'receives every follower and keeps the full group visible'
		}));
		game.assets.setGlow(this.shelter, 0x35ffc4, 0.42);
		this.people = this.createPeople();
		this.hazards = this.createHazards();
		this.addNeighborhood();
		this.neighborhood = new RescueNeighborhoodLife(game);
	}
	createPeople() {
		const count = this.game.difficulty(3, 4, 5);
		return POSITIONS.slice(0, count).map((point, index) => {
			const person = this.game.assets.person({
				name: `civilian-${NAMES[index]}`, personName: NAMES[index],
				hue: 196 + index * 24, position: [point[0], 0.12, point[1]], scale: 0.42,
				type: 'civilian', phase: index,
				role: 'waiting-citizen', reason: `${NAMES[index]} is separated from the safe shelter and needs a guide`
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
				name: `moving-hazard-${index}`, position: [0, 0.12, 0], scale: 0.62,
				phase: index * 2.3, role: 'route-hazard',
				reason: 'requires the rescuer to choose a safe curved path without harming followers'
			}));
		});
	}
	addNeighborhood() {
		const homes = [[-5.2, 3.2], [5.2, 3.2], [-5.4, 0], [5.4, 0]];
		homes.forEach((point, index) => {
			this.game.addAsset(this.game.assets.house({
				name: `rescue-home-${index}`, hue: 30 + index * 20,
				position: [point[0], 0.1, point[1]], scale: 0.34,
				role: 'neighborhood-home', reason: 'shows where separated citizens lived before the emergency'
			}));
		});
		[[-5, -3.7], [5, -3.7], [-3.1, 4.8], [3.1, 4.8]].forEach((point, index) => {
			this.game.addAsset(this.game.assets.tree({
				name: `rescue-tree-${index}`, position: [point[0], 0.1, point[1]], scale: 0.27,
				role: 'route-tree', reason: 'frames the readable safe lanes through the neighborhood'
			}));
		});
	}
	nudge(x, z) {
		this.motion.nudge(x, z);
	}
	collect() {
		const found = [];
		this.people.forEach(person => {
			if (!person.userData.rescued && this.player.position.distanceTo(person.position) < 1.05) {
				person.userData.rescued = true;
				person.userData.role = 'rescued-follower';
				person.userData.reason = 'follows the rescuer visibly until the entire group reaches shelter';
				this.game.assets.setGlow(person, 0x42ffc1, 0.28);
				this.motion.addFollower(person);
				this.rescued += 1;
				found.push(person.userData.personName);
			}
		});
		return found;
	}
	atShelter() {
		return this.rescued === this.people.length && this.player.position.distanceTo(this.shelter.position) < 1.8;
	}
	resetPlayer() {
		this.motion.reset(0, 4.8);
	}
	update(delta, elapsed) {
		this.motion.update(delta, elapsed);
		this.people.filter(person => !person.userData.rescued).forEach(person => {
			animatePerson(person, elapsed, false);
		});
		this.neighborhood.update(delta, elapsed);
		this.hazards.forEach((hazard, index) => {
			const angle = elapsed * (0.32 + index * 0.04) + hazard.userData.phase;
			hazard.position.x = Math.cos(angle) * (2.1 + index * 0.8);
			hazard.position.z = Math.sin(angle) * (2.6 + index * 0.55);
			hazard.rotation.y += delta * 1.5;
		});
	}
}
