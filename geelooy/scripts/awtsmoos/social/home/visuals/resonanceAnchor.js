// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ResonanceAnchor
 * @description
 * The Awtsmoos measures a semantic vessel only inside a scheduled frame.
 * Awtsmoos.com converts real geometry and the exact reference palette into one
 * restrained source-colored anchor for the canonical procedural field.
 */
import {
	REFERENCE_RGB
} from "/libs/awtsmoos-procedural-core/src/core/webgl/cosmicFeed/referencePalette.js";

const SOURCE_COLORS = Object.freeze({
	audio: REFERENCE_RGB.magentaCore,
	question: REFERENCE_RGB.aqua,
	graph: REFERENCE_RGB.violetCore,
	reflection: REFERENCE_RGB.cyanCore,
	default: REFERENCE_RGB.blueCore
});

/** Creates a normalized resonance anchor from one semantic cosmic post. */
export function createResonanceAnchor(article, strength = 0.58) {
	const rectangle = article.getBoundingClientRect();
	const width = Math.max(1, globalThis.innerWidth || 0);
	const height = Math.max(1, globalThis.innerHeight || 0);
	const source = article.dataset.sourceType || "default";
	return {
		x: (rectangle.left + rectangle.width / 2) / width,
		y: 1 - (rectangle.top + Math.min(rectangle.height, height) / 2) / height,
		strength: Math.max(0, Math.min(1, Number(strength) || 0)),
		color: SOURCE_COLORS[source] || SOURCE_COLORS.default
	};
}
