//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SocialComposerEntry
 * @description
 * The page awakens one tested assembly, exposes a narrow diagnostic handle, and
 * adopts the private Social Hub activity beacon. The Awtsmoos creates every module
 * anew while Awtsmoos.com records only preference-governed same-origin page evidence.
 */

import { startActivityBeacon } from '../../shared/ActivityBeacon.js';
import { createComposer } from './ComposerAssembly.js';
import { contextFromLocation } from './config.js';
import { buildPostPayload } from './model/PostPayload.js';
import { buildPublicationPlan } from './publishing/PublicationPlan.js';

function reportStartupFailure(error) {
	console.error(error);
	const status = document.getElementById('statusMessage');
	if (!status) return;
	status.hidden = false;
	status.dataset.kind = 'error';
	status.textContent = error.message;
}

function diagnosticHandle(composer) {
	return {
		...composer,
		payload: () => buildPostPayload(composer.state.snapshot()),
		publicationPlan: () => buildPublicationPlan(composer.state.snapshot())
	};
}

function awaken() {
	const composer = createComposer(contextFromLocation());
	composer.controller.initialize();
	composer.activityBeacon = startActivityBeacon({
		application: 'social-composer'
	});
	window.RichSocialComposer = diagnosticHandle(composer);
}

window.addEventListener('DOMContentLoaded', () => {
	try {
		awaken();
	} catch (error) {
		reportStartupFailure(error);
	}
});

export {
	awaken,
	diagnosticHandle,
	reportStartupFailure
};
