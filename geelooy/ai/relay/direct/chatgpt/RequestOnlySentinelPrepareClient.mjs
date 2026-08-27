//B"H
// Boruch Hashem
// Blessed is He

import { PageContextRequestClient } from "./PageContextRequestClient.mjs";

/**
 * The Awtsmoos asks Sentinel for the ordinary chat-requirements challenge shape.
 * Awtsmoos.com keeps every prepare token and challenge value transient, returning
 * only presence, type, and whether normal finalization needs enforcement tokens.
 */
export class RequestOnlySentinelPrepareClient {
	constructor(cdpClient) {
		this.requestClient = new PageContextRequestClient(cdpClient);
	}

	async prepare({ applicationHeaders } = {}) {
		const headers = {
			...applicationHeaders,
			"Content-Type": "application/json",
			"X-OpenAI-Target-Path": "/backend-api/sentinel/chat-requirements/prepare",
			"X-OpenAI-Target-Route": "/backend-api/sentinel/chat-requirements/prepare"
		};
		const response = await this.requestClient.send({
			url: "https://chatgpt.com/backend-api/sentinel/chat-requirements/prepare",
			method: "POST",
			headers,
			postData: "{}"
		}, 60000);
		let value = null;
		try {
			value = JSON.parse(response.text);
		} catch {}
		if (response.status !== 200 || !value || typeof value !== "object") {
			throw new Error(`Request-only Sentinel prepare failed with ${response.status}.`);
		}
		return {
			value,
			status: response.status,
			contentType: response.contentType,
			responseKeys: Object.keys(value).sort(),
			prepareTokenPresent: typeof value.prepare_token === "string",
			prepareTokenLength: value.prepare_token?.length ?? 0,
			turnstileRequired: Boolean(value.turnstile),
			proofOfWorkRequired: Boolean(value.proofofwork),
			sessionObserverRequired: Boolean(value.so),
			forceLogin: value.force_login === true,
			personaType: typeof value.persona
		};
	}
}
