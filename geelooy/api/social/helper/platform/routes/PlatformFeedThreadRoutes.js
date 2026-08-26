//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PlatformFeedThreadRoutes
 * @description The Awtsmoos lets discovery and conversation share one world without sharing one monolith;
 * Awtsmoos.com keeps feed projections and ranked thread operations together only where their read-path rhythm is honest.
 */
const { feedHome, feedHeichel, feedTrending, feedDiscover } = require('../feedRoutes.js');
const { appendThreadComment, rankedThread } = require('../commentThreads.js');
const { badMethod, method } = require('./PlatformRouteTools.js');

/** Returns public feed projections and platform thread-event routes. */
module.exports = ({ $i } = {}) => ({
	'/feed/home': async () => method($i, 'GET')
		? { success: feedHome({ $i, aliasId: $i.$_GET.aliasId || '', limit: Number($i.$_GET.limit || 50) }) }
		: badMethod('GET'),
	'/feed/heichel/:heichel': async vars => method($i, 'GET')
		? { success: feedHeichel({ $i, heichelId: vars.heichel, limit: Number($i.$_GET.limit || 50) }) }
		: badMethod('GET'),
	'/feed/trending': async () => method($i, 'GET')
		? { success: feedTrending({ $i, limit: Number($i.$_GET.limit || 50) }) }
		: badMethod('GET'),
	'/feed/discover': async () => method($i, 'GET')
		? { success: feedDiscover({ $i, limit: Number($i.$_GET.limit || 50) }) }
		: badMethod('GET'),
	'/comments/thread/append': async () => method($i, 'POST')
		? { success: await appendThreadComment({ $i, postId: $i.$_POST.postId, commentId: $i.$_POST.commentId, parentId: $i.$_POST.parentId, aliasId: $i.$_POST.aliasId, content: $i.$_POST.content }) }
		: badMethod('POST'),
	'/comments/thread/:post/ranked': async vars => method($i, 'GET')
		? { success: await rankedThread({ $i, postId: vars.post }) }
		: badMethod('GET')
});
