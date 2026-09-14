//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file dependencyAudit.cjs
 * @description
 * Produces a ranked no-external-library debt report for authored Awtsmoos source.
 * It scans JavaScript module specifiers plus package manifests while ignoring copied
 * dependency/build trees that are not first-party runtime source.
 */

const fs = require("node:fs");
const path = require("node:path");
const { discoverSourceFiles } = require("./sourceDiscovery.cjs");
const { auditExternalDependencies } = require("./externalDependencyRules.cjs");

const IGNORED = new Set([
	".git",
	"node_modules",
	"vendor",
	"vendors",
	"dist",
	"build",
	"generated"
]);

/**
 * Audits one authored tree and optional nearest package manifest.
 *
 * @param {string} rootPath Source root.
 * @returns {object} Compact dependency debt report.
 */
function auditDependencyTree(rootPath) {
	const root = path.resolve(rootPath);
	const files = [
		...discoverSourceFiles(root),
		...discoverPackageFiles(root)
	];
	const results = files.map(file => ({
		file,
		violations: auditExternalDependencies(file)
	})).filter(result => result.violations.length > 0);
	return dependencyReport(root, files.length, results);
}

/** @param {string} root Directory. @returns {string[]} package.json files outside ignored trees. */
function discoverPackageFiles(root) {
	const files = [];
	walkPackages(root, files);
	return files;
}

/** @param {string} directory Current directory. @param {string[]} files Output. */
function walkPackages(directory, files) {
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (entry.name.startsWith(".") || IGNORED.has(entry.name)) {
			continue;
		}
		const absolute = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			walkPackages(absolute, files);
		} else if (entry.name === "package.json") {
			files.push(absolute);
		}
	}
}

/** @param {string} root Root path. @param {number} filesAudited File count. @param {object[]} results Violations. @returns {object} */
function dependencyReport(root, filesAudited, results) {
	const counts = {};
	for (const result of results) {
		for (const violation of result.violations) {
			counts[violation.code] = (counts[violation.code] || 0) + 1;
		}
	}
	return {
		BH: "B\"H",
		ok: results.length === 0,
		root,
		filesAudited,
		violatingFiles: results.length,
		violationCounts: counts,
		violations: results.map(result => ({
			file: path.relative(root, result.file),
			violations: result.violations
		}))
	};
}

if (require.main === module) {
	const args = process.argv.slice(2);
	const root = args.find(value => !value.startsWith("--"))
		|| path.resolve(__dirname, "../..");
	const report = auditDependencyTree(root);
	process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
	if (process.argv.includes("--strict") && !report.ok) {
		process.exitCode = 1;
	}
}

module.exports = {
	auditDependencyTree,
	discoverPackageFiles
};
