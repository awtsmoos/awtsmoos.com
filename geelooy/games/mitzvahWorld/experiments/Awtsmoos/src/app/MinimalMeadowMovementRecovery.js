// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMovementRecovery.js
 * @description Preserves safe footing and restores model, camera, streaming, and diagnostics.
 * The Awtsmoos sustains each traveler above the abyss; Awtsmoos.com remembers one lawful
 * footing so invalid coordinates, falls, unstuck commands, and checkpoints recover visibly.
 */

const WORLD_LIMIT = 510;
const FALL_LIMIT = -32;

export class MinimalMeadowMovementRecovery {
	constructor(runtime, state) {
		this.runtime = runtime;
		this.safe = snapshot(state);
		this.recoveries = 0;
		this.lastReason = null;
	}

	beforeStep(state) {
		const reason = recoveryReason(state);
		if (!reason) return false;
		return this.restore(state, reason);
	}

	afterStep(state) {
		const reason = recoveryReason(state);
		if (reason) return this.restore(state, reason);
		if (safeFooting(state)) this.checkpoint(state);
		return false;
	}

	checkpoint(state) {
		this.safe = snapshot(state);
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
		this.runtime.model?.position?.set?.(
			this.safe.x,
			this.safe.y,
			this.safe.z
		);
		this.runtime.cameraRig?.update?.(
			this.runtime.camera,
			state,
			this.runtime.mainOctree,
			0
		);
		this.runtime.expansion?.streaming?.recover?.(
			new Error(reason),
			this.safe
		);
		this.recoveries += 1;
		this.lastReason = reason;
		this.runtime.bus?.emit?.('movement:recovered', this.diagnostics());
		return true;
	}

	diagnostics() {
		return Object.freeze({
			lastReason: this.lastReason,
			recoveries: this.recoveries,
			safe: { ...this.safe }
		});
	}
}

function recoveryReason(state) {
	if (![state.x, state.y, state.z, state.renderY].every(Number.isFinite)) {
		return 'nonfinite-position';
	}
	if (state.renderY < FALL_LIMIT || state.y < FALL_LIMIT) return 'fell-below-world';
	if (Math.abs(state.x) > WORLD_LIMIT || Math.abs(state.z) > WORLD_LIMIT) {
		return 'outside-world-bounds';
	}
	return null;
}

function safeFooting(state) {
	return state.grounded
		&& Number.isFinite(state.x)
		&& Number.isFinite(state.renderY)
		&& Number.isFinite(state.z)
		&& Math.abs(state.x) <= WORLD_LIMIT
		&& Math.abs(state.z) <= WORLD_LIMIT;
}

function snapshot(state) {
	return Object.freeze({
		facing: Number(state.facing || 0),
		x: Number(state.x || 0),
		y: Number(state.renderY ?? state.y ?? 0),
		z: Number(state.z || 0)
	});
}
