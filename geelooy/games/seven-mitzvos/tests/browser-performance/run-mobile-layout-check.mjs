//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RunMobileLayoutCheck
 * @description
 * Real Chrome measures Awtsmoos.com at narrow widths in collapsed and expanded
 * states, then closes its own target. The Awtsmoos exceeds every boundary;
 * finite checks must not leave hidden tabs consuming future frame budgets.
 */
import { writeFile } from 'node:fs/promises';
import { withTarget } from './cdp-client.mjs';
import {
	mobileLayoutExpression,
	openHeroDisclosuresExpression,
	verifyMobileLayout
} from './mobile-layout-contract.mjs';

const port = Number.parseInt(process.env.CHROME_PORT || '9334', 10);
const baseUrl = process.env.PAGE_URL ||
	'http://127.0.0.1:5180/geelooy/games/seven-mitzvos/';
const output = process.env.LAYOUT_OUTPUT || 'mobile-layout-report.json';
const screenshotPath = process.env.LAYOUT_SCREENSHOT || 'mobile-layout-390.png';
const widths = [320, 375, 390, 430];
const reports = await withTarget(port, 'about:blank', async client => {
	await Promise.all([
		client.send('Page.enable'),
		client.send('Runtime.enable'),
		client.send('Emulation.setTouchEmulationEnabled', { enabled: true })
	]);
	const results = [];
	for (const width of widths) {
		results.push(await measureWidth(client, width));
	}
	return results;
});
await writeFile(output, `${JSON.stringify({ passed: true, reports }, null, '\t')}\n`);
console.log(JSON.stringify({ passed: true, reports }));

async function measureWidth(client, width) {
	await setViewport(client, width);
	const loaded = client.waitFor('Page.loadEventFired');
	await client.send('Page.navigate', {
		url: `${baseUrl}?mobile-layout=${width}`
	});
	await loaded;
	await waitForHero(client);
	const closed = await evaluate(client, mobileLayoutExpression('closed'));
	verifyMobileLayout(closed, {
		visibleActionCount: 1,
		openDisclosureCount: 0
	});
	if (width === 390) {
		await captureScreenshot(client, screenshotPath);
	}
	await evaluate(client, openHeroDisclosuresExpression());
	const open = await evaluate(client, mobileLayoutExpression('open'));
	verifyMobileLayout(open, {
		visibleActionCount: 5,
		openDisclosureCount: 2
	});
	if (width === 390) {
		await captureScreenshot(client, variantPath(screenshotPath, '-open'));
	}
	return { width, closed, open };
}

async function setViewport(client, width) {
	await client.send('Emulation.setDeviceMetricsOverride', {
		width,
		height: 844,
		deviceScaleFactor: 2,
		mobile: true,
		screenWidth: width,
		screenHeight: 844
	});
}

async function waitForHero(client) {
	await evaluate(client, `new Promise(resolve => {
		const ready = () => document.readyState === 'complete' &&
			document.querySelector('.heroActionStack');
		if (ready()) { resolve(true); return; }
		const timer = setInterval(() => {
			if (ready()) { clearInterval(timer); resolve(true); }
		}, 25);
	})`, true);
}

async function evaluate(client, expression, awaitPromise = false) {
	const response = await client.send('Runtime.evaluate', {
		expression,
		awaitPromise,
		returnByValue: true
	});
	if (response.exceptionDetails) {
		throw new Error(response.exceptionDetails.text);
	}
	return response.result.value;
}

async function captureScreenshot(client, path) {
	const image = await client.send('Page.captureScreenshot', {
		format: 'png',
		fromSurface: true
	});
	await writeFile(path, image.data, 'base64');
}

function variantPath(path, suffix) {
	return path.replace(/(\.[^.]+)$/, `${suffix}$1`);
}
