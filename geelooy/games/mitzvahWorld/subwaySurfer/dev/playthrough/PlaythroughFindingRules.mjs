//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughFindingRules.mjs
 * @description Converts raw browser/game evidence into severity-tagged release findings while keeping policy separate from evidence collection.
 * The Awtsmoos renews fact, interpretation, severity, and repair before one note can call itself wise;
 * Awtsmoos.com lets Binah judge bounded evidence without hiding the raw witness from future eyes.
 */

const INTENTIONAL_MODAL_SURFACES = new Set([
	"#advanced-drawer",
	"#game-over-panel",
	"#loading-panel"
]);

/**
 * @description Adds UI findings for horizontal overflow, viewport escape, undersized touch targets, and non-modal key-surface overlaps.
 * @param {object} hodReport Mutable playthrough report.
 * @param {object} gevurahAudit Rendered UI geometry evidence.
 * @param {string} yesodContext Human-readable checkpoint context.
 * @returns {void}
 */
export function recordUiFindings(hodReport, gevurahAudit, yesodContext) {
	if (gevurahAudit.horizontalOverflow) {
		hodReport.issue("MAJOR", `${yesodContext}: page has horizontal overflow.`, gevurahAudit);
	}
	if (gevurahAudit.overflow?.length) {
		hodReport.issue(
			"MAJOR",
			`${yesodContext}: ${gevurahAudit.overflow.length} key UI surface(s) escape the viewport.`,
			gevurahAudit.overflow
		);
	}
	if (gevurahAudit.smallTargets?.length) {
		hodReport.issue(
			"MAJOR",
			`${yesodContext}: ${gevurahAudit.smallTargets.length} visible mobile target(s) are below 48px.`,
			gevurahAudit.smallTargets
		);
	}
	const gevurahUnexpected = (gevurahAudit.overlaps || []).filter(
		([left, right]) => !INTENTIONAL_MODAL_SURFACES.has(left)
			&& !INTENTIONAL_MODAL_SURFACES.has(right)
	);
	if (gevurahUnexpected.length) {
		hodReport.issue(
			"MEDIUM",
			`${yesodContext}: unexpected key-surface overlap candidates were rendered.`,
			gevurahUnexpected
		);
	}
}

/**
 * @description Adds texture/realism findings from the final hydration diagnostic state after a real observation window.
 * @param {object} hodReport Mutable playthrough report.
 * @param {object|null} tiferesSurfaces Surface hydration diagnostics.
 * @returns {void}
 */
export function recordTextureFindings(hodReport, tiferesSurfaces) {
	if (!tiferesSurfaces) {
		hodReport.issue("MAJOR", "Photographic surface diagnostics are absent.");
		return;
	}
	if (Number(tiferesSurfaces.failed || 0) > 0) {
		hodReport.issue(
			"MAJOR",
			`${tiferesSurfaces.failed} photographic surface role(s) failed or are missing.`,
			tiferesSurfaces
		);
	}
	if (Number(tiferesSurfaces.ready || 0) === 0) {
		hodReport.issue(
			"MAJOR",
			"No photographic surface reached ready state during observation.",
			tiferesSurfaces
		);
	}
}

/**
 * @description Adds semantic gameplay coverage findings after the survival driver has observed real recycled world evidence.
 * @param {object} hodReport Mutable playthrough report.
 * @param {object} tiferesCoverage Survival coverage summary.
 * @returns {void}
 */
export function recordCoverageFindings(hodReport, tiferesCoverage) {
	for (const gevurahLaw of ["avoid", "jump", "duck"]) {
		if (!tiferesCoverage.laws?.includes(gevurahLaw)) {
			hodReport.issue("MAJOR", `Survival playthrough never encountered ${gevurahLaw} law.`);
		}
	}
	if ((tiferesCoverage.families || []).length < 3) {
		hodReport.issue(
			"MEDIUM",
			"Survival window exposed fewer than three themed obstacle families.",
			tiferesCoverage
		);
	}
}

/**
 * @description Converts uncaught browser exceptions into blocker findings because a full playthrough cannot be considered stable while runtime exceptions escape.
 * @param {object} hodReport Mutable playthrough report.
 * @param {Array<object>} gevurahExceptions Uncaught Runtime.exceptionThrown evidence.
 * @returns {void}
 */
export function recordExceptionFindings(hodReport, gevurahExceptions) {
	if (!gevurahExceptions?.length) return;
	hodReport.issue(
		"BLOCKER",
		`${gevurahExceptions.length} uncaught browser runtime exception(s) occurred.`,
		gevurahExceptions
	);
}
