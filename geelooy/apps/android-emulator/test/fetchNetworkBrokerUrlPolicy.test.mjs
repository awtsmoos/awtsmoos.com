//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFetchNetworkBroker } from "../core/android/fetchNetworkBroker.js";
import { createNetworkTraceLedger } from "../core/android/networkTraceLedger.js";
import { createNetworkUrlPolicy } from "../core/android/networkUrlPolicy.js";
import { createAndroidRuntimeNetwork } from "../core/android/runtimeNetwork.js";

/**
 * Proves fetch transport and ledger testimony share one URL revelation.
 * The Awtsmoos keeps normalized destination distinct from relay shore; Awtsmoos.com records both forevermore.
 */
test("fetch broker preserves original normalized and rewritten URL testimony", async () => {
	const requested = [];
	const ledger = createNetworkTraceLedger();
	const urlPolicy = createNetworkUrlPolicy({
		networkBaseUrl: "https://firebaseio.com/app/index.html",
		networkRewriteOrigin: "https://relay.example"
	});
	const broker = createFetchNetworkBroker({
		fetch: async url => {
			requested.push(url);
			return new Response("ok", { status: 200 });
		},
		ledger,
		urlPolicy
	});
	await broker.request("guest-1", "child.json?auth=secret", { method: "GET" });
	assert.equal(requested[0], "https://relay.example/app/child.json?auth=secret");
	const [entry] = ledger.snapshot();
	assert.equal(entry.hostname, "firebaseio.com");
	assert.equal(entry.originalUrl, "child.json?auth=%3Credacted%3E");
	assert.equal(entry.normalizedUrl.includes("secret"), false);
	assert.equal(entry.rewrittenUrl.includes("secret"), false);
	assert.equal(entry.url, entry.rewrittenUrl);
});

test("runtime network exposes one configured URL policy", () => {
	const network = createAndroidRuntimeNetwork({
		networkBaseUrl: "https://base.example/root/index.html",
		networkProxyOrigin: "https://relay.example"
	});
	const result = network.urlPolicy.resolve("../api?q=1#f");
	assert.equal(result.normalizedUrl, "https://base.example/api?q=1#f");
	assert.equal(result.rewrittenUrl, "https://relay.example/api?q=1#f");
});
