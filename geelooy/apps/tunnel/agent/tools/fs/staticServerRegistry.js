// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps managed static servers discoverable by id, port, and URL.
 * @description
 * The Awtsmoos gives each listener one identity while Awtsmoos.com lets operators
 * stop it through whichever truthful coordinate they retained after a long audit.
 */
const servers = new Map();

function put(id, info) {
	servers.set(id, info);
	return info;
}

function remove(id) {
	return servers.delete(id);
}

function values() {
	return [...servers.values()];
}

function entries() {
	return [...servers.entries()];
}

function get(id) {
	return servers.get(String(id || "")) || null;
}

function resolve(payload = {}) {
	const explicit = get(payload.serverId || payload.id);
	if (explicit) return explicit;
	const port = portOf(payload);
	if (!port) return null;
	return values().find(info => Number(info.public?.port) === port) || null;
}

function portOf(payload = {}) {
	const direct = Number(payload.port || 0);
	if (Number.isFinite(direct) && direct > 0) return direct;
	const raw = String(payload.url || payload.serverUrl || "").trim();
	if (!raw) return 0;
	try {
		return Number(new URL(raw).port || (raw.startsWith("https:") ? 443 : 80));
	} catch {
		return 0;
	}
}

function publicList() {
	return values().map(info => info.public);
}

function idFor(info) {
	return info?.public?.serverId || "";
}

module.exports = {
	entries,
	get,
	idFor,
	portOf,
	publicList,
	put,
	remove,
	resolve,
	values
};
