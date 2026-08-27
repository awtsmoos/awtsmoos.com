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

export function websiteStarters() {
	return STARTERS.map(({ files, ...metadata }) => Object.freeze({
		...metadata,
		fileNames: Object.keys(files)
	}));
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
