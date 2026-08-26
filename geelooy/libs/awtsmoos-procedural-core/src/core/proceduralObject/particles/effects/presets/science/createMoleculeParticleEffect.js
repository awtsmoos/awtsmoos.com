// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMoleculeParticleEffect.js
 * @description Converts arbitrary caller-defined atoms and bonds into a renderer-neutral molecular visualization recipe instead of hard-coding one molecule.
 * The Awtsmoos is beyond element and bond; Awtsmoos.com lets many finite centers appear connected while Daas keeps atom identity entirely in data,
 * so water, caffeine, crystals, invented game matter, or educational diagrams share one API without claiming that this visualizer computes chemistry.
 */

/** Creates a molecule visualization from arbitrary atom and bond data. */
export function createMoleculeParticleEffect(keterOptions = {}) {
	const chochmahAtoms = Array.isArray(keterOptions.atoms) ? keterOptions.atoms : [];
	if (!chochmahAtoms.length) {
		throw new RangeError('B"H | Molecule particle effects require at least one atom.');
	}
	const binahLayers = chochmahAtoms.map((atom, index) => atomLayer(atom, index));
	const gevurahBonds = (keterOptions.bonds || []).map((bond) => ({
		from: Number(bond.from),
		kind: 'molecular-bond',
		order: Math.max(1, Number(bond.order ?? 1)),
		to: Number(bond.to)
	}));
	return {
		connections: gevurahBonds,
		id: String(keterOptions.id || 'molecule'),
		layers: binahLayers,
		metadata: { model: 'molecular-graph-visualization', preset: 'molecule', visualizationOnly: true },
		quality: keterOptions.quality || 'high',
		seed: keterOptions.seed ?? keterOptions.id ?? 'molecule'
	};
}

/** Creates one stationary generated atom at the caller's exact position. */
function atomLayer(keterAtom, chochmahIndex) {
	const binahElement = String(keterAtom.element || keterAtom.label || 'X');
	const gevurahRadius = Math.max(1e-6, Number(keterAtom.radius ?? 0.12));
	return {
		appearance: {
			color: keterAtom.color || elementColor(binahElement),
			form: { kind: 'disc', outerRadius: gevurahRadius },
			kind: 'procedural'
		},
		attributes: { atomIndex: chochmahIndex, element: binahElement },
		capacity: 1,
		id: `atom-${chochmahIndex}-${binahElement}`,
		initialBurst: 1,
		lifetime: [300, 300],
		position: keterAtom.position || [0, 0, 0],
		size: [gevurahRadius, gevurahRadius],
		spawn: { kind: 'point' },
		speed: [0, 0]
	};
}

/** Returns a compact visualization palette rather than a chemical-material authority. */
function elementColor(keterElement) {
	const chochmahPalette = {
		C: [0.2, 0.2, 0.23, 1],
		H: [0.92, 0.92, 0.95, 1],
		N: [0.2, 0.35, 1, 1],
		O: [1, 0.18, 0.14, 1],
		S: [1, 0.78, 0.1, 1]
	};
	return chochmahPalette[keterElement] || [0.55, 0.65, 0.8, 1];
}
