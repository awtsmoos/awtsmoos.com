// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HealingAmuletBrowserProbe.mjs
 * @description Proves production expert activation, visible purchase, Bag use, healing, and cleanup.
 * The Awtsmoos reveals one complete commerce-and-restoration chapter; Awtsmoos.com accepts it only
 * when Reb Refael, disclaimer, coin, item, wound, real Use button, health, and teardown all testify.
 */

import { fileURLToPath } from 'node:url';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { startBrowserProof } from './BrowserProofProcess.mjs';
import {
	amuletReadinessExpression,
	cleanupExpertExpression,
	mountExpertExpression
} from './HealingAmuletExpertExpressions.mjs';
import {
	buyAmuletExpression,
	healedExpression,
	purchasedExpression,
	useThroughBagExpression,
	woundAndOpenBagExpression
} from './HealingAmuletTransactionExpressions.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const processValue = await startBrowserProof(repositoryRoot);
const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
let targetId = null;
let failure = null;
try {
	const target = await browser.targets.create();
	targetId = target.id;
	const session = await browser.session(targetId);
	await configurePage(session);
	const url = `${processValue.baseUrl}/geelooy/games/mitzvahWorld/index.html?amulet=${Date.now()}`;
	await browser.navigateTarget(targetId, url);
	await session.send('Page.bringToFront');
	const readiness = await browser.waitFor(targetId, amuletReadinessExpression(), {
		intervalMs: 100,
		label: 'AMULET_UI_READY',
		timeoutMs: 60000
	});
	const expert = await browser.evaluate(targetId, mountExpertExpression(), {
		awaitPromise: true,
		timeoutMs: 30000
	});
	const buyClicked = await browser.evaluate(targetId, buyAmuletExpression());
	const purchase = await browser.waitFor(targetId, purchasedExpression(), {
		intervalMs: 50,
		label: 'AMULET_PURCHASE',
		timeoutMs: 5000
	});
	const wound = await browser.evaluate(targetId, woundAndOpenBagExpression());
	const useClicked = await browser.evaluate(targetId, useThroughBagExpression());
	const healing = await browser.waitFor(targetId, healedExpression(), {
		intervalMs: 50,
		label: 'AMULET_HEALING',
		timeoutMs: 5000
	});
	const cleanup = await browser.evaluate(targetId, cleanupExpertExpression());
	const receipt = { buyClicked, cleanup, expert, healing, purchase, readiness, useClicked, wound };
	receipt.ok = accepted(receipt);
	console.log(`HEALING_AMULET_BROWSER_RECEIPT ${JSON.stringify(receipt)}`);
	if (!receipt.ok) {
		throw new Error(`HEALING_AMULET_BROWSER_REJECTED ${JSON.stringify(receipt)}`);
	}
} catch (error) {
	failure = error;
	console.error(`HEALING_AMULET_BROWSER_FAILURE ${error?.stack || error}`);
} finally {
	if (targetId) {
		try {
			await browser.closeTarget(targetId);
		} catch {}
	}
	await browser.stop();
	await processValue.stop();
}
if (failure) process.exitCode = 1;

function accepted(receipt) {
	return Boolean(
		receipt.readiness.ready
		&& receipt.expert.open
		&& receipt.expert.stockButtons === 3
		&& receipt.expert.disclaimer
		&& receipt.buyClicked
		&& receipt.purchase.quantity === 1
		&& receipt.purchase.wallet === 96
		&& receipt.wound.health === 70
		&& receipt.useClicked.item
		&& receipt.useClicked.use
		&& receipt.healing.health === 92
		&& receipt.healing.quantity === 0
		&& receipt.healing.wallet === 96
		&& !receipt.cleanup.panelPresent
	);
}

async function configurePage(session) {
	await session.send('Emulation.setFocusEmulationEnabled', { enabled: true });
	await session.send('Emulation.setDeviceMetricsOverride', {
		deviceScaleFactor: 1,
		height: 720,
		mobile: false,
		screenHeight: 720,
		screenWidth: 1280,
		width: 1280
	});
	await session.send('Page.bringToFront');
}
