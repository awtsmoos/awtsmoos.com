// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file echoChannelBrowserVerification.mjs
 * @description Creates an isolated target, protects local save data, captures proof, and closes cleanly.
 *
 * A witness may borrow a browser window but not the player's memory. The Awtsmoos
 * renews page and save in one instant; this verifier restores every borrowed vessel
 * before closing its private chapter on Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { CdpClient } from './CdpClient.mjs';
import { runEchoChannelBrowserFlow } from './EchoChannelBrowserFlow.mjs';

const wait = milliseconds => new Promise(resolve => setTimeout(resolve,milliseconds));
const evidenceRoot = 'ai-thoughts/2026-07-13-1227-edt-echo-channel-revelation';
const screenshotPath = name => path.resolve(evidenceRoot,name);
const gameUrl = () => `http://127.0.0.1:4173/geelooy/games/ohr-hagnuz/?verify=echo-channel-${Date.now()}`;
const failurePath = path.resolve(evidenceRoot,'browser-last-failure.txt');

async function createTarget() {
	const response = await fetch('http://127.0.0.1:9222/json/new?about:blank',{method:'PUT'});
	assert.equal(response.ok,true,`Chrome target creation failed: ${response.status}`);
	return response.json();
}

async function prepare(client) {
	await client.send('Page.enable');
	await client.send('Runtime.enable');
	await client.send('Log.enable');
	await client.send('Network.enable');
	await client.send('Network.setCacheDisabled',{cacheDisabled:true});
	await client.send('Page.navigate',{url:gameUrl()});
	await client.waitFor(`document.readyState==='complete'&&Boolean(document.querySelector('#revelation-shell'))`,12000);
	client.events.length=0;
	await client.evaluate(`(()=>{const key='ohr-hagnuz-save-v1';const value=localStorage.getItem(key);localStorage.setItem('__echo_channel_backup__',value===null?'__ABSENT__':value);return true;})()`);
}

async function restore(client,targetId) {
	await client.evaluate(`(()=>{const backup=localStorage.getItem('__echo_channel_backup__');if(backup==='__ABSENT__')localStorage.removeItem('ohr-hagnuz-save-v1');else if(backup!==null)localStorage.setItem('ohr-hagnuz-save-v1',backup);localStorage.removeItem('__echo_channel_backup__');return true;})()`).catch(()=>{});
	await client.send('Emulation.clearDeviceMetricsOverride').catch(()=>{});
	await client.send('Network.setCacheDisabled',{cacheDisabled:false}).catch(()=>{});
	await client.send('Page.reload',{ignoreCache:true}).catch(()=>{});
	await wait(250);
	await client.send('Target.closeTarget',{targetId}).catch(()=>{});
}

function isProtocolError(event) {
	if(event.method==='Runtime.exceptionThrown')return true;
	return event.method==='Log.entryAdded'&&event.params?.entry?.level==='error';
}

async function run() {
	const target=await createTarget();
	const client=await new CdpClient(target.webSocketDebuggerUrl).connect();
	try {
		await prepare(client);
		const result=await runEchoChannelBrowserFlow(client,screenshotPath);
		const browserErrors=await client.evaluate('globalThis.__OHR_TEST_ERRORS__||[]');
		const protocolErrors=client.events.filter(isProtocolError);
		assert.deepEqual(browserErrors,[]);
		assert.equal(protocolErrors.length,0,JSON.stringify(protocolErrors));
		await fs.rm(failurePath,{force:true});
		console.log(JSON.stringify(result,null,2));
		console.log('BH_ECHO_CHANNEL_BROWSER_PASS');
	} finally {
		await restore(client,target.id);
		client.close();
	}
}

try {
	await run();
} catch(error) {
	await fs.writeFile(failurePath,String(error?.stack||error));
	throw error;
}
