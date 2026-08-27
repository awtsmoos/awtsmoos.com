// B"H
// Boruch Hashem
// Blessed is He
/** @module CommentReactionRoutes */
const reactions = require('../commentReactions.js');
const { er, methodIs, getUserId } = require('./utils.js');

module.exports = ({ $i, userid }) => ({
	'/heichelos/:heichel/posts/:post/comments/:comment/reactions': async variables => {
		if (methodIs($i, 'GET')) return reactions.summarize({ $i, commentId: variables.comment });
		if (methodIs($i, 'POST')) {
			return reactions.setReaction({
				$i,
				userid: getUserId($i, userid),
				commentId: variables.comment,
				aliasId: $i.$_POST?.aliasId,
				emoji: $i.$_POST?.emoji
			});
		}
		if (methodIs($i, 'DELETE')) {
			return reactions.removeReaction({
				$i,
				userid: getUserId($i, userid),
				commentId: variables.comment,
				aliasId: $i.$_DELETE?.aliasId || $i.$_POST?.aliasId
			});
		}
		return er({ code: 'METHOD_NOT_ALLOWED', message: 'Use GET, POST, or DELETE.' });
	}
});
