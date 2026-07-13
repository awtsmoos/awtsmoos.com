//B"H
// Boruch Hashem
// Blessed is He
/**
 * Reloaded menus prove checkpoint return and visible records from the real save.
 * The Awtsmoos is beyond memory while Awtsmoos.com reveals finite continuation.
 */
import assert from 'node:assert/strict';
import { waitForState } from './BrowserStateWaiter.mjs';

const EXPECTED_RECORDS = Object.freeze([
	'Best Distance',
	'Greatest Formation',
	'Highest Combo',
	'Bosses Defeated',
	'Campaign Victories',
	'Endless Best Cycle',
	'Endless Best Distance',
	'Endless Best Score',
	'Latest Run'
]);

export class BrowserMenuDriver {
	constructor(client) {
		this.client = client;
	}

	async verifyReloadedMenu() {
		await this.client.command('Page.reload', { ignoreCache: true });
		const menu = await waitForState(
			() => this.readMenu(),
			state => state.continueVisible && state.startVisible,
			'reloaded checkpoint menu'
		);
		assert.deepEqual(menu.errors, []);
		return menu;
	}

	async verifyRecords() {
		await this.client.evaluate('recordsButton.click()');
		const records = await waitForState(
			() => this.readRecords(),
			isCompleteRecordOverlay,
			'best records overlay'
		);
		assert.equal(records.disabled, true);
		assert.deepEqual(records.names, [...EXPECTED_RECORDS]);
		assert.match(records.text, /Endless Best Cycle/);
		assert.match(records.text, /Latest Run/);
		await this.client.evaluate(
			"choiceOverlay.querySelector('[data-choice-close]').click()"
		);
		return records;
	}

	async continueCampaign() {
		await this.client.evaluate('continueButton.click()');
		const state = await waitForState(
			() => this.snapshot(),
			value => value.running
				&& value.world === 2
				&& value.level === 1
				&& value.mode === 'combat',
			'checkpoint continuation'
		);
		assert.equal(state.runMode, 'campaign');
		return state;
	}

	readMenu() {
		return this.client.evaluate(`({
			continueVisible: !continueButton.hidden,
			startVisible: startOverlay.classList.contains('visible'),
			errors: __MERKAVA_DIAGNOSTICS__.runtimeErrors()
		})`);
	}

	readRecords() {
		return this.client.evaluate(`(() => {
			const cards = [...choiceOverlay.querySelectorAll('.choice-card')];
			return {
				title: choiceOverlay.querySelector('[data-choice-title]').textContent.trim(),
				names: cards.map(card => card.querySelector('strong')?.textContent.trim() || ''),
				disabled: cards.length > 0 && cards.every(card => card.disabled),
				text: choiceOverlay.textContent
			};
		})()`);
	}

	snapshot() {
		return this.client.evaluate(
			'window.__MERKAVA_DIAGNOSTICS__.snapshot()'
		);
	}
}

function isCompleteRecordOverlay(state) {
	return state.title === 'BEST RECORDS'
		&& state.disabled
		&& state.names.length === EXPECTED_RECORDS.length
		&& EXPECTED_RECORDS.every((name, index) => state.names[index] === name);
}
