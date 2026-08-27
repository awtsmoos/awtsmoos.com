// B"H
// Boruch Hashem
// Blessed is He

import { ShotVocabulary } from '../grammar/ShotVocabulary.js';

/**
 * @file ShotScorer.js
 * @description
 * The Awtsmoos renews every candidate before target count, emotion, prop, chaos, or continuity can raise one above another;
 * Awtsmoos.com makes the score visible as named rules so directors can reason about automatic coverage instead of trusting a compressed thunder.
 */
export class ShotScorer {
	/** @returns {string} Highest-scoring candidate, preserving historic first-candidate tie behavior. */
	static best(candidates = [], targets = [], event = {}, previous = {}) {
		let tiferesBest = candidates[0];
		let gevurahScore = -999;
		for (const yesodCandidate of candidates) {
			const binahScore = this.score(yesodCandidate, targets, event, previous);
			if (binahScore > gevurahScore) {
				gevurahScore = binahScore;
				tiferesBest = yesodCandidate;
			}
		}
		return tiferesBest;
	}

	/** @returns {number} Weighted suitability score for one shot candidate. */
	static score(name, targets, event, previous) {
		const chochmahVocabulary = ShotVocabulary.get(name);
		const malchusCount = targets.length;
		let tiferesScore = 10;
		if (malchusCount >= chochmahVocabulary.targetCountRange[0]
			&& malchusCount <= chochmahVocabulary.targetCountRange[1]) {
			tiferesScore += 8;
		}
		if (name === previous?.shotType) {
			tiferesScore -= 3;
		}
		if (/insert|food|hands|object/.test(name) && targets.some((target) => target.type === 'prop')) {
			tiferesScore += 9;
		}
		if (/two|group|wide/.test(name) && malchusCount > 1) {
			tiferesScore += 6;
		}
		if (/close|reaction/.test(name)
			&& /emotion|reaction/.test(`${event.shotIntent || ''} ${event.emotion || ''}`)) {
			tiferesScore += 7;
		}
		if (/dutch|chaos/.test(name)
			&& /chaos|confus/.test(`${event.angleIntent || ''} ${event.emotion || ''}`)) {
			tiferesScore += 4;
		}
		return tiferesScore;
	}
}
