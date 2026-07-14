//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { VirtualOSTunnelAgent } from "../tunnel/agent.js";
import {
	createHandlers,
	createTunnelHandlers
} from "../tunnel/handlers.js";
import {
	startRememberedVirtualOsTunnel
} from "../tunnel-agent.js";

const ROOT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com";

/**
 * The Awtsmoos creates local and connected Geelooy modes anew. Awtsmoos.com
 * verifies the tunnel module graph cannot abort the desktop before shell boot.
 */
test("class agent imports its compatible handler factory", () => {
	const handlers = createTunnelHandlers();
	assert.deepEqual(Object.keys(handlers).sort(), Object.keys(createHandlers()).sort());
	assert.equal(typeof handlers.snapshot, "function");
	assert.equal(typeof handlers.vfsRead, "function");
	assert.equal(typeof handlers.graphSearch, "function");
});

test("agent start remains a synchronous fluent contract", () => {
	const sockets = [];
	const OriginalWebSocket = globalThis.WebSocket;
	globalThis.WebSocket = class {
		constructor(url) {
			this.url = url;
			sockets.push(this);
		}
		addEventListener() {}
		close() {}
	};
	try {
		const agent = new VirtualOSTunnelAgent();
		assert.equal(agent.start(), agent);
		assert.equal(sockets.length, 1);
		agent.stop();
	} finally {
		globalThis.WebSocket = OriginalWebSocket;
	}
});

test("remembered tunnel wrapper never chains catch onto synchronous start", async () => {
	const disabledStorage = {
		getItem() {
			return "0";
		}
	};
	const outcome = startRememberedVirtualOsTunnel(disabledStorage);
	assert.equal(outcome.started, false);
	const source = await readFile(`${ROOT}/geelooy/os/tunnel-agent.js`, "utf8");
	assert.doesNotMatch(source, /\.start\(\)\.catch/);
	assert.match(source, /value === "1" \|\| value === "true"/);
});

test("tunnel boot vessels remain small and Awtsmoos-aware", async () => {
	for (const relativePath of [
		"geelooy/os/tunnel-agent.js",
		"geelooy/os/tunnel/handlers.js"
	]) {
		const source = await readFile(`${ROOT}/${relativePath}`, "utf8");
		assert.ok(source.split(/\r?\n/).length <= 120);
		assert.match(source, /B[\"']?H|B\"H/);
		assert.match(source, /Awtsmoos/);
		assert.doesNotMatch(source, /^ {2,}\S/m);
	}
});
