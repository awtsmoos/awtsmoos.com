// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nitzotzBrowserVerification.mjs
 * @description Coordinates real Chrome verification and restores the player's save.
 *
 * A test may enter the world without claiming the world as its own. The
 * Awtsmoos renews proof and player memory together; this conductor verifies the
 * chapter, gathers fresh evidence, and returns the original road at Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { CdpClient, findGameTarget } from './CdpClient.mjs';
import { runBattleFlow } from './NitzotzBrowserFlow.mjs';
import { verifySaveAndMobile } from './NitzotzPersistenceBrowserFlow.mjs';

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const screenshotPath = name => path.resolve(
	'ai-thoughts/2026-07-13-0505-edt-nitzotz-bonded-battle',
	name
);

const prepareBrowser = async client => {
	await client.send('Page.enable');
	await client.send('Runtime.enable');
	await client.send('Log.enable');
	await client.send('Network.enable');
	await client.send('Network.setCacheDisabled', { cacheDisabled: true });
	await client.send('Page.navigate', {
		url: `http://127.0.0.1:5180/geelooy/games/ohr-hagnuz/?verify=cdp-${Date.now()}`
	});
	await client.waitFor(
		`document.readyState==='complete'&&Boolean(document.querySelector('#revelation-shell'))`,
		12000
	);
	client.events.length = 0;
	await client.evaluate(`(()=>{
		const key='ohr-hagnuz-save-v1';
		if(!localStorage.getItem('__ohr_hagnuz_test_backup__')){
			const value=localStorage.getItem(key);
			localStorage.setItem('__ohr_hagnuz_test_backup__',value===null?'__ABSENT__':value);
		}
		return true;
	})()`);
};

const restoreBrowser = async client => {
	await client.evaluate(`(()=>{
		const backup=localStorage.getItem('__ohr_hagnuz_test_backup__');
		if(backup==='__ABSENT__')localStorage.removeItem('ohr-hagnuz-save-v1');
		else if(backup!==null)localStorage.setItem('ohr-hagnuz-save-v1',backup);
		localStorage.removeItem('__ohr_hagnuz_test_backup__');
		return true;
	})()`).catch(() => {});
	await client.send('Emulation.clearDeviceMetricsOverride').catch(() => {});
	await client.send('Network.setCacheDisabled', { cacheDisabled: false }).catch(() => {});
	await client.send('Page.reload', { ignoreCache: true }).catch(() => {});
	await wait(300);
};

const isProtocolError = event => {
	if (event.method === 'Runtime.exceptionThrown') return true;
	if (event.method !== 'Log.entryAdded') return false;
	return event.params?.entry?.level === 'error';
};

const run = async () => {
	const target = await findGameTarget();
	assert.ok(target, 'The real Ohr HaGnuz Chrome target must exist.');
	const client = await new CdpClient(target.webSocketDebuggerUrl).connect();
	try {
		await prepareBrowser(client);
		const battle = await runBattleFlow(client, screenshotPath);
		const persistence = await verifySaveAndMobile(client, screenshotPath);
		const protocolErrors = client.events.filter(isProtocolError);
		assert.equal(protocolErrors.length, 0, JSON.stringify(protocolErrors));
		console.log(JSON.stringify({ ...battle, ...persistence }, null, 2));
		console.log('BH_NITZOTZ_BROWSER_PASS');
	} finally {
		await restoreBrowser(client);
		client.close();
	}
};

await run();
