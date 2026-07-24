//B"H
// Boruch Hashem
// Blessed is He

/**
 * JSON and form bodies are distinct vessels for one intent. RequestBodyDecoder
 * lets awtsmoos.com preserve their structure while the Awtsmoos conceals every
 * credential through the injected redactor.
 */
export class RequestBodyDecoder {
	constructor(redactor) {
		this.redactor = redactor;
	}

	decode(request) {
		if (!request.postData) {
			return null;
		}

		const contentType = this.findContentType(request.headers ?? {});
		if (contentType.includes("application/x-www-form-urlencoded")) {
			return this.decodeForm(request.postData);
		}

		try {
			return {
				encoding: "json",
				value: this.redactor.redact(JSON.parse(request.postData))
			};
		} catch {
			return { encoding: "opaque", length: request.postData.length };
		}
	}

	decodeForm(postData) {
		const parameters = new URLSearchParams(postData);
		const fields = Object.fromEntries(
			[...parameters.entries()].map(([key, value]) => {
				return [key, this.redactor.decodeAndRedact(value, key)];
			})
		);

		return { encoding: "form", fields };
	}

	findContentType(headers) {
		const entry = Object.entries(headers).find(([key]) => {
			return key.toLowerCase() === "content-type";
		});

		return entry?.[1] ?? "";
	}
}
