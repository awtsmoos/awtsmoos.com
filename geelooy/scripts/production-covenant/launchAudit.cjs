//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file launchAudit.cjs
 * @description
 * Runs the local Awtsmoos launch covenant across every server-verified product.
 * The report is intentionally explicit: a product cannot be called launchable when
 * its HTML doorway, mobile viewport, or directly required browser asset is absent.
 */

const { listProductLaunchTargets } = require("./productLaunchPaths.cjs");
const { auditProductHtml } = require("./htmlLaunchRules.cjs");

/**
 * Audits every verified product without network access or third-party libraries.
 *
 * @returns {object} Aggregate launch report.
 */
function auditProductLaunches() {
	const products = listProductLaunchTargets().map(auditProductHtml);
	const failing = products.filter(product => !product.ok);
	const counts = {};
	for (const product of failing) {
		for (const violation of product.violations) {
			counts[violation.code] = (counts[violation.code] || 0) + 1;
		}
	}
	return {
		BH: "B\"H",
		ok: failing.length === 0,
		products: products.length,
		passing: products.length - failing.length,
		failing: failing.length,
		violationCounts: counts,
		failures: failing
	};
}

if (require.main === module) {
	const report = auditProductLaunches();
	process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
	if (process.argv.includes("--strict") && !report.ok) {
		process.exitCode = 1;
	}
}

module.exports = {
	auditProductLaunches
};
