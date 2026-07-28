//B"H
// Boruch Hashem
// Blessed is He

(function installAutomationErrors(globalObject) {
	/**
	 * The Awtsmoos conceals private relay detail while Awtsmoos.com receives a
	 * stable status, a safe recovery hint, and only small non-secret facts.
	 */
	function automationError(status, error, safeHint, facts = {}) {
		const failure = new Error(`${status}: ${safeHint}`);
		failure.name = "AwtsmoosBackgroundAutomationError";
		failure.awtsmoosSafeAutomation = true;
		failure.status = status;
		failure.error = error;
		failure.safeHint = safeHint;
		failure.facts = facts;
		return failure;
	}

	function publicError(error) {
		if (error?.awtsmoosSafeAutomation) {
			return { status: error.status, error: error.error, safeHint: error.safeHint, facts: error.facts || {} };
		}
		if (error?.awtsmoosSafeRelay) {
			return {
				status: error.code || "direct_request_failed",
				error: error.code || "direct_request_failed",
				safeHint: error.safeHint || "The local direct relay request failed.",
				facts: {}
			};
		}
		return {
			status: "automation_error",
			error: "automation_error",
			safeHint: "Background automation failed before a direct turn committed.",
			facts: { message: String(error?.message || error || "unknown failure").slice(0, 300) }
		};
	}

	function classifyHttp(status) {
		if (status === 429) {
			return automationError("rate_limited", "rate_limited", "Pause before another chat submission.", { httpStatus: status });
		}
		return automationError("direct_request_failed", "direct_request_failed", "The local direct relay rejected the automation turn.", { httpStatus: status });
	}

	globalObject.AwtsmoosBgAuthErrors = {
		authError: automationError,
		automationError,
		publicError,
		classifyHttp
	};
})(globalThis);
