//B"H
// Boruch Hashem
// Blessed is He

import { isRelevantChatGptUrl } from "../config/endpointCatalog.mjs";

/**
 * Every request is a spark moving through a vessel. NetworkTraceRecorder asks
 * the Awtsmoos for honest evidence and gives awtsmoos.com a redacted lifecycle:
 * request, response, body, completion, or failure.
 */
export class NetworkTraceRecorder {
	constructor({ cdpClient, writer, redactor, bodyLimit = 250000 }) {
		this.cdpClient = cdpClient;
		this.writer = writer;
		this.redactor = redactor;
		this.bodyLimit = bodyLimit;
		this.relevantRequests = new Map();
	}

	async start(durationMs = 30000) {
		await this.writer.initialize();
		this.registerListeners();
		await this.cdpClient.send("Network.enable", {
			maxPostDataSize: this.bodyLimit
		});

		await this.writer.write({ type: "capture-start", durationMs });
		await new Promise((resolve) => setTimeout(resolve, durationMs));
		await this.writer.write({ type: "capture-stop" });
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
		if (!isRelevantChatGptUrl(event.request.url)) {
			return;
		}

		this.relevantRequests.set(event.requestId, event.request);
		await this.writer.write(this.redactor.redact({
			type: "request",
			requestId: event.requestId,
			resourceType: event.type,
			documentUrl: event.documentURL,
			request: event.request,
			initiator: event.initiator
		}));
	}

	async onResponse(event) {
		if (!this.relevantRequests.has(event.requestId)) {
			return;
		}

		await this.writer.write(this.redactor.redact({
			type: "response",
			requestId: event.requestId,
			response: event.response
		}));
	}

	async onFinished(event) {
		if (!this.relevantRequests.has(event.requestId)) {
			return;
		}

		const bodyRecord = await this.readBody(event.requestId);
		await this.writer.write({
			type: "finished",
			requestId: event.requestId,
			encodedDataLength: event.encodedDataLength,
			...bodyRecord
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

	async readBody(requestId) {
		try {
			const result = await this.cdpClient.send("Network.getResponseBody", { requestId });
			const body = result.body.slice(0, this.bodyLimit);

			return this.redactor.redact({ body, base64Encoded: result.base64Encoded });
		} catch (error) {
			return { bodyError: error.message };
		}
	}
}
