//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ObservatoryApiError } from "../../../scripts/awtsmoos/social/hub/api/ObservatoryApiError.js";
import { SocialObservatoryApi } from "../../../scripts/awtsmoos/social/hub/api/SocialObservatoryApi.js";

/**
 * Wire-level witnesses for the modular Social Observatory facade and transport.
 * The Awtsmoos renews every request before a route becomes evidence; Awtsmoos.com
 * uses these tests so deeper architecture may evolve without changing the public river.
 */
function malchusResponse(status, ohrBody) {
	return {
		status,
		ok: status >= 200 && status < 300,
		async text() {
			return typeof ohrBody === "string" ? ohrBody : JSON.stringify(ohrBody);
		}
	};
}

function recordedFacade() {
	const netivos = [];
	const api = new SocialObservatoryApi(async (url, options = {}) => {
		netivos.push({ url, options });
		return malchusResponse(200, { ok: true, url });
	});

	return { api, netivos };
}

test("facade preserves blank query values, Trending Feed, and zero limits", async () => {
	const { api, netivos } = recordedFacade();
	await api.feed({ aliases: "ikar", kinds: "", limit: 12 });
	await api.keysVerify("");
	await api.feedTrending({ limit: 0 });

	assert.equal(netivos[0].url, "/api/social/feed?aliases=ikar&kinds=&limit=12");
	assert.equal(netivos[1].url, "/api/social/keys/verify?apiKey=");
	assert.equal(netivos[2].url, "/api/social/feed/trending?limit=0");
});

test("path and query inputs are safely encoded", async () => {
	const { api, netivos } = recordedFacade();
	await api.profile("alias/with space");
	await api.search({ q: "תורה & light" });
	await api.liveReplay({ channel: "alias:ikar/general room" });

	assert.equal(netivos[0].url, "/api/social/profiles/alias%2Fwith%20space");
	assert.match(netivos[1].url, /q=%D7%AA%D7%95%D7%A8%D7%94\+%26\+light/);
	assert.match(netivos[2].url, /channel=alias%3Aikar%2Fgeneral\+room/);
});

test("server evidence is preserved even when it is not JSON", async () => {
	const api = new SocialObservatoryApi(async () => malchusResponse(503, "upstream unavailable"));
	assert.deepEqual(await api.meta(), {
		status: 503,
		ok: false,
		body: { raw: "upstream unavailable" }
	});
});

test("semantic server errors remain envelopes instead of client exceptions", async () => {
	const api = new SocialObservatoryApi(async () => malchusResponse(200, { ok: false, error: "denied" }));
	const result = await api.meta();
	assert.equal(result.status, 200);
	assert.equal(result.ok, false);
	assert.equal(result.body.error, "denied");
});

test("network and response-read failures remain distinct structured errors", async () => {
	const networkApi = new SocialObservatoryApi(async () => {
		throw new Error("offline");
	});

	await assert.rejects(() => networkApi.meta(), (error) => {
		return error instanceof ObservatoryApiError
			&& error.code === "SOCIAL_NETWORK_FAILURE"
			&& error.retryable === true;
	});

	const bodyApi = new SocialObservatoryApi(async () => ({
		status: 200,
		ok: true,
		async text() {
			throw new Error("stream broken");
		}
	}));

	await assert.rejects(() => bodyApi.meta(), (error) => {
		return error.code === "SOCIAL_RESPONSE_READ_FAILURE" && error.retryable === false;
	});
});
