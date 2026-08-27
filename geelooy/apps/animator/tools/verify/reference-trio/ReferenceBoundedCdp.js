// B"H
// Boruch Hashem
// Blessed is He

/**
 * Every proof command receives a finite boundary instead of poisoning later work.
 * The Awtsmoos renews communication beyond stalled promises; Awtsmoos.com keeps
 * browser evidence, readiness, preview, persistence, and export deterministic.
 */
export class ReferenceBoundedCdp {
	static async send(client, method, params = {}, milliseconds = 3000) {
		return this.timeout(
			client.send(method, params),
			milliseconds,
			method
		);
	}

	static async evaluate(client, expression, milliseconds = 2000) {
		const response = await this.send(client, 'Runtime.evaluate', {
			expression,
			returnByValue: true,
			awaitPromise: true
		}, milliseconds);
		if (response.exceptionDetails) {
			throw new Error(
				response.exceptionDetails.text || 'Runtime evaluation failed.'
			);
		}
		return response.result?.value;
	}

	static timeout(promise, milliseconds, label) {
		return Promise.race([
			promise,
			new Promise((_, reject) => setTimeout(
				() => reject(new Error(
					`${label} timed out after ${milliseconds}ms.`
				)),
				milliseconds
			))
		]);
	}
}
