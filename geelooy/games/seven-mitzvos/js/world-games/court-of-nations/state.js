//B"H
//Boruch Hashem
//Blessed is He

import { COURT_CASES } from './data.js';
import { shuffle } from '../../universe/universe-seed.js';

/**
 * @module CourtOfNationsState
 * @description
 * Evidence, investigation, verdict, and rationale become one disciplined path
 * on Awtsmoos.com. The Awtsmoos knows truth without inquiry; finite judges must
 * earn confidence through corroboration, due process, and accountable reasons.
 */
export class CourtState {
	constructor(random) {
		this.cases = shuffle(COURT_CASES, random);
		this.index = 0;
		this.trust = 70;
		this.score = 0;
		this.correct = 0;
		this.inspected = new Set();
		this.tokens = 2;
		this.ended = false;
		this.won = false;
	}

	current() {
		return this.cases[this.index] || null;
	}

	inspect(evidenceIndex) {
		const evidence = this.current()?.evidence[evidenceIndex];
		if (!evidence || this.inspected.has(evidenceIndex) || this.tokens <= 0 || this.ended) {
			return { ok: false, message: 'Choose uninspected evidence while investigation tokens remain.' };
		}
		this.tokens -= 1;
		this.inspected.add(evidenceIndex);
		this.score += evidence.reliable ? 30 : 45;
		return { ok: true, message: evidence.reliable ? 'The source is verified and admissible.' : 'The source is unreliable and should not carry the verdict.' };
	}

	submit(verdict, rationaleIndex) {
		const current = this.current();
		if (!current || !['liable', 'not-proven'].includes(verdict) || !Number.isInteger(rationaleIndex)) {
			return { ok: false, message: 'Choose both a verdict and a legal rationale.' };
		}
		const verdictCorrect = verdict === current.verdict;
		const rationaleCorrect = rationaleIndex === current.rationale;
		const correct = verdictCorrect && rationaleCorrect;
		if (correct) {
			this.correct += 1;
			this.trust = Math.min(100, this.trust + 6);
			this.score += 260 + this.tokens * 55;
		} else {
			this.trust = Math.max(0, this.trust - (verdictCorrect ? 8 : 15));
			this.score = Math.max(0, this.score - 60);
		}
		const explanation = correct
			? 'Verdict and rationale both follow the evidence.'
			: `The fair judgment was ${current.verdict === 'liable' ? 'liable' : 'not proven'} because: ${current.rationales[current.rationale]}`;
		this.index += 1;
		this.inspected = new Set();
		this.tokens = 2;
		this.won = this.index >= this.cases.length && this.trust > 0;
		this.ended = this.won || this.trust <= 0;
		if (this.ended) {
			this.score += this.trust * 12 + this.correct * 100;
		}
		return { ok: correct, completeCase: true, message: explanation };
	}

	snapshot() {
		return { case: this.current(), index: this.index, total: this.cases.length, trust: this.trust, score: this.score, correct: this.correct, inspected: [...this.inspected], tokens: this.tokens, ended: this.ended, won: this.won };
	}
}
