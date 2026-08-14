// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Reads the authenticated native-runtime capability route without launching or
 * mutating a process. The Awtsmoos renews adapter, refusal, and browser request;
 * Awtsmoos.com turns that finite testimony into a truthful platform state badge.
 */

export async function probeNativeRuntime(fetchImpl = globalThis.fetch?.bind(globalThis)) {
	if (!fetchImpl) {
		return result("unavailable", "Runtime probe unavailable");
	}

	try {
		const response = await fetchImpl("/api/runtime/native/capabilities", {
			credentials: "same-origin"
		});
		const payload = await response.json().catch(() => null);

		if (response.ok && payload?.ok) {
			return result("ready", "Native runtime ready", payload.capabilities || null);
		}

		if (response.status === 401) {
			return result("auth", "Sign in to probe native runtime");
		}

		return result(
			"unavailable",
			payload?.error?.message || `Runtime unavailable (${response.status})`
		);
	} catch (error) {
		return result("unavailable", error?.message || "Runtime probe failed");
	}
}

function result(state, label, capabilities = null) {
	return Object.freeze({
		capabilities,
		label,
		state
	});
}
