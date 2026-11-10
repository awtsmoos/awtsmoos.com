// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file translationFootnoteMarkers.test.mjs
 * @description The Awtsmoos proves the English translation's footnote numbers
 * render as the same small gold superscripts as the Hebrew body — in both
 * rendering paths — and that the body card can never fade through a
 * low-contrast window. B"H 2026-11-09.
 *
 * Issue 1: the translation API carries footnote numbers as plain digits
 * glued to the English text ("Yitzchak10", "discourses33", "etc.1",
 * year+footnote "56543") — no <sup> in the data — and makeBlock set them
 * as textContent, so they sat on the baseline, full-size and cream. The
 * renderer now wraps them in real <sup> markers (API path) and the sefer
 * path gained the same year / abbreviation / glued passes; the reader CSS
 * styles them gold. Verified against the live post's real translation
 * payload (271 rows): 60 markers created by both paths, zero footnote-like
 * digits left plain, real numbers (5746, 20th, 175, 11948) untouched.
 * Issue 2: law8 loaded before tokens.css / reader-shell.css, so the text
 * turned cream while the card was still light cream. The card and text now
 * carry the settled dark-navy / cream values as fallbacks.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderTranslationTextWithFootnotes, renderTranslationReport } from '../translations/render.js';
import { renderEnglishWithFootnotes, convertBareFootnoteDigits } from '../logic/scribe/MeluketSeferReader.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const read = (rel) => readFileSync(join(HERE, '..', rel), 'utf8');

const API_SUP = (n) => `<sup class="awtsmoos-translation-fn" data-fn="${n}">${n}</sup>`;

// ---------------------------------------------------------------- Issue 1: API path
test('API path: observed live cases become gold-superscript markers', () => {
	assert.equal(
		renderTranslationTextWithFootnotes('etc.1,'),
		`etc.${API_SUP(1)},`
	);
	assert.equal(
		renderTranslationTextWithFootnotes('in the year 56543'),
		`in the year 5654${API_SUP(3)}`
	);
	assert.equal(
		renderTranslationTextWithFootnotes('Avraham was older than Yitzchak10.'),
		`Avraham was older than Yitzchak${API_SUP(10)}.`
	);
	assert.equal(
		renderTranslationTextWithFootnotes('(as explained in these discourses33),'),
		`(as explained in these discourses${API_SUP(33)}),`
	);
	assert.equal(
		renderTranslationTextWithFootnotes('[For this is55'),
		`[For this is${API_SUP(55)}`
	);
	assert.equal(
		renderTranslationTextWithFootnotes('what our sages said in the Gemara4'),
		`what our sages said in the Gemara${API_SUP(4)}`
	);
});

test('API path: footnote after a closing quote and at phrase end', () => {
	assert.equal(
		renderTranslationTextWithFootnotes('"And the heavens were finished"2 is actualized'),
		`"And the heavens were finished"${API_SUP(2)} is actualized`
	);
	assert.equal(
		renderTranslationTextWithFootnotes('Avraham lived afterwards until 175 years24.'),
		`Avraham lived afterwards until 175 years${API_SUP(24)}.`
	);
	assert.equal(
		renderTranslationTextWithFootnotes('…Israel 5.'),
		`…Israel ${API_SUP(5)}.`
	);
});

test('API path: literal <sup data-fn> carried as text becomes a real marker', () => {
	assert.equal(
		renderTranslationTextWithFootnotes('word <sup data-fn="7">7</sup> more'),
		`word ${API_SUP(7)} more`
	);
});

test('API path: real numbers are never touched', () => {
	assert.equal(renderTranslationTextWithFootnotes('in 1967'), 'in 1967');
	assert.equal(renderTranslationTextWithFootnotes('the year 5747 was blessed'), 'the year 5747 was blessed');
	assert.equal(renderTranslationTextWithFootnotes('the 20th of Cheshvan'), 'the 20th of Cheshvan');
	assert.equal(renderTranslationTextWithFootnotes('until 175 years'), 'until 175 years');
	assert.equal(renderTranslationTextWithFootnotes('(Psalm 11948)'), '(Psalm 11948)');
	assert.equal(renderTranslationTextWithFootnotes('B2B deal'), 'B2B deal');
	assert.equal(renderTranslationTextWithFootnotes('24/7 service'), '24/7 service');
	assert.equal(renderTranslationTextWithFootnotes('3.14 value'), '3.14 value');
	assert.equal(renderTranslationTextWithFootnotes('chapter 3 and more'), 'chapter 3 and more');
	assert.equal(renderTranslationTextWithFootnotes('footnotes 55 and 56 and 57 here'), 'footnotes 55 and 56 and 57 here');
});

test('API path: markup is escaped, markers are the only HTML', () => {
	assert.equal(
		renderTranslationTextWithFootnotes('<script>alert(1)</script> Yitzchak10'),
		`&lt;script&gt;alert(1)&lt;/script&gt; Yitzchak${API_SUP(10)}`
	);
	assert.equal(
		renderTranslationTextWithFootnotes('Fish & Chips'),
		'Fish &amp; Chips'
	);
});

// ---------------------------------------------------------------- Issue 1: sefer path
test('sefer path: same observed live cases become tappable gold markers', () => {
	const out = renderEnglishWithFootnotes('etc.1, in the year 56543, Yitzchak10, discourses33, is55');
	assert.match(out, /etc\.<sup class="meluket-fn-marker" data-fn="1"/);
	assert.match(out, /5654<sup class="meluket-fn-marker" data-fn="3"/);
	assert.match(out, /Yitzchak<sup class="meluket-fn-marker" data-fn="10"/);
	assert.match(out, /discourses<sup class="meluket-fn-marker" data-fn="33"/);
	assert.match(out, /is<sup class="meluket-fn-marker" data-fn="55"/);
});

test('sefer path: real numbers are never touched', () => {
	assert.equal(renderEnglishWithFootnotes('in 1967'), 'in 1967');
	assert.equal(renderEnglishWithFootnotes('the year 5747 was blessed'), 'the year 5747 was blessed');
	assert.equal(renderEnglishWithFootnotes('3.14 value'), '3.14 value');
	assert.equal(renderEnglishWithFootnotes('chapter 3 and more'), 'chapter 3 and more');
});

// B"H — Nov 10, 2026: footnote 1 on the live maamar stayed plain —
// "ואברהם זקן בא בימים גו'1," — the digit follows a geresh (') after a
// Hebrew letter, mid-phrase, so neither the glued pass nor the trailing
// pass saw it. The converter now catches digits after a geresh, quote,
// or closing paren/bracket that follows Hebrew. Verified against the
// live post's real data: Hebrew markers 63/64 before, 64/64 after.
function hebrewMarkers(text) {
	const root = { children: [] };
	const textNode = { nodeValue: text, parentNode: root, parentElement: { closest: () => null } };
	root.children.push(textNode);
	root.replaceChild = (frag, old) => {
		const i = root.children.indexOf(old);
		const expanded = frag.children.map((c) => {
			c.parentNode = root;
			c.parentElement = { closest: () => null };
			return c;
		});
		root.children.splice(i, 1, ...expanded);
	};
	const sup = () => {
		const attrs = {};
		return {
			tag: 'sup', textContent: '',
			setAttribute(k, v) { attrs[k] = v; },
			getAttribute(k) { return attrs[k]; }, attrs
		};
	};
	globalThis.NodeFilter = { SHOW_TEXT: 4, FILTER_ACCEPT: 1, FILTER_SKIP: 2, FILTER_REJECT: 3 };
	globalThis.document = {
		createTreeWalker(_root, _type, filter) {
			const nodes = root.children.filter((n) => typeof n.nodeValue === 'string' && filter.acceptNode(n) === 1);
			let i = 0;
			return { nextNode() { return i < nodes.length ? nodes[i++] : null; } };
		},
		createElement(tag) { return tag === 'sup' ? sup() : { setAttribute() {}, appendChild() {} }; },
		createDocumentFragment() {
			const kids = [];
			return { children: kids, appendChild(c) { kids.push(c); return c; } };
		},
		createTextNode: (v) => ({ nodeValue: v, parentNode: null, parentElement: { closest: () => null } })
	};
	try {
		convertBareFootnoteDigits(root);
		return root.children.map((c) => (c.tag === 'sup'
			? `<sup data-fn="${c.attrs['data-fn']}">${c.textContent}</sup>`
			: c.nodeValue)).join('');
	} finally {
		delete globalThis.document;
		delete globalThis.NodeFilter;
	}
}

test('sefer path Hebrew: digit after a geresh becomes a marker (live footnote 1)', () => {
	assert.equal(
		hebrewMarkers("ואברהם זקן בא בימים גו'1,"),
		'ואברהם זקן בא בימים גו\'<sup data-fn="1">1</sup>,'
	);
	assert.match(hebrewMarkers("אברהם דכתיב בי' בכל יצחק דכתיב בי'59"), /בי'<sup data-fn="59">59<\/sup>$/);
	assert.match(hebrewMarkers('(אשר בשבת זו נפעל הענין דויכולו השמים גו\'2'), /גו'<sup data-fn="2">2<\/sup>$/);
});

test('sefer path Hebrew: years and plain numbers stay plain text', () => {
	assert.equal(hebrewMarkers('בשנת 5746'), 'בשנת 5746');
	assert.equal(hebrewMarkers('שלום 1967'), 'שלום 1967');
});

// ---------------------------------------------------------------- Issue 1: wiring + CSS
test('Issue 1 wiring: makeBlock renders translation text as HTML with markers', () => {
	const source = read('translations/render.js');
	assert.match(source, /paragraph\.innerHTML = renderTranslationTextWithFootnotes\(translationText\(row\)\)/);
	assert.doesNotMatch(source, /paragraph\.textContent = translationText\(row\)/);
});

test('Issue 1 CSS: translation sups get the Hebrew gold-superscript treatment', () => {
	const css = read('styles/translations.css');
	assert.match(css, /\.awtsmoos-translation-block sup \{/);
	assert.match(css, /font-size: 0\.62em;/);
	assert.match(css, /vertical-align: super;/);
	assert.match(css, /color: var\(--awt-gold, var\(--law8-gold\)\);/);
	assert.match(css, /font-weight: 700;/);
});

// ---------------------------------------------------------------- Issue 1: DOM render check
function fakeElement(tagName = 'div') {
	const el = {
		tagName: tagName.toUpperCase(),
		children: [],
		dataset: {},
		lang: '',
		dir: '',
		textContent: '',
		innerHTML: '',
		className: '',
		style: {},
		classList: {
			_values: new Set(),
			add(...names) { names.forEach((n) => this._values.add(n)); },
			remove(...names) { names.forEach((n) => this._values.delete(n)); },
			toggle(name, force) {
				if (force === undefined) force = !this._values.has(name);
				if (force) this._values.add(name); else this._values.delete(name);
				return force;
			},
			contains(name) { return this._values.has(name); }
		},
		appendChild(child) { this.children.push(child); return child; },
		insertAdjacentElement(_position, child) { this.children.push(child); return child; },
		setAttribute(_name, _value) {},
		querySelector() { return null; },
		querySelectorAll() { return []; },
		addEventListener() {},
		remove() {}
	};
	return el;
}

test('Issue 1 render: a translation block paragraph really contains <sup> markers', () => {
	const created = [];
	globalThis.document = { createElement: (tag) => { const el = fakeElement(tag); created.push(el); return el; } };
	globalThis.localStorage = { getItem: () => null, setItem: () => {} };
	try {
		const viewport = fakeElement('div');
		const target = fakeElement('div');
		// The reader mounts each English block after its Hebrew target; the
		// fake viewport answers that selector with a target element.
		viewport.querySelector = () => target;
		const report = {
			rows: [
				{ content: 'Avraham was older than Yitzchak10.' },
				{ content: 'in the year 56543' }
			]
		};
		const result = renderTranslationReport(viewport, report);
		assert.equal(result.mounted, 1);
		assert.equal(result.missingTargets, 0);
		const blocks = created.filter((el) => el.tagName === 'ASIDE' && el.className === 'awtsmoos-translation-block');
		assert.equal(blocks.length, 1);
		const paragraphs = blocks[0].children.filter((el) => el.tagName === 'P');
		assert.equal(paragraphs.length, 2);
		assert.match(paragraphs[0].innerHTML, /Yitzchak<sup class="awtsmoos-translation-fn" data-fn="10">10<\/sup>\./);
		assert.match(paragraphs[1].innerHTML, /5654<sup class="awtsmoos-translation-fn" data-fn="3">3<\/sup>/);
		assert.doesNotMatch(paragraphs[0].innerHTML, /Yitzchak10/);
	} finally {
		delete globalThis.document;
		delete globalThis.localStorage;
	}
});

// ---------------------------------------------------------------- Issue 2: the fade
test('Issue 2: body card carries the settled dark-navy / cream fallbacks', () => {
	const css = read('styles/law8/law8-post-reader.css');
	// The card itself: dark navy background, cream text — from the moment
	// law8 loads, before tokens.css and reader-shell.css arrive.
	assert.match(css, /background: var\(--social-panel, rgb\(15 27 45\)\);/);
	assert.match(css, /color: var\(--awt-text, #f8fbff\);/);
	// No body-content rule may still fall back to dark ink: that was the
	// dark-on-dark half of the window.
	assert.doesNotMatch(css, /\.awtsmoos-plain-post-content[^}]*color: var\(--awt-text, var\(--law8-ink\)\)/);
	// The Hebrew gold sup rule is untouched (verified working).
	assert.match(css, /\.awtsmoos-plain-post-content sup \{[^}]*color: var\(--awt-gold, var\(--law8-gold\)\);/);
});

test('Issue 2: .section no longer cross-fades its background through low contrast', () => {
	const css = read('styles/ideal/reborn/reader.css');
	assert.doesNotMatch(css, /\.section \{[^}]*transition:[^;]*background[^;]*;/);
	assert.match(css, /transition: border-color \.22s ease, box-shadow \.22s ease;/);
});

test('Issue 2: no !important anywhere in the changed reader CSS', () => {
	// Strip /* comments */ first: the law8 header comment states the rule
	// ("no !important") in words, which is not a declaration.
	const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
	for (const rel of [
		'styles/law8/law8-post-reader.css',
		'styles/translations.css',
		'styles/ideal/reborn/reader.css'
	]) {
		assert.doesNotMatch(stripComments(read(rel)), /!important/, `${rel} must never use !important`);
	}
});
