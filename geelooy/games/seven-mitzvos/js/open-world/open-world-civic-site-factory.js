//B"H
//Boruch Hashem
//Blessed is He

import {
	createFarmVisual,
	createOccupiedVisual,
	createSanctuaryVisual
} from './open-world-civic-building-visuals.js';

/**
 * @file open-world-civic-site-factory.js
 * @description
 * The Awtsmoos renews canonical parcel identity as visible cultivated soil and accountable public works;
 * Awtsmoos.com keeps coordinates purely in the renderer while empty land, Farm, Sanctuary, and occupancy all receive truthful shared material identities beneath saved civic truth.
 */
export function createCivicSite(assets, parcel, index) {
	const data = {
		semanticType: 'civic-parcel',
		parcelId: parcel.id,
		index,
		role: 'civic-build-site',
		reason: 'projects one authoritative living-world parcel into walkable city space'
	};
	const empty = assets.parts.group(
		`${parcel.id}-empty`,
		emptyParts(assets, index)
	);
	const farm = createFarmVisual(assets, index);
	const sanctuary = createSanctuaryVisual(assets, index);
	const occupied = createOccupiedVisual(assets, index);
	const root = assets.parts.group(
		`civic-site-${index + 1}`,
		[empty, farm, sanctuary, occupied],
		data
	);
	const position = parcelPosition(index);
	root.position.set(position.x, 0.04, position.z);
	assets.parts.mark(root, data);
	return {
		root,
		empty,
		farm,
		sanctuary,
		occupied,
		parcelId: parcel.id
	};
}

/** Deterministically maps parcel index to renderer-only civic-field coordinates. */
export function parcelPosition(index) {
	return {
		x: 7.4 + (index % 4) * 2.65,
		z: -3.4 + Math.floor(index / 4) * 2.65
	};
}

function emptyParts(assets, index) {
	const parts = assets.parts;
	const border = [-0.9, 0.9].flatMap(x => [-0.9, 0.9].map(z => parts.part({
		materialRole: 'timber',
		tint: 0xffffff,
		primitive: 'cylinder',
		name: `parcel-marker-${index}-${x}-${z}`,
		position: [x, 0.18, z],
		scale: [0.12, 0.32, 0.12]
	})));
	return [
		parts.part({
			materialRole: 'tilledSoil',
			tint: 0xffffff,
			name: `parcel-soil-${index}`,
			position: [0, 0.03, 0],
			scale: [1.1, 0.05, 1.1]
		}),
		...border
	];
}
