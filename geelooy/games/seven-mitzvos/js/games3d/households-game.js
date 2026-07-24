//B"H
//Boruch Hashem
//Blessed is He

import { HouseholdNeighborhood } from './household-neighborhood.js';
import { ThreeGameBase } from './game-base.js';
import { ringPosition } from '../webgl/scene-kit.js';

/**
 * @module HouseholdsGame3d
 * @description
 * Four real homes now summon their families, neighbors, and repair workers when
 * windows glow red. The Awtsmoos joins households without erasing them; this
 * Awtsmoos.com defense makes every alert, response, and repair visibly social.
 */
export class HouseholdsGame extends ThreeGameBase {
	setup() {
		this.totalWaves = this.difficulty(6, 8, 10);
		this.trust = 5;
		this.round = 0;
		this.threatened = -1;
		this.timer = 0;
		this.homes = [...Array(4).keys()].map(index => this.createHome(index));
		this.neighborhood = new HouseholdNeighborhood(this, this.homes);
		this.stage.setCamera([0, 8.8, 10.6], [0, 0.7, 0]);
		this.controls(this.homes.map((home, index) => ({ label: `Protect ${index + 1}`, run: () => this.protect(index) })));
		this.guide('family and repair workers walk toward red windows', 'Tap the numbered home whose windows glow red.');
		this.nextThreat();
	}

	createHome(index) {
		const position = ringPosition(index, 4, 3.7, 0.12);
		const home = this.assets.house({
			name: `family-home-${index + 1}`, hue: this.definition.hue + index * 24,
			position, scale: 0.62, type: 'home', index,
			role: 'family-home', reason: `shelters family ${index + 1} and signals when repair is needed`
		});
		this.assets.parts.mark(home, { ...home.userData, semanticType: 'home', index });
		return this.addAsset(home, true);
	}

	nextThreat() {
		if (this.round >= this.totalWaves) {
			this.finish({ stars: Math.min(3, Math.ceil(this.trust / 2)), message: 'Families, neighbors, and workers restored every home together.' });
			return;
		}
		this.round += 1;
		this.timer = this.difficulty(6, 5, 4.2);
		let next = this.random(this.homes.length);
		if (next === this.threatened) {
			next = (next + 1) % this.homes.length;
		}
		this.threatened = next;
		this.homes.forEach((home, index) => {
			this.assets.setGlow(home, index === next ? 0xff285c : 0x000000, index === next ? 1.4 : 0);
		});
		this.neighborhood.threaten(next);
		this.status(`Home ${next + 1} needs help. Its family and repair workers are moving toward it.`);
		this.renderHud();
	}

	picked(object) {
		if (object.userData.semanticType === 'home') {
			this.protect(object.userData.index);
		}
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
		this.neighborhood.repaired(index);
		this.status(`Family ${index + 1} returns calmly after the repair.`, 'good');
		this.nextThreat();
	}

	update(delta, elapsed) {
		this.timer -= delta;
		this.neighborhood.update(delta, elapsed);
		this.homes.forEach(home => {
			home.rotation.y += delta * 0.05;
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
		if (index >= 0 && index < 4) {
			this.protect(index);
		}
	}

	renderHud() {
		this.hud({ Trust: this.trust, Wave: `${this.round}/${this.totalWaves}`, Time: Math.max(0, this.timer).toFixed(1) });
	}
}
