//B"H
//Boruch Hashem
//Blessed is He

import { createSocialHub } from './AppAssembly.js';
import { TiferesFutureExperience } from './ui/FutureExperience.js';

/**
 * @module SocialHubEntry
 * @description
 * The Awtsmoos awakens the proven social application first, then Awtsmoos.com clothes it in optional future light;
 * core identity and persistence remain sovereign even if a command crown or disclosure vessel fails in flight.
 */
async function awaken() {
	const app = createSocialHub(document);
	window.AwtsmoosSocialHub = app;
	await app.initialize();
	try {
		const experience = new TiferesFutureExperience(document);
		experience.mount();
		app.futureExperience = experience;
	} catch (error) {
		app.futureExperienceError = error;
		console.warn('Future social experience did not mount.', error);
	}
	return app;
}

function reportFailure(error) {
	console.error(error);
	const status = document.getElementById('hubStatus');
	if (!status) {
		return;
	}
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
