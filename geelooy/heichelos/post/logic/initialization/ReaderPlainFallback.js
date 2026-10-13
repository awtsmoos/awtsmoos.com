// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Plain bilingual fallback renderer — Yaakov's standing law.
 *
 * No single JS failure may ever blank the reader. When canonical boot throws,
 * this module renders the post as clean plain bilingual text (Hebrew + English)
 * using the graceful-degradation styles already inline in the post template.
 * It is deliberately dependency-free (no imports) so it can run even when
 * other reader modules failed to load.
 */

/**
 * Escapes HTML special characters.
 * @param {unknown} value Raw value.
 * @returns {string} Escaped string.
 */
function escapeHtml(value) {
	return String(value == null ? '' : value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/**
 * Strips tags and normalizes whitespace from a rich-text value.
 * @param {unknown} value Raw value.
 * @returns {string} Plain text.
 */
function toPlainText(value) {
	if (value == null) {
		return '';
	}
	return String(value)
		.replace(/<br[^>]*>/gi, '\n')
		.replace(/<\/(p|div|li|h[1-6]|blockquote|section|article)>/gi, '\n\n')
		.replace(/<[^>]*>/g, ' ')
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n[ \t]+/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

/**
 * Detects Hebrew script in a string.
 * @param {string} text Text to test.
 * @returns {boolean} True when Hebrew characters are present.
 */
function hasHebrew(text) {
	return /[\u0590-\u05FF]/.test(String(text || ''));
}

/**
 * Resolves a human-readable post title without ever returning a raw ID.
 * @param {object} post Post record.
 * @returns {string} Readable title.
 */
export function resolveFallbackTitle(post) {
	if (!post || typeof post !== 'object') {
		return 'Torah Teaching';
	}
	const identity = post.identity && typeof post.identity === 'object' ? post.identity : {};
	const candidates = [
		post.heTitle,
		identity.title,
		post.title,
		post.name
	];
	for (const candidate of candidates) {
		const text = toPlainText(candidate);
		if (!text) {
			continue;
		}
		// Never surface raw IDs (BH_POST_..., BH-torahOhr-...) as titles.
		if (/^BH[_-]POST[_-]/i.test(text) || /^BH[-_][a-z]+[-_]/i.test(text)) {
			continue;
		}
		return text;
	}
	return 'Torah Teaching';
}

/**
 * Groups phrase translations by sectionId, mirroring the sefer reader.
 * @param {Array} phrases Raw phraseTranslations array.
 * @returns {Array<{sectionId: string, items: Array<{he: string, en: string}>}>} Grouped sections.
 */
function groupPhrases(phrases) {
	const order = [];
	const bySection = new Map();
	for (const p of (Array.isArray(phrases) ? phrases : [])) {
		const sectionId = p && p.sectionId != null ? String(p.sectionId).trim() : '';
		if (!sectionId) {
			continue;
		}
		const heRaw = p.source && p.source.hebrew != null ? p.source.hebrew : '';
		const he = toPlainText(heRaw);
		if (!he) {
			continue;
		}
		const en = toPlainText(p.en != null ? p.en : '');
		if (!bySection.has(sectionId)) {
			bySection.set(sectionId, []);
			order.push(sectionId);
		}
		bySection.get(sectionId).push({ he, en });
	}
	return order.map((sectionId) => ({ sectionId, items: bySection.get(sectionId) }));
}

/**
 * Renders phrase translations as plain bilingual sections.
 * @param {Array} phrases phraseTranslations array.
 * @returns {string} HTML string (may be empty).
 */
function renderPhrases(phrases) {
	const grouped = groupPhrases(phrases);
	if (!grouped.length) {
		return '';
	}
	return grouped.map((section, index) => {
		const units = section.items.map((item) => {
			const parts = [];
			parts.push('<div lang="he" dir="rtl">' + escapeHtml(item.he).replace(/\n/g, '<br>') + '</div>');
			if (item.en) {
				parts.push('<div lang="en" dir="ltr">' + escapeHtml(item.en).replace(/\n/g, '<br>') + '</div>');
			}
			return '<section style="margin:0.9em 0;">' + parts.join('\n') + '</section>';
		}).join('\n');
		return '<section aria-label="Section ' + (index + 1) + '">' + units + '</section>';
	}).join('\n');
}

/**
 * Renders generic units arrays as plain bilingual blocks.
 * @param {Array} units Units array with he/hebrew and en/english fields.
 * @returns {string} HTML string (may be empty).
 */
function renderUnits(units) {
	if (!Array.isArray(units) || !units.length) {
		return '';
	}
	const blocks = [];
	for (const unit of units) {
		if (!unit || typeof unit !== 'object') {
			continue;
		}
		const he = toPlainText(unit.he != null ? unit.he : unit.hebrew);
		const en = toPlainText(unit.en != null ? unit.en : unit.english);
		if (!he && !en) {
			continue;
		}
		const parts = [];
		if (he) {
			parts.push('<div lang="he" dir="rtl">' + escapeHtml(he).replace(/\n/g, '<br>') + '</div>');
		}
		if (en) {
			parts.push('<div lang="en" dir="ltr">' + escapeHtml(en).replace(/\n/g, '<br>') + '</div>');
		}
		blocks.push('<section style="margin:0.9em 0;">' + parts.join('\n') + '</section>');
	}
	return blocks.join('\n');
}

/**
 * Builds the plain bilingual article HTML for a post. Pure function of the
 * post record — no DOM access — so it can be unit-tested in Node.
 * @param {object} post Post record (window.post shape).
 * @param {unknown} ohrError The failure that triggered the fallback (for the honest notice).
 * @returns {string} Complete article HTML. Never empty: always carries at
 * least the title and an honest notice.
 */
export function buildPlainBilingualArticle(post, ohrError) {
	const title = resolveFallbackTitle(post);
	const titleDir = hasHebrew(title) ? ' dir="rtl" lang="he"' : '';
	let body = '';
	if (post && typeof post === 'object') {
		body = renderPhrases(post.phraseTranslations) || renderUnits(post.units);
		if (!body) {
			const raw = post.content || post.body || post.text;
			const text = toPlainText(raw);
			if (text) {
				const dir = hasHebrew(text) ? ' dir="rtl" lang="he"' : '';
				body = '<div' + dir + '>' + escapeHtml(text).replace(/\n/g, '<br>') + '</div>';
			}
		}
	}
	const errorNote = ohrError
		? '<p role="status" style="font-size:14px;opacity:0.85;">The interactive reader hit a problem ('
			+ escapeHtml((ohrError && ohrError.message) || String(ohrError)).slice(0, 200)
			+ ') — showing the teaching as plain text.</p>'
		: '<p role="status" style="font-size:14px;opacity:0.85;">The interactive reader is unavailable — showing the teaching as plain text.</p>';
	const emptyBody = body
		? ''
		: '<p>The teaching text could not be loaded. <button type="button" onclick="location.reload()">Try again</button></p>';
	return '<article data-awtsmoos-plain-fallback="true" dir="auto">'
		+ '<h1' + titleDir + '>' + escapeHtml(title) + '</h1>'
		+ errorNote
		+ '<div>' + (body || emptyBody) + '</div>'
		+ '</article>';
}

/**
 * Mounts the plain bilingual fallback into the reader viewport.
 * Safe to call multiple times; safe when the viewport is missing.
 * @param {object} post Post record (may be null/undefined).
 * @param {HTMLElement} viewport #realPost element (may be null).
 * @param {unknown} ohrError The failure that triggered the fallback.
 * @returns {boolean} True when fallback content was mounted.
 */
export function renderPlainBilingualFallback(post, viewport, ohrError) {
	try {
		const doc = typeof document !== 'undefined' ? document : null;
		if (!doc) {
			return false;
		}
		const mount = viewport || doc.getElementById('realPost') || doc.querySelector('main');
		if (!mount) {
			return false;
		}
		mount.innerHTML = buildPlainBilingualArticle(post, ohrError);
		mount.removeAttribute('data-awtsmoos-awaiting-text');
		if (doc.body && doc.body.dataset) {
			doc.body.dataset.readerFallbackReady = 'true';
			delete doc.body.dataset.socialReaderReady;
		}
		const title = resolveFallbackTitle(post);
		if (title && title !== 'Torah Teaching') {
			try {
				doc.title = title + ' | Awtsmoos';
			} catch (titleError) {
				// Title is cosmetic; never let it break the fallback.
			}
		}
		return true;
	} catch (fallbackError) {
		try {
			console.error('B"H plain fallback failed', fallbackError);
		} catch (logError) {
			// Absolutely nothing left to do.
		}
		return false;
	}
}
