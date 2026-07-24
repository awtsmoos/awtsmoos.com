//B"H
// Boruch Hashem
// Blessed is He

/**
 * The normal page owns the authenticated topic socket. If one read window misses
 * completion, the Awtsmoos safely re-subscribes to the same existing topic from
 * offset zero; awtsmoos.com never repeats the conversation POST or mutates state.
 */
export class TopicWebSocketSubscriber {
	constructor(cdpClient, { maximumAttempts = 3 } = {}) {
		this.cdpClient = cdpClient;
		this.maximumAttempts = maximumAttempts;
	}

	async subscribe({ topicId, timeoutMs = 180000 }) {
		const attemptTimeoutMs = Math.max(5000, Math.floor(timeoutMs / this.maximumAttempts));
		const expression = this.buildExpression({ topicId, attemptTimeoutMs });
		const result = await this.cdpClient.send("Runtime.evaluate", {
			expression,
			returnByValue: true,
			awaitPromise: true
		}, timeoutMs + 15000);

		if (result.exceptionDetails) {
			throw new Error(result.exceptionDetails.text ?? "Topic subscription failed.");
		}
		return result.result.value;
	}

	buildExpression({ topicId, attemptTimeoutMs }) {
		return `(async () => {
			const socket = window.__awtsmoosDirectSocket;
			if (!socket || socket.readyState !== WebSocket.OPEN) {
				throw new Error('Owned ChatGPT topic socket is not open.');
			}
			const topicId = ${JSON.stringify(topicId)};
			const maximumAttempts = ${this.maximumAttempts};
			const attemptTimeoutMs = ${attemptTimeoutMs};
			let totalFrameCount = 0;

			for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
				const result = await new Promise(resolve => {
					const encodedItems = [];
					let settled = false;
					const timeout = setTimeout(() => finish(false), attemptTimeoutMs);
					function collect(value) {
						if (Array.isArray(value)) {
							for (const item of value) collect(item);
							return;
						}
						if (!value || typeof value !== 'object') return;
						if (typeof value.encoded_item === 'string') encodedItems.push(value.encoded_item);
						for (const child of Object.values(value)) collect(child);
					}
					function terminal(item) {
						try {
							const line = item.split(/\\r?\\n/).find(candidate => candidate.startsWith('data:'));
							const data = line ? JSON.parse(line.slice(5).trim()) : null;
							return data?.type === 'message_marker' && data?.marker === 'last_token';
						} catch {
							return false;
						}
					}
					function finish(completed) {
						if (settled) return;
						settled = true;
						clearTimeout(timeout);
						socket.removeEventListener('message', onMessage);
						resolve({ completed, encodedItems });
					}
					function onMessage(event) {
						totalFrameCount += 1;
						try { collect(JSON.parse(event.data)); } catch {}
						if (encodedItems.some(terminal)) setTimeout(() => finish(true), 250);
					}
					socket.addEventListener('message', onMessage);
					const id = window.__awtsmoosDirectCommandId++;
					socket.send(JSON.stringify([{ id, command: {
						type: 'subscribe', topic_id: topicId, offset: '0'
					} }]));
				});

				if (result.completed) {
					return {
						encodedItems: result.encodedItems,
						frameCount: totalFrameCount,
						subscriptionAttempts: attempt
					};
				}
			}
			throw new Error('Topic subscription timed out after safe replay attempts.');
		})()`;
	}
}
