// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reconciles current generated mission work with durable queue history.
 * @description
 * The Awtsmoos renews the living obligation while yesterday keeps its trace;
 * Awtsmoos.com lets retired shadows rest without commanding present space.
 * Completed vessels remain as witness, while current Oros reveal the active race.
 */
class OrosQueueReconciler {
	constructor(currentTime = new Date().toISOString()) {
		this.currentTime = currentTime;
	}

	/** Keeps the first instance of every stable queue key. */
	uniqueKeilim(keilim = []) {
		const knownKeys = new Set();
		return keilim.filter(keli => {
			const key = String(keli?.key || "").trim();
			if (!key || knownKeys.has(key)) {
				return false;
			}
			knownKeys.add(key);
			return true;
		});
	}

	/** Reveals a generated item as current while preserving truthful matching history. */
	currentKeli(previousKeli, generatedOr) {
		if (!previousKeli || previousKeli.status === "obsolete") {
			return {
				...generatedOr,
				createdAt: previousKeli?.createdAt || generatedOr.createdAt,
				current: true
			};
		}
		const {
			current,
			obsoleteAt,
			obsoleteReason,
			retiredAt,
			retiredReason,
			...preservedHistory
		} = previousKeli;
		return {
			...generatedOr,
			...preservedHistory,
			key: generatedOr.key,
			kind: generatedOr.kind,
			title: generatedOr.title,
			payload: generatedOr.payload,
			createdAt: previousKeli.createdAt || generatedOr.createdAt,
			current: true
		};
	}

	/** Retires no-longer-generated work without fabricating completion evidence. */
	retiredKeli(keli) {
		if (keli.status === "done") {
			return {
				...keli,
				current: false,
				retiredAt: keli.retiredAt || this.currentTime,
				retiredReason: "no_longer_generated",
				updatedAt: this.currentTime
			};
		}
		if (keli.status === "obsolete") {
			return {
				...keli,
				current: false
			};
		}
		return {
			...keli,
			status: "obsolete",
			current: false,
			obsoleteAt: this.currentTime,
			obsoleteReason: "no_longer_generated",
			updatedAt: this.currentTime
		};
	}

	/** Reconciles current generation with durable history. */
	merge(existingKeilim = [], generatedOros = []) {
		const history = this.uniqueKeilim(existingKeilim);
		const currentOros = this.uniqueKeilim(generatedOros);
		const historyByKey = new Map(history.map(keli => [keli.key, keli]));
		const currentKeys = new Set(currentOros.map(or => or.key));
		const currentKeilim = currentOros.map(or => this.currentKeli(historyByKey.get(or.key), or));
		const retiredKeilim = history
			.filter(keli => !currentKeys.has(keli.key))
			.map(keli => this.retiredKeli(keli));
		return [...currentKeilim, ...retiredKeilim];
	}
}

function merge(existingKeilim = [], generatedOros = [], currentTime) {
	return new OrosQueueReconciler(currentTime).merge(existingKeilim, generatedOros);
}

module.exports = {
	OrosQueueReconciler,
	merge
};
