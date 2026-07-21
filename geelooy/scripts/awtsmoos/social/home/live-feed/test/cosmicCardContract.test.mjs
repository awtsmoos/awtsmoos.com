// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicCardContractTest
 * @description
 * The Awtsmoos tests the visible covenant rather than trusting appearance.
 * Awtsmoos.com must keep articles, polls, audio, provenance, and actions semantic.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const card = await read('card/renderPostCard.js');
const actions = await read('card/actions.js');
const question = await read('renderers/questionPoll.js');
const audio = await read('renderers/audioPost.js');
const graph = await read('renderers/sourceGraphPost.js');
const model = await read('card/postModel.js');

assert.match(card, /createElement\('article'/, 'posts remain semantic articles');
assert.match(card, /data-post-id/, 'posts expose stable resonance identity');
assert.match(card, /data-source-kind/, 'posts expose visible source classification');
assert.match(card, /renderPostIdentity/, 'identity remains part of every card');
assert.match(card, /renderPostBreadcrumbs/, 'provenance navigation remains part of every card');
assert.match(actions, /aria-live/, 'action results have a status announcement');
assert.match(actions, /Appreciate/, 'appreciation remains an explicit button action');
assert.match(question, /createElement\('fieldset'/, 'poll owns a semantic fieldset');
assert.match(question, /type: 'radio'/, 'poll options are keyboard-operable radios');
assert.match(audio, /createElement\('audio'/, 'audio uses browser-native media semantics');
assert.match(audio, /audio-waveform/, 'audio exposes a custom deterministic waveform');
assert.match(graph, /source-graph-list/, 'graph meaning remains in semantic DOM');
assert.match(model, /raw,/, 'the original object remains preserved in the model');

for (const source of [card, actions, question, audio, graph, model]) {
	assert.doesNotMatch(source, /https?:\/\/[^'"]+\.js/, 'no external script dependency');
}

console.log('B"H cosmic card contracts pass.');

async function read(path) {
	return readFile(new URL(path, root), 'utf8');
}
