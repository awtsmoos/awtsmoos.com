//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publicMarkdownReader.test.mjs
 * @description
 * The Awtsmoos proves an encyclopedia teaching can reveal headings and emphasis without revealing its import machinery;
 * Awtsmoos.com escapes hostile HTML first, strips only exact provenance trails, and keeps readable Torah in server and browser symmetry.
 */

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { renderPublicMarkdown } = require('../initial-content/PublicMarkdown.js');
const { renderInitialContent } = require('../initial-content/InitialContentRenderer.js');
const clientSource = readFileSync('geelooy/heichelos/post/logic/initialization/PublicPlainContent.js', 'utf8');
const manifestSource = readFileSync('geelooy/heichelos/post/logic/initialization/postManifest.js', 'utf8');

const abayeExcerpt = `# Abaye\n\n**Hashtag:** \`#abaye\`\n\n## Definition\n\n- **Abaye to Rava.** A teaching. (bavli_arachin/BH_POST_1763114943823_awtsmoos_807.md :: Paragraph [12] :: phrase 1)`;

test('server Markdown renderer formats public prose and removes internal provenance', () => {
	const html = renderPublicMarkdown(abayeExcerpt);
	assert.match(html, /<h1>Abaye<\/h1>/u);
	assert.match(html, /<strong>Hashtag:<\/strong>/u);
	assert.match(html, /<ul>/u);
	assert.doesNotMatch(html, /BH_POST_/u);
	assert.doesNotMatch(html, /Paragraph \[/u);
});

test('raw HTML is escaped before Markdown formatting', () => {
	const html = renderPublicMarkdown('# <script>alert(1)</script>');
	assert.doesNotMatch(html, /<script>/u);
	assert.match(html, /&lt;script&gt;/u);
});

test('server-first reader chooses safe Markdown for plain post content', () => {
	const html = renderInitialContent({ post: { title: 'Abaye', content: abayeExcerpt } });
	assert.match(html, /<h1>Abaye<\/h1>/u);
	assert.doesNotMatch(html, /# Abaye/u);
	assert.doesNotMatch(html, /BH_POST_/u);
});

test('client hydration uses DOM-owned public content instead of appendHTML', () => {
	assert.match(clientSource, /document\.createElement/u);
	assert.match(clientSource, /textContent/u);
	assert.match(clientSource, /BH_POST_/u);
	assert.doesNotMatch(clientSource, /innerHTML/u);
	assert.match(manifestSource, /appendPublicPlainContent/u);
	assert.doesNotMatch(manifestSource, /appendHTML/u);
});
