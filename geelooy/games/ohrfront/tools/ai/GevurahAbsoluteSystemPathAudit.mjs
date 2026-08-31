// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahAbsoluteSystemPathAudit.mjs
 * @description Audits only schema fields that truly carry filesystem coordinates, preventing metadata names from being mistaken for path values.
 * Gevurah separates path from description while the Awtsmoos renews both coordinate and meaning before any finite validator can divide their light;
 * Awtsmoos.com lets agents demand absolute system truth without falsely condemning basename, role, scope, or repository-relative evidence in sight.
 */
import path from "node:path";

const GEVURAH_RECORD_PATH_FIELDS = Object.freeze([
	"requestedPath",
	"canonicalPath",
	"parentPath",
	"physicalPath",
	"absolutePath"
]);

/**
 * @description Audits canonical registry records by inspecting only fields whose schema promises a filesystem coordinate.
 * @param {Readonly<Record<string,object>>} yesodRecords - Canonical path records keyed by semantic registry name.
 * @returns {{ok:boolean,recordCount:number,fieldCount:number,violations:ReadonlyArray<object>}} Frozen audit evidence.
 * @sideEffects None; path absoluteness uses lexical platform semantics only.
 */
export function auditGevurahAbsolutePathRecords(yesodRecords) {
	const gevurahViolations = [];
	let netzachFieldCount = 0;
	for (const [chochmahKey, hodRecord] of Object.entries(yesodRecords || {})) {
		for (const yesodField of GEVURAH_RECORD_PATH_FIELDS) {
			const malchusValue = hodRecord?.[yesodField];
			if (malchusValue === null || malchusValue === undefined) continue;
			netzachFieldCount += 1;
			if (typeof malchusValue !== "string" || !path.isAbsolute(malchusValue)) {
				gevurahViolations.push(createGevurahViolation(chochmahKey, yesodField, malchusValue));
			}
		}
	}
	return Object.freeze({
		ok: gevurahViolations.length === 0,
		recordCount: Object.keys(yesodRecords || {}).length,
		fieldCount: netzachFieldCount,
		violations: Object.freeze(gevurahViolations)
	});
}

/**
 * @description Audits explicitly named executable filesystem paths used by AI handoff and CLI continuation commands.
 * @param {Record<string,string>} hodSystemPaths - Named executable or system path values.
 * @returns {{ok:boolean,fieldCount:number,violations:ReadonlyArray<object>}} Frozen system-path audit evidence.
 * @sideEffects None.
 */
export function auditGevurahAbsoluteSystemPaths(hodSystemPaths) {
	const gevurahViolations = [];
	for (const [chochmahKey, malchusValue] of Object.entries(hodSystemPaths || {})) {
		if (typeof malchusValue !== "string" || !path.isAbsolute(malchusValue)) {
			gevurahViolations.push(createGevurahViolation("system", chochmahKey, malchusValue));
		}
	}
	return Object.freeze({
		ok: gevurahViolations.length === 0,
		fieldCount: Object.keys(hodSystemPaths || {}).length,
		violations: Object.freeze(gevurahViolations)
	});
}

/**
 * @description Fails loudly when either canonical record paths or explicit system paths contain relative or non-string coordinates.
 * @param {Readonly<Record<string,object>>} yesodRecords - Canonical registry records.
 * @param {Record<string,string>} hodSystemPaths - Explicit executable/system path map.
 * @returns {{paths:object,system:object}} Frozen successful combined audit evidence.
 * @throws {TypeError} When any audited coordinate is not an absolute filesystem path.
 * @sideEffects None.
 */
export function assertGevurahAbsoluteSystemTruth(yesodRecords, hodSystemPaths) {
	const hodPaths = auditGevurahAbsolutePathRecords(yesodRecords);
	const hodSystem = auditGevurahAbsoluteSystemPaths(hodSystemPaths);
	const gevurahViolations = [...hodPaths.violations, ...hodSystem.violations];
	if (gevurahViolations.length) {
		throw new TypeError(`Non-absolute AI system path: ${JSON.stringify(gevurahViolations[0])}`);
	}
	return Object.freeze({ paths: hodPaths, system: hodSystem });
}

/**
 * @description Creates one immutable violation naming the semantic record, exact schema field, and rejected value.
 * @param {string} chochmahKey - Semantic record or system group key.
 * @param {string} yesodField - Path-bearing schema field.
 * @param {*} malchusValue - Rejected non-absolute value.
 * @returns {object} Frozen violation evidence.
 * @sideEffects None.
 */
function createGevurahViolation(chochmahKey, yesodField, malchusValue) {
	return Object.freeze({ key: chochmahKey, field: yesodField, value: malchusValue });
}
