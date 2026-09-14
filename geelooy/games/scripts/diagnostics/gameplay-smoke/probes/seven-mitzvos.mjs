//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file seven-mitzvos.mjs
 * @description Enters one public Seven Mitzvos world route, then proves an actual
 * production gameplay control mutates the live world HUD/status.
 *
 * Invariants:
 * - Hash routing is setup only; gameplay proof comes from a visible control click.
 * - The probe accepts the current 3D False Powers implementation as canonical truth.
 * - A passing action must change HUD or status evidence from the mounted game.
 */
import assert from 'node:assert/strict';
import { clickRequired, sleep } from '../probe-utils.mjs';

export const sevenMitzvosProbe = {
	slug: 'seven-mitzvos',
	readyExpression: `Boolean(document.getElementById('worldHud') && document.getElementById('hubLayer'))`,
	readyTimeoutMs: 30000,
	async run(client) {
		await client.evaluate(`location.hash = 'play-false-powers'`);
		const worldReady = await client.waitFor(
			`!document.getElementById('gameLayer')?.hidden && document.querySelectorAll('#gameControls button').length > 0`,
			15000
		);
		if (!worldReady) {
			const detail = await routeDiagnostic(client);
			throw new Error(`Seven Mitzvos world did not become playable: ${JSON.stringify(detail)}`);
		}
		const before = await snapshot(client);
		await clickRequired(client, '#gameControls button');
		await sleep(180);
		const after = await snapshot(client);
		assert.notEqual(after.hud, before.hud, 'Seven Mitzvos HUD did not change after gameplay');
		return { before, after };
	}
};

/** Read live 3D game projection without touching its underlying state. */
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
		gameHidden: document.getElementById('gameLayer')?.hidden ?? null,
		status: document.getElementById('gameStatus')?.textContent || '',
		controls: [...document.querySelectorAll('#gameControls button')].map(button => button.textContent),
		body: document.body?.innerText?.slice(0, 500) || ''
	})`);
}
