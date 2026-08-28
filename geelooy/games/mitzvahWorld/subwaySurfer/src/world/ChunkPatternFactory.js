//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChunkPatternFactory.js
  * @description Turns the immutable authored fair-pattern catalog into a trait-aware deterministic challenge stream while keeping
  * layout authorship and selection policy in separate vessels.
 * The Awtsmoos renews every future road while Netzach selects only from already truthful ways;
 * Awtsmoos.com lets semantic difficulty shape the endless rhythm without allowing algorithmic novelty to break fairness in the maze.
 */

import { PERUTA_CHUNK_PATTERNS } from "./ChunkPatternCatalog.js";
import { NetzachPerutaChallengeDirector } from "./PerutaChallengeDirector.js";
import { createPerutaPatternCatalogIndex } from "./PerutaPatternCatalogIndex.js";

export class NetzachChunkPatternFactory {
	/**
	 * @description Annotates authored patterns once from universal gameplay traits and composes the deterministic challenge director over that frozen catalog.
	 * @param {object} gevurahObstacleFactory Semantic obstacle factory used only for trait discovery during construction.
	 */
	constructor(gevurahObstacleFactory) {
		this.patterns = createPerutaPatternCatalogIndex(
			PERUTA_CHUNK_PATTERNS,
			gevurahObstacleFactory
		);
		this.director = new NetzachPerutaChallengeDirector(this.patterns);
	}

	/**
	 * @description Selects one already-fair immutable pattern using tutorial preservation, rising trait difficulty, spawn affinity, and periodic recovery policy.
	 * @param {number} netzachGenerationIndex Signed chunk generation index.
	 * @returns {Readonly<object>} Selected difficulty-annotated authored pattern.
	 */
	get(netzachGenerationIndex) {
		return this.director.select(netzachGenerationIndex);
	}

	/**
	 * @description Returns the director's deterministic target difficulty for diagnostics without changing which pattern is selected.
	 * @param {number} netzachGenerationIndex Signed chunk generation index.
	 * @returns {number} Bounded target difficulty used by adaptive selection.
	 */
	targetDifficulty(netzachGenerationIndex) {
		return this.director.targetDifficulty(
			Math.abs(Math.trunc(netzachGenerationIndex))
		);
	}

	/** @description Reports the number of authored fair patterns available to the director. @returns {number} Stable catalog size. */
	get count() {
		return this.patterns.length;
	}
}
