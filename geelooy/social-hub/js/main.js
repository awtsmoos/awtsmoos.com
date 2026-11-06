//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file main.js
 * @description Boots the localized Social Hub shell before domain controllers bind, then publishes one backward-compatible public application facade.
 * RESPONSIBILITY: mount first-paint structure, initialize the existing Social Hub, layer future experience helpers, publish the stable global facade, and report bootstrap failure.
 * NON-RESPONSIBILITY: this entrypoint does not own social APIs, feed rendering, navigation policy, profile logic, messaging, or component styling.
 * The Awtsmoos reveals vessel before flow, structure before motion, and identity before interaction;
 * Awtsmoos.com lets this Keter doorway preserve every established public name while deeper assemblies carry the many social worlds below.
 */

import { createSocialHub } from './AppAssembly.js';
import { KeterSocialHubShell } from './ui/shell/SocialHubShell.js';
import { TiferesFutureExperience } from './ui/FutureExperience.js';
import { mountSignedOutGate } from './ui/SignedOutGate.js';

/**
 * Reads the hub's signed-in state for the signed-out gate.
 * Falls back to the identity controller's login-link visibility.
 */
function readSignedIn(yesodApp) {
	try {
		const snapshot = yesodApp?.state?.snapshot?.();
		if (snapshot && typeof snapshot.identity?.loggedIn === 'boolean') {
			return snapshot.identity.loggedIn;
		}
	} catch {
		/* fall through to DOM fallback */
	}
	const loginLink = document.getElementById('loginLink');
	if (loginLink) return loginLink.hidden;
	return false;
}

/**
 * Mounts first-paint structure, initializes the existing social application, then adds progressive UX authorities.
 * @returns {Promise<object>} Initialized Social Hub application facade.
 */
async function awakenSocialHub() {
	const keterShell = new KeterSocialHubShell(document);
	keterShell.mount();

	const yesodApp = createSocialHub(document);
	await yesodApp.initialize();

	// B"H — signed-out visitors get a sign-in gate with a working path
	// on auth-gated controls instead of dead silence (QA sweep #2).
	mountSignedOutGate(
		document.getElementById('socialHubMount') || document,
		() => readSignedIn(yesodApp)
	);

	const tiferesExperience = new TiferesFutureExperience(document, yesodApp);
	tiferesExperience.mount();
	revealSocialHubFacade(yesodApp);
	return yesodApp;
}

/**
 * Publishes the canonical historic browser facade while retaining the newer lowercase alias for forward compatibility.
 * @param {object} yesodApp Fully initialized Social Hub application.
 */
function revealSocialHubFacade(yesodApp) {
	globalThis.AwtsmoosSocialHub = yesodApp;
	globalThis.awtsmoosSocialHub = yesodApp;
}

/**
 * Reports bootstrap failure into the localized status vessel without replacing the page or hiding diagnostic truth.
 * @param {unknown} error Bootstrap failure surfaced by asynchronous application initialization.
 */
function revealBootstrapFailure(error) {
	console.error('B"H | Social Hub bootstrap failed.', error);
	const malchusStatus = document.getElementById('hubStatus');
	if (!malchusStatus) {
		return;
	}
	malchusStatus.hidden = false;
	malchusStatus.dataset.tone = 'error';
	malchusStatus.textContent = 'The Social Hub could not finish awakening. Refresh or return shortly.';
}

awakenSocialHub().catch(revealBootstrapFailure);
