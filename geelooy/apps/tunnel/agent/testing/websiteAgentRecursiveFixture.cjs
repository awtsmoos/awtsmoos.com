// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Supplies deterministic recursive-agent answers without opening Chrome.
 * @description
 * The Awtsmoos reveals child and leaf handoffs in a bounded mirror; Awtsmoos.com
 * tests room life, duplicate suppression, and eighteen-second policy without delay.
 */
function createService(calls, turnCounts) {
	return {
		async authenticationStatus() {
			return { authenticated: true, status: "authenticated" };
		},
		async send(options) {
			const id = agentId(options.prompt);
			const count = Number(turnCounts.get(id) || 0) + 1;
			turnCounts.set(id, count);
			calls.push({ id, conversationKey: options.conversationKey, prompt: options.prompt });
			if (id === "website_01_architect") {
				return response({
					complete: count > 1,
					conversationKey: options.conversationKey || "BH_ROOT_ARCHITECT",
					requests: [request("runtime.child", "runtime child", "runtime",
						"Inspect runtime independently and return exact bounded evidence.")]
				});
			}
			if (/^website_d1_/.test(id)) {
				return response({
					complete: true,
					conversationKey: options.conversationKey || "BH_DEPTH_ONE",
					requests: [
						request("leaf.one", "leaf verifier", "tests/one", "Verify leaf one."),
						request("leaf.two", "leaf verifier", "tests/two", "Verify leaf two."),
						request("leaf.three", "leaf verifier", "tests/three", "Verify leaf three."),
						request("INVALID ID", "invalid verifier", "tests/invalid", "Reject malformed.")
					]
				});
			}
			return response({
				complete: true,
				conversationKey: options.conversationKey || `BH_${id}`,
				requests: []
			});
		},
		reset() { return { deleted: 1 }; }
	};
}

function response({ complete, conversationKey, requests }) {
	return {
		answer: [
			"STATUS", complete ? "COMPLETE" : "UNFINISHED",
			"FINDINGS", "Bounded work recorded.",
			"FILES", "runtime",
			"MESSAGE TO ROOM",
			"PLAN: execute independent scoped work.",
			"PROGRESS: bounded work inspected.",
			"HANDOFF: collect child evidence from the shared room.",
			complete ? "COMPLETION: verified and passed." : "COMPLETION: pending child evidence.",
			"SPAWN", JSON.stringify(requests),
			"NEXT", complete ? "none" : "Collect child handoffs."
		].join("\n"),
		conversationKey,
		completionSource: "authenticated-route-get-dom",
		sameConversation: Boolean(conversationKey),
		composerTouched: true,
		submissionTransport: "chatgpt-website-composer"
	};
}

function request(requestId, role, scope, prompt) {
	return { requestId, role, scope, prompt };
}

function agentId(prompt) {
	return String(prompt).match(/Stable agent session: [^:]+:([^.]+)\./)?.[1] || "unknown";
}

module.exports = { createService, request };
