//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieIntentCompiler.js
 * @description The Awtsmoos lets free-form structured intention enter one lawful cinematic line;
 * Awtsmoos.com normalizes time, layers, and format before every renderer receives the design.
 */
import { createMovieDocument } from "../MovieProtocol.js";
import { normalizeMovie } from "../MovieNormalizer.js";
import { validateMovie } from "../MovieValidator.js";
import { normalizeMovieIntentInput } from "./MovieIntentNormalizer.js";
import { createIntentScene } from "./MovieIntentSceneFactory.js";

/** Expand sparse or richly authored structured intent into an arbitrary-duration canonical movie. */
export function compileMovieIntent(rawIntent = {}) {
	const intent = normalizeMovieIntentInput(rawIntent);
	const duration = positiveNumber(intent.duration, 60);
	const sceneLength = Math.min(duration, positiveNumber(intent.sceneDuration, 10));
	const cast = Array.isArray(intent.cast) && intent.cast.length ? intent.cast : defaultCast();
	const scenes = Array.isArray(intent.scenes) && intent.scenes.length
		? intent.scenes
		: createScenes(duration, sceneLength, { ...intent, cast });
	const movie = createMovieDocument({
		id: intent.id || `ai-movie-${Date.now()}`,
		metadata: {
			...(intent.metadata || {}),
			title: intent.title || intent.subject || "AI Movie",
			prompt: intent.prompt || "",
			mode: intent.mode || "hybrid",
			generatedBy: "structured-intent"
		},
		format: intent.format,
		duration,
		cast,
		assets: intent.assets || [],
		scenes,
		features: intent.features || defaultFeatures(),
		handoff: intent.handoff || {
			preferredApps: ["animator", "nesher", "videoEditor", "mitzvah"]
		}
	});
	return assertValid(normalizeMovie(movie));
}

/** Use a real injected AI provider when available, otherwise compile structured intent. */
export async function generateMovieFromIntent(intent = {}, aiProvider = null) {
	if (typeof aiProvider !== "function") {
		return compileMovieIntent(intent);
	}
	const generated = await aiProvider(structuredClone(intent));
	return assertValid(normalizeMovie(generated));
}

/** Stable object facade for studio controllers while retaining the historical functions. */
export const MovieIntentCompiler = Object.freeze({
	compile(intent = {}) {
		return compileMovieIntent(intent);
	},
	generate(intent = {}, aiProvider = null) {
		return generateMovieFromIntent(intent, aiProvider);
	}
});

function createScenes(duration, sceneLength, intent) {
	const count = Math.max(1, Math.ceil(duration / sceneLength));
	return Array.from({ length: count }, (_, index) => {
		const start = index * sceneLength;
		return createIntentScene(index, start, Math.min(sceneLength, duration - start), intent);
	});
}

function assertValid(movie) {
	const report = validateMovie(movie);
	if (!report.valid) {
		const message = report.errors.map((error) => `${error.path}: ${error.message}`).join(" | ");
		throw new Error(`Invalid AI movie: ${message}`);
	}
	return movie;
}

function positiveNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function defaultFeatures() {
	return ["narrative", "tutorial", "infographic", "2d", "3d", "particles", "characters"];
}

function defaultCast() {
	return [{
		id: "guide",
		name: "Guide",
		role: "presenter",
		style: "friendly cinematic educator"
	}];
}
