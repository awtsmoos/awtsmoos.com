// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file postSemantic.js
 * @description
 * The Awtsmoos gives each teaching one named address and one truthful description; Awtsmoos.com can therefore be searched without splitting one revelation
 * into duplicate shadows, while the living reader remains free to deepen the page after its first semantic breath.
 *
 * SEO law: every real post carries a title and description drawn from its own
 * words — Hebrew title plus English title where the post is translated, and a
 * description excerpted from the actual units (Hebrew and English where both
 * exist). The generic fallbacks below are a last resort for records that
 * carry no title at all; they must never describe a real post.
 */

/** @description Escapes untrusted text before it enters HTML metadata. */
function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/** @description Collapses display text into a compact search-facing phrase. */
function cleanText(value) {
	return String(value ?? '').replace(/\s+/g, ' ').trim();
}

/** @description Strips inline markup and decodes the common entities posts carry. */
function plainText(value) {
	return cleanText(
		String(value ?? '')
			.replace(/&nbsp;/gi, ' ')
			.replace(/<br[^>]*>/gi, ' ')
			.replace(/<\/(p|div|li|h[1-6]|blockquote|section|article)>/gi, ' ')
			.replace(/<[^>]*>/g, ' ')
			.replace(/&amp;/gi, '&')
			.replace(/&lt;/gi, '<')
			.replace(/&gt;/gi, '>')
			.replace(/&quot;/gi, '"')
			.replace(/&#39;|&apos;/gi, "'")
	);
}

/** @description Removes leading page/marker brackets posts carry inline (e.g. [וילנא: ...], [p. א]). */
function stripLeadingMarkers(text) {
	return cleanText(String(text || '').replace(/^(\[[^\]\n]{0,60}\]\s*)+/, ''));
}

/** @description Cuts an excerpt at a word boundary so search snippets never end mid-word. */
function cutWords(text, maximum) {
	const clean = cleanText(text);
	if (clean.length <= maximum) return clean;
	const cut = clean.slice(0, maximum);
	const lastSpace = cut.lastIndexOf(' ');
	const trimmed = (lastSpace > maximum * 0.5 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:·—–\-/]+$/, '');
	return trimmed + '…';
}

/** @description Encodes one canonical URL segment. */
function encodeSegment(value) {
	return encodeURIComponent(String(value ?? ''));
}

/** @description Resolves the heichel identity from every vessel that can carry it. */
function resolveHeichelId(data) {
	return cleanText(
		data?.heichelId
		|| data?.heichel?.id
		|| data?.post?.heichelId
		|| ''
	);
}

/**
 * @description Builds one canonical path for a public post, preferring its series identity when known.
 * @param {object} data Reader data vessel.
 * @returns {string} Canonical path.
 */
function buildCanonicalPath(data) {
	const heichelId = resolveHeichelId(data);
	const postId = data?.post?.id || data?.postId || '';
	const seriesId = data?.parentSeries || data?.post?.parentSeriesId || data?.post?.seriesId || '';
	const base = `/heichelos/${encodeSegment(heichelId)}`;
	if (seriesId && seriesId !== 'root') {
		return `${base}/series/${encodeSegment(seriesId)}/post/${encodeSegment(postId)}`;
	}
	return `${base}/post/${encodeSegment(postId)}`;
}

/** @description Returns the unit vessels a post record can carry across every corpus. */
function postUnits(post) {
	if (Array.isArray(post?.units)) return post.units;
	return [];
}

/** @description Reads the Hebrew text from any unit shape ({he} or {hebrew}). */
function unitHebrew(unit) {
	if (!unit || typeof unit !== 'object') return '';
	return plainText(unit.he ?? unit.hebrew ?? '');
}

/** @description Reads the English text from any unit shape ({en} or {english}). */
function unitEnglish(unit) {
	if (!unit || typeof unit !== 'object') return '';
	return plainText(unit.en ?? unit.english ?? '');
}

/**
 * @description Finds the first real Hebrew and English excerpts in a post's units.
 * Prefers substantive prose over fragment headers: the first excerpt with
 * meaningful length wins, falling back to the first non-empty unit.
 * @param {object} post Post record.
 * @returns {{hebrew: string, english: string}} Excerpts (possibly empty).
 */
function firstExcerpts(post) {
	const units = postUnits(post);
	let hebrew = '';
	let english = '';
	let fallbackHebrew = '';
	let fallbackEnglish = '';
	for (const unit of units) {
		const heCandidate = stripLeadingMarkers(unitHebrew(unit));
		const enCandidate = unitEnglish(unit);
		if (!fallbackHebrew && heCandidate) fallbackHebrew = heCandidate;
		if (!fallbackEnglish && enCandidate) fallbackEnglish = enCandidate;
		if (!hebrew && heCandidate.length >= 60) hebrew = heCandidate;
		if (!english && enCandidate.length >= 40) english = enCandidate;
		if (hebrew && english) break;
	}
	return {
		hebrew: hebrew || fallbackHebrew,
		english: english || fallbackEnglish
	};
}

/**
 * @description Detects the content languages present on a post: 'he' when Hebrew
 * units or a Hebrew title exist, 'en' when English units exist.
 * @param {object} post Post record.
 * @returns {string[]} Language codes in content order.
 */
function detectContentLanguages(post) {
	const { hebrew, english } = firstExcerpts(post);
	const languages = [];
	const hasHebrew = Boolean(hebrew) || Boolean(cleanText(post?.heTitle));
	const hasEnglish = Boolean(english);
	if (hasHebrew) languages.push('he');
	if (hasEnglish) languages.push('en');
	if (!languages.length) languages.push('he');
	return languages;
}

/**
 * @description Builds a real search description from the post's own words:
 * Hebrew excerpt first, English excerpt after where the post is translated.
 * Falls back to the address-style description only when the record carries
 * no usable text at all.
 * @param {object} data Reader data vessel.
 * @param {string} postTitle Resolved post title (already plain text).
 * @param {string} heichelName Resolved heichel name (already plain text).
 * @returns {string} Plain-text description, unescaped.
 */
function buildDescription(data, postTitle, heichelName) {
	const { hebrew, english } = firstExcerpts(data?.post);
	if (hebrew && english) {
		return cutWords(`${hebrew} / ${english}`, 220);
	}
	if (hebrew) {
		return cutWords(hebrew, 220);
	}
	if (english) {
		return cutWords(english, 220);
	}
	return `Read ${postTitle} in ${heichelName} on Awtsmoos.com.`.slice(0, 220);
}

/**
 * @description Resolves the real post title: Hebrew title plus English title
 * where they differ, then English title, then Hebrew title, then the series or
 * commentator identity. The generic 'Torah Teaching' fires only when the
 * record carries no title of its own.
 * @param {object} post Post record.
 * @returns {{pageTitle: string, articleTitle: string}} Plain-text titles, unescaped.
 */
function buildTitles(post) {
	const enTitle = cleanText(post?.title);
	const heTitle = cleanText(post?.heTitle);
	const fallback = cleanText(post?.seriesId) || cleanText(post?.commentator);
	let articleTitle = '';
	if (heTitle && enTitle && heTitle !== enTitle) {
		articleTitle = `${heTitle} · ${enTitle}`;
	} else if (enTitle) {
		articleTitle = enTitle;
	} else if (heTitle) {
		articleTitle = heTitle;
	} else if (fallback) {
		articleTitle = fallback;
	} else {
		articleTitle = 'Torah Teaching';
	}
	return { articleTitle, pageTitle: `${articleTitle} | Awtsmoos` };
}

/**
 * @description Creates escaped metadata shared by direct and Road reader pages.
 * @param {object} data Reader data vessel.
 * @returns {object} Search-facing semantic model.
 */
function buildPostSemantic(data) {
	const { pageTitle, articleTitle } = buildTitles(data?.post);
	const heichelName = cleanText(data?.heichel?.name || data?.heichel?.title) || 'Geelooy Heichel';
	const canonicalPath = buildCanonicalPath(data);
	const canonicalUrl = `https://awtsmoos.com${canonicalPath}`;
	const description = buildDescription(data, articleTitle, heichelName);
	const languages = detectContentLanguages(data?.post);
	return {
		pageTitle: escapeHtml(pageTitle),
		description: escapeHtml(description),
		canonicalPath: escapeHtml(canonicalPath),
		canonicalUrl: escapeHtml(canonicalUrl),
		articleTitle: escapeHtml(articleTitle),
		heichelName: escapeHtml(heichelName),
		inLanguage: languages,
		hreflangLinks: languages.map((language) => ({
			language,
			href: escapeHtml(canonicalUrl)
		})),
		indexable: Boolean(data?.post && data?.post?.id)
	};
}

module.exports = {
	buildCanonicalPath,
	buildPostSemantic,
	buildTitles,
	buildDescription,
	cleanText,
	cutWords,
	detectContentLanguages,
	escapeHtml,
	firstExcerpts,
	plainText,
	resolveHeichelId,
	stripLeadingMarkers,
	unitEnglish,
	unitHebrew,
	postUnits
};
