//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module NeedsWorkDetect
 * @description
 * Sibling of NeedsWorkRoutes: per-post gap detection, relocated verbatim.
 */

const { isBlank, collectText, countPageMarkers } = require('./needsWorkText.js');

/**
 * Detects gaps for one post record. Series conventions (computed from the
 * already-scanned siblings) decide whether absent footnotes/page markers
 * are genuine gaps or simply not that series' convention.
 */
function detectPostGaps(post, conventions) {
	const gaps = [];
	const detail = {};

	// --- translations ---
	if (Array.isArray(post.units)) {
		let missing = 0;
		let noPhrases = 0;
		for (const unit of post.units) {
			if (!unit) continue;
			if (isBlank(unit.english)) missing++;
			if (!Array.isArray(unit.phrases) || unit.phrases.length === 0) noPhrases++;
		}
		if (missing > 0) {
			gaps.push("missing_translation");
			detail.missing_translation = { unitsMissing: missing, unitsTotal: post.units.length };
		}
		if (noPhrases > 0) {
			gaps.push("missing_phrase_translations");
			detail.missing_phrase_translations = { unitsMissing: noPhrases, unitsTotal: post.units.length };
		}
	} else if (post.translation !== undefined) {
		const readable = post.translation && post.translation.readable;
		if (isBlank(readable)) {
			gaps.push("missing_translation");
			detail.missing_translation = { note: "translation.readable is empty" };
		}
		if (post.phraseTranslations !== undefined && isBlank(post.phraseTranslations)) {
			gaps.push("missing_phrase_translations");
			detail.missing_phrase_translations = { note: "phraseTranslations is empty" };
		}
	} else if (post.hebrew && !post.english) {
		gaps.push("missing_translation");
		detail.missing_translation = { note: "hebrew-only record" };
	}

	// --- summaries ---
	if (post.summaries !== undefined && isBlank(post.summaries)) {
		gaps.push("missing_summaries");
	}

	// --- footnotes (data-driven: only a gap when the series uses them) ---
	const hasFootnotes = post.footnotes !== undefined && !isBlank(post.footnotes);
	if (post.footnotes !== undefined && isBlank(post.footnotes) && conventions.footnoteShare >= 0.5) {
		gaps.push("missing_footnotes");
		detail.missing_footnotes = { note: "footnotes field empty; series convention includes footnotes" };
	} else if (post.footnotes === undefined && conventions.footnoteShare >= 0.5 && conventions.footnoteFieldSeen) {
		gaps.push("missing_footnotes");
		detail.missing_footnotes = { note: "no footnotes field; series convention includes footnotes" };
	}

	// --- inline page markers ---
	const text = collectText(post);
	const markers = countPageMarkers(text);
	if (markers.broken > 0) {
		gaps.push("broken_page_markers");
		detail.broken_page_markers = { broken: markers.broken };
	}
	if (markers.valid === 0 && conventions.pageMarkerShare >= 0.5) {
		gaps.push("missing_page_markers");
		detail.missing_page_markers = { note: "no [p. N] markers; series convention uses them" };
	}

	// --- alias link ---
	if (isBlank(post.author)) {
		gaps.push("no_alias_link");
	}

	return { gaps, detail, markerCount: markers.valid, hasFootnotes };
}

module.exports = { detectPostGaps };
