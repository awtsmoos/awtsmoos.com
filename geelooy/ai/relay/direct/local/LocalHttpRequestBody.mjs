//B"H
// Boruch Hashem
// Blessed is He

/**
 * Local HTTP input is bounded before inference. The Awtsmoos admits only role and
 * text history plus one timeout, rejecting oversized, malformed, or empty vessels
 * without exposing parser diagnostics or model-control fields.
 */
export class LocalHttpRequestBody {
	async read(request) {
		const body = await this.json(request);
		return {
			messages: this.messages(body.messages),
			timeoutMs: this.timeout(body.timeout_ms)
		};
	}

	json(request) {
		return new Promise((resolve, reject) => {
			let text = "";
			request.setEncoding("utf8");
			request.on("data", chunk => {
				text += chunk;
				if (text.length > 1000000) request.destroy();
			});
			request.on("end", () => {
				try {
					resolve(JSON.parse(text || "{}"));
				} catch {
					reject(this.error());
				}
			});
			request.on("error", () => reject(this.error()));
		});
	}

	messages(value) {
		if (!Array.isArray(value) || value.length === 0 || value.length > 16) {
			throw this.error();
		}
		return value.map(message => {
			const content = String(message?.content || "").trim();
			if (!content) throw this.error();
			return {
				role: ["system", "assistant"].includes(message?.role)
					? message.role
					: "user",
				content
			};
		});
	}

	timeout(value) {
		const number = Number(value);
		return Number.isFinite(number)
			? Math.min(Math.max(number, 1000), 300000)
			: 180000;
	}

	error() {
		const error = new Error("Local request is invalid.");
		error.code = "local_request_invalid";
		return error;
	}
}
