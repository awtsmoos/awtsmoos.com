// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMovementRecovery.js
 * @description Recovers the traveler relative to the actual local walkable support instead of one meaningless global abyss number.
 * The Awtsmoos sustains each foot upon the earth beneath it; Awtsmoos.com remembers only lawful grounded footing
 * and restores a traveler as soon as visible position sinks materially beneath terrain, threshold, room, tread, or landing.
 */

import { minimalMeadowGroundReceipt } from './MinimalMeadowGroundSupport.js';

const WORLD_LIMIT = 510;
const BELOW_SUPPORT_TOLERANCE = 1.25;
const SAFE_SUPPORT_TOLERANCE = 0.8;

export class MinimalMeadowMovementRecovery {
	constructor(runtime, state) {
		this.runtime = runtime;
		this.safe = snapshot(state, supportHeight(runtime, state));
		this.recoveries = 0;
		this.lastReason = null;
	}

	beforeStep(state) {
		const reason = recoveryReason(this.runtime, state);
		return reason ? this.restore(state, reason) : false;
	}

	afterStep(state) {
		const reason = recoveryReason(this.runtime, state);
		if (reason) return this.restore(state, reason);
		if (safeFooting(this.runtime, state)) this.checkpoint(state);
		return false;
	}

	checkpoint(state) {
		this.safe = snapshot(state, supportHeight(this.runtime, state));
		return this.safe;
	}

	unstuck(state) {
		return this.restore(state, 'unstuck-command');
	}

	returnToCheckpoint(state) {
		return this.restore(state, 'checkpoint-command');
	}

	restore(state, reason = 'movement-recovery') {
		Object.assign(state, {
			facing: this.safe.facing,
			groundY: this.safe.y,
			grounded: true,
			renderY: this.safe.y,
			travelFacing: this.safe.facing,
			velY: 0,
			x: this.safe.x,
			y: this.safe.y,
			z: this.safe.z
		});
		this.runtime.model?.position?.set?.(this.safe.x, this.safe.y, this.safe.z);
		this.runtime.cameraRig?.update?.(this.runtime.camera, state, this.runtime.mainOctree, 0);
		this.runtime.expansion?.streaming?.recover?.(new Error(reason), this.safe);
		this.recoveries += 1;
		this.lastReason = reason;
		this.runtime.bus?.emit?.('movement:recovered', this.diagnostics());
		return true;
	}

	diagnostics() {
		return Object.freeze({ lastReason: this.lastReason, recoveries: this.recoveries, safe: { ...this.safe } });
	}
}

function recoveryReason(runtime, state) {
	if (![state.x, state.y, state.z, state.renderY].every(Number.isFinite)) return 'nonfinite-position';
	if (Math.abs(state.x) > WORLD_LIMIT || Math.abs(state.z) > WORLD_LIMIT) return 'outside-world-bounds';
	const support = supportHeight(runtime, state);
	if (Number.isFinite(support) && state.renderY < support - BELOW_SUPPORT_TOLERANCE) return 'below-walkable-ground';
	return null;
}

function safeFooting(runtime, state) {
	if (!state.grounded || !withinWorld(state)) return false;
	const support = supportHeight(runtime, state);
	return Number.isFinite(support) && Math.abs(state.renderY - support) <= SAFE_SUPPORT_TOLERANCE;
}

function withinWorld(state) {
	return [state.x, state.renderY, state.z].every(Number.isFinite)
		&& Math.abs(state.x) <= WORLD_LIMIT
		&& Math.abs(state.z) <= WORLD_LIMIT;
}

function supportHeight(runtime, state) {
	return minimalMeadowGroundReceipt(runtime, state.x, state.z, state.renderY, state.previousRenderY ?? state.renderY).height;
}

function snapshot(state, support) {
	return Object.freeze({
		facing: Number(state.facing || 0),
		x: Number(state.x || 0),
		y: Number.isFinite(support) ? support : Number(state.renderY ?? state.y ?? 0),
		z: Number(state.z || 0)
	});
}
