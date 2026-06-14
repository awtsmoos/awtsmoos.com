// B"H
/**
 * Node DOM-ish post reader smoke test.
 * No browser dependency: fetch rendered HTML, inspect the actual served tree,
 * and reject the parser error that broke the reader publicly.
 */
import assert from 'node:assert/strict';

const url = process.env.POST_READER_URL || 'http://127.0.0.1:8080/heichelos/ikar/series/BH-likkuteiTorah-%D7%A7%D7%A8%D7%97/0?idx=0&panel=rootMenu&sub=0';
const html = await fetch(url).then(response => {
  assert.equal(response.status, 200, `reader route status ${response.status}`);
  return response.text();
});

const has = token => html.includes(token);
assert.ok(has('post-reader-localized-context'), 'reader root missing');
assert.ok(has('awtsmoos-reader-critical-css'), 'critical css missing');
assert.ok(has('/heichelos/post/styles/main.css?v=legend-002'), 'cache-busted main css missing');
assert.ok(has('/heichelos/post/styles/reader-controls/live-template.css?v=legend-002'), 'live template css missing');
assert.ok(has('id="realPost"'), 'realPost vessel missing');
assert.ok(has('.hidden-details{display:none!important}'), 'critical hidden-details rule missing');
assert.ok(!has('thereWasAnAwtsmoosErrorHere'), 'server rendered Awtsmoos processor error');
assert.ok(!has('SyntaxError'), 'server rendered SyntaxError');
assert.ok(!has('Unexpected token'), 'server rendered parser error');
assert.ok(!has('<?<script>'), 'template script leaked into rendered HTML');
console.log('B"H postReaderNodeDom.test passed');
