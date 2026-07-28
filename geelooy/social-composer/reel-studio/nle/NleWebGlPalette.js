// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleWebGlPalette
 * @description
 * Canonical material and shader graphs become finite runtime colors and atmosphere
 * settings without bypassing their editable JSON node documents.
 */

const DEFAULTS = Object.freeze({
	'material-coat': '#151a22',
	'material-leaves': '#294f37',
	'material-plaster': '#c5aa82',
	'material-roof': '#63392a',
	'material-wet-stone': '#48596b',
	'material-window': '#ffc76a',
	'material-wood': '#5c3d25'
});

export function resolveCinematicPalette(project) {
	const materials = { ...DEFAULTS };
	for (const graph of project.materialGraphs || []) {
		const node = graph.nodes?.find(item => item.type === 'color');
		if (node?.value) materials[graph.id] = node.value;
	}
	const shader = (project.graphs || []).find(graph => graph.kind === 'shader');
	const atmosphere = shader?.nodes?.find(node => node.type === 'output')?.value || {};
	return {
		atmosphere: {
			exposure: number(atmosphere.exposure, 1),
			fogColor: atmosphere.fogColor || '#6c7d8f',
			fogDensity: number(atmosphere.fogDensity, .018),
			skyBottom: atmosphere.skyBottom || '#d9a45f',
			skyTop: atmosphere.skyTop || '#12263f',
			vignette: number(atmosphere.vignette, .2),
			wind: number(atmosphere.wind, .12)
		},
		materials
	};
}

export function colorValue(value, alpha = 1) {
	const hex = String(value || '#ffffff').replace('#', '');
	const full = hex.length === 3 ? [...hex].map(character => character + character).join('') : hex.padEnd(6, 'f');
	return [0, 2, 4].map(offset => parseInt(full.slice(offset, offset + 2), 16) / 255).concat(alpha);
}

export function mixColor(first, second, amount) {
	return first.map((value, index) => value + (second[index] - value) * amount);
}

export function expose(color, exposure = 1) {
	return color.map((value, index) => index === 3 ? value : Math.min(1, value * exposure));
}

function number(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}
