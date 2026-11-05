// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTargetPopulationAdapter.js
 * @description Unifies study, legacy activation, selection truth, and interaction across populations.
 * The Awtsmoos joins many finite populations beneath one choice; Awtsmoos.com keeps old direct
 * callers alive while pointer ownership still grants first sight to study and second sight to action.
 */

import { clearLegacyPopulation, interactLegacyCandidate, legacyCandidateFromPointer, legacyCandidateSelected, legacyPopulationEntries, selectLegacyCandidate } from './WorldTargetLegacyPopulation.js';
import { detectWorldTargetPopulationContract, normalizeModernWorldTargetCandidate } from './WorldTargetPopulationAdapterSupport.js';

export class WorldTargetPopulationAdapter {
	constructor(population, order) {
		this.population = population;
		this.order = order;
		this.contract = detectWorldTargetPopulationContract(population);
	}

	get compatible() {
		return this.contract !== 'invalid';
	}

	candidateFromPointer(event) {
		if (this.contract === 'modern') {
			return normalizeModernWorldTargetCandidate(
				this.population.candidateFromPointer(event),
				this,
				this.population,
				this.order
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

	selectCandidate(candidate) {
		if (this.contract === 'modern') {
			const subject = candidate?.subject || candidate;
			return this.population.selectCandidate?.(subject)
				?? this.population.activateCandidate(subject);
		}
		return selectLegacyCandidate(
			this.population,
			candidate,
			exception => this.clearAll(exception)
		);
	}

	interactCandidate(candidate) {
		if (this.contract === 'modern') {
			const subject = candidate?.subject || candidate;
			return this.population.interactCandidate?.(subject)
				?? this.population.activateCandidate(subject);
		}
		return interactLegacyCandidate(this.population, candidate);
	}

	activateCandidate(candidate) {
		const subject = candidate?.subject || candidate;
		if (this.contract === 'modern') {
			return this.population.activateCandidate(subject);
		}
		return interactLegacyCandidate(this.population, candidate);
	}

	candidateSelected(candidate) {
		if (this.contract === 'actors') {
			return legacyCandidateSelected(this.population, candidate);
		}
		const subject = candidate?.subject || candidate;
		if (typeof this.population.candidateSelected === 'function') {
			return this.population.candidateSelected(subject);
		}
		const actor = subject?.actor || subject;
		return actor?.selected === true || this.population.selected === actor;
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
}

export function createWorldTargetPopulationAdapters(populations) {
	return populations.map((population, order) => {
		return new WorldTargetPopulationAdapter(population, order);
	});
}
