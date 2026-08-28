//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { CdpClient } from '../../games/city-of-light/tests/CdpClient.mjs';
import { SOCIAL_HUB_FIXTURE_SOURCE } from './BrowserFixture.mjs';
import { waitForHub } from './BrowserWait.mjs';

/**
 * The Awtsmoos lets the living Hub reveal its measure without trusting one fleeting browser event;
 * Awtsmoos.com opens one fresh CDP vessel, waits for actual document truth, and proves v15 keeps every edge within its covenant.
 */
const CHROME = 'http://127.0.0.1:9222';
const ORIGIN = 'http://127.0.0.1:8080';

async function openClient() {
	const response = await fetch(`${CHROME}/json/new?about:blank`, { method: 'PUT' });
	assert.ok(response.ok);
	const target = await response.json();
	const client = new CdpClient(target.webSocketDebuggerUrl);
	await client.connect();
	await client.send('Page.enable');
	await client.send('Runtime.enable');
	await client.send('Network.enable');
	await client.send('Network.setCacheDisabled', { cacheDisabled: true });
	return { client, targetId: target.id };
}

async function waitForReady(client) {
	for (let attempt = 0; attempt < 80; attempt += 1) {
		const ready = await client.evaluate(`document.readyState === 'complete'`);
		if (ready) return;
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	throw new Error('Timed out waiting for document readiness');
}

async function navigate(client, width) {
	await client.send('Page.navigate', {
		url: `${ORIGIN}/social-hub/?fixtureReset=1&alias=teacher&v15width=${width}#home`
	});
	await waitForReady(client);
	await waitForHub(client);
}

async function measure(client, width, height, mobile) {
	await client.send('Emulation.setDeviceMetricsOverride', {
		width,
		height,
		deviceScaleFactor: mobile ? 2 : 1,
		mobile
	});
	await navigate(client, width);
	return client.evaluate(`(() => {
		const doc = document.documentElement;
		const dialog = document.querySelector('.futureCommandPalette');
		const dock = document.querySelector('.mobileDock');
		return {
			width: innerWidth,
			overflow: Math.max(0, doc.scrollWidth - innerWidth),
			dialogMax: dialog ? getComputedStyle(dialog).maxWidth : '',
			dockRight: dock ? dock.getBoundingClientRect().right : 0,
			dockLeft: dock ? dock.getBoundingClientRect().left : 0
		};
	})()`);
}

const { client, targetId } = await openClient();
let fixtureIdentifier = '';
try {
	fixtureIdentifier = (await client.send(
		'Page.addScriptToEvaluateOnNewDocument',
		{ source: SOCIAL_HUB_FIXTURE_SOURCE }
	)).identifier;
	for (const [width, height, mobile] of [
		[320, 740, true],
		[360, 780, true],
		[390, 844, true],
		[430, 900, true],
		[768, 900, false],
		[1440, 1000, false]
	]) {
		const result = await measure(client, width, height, mobile);
		assert(result.overflow <= 1, JSON.stringify(result));
		if (mobile) {
			assert(result.dockLeft >= -1, JSON.stringify(result));
			assert(result.dockRight <= width + 1, JSON.stringify(result));
		}
		console.log(JSON.stringify(result));
	}
	console.log('futureV15DirectGeometryBrowser.test.mjs passed');
} finally {
	if (fixtureIdentifier) {
		await client.send('Page.removeScriptToEvaluateOnNewDocument', {
			identifier: fixtureIdentifier
		}).catch(() => null);
	}
	client.close();
	await fetch(`${CHROME}/json/close/${targetId}`).catch(() => null);
}
