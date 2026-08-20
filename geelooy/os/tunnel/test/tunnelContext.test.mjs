// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves shared tunnel context is immutable-route-based, ephemeral, and narrow.
 * @description
 * The Awtsmoos lets one Explorer folder become shared context without becoming
 * authority. Awtsmoos.com keeps only route, cwd, canonical path, and provider;
 * local roads clear the vessel and subscriptions witness each change without secrets.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	TunnelContextStore,
	contextFromExplorerPath,
	ensureTunnelContext
} from "../tunnelContext.js";

test("network path becomes canonical immutable tunnel context", () => {
	const context = contextFromExplorerPath(
		"/network/route%2Fone/docs/sub"
	);
	assert.deepEqual(context, {
		route: "route/one",
		cwd: "docs/sub",
		path: "/network/route%2Fone/docs/sub",
		provider: "tunnel"
	});
});

test("legacy tunnel URL becomes canonical network context", () => {
	const context = contextFromExplorerPath(
		"awtsmoos://tunnels/route%2Fone/docs"
	);
	assert.equal(context.route, "route/one");
	assert.equal(context.cwd, "docs");
	assert.equal(context.path, "/network/route%2Fone/docs");
});

test("local paths never become tunnel context", () => {
	assert.equal(contextFromExplorerPath("/desktop.folder"), null);
	assert.equal(contextFromExplorerPath("/system/previews/demo"), null);
});

test("store publishes remote context and clears on local path", () => {
	const store = new TunnelContextStore();
	const seen = [];
	const dispose = store.subscribe(value => seen.push(value));
	store.publishPath("/network/route-live/docs");
	store.publishPath("/desktop.folder");
	dispose();
	assert.equal(seen[0], null);
	assert.equal(seen[1].route, "route-live");
	assert.equal(seen[1].cwd, "docs");
	assert.equal(seen[2], null);
	assert.equal(store.snapshot(), null);
});

test("ensureTunnelContext returns one shared OS store", () => {
	const os = {};
	const first = ensureTunnelContext(os);
	const second = ensureTunnelContext(os);
	assert.equal(first, second);
	assert.equal(os.tunnelContext, first);
});
