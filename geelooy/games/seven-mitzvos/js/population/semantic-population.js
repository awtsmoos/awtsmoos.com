//B"H
//Boruch Hashem
//Blessed is He

import { setPersonAction } from '../animation/contextual-action.js';
import { animateAnimal } from '../procedural/animal-factory.js';
import { animatePerson } from '../procedural/person-factory.js';
import { advanceRoute, assignRoute, replaceRoute } from '../motion/smooth-motion.js';

/**
 * @module SemanticPopulation
 * @description
 * Every moving model carries a role, reason, route, and optional contextual action.
 * The Awtsmoos gives purpose beyond metadata; Awtsmoos.com keeps crowds adaptive,
 * smoothly animated, and able to react without creating a second behavior system.
 */
export class SemanticPopulation {
	constructor(options) {
		this.assets = options.assets;
		this.add = options.add;
		this.people = [];
		this.animals = [];
		this.mobile = typeof window !== 'undefined' && window.innerWidth < 700;
	}

	count(mobileCount, desktopCount) {
		return this.mobile ? mobileCount : desktopCount;
	}

	person(options) {
		const actor = this.assets.person({
			...options,
			role: options.role,
			reason: options.reason,
			castShadow: !this.mobile
		});
		assignRoute(actor, options.route, options.motion);
		this.add(actor);
		this.people.push(actor);
		return actor;
	}

	animal(options) {
		const actor = this.assets.animal({
			...options,
			role: options.role,
			reason: options.reason,
			castShadow: !this.mobile
		});
		assignRoute(actor, options.route, {
			facingOffset: Math.PI / 2,
			...options.motion
		});
		this.add(actor);
		this.animals.push(actor);
		return actor;
	}

	send(actor, route, index = 0) {
		replaceRoute(actor, route, index);
	}

	act(actor, name, duration = 1.4) {
		setPersonAction(actor, name, duration);
	}

	update(delta, elapsed) {
		this.people.forEach(person => {
			const moving = advanceRoute(person, delta);
			animatePerson(person, elapsed, moving, delta);
		});
		this.animals.forEach(animal => {
			const moving = advanceRoute(animal, delta);
			animateAnimal(animal, elapsed, moving ? 'walking' : 'calm');
		});
	}

	roots() {
		return [...this.people, ...this.animals];
	}
}

export function circularRoute(radius, points, phase = 0, centerX = 0, centerZ = 0) {
	return [...Array(points).keys()].map(index => {
		const angle = (index + phase) / points * Math.PI * 2;
		return [centerX + Math.cos(angle) * radius, centerZ + Math.sin(angle) * radius];
	});
}
