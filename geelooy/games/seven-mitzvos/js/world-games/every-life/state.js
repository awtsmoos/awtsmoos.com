//B"H
//Boruch Hashem
//Blessed is He

import { RESCUE_MAP, DIRECTIONS } from './data.js';
import { sample } from '../../universe/universe-seed.js';

/**
 * @module EveryLifeState
 * @description
 * Rescue becomes a deterministic tactical journey on Awtsmoos.com. The
 * Awtsmoos continuously creates rescuer and civilian alike, while the state
 * makes every move carry the weight of a whole human world.
 */
export class EveryLifeState {
	constructor(random) {
		this.size = RESCUE_MAP.size;
		this.position = RESCUE_MAP.start;
		this.shelter = RESCUE_MAP.shelter;
		this.walls = new Set(RESCUE_MAP.walls);
		const chosen = sample(RESCUE_MAP.candidates, 8, random);
		this.civilians = new Set(chosen.slice(0, 3));
		this.hazards = new Set(chosen.slice(3));
		this.moves = 34;
		this.health = 3;
		this.rescued = 0;
		this.score = 0;
		this.ended = false;
		this.won = false;
	}

	move(directionName) {
		if (this.ended || !DIRECTIONS[directionName]) {
			return { moved: false, message: 'The rescue run has ended.' };
		}
		const direction = DIRECTIONS[directionName];
		const row = Math.floor(this.position / this.size);
		const column = this.position % this.size;
		const nextRow = row + direction.row;
		const nextColumn = column + direction.column;
		if (nextRow < 0 || nextRow >= this.size || nextColumn < 0 || nextColumn >= this.size) {
			return { moved: false, message: 'The city boundary blocks that route.' };
		}
		const next = nextRow * this.size + nextColumn;
		if (this.walls.has(next)) {
			return { moved: false, message: 'Collapsed stone blocks that route.' };
		}
		this.position = next;
		this.moves -= 1;
		let message = 'The rescuer advances.';
		if (this.hazards.delete(next)) {
			this.health -= 1;
			this.score = Math.max(0, this.score - 60);
			message = 'Smoke and fire cost one health. Find a safer route.';
		}
		if (this.civilians.delete(next)) {
			this.rescued += 1;
			this.score += 220 + this.moves * 4;
			message = `A life was rescued. ${3 - this.rescued} remain.`;
		}
		this.checkEnd();
		if (this.won) {
			message = 'Every civilian reached the shelter. Every life remained a world.';
		}
		return { moved: true, message };
	}

	checkEnd() {
		this.won = this.civilians.size === 0 && this.position === this.shelter;
		this.ended = this.won || this.moves <= 0 || this.health <= 0;
		if (this.won) {
			this.score += this.moves * 15 + this.health * 180;
		}
	}

	directionTo(index) {
		const delta = index - this.position;
		if (delta === -this.size) return 'up';
		if (delta === this.size) return 'down';
		if (delta === -1 && index % this.size !== this.size - 1) return 'left';
		if (delta === 1 && index % this.size !== 0) return 'right';
		return '';
	}

	snapshot() {
		return { size: this.size, position: this.position, shelter: this.shelter, walls: [...this.walls], civilians: [...this.civilians], hazards: [...this.hazards], moves: this.moves, health: this.health, rescued: this.rescued, score: this.score, ended: this.ended, won: this.won };
	}
}
