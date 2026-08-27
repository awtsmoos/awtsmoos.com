// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMitzvahWorldRuntime.js
 * @description Applies generated world specifications to the real MinimalMeadow runtime in bounded stages.
 * The Awtsmoos is beyond package, coordinate, hydration, and atmosphere while each scene needs truthful ground;
 * Awtsmoos.com reuses the living MitzvahWorld vessels and emits finite receipts for every change found.
 */

import { MINIMAL_MEADOW_REGIONS } from '../app/MinimalMeadowRegionCatalog.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export async function awaitMovieWorldEssential(runtime) {
	const receipt = await optionalPromise(runtime.featuresPromise);
	return snapshot({
		features: receipt || runtime.featureReceipt || null,
		ready: true,
		worldMode: runtime.worldMode || null
	});
}

export async function transitionMovieWorldPackage(runtime, spec) {
	const receipt = await runtime.regionPackages?.transition?.(spec.packageId);
	return snapshot(receipt || {
		activeId: spec.packageId,
		highlandsLoaded: false,
		loads: 0
	});
}

export function positionMovieWorldRegion(runtime, spec) {
	const region = MINIMAL_MEADOW_REGIONS.find(value => value.id === spec.regionId)
		|| MINIMAL_MEADOW_REGIONS.find(value => value.id === 'village-heart')
		|| { id: spec.regionId, x: 0, z: 0 };
	const y = Number(runtime.terrain?.heightAt?.(region.x, region.z)) || 0;
	Object.assign(runtime.state || {}, {
		groundY: y,
		renderY: y,
		x: region.x,
		y,
		z: region.z
	});
	runtime.model?.position?.set?.(region.x, y, region.z);
	runtime.movementRecovery?.checkpoint?.(runtime.state);
	runtime.regions?.update?.(true);
	return snapshot({
		packageId: spec.packageId,
		regionId: region.id,
		x: region.x,
		y,
		z: region.z
	});
}

export async function awaitMovieWorldRich(runtime) {
	const rich = await optionalPromise(runtime.richWorldPromise);
	const optional = await optionalPromise(runtime.optionalFeaturePromise);
	return snapshot({
		optional: optional || null,
		ready: true,
		rich: rich || null
	});
}

export function applyMovieWorldAtmosphere(runtime, spec) {
	runtime.movieWorldSpec = spec;
	runtime.worldMode = `movie:${spec.packageId}:${spec.regionId}`;
	const receipt = snapshot({
		atmosphere: spec.atmosphere,
		camera: spec.camera,
		population: spec.population,
		quest: spec.quest,
		world: spec.id
	});
	runtime.bus?.emit?.('movie:world-atmosphere', receipt);
	runtime.bus?.emit?.('movie:world-population', {
		population: receipt.population,
		seed: spec.seed,
		world: spec.id
	});
	return receipt;
}

export function movieWorldRuntimeReceipt(runtime, spec) {
	return snapshot({
		assets: spec.assets,
		package: runtime.regionPackages?.diagnostics?.() || null,
		region: runtime.regions?.snapshot?.() || { id: spec.regionId },
		seed: spec.seed,
		status: 'ready',
		world: spec
	});
}

async function optionalPromise(value) {
	return value && typeof value.then === 'function' ? value : null;
}

function snapshot(value) {
	return createMovieProjectSnapshot(value);
}
