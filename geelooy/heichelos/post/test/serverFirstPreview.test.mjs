//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const {
	PREVIEW_PARAGRAPH_LIMIT,
	renderInitialPostPreview,
	slimPhraseTranslationRows,
	renderPhraseTranslationsEmbed
} = require('../../routes/heichel/initialPostPreview.js');
const { createReaderData } = require('../../routes/heichel/readerData.js');
const { publicReaderCache } = require('../../routes/heichel/readerDataCache.js');

test('server preview renders bounded readable Torah from an API envelope', () => {
	const envelope = {
		post: {
			title: 'בראשית',
			content: '<p>בראשית ברא אלקים את השמים ואת הארץ.</p><p>והארץ היתה תהו ובהו.</p>'
		},
		sections: [{ title: 'Fallback section' }]
	};
	const html = renderInitialPostPreview({ post: envelope });
	assert.match(html, /data-awtsmoos-server-preview/);
	assert.match(html, /בראשית ברא אלקים/);
	assert.doesNotMatch(html, /&lt;p&gt;/);
	assert.ok((html.match(/data-awtsmoos-preview-unit=/g) || []).length <= PREVIEW_PARAGRAPH_LIMIT);
	assert.ok(Buffer.byteLength(html) < 14000);
});

test('server preview strips active body markup and escapes the title', () => {
	const html = renderInitialPostPreview({
		post: {
			title: '<script>bad()</script>',
			content: '<p>Hello <strong>world</strong></p><script>evil()</script>'
		}
	});
	assert.match(html, /Hello world/);
	assert.doesNotMatch(html, /<strong>|<script>/);
	assert.match(html, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
});

test('reader first-byte data fetches only one projected post record', async () => {
	publicReaderCache.clear();
	const calls = [];
	const $i = {
		async fetchAwtsmoos(path) {
			calls.push(path);
			return {
				title: 'Teaching',
				content: 'Torah',
				author: 'author-a',
				postId: 'post-a'
			};
		}
	};
	const data = await createReaderData($i).loadSeriesPost('ikar', 'series-a', 'post-a');
	assert.equal(calls.length, 1);
	assert.match(calls[0], /\/series\/series-a\/post\/post-a\?propertyMap=/);
	assert.doesNotMatch(calls[0], /\/api\/social\/aliases\//);
	assert.equal(data.heichel.id, 'ikar');
	assert.equal(data.alias, null);
	assert.equal(data.post.title, 'Teaching');
	assert.equal(data.post.heichel.id, 'ikar');
});

// B"H — Nov 10, 2026: the sefer must ride the first HTML, not a second
// sequential API round trip. The server slims the 271 translation rows to
// the four fields the client consumes and embeds them as JSON.
test('phrase embed: slim rows keep only the four fields the reader consumes', () => {
	const rows = [
		{ id: 'x', heichelId: 'ikar', postId: 'p', sourceHebrew: 'בס"ד.', content: 'Blessed.', verseSection: 's1', subsectionId: 'segment_0_0', createdAt: '2026', source: { big: true } },
		{ sourceHebrew: '   ', content: 'empty hebrew is skipped' },
		{ sourceHebrew: 'שלום', content: '', verseSection: '', subsectionId: '' }
	];
	const slim = slimPhraseTranslationRows(rows);
	assert.equal(slim.length, 2);
	assert.deepEqual(Object.keys(slim[0]).sort(), ['content', 'sourceHebrew', 'subsectionId', 'verseSection']);
	assert.equal(slim[0].sourceHebrew, 'בס"ד.');
	assert.equal(slim[0].content, 'Blessed.');
	assert.equal('id' in slim[0], false);
});

test('phrase embed: JSON is safely embedded and round-trips; thin data embeds nothing', () => {
	const rows = Array.from({ length: 25 }, (_, i) => ({
		sourceHebrew: `מלה${i} <script>evil()</script>`,
		content: `word ${i}`,
		verseSection: 's1',
		subsectionId: `segment_0_${i}`
	}));
	const html = renderPhraseTranslationsEmbed(rows);
	assert.match(html, /id="awtsmoos-phrase-translations"/);
	assert.match(html, /type="application\/json"/);
	const inner = html.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
	assert.doesNotMatch(inner, /<script>/);
	assert.doesNotMatch(inner, /<\/script/);
	const back = JSON.parse(inner);
	assert.equal(back.length, 25);
	assert.equal(back[0].sourceHebrew, 'מלה0 <script>evil()</script>');
	assert.equal(renderPhraseTranslationsEmbed([]), '');
	assert.equal(renderPhraseTranslationsEmbed(rows.slice(0, 5)), '');
});

test('phrase embed: translations load through the internal route, never the post route', async () => {
	publicReaderCache.clear();
	const calls = [];
	const $i = {
		async fetchAwtsmoos(path) {
			calls.push(path);
			if (path.endsWith('/translations')) return { success: [{ sourceHebrew: 'א', content: 'a', verseSection: 's', subsectionId: 'segment_0_0' }] };
			return { title: 'Teaching', content: 'Torah', postId: 'post-a' };
		}
	};
	const rows = await createReaderData($i).loadPostTranslations('ikar', 'series-a', 'post-a');
	assert.equal(rows.length, 1);
	assert.equal(calls.length, 1);
	assert.match(calls[0], /\/series\/series-a\/post\/post-a\/translations$/);
	// A failed translations fetch embeds nothing — the client falls back
	// to the API. (Clear the cache first: the success above cached this
	// exact path, and the cache is shared across tests in this file.)
	publicReaderCache.clear();
	const failed = await createReaderData({ async fetchAwtsmoos() { throw new Error('down'); } }).loadPostTranslations('ikar', 'series-a', 'post-a');
	assert.equal(failed, null);
});
