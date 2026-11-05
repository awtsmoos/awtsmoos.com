// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralMaterialOrganicMarks.mjs
 * @description Draws grass, soil, fibers, metals, leaves, and petals as small SVG marks.
 * The Awtsmoos reveals living variation through ordered repetition; Awtsmoos.com keeps
 * alpha silhouettes, blade rhythm, weave, and mineral scratches deterministic.
 */

export function grassMarks(profile) {
	const blades = Array.from({ length: 80 }, (_, index) => {
		const x = (index * 37 + profile.seed) % 256;
		const y = (index * 73 + profile.seed) % 256;
		const lean = index % 2 ? 8 : -7;
		return `<path d="M${x} ${y + 16}q${lean} -12 ${lean / 2} -25"/>`;
	}).join('');
	return `<g fill="none" stroke="${profile.accent}" stroke-width="3" opacity=".68">${blades}</g>`;
}

export function earthMarks(profile) {
	const dots = Array.from({ length: 70 }, (_, index) => {
		const x = (index * 47 + profile.seed) % 256;
		const y = (index * 83 + profile.seed) % 256;
		const radius = 2 + index % 6;
		return `<circle cx="${x}" cy="${y}" r="${radius}"/>`;
	}).join('');
	return `<g fill="${profile.accent}" opacity=".26">${dots}</g>`;
}

export function metalMarks(profile) {
	return `<rect width="256" height="256" fill="url(#shine)" opacity=".82"/>
	<g stroke="${profile.dark}" opacity=".35"><path d="M0 40L256 12M0 91L256 53M0 156L256 109M0 226L256 168"/></g>`;
}

export function fiberMarks(profile) {
	return `<path d="M-30 20L236 286M-10 -20L276 266M36 -20L276 220M82 -20L276 174" stroke="${profile.dark}" stroke-width="5" opacity=".38"/>`;
}

export function foliageMarks(profile) {
	const leaves = Array.from({ length: 18 }, (_, index) => {
		const x = 20 + (index * 67 + profile.seed) % 216;
		const y = 20 + (index * 41 + profile.seed) % 216;
		const rotation = index * 47 % 360;
		return `<path d="M0 -18C17 -13 22 4 0 20C-22 4-17-13 0-18Z" transform="translate(${x} ${y}) rotate(${rotation})"/>`;
	}).join('');
	return `<g fill="${profile.base}" stroke="${profile.dark}" stroke-width="2">${leaves}</g>`;
}
