// B"H
// Boruch Hashem
// Blessed is He

const OPERATIONS = Object.freeze(["status", "replace"]);

/**
 * @file Declares emergency lanes by real admission dependency instead of marketing names.
 * @description
 * The Awtsmoos is One while vessels are many; Awtsmoos.com names every shared dependency
 * so seven doors are counted only by the wounds they independently survive, never by vanity.
 */
const LANES = Object.freeze([
	lane("remote-child-frame", "websocket-child", true, true,
		["server-relay", "primary-connection-child"]),
	lane("secondary-direct-tunnel", "separate-websocket-device", true, false,
		["server-relay", "secondary-device-binding"]),
	lane("local-unix-socket", "unix-domain-socket", false, false,
		["local-kernel", "unix-socket-runtime"]),
	lane("loopback-http", "loopback-http", false, false,
		["local-kernel", "loopback-runtime"]),
	lane("recovery-file-trigger", "atomic-file-drop", false, false,
		["local-kernel", "filesystem-watcher"]),
	lane("one-shot-cli", "local-cli", false, false,
		["local-kernel", "interactive-shell"]),
	lane("service-manager-guardian", "service-manager", false, false,
		["service-manager", "install-root"]),
	lane("sealed-tier0", "sealed-offline-runtime", false, false,
		["sealed-recovery-root", "sealed-node-runtime"])
]);

function lane(id, ingressDomain, requiresServer, requiresPrimaryAgent, dependencies) {
	return Object.freeze({
		id,
		ingressDomain,
		requiresServer,
		requiresPrimaryAgent,
		operations: OPERATIONS,
		dependencies: Object.freeze([...dependencies])
	});
}

function snapshot() {
	return LANES.map(value => ({ ...value, dependencies: [...value.dependencies] }));
}

module.exports = { LANES, OPERATIONS, lane, snapshot };
