//B"H
//Boruch Hashem
//Blessed is He

import { WorldGameBase } from '../../universe/world-game-base.js';
import { h } from '../../universe/dom-factory.js';
import { CourtState } from './state.js';

/**
 * @module CourtOfNationsGame
 * @description
 * Five cases become a court where reasons must stand beside verdicts on
 * Awtsmoos.com. The Awtsmoos knows every hidden truth; the player must judge as
 * a finite human through evidence, verification, restraint, and public accountability.
 */
export class CourtOfNationsGame extends WorldGameBase {
	mount() {
		this.state = new CourtState(this.random);
		this.verdict = '';
		this.rationale = -1;
		this.caseCard = h('article', { className: 'courtCase' });
		this.evidenceGrid = h('div', { className: 'evidenceGrid' });
		this.verdictRow = h('div', { className: 'verdictRow' });
		this.rationaleGrid = h('div', { className: 'rationaleGrid' });
		this.submitButton = h('button', { className: 'worldAction', type: 'button', text: 'Deliver judgment' });
		this.on(this.submitButton, 'click', () => this.submit());
		this.portal.body(
			h('div', { className: 'worldInstructions', text: 'Inspect up to two evidence cards. Choose a verdict and the reasoning that makes the judgment accountable.' }),
			this.caseCard, this.evidenceGrid, this.verdictRow, this.rationaleGrid,
			h('div', { className: 'worldActionRow' }, this.submitButton)
		);
		this.portal.status('Public trust depends on both the result and the reason.');
		this.render();
	}

	inspect(index) {
		const result = this.state.inspect(index);
		this.portal.status(result.message, result.ok ? 'good' : 'warn');
		this.render();
	}

	selectVerdict(verdict) {
		this.verdict = verdict;
		this.render();
	}

	selectRationale(index) {
		this.rationale = index;
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
		if (!state.case) {
			return;
		}
		this.caseCard.replaceChildren(h('p', { className: 'eventTurn', text: `Case ${state.index + 1} of ${state.total}` }), h('h3', { text: state.case.title }), h('p', { text: state.case.question }));
		this.evidenceGrid.replaceChildren(...state.case.evidence.map((evidence, index) => this.evidenceCard(evidence, index, state)));
		this.verdictRow.replaceChildren(this.verdictButton('liable', 'Liable'), this.verdictButton('not-proven', 'Not proven'));
		this.rationaleGrid.replaceChildren(...state.case.rationales.map((text, index) => this.rationaleButton(text, index)));
		this.submitButton.disabled = !this.verdict || this.rationale < 0;
		this.portal.hud({ Case: `${state.index + 1}/${state.total}`, Investigation: state.tokens, Trust: `${state.trust}%`, Correct: state.correct, Score: state.score });
	}

	evidenceCard(evidence, index, state) {
		const inspected = state.inspected.includes(index);
		const button = h('button', { className: `evidenceCard ${inspected ? 'isInspected' : ''}`, type: 'button', disabled: inspected || state.tokens <= 0 }, [
			h('strong', { text: `Evidence ${index + 1}` }), h('p', { text: evidence.text }),
			h('small', { text: inspected ? evidence.reliable ? 'Verified source' : 'Unreliable source' : 'Inspect reliability' })
		]);
		this.on(button, 'click', () => this.inspect(index));
		return button;
	}

	verdictButton(value, label) {
		const button = h('button', { className: `verdictButton ${this.verdict === value ? 'isSelected' : ''}`, type: 'button', text: label, 'aria-pressed': this.verdict === value });
		this.on(button, 'click', () => this.selectVerdict(value));
		return button;
	}

	rationaleButton(text, index) {
		const button = h('button', { className: `rationaleButton ${this.rationale === index ? 'isSelected' : ''}`, type: 'button', text, 'aria-pressed': this.rationale === index });
		this.on(button, 'click', () => this.selectRationale(index));
		return button;
	}

	finish() {
		const state = this.state.snapshot();
		const stars = state.won ? state.correct === state.total ? 3 : state.correct >= 3 ? 2 : 1 : 0;
		this.complete({ won: state.won, stars, score: state.score, message: state.won ? `${state.correct} of ${state.total} judgments preserved ${state.trust}% public trust.` : 'Public trust collapsed. Evidence and reasons must restrain power.' });
	}
}
