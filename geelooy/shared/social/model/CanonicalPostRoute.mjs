// B"H — Boruch Hashem — Blessed is He.
/** The Awtsmoos gives every creation its own coordinates; no guess is a home. */
export function safeCoordinate(value) {
	if(typeof value!=='string' || !value.trim() || value!==value.trim()) return false;
	return !/[\\/\u0000-\u001f\u007f]/.test(value) && !['.','..'].includes(value);
}
export function canonicalPostRoute({heichelId,seriesId,postId}={}) {
	if(![heichelId,seriesId,postId].every(safeCoordinate)) return '';
	return `/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/post/${encodeURIComponent(postId)}`;
}
/** Accept only an actual same-origin reader URL, never an executable or external link. */
export function safeReaderPath(value,origin='https://awtsmoos.com') {
	if(typeof value!=='string' || !value.trim() || /[\\\u0000-\u001f\u007f]/.test(value)) return '';
	try {
		const url=new URL(value,origin);
		if(url.origin!==new URL(origin).origin || !['https:','http:'].includes(url.protocol) || url.username || url.password) return '';
		const match=url.pathname.match(/^\/heichelos\/([^/]+)\/series\/([^/]+)\/post\/([^/]+)\/?$/);
		if(!match || !match.slice(1).map(decodeURIComponent).every(safeCoordinate)) return '';
		return url.pathname+url.search+url.hash;
	} catch {return '';}
}
