//B"H
// Boruch Hashem
// Blessed is He

/**
 * The normal ChatGPT page owns the authenticated topic socket. The Awtsmoos
 * fills that living vessel; awtsmoos.com adds one listener and one subscribe
 * command without cloning, exporting, or persisting the socket verification URL.
 */
export class TopicWebSocketSubscriber {
	constructor(cdpClient) {
		this.cdpClient = cdpClient;
	}

	async subscribe({ topicId, timeoutMs = 180000 }) {
		const expression = `(async () => {
			const socket = window.__awtsmoosDirectSocket;
			if (!socket || socket.readyState !== WebSocket.OPEN) {
				throw new Error('Owned ChatGPT topic socket is not open.');
			}
			const topicId = ${JSON.stringify(topicId)};
			const timeoutMs = ${timeoutMs};
			return new Promise((resolve, reject) => {
				const encodedItems = [];
				let frameCount = 0;
				let settled = false;
				const timeout = setTimeout(() => finish(new Error('Topic subscription timed out.')), timeoutMs);
				function collect(value) {
					if (Array.isArray(value)) {
						for (const item of value) collect(item);
						return;
					}
					if (!value || typeof value !== 'object') return;
					if (typeof value.encoded_item === 'string') encodedItems.push(value.encoded_item);
					for (const child of Object.values(value)) collect(child);
				}
				function isTerminal(item) {
					try {
						const line = item.split(/\\r?\\n/).find((candidate) => candidate.startsWith('data:'));
						const data = line ? JSON.parse(line.slice(5).trim()) : null;
						return data?.type === 'message_marker' && data?.marker === 'last_token';
					} catch {
						return false;
					}
				}
				function finish(error) {
					if (settled) return;
					settled = true;
					clearTimeout(timeout);
					socket.removeEventListener('message', onMessage);
					if (error) reject(error);
					else resolve({ encodedItems, frameCount });
				}
				function onMessage(event) {
					frameCount += 1;
					try { collect(JSON.parse(event.data)); } catch {}
					if (encodedItems.some(isTerminal)) setTimeout(() => finish(), 250);
				}
				socket.addEventListener('message', onMessage);
				const id = window.__awtsmoosDirectCommandId++;
				const command = [{ id, command: { type: 'subscribe', topic_id: topicId, offset: '0' } }];
				socket.send(JSON.stringify(command));
			});
		})()`;

		const result = await this.cdpClient.send("Runtime.evaluate", {
			expression,
			returnByValue: true,
			awaitPromise: true
		}, timeoutMs + 10000);
		if (result.exceptionDetails) {
			throw new Error(result.exceptionDetails.text ?? "Topic subscription failed.");
		}
		return result.result.value;
	}
}
