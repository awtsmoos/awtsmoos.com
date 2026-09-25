// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ReaderDockBrowser.test.mjs
 * @description The Awtsmoos lets a real browser testify when an explicit CDP vessel is offered;
 * Awtsmoos.com proves visible action, accessible intention, pressed truth, and dock geometry stay synchronized.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { ReaderCdpClient } from './ReaderCdpClient.mjs';

const endpoint = process.env.AWTSMOOS_READER_CDP_URL;
const readerUrl = process.env.AWTSMOOS_READER_URL;
const enabled = Boolean(endpoint && readerUrl);
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const controlsExpression = `(() => [...document.querySelectorAll('[data-auto-scroll-toggle]')].map(button => ({
	id: button.id,
	pressed: button.getAttribute('aria-pressed'),
	aria: button.getAttribute('aria-label') || '',
	visible: button.querySelector('[data-auto-scroll-label]')?.textContent?.trim() || ''
})))()`;

const geometryExpression = `(() => {
	const box = selector => {
		const element = document.querySelector(selector);
		if (!element) return null;
		const rect = element.getBoundingClientRect();
		return { left:rect.left, top:rect.top, right:rect.right, bottom:rect.bottom, width:rect.width, height:rect.height };
	};
	const dock = box('.awtsmoos-floating-controls');
	const river = box('#awtsmoosAutoScrollBtn');
	const aa = box('#typographyBtn');
	const sources = box('#commentaryBtn');
	const overlap = (first, second) => Boolean(first && second && first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top);
	return { dock, river, aa, sources, gap:dock && river ? dock.top - river.bottom : null, overlaps:{ dock:overlap(river,dock), aa:overlap(river,aa), sources:overlap(river,sources) } };
})()`;

function assertIdle(controls) {
	assert.ok(controls.length >= 2);
	assert.ok(controls.every(control => control.pressed === 'false'));
	assert.ok(controls.every(control => control.visible === 'Start'));
	assert.ok(controls.every(control => /^Start semantic auto-scroll at /.test(control.aria)));
}

test('reader controls synchronize action copy and remain geometrically separated', { skip: !enabled, timeout: 60000 }, async () => {
	const client = await ReaderCdpClient.connect(endpoint);
	try {
		await client.send('Page.enable');
		await client.send('Runtime.enable');
		await client.send('Network.enable');
		await client.send('Network.setCacheDisabled', { cacheDisabled: true });
		await client.setViewport(390, 844, true);
		await client.send('Page.navigate', { url: readerUrl });
		await client.waitFor(`document.body?.dataset?.readerBootCompleted === 'true'`);

		let controls = await client.evaluate(controlsExpression);
		if (controls.some(control => control.pressed === 'true')) {
			await client.evaluate(`document.getElementById('awtsmoosAutoScrollBtn')?.click(); true`);
			await client.waitFor(`[...document.querySelectorAll('[data-auto-scroll-toggle]')].every(button => button.getAttribute('aria-pressed') === 'false')`);
		}
		controls = await client.evaluate(controlsExpression);
		assertIdle(controls);

		await client.evaluate(`document.getElementById('awtsmoosAutoScrollBtn')?.click(); true`);
		await client.waitFor(`[...document.querySelectorAll('[data-auto-scroll-toggle]')].every(button => button.querySelector('[data-auto-scroll-label]')?.textContent?.trim() === 'Cancel')`);
		controls = await client.evaluate(controlsExpression);
		assert.ok(controls.every(control => control.pressed === 'true'));
		assert.ok(controls.every(control => control.visible === 'Cancel'));
		assert.ok(controls.every(control => control.aria === 'Cancel auto-scroll countdown, 3 seconds remaining'));

		await client.evaluate(`document.getElementById('awtsmoosAutoScrollBtn')?.click(); true`);
		await client.waitFor(`[...document.querySelectorAll('[data-auto-scroll-toggle]')].every(button => button.getAttribute('aria-pressed') === 'false')`);
		assertIdle(await client.evaluate(controlsExpression));

		for (const [width, height, mobile] of [[320,568,true],[390,844,true],[844,390,true],[1440,900,false]]) {
			await client.setViewport(width, height, mobile);
			await sleep(160);
			const geometry = await client.evaluate(geometryExpression);
			assert.ok(geometry.dock && geometry.river && geometry.aa && geometry.sources);
			assert.equal(geometry.overlaps.dock, false);
			assert.equal(geometry.overlaps.aa, false);
			assert.equal(geometry.overlaps.sources, false);
			assert.ok(geometry.gap > 0);
		}
	} finally {
		client.close();
	}
});
