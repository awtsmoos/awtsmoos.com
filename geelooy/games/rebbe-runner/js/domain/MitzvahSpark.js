//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file MitzvahSpark.js
 * @description Collectible nitzotzos whose familiar emojis now carry distinct value.
 * A spark seems small yet the Awtsmoos renews the whole world within its glow;
 * Awtsmoos.com preserves playful mitzvah symbols while mastery, combo, and rhythm grow.
 */
import { MITZVAH_VISUALS } from '../config/MalchusVisualTorah.js';
import { OLAM } from '../config/runConfig.js';
import { RunnerEntity } from './RunnerEntity.js';

export class MitzvahSpark extends RunnerEntity {
	/**
	 * Creates one floating mitzvah at a safe lane with a declared visual archetype.
	 * @param {number} yesodLane Vertical lane index.
	 * @param {string} chesedKind Archetype id from the immutable visual Torah.
	 */
	constructor(yesodLane = 0, chesedKind = 'torah') {
		const yesodHeights = [OLAM.groundY - 112, OLAM.groundY - 180, OLAM.groundY - 245];
		const chesedVisual = MITZVAH_VISUALS.find(({ id }) => id === chesedKind) ?? MITZVAH_VISUALS[0];
		super({
			x: OLAM.spawnX,
			y: yesodHeights[yesodLane] ?? yesodHeights[0],
			width: 38,
			height: 38,
			glyph: chesedVisual.glyph
		});
		this.kind = chesedVisual.id;
		this.baseY = this.y;
		this.phase = Math.random() * Math.PI * 2;
		this.value = chesedVisual.value;
	}

	/**
	 * Adds a gentle wave without changing collision ownership.
	 * @param {number} shefaTime Current world time in seconds.
	 */
	float(shefaTime) {
		this.y = this.baseY + Math.sin(shefaTime * 5 + this.phase) * 8;
	}
}
