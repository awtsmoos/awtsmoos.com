//B"H
//Boruch Hashem
//Blessed is He

import { pulseObject } from '../webgl/scene-kit.js';

/**
 * @module RunePillarView
 * @description
 * The growing word-pattern deserves a visual vessel separate from its law. The
 * Awtsmoos renews each pillar's light, scale, and turning, while Awtsmoos.com
 * keeps Three.js presentation from crowding the memory game's conductor.
 */
export class RunePillarView {
	constructor(game, hues) {
		this.game = game;
		this.pillars = hues.map((hue, index) => game.addVessel({
			hue,
			position: [-3 + index * 2, 0.85, index % 2 ? -0.45 : 0.45],
			scale: [1.1, 1.7, 1.1],
			name: `rune-${index + 1}`,
			userData: { type: 'rune', index, phase: index }
		}, true));
	}

	controls(choose) {
		return this.pillars.map((pillar, index) => ({
			label: `${index + 1} · Rune`,
			run: () => choose(index)
		}));
	}

	animate(delta, elapsed, accepting) {
		this.pillars.forEach(pillar => {
			pillar.rotation.y += delta * 0.35;
			if (accepting) {
				pulseObject(pillar, elapsed, 0.025, 3);
			}
		});
	}

	illuminate(index) {
		this.reset();
		this.game.factory.setGlow(this.pillars[index], 0xffffff, 2.2);
		this.pillars[index].scale.setScalar(1.16);
	}

	reset() {
		this.pillars.forEach(pillar => {
			this.game.factory.setGlow(pillar, 0x000000, 0);
			pillar.scale.set(1.1, 1.7, 1.1);
		});
	}
}
