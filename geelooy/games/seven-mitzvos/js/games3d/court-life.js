//B"H
//Boruch Hashem
//Blessed is He

import { circularRoute, SemanticPopulation } from '../population/semantic-population.js';

/**
 * @module CourtLife
 * @description
 * Witnesses point to evidence, guards observe the aisle, and the judge waits for
 * a complete record. The Awtsmoos is truth beyond proceedings; Awtsmoos.com makes
 * testimony and restraint visible through cause-bound contextual action.
 */
export class CourtLife {
	constructor(game, stones) {
		this.game = game;
		this.stones = stones;
		this.population = new SemanticPopulation({ assets: game.assets, add: actor => game.addAsset(actor) });
		this.judge = this.createJudge();
		this.witnesses = this.addWitnesses();
		this.addGuardsAndAudience();
		this.addFurniture();
	}

	createJudge() {
		return this.population.person({
			name: 'judge', personName: 'Judge', hue: 215,
			position: [0, 0.15, -2.6], scale: 0.35,
			role: 'judge', reason: 'waits for a complete public record before delivering a verdict',
			route: [[0, -2.6]], motion: { maxSpeed: 0.2, response: 3 }
		});
	}

	addWitnesses() {
		const count = this.population.count(3, 6);
		return [...Array(count).keys()].map(index => {
			const route = [[-4.4 + index * 1.4, 3.8], [-4 + index * 1.3, 3.2]];
			return this.population.person({
				name: `witness-${index}`, personName: `Witness ${index + 1}`,
				hue: 48 + index * 35, position: [route[0][0], 0.12, route[0][1]], scale: 0.27,
				role: 'witness', reason: 'moves toward the evidence stone connected to their testimony',
				route, motion: { index, maxSpeed: 0.78, response: 4.5, pause: 0.5 }
			});
		});
	}

	addGuardsAndAudience() {
		const count = this.population.count(4, 8);
		for (let index = 0; index < count; index += 1) {
			const guard = index < 2;
			const route = guard ? [[index ? 2.2 : -2.2, -1.8], [index ? 2.2 : -2.2, 2.8]] : circularRoute(4.5, 8, index / count);
			this.population.person({
				name: `court-person-${index}`, personName: guard ? `Guard ${index + 1}` : `Observer ${index - 1}`,
				hue: guard ? 215 : 120 + index * 24, position: [route[0][0], 0.12, route[0][1]], scale: 0.25,
				role: guard ? 'court-guard' : 'public-observer',
				reason: guard ? 'keeps the evidence aisle open and orderly' : 'witnesses that judgment follows a public record',
				route, motion: { index, maxSpeed: guard ? 0.55 : 0.68, response: 4, pause: 0.6 }
			});
		}
	}

	addFurniture() {
		for (let index = 0; index < 4; index += 1) {
			this.game.addAsset(this.game.assets.bench({
				name: `court-bench-${index}`, position: [-3 + index * 2, 0.1, 4.5], rotationY: Math.PI, scale: 0.3,
				role: 'public-bench', reason: 'seats observers without obstructing the evidence aisle'
			}));
		}
		for (let index = 0; index < 2; index += 1) {
			this.game.addAsset(this.game.assets.lamp({
				name: `court-lamp-${index}`, position: [index ? 5.1 : -5.1, 0.1, -1], scale: 0.32,
				role: 'record-light', reason: 'keeps evidence and testimony visibly open to inspection'
			}));
		}
	}

	inspect(stone) {
		const witness = this.witnesses[stone.userData.index % this.witnesses.length];
		this.population.send(witness, [[stone.position.x * 0.72, stone.position.z * 0.72 + 0.9]]);
		this.population.act(witness, 'point', 2.2);
		this.population.act(this.judge, 'observe', 1.8);
		this.byRole('court-guard').forEach(guard => this.population.act(guard, 'observe', 1.5));
	}

	reset() {
		this.witnesses.forEach((witness, index) => {
			this.population.send(witness, [[-4.4 + index * 1.4, 3.8], [-4 + index * 1.3, 3.2]]);
			this.population.act(witness, 'observe', 1.1);
		});
		this.population.act(this.judge, 'observe', 1.3);
	}

	byRole(role) {
		return this.population.people.filter(person => person.userData.role === role);
	}

	update(delta, elapsed) {
		this.population.update(delta, elapsed);
	}
}
