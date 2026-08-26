// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRichWorldMountSupport.js
 * @description Owns named rich-world status, subsystem attachment, and canonical special-character population mounting.
 * The Awtsmoos lets river, ridge, tailor, healer, and every optional vessel reveal one living world without confusing their owners;
 * Awtsmoos.com preserves explicit failure receipts while each character remains governed by its current population class.
 */

import { MinimalMeadowAmuletExpertPopulation } from './MinimalMeadowAmuletExpertPopulation.js';
import { MinimalMeadowClothingMerchantPopulation } from './MinimalMeadowClothingMerchantPopulation.js';

const CHARACTER_FACTORIES = Object.freeze({
	amuletExpert: MinimalMeadowAmuletExpertPopulation,
	tailor: MinimalMeadowClothingMerchantPopulation
});

export function initializeMinimalMeadowMountStatus(runtime) {
	runtime.richWorldMountStatus = {
		amuletExpert: 'waiting',
		clothingMerchant: 'waiting',
		houses: 'waiting',
		mountains: 'waiting',
		phase: 'loading',
		quest: 'waiting',
		trees: 'waiting',
		vegetation: 'waiting',
		water: 'waiting'
	};
}

export function markMinimalMeadowMount(runtime, name, status) {
	runtime.richWorldMountStatus ||= {};
	runtime.richWorldMountStatus[name] = status;
}

export async function mountMinimalMeadowSubsystem(runtime, name, factory) {
	markMinimalMeadowMount(runtime, name, 'loading');
	try {
		const system = await factory();
		runtime[name] = system;
		if (system?.group && !system.group.parent) runtime.scene.add(system.group);
		markMinimalMeadowMount(runtime, name, 'ready');
		return readyReceipt(name, system);
	} catch (error) {
		return minimalMeadowSubsystemFailure(runtime, name, error);
	}
}

export async function mountMinimalMeadowCharacter(runtime, name, kind) {
	markMinimalMeadowMount(runtime, name, 'loading');
	try {
		const Population = CHARACTER_FACTORIES[kind];
		if (!Population) throw new Error(`UNKNOWN_MINIMAL_MEADOW_CHARACTER:${kind}`);
		const system = await Population.create(runtime, runtime.environment || globalThis);
		runtime[name] = system;
		markMinimalMeadowMount(runtime, name, 'ready');
		return readyReceipt(name, system);
	} catch (error) {
		return minimalMeadowSubsystemFailure(runtime, name, error);
	}
}

export function minimalMeadowSubsystemFailure(runtime, name, error) {
	const message = error?.message || String(error);
	runtime[`${name}Error`] = message;
	runtime.richWorldFailures ||= {};
	runtime.richWorldFailures[name] = message;
	markMinimalMeadowMount(runtime, name, 'failed');
	runtime.bus.emit('world:subsystem-failed', { error: message, name });
	return { error: message, name, status: 'failed' };
}

function readyReceipt(name, system) {
	return {
		diagnostics: system?.diagnostics?.() || null,
		name,
		status: 'ready'
	};
}
