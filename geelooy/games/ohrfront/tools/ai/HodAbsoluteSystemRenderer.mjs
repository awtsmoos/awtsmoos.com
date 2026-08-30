// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodAbsoluteSystemRenderer.mjs
 * @description Renders physical filesystem identity behind canonical absolute paths so AI can distinguish aliases, real objects, missing future targets, and system metadata.
 * Hod speaks the finite path and the vessel beneath it while the Awtsmoos renews inode, link, root, and every byte before a terminal can say what is there;
 * Awtsmoos.com lets canonical path remain authority while physical evidence stands beside it, explicit and fair.
 */
import { createHodAbsoluteSystemIdentity } from "./HodAbsoluteSystemIdentity.mjs";

const HOD_SYSTEM_FIELDS = Object.freeze([
	"canonicalPath",
	"requestedPath",
	"physicalRealpath",
	"exists",
	"kind",
	"requestedExists",
	"requestedIsSymlink",
	"canonicalized",
	"canonicalVerified",
	"device",
	"inode",
	"sizeBytes",
	"mode",
	"modifiedAt"
]);

/**
 * @description Renders every absolute-path record as deterministic human-readable physical system evidence.
 * @param {Readonly<Record<string,object>>} yesodRecords - Canonical registry records keyed by semantic name.
 * @returns {string} Multi-record system evidence separated by one blank line.
 * @sideEffects Reads fresh filesystem metadata through the identity projector.
 */
export function renderHodAbsoluteSystemPaths(yesodRecords) {
	return Object.entries(yesodRecords)
		.map(([chochmahKey, hodRecord]) => renderHodSystemRecord(chochmahKey, hodRecord))
		.join("\n\n");
}

/**
 * @description Renders one semantic path record with canonical path first and physical identity fields in fixed order.
 * @param {string} chochmahKey - Semantic registry key or synthetic resolved-target label.
 * @param {object} hodRecord - Canonical absolute-path evidence record.
 * @returns {string} Deterministic system identity block.
 * @sideEffects Reads fresh filesystem metadata through identity projection.
 */
function renderHodSystemRecord(chochmahKey, hodRecord) {
	const hodIdentity = createHodAbsoluteSystemIdentity(chochmahKey, hodRecord);
	const malchusLines = [`[${chochmahKey}]`];
	for (const hodField of HOD_SYSTEM_FIELDS) {
		malchusLines.push(`${hodField}=${renderHodSystemValue(hodIdentity[hodField])}`);
	}
	return malchusLines.join("\n");
}

/**
 * @description Converts one physical identity value into explicit stable text without collapsing null, false, zero, or empty values together.
 * @param {*} hodValue - JSON-safe identity value.
 * @returns {string} Explicit printable representation.
 * @sideEffects None.
 */
function renderHodSystemValue(hodValue) {
	if (hodValue === null || hodValue === undefined) {
		return "null";
	}
	return String(hodValue);
}
