// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMobileIntegration.js
 * @description Reconciles post-hydration player materials, sword ownership, and visible equipment.
 * The Awtsmoos joins the remembered Bag to the embodied Chossid; Awtsmoos.com waits for the
 * real feature promise, then repairs only proven integration gaps through authoritative stores.
 */

import { hydrateReadablePlayerMaterials } from './MinimalMeadowPlayerMaterialHydrator.js';

export async function installMinimalMeadowMobileIntegration(
	diagnostics = globalThis.AwtsmoosMitzvahWorld,
	documentValue = globalThis.document
) {
	const resolved = diagnostics || await globalThis.AwtsmoosMitzvahWorldBoot;
	await resolved?.featuresPromise;
	const runtime = resolved?.runtime;
	if (!runtime) {
		throw new Error('Mitzvah World runtime is unavailable for mobile integration.');
	}
	const materialReceipt = hydrateReadablePlayerMaterials(runtime.model, documentValue);
	const swordAdded = ensureRealSword(runtime.inventory);
	runtime.equipment?.sync?.();
	runtime.ui?.refresh?.();
	const receipt = Object.freeze({
		coatEquipped: runtime.inventory?.equipment?.coat || null,
		equipment: runtime.equipment?.diagnostics?.() || null,
		materialReceipt: Object.freeze({ ...materialReceipt }),
		movement: runtime.movement?.snapshot?.() || null,
		swordAdded,
		swordOwned: runtime.inventory?.owns?.('spark-blade') === true
	});
	resolved.mobileIntegration = receipt;
	if (documentValue?.documentElement) {
		documentValue.documentElement.dataset.awtsmoosMobileIntegration = 'ready';
	}
	return receipt;
}

export function ensureRealSword(inventory) {
	if (!inventory || inventory.owns?.('spark-blade')) {
		return false;
	}
	inventory.add?.('spark-blade', 1);
	return inventory.owns?.('spark-blade') === true;
}

if (typeof document !== 'undefined') {
	globalThis.AwtsmoosMobileIntegrationPromise = Promise.resolve(
		globalThis.AwtsmoosMitzvahWorldBoot
	)
		.then(diagnostics => installMinimalMeadowMobileIntegration(diagnostics, document))
		.catch(error => {
			document.documentElement.dataset.awtsmoosMobileIntegration = 'failed';
			console.error('[MitzvahWorld] mobile integration failed.', error);
			throw error;
		});
}
