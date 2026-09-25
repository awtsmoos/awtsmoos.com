//B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import { autolinkSiblings, orderSiblingAssets, previewDocument } from '../js/builder/previewPanel.js';

const HTML = '<!DOCTYPE html><html><head><title>T</title></head><body><h1>Hi</h1></body></html>';

test('autolinkSiblings injects styles into head and scripts before /body', () => {
	const out = autolinkSiblings(HTML, {
		css: [{ name: 'styles.css', content: 'h1{color:red}' }],
		js: [{ name: 'app.js', content: 'console.log(1)' }]
	});
	const styleAt = out.indexOf('<style data-autolink="styles.css">');
	const headClose = out.indexOf('</head>');
	const scriptAt = out.indexOf('<script data-autolink="app.js">');
	const bodyClose = out.indexOf('</body>');
	assert.ok(styleAt !== -1 && styleAt < headClose, 'style lands inside head');
	assert.ok(scriptAt !== -1 && scriptAt < bodyClose && scriptAt > headClose, 'script lands before /body');
	assert.ok(out.includes('h1{color:red}'));
	assert.ok(out.includes('console.log(1)'));
});

test('autolinkSiblings tags each block with its file name', () => {
	const out = autolinkSiblings(HTML, { css: [{ name: 'a.css', content: 'x' }, { name: 'b.css', content: 'y' }] });
	assert.equal((out.match(/<style data-autolink=/g) || []).length, 2);
});

test('autolinkSiblings handles headless and bodyless documents', () => {
	const bare = '<h1>No head</h1>';
	const out = autolinkSiblings(bare, { css: [{ name: 's.css', content: 'x' }], js: [{ name: 'a.js', content: 'y' }] });
	assert.ok(out.includes('<head>'));
	assert.ok(out.includes('<script data-autolink="a.js">'));
	const noHead = '<html><head><meta charset="utf-8"></head><p>x</p></html>';
	const out2 = autolinkSiblings(noHead, { js: [{ name: 'a.js', content: 'y' }] });
	assert.ok(out2.endsWith('<script data-autolink="a.js">\ny\n</script>'));
});

test('autolinkSiblings is a no-op without siblings and never invents a sandbox', () => {
	assert.equal(autolinkSiblings(HTML, {}), HTML);
	assert.equal(autolinkSiblings(HTML), HTML);
	const out = autolinkSiblings(HTML, { js: [{ name: 'a.js', content: '1' }] });
	assert.ok(!out.includes('sandbox'));
	assert.ok(!/<script[^>]*src=/.test(out), 'no external script sources are introduced');
});

test('autolinkSiblings skips empty contents but keeps the rest', () => {
	const out = autolinkSiblings(HTML, { css: [{ name: 'e.css', content: '' }], js: [] });
	assert.equal(out, HTML);
});

test('orderSiblingAssets puts same-basename files first, then alphabetical', () => {
	const ordered = orderSiblingAssets(['z.css', 'index.css', 'a.css', 'index-print.css'], 'index.html');
	assert.deepEqual(ordered, ['index.css', 'index-print.css', 'a.css', 'z.css']);
});

test('orderSiblingAssets is case-insensitive on stems', () => {
	const ordered = orderSiblingAssets(['other.js', 'Index.js'], 'INDEX.html');
	assert.deepEqual(ordered[0], 'Index.js');
});

test('previewDocument keeps its old signature working and applies siblings', () => {
	assert.equal(previewDocument('<p>x</p>'), '<p>x</p>');
	const withBase = previewDocument('<html><head></head><body></body></html>', 'https://example.com/site/');
	assert.ok(withBase.includes('<base href="https://example.com/site/">'));
	const withSiblings = previewDocument(HTML, '', { css: [{ name: 's.css', content: 'x' }] });
	assert.ok(withSiblings.includes('<style data-autolink="s.css">'));
	const both = previewDocument(HTML, 'https://example.com/', { js: [{ name: 'a.js', content: 'y' }] });
	assert.ok(both.includes('<base href="https://example.com/">'));
	assert.ok(both.includes('<script data-autolink="a.js">'));
});
