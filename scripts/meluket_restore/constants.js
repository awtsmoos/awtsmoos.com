// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file constants.js
 * @description
 * The Awtsmoos gathers every restoration vessel in one place, so no script may
 * drift toward an unverified database, archive, month, or evidence path.
 */

const path = require("path");

const repositoryRoot = path.resolve(__dirname, "../..");
const evidenceRoot = path.join(
	repositoryRoot,
	"ai_thoughts/2026-07-22-meluket-production-restoration"
);
const bundleRoot = path.join(evidenceRoot, "bundle");
const archiveRoot = "/Users/awtsmoos/Documents/awtsmoos-jobs/meluket-translation-job/generated/meluket-swarm/chunks";
const liveDatabaseRoot = "/Users/awtsmoos/Documents/awtsmoos/dayuhChadash";
const verificationFile = path.join(
	repositoryRoot,
	"ai_thoughts/20260721-corpus-integrity-talmud-tanach-chassidus-rag/meluket-post-verification.json"
);

const monthNames = [
	["תשרי", "תשרי"],
	["חשון", "חשון"],
	["כסלו", "כסלו"],
	["טבת", "טבת"],
	["שבט", "שבט"],
	["אדר", "אדר"],
	["ניסן", "ניסן"],
	["אייר", "אייר"],
	["סיון", "סיון"],
	["תמוז", "תמוז"],
	["מנחם אב", "מנחם-אב"],
	["אלול", "אלול"]
];

const months = monthNames.map(([month, historicalLabel]) => ({
	month,
	friendlySeriesId: `${month}_meluket`,
	historicalSeriesId: `BH-seferHamaamarimMeluket-${historicalLabel}`
}));

module.exports = {
	archiveRoot,
	bundleRoot,
	evidenceRoot,
	liveDatabaseRoot,
	months,
	repositoryRoot,
	verificationFile
};
