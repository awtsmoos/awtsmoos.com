//B"H
//Boruch Hashem
//Blessed is He

import { FalsePowersField } from './false-powers-field.js';
import { ThreeGameBase } from './game-base.js';

/**
 * @module FalsePowersGame3d
 * @description
 * The player now protects a small inhabited skyline, not a ring of cubes. The
 * Awtsmoos remains the only true Power; Awtsmoos.com lets red broadcast beacons
 * collapse into warm civic light while green homes remain unharmed.
 */
export class FalsePowersGame extends ThreeGameBase {
	setup() {
		this.addNeighborhood();
		this.field = new FalsePowersField(this);
		this.selected = this.field.firstCorrupt();
		this.stage.setCamera([0, 7.4, 11], [0, 1.1, 0]);
		this.controls([{ label: 'Purify red tower', kind: 'danger', run: () => this.purify() }]);
		this.guide('a red beacon pulses while green towers remain calm', `Remove ${this.field.corruptCount} red towers. Green towers are safe.`);
		this.renderHud();
	}

	addNeighborhood() {
		[[-5.2, 0.1, 2.8], [5.2, 0.1, 2.8]].forEach((position, index) => {
			this.addAsset(this.assets.house({ name: `safe-home-${index}`, hue: 38 + index * 18, position, scale: 0.42 }));
		});
		[[-5, 0.1, -2.5], [5, 0.1, -2.5]].forEach((position, index) => {
			this.addAsset(this.assets.tree({ name: `city-tree-${index}`, position, scale: 0.34 }));
		});
	}

	picked(object) {
		if (object.userData.semanticType !== 'tower' || object.userData.purified) return;
		this.selected = object;
		const falseTower = object.userData.corrupt;
		this.status(falseTower ? `Tower ${object.userData.index + 1} broadcasts red falsehood. Purify it.` : 'This green tower serves its neighbors. Choose red.', falseTower ? 'good' : 'warn');
	}

	purify() {
		this.selected ||= this.field.firstCorrupt();
		if (!this.selected?.userData.corrupt) {
			this.status('That green district is innocent. Choose a tower with a red beacon.', 'warn');
			return;
		}
		this.selected.userData.purified = true;
		this.score += 150 * this.combo;
		this.combo = Math.min(5, this.combo + 1);
		this.assets.setHue(this.selected, 48, 0.64);
		this.assets.setGlow(this.selected, 0xffd166, 0.7);
		this.selected.scale.y *= 0.72;
		const remaining = this.field.remaining();
		this.selected = this.field.firstCorrupt();
		this.renderHud();
		if (!remaining) {
			this.finish({ stars: 3, message: 'The false beacons fell, homes remained safe, and the skyline became peaceful.' });
			return;
		}
		this.status(`The neighborhood cheers. ${remaining} red beacon${remaining === 1 ? '' : 's'} remain.`, 'good');
	}

	update(delta, elapsed) {
		this.field.animate(delta, elapsed);
	}

	onKey(event) {
		if (['Enter', ' ', 'p'].includes(event.key)) this.purify();
	}

	renderHud() {
		this.hud({ Goal: this.field.corruptCount, Remaining: this.field.remaining() });
	}
}
