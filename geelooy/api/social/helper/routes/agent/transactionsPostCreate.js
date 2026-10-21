//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTransactionsPostCreate
 * @description
 * Sibling of AgentTransactions: post creation and batch import, relocated verbatim.
 */

const { createContentRecord, readPostRecord } = require('../../socialContent.js');
const { MAX_IMPORT_ITEMS, heichelAuthority, coerceSections } = require('./transactionsAuth.js');

/** Shared core of single + batch post creation (authority checked by callers). */
async function doCreatePost($i, { heichelId, seriesId = 'root', aliasId, type = 'post', title, content = '', sections = [], rootAssets = [], postId = null, parentQuestionId = '' }) {
	if (!title || !String(title).trim()) {
		return { error: { code: 'MISSING_TITLE', message: 'title is required.' } };
	}
	const cleanType = ['post', 'question', 'answer'].includes(String(type)) ? String(type) : 'post';
	if (cleanType === 'answer' && !parentQuestionId) {
		return { error: { code: 'ANSWER_WITHOUT_QUESTION', message: 'Answers require questionId.' } };
	}
	const secs = coerceSections(sections);
	if (secs.error) return { error: secs.error };
	if (postId) {
		const existing = await readPostRecord({ $i, heichelId, postId }).catch(() => null);
		if (existing) return { error: { code: 'POST_EXISTS', message: 'A post with that id already exists.' } };
	}
	const res = await createContentRecord({
		$i,
		heichelId,
		seriesId,
		postId: postId || undefined,
		aliasId,
		type: cleanType,
		title: String(title),
		content: String(content || ''),
		sections: secs,
		rootAssets: Array.isArray(rootAssets) ? rootAssets : [],
		parentQuestionId
	});
	if (res.error) return { error: res.error };
	return { ok: res.success };
}

async function agentCreatePost($i, opts) {
	const auth = await heichelAuthority($i.db, opts.userId, opts.aliasId, opts.heichelId);
	if (!auth.ok) return { error: auth };
	return doCreatePost($i, opts);
}

async function agentImportPosts($i, { userId, aliasId, heichelId, seriesId = 'root', posts = [] }) {
	const auth = await heichelAuthority($i.db, userId, aliasId, heichelId);
	if (!auth.ok) return { error: auth };
	if (!Array.isArray(posts) || !posts.length) {
		return { error: { code: 'EMPTY_IMPORT', message: 'posts[] is required.' } };
	}
	const items = posts.slice(0, MAX_IMPORT_ITEMS);
	const created = [];
	const failed = [];
	for (let i = 0; i < items.length; i++) {
		const p = items[i] || {};
		try {
			const res = await doCreatePost($i, {
				heichelId,
				seriesId: p.series || seriesId,
				aliasId,
				type: p.type || 'post',
				title: p.title,
				content: p.content || '',
				sections: p.sections || [],
				rootAssets: p.rootAssets || [],
				postId: p.postId || null,
				parentQuestionId: p.questionId || ''
			});
			if (res.error) failed.push({ index: i, error: res.error });
			else created.push({ index: i, postId: res.ok.id || res.ok.postId, title: res.ok.title });
		} catch (e) {
			failed.push({ index: i, error: { code: 'ITEM_FAILED', message: String((e && e.message) || e) } });
		}
	}
	return { ok: { heichelId, seriesId, requested: posts.length, processed: items.length, truncated: posts.length > items.length, created, failed } };
}

module.exports = {
	doCreatePost,
	agentCreatePost,
	agentImportPosts
};
