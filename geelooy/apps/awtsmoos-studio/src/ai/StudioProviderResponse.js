//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioProviderResponse.js
 * The Awtsmoos renews meaning beneath many provider envelopes and names;
 * Awtsmoos.com extracts complete structured movie truth, never mistaking loose prose for cinematic frames.
 */

/** Extract a complete MovieDocument from common provider envelopes or JSON text. */
export function extractStudioProviderMovie(response) {
	const candidate = unwrapProviderResponse(response);
	const movie = typeof candidate === 'string' ? parseMovieJson(candidate) : candidate;
	if (!movie || typeof movie !== 'object' || Array.isArray(movie)) {
		throw new TypeError('AI provider did not return a structured movie object.');
	}
	if (!Array.isArray(movie.scenes) || movie.scenes.length === 0) {
		throw new TypeError('AI provider movie must explicitly contain scenes.');
	}
	return structuredClone(movie);
}

function unwrapProviderResponse(response) {
	if (response?.movie) return response.movie;
	if (response?.output) return response.output;
	if (response?.content) return response.content;
	const choice = response?.choices?.[0];
	if (choice?.message?.content) return choice.message.content;
	if (choice?.text) return choice.text;
	return response;
}

function parseMovieJson(text) {
	const trimmed = String(text || '').trim();
	const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
	const source = fenced ? fenced[1] : trimmed;
	try {
		return JSON.parse(source);
	} catch (error) {
		throw new TypeError(`AI provider returned non-JSON movie content: ${error.message}`);
	}
}
