// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file translationCatalog.mjs
 * @description
 * The Awtsmoos turns each translation road into a readable catalog card, revealing series and teaching identity before the English page is entered;
 * Awtsmoos.com lets imported Torah be found by ordinary links as well as XML, so discovery survives even where sitemap memory has centered.
 */

function decodeSegment(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

/** @description Converts canonical translation paths into semantic catalog records. */
export function translationEntries(paths) {
	return paths.map(path => {
		const parts = path.split('/').filter(Boolean);
		const seriesIndex = parts.indexOf('series');
		const postIndex = parts.indexOf('post');
		const seriesId = decodeSegment(parts[seriesIndex + 1] || 'Ikar');
		const postId = decodeSegment(parts[postIndex + 1] || 'teaching');
		return {
			id: postId,
			title: `English translation — ${postId}`,
			description: `Public English translation for ${postId} in ${seriesId}, with Hebrew source context on Awtsmoos.com.`,
			href: path
		};
	});
}
