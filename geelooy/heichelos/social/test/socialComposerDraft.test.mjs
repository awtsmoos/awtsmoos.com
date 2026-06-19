// B"H
/**
 * Chapter 61: The composer draft is weighed before it is trusted.
 * Sections, image assets, audio assets, immutable updates, and post payloads
 * must all hold their shape before the UI can publish anything real.
 */
import { strict as assert } from 'node:assert';
import {
    createDraft,
    addSection,
    updateSection,
    addAssetToSection,
    toPostPayload
} from '../composer/composerDraft.js';
import { Composer } from '../components/Composer.js';

const draft = createDraft({ title: '  Seed title  ', heichelId: 'h1', seriesId: 's1' });
assert.equal(draft.sections.length, 1);
assert.equal(draft.assets.length, 0);

const updated = updateSection(draft, 'section-0', { title: 'Intro', body: 'Opening words' });
const withSecond = addSection(updated, { title: 'Music', body: 'Listen' });
const withImage = addAssetToSection(withSecond, 'section-0', {
    mime: 'image/png',
    name: 'cover.png',
    url: '/cover.png'
});
const withAudio = addAssetToSection(withImage, 'section-1', {
    mime: 'audio/mpeg',
    name: 'niggun.mp3'
});

assert.equal(draft.assets.length, 0, 'draft remains immutable');
assert.equal(withAudio.sections.length, 2);
assert.equal(withAudio.assets.length, 2);
assert.equal(withAudio.assets[0].kind, 'image');
assert.equal(withAudio.assets[1].kind, 'audio');

const payload = toPostPayload(withAudio);
assert.equal(payload.title, 'Seed title');
assert.equal(payload.heichelId, 'h1');
assert.equal(payload.seriesId, 's1');
assert.equal(payload.sections.length, 2);
assert.equal(payload.assets[0].label, 'cover.png');
assert.equal(payload.assets[1].label, 'niggun.mp3');

const view = Composer(withAudio);
assert.ok(containsText(view, 'Intro'));
assert.ok(containsText(view, 'Opening words'));
assert.ok(containsText(view, 'Music'));
assert.ok(containsText(view, 'cover.png'));
assert.ok(containsText(view, 'niggun.mp3'));
assert.ok(containsText(view, 'Attach image, audio, or file to section-1'));

console.log('B"H social composer draft passed');

function containsText(node, text) {
    if (typeof node === 'string') return node.includes(text);
    if (!node || typeof node !== 'object') return false;
    if (Array.isArray(node)) return node.some(child => containsText(child, text));
    return Object.values(node).some(value => containsText(value, text));
}
