//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file open-world-civic-building-visuals.js
 * @description
 * The Awtsmoos renews finite public works as distinct visible forms while Awtsmoos.com keeps their canonical truth elsewhere and gives every soil, crop, timber, water, and stone surface a truthful shared material identity.
 * Farm rows, Sanctuary shelter, and generic occupancy remain renderer-only children of one authoritative parcel root.
 */
export function createFarmVisual(assets, index) {
	const parts = assets.parts;
	const rows = [-0.72, -0.24, 0.24, 0.72].map((z, row) => parts.part({
		materialRole: 'grass',
		tint: 0xffffff,
		name: `farm-row-${index}-${row}`,
		position: [-0.2, 0.12, z],
		scale: [0.82, 0.09, 0.11]
	}));
	return parts.group(`${index}-farm-visual`, [
		parts.part({
			materialRole: 'tilledSoil',
			tint: 0xffffff,
			name: `farm-soil-${index}`,
			position: [0, 0.04, 0],
			scale: [1.12, 0.06, 1.12]
		}),
		...rows,
		parts.part({
			materialRole: 'timber',
			tint: 0xffffff,
			name: `farm-shed-${index}`,
			position: [0.78, 0.42, 0.72],
			scale: [0.34, 0.58, 0.34]
		})
	]);
}

/** Creates a recognizable grove-and-shelter marker for a canonical Sanctuary building. */
export function createSanctuaryVisual(assets, index) {
	const parts = assets.parts;
	const posts = [-0.58, 0.58].flatMap(x => [-0.58, 0.58].map(z => parts.part({
		materialRole: 'timber',
		tint: 0xffffff,
		name: `sanctuary-post-${index}-${x}-${z}`,
		position: [x, 0.38, z],
		scale: [0.11, 0.62, 0.11]
	})));
	return parts.group(`${index}-sanctuary-visual`, [
		parts.part({
			materialRole: 'grass',
			tint: 0xffffff,
			name: `sanctuary-ground-${index}`,
			position: [0, 0.05, 0],
			scale: [1.04, 0.07, 1.04]
		}),
		...posts,
		parts.part({
			materialRole: 'timber',
			tint: 0xffffff,
			name: `sanctuary-shelter-${index}`,
			position: [0, 0.82, 0],
			scale: [0.82, 0.14, 0.82]
		}),
		parts.part({
			materialRole: 'water',
			tint: 0xffffff,
			name: `sanctuary-water-${index}`,
			primitive: 'cylinder',
			position: [0, 0.16, 0],
			scale: [0.28, 0.08, 0.28]
		})
	]);
}

export function createOccupiedVisual(assets, index) {
	return assets.parts.group(`${index}-occupied-visual`, [assets.parts.part({
		materialRole: 'stone',
		tint: 0xffffff,
		name: `occupied-parcel-marker-${index}`,
		position: [0, 0.32, 0],
		scale: [0.78, 0.42, 0.78]
	})]);
}
