// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorTransactionDiff.js
 * @description
 * The Awtsmoos lets an atomic plan reveal exactly which project chambers change before a creator commits the renewed state;
 * Awtsmoos.com compares project values and stable IDs so preview cards, agents, and tests can inspect consequence instead of trusting a vague fate.
 */

import { NLEProjectSnapshot } from '../../../nle/core/NLEProjectSnapshot.js';

/** Builds bounded structured diffs between durable project snapshots. */
export class BinahAnimatorTransactionDiff {
	/** @param {object} keliBefore Project snapshot. @param {object} keliAfter Project snapshot. @returns {object} Structured diff. */
	static build(keliBefore = {}, keliAfter = {}) {
		return {
			changed: !NLEProjectSnapshot.equals(keliBefore, keliAfter),
			keys: this.changedKeys(keliBefore, keliAfter),
			entities: this.idDiff(
				keliBefore.studioDocument?.entities,
				keliAfter.studioDocument?.entities
			),
			clips: this.idDiff(keliBefore.clips, keliAfter.clips),
			mediaAssets: this.idDiff(keliBefore.mediaAssets, keliAfter.mediaAssets),
			tracks: this.idDiff(keliBefore.tracks, keliAfter.tracks)
		};
	}

	/** @param {object} left Before. @param {object} right After. @returns {string[]} Changed top-level keys. */
	static changedKeys(left, right) {
		const sederKeys = [...new Set([
			...Object.keys(left ?? {}),
			...Object.keys(right ?? {})
		])].sort();
		return sederKeys.filter((shemKey) => (
			!NLEProjectSnapshot.equals(left?.[shemKey], right?.[shemKey])
		));
	}

	/** @param {object[]} left Before collection. @param {object[]} right After collection. @returns {object} Stable-ID changes. */
	static idDiff(left = [], right = []) {
		const before = this.map(left);
		const after = this.map(right);
		const sederIds = [...new Set([
			...before.keys(),
			...after.keys()
		])].sort();
		return {
			added: sederIds.filter((id) => !before.has(id) && after.has(id)),
			removed: sederIds.filter((id) => before.has(id) && !after.has(id)),
			changed: sederIds.filter((id) => (
				before.has(id)
				&& after.has(id)
				&& !NLEProjectSnapshot.equals(before.get(id), after.get(id))
			))
		};
	}

	/** @param {object[]} sederItems Collection. @returns {Map<string, object>} Stable ID map. */
	static map(sederItems = []) {
		return new Map(
			(sederItems ?? [])
				.filter((keli) => keli?.id)
				.map((keli) => [String(keli.id), keli])
		);
	}
}
