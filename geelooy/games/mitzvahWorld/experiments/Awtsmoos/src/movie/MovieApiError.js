// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieApiError.js
 * @description Gives browser, agents, tests, and UI one serializable structured failure contract.
 * The Awtsmoos renews every boundary without confusion; Awtsmoos.com names finite failure
 * so machines can respond by code while people still receive a clear truthful message.
 */

export class MovieApiError extends Error {
	constructor(code, message, details = {}) {
		super(String(message || code));
		this.name = 'MovieApiError';
		this.code = String(code || 'MOVIE_API_ERROR');
		this.details = safeDetails(details);
	}

	toJSON() {
		return {
			code: this.code,
			details: this.details,
			message: this.message,
			name: this.name
		};
	}
}

export function movieApiSuccess(value, metadata = {}) {
	return {
		metadata: safeDetails(metadata),
		ok: true,
		value
	};
}

export function movieApiFailure(error) {
	const normalized = error instanceof MovieApiError
		? error
		: new MovieApiError(
			'UNEXPECTED_MOVIE_ERROR',
			error?.message || String(error),
			{ name: error?.name || 'Error' }
		);
	return {
		error: normalized.toJSON(),
		ok: false
	};
}

export function assertMovieRevision(actual, expected) {
	if (expected == null) return;
	if (Number(expected) === Number(actual)) return;
	throw new MovieApiError(
		'STALE_MOVIE_REVISION',
		`Expected movie revision ${expected}, but current revision is ${actual}.`,
		{ actualRevision: actual, expectedRevision: expected }
	);
}

function safeDetails(value) {
	if (!value || typeof value !== 'object') return {};
	try {
		return JSON.parse(JSON.stringify(value));
	} catch {
		return {};
	}
}
