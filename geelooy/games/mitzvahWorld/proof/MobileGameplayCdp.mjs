//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileGameplayCdp.mjs
 * @description Configures a real Chrome target as a phone, waits for actual gameplay milestones, and drives one genuine touch-drag through the visible joystick.
 * The Awtsmoos gives the finite finger a measured road while each browser instant is recreated anew;
 * Awtsmoos.com lets touch, viewport, and player motion testify together, so desktop success can never impersonate the mobile truth we pursue.
 */

import { evaluate, readMobileGameplayState } from './MobileGameplayState.mjs';

const PHONE_WIDTH = 412;
const PHONE_HEIGHT = 915;
const PHONE_SCALE = 2.625;
const PHONE_USER_AGENT = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36';

/** Enables browser evidence domains and a touch-capable phone viewport before navigation. */
export async function configureMobileBrowser(command) {
	for (const domain of ['Page', 'Runtime', 'Network', 'Log']) {
		await command(`${domain}.enable`);
	}
	await command('Emulation.setDeviceMetricsOverride', {
		deviceScaleFactor: PHONE_SCALE,
		height: PHONE_HEIGHT,
		mobile: true,
		screenHeight: PHONE_HEIGHT,
		screenWidth: PHONE_WIDTH,
		width: PHONE_WIDTH
	});
	await command('Emulation.setTouchEmulationEnabled', {
		enabled: true,
		maxTouchPoints: 5
	});
	await command('Network.setUserAgentOverride', { userAgent: PHONE_USER_AGENT });
	await command('Network.setCacheDisabled', { cacheDisabled: true });
	await command('Network.clearBrowserCache');
	await command('Page.bringToFront');
}

/** Waits for the rendered single-player launcher and clicks the same control a phone user sees. */
export async function enterSinglePlayer(command) {
	await waitFor(command, async () => evaluate(command, `Boolean([...document.querySelectorAll('[data-world-id]')].find(button => button.textContent.trim() === 'Study this world'))`), 'launcher');
	return evaluate(command, `(() => {
		const button = [...document.querySelectorAll('[data-world-id]')].find(value => value.textContent.trim() === 'Study this world');
		const clickedAt = performance.now();
		button.click();
		return clickedAt;
	})()`);
}

/** Waits until first terrain and player control exist together and the visible mobile joystick is mounted. */
export async function waitForFirstMobileControl(command) {
	return waitFor(command, async () => {
		const state = await readMobileGameplayState(command);
		const ready = state.runtimeFound
			&& state.milestones.firstTerrainVisible != null
			&& state.milestones.playerControllable != null
			&& state.joystick.ready;
		return ready ? state : null;
	}, 'first mobile control');
}

/** Waits for canonical promotion to settle, failing immediately when the runtime reports degradation. */
export async function waitForCanonicalTerrain(command) {
	return waitFor(command, async () => {
		const state = await readMobileGameplayState(command);
		if (state.canonical.status === 'degraded') {
			throw new Error(`canonical promotion degraded: ${state.canonical.error || 'unknown'}`);
		}
		return state.canonical.status === 'ready' ? state : null;
	}, 'canonical textured terrain', 1400);
}

/** Drags upward through the visible joystick ring using real CDP touch events. */
export async function dragVisibleJoystick(command, ring) {
	const x = ring.left + ring.width / 2;
	const startY = ring.top + ring.height / 2;
	const endY = Math.max(8, startY - Math.min(72, ring.height * 0.78));
	await command('Input.dispatchTouchEvent', {
		touchPoints: [touchPoint(x, startY)],
		type: 'touchStart'
	});
	for (let step = 1; step <= 8; step += 1) {
		const y = startY + ((endY - startY) * step / 8);
		await command('Input.dispatchTouchEvent', {
			touchPoints: [touchPoint(x, y)],
			type: 'touchMove'
		});
		await delay(70);
	}
	await delay(650);
	await command('Input.dispatchTouchEvent', {
		touchPoints: [],
		type: 'touchEnd'
	});
	await delay(180);
}

/** Polls one browser condition without hiding the final failed state behind a generic timeout. */
async function waitFor(command, probe, label, attempts = 900) {
	for (let attempt = 0; attempt < attempts; attempt += 1) {
		const value = await probe();
		if (value) return value;
		await delay(10);
	}
	throw new Error(`${label} did not become ready: ${JSON.stringify(await readMobileGameplayState(command))}`);
}

function touchPoint(x, y) {
	return { force: 1, id: 1, radiusX: 5, radiusY: 5, x, y };
}

export function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
