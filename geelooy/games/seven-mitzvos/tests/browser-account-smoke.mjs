//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { CdpClient, openTarget, pause } from './cdp-client.mjs';

/**
 * @module BrowserAccountSmoke
 * @description
 * Chrome opens the enduring ledger, verifies provenance and visible equipment,
 * equips one tool, starts an authored journal quest, persists version two, and
 * releases WebGL. The Awtsmoos is truth before every account claim.
 */
const port = 9225;
const baseUrl = 'http://127.0.0.1:8080/games/seven-mitzvos/';
const target = await openTarget(port);
const browser = new CdpClient(target.webSocketDebuggerUrl);

try {
	await browser.connect();
	await browser.send('Page.bringToFront');
	await browser.send('Emulation.setFocusEmulationEnabled', { enabled: true });
	await browser.send('Emulation.setDeviceMetricsOverride', {
		width: 1440, height: 900, deviceScaleFactor: 1, mobile: false
	});
	await browser.send('Page.navigate', { url: baseUrl });
	await browser.waitFor(`document.querySelectorAll('#cityStage canvas').length === 1`, 20000);
	await browser.evaluate(`localStorage.removeItem('awtsmoos-seven-realm-v1'); localStorage.removeItem('awtsmoos-seven-realm-v1:backup'); location.hash = 'realm'`);
	await browser.waitFor(`document.querySelectorAll('#realmStage canvas').length === 1`, 20000);
	await pause(900);
	const initial = await browser.evaluate(`(() => {
		const canvas = document.querySelector('#realmStage canvas');
		const state = JSON.parse(localStorage.getItem('awtsmoos-seven-realm-v1'));
		return { version: state?.version, skills: Object.keys(state?.player?.skills || {}).length,
			visibleEquipment: Number(canvas?.dataset.equippedVisuals || 0), frameTarget: canvas?.dataset.frameTarget || '',
			canvases: document.querySelectorAll('canvas').length, documentHeight: document.documentElement.scrollHeight,
			viewportHeight: innerHeight };
	})()`);
	assert.equal(initial.version, 2);
	assert.equal(initial.skills, 10);
	assert.ok(initial.visibleEquipment >= 3, JSON.stringify(initial));
	assert.equal(initial.frameTarget, '16.67');
	assert.equal(initial.canvases, 1);
	assert.ok(initial.documentHeight <= initial.viewportHeight, JSON.stringify(initial));
	await browser.evaluate(`document.querySelector('#realmAccountToggle').click()`);
	await browser.waitFor(`!document.querySelector('#realmAccountDrawer').hidden`);
	const drawer = await browser.evaluate(`(() => ({
		equipmentRows: document.querySelectorAll('#realmAccountEquipment .realmAccountRow').length,
		carriedRows: document.querySelectorAll('#realmAccountCarriedItems .realmAccountRow').length,
		questRows: document.querySelectorAll('#realmAccountQuests .realmAccountRow').length,
		text: document.querySelector('#realmAccountDrawer').innerText
	}))()`);
	assert.equal(drawer.equipmentRows, 9);
	assert.ok(drawer.carriedRows >= 5 && drawer.questRows >= 3, JSON.stringify(drawer));
	assert.match(drawer.text, /made by/i);
	assert.match(drawer.text, /Issued to a new traveler/i);
	const equippedAction = await browser.evaluate(`(() => {
		const button = document.querySelector('#realmAccountCarriedItems [data-account-action^="equip:"]');
		if (!button) return '';
		button.click();
		return button.dataset.accountAction;
	})()`);
	assert.ok(equippedAction);
	await browser.waitFor(`JSON.parse(localStorage.getItem('awtsmoos-seven-realm-v1')).equipment.utility !== null`);
	await browser.waitFor(`Number(document.querySelector('#realmStage canvas').dataset.equippedVisuals) >= 4`);
	const questAction = await browser.evaluate(`(() => {
		const button = document.querySelector('#realmAccountQuests [data-account-action^="quest:start:"]');
		if (!button) return '';
		button.click();
		return button.dataset.accountAction;
	})()`);
	assert.ok(questAction, 'Expected authored quest action in the journal');
	await browser.waitFor(`Boolean(JSON.parse(localStorage.getItem('awtsmoos-seven-realm-v1')).quests.active['bridge-of-trust'])`);
	await browser.waitFor(`document.querySelector('#realmAccountQuests').innerText.includes('Hear Ari explain')`);
	const finalState = await browser.evaluate(`JSON.parse(localStorage.getItem('awtsmoos-seven-realm-v1'))`);
	assert.equal(finalState.version, 2);
	assert.ok(finalState.actionCount >= 2);
	assert.ok(finalState.memory.length >= 2);
	await browser.evaluate(`document.querySelector('#realmBack').click()`);
	await browser.waitFor(`document.querySelectorAll('#cityStage canvas').length === 1 && document.querySelectorAll('#realmStage canvas').length === 0`);
	assert.equal(browser.errors().length, 0, JSON.stringify(browser.errors(), null, 2));
	console.log(JSON.stringify({ ok: true, initial, drawer, equippedAction, questAction,
		actionCount: finalState.actionCount, memories: finalState.memory.length }, null, 2));
} catch (error) {
	console.error('B"H | Account browser smoke failed.');
	console.error(error.stack || error);
	console.error(JSON.stringify(browser.errors(), null, 2));
	throw error;
} finally {
	browser.close();
	await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`).catch(() => {});
}
