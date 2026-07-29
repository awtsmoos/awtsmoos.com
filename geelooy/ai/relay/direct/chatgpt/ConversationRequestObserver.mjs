//B"H
// Boruch Hashem
// Blessed is He

/**
 * The observer watches the normal website POST without intercepting or altering it.
 * The Awtsmoos keeps only the message and parent ids needed for authenticated GET
 * completion, while the request proceeds through ChatGPT's own browser lifecycle.
 */
export class ConversationRequestObserver {
	constructor(cdpClient, {
		endpoint = "https://chatgpt.com/backend-api/f/conversation",
		timeoutMs = 30000
	} = {}) {
		this.cdpClient = cdpClient;
		this.endpoint = endpoint;
		this.timeoutMs = timeoutMs;
	}

	async observe(trigger) {
		await this.cdpClient.send("Network.enable");
		let timer = null;
		let removeListener = () => {};
		const observed = new Promise((resolve, reject) => {
			removeListener = this.cdpClient.on("Network.requestWillBeSent", event => {
				if (!this.matches(event.request)) return;
				try {
					resolve(this.describe(event.request));
				} catch (error) {
					reject(error);
				}
			});
			timer = setTimeout(() => {
				reject(new Error("Timed out observing the ChatGPT conversation request."));
			}, this.timeoutMs);
		});
		try {
			await trigger();
			return await observed;
		} finally {
			clearTimeout(timer);
			removeListener();
		}
	}

	matches(request) {
		return request?.method === "POST"
			&& request.url?.split("?")[0] === this.endpoint;
	}

	describe(request) {
		let body = null;
		try {
			body = JSON.parse(request.postData || "{}");
		} catch {
			throw new Error("ChatGPT created an unreadable conversation request.");
		}
		const message = body?.messages?.[0];
		if (typeof message?.id !== "string") {
			throw new Error("ChatGPT conversation request omitted the user message id.");
		}
		return {
			userMessageId: message.id,
			parentMessageId: body.parent_message_id ?? null,
			conversationId: body.conversation_id ?? null,
			method: request.method,
			url: request.url
		};
	}
}
