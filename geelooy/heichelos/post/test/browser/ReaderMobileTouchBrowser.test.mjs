// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ReaderMobileTouchBrowser.test.mjs
 * @description The Awtsmoos lets a real finger reach the visible river control;
 * Awtsmoos.com proves mobile sheets own their viewport without burying the intended touch target.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { ReaderCdpClient } from './ReaderCdpClient.mjs';

const endpoint = process.env.AWTSMOOS_READER_CDP_URL;
const readerUrl = process.env.AWTSMOOS_READER_URL;
const enabled = Boolean(endpoint && readerUrl);
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function center(client, selector) {
	return client.evaluate(`(() => { const e=document.querySelector(${JSON.stringify(selector)}); if(!e)return null; const r=e.getBoundingClientRect(); return{x:r.left+r.width/2,y:r.top+r.height/2,width:r.width,height:r.height}; })()`);
}

async function touch(client, selector) {
	const point = await center(client, selector);
	assert.ok(point, `missing touch target ${selector}`);
	await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: point.x, y: point.y }] });
	await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
	return point;
}

async function hidden(client, selector) {
	return client.evaluate(`(() => { const e=document.querySelector(${JSON.stringify(selector)}); if(!e)return true; const s=getComputedStyle(e); return s.visibility==='hidden'||s.display==='none'||s.pointerEvents==='none'||Number(s.opacity)===0; })()`);
}

async function reloadReader(client) {
	await client.send('Page.navigate', { url: readerUrl });
	await client.waitFor(`document.body?.dataset?.readerBootCompleted === 'true'`);
}

test('mobile sheets preserve physical Auto Scroll touch ownership', { skip: !enabled, timeout: 60000 }, async () => {
	const client = await ReaderCdpClient.connect(endpoint);
	try {
		await client.send('Page.enable');
		await client.send('Runtime.enable');
		await client.send('Network.enable');
		await client.send('Network.setCacheDisabled', { cacheDisabled: true });
		await client.setViewport(390, 844, true);
		await reloadReader(client);

		await touch(client, '#typographyBtn');
		await client.waitFor(`document.getElementById('typographyBtn')?.getAttribute('aria-expanded') === 'true'`);
		await client.evaluate(`document.querySelector('#typographyDetails .typography-content').scrollTop=400; true`);
		await touch(client, '#typographyBtn');
		await client.waitFor(`document.getElementById('typographyBtn')?.getAttribute('aria-expanded') === 'false'`);
		await sleep(180);
		await touch(client, '#typographyBtn');
		await client.waitFor(`document.getElementById('typographyBtn')?.getAttribute('aria-expanded') === 'true'`);
		assert.equal(await client.evaluate(`document.querySelector('#typographyDetails .typography-content')?.scrollTop`), 0);
		assert.equal(await hidden(client, '#awtsmoosAutoScrollBtn'), true);

		const owner = await client.evaluate(`(() => { const e=document.getElementById('autoScrollSettingsToggle'); const r=e.getBoundingClientRect(); return document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)?.closest('#autoScrollSettingsToggle')?.id||''; })()`);
		assert.equal(owner, 'autoScrollSettingsToggle');
		await touch(client, '#autoScrollSettingsToggle');
		await client.waitFor(`document.getElementById('autoScrollSettingsToggle')?.getAttribute('aria-pressed') === 'true'`);

		await reloadReader(client);
		assert.equal(await client.evaluate(`document.getElementById('autoScrollSettingsToggle')?.getAttribute('aria-pressed')`), 'false');
		await touch(client, '#commentaryBtn');
		await client.waitFor(`document.getElementById('commentaryBtn')?.getAttribute('aria-expanded') === 'true'`);
		assert.equal(await client.evaluate(`document.getElementById('typographyBtn')?.getAttribute('aria-expanded')`), 'false');
		assert.equal(await hidden(client, '.awtsmoos-floating-controls'), true);
		assert.equal(await hidden(client, '#awtsmoosAutoScrollBtn'), true);
		const sidebar = await client.evaluate(`(() => { const r=document.querySelector('.sidebar').getBoundingClientRect(); return{top:r.top,bottom:r.bottom,height:r.height,viewport:innerHeight}; })()`);
		assert.ok(sidebar.top <= 16 && sidebar.bottom >= sidebar.viewport - 16);

		await client.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
		await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
		await client.waitFor(`document.getElementById('commentaryBtn')?.getAttribute('aria-expanded') === 'false'`);
		await sleep(80);
		assert.equal(await client.evaluate(`document.activeElement?.id||''`), 'commentaryBtn');
	} finally {
		client.close();
	}
});
