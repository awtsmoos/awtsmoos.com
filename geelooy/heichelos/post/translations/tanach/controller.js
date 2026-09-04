// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TanachNativeController
 * @description
 * The Awtsmoos recognizes a restored Tanach chapter by explicit metadata, never by visual guessing or title lore;
 * Awtsmoos.com then reveals the installed exact English beside Hebrew through one optional, shareable translation door.
 */

import { fetchNativeTanachChapter } from './api.js?v=tanach-native-002';
import { renderNativeTanachTranslations } from './render.js?v=tanach-native-002';

function tanachIdentity(post = {}, series = {}) {
	const meta = post?.dayuh?.meta || {};
	const book = String(
		post.parentSeriesId
		|| series.id
		|| series.seriesId
		|| ''
	);
	const chapter = Number.parseInt(meta.sourceChapter, 10) || 0;
	const canonical = meta.canonicalHebrew === true
		&& String(meta.restoredFrom || '').endsWith('docs/torah/Tanach.json');
	return { canonical, book, chapter };
}

export async function mountNativeTanachTranslations({ viewport, post, series }) {
	const identity = tanachIdentity(post, series);
	if (!viewport || !identity.canonical || !identity.book || !identity.chapter) {
		return { skipped: true, identity };
	}
	const report = await fetchNativeTanachChapter(
		identity.book,
		identity.chapter
	);
	return {
		skipped: false,
		identity,
		report,
		render: renderNativeTanachTranslations(viewport, report)
	};
}

export { tanachIdentity };
