// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzRuntimePromotion.js
 * @description Replaces the first-play bootstrap scheduler with the canonical rich-world scheduler exactly once.
 * The Awtsmoos lets one early heartbeat yield to a fuller ordered pulse without two clocks ruling one traveler;
 * Awtsmoos.com starts the rich loop, retires bootstrap frames, preserves UI, and publishes one immutable handoff receipt.
 */

import { startEretzRuntime } from './EretzRuntimeLoop.js';

const REQUIRED_RUNTIME_SERVICES = Object.freeze([
	['houseVisibility', 'update'],
	['lava', 'update'],
	['orbit', 'apply'],
	['renderer', 'render'],
	['renderer', 'setInteractor'],
	['shadows', 'update']
]);

/** Promotes one live runtime from bootstrap scheduling into the rich Eretz frame pipeline. */
export function promoteEretzRuntimeLoop(context, options = {}) {
	const { diagnostics, runtime } = context;
	const existing = runtime.runtimeLoopPromotion;
	if (existing) return promotionResult(context, existing);
	if (context.options?.startLoop === false) {
		const receipt = createReceipt(context.movement, null, 'disabled-for-test');
		publishReceipt(runtime, diagnostics, receipt);
		return promotionResult(context, receipt);
	}
	assertRichRuntimeReady(runtime);
	const previousMovement = context.movement || diagnostics.movement || null;
	const startRuntime = options.startRuntime || startEretzRuntime;
	const environment = context.options?.environment || globalThis;
	const richMovement = startRuntime(runtime, diagnostics, environment);
	if (!richMovement) throw new Error('Rich Eretz runtime did not return a movement controller.');
	try {
		previousMovement?.stop?.({ preserveUi: true });
	} catch (error) {
		richMovement.stop?.();
		throw error;
	}
	context.movement = richMovement;
	diagnostics.movement = richMovement;
	diagnostics.movementState = () => movementState(runtime, richMovement);
	diagnostics.bootstrap = false;
	runtime.bootstrapLoopStopped = true;
	const receipt = createReceipt(previousMovement, richMovement, 'ready');
	publishReceipt(runtime, diagnostics, receipt);
	return promotionResult(context, receipt);
}

function assertRichRuntimeReady(runtime) {
	for (const [owner, method] of REQUIRED_RUNTIME_SERVICES) {
		if (typeof runtime?.[owner]?.[method] !== 'function') {
			throw new Error(`Rich runtime requires ${owner}.${method}().`);
		}
	}
	for (const key of ['camera', 'ground', 'input', 'jumpPhysics', 'model', 'mover', 'player']) {
		if (!runtime?.[key]) throw new Error(`Rich runtime requires ${key}.`);
	}
}

function createReceipt(previous, current, status) {
	return Object.freeze({
		from: previous?.constructor?.name || 'none',
		preservedBootstrapUi: status === 'ready',
		status,
		to: current?.constructor?.name || 'none'
	});
}

function publishReceipt(runtime, diagnostics, receipt) {
	runtime.runtimeLoopPromotion = receipt;
	diagnostics.runtimeLoopPromotion = receipt;
}

function promotionResult(context, receipt) {
	return Object.freeze({
		movement: context.diagnostics.movement || context.movement || null,
		receipt
	});
}

function movementState(runtime, movement) {
	return Object.freeze({
		controller: movement?.constructor?.name || 'unknown',
		frames: runtime.richFrames || 0,
		frameSource: runtime.runtimeFrameSource || 'unknown',
		scheduler: movement?.scheduler?.() || null
	});
}
