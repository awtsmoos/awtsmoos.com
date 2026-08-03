// B"H

import { AbortSignalRace } from "../core/AbortSignalRace.mjs";

/**
 * Current ChatGPT conversation routes load through an authenticated document GET
 * and expose completed turns as ordinary DOM nodes. This reader never evaluates
 * page script, reads cookies, or submits a message; it observes only the requested
 * conversation after navigating the already-owned tab to its canonical GET route.
 */
export class ConversationDomPoller {
	constructor(cdpClient, {
		intervalMs = 1000,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		now = () => Date.now()
	} = {}) {
		this.cdpClient = cdpClient;
		this.intervalMs = Math.max(500, intervalMs);
		this.sleep = sleep;
		this.now = now;
	}

	async poll({ conversationId, userMessageId = null, previousParentMessageId = null,
		timeoutMs = 180000, signal = null } = {}) {
		if (!conversationId) throw new TypeError("conversationId is required for DOM polling.");
		await this.navigate(conversationId);
		const deadline = this.now() + timeoutMs;
		let pollCount = 0;
		let lastTransientError = null;
		while (this.now() < deadline) {
			this.assertNotAborted(signal);
			pollCount += 1;
			let state = null;
			try {
				state = await this.inspect({ userMessageId, previousParentMessageId });
				lastTransientError = null;
			} catch (error) {
				if (!this.transient(error)) throw error;
				lastTransientError = error;
			}
			if (state?.done) {
				return {
					...state,
					conversationId,
					pollCount,
					status: 200,
					itemCount: state.messageCount
				};
			}
			await AbortSignalRace.run(signal, this.sleep(this.intervalMs));
		}
		const error = new Error("Authenticated conversation DOM polling timed out.");
		if (lastTransientError) error.cause = lastTransientError;
		throw error;
	}

	async navigate(conversationId) {
		const target = await this.cdpClient.send("Target.getTargetInfo", {}, 10000);
		const wanted = `https://chatgpt.com/c/${encodeURIComponent(conversationId)}`;
		if (String(target.targetInfo?.url || "").split(/[?#]/)[0] === wanted) {
			await this.cdpClient.send("Page.reload", { ignoreCache: true }, 20000);
			return;
		}
		try {
			await this.cdpClient.send("Page.navigate", { url: wanted }, 20000);
		} catch (error) {
			if (!this.transient(error)) throw error;
		}
	}

	async inspect({ userMessageId, previousParentMessageId }) {
		const document = await this.cdpClient.send("DOM.getDocument", {
			depth: 1,
			pierce: true
		}, 20000);
		const root = document.root?.nodeId;
		if (!root) return { done: false };
		const users = await this.nodes(root, '[data-message-author-role="user"][data-message-id]');
		const assistants = await this.nodes(root, '[data-message-author-role="assistant"][data-message-id]');
		if (!assistants.length) return { done: false };
		const userIds = await this.ids(users);
		const assistantIds = await this.ids(assistants);
		// ChatGPT may rewrite the creation-turn user id after accepting the normal
		// website POST. The unique conversation route and assistant lineage remain
		// authoritative; a rewritten visible user id must not hide a completed turn.
		if (previousParentMessageId && !assistantIds.includes(previousParentMessageId)) {
			return { done: false };
		}
		const latest = assistants.at(-1);
		const parentMessageId = assistantIds.at(-1);
		if (!parentMessageId || parentMessageId === previousParentMessageId) return { done: false };
		if (await this.stopVisible(root)) return { done: false };
		const terminal = await this.cdpClient.send("DOM.querySelector", {
			nodeId: latest,
			selector: "[data-is-last-node]"
		}, 10000).catch(() => ({ nodeId: 0 }));
		if (!terminal.nodeId) return { done: false };
		const html = await this.cdpClient.send("DOM.getOuterHTML", { nodeId: latest }, 20000);
		const answer = this.text(html.outerHTML);
		return {
			done: Boolean(answer),
			answer,
			parentMessageId,
			messageCount: users.length + assistants.length,
			userMessageObserved: !userMessageId || userIds.includes(userMessageId)
		};
	}

	async nodes(root, selector) {
		const result = await this.cdpClient.send("DOM.querySelectorAll", {
			nodeId: root,
			selector
		}, 20000);
		return result.nodeIds || [];
	}

	async ids(nodes) {
		const ids = [];
		for (const nodeId of nodes) {
			const result = await this.cdpClient.send("DOM.getAttributes", { nodeId }, 10000);
			const attributes = result.attributes || [];
			const index = attributes.indexOf("data-message-id");
			ids.push(index >= 0 ? attributes[index + 1] : "");
		}
		return ids;
	}

	async stopVisible(root) {
		const result = await this.cdpClient.send("DOM.querySelector", {
			nodeId: root,
			selector: 'button[data-testid="stop-button"]'
		}, 10000).catch(() => ({ nodeId: 0 }));
		if (!result.nodeId) return false;
		const box = await this.cdpClient.send("DOM.getBoxModel", {
			nodeId: result.nodeId
		}, 10000).catch(() => null);
		return Boolean(box?.model);
	}

	text(html) {
		return String(html || "")
			.replace(/<br\s*\/?>/gi, "\n")
			.replace(/<\/(?:p|div|li|h[1-6])>/gi, "\n")
			.replace(/<[^>]+>/g, "")
			.replaceAll("&quot;", '"')
			.replaceAll("&#x27;", "'")
			.replaceAll("&#39;", "'")
			.replaceAll("&lt;", "<")
			.replaceAll("&gt;", ">")
			.replaceAll("&nbsp;", " ")
			.replaceAll("&amp;", "&")
			.replace(/\n{3,}/g, "\n\n")
			.trim();
	}

	assertNotAborted(signal) {
		if (signal?.aborted) throw signal.reason || new Error("DOM polling was cancelled.");
	}

	transient(error) {
		return /timeout|node with given id|box model|execution context|frame was detached|document/i
			.test(String(error?.message || error));
	}
}
