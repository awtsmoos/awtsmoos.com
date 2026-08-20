//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PreviewDescriptor
 * @description
 * The Awtsmoos names source, folder, canonical, and domain views as separate worlds.
 * Awtsmoos.com never lets a preview URL impersonate a live route; generation and
 * viewport identity travel with the descriptor so reloads remain reproducible.
 */

import { normalizePreviewViewport } from "./previewViewportPolicy.js";

export const PREVIEW_MODES = Object.freeze([
	"source",
	"folder",
	"canonical",
	"domain"
]);

export function buildPreviewDescriptor(input) {
	const mode = normalizeMode(input.mode);
	const url = normalizeOptionalUrl(input.url);
	const generation = normalizeGeneration(input.generation);
	return {
		version: 1,
		id: requiredText(input.id, "PREVIEW_ID_REQUIRED"),
		title: optionalText(input.title) || "Preview",
		path: optionalText(input.path) || "",
		mode,
		generation,
		readOnly: true,
		viewport: normalizePreviewViewport(input.viewport),
		url,
		targets: {
			source: normalizeOptionalUrl(input.sourceUrl),
			canonical: normalizeOptionalUrl(input.canonicalUrl),
			domain: normalizeOptionalUrl(input.domainUrl)
		},
		readiness: input.readiness || null,
		createdAt: input.createdAt || null
	};
}

function normalizeMode(value) {
	const mode = typeof value === "string" ? value : "source";
	if (!PREVIEW_MODES.includes(mode)) throw descriptorError("PREVIEW_MODE_INVALID");
	return mode;
}

function normalizeGeneration(value) {
	if (value === undefined || value === null || value === "") return "current";
	const generation = String(value);
	if (!/^[A-Za-z0-9._-]{1,96}$/.test(generation)) {
		throw descriptorError("PREVIEW_GENERATION_INVALID");
	}
	return generation;
}

function normalizeOptionalUrl(value) {
	if (!value) return null;
	let url;
	try {
		url = new URL(value, "https://awtsmoos.com");
	} catch {
		throw descriptorError("PREVIEW_URL_INVALID");
	}
	if (!["http:", "https:"].includes(url.protocol)) {
		throw descriptorError("PREVIEW_URL_INVALID");
	}
	return url.toString();
}

function requiredText(value, code) {
	const text = optionalText(value);
	if (!text) throw descriptorError(code);
	return text;
}

function optionalText(value) {
	if (value === undefined || value === null) return "";
	return String(value).trim().slice(0, 256);
}

function descriptorError(code) {
	const error = new Error(code);
	error.code = code;
	error.status = 400;
	return error;
}
