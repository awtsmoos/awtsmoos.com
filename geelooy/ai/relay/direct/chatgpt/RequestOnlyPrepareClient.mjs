//B"H
// Boruch Hashem
// Blessed is He

import { randomUUID } from "node:crypto";
import { PageContextRequestClient } from "./PageContextRequestClient.mjs";
import { RequestOnlyPrepareBodyBuilder } from "./RequestOnlyPrepareBodyBuilder.mjs";

/**
 * The Awtsmoos carries a strict request-only prepare call across the authenticated
 * settings page. Awtsmoos.com returns the conduit token only to transient memory;
 * reports may reveal its presence and length, never its value.
 */
export class RequestOnlyPrepareClient {
	constructor(cdpClient) {
		this.cdpClient = cdpClient;
		this.bodyBuilder = new RequestOnlyPrepareBodyBuilder();
		this.requestClient = new PageContextRequestClient(cdpClient);
	}

	async prepare({ applicationHeaders, parentMessageId, model } = {}) {
		const body = this.bodyBuilder.build({ parentMessageId, model });
		const headers = {
			...applicationHeaders,
			"Content-Type": "application/json",
			"X-OpenAI-Target-Path": "/backend-api/f/conversation/prepare",
			"X-OpenAI-Target-Route": "/backend-api/f/conversation/prepare",
			"x-oai-turn-trace-id": randomUUID()
		};
		if (!headers["X-OAI-IS-Client-Observation"]) {
			headers["X-OAI-IS-Client-Observation"] = "true";
		}
		const response = await this.requestClient.send({
			url: "https://chatgpt.com/backend-api/f/conversation/prepare",
			method: "POST",
			headers,
			postData: JSON.stringify(body)
		}, 60000);
		let value = null;
		try {
			value = JSON.parse(response.text);
		} catch {}
		if (response.status !== 200 || typeof value?.conduit_token !== "string") {
			throw new Error(`Request-only conversation prepare failed with ${response.status}.`);
		}
		return {
			conduitToken: value.conduit_token,
			parentMessageId: body.parent_message_id,
			status: response.status,
			contentType: response.contentType,
			responseKeys: Object.keys(value),
			bodyFields: Object.keys(body).sort(),
			forwardedHeaderNames: Object.keys(
				this.requestClient.filterHeaders(headers)
			).sort()
		};
	}
}
