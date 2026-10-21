//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTransactionsList
 * @description
 * Sibling of AgentTransactions: listing the alias posts, relocated verbatim.
 */

const { readPostRecord } = require('../../socialContent.js');
const { getHeichelos } = require('../../heichel.js');
const { sp, MAX_LIST_LIMIT, ownedAlias, heichelAuthority } = require('./transactionsAuth.js');

async function agentListPosts($i, { userId, aliasId, heichelId, scope = 'mine', limit = 50 }) {
	const alias = await ownedAlias($i.db, userId, aliasId);
	if (!alias) return { error: { code: 'NO_ALIAS', message: 'That alias is not yours.' } };
	const lim = Math.min(Math.max(parseInt(limit, 10) || 50, 1), MAX_LIST_LIMIT);
	let heichelIds;
	if (heichelId) {
		if (scope === 'heichel') {
			const auth = await heichelAuthority($i.db, userId, aliasId, heichelId);
			if (!auth.ok) return { error: auth };
		}
		heichelIds = [heichelId];
	} else {
		heichelIds = await getHeichelos({ $i, aliasId }).catch(() => []);
		heichelIds = Array.isArray(heichelIds) ? heichelIds : [];
	}
	const posts = [];
	for (const hid of heichelIds) {
		const idx = await $i.db.get(`${sp}/heichelos/${hid}/postIds`, { max: true }).catch(() => null);
		const ids = (idx && typeof idx === 'object') ? Object.keys(idx) : [];
		for (const pid of ids) {
			if (posts.length >= lim) break;
			const rec = await readPostRecord({ $i, heichelId: hid, postId: pid }).catch(() => null);
			if (!rec) continue;
			const recAlias = rec.aliasId || rec.author || '';
			if (scope !== 'heichel' && recAlias !== aliasId) continue;
			posts.push({
				postId: pid,
				heichelId: hid,
				seriesId: rec.seriesId || 'root',
				title: rec.title || '',
				aliasId: recAlias,
				createdAt: rec.createdAt || null,
				updatedAt: rec.updatedAt || null
			});
		}
		if (posts.length >= lim) break;
	}
	return { ok: { posts, count: posts.length, scope: scope === 'heichel' ? 'heichel' : 'mine', limit: lim } };
}

module.exports = { agentListPosts };
