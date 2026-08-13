//B"H
// Boruch Hashem
// Blessed is He

const AWTSMOOS_FETCH_TIMEOUT_MS = 180000;

/**
 * The Awtsmoos gives ordinary requests a measured vessel while synthesis may
 * flow beyond every clock. Awtsmoos.com binds each response stream to the same
 * deadline policy that governed its opening fetch, so long audio stays whole.
 */
function createAwtsmoosFetch(bridge, responseTools) {
	async function awtsFetch(url, options = {}) {
		return await fetchWithRetries(url, options, deadlineForUrl(url));
	}

	awtsFetch.withoutDeadline = async (url, options = {}) => {
		return await fetchWithRetries(url, options, null);
	};

	function fetchWithRetries(url, options, timeoutMs) {
		return attemptFetch(url, options, timeoutMs, 0, null);
	}

	async function attemptFetch(url, options, timeoutMs, attempt, lastError) {
		if (attempt >= 4) {
			throw lastError;
		}
		const id = bridgeId();
		const send = bindBridgeSender(bridge, timeoutMs);
		try {
			const metadata = await send({
				action: "fetch",
				id,
				url: String(url),
				options
			});
			bridge.ready({ attempt });
			return responseTools.createResponse(metadata, id, send);
		} catch (error) {
			bridge.announce("awtsmoos-server-reconnecting", {
				attempt,
				error: bridge.safeMessage(error)
			});
			await bridge.delay(250 * Math.pow(2, attempt));
			return await attemptFetch(url, options, timeoutMs, attempt + 1, error);
		}
	}

	globalThis.__awtsmoosFetchControls.attach(awtsFetch, bridge);
	awtsFetch.__awtsmoosServerBridge = true;
	return awtsFetch;
}

/**
 * A bound sender ignores later per-reader timeout suggestions and preserves the
 * opening request's law. Audio therefore never silently regains a 3-minute cap.
 */
function bindBridgeSender(bridge, timeoutMs) {
	return payload => {
		return bridge.send(payload, timeoutMs);
	};
}

/**
 * @param {string|URL} url Requested upstream URL.
 * @returns {number|null} Finite default deadline or no deadline for synthesis.
 */
function deadlineForUrl(url) {
	return isAudioSynthesisUrl(url) ? null : AWTSMOOS_FETCH_TIMEOUT_MS;
}

function isAudioSynthesisUrl(url) {
	try {
		const parsed = new URL(String(url), globalThis.location?.href || "https://chatgpt.com");
		const host = parsed.hostname.toLowerCase();
		return (host === "chatgpt.com" || host === "www.chatgpt.com")
			&& parsed.pathname === "/backend-api/synthesize";
	} catch {
		return false;
	}
}

function bridgeId() {
	return `BH_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

globalThis.__awtsmoosFetchTools = {
	createFetch: createAwtsmoosFetch,
	isAudioSynthesisUrl
};
