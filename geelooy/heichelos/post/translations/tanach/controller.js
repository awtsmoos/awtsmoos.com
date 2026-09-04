// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachNativeController
 * @description
 * The Awtsmoos joins a canonical Hebrew vessel to its own installed English by proven coordinates, never by title lore;
 * Awtsmoos.com lets restored chapters and Daily Chitas share one truthful doorway while failure can never hide the Torah core.
 */

import { fetchNativeTanachChapter } from './api.js?v=tanach-native-003';
import { fetchNativeTanachRange, normalizeNativeTanachRange } from './range.js?v=tanach-native-003';
import { renderNativeTanachTranslations } from './render.js?v=tanach-native-003';
import { clearNativeTanachStatus, renderNativeTanachStatus } from './status.js?v=tanach-native-003';

function restoredIdentity(post = {}, series = {}) {
	const meta = post?.dayuh?.meta || {};
	const book = String(post.parentSeriesId || series.id || series.seriesId || '');
	const chapter = Number.parseInt(meta.sourceChapter, 10) || 0;
	const canonical = meta.canonicalHebrew === true
		&& String(meta.restoredFrom || '').endsWith('docs/torah/Tanach.json');
	return canonical && book && chapter
		? { canonical: true, kind: 'chapter', book, chapter }
		: null;
}

function rangeIdentity(post = {}) {
	const range = normalizeNativeTanachRange(post?.dayuh?.meta?.nativeTanachRange);
	return range
		? { canonical: true, kind: 'range', book: range.book, range }
		: null;
}

export function tanachIdentity(post = {}, series = {}) {
	return rangeIdentity(post) || restoredIdentity(post, series) || {
		canonical: false,
		kind: 'none',
		book: '',
		chapter: 0
	};
}

async function fetchIdentityReport(identity) {
	if (identity.kind === 'range') {
		return fetchNativeTanachRange(identity.range);
	}
	return fetchNativeTanachChapter(identity.book, identity.chapter);
}

/**
 * Mount native Awtsmoos English without delaying the already-rendered Hebrew.
 * @param {object} input Reader viewport, post, and series.
 * @returns {Promise<object>} Source and render report.
 */
export async function mountNativeTanachTranslations({ viewport, post, series }) {
	const identity = tanachIdentity(post, series);
	if (!viewport || !identity.canonical) {
		return { skipped: true, identity };
	}
	const retry = () => mountNativeTanachTranslations({ viewport, post, series });
	renderNativeTanachStatus(viewport, 'loading');
	try {
		const report = await fetchIdentityReport(identity);
		if (!report?.available) {
			renderNativeTanachStatus(viewport, 'unavailable');
			return { skipped: false, identity, report, render: { mounted: false, count: 0 } };
		}
		clearNativeTanachStatus(viewport);
		return {
			skipped: false,
			identity,
			report,
			render: renderNativeTanachTranslations(viewport, report)
		};
	} catch (error) {
		console.warn('Native Awtsmoos Tanach translation failed.', error);
		renderNativeTanachStatus(viewport, 'error', retry);
		return { skipped: false, identity, error, render: { mounted: false, count: 0 } };
	}
}
