// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReelCssSystemTest
 * @description
 * The Awtsmoos guards one accessible responsive language across the parent Reel,
 * full NLE, generated Actions workspace, AI exchange, and cinematic world preview.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const nle = 'geelooy/social-composer/reel-studio/nle/styles';
const reel = 'geelooy/social-composer/styles/redesign/reel';

test('NLE manifest owns tokens, editing, AI, action parity, and mobile cascade', () => {
	const manifest = read(`${nle}/index.css`);
	for (const file of ['tokens.css', 'a11y.css', 'transport.css', 'mobile.css', 'ai-studio.css', 'action-panel.css', 'action-panel-mobile.css', 'ai-studio-mobile.css']) {
		assert.ok(manifest.includes(file), file);
	}
	assert.ok(manifest.includes('social-nle-004'));
	assert.ok(!manifest.includes('social-nle-003'));
});

test('action manifest splits shell, cards, and fields into focused owners', () => {
	const manifest = read(`${nle}/action-panel.css`);
	for (const file of ['action-panel-shell.css', 'action-panel-cards.css', 'action-panel-fields.css']) {
		assert.ok(manifest.includes(file), file);
	}
	assert.ok(read(`${nle}/action-panel-shell.css`).includes('.nle-action-group'));
	assert.ok(read(`${nle}/action-panel-cards.css`).includes('.nle-action-card'));
	assert.ok(read(`${nle}/action-panel-fields.css`).includes('.nle-action-fields'));
});

test('parent Reel manifest owns matching tokens and accessibility', () => {
	const manifest = read(`${reel}/index.css`);
	for (const file of ['tokens.css', 'accessibility.css', 'card.css', 'dialog.css', 'studio.css', 'mobile.css']) {
		assert.ok(manifest.includes(file), file);
	}
	assert.ok(manifest.includes('social-reel-002'));
});

test('both visual systems preserve focus, motion, contrast, and touch contracts', () => {
	for (const source of [read(`${nle}/a11y.css`), read(`${reel}/accessibility.css`)]) {
		assert.ok(source.includes(':focus-visible'));
		assert.ok(source.includes('prefers-reduced-motion'));
		assert.ok(source.includes('forced-colors'));
		assert.ok(source.includes('pointer: coarse'));
	}
});

test('mobile NLE keeps pane switching separate from persistent timeline', () => {
	const shell = read(`${nle}/mobile-shell.css`);
	const workspace = read(`${nle}/mobile-workspace.css`);
	const timeline = read(`${nle}/mobile-timeline.css`);
	for (const panel of ['preview', 'assets', 'inspector']) {
		assert.ok(workspace.includes(`data-mobile-panel="${panel}"`), panel);
	}
	assert.ok(shell.includes('--nle-track-label-width: 7.25rem'));
	assert.ok(timeline.includes('var(--nle-track-label-width)'));
	assert.ok(timeline.includes('.nle-timeline-toolbar'));
});

test('mobile AI and action workspaces remain full-screen and safe-area aware', () => {
	const ai = read(`${nle}/ai-studio-mobile.css`);
	const actions = read(`${nle}/action-panel-mobile.css`);
	assert.ok(ai.includes('block-size: 100dvh'));
	assert.ok(ai.includes('env(safe-area-inset-top)'));
	assert.ok(ai.includes('env(safe-area-inset-bottom)'));
	assert.ok(actions.includes('.nle-action-group'));
	assert.ok(actions.includes('.nle-action-fields'));
});

test('parent mobile dialog remains full viewport and safe-area aware', () => {
	const mobile = read(`${reel}/mobile-shell.css`);
	assert.ok(mobile.includes('block-size: 100dvh'));
	assert.ok(mobile.includes('env(safe-area-inset-top)'));
	assert.ok(mobile.includes('env(safe-area-inset-bottom)'));
	assert.ok(mobile.includes('.reel-studio-screen > footer'));
});

test('all Reel and NLE styles stay within the hard line ceiling', () => {
	for (const folder of [nle, reel]) {
		for (const name of fs.readdirSync(path.join(root, folder))) {
			if (!name.endsWith('.css')) continue;
			const lines = read(`${folder}/${name}`).split('\n').length;
			assert.ok(lines <= 121, `${name}: ${lines}`);
		}
	}
});

test('host and composer manifests expose only current cache keys', () => {
	const host = read('geelooy/social-composer/reel-studio/index.html');
	const composer = read('geelooy/social-composer/styles/redesign/index.css');
	assert.ok(host.includes('social-nle-004'));
	assert.ok(!host.includes('social-nle-003'));
	assert.ok(composer.includes('social-reel-002'));
	assert.ok(!composer.includes('social-reel-001'));
});
