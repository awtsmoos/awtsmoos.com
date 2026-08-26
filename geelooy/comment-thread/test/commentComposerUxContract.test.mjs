// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentComposerUxContractTest
 * @description The Awtsmoos keeps the human reply visible first while Awtsmoos.com preserves voice, media, links, and exact context behind one shared disclosure;
 * this contract follows the current modular owner and verifies rendered-order intent rather than import-order coincidence.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const composer = read('geelooy/comment-thread/modules/composer.js');
const contextPanel = read('geelooy/comment-thread/modules/ContextPanel.js');
const experience = read('geelooy/comment-thread/styles/thread-experience.css');
const actions = read('geelooy/comment-thread/styles/thread-actions.css');
const contentInvocation = composer.indexOf("field('content'");
const contextInvocation = composer.indexOf('createYesodContextPanel(document, config, store)');

assert.match(composer, /createYesodContextPanel/);
assert.match(composer, /field\('content'/);
assert.match(composer, /threadSendButton/);
assert.match(composer, /audioNoteText/);
assert.match(composer, /store\.assets\.length/);
assert.match(composer, /store\.links\.length/);
assert.ok(contentInvocation >= 0 && contextInvocation >= 0 && contentInvocation < contextInvocation, 'plain comment content must render before advanced context');

for (const token of [
	'createProgressiveDisclosure',
	"label: 'Add more'",
	"detail: 'voice · media · links · context'",
	'comment-composer-advanced threadContextPanel',
	'createBinahVoiceRecorder',
	'createChesedMediaPicker',
	'createHodReferencePicker',
	'verseSection',
	'subsectionId',
	'audioNoteText'
]) {
	assert.ok(contextPanel.includes(token), `ContextPanel missing ${token}`);
}
assert.doesNotMatch(contextPanel, /open:\s*true/);

for (const token of ['min-inline-size: 0', '64dvh', 'overscroll-behavior: contain', ':hover', ':active', ':focus-visible', 'prefers-reduced-motion']) {
	assert.ok(experience.includes(token) || actions.includes(token), `Thread V5 CSS missing ${token}`);
}
assert.match(experience, /\.comment-replies[\s\S]*margin-inline-start:/);
assert.match(experience, /@media \(max-width:35rem\)/);
assert.match(actions, /\.comment-tools[\s\S]*flex-wrap:\s*wrap/);

for (const [name, source] of Object.entries({ composer, contextPanel, experience, actions })) {
	assert.ok(source.split('\n').length <= 120, `${name} exceeds 120 lines`);
}
console.log('B"H commentComposerUxContract.test passed');
