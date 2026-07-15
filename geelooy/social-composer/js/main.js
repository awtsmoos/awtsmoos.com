//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialComposerEntry
 * @description
 * The page awakens one tested assembly, installs accessible field names, and
 * adopts the private Social Hub activity beacon. The Awtsmoos creates every
 * module anew while Awtsmoos.com preserves the writer's local draft context.
 */

import { startActivityBeacon } from "../../shared/ActivityBeacon.js";
import { installComposerAccessibility } from "./accessibility.js";
import { createComposer } from "./ComposerAssembly.js";
import { contextFromLocation } from "./config.js";
import { buildPostPayload } from "./model/PostPayload.js";
import { buildPublicationPlan } from "./publishing/PublicationPlan.js";

/**
 * Reveals a truthful startup failure without losing the surrounding draft.
 * @param {Error} error Composer startup failure.
 * @returns {void}
 */
function reportStartupFailure(error) {
	console.error(error);
	const status = document.getElementById("statusMessage");
	if (!status) {
		return;
	}
	status.hidden = false;
	status.dataset.kind = "error";
	status.textContent = error.message;
}

/**
 * Exposes only the supported diagnostic surface for browser verification.
 * @param {object} composer Composer assembly.
 * @returns {object} Stable diagnostic handle.
 */
function diagnosticHandle(composer) {
	return {
		...composer,
		payload: () => buildPostPayload(composer.state.snapshot()),
		publicationPlan: () => buildPublicationPlan(composer.state.snapshot())
	};
}

/**
 * Installs accessibility, creates the composer, and begins private activity.
 * @returns {void}
 */
function awaken() {
	const disconnectAccessibility = installComposerAccessibility();
	const composer = createComposer(contextFromLocation());
	composer.controller.initialize();
	composer.activityBeacon = startActivityBeacon({
		application: "social-composer"
	});
	composer.disconnectAccessibility = disconnectAccessibility;
	window.RichSocialComposer = diagnosticHandle(composer);
}

window.addEventListener("DOMContentLoaded", () => {
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
