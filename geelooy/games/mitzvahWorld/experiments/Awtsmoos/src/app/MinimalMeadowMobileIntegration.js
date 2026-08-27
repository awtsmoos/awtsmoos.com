// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMobileIntegration.js
 * @description Reconciles mobile equipment after boot and settles automatic failure without a cascade.
 * The Awtsmoos joins remembered inventory to the embodied Chossid; Awtsmoos.com lets explicit
 * callers receive strict errors while the browser bootstrap records one failure and never rethrows it.
 */

import { hydrateReadablePlayerMaterials } from './MinimalMeadowPlayerMaterialHydrator.js';

export async function installMinimalMeadowMobileIntegration(
	diagnostics = null,
	documentValue = globalThis.document,
	environment = globalThis
) {
	const resolved = diagnostics
		|| environment.AwtsmoosMitzvahWorld
		|| await environment.AwtsmoosMitzvahWorldBoot;
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
		ready: true,
		status: 'ready',
		swordAdded,
		swordOwned: runtime.inventory?.owns?.('spark-blade') === true
	});
	resolved.mobileIntegration = receipt;
	setDocumentState(documentValue, 'ready');
	return receipt;
}

export function startMinimalMeadowMobileIntegration(
	environment = globalThis,
	documentValue = environment.document
) {
	const bootSource = environment.AwtsmoosMitzvahWorld
		|| environment.AwtsmoosMitzvahWorldBoot;
	const promise = Promise.resolve(bootSource)
		.then(diagnostics => {
			return installMinimalMeadowMobileIntegration(diagnostics, documentValue, environment);
		})
		.catch(error => settleAutomaticFailure(error, documentValue));
	environment.AwtsmoosMobileIntegrationPromise = promise;
	return promise;
}

export function ensureRealSword(inventory) {
	if (!inventory || inventory.owns?.('spark-blade')) {
		return false;
	}
	inventory.add?.('spark-blade', 1);
	return inventory.owns?.('spark-blade') === true;
}

function settleAutomaticFailure(error, documentValue) {
	setDocumentState(documentValue, 'failed');
	console.error('[MitzvahWorld] mobile integration failed.', error);
	return Object.freeze({
		error: error?.message || String(error),
		ready: false,
		status: 'failed'
	});
}

function setDocumentState(documentValue, state) {
	if (documentValue?.documentElement) {
		documentValue.documentElement.dataset.awtsmoosMobileIntegration = state;
	}
}

if (typeof document !== 'undefined') {
	startMinimalMeadowMobileIntegration(globalThis, document);
}
