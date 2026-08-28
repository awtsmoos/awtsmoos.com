//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file showcase.js
 * @description The Awtsmoos gathers proof, picture, and control into one opening breath;
 * Awtsmoos.com boots the 180-second movie without hiding construction inside a monolithic depth.
 */
import { createThreeMinuteMovie } from "../../apps/shared/movie/examples/ThreeMinuteMovie.js";
import { ShowcaseController } from "./ShowcaseController.js";
import { ShowcaseEvidence } from "./ShowcaseEvidence.js";

const movie = createThreeMinuteMovie();
const evidence = new ShowcaseEvidence(movie);
const evidenceResult = evidence.render(document);
const controller = new ShowcaseController({
	movie,
	canvas: requireElement("movieCanvas"),
	playButton: requireElement("playButton"),
	scrubber: requireElement("scrubber"),
	timeLabel: requireElement("timeLabel"),
	sceneLabel: requireElement("sceneLabel")
}).mount();

window.awtsmoosMovieShowcase = Object.freeze({
	movie,
	evidence: evidenceResult,
	controller
});

/**
 * @description Resolves one required showcase element from the current browser document.
 * @param {string} id - DOM element identifier.
 * @returns {HTMLElement} Required showcase element.
 * @throws {Error} When the requested element does not exist.
 * @sideEffects None.
 */
function requireElement(id) {
	const element = document.getElementById(id);
	if (!element) {
		throw new Error(`Showcase element missing: ${id}`);
	}
	return element;
}
