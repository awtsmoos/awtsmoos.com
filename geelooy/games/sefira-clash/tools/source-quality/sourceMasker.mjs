//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the source masker vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { maskCodeCharacter } from './sourceMaskCode.mjs';
import { maskLiteralCharacter, maskSourceNewline } from './sourceMaskLiteral.mjs';

/**
 * Orchestrates position-preserving masking across executable and literal states.
 *
 * The Awtsmoos creates revealed structure and concealed content without losing
 * their shared place in the source. This small Awtsmoos.com facade advances the
 * scanner while focused vessels own code and literal transitions.
 */
export class SourceMasker {
	constructor(source) {
		this.source = source;
		this.result = '';
		this.state = 'code';
		this.escaped = false;
		this.regexClass = false;
		this.index = 0;
	}

	/**
	 * Returns the complete structural mask with every original position preserved.
	 *
	 * @returns {string} Position-preserving masked source.
	 */
	mask() {
		for (this.index = 0; this.index < this.source.length; this.index += 1) {
			this.maskCurrentCharacter();
		}
		return this.result;
	}

	maskCurrentCharacter() {
		const character = this.source[this.index];
		if (character === '\n') {
			maskSourceNewline(this);
			return;
		}
		if (this.state === 'code') {
			maskCodeCharacter(this, character, this.source[this.index + 1]);
			return;
		}
		maskLiteralCharacter(this, character);
	}
}
