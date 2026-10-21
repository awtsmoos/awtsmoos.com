//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module NeedsWorkDb
 * @description
 * Sibling of NeedsWorkRoutes: native DB reads for aliases, heichels and series, relocated verbatim.
 */

const { sp, NO_LOGIN } = require("../../_awtsmoos.constants.js");

/** Best-effort native read; null on any failure (never throws the scan). */
async function safeGet($i, path, opts) {
	try {
		return await $i.db.get(path, opts || { max: true });
	} catch {
		return null;
	}
}

async function safeGetValue($i, path, key) {
	try {
		return await $i.db.getValue(path, key);
	} catch {
		return null;
	}
}

async function safeKeys($i, path) {
	try {
		const keys = await $i.db.getObjectKeys(path);
		return Array.isArray(keys) ? keys : [];
	} catch {
		return [];
	}
}

/** Alias ids owned by the authenticated user. */
async function userAliasIds($i, userID) {
	try {
		const list = await $i.db.get(`/users/${userID}/aliases/`, myOpts($i));
		return Array.isArray(list) ? list.filter(Boolean) : [];
	} catch {
		return [];
	}
}

async function aliasInfo($i, aliasId) {
	const info = await safeGet($i, `${sp}/aliases/${aliasId}/info`);
	return {
		aliasId,
		name: (info && info.name) || aliasId,
		user: (info && info.user) || null
	};
}

/** Heichel ids present in the alias's postsSubmitted index. */
async function aliasHeichels($i, aliasId) {
	return safeKeys($i, `${sp}/aliases/${aliasId}/postsSubmitted/inHeichel`);
}

/** Series ids (last crumb of each chain) for one alias+heichel. */
async function aliasSeriesIds($i, aliasId, heichelId) {
	const base = `${sp}/aliases/${aliasId}/postsSubmitted/inHeichel/${heichelId}/seriesChain`;
	const series = new Set();
	async function walk(path) {
		const keys = await safeKeys($i, path);
		for (const key of keys) {
			const child = `${path}/${key}`;
			const grandchildren = await safeKeys($i, child);
			if (grandchildren.length) {
				await walk(child);
			} else {
				series.add(key);
			}
		}
	}
	await walk(base);
	// Fallback: if the tree walk found nothing, treat top-level keys as series ids.
	if (!series.size) {
		for (const key of await safeKeys($i, base)) series.add(key);
	}
	return [...series];
}

module.exports = {
	safeGet,
	safeGetValue,
	safeKeys,
	userAliasIds,
	aliasInfo,
	aliasHeichels,
	aliasSeriesIds
};
