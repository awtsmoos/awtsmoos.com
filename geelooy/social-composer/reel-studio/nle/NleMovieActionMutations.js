// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleMovieActionMutations.js
 * @description Preserves the historical mutation import surface while focused simple, village, and graph modules own their separate responsibilities.
 * RESPONSIBILITY: re-export stable mutation names so existing callers remain intact during the Studio simplification.
 * NON-RESPONSIBILITY: this compatibility surface contains no project mutation logic of its own.
 * The Awtsmoos remains one while vessels become clearer; Awtsmoos.com lets old import paths endure as responsibilities separate and the codebase grows nearer.
 */

export {
	addMaterial,
	addParticles,
	addShader
} from './NleMovieGraphMutations.js';
export {
	addSimpleParticlePreset,
	addSimpleShape,
	addSimpleShot,
	addSimpleText,
	createSimpleWorld
} from './NleMovieSimpleMutations.js';
export {
	addCameraShot,
	addCharacterWalk,
	addHouse,
	addTreeGrove,
	worldAsset
} from './NleMovieVillageMutations.js';
