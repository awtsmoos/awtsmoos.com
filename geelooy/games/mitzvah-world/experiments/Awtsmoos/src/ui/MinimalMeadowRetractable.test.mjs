// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowRetractable } from './MinimalMeadowRetractable.js';

/**
 * @file MinimalMeadowRetractable.test.mjs
 * @description Round 7 regression (owner functionality sweep): the HUD and
 * Controls retract buttons were DEAD in the shipped game — the staged UI
 * components and the direct-play presentation each constructed a
 * MinimalMeadowRetractable for the same shell, the button gained two click
 * listeners, and every click toggled twice (live probe 2026-11-19: click
 * left dataset.collapsed and the label unchanged). Construction must be
 * idempotent per shell and one click must toggle exactly once.
 */

function fakeShell() {
	const listeners = new Map();
	const button = {
		textContent: '',
		attributes: {},
		addEventListener(type, fn) {
			if (!listeners.has(type)) listeners.set(type, []);
			listeners.get(type).push(fn);
		},
		removeEventListener(type, fn) {
			const list = listeners.get(type) || [];
			const index = list.indexOf(fn);
			if (index >= 0) list.splice(index, 1);
		},
		setAttribute(name, value) { this.attributes[name] = value; },
		click() { for (const fn of [...(listeners.get('click') || [])]) fn(); },
		listenerCount(type) { return (listeners.get(type) || []).length; }
	};
	const shell = {
		dataset: {},
		querySelector(selector) { return selector === '[data-retract-toggle]' ? button : null; }
	};
	return { shell, button };
}

test('two constructions on one shell yield ONE instance and ONE listener', () => {
	const { shell, button } = fakeShell();
	const first = new MinimalMeadowRetractable(shell, { label: 'HUD' });
	const second = new MinimalMeadowRetractable(shell, { label: 'HUD' });
	assert.equal(second, first, 'construction must be idempotent per shell');
	assert.equal(button.listenerCount('click'), 1, 'the toggle must carry exactly one click listener');
});

test('one click collapses exactly once; a second click expands', () => {
	const { shell, button } = fakeShell();
	new MinimalMeadowRetractable(shell, { label: 'HUD' });
	new MinimalMeadowRetractable(shell, { label: 'HUD' });
	button.click();
	assert.equal(shell.dataset.collapsed, 'true', 'one click must collapse the shell');
	assert.match(button.textContent, /＋/, 'collapsed toggle must show the expand glyph');
	assert.equal(button.attributes['aria-expanded'], 'false');
	button.click();
	assert.equal(shell.dataset.collapsed, 'false', 'second click must expand the shell');
	assert.equal(button.attributes['aria-expanded'], 'true');
});

test('destroy releases the shell so a fresh retractable can bind', () => {
	const { shell, button } = fakeShell();
	const first = new MinimalMeadowRetractable(shell, { label: 'Controls' });
	first.destroy();
	assert.equal(button.listenerCount('click'), 0);
	const second = new MinimalMeadowRetractable(shell, { label: 'Controls' });
	assert.notEqual(second, first);
	assert.equal(button.listenerCount('click'), 1);
});
