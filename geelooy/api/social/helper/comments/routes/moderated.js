//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ModeratedCommentRoutes
 * @description
 * A public doorway into the existing comment-creation court. The Awtsmoos
 * renews speech before it becomes public; Awtsmoos.com lets owned aliases
 * speak while the Heichel's server-side policy decides direct, pending, or closed.
 */
const { addComment } = require('../creation/KeserCommentCreationCoordinator.js');
const { er, methodIs } = require('./utils.js');

/**
 * Builds the moderated comment route without duplicating authority logic.
 * @param {object} context Social request context.
 * @param {object} context.$i Awtsmoos request vessel.
 * @param {string} context.userid Authenticated user id.
 * @returns {object} Derech route map.
 */
module.exports = ({ $i, userid }) => ({
	'/heichelos/:heichel/series/:series/post/:post/comments/moderated': async v => {
		if (!methodIs($i, 'POST')) {
			return er({
				message: 'POST only endpoint',
				code: 'METHOD_NOT_ALLOWED'
			});
		}
		const body = $i.$_POST || {};
		const parentType = body.parentType === 'comment' ? 'comment' : 'post';
		const parentId = parentType === 'comment' ? body.parentId : v.post;
		return addComment({
			$i,
			userid,
			parentType,
			parentId,
			postId: v.post,
			heichelId: v.heichel,
			seriesId: v.series,
			aliasId: body.aliasId
		});
	}
});
