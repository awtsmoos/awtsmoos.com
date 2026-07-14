// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReturnLostWickBrowserPersistence.mjs
 * @description Verifies save, reload, mobile Codex, and mobile journal continuity.
 *
 * The Awtsmoos renews memory without requiring it, yet every created save must
 * tell the truth. Awtsmoos.com therefore reloads the earned passage, garment,
 * staff, skills, lamp, and readable mobile record before calling the flow proven.
 */
import assert from 'node:assert/strict';
import {
	assertFirstLightSnapshot,
	firstLightSnapshotExpression,
	openFirstLightCodex
} from './FirstLightBrowserAssertions.mjs';
import { BASE } from './ReturnLostWickBrowserExpressions.mjs';

export async function openReturnLostWickJournal(client) {
	return client.evaluate(`(async()=>{
		document.querySelector('[data-revelation-panel="journal"]')?.click();
		const { MobileControls } = await import('${BASE}/tiferet/ui/MobileControls.js');
		MobileControls.update();
		return true;
	})()`);
}

export async function saveAndReloadReturnLostWick(client) {
	const saved = await client.evaluate(`(()=>{
		const result = OhrHaGnuzSave.saveGame(localStorage);
		return {
			ok: result.ok,
			schema: result.envelope.schemaVersion
		};
	})()`);
	assert.deepEqual(saved, { ok: true, schema: 3 });
	await client.send('Page.reload', { ignoreCache: true });
	await client.waitFor(
		`document.readyState==='complete'`
		+ `&&Boolean(document.querySelector('#revelation-shell'))`,
		12000
	);
	const returned = await client.evaluate(`(async()=>{
		const { State } = await import('${BASE}/binah/State.js');
		const { returnLostWickSummary } = await import('${BASE}/missions/companion/ReturnLostWickRuntime.js');
		return {
			summary: returnLostWickSummary(),
			flags: { ...State.WorldState.flags }
		};
	})()`);
	assert.equal(returned.summary.status, 'completed');
	assert.equal(returned.flags.bentReedsLampRestored, true);
	assertFirstLightSnapshot(await client.evaluate(firstLightSnapshotExpression));
	return { saved, returned };
}

export async function verifyMobileReturnLostWick(client, screenshotPath) {
	await client.send('Emulation.setDeviceMetricsOverride', {
		width: 390,
		height: 844,
		deviceScaleFactor: 1,
		mobile: true
	});
	const mobileCodex = await openFirstLightCodex(
		client,
		screenshotPath('browser-mobile-first-light-codex.png')
	);
	await openReturnLostWickJournal(client);
	await client.waitFor(
		`matchMedia('(max-width:760px)').matches`
		+ `&&document.body.innerText.includes('Return the Lost Wick')`,
		5000
	);
	const mobile = await client.evaluate(`({
		mobile: matchMedia('(max-width:760px)').matches,
		journal: document.body.innerText.includes('Road revealed and restored')
	})`);
	assert.deepEqual(mobile, { mobile: true, journal: true });
	await client.screenshot(screenshotPath('browser-mobile-wick-journal.png'));
	return { mobileCodex, mobile };
}
