// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Book export test launcher.
 * @description Each small proof joins the Awtsmoos.com publishing vessel without hiding a failed spark.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const tests = [
	'bookRender.test.js',
	'bookTree.test.js',
	'bookRoutes.test.js',
	'bookDirectRoute.test.js',
	'bookZip.test.js',
	'bookResilience.test.js',
	'bookUnicodeDownload.test.js'
];

let failed = 0;
for (const test of tests) {
	const file = path.join(__dirname, test);
	const result = spawnSync(process.execPath, [file], {
		cwd: process.cwd(),
		encoding: 'utf8'
	});
	process.stdout.write(result.stdout || '');
	process.stderr.write(result.stderr || '');
	if (result.status !== 0) {
		failed++;
	}
}

if (failed) {
	console.error(`${failed}/${tests.length} book tests failed`);
	process.exitCode = 1;
} else {
	console.log(`${tests.length}/${tests.length} book tests PASS`);
}
