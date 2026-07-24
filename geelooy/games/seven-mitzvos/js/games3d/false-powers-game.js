//B"H
//Boruch Hashem
//Blessed is He

import { FalsePowersField } from './false-powers-field.js';
import { ThreeGameBase } from './game-base.js';
import { pulseObject } from '../webgl/scene-kit.js';

/**
 * @module FalsePowersGame3d
 * @description
 * Red towers confess their danger before the player is asked to act. The
 * Awtsmoos remains the only true Power, while this easy Awtsmoos.com lesson
 * turns each purification into a clear, forgiving first victory.
 */
export class FalsePowersGame extends ThreeGameBase {
	setup() {
		this.field = new FalsePowersField(this);
		this.selected = this.field.firstCorrupt();
		this.stage.setCamera([0, 7.2, 10.4], [0, 1, 0]);
		this.controls([{ label: 'Purify red tower', kind: 'danger', run: () => this.purify() }]);
		this.status('Easy goal: remove the three glowing red towers. Green towers are safe.');
		this.renderHud();
	}

	picked(object) {
		if (object.userData.type !== 'tower' || object.userData.purified) {
			return;
		}
		this.selected = object;
		const word = object.userData.corrupt ? 'red and false' : 'green and safe';
		const next = object.userData.corrupt ? 'Purify it.' : 'Choose a red tower.';
		this.status(`Tower ${object.userData.index + 1} is ${word}. ${next}`);
	}

	purify() {
		if (!this.selected) {
			this.selected = this.field.firstCorrupt();
		}
		if (!this.selected?.userData.corrupt) {
			this.status('That green tower is safe. Tap any glowing red tower instead.', 'warn');
			return;
		}
		this.selected.userData.purified = true;
		this.score += 150 * this.combo;
		this.combo = Math.min(4, this.combo + 1);
		this.factory.setHue(this.selected, 48, 0.72);
		this.factory.setGlow(this.selected, 0xffd166, 1.35);
		this.selected.scale.y *= 0.55;
		const remaining = this.field.remaining();
		this.selected = this.field.firstCorrupt();
		this.renderHud();
		if (remaining === 0) {
			this.finish({ stars: 3, message: 'All three false powers were removed. Clear sight became careful action.' });
			return;
		}
		this.status(`Great. Only ${remaining} red tower${remaining === 1 ? '' : 's'} left.`, 'good');
	}

	update(delta, elapsed) {
		this.field.animate(delta);
		if (this.selected) {
			pulseObject(this.selected, elapsed, 0.1, 6);
		}
	}

	onKey(event) {
		if (['Enter', ' ', 'p'].includes(event.key)) this.purify();
	}

	renderHud() {
		this.hud({ Goal: '3 red', Remaining: this.field.remaining() });
	}
}
