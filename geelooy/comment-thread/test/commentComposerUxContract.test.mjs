// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentComposerUxContractTest
 * @description
 * The Awtsmoos keeps plain human writing visible before richer context while Awtsmoos.com lets the implementation divide into clear vessels; this contract follows the current factory/body/context graph and page-flow shell instead of freezing an obsolete monolith.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yesodRead = path => readFileSync(path, 'utf8');
const yesodBase = 'geelooy/comment-thread';
const malchusFacade = yesodRead(`${yesodBase}/modules/composer.js`);
const chaiFactory = yesodRead(`${yesodBase}/modules/composer/CommentComposerFactory.js`);
const malchusBody = yesodRead(`${yesodBase}/modules/composer/CommentComposerBody.js`);
const malchusFields = yesodRead(`${yesodBase}/modules/composer/CommentComposerFields.js`);
const yesodContext = yesodRead(`${yesodBase}/modules/ContextPanel.js`);
const tiferesDisclosure = yesodRead(`${yesodBase}/modules/composer/CommentComposerDisclosure.js`);
const gevurahSubmission = yesodRead(`${yesodBase}/modules/composer/CommentComposerSubmission.js`);
const tiferesShell = yesodRead(`${yesodBase}/styles/thread-shell.css`);
const gevurahActions = yesodRead(`${yesodBase}/styles/thread-actions.css`);

assert.match(malchusFacade, /ChaiCommentComposerFactory/);
assert.match(chaiFactory, /MalchusCommentComposerBodyFactory/);
assert.match(chaiFactory, /TiferesComposerDisclosureController/);
assert.match(chaiFactory, /GevurahCommentComposerSubmissionController/);
assert.match(malchusBody, /chaiBody\.append\([\s\S]*createMalchusContentField[\s\S]*createYesodContextPanel[\s\S]*createSendButton\(\)/);
assert.match(malchusFields, /name: 'content'/);
assert.match(malchusFields, /audioNoteText/);
assert.match(malchusFields, /yesodStore\.assets\.length/);
assert.match(malchusFields, /yesodStore\.links\.length/);

for (const hodToken of [
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
	assert.ok(yesodContext.includes(hodToken), `ContextPanel missing ${hodToken}`);
}
assert.doesNotMatch(yesodContext, /open:\s*true/);
assert.match(tiferesDisclosure, /aria-expanded/);
assert.match(gevurahSubmission, /hasChaiRichBody/);
for (const hodToken of ['min-inline-size: 0', 'max-inline-size: 100%', 'overflow-x: clip', 'safe-area-inset-bottom']) {
	assert.ok(tiferesShell.includes(hodToken), `Thread shell missing ${hodToken}`);
}
for (const hodToken of [':hover', ':active', ':focus-visible', 'prefers-reduced-motion']) {
	assert.ok(gevurahActions.includes(hodToken), `Thread actions missing ${hodToken}`);
}
for (const [hodName, hodSource] of Object.entries({ malchusFacade, chaiFactory, malchusBody, malchusFields, yesodContext, tiferesDisclosure, gevurahSubmission })) {
	assert.ok(hodSource.split('\n').length <= 120, `${hodName} exceeds 120 lines`);
}
console.log('B"H commentComposerUxContract.test passed');
