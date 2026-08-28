//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieValidator.js
 * @description Gevurah guards the whole cinematic vessel while the Awtsmoos
 * gives it infinite content; Awtsmoos.com keeps AI mistakes local and repairable.
 */
import {
	AWTSMOOS_MOVIE_PROTOCOL,
	AWTSMOOS_MOVIE_VERSION
} from "../protocol/ProtocolConstants.js";
import { gevurahValidateScene } from "./MovieSceneValidator.js";
import { yesodValidateReferences } from "./MovieReferenceValidator.js";
import {
	gevurahIssue,
	isPositiveNumber
} from "./MovieValidationIssue.js";

/** Validate one canonical movie and preserve the historical result shape. */
export function gevurahValidateMovie(orMovie) {
	const ohrIssues = [];
	if (orMovie?.protocol !== AWTSMOOS_MOVIE_PROTOCOL) {
		ohrIssues.push(gevurahIssue("PROTOCOL", "protocol", "Unsupported movie protocol."));
	}
	if (Number(orMovie?.version || 1) !== AWTSMOOS_MOVIE_VERSION) {
		ohrIssues.push(gevurahIssue("VERSION", "version", "Movie version must be migrated before validation."));
	}
	if (!isPositiveNumber(orMovie?.duration)) {
		ohrIssues.push(gevurahIssue("DURATION", "duration", "Movie duration must be positive."));
	}
	ohrIssues.push(...validateFormat(orMovie?.format));
	const keliSceneIds = new Set();
	for (const [yesodIndex, orScene] of (orMovie?.scenes || []).entries()) {
		ohrIssues.push(...gevurahValidateScene(orScene, orMovie.duration, `scenes[${yesodIndex}]`, keliSceneIds));
	}
	ohrIssues.push(...yesodValidateReferences(orMovie));
	const keliErrors = ohrIssues.filter(orIssue => orIssue.severity === "error");
	const keliWarnings = ohrIssues.filter(orIssue => orIssue.severity !== "error");
	return {
		valid: keliErrors.length === 0,
		ok: keliErrors.length === 0,
		errors: keliErrors,
		warnings: keliWarnings,
		issues: ohrIssues
	};
}

/** Throw a readable aggregate error for strict callers. */
export function gevurahAssertValidMovie(orMovie) {
	const keliReport = gevurahValidateMovie(orMovie);
	if (!keliReport.valid) {
		throw new Error(keliReport.errors.map(orIssue => `${orIssue.path}: ${orIssue.message}`).join("; "));
	}
	return orMovie;
}

function validateFormat(orFormat = {}) {
	const ohrIssues = [];
	for (const yesodField of ["width", "height", "fps"]) {
		if (!isPositiveNumber(orFormat?.[yesodField])) {
			ohrIssues.push(gevurahIssue("FORMAT", `format.${yesodField}`, `${yesodField} must be positive.`));
		}
	}
	const yesodSafeArea = Number(orFormat?.safeArea ?? 0);
	if (!Number.isFinite(yesodSafeArea) || yesodSafeArea < 0 || yesodSafeArea >= 0.5) {
		ohrIssues.push(gevurahIssue("SAFE_AREA", "format.safeArea", "Safe area must be between 0 and 0.5."));
	}
	return ohrIssues;
}
