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

/**
 * Packed posts carry their teaching in content.sections (paragraphs) and
 * content.units (phrase pairs). Flattens them to preview paragraphs:
 * section Hebrew first, then English, so the server embed holds real
 * teaching even when no string content/dayuh/sections key exists.
 */
function packedContentTexts(content) {
	if (!content || typeof content !== 'object' || Array.isArray(content)) return [];
	const texts = [];
	const push = value => {
		const clean = htmlToText(value).trim();
		if (clean) texts.push(clean);
	};
	const sections = Array.isArray(content.sections) ? content.sections : [];
	for (const section of sections) {
		if (section && typeof section === 'object') {
			push(section.hebrew);
			push(section.english);
		} else {
			push(section);
		}
	}
	if (!texts.length && Array.isArray(content.units)) {
		const hebrew = [];
		const english = [];
		for (const unit of content.units) {
			const h = typeof unit?.hebrew === 'string' ? unit.hebrew.trim() : '';
			const e = typeof unit?.english === 'string' ? unit.english.trim() : '';
			if (h) hebrew.push(h);
			if (e) english.push(e);
		}
		if (hebrew.length) texts.push(hebrew.join(' '));
		if (english.length) texts.push(english.join(' '));
	}
	return texts;
}

function firstText(envelope, post) {
	for (const value of [post.content, post.body, post.text, envelope.rootContent]) {
		if (typeof value === 'string' && value.trim()) return htmlToText(value).trim();
	}
	for (const value of [post.content, envelope.content]) {
		const texts = packedContentTexts(value);
		if (texts.length) return texts.join('\n\n');
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
 * B"H 2026-11-10 round 7 — Coby: the reader must be INSTANT, no delay at
 * all. The embed awaken (round 5) still waited on the JS module (1–2s),
 * so the plain paragraph showed first and visibly swapped to cards.
 * The only true instant is server-rendered cards: when the phrase rows
 * are here, the first paint IS the sefer (same classes the client builds,
 * text only escaped — the client hydrates footnote markers + cup
 * formatting onto it afterward, without rebuilding). No rows → the plain
 * paragraph fallback, exactly as before.
 */
function renderInitialPostPreview(data = {}, translations) {
	const { envelope, post } = resolvePayload(data);
	if (!post || post.error || envelope.error) return '';
	const title = post.title || post.name || envelope.title || 'Torah teaching';
	// B"H 2026-11-11 batch 27b: packed posts (the Likkutei publish) carry
	// phraseTranslations on the post record itself, and their translations
	// endpoint serves no rows for them — feed the sefer from the record
	// so the first paint is the sefer for those posts too.
	const seferRows = Array.isArray(translations) && translations.length
		? translations
		: (Array.isArray(post.phraseTranslations) ? post.phraseTranslations : translations);
	const seferHtml = renderSeferInitialHtml(seferRows, title);
	if (seferHtml) return seferHtml;
	const paragraphs = paragraphsFrom(firstText(envelope, post));
	if (!paragraphs.length) return '';
	const body = paragraphs.map(renderParagraph).join('');
	return `<article class="awtsmoos-initial-post" data-awtsmoos-initial-post data-awtsmoos-server-preview><header class="awtsmoos-initial-post-header"><h1 class="awtsmoos-initial-post-title">${escapeHtml(title)}</h1></header><div class="awtsmoos-initial-post-body" data-awtsmoos-client-render>${body}</div></article>`;
}

module.exports = {
	PREVIEW_CHAR_LIMIT,
	PREVIEW_PARAGRAPH_LIMIT,
	htmlToText,
	paragraphsFrom,
	renderInitialPostPreview,
	renderSeferInitialHtml,
	slimPhraseTranslationRows,
	renderPhraseTranslationsEmbed
};

/**
 * B"H 2026-11-10 round 7 — server-rendered sefer. Mirrors the client's
 * buildSectionElement markup exactly (same classes, same data attributes,
 * same section/phrase numbering) so the sefer CSS applies from the first
 * paint and the client's enhance path recognises the mount
 * (data-embed-built="1", same section + pair counts). The text is only
 * HTML-escaped here; the client hydrates footnote markers + cup
 * formatting onto the mounted pairs afterward (reading textContent back
 * and re-rendering), never rebuilding. verseSection IS the section
 * (0–6); subsectionId is the phrase index inside its section — grouping
 * by subsectionId would make 271 one-phrase sections.
 */
function renderSeferInitialHtml(rows, title) {
	const slim = slimPhraseTranslationRows(rows);
	if (slim.length < 20) return '';
	const sections = [];
	const bySection = new Map();
	for (const row of slim) {
		const key = String(row.verseSection ?? row.sectionId ?? '');
		if (!bySection.has(key)) {
			const section = { key, items: [] };
			bySection.set(key, section);
			sections.push(section);
		}
		bySection.get(key).items.push(row);
	}
	const parts = [];
	parts.push('<div class="meluket-sefer meluket-sefer-active" data-lang-mode="both" data-embed-built="1" data-server-built="1">');
	parts.push(`<header class="meluket-sefer-title"><h1 class="meluket-sefer-title-he" dir="rtl" style="font-size:clamp(2rem, 13.5vw, 6.5625rem);line-height:1.15">${escapeHtml(title || 'Torah teaching')}</h1></header>`);
	sections.forEach((section, sIdx) => {
		const sectionId = `sec-${String(sIdx + 1).padStart(3, '0')}`;
		parts.push(`<section class="meluket-sefer-section" data-section-id="${sectionId}" data-section-index="${sIdx}" id="${sectionId}" dir="auto">`);
		parts.push(`<div class="meluket-section-marker" aria-hidden="true"><span class="meluket-section-number">${sIdx + 1}</span></div>`);
		section.items.forEach((row, pIdx) => {
			const phraseId = `segment_${sIdx}_${pIdx}`;
			parts.push(`<div class="meluket-phrase-pair" data-phrase-id="${phraseId}">`);
			parts.push(`<div class="meluket-phrase meluket-phrase--he" data-phrase-id="${phraseId}" dir="rtl" lang="he">${escapeHtml(row.sourceHebrew)}</div>`);
			if (row.content && String(row.content).trim()) {
				parts.push(`<div class="meluket-phrase meluket-phrase--en" data-phrase-id="${phraseId}" dir="ltr" lang="en">${escapeHtml(row.content)}</div>`);
			}
			parts.push('</div>');
		});
		parts.push('</section>');
	});
	parts.push('</div>');
	return parts.join('');
}

/**
 * B"H — Nov 10, 2026: the sefer waited on a second sequential round trip
 * (post HTML, then the translations API: 271 rows, ~372KB, ~1.26s from
 * Coby's phone in Vietnam). Slim the rows to the four fields the client
 * reader actually consumes (sourceHebrew, content, verseSection,
 * subsectionId): ~33KB for this post, a tenth of the full payload.
 * Rows without Hebrew are skipped — the client skips them too.
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

function slimPhraseTranslationRows(rows) {
	const list = Array.isArray(rows) ? rows : [];
	const out = [];
	for (const row of list) {
		// B"H batch 27b: two row shapes reach here — translation-API rows
		// ({sourceHebrew, content, verseSection, subsectionId}) and packed
		// post rows ({source: {hebrew}, en, sectionId, phraseId}). Normalize.
		const rawHebrew = row && row.sourceHebrew != null ? String(row.sourceHebrew)
			: (row && row.source && row.source.hebrew != null ? String(row.source.hebrew) : '');
		const rawContent = row && row.content != null ? String(row.content) : (row && row.en != null ? String(row.en) : '');
		// B"H batch 30: <pg n="N"/> printed-page markers -> [עמוד N] lead.
		const hebrewMark = awtsmoosPageMarker(rawHebrew);
		const contentMark = awtsmoosPageMarker(rawContent);
		const page = hebrewMark.page || contentMark.page;
		const hebrew = page ? `[עמוד ${page}] ` + hebrewMark.text : hebrewMark.text;
		const content = page ? `[עמוד ${page}] ` + contentMark.text : contentMark.text;
		if (!hebrew.trim()) continue;
		out.push({
			sourceHebrew: hebrew,
			content: content,
			verseSection: row && row.verseSection != null ? String(row.verseSection) : (row && row.sectionId != null ? String(row.sectionId) : ''),
			subsectionId: row && row.subsectionId != null ? String(row.subsectionId) : (row && row.phraseId != null ? String(row.phraseId) : '')
		});
	}
	return out;
}

/**
 * B"H — embed the slim rows as JSON in the initial HTML so the client
 * mounts the sefer from the first paint, with NO translations API round
 * trip. The client still validates coverage and falls back to the API
 * when the embed is missing or too thin. `<`/`>`/`&` are unicode-escaped
 * so the JSON can never close the script element or inject markup.
 */
function renderPhraseTranslationsEmbed(rows) {
	const slim = slimPhraseTranslationRows(rows);
	if (slim.length < 20) return '';
	const json = JSON.stringify(slim)
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e')
		.replace(/&/g, '\\u0026')
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');
	return `<script type="application/json" id="awtsmoos-phrase-translations" data-phrase-translations>${json}</script>`;
}
