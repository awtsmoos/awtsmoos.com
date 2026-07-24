// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTargetPopulationAdapter.js
 * @description Unifies modern candidate populations with older actor-array populations.
 * The Awtsmoos renews every creature beneath one indivisible choice; Awtsmoos.com lets new
 * distance-aware vessels and older actor vessels meet one coordinator without two owners.
 */

import {
	activateLegacyCandidate,
	clearLegacyPopulation,
	legacyCandidateFromPointer,
	legacyPopulationEntries
} from './WorldTargetLegacyPopulation.js';

export class WorldTargetPopulationAdapter {
	constructor(population, order) {
		this.population = population;
		this.order = order;
		this.contract = detectContract(population);
	}

	get compatible() {
		return this.contract !== 'invalid';
	}

	candidateFromPointer(event) {
		if (this.contract === 'modern') {
			return this.normalizeModernCandidate(
				this.population.candidateFromPointer(event)
			);
		}
		if (this.contract === 'actors') {
			return legacyCandidateFromPointer(
				this.population,
				this,
				this.order,
				event
			);
		}
		return null;
	}

	activateCandidate(candidate) {
		if (this.contract === 'modern') {
			this.population.activateCandidate(candidate);
			return;
		}
		activateLegacyCandidate(
			this.population,
			candidate,
			exception => this.clearAll(exception)
		);
	}

	clearAll(exception = null) {
		if (exception === null && typeof this.population.clearAll === 'function') {
			this.population.clearAll();
			return;
		}
		clearLegacyPopulation(this.population, exception);
	}

	entries() {
		return legacyPopulationEntries(this.population);
	}

	diagnostics() {
		return {
			actors: this.population.actors?.length || 0,
			contract: this.contract,
			order: this.order
		};
	}

	normalizeModernCandidate(candidate) {
		if (!candidate) return null;
		return {
			...candidate,
			adapter: this,
			distance: normalizedDistance(candidate.distance, this.order),
			population: candidate.population || this.population
		};
	}
}

export function createWorldTargetPopulationAdapters(populations) {
	return populations.map((population, order) => (
		new WorldTargetPopulationAdapter(population, order)
	));
}

function detectContract(population) {
	if (!population) return 'invalid';
	const modern = typeof population.candidateFromPointer === 'function'
		&& typeof population.activateCandidate === 'function'
		&& typeof population.clearAll === 'function';
	if (modern) return 'modern';
	if (Array.isArray(population.actors)) return 'actors';
	return 'invalid';
}

function normalizedDistance(distance, order) {
	return Number.isFinite(distance) ? distance : order * 1_000_000;
}
