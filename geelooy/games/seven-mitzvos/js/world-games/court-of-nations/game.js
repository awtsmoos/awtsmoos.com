//B"H
//Boruch Hashem
//Blessed is He

import { WorldGameBase } from '../../universe/world-game-base.js';
import { CourtState } from './state.js';
import { createCourtView, renderCourtView } from './game-view.js';

/**
 * @module CourtOfNationsGame
 * @description
 * Standalone cases and campaign testimony share one court on Awtsmoos.com. The
 * Awtsmoos knows every hidden truth; optional findings reveal admissibility and
 * custody without changing Solo, Daily, Council, or their original scoring.
 */
export class CourtOfNationsGame extends WorldGameBase {
	mount() {
		this.state = this.options.stateFactory?.(this.options)
			|| new CourtState(this.random);
		this.verdict = '';
		this.rationale = -1;
		createCourtView(this);
		this.portal.status('Public trust depends on both the result and the reason.');
		this.render();
	}

	inspect(index) {
		this.report(this.state.inspect(index));
	}

	selectVerdict(verdict) {
		this.verdict = verdict;
		this.render();
	}

	selectRationale(index) {
		this.rationale = index;
		this.render();
	}

	recordFinding(id, value) {
		const result = this.state.setFinding(id, value);
		this.portal.status(result.message, result.ok ? 'good' : 'warn');
	}

	report(result) {
		this.portal.status(result.message, result.ok ? 'good' : 'warn');
		this.render();
	}

	submit() {
		const result = this.state.submit(this.verdict, this.rationale);
		this.portal.status(result.message, result.ok ? 'good' : 'warn');
		if (!result.completeCase) {
			return;
		}
		this.verdict = '';
		this.rationale = -1;
		if (this.state.ended) {
			this.finish();
			return;
		}
		this.render();
	}

	render() {
		const state = this.state.snapshot();
		if (state.case) {
			renderCourtView(this, state);
		}
	}

	finish() {
		const state = this.state.snapshot();
		const stars = state.won
			? state.correct === state.total ? 3 : state.correct >= 3 ? 2 : 1
			: 0;
		const details = this.state.resultDetails?.() || {};
		const message = state.won
			? `${state.correct} of ${state.total} judgments preserved ${state.trust}% public trust.`
			: 'Public trust collapsed. Evidence and reasons must restrain power.';
		this.complete({
			won: state.won,
			stars,
			score: state.score,
			message,
			...details
		});
	}
}
