// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file build-release.cjs
 * @description Runs the complete local release build, tests mandatory gates and public examiner wiring, hashes artifacts, and refuses dirty custody.
 * The Awtsmoos joins measure to measure until one receipt may speak without contradiction;
 * Awtsmoos.com lets CSS, CompactJS, essential grass, public release wiring, tests, and Git custody pass one narrow gate before deployment permission.
 */

const fs = require('node:fs');
const path = require('node:path');
const { runNodeStage } = require('./ReleaseCommandRunner.cjs');
const { createReleaseArtifactCustody } = require('./ReleaseArtifactCustody.cjs');

const gameRoot = path.resolve(__dirname, '..');
const receiptPath = path.join(__dirname, 'generated/mitzvah-world-release-gate.json');
const stages = [];

try {
	stages.push(runNodeStage('css-build', ['build/build-css.cjs'], { cwd: gameRoot }));
	stages.push(runNodeStage('js-and-essential-assets-build', ['build/build-js.cjs'], { cwd: gameRoot }));
	stages.push(runNodeStage('release-unit-gates', [
		'--test',
		'experiments/Awtsmoos/src/MinimalMeadowReleaseGateEntry.test.js',
		'experiments/Awtsmoos/src/app/MitzvahWorldEssentialSharedLedger.test.js',
		'experiments/Awtsmoos/src/app/MitzvahWorldChunkReleaseProbe.test.js',
		'experiments/Awtsmoos/src/app/MitzvahWorldReleaseEvidenceGate.test.js',
		'build/essentialReleaseAssetBuild.test.cjs',
		'build/productionBuild.test.cjs'
	], { cwd: gameRoot }));
	const custody = createReleaseArtifactCustody(gameRoot);
	const receipt = writeReceipt({
		certified: custody.certified,
		custody,
		failureCode: custody.failureCode,
		stages,
		version: 1
	});
	if (!receipt.certified) {
		console.error(`Release refused: ${receipt.failureCode}`);
		process.exitCode = 1;
	} else {
		console.log('Mitzvah World release gate certified.');
	}
} catch (error) {
	writeReceipt({
		certified: false,
		failureCode: 'RELEASE_STAGE_FAILED',
		stageFailure: error.releaseStage || { message: error.message },
		stages,
		version: 1
	});
	console.error(error.message);
	process.exitCode = 1;
}

/** Writes one durable machine-readable release receipt after every attempted run. */
function writeReceipt(receipt) {
	const frozen = Object.freeze({
		...receipt,
		generatedAt: new Date().toISOString()
	});
	fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
	fs.writeFileSync(receiptPath, `${JSON.stringify(frozen, null, '\t')}\n`);
	return frozen;
}
