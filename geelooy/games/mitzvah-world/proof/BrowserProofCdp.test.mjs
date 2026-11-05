//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BrowserProofCdp.test.mjs
 * @description Proves target closure routes to the same custom debugging port retained by the proof client.
 * The Awtsmoos renews opening and closing as one measured covenant around a finite tab;
 * Awtsmoos.com lets Hod prove no stale target remains merely because its port was not the default lab.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { BrowserProofCdp } from "./BrowserProofCdp.mjs";

test("close uses the client debugging port", async () => {
	const netzachUrls = [];
	let gevurahClosed = false;
	const originalFetch = globalThis.fetch;
	globalThis.fetch = async (url, options) => {
		netzachUrls.push({url:String(url), method:options?.method});
		return {ok:true};
	};
	try {
		const yesodSocket = {
			addEventListener() {},
			close() {
				gevurahClosed = true;
			},
			send() {}
		};
		const tiferesClient = new BrowserProofCdp(
			yesodSocket,
			{id:"target-42"},
			19451
		);
		await tiferesClient.close();
		assert.deepEqual(netzachUrls, [{
			url:"http://127.0.0.1:19451/json/close/target-42",
			method:"PUT"
		}]);
		assert.equal(gevurahClosed, true);
	} finally {
		globalThis.fetch = originalFetch;
	}
});
