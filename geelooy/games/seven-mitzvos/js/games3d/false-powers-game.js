//B"H
//Boruch Hashem
//Blessed is He

import { FalsePowersCommunity } from './false-powers-community.js';
import { FalsePowersField } from './false-powers-field.js';
import { ThreeGameBase } from './game-base.js';

/**
 * @module FalsePowersGame3d
 * @description
 * The player protects an inhabited skyline whose residents visibly evacuate a
 * corrupt broadcast and return after purification. The Awtsmoos remains the only
 * true Power; Awtsmoos.com gives every tower decision a civic consequence.
 */
export class FalsePowersGame extends ThreeGameBase {
	setup() {
		this.addNeighborhood();
		this.field = new FalsePowersField(this);
		this.community = new FalsePowersCommunity(this);
		this.selected = this.field.firstCorrupt();
		this.community.evacuate(this.selected);
		this.stage.setCamera([0, 7.4, 11], [0, 1.1, 0]);
		this.controls([{
			label: 'Purify red tower',
			kind: 'danger',
			run: () => this.purify()
		}]);
		this.guide('residents leave the red broadcast zone', `Remove ${this.field.corruptCount} red towers. Green towers are safe.`);
		this.renderHud();
	}

	addNeighborhood() {
		const homes = [[-5.2, 2.8], [5.2, 2.8], [-5.2, -2.8], [5.2, -2.8]];
		homes.forEach((point, index) => {
			this.addAsset(this.assets.house({
				name: `safe-home-${index}`, hue: 38 + index * 18,
				position: [point[0], 0.1, point[1]], scale: 0.36,
				role: 'protected-home', reason: 'shows which households depend on accurate public judgment'
			}));
		});
		[[-5.8, 0], [5.8, 0], [0, -5.4], [0, 5.4]].forEach((point, index) => {
			this.addAsset(this.assets.tree({
				name: `district-tree-${index}`, position: [point[0], 0.1, point[1]], scale: 0.3,
				role: 'district-tree', reason: 'marks healthy public space that must remain unharmed'
			}));
		});
	}

	picked(object) {
		if (object.userData.semanticType !== 'tower' || object.userData.purified) {
			return;
		}
		this.selected = object;
		const falseTower = object.userData.corrupt;
		if (falseTower) {
			this.community.evacuate(object);
		}
		this.status(
			falseTower ? `Tower ${object.userData.index + 1} broadcasts red falsehood. Residents move to safety.` : 'This green tower serves its neighbors. Choose red.',
			falseTower ? 'good' : 'warn'
		);
	}

	purify() {
		this.selected ||= this.field.firstCorrupt();
		if (!this.selected?.userData.corrupt) {
			this.status('That green district is innocent. Choose a tower with a red beacon.', 'warn');
			return;
		}
		const purified = this.selected;
		purified.userData.purified = true;
		this.score += 150 * this.combo;
		this.combo = Math.min(5, this.combo + 1);
		this.assets.setHue(purified, 48, 0.64);
		this.assets.setGlow(purified, 0xffd166, 0.7);
		purified.scale.y *= 0.72;
		this.community.celebrate(purified);
		const remaining = this.field.remaining();
		this.selected = this.field.firstCorrupt();
		this.renderHud();
		if (!remaining) {
			this.finish({ stars: 3, message: 'Residents returned, false beacons fell, and every innocent home remained safe.' });
			return;
		}
		const timer = setTimeout(() => {
			this.community.evacuate(this.selected);
		}, 850);
		this.cleanups.push(() => clearTimeout(timer));
		this.status(`Residents thank you. ${remaining} red beacon${remaining === 1 ? '' : 's'} remain.`, 'good');
	}

	update(delta, elapsed) {
		this.field.animate(delta, elapsed);
		this.community.update(delta, elapsed);
	}

	onKey(event) {
		if (['Enter', ' ', 'p'].includes(event.key)) {
			this.purify();
		}
	}

	renderHud() {
		this.hud({ Goal: this.field.corruptCount, Remaining: this.field.remaining() });
	}
}
