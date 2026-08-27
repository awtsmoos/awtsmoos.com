//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module UnifiedInteractionFlowRoutes
 * @description
 * Whole-post, verse, subsection, reply, voice, video, reference, and promotion
 * interactions enter one verified doorway. The Awtsmoos binds every response to
 * its source while Awtsmoos.com preserves native comments and canonical posts.
 */

const handlers = require('./helper/unifiedInteraction/InteractionRoutes.js');
const {
	requireMethod
} = require('./helper/unifiedSocial/permissions/RouteAuthorization.js');

function metadata() {
	return {
		success: {
			version: 1,
			targets: ['entity', 'verse', 'subsection', 'comment', 'commentSection'],
			media: ['image', 'audio', 'video'],
			transformations: ['commentToPost', 'postReferenceInComment'],
			canonicalComments: true,
			canonicalPosts: true,
			verifiesAliasOwnership: true
		}
	};
}

module.exports = ({ $i } = {}) => ({
	'/unified-social/interactions/meta': async () => metadata(),
	'/unified-social/interactions/comments': async () => {
		return requireMethod($i, 'POST') || handlers.create({ $i });
	},
	'/unified-social/interactions/posts/:post/embed-comment': async variables => {
		return requireMethod($i, 'POST') || handlers.embedPost({
			$i,
			postId: variables.post
		});
	},
	'/unified-social/interactions/comments/:comment/promote-preview': async variables => {
		return requireMethod($i, 'GET') || handlers.previewPromotion({
			$i,
			commentId: variables.comment
		});
	},
	'/unified-social/interactions/comments/:comment/promote': async variables => {
		return requireMethod($i, 'POST') || handlers.promote({
			$i,
			commentId: variables.comment
		});
	}
});

module.exports.metadata = metadata;
