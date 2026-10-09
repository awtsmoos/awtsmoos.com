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

import { refreshTranslationStatus } from '../../translations/render.js';

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
 * - Bare trailing footnote digits ("…Israel 5.") become a marker. Only 1-3
 *   digits, so years like 1967 are left alone.
 * Everything else is HTML-escaped, so innerHTML is safe here.
 */
export function renderEnglishWithFootnotes(enText) {
	const placeholders = [];
	const SUP_LITERAL_RE = /<sup\b[^>]*\bdata-fn="(\d+)"[^>]*>\s*(\d+)\s*<\/sup\s*>/gi;
	let text = String(enText || '').replace(SUP_LITERAL_RE, (m, fnNum) => {
		placeholders.push(fnNum);
		return `\u0000FN${placeholders.length - 1}\u0000`;
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
	return escaped.replace(/\u0000FN(\d+)\u0000/g, (m, idx) => footnoteMarkerHtml(placeholders[Number(idx)]));
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
	let last = null;
	let cur;
	while ((cur = walker.nextNode())) last = cur;
	if (!last || !last.parentNode) return;
	const value = last.nodeValue;
	const m = value.match(/(^|\D)(\d{1,3})([.!?…‥"”"'')\];:—–-]*\s*)$/);
	if (!m) return;
	const prefix = m[1];
	const digits = m[2];
	const tail = m[3];
	last.nodeValue = value.slice(0, value.length - m[0].length) + prefix;
	const sup = document.createElement('sup');
	sup.setAttribute('data-fn', digits);
	sup.textContent = digits;
	const parent = last.parentNode;
	parent.insertBefore(sup, last.nextSibling);
	if (tail) parent.insertBefore(document.createTextNode(tail), sup.nextSibling);
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
 * Builds one sefer section: Hebrew phrase blocks with each phrase's English
 * dwelling directly beneath its Hebrew — never side by side — plus summary.
 * B"H — phrase-level English (joined on phraseId) replaces the old
 * section-level English blob. Empty Hebrew phrases (tail misalignment) are
 * skipped gracefully; a phrase block renders when it has Hebrew or English.
 */
export function buildSectionElement(sectionIndex, sectionId, hebrewItems, englishFallback, sectionSummary, langMode) {
	const section = document.createElement('section');
	section.className = 'meluket-sefer-section';
	section.dataset.sectionId = sectionId;
	section.dataset.sectionIndex = String(sectionIndex);
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

	// Hebrew vessel (the ikar, above the English) — one block per phrase.
	const hebrew = document.createElement('div');
	hebrew.className = 'meluket-hebrew';
	hebrew.setAttribute('dir', 'rtl');
	hebrew.setAttribute('lang', 'he');
	const items = Array.isArray(hebrewItems) ? hebrewItems : [];
	const toCupHtml = (he) => String(he || '')
		.replace(/\[cup\]/g, '<b>')
		.replace(/\[\/cup\]/g, '</b>');
	for (const item of items) {
		// B"H: skip empty-Hebrew phrases gracefully (tail misalignment
		// artifacts) instead of rendering blank blocks.
		if (!hasVisibleText(item.he)) continue;
		const block = document.createElement('div');
		block.className = 'meluket-phrase';
		if (item.phraseId) block.dataset.phraseId = item.phraseId;
		block.innerHTML = toCupHtml(item.he);
		// B"H: the data carries footnote markers as bare trailing digits —
		// no <sup> in the data. Convert them to real markers at render time.
		convertBareFootnoteDigits(block);
		hebrew.appendChild(block);
	}
	section.appendChild(hebrew);

	// English vessel — each phrase's English dwells beneath its own Hebrew
	// phrase, never side by side. Falls back to the legacy section blob for
	// posts whose enrichment has no translation_en_phrases yet.
	const phraseEnglish = items.filter(item => item.en && String(item.en).trim());
	if (phraseEnglish.length) {
		const english = document.createElement('div');
		english.className = 'meluket-english';
		english.setAttribute('dir', 'ltr');
		english.setAttribute('lang', 'en');
		for (const item of phraseEnglish) {
			const block = document.createElement('div');
			block.className = 'meluket-phrase';
			if (item.phraseId) block.dataset.phraseId = item.phraseId;
			// B"H: innerHTML — never textContent — so footnote markers
			// become real <sup> elements; the renderer escapes the rest.
			block.innerHTML = renderEnglishWithFootnotes(item.en);
			english.appendChild(block);
		}
		section.appendChild(english);
	} else if (englishFallback && String(englishFallback).trim()) {
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
	if (closeBtn) {
		closeBtn.addEventListener('click', () => {
			const trigger = document.getElementById('typographyBtn');
			if (trigger) {
				trigger.click();
			} else {
				panel.classList.add('hidden-details');
				panel.setAttribute('aria-hidden', 'true');
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
 * Applies the language mode to all sefer sections.
 */
function applyLangMode(root, mode) {
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
		// Use English transliteration for tab
		document.title = 'Meluket - English | Awtsmoos';
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
	const note = sefer.querySelector(`.meluket-footnote[data-fn="${fnNum}"]`);
	if (!note) return;
	ensureFootnoteModal();
	fnNumEl.textContent = fnNum;
	fnBodyEl.innerHTML = '';
	const he = note.querySelector('.meluket-footnote-he');
	const en = note.querySelector('.meluket-footnote-en');
	if (he) {
		const h = el('div', 'awtsmoos-fn-he');
		h.setAttribute('dir', 'rtl');
		h.setAttribute('lang', 'he');
		h.innerHTML = he.innerHTML;
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
	fnLastMarker = marker || null;
	fnOverlayEl.classList.add('is-open');
	fnModalEl.classList.add('is-open');
	fnCloseEl.focus({ preventScroll: true });
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
let srcListEl = null;
let srcOpen = false;

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
	srcListEl = el('div', 'awtsmoos-src-list');
	srcListEl.setAttribute('role', 'list');
	srcSheetEl.append(grab, head, srcMetaEl, srcListEl);
	root.append(srcOverlayEl, srcSheetEl);
	srcCloseEl.addEventListener('click', closeSourcesSheet);
	srcOverlayEl.addEventListener('click', closeSourcesSheet);
}

function sourcesSectionPreview(sectionEl) {
	const hebrew = sectionEl.querySelector('.meluket-hebrew');
	const raw = hebrew ? hebrew.textContent : sectionEl.textContent;
	const clean = String(raw || '').replace(/\s+/g, ' ').trim();
	return clean.length > 90 ? clean.slice(0, 90) + '…' : clean;
}

function buildSourcesSheetContent(post, sefer) {
	ensureSourcesSheet();
	// Post sources card.
	srcMetaEl.innerHTML = '';
	const card = el('div', 'awtsmoos-src-card');
	const seriesName = (window.series && (window.series.prateem?.name || window.series.name))
		|| post.seriesTitle || post.seriesId || '';
	const rows = [
		['Sefer', post.title || ''],
		['Series', seriesName],
		['Author', post.author || post.authorName || ''],
	].filter(([, v]) => v && String(v).trim());
	rows.forEach(([label, value]) => {
		const row = el('div', 'awtsmoos-src-card-row');
		row.append(el('span', 'awtsmoos-src-card-label', label), el('span', 'awtsmoos-src-card-value', String(value)));
		row.lastChild.setAttribute('dir', 'auto');
		card.appendChild(row);
	});
	const sections = Array.from(sefer.querySelectorAll('.meluket-sefer-section'));
	const footnotes = Array.from(sefer.querySelectorAll('.meluket-footnote'));
	const stats = el('div', 'awtsmoos-src-stats', `${sections.length} sections · ${footnotes.length} footnotes`);
	card.appendChild(stats);
	if (card.children.length) srcMetaEl.appendChild(card);

	// Per-section index with comment affordances.
	srcListEl.innerHTML = '';
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
			const bus = await import('/heichelos/post/comments/state/eventBus.js');
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

/* B"H — Hijack the Sources button on Meluket posts only (capture phase, so the
 * generic sidebar toggle on document.body never fires). Non-Meluket posts and
 * the general reader path are untouched. */
function wireSourcesButton(post, sefer) {
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
	const postSummaryRaw = summariesEn.post;
	const postSummary = typeof postSummaryRaw === 'string' ? postSummaryRaw : (postSummaryRaw?.detailed || postSummaryRaw?.short || '');
	if (postSummary && String(postSummary).trim()) {
		const summaryWrap = el('div', 'meluket-post-summary');
		summaryWrap.setAttribute('dir', 'ltr');
		summaryWrap.setAttribute('lang', 'en');
		summaryWrap.appendChild(el('div', 'meluket-summary-label', 'Overview'));
		const body = el('p', null, String(postSummary).trim());
		summaryWrap.appendChild(body);
		sefer.appendChild(summaryWrap);
	}

	// Language toggle — B"H Yaakov: lives ONLY in the Scribe's Lens settings
	// panel, NEVER on the main page. Injected into #typographyDetails.
	const toggle = buildLangToggle(langMode, (mode) => applyLangMode(sefer, mode));
	injectLangToggleIntoSettings(toggle);
	enhanceScribeLensPanel();

	// Sections — each phrase's English rides with its Hebrew phrase.
	hebrewSections.forEach(({ sectionId, items }, index) => {
		const englishText = translationEn[sectionId] || '';
		const sectionSummary = sectionSummaries[sectionId] || '';
		sefer.appendChild(buildSectionElement(index, sectionId, items, englishText, sectionSummary, langMode));
	});

	// Q&A — questions and answers.
	const questions = Array.isArray(enrichment.questions_en) ? enrichment.questions_en : [];
	const answers = Array.isArray(enrichment.answers_en) ? enrichment.answers_en : [];
	if (questions.length || answers.length) {
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
		if (list.children.length) {
			qa.appendChild(list);
			sefer.appendChild(qa);
		}
	}

	// Footnotes shelf — visually distinct from the main text.
	const footnotes = Array.isArray(post.footnotes) ? post.footnotes : [];
	if (footnotes.length) {
		const shelf = document.createElement('aside');
		shelf.className = 'meluket-footnotes-shelf';
		const shelfTitle = document.createElement('h2');
		shelfTitle.className = 'meluket-footnotes-title';
		shelfTitle.textContent = 'הערות · Notes';
		shelf.appendChild(shelfTitle);
		const list = document.createElement('ol');
		list.className = 'meluket-footnotes-list';
		footnotes.forEach((fn, idx) => {
			const li = document.createElement('li');
			li.className = 'meluket-footnote';
			li.id = `meluket-fn-${idx + 1}`;
			li.setAttribute('data-fn', String(idx + 1));
			const num = document.createElement('span');
			num.className = 'meluket-footnote-num';
			num.textContent = String(idx + 1);
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
				heSpan.innerHTML = heBody;
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
		sefer.appendChild(shelf);
	}

	// Replace the single-block rendering with the sefer.
	// Preserve the post-title header if present (first child).
	const existingTitle = realPost.querySelector('.post-title');
	realPost.innerHTML = '';
	if (existingTitle) realPost.appendChild(existingTitle);
	realPost.appendChild(sefer);
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
		import('../../functions/ui/nav.js').then(({ makeNavBars }) => {
			try {
				const nav = makeNavBars(post, window.series, pIdx);
				if (nav && nav.nodeType === 1) realPost.appendChild(nav);
			} catch (_) { /* navigation is optional */ }
		}).catch(() => { /* navigation is optional */ });
	}

	// Mark the reader root so sefer styles apply.
	const root = document.querySelector('.post-reader-localized-context');
	if (root) root.classList.add('meluket-sefer-active');

	// B"H: the sefer mounted its own English — refresh the generic translation
	// toolbar (if it mounted earlier with an empty report) so its status label
	// never contradicts the English visibly on the page.
	try { refreshTranslationStatus(); } catch (_) { /* toolbar absent */ }

	// B"H — Footnote markers: tap opens the footnote popup (Yaakov: never scroll
	// to the bottom). Only <sup class="meluket-fn-marker"> triggers this; the
	// shelf notes themselves are not triggers.
	sefer.addEventListener('click', (e) => {
		const marker = e.target.closest ? e.target.closest('sup.meluket-fn-marker[data-fn]') : null;
		if (!marker) return;
		const fnNum = marker.getAttribute('data-fn');
		if (!fnNum) return;
		e.preventDefault();
		openFootnotePopup(fnNum, marker, sefer);
	});

	// Keyboard activation for <sup role="button"> footnote markers.
	sefer.addEventListener('keydown', (e) => {
		if (e.key !== 'Enter' && e.key !== ' ') return;
		const marker = e.target.closest && e.target.closest('sup.meluket-fn-marker[data-fn]');
		if (!marker) return;
		e.preventDefault();
		marker.click();
	});

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
