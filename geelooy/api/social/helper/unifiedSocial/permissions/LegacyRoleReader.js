//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LegacyRoleReader
 * @description
 * Two generations of Heichel authority are read without allowing either to hide
 * the other. The Awtsmoos renews old and new records alike while Awtsmoos.com
 * returns exact evidence for every role that enters the capability compiler.
 */

const { sp } = require('../../_awtsmoos.constants.js');

const LEGACY_ROLE_PATHS = Object.freeze({
	editors: 'editor',
	moderators: 'moderator',
	contributors: 'contributor',
	followers: 'follower'
});

async function readSafe($i, path, fallback = null) {
	try {
		return (await $i.db.get(path)) ?? fallback;
	} catch {
		return fallback;
	}
}

function containsAlias(value, aliasId) {
	if (Array.isArray(value)) return value.map(String).includes(aliasId);
	if (value && typeof value === 'object') return Object.hasOwn(value, aliasId);
	return false;
}

async function readRoleEvidence({ $i, heichelId, aliasId }) {
	const roles = [];
	const sources = [];
	if (!aliasId) return { roles: ['guest'], sources };
	const base = `${sp}/heichelos/${heichelId}`;
	const info = await readSafe($i, `${base}/info`, {});
	if ([info?.author, info?.ownerAlias].filter(Boolean).includes(aliasId)) {
		roles.push('owner');
		sources.push({ source: 'heichel.info', role: 'owner' });
	}
	const member = await readSafe($i, `${base}/members/${aliasId}`, null);
	const memberRole = typeof member === 'string' ? member : member?.role;
	if (memberRole) {
		roles.push(String(memberRole));
		sources.push({ source: 'heichel.members', role: String(memberRole) });
	}
	for (const [pathName, role] of Object.entries(LEGACY_ROLE_PATHS)) {
		const value = await readSafe($i, `${base}/${pathName}`, []);
		if (!containsAlias(value, aliasId)) continue;
		roles.push(role);
		sources.push({ source: `legacy.${pathName}`, role });
	}
	return {
		roles: roles.length ? [...new Set(roles)] : ['guest'],
		sources,
		ownerAlias: info?.author || info?.ownerAlias || ''
	};
}

async function listKnownMembers({ $i, heichelId }) {
	const aliases = new Map();
	const base = `${sp}/heichelos/${heichelId}`;
	const info = await readSafe($i, `${base}/info`, {});
	const owner = info?.author || info?.ownerAlias;
	if (owner) aliases.set(owner, new Set(['owner']));
	const members = await readSafe($i, `${base}/members`, {});
	if (members && typeof members === 'object') {
		for (const [aliasId, value] of Object.entries(members)) {
			const role = typeof value === 'string' ? value : value?.role;
			if (!aliases.has(aliasId)) aliases.set(aliasId, new Set());
			if (role) aliases.get(aliasId).add(role);
		}
	}
	for (const [pathName, role] of Object.entries(LEGACY_ROLE_PATHS)) {
		const value = await readSafe($i, `${base}/${pathName}`, []);
		for (const aliasId of Array.isArray(value) ? value : Object.keys(value || {})) {
			if (!aliases.has(aliasId)) aliases.set(aliasId, new Set());
			aliases.get(aliasId).add(role);
		}
	}
	return [...aliases.entries()].map(([aliasId, roles]) => ({
		aliasId,
		roles: [...roles]
	}));
}

module.exports = {
	LEGACY_ROLE_PATHS,
	readRoleEvidence,
	listKnownMembers,
	readSafe
};
