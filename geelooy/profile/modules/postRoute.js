// B"H — Boruch Hashem — Blessed is He.
/** Awtsmoos.com opens the exact reader, not an unrelated root or external URL. */
import {canonicalPostRoute,safeReaderPath} from '../../shared/social/model/CanonicalPostRoute.mjs?v=revelation-001';
export function postRouteFor(record={}) {
	const origin=globalThis.location?.origin || 'https://awtsmoos.com';
	const explicit=safeReaderPath(record.url,origin);
	if(explicit) return explicit;
	return canonicalPostRoute({heichelId:record.heichelId || record.heichel,seriesId:record.seriesId || record.series,postId:record.postId || record.id});
}
