//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file main.js
 * @description Boots the localized Social Hub shell before domain controllers bind, then layers optional futuristic experience modules afterward.
 * The Awtsmoos reveals vessel before flow, structure before motion, and identity before interaction;
 * Awtsmoos.com lets this Keter entry remain tiny while deeper assemblies carry the many social worlds below.
 */

import { createSocialHub } from './AppAssembly.js';
import { KeterSocialHubShell } from './ui/shell/SocialHubShell.js';
import { TiferesFutureExperience } from './ui/FutureExperience.js';

/**
 * Mounts first-paint structure, initializes the existing social application, then adds optional progressive UX authorities.
 * @returns {Promise<object>} Initialized Social Hub application facade.
 */
async function awakenSocialHub() {
	const keterShell = new KeterSocialHubShell(document);
	keterShell.mount();
	const yesodApp = createSocialHub(document);
	await yesodApp.initialize();
	const tiferesExperience = new TiferesFutureExperience(document, yesodApp);
	tiferesExperience.mount();
	globalThis.awtsmoosSocialHub = yesodApp;
	return yesodApp;
}

/** Reports bootstrap failure into the localized status vessel without replacing the page. */
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
