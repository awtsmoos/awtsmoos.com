//B"H
// Boruch Hashem
// Blessed is He
/**
 * The browser proves Endless selection, rotation, pressure, checkpoint, and continuation.
 * The Awtsmoos is beyond repetition while Awtsmoos.com reveals the living cycle.
 */
import assert from 'node:assert/strict';
import { waitForState } from './BrowserStateWaiter.mjs';

export class BrowserEndlessDriver {
	constructor(client) {
		this.client = client;
	}

	async verify() {
		const menu = await this.verifyModeMenu();
		const started = await this.startEndless();
		const rotated = await this.rotateWorlds();
		const checkpoint = await this.saveCheckpoint();
		const continued = await this.reloadAndContinue();
		return { menu, started, rotated, checkpoint, continued };
	}

	async verifyModeMenu() {
		await this.client.evaluate("document.getElementById('modesButton').click()");
		const menu = await waitForState(
			() => this.client.evaluate(`({
				visible: document.getElementById('choiceOverlay').classList.contains('visible'),
				text: document.getElementById('choiceOverlay').textContent
			})`),
			state => state.visible,
			'Endless mode menu'
		);
		assert.match(menu.text, /Campaign/);
		assert.match(menu.text, /Endless/);
		await this.client.evaluate("document.querySelector('[data-choice-close]').click()");
		return menu;
	}

	async startEndless() {
		await this.client.evaluate(
			"window.__MERKAVA_DIAGNOSTICS__.startMode('endless')"
		);
		const state = await waitForState(
			() => this.details(),
			value => value.running && value.runMode === 'endless',
			'Endless run start'
		);
		assert.equal(state.endlessCycle, 1);
		assert.equal(state.endlessRules.speedMultiplier, 1);
		return state;
	}

	async rotateWorlds() {
		await this.client.evaluate(
			'window.__MERKAVA_DIAGNOSTICS__.completeWorldRotation()'
		);
		const state = await waitForState(
			() => this.details(),
			value => value.endlessCycle === 2 && value.world === 1,
			'Endless world rotation'
		);
		assert.equal(state.victory, false);
		assert.ok(state.endlessRules.speedMultiplier > 1);
		assert.ok(state.endlessRules.rewardMultiplier > 1);
		return state;
	}

	async saveCheckpoint() {
		const checkpoint = await this.client.evaluate(
			'window.__MERKAVA_DIAGNOSTICS__.checkpoint()'
		);
		assert.equal(checkpoint.runMode, 'endless');
		assert.equal(checkpoint.endlessCycle, 2);
		return checkpoint;
	}

	async reloadAndContinue() {
		await this.client.command('Page.reload', { ignoreCache: true });
		await waitForState(
			() => this.client.evaluate('Boolean(window.__MERKAVA_DIAGNOSTICS__)'),
			Boolean,
			'Endless reload boot'
		);
		await this.client.evaluate(
			'window.__MERKAVA_DIAGNOSTICS__.continueRun()'
		);
		const state = await waitForState(
			() => this.details(),
			value => value.running && value.runMode === 'endless',
			'Endless checkpoint continuation'
		);
		assert.equal(state.endlessCycle, 2);
		assert.deepEqual(state.runtimeErrors, []);
		return state;
	}

	details() {
		return this.client.evaluate('window.__MERKAVA_DIAGNOSTICS__.details()');
	}
}
