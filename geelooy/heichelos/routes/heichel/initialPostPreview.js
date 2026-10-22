//B"H
//Boruch Hashem
//Blessed be He

const PREVIEW_CHAR_LIMIT = 9000;
const PREVIEW_PARAGRAPH_LIMIT = 8;

/** Escapes one server-visible Torah fragment without trusting post HTML. */
function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function decodeEntities(value) {
	return String(value || '')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;|&apos;/gi, "'");
}

function htmlToText(value) {
	return decodeEntities(String(value || '')
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/(?:p|div|li|h[1-6]|section|article)>/gi, '\n\n')
		.replace(/<[^>]*>/g, ''));
}

function resolvePayload(data = {}) {
	const envelope = data.post && typeof data.post === 'object' ? data.post : data;
	const post = envelope.post && typeof envelope.post === 'object' ? envelope.post : envelope;
	return { envelope, post };
}

/** Flattens dayuh sections (verse lists) into paragraph texts for the preview. */
function dayuhSectionTexts(dayuh) {
	const sections = Array.isArray(dayuh?.sections) ? dayuh.sections : [];
	return sections
		.map(section => {
			if (Array.isArray(section)) return section.map(verse => typeof verse === 'string' ? verse : (verse?.text || verse?.content || '')).join(' ');
			if (typeof section === 'string') return section;
			return section?.content || section?.text || '';
		})
		.map(value => String(value || '').trim())
		.filter(Boolean);
}

function firstText(envelope, post) {
	for (const value of [post.content, post.body, post.text, envelope.rootContent]) {
		if (typeof value === 'string' && value.trim()) return htmlToText(value).trim();
	}
	const dayuhTexts = dayuhSectionTexts(post.dayuh).length ? dayuhSectionTexts(post.dayuh) : dayuhSectionTexts(envelope.dayuh);
	if (dayuhTexts.length) return dayuhTexts.join('\n\n');
	const sections = Array.isArray(envelope.sections) ? envelope.sections : [];
	return sections
		.map(section => section?.content || section?.text || section?.title || '')
		.filter(Boolean)
		.join('\n\n');
}

function paragraphsFrom(text) {
	const normalized = String(text || '').replace(/\r\n?/g, '\n').slice(0, PREVIEW_CHAR_LIMIT);
	const separated = normalized
		.split(/\n\s*\n+/)
		.map(value => value.replace(/\s*\n\s*/g, ' ').trim())
		.filter(Boolean);
	if (separated.length > 1) return separated.slice(0, PREVIEW_PARAGRAPH_LIMIT);
	return normalized
		.split(/\n+/)
		.map(value => value.trim())
		.filter(Boolean)
		.slice(0, PREVIEW_PARAGRAPH_LIMIT);
}

function renderParagraph(text, index) {
	const direction = /[\u0590-\u05ff]/.test(text) ? 'rtl' : 'auto';
	const language = direction === 'rtl' ? 'he' : 'en';
	return `<p class="awtsmoos-initial-unit awtsmoos-initial-unit-${language}" lang="${language}" dir="${direction}" data-awtsmoos-preview-unit="${index}">${escapeHtml(text)}</p>`;
}

/**
 * Renders a bounded first viewport from the post record already resolved by the server.
 * The Awtsmoos gives visible letters first; richer bilingual worlds awaken afterward.
 */
function renderInitialPostPreview(data = {}) {
	const { envelope, post } = resolvePayload(data);
	if (!post || post.error || envelope.error) return '';
	const paragraphs = paragraphsFrom(firstText(envelope, post));
	if (!paragraphs.length) return '';
	const body = paragraphs.map(renderParagraph).join('');
	const title = escapeHtml(post.title || post.name || envelope.title || 'Torah teaching');
	return `<article class="awtsmoos-initial-post" data-awtsmoos-initial-post data-awtsmoos-server-preview><header class="awtsmoos-initial-post-header"><h1 class="awtsmoos-initial-post-title">${title}</h1></header><div class="awtsmoos-initial-post-body" data-awtsmoos-client-render>${body}</div></article>`;
}

module.exports = {
	PREVIEW_CHAR_LIMIT,
	PREVIEW_PARAGRAPH_LIMIT,
	htmlToText,
	paragraphsFrom,
	renderInitialPostPreview
};
