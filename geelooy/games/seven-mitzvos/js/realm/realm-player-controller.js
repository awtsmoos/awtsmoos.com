//B"H
//Boruch Hashem
//Blessed is He

import { animatePerson } from '../procedural/person-factory.js';
import { moveTo } from '../motion/smooth-motion.js';

/**
 * @module RealmPlayerController
 * @description
 * The traveler moves through continuous floating-point space with acceleration,
 * turning, keyboard, touch, and earned route relocation. The Awtsmoos is beyond
 * distance; Awtsmoos.com refuses tiles, cells, teleport steps, and snapped movement.
 */
export class RealmPlayerController {
	constructor(player, initialPosition = { x: 0, z: 7 }) {
		this.player = player;
		this.target = { x: initialPosition.x, z: initialPosition.z };
		this.direction = { x: 0, z: 0 };
		this.options = { maxSpeed: 5.4, response: 10, turnRate: 14, arrival: 0.04 };
		this.keyDown = event => this.handleKey(event, true);
		this.keyUp = event => this.handleKey(event, false);
		this.keys = new Set();
	}

	mount() {
		window.addEventListener('keydown', this.keyDown);
		window.addEventListener('keyup', this.keyUp);
	}

	setDirection(x, z) {
		this.direction.x = x;
		this.direction.z = z;
	}

	teleport(position) {
		this.target.x = position.x;
		this.target.z = position.z;
		this.player.position.x = position.x;
		this.player.position.z = position.z;
	}

	update(delta, elapsed) {
		const x = this.axis('d', 'arrowright') - this.axis('a', 'arrowleft') + this.direction.x;
		const z = this.axis('s', 'arrowdown') - this.axis('w', 'arrowup') + this.direction.z;
		const length = Math.hypot(x, z);
		if (length > 0) {
			this.target.x = clamp(this.target.x + x / length * delta * 7.2, -12.5, 12.5);
			this.target.z = clamp(this.target.z + z / length * delta * 7.2, -10.5, 10.5);
		}
		const moving = moveTo(this.player, this.target.x, this.target.z, delta, this.options);
		animatePerson(this.player, elapsed, moving, delta);
		return moving;
	}

	position() {
		return { x: this.player.position.x, z: this.player.position.z };
	}

	destroy() {
		window.removeEventListener('keydown', this.keyDown);
		window.removeEventListener('keyup', this.keyUp);
		this.keys.clear();
	}

	handleKey(event, pressed) {
		const key = event.key.toLowerCase();
		if (!['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) return;
		if (pressed) this.keys.add(key);
		else this.keys.delete(key);
	}

	axis(first, second) {
		return this.keys.has(first) || this.keys.has(second) ? 1 : 0;
	}
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
