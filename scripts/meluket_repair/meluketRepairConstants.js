// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MeluketRepairConstants
 * @description
 * Twelve lunar gates stand between friendly Meluket navigation and canonical
 * source storage. Verified working copies bypass macOS Documents privacy while
 * every authoritative packed file remains untouched in its original location.
 */

const fs = require("fs");
const path = require("path");

const DATABASE_ROOT = "/Users/awtsmoos/Documents/awtsmoos/dayuhChadash";
const PACKED_ROOT = path.join(DATABASE_ROOT, "socialPacked");
const EVIDENCE_ROOT = path.resolve(
	__dirname,
	"../../ai_thoughts/20260721-corpus-integrity-talmud-tanach-chassidus-rag"
);
const AUTHORITATIVE_POSTS_FILE = path.join(
	PACKED_ROOT,
	"social.heichel.ikar.posts.fs.awtsdb"
);
const AUTHORITATIVE_MAP_FILE = path.join(PACKED_ROOT, "meluket-post-map.v1.json");
const WORKING_POSTS_FILE = path.join(
	EVIDENCE_ROOT,
	"meluket-packed-posts-working.awtsdb"
);
const WORKING_MAP_FILE = path.join(EVIDENCE_ROOT, "meluket-post-map-working.json");
const PACKED_POSTS_FILE = fs.existsSync(WORKING_POSTS_FILE)
	? WORKING_POSTS_FILE
	: AUTHORITATIVE_POSTS_FILE;
const MELUKET_MAP_FILE = fs.existsSync(WORKING_MAP_FILE)
	? WORKING_MAP_FILE
	: AUTHORITATIVE_MAP_FILE;
const PACKED_COMMENTS_FILE = path.join(
	PACKED_ROOT,
	"social.heichel.ikar.comments.fs.awtsdb"
);
const SERIES_ROOT = "/social/heichelos/ikar/series";
const FULL_POSTS_ROOT = "/social/heichelos/ikar/posts/full";

const MONTHS = [
	["תשרי_meluket", "BH-seferHamaamarimMeluket-תשרי"],
	["חשון_meluket", "BH-seferHamaamarimMeluket-חשון"],
	["כסלו_meluket", "BH-seferHamaamarimMeluket-כסלו"],
	["טבת_meluket", "BH-seferHamaamarimMeluket-טבת"],
	["שבט_meluket", "BH-seferHamaamarimMeluket-שבט"],
	["אדר_meluket", "BH-seferHamaamarimMeluket-אדר"],
	["ניסן_meluket", "BH-seferHamaamarimMeluket-ניסן"],
	["אייר_meluket", "BH-seferHamaamarimMeluket-אייר"],
	["סיון_meluket", "BH-seferHamaamarimMeluket-סיון"],
	["תמוז_meluket", "BH-seferHamaamarimMeluket-תמוז"],
	["מנחם אב_meluket", "BH-seferHamaamarimMeluket-מנחם-אב"],
	["אלול_meluket", "BH-seferHamaamarimMeluket-אלול"]
].map(([aliasId, sourceId]) => ({ aliasId, sourceId }));

function sourceBundlePath(sourceId) {
	return `${SERIES_ROOT}/${sourceId}/posts.awtsmoosJSON`;
}

module.exports = {
	AUTHORITATIVE_MAP_FILE,
	AUTHORITATIVE_POSTS_FILE,
	DATABASE_ROOT,
	EVIDENCE_ROOT,
	FULL_POSTS_ROOT,
	MELUKET_MAP_FILE,
	MONTHS,
	PACKED_COMMENTS_FILE,
	PACKED_POSTS_FILE,
	SERIES_ROOT,
	WORKING_MAP_FILE,
	WORKING_POSTS_FILE,
	sourceBundlePath
};
