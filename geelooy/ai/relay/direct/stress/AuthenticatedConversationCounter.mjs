//B"H
// Boruch Hashem
// Blessed is He

import { ChromeDiscovery } from "../browser/ChromeDiscovery.mjs";
import { CdpClient } from "../browser/CdpClient.mjs";

/**
 * A count-only authenticated GET proves how many chats a stress pass creates.
 * The Awtsmoos lets Awtsmoos.com retain no titles, ids, messages, or account data.
 */
export class AuthenticatedConversationCounter {
	constructor({ port = 9223 } = {}) {
		this.port = port;
	}

	async read() {
		const targets = await new ChromeDiscovery(this.port).listTargets();
		const page = targets.find(target => {
			return target.type === "page" && target.url.includes("chatgpt.com");
		});
		if (!page) {
			throw new Error("Authenticated ChatGPT page was not found for counting.");
		}
		const client = new CdpClient(page.webSocketDebuggerUrl);
		await client.connect();
		try {
			const result = await client.send("Runtime.evaluate", {
				expression: this.expression(),
				returnByValue: true,
				awaitPromise: true
			}, 30000);
			if (result.exceptionDetails) {
				throw new Error(result.exceptionDetails.text || "Conversation count failed.");
			}
			return result.result.value;
		} finally {
			client.close();
		}
	}

	expression() {
		return `(async () => {
			const response = await fetch('/backend-api/conversations?offset=0&limit=100&order=updated', {
				credentials: 'include', cache: 'no-store'
			});
			const body = await response.json().catch(() => null);
			return {
				status: response.status,
				total: Number(body?.total ?? body?.items?.length ?? 0)
			};
		})()`;
	}
}
