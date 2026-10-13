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
import { loadFontSize } from '../../functions/ui/Dimensionality.js';

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
	// B"H — Yaakov (2026-10-13): tapping a footnote marker must ALWAYS do
	// something. Search the sefer first, then the whole document; if the
	// note truly doesn't exist, show the number with an honest message
	// instead of silently doing nothing.
	let note = null;
	try {
		note = sefer && sefer.querySelector ? sefer.querySelector(`.meluket-footnote[data-fn="${fnNum}"]`) : null;
	} catch (_) { /* invalid selector chars */ }
	if (!note) {
		try {
			note = document.querySelector(`.meluket-footnote[data-fn="${fnNum}"], #meluket-fn-${fnNum}`);
		} catch (_) { /* invalid selector chars */ }
	}
	ensureFootnoteModal();
	fnNumEl.textContent = fnNum;
	fnBodyEl.innerHTML = '';
	if (!note) {
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

function buildSourcesSheetContent(post, sefer) {
	ensureSourcesSheet();
	const sections = Array.from(sefer.querySelectorAll('.meluket-sefer-section'));
	const footnotes = Array.from(sefer.querySelectorAll('.meluket-footnote'));
	// Cache for tab switching.
	srcCachedData = { post, sefer, sections, footnotes };

	// Breadcrumb: Heichel > Series > Post.
	srcCrumbEl.innerHTML = '';
	const heichelName = (window.post && window.post.heichel && window.post.heichel.name) || 'Ikar';
	const seriesName = (window.series && (window.series.prateem?.name || window.series.name))
		|| post.seriesTitle || post.seriesId || '';
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
			renderSourcesTab();
		});
		srcTabsEl.appendChild(tab);
	});

	renderSourcesTab();
}

function renderSourcesTab() {
	if (!srcCachedData) return;
	const { post, sections, footnotes } = srcCachedData;
	srcListEl.innerHTML = '';
	if (srcCurrentTab === 'sections') renderSourcesSections(post, sections);
	else if (srcCurrentTab === 'footnotes') renderSourcesFootnotes(footnotes);
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

function sourcesFootnoteText(fnEl) {
	const raw = String(fnEl.textContent || '').replace(/\s+/g, ' ').trim();
	return raw.length > 140 ? raw.slice(0, 140) + '…' : raw;
}

function renderSourcesFootnotes(footnotes) {
	if (!footnotes.length) {
		srcListEl.appendChild(el('div', 'awtsmoos-src-empty', 'No footnotes in this post.'));
		return;
	}
	footnotes.forEach((fnEl, index) => {
		const num = fnEl.dataset.fnNum || fnEl.getAttribute('data-footnote') || String(index + 1);
		const btn = el('button', 'awtsmoos-src-fn-item');
		btn.type = 'button';
		btn.setAttribute('aria-label', `Go to footnote ${num}`);
		btn.append(el('span', 'awtsmoos-src-fn-num', String(num)));
		const txt = el('span', 'awtsmoos-src-fn-text', sourcesFootnoteText(fnEl));
		txt.setAttribute('dir', 'auto');
		btn.append(txt);
		btn.addEventListener('click', () => {
			closeSourcesSheet();
			fnEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
			fnEl.classList.add('awtsmoos-fn-flash');
			setTimeout(() => fnEl.classList.remove('awtsmoos-fn-flash'), 1600);
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
				// B"H: footnote data carries escaped entities (&lt;b&gt;) and
				// [cup] tokens — decode + bold them, never show raw markup.
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
		sefer.appendChild(shelf);
	}

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

	// B"H — Footnote markers: tap opens the footnote popup (Yaakov: never scroll
	// to the bottom). Only <sup class="meluket-fn-marker"> triggers this; the
	// shelf notes themselves are not triggers.
	sefer.addEventListener('click', (e) => {
		const marker = e.target.closest ? e.target.closest('sup.meluket-fn-marker[data-fn]') : null;
		if (!marker) return;
		const fnNum = marker.getAttribute('data-fn');
		if (!fnNum) return;
		e.preventDefault();
		e.stopPropagation();
		openFootnotePopup(fnNum, marker, sefer);
	});

	// B"H (2026-10-13, Yaakov): document-level safety net. If a footnote
	// marker lives outside the sefer root, or the sefer handler missed it,
	// this still opens the popup. Capture phase runs before bubble handlers.
	if (!window.__awtsmoosFnDocHandler) {
		window.__awtsmoosFnDocHandler = true;
		document.addEventListener('click', (e) => {
			const marker = e.target && e.target.closest ? e.target.closest('sup.meluket-fn-marker[data-fn], sup[data-fn]') : null;
			if (!marker || marker.closest('.meluket-footnotes-shelf')) return;
			const fnNum = marker.getAttribute('data-fn');
			if (!fnNum) return;
			// If the sefer handler already opened the popup, don't double-fire.
			if (isFootnotePopupOpen()) return;
			e.preventDefault();
			const root = marker.closest('.meluket-sefer') || document;
			openFootnotePopup(fnNum, marker, root);
		}, true);
	}

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

	const readable = (post.translation && post.translation.readable) || {};
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
	grouped.forEach(({ sectionId, items }, index) => {
		const englishText = readable[sectionId] || '';
		const secSummaryRaw = sectionSummaries[sectionId];
		const sectionSummary = typeof secSummaryRaw === 'string'
			? secSummaryRaw
			: (secSummaryRaw && (secSummaryRaw.detailed || secSummaryRaw.short)) || '';
		sefer.appendChild(buildSectionElement(index, sectionId, items, englishText, sectionSummary, langMode));
	});

	finalizeSeferMount(sefer, post);
	return true;
}
