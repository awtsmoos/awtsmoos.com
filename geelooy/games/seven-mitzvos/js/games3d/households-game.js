//B"H
//Boruch Hashem
//Blessed is He

import { animatePerson } from '../procedural/person-factory.js';
import { ThreeGameBase } from './game-base.js';
import { ringPosition } from '../webgl/scene-kit.js';

/**
 * @module HouseholdsGame3d
 * @description
 * Families now stand beside real procedural homes with doors, roofs, and windows.
 * The Awtsmoos joins households without erasing them; Awtsmoos.com turns each red
 * signal into a visible repair while wrong choices merely point toward need.
 */
export class HouseholdsGame extends ThreeGameBase {
	setup() {
		this.totalWaves = this.difficulty(6, 8, 10);
		this.trust = 5;
		this.round = 0;
		this.threatened = -1;
		this.timer = 0;
		this.homes = [...Array(4).keys()].map(index => this.createHome(index));
		this.stage.setCamera([0, 8.8, 10.6], [0, 0.7, 0]);
		this.controls(this.homes.map((home, index) => ({ label: `Protect ${index + 1}`, run: () => this.protect(index) })));
		this.guide('one home’s windows turn red while its family waves', 'Tap the numbered home whose windows glow red.');
		this.nextThreat();
	}

	createHome(index) {
		const position = ringPosition(index, 4, 3.7, 0.12);
		const home = this.assets.house({ name: `family-home-${index + 1}`, hue: this.definition.hue + index * 24, position, scale: 0.62, type: 'home', index });
		this.assets.parts.mark(home, { semanticType: 'home', index });
		this.addAsset(home, true);
		const family = this.assets.person({ name: `family-${index + 1}`, personName: `Family ${index + 1}`, hue: 42 + index * 45, position: [position[0] * 0.72, 0.12, position[2] * 0.72], scale: 0.3, phase: index });
		this.addAsset(family);
		home.userData.family = family;
		return home;
	}

	nextThreat() {
		if (this.round >= this.totalWaves) {
			this.finish({ stars: Math.min(3, Math.ceil(this.trust / 2)), message: 'Every family saw its home repaired and the neighborhood became dependable.' });
			return;
		}
		this.round += 1;
		this.timer = this.difficulty(6, 5, 4.2);
		let next = this.random(this.homes.length);
		if (next === this.threatened) next = (next + 1) % this.homes.length;
		this.threatened = next;
		this.homes.forEach((home, index) => this.assets.setGlow(home, index === next ? 0xff285c : 0x000000, index === next ? 1.4 : 0));
		this.status(`Home ${next + 1} needs help. Its windows glow red.`);
		this.renderHud();
	}

	picked(object) {
		if (object.userData.semanticType === 'home') this.protect(object.userData.index);
	}

	protect(index) {
		if (index !== this.threatened) {
			this.combo = 1;
			this.status(`That family is safe. Look for red windows on home ${this.threatened + 1}.`, 'warn');
			return;
		}
		this.score += Math.round(100 * this.combo);
		this.combo = Math.min(6, this.combo + 1);
		this.assets.setGlow(this.homes[index], 0x42ffc1, 0.45);
		this.status(`Family ${index + 1} celebrates the repair.`, 'good');
		this.nextThreat();
	}

	update(delta, elapsed) {
		this.timer -= delta;
		this.homes.forEach((home, index) => {
			home.rotation.y += delta * 0.05;
			animatePerson(home.userData.family, elapsed, index === this.threatened);
		});
		if (this.timer <= 0) {
			this.trust = Math.max(1, this.trust - 1);
			this.status('The family waited, but the neighborhood continues with a new signal.', 'warn');
			this.nextThreat();
		}
		this.renderHud();
	}

	onKey(event) {
		const index = Number(event.key) - 1;
		if (index >= 0 && index < 4) this.protect(index);
	}

	renderHud() {
		this.hud({ Trust: this.trust, Wave: `${this.round}/${this.totalWaves}`, Time: Math.max(0, this.timer).toFixed(1) });
	}
}
