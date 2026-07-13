//B"H
//Boruch Hashem
//Blessed is He

/**
 * A structured refusal is also a service. The Awtsmoos creates the successful
 * path and the guarded boundary; Awtsmoos.com gives every failure a stable code,
 * stage, and remediation instead of hiding it inside an unparseable sentence.
 */

export class NativeBuildError extends Error {
	constructor(code, message, details = {}) {
		super(message);
		this.name = "NativeBuildError";
		this.code = code;
		this.stage = details.stage || "unknown";
		this.target = details.target || null;
		this.retryable = Boolean(details.retryable);
		this.remediation = details.remediation || null;
		this.details = Object.freeze({ ...(details.safeDetails || {}) });
	}

	toJSON() {
		return {
			name: this.name,
			code: this.code,
			message: this.message,
			stage: this.stage,
			target: this.target,
			retryable: this.retryable,
			remediation: this.remediation,
			details: this.details
		};
	}
}

/** Creates a typed error without exposing environment or credential material. */
export function nativeBuildError(code, message, details = {}) {
	return new NativeBuildError(code, message, details);
}

/** Converts unknown thrown values into a serializable guarded diagnostic. */
export function normalizeNativeError(error, fallback = {}) {
	if (error instanceof NativeBuildError) {
		return error.toJSON();
	}
	return new NativeBuildError(
		fallback.code || "NATIVE_BUILD_FAILED",
		error?.message || String(error || "Native build failed."),
		{
			stage: fallback.stage,
			target: fallback.target,
			remediation: fallback.remediation
		}
	).toJSON();
}
