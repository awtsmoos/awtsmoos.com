//B"H
//Boruch Hashem
//Blessed be He

const path = require("path");

/**
 * @file Canonical configuration for Torah commentary recovery.
 * @description Only reviewed source aliases may become first-class source annotations.
 */
const HOME = process.env.HOME;
const LIVE_ROOT = path.join(HOME, "Documents/awtsmoos/dayuhChadash");
const OLD_ROOT = path.join(HOME, "Documents/dayuhChadash - Copy");
const CANDIDATE_ROOT = path.join(HOME, "Work/.ai-preserve/torah-commentary-candidate");

const SOURCE_ROOTS = [
	{ id: "legacy-full", root: OLD_ROOT },
	{ id: "canonical-current", root: LIVE_ROOT }
];

const ANNOTATIONS = Object.freeze({
	rashi: { kind: "commentary", language: "he", name: "Rashi" },
	tosafos: { kind: "commentary", language: "he", name: "Tosafos" },
	ibnEzra: { kind: "commentary", language: "he", name: "Ibn Ezra" },
	ramban: { kind: "commentary", language: "he", name: "Ramban" },
	rashbam: { kind: "commentary", language: "he", name: "Rashbam" },
	sforno: { kind: "commentary", language: "he", name: "Sforno" },
	onkeles: { kind: "translation", language: "arc", name: "Onkelos" },
	baalHaturim: { kind: "commentary", language: "he", name: "Baal HaTurim" },
	ohrHachayim: { kind: "commentary", language: "he", name: "Ohr HaChayim" },
	torah_translation_en: { kind: "translation", language: "en", name: "English" },
	sefer_hasichos_translation_en: { kind: "translation", language: "en", name: "English" },
	meluket_translation_en: { kind: "translation", language: "en", name: "English" },
	awtsmoosTranslations: { kind: "translation", language: "en", name: "English" }
});

/** Returns the absolute legacy comment root beneath one Dayuh generation. */
function commentsRoot(sourceRoot) {
	return path.join(sourceRoot, "social/heichelos/ikar/comments/atSeries");
}

/** Parses one physical legacy commentary path into canonical parent coordinates. */
function parseCommentPath(file, source) {
	const relative = path.relative(commentsRoot(source.root), file);
	const parts = relative.split(path.sep);
	if (parts.length !== 4 || parts[1] !== "atPost") return null;
	const aliasId = parts[3].replace(/\.awtsmoosJSON$/i, "");
	if (!ANNOTATIONS[aliasId]) return null;
	return {
		sourceId: source.id,
		seriesId: parts[0],
		postId: parts[2],
		aliasId,
		file
	};
}

module.exports = {
	ANNOTATIONS,
	CANDIDATE_ROOT,
	LIVE_ROOT,
	SOURCE_ROOTS,
	commentsRoot,
	parseCommentPath
};
