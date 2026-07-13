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
	isValidAlias,
	readRememberedAlias,
	rememberAlias
} from './localAliasState.js';
export { aliasDisplay, cleanAlias, isValidAlias };
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
	const aliases = await getAliases();
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
/** Returns owned alias detail records. */
export async function getAliases() {
	try {
		const data = await requestAliasJson('/api/social/aliases/details');
		const list = Array.isArray(data) ? data : Array.isArray(data?.success) ? data.success : [];
		return list.filter(item => aliasId(item));
	} catch {
		return [];
	}
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
