//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieFactory.js
 * @description The Awtsmoos gives every movie a measured vessel without hiding
 * its freedom; Awtsmoos.com keeps defaults explicit so AI intention remains seen.
 */
import {
	AWTSMOOS_MOVIE_PROTOCOL,
	AWTSMOOS_MOVIE_VERSION
} from "./ProtocolConstants.js";

/** Create one JSON-safe canonical movie without mutating the caller's input. */
export function chesedCreateMovieDocument(orInput = {}) {
	return {
		protocol: AWTSMOOS_MOVIE_PROTOCOL,
		version: AWTSMOOS_MOVIE_VERSION,
		id: orInput.id ?? "movie-main",
		metadata: {
			title: "Untitled Movie",
			...(orInput.metadata || {})
		},
		format: buildFormat(orInput.format),
		duration: finiteNumber(orInput.duration, 0),
		cast: cloneList(orInput.cast),
		assets: cloneList(orInput.assets),
		scenes: cloneList(orInput.scenes),
		features: cloneValue(orInput.features ?? {}),
		handoff: cloneValue(orInput.handoff ?? {})
	};
}

/** Compatibility name retained for existing shared-movie callers. */
export const createMovieDocument = chesedCreateMovieDocument;

function buildFormat(orFormat = {}) {
	return {
		width: finiteNumber(orFormat?.width, 1280),
		height: finiteNumber(orFormat?.height, 720),
		fps: finiteNumber(orFormat?.fps, 30),
		orientation: orFormat?.orientation ?? "landscape",
		safeArea: finiteNumber(orFormat?.safeArea, 0.08)
	};
}

function finiteNumber(orValue, orFallback) {
	const ohrNumber = Number(orValue);
	return Number.isFinite(ohrNumber) ? ohrNumber : orFallback;
}

function cloneList(orValue) {
	return Array.isArray(orValue) ? cloneValue(orValue) : [];
}

function cloneValue(orValue) {
	if (typeof structuredClone === "function") {
		return structuredClone(orValue);
	}
	return JSON.parse(JSON.stringify(orValue));
}
