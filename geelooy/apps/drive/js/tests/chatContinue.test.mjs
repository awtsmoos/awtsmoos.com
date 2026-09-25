//B"H
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildContinuationPrompt, mountContinueButton } from '../chatContinue.js';

const INPUT = {
	chatPath: '/Chats/2026/09/20/design-the-invoice-flow',
	chatId: 'chat-1',
	title: 'Design the invoice flow',
	summary: 'Invoices go out on Fridays.'
};

test('prompt contains the absolute chat path', () => {
	const prompt = buildContinuationPrompt(INPUT);
	assert.match(prompt, /\/Chats\/2026\/09\/20\/design-the-invoice-flow/);
	assert.ok(!prompt.includes('./design'), 'no relative path fragments');
});

test('prompt contains the entity reference and file pointers', () => {
	const prompt = buildContinuationPrompt(INPUT);
	assert.match(prompt, /awts:\/\/entity\/chat\/chat-1/);
	assert.match(prompt, /transcript\.md/);
	assert.match(prompt, /summary\.md/);
	assert.match(prompt, /Design the invoice flow/);
});

test('prompt works without optional fields', () => {
	const prompt = buildContinuationPrompt({ chatPath: '/Chats/2026/09/20/x', chatId: 'x' });
	assert.match(prompt, /\/Chats\/2026\/09\/20\/x/);
	assert.match(prompt, /awts:\/\/entity\/chat\/x/);
});

test('prompt rejects non-absolute paths', () => {
	assert.throws(() => buildContinuationPrompt({ chatPath: 'Chats/x', chatId: 'x' }), /absolute \/Chats/);
	assert.throws(() => buildContinuationPrompt({ chatPath: '/drive/x', chatId: 'x' }), /absolute \/Chats/);
});

test('mountContinueButton: mounts and copies via clipboard', async () => {
	// Minimal DOM stub — no jsdom needed.
	const listeners = {};
	let copied = null;
	Object.defineProperty(globalThis, 'navigator', {
		value: { clipboard: { writeText: async (t) => { copied = t; } } },
		configurable: true
	});
	const container = {
		children: [],
		ownerDocument: null,
		appendChild(el) { this.children.push(el); return el; }
	};
	const button = {
		type: '', className: '', textContent: '',
		attrs: {},
		setAttribute(k, v) { this.attrs[k] = v; },
		addEventListener(name, fn) { listeners[name] = fn; }
	};
	const fakeDocument = { createElement: () => button };
	container.ownerDocument = fakeDocument;

	const mounted = mountContinueButton(container, INPUT);
	assert.equal(mounted, button);
	assert.equal(container.children.length, 1);
	assert.equal(button.textContent, 'Continue this chat');
	assert.equal(button.attrs['data-chat-path'], INPUT.chatPath);

	await listeners.click();
	assert.ok(copied.includes('/Chats/2026/09/20/design-the-invoice-flow'));
	assert.match(button.textContent, /copied/);

	delete globalThis.navigator;
});

test('mountContinueButton: rejects a non-element container', () => {
	assert.throws(() => mountContinueButton(null, INPUT), /must be a DOM element/);
});
