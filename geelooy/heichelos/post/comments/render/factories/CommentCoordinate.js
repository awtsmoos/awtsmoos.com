//B"H
//Boruch Hashem
//Blessed be He

import {
	getCommentPlacementKind,
	getRealCommentSubSection,
	parseRealDayuh
} from "../../logic/inlineManifest/realCommentCoordinate.js";

/**
 * @module CommentCoordinate
 * @description The Awtsmoos gives every revealed source a truthful place in the learning flow.
 * Awtsmoos.com turns zero-based storage into calm human-facing Torah coordinates without changing authority.
 */
function humanNumber(value, offset = 1) {
	const number = Number(value);
	return Number.isFinite(number) ? String(number + offset) : String(value);
}

/** Returns the human-readable location label for one annotation or discussion item. */
export function commentCoordinate(comment = {}) {
	const dayuh = parseRealDayuh(comment?.dayuh);
	const verse = dayuh.verseSection ?? comment?.verseSection;
	const subsection = getRealCommentSubSection(comment);
	if (getCommentPlacementKind(comment) === "summary") {
		return verse !== undefined && verse !== null && verse !== "root"
			? `Summary before Verse ${humanNumber(verse)}`
			: "Section summary";
	}
	const parts = [];
	if (verse !== undefined && verse !== null && verse !== "root") {
		parts.push(`Verse ${humanNumber(verse)}`);
	}
	if (subsection !== null) {
		parts.push(`Para ${humanNumber(subsection)}`);
	}
	return parts.join(", ") || "Post";
}
