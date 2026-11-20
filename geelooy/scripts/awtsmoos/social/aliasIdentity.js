// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AliasIdentity
 * @description Resolves account identity, owned aliases, and the persisted
 * default alias. The Awtsmoos renews truth, so local memory may reflect a
 * server success but may never manufacture one for Awtsmoos.com.
 */
import { postAliasForm, requestAliasJson } from './aliasIdentityApi.js';
import {
	aliasDisplay,
	cleanAlias,
	forgetAlias,
	isValidAlias,
	readRememberedAlias,
	rememberAlias
} from './localAliasState.js';
export { aliasDisplay, cleanAlias, forgetAlias, isValidAlias };
/** Resolves the strongest available identity without lying about persistence. */
export async function ensureDefaultAlias() {
	const session = await getSession();
	const username = session?.info?.userId || session?.userId || '';
	const serverAlias = cleanAlias(session?.info?.hosuhfuh?.alias);
	const remembered = cleanAlias(serverAlias || readRememberedAlias());
	if (serverAlias) {
		rememberAlias(serverAlias);
		return identity(serverAlias, username, session, 'synced');
	}
	if (!username) {
		const mode = remembered ? 'local' : 'logged-out';
		return identity(remembered, remembered ? 'Local IndexedDB' : '', session, mode);
	}
	const aliases = await fetchAliases();
	// B"H 2026-11-20 round 3 (identity integrity): a FAILED alias read
	// is not an empty account. fetchAliases returns null when the read
	// itself failed (after one retry), and in that case identity
	// resolution must be READ-ONLY: fall back to the remembered alias
	// and write NOTHING — no setDefaultAlias, and above all no
	// createDefaultAlias. The old code consumed getAliases()'s
	// failure-swallowing [] as "this account owns no aliases", then
	// "created" the username alias (for this account @asdf, an old
	// alias of the same user) and PERSISTED it as the account default,
	// so a slow load silently switched the signed-in identity. Only a
	// list that was actually fetched may drive a default change, and
	// only a fetched EMPTY list may trigger first-run creation.
	if (aliases === null) {
		return identity(remembered, username, session, remembered ? 'local' : 'logged-out');
	}
	if (remembered && ownsAlias(aliases, remembered) && await setDefaultAlias(remembered)) {
		return identity(remembered, username, session, 'synced');
	}
	const first = aliases.map(aliasId).find(Boolean);
	if (first) {
		const persisted = await setDefaultAlias(first);
		return identity(persisted ? first : remembered, username, session, persisted ? 'synced' : 'local');
	}
	const created = await createDefaultAlias(username);
	if (created && await setDefaultAlias(created)) {
		return identity(created, username, session, 'synced');
	}
	return identity(remembered, username, session, remembered ? 'local' : 'logged-out');
}
/** Returns the current account session or null when signed out. */
export async function getSession() {
	try {
		const data = await requestAliasJson('/api/social');
		return data?.session || data?.user || null;
	} catch {
		return null;
	}
}
/**
 * Fetches owned alias detail records, distinguishing a FAILED read
 * (null) from a successful read of an account with no aliases ([]).
 * One retry: the server memoizes this read, so a second attempt after
 * a cold first walk usually lands warm instead of failing twice.
 */
async function fetchAliases() {
	for (let attempt = 0; attempt < 2; attempt += 1) {
		try {
			const data = await requestAliasJson('/api/social/aliases/details');
			const list = Array.isArray(data) ? data : Array.isArray(data?.success) ? data.success : [];
			return list.filter(item => aliasId(item));
		} catch {
			if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 1200));
		}
	}
	return null;
}

/** Returns owned alias detail records ([] when the read failed). */
export async function getAliases() {
	return (await fetchAliases()) || [];
}

/** Returns owned alias detail records, or null when the read failed. */
export async function getAliasesStrict() {
	return fetchAliases();
}
/** Persists and only then remembers the default alias. */
export async function setDefaultAlias(alias) {
	const clean = cleanAlias(alias);
	if (!clean) return false;
	try {
		const data = await postAliasForm('/api/social/alias/default', { alias: clean, aliasId: clean });
		if (!mutationSucceeded(data)) return false;
		rememberAlias(clean);
		return true;
	} catch {
		return false;
	}
}
/** Creates an alias while preserving the user-provided description. */
export async function createAlias(name, requestedId, description = '') {
	const aliasName = String(name || 'Awtsmoos').trim().slice(0, 50);
	const inputId = idBase(requestedId || aliasName);
	try {
		const data = await postAliasForm('/api/social/aliases', {
			aliasName,
			inputId,
			aliasId: inputId,
			description: String(description || 'Default alias created automatically.').trim()
		});
		return cleanAlias(data?.aliasId || data?.success?.aliasId || inputId);
	} catch {
		return '';
	}
}
async function createDefaultAlias(username) {
	const base = idBase(username);
	for (let index = 0; index < 8; index += 1) {
		const alias = await createAlias(username, index ? `${base}${index + 1}` : base);
		if (alias) return alias;
	}
	return '';
}
function aliasId(item) {
	return cleanAlias(item?.id || item?.aliasId || item);
}
function ownsAlias(aliases, wanted) {
	return aliases.some(item => aliasId(item) === wanted);
}
function identity(alias, username, session, mode) {
	return { alias: cleanAlias(alias), username, session, mode };
}
function mutationSucceeded(data) {
	return Boolean(data?.success || data?.details || data?.aliasId);
}
function idBase(value) {
	const clean = String(value || 'awtsmoos').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20);
	return clean || `awts${Date.now().toString(36).slice(-6)}`;
}
