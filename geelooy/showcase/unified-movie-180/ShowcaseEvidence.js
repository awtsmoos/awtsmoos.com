//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShowcaseEvidence.js
 * @description Proof is not confidence: the Awtsmoos renews both movie vessels, and each must answer its own law;
 * Awtsmoos.com shows shared validation, deterministic-core validation, and bridge roundtrip evidence without awe becoming flaw.
 */
import { validateMovie } from "../../apps/shared/movie/MovieValidator.js";
import {
	toCoreMovie,
	toSharedMovie
} from "../../apps/shared/movie/compat/MovieCoreBridge.js";
import { validateMovieDocument } from "../../libs/awtsmoos-movie-core/index.js";

/**
 * @description Computes and renders dual-schema proof evidence for the 180-second showcase.
 */
export class ShowcaseEvidence {
	/**
	 * @description Creates an evidence inspector for one shared-protocol proof movie.
	 * @param {object} sharedMovie - Canonical shared-protocol movie document.
	 * @returns {ShowcaseEvidence} Evidence inspector instance.
	 * @sideEffects Stores a reference to the supplied movie without mutating it.
	 */
	constructor(sharedMovie) {
		this.sharedMovie = sharedMovie;
		this.result = null;
	}

	/**
	 * @description Validates both schemas and checks a shared→core→shared roundtrip invariant.
	 * @returns {object} Evidence bundle containing reports, projections, and summary facts.
	 * @sideEffects None outside newly allocated conversion documents.
	 */
	inspect() {
		const sharedReport = validateMovie(this.sharedMovie);
		const coreMovie = toCoreMovie(this.sharedMovie);
		const coreReport = validateMovieDocument(coreMovie);
		const roundTrip = toSharedMovie(coreMovie);
		const modes = Array.from(new Set(coreMovie.scenes.map(function readMode(scene) {
			return scene.mode;
		})));
		this.result = {
			sharedReport,
			coreReport,
			coreMovie,
			roundTrip,
			summary: {
				duration: this.sharedMovie.duration,
				sharedScenes: this.sharedMovie.scenes.length,
				coreScenes: coreMovie.scenes.length,
				modes,
				roundTripOk: roundTrip.duration === this.sharedMovie.duration
					&& roundTrip.scenes.length === this.sharedMovie.scenes.length
			}
		};
		return this.result;
	}

	/**
	 * @description Writes evidence status text into the showcase evidence cells.
	 * @param {Document} root - Browser document containing the showcase status elements.
	 * @returns {object} Current evidence result.
	 * @throws {Error} When a required evidence element is absent.
	 * @sideEffects Mutates evidence text and status data attributes in the DOM.
	 */
	render(root = document) {
		const result = this.result || this.inspect();
		setStatus(root, "sharedStatus", result.sharedReport.ok, result.sharedReport.errors.length);
		setStatus(root, "coreStatus", result.coreReport.ok, result.coreReport.errors.length);
		setStatus(root, "bridgeStatus", result.summary.roundTripOk, 0);
		setText(
			root,
			"sceneStatus",
			`${result.summary.sharedScenes} shared / ${result.summary.coreScenes} core`
		);
		setText(root, "modeStatus", result.summary.modes.join(" · "));
		return result;
	}
}

/**
 * @description Writes pass/fail status to one evidence cell.
 * @param {Document} root - Browser document containing the evidence cell.
 * @param {string} id - DOM element identifier.
 * @param {boolean} ok - Whether the evidence gate passed.
 * @param {number} errorCount - Number of validation errors when applicable.
 * @returns {void}
 * @sideEffects Mutates one DOM element.
 */
function setStatus(root, id, ok, errorCount) {
	const element = requireElement(root, id);
	element.dataset.state = ok ? "pass" : "fail";
	element.textContent = ok ? "PASS" : `FAIL · ${errorCount} errors`;
}

/**
 * @description Writes plain evidence text to one required DOM element.
 * @param {Document} root - Browser document containing the element.
 * @param {string} id - DOM element identifier.
 * @param {string} text - Text to reveal.
 * @returns {void}
 * @sideEffects Mutates one DOM element.
 */
function setText(root, id, text) {
	requireElement(root, id).textContent = text;
}

/**
 * @description Resolves one required showcase element by identifier.
 * @param {Document} root - Browser document containing the element.
 * @param {string} id - DOM element identifier.
 * @returns {HTMLElement} Required element.
 * @throws {Error} When the element does not exist.
 * @sideEffects None.
 */
function requireElement(root, id) {
	const element = root.getElementById(id);
	if (!element) {
		throw new Error(`Showcase evidence element missing: ${id}`);
	}
	return element;
}
