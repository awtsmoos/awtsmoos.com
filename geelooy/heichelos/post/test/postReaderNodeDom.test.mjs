// B"H
/**
 * Node DOM-ish post reader smoke test.
 * It fetches the rendered reader shell and proves the native-scroll cache-busted
 * garment is served without leaking template/parser errors.
 */
import assert from 'node:assert/strict';

const url = process.env.POST_READER_URL || 'http://127.0.0.1:8080/heichelos/ikar/series/bereishis/0?idx=0&panel=insights&inline=%5B%22torah_translation_en%22%5D&v=native-scroll-004';
const response = await fetch(url);
assert.equal(response.status, 200, `reader route status ${response.status}`);
const html = await response.text();
const has = token => html.includes(token);

assert.ok(has('post-reader-localized-context'), 'reader root missing');
assert.ok(has('awtsmoos-reader-critical-css'), 'critical css missing');
assert.ok(has('/heichelos/post/styles/main.css?v=native-scroll-004'), 'native main css missing');
assert.ok(has('/heichelos/post/styles/reader-controls/live-template.css?v=native-scroll-004'), 'native live template css missing');
assert.ok(has('/heichelos/post/postLogic.js?v=native-scroll-004'), 'native postLogic missing');
assert.ok(has('id="realPost"'), 'realPost vessel missing');
assert.ok(has('.hidden-details{display:none!important}'), 'critical hidden-details rule missing');
assert.ok(!has('thereWasAnAwtsmoosErrorHere'), 'server rendered Awtsmoos processor error');
assert.ok(!has('SyntaxError'), 'server rendered SyntaxError');
assert.ok(!has('Unexpected token'), 'server rendered parser error');
assert.ok(!has('<?<script>'), 'template script leaked into rendered HTML');
console.log('B"H postReaderNodeDom.test passed');
