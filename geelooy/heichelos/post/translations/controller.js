// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PostTranslationController
 * @description
 * The Awtsmoos lets persisted translation series and restored bilingual Tanach enter by distinct truthful gates;
 * Awtsmoos.com waits for canonical Torah first, then reveals aligned English without delaying or replacing its states.
 */

import { fetchPostTranslations } from './api.js';
import { refreshTranslationStatus, renderTranslationReport } from './render.js';
import { activatePhraseReaderFromApi } from './phraseReaderActivation.js?v=phrase-activation-002';
import { mountNativeTanachTranslations } from './tanach/controller.js?v=tanach-native-003';

function seriesIdFor(post = {}, series = {}) {
	return String(
		post.seriesId
		|| post.parentSeriesId
		|| series.id
		|| series.seriesId
		|| ''
	);
}

function failedReport(error) {
	return {
		rows: [],
		meta: { source: { status: 'failed' } },
		warnings: [{
			code: 'TRANSLATION_FETCH_FAILED',
			message: error?.message || String(error)
		}]
	};
}

function focusRequestedTranslation(viewport) {
	const params = new URLSearchParams(location.search);
	if (!params.has('tVerse')) return false;
	const verse = Number.parseInt(params.get('tVerse'), 10) || 0;
	const sub = Number.parseInt(params.get('tSub'), 10) || 0;
	const block = viewport.querySelector(
		`.awtsmoos-translation-block[data-translation-verse="${verse}"]`
		+ `[data-translation-sub="${sub}"]`
	);
	if (!block) return false;
	block.classList.add('awtsmoos-translation-focus');
	setTimeout(() => {
		block.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}, 60);
	return true;
}

const MIN_EMBEDDED_PHRASES = 20;

/**
 * B"H — Nov 10, 2026: the server embeds the slim phrase rows in the first
 * HTML (`#awtsmoos-phrase-translations`) so the sefer mounts without the
 * translations API round trip. Returns the rows, or null when there is no
 * embed / it is too thin — the caller then fetches the API as before.
 */
function readEmbeddedPhraseTranslations() {
	try {
		const el = typeof document !== 'undefined' ? document.getElementById('awtsmoos-phrase-translations') : null;
		if (!el) return null;
		const rows = JSON.parse(el.textContent || '');
		if (!Array.isArray(rows) || rows.length < MIN_EMBEDDED_PHRASES) return null;
		return rows;
	} catch (_) { return null; }
}

async function mountRegisteredTranslation(viewport, post, seriesId, heichelId) {
	// B"H — embedded rows first: no API round trip when the server already
	// sent the phrases. The report + activation path below is identical
	// to the API path, only the rows arrive without a fetch.
	const embeddedRows = readEmbeddedPhraseTranslations();
	if (embeddedRows) {
		const report = {
			rows: embeddedRows,
			meta: { source: { status: 'ready', embedded: true } },
			warnings: []
		};
		const render = renderTranslationReport(viewport, report);
		try { await activatePhraseReaderFromApi(post, report.rows); } catch (_) { /* per-phrase activation is best-effort; the report above already rendered */ }
		try { refreshTranslationStatus(); } catch (_) { /* toolbar absent */ }
		return {
			skipped: false,
			seriesId,
			report,
			render,
			focused: focusRequestedTranslation(viewport)
		};
	}
	renderTranslationReport(viewport, {
		rows: [],
		meta: { source: { status: 'loading' } },
		warnings: []
	});
	try {
		const report = await fetchPostTranslations({
			heichelId,
			seriesId,
			postId: post.id || post.postId
		});
		const render = renderTranslationReport(viewport, report);
		// B"H — Coby's rule (Nov 10, 2026): English ALWAYS rides per phrase.
		// When the API returns aligned phrases and no sefer mounted yet,
		// restructure the post into interleaved phrase pairs (Hebrew, then
		// ITS English directly beneath) instead of leaving the English
		// gathered in a separate section below the Hebrew. Runs before the
		// status refresh so the toolbar reads the restructured DOM.
		try { await activatePhraseReaderFromApi(post, report.rows); } catch (_) { /* per-phrase activation is best-effort; the report above already rendered */ }
		// B"H — the page may already show English the API cannot see (server
		// annotation previews, a sefer reader that mounted first). Re-check the
		// live DOM so the toolbar never contradicts visible English.
		try { refreshTranslationStatus(); } catch (_) { /* toolbar absent */ }
		return {
			skipped: false,
			seriesId,
			report,
			render,
			focused: focusRequestedTranslation(viewport)
		};
	} catch (error) {
		const report = failedReport(error);
		renderTranslationReport(viewport, report);
		console.warn('B"H translation reader remained safely isolated', error);
		return { skipped: false, seriesId, report, error };
	}
}

export async function mountPostTranslations(context) {
	const nativeTanach = await mountNativeTanachTranslations(context);
	if (!nativeTanach.skipped) return nativeTanach;
	const seriesId = seriesIdFor(context.post, context.series);
	if (!context.viewport) {
		return { skipped: true, seriesId };
	}
	// B"H — every series is asked; the backend catalog is the single authority
	// on availability. Skipping here is what left Torah Ohr (and every corpus
	// outside the old allowlist) forever silent.
	return mountRegisteredTranslation(
		context.viewport,
		context.post,
		seriesId,
		context.heichelId
	);
}

export { focusRequestedTranslation, seriesIdFor };
