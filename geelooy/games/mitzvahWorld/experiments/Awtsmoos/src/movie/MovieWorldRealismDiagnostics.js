// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorldRealismDiagnostics.js
 * @description Applies strict final-cinema readiness law to live homes, cast, water, vegetation, trees, and mountains.
 * The Awtsmoos renews home, current, grass, root, ridge, garment, and lens before a frame can testify about them;
 * Awtsmoos.com refuses final cinema until architecture and every visible environmental authority are actually mounted.
 */

import {
	movieHouseReceipt,
	movieMountainReceipt,
	movieTerrainReceipt,
	movieTreeReceipt,
	movieVegetationReceipt,
	movieWaterReceipt
} from './MovieWorldRealismReceiptParts.js';

export function createMovieWorldRealismReceipt(session) {
	const runtime = session?.runtime || {};
	const water = diagnostics(runtime.water);
	const trees = diagnostics(runtime.trees);
	const vegetation = diagnostics(runtime.vegetation);
	const mountains = diagnostics(runtime.mountains);
	const houses = movieHouseReceipt(runtime.houses, diagnostics(runtime.houses));
	const cast = collectCast(session?.director?.crowd?.records);
	const checks = {
		canonicalCast: cast.count > 0
			&& cast.borrowed === cast.count
			&& cast.canonical === cast.count
			&& cast.outfitIds.length === cast.count,
		carvedLake: Number(water.lakeVertices || 0) >= 10,
		carvedRiver: Number(water.riverVertices || 0) >= 10,
		houses: houses.mounted && houses.houses >= 1 && houses.materialsReady >= 1,
		mountains: mountains.mounted === true
			&& Number(mountains.meshes || 0) >= 2
			&& mountains.layeredMaterials === true,
		physicalWater: water.shader === 'textured-dual-normal-flowing-water'
			&& /physical-water/i.test(String(water.physicalShader || '')),
		renderer: Boolean(runtime.renderer && runtime.camera && runtime.scene),
		trees: trees.mounted === true
			&& Number(trees.trees || 0) >= 12
			&& trees.authority === 'Awtsmoos_canonical_procedural_ecology_forest',
		vegetation: vegetation.mounted === true && Number(vegetation.clumps || 0) >= 100,
		waterNormals: Number(water.activeNormalSources || 0) >= 2
			&& Number(water.waterMeshes || 0) >= 2
	};
	return Object.freeze({
		cast,
		checks,
		houses,
		mountains: movieMountainReceipt(mountains),
		ready: Object.values(checks).every(Boolean),
		terrain: movieTerrainReceipt(water),
		trees: movieTreeReceipt(trees),
		vegetation: movieVegetationReceipt(vegetation),
		water: movieWaterReceipt(water)
	});
}

export function assertMovieWorldRealism(session) {
	const receipt = createMovieWorldRealismReceipt(session);
	if (receipt.ready) return receipt;
	const missing = Object.entries(receipt.checks)
		.filter(([, ready]) => !ready)
		.map(([name]) => name);
	throw new Error(`MOVIE_WORLD_REALISM_NOT_READY:${missing.join(',')}`);
}

function diagnostics(system) {
	return typeof system?.diagnostics === 'function' ? system.diagnostics() : {};
}

function collectCast(records) {
	const values = [...(records?.values?.() || [])];
	const outfits = values
		.map(record => record.actor?.outfitId || record.figure?.userData?.AwtsmoosCinemaChossid?.outfitId)
		.filter(Boolean);
	return Object.freeze({
		borrowed: values.filter(record => record.borrowed === true).length,
		canonical: values.filter(record => (
			record.figure?.userData?.AwtsmoosMovieCharacter?.canonicalModel === 'assets/models/player/chossid.glb'
		)).length,
		count: values.length,
		outfitIds: Object.freeze([...new Set(outfits)])
	});
}
