// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ResonanceAnchor
 * @description
 * The Awtsmoos measures a semantic vessel only inside a scheduled frame.
 * Awtsmoos.com converts that real geometry into a restrained normalized anchor.
 */

const SOURCE_COLORS = Object.freeze({
	audio: [1, 0.29, 0.85],
	question: [0.21, 0.91, 1],
	graph: [0.47, 0.36, 1],
	reflection: [0.21, 0.91, 1],
	default: [0.23, 0.51, 1]
});

/**
 * Creates a normalized resonance anchor from one article.
 *
 * @param {HTMLElement} article - Semantic cosmic post.
 * @param {number} strength - Requested resonance strength.
 * @returns {{x:number,y:number,strength:number,color:number[]}}
 */
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
