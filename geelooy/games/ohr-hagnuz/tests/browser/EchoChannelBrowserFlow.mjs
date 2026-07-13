// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EchoChannelBrowserFlow.mjs
 * @description Proves visible desktop, mobile journal, and reload behavior in real Chrome.
 *
 * A chapter must survive the crossing from module to screen. The Awtsmoos renews
 * state, canvas, journal, phone-shaped viewport, and memory as one witnessed road
 * while this flow records their agreement for Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import {
	inspectEchoChannelReloadExpression,
	playEchoChannelExpression
} from './EchoChannelBrowserExpressions.mjs';
import { setupEchoExpression, updateShellExpression } from './EchoBeneathBentReedsBrowserExpressions.mjs';

async function openJournal(client) {
	await client.evaluate(`(async()=>{
		document.querySelector('[data-revelation-panel="journal"]')?.click();
		const {MobileControls}=await import('/geelooy/games/ohr-hagnuz/src/tiferet/ui/MobileControls.js');
		MobileControls.update(performance.now()+100);
		return true;
	})()`);
}

export async function runEchoChannelBrowserFlow(client, screenshotPath) {
	await client.evaluate(setupEchoExpression);
	await client.evaluate(updateShellExpression);
	const played = await client.evaluate(playEchoChannelExpression);
	assert.deepEqual(
		[played.entryMap, played.depthsMap, played.blockedMap, played.concealedMap],
		['Echo_Channel_Threshold', 'Echo_Channel_Depths', 'Echo_Channel_Depths', 'Echo_Channel_Concealed_Bend']
	);
	assert.equal(played.restoredMap, 'Bent_Reeds_Restored');
	assert.equal(played.flags.echoChannelBossResolved, true);
	assert.equal(played.flags.answeringWatersMantleRestored, true);
	assert.equal(played.flags.answeringWatersAfterwordRead, true);
	assert.equal(played.garment, 'MANTLE_OF_ANSWERING_WATERS');
	assert.equal(played.command, 'Sheltering Current');
	assert.equal(played.renderError, null);
	await client.screenshot(screenshotPath('browser-desktop-restored-bent-reeds.png'));
	await openJournal(client);
	await client.waitFor(`document.body.innerText.includes('Echo Channel')&&document.body.innerText.includes('Mantle of Answering Waters')`,5000);
	await client.screenshot(screenshotPath('browser-desktop-echo-channel-journal.png'));
	const saved = await client.evaluate(`(()=>{const result=OhrHaGnuzSave.saveGame(localStorage);return {ok:result.ok,schema:result.envelope.schemaVersion};})()`);
	assert.deepEqual(saved,{ok:true,schema:3});
	await client.send('Page.reload',{ignoreCache:true});
	await client.waitFor(`document.readyState==='complete'&&Boolean(document.querySelector('#revelation-shell'))`,12000);
	const returned = await client.evaluate(inspectEchoChannelReloadExpression);
	assert.deepEqual([returned.map,returned.resolved,returned.mantle,returned.afterword],[
		'Bent_Reeds_Restored',true,true,true
	]);
	assert.equal(returned.garment,'MANTLE_OF_ANSWERING_WATERS');
	assert.equal(returned.renderError,null);
	await client.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
	await client.evaluate(updateShellExpression);
	await openJournal(client);
	await client.waitFor(`matchMedia('(max-width:760px)').matches&&document.body.innerText.includes('Echo Channel')`,5000);
	const mobile = await client.evaluate(`({mobile:matchMedia('(max-width:760px)').matches,chapter:document.body.innerText.includes('Echo Channel'),mantle:document.body.innerText.includes('Mantle of Answering Waters'),controls:Boolean(document.querySelector('#ohr-ui-root'))})`);
	assert.deepEqual(mobile,{mobile:true,chapter:true,mantle:true,controls:true});
	await client.screenshot(screenshotPath('browser-mobile-echo-channel-journal.png'));
	return {played,saved,returned,mobile};
}
