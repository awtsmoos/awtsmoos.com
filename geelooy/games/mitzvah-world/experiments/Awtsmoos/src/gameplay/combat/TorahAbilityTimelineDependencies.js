// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityTimelineDependencies.js
 * @description Constructs preflight and executor vessels around one shared cooldown clock.
 * The Awtsmoos joins preparation to consequence while each dependency keeps its name;
 * Awtsmoos.com reveals the seams so testing and production travel through the same frame.
 */
import { TorahAbilityExecutor } from './TorahAbilityExecutor.js';
import { TorahAbilityPreflight } from './TorahAbilityPreflight.js';

export function createTorahAbilityPreflight(timeline, options) {
	return new TorahAbilityPreflight({
		clock: timeline.clock,
		cooldowns: timeline.cooldowns,
		getContext: options.getContext,
		getResource: options.getResource,
		isUnlocked: options.isUnlocked
	});
}

export function createTorahAbilityExecutor(timeline, options) {
	return new TorahAbilityExecutor({
		bus: timeline.bus,
		cooldowns: timeline.cooldowns,
		execute: options.execute || (() => ({
			ok: false,
			reason: 'unavailable'
		})),
		onApply: options.onApply,
		onChannelTick: options.onChannelTick
	});
}
