//B"H
//Boruch Hashem
//Blessed is He

import { WorldGameBase } from '../../universe/world-game-base.js';
import { TimerVessel } from '../../universe/timer-vessel.js';
import { h } from '../../universe/dom-factory.js';
import { LETTER_PADS, ROUND_MESSAGES } from './data.js';
import { WordsState } from './state.js';

/**
 * @module WordsOfCreationGame
 * @description
 * Light crosses four letters in a growing rhythm on Awtsmoos.com. The Awtsmoos
 * creates speech itself; the player answers not with noise, but with ordered
 * attention that remembers before it speaks.
 */
export class WordsOfCreationGame extends WorldGameBase {
	mount() {
		this.state = new WordsState(this.random);
		this.timers = new TimerVessel();
		this.pads = LETTER_PADS.map((pad, index) => this.createPad(pad, index));
		this.startButton = h('button', { className: 'worldAction', type: 'button', text: 'Begin sequence' });
		this.on(this.startButton, 'click', () => this.startRound());
		this.listenKeyboard(event => {
			const index = LETTER_PADS.findIndex(pad => pad.key === event.key || pad.alt === event.key.toLowerCase());
			if (index >= 0) {
				event.preventDefault();
				this.press(index);
			}
		});
		this.on(document, 'visibilitychange', () => {
			if (document.hidden) {
				this.timers.clear();
			} else if (!this.state.ended && this.state.sequence.length) {
				this.play(this.state.replay());
			}
		});
		this.portal.body(
			h('div', { className: 'worldInstructions', text: 'Watch the illuminated letters, then repeat the exact pattern. The chain grows each round.' }),
			h('div', { className: 'rhythmStage' }, this.pads),
			h('div', { className: 'worldActionRow' }, this.startButton)
		);
		this.render();
	}

	createPad(pad, index) {
		const button = h('button', { className: 'rhythmPad', type: 'button', 'aria-label': `${pad.name}, key ${pad.key}` }, [
			h('strong', { text: pad.symbol }), h('span', { text: `${pad.key} · ${pad.name}` })
		]);
		this.on(button, 'click', () => this.press(index));
		return button;
	}

	startRound() {
		if (this.state.phase !== 'ready') {
			return;
		}
		this.startButton.disabled = true;
		this.play(this.state.beginRound());
	}

	play(sequence) {
		this.timers.clear();
		this.disablePads(true);
		this.portal.status(ROUND_MESSAGES[Math.max(0, this.state.round - 1)] || 'Watch carefully.');
		this.timers.sequence(sequence, Math.max(260, 610 - this.state.round * 35), index => this.flash(index), () => {
			this.clearFlash();
			this.state.allowInput();
			this.disablePads(false);
			this.portal.status('Your turn. Repeat the complete pattern.', 'good');
		});
		this.render();
	}

	press(index) {
		const result = this.state.accept(index);
		this.flash(index);
		this.timers.set(() => this.clearFlash(), 150);
		this.portal.status(result.message, result.mistake ? 'warn' : 'good');
		this.render();
		if (this.state.ended) {
			this.finish();
		} else if (result.mistake) {
			this.timers.set(() => this.play(this.state.replay()), 700);
		} else if (result.complete) {
			this.timers.set(() => this.play(this.state.beginRound()), 650);
		}
	}

	flash(index) {
		this.clearFlash();
		this.pads[index]?.classList.add('isLit');
	}

	clearFlash() {
		this.pads.forEach(pad => pad.classList.remove('isLit'));
	}

	disablePads(disabled) {
		this.pads.forEach(pad => { pad.disabled = disabled; });
	}

	render() {
		const state = this.state.snapshot();
		this.portal.hud({ Round: `${Math.max(1, state.round)}/${state.totalRounds}`, Hearts: '♥'.repeat(state.lives), Chain: state.sequence.length, Streak: state.streak, Score: state.score });
	}

	finish() {
		const state = this.state.snapshot();
		this.complete({ won: state.won, stars: state.won ? state.lives : 0, score: state.score, message: state.won ? 'Every letter remained in its place through the final sequence.' : 'The chain broke. Begin again and let attention lead speech.' });
	}

	destroy() {
		this.timers?.clear();
		super.destroy();
	}
}
