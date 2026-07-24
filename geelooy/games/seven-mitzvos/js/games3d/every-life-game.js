//B"H
//Boruch Hashem
//Blessed is He

import { ThreeGameBase } from './game-base.js';
import { RescueField } from './rescue-field.js';

/**
 * @module EveryLifeGame3d
 * @description
 * Named citizens stay on screen and follow with damped spacing through a working
 * rescue neighborhood. The Awtsmoos renews every whole world; Awtsmoos.com makes
 * movement, collection, hazards, responders, supplies, and shelter one smooth act.
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
		this.guide('Mira joins behind the rescuer instead of disappearing', `Reach ${this.field.people.length} named people, then lead the visible group into shelter.`);
		this.renderHud();
	}

	move(x, z) {
		this.field.nudge(x, z);
	}

	update(delta, elapsed) {
		this.time -= delta;
		this.hitCooldown = Math.max(0, this.hitCooldown - delta);
		this.field.update(delta, elapsed);
		this.rememberFound(this.field.collect());
		if (this.field.atShelter()) {
			this.completeRescue();
		}
		const collision = this.field.hazards.some(hazard => {
			return this.field.player.position.distanceTo(hazard.position) < 0.68;
		});
		if (this.hitCooldown === 0 && collision) {
			this.hit();
		}
		if (this.time <= 0) {
			this.time = 20;
			this.status('Nechama adds more rescue time. Keep the procession together.', 'warn');
		}
		this.renderHud();
	}

	rememberFound(names) {
		names.forEach(name => {
			this.memories.push(name);
			this.score += 125;
			this.status(`${name} now follows safely behind the rescuer.`, 'good');
		});
	}

	completeRescue() {
		const stars = Math.max(1, 3 - Math.floor(this.hits / 2));
		this.finish({
			stars,
			memories: this.memories,
			message: `${this.memories.join(', ')} entered the shelter together and will appear in the living city.`
		});
	}

	hit() {
		this.hitCooldown = 1.4;
		this.hits += 1;
		this.field.resetPlayer();
		this.status('A moving hazard blocked the leader. Followers remain visible and continue after the reset.', 'warn');
	}

	onKey(event) {
		const moves = {
			ArrowUp: [0, -0.9], w: [0, -0.9],
			ArrowDown: [0, 0.9], s: [0, 0.9],
			ArrowLeft: [-0.9, 0], a: [-0.9, 0],
			ArrowRight: [0.9, 0], d: [0.9, 0]
		};
		if (moves[event.key]) {
			this.move(...moves[event.key]);
		}
	}

	renderHud() {
		this.hud({
			Rescued: `${this.field.rescued}/${this.field.people.length}`,
			Following: this.field.motion.followers.length,
			Bumps: this.hits,
			Time: Math.max(0, Math.ceil(this.time))
		});
	}
}
