// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostTranslationApi
 * @description
 * The Awtsmoos reveals English through the dedicated translation gate alone.
 * Awtsmoos.com never wakes the legacy comments ocean to translate one teaching.
 */
/**
 * B"H — series the front-end historically asked first. Kept as a hint only;
 * fetchPostTranslations no longer gates on it — the dedicated translation
 * gate (the backend catalog) is the single authority on availability, so
 * every series is asked and every answer is honest. A hardcoded front-end
 * allowlist silently skipped whole corpora (e.g. Torah Ohr) and could never
 * learn about newly registered sources.
 */
const TRANSLATION_SERIES = [
	/^likkuteiSichosVolume\d+$/i,
	/^seferHaSichos\d+$/i,
	/^sichosKodesh/i,
	/meluket/i
];

export function isTranslationSeries(seriesId = "") {
	return TRANSLATION_SERIES.some(pattern => pattern.test(String(seriesId)));
}

export function translationPostUrl({ heichelId, seriesId, postId }) {
	const parts = [heichelId, seriesId, postId].map(value => encodeURIComponent(String(value || "")));
	return `/api/social/heichelos/${parts[0]}/series/${parts[1]}/post/${parts[2]}/translations`;
}

export async function fetchPostTranslations(coordinates, options = {}) {
	// B"H — no front-end allowlist: ask the dedicated translation gate and let
	// the backend catalog answer honestly (ready / source_missing / unsupported).
	// Short-circuiting here is what kept Torah Ohr and other corpora forever
	// silent — the toolbar could never even say what was true.
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 8000);
	try {
		const response = await fetch(translationPostUrl(coordinates), {
			headers: { Accept: "application/json" },
			signal: controller.signal
		});
		if (!response.ok) throw new Error(`Translation API returned ${response.status}`);
		const payload = await response.json();
		return {
			rows: Array.isArray(payload?.success) ? payload.success : [],
			meta: payload?.meta || {},
			warnings: Array.isArray(payload?.warnings) ? payload.warnings : []
		};
	} finally {
		clearTimeout(timeout);
	}
}
