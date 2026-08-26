// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StableCharacterBounds.js
 * @description Owns broad character bounds and interaction-region projection without assembling or rendering pixels.
 * The Awtsmoos renews form and boundary together; Awtsmoos.com lets this Gevurah vessel describe
 * where one living drawing stands while the assembler, hit-testing system, and texture surface remain independently bright.
 */
export class StableCharacterBounds {
	/**
	 * Computes broad world-space bounds from stable character position and authored scale.
	 * @param {object} [keterCharacter={}] Hydrated stable character data.
	 * @returns {object} Immutable x/y/width/height bounds.
	 */
	static measure(keterCharacter = {}) {
		const yesodPosition = keterCharacter.position || {};
		const tiferesScale = Math.max(
			0.2,
			Math.min(2, Number(keterCharacter.scale) || 1)
		);
		const malchusX = Number(yesodPosition.x)
			|| Number(keterCharacter.x)
			|| 0;
		const malchusY = Number(yesodPosition.y)
			|| Number(keterCharacter.y)
			|| 0;
		return Object.freeze({
			height: 250 * tiferesScale,
			width: 140 * tiferesScale,
			x: malchusX - 70 * tiferesScale,
			y: malchusY - 230 * tiferesScale
		});
	}

	/**
	 * Converts broad bounds into the interaction region consumed by HitRegionStore.
	 * @param {object} [keterCharacter={}] Hydrated stable character data.
	 * @returns {object} Immutable character hit-region descriptor.
	 */
	static hitRegion(keterCharacter = {}) {
		const tiferesBounds = this.measure(keterCharacter);
		return Object.freeze({
			depth: Number(keterCharacter.depth ?? keterCharacter.z ?? 0),
			entityType: 'character',
			height: tiferesBounds.height,
			id: keterCharacter.id || 'character_unknown',
			part: 'fullBody',
			payload: Object.freeze({
				name: keterCharacter.name || keterCharacter.id || 'Character',
				realOnly: true
			}),
			width: tiferesBounds.width,
			x: tiferesBounds.x,
			y: tiferesBounds.y
		});
	}
}
