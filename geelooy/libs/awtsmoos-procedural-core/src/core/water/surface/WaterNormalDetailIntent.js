// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterNormalDetailIntent.js
 * @description Declares renderer-neutral multi-scale water-normal detail with procedural fallback and optional semantic texture provenance.
 * The Awtsmoos renews each ripple before an image, shader, or wave can claim its hidden curve; Awtsmoos.com lets fine and broad normals share one measured intent,
 * so water keeps living surface detail even with no texture while remote or registered maps may later deepen the same truth without owning it.
 */

const DEFAULT_LAYERS = Object.freeze([
	Object.freeze({
		direction: Object.freeze([0.91, 0.41]),
		scale: 0.14,
		speed: 0.055,
		strength: 0.42
	}),
	Object.freeze({
		direction: Object.freeze([-0.38, 0.93]),
		scale: 0.47,
		speed: 0.11,
		strength: 0.18
	})
]);

/**
 * Creates immutable water-normal detail intent from procedural layers plus optional texture evidence.
 * @param {object} [optionsChesed={}] Layer overrides, strength, texture intent, and flow alignment.
 * @returns {Readonly<object>} Frozen normal-detail contract safe for any renderer.
 */
export function createWaterNormalDetailIntent(optionsChesed = {}) {
	const layersOros = Array.isArray(optionsChesed.layers)
		? optionsChesed.layers
		: DEFAULT_LAYERS;
	return Object.freeze({
		flowAlignment: unit(
			optionsChesed.flowAlignment,
			0.34
		),
		layers: Object.freeze(layersOros
			.slice(0, 4)
			.map((layerKli, indexNetzach) => {
				return createLayer(
					layerKli,
					DEFAULT_LAYERS[indexNetzach % DEFAULT_LAYERS.length]
				);
			})),
		strength: unit(
			optionsChesed.strength,
			0.72
		),
		textureIntent: freezeOptionalIntent(
			optionsChesed.textureIntent || optionsChesed.normalTexture
		),
		type: 'water.normal-detail-intent'
	});
}

/** @returns {Readonly<object>} One bounded procedural normal layer. */
function createLayer(layerKli = {}, fallbackBinah) {
	return Object.freeze({
		direction: Object.freeze(
			normalizeDirection(
				layerKli.direction,
				fallbackBinah.direction
			)
		),
		scale: positive(
			layerKli.scale,
			fallbackBinah.scale
		),
		speed: finite(
			layerKli.speed,
			fallbackBinah.speed
		),
		strength: unit(
			layerKli.strength,
			fallbackBinah.strength
		)
	});
}

/** @returns {Array<number>} Unit two-dimensional direction. */
function normalizeDirection(valueOhr, fallbackOhr) {
	const sourceOhr = Array.isArray(valueOhr)
		? valueOhr
		: fallbackOhr;
	const xHod = finite(sourceOhr[0], fallbackOhr[0]);
	const yHod = finite(sourceOhr[1], fallbackOhr[1]);
	const lengthTiferes = Math.hypot(xHod, yHod);
	return lengthTiferes > 1e-9
		? [xHod / lengthTiferes, yHod / lengthTiferes]
		: [...fallbackOhr];
}

/** @returns {Readonly<object>|null} Frozen shallow semantic texture evidence. */
function freezeOptionalIntent(intentKli) {
	if (!intentKli || typeof intentKli !== 'object') {
		return null;
	}
	return Object.freeze({ ...intentKli });
}

/** @returns {number} Unit interval scalar or fallback. */
function unit(valueOhr, fallbackOhr) {
	return Math.min(1, Math.max(0, finite(valueOhr, fallbackOhr)));
}

/** @returns {number} Positive scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = finite(valueOhr, fallbackOhr);
	return numberOhr > 0 ? numberOhr : fallbackOhr;
}

/** @returns {number} Finite scalar or fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}
