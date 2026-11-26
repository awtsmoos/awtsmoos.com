// B"H — Boruch Hashem — Blessed is He.
/** Awtsmoos.com opens only the coordinates actually returned by publication. */
import {canonicalPostRoute} from '../../../shared/social/model/CanonicalPostRoute.mjs?v=revelation-001';
export function publishedRoute(result) {
	if(!['published','partial'].includes(result?.status)) return '';
	const {id,heichelId,seriesId}=result.canonical || {};
	return canonicalPostRoute({heichelId,seriesId,postId:id});
}
/** Keep a usable receipt even if browser navigation is interrupted. */
export function showPublished(root,result,tell) {
	const route=publishedRoute(result),status=root.getElementById('status');
	const submitted=result?.status==='submitted';
	tell(submitted?'Submitted for moderator approval.':route?'Published! Opening your post…':'Publication completed. Find it in your profile.');
	const link=document.createElement('a');
	link.href=route || '/profile/';
	link.textContent=route?'Open published post →':'Open my profile →';
	link.style.cssText='display:block;margin-top:8px;color:#1855b6;font-weight:700';
	status.append(link);
	if(route) window.location.assign(route);
}
