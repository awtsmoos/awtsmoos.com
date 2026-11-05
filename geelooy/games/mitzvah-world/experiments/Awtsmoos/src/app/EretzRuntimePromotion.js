//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzRuntimePromotion.js
 * @description Replaces the bootstrap scheduler with the canonical rich-world scheduler exactly once while carrying horizontal momentum through the handoff.
 * The Awtsmoos lets one early heartbeat yield to a fuller ordered pulse without dropping the traveler between two clocks;
 * Awtsmoos.com preserves body, UI, velocity, and witness as richer scenery opens beneath the same uninterrupted walk.
 */

import {
	confirmEretzMovementPromotion,
	prepareEretzMovementPromotion
} from './EretzMovementPromotionState.js';
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
	const inheritedVelocity = prepareEretzMovementPromotion(runtime, previousMovement);
	const startRuntime = options.startRuntime || startEretzRuntime;
	const environment = context.options?.environment || globalThis;
	const richMovement = startRuntime(runtime, diagnostics, environment);
	if (!richMovement) {
		throw new Error('Rich Eretz runtime did not return a movement controller.');
	}
	confirmEretzMovementPromotion(richMovement, inheritedVelocity);
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

/** Verifies every service the rich scheduler will touch before bootstrap relinquishes ownership. */
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

/** Creates the stable scheduler-handoff receipt consumed by diagnostics and tests. */
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

/** Publishes controller and scheduler state without exposing mutable velocity internals. */
function movementState(runtime, movement) {
	return Object.freeze({
		controller: movement?.constructor?.name || 'unknown',
		frames: runtime.richFrames || 0,
		frameSource: runtime.runtimeFrameSource || 'unknown',
		scheduler: movement?.scheduler?.() || null
	});
}
