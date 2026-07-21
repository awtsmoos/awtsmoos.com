// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarRuntimeCoordinator.js
 * @description Joins action layout, canonical combat, cast/status timelines, drag, and persistence.
 */

import { torahAbilityDefinition } from '../combat/TorahAbilityCatalog.js';
import { TorahAbilityStatusGateway } from '../combat/TorahAbilityStatusGateway.js';
import { TorahAbilityTimeline } from '../combat/TorahAbilityTimeline.js';
import { TorahStatusEffectStore } from '../combat/TorahStatusEffectStore.js';
import { ActionBarDragController } from './ActionBarDragController.js';
import { ActionBarPersistence } from './ActionBarPersistence.js';
import { ActionBarStore } from './ActionBarStore.js';

const TARGET_REQUIRED_TYPES = new Set(['chain', 'line', 'selected-enemy']);
const DIRECT_SUPPORT_TYPES = new Set(['self', 'selected-ally']);
const STATUS_UPDATE_MILLISECONDS = 100;

export class ActionBarRuntimeCoordinator {
	constructor(options) {
		this.bus = options.bus || null;
		this.clock = options.clock || Date.now;
		this.combat = options.combat;
		this.inventory = options.inventory;
		this.nextStatusUpdateAt = 0;
		this.statuses = options.statuses || new TorahStatusEffectStore({
			bus: this.bus,
			clock: this.clock,
			onTick: effect => this.statusGateway?.periodicTick(effect)
		});
		this.statusGateway = new TorahAbilityStatusGateway({
			bus: this.bus,
			playerId: options.playerId,
			statuses: this.statuses
		});
		this.timeline = options.timeline || new TorahAbilityTimeline({
			bus: this.bus,
			clock: this.clock,
			execute: (definition, context) => this.execute(definition, context),
			getContext: () => this.combatContext(),
			getResource: () => this.combat.snapshot().focus,
			isUnlocked: definition => this.isUnlocked(definition),
			onApply: (definition, context, result) => this.statusGateway.apply(definition, context, result),
			onChannelTick: (definition, context, tickIndex) => (
				this.statusGateway.channelTick(definition, context, tickIndex)
			)
		});
		this.store = options.store || new ActionBarStore({
			activateAbility: (abilityId, context) => this.timeline.activate(abilityId, context),
			isAbilityKnown: abilityId => Boolean(torahAbilityDefinition(abilityId)),
			layout: defaultLayout()
		});
		this.persistence = options.persistence || new ActionBarPersistence(options.persistenceOptions);
		this.persistence.connect(this.store);
		this.drag = options.drag || new ActionBarDragController({ bus: this.bus, store: this.store });
	}

	activateSlot(slotIndex, context = {}) {
		return this.store.activate(slotIndex, context);
	}

	assignFirstAvailable(abilityId) {
		if (this.store.locked) return { ok: false, reason: 'layout-locked', snapshot: this.store.snapshot() };
		let slotIndex = firstEmptySlot(this.store.slots, this.store.rows * 12);
		if (slotIndex < 0 && this.store.rows === 1) {
			this.store.setRows(2);
			slotIndex = firstEmptySlot(this.store.slots, 24);
		}
		if (slotIndex < 0) return { ok: false, reason: 'bar-full', snapshot: this.store.snapshot() };
		return this.store.assign(slotIndex, abilityId);
	}

	readinessForSlot(slotIndex, context = {}) {
		const abilityId = this.store.slots[slotIndex];
		return abilityId ? this.timeline.readiness(abilityId, context) : { ok: false, reason: 'empty-slot' };
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

	destroy() {
		this.persistence.destroy();
		this.drag.destroy();
		this.timeline.destroy();
		this.statuses.destroy();
		this.store.destroy();
	}

	execute(definition, context) {
		return this.combat.usePassage({ id: definition.passageId }, {
			requestId: context.castId,
			returnResult: true,
			skipPassageCooldown: true,
			targetRequired: TARGET_REQUIRED_TYPES.has(definition.targetType),
			worldImpactRequired: !DIRECT_SUPPORT_TYPES.has(definition.targetType)
		});
	}

	combatContext() {
		const target = this.combat.snapshot().selectedTarget;
		return {
			distance: target?.distance ?? target?.distanceToPlayer,
			facing: target?.facing !== false,
			target
		};
	}

	isUnlocked(definition) {
		return this.inventory.snapshot().learned?.includes(definition.passageId) || false;
	}
}

function defaultLayout() {
	const slots = Array(24).fill(null);
	slots[0] = 'grateful-awakening';
	return { locked: false, rows: 1, slots };
}

function firstEmptySlot(slots, visibleCount) {
	for (let index = 0; index < visibleCount; index += 1) {
		if (!slots[index]) return index;
	}
	return -1;
}
