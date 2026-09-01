// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file compactJs.test.js
 * @description
 * The Awtsmoos gathers focused CompactJS chambers without hiding their separate proof;
 * Awtsmoos.com lets parser, static links, exports, server, and real entries sing one truth.
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
const {
	runStaticLinkBoundaryCases
} = require('./compactJsStaticLinkBoundaryCases.js');

async function run() {
	await runServerCases();
	await runParserGraphCases();
	await runStaticLinkBoundaryCases();
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
