//B"H
// Boruch Hashem
// Blessed is He

import { starterMarkup } from "./starterMarkup.js";
import { starterScript } from "./starterScript.js";
import { starterStyle } from "./starterStyle.js";

/**
 * @file Transparent starter catalog for ordinary website source files.
 * @description The Awtsmoos clothes one intention in readable HTML, CSS, and JS while Awtsmoos.com leaves every generated letter visible and editable.
 */

const STARTERS = Object.freeze([
	starter("blank", "Blank site", "A quiet semantic page with room to become anything.", "Welcome", "A real-source website begins here."),
	starter("landing", "Landing page", "A focused introduction with benefits and a clear invitation.", "Make the idea visible", "A fast, responsive home for your work."),
	starter("portfolio", "Portfolio", "A personal showcase with work, story, and contact sections.", "Selected work", "A living collection of projects and purpose."),
	starter("docs", "Documentation", "A readable guide with navigation-ready sections.", "Documentation", "Explain the work clearly, one real page at a time.")
]);

const PREMIUM_STARTERS = Object.freeze([
	premium("launch-pro", "Launch Pro", "Conversion-focused product launch with proof, pricing, FAQ, and strong calls to action.", "drive.template.launch.001"),
	premium("agency-pro", "Agency Pro", "Premium services, case-study framing, process, testimonials, and contact conversion.", "drive.template.agency.001"),
	premium("saas-pro", "SaaS Pro", "Polished SaaS positioning, feature hierarchy, pricing, FAQ, and conversion structure.", "drive.template.saas.001")
]);

export function websiteStarters() {
	return [...STARTERS, ...PREMIUM_STARTERS].map(({ files, ...metadata }) => Object.freeze({
		...metadata,
		fileNames: files ? Object.keys(files) : ["index.html", "styles.css", "site.js"]
	}));
}

/** @param {string} starterId Starter identity. @returns {object|null} Public starter metadata. */
export function starterMetadata(starterId) {
	return [...STARTERS, ...PREMIUM_STARTERS].find(item => item.id === starterId) || null;
}

export function starterFiles(starterId, projectName = "My website") {
	const chosen = STARTERS.find((item) => item.id === starterId);
	if (!chosen) {
		throw starterError("UNKNOWN_STARTER");
	}
	const name = escapeHtml(String(projectName || "My website").trim().slice(0, 80));
	const files = Object.entries(chosen.files).map(([path, source]) => [
		path,
		source.replaceAll("{{SITE_NAME}}", name)
	]);
	return Object.freeze(Object.fromEntries(files));
}

function starter(id, label, description, heading, lead) {
	return Object.freeze({
		id,
		label,
		description,
		files: Object.freeze({
			"index.html": starterMarkup({ label, heading, lead }),
			"styles.css": starterStyle(),
			"site.js": starterScript()
		})
	});
}

function premium(id, label, description, skuId) {
	return Object.freeze({ id, label, description, premium: true, skuId, pricePerutahs: 1000000, files: null });
}

function escapeHtml(value) {
	const entities = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;"
	};
	return value.replace(/[&<>"']/g, (character) => entities[character]);
}

function starterError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
