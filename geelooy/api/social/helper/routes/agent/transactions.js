// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AgentTransactions
 * @description
 * Agent-as-user write transactions for the Awtsmoos agent API. An API key
 * identifies the user; the agent may do everything that user can do —
 * create/edit/delete posts, create/edit/delete heichelos, batch-import
 * posts, and list what they own — as proper API transactions.
 *
 * Every helper reuses the exact platform functions the web UI uses
 * (socialContent, heichel, post), so agent-created records are byte-for-byte
 * the same shape as user-created ones. Permission model:
 *   1. The alias must belong to the key's user (/users/<userId>/aliases/<aliasId>).
 *   2. Heichel writes need the alias in the heichel's editors list
 *      (creators are added as editors, so owners always pass).
 *   3. Post edits/deletes additionally allow the post's own author alias.
 * Nothing here touches existing behavior; it only reads $i.db.
 * No external libraries; node builtins only.
 */

const { sp } = require('../../_awtsmoos.constants.js');
const { createContentRecord, readPostRecord } = require('../../socialContent.js');
const { createHeichel, updateHeichel, deleteHeichel, getHeichelos } = require('../../heichel.js');
const { editPostInSeries, deletePostFromSeries } = require('../../post/index.js');

const MAX_IMPORT_ITEMS = 25;
const MAX_LIST_LIMIT = 200;

/** Clone $i as the authenticated user (satisfies the platform loggedIn checks). */
function asUser($i, userId) {
	const request = { ...($i.request || {}) };
	const user = { ...((request.user) || {}) };
	user.loggedIn = true;
	user.info = { ...(user.info || {}), userId };
	request.user = user;
	return { ...$i, request };
}

function withPost($i, post) {
	return { ...$i, $_POST: { ...($i.$_POST || {}), ...post } };
}

function withPut($i, put) {
	return { ...$i, $_PUT: { ...($i.$_PUT || {}), ...put } };
}

function withDelete($i, del) {
	return { ...$i, $_DELETE: { ...($i.$_DELETE || {}), ...del } };
}

/** The alias record exists under the key's user — i.e. this alias is theirs. */
async function ownedAlias(db, userId, aliasId) {
	if (!aliasId || !userId) return null;
	return db.get(`/users/${userId}/aliases/${aliasId}`).catch(() => null);
}

async function heichelEditors(db, heichelId) {
	const editors = await db.get(`${sp}/heichelos/${heichelId}/editors`).catch(() => null);
	return Array.isArray(editors) ? editors : [];
}

/** Alias is theirs AND sits in the heichel's editors list. */
async function heichelAuthority(db, userId, aliasId, heichelId) {
	if (!heichelId) return { ok: false, code: 'MISSING_HEICHEL', message: 'heichel is required.' };
	const alias = await ownedAlias(db, userId, aliasId);
	if (!alias) return { ok: false, code: 'NO_ALIAS', message: 'That alias is not yours.' };
	const editors = await heichelEditors(db, heichelId);
	if (!editors.includes(aliasId)) {
		return { ok: false, code: 'NO_AUTH', message: 'That alias has no authority in this heichel.' };
	}
	return { ok: true };
}

function coerceSections(value) {
	if (value === undefined || value === null || value === '') return [];
	if (Array.isArray(value)) return value;
	if (typeof value === 'string') {
		try {
			const parsed = JSON.parse(value);
			if (Array.isArray(parsed)) return parsed;
		} catch (e) { /* fall through */ }
	}
	return { error: { code: 'BAD_SECTIONS', message: 'sections must be a JSON array.' } };
}

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

async function agentCreateHeichel($i, { userId, aliasId, name, description = '', isPublic = 'yes' }) {
	const alias = await ownedAlias($i.db, userId, aliasId);
	if (!alias) return { error: { code: 'NO_ALIAS', message: 'That alias is not yours.' } };
	if (!name || !String(name).trim()) {
		return { error: { code: 'MISSING_NAME', message: 'name is required.' } };
	}
	const sesh = withPost(asUser($i, userId), {
		name: String(name),
		description: String(description || ''),
		aliasId,
		isPublic: String(isPublic || 'yes')
	});
	const res = await createHeichel({ $i: sesh, aliasId });
	if (res.error) return { error: res.error };
	return { ok: res.success.details };
}

async function agentEditHeichel($i, { userId, aliasId, heichelId, name, description, dayuh }) {
	const auth = await heichelAuthority($i.db, userId, aliasId, heichelId);
	if (!auth.ok) return { error: auth };
	const putI = withPut(asUser($i, userId), {
		heichelId,
		newName: name,
		newDescription: description,
		dayuh,
		aliasId
	});
	const res = await updateHeichel({ $i: putI, vars: { heichel: heichelId, alias: aliasId } });
	if (res.error) return { error: res.error };
	const info = await $i.db.get(`${sp}/heichelos/${heichelId}/info`).catch(() => null);
	return { ok: { heichelId, info, modifiedFields: res.modifiedFields || null } };
}

async function agentDeleteHeichel($i, { userId, aliasId, heichelId, confirm }) {
	if (confirm !== true) {
		return { error: { code: 'CONFIRM_REQUIRED', message: 'Pass confirm:true to delete a heichel.' } };
	}
	const auth = await heichelAuthority($i.db, userId, aliasId, heichelId);
	if (!auth.ok) return { error: auth };
	const info = await $i.db.get(`${sp}/heichelos/${heichelId}/info`).catch(() => null);
	if (!info) return { error: { code: 'NO_HEICHEL', message: "That heichel doesn't exist." } };
	const res = await deleteHeichel({ $i: asUser($i, userId), aliasId, heichelId });
	if (res && res.error) return { error: res.error };
	return { ok: { heichelId, deleted: true } };
}

async function agentListHeichelos($i, { userId, aliasId }) {
	const alias = await ownedAlias($i.db, userId, aliasId);
	if (!alias) return { error: { code: 'NO_ALIAS', message: 'That alias is not yours.' } };
	const ids = await getHeichelos({ $i, aliasId }).catch(() => []);
	const out = [];
	for (const id of (Array.isArray(ids) ? ids : [])) {
		const info = await $i.db.get(`${sp}/heichelos/${id}/info`).catch(() => null);
		out.push({
			heichelId: id,
			name: (info && info.name) || '',
			description: (info && info.description) || '',
			author: (info && info.author) || aliasId
		});
	}
	return { ok: out };
}

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

module.exports = {
	MAX_IMPORT_ITEMS,
	MAX_LIST_LIMIT,
	asUser,
	ownedAlias,
	heichelAuthority,
	agentCreatePost,
	agentImportPosts,
	agentEditPost,
	agentDeletePost,
	agentCreateHeichel,
	agentEditHeichel,
	agentDeleteHeichel,
	agentListHeichelos,
	agentListPosts
};
