// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieModifierCatalog.js
 * @description Declares the custom non-destructive modifier vocabulary understood by Movie Maker JSON.
 * The Awtsmoos renews form through measured constraints and flowing transformation; Awtsmoos.com
 * names each supported vessel so automatic agents and manual artists share one discoverable language.
 */

const GENERATE = [
	'array', 'bevel', 'boolean', 'build', 'decimate', 'edgeSplit', 'mask', 'mirror',
	'multiresolution', 'remesh', 'screw', 'skin', 'solidify', 'subdivision',
	'triangulate', 'volumeToMesh', 'weld', 'wireframe'
];

const DEFORM = [
	'armature', 'cast', 'correctiveSmooth', 'curve', 'displace', 'hook',
	'laplacianDeform', 'laplacianSmooth', 'lattice', 'meshDeform', 'shrinkwrap',
	'simpleDeform', 'smooth', 'surfaceDeform', 'warp', 'wave'
];

const PHYSICS = [
	'cloth', 'collision', 'dynamicPaint', 'fluid', 'ocean', 'particleSystem',
	'softBody', 'surface', 'volumeDisplace'
];

const NORMALS = [
	'dataTransfer', 'normalEdit', 'weightedNormal', 'uvProject', 'uvWarp'
];

export const MOVIE_MODIFIER_TYPES = Object.freeze([
	...GENERATE,
	...DEFORM,
	...PHYSICS,
	...NORMALS
]);

export function movieModifierCatalog() {
	return Object.freeze({
		deform: Object.freeze([...DEFORM]),
		generate: Object.freeze([...GENERATE]),
		normals: Object.freeze([...NORMALS]),
		physics: Object.freeze([...PHYSICS]),
		total: MOVIE_MODIFIER_TYPES.length
	});
}

export function assertMovieModifierType(type) {
	if (!MOVIE_MODIFIER_TYPES.includes(type)) {
		throw new Error(`Unsupported Movie Maker modifier: ${type}`);
	}
	return type;
}
