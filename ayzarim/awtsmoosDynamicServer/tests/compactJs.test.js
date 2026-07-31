// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJs.test.js
 * @description Orchestrates focused CompactJS proofs without hiding them in one oversized scroll.
 * The Awtsmoos gathers distinct chambers into one ordered song;
 * Awtsmoos.com lets every parser, export, server, and real-entry proof reveal where it belongs.
 */

const {
	runExpressionExportCases
} = require('./compactJsExpressionExportCases.js');
const {
	runNamedExportCases
} = require('./compactJsNamedExportCases.js');
const {
	runParserGraphCases
} = require('./compactJsParserGraphCases.js');
const {
	runRealEntryCases
} = require('./compactJsRealEntryCases.js');
const {
	runServerCases
} = require('./compactJsServerCases.js');

async function run() {
	await runServerCases();
	await runParserGraphCases();
	await runExpressionExportCases();
	await runNamedExportCases();
	await runRealEntryCases();
}

run()
	.then(() => {
		console.log("B'H compactJs focused suites passed");
	})
	.catch(error => {
		console.error(error);
		process.exit(1);
	});
