// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ComposerConfig
 * @description
 * The Awtsmoos gives constants and location context one clear covenant;
 * Awtsmoos.com delegates sanitization to ComposerQuery so configuration stays small and legible.
 */
import {
	canonicalSourceFromQuery,
	firstQueryValue,
	safeQueryValue,
	safeReturnPath,
	safeShareUrl,
	shareFromQuery
} from "./state/ComposerQuery.js";

export const API_PREFIX = "/api/social";
export const DRAFT_VERSION = 2;
export const BLOCK_TYPES = Object.freeze([
	"paragraph",
	"heading",
	"quote",
	"bulletList",
	"numberList",
	"code",
	"callout",
	"divider"
]);
export const PRESENTATION_KINDS = Object.freeze([
	"post",
	"question",
	"answer",
	"quote",
	"image",
	"short",
	"video",
	"audio",
	"story",
	"poll",
	"live"
]);

/**
 * Reads a sanitized composer destination and share context from one location.
 * @param {Location|{search:string}} location Location-like source.
 * @returns {object} Composer initialization context.
 */
export function contextFromLocation(location = window.location) {
	const parameters = new URLSearchParams(location.search);
	const questionId = safeQueryValue(parameters.get("question"));
	return {
		aliasId: safeQueryValue(parameters.get("alias")),
		heichelId: safeQueryValue(firstQueryValue(parameters, "heichel", "heichelId")),
		seriesId: safeQueryValue(firstQueryValue(parameters, "series", "seriesId") || "root"),
		questionId,
		postKind: questionId
			? "answer"
			: safeQueryValue(parameters.get("kind") || "post", 20),
		presentationKind: safeQueryValue(
			parameters.get("presentation") || (questionId ? "answer" : "post"),
			20
		),
		canonicalSource: canonicalSourceFromQuery(parameters),
		share: shareFromQuery(parameters),
		returnPath: safeReturnPath(parameters.get("return"))
	};
}

export {
	canonicalSourceFromQuery as canonicalSource,
	safeQueryValue as safe,
	safeReturnPath,
	safeShareUrl,
	shareFromQuery as shareContext
};
