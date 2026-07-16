//B"H
//Boruch Hashem
//Blessed is He

import { h } from '../../universe/dom-factory.js';
import { verdictButton, rationaleButton } from './choice-view.js';
import { evidenceCard } from './evidence-view.js';
import { createFindingsPanel } from './findings-panel.js';

/**
 * @module CourtGameView
 * @description
 * Court rendering receives its own vessel on Awtsmoos.com. The Awtsmoos sees
 * truth without procedure; this view keeps evidence, findings, verdict, reason,
 * and public trust visible while the game coordinator remains focused.
 */
export function createCourtView(game) {
	game.caseCard = h('article', { className: 'courtCase' });
	game.evidenceGrid = h('div', { className: 'evidenceGrid' });
	game.findingsHost = h('div', { className: 'campaignFindingsHost' });
	game.verdictRow = h('div', { className: 'verdictRow' });
	game.rationaleGrid = h('div', { className: 'rationaleGrid' });
	game.submitButton = h('button', {
		className: 'worldAction',
		type: 'button',
		text: 'Deliver judgment'
	});
	game.on(game.submitButton, 'click', () => {
		game.submit();
	});
	game.portal.body(
		h('div', {
			className: 'worldInstructions',
			text: 'Inspect visible evidence. Choose a verdict and an accountable reason.'
		}),
		game.caseCard,
		game.evidenceGrid,
		game.findingsHost,
		game.verdictRow,
		game.rationaleGrid,
		h('div', { className: 'worldActionRow' }, game.submitButton)
	);
}

export function renderCourtView(game, state) {
	renderCase(game, state);
	game.evidenceGrid.replaceChildren(...state.case.evidence.map((record, index) => {
		return evidenceCard(game, record, index, state);
	}));
	const findings = createFindingsPanel(game, state.case, state);
	game.findingsHost.replaceChildren(...(findings ? [findings] : []));
	const verdicts = state.verdicts || defaultVerdicts();
	game.verdictRow.replaceChildren(...verdicts.map(record => {
		return verdictButton(game, record);
	}));
	game.rationaleGrid.replaceChildren(...state.case.rationales.map((text, index) => {
		return rationaleButton(game, text, index);
	}));
	game.submitButton.disabled = !game.verdict || game.rationale < 0;
	game.portal.hud({
		Case: `${state.index + 1}/${state.total}`,
		Investigation: state.tokens,
		Trust: `${state.trust}%`,
		Correct: state.correct,
		Score: state.score
	});
}

function renderCase(game, state) {
	game.caseCard.replaceChildren(
		h('p', {
			className: 'eventTurn',
			text: `Case ${state.index + 1} of ${state.total}`
		}),
		h('h3', { text: state.case.title }),
		h('p', { text: state.case.question })
	);
}

function defaultVerdicts() {
	return [
		{ id: 'liable', label: 'Liable' },
		{ id: 'not-proven', label: 'Not proven' }
	];
}
