//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieIntentCompiler.js
 * @description The Awtsmoos lets structured intention become lawful movie time;
 * Awtsmoos.com keeps local fallback honest while a real AI provider may climb.
 */
import { createMovieDocument } from "../MovieProtocol.js";
import { normalizeMovie } from "../MovieNormalizer.js";
import { validateMovie } from "../MovieValidator.js";
import { createIntentScene } from "./MovieIntentSceneFactory.js";

/** Expand sparse structured intent into an arbitrary-duration canonical movie. */
export function compileMovieIntent(intent = {}) {
	const duration = positiveNumber(intent.duration, 60);
	const sceneLength = Math.min(duration, positiveNumber(intent.sceneDuration, 10));
	const cast = Array.isArray(intent.cast) && intent.cast.length ? intent.cast : defaultCast();
	const scenes = Array.isArray(intent.scenes) && intent.scenes.length
		? intent.scenes
		: createScenes(duration, sceneLength, { ...intent, cast });
	const movie = createMovieDocument({
		id: intent.id || `ai-movie-${Date.now()}`,
		metadata: {
			title: intent.title || intent.subject || "AI Movie",
			prompt: intent.prompt || "",
			mode: intent.mode || "hybrid",
			generatedBy: "structured-intent"
		},
		format: intent.format || {
			width: 1280,
			height: 720,
			fps: 24,
			orientation: "landscape",
			safeArea: 0.06
		},
		duration,
		cast,
		assets: intent.assets || [],
		scenes,
		features: intent.features || [
			"narrative",
			"tutorial",
			"infographic",
			"2d",
			"3d",
			"particles",
			"characters"
		],
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

function createScenes(duration, sceneLength, intent) {
	const count = Math.max(1, Math.ceil(duration / sceneLength));
	return Array.from({ length: count }, (_, index) => {
		const start = index * sceneLength;
		const remaining = duration - start;
		return createIntentScene(index, start, Math.min(sceneLength, remaining), intent);
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

function defaultCast() {
	return [{
		id: "guide",
		name: "Guide",
		role: "presenter",
		style: "friendly cinematic educator"
	}];
}
