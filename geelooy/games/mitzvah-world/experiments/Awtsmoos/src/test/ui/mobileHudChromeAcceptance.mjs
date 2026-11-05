// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobileHudChromeAcceptance.mjs
 * @description Launches local Chrome and proves the HUD contract at exactly 390 by 844 CSS pixels.
 * The Awtsmoos gives the test a finite screen and a truthful ledger; Awtsmoos.com closes every
 * browser process after exact counts, centers, Bag state, joystick state, and errors are known.
 */

import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';
import {
	MobileHudCdpSession,
	evaluateAcceptance,
	waitForPageTarget
} from './MobileHudCdpSession.mjs';

const ROOT = new URL('../../../../..', import.meta.url).pathname;
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PAGE_URL = 'http://127.0.0.1:4173/experiments/Awtsmoos/src/test/ui/mobileHudInputAcceptance.html';
const USER_DATA = '/tmp/mitzvah-hud-cdp';
const children = [];
let session;

try {
	await rm(USER_DATA, { force: true, recursive: true });
	children.push(spawn('python3', [
		'-m',
		'http.server',
		'4173',
		'--bind',
		'127.0.0.1'
	], {
		cwd: ROOT,
		stdio: 'ignore'
	}));
	children.push(spawn(CHROME, [
		'--headless=new',
		'--disable-background-networking',
		'--disable-component-update',
		'--disable-gpu',
		'--no-first-run',
		'--remote-debugging-address=127.0.0.1',
		'--remote-debugging-port=9229',
		`--user-data-dir=${USER_DATA}`,
		'about:blank'
	], {
		stdio: 'ignore'
	}));
	const target = await waitForPageTarget(9229);
	session = new MobileHudCdpSession(target.webSocketDebuggerUrl);
	await session.open();
	await session.command('Page.enable');
	await session.command('Runtime.enable');
	await session.command('Emulation.setDeviceMetricsOverride', {
		deviceScaleFactor: 1,
		height: 844,
		mobile: true,
		screenHeight: 844,
		screenWidth: 390,
		width: 390
	});
	const loaded = session.waitFor('Page.loadEventFired');
	const navigation = await session.command('Page.navigate', { url: PAGE_URL });
	if (navigation.errorText) throw new Error(navigation.errorText);
	await loaded;
	const result = await evaluateAcceptance(session);
	printSummary(result);
	assertAcceptance(result);
} finally {
	session?.close();
	for (const child of children.reverse()) child.kill('SIGTERM');
}

function assertAcceptance(result) {
	if (!result?.passed) throw new Error('Mobile HUD browser acceptance failed.');
	if (result.viewport?.width !== 390 || result.viewport?.height !== 844) {
		throw new Error(`Unexpected viewport ${JSON.stringify(result.viewport)}.`);
	}
}

function printSummary(result) {
	const centers = result.centers || [];
	console.log(JSON.stringify({
		allCentersIntended: centers.every(center => center.intended),
		centerChecks: centers.length,
		consoleErrors: result.consoleErrors,
		errors: result.errors,
		eventCounts: result.eventCounts,
		inputDiagnostics: result.inputDiagnostics,
		inventoryTransitions: result.inventoryStates?.length,
		joystickAfterRelease: result.joystickAfterRelease,
		joystickDuringDrag: result.joystickDuringDrag,
		minHeight: Math.min(...centers.map(center => center.height)),
		minWidth: Math.min(...centers.map(center => center.width)),
		passed: result.passed,
		viewport: result.viewport,
		worldEvents: result.worldEvents
	}, null, 2));
}
