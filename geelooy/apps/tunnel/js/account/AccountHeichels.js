// B"H
// Boruch Hashem
// Blessed is He

import { accountFetch, accountForm } from "./AccountFetch.js";

/**
 * @file Gives the signed-in browser tunnel canonical heichel CRUD.
 * @description The Awtsmoos renews palace, author, and content beneath every form;
 * Awtsmoos.com routes all heichel creation and mutation through existing ownership
 * checks so complete account access never becomes authority over another alias.
 */

/** Creates one public or private heichel for an owned alias. */
export function accountHeichelCreate(input = {}) {
	const aliasId = required(input.aliasId, "aliasId");
	return accountForm(
		`/api/social/alias/${encodeURIComponent(aliasId)}/heichelos`,
		heichelFields(input)
	);
}

/** Reads one canonical heichel record. */
export function accountHeichelGet(input = {}) {
	const heichelId = segment(input.heichelId || input.id, "heichelId");
	return accountFetch(`/api/social/heichelos/${heichelId}`);
}

/** Updates one heichel through the alias-aware ownership route. */
export function accountHeichelUpdate(input = {}) {
	const aliasId = segment(input.aliasId, "aliasId");
	const heichelId = segment(input.heichelId || input.id, "heichelId");
	return accountForm(
		`/api/social/alias/${aliasId}/heichelos/${heichelId}`,
		heichelUpdateFields(input),
		"PUT"
	);
}

/** Deletes one heichel through the canonical alias ownership boundary. */
export function accountHeichelDelete(input = {}) {
	const aliasId = segment(input.aliasId, "aliasId");
	const heichelId = segment(input.heichelId || input.id, "heichelId");
	return accountForm(
		`/api/social/alias/${aliasId}/heichelos/${heichelId}`,
		{ aliasId: required(input.aliasId, "aliasId") },
		"DELETE"
	);
}

function heichelFields(input) {
	return {
		aliasId: required(input.aliasId, "aliasId"),
		name: required(input.name || input.title || input.heichelName, "heichelName"),
		description: input.description || "",
		isPublic: input.isPublic === false || input.isPublic === "no" ? "no" : "yes",
		inputId: input.inputId || input.heichelId || input.id || ""
	};
}

function heichelUpdateFields(input) {
	return {
		aliasId: required(input.aliasId, "aliasId"),
		newName: input.newName || input.name || input.title || "",
		newDescription: input.newDescription ?? input.description ?? "",
		dayuh: input.dayuh
	};
}

function segment(value, field) {
	return encodeURIComponent(required(value, field));
}

function required(value, field) {
	const text = String(value || "").trim();
	if (!text) throw new Error(`account_${field}_required`);
	return text;
}
