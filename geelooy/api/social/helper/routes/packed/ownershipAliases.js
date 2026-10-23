// B"H
/**
 * @module OwnershipAliases
 * The Awtsmoos gives each writer only the aliases they actually own;
 * no absent identity may claim a neighboring author's throne.
 */
const { postOwnerId } = require('./ownershipIdentity.js');

/** Convert every preexisting alias representation into an identity set. */
function addAliasRaw(aliases, raw) {
	if (raw === null || raw === undefined) return;
	if (typeof raw === 'string') {
		if (raw.trim()) aliases.add(raw.trim());
		return;
	}
	if (Array.isArray(raw)) {
		for (const alias of raw) addAliasRaw(aliases, alias);
		return;
	}
	if (typeof raw === 'object') {
		const id = raw.aliasId || raw.id || raw.name;
		if (id) aliases.add(String(id));
		for (const key of Object.keys(raw)) {
			if (key && key !== 'aliasId' && key !== 'id') aliases.add(key);
		}
	}
}

/** Resolve saved alias ownership, falling back to identity only on errors. */
async function callerAliasSet($i, caller) {
	const aliases = new Set();
	if (!caller) return aliases;
	if (caller.identity) aliases.add(caller.identity);
	if (caller.userId) aliases.add(caller.userId);
	if (caller.accountId) aliases.add(caller.accountId);
	if (caller.aliasSet) {
		for (const alias of caller.aliasSet) aliases.add(String(alias));
		return aliases;
	}
	try {
		const { myOpts } = require('../../general.js');
		let raw = null;
		try {
			raw = await $i.db.get(`/users/${caller.identity}/aliases/`, myOpts($i));
		} catch (_) { /* retry bare path */ }
		if (raw === null || raw === undefined) {
			try { raw = await $i.db.get(`/users/${caller.identity}/aliases`); }
			catch (_) { /* identity-only */ }
		}
		addAliasRaw(aliases, raw);
	} catch (_) { /* identity-only scope */ }
	caller.aliasSet = aliases;
	return aliases;
}

/** Require the caller to own the post's established author alias. */
function ownsPost(caller, post, aliasSet) {
	if (!caller) return false;
	if (caller.isAdmin) return true;
	const owner = postOwnerId(post);
	if (!owner) return false;
	const aliases = aliasSet || caller.aliasSet || new Set([caller.identity]);
	return aliases.has(owner);
}

/** Protect create-over, update, delete and post linkage consistently. */
async function authorizeWrite($i, caller, post) {
	if (!caller) return false;
	if (caller.isAdmin) return true;
	const aliases = await callerAliasSet($i, caller);
	return ownsPost(caller, post, aliases);
}

/** Match commentator-alias derivation used by the current post processor. */
function effectiveImportAlias(post, heichelId, jobAliasId) {
	try {
		const { deriveAliasId } = require('./postValidate.js');
		return deriveAliasId(post && post.commentator, heichelId, jobAliasId);
	} catch (_) {
		return jobAliasId === null || jobAliasId === undefined ? '' : String(jobAliasId).trim();
	}
}

module.exports = { callerAliasSet, ownsPost, authorizeWrite, effectiveImportAlias };
