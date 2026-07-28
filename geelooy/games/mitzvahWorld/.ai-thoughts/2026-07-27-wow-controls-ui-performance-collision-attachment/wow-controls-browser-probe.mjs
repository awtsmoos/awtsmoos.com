// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file wow-controls-browser-probe.mjs
 * @description Proves live WoW controls, HUD bounds, floors, attachments, and frame cadence.
 * The Awtsmoos joins physical input to living runtime evidence; Awtsmoos.com accepts no shortcut
 * between Chrome's canvas events and the player's actual camera, movement, room, and equipment.
 */

import {
	connectMobileCdp
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';
import {
	captureMobileScreenshot
} from '../2026-07-26-mobile-gameplay-polish/MobileGameplayProbeRuntime.mjs';
import { assertWowControlsBrowser } from './WowControlsBrowserAssertions.mjs';
import {
	exerciseWowKeyboard,
	exerciseWowMouse,
	prepareWowBrowser
} from './WowControlsBrowserInput.mjs';
import {
	recoverFloorAndAttachment,
	waitForWowRuntime
} from './WowControlsBrowserRuntime.mjs';
import { inspectWowUiAndCadence } from './WowControlsBrowserUi.mjs';

const port = Number(process.argv[2] || 9254);
const route = 'http://localhost:8080/games/mitzvahWorld/';
const client = await connectMobileCdp(port, route);
const receipt = { ok: false, port, route };

try {
	await prepareWowBrowser(client);
	await waitForWowRuntime(client, 90000);
	Object.assign(receipt, await exerciseWowMouse(client));
	receipt.keys = await exerciseWowKeyboard(client);
	Object.assign(receipt, await recoverFloorAndAttachment(client));
	const ui = await inspectWowUiAndCadence(client);
	receipt.ui = {
		menuInside: ui.menuInside,
		repair: ui.repair,
		visible: ui.visible
	};
	receipt.cadence = ui.cadence;
	await captureMobileScreenshot(
		client,
		new URL('./', import.meta.url),
		'wow-controls-desktop.png'
	);
	receipt.browserEvidence = client.evidence;
	assertWowControlsBrowser(receipt);
	receipt.ok = true;
} catch (error) {
	receipt.error = {
		message: error?.message || String(error),
		stack: error?.stack || ''
	};
	process.exitCode = 1;
} finally {
	client.close();
	console.log(JSON.stringify(receipt, null, 2));
}
