// B"H
/** Legacy single-comment/reply routes now delegate to the dedicated rich store. */
const compat = require('../richCompatibility.js');
const store = require('../richCommentStore.js');
const postRef = require('../postRefComment.js');
const { er, methodIs, getUserId } = require('./utils.js');

// Same identity resolution as the canonical rich routes: the verified
// session user, or the platform OAuth bearer — never a client-claimed field.
function bearerUserId($i) {
	try {
		const { readBearer } = require('../../../../oauth/core/tokenReader.js');
		const resolved = readBearer($i);
		if (!resolved?.ok) return null;
		const entry = resolved.entry || {};
		return entry.userId ? String(entry.userId) : null;
	} catch {
		return null;
	}
}

function sessionUser($i, userid) {
	return getUserId($i, userid) || bearerUserId($i);
}

module.exports = ({ $i, userid }) => ({
	'/heichelos/:heichel/comments/inSeries/:series/atPost/:post/atComment/:comment/atAlias/:alias/atVerseSection/:verseSection': async v => {
		if (!methodIs($i, 'GET')) return er({ message: 'GET only request', code: 'GET_ONLY' });
		const report = await compat.aliasComments({
			$i,
			heichelId: v.heichel,
			postId: v.post,
			aliasId: v.alias,
			verseSection: v.verseSection
		});
		return { success: report.success.filter(row => String(row.parentId || '') === String(v.comment)) };
	},
	'/heichelos/:heichel/comments/inSeries/:series/atPost/:post/atComment/:comment/aliases': async v => {
		if (!methodIs($i, 'GET')) return er({ message: 'Method Not Allowed', code: 405 });
		const rows = await compat.tree({
			$i,
			heichelId: v.heichel,
			postId: v.post,
			verseSection: compat.verseFrom($i.$_GET || {})
		});
		return {
			success: [...new Set(rows.filter(row => String(row.parentId || '') === String(v.comment)).map(row => row.aliasId || row.author).filter(Boolean))]
		};
	},
	'/heichelos/:heichel/comment/:comment': async v => {
		const incoming = compat.source($i);
		const postId = incoming.postId;
		if (!postId) return er({ message: 'postId is required for legacy comment compatibility', code: 'MISSING_PARAMS' });
		if (methodIs($i, 'GET')) return store.getComment({ $i, heichelId: v.heichel, postId, commentId: v.comment });
		if (methodIs($i, 'POST')) {
			return compat.createReply({
				$i,
				userid,
				heichelId: v.heichel,
				postId,
				commentId: v.comment,
				seriesId: compat.seriesFrom(incoming),
				aliasId: incoming.aliasId
			});
		}
		if (methodIs($i, 'PUT')) {
			return compat.updateLegacy({
				$i,
				userid,
				heichelId: v.heichel,
				postId,
				commentId: v.comment,
				aliasId: incoming.aliasId
			});
		}
		if (methodIs($i, 'DELETE')) {
			// This legacy doorway used to delete any comment with no
			// ownership check at any level. It now carries the canonical
			// gate: only the comment's author or an admin may delete.
			const authz = await postRef.authorizeCommentDelete({
				$i,
				userid: sessionUser($i, userid),
				heichelId: v.heichel,
				postId,
				commentId: v.comment
			});
			if (!authz) {
				return er({ code: 'NOT_AUTHORIZED', message: 'Only the comment author or admin may delete a comment.' });
			}
			return { success: await store.deleteOne({ $i, heichelId: v.heichel, postId, commentId: v.comment, reason: 'legacy-comment-delete' }) };
		}
		return er({ message: 'Method Not Allowed', code: 405 });
	},
	'/heichelos/:heichel/comments': async v => {
		if (!methodIs($i, 'POST')) return er({ message: 'POST only endpoint', code: 'METHOD_NOT_ALLOWED' });
		const incoming = compat.source($i);
		if (incoming.parentType === 'comment') {
			return compat.createReply({
				$i,
				userid,
				heichelId: v.heichel,
				postId: incoming.postId,
				commentId: incoming.parentId,
				seriesId: compat.seriesFrom(incoming),
				aliasId: incoming.aliasId
			});
		}
		return compat.createRoot({
			$i,
			userid,
			heichelId: v.heichel,
			postId: incoming.postId || incoming.parentId,
			seriesId: compat.seriesFrom(incoming),
			aliasId: incoming.aliasId
		});
	}
});
