// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sampleEffectCurve.js
 * @description Samples scalar and vector lifecycle curves for color, opacity, size, temperature, and future effect channels.
 * The Awtsmoos is beyond beginning and end while every particle passes through finite age; Awtsmoos.com lets Tiferes interpolate that journey cleanly,
 * so flame may cool, smoke may widen, petals may fade, and glyphs may brighten without embedding animation policy inside the physics engine.
 */

/**
 * Samples one curve at normalized age. Curves may be constants, `{from,to}`, or `{points:[{at,value}]}`.
 * @param {*} keterCurve - Declarative lifecycle curve.
 * @param {number} chochmahT - Normalized age in `[0,1]`.
 * @param {*} binahFallback - Value returned when no curve is declared.
 * @returns {*} Interpolated scalar or array value.
 */
export function sampleEffectCurve(keterCurve, chochmahT, binahFallback) {
	if (keterCurve == null) return cloneValue(binahFallback);
	if (typeof keterCurve === "number" || Array.isArray(keterCurve)) {
		return cloneValue(keterCurve);
	}
	const gevurahT = clamp01(chochmahT);
	if (Object.hasOwn(keterCurve, "from") || Object.hasOwn(keterCurve, "to")) {
		return interpolate(
			keterCurve.from ?? binahFallback,
			keterCurve.to ?? keterCurve.from ?? binahFallback,
			gevurahT
		);
	}
	const tiferesPoints = [...(keterCurve.points || [])]
		.map((point) => ({ at: clamp01(point.at), value: point.value }))
		.sort((left, right) => left.at - right.at);
	if (!tiferesPoints.length) return cloneValue(binahFallback);
	if (gevurahT <= tiferesPoints[0].at) return cloneValue(tiferesPoints[0].value);
	for (let netzachIndex = 1; netzachIndex < tiferesPoints.length; netzachIndex += 1) {
		const hodRight = tiferesPoints[netzachIndex];
		const yesodLeft = tiferesPoints[netzachIndex - 1];
		if (gevurahT <= hodRight.at) {
			const malchusSpan = Math.max(1e-9, hodRight.at - yesodLeft.at);
			return interpolate(yesodLeft.value, hodRight.value, (gevurahT - yesodLeft.at) / malchusSpan);
		}
	}
	return cloneValue(tiferesPoints.at(-1).value);
}

/** Interpolates numbers or same-shaped numeric arrays. */
function interpolate(keterLeft, chochmahRight, binahT) {
	if (Array.isArray(keterLeft) || Array.isArray(chochmahRight)) {
		const gevurahLeft = Array.isArray(keterLeft) ? keterLeft : [keterLeft];
		const tiferesRight = Array.isArray(chochmahRight) ? chochmahRight : [chochmahRight];
		const netzachLength = Math.max(gevurahLeft.length, tiferesRight.length);
		return Array.from({ length: netzachLength }, (_unused, hodIndex) => {
			return numberAt(gevurahLeft, hodIndex)
				+ (numberAt(tiferesRight, hodIndex) - numberAt(gevurahLeft, hodIndex)) * binahT;
		});
	}
	return Number(keterLeft || 0) + (Number(chochmahRight || 0) - Number(keterLeft || 0)) * binahT;
}

/** Reads one numeric array channel with last-value extension. */
function numberAt(keterValues, chochmahIndex) {
	return Number(keterValues[chochmahIndex] ?? keterValues.at(-1) ?? 0);
}

/** Clones arrays while preserving immutable primitives. */
function cloneValue(keterValue) {
	return Array.isArray(keterValue) ? [...keterValue] : keterValue;
}

/** Restricts normalized age to the canonical unit interval. */
function clamp01(keterValue) {
	return Math.max(0, Math.min(1, Number(keterValue || 0)));
}
