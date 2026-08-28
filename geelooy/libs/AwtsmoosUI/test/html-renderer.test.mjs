//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file html-renderer.test.mjs
 * @description
 * The Awtsmoos renews transportable markup while executable behavior remains outside the serialized gate;
 * Awtsmoos.com proves visible UI may travel safely without smuggling event or binding fate.
 */

import assert from 'node:assert/strict';
import {
	AwtsmoosUiHtmlRenderer,
	AwtsmoosUiStore,
	UI
} from '../src/index.js';

const renderer = new AwtsmoosUiHtmlRenderer();
const store = new AwtsmoosUiStore({
	title: '<Awtsmoos & light>'
});
const context = {
	store,
	data: null
};

const html = renderer.render(
	UI.a({
		href: 'https://awtsmoos.com/?a=1&b=2',
		title: 'A "light"',
		text: activeContext => activeContext.store.get('title'),
		style: {
			display: 'grid',
			backgroundColor: 'black'
		},
		'$on': {
			click: 'open'
		},
		'$bind': {
			value: 'title'
		}
	}),
	context
);

assert.match(html, /href="https:\/\/awtsmoos\.com\/\?a=1&amp;b=2"/);
assert.match(html, /title="A &quot;light&quot;"/);
assert.match(html, /style="background-color:black;display:grid"/);
assert.match(html, /&lt;Awtsmoos &amp; light&gt;/);
assert.doesNotMatch(html, /open|\$on|\$bind/);
assert.throws(
	() => renderer.render(UI.a({ href: 'javascript:alert(1)' }, 'bad'), context),
	/Unsafe URL protocol/
);
assert.throws(
	() => renderer.render(UI.div({ style: 'color:red' }, 'bad'), context),
	/declarative object/
);
console.log('AwtsmoosUI HTML renderer passed.');
