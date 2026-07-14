//B"H
//Boruch Hashem
//Blessed is He

import { GameAnswerFactory } from './game-answer-factory.js';
import { GameHud } from './game-hud.js';

/**
 * @module GameView
 * @description
 * The board makes moral recognition immediate on Awtsmoos.com. The Awtsmoos
 * gives dignity to every player, so touch, mouse, and keyboard share one clear
 * path through the game.
 */
export class GameView {
	/** @param {Object} elements Required game DOM elements. */
	constructor(elements) {
		this.elements = elements;
		this.factory = new GameAnswerFactory();
		this.hud = new GameHud(elements);
		this.active = false;
		this.answerHandler = () => {};
		this.handleKey = this.handleKey.bind(this);
		document.addEventListener('keydown', this.handleKey);
	}

	/** @param {() => void} handler Start or restart callback. */
	bindStart(handler) {
		this.elements.launch.addEventListener('click', handler);
		this.elements.start.addEventListener('click', handler);
	}

	/** @param {(number: string) => void} handler Answer callback. */
	bindAnswer(handler) {
		this.answerHandler = handler;
	}

	/** @param {number} best Persisted best score. */
	showRound(best) {
		this.active = true;
		this.elements.section.scrollIntoView({ behavior: this.motionBehavior(), block: 'center' });
		this.elements.start.textContent = 'Restart round';
		this.elements.board.className = 'gameBoard isPlaying';
		this.hud.setBest(best);
	}

	/** @param {Object} question @param {Object} state */
	renderQuestion(question, state) {
		this.active = true;
		this.elements.board.classList.remove('flashCorrect', 'flashWrong');
		this.elements.prompt.textContent = question.scenario.text;
		this.elements.feedback.textContent = 'Choose the foundation that protects this moment.';
		const buttons = question.choices.map((choice, index) => {
			return this.factory.create(choice, index, number => this.answerHandler(number));
		});
		this.elements.answers.replaceChildren(...buttons);
		this.hud.update(state);
		this.hud.restartTimeBar();
		buttons[0]?.focus({ preventScroll: true });
	}

	/** @param {Object} outcome @param {string} correctNumber @param {string} correctTitle */
	reveal(outcome, correctNumber, correctTitle) {
		this.active = false;
		for (const button of this.elements.answers.querySelectorAll('button')) {
			button.disabled = true;
			button.classList.toggle('isCorrect', button.dataset.mitzvah === correctNumber);
			button.classList.toggle('isWrong', !outcome.correct && button.dataset.chosen === 'true');
		}
		this.elements.feedback.textContent = outcome.correct
			? `Protected. +${outcome.gained.toLocaleString()} points.`
			: `The protecting foundation is: ${correctTitle}.`;
		this.elements.board.classList.add(outcome.correct ? 'flashCorrect' : 'flashWrong');
		this.hud.update(outcome);
	}

	/** @param {Object} state @param {number} best @param {boolean} newBest */
	showSummary(state, best, newBest) {
		this.active = false;
		this.elements.board.className = 'gameBoard isSummary';
		this.elements.prompt.textContent = `${state.correct} of ${state.total} moments protected.`;
		this.elements.answers.replaceChildren();
		this.elements.feedback.textContent = newBest
			? `New best score: ${best.toLocaleString()}. The world is brighter.`
			: `Score ${state.score.toLocaleString()}. Best ${best.toLocaleString()}. Play again and sharpen the streak.`;
		this.elements.start.textContent = 'Play again';
		this.hud.setBest(best);
		this.hud.update(state);
	}

	/** @param {KeyboardEvent} event */
	handleKey(event) {
		if (!this.active || !['1', '2', '3'].includes(event.key)) {
			return;
		}
		this.elements.answers.querySelectorAll('button')[Number(event.key) - 1]?.click();
	}

	/** @returns {'smooth'|'auto'} */
	motionBehavior() {
		return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
	}
}
