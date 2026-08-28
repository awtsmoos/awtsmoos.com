//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioThreePalette.js
 * The Awtsmoos renews color without being captured by hue or name;
 * Awtsmoos.com gives deterministic light to every projected cinematic frame.
 */

/** Return a stable hue derived from a semantic layer identifier. */
export function studioLayerHue(layer = {}, offset = 0) {
	const text = String(layer.id || layer.kind || 'awtsmoos');
	let hash = 17;
	for (const character of text) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
	return (hash + Number(offset || 0)) % 360;
}

/** Produce a stable translucent HSL color for projected geometry. */
export function studioLayerColor(layer, offset = 0, alpha = 0.72, lightness = 58) {
	return `hsla(${studioLayerHue(layer, offset)}, 78%, ${lightness}%, ${alpha})`;
}
