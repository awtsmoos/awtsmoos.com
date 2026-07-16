// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileMenuApiCases
 * @description The Awtsmoos lets encoded identities cross Awtsmoos.com routes without ambiguity.
 */
import assert from "node:assert/strict";
import { matchDynamicRoute } from "../../../../../ayzarim/awtsmoosDynamicServer/routing/dynamicRouteMatcher.js";
import {
	loadAliasApiWithFetch,
	loadBrowserModule,
	makeResponse
} from "./profileMenuTestSupport.mjs";

export function testRouteMatcherManyTimes() {
	const aliases = ["simple", "space alias", "אבג", "dots.and-dashes_123"];
	for (let iteration = 0; iteration < 60; iteration += 1) {
		for (const alias of aliases) {
			const result = matchDynamicRoute(":a", encodeURIComponent(alias));
			assert.equal(result.doesRouteMatchURL, true);
			assert.equal(result.vars.a, alias);
		}
	}
}

export async function runProfileApiCases() {
	await testAliasApiEncoding();
	await testAliasApiErrorShape();
	await testSocialHandlerResponseShapes();
}

async function testAliasApiEncoding() {
	const calls = [];
	const api = await loadAliasApiWithFetch(async (url, options) => {
		calls.push({ url, options });
		return makeResponse({ body: { code: "YES", series: [] } });
	});
	await api.getAliasDetails("אבג space/seg");
	await api.getAliasOwnership("אבג space/seg");
	await api.getHeichelosOfPostsOfAlias({ aliasId: "אבג space/seg" });
	await api.getSeriesOfPostsOfAliasInHeichel({ aliasId: "אבג", heichelId: "heichel one" });
	await api.getPostsOfAliasInSeries({ aliasId: "אבג", heichelId: "heichel one", path: "root/inner path" });
	await api.getHeichelosOfCommentsOfAlias({ aliasId: "אבג space/seg" });
	await api.getCommentSeriesOfAliasInHeichel({ aliasId: "אבג", heichelId: "heichel one" });
	assert.equal(calls.length, 7);
	assert.match(calls[0].url, /%D7%90%D7%91%D7%92%20space%2Fseg\/details$/);
	assert.match(calls[1].url, /%D7%90%D7%91%D7%92%20space%2Fseg\/ownership$/);
	assert.match(calls[2].url, /aliases\/%D7%90%D7%91%D7%92%20space%2Fseg\/postsMade\/heichelos$/);
	assert.match(calls[3].url, /heichel\/heichel%20one\/series$/);
	assert.match(calls[4].url, /pathToSeries\//);
	assert.match(calls[5].url, /commentsMade\/heichelos$/);
	assert.match(calls[6].url, /commentsMade\/heichel\/heichel%20one\/series$/);
}

async function testAliasApiErrorShape() {
	const api = await loadAliasApiWithFetch(async () => makeResponse({
		ok: false,
		status: 503,
		statusText: "Service Unavailable",
		body: { reason: "offline" }
	}));
	const response = await api.getAliasDetails("x");
	assert.equal(response.error.code, 503);
	assert.equal(response.error.message, "Service Unavailable");
	assert.deepEqual(response.error.details, { reason: "offline" });
}

async function testSocialHandlerResponseShapes() {
	const { default: Handler } = await loadBrowserModule("geelooy/scripts/awtsmoos/social/AwtsmoosSocialHandler.js");
	globalThis.fetch = async () => makeResponse({ body: "not-json" });
	const handler = new Handler("/api/social", "aliases");
	assert.equal((await handler.fetchEntities("details")).error.code, "INVALID_JSON");
	globalThis.fetch = async () => makeResponse({ ok: false, status: 500, statusText: "Broken", body: { reason: "server" } });
	const failed = await handler.fetchEntities("details");
	assert.equal(failed.error.code, 500);
	assert.equal(failed.error.details.reason, "server");
}
