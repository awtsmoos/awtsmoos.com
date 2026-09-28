//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowPlayableEvidence.js
 * @description Measures the final physical witnesses that distinguish a rendered shell from a controllable grounded meadow.
 * The Awtsmoos renews earth beneath foot, sight before eye, and intention inside motion in one indivisible ray;
 * Awtsmoos.com gathers those finite witnesses so `playable` can never be spoken while any essential vessel strays.
 */

const GROUND_TOLERANCE = 0.08;

/** Returns immutable pre-reveal evidence for collision, grounding, camera, and one completed control frame. */
export function inspectMinimalMeadowPlayableRuntime(runtime) {
	const missing = [];
	const movement = runtime?.movement;
	const state = runtime?.state;
	const terrainHeight = sampledTerrainHeight(runtime, state);
	const renderY = Number(state?.renderY);
	const modelY = Number(runtime?.model?.position?.y);
	const collisionActive = typeof runtime?.collisionMover?.move === 'function';
	const grounded = Boolean(
		state?.grounded === true
		&& Number.isFinite(terrainHeight)
		&& Number.isFinite(renderY)
		&& Math.abs(renderY - terrainHeight) <= GROUND_TOLERANCE
		&& Number.isFinite(modelY)
		&& Math.abs(modelY - renderY) <= GROUND_TOLERANCE
	);
	const controlFrames = Number(movement?.frames) || 0;
	const cameraMode = movement?.lastIntent?.cameraMode || '';
	const cameraAttached = Boolean(runtime?.camera && runtime?.cameraRig?.update && cameraMode);
	if (!collisionActive) missing.push('terrain-collision-active');
	if (!grounded) missing.push('canonical-player-grounded');
	if (!cameraAttached) missing.push('camera-attached');
	if (controlFrames < 1) missing.push('movement-input-accepted');
	return Object.freeze({
		cameraMode,
		collisionActive,
		controlFrames,
		groundDelta: finiteDelta(renderY, terrainHeight),
		grounded,
		missing: Object.freeze(missing),
		modelDelta: finiteDelta(modelY, renderY),
		ready: missing.length === 0
	});
}

/** Verifies the loader-owned blocking boot veil itself has completed and left the visual/input path. */
export function inspectMinimalMeadowOverlayDismissal(documentValue) {
	const overlay = documentValue?.getElementById?.('menuBoot');
	const dismissed = Boolean(
		overlay
		&& overlay.hidden === true
		&& overlay.getAttribute?.('aria-hidden') === 'true'
		&& overlay.dataset?.loadingComplete === 'true'
	);
	return Object.freeze({
		dismissed,
		missing: Object.freeze(dismissed ? [] : ['blocking-overlays-dismissed']),
		ready: dismissed
	});
}

function sampledTerrainHeight(runtime, state) {
	if (!state || typeof runtime?.terrain?.heightAt !== 'function') return NaN;
	return Number(runtime.terrain.heightAt(state.x, state.z));
}

function finiteDelta(left, right) {
	return Number.isFinite(left) && Number.isFinite(right)
		? Math.abs(left - right)
		: null;
}
