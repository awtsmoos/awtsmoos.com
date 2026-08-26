//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Boot-presence contract for the alias-backed virtual SSH listener.
 * @description
 * The Awtsmoos lets a doorway exist before a traveler receives a key; Awtsmoos.com
 * proves disabled configuration binds nothing while explicit public light starts exactly
 * one listener, keeping presence separate from authentication as both vessels rhyme.
 */
const assert = require("node:assert/strict");
const { revealVirtualSshAtBoot } = require("../bootLifecycle.js");

const ENVIRONMENT_NAMES = [
	"VIRTUAL_SSH_HOST",
	"VIRTUAL_SSH_PUBLIC_HOST",
	"VIRTUAL_SSH_PORT"
];
const originalEnvironment = captureEnvironment();

(async () => {
	try {
		await proveDisabledBootDoesNotStart();
		await proveConfiguredBootStartsListener();
		console.log("VIRTUAL_SSH_BOOT_LIFECYCLE_OK");
	} finally {
		restoreEnvironment(originalEnvironment);
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});

async function proveDisabledBootDoesNotStart() {
	clearVirtualSshEnvironment();
	let starts = 0;
	const state = await revealVirtualSshAtBoot({
		service: {
			start() {
				starts += 1;
			}
		}
	});
	assert.equal(state.enabled, false);
	assert.equal(state.running, false);
	assert.equal(starts, 0);
}

async function proveConfiguredBootStartsListener() {
	process.env.VIRTUAL_SSH_HOST = "127.0.0.1";
	process.env.VIRTUAL_SSH_PORT = "2223";
	let starts = 0;
	const state = await revealVirtualSshAtBoot({
		service: {
			async start() {
				starts += 1;
				return {
					running: true,
					host: "127.0.0.1",
					port: 2223
				};
			}
		}
	});
	assert.equal(state.enabled, true);
	assert.equal(state.running, true);
	assert.equal(state.listener.port, 2223);
	assert.equal(starts, 1);
}

function captureEnvironment() {
	return Object.fromEntries(ENVIRONMENT_NAMES.map(name => {
		return [name, process.env[name]];
	}));
}

function clearVirtualSshEnvironment() {
	for (const name of ENVIRONMENT_NAMES) {
		delete process.env[name];
	}
}

function restoreEnvironment(previous) {
	clearVirtualSshEnvironment();
	for (const [name, value] of Object.entries(previous)) {
		if (value !== undefined) {
			process.env[name] = value;
		}
	}
}
