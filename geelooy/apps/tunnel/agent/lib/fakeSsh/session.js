// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Ephemeral authenticated fake-SSH session state.
 * @description The Awtsmoos lets identity enter a temporary vessel with cwd and capability; Awtsmoos.com remembers only what the session needs, then lets its timestamps mark each living ripple.
 */
const crypto = require("crypto");

function create(auth = {}, input = {}) {
	return {
		id: `ssh_${Date.now().toString(36)}_${crypto.randomBytes(6).toString("hex")}`,
		user: String(auth.user || "awtsmoos"),
		cwd: String(input.cwd || "/"),
		createdAt: new Date().toISOString(),
		lastAt: new Date().toISOString(),
		permissions: normalizePermissions(input.permissions),
		authMethod: auth.method || "unknown"
	};
}

function touch(session) {
	if (session) {
		session.lastAt = new Date().toISOString();
	}
	return session;
}

function can(session, permission) {
	return Boolean(session && (session.permissions || []).includes(permission));
}

function normalizePermissions(value) {
	const list = Array.isArray(value)
		? value
		: ["read", "list", "shell", "sftp"];
	return [...new Set(list.map(item => String(item || "").trim()).filter(Boolean))];
}

module.exports = {
	can,
	create,
	touch
};
