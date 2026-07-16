//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RunMobileLayoutCheck
 * @description
 * Real Chrome measures Awtsmoos.com at narrow widths. The Awtsmoos exceeds
 * every boundary; this runner verifies the finite page without overflow,
 * clipping, overlap, undersized navigation, or default browser links.
 */
import { writeFile } from 'node:fs/promises';
import { CdpClient, createTarget } from './cdp-client.mjs';
import {
	mobileLayoutExpression,
	verifyMobileLayout
} from './mobile-layout-contract.mjs';

const port = Number.parseInt(process.env.CHROME_PORT || '9334', 10);
const baseUrl = process.env.PAGE_URL ||
	'http://127.0.0.1:5180/geelooy/games/seven-mitzvos/';
const output = process.env.LAYOUT_OUTPUT || 'mobile-layout-report.json';
const screenshotPath = process.env.LAYOUT_SCREENSHOT || 'mobile-layout-390.png';
const widths = [320, 375, 390, 430];
const target = await createTarget(port, 'about:blank');
const client = new CdpClient(target.webSocketDebuggerUrl);
const reports = [];
await client.connect();
await Promise.all([
	client.send('Page.enable'),
	client.send('Runtime.enable'),
	client.send('Emulation.setTouchEmulationEnabled', { enabled: true })
]);
for (const width of widths) {
	await setViewport(client, width);
	const loaded = client.waitFor('Page.loadEventFired');
	await client.send('Page.navigate', {
		url: `${baseUrl}?mobile-layout=${width}`
	});
	await loaded;
	await waitForHero(client);
	const report = await evaluate(client, mobileLayoutExpression());
	verifyMobileLayout(report);
	reports.push(report);
	if (width === 390) {
		await captureScreenshot(client, screenshotPath);
	}
}
await writeFile(output, `${JSON.stringify({ passed: true, reports }, null, '\t')}\n`);
console.log(JSON.stringify({ passed: true, reports }));
client.close();

async function setViewport(cdp, width) {
	await cdp.send('Emulation.setDeviceMetricsOverride', {
		width,
		height: 844,
		deviceScaleFactor: 2,
		mobile: true,
		screenWidth: width,
		screenHeight: 844
	});
}

async function waitForHero(cdp) {
	await cdp.send('Runtime.evaluate', {
		expression: `new Promise(resolve => {
			const ready = () => document.readyState === 'complete' &&
				document.querySelector('.heroActions');
			if (ready()) { resolve(true); return; }
			const timer = setInterval(() => {
				if (ready()) { clearInterval(timer); resolve(true); }
			}, 25);
		})`,
		awaitPromise: true,
		returnByValue: true
	});
}

async function evaluate(cdp, expression) {
	const response = await cdp.send('Runtime.evaluate', {
		expression,
		returnByValue: true
	});
	if (response.exceptionDetails) {
		throw new Error(response.exceptionDetails.text);
	}
	return response.result.value;
}

async function captureScreenshot(cdp, path) {
	const image = await cdp.send('Page.captureScreenshot', {
		format: 'png',
		fromSurface: true
	});
	await writeFile(path, image.data, 'base64');
}
