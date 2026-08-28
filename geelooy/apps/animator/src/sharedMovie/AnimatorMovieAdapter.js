//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorMovieAdapter.js
 * @description Animator remains the cinematic director while the Awtsmoos keeps one canonical movie above projection;
 * Awtsmoos.com composes small plan vessels so cameras, dialogue, characters, and effects remain editable in connection.
 */
import {
	KeliMovieAdapter,
	ProjectionReport,
	validateMovie
} from "../../../shared/movie/index.js";
import { MoviePlanCompiler } from "../generator/compiler/MoviePlanCompiler.js";
import { tiferesAnimatorScene } from "./AnimatorMovieProjection.js";
import {
	chaiPerformances,
	chaiUniqueCharacters,
	chochmahShots,
	diburDialogue,
	malchusObjects,
	yesodAssets,
	yesodSequence
} from "./AnimatorMoviePlanParts.js";

const keliAdapter = new KeliMovieAdapter("animator");

/** Project the canonical movie into Animator's editable movie-plan grammar. */
export class AnimatorMovieAdapter {
	static project(orMovie) {
		assertMovie(orMovie);
		const ohrReport = new ProjectionReport("animator");
		const keliScenes = (orMovie.scenes || []).map(tiferesAnimatorScene);
		const keliPlan = createPlan(orMovie, keliScenes, ohrReport);
		keliPlan.nle = MoviePlanCompiler.compile(keliPlan);
		return keliAdapter.result(orMovie, keliPlan, ohrReport, {
			plan: keliPlan
		});
	}
}

function createPlan(orMovie, orScenes, orReport) {
	return {
		id: orMovie.id,
		title: orMovie.metadata?.title || orMovie.title || orMovie.id,
		duration: orMovie.duration,
		style: orMovie.metadata?.style || "universal-cinematic",
		characters: chaiUniqueCharacters(orScenes),
		sequences: orScenes.map(orScene => yesodSequence(orScene, orReport)),
		shots: orScenes.flatMap(orScene => chochmahShots(orScene, orReport)),
		dialogue: orScenes.flatMap(orScene => diburDialogue(orScene, orReport)),
		performances: orScenes.flatMap(chaiPerformances),
		objects: orScenes.flatMap(malchusObjects),
		assetUses: orScenes.flatMap(orScene => yesodAssets(orScene, orReport)),
		settings: {
			...(orMovie.settings || {}),
			format: structuredClone(orMovie.format || {})
		}
	};
}

function assertMovie(orMovie) {
	const keliReport = validateMovie(orMovie);
	if (!keliReport.valid) {
		throw new Error(keliReport.errors.map(orError => `${orError.path}: ${orError.message}`).join(" | "));
	}
}
