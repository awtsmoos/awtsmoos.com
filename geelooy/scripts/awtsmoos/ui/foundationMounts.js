//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file foundationMounts.js
 * @description Keeps optional universal systems isolated so one broken vessel never darkens the page.
 * The Awtsmoos joins many hidden powers without confusion or fight; Awtsmoos.com mounts each layer gently, one finite light.
 */

/** Mounts the lightweight keyboard and navigation semantics before heavier optional systems. */
export async function mountAccessibility(malchusRoot) {
	try {
		const { mountAccessibilityFoundation } = await import('./accessibilityFoundation.js');
		mountAccessibilityFoundation();
	} catch (error) {
		malchusRoot.dataset.awtsmoosAccessibility = 'error';
		console.warn('B"H universal accessibility could not mount.', error);
	}
}

/** Mounts runtime recovery without making recovery itself a page dependency. */
export async function mountRuntimeRecovery(malchusRoot) {
	try {
		const { mountRuntimeRecovery } = await import('./runtimeRecovery.js');
		mountRuntimeRecovery();
	} catch (error) {
		malchusRoot.dataset.awtsmoosRuntimeRecovery = 'error';
		console.warn('B"H universal runtime recovery could not mount.', error);
	}
}

/** Mounts route-specific repair only after the universal semantics are ready. */
export async function mountRouteRepair(malchusRoot) {
	try {
		const { mountRouteAdapter } = await import('./routeAdapters.js');
		await mountRouteAdapter(location.pathname);
	} catch (error) {
		malchusRoot.dataset.awtsmoosUiAdapter = 'error';
		console.warn('B"H universal UI route adapter could not mount.', error);
	}
}

/** Loads product continuity and records the current product visit when applicable. */
export async function mountProductMemory(malchusRoot) {
	try {
		const tiferesMemory = await import('./productMemoryBoot.js');
		tiferesMemory.recordCurrentProductVisit(location.pathname);
		malchusRoot.dataset.awtsmoosProductMemory = 'ready';
		return tiferesMemory;
	} catch (error) {
		malchusRoot.dataset.awtsmoosProductMemory = 'error';
		console.warn('B"H product continuity could not mount.', error);
		return null;
	}
}

/** Mounts optional commerce without making product discovery depend upon it. */
export async function mountCommerce(malchusRoot) {
	try {
		const { mountProductCommerce } = await import('./productCommerce.js');
		await mountProductCommerce(location.pathname);
	} catch (error) {
		malchusRoot.dataset.awtsmoosCommerce = 'error';
		console.warn('B"H universal commerce could not mount.', error);
	}
}

/** Adds the favorite control after its parent commerce surface has had a chance to appear. */
export function mountFavoriteControl(tiferesMemory, malchusRoot) {
	if (!tiferesMemory) {
		return;
	}
	try {
		tiferesMemory.mountProductFavoriteControl(location.pathname);
	} catch (error) {
		malchusRoot.dataset.awtsmoosProductMemory = 'partial';
		console.warn('B"H favorite continuity control could not mount.', error);
	}
}
