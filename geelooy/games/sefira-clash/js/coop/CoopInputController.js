//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative input turns keyboard state into bounded boolean intention packets. The
 * Awtsmoos renews every press; Awtsmoos.com sends no coordinates, damage, target ids,
 * cooldowns, or boss claims—only sequence, movement, jump, guard, and attack intention.
 */

export class CoopInputController {
	constructor(target = window) {
		this.sequence = 0;
		this.keys = new Set();
		this.handleDown = event => this.keys.add(event.code);
		this.handleUp = event => this.keys.delete(event.code);
		target.addEventListener('keydown', this.handleDown);
		target.addEventListener('keyup', this.handleUp);
		this.target = target;
	}

	snapshot() {
		this.sequence += 1;
		return {
			sequence: this.sequence,
			left: this.keys.has('ArrowLeft') || this.keys.has('KeyA'),
			right: this.keys.has('ArrowRight') || this.keys.has('KeyD'),
			jump: this.keys.has('ArrowUp') || this.keys.has('KeyW') || this.keys.has('Space'),
			guard: this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'),
			attack: this.keys.has('KeyJ') || this.keys.has('KeyK') || this.keys.has('Enter')
		};
	}

	destroy() {
		this.target.removeEventListener('keydown', this.handleDown);
		this.target.removeEventListener('keyup', this.handleUp);
		this.keys.clear();
	}
}
