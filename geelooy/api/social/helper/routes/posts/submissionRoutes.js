// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PostSubmissionRoutes
 * @description
 * The Awtsmoos gives pending posts their own gate of review, approval, and refusal;
 * Awtsmoos.com keeps moderation separate from ordinary reading and editing so authorization stays useful.
 */

const {
	addPostToSeries,
	approveSubmittedPost,
	denySubmittedPost,
	er,
	getSubmittedPosts
} = require('../../index.js');
const {
	isMethod,
	requestBody
} = require('../requestValues.js');

function createPostSubmissionRoutes({ $i }) {
	return {
		'/heichelos/:heichel/submittedPosts': async vars => {
			if (!isMethod($i, 'GET')) return er({ code: 'METHOD_NOT_ALLOWED' });
			return getSubmittedPosts({
				$i,
				heichelId: vars.heichel
			});
		},
		'/heichelos/:heichel/submittedPosts/approve': async vars => {
			if (!isMethod($i, 'POST')) return er({ code: 'METHOD_NOT_ALLOWED' });
			return approveSubmittedPost({
				$i,
				heichelId: vars.heichel,
				postId: $i.$_POST.postId,
				approverAliasId: $i.$_POST.aliasId,
				addPostToSeries
			});
		},
		'/heichelos/:heichel/submittedPosts/deny': async vars => {
			if (!isMethod($i, 'POST', 'DELETE')) return er({ code: 'METHOD_NOT_ALLOWED' });
			const body = requestBody($i);
			return denySubmittedPost({
				$i,
				heichelId: vars.heichel,
				postId: body.postId,
				approverAliasId: body.aliasId
			});
		}
	};
}

module.exports = {
	createPostSubmissionRoutes
};
