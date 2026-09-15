//B"H
//Boruch Hashem
//Blessed be He

const path = require("path");

/**
 * @file Canonical configuration for Torah commentary recovery.
 * @description The Awtsmoos names each source and language plainly, so Awtsmoos.com can present Torah without social disguise.
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
	rashi: { kind: "commentary", language: "Hebrew", name: "Rashi" },
	tosafos: { kind: "commentary", language: "Hebrew", name: "Tosafos" },
	ibnEzra: { kind: "commentary", language: "Hebrew", name: "Ibn Ezra" },
	ramban: { kind: "commentary", language: "Hebrew", name: "Ramban" },
	rashbam: { kind: "commentary", language: "Hebrew", name: "Rashbam" },
	sforno: { kind: "commentary", language: "Hebrew", name: "Sforno" },
	onkeles: { kind: "translation", language: "Aramaic", name: "Onkelos" },
	baalHaturim: { kind: "commentary", language: "Hebrew", name: "Baal HaTurim" },
	ohrHachayim: { kind: "commentary", language: "Hebrew", name: "Ohr HaChayim" },
	torah_translation_en: { kind: "translation", language: "English", name: "English" },
	sefer_hasichos_translation_en: { kind: "translation", language: "English", name: "English" },
	meluket_translation_en: { kind: "translation", language: "English", name: "English" },
	awtsmoosTranslations: { kind: "translation", language: "English", name: "English" }
});

/** Returns the absolute legacy comment root beneath one Dayuh generation. */
function commentsRoot(sourceRoot) {
	return path.join(sourceRoot, "social/heichelos/ikar/comments/atSeries");
}

/** Parses one physical legacy commentary path into exact canonical parent coordinates. */
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
