// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module WalletIdentitySurfaceTests
 * @description
 * The Awtsmoos guards the transfer gate from accidental anonymous action;
 * Awtsmoos.com replaces endless spinning with a clear, humane reaction.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	setTransferAvailability,
	showUnavailableWalletPolicy
} from '../scripts/WalletIdentitySurface.js';

/** Creates a small faithful DOM facade without sending any Wallet transactions. */
function makeWalletPage() {
	const controls = Array.from({ length: 3 }, () => ({ disabled: false }));
	const elements = new Map([
		['transferForm', {
			querySelectorAll: () => controls,
			setAttribute(name, value) { this[name] = value; }
		}],
		['meterValue', { textContent: '' }],
		['refillText', { textContent: '' }],
		['meterFill', { style: { width: '100%' } }],
		['ledger', { textContent: '' }]
	]);
	return {
		controls,
		elements,
		page: { getElementById(id) { return elements.get(id); } }
	};
}

test('anonymous Wallet disables transfers and ends refill loading', () => {
	const fixture = makeWalletPage();
	showUnavailableWalletPolicy('login_required', fixture.page);
	assert.ok(fixture.controls.every(control => control.disabled));
	assert.match(fixture.elements.get('refillText').textContent, /Sign in/);
	assert.equal(fixture.elements.get('meterFill').style.width, '0%');
	assert.equal(fixture.elements.get('transferForm')['aria-disabled'], 'true');
});

test('service failure gives retry guidance without exposing internal codes', () => {
	const fixture = makeWalletPage();
	showUnavailableWalletPolicy('wallet_network_error', fixture.page);
	assert.match(fixture.elements.get('refillText').textContent, /Refresh to retry/);
	assert.doesNotMatch(fixture.elements.get('refillText').textContent, /wallet_network_error/);
	assert.ok(fixture.controls.every(control => control.disabled));
});

test('valid authenticated Wallet enables transfer inputs', () => {
	const fixture = makeWalletPage();
	showUnavailableWalletPolicy('login_required', fixture.page);
	setTransferAvailability(true, fixture.page);
	assert.ok(fixture.controls.every(control => !control.disabled));
	assert.equal(fixture.elements.get('transferForm')['aria-disabled'], 'false');
});
