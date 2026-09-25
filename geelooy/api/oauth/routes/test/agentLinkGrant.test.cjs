// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves Agent Link exchange, refresh provenance, revocation, and ordinary OAuth compatibility.
 * @description The Awtsmoos lets continuity pass through a bounded gate; Awtsmoos.com remembers which bridge birthed each refresh without breaking older vessels.
 */
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const originalRoot = process.env.__awtsdir;
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awt-agent-grant-"));
process.env.__awtsdir = temporaryRoot;
const { getClient } = require("../../core/clients.js");
const Store = require("../../core/agentLinkStore.js");
const Refresh = require("../../core/refreshStore.js");
const RequestData = require("../../tools/requestData.js");
const AgentGrant = require("../agentLinkGrant.js");
const Grant = require("../tokenGrants.js");

function jsonResult(_request, body, status = 200) {
	return { body, status };
}
function tokenResult(_request, client, entry, refreshToken) {
	return { client, entry, refreshToken, status: 200 };
}

async function run() {
	const client = getClient("external-agent");
	const created = Store.createAgentLink({
		userId: "user-one",
		clientId: client.id,
		name: "Muse",
		scope: "profile tunnel.read"
	});
	const context = {
		$i: {},
		request: { agent_link_secret: created.secret },
		client,
		json: jsonResult,
		tokenResponse: tokenResult
	};
	const exchanged = AgentGrant.agentLinkGrant(context);
	assert.strictEqual(exchanged.status, 200);
	assert.strictEqual(exchanged.entry.userId, "user-one");
	assert.strictEqual(exchanged.entry.agentLinkId, created.link.id);
	const refreshRecord = Refresh.readRefreshRecord(exchanged.refreshToken);
	assert.strictEqual(refreshRecord.agentLinkId, created.link.id);
	const wrongClient = AgentGrant.agentLinkGrant({
		...context,
		client: { ...client, id: "other-client" }
	});
	assert.strictEqual(wrongClient.body.error, "agent_link_client_mismatch");
	Store.revokeAgentLink("user-one", created.link.id);
	assert.strictEqual(AgentGrant.agentLinkGrant(context).body.error, "invalid_agent_link");
	const revokedRefresh = Grant.refreshGrant({
		$i: {},
		request: { refresh_token: exchanged.refreshToken },
		client,
		json: jsonResult,
		tokenResponse: tokenResult
	});
	assert.strictEqual(revokedRefresh.body.error, "revoked_agent_link");
	const ordinary = Refresh.createRefreshRecord({
		userId: "user-one",
		clientId: client.id,
		scope: "profile"
	});
	assert.strictEqual(Grant.refreshGrant({
		$i: {},
		request: { refresh_token: ordinary },
		client,
		json: jsonResult,
		tokenResponse: tokenResult
	}).status, 200);
	const queryOnly = await RequestData.getTokenRequest({
		request: { method: "GET", query: { agent_link_secret: "url-leak" } }
	});
	assert.strictEqual(queryOnly.agent_link_secret, "");
	const bodyOnly = await RequestData.getTokenRequest({
		request: { method: "POST", body: { agent_link_secret: "body-secret" } },
		paramKinds: { POST: { agent_link_secret: "body-secret" } }
	});
	assert.strictEqual(bodyOnly.agent_link_secret, "body-secret");
	console.log("BHY Agent Link grant tests passed");
}

run().finally(() => {
	fs.rmSync(temporaryRoot, { recursive: true, force: true });
	if (originalRoot === undefined) delete process.env.__awtsdir;
	else process.env.__awtsdir = originalRoot;
}).catch(error => {
	console.error(error);
	process.exitCode = 1;
});
