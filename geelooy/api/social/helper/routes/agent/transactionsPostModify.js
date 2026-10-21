//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTransactionsPostModify
 * @description
 * Sibling of AgentTransactions: post edit and delete, relocated verbatim.
 */

const { readPostRecord } = require('../../socialContent.js');
const { editPostInSeries, deletePostFromSeries } = require('../../post/index.js');
const { sp, asUser, withPost, withPut, withDelete, ownedAlias, heichelAuthority } = require('./transactionsAuth.js');

/** Author alias or heichel authority may edit/delete a post. */
async function postModifyAllowed($i, userId, aliasId, heichelId, postId) {
	const alias = await ownedAlias($i.db, userId, aliasId);
	if (!alias) return { error: { code: 'NO_ALIAS', message: 'That alias is not yours.' }, record: null };
	const record = await readPostRecord({ $i, heichelId, postId }).catch(() => null);
	if (!record) return { error: { code: 'POST_NOT_FOUND', message: 'No such post.' }, record: null };
	const authorAlias = record.aliasId || record.author;
	if (authorAlias && authorAlias === aliasId) return { error: null, record };
	const auth = await heichelAuthority($i.db, userId, aliasId, heichelId);
	if (!auth.ok) return { error: auth, record: null };
	return { error: null, record };
}

async function readSeriesPost($i, heichelId, seriesId, postId) {
	const seriesPostsPath = `${sp}/heichelos/${heichelId}/series/${seriesId}/posts`;
	try {
		const got = await $i.db.get(seriesPostsPath, { propertyMap: { [postId]: true } });
		if (got && got[postId]) return got[postId];
	} catch (e) { /* fall through */ }
	return null;
}

async function agentEditPost($i, { userId, aliasId, heichelId, seriesId = 'root', postId, newTitle, newContent, dayuh }) {
	if (!postId) return { error: { code: 'MISSING_POST', message: 'post is required.' } };
	const gate = await postModifyAllowed($i, userId, aliasId, heichelId, postId);
	if (gate.error) return { error: gate.error };
	const useSeries = gate.record.seriesId || seriesId;
	const putI = withPut(asUser($i, userId), { aliasId, newTitle, newContent, dayuh });
	const res = await editPostInSeries({ $i: putI, heichelId, seriesId: useSeries, postId });
	if (res.error) return { error: res.error };
	const updated = await readSeriesPost($i, heichelId, useSeries, postId);
	return { ok: { postId, heichelId, seriesId: useSeries, wrote: res.success.wrote, post: updated } };
}

async function agentDeletePost($i, { userId, aliasId, heichelId, seriesId = 'root', postId }) {
	if (!postId) return { error: { code: 'MISSING_POST', message: 'post is required.' } };
	const gate = await postModifyAllowed($i, userId, aliasId, heichelId, postId);
	if (gate.error) return { error: gate.error };
	const useSeries = gate.record.seriesId || seriesId;
	const delI = withDelete(withPost(asUser($i, userId), { aliasId }), { aliasId });
	const res = await deletePostFromSeries({ $i: delI, heichelId, seriesId: useSeries, postId, userid: userId });
	if (res.error) return { error: res.error };
	return { ok: { postId, heichelId, seriesId: useSeries, ...res.success } };
}

module.exports = {
	postModifyAllowed,
	readSeriesPost,
	agentEditPost,
	agentDeletePost
};
