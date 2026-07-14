//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyBrowserActions.mjs
 * @description Drives independent real Chrome travelers through the mode gate.
 * The Awtsmoos renews each witness without merging their sight; Awtsmoos.com is
 * tested through separate pages that receive one server-authoritative road.
 */

import { CdpClient } from './CdpClient.mjs';

const DEBUG_ENDPOINT = 'http://127.0.0.1:9222';
const ERROR_CAPTURE = `
	globalThis.__OHR_TEST_ERRORS__=[];
	addEventListener('error',event=>__OHR_TEST_ERRORS__.push(String(event.error?.stack||event.message)));
	addEventListener('unhandledrejection',event=>__OHR_TEST_ERRORS__.push(String(event.reason?.stack||event.reason)));
`;

export async function createJourneyBrowser(url) {
	const target = await fetch(`${DEBUG_ENDPOINT}/json/new?about%3Ablank`, {
		method: 'PUT'
	}).then(response => response.json());
	const client = await new CdpClient(target.webSocketDebuggerUrl).connect();
	await client.send('Page.enable');
	await client.send('Runtime.enable');
	await client.send('Log.enable');
	await client.send('Network.enable');
	await client.send('Network.setCacheDisabled', { cacheDisabled: true });
	await client.send('Page.addScriptToEvaluateOnNewDocument', { source: ERROR_CAPTURE });
	await client.send('Page.navigate', { url });
	await client.waitFor(
		`document.readyState==='complete'`
		+ `&&Boolean(document.querySelector('#revelation-shell'))`
		+ `&&Boolean(document.querySelector('#journey-mode-root'))`,
		12000
	);
	client.events.length = 0;
	return { client, target };
}

export async function chooseSolo(client) {
	await client.evaluate(`document.querySelector('[data-action="solo"]').click()`);
	await client.waitFor(`document.querySelector('#journey-mode-root').hidden===true`);
	return client.evaluate(`({
		shell:Boolean(document.querySelector('#revelation-shell')),
		ignited:Boolean(globalThis.__OHR_HAGNUZ_IGNITED__),
		socket:OhrHaGnuz.journey.connection.socket
	})`);
}

export async function chooseShared(client, displayName) {
	await client.evaluate(`OhrHaGnuz.journey.show()`);
	await client.evaluate(`document.querySelector('[data-action="shared"]').click()`);
	await client.evaluate(`(()=>{
		const input=document.querySelector('[data-field="name"]');
		input.value=${JSON.stringify(displayName)};
		document.querySelector('[data-action="connect"]').click();
	})()`);
	await client.waitFor(`OhrHaGnuz.journey.store.snapshot().road!==null`, 8000);
	return journeyState(client);
}

export function journeyState(client) {
	return client.evaluate(`OhrHaGnuz.journey.store.snapshot()`);
}

export async function moveEast(client, steps) {
	for (let index = 0; index < steps; index += 1) {
		await client.evaluate(`document.querySelector('[data-move="1,0"]').click()`);
	}
}

export async function lightSharedLamp(client) {
	await client.evaluate(`document.querySelector('[data-action="lamp"]').click()`);
}

export function browserErrors(client) {
	return client.events.filter(event => {
		if (event.method === 'Runtime.exceptionThrown') return true;
		return event.method === 'Log.entryAdded'
			&& event.params?.entry?.level === 'error';
	});
}

export async function closeJourneyBrowser(browser) {
	browser.client.close();
	await fetch(`${DEBUG_ENDPOINT}/json/close/${browser.target.id}`).catch(() => {});
}
