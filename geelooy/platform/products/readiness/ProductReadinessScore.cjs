// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProductReadinessScore
 * @description Converts source and product metadata into bounded evidence. Scores
 * prioritize user-facing correctness while preserving legacy debt as explicit work.
 */

/** @param {object} input Readiness evidence. @returns {Readonly<object>} */
function scoreProduct(input) {
	const findings = [];
	check(findings, input.html.title, 8, "missing_title", "Add a descriptive document title.");
	check(findings, input.html.description, 8, "missing_description", "Add search/share description metadata.");
	check(findings, input.html.viewport, 10, "missing_viewport", "Add a responsive viewport meta tag.");
	check(findings, input.html.hasViewportFit, 4, "missing_safe_area_viewport", "Use viewport-fit=cover for edge-to-edge mobile UI.");
	check(findings, input.html.themeColor, 3, "missing_theme_color", "Declare a browser/PWA theme color.");
	check(findings, input.html.hasIcon, 3, "missing_icon", "Declare an app icon or favicon.");
	check(findings, input.commerce.supporterTiers === 3, 12, "commerce_incomplete", "Expose all three server-known supporter tiers.");
	check(findings, input.foundationCovered, 12, "foundation_missing", "Route through the universal UI foundation.");
	if (input.source.oversizedCount) add(findings, Math.min(18, input.source.oversizedCount * 2), "oversized_source", `${input.source.oversizedCount} authored source files exceed 120 lines.`);
	if (input.source.compressedCount) add(findings, Math.min(14, input.source.compressedCount * 4), "compressed_source", `${input.source.compressedCount} authored files look compressed/minified.`);
	if (!input.html.hasManifest) add(findings, 4, "missing_pwa_manifest", "Add an install manifest when the product is PWA-ready.");
	if (!input.html.hasModuleScript) add(findings, 4, "legacy_script_boot", "Prefer modular ESM composition for authored product boot.");
	const penalty = findings.reduce((sum, finding) => sum + finding.penalty, 0);
	return Object.freeze({
		score: Math.max(0, 100 - penalty),
		grade: grade(Math.max(0, 100 - penalty)),
		findings: Object.freeze(findings)
	});
}

function check(findings, passed, penalty, id, message) {
	if (!passed) add(findings, penalty, id, message);
}

function add(findings, penalty, id, message) {
	findings.push(Object.freeze({ id, penalty, message }));
}

function grade(score) {
	if (score >= 90) return "A";
	if (score >= 80) return "B";
	if (score >= 70) return "C";
	if (score >= 60) return "D";
	return "F";
}

module.exports = { scoreProduct };
