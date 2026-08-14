// B"H

const assert = require("node:assert/strict");
const { buildFsPayload } = require(
	"../../../../api/tunnel/control/core/tunnelPayload.js"
);
const Runner = require("../tools/fs/actionGroups/websiteAgents/runner.js");
const { buildWebsiteAgentActions } = require(
	"../tools/fs/actionGroups/websiteAgentActions.js"
);

const expected = {
	websiteMissionId: "web-text-carrier",
	agentId: "website_transport_agent",
	kind: "completion",
	complete: true,
	body: "Verified text64 carrier completion.",
	references: ["focused-proof.json"],
	reportId: "report-text64-1"
};
const payload = buildFsPayload({
	paramKinds: {
		GET: {
			action: "websiteAgentMissionMessage",
			text64: Buffer.from(JSON.stringify(expected)).toString("base64")
		}
	}
});
const original = Runner.message;
let received;

(async () => {
	try {
		Runner.message = async (_config, value) => {
			received = value;
			return { ok: true };
		};
		const actions = buildWebsiteAgentActions({ config: {}, payload });
		await actions.websiteAgentMissionMessage();
		for (const [key, value] of Object.entries(expected)) {
			assert.deepEqual(received[key], value, key);
		}
		assert.equal(received.action, "websiteAgentMissionMessage");
		console.log(JSON.stringify({
			ok: true,
			suite: "website-agent-text-carrier",
			text64Normalized: true,
			messageActionReceivedFields: true
		}, null, 2));
	} finally {
		Runner.message = original;
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
