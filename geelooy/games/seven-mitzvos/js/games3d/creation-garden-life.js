//B"H
//Boruch Hashem
//Blessed is He

import { circularRoute, SemanticPopulation } from '../population/semantic-population.js';

/**
 * @module CreationGardenLife
 * @description
 * Students walk between rune lessons, point toward active light, and observe the
 * ordered pattern while animals use the garden edge. The Awtsmoos creates listener
 * with word; Awtsmoos.com makes attention visible without blocking memory play.
 */
export class CreationGardenLife {
	constructor(game, runes) {
		this.game = game;
		this.runes = runes;
		this.population = new SemanticPopulation({ assets: game.assets, add: actor => game.addAsset(actor) });
		this.routes = [];
		this.addStudents();
		this.addAnimals();
		this.addStudySpace();
	}

	addStudents() {
		const count = this.population.count(4, 7);
		for (let index = 0; index < count; index += 1) {
			const route = circularRoute(4.25, 8, index / count);
			this.routes.push(route);
			this.population.person({
				name: `rune-student-${index}`, personName: `Student ${index + 1}`,
				hue: 196 + index * 31, position: [route[0][0], 0.12, route[0][1]], scale: 0.27,
				role: index === 0 ? 'lesson-guide' : 'rune-student',
				reason: index === 0 ? 'demonstrates the first glowing pattern' : 'studies how ordered words shape the garden',
				route, motion: { index, maxSpeed: 0.78, response: 4.5, pause: 0.45 }
			});
		}
	}

	addAnimals() {
		const count = this.population.count(1, 2);
		for (let index = 0; index < count; index += 1) {
			const route = circularRoute(5.1, 7, index / count);
			this.population.animal({
				name: `garden-animal-${index}`, species: index ? 'sheep' : 'deer', hue: 34 + index * 22,
				position: [route[0][0], 0.12, route[0][1]], scale: 0.24,
				role: 'garden-grazer', reason: 'shows that remembered creation sustains living creatures',
				route, motion: { index, maxSpeed: 0.42, response: 3.2, pause: 0.7 }
			});
		}
	}

	addStudySpace() {
		this.game.addAsset(this.game.assets.fountain({
			name: 'creation-fountain', position: [0, 0.1, -3.6], scale: 0.3,
			role: 'creation-water', reason: 'visibly links remembered words with a growing garden'
		}));
		for (let index = 0; index < 2; index += 1) {
			this.game.addAsset(this.game.assets.bench({
				name: `study-bench-${index}`, position: [index ? 5 : -5, 0.1, 2.4], rotationY: index ? -1.1 : 1.1, scale: 0.32,
				role: 'study-bench', reason: 'gives students a place to review a difficult light pattern'
			}));
		}
	}

	focus(index) {
		const rune = this.runes[index];
		this.population.people.slice(0, 3).forEach((student, studentIndex) => {
			const angle = -0.7 + studentIndex * 0.7;
			this.population.send(student, [[rune.position.x + Math.sin(angle) * 1.45, rune.position.z + 1.35 + Math.cos(angle) * 0.35]]);
			this.population.act(student, studentIndex === 0 ? 'point' : 'observe', 1.6);
		});
	}

	resume() {
		this.population.people.forEach((student, index) => {
			this.population.send(student, this.routes[index], index);
			this.population.act(student, 'observe', 1);
		});
	}

	update(delta, elapsed) {
		this.population.update(delta, elapsed);
	}
}
