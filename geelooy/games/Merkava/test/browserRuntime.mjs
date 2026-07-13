//B"H
// Boruch Hashem
// Blessed is He
/**
 * The browser proves campaign, Endless renewal, persistence, WebGL, and clean runtime.
 * The Awtsmoos is beyond evidence while Awtsmoos.com reveals living testimony.
 */
import assert from 'node:assert/strict';
import { BrowserBossDriver } from './BrowserBossDriver.mjs';
import { BrowserCampaignDriver } from './BrowserCampaignDriver.mjs';
import { BrowserEndlessDriver } from './BrowserEndlessDriver.mjs';
import { BrowserFlowDriver } from './BrowserFlowDriver.mjs';
import { BrowserHazardDriver } from './BrowserHazardDriver.mjs';
import { BrowserMenuDriver } from './BrowserMenuDriver.mjs';
import {
	createBrowserTarget,
	createEvidenceLedger,
	enableRuntimeDomains,
	registerRuntimeEvidence,
	writeRuntimeArtifacts
} from './BrowserRuntimeEvidence.mjs';
import { CdpClient } from './CdpClient.mjs';

const browserOrigin = 'http://127.0.0.1:9222';
const gameUrl = 'http://127.0.0.1:5180/geelooy/games/merkava/?verify=endless';
const artifactRoot = 'ai_thoughts/20260713_1030_complete_revelation';
const target = await createBrowserTarget(browserOrigin);
const client = new CdpClient(target.webSocketDebuggerUrl);
const evidence = createEvidenceLedger();

try {
	await client.connect();
	registerRuntimeEvidence(client, evidence);
	await enableRuntimeDomains(client);
	await client.command('Network.setCacheDisabled', { cacheDisabled: true });
	await client.command('Page.navigate', { url: gameUrl });
	const report = await verifyRuntime(client);
	const completeReport = { ...report, ...evidence };
	await writeRuntimeArtifacts(client, artifactRoot, completeReport);
	assertCleanEvidence(evidence, report.final);
	console.log(JSON.stringify(completeReport, null, 2));
} finally {
	client.close();
	await fetch(`${browserOrigin}/json/close/${target.id}`).catch(() => undefined);
}

async function verifyRuntime(cdpClient) {
	const basic = new BrowserFlowDriver(cdpClient);
	const campaign = new BrowserCampaignDriver(cdpClient);
	const boss = new BrowserBossDriver(cdpClient, campaign);
	const hazard = new BrowserHazardDriver(cdpClient);
	const menu = new BrowserMenuDriver(cdpClient);
	const report = {
		boot: await basic.verifyBoot(),
		endless: await new BrowserEndlessDriver(cdpClient).verify(),
		started: await basic.startRun()
	};
	await basic.verifyControls();
	report.levelTwo = await campaign.completeBlessingLevel();
	report.levelThree = await campaign.completeCheckpoint();
	report.worldTwo = await boss.verifyAndAdvance();
	report.hazard = await hazard.verifyWorldHazard();
	report.menu = await menu.verifyReloadedMenu();
	report.records = await menu.verifyRecords();
	report.continued = await menu.continueCampaign();
	report.final = await basic.details();
	return report;
}

function assertCleanEvidence(runtimeEvidence, finalState) {
	assert.deepEqual(runtimeEvidence.exceptions, []);
	assert.deepEqual(runtimeEvidence.errorLogs, []);
	assert.deepEqual(runtimeEvidence.failedRequests, []);
	assert.deepEqual(runtimeEvidence.httpErrors, []);
	assert.deepEqual(finalState.runtimeErrors, []);
}
