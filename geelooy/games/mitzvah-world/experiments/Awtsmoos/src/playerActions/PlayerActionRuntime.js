// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionRuntime.js
 * @description Composes registered actions over each fresh imported upper-body sample.
 * The Awtsmoos renews locomotion and deed without rivalry; Awtsmoos.com keeps hips and legs
 * untouched, release singular, cancellation smooth, and future registry actions inspectable.
 */

import { PlayerActionBodyMaskRuntime } from './PlayerActionBodyMaskRuntime.js';
import {
	emitPlayerActionRelease,
	playerActionResultRecord,
	playerActionRuntimeSnapshot
} from './PlayerActionBodyMaskLifecycle.js';
import { PlayerActionPoseSampler } from './PlayerActionPoseSampler.js';
import { dispatchPlayerAction } from './PlayerActionRuntimeCommands.js';
import {
	advancePlayerActionState,
	beginPlayerActionRecovery
} from './PlayerActionRuntimeState.js';

export class PlayerActionRuntime {
	constructor(options) {
		this.actor = options.actor;
		this.registry = options.registry;
		this.bus = options.bus || null;
		this.sampler = new PlayerActionPoseSampler();
		this.composition = new PlayerActionBodyMaskRuntime(this.actor);
		this.active = null;
		this.sequence = 0;
		this.lastResult = null;
	}
	dispatch(message = {}) {
		return dispatchPlayerAction(this, message);
	}
	captureImportedPose() {
		return this.composition.captureImportedPose();
	}
	update(deltaSeconds) {
		const action = this.active;
		if (!action) {
			return;
		}
		const result = advancePlayerActionState(action, deltaSeconds);
		const pose = this.sampler.sample(action.definition, result.progress);
		this.composition.apply(pose, action.weight);
		if (result.releaseDue) {
			this.fireRelease({ source: 'timeline-threshold' });
		}
		if (result.timelineComplete) {
			this.release({ source: 'timeline-complete' });
		}
		if (result.finished) {
			this.complete(action.cancelReason ? 'cancelled' : 'completed');
		}
	}
	release(message = {}) {
		if (!this.active) {
			return null;
		}
		this.fireRelease(message);
		beginPlayerActionRecovery(this.active);
		this.publish();
		return this.snapshot();
	}
	cancel(reason) {
		if (!this.active) {
			return null;
		}
		beginPlayerActionRecovery(this.active, reason || 'cancelled');
		this.lastResult = playerActionResultRecord(
			this.active.definition.id,
			'cancelled',
			reason
		);
		this.publish();
		return this.snapshot();
	}
	fireRelease(message = {}) {
		return emitPlayerActionRelease(this, message);
	}
	complete(result) {
		const actionId = this.active?.definition.id || null;
		const reason = this.active?.cancelReason || null;
		this.composition.restore();
		this.lastResult = playerActionResultRecord(actionId, result, reason);
		this.active = null;
		this.publish();
	}
	reject(reason, message) {
		this.lastResult = {
			messageType: message?.type || null,
			reason,
			result: 'rejected'
		};
		this.publish();
		return this.snapshot();
	}
	publish() {
		this.bus?.emit?.('player:action-state', this.snapshot());
	}
	snapshot() {
		return playerActionRuntimeSnapshot(this);
	}
	destroy() {
		this.composition.restore();
		this.active = null;
	}
}
