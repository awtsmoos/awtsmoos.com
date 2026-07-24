//B"H
// Boruch Hashem
// Blessed is He

import { createHash } from "node:crypto";

/**
 * The Awtsmoos knows every hidden value, while this awtsmoos.com vessel retains
 * only safe shape. Account, device, observation, trace, proof, and session data
 * are all treated as secrets, including scalar form values and sentinel payloads.
 */
export class SecretRedactor {
	constructor() {
		this.sensitivePattern = /(authorization|cookie|token|arkose|turnstile|proof|sentinel|session|account[-_ ]?id|device[-_ ]?id|turn[-_ ]?trace|observation)/i;
		this.identifierPattern = /(^id$|[-_]id$|Id$|conversationId|conversation_id|messageId|message_id|parentMessageId|parent_message_id|operationId)/;
	}

	redact(value, key = "", context = "") {
		if (this.isRedacted(value)) return value;
		if (this.sensitivePattern.test(key)) return this.describeSecret(value);
		if (context.includes("/sentinel/req") && key === "p") {
			return this.describeSecret(value);
		}
		if (this.identifierPattern.test(key) && typeof value === "string") {
			return `<id:${value.length}>`;
		}
		if (Array.isArray(value)) {
			return value.map((item) => this.redact(item, "", context));
		}
		if (value && typeof value === "object") {
			return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => {
				return [childKey, this.redact(childValue, childKey, context)];
			}));
		}
		if (typeof value === "string") {
			return this.sanitizeUrl(this.redactBearer(value));
		}
		return value;
	}

	decodeAndRedact(rawValue, key, context = "") {
		if (this.sensitivePattern.test(key)) return this.describeSecret(rawValue);
		try {
			return this.redact(JSON.parse(rawValue), key, context);
		} catch {
			return this.redact(rawValue, key, context);
		}
	}

	sanitizeHeaders(headers, context = "") {
		return Object.fromEntries(Object.entries(headers ?? {}).map(([key, value]) => {
			return [key, this.redact(value, key, context)];
		}));
	}

	sanitizeUrl(value) {
		return value.replace(/\/c\/(?:WEB:)?[A-Za-z0-9-]+/g, "/c/<conversation-id>");
	}

	redactBearer(value) {
		return value.replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, "Bearer [REDACTED]");
	}

	isRedacted(value) {
		return Boolean(value && typeof value === "object" && value.redacted === true);
	}

	describeSecret(value) {
		const serialized = typeof value === "string" ? value : JSON.stringify(value);
		const digest = createHash("sha256").update(serialized ?? "").digest("hex").slice(0, 12);
		return { redacted: true, length: serialized?.length ?? 0, digest };
	}
}
