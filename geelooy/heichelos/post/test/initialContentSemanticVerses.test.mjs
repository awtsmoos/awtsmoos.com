//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Server-first Torah verse identity regression.
 * @description
 * The Awtsmoos executes the real initial-content template script as a pure server
 * vessel. Awtsmoos.com therefore proves canonical Tanach sections retain stable
 * pasuk anchors before hydration while ordinary teachings remain plain paragraphs.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const templateUrl = new URL('../initial-content.html', import.meta.url);
const template = fs.readFileSync(templateUrl, 'utf8');
const script = template.match(/<\?<script>([\s\S]*?)<\/script>\?>/)?.[1] || '';
const renderTemplate = new Function('post', 'heichel', 'alias', script);

/**
 * Executes the exact server template script with a minimal public reader context.
 * @param {object} post Resolved teaching fixture.
 * @returns {string} Server-first HTML fragment.
 */
function render(post) {
	return renderTemplate(post, { name: 'Ikar' }, { name: 'Awtsmoos' });
}
/** Builds a canonical Hebrew chapter with two structurally separate pesukim. */
function canonicalChapter() {
	return {
		title: 'פרק א',
		dayuh: {
			sections: [
				['בְּרֵאשִׁית בָּרָא אֱלֹהִים'],
				['וְהָאָרֶץ הָיְתָה & תֹהוּ']
			],
			meta: {
				canonicalHebrew: true,
				sourceChapter: 1
			}
		}
	};
}

test('canonical Hebrew sections receive stable pasuk identities before hydration', () => {
	const html = render(canonicalChapter());
	assert.match(html, /id="pasuk-1"/);
	assert.match(html, /href="#pasuk-2"/);
	assert.match(html, /data-pasuk="2"/);
	assert.match(html, /data-source-chapter="1"/);
	assert.match(html, /aria-label="Pasuk 1"/);
	assert.match(html, /בְּרֵאשִׁית בָּרָא אֱלֹהִים/);
	assert.match(html, /וְהָאָרֶץ הָיְתָה &amp; תֹהוּ/);
});
test('ordinary teachings remain generic paragraphs without fabricated pasuk identity', () => {
	const html = render({
		title: 'A teaching',
		content: 'First paragraph.\n\nSecond paragraph.'
	});
	assert.match(html, /<p>First paragraph\.<\/p>/);
	assert.match(html, /<p>Second paragraph\.<\/p>/);
	assert.doesNotMatch(html, /data-awtsmoos-pasuk/);
	assert.doesNotMatch(html, /id="pasuk-/);
});

test('server-first status says Torah is ready while enhancement remains optional', () => {
	const html = render(canonicalChapter());
	assert.match(html, /Torah text above is ready now/);
	assert.match(html, /Interactive reader tools are loading/);
});

test('hydrated classic and modern sections preserve the server pasuk hash contract', () => {
	const classic = fs.readFileSync(new URL('../logic/scribe/Architect.js', import.meta.url), 'utf8');
	const modern = fs.readFileSync(new URL('../logic/scribe/ModernSectionArchitect.js', import.meta.url), 'utf8');
	assert.match(classic, /section\.id = `pasuk-\$\{index \+ 1\}`/);
	assert.match(modern, /section\.id = `pasuk-\$\{index \+ 1\}`/);
});
