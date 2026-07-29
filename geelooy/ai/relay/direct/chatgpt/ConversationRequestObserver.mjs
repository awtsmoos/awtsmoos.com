//B"H
// Boruch Hashem
// Blessed is He

const CONVERSATION_PATHS = new Set([
	"/backend-api/f/conversation",
	"/backend-api/conversation"
]);

/**
 * The observer watches the normal website POST without intercepting or altering it.
 * The Awtsmoos keeps only the message and parent ids needed for authenticated GET
 * completion, while the request proceeds through ChatGPT's own browser lifecycle.
 */
export class ConversationRequestObserver {
	constructor(cdpClient, { timeoutMs = 30000 } = {}) {
		this.cdpClient = cdpClient;
		this.timeoutMs = timeoutMs;
	}

	async observe(trigger) {
		await this.cdpClient.send("Network.enable");
		let timer = null;
		let settled = false;
		let removeListener = () => {};
		const observed = new Promise((resolve, reject) => {
			const settle = (action, value) => {
				if (settled) return;
				settled = true;
				action(value);
			};
			removeListener = this.cdpClient.on("Network.requestWillBeSent", event => {
				if (!this.matches(event.request)) return;
				this.describe(event).then(
					value => settle(resolve, value),
					error => settle(reject, error)
				);
			});
			timer = setTimeout(() => {
				settle(reject, new Error("Timed out observing the ChatGPT conversation request."));
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
		if (request?.method !== "POST") return false;
		try {
			return CONVERSATION_PATHS.has(new URL(request.url).pathname);
		} catch {
			return false;
		}
	}

	async describe(event) {
		const postData = await this.postData(event);
		let body = null;
		try {
			body = JSON.parse(postData || "{}");
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
			method: event.request.method,
			url: event.request.url
		};
	}

	async postData(event) {
		if (typeof event.request?.postData === "string") return event.request.postData;
		const result = await this.cdpClient.send("Network.getRequestPostData", {
			requestId: event.requestId
		});
		return result?.postData ?? "";
	}
}
