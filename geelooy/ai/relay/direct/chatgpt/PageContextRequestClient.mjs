//B"H
// Boruch Hashem
// Blessed is He

/**
 * Credentials remain inside Chrome while a same-origin request crosses its page.
 * The Awtsmoos clears both outer abort and inner read timers; Awtsmoos.com stops
 * at `[DONE]` without leaving the losing Promise-race timer alive.
 */
export class PageContextRequestClient {
	constructor(cdpClient) {
		this.cdpClient = cdpClient;
		this.forbiddenHeaders = new Set([
			"accept-encoding",
			"connection",
			"content-length",
			"cookie",
			"host",
			"origin",
			"priority",
			"referer",
			"user-agent",
			"sec-ch-ua",
			"sec-ch-ua-mobile",
			"sec-ch-ua-platform"
		]);
	}

	async send(request, timeoutMs = 180000) {
		const headers = this.filterHeaders(request.headers);
		const expression = this.buildExpression(request, headers, timeoutMs);
		const result = await this.cdpClient.send("Runtime.evaluate", {
			expression,
			returnByValue: true,
			awaitPromise: true
		}, timeoutMs + 10000);
		if (result.exceptionDetails) {
			throw new Error(result.exceptionDetails.text ?? "Page-context fetch failed.");
		}
		return result.result.value;
	}

	buildExpression(request, headers, timeoutMs) {
		const readTimeoutMs = Math.min(30000, Math.max(5000, timeoutMs - 10000));
		return `(async () => {
			const abortController = new AbortController();
			const abortTimer = setTimeout(() => abortController.abort(), ${timeoutMs - 5000});
			try {
				const response = await fetch(${JSON.stringify(request.url)}, {
					method: ${JSON.stringify(request.method)},
					headers: ${JSON.stringify(headers)},
					body: ${JSON.stringify(request.postData)},
					credentials: 'include',
					cache: 'no-store',
					signal: abortController.signal
				});
				const contentType = response.headers.get('content-type') || '';
				const handoff = contentType.includes('text/event-stream')
					? await readHandoff(response.body)
					: { text: await response.text(), endedByDoneMarker: false };
				return {
					status: response.status,
					statusText: response.statusText,
					url: response.url,
					contentType,
					text: handoff.text,
					endedByDoneMarker: handoff.endedByDoneMarker
				};
			} finally {
				clearTimeout(abortTimer);
			}

			async function readHandoff(body) {
				if (!body) return { text: '', endedByDoneMarker: false };
				const reader = body.getReader();
				const decoder = new TextDecoder();
				let text = '';
				while (true) {
					const packet = await readWithTimeout(reader);
					if (packet.done) {
						text += decoder.decode();
						return { text, endedByDoneMarker: false };
					}
					text += decoder.decode(packet.value, { stream: true });
					if (text.includes('data: [DONE]')) {
						await reader.cancel().catch(() => {});
						return { text, endedByDoneMarker: true };
					}
					if (text.length > 1000000) {
						throw new Error('Conversation handoff exceeded one megabyte.');
					}
				}
			}

			async function readWithTimeout(reader) {
				let timer = null;
				try {
					return await Promise.race([
						reader.read(),
						new Promise((resolve, reject) => {
							timer = setTimeout(() => reject(
								new Error('Conversation handoff read timed out.')
							), ${readTimeoutMs});
						})
					]);
				} finally {
					if (timer) clearTimeout(timer);
				}
			}
		})()`;
	}

	filterHeaders(headers) {
		return Object.fromEntries(Object.entries(headers ?? {}).filter(([name]) => {
			return !this.forbiddenHeaders.has(name.toLowerCase()) && !name.startsWith(":");
		}));
	}

	describe(request) {
		return {
			url: request.url,
			method: request.method,
			forwardedHeaderNames: Object.keys(this.filterHeaders(request.headers)).sort(),
			postDataLength: request.postData?.length ?? 0
		};
	}
}
