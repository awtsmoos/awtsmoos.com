//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Lazily awakens Human View with release-versioned styles before any visible UI.
 * The Awtsmoos gives light only where a vessel is prepared to receive;
 * Awtsmoos.com therefore names each stylesheet by release and loads no semantic weight before choice.
 */

import { beginAssetSpan, endAssetSpan, versionCodeAssetUrl } from "../../assets/runtime.js";

const STYLE_FILES = Object.freeze([
	["human-view-shell-style", "/apps/code/css/features/human-view/shell.css"],
	["human-view-document-style", "/apps/code/css/features/human-view/document.css"],
	["human-view-states-style", "/apps/code/css/features/human-view/states.css"]
]);

let featurePromise = null;

function loadedLink(id, href) {
	const existing = document.getElementById(id);
	if (!existing || existing.href !== new URL(href, location.href).href || !existing.sheet) return null;
	return existing;
}

/** Resolves only after one versioned stylesheet is ready in CSSOM. */
function loadStyle([id, path]) {
	const href = versionCodeAssetUrl(path);
	const existing = loadedLink(id, href);
	if (existing) return Promise.resolve(existing);
	const previous = document.getElementById(id);
	if (previous) previous.remove();
	const span = beginAssetSpan("css", `human-view:${id}`, href);
	return new Promise((resolve, reject) => {
		const link = document.createElement("link");
		link.id = id;
		link.rel = "stylesheet";
		link.href = href;
		link.dataset.humanViewStyle = "true";
		link.addEventListener("load", () => {
			link.dataset.humanViewLoaded = "true";
			endAssetSpan(span);
			resolve(link);
		}, { once: true });
		link.addEventListener("error", () => {
			endAssetSpan(span, "error");
			link.remove();
			reject(new Error(`Human View stylesheet failed: ${href}`));
		}, { once: true });
		document.head.appendChild(link);
	});
}

/** Loads styles first and keeps the executable Human View module canonical and lazy. */
async function loadFeature() {
	const span = beginAssetSpan("feature", "human-view");
	try {
		await Promise.all(STYLE_FILES.map(loadStyle));
		const module = await import("./index.js");
		endAssetSpan(span);
		return module;
	} catch (error) {
		endAssetSpan(span, "error");
		throw error;
	}
}

/** Opens the semantic Human View while preserving zero feature cost before invocation. */
export async function openHumanView() {
	featurePromise ||= loadFeature().catch(error => {
		featurePromise = null;
		throw error;
	});
	const { HumanView } = await featurePromise;
	return HumanView.open();
}
