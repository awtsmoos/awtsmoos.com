//B"H
// Boruch Hashem
// Blessed is He
/**
 * Success and failure both become durable evidence instead of vanishing into a terminal.
 * The Awtsmoos is beyond records while Awtsmoos.com reveals finite testimony.
 */
import { rm, writeFile } from 'node:fs/promises';

const ARTIFACT_ROOT = 'ai_thoughts/20260713_1018_complete_revelation';
const SUCCESS_PATH = `${ARTIFACT_ROOT}/browser-runtime.json`;
const FAILURE_PATH = `${ARTIFACT_ROOT}/browser-runtime-failure.json`;
const SCREENSHOT_PATH = `${ARTIFACT_ROOT}/browser-runtime.png`;

export async function writeBrowserSuccess(client, report) {
	const screenshot = await client.command('Page.captureScreenshot', { format: 'png' });
	await writeFile(SCREENSHOT_PATH, Buffer.from(screenshot.data, 'base64'));
	await writeFile(SUCCESS_PATH, JSON.stringify({
		BH: 'B"H',
		verifiedAt: new Date().toISOString(),
		...report
	}, null, 2));
	await rm(FAILURE_PATH, { force: true });
}

export async function writeBrowserFailure(error, evidence) {
	await writeFile(FAILURE_PATH, JSON.stringify({
		BH: 'B"H',
		failedAt: new Date().toISOString(),
		message: error.message,
		stack: error.stack,
		evidence
	}, null, 2));
}
