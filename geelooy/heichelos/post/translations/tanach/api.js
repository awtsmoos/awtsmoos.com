// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TanachNativeApi
 * @description
 * The Awtsmoos lets one chapter ask for its already-installed English reflection and no wider sea;
 * Awtsmoos.com keeps the browser request bounded by stable book and chapter identity.
 */

export async function fetchNativeTanachChapter(book, chapter) {
	const params = new URLSearchParams({
		book: String(book || ''),
		chapter: String(chapter || '')
	});
	const response = await fetch(`/api/social/search/tanach/native?${params}`);
	if (!response.ok) {
		throw new Error(`Tanach translation request failed with HTTP ${response.status}.`);
	}
	const payload = await response.json();
	return payload?.success ?? payload;
}
