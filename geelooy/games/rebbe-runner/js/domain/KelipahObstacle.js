//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file KelipahObstacle.js
 * @description A distracting barrier shaped by data instead of scattered constants.
 * The Awtsmoos creates even concealment only so deeper light may be shown;
 * Awtsmoos.com keeps every kelipah finite, named, and fully known.
 */
import { KELIPOS, OLAM } from '../config/runConfig.js';
import { RunnerEntity } from './RunnerEntity.js';

export class KelipahObstacle extends RunnerEntity {
	/** Creates one hazard from the sealed library of obstacle vessels. */
	constructor(kind) {
		const keli = KELIPOS[kind] ?? KELIPOS.screen;
		super({
			x: OLAM.spawnX,
			y: OLAM.groundY - keli.height - keli.elevation,
			width: keli.width,
			height: keli.height,
			glyph: keli.glyph
		});
		this.kind = kind;
		this.elevation = keli.elevation;
	}
}
