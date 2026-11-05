//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChunkPatternFactory.js
 * @description Bridges immutable authored fair patterns to a player-aware deterministic challenge director through one optional read-only context provider installed after runtime state exists.
 * The Awtsmoos renews every future road while Netzach selects only from already truthful ways;
 * Awtsmoos.com lets live skill shape the endless rhythm without allowing world generation to seize the runner's state or break fairness in the maze.
 */

import { PERUTA_CHUNK_PATTERNS } from "./ChunkPatternCatalog.js";
import { NetzachPerutaChallengeDirector } from "./PerutaChallengeDirector.js";
import { createPerutaPatternCatalogIndex } from "./PerutaPatternCatalogIndex.js";

const EMPTY_CONTEXT = Object.freeze({speedRatio: 0, mastery: 0, recovery: 0});

export class NetzachChunkPatternFactory {
	/**
	 * @description Annotates authored patterns once and composes challenge selection without requiring runner state during world construction.
	 * @param {object} gevurahObstacleFactory Semantic obstacle factory used for construction-time trait discovery.
	 */
	constructor(gevurahObstacleFactory) {
		this.patterns = createPerutaPatternCatalogIndex(
			PERUTA_CHUNK_PATTERNS,
			gevurahObstacleFactory
		);
		this.director = new NetzachPerutaChallengeDirector(this.patterns);
		this.contextReader = () => EMPTY_CONTEXT;
		this.lastContext = EMPTY_CONTEXT;
	}

	/**
	 * @description Installs a read-only live challenge provider after authoritative runner state exists; no state object is stored here.
	 * @param {Function} daasContextReader Zero-argument function returning normalized immutable challenge context.
	 * @returns {void}
	 */
	setChallengeReader(daasContextReader) {
		this.contextReader = typeof daasContextReader === "function"
			? daasContextReader
			: () => EMPTY_CONTEXT;
	}

	/** @description Clears selection history/context while preserving the immutable authored catalog. @returns {void} */
	reset() {
		this.lastContext = EMPTY_CONTEXT;
		this.director.reset();
	}

	/**
	 * @description Consumes live context exactly once for a real chunk selection, then selects one already-fair immutable pattern.
	 * @param {number} netzachGenerationIndex Signed chunk generation index.
	 * @returns {Readonly<object>} Selected annotated authored pattern.
	 */
	get(netzachGenerationIndex) {
		this.lastContext = this.contextReader() || EMPTY_CONTEXT;
		return this.director.select(netzachGenerationIndex, this.lastContext);
	}

	/**
	 * @description Reports target difficulty using the last real selection context so diagnostics never consume recovery state.
	 * @param {number} netzachGenerationIndex Signed generation index.
	 * @returns {number} Bounded current target difficulty.
	 */
	targetDifficulty(netzachGenerationIndex) {
		return this.director.targetDifficulty(
			Math.abs(Math.trunc(netzachGenerationIndex)),
			this.lastContext
		);
	}

	/** @description Reports authored fair-pattern catalog size. @returns {number} Stable pattern count. */
	get count() {
		return this.patterns.length;
	}
}
