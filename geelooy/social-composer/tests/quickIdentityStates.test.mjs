// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module QuickIdentityStatesTests
 * @description Revelation fix (2026-11-26): the quick composer must never
 * present a dead "Choose an alias" dropdown. Contracts: signed-out shows
 * a sign-in CTA that returns to the composer; a stalled verification
 * surfaces a Retry; the picker is disabled while no verified alias
 * exists; the series player bounds its playlist fetch and offers Retry.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const read = p => readFileSync(new URL(p, import.meta.url), 'utf8');

test('quick identity wires a returning sign-in CTA', () => {
	const src = read('../js/quick/identity.js');
	assert.match(src, /login\.href='\/login\/\?return='/);
	assert.match(src, /encodeURIComponent\(location\.pathname\+location\.search\)/);
});

test('quick identity never leaves an enabled empty picker', () => {
	const src = read('../js/quick/identity.js');
	assert.match(src, /select\.disabled=out \|\| native\.disabled \|\| aliasCount\(\)===0/);
	assert.match(src, /Loading your aliases…/);
	assert.match(src, /identityRetry/);
	assert.match(src, /20000/);
	const markup = read('../js/quick/markup.js');
	assert.match(markup, /id="identityHelp"/);
	assert.match(markup, /class="signin-cta"/);
});

test('series player bounds the playlist fetch and surfaces retry', () => {
	const engine = read('../../heichelos/series-player.js');
	assert.match(engine, /AbortController/);
	assert.match(engine, /30000/);
	assert.match(engine, /data-role=.retry./);
	const panel = read('../../heichelos/series-player/panel.js');
	assert.match(panel, /data-role="retry"/);
	assert.match(panel, /handlers\.onRetry/);
});

test('heichel loader treats a failed sub-series read as a load failure', () => {
	const loader = read('../../heichelos/heichel/modules/navigator/source-loader.js');
	assert.match(loader, /subSeriesRaw === null/);
	const empty = read('../../heichelos/heichel/modules/living-path/empty-state-policy.js');
	assert.match(empty, /No teachings at this branch itself/);
});
