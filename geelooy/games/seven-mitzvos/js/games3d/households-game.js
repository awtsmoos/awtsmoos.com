//B"H
//Boruch Hashem
//Blessed is He

import { ThreeGameBase } from './game-base.js';
import { pulseObject, ringPosition } from '../webgl/scene-kit.js';

const TOTAL_WAVES = 6;

/**
 * @module HouseholdsGame3d
 * @description
 * Four homes and six slow signals make communal protection immediately legible.
 * The Awtsmoos gives unity without confusion, while this easy Awtsmoos.com
 * defense lets a mistaken tap become a hint rather than a broken neighborhood.
 */
export class HouseholdsGame extends ThreeGameBase {
	setup() {
		this.trust = 5;
		this.round = 0;
		this.timer = 0;
		this.threatened = -1;
		this.homes = [...Array(4).keys()].map(index => this.addVessel({
			hue: this.definition.hue + index * 24,
			position: ringPosition(index, 4, 3.5, 0.7),
			scale: [1.5, 1.55, 1.5],
			name: `home-${index + 1}`,
			userData: { type: 'home', index, phase: index }
		}, true));
		this.stage.setCamera([0, 8.5, 10.2], [0, 0.5, 0]);
		this.controls(this.homes.map((home, index) => ({
			label: `Protect ${index + 1}`,
			run: () => this.protect(index)
		})));
		this.nextThreat();
	}

	nextThreat() {
		if (this.round >= TOTAL_WAVES) {
			this.finish({ stars: Math.min(3, Math.ceil(this.trust / 2)), message: 'Six homes were protected. Attention became dependable support.' });
			return;
		}
		this.round += 1;
		this.timer = Math.max(4.5, 6.2 - this.round * 0.2);
		let next = this.random(this.homes.length);
		if (next === this.threatened) next = (next + 1) % this.homes.length;
		this.threatened = next;
		this.homes.forEach((home, index) => {
			this.factory.setGlow(home, index === next ? 0xff285c : 0x000000, index === next ? 1.8 : 0);
		});
		this.status(`Easy goal: tap the bright red home. It is home ${next + 1}.`);
		this.renderHud();
	}

	picked(object) {
		if (object.userData.type === 'home') this.protect(object.userData.index);
	}

	protect(index) {
		if (index !== this.threatened) {
			this.combo = 1;
			this.status(`That home is safe. Look for the glowing red home ${this.threatened + 1}.`, 'warn');
			return;
		}
		this.score += Math.round(100 * this.combo);
		this.combo = Math.min(6, this.combo + 1);
		this.status('Correct home protected.', 'good');
		this.nextThreat();
	}

	update(delta, elapsed) {
		this.timer -= delta;
		this.homes.forEach((home, index) => {
			home.rotation.y += delta * 0.14;
			if (index === this.threatened) pulseObject(home, elapsed, 0.16, 7);
		});
		if (this.timer <= 0) {
			this.trust = Math.max(1, this.trust - 1);
			this.status('Time passed, but the easy run continues with a new signal.', 'warn');
			this.nextThreat();
		}
		this.renderHud();
	}

	onKey(event) {
		const index = Number(event.key) - 1;
		if (index >= 0 && index < 4) this.protect(index);
	}

	renderHud() {
		this.hud({ Trust: this.trust, Wave: `${this.round}/${TOTAL_WAVES}`, Time: Math.max(0, this.timer).toFixed(1) });
	}
}
