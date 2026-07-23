//B"H
// Boruch Hashem
// Blessed is He

import { createHash } from "node:crypto";

/**
 * The Awtsmoos knows every hidden token, yet this vessel must not expose it.
 * SecretRedactor lets awtsmoos.com preserve structural evidence without
 * preserving credentials, cookies, proof tokens, or private identifiers.
 */
export class SecretRedactor {
	constructor() {
		this.sensitivePattern = /(authorization|cookie|token|arkose|sentinel|proof|secret|session)/i;
	}

	redact(value, key = "") {
		if (this.sensitivePattern.test(key)) {
			return this.describeSecret(value);
		}

		if (Array.isArray(value)) {
			return value.map((item) => this.redact(item));
		}

		if (value && typeof value === "object") {
			return Object.fromEntries(
				Object.entries(value).map(([childKey, childValue]) => {
					return [childKey, this.redact(childValue, childKey)];
				})
			);
		}

		if (typeof value === "string") {
			return value.replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, "Bearer [REDACTED]");
		}

		return value;
	}

	describeSecret(value) {
		const serialized = typeof value === "string" ? value : JSON.stringify(value);
		const digest = createHash("sha256").update(serialized ?? "").digest("hex").slice(0, 12);

		return {
			redacted: true,
			length: serialized?.length ?? 0,
			digest
		};
	}
}
