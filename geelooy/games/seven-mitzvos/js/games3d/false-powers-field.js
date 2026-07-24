//B"H
//Boruch Hashem
//Blessed is He

import { ringPosition } from '../webgl/scene-kit.js';

/**
 * @module FalsePowersField
 * @description
 * Recognizable towers now rise among homes instead of floating as anonymous
 * blocks. The Awtsmoos alone is beyond created power; Awtsmoos.com marks false
 * broadcasts with visible red beacons while keeping innocent districts green.
 */
export class FalsePowersField {
	constructor(game) {
		this.game = game;
		this.total = game.difficulty(6, 7, 8);
		this.corruptCount = game.difficulty(3, 4, 5);
		const shuffled = [...Array(this.total).keys()].sort(() => Math.random() - 0.5);
		const corrupt = new Set(shuffled.slice(0, this.corruptCount));
		this.towers = [...Array(this.total).keys()].map(index => {
			const isCorrupt = corrupt.has(index);
			const tower = game.assets.tower({
				name: `district-tower-${index + 1}`,
				hue: isCorrupt ? 350 : 145,
				position: ringPosition(index, this.total, 4.15, 0.12),
				scale: 0.58,
				type: 'tower',
				index
			});
			Object.assign(tower.userData, { corrupt: isCorrupt, purified: false });
			game.assets.parts.mark(tower, tower.userData);
			game.assets.setGlow(tower, isCorrupt ? 0xff285c : 0x35ffc4, isCorrupt ? 1.2 : 0.18);
			game.addAsset(tower, true);
			return tower;
		});
	}

	firstCorrupt() {
		return this.towers.find(tower => tower.userData.corrupt && !tower.userData.purified);
	}

	remaining() {
		return this.towers.filter(tower => tower.userData.corrupt && !tower.userData.purified).length;
	}

	animate(delta, elapsed) {
		this.towers.forEach((tower, index) => {
			tower.rotation.y += delta * (tower.userData.purified ? 0.08 : 0.18);
			if (tower.userData.corrupt && !tower.userData.purified) {
				tower.position.y = 0.12 + Math.sin(elapsed * 3 + index) * 0.045;
			}
		});
	}
}
