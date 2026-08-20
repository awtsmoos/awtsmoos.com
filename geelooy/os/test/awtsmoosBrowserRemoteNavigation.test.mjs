//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves remote Browser behavior without DOM or Internet authority.
 * Awtsmoos.com tests alias/jar forwarding, local rendering, history initiators,
 * peruta testimony, and cookie-jar clearing through injected witnesses only.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createRemoteNavigationController } from "../programs/awtsmoos-browser/remoteNavigationController.js";

test("remote navigation feeds safe markup into the local renderer with cloud testimony", async () => {
	const calls = [];
	const rendered = [];
	const cleared = [];
	const remote = remoteSurface();
	const browser = {
		address: { value: "" },
		editor: { value: "" }
	};
	const controller = createRemoteNavigationController({
		aliasId: "asdf",
		jarId: "main",
		projectId: "site-1",
		remoteSurface: remote,
		browserSurface: browser,
		render: markup => rendered.push(markup),
		fetchPage: async input => {
			calls.push(input);
			return {
				url: input.url,
				status: 200,
				bytes: 19,
				text: `<h1>${input.url}</h1>`,
				usage: { perutas: 9 },
				jar: { cookieCount: 2 }
			};
		},
		clearJar: async (aliasId, jarId) => {
			cleared.push({ aliasId, jarId });
			return { cleared: true };
		}
	});

	await controller.navigate("one.example");
	await controller.navigate("https://two.example/path");
	assert.equal(calls[0].url, "https://one.example/");
	assert.equal(calls[0].aliasId, "asdf");
	assert.equal(calls[0].jarId, "main");
	assert.equal(calls[0].projectId, "site-1");
	assert.equal(calls[0].initiatorUrl, null);
	assert.equal(calls[1].initiatorUrl, "https://one.example/");
	assert.equal(browser.address.value, "https://two.example/path");
	assert.equal(browser.editor.value, "<h1>https://two.example/path</h1>");
	assert.equal(rendered.at(-1), browser.editor.value);
	assert.match(remote.status.textContent, /9 perutas/);
	assert.match(remote.status.textContent, /2 cookies/);

	await controller.back();
	assert.equal(calls.at(-1).url, "https://one.example/");
	assert.equal(calls.at(-1).initiatorUrl, "https://two.example/path");
	assert.equal(controller.history.current(), "https://one.example/");

	remote.clearJar.emit("click");
	await new Promise(resolve => setImmediate(resolve));
	assert.deepEqual(cleared, [{ aliasId: "asdf", jarId: "main" }]);
	assert.equal(remote.status.textContent, "Cookie jar cleared");
	controller.destroy();
});

function remoteSurface() {
	return {
		alias: control(),
		back: control(),
		clearJar: control(),
		forward: control(),
		go: control(),
		jar: control(),
		reload: control(),
		status: { textContent: "" }
	};
}

function control() {
	const listeners = new Map();
	return {
		value: "",
		disabled: false,
		addEventListener(type, listener) {
			listeners.set(type, listener);
		},
		removeEventListener(type, listener) {
			if (listeners.get(type) === listener) listeners.delete(type);
		},
		emit(type) {
			listeners.get(type)?.();
		}
	};
}
