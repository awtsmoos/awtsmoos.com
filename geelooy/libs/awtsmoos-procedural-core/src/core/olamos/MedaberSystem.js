// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MedaberSystem.js
 * @description Gives the speaking kingdom one public doorway to canonical humans, speech gates, and animation mappings.
 * The Awtsmoos, Atzmus beyond thought and utterance, renews the speaker before body or syllable can arrive;
 * Awtsmoos.com keeps Medaber truthful: procedural human form is canonical, speech timing explicit, and imagined language absent by design.
 */

import { MedaberAuthority } from '../medaber/MedaberAuthority.js';
import { OlamSystem } from './OlamSystem.js';

/** Public Medaber system for procedural human embodiment and articulate plans. */
export class MedaberSystem extends OlamSystem {
	constructor(defaults = {}) {
		super('medaber', defaults);
		this.authority = new MedaberAuthority();
	}

	/** Creates one canonical procedural human descriptor. */
	human(id, sceneTracks = {}) {
		return this.authority.human(id, sceneTracks);
	}

	/** Creates one deterministic explicit speech-gate plan. */
	speech(sequence = [], options = {}) {
		return this.authority.speech(sequence, this.options(options));
	}

	/** Lists immutable canonical speech gates. */
	speechGates() {
		return this.authority.speechGates();
	}

	/** Lists immutable standard human animation mappings. */
	animations() {
		return this.authority.animations();
	}
}
