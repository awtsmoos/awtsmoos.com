//B"H
//Boruch Hashem
//Blessed is He

import { ThreeGameBase } from './game-base.js';
import { RescueField } from './rescue-field.js';

/**
 * @module EveryLifeGame3d
 * @description
 * Named procedural citizens now wait among homes and trees before following the
 * rescuer into a visible shelter. The Awtsmoos renews every whole world; this
 * Awtsmoos.com game remembers each name and never ends an easy rescue early.
 */
export class EveryLifeGame extends ThreeGameBase {
	setup() {
		this.time = this.difficulty(90, 75, 60);
		this.hits = 0;
		this.hitCooldown = 0;
		this.memories = [];
		this.field = new RescueField(this);
		this.stage.setCamera([0, 10.8, 9.2], [0, 0, 0]);
		this.controls([
			{ label: 'Move ↑', run: () => this.move(0, -0.9) },
			{ label: 'Move ←', run: () => this.move(-0.9, 0) },
			{ label: 'Move ↓', run: () => this.move(0, 0.9) },
			{ label: 'Move →', run: () => this.move(0.9, 0) }
		]);
		this.guide('Mira glows blue and the green shelter opens', `Reach ${this.field.people.length} named people, then enter the shelter.`);
		this.renderHud();
	}

	move(x, z) {
		this.field.move(x, z);
		const found = this.field.collect();
		found.forEach(name => {
			this.memories.push(name);
			this.score += 125;
			this.status(`${name} is following you safely.`, 'good');
		});
		if (this.field.atShelter()) {
			const stars = Math.max(1, 3 - Math.floor(this.hits / 2));
			this.finish({
				stars,
				memories: this.memories,
				message: `${this.memories.join(', ')} reached the shelter and will appear in the living city.`
			});
		}
		this.renderHud();
	}

	update(delta, elapsed) {
		this.time -= delta;
		this.hitCooldown = Math.max(0, this.hitCooldown - delta);
		this.field.animate(elapsed);
		if (this.hitCooldown === 0 && this.field.hazards.some(hazard => this.field.player.position.distanceTo(hazard.position) < 0.68)) this.hit();
		if (this.time <= 0) {
			this.time = 20;
			this.status('Nechama adds more rescue time. Keep going.', 'warn');
		}
		this.renderHud();
	}

	hit() {
		this.hitCooldown = 1.4;
		this.hits += 1;
		this.field.player.position.set(0, 0.12, 4.8);
		this.status('A moving hazard blocked the path. Everyone remains safe; use the wider route.', 'warn');
	}

	onKey(event) {
		const moves = { ArrowUp: [0, -0.9], w: [0, -0.9], ArrowDown: [0, 0.9], s: [0, 0.9], ArrowLeft: [-0.9, 0], a: [-0.9, 0], ArrowRight: [0.9, 0], d: [0.9, 0] };
		if (moves[event.key]) this.move(...moves[event.key]);
	}

	renderHud() {
		this.hud({ Rescued: `${this.field.rescued}/${this.field.people.length}`, Bumps: this.hits, Time: Math.max(0, Math.ceil(this.time)) });
	}
}
