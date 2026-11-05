// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityPreflight.js
 * @description Resolves canonical ability context and one shared UI/execution readiness decision.
 */

import { evaluateTorahAbilityActivation } from './TorahAbilityActivationRules.js';
import { torahAbilityDefinition } from './TorahAbilityCatalog.js';

export class TorahAbilityPreflight {
	constructor(options) {
		this.clock = options.clock;
		this.cooldowns = options.cooldowns;
		this.getContext = options.getContext || (() => ({}));
		this.getResource = options.getResource || (() => Infinity);
		this.isUnlocked = options.isUnlocked || (() => true);
	}

	resolve(abilityId, suppliedContext = {}, activeCast = false) {
		const definition = torahAbilityDefinition(abilityId);
		const now = suppliedContext.now ?? this.clock();
		const context = { ...this.getContext(definition), ...suppliedContext };
		const decision = evaluateTorahAbilityActivation(definition, {
			...context,
			activeCast,
			cooldown: definition ? this.cooldowns.readiness(definition, now) : null,
			resource: resourceValue(this.getResource(now)),
			unlocked: definition ? this.isUnlocked(definition) : false
		});
		return { context, decision, definition, now };
	}
}

function resourceValue(resource) {
	return Number(resource?.current ?? resource);
}
