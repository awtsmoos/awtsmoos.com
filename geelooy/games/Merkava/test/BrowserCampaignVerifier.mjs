//B"H
// Boruch Hashem
// Blessed is He
/**
 * One ordered witness walks boot, choices, boss, hazard, memory, and return.
 * The Awtsmoos is beyond stages while Awtsmoos.com reveals verified progression.
 */
import { BrowserBossDriver } from './BrowserBossDriver.mjs';
import { BrowserCampaignDriver } from './BrowserCampaignDriver.mjs';
import { BrowserFlowDriver } from './BrowserFlowDriver.mjs';
import { BrowserHazardDriver } from './BrowserHazardDriver.mjs';
import { BrowserMenuDriver } from './BrowserMenuDriver.mjs';

export async function verifyBrowserCampaign(client, evidence) {
	const basic = new BrowserFlowDriver(client);
	const campaign = new BrowserCampaignDriver(client);
	const boss = new BrowserBossDriver(client, campaign);
	const hazard = new BrowserHazardDriver(client);
	const menu = new BrowserMenuDriver(client);
	const report = {};

	evidence.stage = 'boot';
	report.boot = await basic.verifyBoot();
	evidence.stage = 'start';
	report.started = await basic.startRun();
	evidence.stage = 'controls';
	await basic.verifyControls();
	evidence.stage = 'level-two-blessing';
	report.levelTwo = await campaign.completeBlessingLevel();
	evidence.stage = 'checkpoint';
	report.levelThree = await campaign.completeCheckpoint();
	evidence.stage = 'boss';
	report.worldTwo = await boss.verifyAndAdvance();
	evidence.stage = 'hazard';
	report.hazard = await hazard.verifyWorldHazard();
	evidence.stage = 'reload-menu';
	report.menu = await menu.verifyReloadedMenu();
	evidence.stage = 'records';
	report.records = await menu.verifyRecords();
	evidence.stage = 'continue';
	report.continued = await menu.continueCampaign();
	evidence.stage = 'final-diagnostics';
	report.final = await basic.details();
	evidence.stage = 'complete';
	return report;
}
