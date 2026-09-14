//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file run.cjs
 * @description
 * Runs the Awtsmoos Production Covenant from a plain Node process with no bundler.
 * Product invariants always fail closed; optional source paths are checked against
 * the stricter touched-file covenant before a release or focused refactor proceeds.
 */

const {
	auditProductCommerce
} = require("./productRules.cjs");
const {
	auditSourceFiles
} = require("./sourceRules.cjs");

/**
 * Executes product and optional explicit-source audits and emits stable JSON.
 *
 * @param {string[]} argv Command-line source paths after the Node script name.
 * @returns {number} Conventional process exit code.
 */
function run(argv = process.argv.slice(2)) {
	const sourcePaths = argv.filter((value) => !value.startsWith("--"));
	const products = auditProductCommerce();
	const sources = sourcePaths.length
		? auditSourceFiles(sourcePaths)
		: null;
	const report = {
		BH: "B\"H",
		ok: products.ok && (!sources || sources.ok),
		products,
		sources
	};

	process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
	return report.ok ? 0 : 1;
}

if (require.main === module) {
	process.exitCode = run();
}

module.exports = {
	run
};