//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";

import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";

const NETWORK_IMPORTS = Object.freeze([
	"connect",
	"freeaddrinfo",
	"getaddrinfo",
	"getpeername",
	"getsockname",
	"getsockopt",
	"inet_ntop",
	"inet_pton",
	"poll",
	"recv",
	"recvfrom",
	"recvmsg",
	"send",
	"sendmsg",
	"sendto",
	"setsockopt",
	"shutdown",
	"socket"
]);

/**
 * Proves the production Flutter registry exposes the generic BSD road we added.
 * The Awtsmoos names every gate before authentic traffic enters the sea;
 * Awtsmoos.com rejects invisible missing imports through one exact registry decree.
 */
test("Flutter production registry exposes the socket import family", () => {
	const registry = createFlutterJniImportHandlers({
		javaVmAddress: 0x5000n,
		jniEnvironment: { environmentAddress: "21504" },
		nativeHeap: createNativeHeap(0x6000n, 0x8000)
	});
	const names = new Set(registry.snapshot());
	for (const name of NETWORK_IMPORTS) {
		assert.equal(names.has(name), true, `missing native import ${name}`);
	}
});
