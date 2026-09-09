// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { NachashPauseState } from '../nachash/js/runtime/pause-state.js';
import { loadNachashPreferences, recordNachashScore } from '../nachash/js/runtime/persistence.js';
import { NachashResultReporter } from '../nachash/js/runtime/result.js';

const ROOT = new URL('../nachash/', import.meta.url);

/** Verify independent pause reasons cannot accidentally resume each other. */
test('Nachash pause reasons compose user, settings, and background suspension', () => {
const state = new NachashPauseState();
assert.equal(state.set('user', true).paused, true);
assert.equal(state.set('settings', true).changed, false);
assert.equal(state.set('settings', false).paused, true);
assert.equal(state.has('user'), true);
assert.equal(state.set('user', false).paused, false);
});

/** Verify malformed persistence never blocks play and high scores only move upward. */
test('Nachash persistence survives corrupt settings and preserves the highest score', () => {
const values = new Map([['nachashSettingsV2', '{broken'], ['tikkunHighScore', '70']]);
const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
const loaded = loadNachashPreferences(storage);
assert.deepEqual(loaded.settings, { muted: false, minimap: true, reducedEffects: false });
assert.equal(recordNachashScore(42, storage), 70);
assert.equal(recordNachashScore(125.9, storage), 125);
});

/** Verify retries or duplicate terminal messages cannot submit one run twice. */
test('Nachash result reporter accepts one completed result per run id', () => {
const reports = [];
const reporter = new NachashResultReporter({ AwtsmoosGames: { reportResult: result => reports.push(result) } });
const result = { runId: 'nachash:test:1', score: 900, elapsedMs: 4000, outcome: 'defeat', completed: true };
assert.equal(reporter.report(result), true);
assert.equal(reporter.report(result), false);
assert.equal(reports.length, 1);
});

/** Verify worker pause/settings commands and deterministic modular loading remain explicit. */
test('Nachash worker doorway routes pause, resume, settings, and focused runtime modules', async () => {
const worker = await text('worker.js');
const messages = await text('worker-runtime/messages.js');
for (const module of ['state.js', 'render.js', 'collisions.js', 'update.js', 'lifecycle.js', 'messages.js']) {
	assert.match(worker, new RegExp(`worker-runtime/${module.replace('.', '\\.')}`));
}
for (const command of ["case 'pause'", "case 'resume'", "case 'settings'"]) assert.match(messages, new RegExp(command));
});

/** Verify the discoverable UI replaces hidden gestures and external presentation dependencies. */
test('Nachash markup exposes explicit gameplay and recovery controls', async () => {
const html = await text('index.html');
for (const id of ['boost-button', 'pause-button', 'settings-button', 'retry-button', 'fault-retry-button']) assert.match(html, new RegExp(`id="${id}"`));
assert.doesNotMatch(html, /fonts\.googleapis\.com|user-scalable\s*=\s*no/i);
assert.match(html, /type="module" src="\.\/main\.js/);
});

/** Enforce the live source law and prevent reintroduction of global mouse/touch plumbing. */
test('Nachash live modules remain documented, tabbed, readable, and below 120 lines', async () => {
const files = [
	'main.js', 'worker.js', 'js/runtime/audio.js', 'js/runtime/persistence.js', 'js/runtime/result.js',
	'js/runtime/pause-state.js', 'js/runtime/worker-client.js', 'js/runtime/session.js',
	'js/input/actions.js', 'js/input/keyboard.js', 'js/input/pointer.js', 'js/ui/view.js',
	'worker-runtime/state.js', 'worker-runtime/render.js', 'worker-runtime/collisions.js',
	'worker-runtime/update.js', 'worker-runtime/lifecycle.js', 'worker-runtime/messages.js'
];
for (const file of files) {
	const source = await text(file);
	assert.ok(source.split(/\r?\n/).length <= 120, `${file} exceeds 120 lines`);
	assert.match(source, /B"H/);
	assert.match(source, /\/\*\*|Architectural|Invariants|@description/);
	assert.equal(source.split(/\r?\n/).filter(line => /^ +[^\s*/]/.test(line)).length, 0, `${file} contains space-indented code`);
}
const main = await text('main.js');
assert.doesNotMatch(main, /touchstart|touchmove|mousedown|mousemove|console\.log/);
const pointer = await text('js/input/pointer.js');
assert.doesNotMatch(pointer, /window\.addEventListener\(['"]pointer/);
});

async function text(path) {
return readFile(new URL(path, ROOT), 'utf8');
}
