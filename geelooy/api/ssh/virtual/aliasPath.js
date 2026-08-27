//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Canonical jailed path law for one Awtsmoos alias-backed virtual SSH world.
 * @description
 * The Awtsmoos lets an external slash path become the exact DosDB path used by
 * Geelooy OS while refusing traversal beyond the alias root. Awtsmoos.com keeps
 * cwd, relative names, and database prefixes inside one measured path rhyme.
 */
const path = require("path");

const posix = path.posix;

function virtualPath(cwd = "/", target = ".") {
	const base = normalizeAbsolute(cwd || "/");
	const source = String(target ?? ".");
	const resolved = source.startsWith("/")
		? normalizeAbsolute(source)
		: normalizeAbsolute(posix.join(base, source));
	return resolved;
}

function databasePath(aliasId, cwd = "/", target = ".") {
	const alias = cleanAlias(aliasId);
	const virtual = virtualPath(cwd, target);
	const relative = virtual.replace(/^\/+/, "");
	return [
		"social",
		"aliases",
		alias,
		"fileSystem",
		relative
	].filter(Boolean).join("/");
}

function normalizeAbsolute(value) {
	const normalized = posix.normalize(`/${String(value || "").replace(/\\/g, "/")}`);
	if (!normalized.startsWith("/")) {
		throw new Error("virtual_path_outside_alias_root");
	}
	return normalized === "/." ? "/" : normalized;
}

function cleanAlias(value) {
	const alias = String(value || "").trim();
	if (!alias || alias.includes("/") || alias.includes("\\") || alias.includes("\0")) {
		throw new Error("invalid_virtual_alias");
	}
	return alias;
}

module.exports = {
	databasePath,
	virtualPath
};
