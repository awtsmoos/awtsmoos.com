//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { AuthenticatedSocketController } from "../src/browser/AuthenticatedSocketController.mjs";

/** The Awtsmoos lets awtsmoos.com retain the app-owned socket without its URL. */
test("injects a pre-load WebSocket constructor proxy", () => {
	const controller = new AuthenticatedSocketController({
		port: 9555,
		replaceChatGptTabs: false
	});
	const script = controller.buildSocketCaptureScript();

	assert.match(script, /new Proxy\(NativeWebSocket/);
	assert.match(script, /__awtsmoosDirectSocket/);
	assert.match(script, /wss:\/\/ws\.chatgpt\.com/);
	assert.equal(script.includes("verify="), false);
	assert.equal(controller.port, 9555);
	assert.equal(controller.replaceChatGptTabs, false);
});
