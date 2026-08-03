// B"H
import assert from "assert";
import {
	MultiPassToolAgent,
	AllTunnelRegistry,
	parseFallbackToolCalls
} from "../../central/index.js";

class FakeBridge {
	constructor() {
		this.calls = [];
	}

	schemas() {
		return [{
			type: "function",
			function: { name: "native.read", parameters: { type: "object" } }
		}];
	}

	async call(name, args) {
		this.calls.push({ name, args });
		return { ok: true, name, content: "BH TOOL RESULT" };
	}
}

class CouncilBridge extends FakeBridge {
	schemas() {
		return [
			...super.schemas(),
			{
				type: "function",
				function: { name: "native.agent", parameters: { type: "object" } }
			},
			{
				type: "function",
				function: {
					name: "native.websiteAgentMissionStatus",
					parameters: { type: "object" }
				}
			}
		];
	}

	async call(name, args) {
		this.calls.push({ name, args });
		if (name === "native.agent") {
			return {
				ok: true,
				nonBlocking: true,
				mission: {
					id: args.websiteMissionId,
					missionId: "room-auto",
					status: "running",
					phase: "launching_agents",
					authentication: { status: "authenticated" },
					plan: { agentCount: 12 }
				}
			};
		}
		return { ok: true, name, content: "BH TOOL RESULT" };
	}
}

class TextFallbackClient {
	constructor() {
		this.round = 0;
	}

	async complete() {
		this.round += 1;
		if (this.round === 1) {
			return {
				text: "```json\n{\"awtsmoos_tool_calls\":[{\"name\":\"native.read\",\"arguments\":{\"path\":\"package.json\"}}]}\n```"
			};
		}
		return { text: "Final after fallback tool." };
	}
}

class NativeToolClient {
	constructor() {
		this.round = 0;
	}

	async complete() {
		this.round += 1;
		if (this.round === 1) {
			return {
				text: "",
				json: {
					choices: [{
						message: {
							role: "assistant",
							content: "",
							tool_calls: [{
								id: "call_1",
								function: {
									name: "native.read",
									arguments: "{\"path\":\"package.json\"}"
								}
							}]
						}
					}]
				}
			};
		}
		return { text: "Final after native tool." };
	}
}

class CouncilAwareClient {
	constructor() {
		this.messages = [];
	}

	async complete(options) {
		this.messages = options.messages;
		return { text: "Lead continued without waiting." };
	}
}

async function main() {
	const parsed = parseFallbackToolCalls(
		'{"awtsmoos_tool_calls":[{"name":"native.tree","arguments":{"path":"."}}]}'
	);
	assert.equal(parsed[0].name, "native.tree");

	const bridge = new FakeBridge();
	const fallback = await new MultiPassToolAgent({
		client: new TextFallbackClient(),
		bridge
	}).run({ prompt: "use tool" });
	assert.equal(fallback.ok, true);
	assert.equal(fallback.rounds, 2);
	assert.equal(bridge.calls[0].name, "native.read");

	const bridge2 = new FakeBridge();
	const native = await new MultiPassToolAgent({
		client: new NativeToolClient(),
		bridge: bridge2
	}).run({ prompt: "use native" });
	assert.equal(native.ok, true);
	assert.equal(native.rounds, 2);
	assert.equal(bridge2.calls[0].args.path, "package.json");

	const registry = new AllTunnelRegistry([
		{ id: "native", actions: ["read"], bridge: bridge2 },
		{ id: "editor", actions: ["read"], bridge: bridge2 },
		{ id: "virtualOs", actions: ["snapshot"], bridge: bridge2 }
	]);
	assert.ok(registry.names().includes("virtualOs.snapshot"));
	assert.ok(registry.names().includes("editor.read"));

	const councilBridge = new CouncilBridge();
	const councilClient = new CouncilAwareClient();
	const council = await new MultiPassToolAgent({
		client: councilClient,
		bridge: councilBridge
	}).run({
		messages: [{ role: "user", content: "Fully fix the entire large repository." }],
		missionNamespace: "conversation-one"
	});
	assert.equal(council.ok, true);
	assert.equal(council.websiteMission.ok, true);
	assert.equal(council.websiteMission.agentCount, 12);
	assert.equal(councilBridge.calls[0].name, "native.agent");
	assert.equal(councilBridge.calls[0].args.reuseExisting, true);
	assert.match(councilBridge.calls[0].args.websiteMissionId, /^webauto_/);
	assert.ok(councilClient.messages.some(message =>
		message.role === "system" && /specialists are visible in Tunnel Control/.test(message.content)
	));
	assert.equal(council.text, "Lead continued without waiting.");

	console.log(JSON.stringify({
		ok: true,
		tests: 5,
		names: registry.names(),
		autoWebsiteCouncil: true,
		leadNonBlocking: true,
		idempotentMissionKey: councilBridge.calls[0].args.websiteMissionId
	}, null, 2));
}

main().catch(error => {
	console.error(JSON.stringify({
		ok: false,
		error: error.message,
		stack: error.stack
	}, null, 2));
	process.exit(1);
});
