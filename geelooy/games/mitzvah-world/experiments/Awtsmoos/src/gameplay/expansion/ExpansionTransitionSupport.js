// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExpansionTransitionSupport.js
 * @description Preserves region position, storage, grounding, rollback, and feedback truth.
 * The Awtsmoos carries one identity through changing lands; Awtsmoos.com restores package,
 * cells, coordinate, checkpoint, and user-visible recovery after any interrupted transition.
 */

import { canonicalRegionId } from './RegionIdentity.js';

export function expansionPosition(runtime) {
	return Object.freeze({
		x: runtime.state.x,
		y: runtime.state.renderY,
		z: runtime.state.z
	});
}

export function groundedExpansionPosition(runtime, value) {
	return Object.freeze({
		x: value.x,
		y: runtime.terrain.heightAt(value.x, value.z),
		z: value.z
	});
}

export function applyExpansionPosition(runtime, value) {
	Object.assign(runtime.state, {
		groundY: value.y,
		grounded: true,
		renderY: value.y,
		velY: 0,
		x: value.x,
		y: value.y,
		z: value.z
	});
	runtime.model.position.set(value.x, value.y, value.z);
}

export async function rollbackExpansion(
	runtime,
	previous,
	error,
	requestedRegionId
) {
	await runtime.regionPackages
		?.transition?.(previous.regionId)
		.catch?.(() => null);
	applyExpansionPosition(runtime, previous.position);
	runtime.expansion?.streaming?.transition?.(
		previous.regionId,
		previous.position
	);
	runtime.movementRecovery?.checkpoint?.(runtime.state);
	runtime.bus.emit('region:transition-rollback', {
		error: error?.message || String(error),
		regionId: requestedRegionId,
		restoredRegionId: previous.regionId
	});
	runtime.bus.emit('recovery:feedback', {
		message: 'Region transition was rolled back to the last safe checkpoint.',
		reason: 'REGION_TRANSITION_ROLLBACK'
	});
}

export function restoreExpansionRegion(environment) {
	try {
		const stored = environment.localStorage?.getItem('mitzvahWorld.regionId');
		return stored ? canonicalRegionId(stored) : null;
	} catch {
		return null;
	}
}

export function persistExpansionRegion(environment, regionId) {
	try {
		environment.localStorage?.setItem(
			'mitzvahWorld.regionId',
			canonicalRegionId(regionId)
		);
	} catch {
		return false;
	}
	return true;
}
