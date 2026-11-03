// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module InitialContentRenderer
 * @description
 * The Awtsmoos reveals meaningful Torah before interactive JavaScript arrives;
 * Awtsmoos.com keeps canonical verses exact and plain teachings safe, formatted, and free of machine trails.
 * Where a post lives in units, the Awtsmoos lets its words arise in sight;
 * both first paint and hydration may then carry the teaching's light.
 */

const { collectReadableText, escapeHtml, toPlainText } = require('./InitialContentText.js');
const { renderReadableUnits } = require('./InitialContentUnits.js');

/**
 * Gives source prose its own plain paragraphs, safely free from script.
 * @param {string} text - Normalized public prose.
 * @returns {string} Safe paragraph HTML.
 */
function renderParagraphs(text) {
	return String(text || '').split(/\n{2,}/).map(paragraph => {
		const safe = escapeHtml(paragraph.trim()).replace(/\n/g, '<br>');
		return safe ? `<p>${safe}</p>` : '';
	}).filter(Boolean).join('\n');
}

/**
 * Names a canonical pasuk without changing its original numbering.
 * @param {unknown} section - Canonical source section.
 * @param {number} index - Zero-based sequence position.
 * @param {number} chapter - Canonical chapter index.
 * @returns {string} One numbered section.
 */
function renderPasuk(section, index, chapter) {
	const number = index + 1;
	const text = collectReadableText(section);
	if (!text) return '';
	const anchor = `pasuk-${number}`;
	return `<section class="awtsmoos-initial-pasuk awtsmoos-reader-section"`
		+ ` id="${anchor}" data-awtsmoos-pasuk data-pasuk="${number}"`
		+ ` data-source-chapter="${chapter}" dir="rtl">`
		+ `<a class="awtsmoos-verse-number" href="#${anchor}" aria-label="Pasuk ${number}">${number}</a>`
		+ `<p class="awtsmoos-initial-pasuk-text">${escapeHtml(text).replace(/\n/g, '<br>')}</p></section>`;
}

/** Renders numbered verses only when canonical source metadata supports them. */
function renderCanonicalSections(sections, meta) {
	if (!Array.isArray(sections) || meta?.canonicalHebrew !== true) return '';
	const chapter = Number(meta.sourceChapter) || 0;
	return sections.map((section, index) => renderPasuk(section, index, chapter)).filter(Boolean).join('\n');
}

/** Renders an honest absent-teaching state without implying endless loading. */
function renderMissingPost() {
	return `<article class="awtsmoos-initial-post awtsmoos-initial-post-missing" data-awtsmoos-initial-post dir="auto">`
		+ `<h1>Torah teaching unavailable</h1><p>This public teaching could not be resolved.</p></article>`;
}

/**
 * Restores flat content, unit-based text, or older structured post fields.
 * @param {object} post - Server-resolved public post.
 * @param {object} dayuh - Optional structured content.
 * @returns {string} Escaped body HTML independent of unrelated modules.
 */
function plainBodyMarkup(post, dayuh) {
	if (typeof post?.content === 'string' && post.content.trim()) {
		return renderParagraphs(collectReadableText(post.content));
	}
	const unitMarkup = renderReadableUnits(post?.units || dayuh?.units);
	if (unitMarkup) return unitMarkup;
	const source = post?.body || post?.text || post?.sections || dayuh?.content || dayuh;
	return renderParagraphs(collectReadableText(source));
}

/**
 * Builds the immediately visible teaching before client-side hydration.
 * @param {{post: object, heichel?: object, alias?: object}} context - Public reader vessels.
 * @returns {string} Safe source content and authorship metadata.
 */
function renderInitialContent({ post, heichel = {}, alias = {} }) {
	if (!post || typeof post !== 'object') return renderMissingPost();
	const dayuh = post.dayuh && typeof post.dayuh === 'object' ? post.dayuh : {};
	const structuredMarkup = renderCanonicalSections(dayuh.sections, dayuh.meta || {});
	const bodyMarkup = structuredMarkup || plainBodyMarkup(post, dayuh);
	const title = toPlainText(post.title) || 'Torah Revelation';
	const heichelName = toPlainText(heichel.name || heichel.title);
	const authorName = toPlainText(alias.name || alias.aliasId || post.authorName || post.authorHandleDisplay);
	const contextText = [heichelName, authorName ? `By ${authorName}` : ''].filter(Boolean).join(' · ');
	const awaitingText = bodyMarkup ? '' : ` data-awtsmoos-awaiting-text="true"`;
	const enhancement = bodyMarkup
		? `<p class="awtsmoos-reader-enhancement-status" role="status">Interactive reader tools are loading; the Torah text above is ready now.</p>`
		: '';
	return `<article class="awtsmoos-initial-post" data-awtsmoos-initial-post${awaitingText} dir="auto">`
		+ (contextText ? `<p class="awtsmoos-initial-post-context">${escapeHtml(contextText)}</p>` : '')
		+ `<h1>${escapeHtml(title)}</h1>`
		+ `<div class="awtsmoos-initial-post-body">${bodyMarkup}</div>`
		+ enhancement
		+ `</article>`;
}

module.exports = { renderCanonicalSections, renderInitialContent, renderParagraphs };
