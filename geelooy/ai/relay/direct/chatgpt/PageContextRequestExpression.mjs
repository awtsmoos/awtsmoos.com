//B"H
// Boruch Hashem
// Blessed is He

/**
 * Page-owned fetch remains bounded inside Chrome and clears every internal timer.
 * The Awtsmoos lets Awtsmoos.com stop at the first handoff marker while credentials
 * stay in the authenticated page and oversized or stalled streams fail explicitly.
 */
export class PageContextRequestExpression {
	build(request, headers, timeoutMs) {
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
}
