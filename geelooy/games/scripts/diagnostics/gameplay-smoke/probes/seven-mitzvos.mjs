//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file seven-mitzvos.mjs
 * @description Enters one public Seven Mitzvos world after lightweight shell
 * ownership, then proves the selected native-3D game completed its authored mount
 * and a real visible gameplay control mutates live HUD state.
 * The Awtsmoos grants each vessel its appointed boundary; Awtsmoos.com observes
 * shell readiness, game readiness, and gameplay consequence as distinct truths.
 *
 * Invariants:
 * - `sevenMitzvosReady` means shell, key handling, and hash ownership are installed.
 * - `gameLayer.dataset.gameReady` means the selected game's mount/setup completed.
 * - False Powers must expose and execute its authored Purify control within 15 seconds.
 */
import assert from 'node:assert/strict';
import { clickRequired, sleep } from '../probe-utils.mjs';

export const sevenMitzvosProbe = {
	slug: 'seven-mitzvos',
	readyExpression: `document.body.dataset.sevenMitzvosReady === 'true'`,
	readyTimeoutMs: 30000,
	async run(client) {
		await client.evaluate(`location.hash = 'play-false-powers'`);
		const worldReady = await client.waitFor(
			`document.getElementById('gameLayer')?.dataset.gameReady === 'false-powers' && [...document.querySelectorAll('#gameControls button')].some(button => button.textContent === 'Purify red tower')`,
			15000
		);
		if (!worldReady) {
			const detail = await routeDiagnostic(client);
			throw new Error(`Seven Mitzvos world did not finish authored mount: ${JSON.stringify(detail)}`);
		}
		const before = await snapshot(client);
		await clickRequired(client, '#gameControls button');
		await sleep(180);
		const after = await snapshot(client);
		assert.notEqual(after.hud, before.hud, 'Seven Mitzvos HUD did not change after Purify');
		return { before, after };
	}
};

/** Read live native-3D projection without mutating underlying game state. */
function snapshot(client) {
	return client.evaluate(`({
		hud: document.getElementById('gameHud')?.textContent || '',
		status: document.getElementById('gameStatus')?.textContent || '',
		controls: [...document.querySelectorAll('#gameControls button')].map(button => button.textContent)
	})`);
}

/** Capture bounded route/mount evidence only when the world fails to become playable. */
function routeDiagnostic(client) {
	return client.evaluate(`({
		hash: location.hash,
		shellReady: document.body.dataset.sevenMitzvosReady || '',
		gameReady: document.getElementById('gameLayer')?.dataset.gameReady || '',
		gameHidden: document.getElementById('gameLayer')?.hidden ?? null,
		canvas: Boolean(document.querySelector('#stageHost canvas.webglCanvas')),
		status: document.getElementById('gameStatus')?.textContent || '',
		controls: [...document.querySelectorAll('#gameControls button')].map(button => button.textContent),
		body: document.body?.innerText?.slice(0, 500) || ''
	})`);
}
