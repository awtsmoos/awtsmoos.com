//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { CdpClient } from '../../games/city-of-light/tests/CdpClient.mjs';

/**
 * The Awtsmoos lets each viewport receive its own fresh Creator vessel rather than inheriting a modal from yesterday;
 * Awtsmoos.com opens the living command crown once per width and proves every v15 edge remains inside the actual rendered display.
 */
const CHROME = 'http://127.0.0.1:9222';
const ORIGIN = 'http://127.0.0.1:8080';

async function withClient(run) {
	const response = await fetch(`${CHROME}/json/new?about:blank`, { method: 'PUT' });
	assert.ok(response.ok);
	const target = await response.json();
	const client = new CdpClient(target.webSocketDebuggerUrl);
	try {
		await client.connect();
		await client.send('Page.enable');
		await client.send('Runtime.enable');
		await client.send('Network.enable');
		await client.send('Network.setCacheDisabled', { cacheDisabled: true });
		return await run(client);
	} finally {
		client.close();
		await fetch(`${CHROME}/json/close/${target.id}`).catch(() => null);
	}
}

async function waitForCreator(client) {
	for (let attempt = 0; attempt < 100; attempt += 1) {
		const ready = await client.evaluate(`Boolean(
			window.RichSocialComposer
			&& document.querySelector('.creatorSurface')
			&& document.querySelector('.creatorCommandLauncher')
		)`);
		if (ready) return;
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	throw new Error('Timed out waiting for the live Creator');
}

async function measure(requestedWidth, height, mobile) {
	return withClient(async client => {
		await client.send('Emulation.setDeviceMetricsOverride', {
			width: requestedWidth,
			height,
			deviceScaleFactor: mobile ? 2 : 1,
			mobile
		});
		await client.send('Page.navigate', {
			url: `${ORIGIN}/social-composer/?v15live=1&width=${requestedWidth}`
		});
		await waitForCreator(client);
		return client.evaluate(`(async () => {
			document.querySelector('.creatorCommandLauncher').click();
			await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
			const selectors = [
				'.creatorSurface', '.creatorDock', '.creatorContextZone',
				'.creatorCommandLauncher', '.creatorPalette'
			];
			const boxes = selectors.map(selector => {
				const node = document.querySelector(selector);
				const box = node?.getBoundingClientRect();
				return {
					selector,
					visible: Boolean(box && box.width && box.height),
					left: box?.left || 0,
					right: box?.right || 0
				};
			});
			return {
				actualWidth: innerWidth,
				overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
				outside: boxes.filter(item => item.visible && (
					item.left < -1 || item.right > innerWidth + 1
				)).map(item => item.selector),
				paletteOpen: Boolean(document.querySelector('.creatorPalette')?.open),
				visible: boxes.filter(item => item.visible).map(item => item.selector)
			};
		})()`);
	});
}

for (const [requestedWidth, height, mobile] of [
	[320, 740, true], [360, 780, true], [390, 844, true],
	[430, 900, true], [768, 900, false], [1440, 1000, false]
]) {
	const result = await measure(requestedWidth, height, mobile);
	const evidence = { requestedWidth, ...result };
	assert(result.overflow <= 1, JSON.stringify(evidence));
	assert.deepEqual(result.outside, [], JSON.stringify(evidence));
	assert(result.paletteOpen, JSON.stringify(evidence));
	for (const selector of ['.creatorSurface', '.creatorDock', '.creatorContextZone', '.creatorPalette']) {
		assert(result.visible.includes(selector), JSON.stringify(evidence));
	}
	console.log(JSON.stringify(evidence));
}
console.log('futureV15DirectGeometryBrowser.test.mjs passed');
