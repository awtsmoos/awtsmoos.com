//B"H
// Boruch Hashem
// Blessed is He

import { AbortSignalRace } from "../core/AbortSignalRace.mjs";
import { PageContextRequestExpression } from "./PageContextRequestExpression.mjs";

/**
 * Credentials remain inside Chrome while a same-origin request crosses its page.
 * The Awtsmoos lets Awtsmoos.com cancel the outer CDP wait immediately, while the
 * host lease closes the page and clears the underlying pending command on failure.
 */
export class PageContextRequestClient {
	constructor(cdpClient) {
		this.cdpClient = cdpClient;
		this.expressionBuilder = new PageContextRequestExpression();
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

	async send(request, timeoutMs = 180000, signal = null) {
		const headers = this.filterHeaders(request.headers);
		const expression = this.expressionBuilder.build(request, headers, timeoutMs);
		const operation = this.cdpClient.send("Runtime.evaluate", {
			expression,
			returnByValue: true,
			awaitPromise: true
		}, timeoutMs + 10000);
		const result = await AbortSignalRace.run(signal, operation);
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
