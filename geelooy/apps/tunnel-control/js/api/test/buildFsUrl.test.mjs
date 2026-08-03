// B"H
import assert from "assert";

global.location = { origin: "https://awtsmoos.test" };
global.localStorage = { getItem() { return null; }, setItem() {} };

const { buildFsUrl } = await import("../tunnel.js");

let url = new URL(buildFsUrl("awt-test", {
	action: "read",
	path: "src/app.js",
	maxChars: 120,
	content: "hello"
}));
assert.strictEqual(url.origin, "https://awtsmoos.test");
assert.strictEqual(url.pathname, "/api/tunnel/control/fs/awt-test");
assert.strictEqual(url.searchParams.get("action"), "read");
assert.strictEqual(url.searchParams.get("p"), "src/app.js");
assert.strictEqual(url.searchParams.get("maxChars"), "120");
assert(url.searchParams.get("content64"));

url = new URL(buildFsUrl("awt-test", {
	action: "aiAgentMessage",
	provider: "deepseek",
	model: "deepseek-chat",
	message: "BHY",
	saveToAccount: true
}));
assert.strictEqual(url.searchParams.get("action"), "aiAgentMessage");
assert(url.searchParams.get("text64"), "AI payload should be packed into text64");
assert.strictEqual(url.searchParams.get("message64"), null);
assert.strictEqual(url.searchParams.get("apiKey64"), null);

url = new URL(buildFsUrl("awt-test", {
	action: "agent",
	mode: "website-mission",
	prompt: "Coordinate a complete repository fix.",
	projectRoot: "/repo",
	agentCount: 12,
	scopes: ["api", "ui"],
	startSpacingMs: 12000,
	collaborationRounds: 2
}));
let packed = unpack(url.searchParams.get("text64"));
assert.strictEqual(packed.mode, "website-mission");
assert.strictEqual(packed.agentCount, 12);
assert.deepStrictEqual(packed.scopes, ["api", "ui"]);
assert.strictEqual(packed.startSpacingMs, 12000);
assert.strictEqual(packed.collaborationRounds, 2);
assert.strictEqual(packed.prompt, "Coordinate a complete repository fix.");

for (const request of [
	{
		action: "websiteAgentMissionStatus",
		websiteMissionId: "webmission-one",
		refreshAuthentication: true
	},
	{
		action: "websiteAgentMissionMessage",
		websiteMissionId: "webmission-one",
		toAgent: "website_02_transport",
		body: "Continue and share proof."
	},
	{
		action: "websiteAgentMissionForget",
		websiteMissionId: "webmission-one"
	}
]) {
	url = new URL(buildFsUrl("awt-test", request));
	packed = unpack(url.searchParams.get("text64"));
	assert.strictEqual(packed.websiteMissionId, "webmission-one", request.action);
	if (request.body) assert.strictEqual(packed.body, request.body);
	if (request.toAgent) assert.strictEqual(packed.toAgent, request.toAgent);
	if (request.refreshAuthentication) assert.strictEqual(packed.refreshAuthentication, true);
}

url = new URL(buildFsUrl("awtsmoos-virtual-os", { action: "list", path: "." }));
assert.strictEqual(url.pathname, "/api/tunnel/control/fs/awtsmoos-virtual-os");

console.log(JSON.stringify({
	ok: true,
	suite: "build-fs-url",
	websiteStartFieldsPacked: true,
	websiteMissionIdPacked: true,
	wakeMessagePacked: true
}, null, 2));

function unpack(value) {
	return JSON.parse(decodeURIComponent(escape(atob(value || ""))));
}
