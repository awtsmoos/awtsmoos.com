// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplayTraversalProof.mjs
 * @description Drives real walking, sprinting, turning, reversals, and frame sampling through one finite Chrome gameplay session.
 * The Awtsmoos carries the traveler across changing ground while every frame is born anew;
 * Awtsmoos.com watches motion, streaming, and cadence together, so the measured Valley speaks what the living browser actually knew.
 */

import { createCdpProofSession } from './CdpProofSession.mjs';

const CDP_PORT = Number(process.env.MITZVAH_WORLD_CDP_PORT || 9444);
const BASE_URL = process.env.MITZVAH_WORLD_PROOF_BASE || 'http://127.0.0.1:8904';
const session = await createCdpProofSession(CDP_PORT);

try {
	const command = session.command;
	await preparePage(command);
	await waitForLauncher(command);
	await evaluate(command, `([...document.querySelectorAll('[data-world-id]')].find(button => button.textContent.trim() === 'Study this world')).click()`);
	await waitForReady(command);
	const before = await readRuntime(command);
	await hold(command, [['w', 'KeyW', 87]], 1800);
	await hold(command, [['Shift', 'ShiftLeft', 16], ['w', 'KeyW', 87]], 2600);
	await hold(command, [['a', 'KeyA', 65], ['w', 'KeyW', 87]], 1200);
	await hold(command, [['d', 'KeyD', 68], ['w', 'KeyW', 87]], 1200);
	for (let index = 0; index < 6; index += 1) {
		await hold(command, [[index % 2 ? 's' : 'w', index % 2 ? 'KeyS' : 'KeyW', index % 2 ? 83 : 87]], 220);
	}
	const after = await readRuntime(command);
	const frame = await sampleFrames(command, 180);
	const displacement = Math.hypot(after.state.x - before.state.x, after.state.z - before.state.z);
	const result = {
		displacement,
		before: before.state,
		after: after.state,
		lastFrameError: after.lastFrameError,
		chunk: after.chunk,
		transitionStats: after.transitionStats,
		frame,
		networkErrors: session.networkErrors
	};
	console.log(JSON.stringify(result, null, 2));
	if (!(displacement > 5) || after.lastFrameError || session.networkErrors.length) process.exitCode = 1;
} finally {
	await session.close();
}

/** Prepares one cache-cold real page through the production-style overlay. */
async function preparePage(command) {
	await command('Page.enable');
	await command('Runtime.enable');
	await command('Network.enable');
	await command('Network.setCacheDisabled', { cacheDisabled: true });
	await command('Network.clearBrowserCache');
	await command('Page.navigate', { url: `${BASE_URL}/games/mitzvahWorld/index.html` });
}

/** Waits for the real single-player launcher button without guessing a route. */
async function waitForLauncher(command) {
	for (let attempt = 0; attempt < 800; attempt += 1) {
		if (await evaluate(command, `Boolean([...document.querySelectorAll('[data-world-id]')].find(button => button.textContent.trim() === 'Study this world'))`)) return;
		await delay(10);
	}
	throw new Error('Launcher did not become ready.');
}

/** Waits until the real production milestones prove visible terrain and control. */
async function waitForReady(command) {
	for (let attempt = 0; attempt < 800; attempt += 1) {
		const state = await readRuntime(command);
		if (state.ready && state.state) return;
		await delay(10);
	}
	throw new Error('Gameplay did not become ready.');
}

/** Reads only movement, streaming, and failure evidence from the active runtime. */
async function readRuntime(command) {
	return evaluate(command, `(() => { let runtime = null; for (const key of Object.keys(window)) { try { const value = window[key]; if (value && typeof value === 'object' && value.state && value.bus && value.input) { runtime = value; break; } } catch {} } const milestones = window.AwtsmoosMitzvahWorldStartup?.milestones || {}; return { ready: Boolean(milestones.firstTerrainVisible && milestones.playerControllable), state: runtime?.state ? { x: runtime.state.x, y: runtime.state.y, z: runtime.state.z, facing: runtime.state.facing } : null, lastFrameError: runtime?.lastFrameError || null, chunk: runtime?.chunkRuntime?.diagnostics?.() || null, transitionStats: runtime?.chunkRuntime?.registry?.transitionQueue?.stats || null }; })()`);
}

/** Sends a real simultaneous key chord for one measured traversal interval. */
async function hold(command, keys, milliseconds) {
	for (const [key, code, keyCode] of keys) await command('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
	await delay(milliseconds);
	for (const [key, code, keyCode] of [...keys].reverse()) await command('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
}

/** Samples display cadence without introducing another animation loop into gameplay. */
async function sampleFrames(command, count) {
	return evaluate(command, `new Promise(resolve => { const rows = []; let previous = null; const step = time => { if (previous !== null) rows.push(time - previous); previous = time; if (rows.length >= ${count}) { const sorted = [...rows].sort((a,b) => a-b); resolve({ average: rows.reduce((a,b) => a+b,0)/rows.length, p95: sorted[Math.floor(sorted.length*0.95)], max: sorted[sorted.length-1], under16_7: rows.filter(value => value <= 16.7).length/rows.length }); return; } requestAnimationFrame(step); }; requestAnimationFrame(step); })`);
}

async function evaluate(command, expression) {
	const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
	return result.result.value;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
