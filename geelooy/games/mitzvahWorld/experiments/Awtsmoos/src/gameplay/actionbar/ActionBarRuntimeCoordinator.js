// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarRuntimeCoordinator.js
 * @description Governs one persistent two-row bar after focused collaborators are assembled.
 * The Awtsmoos unites the deed without confusing its vessels; Chesed heals and Gevurah may strike,
 * while Awtsmoos.com keeps one public covenant for layout, cooldown, target, and input alike.
 */

import {
	actionBarActionDefinition,
	isPhysicalAction
} from './ActionBarActionCatalog.js';
import { firstAvailableActionSlot } from './ActionBarLayoutRules.js';
import { assembleActionBarRuntime } from './ActionBarRuntimeAssembly.js';

const STATUS_UPDATE_MILLISECONDS = 100;

export class ActionBarRuntimeCoordinator {
	constructor(options) {
		this.combat = options.combat;
		this.inventory = options.inventory;
		this.nextStatusUpdateAt = 0;
		Object.assign(
			this,
			assembleActionBarRuntime(
				options,
				(actionId, context) => this.activateAction(actionId, context)
			)
		);
	}

	activateAction(actionId, context = {}) {
		return isPhysicalAction(actionId)
			? this.gateway.activatePhysical(context)
			: this.timeline.activate(actionId, context);
	}

	activateSlot(slotIndex, context = {}) {
		return this.store.activate(slotIndex, context);
	}

	readinessForSlot(slotIndex, context = {}) {
		const actionId = this.store.slots[slotIndex];
		if (!actionId) return { ok: false, reason: 'empty-slot' };
		return isPhysicalAction(actionId)
			? this.gateway.physicalReadiness(context.now ?? this.clock())
			: this.timeline.readiness(actionId, context);
	}

	cooldownForSlot(slotIndex, now = this.clock()) {
		const actionId = this.store.slots[slotIndex];
		const definition = actionBarActionDefinition(actionId);
		if (!definition) return null;
		return isPhysicalAction(actionId)
			? this.gateway.physicalReadiness(now)
			: this.timeline.cooldowns.snapshotAbility(definition, now);
	}

	assignFirstAvailable(actionId) {
		if (this.store.locked) return this.result(false, 'layout-locked');
		const slotIndex = firstAvailableActionSlot(
			this.store.slots,
			this.store.rows * 12
		);
		if (slotIndex < 0) return this.result(false, 'bar-full');
		return this.store.assign(slotIndex, actionId);
	}

	update(now = this.clock()) {
		const casting = this.timeline.update(now);
		if (this.statuses.activeCount && now >= this.nextStatusUpdateAt) {
			this.statuses.update(now);
			this.nextStatusUpdateAt = now + STATUS_UPDATE_MILLISECONDS;
		}
		return casting || this.statuses.activeCount > 0;
	}

	snapshot(now = this.clock()) {
		return {
			drag: this.drag.snapshot(),
			layout: this.store.snapshot(),
			persistence: this.persistence.snapshot(),
			statuses: this.statuses.snapshot(),
			timeline: this.timeline.snapshot(now)
		};
	}

	result(ok, reason) {
		return { ok, reason, snapshot: this.store.snapshot() };
	}

	destroy() {
		this.persistence.destroy();
		this.drag.destroy();
		this.timeline.destroy();
		this.statuses.destroy();
		this.store.destroy();
	}
}
