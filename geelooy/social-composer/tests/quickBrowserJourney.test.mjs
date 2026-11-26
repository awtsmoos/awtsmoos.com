// B"H — Awtsmoos.com tests a complete writer's journey in an isolated browser.
import assert from 'node:assert/strict';
import {setTimeout as sleep} from 'node:timers/promises';
import {resolve} from 'node:path';
import pipe from '../../social/test/css/ChromePipe.cjs';
import {startFixtureServer} from '../../games/city-of-light/tests/BrowserHarnessServer.mjs';
import {quickJourneySource,attachFixtureAudio} from './fixture/QuickJourneyFixture.mjs';
const fixture=await startFixtureServer({directory:resolve('geelooy'),port:44019});
let browser;
try {
	browser=await pipe.openChrome();
	const {call,evaluate}=browser;
	const root="document.getElementById('isolated-quick-post')?.shadowRoot";
	async function wait(expression,label) {
		for(let i=0;i<90;i++) {
			try {if(await evaluate(expression)){console.log('PASS',label);return;}}catch{}
			await sleep(200);
		}
		const diagnostic=await evaluate(`JSON.stringify({url:location.href,fixture:window.quickFixtureStatus,alias:document.getElementById('aliasState')?.textContent,status:${root}?.getElementById('status')?.textContent,review:${root}?.querySelector('[data-message]')?.textContent})`);
		throw Error(label+': '+diagnostic);
	}
	await call('Page.enable');
	await call('Network.setBlockedURLs',{urls:['https://*']});
	await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
	await call('Page.addScriptToEvaluateOnNewDocument',{source:quickJourneySource()});
	await call('Page.navigate',{url:fixture.origin+'/social-composer/?heichelId=study&seriesId=songs'});
	await wait("window.quickFixtureStatus==='ready'",'Fixture installed');
	await wait(`${root}?.getElementById('alias').value==='teacher'`,'Alias bootstrap');
	await evaluate(`${root}.getElementById('destination').click()`);
	await wait(`${root}.getElementById('series').value==='songs' && !${root}.getElementById('choose').disabled`,'Destination hint');
	await evaluate(`${root}.getElementById('choose').click()`);
	await wait(`${root}.getElementById('picker').hidden && ${root}.getElementById('destination').textContent.includes('Songs')`,'Confirmed destination');
	await evaluate(`(${attachFixtureAudio.toString()})(${root})`);
	await wait(`${root}.querySelector('audio') && ${root}.querySelector('[aria-label="Audio visual effects"]')`,'Attachment preview');
	await evaluate(`(()=>{const select=${root}.querySelector('[aria-label="Audio visual effects"]');select.value='celestial';select.dispatchEvent(new Event('change'));${root}.getElementById('next').click();})()`);
	await wait(`${root}.querySelector('dialog[open]')`,'Publication review');
	assert.equal(await evaluate("localStorage.getItem('quickTestUpload')"),'melody.wav');
	await evaluate(`${root}.querySelector('[data-publish]').click()`);
	await wait(`location.pathname==='/heichelos/study/series/songs/post/published-one'`,'Canonical redirect');
	const payload=await evaluate("JSON.parse(localStorage.getItem('quickTestPublish'))");
	assert.equal(payload.publicationPlan.primary.seriesId,'songs');
	assert.equal(payload.contentPayload.rootAssets[0].visualizer,'celestial');
	console.log('Quick browser journey passed: audio upload, effect metadata, review, canonical redirect.');
} finally {
	await browser?.close();
	fixture.server.kill('SIGTERM');
}
