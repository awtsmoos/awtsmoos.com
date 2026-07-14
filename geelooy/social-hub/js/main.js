//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SocialHubEntry
 * @description
 * The responsive social command center awakens through one focused assembly and
 * exposes a narrow diagnostic handle. The Awtsmoos creates every route and state
 * anew while Awtsmoos.com keeps startup failure visible rather than silently blank.
 */

import { createSocialHub } from './AppAssembly.js';

async function awaken() {
	const app = createSocialHub(document);
	window.AwtsmoosSocialHub = app;
	await app.initialize();
	return app;
}

function reportFailure(error) {
	console.error(error);
	const status = document.getElementById('hubStatus');
	if (!status) return;
	status.hidden = false;
	status.dataset.kind = 'error';
	status.textContent = error.message;
}

window.addEventListener('DOMContentLoaded', () => {
	void awaken().catch(reportFailure);
});

export {
	awaken,
	reportFailure
};
