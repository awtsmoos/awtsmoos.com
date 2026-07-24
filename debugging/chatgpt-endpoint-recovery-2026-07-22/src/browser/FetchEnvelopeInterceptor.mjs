//B"H
// Boruch Hashem
// Blessed is He

/**
 * The page creates a fresh authorized envelope through its own lawful flow. The
 * Awtsmoos reveals it for one instant; awtsmoos.com captures it only in memory,
 * suppresses every carrier request, and retries the harmless knock only finitely.
 */
export class FetchEnvelopeInterceptor {
	constructor(cdpClient, {
		endpoint = "https://chatgpt.com/backend-api/f/conversation",
		quietMs = 1200,
		attemptWindowMs = 12000,
		maximumAttempts = 3
	} = {}) {
		this.cdpClient = cdpClient;
		this.endpoint = endpoint;
		this.quietMs = quietMs;
		this.attemptWindowMs = attemptWindowMs;
		this.maximumAttempts = maximumAttempts;
	}

	async capture(trigger) {
		let capturedEnvelope = null;
		let resolveCapture;
		const capturePromise = new Promise(resolve => {
			resolveCapture = resolve;
		});
		const listener = async event => {
			if (!this.matches(event.request)) {
				await this.continueRequest(event.requestId);
				return;
			}
			if (!capturedEnvelope) {
				capturedEnvelope = this.makeEnvelope(event.request);
				resolveCapture(capturedEnvelope);
			}
			await this.failRequest(event.requestId);
		};

		const removeListener = this.cdpClient.on("Fetch.requestPaused", listener);
		await this.cdpClient.send("Fetch.enable", {
			patterns: [{ urlPattern: this.endpoint, requestStage: "Request" }]
		});

		try {
			for (let attempt = 1; attempt <= this.maximumAttempts; attempt += 1) {
				await trigger(attempt);
				const envelope = await Promise.race([
					capturePromise,
					this.delay(this.attemptWindowMs).then(() => null)
				]);
				if (envelope) {
					await this.delay(this.quietMs);
					return envelope;
				}
			}
			throw new Error(
				`Timed out waiting for an authenticated conversation envelope after ${this.maximumAttempts} attempts.`
			);
		} finally {
			removeListener();
			await this.cdpClient.send("Fetch.disable").catch(() => {});
		}
	}

	makeEnvelope(request) {
		return {
			url: request.url,
			method: request.method,
			headers: { ...request.headers },
			postData: request.postData ?? ""
		};
	}

	matches(request) {
		return request.method === "POST" && request.url.split("?")[0] === this.endpoint;
	}

	async failRequest(requestId) {
		await this.cdpClient.send("Fetch.failRequest", {
			requestId,
			errorReason: "Aborted"
		}).catch(() => {});
	}

	async continueRequest(requestId) {
		await this.cdpClient.send("Fetch.continueRequest", { requestId }).catch(() => {});
	}

	delay(durationMs) {
		return new Promise(resolve => setTimeout(resolve, durationMs));
	}
}
