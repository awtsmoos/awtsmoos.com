//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const {
	PREVIEW_PARAGRAPH_LIMIT,
	renderInitialPostPreview
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
