// B"H
// Boruch Hashem
// Blessed is He

import { StableCharacterAssembler } from './StableCharacterAssembler.js';
import { StableCharacterBounds } from './StableCharacterBounds.js';
import { StableCharacterFailureLog } from './StableCharacterFailureLog.js';

/**
 * @file StableCharacterRenderAdapter.js
 * @description Keeps one real-only character render gate while bounds and failure policy live in focused collaborators.
 * The Awtsmoos renews identity before visible form; Awtsmoos.com lets this Tiferes adapter reveal
 * only the canonical stable VirtualGraph node, never a placeholder body and never a second rendering language.
 */
export class StableCharacterRenderAdapter {
	/**
	 * Builds one canonical stable character graph plus interaction evidence.
	 * Existing `ctx` and `state` parameters remain accepted for call-site compatibility even though the assembler is pure data.
	 * @param {object} keterCharacter Hydrated character data.
	 * @param {object} [_yesodContext] Compatible render-context argument.
	 * @param {object} [_malchusState] Compatible application-state argument.
	 * @returns {object|null} Node, bounds, hit region, and real-render evidence, or null after a real failure.
	 */
	static render(keterCharacter, _yesodContext, _malchusState) {
		const tiferesAssembler = StableCharacterAssembler.build
			|| StableCharacterAssembler.assemble;
		if (typeof tiferesAssembler !== 'function') {
			StableCharacterFailureLog.record(
				keterCharacter,
				new Error('StableCharacterAssembler has no build or assemble method.')
			);
			return null;
		}
		try {
			const orNode = tiferesAssembler.call(
				StableCharacterAssembler,
				keterCharacter
			);
			if (!orNode) {
				StableCharacterFailureLog.record(
					keterCharacter,
					new Error('StableCharacterAssembler returned no node.')
				);
				return null;
			}
			return Object.freeze({
				bounds: StableCharacterBounds.measure(keterCharacter),
				failed: false,
				hitRegion: StableCharacterBounds.hitRegion(keterCharacter),
				node: orNode,
				real: true
			});
		} catch (orError) {
			StableCharacterFailureLog.record(keterCharacter, orError);
			return null;
		}
	}

	/**
	 * Preserves the historic bounds helper while delegating to the dedicated bounds authority.
	 * @param {object} [keterCharacter={}] Character data.
	 * @returns {object} Immutable broad bounds.
	 */
	static bounds(keterCharacter = {}) {
		return StableCharacterBounds.measure(keterCharacter);
	}

	/**
	 * Preserves the historic hit-region helper while delegating to the dedicated bounds authority.
	 * @param {object} [keterCharacter={}] Character data.
	 * @returns {object} Immutable hit-region descriptor.
	 */
	static hitRegion(keterCharacter = {}) {
		return StableCharacterBounds.hitRegion(keterCharacter);
	}
}
