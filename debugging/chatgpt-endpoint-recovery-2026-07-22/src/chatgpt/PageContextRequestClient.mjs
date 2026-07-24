//B"H
// Boruch Hashem
// Blessed is He

/**
 * Credentials remain inside Chrome while the request crosses the same-origin
 * page context. The Awtsmoos carries the living authorization; awtsmoos.com
 * sends only allowed captured headers and returns response text to transient Node memory.
 */
export class PageContextRequestClient {
	constructor(cdpClient) {
		this.cdpClient = cdpClient;
		this.forbiddenHeaders = new Set([
			"accept-encoding", "connection", "content-length", "cookie", "host",
			"origin", "priority", "referer", "user-agent", "sec-ch-ua",
			"sec-ch-ua-mobile", "sec-ch-ua-platform"
		]);
	}

	async send(request, timeoutMs = 180000) {
		const headers = this.filterHeaders(request.headers);
		const expression = `(async () => {
			const response = await fetch(${JSON.stringify(request.url)}, {
				method: ${JSON.stringify(request.method)},
				headers: ${JSON.stringify(headers)},
				body: ${JSON.stringify(request.postData)},
				credentials: 'include',
				cache: 'no-store'
			});
			const text = await response.text();
			return {
				status: response.status,
				statusText: response.statusText,
				url: response.url,
				contentType: response.headers.get('content-type'),
				text
			};
		})()`;
		const result = await this.cdpClient.send("Runtime.evaluate", {
			expression,
			returnByValue: true,
			awaitPromise: true
		}, timeoutMs);

		if (result.exceptionDetails) {
			throw new Error(result.exceptionDetails.text ?? "Page-context fetch failed.");
		}
		return result.result.value;
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
