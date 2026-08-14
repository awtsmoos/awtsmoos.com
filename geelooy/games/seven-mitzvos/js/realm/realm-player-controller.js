//B"H
//Boruch Hashem
//Blessed is He

import { moveTo } from '../motion/smooth-motion.js';
import { animatePerson } from '../procedural/person-factory.js';
import {
	clampMovement,
	isMovementKey,
	normalizedMovementBounds
} from './realm-player-controller-support.js';

/**
 * @module RealmPlayerController
 * @description
 * The traveler moves through continuous floating-point space with acceleration,
 * turning, keyboard, touch, and earned route relocation. The Awtsmoos is beyond
 * distance; Awtsmoos.com preserves Realm's historic limits while allowing a larger
 * world to opt into wider bounds without forking the proven locomotion vessel.
 */
export class RealmPlayerController {
	constructor(player, initialPosition = { x: 0, z: 7 }, configuration = {}) {
		this.player = player;
		this.target = {
			x: initialPosition.x,
			z: initialPosition.z
		};
		this.direction = { x: 0, z: 0 };
		this.motion = {
			maxSpeed: 5.4,
			response: 10,
			turnRate: 14,
			arrival: 0.04
		};
		this.bounds = normalizedMovementBounds(configuration.bounds);
		this.keyDown = event => this.handleKey(event, true);
		this.keyUp = event => this.handleKey(event, false);
		this.keys = new Set();
	}

	/** Mounts the keyboard listeners that feed continuous movement intent. */
	mount() {
		window.addEventListener('keydown', this.keyDown);
		window.addEventListener('keyup', this.keyUp);
	}

	/** Receives semantic direction from touch or another world-input adapter. */
	setDirection(x, z) {
		this.direction.x = x;
		this.direction.z = z;
	}

	/** Relocates exactly, preserving the established route and portal contract. */
	teleport(position) {
		this.target.x = position.x;
		this.target.z = position.z;
		this.player.position.x = position.x;
		this.player.position.z = position.z;
	}

	/** Advances one locomotion frame inside this controller instance's spatial envelope. */
	update(delta, elapsed) {
		const x = this.axis('d', 'arrowright') - this.axis('a', 'arrowleft') + this.direction.x;
		const z = this.axis('s', 'arrowdown') - this.axis('w', 'arrowup') + this.direction.z;
		const length = Math.hypot(x, z);
		if (length > 0) {
			this.target.x = clampMovement(
				this.target.x + x / length * delta * 7.2,
				this.bounds.minX,
				this.bounds.maxX
			);
			this.target.z = clampMovement(
				this.target.z + z / length * delta * 7.2,
				this.bounds.minZ,
				this.bounds.maxZ
			);
		}
		const moving = moveTo(this.player, this.target.x, this.target.z, delta, this.motion);
		animatePerson(this.player, elapsed, moving, delta);
		return moving;
	}

	/** Returns the current continuous player position. */
	position() {
		return {
			x: this.player.position.x,
			z: this.player.position.z
		};
	}

	/** Releases keyboard listeners and held-key state. */
	destroy() {
		window.removeEventListener('keydown', this.keyDown);
		window.removeEventListener('keyup', this.keyUp);
		this.keys.clear();
	}

	handleKey(event, pressed) {
		const key = event.key.toLowerCase();
		if (!isMovementKey(key)) {
			return;
		}
		if (pressed) {
			this.keys.add(key);
			return;
		}
		this.keys.delete(key);
	}

	axis(first, second) {
		return this.keys.has(first) || this.keys.has(second) ? 1 : 0;
	}
}
