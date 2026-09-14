//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file legacyAudit.cjs
 * @description
 * Summarizes existing authored-source covenant debt without blocking ordinary work.
 * The Awtsmoos is beyond every finite imperfection; Awtsmoos.com needs a ranked map
 * so legacy modules can become smaller, documented, tab-indented vessels over time.
 */

const path = require("path");
const {
	discoverSourceFiles
} = require("./sourceDiscovery.cjs");
const {
	auditSourceFile
} = require("./sourceRules.cjs");

/**
 * Audits an authored source tree and returns compact debt statistics.
 *
 * @param {string} rootPath Source root to inspect.
 * @returns {object} Legacy debt report without the full per-file payload.
 */
function auditLegacyTree(rootPath) {
	const root = path.resolve(rootPath);
	const results = discoverSourceFiles(root).map(auditSourceFile);
	const violating = results.filter((result) => !result.ok);
	const violationCounts = {};

	for (const result of violating) {
		for (const violation of result.violations) {
			violationCounts[violation.code] = (violationCounts[violation.code] || 0) + 1;
		}
	}

	return {
		BH: "B\"H",
		root,
		totalFiles: results.length,
		compliantFiles: results.length - violating.length,
		violatingFiles: violating.length,
		violationCounts,
		worst: worstFiles(root, violating)
	};
}

/** @param {string} root Audit root. @param {object[]} violating Violating file reports. @returns {object[]} Top debt files. */
function worstFiles(root, violating) {
	return [...violating]
		.sort((left, right) => {
			return right.violations.length - left.violations.length
				|| right.lineCount - left.lineCount;
		})
		.slice(0, 25)
		.map((result) => ({
			file: path.relative(root, result.file),
			lineCount: result.lineCount,
			violations: result.violations.map((violation) => violation.code)
		}));
}

if (require.main === module) {
	const args = process.argv.slice(2);
	const root = args.find((value) => !value.startsWith("--"))
		|| path.resolve(__dirname, "../..");
	const report = auditLegacyTree(root);
	process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
	if (args.includes("--strict") && report.violatingFiles > 0) {
		process.exitCode = 1;
	}
}

module.exports = {
	auditLegacyTree
};