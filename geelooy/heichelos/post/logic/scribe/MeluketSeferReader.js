// B"H
// Boruch Hashem
// Blessed be He

/**
 * @file Meluket Sefer Reader — Bilingual sefer-style restructuring.
 *
 * The Awtsmoos gives the Meluket maamar its printed-sefer dignity:
 * each section becomes a distinct warm vessel, Hebrew above with the
 * English dwelling beneath it — never side by side.
 *
 * Hebrew is split into phrase blocks by Yaakov's rule (2026-10-07):
 * split at . , ( ) [ ] — "[" / "(" begin a new phrase, "]" / ")"
 * end the current phrase, and , . split even inside brackets.
 * Never split without punctuation, so "ועשו מקדש" stays one phrase.
 *
 * Runs after interpretPostDayuh. Only activates for posts carrying
 * enrichment.hebrew_phrases + enrichment.translation_en (Meluket).
 */

import { refreshTranslationStatus } from '../../translations/render.js?v=e72b93221c';
import { loadFontSize } from '../../functions/ui/Dimensionality.js';

/**
 * B"H - Lever 1 (load-speed): the meluket CSS trio is consumed only by this
 * reader, so it self-injects on awakening instead of loading on every post.
 * Idempotent ensureStyle pattern (modeled on ReaderFeatureStyles.js):
 * stable element ids, dataset load state, existing element on repeat calls.
 */
const SEFER_STYLE_TRIO = [
	['awtsmoos-sefer-style-sefer', '/heichelos/post/styles/meluket-sefer.css?v=3ee8cef760'],
	['awtsmoos-sefer-style-law8', '/heichelos/post/styles/meluket-law8.css?v=dd8f252398'],
];

function ensureSeferStyle(id, href) {
	if (!document?.head) return null;
	const existing = document.getElementById(id);
	if (existing) return existing;
	// B"H 2026-11-10 round 3: the server bundles consecutive head links, so
	// the trio may already be loaded inside one bundle link (which keeps
	// only the first id). Skip injection when any link already loads this
	// file, or the file downloads twice.
	const fileName = String(href).split('/').pop().split('?')[0];
	if (fileName) {
		const bundled = document.querySelector(`link[href*="${fileName}"]`);
		if (bundled) return bundled;
	}
	const link = document.createElement('link');
	link.id = id;
	link.rel = 'stylesheet';
	link.href = href;
	link.dataset.seferStyles = 'loading';
	link.addEventListener('load', () => {
		link.dataset.seferStyles = 'ready';
	}, { once: true });
	document.head.appendChild(link);
	return link;
}

/** Injects the meluket CSS trio into document.head (idempotent). */
export function ensureMeluketSeferStyles() {
	for (const [id, href] of SEFER_STYLE_TRIO) ensureSeferStyle(id, href);
}

/** Natural sort for phraseIds like segment_0_0, segment_0_10, segment_1_2. */
function phraseIdKey(phraseId) {
	const match = String(phraseId || '').match(/segment_(\d+)_(\d+)/);
	if (!match) return [0, 0];
	return [parseInt(match[1], 10), parseInt(match[2], 10)];
}

function comparePhraseId(a, b) {
	const [a1, a2] = phraseIdKey(a);
	const [b1, b2] = phraseIdKey(b);
	if (a1 !== b1) return a1 - b1;
	return a2 - b2;
}

/** Section ids sort: sec-001, sec-002, ... sec-024. */
function sectionIdKey(sectionId) {
	const match = String(sectionId || '').match(/sec-(\d+)/);
	return match ? parseInt(match[1], 10) : 0;
}

/**
 * Groups Hebrew phrases by sectionId, each group's phrases sorted by phraseId.
 * B"H — each phrase also carries its English, joined on phraseId from
 * enrichment.translation_en_phrases, so the renderer can place the English
 * beneath its own Hebrew phrase instead of a section-level blob.
 * @param {Array} phrases Raw hebrew_phrases array.
 * @param {Map<string,string>} enByPhraseId phraseId -> English text.
 * @returns {Array<{sectionId:string, html:string, items:Array<{phraseId:string,he:string,en:string}>}>}
 *   Ordered sections with phrase items (plus the legacy concatenated HTML).
 */
export function buildHebrewSections(phrases, enByPhraseId) {
	const groups = new Map();
	for (const phrase of phrases || []) {
		const sectionId = phrase.sectionId || 'sec-000';
		if (!groups.has(sectionId)) groups.set(sectionId, []);
		groups.get(sectionId).push(phrase);
	}
	const ordered = Array.from(groups.keys()).sort((a, b) => sectionIdKey(a) - sectionIdKey(b));
	return ordered.map(sectionId => {
		const sorted = groups.get(sectionId).sort((a, b) => comparePhraseId(a.phraseId, b.phraseId));
		const items = sorted.map(p => {
			const phraseId = String(p.phraseId || '');
			const he = typeof p.he === 'string' ? p.he : (p.hebrew || '');
			let en = '';
			if (enByPhraseId && enByPhraseId.has(phraseId)) en = enByPhraseId.get(phraseId);
			return { phraseId, he, en };
		});
		// B"H: convert scribe [cup] markers to bold — the enrichment phrases
		// carry them raw, and without conversion they leak as literal text.
		const html = items.map(p => p.he || '').join('')
			.replace(/\[cup\]/g, '<b>')
			.replace(/\[\/cup\]/g, '</b>');
		return { sectionId, html, items };
	});
}

/**
 * After a split point, pull any immediately-following closing tags
 * (</h3>, </sup>, ...) into the current phrase so tags don't leak
 * into the next phrase and break rendering.
 * @returns {number} The new index after the consumed tags.
 */
function pullClosingTags(src, i, append) {
	const rest = src.slice(i + 1);
	const m = rest.match(/^((?:<\/[^>]+>\s*)+)/);
	if (m && m[1]) {
		append(m[1]);
		return i + m[1].length;
	}
	return i;
}

/**
 * Splits Hebrew HTML into phrase blocks by Yaakov's punctuation rule.
 * HTML tags and [cup] markers are atomic — never split inside them.
 * @param {string} html Section Hebrew HTML.
 * @returns {Array<string>} Phrase HTML blocks.
 */
export function splitHebrewPhrases(html) {
	const phrases = [];
	let current = '';
	let inTag = false;
	const flush = () => {
		const textOnly = current.replace(/<[^>]*>/g, '').replace(/\[cup\]|\[\/cup\]/g, '').trim();
		if (textOnly) phrases.push(current.trim());
		current = '';
	};
	const src = String(html || '');
	for (let i = 0; i < src.length; i++) {
		const ch = src[i];
		if (ch === '<') inTag = true;
		if (inTag) {
			current += ch;
			if (ch === '>') inTag = false;
			continue;
		}
		// [cup] markers are atomic tags, not brackets.
		if (ch === '[' && (src.startsWith('[cup]', i) || src.startsWith('[/cup]', i))) {
			const end = src.indexOf(']', i);
			current += src.slice(i, end + 1);
			i = end;
			continue;
		}
		if (ch === '[' || ch === '(') {
			flush(); // start of bracket begins the next phrase
			current += ch;
		} else if (ch === ']' || ch === ')') {
			current += ch;
			i = pullClosingTags(src, i, s => { current += s; });
			flush(); // end of bracket ends the phrase
		} else if (ch === '.' || ch === ',') {
			current += ch;
			i = pullClosingTags(src, i, s => { current += s; });
			flush(); // comma / period split, even inside brackets
		} else {
			current += ch;
		}
	}
	// B"H: drop a trailing unclosed tag (e.g. a phrase truncated mid-tag like
	// "<sup data-fn="1"). Browsers render a "<" with no closing ">" as literal
	// text, which leaks raw markup into the visible page.
	if (inTag) {
		const cut = current.lastIndexOf('<');
		if (cut !== -1) current = current.slice(0, cut);
		inTag = false;
	}
	flush();
	return phrases;
}

/* ---------------------------------------------------------------------------
 * B"H — Phrase-level English + footnote markers.
 * Yaakov: translations for EVERY phrase (English beneath its own Hebrew
 * phrase, never a section blob); footnotes as tappable <sup> markers that
 * open the footnote popup, never scroll-to-bottom.
 * ------------------------------------------------------------------------- */

/**
 * Builds the phrase English lookup: enrichment.translation_en_phrases
 * joined on phraseId. Tolerates variant field spellings from the pipeline.
 * @param {Array} enPhrases Raw translation_en_phrases array.
 * @returns {Map<string,string>} phraseId -> English text.
 */
export function buildPhraseEnglishMap(enPhrases) {
	const map = new Map();
	for (const p of enPhrases || []) {
		const phraseId = p.phraseId || p.phrase_id || p.id || p.segmentId;
		const en = p.en || p.english || p.text;
		if (phraseId && en && !map.has(String(phraseId))) {
			map.set(String(phraseId), String(en));
		}
	}
	return map;
}

/** True when an HTML/text fragment carries visible characters. */
function hasVisibleText(fragment) {
	return String(fragment || '')
		.replace(/<[^>]*>/g, '')
		.replace(/\[cup\]|\[\/cup\]/g, '')
		.trim().length > 0;
}

/**
 * B"H — [cup] markers become bold (the dibur hamatchil). Module-level so
 * EVERY Hebrew render path uses it — phrase blocks, footnote bodies, etc.
 * Raw [cup] tokens must never leak to the page.
 */
export function toCupHtml(he) {
	return String(he || '')
		.replace(/\[cup\]/g, '<b>')
		.replace(/\[\/cup\]/g, '</b>');
}

/**
 * Decodes HTML entities carried as text in the data (e.g. footnote bodies
 * with `&lt;b&gt;`). Uses a textarea so only entities decode — no markup
 * is parsed here.
 */
export function decodeHtmlEntities(s) {
	if (typeof document === 'undefined') return String(s || '');
	const t = document.createElement('textarea');
	t.innerHTML = String(s || '');
	return t.value;
}

/**
 * Sanitizes footnote HTML: decodes entities, then strips dangerous elements
 * and event-handler attributes. Safe inline markup (b, i, em, strong) survives.
 */
export function sanitizeFootnoteHtml(raw) {
	if (typeof document === 'undefined') return String(raw || '');
	const decoded = decodeHtmlEntities(raw);
	const div = document.createElement('div');
	div.innerHTML = decoded;
	div.querySelectorAll('script, style, iframe, object, embed, link, meta, form, input, button').forEach(n => n.remove());
	div.querySelectorAll('*').forEach(n => {
		for (const attr of Array.from(n.attributes)) {
			if (/^on/i.test(attr.name) || attr.name === 'srcdoc') n.removeAttribute(attr.name);
		}
		const href = n.getAttribute('href');
		if (href && /^\s*javascript:/i.test(href)) n.removeAttribute('href');
	});
	return div.innerHTML;
}

/** Sets a footnote body's HTML safely: [cup]→bold, entities decoded, sanitized. */
export function setFootnoteBodyHtml(elm, raw) {
	if (!elm) return;
	elm.innerHTML = sanitizeFootnoteHtml(toCupHtml(raw));
}

/**
 * One footnote marker element, as HTML. The sefer's delegated click/keydown
 * handlers pick up sup.meluket-fn-marker[data-fn] and open the popup.
 */
function footnoteMarkerHtml(fnNum) {
	const n = String(fnNum);
	return `<sup class="meluket-fn-marker" data-fn="${n}" role="button" tabindex="0" aria-label="Footnote ${n}">${n}</sup>`;
}

/**
 * Renders one English phrase string as HTML with footnote markers.
 * - A literal `<sup data-fn="N">N</sup>` carried as TEXT in the data becomes
 *   a real marker (textContent used to escape it — that is why Yaakov saw
 *   raw markup on the page).
 * - Year+footnote ("56543" = year 5654 + footnote 3): the year stays as
 *   text, only the trailing 1-2 digits become a marker.
 * - Footnote after an abbreviation period ("etc.1", "etc.2"): a letter, a
 *   period, then 1-3 digits and a boundary. A digit before the period
 *   ("3.14") is a decimal, never a footnote.
 * - Digits glued to a word ("Yitzchak10", "discourses33", "etc.\"2"),
 *   mid-phrase or at phrase end: a letter (or closing quote/paren/bracket)
 *   immediately followed by 1-3 digits, then a boundary.
 * - Bare trailing footnote digits ("…Israel 5.") become a marker. Only 1-3
 *   digits, so years like 1967 are left alone.
 * Standalone numbers ("in 1967", "chapter 3") are never touched.
 * Everything else is HTML-escaped, so innerHTML is safe here.
 */
export function renderEnglishWithFootnotes(enText) {
	const placeholders = [];
	const illegible = [];
	const SUP_LITERAL_RE = /<sup\b[^>]*\bdata-fn="(\d+)"[^>]*>\s*(\d+)\s*<\/sup\s*>/gi;
	let text = String(enText || '').replace(SUP_LITERAL_RE, (m, fnNum) => {
		placeholders.push(fnNum);
		return `\u0000FN${placeholders.length - 1}\u0000`;
	});
	// B"H — a footnote whose number is illegible in the source carries
	// data-fn="?" (with an explanatory title). It can never match the
	// numeric pattern above, so without this pass it fell through to the
	// escaping step and printed as raw markup on the page. Give it an
	// honest, non-interactive "?" marker instead: the footnote exists,
	// only its number cannot be read.
	const SUP_ILLEGIBLE_RE = /<sup\b[^>]*\bdata-fn="[^"\d][^"]*"[^>]*>\s*[^<]*?\s*<\/sup\s*>|<sup\b[^>]*\bdata-fn="[^"\d][^"]*"[^>]*>/gi;
	text = text.replace(SUP_ILLEGIBLE_RE, () => {
		illegible.push(true);
		return `\u0000FX${illegible.length - 1}\u0000`;
	});
	// B"H 2026-11-09 — year+footnote and digits glued to a word, mid-phrase.
	// The old trailing-only pass never saw these: a year+footnote is 5-6
	// digits ("56543" = year 5654 + footnote 3), and a mid-phrase marker
	// ("Yitzchak10", "discourses33", "etc.\"2") is not at phrase end — so
	// they stayed plain inline numbers. Same placeholder flow as above.
	// Year+footnote: 4-digit Hebrew year (55xx-58xx) + 1-2 footnote digits;
	// the year stays as text. The (?!\d) lookahead is safe here: this
	// pattern can never match a \u0000FN…\u0000 placeholder (no "5" in it).
	text = text.replace(/(^|[^\dA-Za-z])(5[5-8]\d{2})([1-9]\d?)(?!\d)/g, (m, prefix, year, fnNum) => {
		placeholders.push(fnNum);
		return `${prefix}${year}\u0000FN${placeholders.length - 1}\u0000`;
	});
	// Footnote after an abbreviation period ("etc.1", "etc.2"): a letter, a
	// period, then 1-3 digits and a boundary. A digit before the period
	// ("3.14") is a decimal, never a footnote, so it never matches.
	text = text.replace(/([A-Za-z])\.(\d{1,3})([\s.,;:!?…‥"”"'')\]\):—–-]|$)/g, (m, letter, digits, tail) => {
		placeholders.push(digits);
		return `${letter}.\u0000FN${placeholders.length - 1}\u0000${tail}`;
	});
	// Digits glued to a word: a letter (or closing quote/paren/bracket)
	// immediately followed by 1-3 digits, then a boundary. Standalone
	// numbers ("in 1967", "chapter 3") are never touched — they are
	// preceded by a space, not a letter. Tail-capture, never a lookahead:
	// a NUL after a placeholder digit can never satisfy the tail, so
	// stashed markers are never re-matched.
	text = text.replace(/([A-Za-z"”'’\)\]\}])(\d{1,3})([\s.,;:!?…‥"”"'')\]\):—–-]|$)/g, (m, letter, digits, tail) => {
		placeholders.push(digits);
		return `${letter}\u0000FN${placeholders.length - 1}\u0000${tail}`;
	});
	// Bare trailing digits: preceded by a non-digit (or start of phrase),
	// 1-3 digits, then only closing punctuation/whitespace to phrase end.
	text = text.replace(/(^|\D)(\d{1,3})([.!?…‥"”"'')\];:—–-]*\s*)$/, (m, pre, digits, tail) => {
		placeholders.push(digits);
		return `${pre}\u0000FN${placeholders.length - 1}\u0000${tail}`;
	});
	const escaped = text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
	return escaped
		.replace(/\u0000FN(\d+)\u0000/g, (m, idx) => footnoteMarkerHtml(placeholders[Number(idx)]))
		.replace(/\u0000FX(\d+)\u0000/g, () => '<sup class="meluket-fn-illegible" data-fn="?" title="Footnote number illegible in source">?</sup>');
}

/**
 * Converts bare trailing footnote digits in Hebrew HTML to real <sup> markers.
 * The data carries markers as plain digits ("ה'תשכ"ג1") — no <sup> in data.
 * Only the phrase block's LAST text node is touched, and only 1-3 trailing
 * digits, so years and in-content numbers are never mangled. Text inside
 * existing <sup> markers is left alone.
 */
export function convertBareFootnoteDigits(root) {
	if (!root || typeof document === 'undefined' || !document.createTreeWalker) return;
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
		acceptNode(n) {
			if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_SKIP;
			const p = n.parentElement;
			if (p && p.closest && p.closest('sup')) return NodeFilter.FILTER_REJECT;
			return NodeFilter.FILTER_ACCEPT;
		}
	});
	const nodes = [];
	let cur;
	while ((cur = walker.nextNode())) nodes.push(cur);
	// B"H — Coby Nov 10: some footnotes still render as plain digits.
	// The old pass converted only the LAST text node's trailing digits
	// (one footnote per phrase). A phrase can carry several markers, and a
	// marker can sit mid-phrase glued to a Hebrew word. Convert every
	// footnote digit in every text node: 1-2 digits glued to a Hebrew
	// letter, or bare trailing digits. A standalone 4-digit year (5746)
	// is never touched: it is not glued to a Hebrew letter, and the
	// 1-2 digit glued match refuses a following digit.
	const HEB = '\\u0590-\\u05FF';
	const GLUED_RE = new RegExp(`([${HEB}])(\\d{1,2})(?!\\d)`, 'g');
	const TRAILING_RE = /(^|\D)(\d{1,3})([.!?…‥""'')\];:—–-]*\s*)$/;
	// B"H — Nov 10, 2026: footnote 1 on the live maamar stayed plain:
	// "גו'1," — the digit follows a geresh (') after a Hebrew letter,
	// not a Hebrew letter itself, and sits mid-phrase, so neither the
	// glued pass nor the trailing pass saw it. Same for a digit after
	// a closing quote/paren/bracket that follows Hebrew. 1-2 digits
	// only, never followed by another digit, so a year (5746) or a
	// longer number can never match through this pass.
	const GERESH_RE = /([\u0590-\u05FF]['"\u05F3\u05F4\)\]\}])(\d{1,2})(?!\d)/g;
	for (const node of nodes) {
		const value = node.nodeValue;
		if (!value) continue;
		const parent = node.parentNode;
		if (!parent) continue;
		const matches = [];
		let m;
		GLUED_RE.lastIndex = 0;
		while ((m = GLUED_RE.exec(value))) {
			matches.push({ start: m.index + m[1].length, end: m.index + m[0].length, digits: m[2] });
		}
		GERESH_RE.lastIndex = 0;
		while ((m = GERESH_RE.exec(value))) {
			const start = m.index + m[1].length;
			if (!matches.some((x) => x.start === start)) {
				matches.push({ start, end: start + m[2].length, digits: m[2] });
			}
		}
		const tm = value.match(TRAILING_RE);
		if (tm) {
			const tStart = value.length - tm[0].length + tm[1].length;
			const tEnd = tStart + tm[2].length;
			if (!matches.some(x => x.start === tStart)) {
				matches.push({ start: tStart, end: tEnd, digits: tm[2] });
			}
		}
		if (!matches.length) continue;
		matches.sort((a, b) => a.start - b.start);
		const frag = document.createDocumentFragment();
		let pos = 0;
		for (const match of matches) {
			if (match.start > pos) frag.appendChild(document.createTextNode(value.slice(pos, match.start)));
			const sup = document.createElement('sup');
			sup.setAttribute('data-fn', match.digits);
			sup.textContent = match.digits;
			// B"H round 16 — the sefer's delegated click/keydown handlers
			// only match sup.meluket-fn-marker[data-fn], so a plain sup
			// here was inert: tapping a Hebrew footnote digit did nothing
			// while the English markers opened the popup. Give the Hebrew
			// sup the same marker class + button semantics (no id — the
			// shelf's scroll-back id is set by enhanceFootnoteSup on the
			// client build path, and stamping one here would risk
			// duplicates across phrases). The class also gives it the
			// marker's gold-accent superscript style, matching English.
			sup.classList.add('meluket-fn-marker');
			sup.setAttribute('role', 'button');
			sup.setAttribute('tabindex', '0');
			sup.setAttribute('aria-label', `Footnote ${match.digits}`);
			frag.appendChild(sup);
			pos = match.end;
		}
		if (pos < value.length) frag.appendChild(document.createTextNode(value.slice(pos)));
		parent.replaceChild(frag, node);
	}
}

/**
 * Enhances one <sup> into a tappable footnote marker. Idempotent — safe to
 * run over markers that already carry the class (e.g. from
 * renderEnglishWithFootnotes). The sefer's delegated click/keydown handlers
 * open the footnote popup from sup.meluket-fn-marker[data-fn].
 */
function enhanceFootnoteSup(sup, idx) {
	const text = sup.textContent.trim();
	const numMatch = text.match(/(\d+)/);
	const fnNum = numMatch ? numMatch[1] : String(idx + 1);
	sup.classList.add('meluket-fn-marker');
	sup.setAttribute('data-fn', fnNum);
	// Unique ID allows the shelf to scroll back to THIS specific marker
	// (handles duplicate footnote numbers referenced from multiple places).
	sup.id = `meluket-fn-marker-${fnNum}-${idx}`;
	sup.setAttribute('aria-label', `Footnote ${fnNum}`);
	sup.setAttribute('role', 'button');
	sup.setAttribute('tabindex', '0');
}

/**
 * Builds one sefer section with TRUE phrase interleaving: for each phrase, a
 * `.meluket-phrase-pair` wrapper holds the Hebrew `.meluket-phrase` block
 * IMMEDIATELY followed by its English `.meluket-phrase` block — never a
 * separate English vessel after all the Hebrew (Yaakov's defect #3).
 * A pair renders when it has Hebrew or English; empty Hebrew blocks are
 * skipped (no blank blocks) but their English is preserved, never dropped.
 * Falls back to the legacy section-level English blob for posts whose
 * enrichment has no translation_en_phrases yet. Plus the section summary.
 * B"H — phrase-level English (joined on phraseId) replaces the old
 * section-level English blob.
 */
export function buildSectionElement(sectionIndex, sectionId, hebrewItems, englishFallback, sectionSummary, langMode) {
	const section = document.createElement('section');
	section.className = 'meluket-sefer-section';
	section.dataset.sectionId = sectionId;
	section.dataset.sectionIndex = String(sectionIndex);
	// B"H — stable anchor so flowchart links (#sec-001) scroll here natively.
	if (sectionId && /^[A-Za-z][\w\-.]*$/.test(sectionId)) {
		section.id = sectionId;
	}
	section.setAttribute('dir', 'auto');

	// Section number marker — like a siman in a printed sefer.
	const marker = document.createElement('div');
	marker.className = 'meluket-section-marker';
	marker.setAttribute('aria-hidden', 'true');
	const markerInner = document.createElement('span');
	markerInner.className = 'meluket-section-number';
	markerInner.textContent = String(sectionIndex + 1);
	marker.appendChild(markerInner);
	section.appendChild(marker);

	// Interleaved phrase pairs — Hebrew block, then ITS English directly
	// beneath. One pair per phrase; the English never gathers into a
	// separate section-level block.
	const items = Array.isArray(hebrewItems) ? hebrewItems : [];
	let renderedPairs = 0;
	for (const item of items) {
		const heText = item.he;
		const enText = item.en;
		const hasHe = hasVisibleText(heText);
		const hasEn = enText && String(enText).trim().length > 0;
		// Skip fully-empty artifacts (no Hebrew AND no English).
		if (!hasHe && !hasEn) continue;
		const pair = document.createElement('div');
		pair.className = 'meluket-phrase-pair';
		if (item.phraseId) pair.dataset.phraseId = String(item.phraseId);
		if (hasHe) {
			const heBlock = document.createElement('div');
			heBlock.className = 'meluket-phrase meluket-phrase--he';
			if (item.phraseId) heBlock.dataset.phraseId = String(item.phraseId);
			heBlock.setAttribute('dir', 'rtl');
			heBlock.setAttribute('lang', 'he');
			heBlock.innerHTML = toCupHtml(heText);
			// B"H: the data carries footnote markers as bare trailing digits —
			// no <sup> in the data. Convert them to real markers at render time.
			convertBareFootnoteDigits(heBlock);
			pair.appendChild(heBlock);
		}
		if (hasEn) {
			const enBlock = document.createElement('div');
			enBlock.className = 'meluket-phrase meluket-phrase--en';
			if (item.phraseId) enBlock.dataset.phraseId = String(item.phraseId);
			enBlock.setAttribute('dir', 'ltr');
			enBlock.setAttribute('lang', 'en');
			// B"H: innerHTML — never textContent — so footnote markers
			// become real <sup> elements; the renderer escapes the rest.
			enBlock.innerHTML = renderEnglishWithFootnotes(enText);
			pair.appendChild(enBlock);
		}
		section.appendChild(pair);
		renderedPairs++;
	}

	// Section-level English fallback — only when NO phrase pairs rendered
	// (posts whose enrichment has no translation_en_phrases yet).
	if (renderedPairs === 0 && englishFallback && String(englishFallback).trim()) {
		const english = document.createElement('div');
		english.className = 'meluket-english';
		english.setAttribute('dir', 'ltr');
		english.setAttribute('lang', 'en');
		const paragraphs = String(englishFallback).split(/\n{2,}|\r\n{2,}/);
		for (const para of paragraphs) {
			const trimmed = para.trim();
			if (!trimmed) continue;
			const p = document.createElement('p');
			p.innerHTML = renderEnglishWithFootnotes(trimmed);
			english.appendChild(p);
		}
		section.appendChild(english);
	}

	// Footnote markers — in Hebrew AND English — stay as <sup> tags
	// (Yaakov: never buttons). Enhanced in place: clickable, accessible,
	// and the sefer's delegated handlers open the footnote popup.
	section.querySelectorAll('sup').forEach((sup, idx) => enhanceFootnoteSup(sup, idx));

	// Section summary — the hadracha beneath the translation.
	if (sectionSummary && String(sectionSummary).trim()) {
		const summary = document.createElement('div');
		summary.className = 'meluket-summary';
		summary.setAttribute('dir', 'ltr');
		summary.setAttribute('lang', 'en');
		const label = document.createElement('div');
		label.className = 'meluket-summary-label';
		label.textContent = 'Summary';
		summary.appendChild(label);
		const body = document.createElement('p');
		body.textContent = String(sectionSummary).trim();
		summary.appendChild(body);
		section.appendChild(summary);
	}

	section.dataset.langMode = langMode;
	return section;
}

/**
 * Builds the language toggle control (עברית / English / Both).
 */
function buildLangToggle(currentMode, onChange) {
	const wrap = document.createElement('div');
	wrap.className = 'meluket-lang-toggle';
	wrap.setAttribute('role', 'group');
	wrap.setAttribute('aria-label', 'Language display');

	const modes = [
		{ id: 'both', he: 'עב + EN', en: 'Both' },
		{ id: 'hebrew', he: 'עברית', en: 'Hebrew' },
		{ id: 'english', he: 'English', en: 'English' }
	];
	for (const mode of modes) {
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'meluket-lang-btn' + (mode.id === currentMode ? ' is-active' : '');
		btn.dataset.langMode = mode.id;
		btn.textContent = mode.he;
		btn.setAttribute('aria-pressed', mode.id === currentMode ? 'true' : 'false');
		btn.addEventListener('click', () => {
			wrap.querySelectorAll('.meluket-lang-btn').forEach(b => {
				b.classList.remove('is-active');
				b.setAttribute('aria-pressed', 'false');
			});
			btn.classList.add('is-active');
			btn.setAttribute('aria-pressed', 'true');
			onChange(mode.id);
		});
		wrap.appendChild(btn);
	}
	return wrap;
}

/**
 * B"H — Yaakov: the language toggle lives ONLY in the Scribe's Lens settings
 * panel, NEVER on the main page. Injects the toggle into #typographyDetails
 * as a proper settings-group. If the panel isn't in the DOM yet, hides the
 * toggle (CSS safety net covers .meluket-sefer > .meluket-lang-toggle).
 */
function injectLangToggleIntoSettings(toggle) {
	const panel = document.querySelector('#typographyDetails .typography-content');
	if (!panel) {
		toggle.style.display = 'none';
		return;
	}
	const group = document.createElement('div');
	group.className = 'settings-group meluket-lang-settings-group';
	const label = document.createElement('div');
	label.className = 'control-label';
	label.textContent = 'Language';
	group.appendChild(label);
	toggle.classList.add('meluket-lang-toggle-panel');
	group.appendChild(toggle);
	// Place after the Scribe's Lens header group, or at the top.
	const firstGroup = panel.querySelector('.settings-group');
	if (firstGroup && firstGroup.nextSibling) {
		panel.insertBefore(group, firstGroup.nextSibling);
	} else {
		panel.prepend(group);
	}
}

/**
 * B"H — Scribe's Lens panel enhancements: the ✕ close button in the panel
 * header closes the sheet (via the Aa trigger, keeping gate aria in sync),
 * and range sliders get a --fill percent so the gold track fill follows
 * the thumb. Idempotent: safe to call on re-render.
 */
function enhanceScribeLensPanel() {
	const panel = document.getElementById('typographyDetails');
	if (!panel || panel.dataset.lensEnhanced === '1') {
		return;
	}
	panel.dataset.lensEnhanced = '1';
	const closeBtn = document.getElementById('scribeLensClose');
	// B"H — core listeners (ControlBindings.setupSheetCloseButton) already bind
	// this through the typography gate on every post; only bind here as a
	// fallback so the handler never doubles.
	if (closeBtn && closeBtn.dataset.awtsmoosCloseBound !== 'true') {
		closeBtn.dataset.awtsmoosCloseBound = 'true';
		closeBtn.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			// Directly hide the panel - don't rely on trigger button
			panel.classList.add('hidden-details');
			panel.setAttribute('aria-hidden', 'true');
			const trigger = document.getElementById('typographyBtn');
			if (trigger) {
				trigger.setAttribute('aria-expanded', 'false');
			}
		});
	}
	const paintFill = (range) => {
		const min = parseFloat(range.min || '0');
		const max = parseFloat(range.max || '100');
		const val = parseFloat(range.value || '0');
		const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
		range.style.setProperty('--fill', pct.toFixed(1) + '%');
	};
	panel.querySelectorAll('input[type="range"]').forEach(paintFill);
	panel.addEventListener('input', (event) => {
		if (event.target && event.target.matches && event.target.matches('input[type="range"]')) {
			paintFill(event.target);
		}
	});
}

/**
 * B"H — Torah Ohr argument flowchart ("The argument at a glance").
 * Renders the authoritative flowchart HTML stored on post.flowchart.html,
 * sanitizes it, and wires the section links to smooth-scroll to the
 * matching rendered sections.
 * @param {object} post The post object.
 * @returns {HTMLElement|null} The flowchart element, or null if none.
 */
function buildFlowchartElement(post) {
	const flowData = post && post.flowchart;
	const html = flowData && typeof flowData.html === 'string' ? flowData.html.trim() : '';
	if (!html) {
		return null;
	}
	// Light sanitization: the HTML comes from our own authored master file,
	// but strip anything executable just in case.
	const clean = html
		.replace(/<script[\s\S]*?<\/script>/gi, '')
		.replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
		.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
	if (!clean || clean.indexOf('fnode') < 0) {
		return null;
	}
	const wrap = document.createElement('div');
	wrap.className = 'torah-ohr-flowchart-wrap';
	wrap.setAttribute('data-flowchart', 'true');
	const inner = document.createElement('div');
	inner.className = 'torah-ohr-flowchart';
	inner.innerHTML = clean;
	wrap.appendChild(inner);
	// Wire section links: smooth-scroll to the rendered section.
	wrap.querySelectorAll('a[href^="#"]').forEach(link => {
		link.addEventListener('click', (e) => {
			const targetId = link.getAttribute('href').slice(1);
			if (!targetId) {
				return;
			}
			const target = document.getElementById(targetId)
				|| document.querySelector('[data-section-id="' + targetId + '"]');
			if (target) {
				e.preventDefault();
				target.scrollIntoView({ behavior: 'smooth', block: 'start' });
				target.classList.add('flowchart-target-flash');
				setTimeout(() => target.classList.remove('flowchart-target-flash'), 1600);
			}
		});
	});
	return wrap;
}

/**
 * Applies the language mode to all sefer sections.
 */
function applyLangMode(root, mode, englishTabTitle) {
	root.dataset.langMode = mode;
	root.querySelectorAll('.meluket-sefer-section').forEach(section => {
		section.dataset.langMode = mode;
	});
	// Hide Hebrew titles via JS (both sefer title and old post title)
	const titleHe = root.querySelector('.meluket-sefer-title-he');
	if (titleHe) {
		titleHe.style.display = (mode === 'english') ? 'none' : '';
	}
	// Also hide the preserved old post-title (stored reference on sefer)
	const preservedTitle = root._preservedTitle;
	if (preservedTitle) {
		preservedTitle.style.display = (mode === 'english') ? 'none' : '';
	}
	// Update document tab title in English mode
	if (mode === 'english') {
		// Save original title if not already saved
		if (!document._originalTitle) document._originalTitle = document.title;
		// Use English title for the tab (Meluket default for Meluket posts)
		document.title = englishTabTitle || 'Meluket - English | Awtsmoos';
	} else {
		if (document._originalTitle) document.title = document._originalTitle;
	}
	try {
		localStorage.setItem('meluket-lang-mode', mode);
	} catch (_) { /* private mode */ }
}

function readSavedLangMode() {
	try {
		const saved = localStorage.getItem('meluket-lang-mode');
		if (saved === 'hebrew' || saved === 'english' || saved === 'both') return saved;
	} catch (_) { /* ignore */ }
	return 'both';
}

function el(tag, className, text) {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text) node.textContent = text;
	return node;
}

/* ---------------------------------------------------------------------------
 * B"H — Footnote popup (Yaakov: popup, never scroll-to-bottom).
 * Tapping a <sup class="meluket-fn-marker"> opens an elegant modal with the
 * footnote text instead of scrolling to the shelf. Built lazily, dream-styled
 * via the awtsmoos-dream-sources-fn style block. No !important, ever.
 * ------------------------------------------------------------------------- */
let fnOverlayEl = null;
let fnModalEl = null;
let fnNumEl = null;
let fnBodyEl = null;
let fnCloseEl = null;
let fnLastMarker = null;

function ensureFootnoteModal() {
	if (fnModalEl) return;
	const root = document.querySelector('.post-reader-localized-context') || document.body;
	fnOverlayEl = el('div', 'awtsmoos-fn-overlay');
	fnOverlayEl.setAttribute('aria-hidden', 'true');
	fnModalEl = el('div', 'awtsmoos-fn-modal');
	fnModalEl.setAttribute('role', 'dialog');
	fnModalEl.setAttribute('aria-modal', 'true');
	fnModalEl.setAttribute('aria-label', 'Footnote');
	const head = el('div', 'awtsmoos-fn-head');
	fnNumEl = el('span', 'awtsmoos-fn-num', '');
	const headTitle = el('span', 'awtsmoos-fn-title', 'הערה · Footnote');
	fnCloseEl = el('button', 'awtsmoos-fn-close', '✕');
	fnCloseEl.type = 'button';
	fnCloseEl.setAttribute('aria-label', 'Close footnote');
	head.append(fnNumEl, headTitle, fnCloseEl);
	fnBodyEl = el('div', 'awtsmoos-fn-body');
	fnModalEl.append(head, fnBodyEl);
	root.append(fnOverlayEl, fnModalEl);
	fnCloseEl.addEventListener('click', closeFootnotePopup);
	fnOverlayEl.addEventListener('click', closeFootnotePopup);
}

function openFootnotePopup(fnNum, marker, sefer) {
	// B"H — body source order (Coby 2026-11-11): the post's footnotes[]
	// array FIRST (matched by its real footnote number), then the shelf
	// DOM, then the content parse below. One order, every post type.
	// Tapping a marker must ALWAYS do something: if no source has the
	// note, show the number with an honest message, never silence.
	let apiFn = null;
	{
		const apiFootnotes =
			(window.post && Array.isArray(window.post.footnotes) && window.post.footnotes) ||
			(srcCachedData && srcCachedData.post && Array.isArray(srcCachedData.post.footnotes) && srcCachedData.post.footnotes) ||
			[];
		apiFn = apiFootnotes.find(fn => fn && String(fn.n ?? fn.num ?? fn.number ?? '') === String(fnNum)) || null;
	}
	let note = null;
	if (!apiFn) {
		try {
			note = sefer && sefer.querySelector ? sefer.querySelector(`.meluket-footnote[data-fn="${fnNum}"]`) : null;
		} catch (_) { /* invalid selector chars */ }
		if (!note) {
			try {
				note = document.querySelector(`.meluket-footnote[data-fn="${fnNum}"], #meluket-fn-${fnNum}`);
			} catch (_) { /* invalid selector chars */ }
		}
	}
	// B"H 2026-11-10 — last fallback: the bodies live in the post's own
	// content after the הערות: heading (the API array above is empty for
	// these posts). Parse them so a tap shows the real note instead of
	// "content not available".
	if (!note && !apiFn) {
		const content = (typeof window !== 'undefined' && window.post && window.post.content)
			|| (srcCachedData && srcCachedData.post && srcCachedData.post.content) || '';
		const parsed = parseContentFootnotes(content);
		apiFn = parsed.find(fn => String(fn.n) === String(fnNum)) || null;
	}
	ensureFootnoteModal();
	fnNumEl.textContent = fnNum;
	fnBodyEl.innerHTML = '';
	if (apiFn) {
		const heBody = apiFn.hebrew || apiFn.body || '';
		const enBody = apiFn.english || apiFn.body_en || '';
		if (heBody) {
			const h = el('div', 'awtsmoos-fn-he');
			h.setAttribute('dir', 'rtl');
			h.setAttribute('lang', 'he');
			setFootnoteBodyHtml(h, heBody);
			fnBodyEl.appendChild(h);
		}
		if (enBody) {
			const e = el('div', 'awtsmoos-fn-en');
			e.setAttribute('dir', 'ltr');
			e.setAttribute('lang', 'en');
			e.textContent = enBody;
			fnBodyEl.appendChild(e);
		}
		if (!heBody && !enBody) {
			const f = el('div', 'awtsmoos-fn-en');
			f.setAttribute('dir', 'auto');
			f.textContent = `Footnote ${fnNum}`;
			fnBodyEl.appendChild(f);
		}
	} else if (!note) {
		const f = el('div', 'awtsmoos-fn-en');
		f.setAttribute('dir', 'auto');
		f.textContent = `Footnote ${fnNum} — content not available for this post yet.`;
		fnBodyEl.appendChild(f);
	} else {
		const he = note.querySelector('.meluket-footnote-he');
		const en = note.querySelector('.meluket-footnote-en');
		if (he) {
			const h = el('div', 'awtsmoos-fn-he');
			h.setAttribute('dir', 'rtl');
			h.setAttribute('lang', 'he');
			// B"H: the shelf is already sanitized; re-decode defensively so the
			// popup never shows literal &lt;b&gt; / [cup] text.
			setFootnoteBodyHtml(h, he.innerHTML);
			fnBodyEl.appendChild(h);
		}
		if (en) {
			const e = el('div', 'awtsmoos-fn-en');
			e.setAttribute('dir', 'ltr');
			e.setAttribute('lang', 'en');
			e.textContent = en.textContent;
			fnBodyEl.appendChild(e);
		}
		if (!he && !en) {
			const f = el('div', 'awtsmoos-fn-en');
			f.setAttribute('dir', 'auto');
			f.textContent = note.textContent.trim();
			fnBodyEl.appendChild(f);
		}
	}
	fnLastMarker = marker || null;
	fnOverlayEl.classList.add('is-open');
	fnModalEl.classList.add('is-open');
	try { fnCloseEl.focus({ preventScroll: true }); } catch (_) { /* focus optional */ }
}

function closeFootnotePopup() {
	if (!fnModalEl) return;
	fnOverlayEl.classList.remove('is-open');
	fnModalEl.classList.remove('is-open');
	if (fnLastMarker && typeof fnLastMarker.focus === 'function') {
		fnLastMarker.focus({ preventScroll: true });
	}
	fnLastMarker = null;
}

function isFootnotePopupOpen() {
	return !!(fnModalEl && fnModalEl.classList.contains('is-open'));
}

/* ---------------------------------------------------------------------------
 * B"H — Sources sheet (Yaakov: the Sources button must open a real menu).
 * A dream-styled bottom sheet showing this post's sources (sefer, series,
 * author) plus a per-section index. Every section row carries a Comment
 * affordance: an inline composer that posts a real comment anchored to that
 * section via the site's comment-tree endpoint. The commentaryBtn hijack is
 * installed at capture phase so the generic sidebar toggle never fires on
 * Meluket posts; non-Meluket posts are untouched.
 * ------------------------------------------------------------------------- */
let srcOverlayEl = null;
let srcSheetEl = null;
let srcCloseEl = null;
let srcMetaEl = null;
let srcCrumbEl = null;
let srcTabsEl = null;
let srcListEl = null;
let srcOpen = false;
let srcCurrentTab = 'sections';
let srcCachedData = null;
// B"H round 11: the footnote list is rebuilt on every dialog open, which
// wiped the .is-open mark on the tapped item. Remember the last tapped
// footnote number (and its highlighted card) across rebuilds so the mark
// and the gold survive a reopen.
let lastTappedFootnoteNum = null;
let lastFnActiveCard = null;

function sourcesReaderRoot() {
	return document.querySelector('.post-reader-localized-context') || document.body;
}

function sourcesActiveAlias() {
	try {
		const alias = window.curAlias
			|| localStorage.getItem('lastAliasUsed')
			|| localStorage.getItem('awtsmoos-alias')
			|| '';
		if (alias) window.curAlias = alias;
		return alias;
	} catch (_) { return ''; }
}

function ensureSourcesSheet() {
	if (srcSheetEl) return;
	const root = sourcesReaderRoot();
	srcOverlayEl = el('div', 'awtsmoos-src-overlay');
	srcOverlayEl.setAttribute('aria-hidden', 'true');
	srcSheetEl = el('div', 'awtsmoos-src-sheet');
	srcSheetEl.setAttribute('role', 'dialog');
	srcSheetEl.setAttribute('aria-modal', 'true');
	srcSheetEl.setAttribute('aria-label', 'Sources');
	const grab = el('div', 'awtsmoos-src-grab');
	grab.setAttribute('aria-hidden', 'true');
	const head = el('div', 'awtsmoos-src-head');
	const headTitle = el('div', 'awtsmoos-src-title', 'מקורות · Sources');
	srcCloseEl = el('button', 'awtsmoos-src-close', '✕');
	srcCloseEl.type = 'button';
	srcCloseEl.setAttribute('aria-label', 'Close sources');
	head.append(headTitle, srcCloseEl);
	srcMetaEl = el('div', 'awtsmoos-src-meta');
	srcCrumbEl = el('nav', 'awtsmoos-src-crumb');
	srcCrumbEl.setAttribute('aria-label', 'Breadcrumb');
	srcTabsEl = el('div', 'awtsmoos-src-tabs');
	srcTabsEl.setAttribute('role', 'tablist');
	srcListEl = el('div', 'awtsmoos-src-list');
	srcListEl.setAttribute('role', 'tabpanel');
	srcSheetEl.append(grab, head, srcCrumbEl, srcMetaEl, srcTabsEl, srcListEl);
	root.append(srcOverlayEl, srcSheetEl);
	srcCloseEl.addEventListener('click', closeSourcesSheet);
	srcOverlayEl.addEventListener('click', closeSourcesSheet);
}

function sourcesSectionPreview(sectionEl) {
	// B"H: with phrase interleaving there is no single .meluket-hebrew vessel;
	// gather the Hebrew phrase blocks (fall back to legacy vessel / raw text).
	const heNodes = sectionEl.querySelectorAll('.meluket-phrase--he');
	const hebrew = sectionEl.querySelector('.meluket-hebrew');
	let raw = '';
	if (heNodes.length) {
		raw = Array.from(heNodes).map(n => n.textContent).join(' ');
	} else {
		raw = hebrew ? hebrew.textContent : sectionEl.textContent;
	}
	const clean = String(raw || '').replace(/\s+/g, ' ').trim();
	return clean.length > 90 ? clean.slice(0, 90) + '…' : clean;
}

/**
 * B"H — Yaakov 2026-10-15: Humanizes a raw series ID into a readable name.
 * e.g. "likkuteiSichosVolume10" → "Likkutei Sichos Volume 10".
 */
function humanizeSeriesId(raw) {
	const s = String(raw || '').trim();
	if (!s) return '';
	// Insert spaces before capitals and between letters/digits.
	const spaced = s
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/([A-Za-z])(\d)/g, '$1 $2')
		.replace(/([a-zA-Z])(\d)/g, '$1 $2')
		.replace(/_/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	// Capitalize first letter of each word.
	return spaced.replace(/\b\w/g, c => c.toUpperCase());
}

// B"H 2026-11-10 round 10 — Coby: the Sources dialog showed 55 footnotes
// with anchor text only, never the 64 with bodies. Root cause, proven
// by curling the live API: the post API returns NO footnotes field at
// all, the translations API rows carry no footnotes, and there is no
// /footnotes endpoint — window.post.footnotes is ALWAYS empty, so the
// round-9 refresh poll could never fire. But the bodies ARE in the data
// the client already has: the post's `content` HTML ends with the
// footnotes section after the `הערות:` heading — `<sup>N</sup> Hebrew
// body<br/>English body` for N = 1..64, verified against the live post
// (133 numbered sups: 69 in-text + 64 bodies). Parse them out of the
// content. Returns [{n, hebrew, english}] in number order, or [] when
// the content has no footnotes section (other posts keep the old paths).
function parseContentFootnotes(content) {
	if (typeof content !== 'string' || !content) return [];
	const marker = content.lastIndexOf('הערות:');
	if (marker === -1) return [];
	const tail = content.slice(marker + 'הערות:'.length);
	const parts = tail.split(/<sup>(\d+)<\/sup>/);
	const out = [];
	for (let i = 1; i + 1 < parts.length; i += 2) {
		const n = Number(parts[i]);
		if (!n) continue;
		const body = String(parts[i + 1] || '');
		const split = body.split(/<br\s*\/?>/i);
		const strip = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
		const hebrew = strip(split[0]);
		const english = strip(split.slice(1).join(' '));
		if (hebrew || english) out.push({ n, hebrew, english });
	}
	out.sort((a, b) => a.n - b.n);
	return out;
}

function buildSourcesSheetContent(post, sefer) {
	ensureSourcesSheet();
	const sections = Array.from(sefer.querySelectorAll('.meluket-sefer-section'));
	// B"H — Yaakov 2026-10-15: Use post.footnotes array (API data), not DOM query.
	// The DOM may not have all footnotes rendered; the API array is authoritative.
	// B"H 2026-11-10 round 7: the post object captured when the marker was
	// wired can be a STUB ({title, id: ''} from the embed awaken) — the API
	// had not returned yet, so its footnotes are empty and the dialog said
	// "0 footnotes" even though the markers were in the text. Prefer the
	// LIVE window.post (updated when the API returns) whenever the passed
	// post has no footnotes.
	const liveFootnotes = (typeof window !== 'undefined' && window.post && Array.isArray(window.post.footnotes) && window.post.footnotes.length) ? window.post.footnotes : null;
	const apiFootnotes = (Array.isArray(post.footnotes) && post.footnotes.length) ? post.footnotes : liveFootnotes;
	// B"H 2026-11-10 round 10 — the API footnotes are ALWAYS empty for
	// this post (the live post API returns no footnotes field, the
	// translations rows carry none, there is no /footnotes endpoint —
	// proven by curl). The bodies live in the post's `content` HTML
	// after the `הערות:` heading, so parse them there. This is the
	// primary fallback now; the marker list below is only a last resort
	// for posts whose content carries no footnotes section.
	const contentFootnotes = (!apiFootnotes) ? (() => {
		const content = (post && post.content) || (typeof window !== 'undefined' && window.post && window.post.content) || '';
		const parsed = parseContentFootnotes(content);
		return parsed.length ? parsed : null;
	})() : null;
	const resolvedFootnotes = apiFootnotes || contentFootnotes;
	// B"H 2026-11-10 round 6: when the API data has not arrived yet the
	// sheet said "0 footnotes" / "No footnotes in this post" even though
	// the markers (1–64) were already in the text — the dialog looked
	// broken on a fresh load. Fall back to the shelf, then to the gold
	// <sup> markers in the sefer itself (number + the phrase they sit in,
	// so the list is never empty while the API is still loading).
	const footnotes = resolvedFootnotes
		? resolvedFootnotes
		: (Array.from(sefer.querySelectorAll('.meluket-footnote')).length
			? Array.from(sefer.querySelectorAll('.meluket-footnote'))
			: (() => {
				// B"H round 9 — dedupe by number. The markers exist in BOTH
				// the Hebrew and the English blocks, so the raw list had
				// each footnote twice (and the English-only set omitted the
				// 9 whose English markers are missing from the source text).
				// First marker per number wins; the anchor is the English
				// phrase it sits in (or the pair, as a fallback).
				const byNum = new Map();
				Array.from(sefer.querySelectorAll('.meluket-fn-marker')).forEach((m) => {
					const n = String(m.dataset.fn || m.textContent.trim());
					if (byNum.has(n)) return;
					const phrase = m.closest('.meluket-phrase') || m.closest('.meluket-phrase--en') || m.closest('.meluket-phrase-pair');
					byNum.set(n, { n, _marker: m, _context: phrase ? String(phrase.textContent || '').replace(/\s+/g, ' ').trim() : '' });
				});
				return Array.from(byNum.values());
			})());
	// Cache for tab switching.
	srcCachedData = { post, sefer, sections, footnotes };

	// Breadcrumb: Heichel > Series > Post.
	srcCrumbEl.innerHTML = '';
	const heichelName = (window.post && window.post.heichel && window.post.heichel.name) || 'Ikar';
	// B"H — Yaakov 2026-10-15: Humanize raw series IDs.
	const rawSeriesName = (window.series && (window.series.prateem?.name || window.series.name))
		|| post.seriesTitle || post.seriesId || '';
	const seriesName = humanizeSeriesId(rawSeriesName);
	const postTitle = post.title || '';
	const crumbParts = [heichelName, seriesName, postTitle].filter(Boolean);
	crumbParts.forEach((part, i) => {
		if (i > 0) srcCrumbEl.appendChild(el('span', 'awtsmoos-src-crumb-sep', '›'));
		const span = el('span', '', String(part));
		span.setAttribute('dir', 'auto');
		srcCrumbEl.appendChild(span);
	});

	// Post sources card.
	srcMetaEl.innerHTML = '';
	const card = el('div', 'awtsmoos-src-card');
	const rows = [
		['Sefer', postTitle],
		['Series', seriesName],
		['Author', post.author || post.authorName || ''],
	].filter(([, v]) => v && String(v).trim());
	rows.forEach(([label, value]) => {
		const row = el('div', 'awtsmoos-src-card-row');
		row.append(el('span', 'awtsmoos-src-card-label', label), el('span', 'awtsmoos-src-card-value', String(value)));
		row.lastChild.setAttribute('dir', 'auto');
		card.appendChild(row);
	});
	const stats = el('div', 'awtsmoos-src-stats', `${sections.length} sections · ${footnotes.length} footnotes`);
	card.appendChild(stats);
	if (card.children.length) srcMetaEl.appendChild(card);

	// Tabs.
	srcTabsEl.innerHTML = '';
	const tabs = [
		['sections', `Sections (${sections.length})`],
		['footnotes', `Footnotes (${footnotes.length})`],
		['comments', 'Comments'],
	];
	tabs.forEach(([key, label]) => {
		const tab = el('button', 'awtsmoos-src-tab', label);
		tab.type = 'button';
		tab.setAttribute('role', 'tab');
		tab.setAttribute('aria-selected', String(key === srcCurrentTab));
		tab.addEventListener('click', () => {
			srcCurrentTab = key;
			srcTabsEl.querySelectorAll('.awtsmoos-src-tab').forEach(t =>
				t.setAttribute('aria-selected', String(t === tab)));
			paintSrcTabs();
			renderSourcesTab();
		});
		srcTabsEl.appendChild(tab);
	});
	paintSrcTabs();

	renderSourcesTab();
}

// B"H — Coby Nov 10: the selected tab stayed white-on-cream because the
// sheet's --sefer-ink variable resolves to cream on this phone while the
// sheet background is light, and the stylesheet override never won the
// cascade. Inline styles beat every stylesheet rule, so paint the tabs
// directly: dark ink on cream when selected, cream ink on dark when not.
function paintSrcTabs() {
	if (!srcTabsEl) return;
	srcTabsEl.querySelectorAll('.awtsmoos-src-tab').forEach(t => {
		const selected = t.getAttribute('aria-selected') === 'true';
		t.style.color = selected ? '#2b2118' : '#f0e7d3';
		t.style.background = selected ? '#efe4cd' : '#1d2a44';
	});
}

function renderSourcesTab() {
	if (!srcCachedData) return;
	const { post, sections, footnotes, sefer } = srcCachedData;
	srcListEl.innerHTML = '';
	if (srcCurrentTab === 'sections') renderSourcesSections(post, sections);
	else if (srcCurrentTab === 'footnotes') renderSourcesFootnotes(footnotes, sefer);
	else if (srcCurrentTab === 'comments') renderSourcesComments(post);
}

function renderSourcesSections(post, sections) {
	if (!sections.length) {
		srcListEl.appendChild(el('div', 'awtsmoos-src-empty', 'No sections found in this post.'));
		return;
	}
	sections.forEach((sectionEl, index) => {
		const sectionId = sectionEl.dataset.sectionId || `sec-${index + 1}`;
		const item = el('div', 'awtsmoos-src-item');
		item.setAttribute('role', 'listitem');
		const goto = el('button', 'awtsmoos-src-goto');
		goto.type = 'button';
		goto.setAttribute('aria-label', `Go to section ${index + 1}`);
		const medallion = el('span', 'awtsmoos-src-medaillon', String(index + 1));
		const preview = el('span', 'awtsmoos-src-preview', sourcesSectionPreview(sectionEl));
		preview.setAttribute('dir', 'auto');
		goto.append(medallion, preview);
		goto.addEventListener('click', () => {
			closeSourcesSheet();
			sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
		const commentBtn = el('button', 'awtsmoos-src-comment-btn', 'Comment');
		commentBtn.type = 'button';
		commentBtn.setAttribute('aria-expanded', 'false');
		const composer = el('div', 'awtsmoos-src-composer');
		composer.hidden = true;
		const textarea = el('textarea', 'awtsmoos-src-textarea');
		textarea.setAttribute('aria-label', `Comment on section ${index + 1}`);
		textarea.setAttribute('placeholder', 'Share a thought on this section…');
		textarea.setAttribute('rows', '3');
		const actions = el('div', 'awtsmoos-src-composer-actions');
		const send = el('button', 'awtsmoos-src-send', 'Send');
		send.type = 'button';
		const cancel = el('button', 'awtsmoos-src-cancel', 'Cancel');
		cancel.type = 'button';
		const notice = el('div', 'awtsmoos-src-notice');
		notice.setAttribute('role', 'status');
		actions.append(send, cancel);
		composer.append(textarea, actions, notice);
		commentBtn.addEventListener('click', () => {
			const opening = composer.hidden;
			composer.hidden = !opening;
			commentBtn.setAttribute('aria-expanded', String(opening));
			commentBtn.textContent = opening ? 'Close' : 'Comment';
			if (opening) textarea.focus();
		});
		cancel.addEventListener('click', () => {
			composer.hidden = true;
			commentBtn.setAttribute('aria-expanded', 'false');
			commentBtn.textContent = 'Comment';
		});
		send.addEventListener('click', () => {
			submitSectionComment({ post, sectionId, sectionIndex: index, textarea, send, notice });
		});
		item.append(goto, commentBtn, composer);
		srcListEl.appendChild(item);
	});
}

function sourcesFootnoteText(fn) {
	// B"H — Yaakov 2026-10-15: Handle both DOM elements and API data objects.
	// Coby Nov 10: the footnote list must show the HEBREW first — English
	// was winning and the Hebrew never showed.
	// B"H 2026-11-10 round 6 — Coby: footnote text must be as full as the
	// rest. The 200-char cut hid most of every footnote. Show the whole
	// body (the CSS clamp is gone too); the list is scrollable, so length
	// costs nothing.
	let raw;
	if (fn && typeof fn === 'object' && !(fn instanceof Element)) {
		// API object: {n, hebrew, english, ...} — Hebrew first, then English.
		// Marker fallback: {_marker, _context} — the phrase the marker sits in.
		if (fn._context) return fn._context;
		const he = String(fn.hebrew || '').replace(/\s+/g, ' ').trim();
		const en = String(fn.english || fn.text || '').replace(/\s+/g, ' ').trim();
		raw = he && en ? he + ' — ' + en : (he || en);
	} else {
		raw = String(fn.textContent || '').replace(/\s+/g, ' ').trim();
	}
	return raw;
}

function sourcesFootnoteNum(fn, index) {
	// B"H — Yaakov 2026-10-15: Handle both DOM elements and API data objects.
	if (fn && typeof fn === 'object' && !(fn instanceof Element)) {
		return String(fn.n || fn.num || fn.number || (index + 1));
	}
	return fn.dataset.fnNum || fn.getAttribute('data-footnote') || String(index + 1);
}

function renderSourcesFootnotes(footnotes, sefer) {
	if (!footnotes.length) {
		srcListEl.appendChild(el('div', 'awtsmoos-src-empty', 'No footnotes in this post.'));
		return;
	}
	footnotes.forEach((fn, index) => {
		const num = sourcesFootnoteNum(fn, index);
		const isDomEl = fn instanceof Element;
		const btn = el('button', 'awtsmoos-src-fn-item');
		btn.type = 'button';
		btn.setAttribute('aria-label', `Go to footnote ${num}`);
		// B"H round 11: the list is rebuilt on every open — re-apply the
		// mark on the footnote tapped last time, so it stays marked.
		if (lastTappedFootnoteNum !== null && String(num) === String(lastTappedFootnoteNum)) btn.classList.add('is-open');
		btn.append(el('span', 'awtsmoos-src-fn-num', String(num)));
		const txt = el('span', 'awtsmoos-src-fn-text');
		if (fn && typeof fn === 'object' && !(fn instanceof Element) && !fn._context) {
			const he = String(fn.hebrew || '').replace(/\s+/g, ' ').trim();
			const en = String(fn.english || fn.text || '').replace(/\s+/g, ' ').trim();
			if (he) { const h = el('span', 'awtsmoos-src-fn-he', he); h.dir = 'rtl'; txt.append(h); }
			if (en) { const e = el('span', 'awtsmoos-src-fn-en', en); e.dir = 'ltr'; txt.append(e); }
			if (!he && !en) txt.textContent = sourcesFootnoteText(fn);
		} else {
			txt.textContent = sourcesFootnoteText(fn);
			txt.dir = 'auto';
		}
		btn.append(txt);
		btn.addEventListener('click', () => {
			// B"H 2026-11-10 round 6 — Coby: tapping a footnote did NOTHING
			// visible. The old handler scrolled to the shelf and added a
			// "flash" class whose animation is none (no animations on the
			// reader, ever), so the tap looked dead. Now the tap does three
			// plain things: it marks this item as the one you are reading
			// (it stays open, full body, until you tap another), it closes
			// the sheet, and it scrolls to the footnote in the text with a
			// static gold highlight that stays until you tap another one.
			srcListEl.querySelectorAll('.awtsmoos-src-fn-item.is-open').forEach(b => b.classList.remove('is-open'));
			btn.classList.add('is-open');
			lastTappedFootnoteNum = num;
			closeSourcesSheet();
			// Marker fallback (API still loading): the target is the gold
			// <sup> marker in the text itself. Otherwise the shelf item.
			const target = isDomEl ? fn
				: (document.querySelector(`.meluket-footnote[data-fn="${num}"], #meluket-fn-${num}`) || (fn && fn._marker) || null);
			// B"H 2026-11-10 round 8 — Coby: tapping a footnote did
			// NOTHING visible. The old code put the highlight on the
			// tiny <sup> marker (or the shelf item inside the closed
			// sheet), so no gold showed. Highlight the whole phrase
			// card the marker sits in — that is what the eye lands on.
			// B"H round 9: when the footnote came from the API (not
			// the marker fallback) there is no _marker, and the shelf
			// item has no phrase-pair ancestor — the class landed on
			// the hidden shelf item. Find the visible marker in the
			// sefer by number and highlight ITS card instead.
			// B"H round 10: the list now comes from the post content
			// (parseContentFootnotes), so most entries have NO _marker
			// and NO shelf item — target is null and the old code did
			// nothing at all. Find the marker first, from any source:
			// the gold .meluket-fn-marker, or a plain Hebrew <sup>
			// whose text is the number (the Hebrew markers are plain
			// sups — enhanceFootnoteSup only runs on the English side,
			// which is why 31, 48, 58–64 had no clickable marker).
			// Scroll + highlight whenever ANY card is found.
			// B"H round 11: the old code read a bare `sefer` here — but
			// renderSourcesFootnotes took only (footnotes), and no
			// module-level `sefer` exists, so every tap threw a
			// ReferenceError AFTER the dialog closed and BEFORE any
			// scroll or highlight. That is why go-to-1 only LOOKED
			// right (the dialog-close focus restore landed on the card
			// the dialog was opened from) and go-to-58 landed on the
			// footnote-1 card, and why the gold highlight never showed
			// in rounds 8–10 although the CSS was served correctly.
			// The sefer now arrives as a parameter (see renderSourcesTab).
			const liveSefer = sefer || (typeof document !== 'undefined' && document.querySelector('#realPost .meluket-sefer')) || null;
			const markerEl = (fn && fn._marker) || null;
			const liveMarker = markerEl
				|| (liveSefer && liveSefer.querySelector(`.meluket-fn-marker[data-fn="${num}"]`))
				|| (liveSefer && liveSefer.querySelector(`.meluket-phrase--he sup[data-fn="${num}"], .meluket-phrase--en sup[data-fn="${num}"]`))
				|| (liveSefer && Array.from(liveSefer.querySelectorAll('.meluket-phrase--he sup')).find(s => s.textContent.trim() === String(num)))
				|| null;
			const card = (liveMarker && liveMarker.closest && liveMarker.closest('.meluket-phrase-pair'))
				|| (target && target.closest && target.closest('.meluket-phrase-pair'))
				|| target
				|| null;
			if (card) {
				document.querySelectorAll('.awtsmoos-fn-active').forEach(n => n.classList.remove('awtsmoos-fn-active'));
				if (lastFnActiveCard && lastFnActiveCard !== card) {
					lastFnActiveCard.style.background = '';
					lastFnActiveCard.style.outline = '';
				}
				lastFnActiveCard = card;
				// B"H round 12 — go-to-58 landed on the wrong card twice
				// although the right card WAS found and highlighted: the
				// pairs use content-visibility: auto with a 120px
				// intrinsic estimate, so unrendered cards below the fold
				// are far shorter than real. scrollIntoView aims at the
				// estimated position and lands early (go-to-1/31 pass
				// because few unrendered cards sit above them). Force
				// every pair to real layout first, then scroll, then
				// re-check the card's rect and re-scroll until it sits
				// near the viewport center (up to ~5 tries over ~1s),
				// and restore the skips after ~1.5s so scrolling stays
				// cheap.
				const pairs = liveSefer ? Array.from(liveSefer.querySelectorAll('.meluket-phrase-pair')) : [];
				pairs.forEach(p => { p.style.contentVisibility = 'visible'; });
				const centerCard = () => {
					const rect = card.getBoundingClientRect();
					const target = window.innerHeight / 2 - rect.height / 2;
					if (Math.abs(rect.top - target) > 24) {
						window.scrollBy({ top: rect.top - target, behavior: 'auto' });
						return false;
					}
					return true;
				};
				card.scrollIntoView({ behavior: 'auto', block: 'center' });
				let tries = 0;
				const settle = () => {
					tries += 1;
					if (centerCard() || tries >= 5) return;
					setTimeout(settle, 200);
				};
				setTimeout(settle, 60);
				setTimeout(() => { pairs.forEach(p => { p.style.contentVisibility = ''; }); }, 1500);
				card.classList.add('awtsmoos-fn-active');
				// B"H round 11: paint the highlight inline as well as
				// the class — inline beats any cascade mystery, so the
				// gold shows even if a stylesheet rule ever loses again.
				card.style.background = 'rgba(184, 134, 11, 0.32)';
				card.style.outline = '2px solid #b8860b';
			}
		});
		srcListEl.appendChild(btn);
	});
}

async function renderSourcesComments(post) {
	const loading = el('div', 'awtsmoos-src-empty', 'Loading comments…');
	srcListEl.appendChild(loading);
	const heichelId = (window.post && window.post.heichel && window.post.heichel.id) || 'ikar';
	const postId = post.id || (window.post && window.post.id) || '';
	if (!postId) {
		loading.textContent = 'Could not determine this post.';
		return;
	}
	try {
		const res = await fetch(`/api/social/heichelos/${heichelId}/posts/${postId}/comment-tree`);
		const json = await res.json();
		const comments = (json && (json.comments || json.data || json.success)) || [];
		const list = Array.isArray(comments) ? comments : [];
		srcListEl.innerHTML = '';
		if (!list.length) {
			srcListEl.appendChild(el('div', 'awtsmoos-src-empty', 'No comments yet. Be the first to share a thought from the Sections tab.'));
			return;
		}
		list.forEach(c => {
			const wrap = el('div', 'awtsmoos-src-comment');
			const head = el('div', 'awtsmoos-src-comment-head');
			head.append(el('span', 'awtsmoos-src-comment-author', String(c.aliasId || c.author || 'Anonymous')));
			if (c.createdAt || c.timestamp) {
				const t = el('span', 'awtsmoos-src-comment-time', String(c.createdAt || c.timestamp).slice(0, 10));
				head.append(t);
			}
			if (c.verseSection || c.subsectionId) {
				const sec = el('span', 'awtsmoos-src-comment-time', `· ${c.verseSection || c.subsectionId}`);
				head.append(sec);
			}
			const body = el('div', 'awtsmoos-src-comment-body', String(c.content || c.text || ''));
			body.setAttribute('dir', 'auto');
			wrap.append(head, body);
			srcListEl.appendChild(wrap);
		});
	} catch (err) {
		loading.textContent = 'Could not load comments. Try again later.';
	}
}

async function submitSectionComment({ post, sectionId, sectionIndex, textarea, send, notice }) {
	const text = textarea.value.trim();
	notice.textContent = '';
	notice.classList.remove('is-error', 'is-ok');
	if (!text) {
		notice.textContent = 'Write something first.';
		notice.classList.add('is-error');
		return;
	}
	const alias = sourcesActiveAlias();
	if (!alias) {
		notice.textContent = 'Choose an alias or sign in to comment.';
		notice.classList.add('is-error');
		return;
	}
	const heichelId = (window.post && window.post.heichel && window.post.heichel.id) || 'ikar';
	const postId = post.id || (window.post && window.post.id) || '';
	if (!postId) {
		notice.textContent = 'Could not determine this post. Please reload and try again.';
		notice.classList.add('is-error');
		return;
	}
	send.disabled = true;
	send.textContent = 'Sending…';
	try {
		const body = new URLSearchParams({
			aliasId: alias,
			seriesId: (window.post && window.post.parentSeriesId) || (window.series && window.series.id) || 'root',
			content: text,
			verseSection: String(sectionId),
			subsectionId: `sec-${sectionIndex + 1}`,
			assets: '[]',
			sections: '[]',
			links: '[]',
		});
		const res = await fetch(`/api/social/heichelos/${heichelId}/posts/${postId}/comment-tree`, {
			method: 'POST',
			body,
		});
		const json = await res.json();
		if (!json.success) {
			throw new Error((json.error && (json.error.message || json.error)) || 'Comment submission failed.');
		}
		textarea.value = '';
		notice.textContent = 'Posted. Thank you for learning together.';
		notice.classList.add('is-ok');
		try {
			const bus = await import('/heichelos/post/comments/state/eventBus.js?v=8d6430ca53');
			bus.emitAwtsmoosEvent && bus.emitAwtsmoosEvent('comment:submitted', {
				aliasId: alias,
				verseSection: String(sectionId),
				subsectionId: `sec-${sectionIndex + 1}`,
			});
		} catch (_) { /* event bus optional */ }
	} catch (err) {
		notice.textContent = err && err.message ? err.message : 'Could not post. Try again.';
		notice.classList.add('is-error');
	} finally {
		send.disabled = false;
		send.textContent = 'Send';
	}
}

function openSourcesSheet(post, sefer) {
	buildSourcesSheetContent(post, sefer);
	srcOverlayEl.classList.add('is-open');
	srcSheetEl.classList.add('is-open');
	srcOpen = true;
	// B"H — hide the fixed "N online" launcher pill while the sheet is
	// open, so it never covers the sheet's close button.
	try { document.body.classList.add('awtsmoos-src-open'); } catch (_) { /* best effort */ }
	const btn = document.getElementById('commentaryBtn');
	if (btn) {
		btn.classList.add('pushed');
		btn.setAttribute('aria-pressed', 'true');
		btn.setAttribute('aria-expanded', 'true');
	}
	srcCloseEl.focus({ preventScroll: true });
}

function closeSourcesSheet() {
	if (!srcSheetEl) return;
	srcOverlayEl.classList.remove('is-open');
	srcSheetEl.classList.remove('is-open');
	srcOpen = false;
	try { document.body.classList.remove('awtsmoos-src-open'); } catch (_) { /* best effort */ }
	const btn = document.getElementById('commentaryBtn');
	if (btn) {
		btn.classList.remove('pushed');
		btn.setAttribute('aria-pressed', 'false');
		btn.setAttribute('aria-expanded', 'false');
		btn.focus({ preventScroll: true });
	}
}

function isSourcesSheetOpen() {
	return srcOpen;
}

/**
 * B"H — Opens the Sources sheet directly to a specific tab.
 * (Footnote markers open the popup directly since 2026-11-10; this
 * helper remains for sheet callers that want a specific tab.)
 */
function openSourcesToTab(post, sefer, tab) {
	srcCurrentTab = tab;
	openSourcesSheet(post, sefer);
	// Ensure the tab UI reflects the requested tab.
	if (srcTabsEl) {
		srcTabsEl.querySelectorAll('.awtsmoos-src-tab').forEach(t => {
			const isActive = t.textContent.toLowerCase().startsWith(tab);
			t.setAttribute('aria-selected', String(isActive));
		});
	}
	renderSourcesTab();
}

/* B"H — Hijack the Sources button on Meluket posts only (capture phase, so the
 * generic sidebar toggle on document.body never fires). Non-Meluket posts and
 * the general reader path are untouched. */
export function wireSourcesButton(post, sefer) {
	const btn = document.getElementById('commentaryBtn');
	if (!btn || btn.dataset.meluketSourcesBound === '1') return;
	btn.dataset.meluketSourcesBound = '1';
	btn.addEventListener('click', (e) => {
		if (!e.isTrusted) return; // ignore synthetic clicks from tab machinery
		e.preventDefault();
		e.stopPropagation();
		if (isSourcesSheetOpen()) closeSourcesSheet();
		else openSourcesSheet(post, sefer);
	}, true);
}

/**
 * Main entry: restructures a Meluket post into bilingual sefer sections.
 * @param {object} post The window.post object with enrichment.
 * @returns {boolean} True if the sefer restructuring was applied.
 */
/* ---------------------------------------------------------------------------
 * B"H — 2026-11-10 round 5: instant read. The server already sends every
 * phrase in the initial HTML (the #awtsmoos-phrase-translations embed),
 * but the sefer waited on the post API round trip before building the
 * cards — that wait IS the visible switch. Build the cards from the embed
 * the moment the module loads, with no API wait; the API awaken below then
 * enhances the mounted sefer in place (overview, Q&A, footnote shelf,
 * chapter nav) instead of rebuilding it. Anything not needed to read
 * (overview, Q&A, footnotes, comments, related posts) arrives after the
 * text is readable.
 * ------------------------------------------------------------------------- */

/** Reads the embedded phrase rows the server put in the initial HTML. */
function readEmbeddedPhraseRows() {
	try {
		const el = typeof document !== 'undefined' ? document.getElementById('awtsmoos-phrase-translations') : null;
		if (!el) return null;
		const rows = JSON.parse(el.textContent || '');
		if (!Array.isArray(rows) || rows.length < 20) return null;
		return rows;
	} catch (_) { return null; }
}

/**
 * Shapes embed rows ({sourceHebrew, content, verseSection, subsectionId})
 * into the phrases buildHebrewSections expects. Sections are numbered in
 * first-appearance order (sec-001, sec-002, ...) and phraseIds are
 * segment_<section>_<phrase>, so the sort order is the embed's row order.
 */
/**
 * B"H batch 30 — printed-page markers. The imported corpora prefix the
 * first phrase of each printed page with a literal <pg n="N"/> tag in
 * BOTH the Hebrew source and the English content. Rendered raw it leaked
 * onto the page as visible text; the reader law keeps page turns inline
 * as [עמוד N] instead. Leading markers become the bracket form;
 * a marker anywhere else is dropped (its page turn is the next
 * phrase's leading marker).
 */
const PG_MARKER_RE = /<pg\s+n="?(\d+)"?\s*\/>/g;
const PG_LEAD_RE = /^\s*<pg\s+n="?(\d+)"?\s*\/>\s*/;
function awtsmoosPageMarker(text) {
	const s = text == null ? '' : String(text);
	const lead = s.match(PG_LEAD_RE);
	if (lead) return { page: lead[1], text: s.replace(PG_LEAD_RE, '').replace(PG_MARKER_RE, '').trim() };
	return { page: null, text: s.replace(PG_MARKER_RE, '') };
}

function synthesizeEmbedPhrases(rows) {
	const sectionKeys = [];
	const sectionIndexByKey = new Map();
	const perSection = [];
	const enByPhraseId = new Map();
	for (const row of rows || []) {
		const heRaw = row && row.sourceHebrew != null ? String(row.sourceHebrew) : '';
		if (!heRaw.trim()) continue;
		// B"H batch 30: <pg n="N"/> printed-page markers -> [עמוד N] lead.
		const heMark = awtsmoosPageMarker(heRaw);
		const enMark = awtsmoosPageMarker(row.content != null ? String(row.content) : '');
		const pg = heMark.page || enMark.page;
		const he = pg ? `[עמוד ${pg}] ` + heMark.text : heMark.text;
		// B"H: verseSection IS the section (0-6 for this maamar — 7 sections).
		// subsectionId is the phrase's index inside its section, not a section
		// id — grouping by it would make one section per phrase. The phrase
		// index is the running count inside the section (row order), which is
		// also how the API's segment_<section>_<phrase> ids are numbered.
		const key = row.verseSection != null ? String(row.verseSection) : '0';
		if (!sectionIndexByKey.has(key)) {
			sectionIndexByKey.set(key, sectionKeys.length);
			sectionKeys.push(key);
			perSection.push([]);
		}
		const sIdx = sectionIndexByKey.get(key);
		const pIdx = perSection[sIdx].length;
		const phraseId = `segment_${sIdx}_${pIdx}`;
		const sectionId = `sec-${String(sIdx + 1).padStart(3, '0')}`;
		perSection[sIdx].push({ phraseId, he, sectionId });
		enByPhraseId.set(phraseId, pg ? `[עמוד ${pg}] ` + enMark.text : enMark.text);
	}
	return { phrases: perSection.flat(), enByPhraseId };
}

/**
 * Renders sections into the sefer: the first 3 synchronously (first paint),
 * the rest streamed via idle callbacks. Shared by the embed path and the
 * API path so both produce the identical section order.
 */
function renderSeferSectionsInto(sefer, hebrewSections, translationEn, sectionSummaries, langMode) {
	const queue = hebrewSections.map(({ sectionId, items }, index) => {
		const englishText = (translationEn && translationEn[sectionId]) || '';
		const sectionSummary = (sectionSummaries && sectionSummaries[sectionId]) || '';
		return { index, sectionId, items, englishText, sectionSummary };
	});
	const FIRST_PAINT = 3;
	for (let i = 0; i < Math.min(FIRST_PAINT, queue.length); i++) {
		const s = queue[i];
		sefer.appendChild(buildSectionElement(s.index, s.sectionId, s.items, s.englishText, s.sectionSummary, langMode));
	}
	let idx = FIRST_PAINT;
	function renderChunk(deadline) {
		const start = Date.now();
		while (idx < queue.length) {
			if (deadline && deadline.timeRemaining() <= 0 && Date.now() - start > 50) break;
			const s = queue[idx++];
			try {
				sefer.appendChild(buildSectionElement(s.index, s.sectionId, s.items, s.englishText, s.sectionSummary, langMode));
			} catch (e) {
				console.warn('B"H meluket section render failed', s.sectionId, e);
			}
			if ((idx - FIRST_PAINT) % 5 === 0) break;
		}
		if (idx < queue.length) {
			if (typeof requestIdleCallback === 'function') {
				requestIdleCallback(renderChunk, { timeout: 1000 });
			} else {
				setTimeout(() => renderChunk(null), 0);
			}
		}
	}
	if (idx < queue.length) {
		if (typeof requestIdleCallback === 'function') {
			requestIdleCallback(renderChunk, { timeout: 1000 });
		} else {
			setTimeout(() => renderChunk(null), 0);
		}
	}
}

/** Overview block (the klal before the pratim) — null when there is none. */
function buildOverviewBlock(summariesEn) {
	const raw = summariesEn && summariesEn.post;
	const text = typeof raw === 'string' ? raw : (raw?.detailed || raw?.short || '');
	if (!text || !String(text).trim()) return null;
	const wrap = el('div', 'meluket-post-summary');
	wrap.setAttribute('dir', 'ltr');
	wrap.setAttribute('lang', 'en');
	wrap.appendChild(el('div', 'meluket-summary-label', 'Overview'));
	wrap.appendChild(el('p', null, String(text).trim()));
	return wrap;
}

/** Q&A section — null when there are no questions or answers. */
function buildQaSection(enrichment) {
	const questions = Array.isArray(enrichment?.questions_en) ? enrichment.questions_en : [];
	const answers = Array.isArray(enrichment?.answers_en) ? enrichment.answers_en : [];
	if (!questions.length && !answers.length) return null;
	const qa = el('section', 'meluket-qa');
	qa.appendChild(el('h2', 'meluket-qa-title', 'שאלות ותשובות · Q&A'));
	const list = el('div', 'meluket-qa-list');
	const count = Math.max(questions.length, answers.length);
	for (let i = 0; i < count; i++) {
		const item = el('div', 'meluket-qa-item');
		const qText = questions[i];
		const aObj = answers[i];
		const aText = aObj ? (aObj.a || aObj.answer || '') : '';
		const qLabel = aObj && aObj.q ? aObj.q : qText;
		if (qLabel && String(qLabel).trim()) {
			const q = el('div', 'meluket-qa-q', String(qLabel).trim());
			q.setAttribute('dir', 'auto');
			item.appendChild(q);
		}
		if (aText && String(aText).trim()) {
			const a = el('div', 'meluket-qa-a', String(aText).trim());
			a.setAttribute('dir', 'auto');
			item.appendChild(a);
		}
		if (item.children.length) list.appendChild(item);
	}
	if (!list.children.length) return null;
	qa.appendChild(list);
	return qa;
}

/** Footnotes shelf — null when there are no footnotes. */
function buildFootnotesShelf(post) {
	// B"H 2026-11-10 — the post API returns no footnotes field for these
	// posts (see parseContentFootnotes), so a shelf built only from
	// post.footnotes was always empty and openFootnotePopup had no
	// .meluket-footnote to find. Fall back to the bodies parsed out of
	// the post's own content, and number each note by its real footnote
	// number (fn.n) instead of its list position, so data-fn on the
	// shelf always matches data-fn on the marker that opens it.
	let footnotes = Array.isArray(post?.footnotes) ? post.footnotes : [];
	if (!footnotes.length) {
		const parsed = parseContentFootnotes((post && post.content) || '');
		if (parsed.length) footnotes = parsed;
	}
	if (!footnotes.length) return null;
	const shelf = document.createElement('aside');
	shelf.className = 'meluket-footnotes-shelf';
	const shelfTitle = document.createElement('h2');
	shelfTitle.className = 'meluket-footnotes-title';
	shelfTitle.textContent = 'הערות · Notes';
	shelf.appendChild(shelfTitle);
	const list = document.createElement('ol');
	list.className = 'meluket-footnotes-list';
	footnotes.forEach((fn, idx) => {
		const fnNum = String((fn && (fn.n ?? fn.num ?? fn.number)) ?? (idx + 1));
		const li = document.createElement('li');
		li.className = 'meluket-footnote';
		li.id = `meluket-fn-${fnNum}`;
		li.setAttribute('data-fn', fnNum);
		const num = document.createElement('span');
		num.className = 'meluket-footnote-num';
		num.textContent = fnNum;
		li.appendChild(num);
		const body = document.createElement('span');
		body.className = 'meluket-footnote-body';
		body.setAttribute('dir', 'auto');
		const heBody = fn.body || fn.hebrew || '';
		const enBody = fn.body_en || fn.english || '';
		if (heBody) {
			const heSpan = document.createElement('span');
			heSpan.className = 'meluket-footnote-he';
			heSpan.setAttribute('dir', 'rtl');
			setFootnoteBodyHtml(heSpan, heBody);
			body.appendChild(heSpan);
		}
		if (enBody) {
			const enSpan = document.createElement('span');
			enSpan.className = 'meluket-footnote-en';
			enSpan.setAttribute('dir', 'ltr');
			enSpan.textContent = enBody;
			body.appendChild(enSpan);
		}
		if (!heBody && !enBody) {
			body.textContent = typeof fn === 'string' ? fn : JSON.stringify(fn).slice(0, 200);
		}
		li.appendChild(body);
		list.appendChild(li);
	});
	shelf.appendChild(list);
	return shelf;
}

/** Re-mounts the chapter nav after the sefer (same as finalizeSeferMount). */
function ensureSeferNav(post) {
	const realPost = document.getElementById('realPost');
	if (!realPost || realPost.querySelector('.awtsmoos-chapter-nav')) return;
	if (typeof window === 'undefined' || !window.series || !Array.isArray(window.series.posts)) return;
	let pIdx = window.currentIndexInSeries;
	if ((pIdx === undefined || pIdx === null) && post && post.id) {
		const found = window.series.posts.indexOf(post.id);
		pIdx = found >= 0 ? found : 0;
	}
	import('../../functions/ui/nav.js?v=5da53e96f2').then(({ makeNavBars }) => {
		try {
			const nav = makeNavBars(post, window.series, pIdx);
			if (nav && nav.nodeType === 1) realPost.appendChild(nav);
		} catch (_) { /* navigation is optional */ }
	}).catch(() => { /* navigation is optional */ });
}

/**
 * Enhances a sefer the embed path already built: appends the overview,
 * Q&A and footnotes shelf the embed could not carry, and re-mounts the
 * chapter nav. Returns true when the mounted sefer matches the API data
 * (same section and phrase counts) — false when it does not, in which case
 * the API awaken rebuilds from scratch below.
 */
function enhanceEmbedSefer(post) {
	const realPost = document.getElementById('realPost');
	const sefer = realPost ? realPost.querySelector('.meluket-sefer') : null;
	if (!sefer) return false;
	const enrichment = post && post.enrichment;
	if (!enrichment || !Array.isArray(enrichment.hebrew_phrases)) return false;
	const enByPhraseId = buildPhraseEnglishMap(enrichment.translation_en_phrases);
	const apiSections = buildHebrewSections(enrichment.hebrew_phrases, enByPhraseId);
	const mountedSections = sefer.querySelectorAll('.meluket-sefer-section').length;
	const mountedPairs = sefer.querySelectorAll('.meluket-phrase-pair').length;
	const apiPairs = apiSections.reduce((n, s) => n + s.items.length, 0);
	if (mountedSections !== apiSections.length || mountedPairs !== apiPairs) {
		console.log('B"H embed sefer structure differs from API — rebuilding', mountedSections, apiSections.length, mountedPairs, apiPairs);
		return false;
	}
	const summariesEn = enrichment.summaries_en || {};
	if (!sefer.querySelector('.meluket-post-summary')) {
		const overview = buildOverviewBlock(summariesEn);
		if (overview) {
			const titleBlock = sefer.querySelector('.meluket-sefer-title');
			if (titleBlock && titleBlock.nextSibling) sefer.insertBefore(overview, titleBlock.nextSibling);
			else sefer.insertBefore(overview, sefer.firstChild.nextSibling);
		}
	}
	if (!sefer.querySelector('.meluket-qa')) {
		const qa = buildQaSection(enrichment);
		if (qa) sefer.appendChild(qa);
	}
	if (!sefer.querySelector('.meluket-footnotes-shelf')) {
		const shelf = buildFootnotesShelf(post);
		if (shelf) sefer.appendChild(shelf);
	}
	ensureSeferNav(post);
	return true;
}

/**
 * B"H 2026-11-10 round 7 — hydrates a server-rendered sefer. The server
 * sends the cards with the text only HTML-escaped (no footnote markers,
 * no cup formatting) so the first paint is instant; this re-renders each
 * mounted pair block in place — Hebrew through toCupHtml +
 * convertBareFootnoteDigits, English through renderEnglishWithFootnotes —
 * reading the raw text back from textContent. It never rebuilds the
 * sefer (the mount, the counts and the layout stay exactly as painted).
 */
function hydrateServerSefer(sefer) {
	if (!sefer) return false;
	let hydrated = 0;
	sefer.querySelectorAll('.meluket-phrase--he').forEach((heBlock) => {
		const raw = heBlock.textContent || '';
		if (!raw.trim()) return;
		heBlock.innerHTML = toCupHtml(raw);
		convertBareFootnoteDigits(heBlock);
		hydrated++;
	});
	sefer.querySelectorAll('.meluket-phrase--en').forEach((enBlock) => {
		const raw = enBlock.textContent || '';
		if (!raw.trim()) return;
		enBlock.innerHTML = renderEnglishWithFootnotes(raw);
		hydrated++;
	});
	return hydrated > 0;
}

/**
 * Builds the sefer from the embedded phrase rows in the initial HTML —
 * no API wait. Returns true when the cards mounted, false when the embed
 * is missing or too thin (the API path below then builds them instead).
 */
export function awakenMeluketSeferReaderFromEmbed() {
	const realPost = document.getElementById('realPost');
	if (!realPost) return false;
	// B"H round 7: the server may already have rendered the sefer into the
	// initial HTML (true instant — the first paint IS the cards). Hydrate
	// it in place (markers + cup formatting) and mount it; never rebuild.
	const serverSefer = realPost.querySelector('.meluket-sefer[data-server-built="1"]');
	if (serverSefer) {
		// B"H batch 28 (2026-11-11): hydration is NOT idempotent (it re-reads
		// textContent, which after the first pass contains the markers it
		// created). The template's early boot and the canonical bootstrap
		// both call this function — the first caller hydrates and stamps
		// the sefer; later callers see the stamp and leave it alone.
		if (serverSefer.dataset.hydrated === '1') return true;
		hydrateServerSefer(serverSefer);
		serverSefer.dataset.hydrated = '1';
		const titleHe = document.querySelector('.awtsmoos-initial-post-title');
		const title = (titleHe && titleHe.textContent ? titleHe.textContent.trim() : '') || (document.title || '').split('|').pop().trim();
		finalizeSeferMount(serverSefer, { title, id: '' });
		return true;
	}
	const rows = readEmbeddedPhraseRows();
	if (!rows) return false;
	if (realPost.querySelector('.meluket-sefer')) return true;
	const { phrases, enByPhraseId } = synthesizeEmbedPhrases(rows);
	const hebrewSections = buildHebrewSections(phrases, enByPhraseId);
	if (!hebrewSections.length) return false;
	console.log('B"H sefer reader activating from embed:', hebrewSections.length, 'sections');
	ensureMeluketSeferStyles();
	const langMode = readSavedLangMode();
	const sefer = document.createElement('div');
	sefer.className = 'meluket-sefer';
	sefer.dataset.langMode = langMode;
	sefer.dataset.embedBuilt = '1';
	const titleHe = document.querySelector('.awtsmoos-initial-post-title');
	const title = (titleHe && titleHe.textContent ? titleHe.textContent.trim() : '') || (document.title || '').split('|').pop().trim();
	const titleBlock = document.createElement('header');
	titleBlock.className = 'meluket-sefer-title';
	const h1 = document.createElement('h1');
	h1.className = 'meluket-sefer-title-he';
	h1.setAttribute('dir', 'rtl');
	// B"H batch 24f (2026-11-11) — the round-12 diagnostic that pinned
	// this h1 to an inline 105px is retired: it beat every stylesheet
	// rule, so on phones the title overflowed its card and clipped.
	// The cascade hunt is settled (the vision Hebrew rule owned the
	// family; this probe owned the size). The inline value is now the
	// same responsive clamp as the stylesheet: 13.5vw on phones,
	// capped at the 105px desktop size.
	h1.style.fontSize = 'clamp(2rem, 13.5vw, 6.5625rem)';
	h1.style.lineHeight = '1.15';
	h1.textContent = title;
	titleBlock.appendChild(h1);
	sefer.appendChild(titleBlock);
	const toggle = buildLangToggle(langMode, (mode) => applyLangMode(sefer, mode));
	injectLangToggleIntoSettings(toggle);
	enhanceScribeLensPanel();
	renderSeferSectionsInto(sefer, hebrewSections, {}, {}, langMode);
	finalizeSeferMount(sefer, { title, id: '' });
	return true;
}

export function awakenMeluketSeferReader(post) {
	const enrichment = post && post.enrichment;
	if (!enrichment || !Array.isArray(enrichment.hebrew_phrases) || !enrichment.hebrew_phrases.length) {
		console.log("B\"H sefer reader skipped: no hebrew_phrases", !!enrichment, enrichment?.hebrew_phrases?.length);
		return false; // Not a Meluket enriched post.
	}
	const translationEn = enrichment.translation_en || {};
	const summariesEn = enrichment.summaries_en || {};
	const sectionSummaries = summariesEn.sections || {};
	const realPost = document.getElementById('realPost');
	if (!realPost) {
		console.log("B\"H sefer reader skipped: no #realPost element");
		return false;
	}

	// B"H — phrase-level English joined on phraseId; the section-level
	// translation_en blob is only a fallback for older enrichment.
	const enByPhraseId = buildPhraseEnglishMap(enrichment.translation_en_phrases);
	const hebrewSections = buildHebrewSections(enrichment.hebrew_phrases, enByPhraseId);
	if (!hebrewSections.length) {
		console.log("B\"H sefer reader skipped: buildHebrewSections empty");
		return false;
	}
	console.log("B\"H sefer reader activating:", hebrewSections.length, "sections");

	// B"H round 5: the embed path may already have built the sefer from the
	// HTML. Enhance it in place instead of rebuilding — a rebuild would
	// flash the same text twice.
	const existingSefer = document.querySelector('#realPost .meluket-sefer');
	if (existingSefer && existingSefer.dataset.embedBuilt === '1') {
		if (enhanceEmbedSefer(post)) return true;
		// Structure differs — fall through and rebuild below.
	}

	ensureMeluketSeferStyles();

	const langMode = readSavedLangMode();

	// Build the sefer container.
	const sefer = document.createElement('div');
	sefer.className = 'meluket-sefer';
	sefer.dataset.langMode = langMode;

	// Title block — sefer-style.
	const titleBlock = document.createElement('header');
	titleBlock.className = 'meluket-sefer-title';
	const titleHe = document.createElement('h1');
	titleHe.className = 'meluket-sefer-title-he';
	titleHe.setAttribute('dir', 'rtl');
	titleHe.textContent = post.title || '';
	titleBlock.appendChild(titleHe);
	sefer.appendChild(titleBlock);

	// Post summary — the klal before the pratim.
	const overview = buildOverviewBlock(summariesEn);
	if (overview) sefer.appendChild(overview);

	// Language toggle — B"H Yaakov: lives ONLY in the Scribe's Lens settings
	// panel, NEVER on the main page. Injected into #typographyDetails.
	const toggle = buildLangToggle(langMode, (mode) => applyLangMode(sefer, mode));
	injectLangToggleIntoSettings(toggle);
	enhanceScribeLensPanel();

	// Sections — each phrase's English rides with its Hebrew phrase.
	// B"H perf (Yaakov 2026-10-15): chunk section rendering so the first
	// sections paint immediately and the rest stream in via idle callbacks.
	renderSeferSectionsInto(sefer, hebrewSections, translationEn, sectionSummaries, langMode);
	// Mount Q&A synchronously (usually small) — defined below, then finalize.
	const qa = buildQaSection(enrichment);
	if (qa) sefer.appendChild(qa);

	// Footnotes shelf — visually distinct from the main text.
	const shelf = buildFootnotesShelf(post);
	if (shelf) sefer.appendChild(shelf);

	// B"H — shared mount: viewport replace + nav + theme + popups + sources.
	finalizeSeferMount(sefer, post);

	return true;
}

/* ---------------------------------------------------------------------------
 * B"H — finalizeSeferMount(sefer, post).
 * Shared mount for both sefer readers (Meluket + phrase-translation):
 * replaces the #realPost viewport (preserving .post-title), re-mounts
 * chapter navigation, marks the reader root, restores scale, wires the
 * footnote popup, the Sources button, and the theme watcher.
 * ------------------------------------------------------------------------- */
function finalizeSeferMount(sefer, post) {
	const realPost = document.getElementById('realPost');
	if (!realPost) {
		console.log("B\"H sefer mount skipped: no #realPost element");
		return;
	}
	// B"H — Yaakov's law: Hebrew in the DOM must stay visible. NEVER wipe
	// server-rendered Hebrew to mount a sefer that has no Hebrew.
	// Fail-safe: if the sefer carries no visible Hebrew but the current
	// #realPost does (server-rendered .awtsmoos-initial-unit-he), abort the
	// mount and keep the server content.
	const seferHebrew = Array.from(sefer.querySelectorAll('.meluket-phrase--he'))
		.filter(n => (n.textContent || '').replace(/\s+/g, '').length > 0);
	const serverHebrew = realPost.querySelector('.awtsmoos-initial-unit-he');
	if (!seferHebrew.length && serverHebrew) {
		console.error("B\"H sefer mount ABORTED: sefer has no Hebrew but server content does — keeping server Hebrew visible");
		try {
			if (window.__awtsmoosReportClientError) {
				window.__awtsmoosReportClientError({
					kind: 'sefer-mount-aborted',
					message: 'sefer had no Hebrew blocks; server Hebrew preserved',
					file: 'MeluketSeferReader.js', line: 0, col: 0, stack: ''
				});
			}
		} catch (_) { /* reporting is optional */ }
		return;
	}
	// Replace the single-block rendering with the sefer.
	// Preserve the post-title header if present (first child).
	const existingTitle = realPost.querySelector('.post-title');
	realPost.innerHTML = '';
	if (existingTitle) realPost.appendChild(existingTitle);
	realPost.appendChild(sefer);
	// B"H — diagnostic: log what actually mounted, so invisible-Hebrew
	// reports can be traced to the exact render outcome.
	try {
		const mountedHe = sefer.querySelectorAll('.meluket-phrase--he').length;
		const mountedEn = sefer.querySelectorAll('.meluket-phrase--en').length;
		console.log("B\"H sefer mounted: " + mountedHe + " Hebrew blocks, " + mountedEn + " English blocks, langMode=" + sefer.dataset.langMode);
	} catch (_) { /* diagnostics never break the mount */ }
	// Store reference to preserved title for language mode toggling
	if (existingTitle) sefer._preservedTitle = existingTitle;

	// B"H: re-mount prev/next chapter navigation. The viewport wipe above
	// removed the chapter nav that manifestPost appended — restore it after
	// the sefer so readers can move between teachings.
	if (typeof window !== 'undefined' && window.series && Array.isArray(window.series.posts)) {
		let pIdx = window.currentIndexInSeries;
		if ((pIdx === undefined || pIdx === null) && post.id) {
			const found = window.series.posts.indexOf(post.id);
			pIdx = found >= 0 ? found : 0;
		}
		import('../../functions/ui/nav.js?v=5da53e96f2').then(({ makeNavBars }) => {
			try {
				const nav = makeNavBars(post, window.series, pIdx);
				if (nav && nav.nodeType === 1) realPost.appendChild(nav);
			} catch (_) { /* navigation is optional */ }
		}).catch(() => { /* navigation is optional */ });
	}

	// Mark the reader root so sefer styles apply.
	const root = document.querySelector('.post-reader-localized-context');
	if (root) root.classList.add('meluket-sefer-active');

	// B"H — the sefer mounts after boot restored the reader scale, so re-apply
	// the remembered size now: this lands the proportional sefer zoom (see
	// ReaderScale.applySeferScale) on the freshly mounted Hebrew/English text.
	try { loadFontSize(); } catch (_) { /* scale restore is optional */ }

	// B"H: the sefer mounted its own English — refresh the generic translation
	// toolbar (if it mounted earlier with an empty report) so its status label
	// never contradicts the English visibly on the page.
	try { refreshTranslationStatus(); } catch (_) { /* toolbar absent */ }

	// B"H — Footnote markers: ONE delegated path (Coby 2026-11-11:
	// "Cleaner, simple, no conflicts"). A single document-level click
	// handler, installed once, opens the footnote popup for any marker
	// — inside or outside the sefer — and one keydown handler does
	// Enter/Space. The old per-sefer listeners are gone (every remount
	// stacked another copy), and so is the capture-phase "safety net"
	// that skipped sefer markers entirely. Shelf notes are not triggers:
	// a marker tap opens THE NOTE ITSELF in the popup, never a scroll.
	if (!window.__awtsmoosFnClickPath) {
		window.__awtsmoosFnClickPath = true;
		document.addEventListener('click', (e) => {
			const marker = e.target && e.target.closest ? e.target.closest('sup.meluket-fn-marker[data-fn], sup[data-fn]') : null;
			if (!marker || marker.closest('.meluket-footnotes-shelf')) return;
			const fnNum = marker.getAttribute('data-fn');
			if (!fnNum || !/^\d+$/.test(fnNum)) return;
			e.preventDefault();
			e.stopPropagation();
			openFootnotePopup(fnNum, marker, marker.closest('.meluket-sefer') || document);
		});
		document.addEventListener('keydown', (e) => {
			if (e.key !== 'Enter' && e.key !== ' ') return;
			const marker = e.target && e.target.closest ? e.target.closest('sup.meluket-fn-marker[data-fn], sup[data-fn]') : null;
			if (!marker || marker.closest('.meluket-footnotes-shelf')) return;
			e.preventDefault();
			marker.click();
		});
	}

	// Escape closes the footnote popup or the Sources sheet.
	document.addEventListener('keydown', (e) => {
		if (e.key !== 'Escape') return;
		if (isFootnotePopupOpen()) {
			e.preventDefault();
			closeFootnotePopup();
			return;
		}
		if (isSourcesSheetOpen()) {
			e.preventDefault();
			closeSourcesSheet();
		}
	});

	// B"H — Sources button opens the Sources sheet on Meluket posts.
	wireSourcesButton(post, sefer);

	// Theme watcher: force sefer colors based on awtsmoos-theme.
	// This overrides any CSS cascade issues with !important inline styles.
	const applySeferTheme = () => {
		const theme = localStorage.getItem('awtsmoos-theme') || 'dark';
		// B"H fix: NO !important inline styles (violates Yaakov's CSS Law 1).
		// Colors are defined in meluket-sefer.css using :root[data-theme] selectors.
		// Set data-theme on the sefer root so CSS :root[data-theme] rules apply.
		sefer.dataset.awtsmoosTheme = theme;
		document.documentElement.dataset.theme = theme;
		// Hide Hebrew title in English mode via JS (backup for CSS)
		const langMode = sefer.dataset.langMode;
		const titleHe = sefer.querySelector('.meluket-sefer-title-he');
		if (titleHe) {
			titleHe.style.display = (langMode === 'english') ? 'none' : '';
		}
		// Also hide the preserved old post-title (stored reference)
		const preservedTitle = sefer._preservedTitle;
		if (preservedTitle) {
			preservedTitle.style.display = (langMode === 'english') ? 'none' : '';
		}
	};
	applySeferTheme();
	// Watch for theme changes
	window.addEventListener('storage', (e) => {
		if (e.key === 'awtsmoos-theme') applySeferTheme();
	});
	// Also check periodically (theme might change without storage event).
	// B"H fix: only touch the DOM when the theme actually changed (was: forced
	// !important inline styles on every element every 2 seconds).
	let lastSeenTheme = localStorage.getItem('awtsmoos-theme') || 'dark';
	setInterval(() => {
		const current = localStorage.getItem('awtsmoos-theme') || 'dark';
		if (current !== lastSeenTheme) {
			lastSeenTheme = current;
			applySeferTheme();
		}
	}, 2000);

	return true;
}

/**
 * B"H — Adapter: Torah Ohr-style posts carry `phraseTranslations`:
 * [{ postId, sectionId, phraseId, source: { hebrew }, en, provenance }].
 * Groups them by sectionId (first-seen order) into the same shape the
 * Meluket sefer reader consumes: [{ sectionId, items: [{ he, en, phraseId }] }].
 * Entries with no visible Hebrew are skipped; entries missing `en` keep
 * their Hebrew and render Hebrew-only (buildSectionElement handles that).
 * Sections left with no usable items are dropped entirely.
 */
export function groupPhraseTranslations(phrases) {
	const order = [];
	const bySection = new Map();
	for (const p of (Array.isArray(phrases) ? phrases : [])) {
		const sectionId = p && p.sectionId != null ? String(p.sectionId).trim() : '';
		if (!sectionId) continue;
		const heRaw = p.source && p.source.hebrew != null ? p.source.hebrew : '';
		if (!hasVisibleText(heRaw)) continue; // missing Hebrew → skip
		const enRaw = p.en != null ? p.en : '';
		const phraseId = p.phraseId != null ? String(p.phraseId) : '';
		if (!bySection.has(sectionId)) {
			bySection.set(sectionId, []);
			order.push(sectionId);
		}
		bySection.get(sectionId).push({ he: String(heRaw), en: String(enRaw), phraseId });
	}
	const grouped = [];
	for (const sectionId of order) {
		const items = bySection.get(sectionId);
		if (items && items.length) grouped.push({ sectionId, items });
	}
	return grouped;
}

/**
 * B"H — Torah Ohr phrase-translation reader.
 * Main entry: restructures a Torah Ohr post (phraseTranslations +
 * translation.readable, no enrichment/content/dayuh) into the same
 * bilingual sefer layout the Meluket reader uses.
 * @param {object} post The window.post object with phraseTranslations.
 * @returns {boolean} True if the sefer restructuring was applied.
 */
export function awakenPhraseTranslationReader(post) {
	const phrases = post && post.phraseTranslations;
	if (!Array.isArray(phrases) || !phrases.length) {
		return false; // Not a phrase-translation post.
	}
	// B"H — never clobber a Meluket sefer that already mounted.
	const realPost = document.getElementById('realPost');
	if (!realPost) {
		console.log("B\"H phrase reader skipped: no #realPost element");
		return false;
	}
	const mountedSefer = realPost.querySelector('.meluket-sefer');
	if (mountedSefer) {
		// B"H batch 27e (2026-11-11): the server sefer holds the text at first paint, so hydrate it and attach the notes shelf from the loaded post even though the sefer already mounted — without this, packed posts never get a shelf (the popup still works: it reads footnotes[] first).
		if (mountedSefer.dataset.serverBuilt === '1' && !mountedSefer.dataset.hydrated) {
			hydrateServerSefer(mountedSefer);
			mountedSefer.dataset.hydrated = '1';
		}
		if (!mountedSefer.querySelector('.meluket-footnotes-shelf')) {
			const shelf = buildFootnotesShelf(post);
			if (shelf) mountedSefer.appendChild(shelf);
		}
		console.log("B\"H phrase reader: sefer already mounted — hydrated + shelf attached");
		return true;
	}
	if (realPost.querySelector('.meluket-sefer')) {
		console.log("B\"H phrase reader skipped: a sefer is already mounted");
		return false;
	}

	const grouped = groupPhraseTranslations(phrases);
	if (!grouped.length) {
		console.log("B\"H phrase reader skipped: no usable phrase groups");
		return false;
	}
	console.log("B\"H phrase reader activating:", grouped.length, "sections,", phrases.length, "phrases");

	ensureMeluketSeferStyles();

	const readableRaw = (post.translation && post.translation.readable) || {};
	// B"H — normalize readable to {sectionId: englishText}.
	// Shape A (legacy): {sec-001: "...", sec-002: "..."} — direct map.
	// Shape B (translation pipeline): {sections: [{sectionId, english}, ...]}.
	const readable = (() => {
		if (readableRaw && Array.isArray(readableRaw.sections)) {
			const map = {};
			for (const s of readableRaw.sections) {
				if (s && s.sectionId) map[String(s.sectionId)] = s.english || s.text || '';
			}
			return map;
		}
		return readableRaw;
	})();
	const summaries = post.summaries || {};
	const sectionSummaries = summaries.sectionSummaries || {};
	const langMode = readSavedLangMode();

	// Build the sefer container (same classes as Meluket for consistent CSS).
	const sefer = document.createElement('div');
	sefer.className = 'meluket-sefer';
	sefer.dataset.langMode = langMode;

	// Title block — sefer-style.
	const titleText = post.title || (post.identity && post.identity.title) || '';
	const titleBlock = document.createElement('header');
	titleBlock.className = 'meluket-sefer-title';
	const titleHe = document.createElement('h1');
	titleHe.className = 'meluket-sefer-title-he';
	titleHe.setAttribute('dir', 'rtl');
	titleHe.textContent = titleText;
	titleBlock.appendChild(titleHe);
	sefer.appendChild(titleBlock);

	// Post summary — the klal before the pratim.
	const postSummaryRaw = summaries.postSummary;
	const postSummary = typeof postSummaryRaw === 'string'
		? postSummaryRaw
		: (postSummaryRaw && (postSummaryRaw.detailed || postSummaryRaw.short)) || '';
	if (postSummary && String(postSummary).trim()) {
		const summaryWrap = el('div', 'meluket-post-summary');
		summaryWrap.setAttribute('dir', 'ltr');
		summaryWrap.setAttribute('lang', 'en');
		summaryWrap.appendChild(el('div', 'meluket-summary-label', 'Overview'));
		const body = el('p', null, String(postSummary).trim());
		summaryWrap.appendChild(body);
		sefer.appendChild(summaryWrap);
	}

	// Language toggle — lives ONLY in the Scribe's Lens settings panel.
	const toggle = buildLangToggle(langMode, (mode) => applyLangMode(sefer, mode, 'Torah Ohr · English | Awtsmoos'));
	injectLangToggleIntoSettings(toggle);
	enhanceScribeLensPanel();

	// B"H — Torah Ohr argument flowchart ("The argument at a glance"):
	// renders after the overview, before the sections.
	const flowchartEl = buildFlowchartElement(post);
	if (flowchartEl) {
		sefer.appendChild(flowchartEl);
	}

	// Sections — each phrase's English rides with its Hebrew phrase;
	// translation.readable[sectionId] is the section-level English fallback.
	// B"H perf (Yaakov 2026-10-15): chunk section rendering so the first
	// sections paint immediately and the rest stream in via idle callbacks.
	// Building all 38 sections synchronously blocked the main thread for seconds.
	const sectionQueue = grouped.map(({ sectionId, items }, index) => {
		const englishText = readable[sectionId] || '';
		const secSummaryRaw = sectionSummaries[sectionId];
		const sectionSummary = typeof secSummaryRaw === 'string'
			? secSummaryRaw
			: (secSummaryRaw && (secSummaryRaw.detailed || secSummaryRaw.short)) || '';
		return { index, sectionId, items, englishText, sectionSummary };
	});
	// B"H — Coby Nov 10: the sefer must land all at once, simple and fast.
	// Render EVERY section synchronously before mounting — no streaming.
	// 7 sections / 271 phrases is small; the idle-callback drip is what
	// made the page feel like it "keeps loading big sections".
	for (const s of sectionQueue) {
		sefer.appendChild(buildSectionElement(s.index, s.sectionId, s.items, s.englishText, s.sectionSummary, langMode));
	}
	// B"H — footnotes shelf (Coby 2026-11-11): phrase-translation posts
	// carry a real footnotes[] array; build the same shelf the Meluket
	// path builds, or their markers have no note bodies on the page.
	const shelf = buildFootnotesShelf(post);
	if (shelf) sefer.appendChild(shelf);

	// Mount the complete sefer.
	finalizeSeferMount(sefer, post);
	return true;
}
