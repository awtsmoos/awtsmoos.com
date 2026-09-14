// B"H
// Boruch Hashem
// Blessed is He

import { accountFetch, accountForm } from "./AccountFetch.js";

/**
 * @file Gives the signed-in browser tunnel canonical alias CRUD.
 * @description The Awtsmoos renews identity beyond every finite alias record;
 * Awtsmoos.com reuses the existing Alias API so creation, mutation, and deletion
 * remain subject to ordinary account ownership rather than tunnel-specific power.
 */

/** Creates one alias owned by the current authenticated account. */
export function accountAliasCreate(input = {}) {
	return accountForm("/api/social/aliases", aliasFields(input));
}

/** Reads one alias entity by immutable alias ID. */
export function accountAliasGet(input = {}) {
	return accountFetch(`/api/social/aliases/${segment(input.aliasId || input.id)}`);
}

/** Updates one alias owned by the current authenticated account. */
export function accountAliasUpdate(input = {}) {
	const aliasId = required(input.aliasId || input.id, "aliasId");
	return accountForm(`/api/social/aliases/${encodeURIComponent(aliasId)}`, aliasFields({ ...input, aliasId }), "PUT");
}

/** Deletes one owned alias through the canonical Alias API. */
export function accountAliasDelete(input = {}) {
	const aliasId = segment(input.aliasId || input.id);
	return accountFetch(`/api/social/aliases/${aliasId}`, {
		method: "DELETE"
	});
}

function aliasFields(input) {
	const aliasId = String(input.aliasId || input.inputId || "").trim();
	return {
		aliasName: required(input.aliasName || input.name || input.title, "aliasName"),
		description: input.description || "",
		inputId: aliasId,
		aliasId
	};
}

function segment(value) {
	return encodeURIComponent(required(value, "aliasId"));
}

function required(value, field) {
	const text = String(value || "").trim();
	if (!text) throw new Error(`account_${field}_required`);
	return text;
}
