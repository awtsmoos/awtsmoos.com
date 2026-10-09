// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PreservedActionText
 * @description
 * The Awtsmoos gathers reader text into safe, reusable forms for contextual
 * actions. Awtsmoos.com keeps normalization, section access, selection, and
 * whole-post composition separate from menus so each responsibility stays small.
 */

import { stripTags } from '../../utils.js';

/**
 * Converts arbitrary reader content into normalized visible text.
 * @param {unknown} value Any stored or rendered reader value.
 * @returns {string} Plain text with excessive blank lines collapsed.
 */
export function asText(value) {
	return stripTags(String(value ?? ''))
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

/**
 * Returns the currently manifested section collection without inventing data.
 * @returns {Array<unknown>} Canonical in-memory sections or an empty collection.
 */
export function readerSections() {
	if (Array.isArray(window.sectionDayuh)) {
		return window.sectionDayuh;
	}
	return window.post?.dayuh?.sections
		|| window.post?.sections
		|| [];
}

/**
 * Flattens one reader section into ordered visible paragraphs.
 * @param {unknown} section Stored section, nested paragraph list, or scalar text.
 * @returns {string[]} Non-empty normalized paragraph strings.
 */
export function flattenSection(section) {
	if (Array.isArray(section)) {
		return section
			.flat(Infinity)
			.map(asText)
			.filter(Boolean);
	}
	const value = asText(section?.text ?? section?.content ?? section);
	return value ? [value] : [];
}

/**
 * Reads the current native browser selection without mutating it.
 * @returns {string} Trimmed selected text, or an empty string.
 */
export function selectedReaderText() {
	return String(window.getSelection?.().toString?.() || '').trim();
}

/**
 * Builds a complete copyable teaching from truthful title and section state.
 * On Meluket sefer posts the copy walks the live phrase pairs so every
 * Hebrew phrase carries its English translation, then overview, summaries,
 * Q&A, and footnotes — the whole maamar, nothing invented.
 * @returns {string} Heading and body separated by stable blank lines.
 */
export function completeReaderText() {
	const heading = [
		asText(window.series?.prateem?.name || window.series?.name),
		asText(window.post?.title || window.post?.name)
	]
		.filter(Boolean)
		.join('\n');
	const meluketCopy = completeMeluketReaderText();
	const body = meluketCopy
		|| readerSections()
			.flatMap(flattenSection)
			.join('\n\n')
		|| asText(document.getElementById('realPost')?.innerText || '');
	return [heading, body]
		.filter(Boolean)
		.join('\n\n');
}

/** Plain text of one element with footnote markers rendered as [n]. */
function meluketPlainText(element) {
	if (!element) return '';
	const clone = element.cloneNode(true);
	clone.querySelectorAll('sup').forEach(sup => {
		const num = (sup.textContent || '').trim();
		sup.replaceWith(document.createTextNode(/^\d+$/.test(num) ? ` [${num}]` : ''));
	});
	return (clone.textContent || '')
		.replace(/[ \t]{2,}/g, ' ')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

/**
 * Copies a Meluket sefer post phrase-by-phrase: Hebrew, then its English,
 * section by section, followed by summaries, Q&A, and footnotes.
 * @returns {string} The full maamar as text, or an empty string when the
 * sefer structure is absent.
 */
function completeMeluketReaderText() {
	if (!document.querySelector('.meluket-sefer')) return '';
	const parts = [];
	const overview = document.querySelector('.meluket-post-summary');
	if (overview) {
		const label = overview.querySelector('.meluket-summary-label')?.textContent?.trim() || 'Overview';
		const body = meluketPlainText(overview.querySelector('p') || overview);
		if (body) parts.push(`${label}\n${body}`);
	}
	document.querySelectorAll('.meluket-sefer-section').forEach((sectionEl, index) => {
		const lines = [`— Section ${index + 1} —`];
		sectionEl.querySelectorAll('.meluket-phrase-pair').forEach(pair => {
			const he = meluketPlainText(pair.querySelector('.meluket-phrase--he'));
			const en = meluketPlainText(pair.querySelector('.meluket-phrase--en'));
			if (he) lines.push(he);
			if (en) lines.push(en);
		});
		const englishFallback = sectionEl.querySelector('.meluket-english');
		if (englishFallback && !lines.some(line => line === meluketPlainText(englishFallback))) {
			const fallbackText = meluketPlainText(englishFallback);
			if (fallbackText) lines.push(fallbackText);
		}
		const summary = sectionEl.querySelector('.meluket-summary');
		if (summary) {
			const summaryText = meluketPlainText(summary.querySelector('p') || summary);
			if (summaryText) lines.push(`Summary: ${summaryText}`);
		}
		if (lines.length > 1) parts.push(lines.join('\n\n'));
	});
	document.querySelectorAll('.meluket-qa-item').forEach(item => {
		const q = item.querySelector('.meluket-qa-q')?.textContent?.trim() || '';
		const a = item.querySelector('.meluket-qa-a')?.textContent?.trim() || '';
		const qaText = [q && `Q: ${q}`, a && `A: ${a}`].filter(Boolean).join('\n');
		if (qaText) parts.push(qaText);
	});
	const footnotes = [];
	document.querySelectorAll('.meluket-footnote[data-fn]').forEach(li => {
		const num = li.getAttribute('data-fn') || '';
		const he = meluketPlainText(li.querySelector('.meluket-footnote-he'));
		const en = meluketPlainText(li.querySelector('.meluket-footnote-en'));
		const body = [he, en].filter(Boolean).join('\n');
		if (body) footnotes.push(`[${num}] ${body}`);
	});
	if (footnotes.length) parts.push(`Footnotes\n${footnotes.join('\n\n')}`);
	return parts.join('\n\n\n');
}
