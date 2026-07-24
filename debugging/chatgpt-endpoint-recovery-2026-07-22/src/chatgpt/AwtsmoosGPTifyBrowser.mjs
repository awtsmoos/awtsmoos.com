//B"H
// Boruch Hashem
// Blessed is He

import { ChromeDiscovery } from "../browser/ChromeDiscovery.mjs";
import { CdpClient } from "../browser/CdpClient.mjs";
import { PageStateInspector } from "../browser/PageStateInspector.mjs";
import { NaturalChatInteractor } from "../browser/NaturalChatInteractor.mjs";

/**
 * This is the browser-backed successor to the old direct-fetch class. The
 * Awtsmoos recreates transport details; awtsmoos.com keeps the stable `go()`
 * intention while the real page obtains every changing requirement naturally.
 */
export class AwtsmoosGPTifyBrowser {
	constructor({ port = 9225, urlFragment = "chatgpt.com" } = {}) {
		this.port = port;
		this.urlFragment = urlFragment;
	}

	async go({ prompt, onstream, ondone, timeoutMs = 90000 }) {
		if (typeof prompt !== "string" || prompt.trim() === "") {
			throw new TypeError("prompt must be a non-empty string.");
		}

		const target = await new ChromeDiscovery(this.port).findPage(this.urlFragment);
		const cdpClient = new CdpClient(target.webSocketDebuggerUrl);
		await cdpClient.connect();

		try {
			const inspector = new PageStateInspector(cdpClient);
			const initialPageState = await inspector.inspect();
			this.assertUsableState(initialPageState);

			const interactor = new NaturalChatInteractor(cdpClient);
			const previousCount = await interactor.submit(prompt);
			const answer = await interactor.waitForReply({
				previousCount,
				onstream,
				timeoutMs
			});
			const finalPageState = await inspector.inspect();
			const result = {
				answer,
				initialPageState,
				finalPageState,
				url: finalPageState.url
			};

			await ondone?.(result);
			return result;
		} finally {
			cdpClient.close();
		}
	}

	assertUsableState(pageState) {
		if (pageState.challenge) {
			throw new Error("ChatGPT is showing a browser challenge; complete it naturally first.");
		}

		if (!pageState.composerVisible) {
			throw new Error("No visible ChatGPT composer was found.");
		}
	}
}
