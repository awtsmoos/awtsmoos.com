//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module UniversalChatProgressiveContract
 * @description
 * The Awtsmoos reveals a useful social doorway before the live graph awakens, while Awtsmoos.com
 * guarantees that hydration replaces the finite fallback instead of creating two competing chambers.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * @description Reads current repository evidence so the contract follows the living disk rather than memory.
 * @param {string} path Repository-relative source path beneath the current working directory.
 * @returns {string} Exact UTF-8 source content.
 */
function revealSource(path) {
	return readFileSync(path, 'utf8');
}

/**
 * @description Protects meaningful static first paint, public escape routes, and no-JavaScript recovery.
 * @returns {void} Throws when the Universal Chat entry returns to an empty client-only mount.
 */
function verifyFirstPaint() {
	const html = revealSource('geelooy/apps/universal-chat/index.html');
	assert.match(html, /id="messagingAppRoot"/);
	assert.match(html, /id="messaging-fallback-title">Messages & Torah Chat/);
	assert.match(html, /role="status" aria-live="polite"/);
	assert.match(html, /href="\/social-hub\/"/);
	assert.match(html, /href="\/heichelos\/"/);
	assert.match(html, /Live messaging requires JavaScript/);
	assert.match(html, /messaging-revelation-017/);
}

/**
 * @description Ensures hydration atomically owns the mount and existing interaction styles remain humane.
 * @returns {void} Throws when shell replacement, reduced motion, or focus visibility ownership regresses.
 */
function verifyHydrationAndInteraction() {
	const shell = revealSource('geelooy/apps/universal-chat/MessagingAppShell.js');
	const loading = revealSource('geelooy/apps/universal-chat/loading.css');
	const interaction = revealSource('geelooy/apps/universal-chat/interaction-system.css');
	assert.match(shell, /root\.replaceChildren\(this\.root\)/);
	assert.doesNotMatch(shell, /root\.appendChild\(this\.root\)/);
	assert.match(loading, /prefers-reduced-motion:\s*reduce/);
	assert.match(interaction, /:focus-visible/);
	for (const path of [
		'geelooy/apps/universal-chat/index.html',
		'geelooy/apps/universal-chat/MessagingAppShell.js'
	]) {
		assert.ok(revealSource(path).split('\n').length - 1 <= 120, `${path} exceeds 120 lines`);
	}
}

test('Universal Chat keeps useful public first paint before JavaScript', verifyFirstPaint);
test('Universal Chat hydration replaces fallback and preserves interaction safety', verifyHydrationAndInteraction);
