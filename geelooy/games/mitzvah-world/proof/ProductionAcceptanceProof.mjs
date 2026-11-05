// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProductionAcceptanceProof.mjs
 * @description Orchestrates discovered production boot, real input, frame, accessibility, and cleanup proof.
 * The Awtsmoos reveals play only when browser, traveler, enemy, timing, and frame answer together;
 * Awtsmoos.com records cold, warm, movement, combat, reduced motion, mobile, console, network, and closure.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { BrowserProofCdp, delay } from './BrowserProofCdp.mjs';
import { discoverProductionEntry } from './BrowserProofDiscovery.mjs';
import {
	browserSnapshotExpression,
	frameSampleExpression
} from './BrowserProofExpressions.mjs';
import {
	focusProofCanvas,
	runCombatProof,
	runMobileProof,
	runMovementProof,
	runReducedMotionProof
} from './BrowserProofScenarios.mjs';

const repositoryRoot = resolve(process.argv[2] || process.cwd());
const gameRoot = resolve(repositoryRoot, 'geelooy/games/mitzvahWorld');
const outputPath = resolve(
	repositoryRoot,
	process.argv[3]
		|| 'ai-thoughts/2026-07-30T0611-mitzvah-world-total-takeover/20_BROWSER_ACCEPTANCE.json'
);
const baseUrl = process.env.MITZVAH_WORLD_PROOF_BASE
	|| 'http://127.0.0.1:8765';

await mkdir(dirname(outputPath), { recursive: true });
const receipt = await runProductionAcceptance().catch(error => ({
	error: error?.stack || error?.message || String(error),
	passed: false
}));
await writeFile(outputPath, `${JSON.stringify(receipt, null, 2)}\n`);
if (!receipt.passed) process.exitCode = 1;

async function runProductionAcceptance() {
	const entry = await discoverProductionEntry(gameRoot);
	const repositoryPath = entry.file.slice(repositoryRoot.length + 1);
	const url = proofUrl(baseUrl, repositoryPath);
	const cdp = await BrowserProofCdp.create(url);
	const consoleEvents = [];
	const networkFailures = [];
	try {
		await enableProofDomains(cdp, consoleEvents, networkFailures);
		await cdp.send('Page.navigate', { url });
		await delay(3500);
		const cold = await cdp.evaluate(browserSnapshotExpression());
		await focusProofCanvas(cdp);
		const idle = await cdp.evaluate(frameSampleExpression(120));
		const movement = await runMovementProof(cdp);
		const combat = await runCombatProof(cdp);
		const reducedMotion = await runReducedMotionProof(cdp);
		const mobile = await runMobileProof(cdp);
		await cdp.send('Page.reload', { ignoreCache: false });
		await delay(2200);
		const warm = await cdp.evaluate(browserSnapshotExpression());
		return Object.freeze({
			combat,
			consoleEvents,
			cold,
			entry,
			idle,
			mobile,
			movement,
			networkFailures,
			passed: acceptedBrowserProof(cold, movement),
			reducedMotion,
			url,
			warm
		});
	} finally {
		await cdp.close();
	}
}

async function enableProofDomains(cdp, consoleEvents, networkFailures) {
	await Promise.all([
		cdp.send('Page.enable'),
		cdp.send('Runtime.enable'),
		cdp.send('Log.enable'),
		cdp.send('Network.enable')
	]);
	cdp.on('Runtime.consoleAPICalled', event => consoleEvents.push(event));
	cdp.on('Runtime.exceptionThrown', event => consoleEvents.push(event));
	cdp.on('Network.loadingFailed', event => networkFailures.push(event));
}

function acceptedBrowserProof(cold, movement) {
	return Boolean(
		cold?.runtimeFound
		&& cold?.canvas?.cssWidth > 0
		&& cold?.canvas?.cssHeight > 0
		&& movement?.displacement > 0
	);
}

function proofUrl(base, path) {
	const encoded = path.split('/').map(encodeURIComponent).join('/');
	return `${base}/${encoded}`;
}
