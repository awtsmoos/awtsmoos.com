//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond memory and URL while every chosen vessel may leave a lawful trace;
 * Awtsmoos.com keeps presentation separate from halachic state so preference can persist without moving a single zman from its place.
 */

import {
	applyPresentationOptions,
	normalizePresentationOptions,
	readAppliedPresentation,
	readPresentationOverrides,
	writePresentationUrl
} from "../domain/presentation-options.js";

const STORAGE_KEY = "awtsmoos-zmanim-presentation-v1";

/** Hydrate presentation with URL overrides taking precedence over remembered local preference. */
export function initializePresentation(url = currentUrl()) {
	const saved = readSavedPresentation();
	const overrides = readPresentationOverrides(url);
	return applyPresentationOptions(normalizePresentationOptions({
		...saved,
		...overrides
	}));
}

/** Apply a presentation patch, persist it, and reflect it into the URL without navigation. */
export function updatePresentation(patch, options = {}) {
	const current = readAppliedPresentation();
	const normalized = applyPresentationOptions({
		...current,
		...patch
	});
	if (options.persist !== false) {
		writeSavedPresentation(normalized);
	}
	if (options.url !== false) {
		const url = writePresentationUrl(normalized, currentUrl());
		history.replaceState(history.state, "", url);
	}
	document.dispatchEvent(new CustomEvent("presentation-change", {
		detail: normalized
	}));
	return normalized;
}

/** Read a previously remembered presentation record without trusting its shape. */
export function readSavedPresentation() {
	try {
		const value = JSON.parse(globalThis.localStorage?.getItem(STORAGE_KEY) || "null");
		return value && typeof value === "object" ? value : {};
	} catch (error) {
		return {};
	}
}

/** Persist one normalized record; storage failure never affects Zmanim calculation. */
export function writeSavedPresentation(options) {
	try {
		globalThis.localStorage?.setItem(
			STORAGE_KEY,
			JSON.stringify(normalizePresentationOptions(options))
		);
	} catch (error) {
		// Presentation persistence is optional; the active page state remains valid.
	}
}

function currentUrl() {
	return new URL(globalThis.location?.href || "https://awtsmoos.com/zmanim/");
}
