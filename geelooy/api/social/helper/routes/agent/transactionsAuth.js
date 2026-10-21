//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTransactionsAuth
 * @description
 * Sibling of AgentTransactions: request cloning, alias ownership and heichel authority, relocated verbatim.
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

module.exports = {
	sp,
	MAX_IMPORT_ITEMS,
	MAX_LIST_LIMIT,
	asUser,
	withPost,
	withPut,
	withDelete,
	ownedAlias,
	heichelEditors,
	heichelAuthority,
	coerceSections
};
