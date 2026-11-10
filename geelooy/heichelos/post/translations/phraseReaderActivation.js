// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PhraseReaderActivation
 * @description
 * Coby's rule (Nov 10, 2026): English ALWAYS rides per phrase — every
 * Hebrew phrase (a period, a comma, or an opening/closing punctuation
 * marks a complete phrase) carries its own English translation WITH it,
 * never gathered into a separate section at the bottom of the page.
 *
 * The translation API returns aligned phrases (sourceHebrew + English
 * content, grouped by verseSection/subsectionId). This module turns them
 * into the phraseTranslations shape the Meluket phrase reader consumes,
 * extracts the footnote bodies from the post content's הערות section so
 * tapping a footnote still opens its text after the restructure, and
 * activates the reader. The reader replaces the single-block rendering
 * with interleaved phrase pairs (Hebrew, then ITS English directly
 * beneath) — the English never gathers into a separate block.
 */

const MIN_ALIGNED_PHRASES = 20;

/**
 * B"H — turn translation-API rows into phraseTranslations.
 * A row is an aligned phrase when it carries both a Hebrew source and an
 * English content string. verseSection groups the phrases into sections;
 * subsectionId is the phrase order inside its section.
 */
export function buildPhraseTranslations(post, rows) {
	const list = Array.isArray(rows) ? rows : [];
	const phrases = [];
	for (const row of list) {
		const hebrew = row && row.sourceHebrew != null ? String(row.sourceHebrew) : "";
		if (!hebrew.trim()) continue;
		const english = row && row.content != null ? String(row.content) : "";
		const sectionId = row && row.verseSection != null ? String(row.verseSection).trim() : "";
		const phraseId = row && row.subsectionId != null ? String(row.subsectionId).trim() : "";
		phrases.push({
			postId: (post && (post.id || post.postId)) || "",
			sectionId,
			phraseId,
			source: { hebrew },
			en: english,
			provenance: "translation-api"
		});
	}
	return phrases;
}

/**
 * B"H — extract the footnote bodies from the post content's הערות section.
 * Each footnote is `<sup>N</sup> Hebrew text.<br/>\nEnglish text.` followed
 * by a blank line. Returns [{ n, hebrew, english }] in number order.
 * The `*` publication note is not a numbered footnote and is skipped.
 */
export function extractPostFootnotes(content) {
	const text = typeof content === "string" ? content : "";
	const start = text.indexOf("הערות");
	if (start < 0) return [];
	const notes = text.slice(start);
	const pattern = /<sup>(\d+)<\/sup>\s*([\s\S]*?)<br\/>\s*\n([\s\S]*?)(?=\n\n<sup>|\s*$)/g;
	const out = [];
	let match;
	while ((match = pattern.exec(notes)) !== null) {
		const hebrew = String(match[2] || "").trim();
		const english = String(match[3] || "").trim();
		if (!hebrew && !english) continue;
		out.push({ n: Number(match[1]), hebrew, english });
	}
	out.sort((a, b) => a.n - b.n);
	return out;
}

/**
 * B"H — the aligned phrases must cover the post's Hebrew, or the sefer
 * would show only part of the teaching. Compare the joined aligned Hebrew
 * against the post content's Hebrew (before the English-translation marker,
 * when one exists). Require at least half the Hebrew to be covered.
 */
export function alignedPhrasesCoverPost(phrases, content) {
	const text = typeof content === "string" ? content : "";
	if (!text.trim() || !phrases.length) return false;
	const marker = text.indexOf("English translation");
	const hebrewPart = marker >= 0 ? text.slice(0, marker) : text;
	const strip = (s) => String(s).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
	const bodyLen = strip(hebrewPart).length;
	if (!bodyLen) return false;
	const alignedLen = phrases.reduce((sum, p) => sum + String((p.source && p.source.hebrew) || "").length, 0);
	return alignedLen >= bodyLen * 0.5;
}

/**
 * B"H — activate the per-phrase bilingual reader from translation-API rows.
 * Safe no-op when a sefer already mounted, when the rows are not aligned
 * phrases, or when there are too few to cover the post. Returns true when
 * the phrase reader mounted (the post now shows Hebrew + English per phrase).
 */
export async function activatePhraseReaderFromApi(post, rows) {
	// B"H — Nov 10, 2026: the diagnostic stamp is gone. The sefer is
	// verified, so nothing writes data-phrase-reader on #realPost and
	// nothing prefixes document.title with [phrase:...] anymore.
	try {
		const realPost = typeof document !== "undefined" ? document.getElementById("realPost") : null;
		if (!realPost) { return false; }
		// B"H — never clobber a sefer that already mounted (Torah Ohr posts
		// mount their phrase reader in boot; Meluket posts mount theirs).
		if (realPost.querySelector(".meluket-sefer")) { return false; }
		const phrases = buildPhraseTranslations(post, rows);
		if (phrases.length < MIN_ALIGNED_PHRASES) { return false; }
		// B"H — the rows must be ALIGNED phrases (Hebrew source + English),
		// not a bare English list. Require a Hebrew source on nearly all rows.
		const withHebrew = phrases.filter((p) => p.source && p.source.hebrew && p.source.hebrew.trim()).length;
		if (withHebrew < phrases.length * 0.9) { return false; }
		// B"H — the aligned phrases must cover the post's Hebrew, or the
		// sefer would show only part of the teaching. Fall back to the
		// canonical rendering when coverage is thin.
		if (!alignedPhrasesCoverPost(phrases, post && post.content)) { return false; }
		// B"H — footnote bodies live only in the post content's הערות section.
		// The phrase reader replaces the content, so carry them onto the post
		// (and window.post) or tapping a footnote shows "not available".
		const footnotes = extractPostFootnotes(post && post.content);
		const enriched = Object.assign({}, post, { phraseTranslations: phrases });
		if (footnotes.length) {
			enriched.footnotes = footnotes;
			try {
				if (typeof window !== "undefined" && window.post) window.post.footnotes = footnotes;
				if (typeof window !== "undefined" && window.post) window.post.phraseTranslations = phrases;
			} catch (_) { /* window.post is best-effort */ }
		}
		const { awakenPhraseTranslationReader } = await import(
			"../logic/scribe/MeluketSeferReader.js?v=9aa27b3ceb"
		);
		const mounted = awakenPhraseTranslationReader(enriched);
		if (mounted) {
			try {
				console.log(
					"B\"H per-phrase English activated:",
					phrases.length,
					"phrases,",
					footnotes.length,
					"footnotes carried over"
				);
			} catch (_) { /* logging never breaks the mount */ }
		}
		return !!mounted;
	} catch (error) {
		try {
			console.warn("B\"H per-phrase English activation failed safely", error);
		} catch (_) { /* logging never breaks the page */ }
		return false;
	}
}
