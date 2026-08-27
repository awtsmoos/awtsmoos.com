//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RoleIndexes
 * @description
 * New member records and legacy role arrays are rewritten together during migration.
 * The Awtsmoos contains every generation in one present; Awtsmoos.com preserves
 * compatibility without letting duplicate role stores disagree after a mutation.
 */

const { sp } = require('../../_awtsmoos.constants.js');
const { LEGACY_ROLE_PATHS, readSafe } = require('./LegacyRoleReader.js');

const ROLE_TO_LEGACY = Object.freeze(
	Object.fromEntries(
		Object.entries(LEGACY_ROLE_PATHS).map(([pathName, role]) => [role, pathName])
	)
);

async function removeLegacyRoles({ $i, heichelId, memberAliasId }) {
	const base = `${sp}/heichelos/${heichelId}`;
	for (const pathName of Object.keys(LEGACY_ROLE_PATHS)) {
		const path = `${base}/${pathName}`;
		const value = await readSafe($i, path, []);
		if (Array.isArray(value)) {
			await $i.db.write(path, value.map(String).filter(id => id !== memberAliasId));
			continue;
		}
		if (value && typeof value === 'object') {
			const next = { ...value };
			delete next[memberAliasId];
			await $i.db.write(path, next);
		}
	}
}

async function addLegacyRole({ $i, heichelId, memberAliasId, role }) {
	const pathName = ROLE_TO_LEGACY[role];
	if (!pathName) return;
	const path = `${sp}/heichelos/${heichelId}/${pathName}`;
	const value = await readSafe($i, path, []);
	if (Array.isArray(value)) {
		const next = [...new Set([...value.map(String), memberAliasId])];
		await $i.db.write(path, next);
		return;
	}
	await $i.db.write(path, { ...(value || {}), [memberAliasId]: true });
}

async function writeMemberRole({ $i, heichelId, memberAliasId, role, actorAliasId }) {
	const path = `${sp}/heichelos/${heichelId}/members/${memberAliasId}`;
	if (role === 'guest') {
		await $i.db.delete(path).catch(() => null);
		return null;
	}
	const record = {
		role,
		grantedBy: actorAliasId,
		updatedAt: Date.now()
	};
	await $i.db.write(path, record);
	return record;
}

module.exports = {
	ROLE_TO_LEGACY,
	removeLegacyRoles,
	addLegacyRole,
	writeMemberRole
};
