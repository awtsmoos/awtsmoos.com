//B"H
// Boruch Hashem
// Blessed is He
/**
 * Campaign routes, blessings, and checkpoints testify through observed browser states.
 * The Awtsmoos is beyond sequence while Awtsmoos.com reveals the playable journey.
 */
import assert from 'node:assert/strict';
import { waitForState } from './BrowserStateWaiter.mjs';

export class BrowserCampaignDriver {
	constructor(client) {
		this.client = client;
	}

	async completeBlessingLevel() {
		await this.advanceLevel();
		const route = await this.waitForChoice(
			state => state.mode === 'route' && state.choices === 3,
			'level route choice'
		);
		assert.match(route.title, /NEXT ROAD/);
		assert.equal(route.choices, 3);
		await this.clickChoice(0);
		const routed = await this.waitForSnapshot(
			state => state.mode === 'blessing' && state.routeStep === 1,
			'route consequence and blessing transition'
		);
		assert.equal(routed.routeHistory.length, 1);
		assert.equal(routed.routeModifier, routed.routeHistory[0]);
		const blessing = await this.waitForChoice(
			state => state.mode === 'blessing' && state.choices === 3,
			'level blessing choice'
		);
		assert.equal(blessing.choices, 3);
		await this.clickChoice(0);
		return this.waitForSnapshot(
			state => state.level === 2 && state.paused === false,
			'level two combat resume'
		);
	}

	async completeCheckpoint() {
		await this.client.evaluate(
			'window.__MERKAVA_DIAGNOSTICS__.grantPrutahs(1000)'
		);
		await this.advanceLevel();
		let choice = await this.waitForChoice(
			state => /MERKAVA COMMAND/.test(state.title) && state.choices === 3,
			'checkpoint command choice'
		);
		assert.match(choice.title, /MERKAVA COMMAND/);
		await this.clickChoice(1);
		choice = await this.waitForChoice(
			state => /CHECKPOINT SHRINE/.test(state.title),
			'checkpoint shrine choice'
		);
		assert.match(choice.title, /CHECKPOINT SHRINE/);
		await this.clickChoice(0);
		const purchased = await this.waitForSnapshot(
			state => state.prutahs < 1000,
			'checkpoint shrine purchase'
		);
		assert.ok(purchased.prutahs < 1000);
		await this.client.evaluate(
			"choiceOverlay.querySelector('[data-choice-close]').click()"
		);
		return this.waitForSnapshot(
			state => state.level === 3 && state.paused === false,
			'level three combat resume'
		);
	}

	advanceLevel() {
		return this.client.evaluate(
			'window.__MERKAVA_DIAGNOSTICS__.advanceLevel(220)'
		);
	}

	clickChoice(index) {
		return this.client.evaluate(
			`choiceOverlay.querySelectorAll('.choice-card')[${index}].click()`
		);
	}

	waitForChoice(isReady, description) {
		return waitForState(() => this.choiceState(), isReady, description);
	}

	waitForSnapshot(isReady, description) {
		return waitForState(() => this.snapshot(), isReady, description);
	}

	choiceState() {
		return this.client.evaluate(`({
			mode: __MERKAVA_DIAGNOSTICS__.snapshot().mode,
			title: choiceOverlay.querySelector('[data-choice-title]').textContent,
			choices: choiceOverlay.querySelectorAll('.choice-card').length
		})`);
	}

	snapshot() {
		return this.client.evaluate(
			'window.__MERKAVA_DIAGNOSTICS__.snapshot()'
		);
	}
}
