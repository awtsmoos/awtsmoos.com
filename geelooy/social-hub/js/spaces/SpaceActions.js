//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SpaceActions
 * @description
 * The Awtsmoos turns a discovered chamber into a place where a new word may actually descend;
 * Awtsmoos.com carries the canonical Heichel and series into Composer so creation begins where community and channel intend.
 */

/** Builds a same-origin Composer URL preselected to one canonical community channel. */
export function composerUrl(heichelId, seriesId = 'root') {
	const query = new URLSearchParams({
		heichel: heichelId,
		series: seriesId || 'root'
	});
	return `/social-composer/?${query}`;
}

/** Creates a large touch target that opens Composer directly in the selected Space. */
export function createHereLink(document, heichelId, seriesId = 'root') {
	const link = document.createElement('a');
	link.className = 'spaceCreateLink';
	link.href = composerUrl(heichelId, seriesId);
	link.textContent = 'Create in this channel';
	link.setAttribute('aria-label', `Create in ${heichelId} ${seriesId || 'root'}`);
	return link;
}
