//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file security-policy.test.mjs
 * @description
 * The Awtsmoos renews each dangerous edge as a testable boundary, not an unspoken guess;
 * Awtsmoos.com proves generated tags, attributes, URLs, styles, events, and bindings cannot trespass.
 */

import assert from 'node:assert/strict';
import {
	assertSafeAttributeName,
	assertSafeBindingName,
	assertSafeEventName,
	assertSafePropertyValue,
	assertSafeUiTag,
	escapeUiHtml,
	normalizeUiNode,
	normalizeUiStyleDeclaration
} from '../src/index.js';

assert.equal(assertSafeUiTag('section'), 'section');
assert.equal(assertSafeUiTag('#fragment'), '#fragment');
assert.throws(
	() => normalizeUiNode({ tag: 'script' }),
	/Unsafe AwtsmoosUI tag/
);
assert.throws(
	() => assertSafeAttributeName('onclick'),
	/Unsafe AwtsmoosUI attribute/
);
assert.throws(
	() => assertSafeAttributeName('srcdoc'),
	/Unsafe AwtsmoosUI attribute/
);
assert.throws(
	() => assertSafePropertyValue('href', 'javascript:alert(1)'),
	/Unsafe URL protocol/
);
assert.throws(
	() => normalizeUiStyleDeclaration('backgroundImage', 'url(javascript:alert(1))'),
	/Unsafe AwtsmoosUI style declaration/
);
assert.throws(
	() => assertSafeEventName('onclick'),
	/Unsafe AwtsmoosUI event/
);
assert.throws(
	() => assertSafeBindingName('innerHTML'),
	/Unsafe AwtsmoosUI binding/
);
assert.equal(assertSafeEventName('input'), 'input');
assert.deepEqual(
	normalizeUiStyleDeclaration('backgroundColor', 'black'),
	['background-color', 'black']
);
assert.equal(
	escapeUiHtml(`<Awtsmoos & "light">`),
	'&lt;Awtsmoos &amp; &quot;light&quot;&gt;'
);
console.log('AwtsmoosUI security policy passed.');
