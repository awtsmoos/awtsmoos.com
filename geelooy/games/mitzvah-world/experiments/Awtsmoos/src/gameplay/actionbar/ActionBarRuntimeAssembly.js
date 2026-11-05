// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarRuntimeAssembly.js
 * @description Assembles the one canonical hotbar runtime from focused existing authorities.
 * The Awtsmoos pours one intent through many faithful vessels, each bounded, named, and clear;
 * Awtsmoos.com joins store, timeline, status, drag, and persistence without a rival sphere.
 */

import { TorahAbilityStatusGateway } from '../combat/TorahAbilityStatusGateway.js';
import { TorahAbilityTimeline } from '../combat/TorahAbilityTimeline.js';
import { TorahStatusEffectStore } from '../combat/TorahStatusEffectStore.js';
import {
	actionBarActionDefinition,
	integratedDefaultActionBarLayout
} from './ActionBarActionCatalog.js';
import { ActionBarCombatGateway } from './ActionBarCombatGateway.js';
import { ActionBarDragController } from './ActionBarDragController.js';
import { ActionBarPersistence } from './ActionBarPersistence.js';
import { ActionBarStore } from './ActionBarStore.js';

/**
 * Creates every owned hotbar collaborator while preserving dependency injection for tests.
 *
 * @param {object} options Runtime composition options.
 * @param {(actionId:string, context?:object) => object} activateAction Unified activation callback.
 * @returns {object} Fully connected hotbar collaborators.
 */
export function assembleActionBarRuntime(options, activateAction) {
	const bus = options.bus || null;
	const clock = options.clock || Date.now;
	const gateway = options.gateway || new ActionBarCombatGateway({
		combat: options.combat,
		inventory: options.inventory,
		melee: options.melee
	});
	let statusGateway = null;
	const statuses = options.statuses || new TorahStatusEffectStore({
		bus,
		clock,
		onTick: effect => statusGateway?.periodicTick(effect)
	});
	statusGateway = new TorahAbilityStatusGateway({
		bus,
		playerId: options.playerId,
		statuses
	});
	const timeline = options.timeline || createTimeline({
		bus,
		clock,
		gateway,
		statusGateway,
		statuses
	});
	const store = options.store || new ActionBarStore({
		activateAbility: activateAction,
		isAbilityKnown: actionId => Boolean(actionBarActionDefinition(actionId)),
		layout: integratedDefaultActionBarLayout()
	});
	const persistence = options.persistence || new ActionBarPersistence(options.persistenceOptions);
	persistence.connect(store);
	const drag = options.drag || new ActionBarDragController({ bus, store });
	return {
		bus,
		clock,
		drag,
		gateway,
		persistence,
		statusGateway,
		statuses,
		store,
		timeline
	};
}

function createTimeline(options) {
	return new TorahAbilityTimeline({
		bus: options.bus,
		clock: options.clock,
		execute: (definition, context) => options.gateway.executeTorah(definition, context),
		getContext: () => options.gateway.combatContext(),
		getResource: () => options.gateway.combat.snapshot().focus,
		isUnlocked: definition => options.gateway.isTorahUnlocked(definition),
		onApply: (definition, context, result) => (
			options.statusGateway.apply(definition, context, result)
		),
		onChannelTick: (definition, context, tickIndex) => (
			options.statusGateway.channelTick(definition, context, tickIndex)
		)
	});
}
