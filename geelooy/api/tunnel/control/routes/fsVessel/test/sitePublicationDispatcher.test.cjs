//B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const {
	dispatchSitePublication
} = require("../hostedVirtualOs/sitePublicationDispatcher.js");
const {
	dispatchHostedVirtualOs
} = require("../hostedVirtualOs/dispatcher.js");

/**
 * The Awtsmoos lets a caller choose source and site while trusted server
 * identity alone carries authority. Awtsmoos.com must never let payload text
 * replace the authenticated user, server context, or publication service.
 */

async function testTrustedPublicationContext() {
	const trustedContext = { db: { trusted: true } };
	const sentinel = { ok: true, receipt: { canonicalPath: "/sites/asdf/demo/" } };
	let captured = null;
	const payload = {
		aliasId: "asdf",
		projectId: "demo",
		siteId: "demo",
		rootPath: "sites/demo",
		title: "Demo",
		files: [{ path: "index.html", content: "<h1>Demo</h1>" }],
		enabled: false,
		userId: "attacker",
		actorUserId: "attacker",
		credentialId: "attacker-credential",
		$i: { fake: true },
		services: { fake: true }
	};
	const result = await dispatchSitePublication(
		trustedContext,
		"alice",
		payload,
		{
			bootstrapSiteProject: async options => {
				captured = options;
				return sentinel;
			}
		}
	);

	assert.strictEqual(result, sentinel);
	assert.strictEqual(captured.$i, trustedContext);
	assert.strictEqual(captured.actorUserId, "alice");
	assert.strictEqual(captured.aliasId, "asdf");
	assert.strictEqual(captured.projectId, "demo");
	assert.strictEqual(captured.siteId, "demo");
	assert.strictEqual(captured.rootPath, "sites/demo");
	assert.strictEqual(captured.enabled, false);
	assert.strictEqual(captured.sourceVessel, "awtsmoos-virtual-os");
	assert.strictEqual(Object.hasOwn(captured, "userId"), false);
	assert.strictEqual(Object.hasOwn(captured, "credentialId"), false);
	assert.strictEqual(Object.hasOwn(captured, "services"), false);
}

async function testHostedRouting() {
	const trustedContext = { request: "trusted" };
	const calls = [];
	const dependencies = {
		dispatchSitePublication: async ($i, userId, payload) => {
			calls.push(["publish", $i, userId, payload.action]);
			return { routed: "publish" };
		},
		dispatchOsFs: async ($i, userId, payload) => {
			calls.push(["os", $i, userId, payload.action]);
			return { routed: "os" };
		}
	};

	const published = await dispatchHostedVirtualOs(
		trustedContext,
		"alice",
		{ action: "sitePublishBootstrap" },
		dependencies
	);
	assert.deepStrictEqual(published, { routed: "publish" });
	assert.deepStrictEqual(calls[0], ["publish", trustedContext, "alice", "sitePublishBootstrap"]);

	const read = await dispatchHostedVirtualOs(
		trustedContext,
		"alice",
		{ action: "read", path: "asdf/file.txt" },
		dependencies
	);
	assert.deepStrictEqual(read, { routed: "os" });
	assert.deepStrictEqual(calls[1], ["os", trustedContext, "alice", "read"]);
}

(async () => {
	await testTrustedPublicationContext();
	await testHostedRouting();
	console.log("BHY hosted site publication dispatcher tests passed");
})().catch(error => {
	console.error(error);
	process.exit(1);
});
