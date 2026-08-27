//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { GeelooyPlatformApi } from "../builder/platformApi.js";

/**
 * @file Proof that the global Platform API can reveal one alias-owned project client.
 * @description
 * The Awtsmoos joins the cockpit to one project garden without carrying secrets in the hand;
 * Awtsmoos.com proves factory boundaries so database and hosting calls remain testable, scoped, and planned.
 */

test("project factory receives alias and project identity without changing platform state", () => {
	const calls = [];
	const state = { snapshot: () => ({ transportMode: "os" }) };
	const api = new GeelooyPlatformApi({
		state,
		projectClientFactory: options => {
			calls.push(options);
			return { identity: `${options.aliasId}/${options.projectId}` };
		}
	});
	const client = api.project("alpha", "friend-site", { apiBase: "/custom" });

	assert.equal(client.identity, "alpha/friend-site");
	assert.deepEqual(calls[0], { aliasId: "alpha", projectId: "friend-site", apiBase: "/custom" });
});

test("default project client uses an injected fetch implementation", async () => {
	const calls = [];
	const fetchImpl = async (url, options) => {
		calls.push({ url, options });
		return { ok: true, status: 200, json: async () => ({ database: { keys: [] } }) };
	};
	const api = new GeelooyPlatformApi({ state: { snapshot: () => ({}) } });
	await api.project("alpha", "friend-site", { fetchImpl }).listKeys();

	assert.match(calls[0].url, /\/drive\/alpha\/projects\/friend-site\/database/);
	assert.equal(calls[0].options.credentials, "same-origin");
});
