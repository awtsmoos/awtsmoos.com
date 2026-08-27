// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialPostsCompatibilityRoutes
 * @description
 * Ancient root callers remain supported while one canonical singular-post gate
 * keeps packed series and rich content records immediately coherent.
 */

const createBaseRoutes = require('./_awtsmoos.posts.base.js');
const {
	approveSubmittedPost,
	denySubmittedPost,
	getSubmittedPosts
} = require('./helper/index.js');
const { canonicalPostHandler } = require('./helper/postCanonicalRoute.js');
const {
	addPostToSeries,
	bad,
	body,
	post,
	postsInRequestedSeries,
	rootWrite
} = require('./helper/postCompatibilitySupport.js');
const { installSocialDbBridge } = require('./helper/packed/socialDbBridgeInstaller.js');

const SINGULAR_POST = '/heichelos/:heichel/series/:series/post/:post';

module.exports = ({ $i, userid } = {}) => {
	installSocialDbBridge($i);
	const base = createBaseRoutes({ $i, userid });
	return {
		...base,
		[SINGULAR_POST]: canonicalPostHandler({
			$i,
			baseHandler: base[SINGULAR_POST]
		}),
		'/heichelos/:heichel/posts': async values => {
			if ($i.request.method === 'GET') {
				return postsInRequestedSeries($i, values.heichel);
			}
			if ($i.request.method === 'POST') return rootWrite($i, values.heichel);
			return bad($i, ['GET', 'POST']);
		},
		'/heichelos/:heichel/posts/details': async values => {
			if ($i.request.method !== 'GET') return bad($i, ['GET']);
			return postsInRequestedSeries($i, values.heichel, true);
		},
		'/heichelos/:heichel/submittedPosts': async values => {
			if ($i.request.method !== 'GET') return bad($i, ['GET']);
			return getSubmittedPosts({ $i, heichelId: values.heichel });
		},
		'/heichelos/:heichel/submittedPosts/approve': async values => {
			if ($i.request.method !== 'POST') return bad($i, ['POST']);
			return approveSubmittedPost({
				$i,
				heichelId: values.heichel,
				postId: post($i).postId,
				approverAliasId: post($i).aliasId,
				addPostToSeries
			});
		},
		'/heichelos/:heichel/submittedPosts/deny': async values => {
			if (!['POST', 'DELETE'].includes($i.request.method)) {
				return bad($i, ['POST', 'DELETE']);
			}
			const requestBody = body($i);
			return denySubmittedPost({
				$i,
				heichelId: values.heichel,
				postId: requestBody.postId,
				approverAliasId: requestBody.aliasId
			});
		}
	};
};
