//B"H
// Boruch Hashem
// Blessed is He

/**
 * The normal Sentinel SDK remains the author of its own browser values. The
 * Awtsmoos lets Awtsmoos.com invoke only public methods and report capability
 * metadata; proof algorithms, challenge solvers, and token values stay hidden.
 */
export class RequestOnlySentinelSdkClient {
	constructor(cdpClient) {
		this.cdpClient = cdpClient;
	}

	async createToken({ flow = "conversation", timeoutMs = 60000 } = {}) {
		const result = await this.cdpClient.send("Runtime.evaluate", {
			expression: this.expression(flow),
			returnByValue: true,
			awaitPromise: true
		}, timeoutMs);
		if (result.exceptionDetails) {
			throw new Error(
				result.exceptionDetails.text ?? "Sentinel SDK invocation failed."
			);
		}
		const value = result.result.value;
		if (typeof value?.token !== "string" || value.token.length === 0) {
			throw new Error("Sentinel SDK did not return a token.");
		}
		return value;
	}

	expression(flow) {
		return `(async () => {
			if (!window.SentinelSDK) {
				await new Promise((resolve, reject) => {
					const script = document.createElement('script');
					script.src = '/backend-api/sentinel/sdk.js';
					script.async = true;
					script.onload = resolve;
					script.onerror = () => reject(new Error('Sentinel SDK failed to load.'));
					document.head.appendChild(script);
				});
			}
			if (typeof window.SentinelSDK?.token !== 'function') {
				throw new Error('Sentinel SDK token method is unavailable.');
			}
			const flow = ${JSON.stringify(flow)};
			await Promise.resolve(window.SentinelSDK.init?.(flow));
			const token = await window.SentinelSDK.token(flow);
			const timing = await Promise.resolve(window.SentinelSDK.timing?.() ?? null);
			const observer = await inspectSessionObserver(window.SentinelSDK, flow);
			return {
				token,
				timing,
				methodNames: Object.keys(window.SentinelSDK).sort(),
				hasInit: typeof window.SentinelSDK.init === 'function',
				hasToken: typeof window.SentinelSDK.token === 'function',
				hasTiming: typeof window.SentinelSDK.timing === 'function',
				sessionObserver: observer
			};

			async function inspectSessionObserver(sdk, flowName) {
				const method = sdk.sessionObserverToken;
				if (typeof method !== 'function') {
					return { available: false, usable: false, resultType: 'missing' };
				}
				try {
					const value = await method(flowName);
					const candidate = typeof value === 'string'
						? value
						: typeof value?.token === 'string' ? value.token : '';
					return {
						available: true,
						usable: candidate.length > 0,
						resultType: Array.isArray(value) ? 'array' : typeof value,
						resultKeys: value && typeof value === 'object' && !Array.isArray(value)
							? Object.keys(value).sort()
							: []
					};
				} catch (error) {
					return {
						available: true,
						usable: false,
						resultType: 'error',
						errorName: String(error?.name || 'Error').slice(0, 80)
					};
				}
			}
		})()`;
	}
}
