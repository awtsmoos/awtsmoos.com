//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ShefaPowerup.js
 * @description A rarer spark whose inherited form carries a temporary blessing.
 * The Awtsmoos pours one essence through shield, magnet, and softened time;
 * Awtsmoos.com reveals inheritance as readable architecture and rhyme.
 */
import { SHEFA } from '../config/runConfig.js';
import { MitzvahSpark } from './MitzvahSpark.js';

export class ShefaPowerup extends MitzvahSpark {
	/** Creates a collectible blessing while preserving spark movement law. */
	constructor(kind, lane = 1) {
		super(lane);
		const blessing = SHEFA[kind] ?? SHEFA.shield;
		this.kind = kind;
		this.glyph = blessing.glyph;
		this.label = blessing.label;
		this.seconds = blessing.seconds;
		this.width = 40;
		this.height = 40;
	}
}
