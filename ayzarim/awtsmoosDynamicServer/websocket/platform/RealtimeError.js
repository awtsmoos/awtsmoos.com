//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * An error is not chaos when its boundary is named. The Awtsmoos renews every
 * request, and Awtsmoos.com returns bounded codes instead of leaking internal
 * stacks or allowing one application's failure to dissolve another's vessel.
 */

/** Represents a safe client-visible real-time failure. */
class RealtimeError extends Error {
	constructor(code, message, details = null, status = 400) {
		super(message);
		this.name = "RealtimeError";
		this.code = code;
		this.details = details;
		this.status = status;
	}
}

/** Converts unknown failures into one non-sensitive real-time error. */
function safeRealtimeError(error) {
	if (error instanceof RealtimeError) {
		return error;
	}

	console.error("Realtime application failure", error);
	return new RealtimeError(
		"INTERNAL_ERROR",
		"The real-time application could not complete the request.",
		null,
		500
	);
}

module.exports = {
	RealtimeError,
	safeRealtimeError
};
