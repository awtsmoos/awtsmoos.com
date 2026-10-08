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
 * @param {Array} phrases Raw hebrew_phrases array.
 * @returns {Array<{sectionId:string, html:string}>} Ordered sections with concatenated HTML.
 */
export function buildHebrewSections(phrases) {
	const groups = new Map();
	for (const phrase of phrases || []) {
		const sectionId = phrase.sectionId || 'sec-000';
		if (!groups.has(sectionId)) groups.set(sectionId, []);
		groups.get(sectionId).push(phrase);
	}
	const ordered = Array.from(groups.keys()).sort((a, b) => sectionIdKey(a) - sectionIdKey(b));
	return ordered.map(sectionId => {
		const items = groups.get(sectionId).sort((a, b) => comparePhraseId(a.phraseId, b.phraseId));
		const html = items.map(p => p.he || '').join('');
		return { sectionId, html };
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
	flush();
	return phrases;
}

/**
 * Builds one sefer section: Hebrew phrase blocks + English beneath + summary.
 */
function buildSectionElement(sectionIndex, sectionId, hebrewHtml, englishText, sectionSummary, langMode) {
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

	// Hebrew vessel (the ikar, above the English) — phrase blocks.
	const hebrew = document.createElement('div');
	hebrew.className = 'meluket-hebrew';
	hebrew.setAttribute('dir', 'rtl');
	hebrew.setAttribute('lang', 'he');
	const phraseBlocks = splitHebrewPhrases(hebrewHtml);
	if (phraseBlocks.length) {
		for (const phraseHtml of phraseBlocks) {
			const block = document.createElement('div');
			block.className = 'meluket-phrase';
			block.innerHTML = phraseHtml;
			hebrew.appendChild(block);
		}
	} else {
		hebrew.innerHTML = hebrewHtml;
	}
	section.appendChild(hebrew);

	// English vessel (translation) — beneath the Hebrew, never beside it.
	if (englishText && englishText.trim()) {
		const english = document.createElement('div');
		english.className = 'meluket-english';
		english.setAttribute('dir', 'ltr');
		english.setAttribute('lang', 'en');
		const paragraphs = String(englishText).split(/\n{2,}|\r\n{2,}/);
		for (const para of paragraphs) {
			const trimmed = para.trim();
			if (!trimmed) continue;
			const p = document.createElement('p');
			p.textContent = trimmed;
			english.appendChild(p);
		}
		section.appendChild(english);
	}

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
 * Applies the language mode to all sefer sections.
 */
function applyLangMode(root, mode) {
	root.querySelectorAll('.meluket-sefer-section').forEach(section => {
		section.dataset.langMode = mode;
	});
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

	const hebrewSections = buildHebrewSections(enrichment.hebrew_phrases);
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
	const postSummary = summariesEn.post;
	if (postSummary && String(postSummary).trim()) {
		const summaryWrap = el('div', 'meluket-post-summary');
		summaryWrap.setAttribute('dir', 'ltr');
		summaryWrap.setAttribute('lang', 'en');
		summaryWrap.appendChild(el('div', 'meluket-summary-label', 'Overview'));
		const body = el('p', null, String(postSummary).trim());
		summaryWrap.appendChild(body);
		sefer.appendChild(summaryWrap);
	}

	// Language toggle.
	const toggle = buildLangToggle(langMode, (mode) => applyLangMode(sefer, mode));
	sefer.appendChild(toggle);

	// Sections.
	hebrewSections.forEach(({ sectionId, html }, index) => {
		const englishText = translationEn[sectionId] || '';
		const sectionSummary = sectionSummaries[sectionId] || '';
		sefer.appendChild(buildSectionElement(index, sectionId, html, englishText, sectionSummary, langMode));
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

	// Mark the reader root so sefer styles apply.
	const root = document.querySelector('.post-reader-localized-context');
	if (root) root.classList.add('meluket-sefer-active');

	return true;
}
