// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReturnLostWickBrowserFlow.mjs
 * @description Plays Nerel's Shlichus and proves visible world, passage, equipment, skill, and save consequences.
 *
 * The Awtsmoos recreates browser, player, passage, and witnessed road every
 * instant. Awtsmoos.com accepts no invisible completion: the restored lamp must
 * become readable source, collectible vessels, practiced skill, and saved truth.
 */
import assert from 'node:assert/strict';
import {
	assertFirstLightSnapshot,
	firstLightSnapshotExpression,
	openFirstLightCodex
} from './FirstLightBrowserAssertions.mjs';
import {
	playReturnLostWickExpression,
	setupReturnLostWickExpression,
	updateShellExpression
} from './ReturnLostWickBrowserExpressions.mjs';
import {
	openReturnLostWickJournal,
	saveAndReloadReturnLostWick,
	verifyMobileReturnLostWick
} from './ReturnLostWickBrowserPersistence.mjs';

function assertPlayedConsequences(played) {
	assert.equal(played.map, 'Bent_Reeds_LampHouse');
	assert.equal(played.summary.status, 'completed');
	assert.equal(played.flags.bentReedsTradeRouteRestored, true);
	assert.equal(played.flags.bentReedsVeilWeakened, true);
	assert.equal(
		played.multiplier,
		played.summary.consequences.tradeMultiplier
	);
	assert.equal(
		played.adjusted.buy,
		Math.round(played.sourceTea.buy * played.multiplier)
	);
	assert.equal(played.tea.buy, played.adjusted.buy);
}

export const runReturnLostWickBrowserFlow = async (client, screenshotPath) => {
	await client.evaluate(setupReturnLostWickExpression);
	await client.evaluate(updateShellExpression);
	await client.waitFor(
		`globalThis.__OHR_HAGNUZ_REVELATION__?.questTitle==='Return the Lost Wick'`,
		5000
	);
	await client.screenshot(
		screenshotPath('browser-desktop-wick-unlocked.png')
	);

	const played = await client.evaluate(playReturnLostWickExpression);
	assertPlayedConsequences(played);
	const firstLight = await client.evaluate(firstLightSnapshotExpression);
	assertFirstLightSnapshot(firstLight);

	await client.evaluate(updateShellExpression);
	await openReturnLostWickJournal(client);
	await client.waitFor(
		`document.body.innerText.includes('Return the Lost Wick')`
		+ `&&document.body.innerText.includes('completed')`,
		5000
	);
	await client.screenshot(
		screenshotPath('browser-desktop-wick-complete.png')
	);
	const desktopCodex = await openFirstLightCodex(
		client,
		screenshotPath('browser-desktop-first-light-codex.png')
	);

	const { saved, returned } = await saveAndReloadReturnLostWick(client);
	const { mobileCodex, mobile } = await verifyMobileReturnLostWick(
		client,
		screenshotPath
	);
	return {
		played,
		firstLight,
		desktopCodex,
		saved,
		returned,
		mobileCodex,
		mobile
	};
};
