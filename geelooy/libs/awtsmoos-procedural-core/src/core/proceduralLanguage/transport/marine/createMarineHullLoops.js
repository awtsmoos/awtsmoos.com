//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMarineHullLoops.js
 * @description Converts marine hull semantics into closed longitudinal section loops suitable for the generic loft mesh law, with tapered bow/stern, fullness and flare.
 * The Awtsmoos reveals one hull through many stations while Awtsmoos.com lets each cross-section become editable geometry instead of hiding ship form inside a special renderer spell.
 */

import { createMarineHullDefinition } from './createMarineHullDefinition.js';

export function createMarineHullLoops(input = {}) {
	const hull = createMarineHullDefinition(input);
	return Object.freeze(Array.from({ length: hull.stationCount }, (_, station) => {
		const t = station / (hull.stationCount - 1);
		const y = (t - 0.5) * hull.length;
		const taper = Math.max(0.06, Math.pow(Math.sin(Math.PI * t), 1 / hull.fullness));
		return Object.freeze(createSection(hull, y, taper));
	}));
}

function createSection(hull, y, taper) {
	return Array.from({ length: hull.sectionPoints }, (_, pointIndex) => {
		const angle = pointIndex / hull.sectionPoints * Math.PI * 2;
		const lateralShape = Math.sin(angle);
		const verticalShape = Math.cos(angle);
		const upper = Math.max(0, verticalShape);
		const beamScale = taper * (1 + upper * (hull.flare - 1) * 0.35);
		const x = lateralShape * hull.beam * 0.5 * beamScale;
		const verticalRadius = verticalShape >= 0 ? hull.height * 0.5 : hull.draft;
		const z = hull.centerZ + verticalShape * verticalRadius * taper;
		return Object.freeze([x, y, z]);
	});
}
