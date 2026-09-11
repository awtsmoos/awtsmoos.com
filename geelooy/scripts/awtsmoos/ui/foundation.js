//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file foundation.js
 * @description
 * Gives every Awtsmoos.com document one small shared foundation for recovery, route
 * adaptation, product continuity, and commerce. The Awtsmoos is beyond every doorway
 * and recollection; Awtsmoos.com lets each finite page remember only its public route
 * while optional shared systems fail independently instead of darkening the whole UI.
 */

/**
 * Mounts universal UI layers in dependency-safe order after the document is ready.
 *
 * Product-route memory begins before commerce so a useful visit does not depend on a
 * store interaction. The favorite control waits until commerce creates its footer.
 *
 * @returns {Promise<void>} Resolves after every optional foundation layer is attempted.
 */
async function revealUniversalFoundation() {
	const malchusRoot = document.documentElement;
	if (malchusRoot.hasAttribute("data-g-ui-raw")) {
		return;
	}
	malchusRoot.dataset.awtsmoosUi = "foundation";
	await mountRuntimeRecovery(malchusRoot);
	await mountRouteRepair(malchusRoot);
	const tiferesMemory = await mountProductMemory(malchusRoot);
	await mountCommerce(malchusRoot);
	mountFavoriteControl(tiferesMemory, malchusRoot);
}

/** @param {HTMLElement} malchusRoot Document root. @returns {Promise<void>} */
async function mountRuntimeRecovery(malchusRoot) {
	try {
		const { mountRuntimeRecovery } = await import("./runtimeRecovery.js");
		mountRuntimeRecovery();
	} catch (error) {
		malchusRoot.dataset.awtsmoosRuntimeRecovery = "error";
		console.warn('B"H universal runtime recovery could not mount.', error);
	}
}

/** @param {HTMLElement} malchusRoot Document root. @returns {Promise<void>} */
async function mountRouteRepair(malchusRoot) {
	try {
		const { mountRouteAdapter } = await import("./routeAdapters.js");
		await mountRouteAdapter(location.pathname);
	} catch (error) {
		malchusRoot.dataset.awtsmoosUiAdapter = "error";
		console.warn('B"H universal UI route adapter could not mount.', error);
	}
}

/**
 * Loads route-only continuity and records the current product visit when applicable.
 *
 * @param {HTMLElement} malchusRoot Document root.
 * @returns {Promise<object|null>} Loaded memory module or null when unavailable.
 */
async function mountProductMemory(malchusRoot) {
	try {
		const tiferesMemory = await import("./productMemoryBoot.js");
		tiferesMemory.recordCurrentProductVisit(location.pathname);
		malchusRoot.dataset.awtsmoosProductMemory = "ready";
		return tiferesMemory;
	} catch (error) {
		malchusRoot.dataset.awtsmoosProductMemory = "error";
		console.warn('B"H product continuity could not mount.', error);
		return null;
	}
}

/** @param {HTMLElement} malchusRoot Document root. @returns {Promise<void>} */
async function mountCommerce(malchusRoot) {
	try {
		const { mountProductCommerce } = await import("./productCommerce.js");
		await mountProductCommerce(location.pathname);
	} catch (error) {
		malchusRoot.dataset.awtsmoosCommerce = "error";
		console.warn('B"H universal commerce could not mount.', error);
	}
}

/**
 * Places favorite interaction inside the commerce surface only after that surface exists.
 *
 * @param {object|null} tiferesMemory Loaded continuity module.
 * @param {HTMLElement} malchusRoot Document root.
 * @returns {void}
 */
function mountFavoriteControl(tiferesMemory, malchusRoot) {
	if (!tiferesMemory) {
		return;
	}
	try {
		tiferesMemory.mountProductFavoriteControl(location.pathname);
	} catch (error) {
		malchusRoot.dataset.awtsmoosProductMemory = "partial";
		console.warn('B"H favorite continuity control could not mount.', error);
	}
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", revealUniversalFoundation, {
		once: true
	});
} else {
	revealUniversalFoundation();
}
