//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTransactionsHeichel
 * @description
 * Sibling of AgentTransactions: heichel create, edit, delete and list, relocated verbatim.
 */

const { createHeichel, updateHeichel, deleteHeichel, getHeichelos } = require('../../heichel.js');
const { sp, asUser, withPost, withPut, ownedAlias, heichelAuthority } = require('./transactionsAuth.js');

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

module.exports = {
	agentCreateHeichel,
	agentEditHeichel,
	agentDeleteHeichel,
	agentListHeichelos
};
