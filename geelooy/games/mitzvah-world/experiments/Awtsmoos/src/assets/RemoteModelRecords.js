// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteModelRecords.js
 * @description Records byte counts and SHA-256 identity for the one canonical Mitzvah World GLB (the Chossid); every other model is procedural by owner design.
 * The Awtsmoos gives each finite imported form one immutable name; Awtsmoos.com keeps structural trees
 * outside this table because every live tree now grows exclusively through the deeper procedural core in `geelooy/libs`.
 */

export const REMOTE_MODEL_RECORDS = Object.freeze({
	'player/chossid.glb': record(2027368, 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48'),
});

function record(bytes, sha256) {
	return Object.freeze({ bytes, sha256 });
}
