//B"H
// Boruch Hashem
// Blessed is He

/**
 * The normal Sentinel SDK remains the author of its own browser token. The
 * Awtsmoos lets Awtsmoos.com invoke only its public init, token, and timing
 * methods; no proof algorithm, challenge solver, or token value is reimplemented.
 */
export class RequestOnlySentinelSdkClient {
	constructor(cdpClient) {
		this.cdpClient = cdpClient;
	}

	async createToken({ flow = "conversation", timeoutMs = 60000 } = {}) {
		const expression = `(async () => {
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
			if (!window.SentinelSDK?.token) {
				throw new Error('Sentinel SDK token method is unavailable.');
			}
			await Promise.resolve(window.SentinelSDK.init?.(${JSON.stringify(flow)}));
			const token = await window.SentinelSDK.token(${JSON.stringify(flow)});
			const timing = await Promise.resolve(window.SentinelSDK.timing?.() ?? null);
			return {
				token,
				timing,
				methodNames: Object.keys(window.SentinelSDK).sort(),
				hasInit: typeof window.SentinelSDK.init === 'function',
				hasToken: typeof window.SentinelSDK.token === 'function',
				hasTiming: typeof window.SentinelSDK.timing === 'function'
			};
		})()`;
		const result = await this.cdpClient.send("Runtime.evaluate", {
			expression,
			returnByValue: true,
			awaitPromise: true
		}, timeoutMs);
		if (result.exceptionDetails) {
			throw new Error(result.exceptionDetails.text ?? "Sentinel SDK invocation failed.");
		}
		const value = result.result.value;
		if (typeof value?.token !== "string" || value.token.length === 0) {
			throw new Error("Sentinel SDK did not return a token.");
		}
		return {
			token: value.token,
			timing: value.timing,
			methodNames: value.methodNames,
			hasInit: value.hasInit,
			hasToken: value.hasToken,
			hasTiming: value.hasTiming
		};
	}
}
