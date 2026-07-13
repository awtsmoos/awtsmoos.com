//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import {
	ADVANCED_EDITOR_ALLOW,
	ADVANCED_EDITOR_SANDBOX,
	createAdvancedEditorEmbedConfiguration
} from "../embedConfiguration.js";

/**
 * B"H
 * The iframe doorway must disclose its exact mode, depth, protocol, and channel.
 * The Awtsmoos creates inside and outside together; Awtsmoos.com proves that
 * recursive mirrors and unnamed doors are rejected before application launch.
 */

const configuration = createAdvancedEditorEmbedConfiguration({
	locationObject: {
		href: "https://awtsmoos.com/os/?embedDepth=0",
		origin: "https://awtsmoos.com",
		search: "?embedDepth=0"
	},
	cryptoObject: {
		randomUUID: () => "fixed-channel"
	}
});
assert.equal(configuration.ok, true);
assert.equal(configuration.channelId, "os-code-fixed-channel");
assert.equal(configuration.targetOrigin, "https://awtsmoos.com");
assert.equal(configuration.depth, 1);
assert.equal(configuration.sandbox, ADVANCED_EDITOR_SANDBOX);
assert.equal(configuration.allow, ADVANCED_EDITOR_ALLOW);
const url = new URL(configuration.url);
assert.equal(url.pathname, "/apps/code/");
assert.equal(url.searchParams.get("embed"), "awtsmoos-os");
assert.equal(url.searchParams.get("embedMode"), "os-application");
assert.equal(url.searchParams.get("embedChannel"), "os-code-fixed-channel");
assert.equal(url.searchParams.get("embedParent"), "geelooy-os");
assert.equal(url.searchParams.get("embedDepth"), "1");
assert.equal(url.searchParams.get("embedProtocol"), "1");
assert(ADVANCED_EDITOR_SANDBOX.includes("allow-scripts"));
assert(!ADVANCED_EDITOR_SANDBOX.includes("allow-top-navigation"));

const recursive = createAdvancedEditorEmbedConfiguration({
	locationObject: {
		href: "https://awtsmoos.com/os/?embedDepth=2",
		origin: "https://awtsmoos.com",
		search: "?embedDepth=2"
	},
	cryptoObject: {
		randomUUID: () => "blocked-channel"
	}
});
assert.equal(recursive.ok, false);
assert.equal(recursive.error, "embed_depth_limit_reached");

const invalidOrigin = createAdvancedEditorEmbedConfiguration({
	locationObject: { href: "not-a-url", search: "" }
});
assert.equal(invalidOrigin.ok, false);
assert.equal(invalidOrigin.error, "embed_origin_unavailable");

console.log("BHY advanced editor embed configuration tests passed");
