//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PlatformFeedThreadRoutes
 * @description The Awtsmoos lets discovery and conversation share one world without sharing one monolith;
 * Awtsmoos.com keeps feed projections and ranked thread operations together only where their read-path rhythm is honest.
 */
const { feedHome, feedHeichel, feedTrending, feedDiscover, feedLatest, feedPopular, feedPersonalized } = require('../feedRoutes.js');
const { appendThreadComment, rankedThread } = require('../commentThreads.js');
const { badMethod, method } = require('./PlatformRouteTools.js');

/** Resolve the current user id from the request interface (best effort). */
function currentUserId($i) {
	return String(
		$i.userid || $i.userId || $i.$_GET.userId || $i.$_GET.userid ||
		($i.session && ($i.session.userid || $i.session.userId)) || ''
	);
}

/** Returns public feed projections and platform thread-event routes. */
module.exports = ({ $i } = {}) => ({
	'/feed/home': async () => method($i, 'GET')
		? { success: await feedHome({ $i, aliasId: $i.$_GET.aliasId || '', limit: Number($i.$_GET.limit || 50), offset: Number($i.$_GET.offset || 0) }) }
		: badMethod('GET'),
	'/feed/personalized': async () => {
		if (!method($i, 'GET')) return badMethod('GET');
		const targetUser = currentUserId($i) || String($i.$_GET.userId || $i.$_GET.userid || '');
		// Privacy: a personalized feed built from someone else's reading history
		// requires their permission. Your own feed is always allowed.
		if (targetUser && targetUser !== currentUserId($i)) {
			try {
				const readingStore = require('../../reading/readingStore.js');
				if (!readingStore.canView(currentUserId($i), targetUser)) {
					return { success: null, error: { code: 'PRIVACY_RESTRICTED', message: 'This user keeps their reading private.' } };
				}
			} catch (_) { /* store unavailable — allow own feed */ }
		}
		return { success: await feedPersonalized({ $i, userId: targetUser, aliasId: $i.$_GET.aliasId || '', limit: Number($i.$_GET.limit || 50), offset: Number($i.$_GET.offset || 0) }) };
	},
	'/feed/latest': async () => method($i, 'GET')
		? { success: feedLatest({ $i, limit: Number($i.$_GET.limit || 50), offset: Number($i.$_GET.offset || 0) }) }
		: badMethod('GET'),
	'/feed/popular': async () => method($i, 'GET')
		? { success: feedPopular({ $i, limit: Number($i.$_GET.limit || 50), offset: Number($i.$_GET.offset || 0) }) }
		: badMethod('GET'),
	'/feed/heichel/:heichel': async vars => method($i, 'GET')
		? { success: await feedHeichel({ $i, heichelId: vars.heichel, limit: Number($i.$_GET.limit || 50), offset: Number($i.$_GET.offset || 0) }) }
		: badMethod('GET'),
	'/feed/trending': async () => method($i, 'GET')
		? { success: await feedTrending({ $i, limit: Number($i.$_GET.limit || 50), offset: Number($i.$_GET.offset || 0) }) }
		: badMethod('GET'),
	'/feed/discover': async () => method($i, 'GET')
		? { success: await feedDiscover({ $i, limit: Number($i.$_GET.limit || 50), offset: Number($i.$_GET.offset || 0) }) }
		: badMethod('GET'),
	'/comments/thread/append': async () => method($i, 'POST')
		? { success: await appendThreadComment({ $i, postId: $i.$_POST.postId, commentId: $i.$_POST.commentId, parentId: $i.$_POST.parentId, aliasId: $i.$_POST.aliasId, content: $i.$_POST.content }) }
		: badMethod('POST'),
	'/comments/thread/:post/ranked': async vars => method($i, 'GET')
		? { success: await rankedThread({ $i, postId: vars.post }) }
		: badMethod('GET')
});
