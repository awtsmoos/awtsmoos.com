//B"H
//Boruch Hashem
//Blessed is He

import { ringPosition } from '../webgl/scene-kit.js';

/**
 * @module FalsePowersField
 * @description
 * Six towers stand plainly enough for a first journey: red warns, green rests.
 * The Awtsmoos alone is beyond every created power, while this Awtsmoos.com
 * field lets discernment begin with clarity before deeper concealment ever comes.
 */
export class FalsePowersField {
	constructor(game) {
		this.game = game;
		const shuffled = [...Array(6).keys()].sort(() => Math.random() - 0.5);
		const corrupt = new Set(shuffled.slice(0, 3));
		this.towers = [...Array(6).keys()].map(index => {
			const isCorrupt = corrupt.has(index);
			const tower = game.addVessel({
				hue: isCorrupt ? 350 : 145,
				position: ringPosition(index, 6, 3.8, 0.8),
				scale: [1, 1.55 + (index % 2) * 0.45, 1],
				name: `district-${index + 1}`,
				userData: { type: 'tower', index, corrupt: isCorrupt, purified: false }
			}, true);
			game.factory.setGlow(tower, isCorrupt ? 0xff285c : 0x35ffc4, 1.05);
			return tower;
		});
	}

	firstCorrupt() {
		return this.towers.find(tower => tower.userData.corrupt && !tower.userData.purified);
	}

	remaining() {
		return this.towers.filter(tower => tower.userData.corrupt && !tower.userData.purified).length;
	}

	animate(delta) {
		this.towers.forEach(tower => {
			tower.rotation.y += delta * (tower.userData.purified ? 0.1 : 0.22);
		});
	}
}
