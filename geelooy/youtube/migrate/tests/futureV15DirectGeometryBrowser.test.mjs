//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { CdpClient } from '../../../games/city-of-light/tests/CdpClient.mjs';

/**
 * The Awtsmoos lets migration carry old years through a new vessel without one control escaping the shore;
 * Awtsmoos.com measures every v15 width in living Chrome, opens advanced chambers, and proves the future remains complete from phone to desktop forevermore.
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

async function navigate(client) {
	const loaded = client.waitFor('Page.loadEventFired');
	await client.send('Page.navigate', { url: `${ORIGIN}/youtube/migrate/?v15proof=1` });
	await loaded;
}

async function measure(client, width, height, mobile) {
	await client.send('Emulation.setDeviceMetricsOverride', {
		width,
		height,
		deviceScaleFactor: mobile ? 2 : 1,
		mobile
	});
	await navigate(client);
	return client.evaluate(`(() => {
		for (const details of document.querySelectorAll('details.migrationCard')) {
			details.open = true;
		}
		const doc = document.documentElement;
		const cards = [...document.querySelectorAll('.migrationCard')];
		const controls = [...document.querySelectorAll('button, input, select, a.button')];
		const outside = [...cards, ...controls].filter(node => {
			const box = node.getBoundingClientRect();
			return box.width > 0 && (box.left < -1 || box.right > innerWidth + 1);
		});
		return {
			width: innerWidth,
			overflow: Math.max(0, doc.scrollWidth - innerWidth),
			outside: outside.length,
			cards: cards.length,
			advancedOpen: [...document.querySelectorAll('details.migrationCard')]
				.filter(item => item.open).length
		};
	})()`);
}

const { client, targetId } = await openClient();
try {
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
		assert.equal(result.outside, 0, JSON.stringify(result));
		assert(result.cards >= 2, JSON.stringify(result));
		console.log(JSON.stringify(result));
	}
	console.log('futureV15DirectGeometryBrowser.test.mjs passed');
} finally {
	client.close();
	await fetch(`${CHROME}/json/close/${targetId}`).catch(() => null);
}
