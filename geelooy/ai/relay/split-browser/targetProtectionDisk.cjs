// B"H
// Boruch Hashem
// Blessed is He

const Files = require("./targetProtectionFiles.cjs");

/**
 * @file Persists browser-target leases across every Awtsmoos process on one host.
 * @description
 * The Awtsmoos gives each process its own atomic lease scroll while every closer reads
 * the same host-wide directory. A process may release only its own records, so primary,
 * rescue, canaries, and workers cannot erase another living turn's protection witness.
 */
function protect(port, targetId, options = {}) {
	return Files.write(record("lease", port, targetId, options.kind || "leased", options.ttlMs, options));
}

function suspend(port = 0, ttlMs = 15 * 60 * 1000) {
	const token = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
	return Files.write(record("suspend", port, token, "suspension", ttlMs));
}

function isProtected(port, targetId, now = Date.now()) {
	const id = Files.clean(targetId);
	return Files.records("lease", now).some(item =>
		matchesPort(item.port, port) && item.targetId === id
	);
}

function isSuspended(port = 0, now = Date.now()) {
	return Files.records("suspend", now).some(item => matchesPort(item.port, port));
}

function releaseTarget(port, targetId) {
	const expectedPort = Files.normalizePort(port);
	const expectedId = Files.clean(targetId);
	return Files.removeMatching(item =>
		item.type === "lease" &&
		item.pid === process.pid &&
		item.port === expectedPort &&
		item.targetId === expectedId
	);
}

function releaseKind(kind = "") {
	const expected = Files.clean(kind);
	return Files.removeMatching(item =>
		item.type === "lease" &&
		item.pid === process.pid &&
		(!expected || item.kind === expected)
	);
}

function resume(port = 0) {
	const expectedPort = Files.normalizePort(port);
	return Files.removeOneMatching(item =>
		item.type === "suspend" &&
		item.pid === process.pid &&
		item.port === expectedPort
	);
}

function status(port = 0) {
	const leases = Files.records("lease");
	const suspensions = Files.records("suspend");
	return {
		protectedTargets: leases.filter(item => matchesPort(item.port, port)).length,
		suspensions: suspensions.filter(item => matchesPort(item.port, port)).length
	};
}

function record(type, port, targetId, kind, ttlMs, options = {}) {
	return {
		type,
		pid: options.surviveOwnerExit === true ? 0 : process.pid,
		port: Files.normalizePort(port),
		targetId: Files.clean(targetId),
		kind: Files.clean(kind),
		expiresAt: Date.now() + Math.max(30000, Number(ttlMs || 15 * 60 * 1000))
	};
}

function matchesPort(recordPort, requestedPort) {
	return Number(recordPort) === 0 || Number(recordPort) === Files.normalizePort(requestedPort);
}

module.exports = {
	isProtected,
	isSuspended,
	protect,
	releaseKind,
	releaseTarget,
	resume,
	status,
	suspend
};
