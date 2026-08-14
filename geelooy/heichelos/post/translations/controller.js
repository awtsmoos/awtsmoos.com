// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostTranslationController
 * @description
 * The Awtsmoos waits for the canonical Torah vessel, then reveals safe English.
 * Search deep-links may focus one translated phrase without disturbing the original.
 */
import { fetchPostTranslations, isTranslationSeries } from "./api.js";
import { renderTranslationReport } from "./render.js";

function seriesIdFor(post = {}, series = {}) {
	return String(post.seriesId || post.parentSeriesId || series.id || series.seriesId || "");
}

function failedReport(error) {
	return {
		rows: [],
		meta: { source: { status: "failed" } },
		warnings: [{ code: "TRANSLATION_FETCH_FAILED", message: error?.message || String(error) }]
	};
}

function focusRequestedTranslation(viewport) {
	const params = new URLSearchParams(location.search);
	if (!params.has("tVerse")) return false;
	const verse = Number.parseInt(params.get("tVerse"), 10) || 0;
	const sub = Number.parseInt(params.get("tSub"), 10) || 0;
	const block = viewport.querySelector(
		`.awtsmoos-translation-block[data-translation-verse="${verse}"][data-translation-sub="${sub}"]`
	);
	if (!block) return false;
	block.classList.add("awtsmoos-translation-focus");
	setTimeout(() => block.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
	return true;
}

export async function mountPostTranslations({ viewport, post, series, heichelId }) {
	const seriesId = seriesIdFor(post, series);
	if (!viewport || !isTranslationSeries(seriesId)) return { skipped: true, seriesId };
	renderTranslationReport(viewport, {
		rows: [],
		meta: { source: { status: "loading" } },
		warnings: []
	});
	try {
		const report = await fetchPostTranslations({
			heichelId,
			seriesId,
			postId: post.id || post.postId
		});
		const render = renderTranslationReport(viewport, report);
		const focused = focusRequestedTranslation(viewport);
		return { skipped: false, seriesId, report, render, focused };
	} catch (error) {
		const report = failedReport(error);
		renderTranslationReport(viewport, report);
		console.warn('B"H translation reader remained safely isolated', error);
		return { skipped: false, seriesId, report, error };
	}
}

export { focusRequestedTranslation, seriesIdFor };
