//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Lazily awakens the complete neon Human Takeover surface with release-versioned CSSOM first.
 * The Awtsmoos contains every color and semantic depth before the browser requests any finite garment;
 * Awtsmoos.com therefore keeps Code startup free of takeover cost and loads the vivid surface only on invocation.
 */

import { beginAssetSpan, endAssetSpan, versionCodeAssetUrl } from "../../assets/runtime.js";

const STYLE_FILES = Object.freeze([
	["human-takeover-tokens-style", "/apps/code/css/features/human-view/tokens.css"],
	["human-takeover-shell-style", "/apps/code/css/features/human-view/shell.css"],
	["human-takeover-document-style", "/apps/code/css/features/human-view/document.css"],
	["human-takeover-sections-style", "/apps/code/css/features/human-view/sections.css"],
	["human-takeover-zoom-style", "/apps/code/css/features/human-view/zoom.css"],
	["human-takeover-controls-style", "/apps/code/css/features/human-view/controls.css"],
	["human-takeover-decisions-style", "/apps/code/css/features/human-view/decisions.css"],
	["human-takeover-states-style", "/apps/code/css/features/human-view/states.css"],
	["human-takeover-modes-style", "/apps/code/css/features/human-view/modes.css"],
	["human-takeover-map-style", "/apps/code/css/features/human-view/map.css"],
	["human-takeover-map-nodes-style", "/apps/code/css/features/human-view/map-nodes.css"],
	["human-takeover-behavior-style", "/apps/code/css/features/human-view/behavior.css"],
	["human-takeover-source-style", "/apps/code/css/features/human-view/source.css"],
	["human-takeover-mobile-style", "/apps/code/css/features/human-view/mobile.css"],
	["human-takeover-mobile-content-style", "/apps/code/css/features/human-view/mobile-content.css"]
]);

let featurePromise = null;

function existingStyle(id, href) {
	const link = document.getElementById(id);
	if (!link || link.href !== new URL(href, location.href).href || !link.sheet) return null;
	return link;
}

function loadStyle([id, path]) {
	const href = versionCodeAssetUrl(path);
	const existing = existingStyle(id, href);
	if (existing) return Promise.resolve(existing);
	document.getElementById(id)?.remove();
	const span = beginAssetSpan("css", `human-takeover:${id}`, href);
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
			reject(new Error(`Human Takeover stylesheet failed: ${href}`));
		}, { once: true });
		document.head.appendChild(link);
	});
}

async function loadFeature() {
	const span = beginAssetSpan("feature", "human-takeover");
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

/** Opens Human Takeover while preserving zero semantic workspace cost before invocation. */
export async function openHumanView() {
	featurePromise ||= loadFeature().catch(error => {
		featurePromise = null;
		throw error;
	});
	const { HumanView } = await featurePromise;
	return HumanView.open();
}
