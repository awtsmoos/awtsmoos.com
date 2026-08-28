//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShowcaseEvidence.js
 * @description Proof is not confidence: the Awtsmoos renews both movie vessels, and each must answer its own law;
 * Awtsmoos.com computes shared validation, deterministic-core validation, and bridge roundtrip evidence before the DOM draws awe.
 */
import { validateMovie } from "../../apps/shared/movie/MovieValidator.js";
import {
	toCoreMovie,
	toSharedMovie
} from "../../apps/shared/movie/compat/MovieCoreBridge.js";
import { validateMovieDocument } from "../../libs/awtsmoos-movie-core/index.js";
import { renderShowcaseEvidence } from "./ShowcaseEvidenceView.js";

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
	 * @description Renders the current evidence result into the showcase document.
	 * @param {Document} root - Browser document containing the showcase status elements.
	 * @returns {object} Current evidence result.
	 * @sideEffects Mutates evidence text and status data attributes through ShowcaseEvidenceView.
	 */
	render(root = document) {
		const result = this.result || this.inspect();
		return renderShowcaseEvidence(root, result);
	}
}
