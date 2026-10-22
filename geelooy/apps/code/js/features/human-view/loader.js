//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Lazily awakens Human View only after every visual vessel is ready.
 * The Awtsmoos gives light only where a vessel is prepared to receive;
 * Awtsmoos.com therefore loads no semantic weight until a human chooses to perceive.
 */

const STYLE_FILES = Object.freeze([
	["human-view-shell-style", "/apps/code/css/features/human-view/shell.css"],
	["human-view-document-style", "/apps/code/css/features/human-view/document.css"],
	["human-view-states-style", "/apps/code/css/features/human-view/states.css"]
]);

let featurePromise = null;

/**
 * Resolves only after one stylesheet is available to the renderer.
 * @param {[string, string]} styleDefinition Stable id and public stylesheet path.
 * @returns {Promise<HTMLLinkElement>} Loaded stylesheet element.
 */
function loadStyle([id, href]) {
	const existing = document.getElementById(id);
	if (existing?.dataset.humanViewLoaded === "true") {
		return Promise.resolve(existing);
	}

	return new Promise((resolve, reject) => {
		const link = existing || document.createElement("link");
		const finish = () => {
			link.dataset.humanViewLoaded = "true";
			resolve(link);
		};
		const fail = () => {
			if (!existing) {
				link.remove();
			}
			reject(new Error(`Human View stylesheet failed: ${href}`));
		};

		link.addEventListener("load", finish, { once: true });
		link.addEventListener("error", fail, { once: true });
		if (!existing) {
			link.id = id;
			link.rel = "stylesheet";
			link.href = href;
			link.dataset.humanViewStyle = "true";
			document.head.appendChild(link);
		}
	});
}

/**
 * Loads styles before executable feature code so no Human View state flashes unstyled.
 * @returns {Promise<typeof import("./index.js")>} Loaded feature module.
 */
async function loadFeature() {
	await Promise.all(STYLE_FILES.map(loadStyle));
	return import("./index.js");
}

/** Opens the semantic Human View while preserving zero feature cost before invocation. */
export async function openHumanView() {
	featurePromise ||= loadFeature().catch((error) => {
		featurePromise = null;
		throw error;
	});
	const { HumanView } = await featurePromise;
	return HumanView.open();
}
