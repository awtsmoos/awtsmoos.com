// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRichWorldMountSupport.js
 * @description Owns named mount status, failure isolation, and ordinary subsystem attachment.
 * The Awtsmoos lets every optional world vessel fail by name without dimming playable core;
 * Awtsmoos.com keeps status letters and scene attachment apart from the coordinator's door.
 */

export function initializeMinimalMeadowMountStatus(runtime) {
	runtime.richWorldMountStatus = {
		clothingMerchant: 'waiting',
		houses: 'waiting',
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
		if (system?.group && !system.group.parent) {
			runtime.scene.add(system.group);
		}
		markMinimalMeadowMount(runtime, name, 'ready');
		return {
			diagnostics: system?.diagnostics?.() || null,
			name,
			status: 'ready'
		};
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
	runtime.bus.emit('world:subsystem-failed', {
		error: message,
		name
	});
	return {
		error: message,
		name,
		status: 'failed'
	};
}
