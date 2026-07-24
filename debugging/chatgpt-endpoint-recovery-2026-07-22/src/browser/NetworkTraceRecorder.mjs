//B"H
// Boruch Hashem
// Blessed is He

import { isChatGptUrl } from "../config/endpointCatalog.mjs";
import { RequestBodyDecoder } from "../capture/RequestBodyDecoder.mjs";

/**
 * Every request is a spark crossing a changing vessel. NetworkTraceRecorder
 * lets awtsmoos.com retain method, route, headers, body shape, and status while
 * the Awtsmoos conceals credentials and leaves response rendering to Chrome.
 */
export class NetworkTraceRecorder {
	constructor({ cdpClient, writer, redactor, requestPredicate } = {}) {
		this.cdpClient = cdpClient;
		this.writer = writer;
		this.redactor = redactor;
		this.bodyDecoder = new RequestBodyDecoder(redactor);
		this.requestPredicate = requestPredicate ?? this.defaultPredicate;
		this.relevantRequests = new Map();
	}

	async start(durationMs = 30000) {
		await this.writer.initialize();
		this.registerListeners();
		await this.cdpClient.send("Network.enable", { maxPostDataSize: 500000 });
		await this.writer.write({ type: "capture-start", durationMs });
		await new Promise((resolve) => setTimeout(resolve, durationMs));
		await this.writer.write({ type: "capture-stop" });
	}

	defaultPredicate(request) {
		return isChatGptUrl(request.url) && request.method !== "OPTIONS";
	}

	registerListeners() {
		this.cdpClient.on("Network.requestWillBeSent", (event) => {
			void this.onRequest(event);
		});
		this.cdpClient.on("Network.responseReceived", (event) => {
			void this.onResponse(event);
		});
		this.cdpClient.on("Network.loadingFinished", (event) => {
			void this.onFinished(event);
		});
		this.cdpClient.on("Network.loadingFailed", (event) => {
			void this.onFailed(event);
		});
	}

	async onRequest(event) {
		if (!this.requestPredicate(event.request)) {
			return;
		}

		this.relevantRequests.set(event.requestId, event.request.url);
		await this.writer.write({
			type: "request",
			requestId: event.requestId,
			resourceType: event.type,
			request: {
				url: event.request.url,
				method: event.request.method,
				headers: this.redactor.redact(event.request.headers ?? {}),
				body: this.bodyDecoder.decode(event.request),
				postDataLength: event.request.postData?.length ?? 0
			}
		});
	}

	async onResponse(event) {
		if (!this.relevantRequests.has(event.requestId)) {
			return;
		}

		await this.writer.write({
			type: "response",
			requestId: event.requestId,
			response: {
				url: event.response.url,
				status: event.response.status,
				mimeType: event.response.mimeType,
				headers: this.redactor.redact(event.response.headers ?? {})
			}
		});
	}

	async onFinished(event) {
		if (!this.relevantRequests.has(event.requestId)) {
			return;
		}

		await this.writer.write({
			type: "finished",
			requestId: event.requestId,
			encodedDataLength: event.encodedDataLength
		});
		this.relevantRequests.delete(event.requestId);
	}

	async onFailed(event) {
		if (!this.relevantRequests.has(event.requestId)) {
			return;
		}

		await this.writer.write({ type: "failed", ...event });
		this.relevantRequests.delete(event.requestId);
	}
}
