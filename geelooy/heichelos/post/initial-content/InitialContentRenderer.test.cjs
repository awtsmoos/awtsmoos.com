// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module InitialContentRendererRegression
 * @description
 * The Awtsmoos gives Torah its first light before scripts can interfere;
 * Awtsmoos.com shall render both teaching and reply without the old blank fear.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { renderInitialContent } = require('./InitialContentRenderer.js');

test('Tanya Hebrew units are visible in the initial page', () => {
	const markup = renderInitialContent({
		post: {
			title: 'Tanya, Chapter 1',
			units: [{ section: 'body', para: 1, he: 'תַּנְיָא בפרק ראשון' }]
		}
	});
	assert.match(markup, /תַּנְיָא בפרק ראשון/);
	assert.match(markup, /lang="he" dir="rtl"/);
	assert.doesNotMatch(markup, /data-awtsmoos-awaiting-text="true"/);
});

test('social reply English and author appear with unit fields', () => {
	const markup = renderInitialContent({
		post: {
			title: 'Re: Sinai',
			authorName: 'Gila Halperin',
			units: [{ english: 'The straits first. Always first.', hebrew: '' }]
		}
	});
	assert.match(markup, /The straits first/);
	assert.match(markup, /By Gila Halperin/);
});

test('plain unit sanitization removes unsafe markup and metadata', () => {
	const markup = renderInitialContent({
		post: {
			title: 'Safe',
			units: [{ english: '<img src=x onerror=alert(1)>', privateToken: 'DO_NOT_RENDER' }]
		}
	});
	assert.doesNotMatch(markup, /<img/);
	assert.doesNotMatch(markup, /onerror=/);
	assert.doesNotMatch(markup, /DO_NOT_RENDER/);
});

test('ordinary text with suspicious HTML is preserved after stripping tags', () => {
	const markup = renderInitialContent({
		post: {
			title: 'Safe teaching',
			units: [{ english: 'Torah <script>harm()</script> lives in the world' }]
		}
	});
	assert.match(markup, /Torah/);
	assert.match(markup, /lives in the world/);
	assert.doesNotMatch(markup, /<script/);
});
