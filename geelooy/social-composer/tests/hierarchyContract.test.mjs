// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos protects the quiet hierarchy of Awtsmoos.com social creation:
 * common deeds stay visible, uncommon deeds wait behind disclosures, and destructive draft machinery never dominates the room.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const sources = {
	mobile: new URL('../js/civilization/mobileHierarchy.js', import.meta.url),
	actions: new URL('../js/civilization/actionHierarchy.js', import.meta.url),
	modes: new URL('../js/civilization/composerModes.js', import.meta.url),
	style: new URL('../style.css', import.meta.url)
};

const [mobile, actions, modes, style] = await Promise.all([
	readFile(sources.mobile, 'utf8'),
	readFile(sources.actions, 'utf8'),
	readFile(sources.modes, 'utf8'),
	readFile(sources.style, 'utf8')
]);

assert.match(mobile, /composer-tool-menu/, 'less-common social tools should live in one disclosure');
assert.match(mobile, /\['media', '▧', 'Media'\]/, 'Media should remain a visible quick action');
assert.doesNotMatch(mobile, /\['preview'/i, 'Preview should not be duplicated in the social tool strip');
assert.match(modes, /composer-workflow-disclosure/, 'workflow navigation should live behind Sections');
assert.match(actions, /'saveServerButton'/, 'server draft behavior must be preserved in the More menu');
assert.match(actions, /'clearDraftButton'/, 'clear draft behavior must be preserved in the More menu');
assert.match(actions, /panel\.append\(action\)/, 'existing action nodes should move rather than be cloned');
assert.match(actions, /quiet-danger/, 'destructive draft action should use a quiet semantic treatment');

const creatorIndex = style.indexOf('./styles/creator/command-palette.css');
const clarityIndex = style.indexOf('./styles/clarity/index.css');
assert.ok(creatorIndex >= 0, 'Creator command-palette stylesheet should remain loaded');
assert.ok(clarityIndex > creatorIndex, 'clarity must load after protected Creator styling');

for (const [name, source] of Object.entries({ mobile, actions, modes })) {
	const lineCount = source.trimEnd().split('\n').length;
	assert.ok(lineCount <= 120, `${name} must remain within the 120-line vessel law; saw ${lineCount}`);
}

console.log('B"H social hierarchy contract verified.');
