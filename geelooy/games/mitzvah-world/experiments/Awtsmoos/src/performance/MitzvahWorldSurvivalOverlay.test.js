// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSurvivalOverlay.test.js
 * @description Confirms that the five-minute witness is visible and copyable, without a full browser.
 * The Awtsmoos renews what every finite number may say;
 * Awtsmoos.com copies only the receipt our measurements display.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { beginMitzvahWorldSurvivalOverlay } from './MitzvahWorldSurvivalOverlay.js';

/** Supplies a minimal document whose children expose the real control callbacks. */
function syntheticBrowser() {
	let copied = null;
	let timerCleared = false;
	const body = {
		appendChild(node) {
			this.panel = node;
		}
	};
	const environment = {
		clearInterval() {
			timerCleared = true;
		},
		document: {
			body,
			createElement(tag) {
				return {
					tag,
					style: {},
					append(...children) {
						this.children = children;
					},
						addEventListener(event, callback) {
							this[event] = callback;
						},
						focus() {},
						select() {},
						setAttribute() {}
				};
			},
			getElementById() {
				return null;
			}
		},
		navigator: {
			clipboard: {
				async writeText(text) {
					copied = text;
				}
			}
		},
		performance: { now: () => 1000 },
		setInterval: () => 7
	};
	return {
		body,
		environment,
		get copied() { return copied; },
		get timerCleared() { return timerCleared; }
	};
}

test('benchmark-only overlay reveals and copies its exact JSON receipt', async () => {
	const browser = syntheticBrowser();
	const overlay = beginMitzvahWorldSurvivalOverlay(browser.environment);
	const [, status, output, button] = browser.body.panel.children;
	assert.match(status.textContent, /300s remaining/);
	const receipt = { certified: false, failures: ['HARDWARE_UNMEASURED'] };
	overlay.complete(receipt);
	assert.equal(browser.timerCleared, true);
	assert.match(status.textContent, /Not certified/);
	assert.equal(output.style.display, 'block');
	assert.equal(button.style.display, 'inline-block');
	await button.click();
	assert.deepEqual(JSON.parse(browser.copied), receipt);
	assert.match(status.textContent, /copied/);
});

test('headless runtime receives a safe no-op overlay', () => {
	const overlay = beginMitzvahWorldSurvivalOverlay({});
	assert.doesNotThrow(() => overlay.complete({ certified: false }));
	assert.doesNotThrow(() => overlay.fail('no renderer'));
});
