// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { AuthenticatedSocketController } from "../relay/direct/browser/AuthenticatedSocketController.mjs";

const customUrl = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

test("owned socket is verified on the custom GPT before readiness", async () => {
	const order = [];
	const client = { connect: async () => order.push("connect") };
	const controller = new AuthenticatedSocketController({
		port: 9224,
		agentStartUrl: customUrl,
		targetSelector: {
			acquire: async () => ({
				target: { id: "owned", webSocketDebuggerUrl: "ws://owned" },
				owned: true,
				source: "created-owned-final-url"
			})
		},
		clientFactory: () => client,
		navigation: {
			ensure: async (_client, url) => {
				order.push("navigate-verify");
				assert.equal(url, customUrl);
				return { url, navigated: false, verified: true };
			}
		},
		inspectorFactory: () => ({ inspect: async () => ({
			authenticated: true,
			composerVisible: true,
			url: customUrl
		}) }),
		lifecycle: {
			activate: async () => order.push("activate"),
			waitUntilReady: async inspector => {
				order.push("ready");
				return inspector.inspect();
			},
			close: async () => ({ closed: true, verified: true })
		}
	});
	const host = await controller.open(1000);
	assert.deepEqual(order, ["connect", "activate", "navigate-verify", "ready"]);
	assert.equal(host.navigation.url, customUrl);
	assert.equal(host.pageState.composerVisible, true);
});

test("navigation failure closes the exact owned target", async () => {
	let closed = 0;
	const controller = new AuthenticatedSocketController({
		targetSelector: { acquire: async () => ({
			target: { id: "owned", webSocketDebuggerUrl: "ws://owned" },
			owned: true,
			source: "created-owned-final-url"
		}) },
		clientFactory: () => ({ connect: async () => undefined }),
		navigation: { ensure: async () => { throw new Error("about_blank_navigation_timeout"); } },
		lifecycle: {
			activate: async () => undefined,
			close: async () => { closed += 1; return { closed: true, verified: true }; }
		}
	});
	await assert.rejects(() => controller.open(1000), /about_blank_navigation_timeout/);
	assert.equal(closed, 1);
});
