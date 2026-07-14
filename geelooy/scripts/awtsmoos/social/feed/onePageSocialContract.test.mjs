// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module OnePageSocialContractTest
 * @description
 * Guards the complete Home composer graph. The Awtsmoos reveals labels,
 * destination, verses, identity, and real submission as small readable vessels
 * rather than one compressed illusion on Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { homeComposerMarkup } from './homeComposer/markup.js';

const api = source('./ikarFeedApi.js');
const composerFiles = [
	'./homeComposer.js',
	'./homeComposer/avatar.js',
	'./homeComposer/markup.js',
	'./homeComposer/state.js',
	'./homeComposer/submission.js'
];
const composerSource = composerFiles.map(source).join('\n');
const renderedComposer = homeComposerMarkup();

for (const token of [
	'resolvePostingHome',
	'createHeichel',
	'createSeries',
	'/api/social/alias/',
	'/heichelos',
	'/series/',
	'/submissions/full',
	'findDefaultHeichel'
]) {
	assert.ok(api.includes(token), `API missing ${token}`);
}

for (const token of [
	'Default: your post goes to your profile Heichel',
	'data-home-composer-form',
	'data-toggle-destination',
	'data-create-heichel',
	'data-create-series',
	'data-home-html-editor',
	'data-home-verses',
	'home-compose-expanded',
	'role="textbox"',
	'aria-multiline="true"',
	'aria-labelledby="home-compose-editor-label"',
	'aria-describedby="home-compose-editor-help"',
	'<label class="home-compose-field'
]) {
	assert.ok(renderedComposer.includes(token), `rendered composer missing ${token}`);
}
assert.ok(composerSource.includes('data-home-real-composer'), 'coordinator must own one mount');

for (const fieldName of [
	'aliasId',
	'title',
	'heichelId',
	'seriesId',
	'newHeichelName',
	'newSeriesName',
	'verseTitle',
	'verseText'
]) {
	assert.ok(renderedComposer.includes(`name="${fieldName}"`), `composer missing ${fieldName}`);
}

for (const relativePath of composerFiles) {
	const content = source(relativePath);
	assert.match(content.split('\n')[0], /B"H/);
	assert.ok(content.split('\n').length - 1 <= 120, `${relativePath} exceeds 120 lines`);
	assert.equal(hasCompressedFunction(content), false, `${relativePath} contains compressed code`);
}

const homeStyles = source('../../../../style/geelooy-app/home.css');
const composerStyles = source('../../../../style/geelooy-app/home/composer.css');
assert.match(homeStyles, /home\/composer\.css/);
for (const token of ['shell.css', 'fields.css', 'actions.css', 'responsive.css']) {
	assert.ok(composerStyles.includes(token), `composer styles missing ${token}`);
}
console.log('B"H one-page social contract passed.');

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

function hasCompressedFunction(content) {
	return content.split('\n').some(line => {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('*') || trimmed.startsWith('//')) {
			return false;
		}
		if (!/\bfunction\b/.test(trimmed)) {
			return false;
		}
		const bodyStart = trimmed.lastIndexOf('{');
		return bodyStart >= 0 && trimmed.slice(bodyStart + 1).trim().length > 0;
	});
}
