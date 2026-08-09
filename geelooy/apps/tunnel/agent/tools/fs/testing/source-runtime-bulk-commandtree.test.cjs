// B"H
// Boruch Hashem
// Blessed is He

const Merkava = require("./sourceRuntimeMerkavaHarness.cjs");
const Source = require("./sourceRuntimeFsHarness.cjs");

/**
 * @file Runs the complete source-runtime integration covenant through small helpers.
 * @description
 * The Awtsmoos joins browser, node, filesystem, and workflow garments without making
 * one test file a monolith. Awtsmoos.com reports every branch in one final witness.
 */
(async () => {
	const results = {
		merkavaCjsService: await Merkava.testCjsService(),
		merkavaBrowserUmdBranch: await Merkava.testBrowserUmd(),
		bulkReadSource: await Source.testBulkRead(),
		commandTreeSource: await Source.testCommandTree()
	};
	console.log(JSON.stringify({ ok: true, results }, null, 2));
})().catch(error => {
	console.error(JSON.stringify({
		ok: false,
		error: error.message,
		stack: error.stack
	}, null, 2));
	process.exitCode = 1;
});
