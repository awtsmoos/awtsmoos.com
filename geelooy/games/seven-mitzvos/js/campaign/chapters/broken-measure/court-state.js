//B"H
//Boruch Hashem
//Blessed is He

import { createCourtCase } from './court-content.js';

/**
 * @module BrokenMeasureCourtState
 * @description
 * A verdict must travel through findings on Awtsmoos.com. The Awtsmoos needs no
 * rationale, yet a human court must show admissibility, custody, rumor limits,
 * measurable harm, the accused person, and the exact reason for public power.
 */
export class BrokenMeasureCourtState {
	constructor(configuration) {
		this.case = createCourtCase(configuration.previous);
		this.index = 0;
		this.trust = 72;
		this.score = 0;
		this.correct = 0;
		this.tokens = 6;
		this.inspected = new Set();
		this.findings = {};
		this.outcome = {};
		this.ended = false;
		this.won = false;
	}

	current() {
		return this.ended ? null : this.case;
	}

	inspect(index) {
		const evidence = this.case.evidence[index];
		if (!evidence || this.inspected.has(index) || this.tokens <= 0 || this.ended) {
			return failure('Choose uninspected evidence while investigation tokens remain.');
		}
		this.tokens -= 1;
		this.inspected.add(index);
		const message = evidence.reliable
			? `${evidence.title}: verified ${evidence.kind}.`
			: `${evidence.title}: unreliable rumor.`;
		return success(message);
	}

	setFinding(id, value) {
		const known = ['admissible', 'custody', 'rumorReliable', 'measurableHarm'].includes(id);
		if (!known || typeof value !== 'boolean') {
			return failure('Choose a visible legal finding.');
		}
		this.findings[id] = value;
		return success('Legal finding recorded.');
	}

	submit(verdict, rationaleIndex) {
		const knownVerdict = this.case.verdicts.some(item => item.id === verdict);
		if (!knownVerdict || !Number.isInteger(rationaleIndex) || Object.keys(this.findings).length < 4) {
			return failure('Inspect evidence, answer all four findings, then choose a verdict and rationale.');
		}
		const correctFindings = this.findings.admissible === true
			&& this.findings.custody === true
			&& this.findings.rumorReliable === false
			&& this.findings.measurableHarm === true;
		const correctVerdict = verdict === 'false-grain-liable';
		const correctRationale = rationaleIndex === 0 && correctFindings;
		const falseAccusation = verdict === 'honest-grain-liable';
		this.outcome = { correctVerdict, correctRationale, falseAccusation, findings: { ...this.findings }, verdict, rationaleIndex };
		this.correct = correctVerdict && correctRationale ? 1 : 0;
		this.trust += correctRationale ? 18 : falseAccusation ? -35 : correctVerdict ? -8 : -18;
		this.score = Math.max(0, (correctVerdict ? 300 : 0) + (correctRationale ? 400 : 0));
		this.index = 1;
		this.ended = true;
		this.won = !falseAccusation && this.trust > 0;
		return { ok: correctVerdict && correctRationale, completeCase: true, message: this.explanation() };
	}

	resultDetails() {
		return { completed: this.ended, ...this.outcome };
	}

	snapshot() {
		return {
			case: this.current(),
			index: this.index,
			total: 1,
			trust: this.trust,
			score: this.score,
			correct: this.correct,
			inspected: [...this.inspected],
			tokens: this.tokens,
			findings: { ...this.findings },
			verdicts: this.case.verdicts,
			ended: this.ended,
			won: this.won
		};
	}

	explanation() {
		if (this.outcome.correctRationale) {
			return 'The verdict follows admissible weight, preserved custody, verified records, and measurable harm.';
		}
		if (this.outcome.falseAccusation) {
			return 'The honest merchant was falsely accused; low price and rumor are not proof.';
		}
		if (this.outcome.correctVerdict) {
			return 'The defendant is correct, but the reasoning did not establish all visible legal findings.';
		}
		return 'The visible evidence supports Marek, not rumor or suspicion, as the liable merchant.';
	}
}

function success(message) {
	return { ok: true, message };
}

function failure(message) {
	return { ok: false, message };
}
