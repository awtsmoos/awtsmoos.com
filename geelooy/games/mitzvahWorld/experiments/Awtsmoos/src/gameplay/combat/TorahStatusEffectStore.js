// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahStatusEffectStore.js
 * @description Coordinates bounded Torah status application, lifecycle, removal, queries, and events.
 * The Awtsmoos renews every active influence through focused vessels; Awtsmoos.com
 * keeps capacity, targets, ticks, cleanse, damage breaks, snapshots, and quest evidence clear.
 */

import { applyTorahStatusEffect } from './TorahStatusEffectApplication.js';
import { updateTorahStatusStore } from './TorahStatusEffectLifecycle.js';
import {
	diagnosticTorahStatusStore,
	snapshotTorahStatusStore,
	targetTorahStatusEffects
} from './TorahStatusEffectQueries.js';
import {
	breakTorahStatusesOnDamage,
	removeTorahStatusCategory,
	removeTorahStatusEffect
} from './TorahStatusEffectRemoval.js';
import { statusEffectSnapshot } from './TorahStatusEffectRules.js';

export class TorahStatusEffectStore {
	constructor(options = {}) {
		this.bus = options.bus || null;
		this.clock = options.clock || Date.now;
		this.maximumEffects = options.maximumEffects || 128;
		this.onTick = options.onTick || (() => {});
		this.targets = new Map();
		this.activeCount = 0;
		this.sequence = 0;
		this.diagnostics = {
			applied: 0,
			droppedTicks: 0,
			expired: 0,
			ticks: 0
		};
	}

	apply(request) {
		return applyTorahStatusEffect(this, request);
	}

	update(now = this.clock()) {
		updateTorahStatusStore(this, now);
		return this.diagnosticSnapshot();
	}

	remove(targetId, effectId, reason = 'removed') {
		return removeTorahStatusEffect(
			this,
			targetId,
			effectId,
			reason
		);
	}

	removeByCategory(targetId, category, maximum = 1) {
		return removeTorahStatusCategory(
			this,
			targetId,
			category,
			maximum
		);
	}

	handleDamage(targetId) {
		return breakTorahStatusesOnDamage(this, targetId);
	}

	snapshot(targetId = null) {
		return snapshotTorahStatusStore(this, targetId);
	}

	targetEffects(targetId, create = false) {
		return targetTorahStatusEffects(this, targetId, create);
	}

	diagnosticSnapshot() {
		return diagnosticTorahStatusStore(this);
	}

	emit(type, instance, reason = null) {
		const detail = {
			...statusEffectSnapshot(instance),
			reason
		};
		this.bus?.emit(type, detail);
		if (type === 'status:apply') {
			this.bus?.emit('quest:event', {
				count: 1,
				target: detail.effectId,
				type: 'status'
			});
		}
	}

	destroy() {
		this.targets.clear();
		this.activeCount = 0;
	}
}
