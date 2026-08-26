// B"H
// Boruch Hashem
// Blessed is He
import { delay } from '../CdpClient.mjs';

const DIRECTIONS = Object.freeze(['↑', '↓', '←', '→']);

/**
 * The Awtsmoos lets every direction, pause, and return become observable causation;
 * Awtsmoos.com proves the rescued Adventure answers both thumb and key instead of merely painting interaction.
 */
export const AdventureContract = Object.freeze({
	name: 'adventure',

	async observe(client) {
		return client.evaluate(`import('./js/app.js?v=adventure-002').then(module => module.adventureRuntime.snapshot())`);
	},

	async exercise({ client, interaction, pageBefore }) {
		const observations = { before: await this.observe(client), directions: {} };
		const usedControls = [];

		for (const symbol of DIRECTIONS) {
			const control = interaction.findControl(pageBefore, item => item.text === symbol);
			if (!control) {
				observations.directions[symbol] = null;
				continue;
			}
			const before = await this.observe(client);
			await interaction.holdRectangle(control.rect, 110);
			const after = await this.observe(client);
			observations.directions[symbol] = { before, after };
			usedControls.push(symbol);
		}

		const beforeKeyboard = await this.observe(client);
		await interaction.pressKey('ArrowRight', 'ArrowRight', 150);
		observations.afterKeyboard = await this.observe(client);
		observations.beforeKeyboard = beforeKeyboard;

		const pause = interaction.findControl(pageBefore, item => /^Pause$/i.test(item.text));
		if (pause) await interaction.clickRectangle(pause.rect);
		observations.afterPause = await this.observe(client);
		await delay(220);
		observations.afterPauseWait = await this.observe(client);
		if (pause) await interaction.clickRectangle(pause.rect);
		observations.afterResume = await this.observe(client);

		const restart = interaction.findControl(pageBefore, item => /^Restart$/i.test(item.text));
		if (restart) await interaction.clickRectangle(restart.rect);
		observations.afterRestart = await this.observe(client);
		observations.canvas = pageBefore.canvases[0] || null;

		return {
			primary: { kind: 'dpad', text: usedControls.join('') },
			keys: ['ArrowRight'],
			observations
		};
	},

	prove(observations) {
		const directionProofs = Object.values(observations.directions || {}).filter(Boolean).map(changedPosition);
		const allDirections = directionProofs.length === 4 && directionProofs.every(Boolean);
		const keyboardMoved = changedPosition({ before: observations.beforeKeyboard, after: observations.afterKeyboard });
		const paused = observations.afterPause?.status === 'paused';
		const frozen = observations.afterPauseWait?.frame === observations.afterPause?.frame;
		const resumed = observations.afterResume?.status === 'playing';
		const reset = isCleanRestart(observations.afterRestart);
		const canvas = observations.canvas;
		const framed = Boolean(canvas && canvas.width > 0 && canvas.height > 0 && canvas.bufferWidth === 640 && canvas.bufferHeight === 480);

		return {
			gameplayProven: allDirections && keyboardMoved && paused && frozen && resumed && reset && framed,
			allDirections, keyboardMoved, paused, frozen, resumed, reset, framed
		};
	}
});

function changedPosition(sample) {
	if (!sample?.before || !sample?.after) return false;
	return Math.abs(sample.after.playerX - sample.before.playerX) > 1
		|| Math.abs(sample.after.playerY - sample.before.playerY) > 1;
}

function isCleanRestart(snapshot) {
	return snapshot?.status === 'playing'
		&& snapshot.stageIndex === 0
		&& snapshot.score === 0
		&& snapshot.lives === 3
		&& snapshot.sparksRemaining === 3
		&& snapshot.playerX === 48
		&& snapshot.playerY === 64;
}
