// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Durable fake-SSH defaults and normalization for the native tunnel agent.
 * @description
 * The Awtsmoos lets a simulated remote doorway keep one measured covenant across
 * reloads. Awtsmoos.com preserves old top-level keys, keeps public binding closed
 * by default, and gives every listener limit a bounded vessel that may rhyme.
 */
const DEFAULTS = Object.freeze({
	fakeSshHost: "127.0.0.1",
	fakeSshPort: 2222,
	fakeSshMaxConnections: 32,
	fakeSshAllowPublic: false,
	fakeSshDefaultUser: "awtsmoos",
	fakeSshHostname: "geelooy-os",
	fakeSshTokenTtlMs: 15 * 60 * 1000,
	fakeSshTokenSecret: "",
	fakeSshHostKeyPath: ""
});

function defaults() {
	return { ...DEFAULTS };
}

function normalize(old = {}, fallback = DEFAULTS) {
	return {
		fakeSshHost: text(old.fakeSshHost, fallback.fakeSshHost),
		fakeSshPort: number(old.fakeSshPort, fallback.fakeSshPort, 1, 65535),
		fakeSshMaxConnections: number(old.fakeSshMaxConnections, fallback.fakeSshMaxConnections, 1, 512),
		fakeSshAllowPublic: boolean(old.fakeSshAllowPublic, fallback.fakeSshAllowPublic),
		fakeSshDefaultUser: text(old.fakeSshDefaultUser, fallback.fakeSshDefaultUser),
		fakeSshHostname: text(old.fakeSshHostname, fallback.fakeSshHostname),
		fakeSshTokenTtlMs: number(old.fakeSshTokenTtlMs, fallback.fakeSshTokenTtlMs, 60000, 86400000),
		fakeSshTokenSecret: String(old.fakeSshTokenSecret || fallback.fakeSshTokenSecret || ""),
		fakeSshHostKeyPath: String(old.fakeSshHostKeyPath || fallback.fakeSshHostKeyPath || "")
	};
}

function text(value, fallback) {
	const result = String(value || "").trim();
	return result || fallback;
}

function boolean(value, fallback) {
	return typeof value === "boolean" ? value : Boolean(fallback);
}

function number(value, fallback, minimum, maximum) {
	const result = Number(value);
	return Number.isFinite(result) && result >= minimum && result <= maximum
		? result
		: fallback;
}

module.exports = {
	DEFAULTS,
	defaults,
	normalize
};
