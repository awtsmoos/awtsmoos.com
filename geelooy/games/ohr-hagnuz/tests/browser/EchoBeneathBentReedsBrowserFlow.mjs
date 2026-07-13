// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EchoBeneathBentReedsBrowserFlow.mjs
 * @description Proves chapter, persistence, mobile journal, and runtime metrics in real Chrome.
 *
 * A chapter is not complete while only a test object believes it. The Awtsmoos
 * renews player, screen, and road together; this flow demands visible evidence
 * from desktop and phone-shaped vessels at Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import { playEchoExpression, reloadEchoExpression, setupEchoExpression, updateShellExpression } from './EchoBeneathBentReedsBrowserExpressions.mjs';

const BASE = '/geelooy/games/ohr-hagnuz/src';

async function openJournal(client) {
	return client.evaluate(`(async()=>{
		document.querySelector('[data-revelation-panel="journal"]')?.click();
		const {MobileControls}=await import('${BASE}/tiferet/ui/MobileControls.js');
		MobileControls.update(performance.now()+100);
		return true;
	})()`);
}

export async function runEchoBrowserFlow(client, screenshotPath) {
	await client.evaluate(setupEchoExpression);
	await client.evaluate(updateShellExpression);
	await client.waitFor(`globalThis.__OHR_HAGNUZ_REVELATION__?.questTitle==='Return the Lost Wick'`, 5000);
	await client.screenshot(screenshotPath('browser-desktop-echo-ready.png'));

	const played = await client.evaluate(playEchoExpression);
	assert.equal(played.discovered, true);
	assert.deepEqual([played.battle.realm, played.battle.marker], ['DEBATE', true]);
	assert.ok(played.battle.log.some(line => line.includes('compassion')));
	assert.equal(played.flags.bentReedsEchoResolved, true);
	assert.equal(played.ability, true);
	assert.equal(played.command, 'Sheltering Current');
	assert.ok(played.performance?.count > 0);
	assert.equal(played.performance.boundedAt, 180);

	await client.evaluate(updateShellExpression);
	await openJournal(client);
	await client.waitFor(`document.body.innerText.includes('The Echo Beneath Bent Reeds')&&document.body.innerText.includes('Sheltering Current')`, 5000);
	await client.screenshot(screenshotPath('browser-desktop-echo-complete.png'));

	const saved = await client.evaluate(`(()=>{
		const result=OhrHaGnuzSave.saveGame(localStorage);
		return {ok:result.ok,schema:result.envelope.schemaVersion};
	})()`);
	assert.deepEqual(saved, { ok: true, schema: 3 });
	await client.send('Page.reload', { ignoreCache: true });
	await client.waitFor(`document.readyState==='complete'&&Boolean(document.querySelector('#revelation-shell'))`, 12000);
	const returned = await client.evaluate(reloadEchoExpression);
	assert.equal(returned.summary.echo.resolved, true);
	assert.equal(returned.resolved, true);
	assert.equal(returned.ability, true);
	assert.equal(returned.command, 'Sheltering Current');
	assert.equal(returned.renderError, null);

	await client.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
	await openJournal(client);
	await client.waitFor(`matchMedia('(max-width:760px)').matches&&document.body.innerText.includes('The Echo Beneath Bent Reeds')`, 5000);
	const mobile = await client.evaluate(`({
		mobile:matchMedia('(max-width:760px)').matches,
		chapter:document.body.innerText.includes('The Echo Beneath Bent Reeds'),
		command:document.body.innerText.includes('Sheltering Current'),
		controls:Boolean(document.querySelector('#ohr-ui-root'))
	})`);
	assert.deepEqual(mobile, { mobile: true, chapter: true, command: true, controls: true });
	await client.screenshot(screenshotPath('browser-mobile-echo-journal.png'));
	return { played, saved, returned, mobile };
}
