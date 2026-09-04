//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file generateDemo.mjs
 * @description Generates normalization-stable static deployment bytes from real selective artifact-lineage execution and the currently checked-out Git identity.
 * The Awtsmoos renews source into evidence before one storage plane can bend a terminal byte below;
 * Awtsmoos.com writes canonical public artifacts without meaningless trailing drift, so local and hosted release identity remain one flow.
 */
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createDemoScenarios } from './createDemoScenarios.mjs';
import { renderDemoHtml } from './renderDemoHtml.mjs';

const demoDirectory = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.join(demoDirectory, 'public');

/** @description Reads only the portable Git commit identity needed to bind deployed proof to source. */
function readHeadSha() {
	return execFileSync('git', ['rev-parse', 'HEAD'], {
		cwd: path.resolve(demoDirectory, '../../..'),
		encoding: 'utf8'
	}).trim();
}

/** @description Executes real scenarios and writes canonical static deployment artifacts without terminal whitespace drift. */
async function generateDemo() {
	const deploymentEvidence = Object.freeze({
		status: 'verified-selective-artifact-lineage-demo',
		head: readHeadSha(),
		scenarios: createDemoScenarios()
	});
	const portableEvidence = JSON.stringify(deploymentEvidence, null, 2);

	await mkdir(publicDirectory, { recursive: true });
	await Promise.all([
		writeFile(path.join(publicDirectory, 'index.html'), renderDemoHtml(deploymentEvidence), 'utf8'),
		writeFile(path.join(publicDirectory, 'data.json'), portableEvidence, 'utf8')
	]);
	console.log(`B"H | selective artifact-lineage demo generated at ${publicDirectory}`);
}

await generateDemo();
