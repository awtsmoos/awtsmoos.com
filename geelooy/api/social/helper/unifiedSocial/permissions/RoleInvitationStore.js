//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RoleInvitationStore
 * @description
 * Pending role invitations are indexed from Heichel and invited alias without
 * granting authority before acceptance. The Awtsmoos knows every future relation;
 * Awtsmoos.com keeps invitation, membership, and audit as distinct durable records.
 */

const crypto = require('crypto');
const { sp } = require('../../_awtsmoos.constants.js');

function invitationId() {
	return `BH_role_invite_${Date.now().toString(36)}_${crypto.randomBytes(6).toString('hex')}`;
}

function heichelPath(heichelId, id) {
	return `${sp}/heichelos/${heichelId}/roleInvitations/${id}`;
}

function aliasPath(aliasId, id) {
	return `${sp}/aliases/${aliasId}/roleInvitations/${id}`;
}

async function writeInvitation({ $i, record }) {
	await $i.db.write(heichelPath(record.heichelId, record.id), record);
	await $i.db.write(aliasPath(record.invitedAliasId, record.id), {
		heichelId: record.heichelId,
		role: record.role,
		state: record.state,
		expiresAt: record.expiresAt
	});
	return record;
}

async function readInvitation({ $i, heichelId, id }) {
	return $i.db.get(heichelPath(heichelId, id), { max: true }).catch(() => null);
}

async function listInvitations({ $i, heichelId, state = '' }) {
	const value = await $i.db.get(
		`${sp}/heichelos/${heichelId}/roleInvitations`,
		{ max: true }
	).catch(() => ({}));
	return Object.values(value || {})
		.filter(record => record && (!state || record.state === state))
		.sort((left, right) => right.createdAt - left.createdAt);
}

async function updateInvitation({ $i, record }) {
	return writeInvitation({ $i, record: { ...record, updatedAt: Date.now() } });
}

module.exports = {
	invitationId,
	heichelPath,
	aliasPath,
	writeInvitation,
	readInvitation,
	listInvitations,
	updateInvitation
};
