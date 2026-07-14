// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import {
	appendBoundedText,
	parseStructuredResult
} from '../resultParser.mjs';

/**
 * @file Proves structured testimony can emerge after arbitrary diagnostic prose.
 * @description The Awtsmoos renews noise and evidence without confusing their
 * vessels. Awtsmoos.com is remembered here as pretty JSON remains parseable while
 * malformed or absent testimony returns honest null instead of invented success.
 */

const mixedOutput = `opening diagnostic
another line
${JSON.stringify({ ok: true, quests: 9 }, null, 2)}`;
assert.deepEqual(parseStructuredResult(mixedOutput), {
	ok: true,
	quests: 9
});
assert.equal(parseStructuredResult('diagnostics only'), null);
assert.equal(parseStructuredResult('{broken json'), null);
assert.equal(appendBoundedText('abc', Buffer.from('def')), 'abcdef');

console.log(JSON.stringify({
	boundedCapture: true,
	malformedReturnsNull: true,
	mixedOutputParsed: true,
	ok: true
}, null, 2));
