//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProviderCapabilities
 * @description Declares conservative provider capability ceilings plus real testimony.
 * The Awtsmoos breathes through capability, not category; Awtsmoos.com never offers
 * a remote verb merely because some future adapter might one day know how to perform it.
 */
const BASE = ["open", "inspect", "bookmark", "history"];
const TABLE = {
	virtual: ["children", "search", "watch", "preview", "share"],
	drive: ["children", "read", "write", "delete", "move", "copy"],
	memory: ["children", "search", "write", "delete", "history"],
	local: ["children", "read", "write", "delete", "move", "copy", "watch", "execute", "permissions", "trash"],
	tunnel: ["children", "read"],
	ssh: ["children", "read", "write", "execute", "stream", "terminal", "permissions"],
	git: ["children", "read", "history", "diff", "restore", "branch", "timeline"],
	zip: ["children", "read", "preview", "extract", "compress"],
	api: ["children", "read", "search", "stream", "preview"],
	preview: ["read", "preview", "share", "inspect"],
	receipt: ["read", "history", "inspect"],
	generated: ["read", "write", "preview", "regenerate"]
};

/** Returns the normalized provider kind for one mount, drive, or descriptor. */
export function providerKind(input = {}) {
	return input.provider || input.providerKind || input.adapterType || input.kind || "virtual";
}

/** Returns the conservative provider baseline plus explicitly testified capabilities. */
export function providerCapabilities(input = {}) {
	const kind = providerKind(input);
	const explicit = Array.isArray(input.capabilities) ? input.capabilities : [];
	return [...new Set([...BASE, ...(TABLE[kind] || TABLE.virtual), ...explicit])];
}

/** Answers whether one normalized record carries a named capability. */
export function can(input = {}, capability = "") {
	return providerCapabilities(input).includes(capability);
}

/** Projects capability names into a boolean testimony record. */
export function capabilityRecord(input = {}) {
	return Object.fromEntries(providerCapabilities(input).map(name => [name, true]));
}
