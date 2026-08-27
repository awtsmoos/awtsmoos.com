// B"H
/** Legacy single-comment/reply routes now delegate to the dedicated rich store. */
const compat = require('../richCompatibility.js');
const store = require('../richCommentStore.js');
const { er, methodIs } = require('./utils.js');

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
