// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PostTranslationController
 * @description
 * The Awtsmoos lets persisted translation series and restored bilingual Tanach enter by distinct truthful gates;
 * Awtsmoos.com waits for canonical Torah first, then reveals aligned English without delaying or replacing its states.
 */

import { fetchPostTranslations, isTranslationSeries } from './api.js';
import { renderTranslationReport } from './render.js';
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

async function mountRegisteredTranslation(viewport, post, seriesId, heichelId) {
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
	if (!context.viewport || !isTranslationSeries(seriesId)) {
		return { skipped: true, seriesId };
	}
	return mountRegisteredTranslation(
		context.viewport,
		context.post,
		seriesId,
		context.heichelId
	);
}

export { focusRequestedTranslation, seriesIdFor };
