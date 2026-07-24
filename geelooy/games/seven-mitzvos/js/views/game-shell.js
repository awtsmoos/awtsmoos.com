//B"H
//Boruch Hashem
//Blessed is He

import { GentleFeedback } from '../feedback/gentle-feedback.js';
import { resultMarkup } from './result-markup.js';

/**
 * @module GameShell
 * @description
 * One transparent vessel holds seven unlike worlds. The Awtsmoos renews canvas,
 * touch, sound, progress, and celebration, while Awtsmoos.com keeps every finite
 * game readable inside the same full-screen chamber.
 */
export class GameShell {
	constructor(root) {
		this.root = root;
		this.elements = this.collect(root);
		this.feedback = new GentleFeedback();
	}
	open(definition, progress, onBack) {
		this.root.hidden = false;
		this.root.style.setProperty('--mitzvah-hue', String(definition.hue));
		this.elements.back.onclick = onBack;
		this.elements.mitzvah.textContent = `${definition.number} · ${definition.title}`;
		this.elements.title.textContent = definition.gameTitle;
		this.elements.stage.replaceChildren();
		this.elements.controls.replaceChildren();
		this.elements.result.replaceChildren();
		this.elements.result.hidden = true;
		this.status(definition.controls);
		this.hud({ Best: progress.best, Stars: progress.stars });
	}
	get stageHost() {
		return this.elements.stage;
	}
	status(message, tone = '') {
		this.elements.status.textContent = message;
		this.elements.status.dataset.tone = tone;
		this.feedback.cue(tone);
	}
	hud(values) {
		const fragments = Object.entries(values).map(([label, value]) => {
			const item = document.createElement('span');
			item.innerHTML = `<small>${label}</small><strong>${value}</strong>`;
			return item;
		});
		this.elements.hud.replaceChildren(...fragments);
	}
	controls(actions) {
		const buttons = actions.map(action => {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = `controlButton ${action.kind || ''}`;
			button.textContent = action.label;
			button.disabled = Boolean(action.disabled);
			button.addEventListener('click', () => {
				this.feedback.tap(action.kind);
				action.run();
			});
			return button;
		});
		this.elements.controls.replaceChildren(...buttons);
	}
	result(result, progress, achievement, callbacks) {
		this.elements.result.hidden = false;
		this.elements.result.innerHTML = resultMarkup(result, progress, achievement);
		const actions = this.elements.result.querySelector('.resultActions');
		actions.append(
			this.actionButton('Next world →', callbacks.onNext),
			this.actionButton('Play again', callbacks.onReplay),
			this.actionButton('Seven worlds', callbacks.onBack)
		);
		this.feedback.celebrate();
	}
	error(message) {
		this.status(message, 'danger');
		this.controls([{
			label: 'Return to seven worlds',
			run: () => this.elements.back.click()
		}]);
	}
	close() {
		this.root.hidden = true;
		this.elements.stage.replaceChildren();
		this.elements.controls.replaceChildren();
		this.elements.result.replaceChildren();
	}
	destroy() {
		this.close();
		this.feedback.destroy();
	}
	actionButton(label, run) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'primaryButton';
		button.textContent = label;
		button.addEventListener('click', () => {
			this.feedback.tap();
			run();
		});
		return button;
	}
	collect(root) {
		return {
			back: root.querySelector('#gameBack'), mitzvah: root.querySelector('#gameMitzvah'),
			title: root.querySelector('#gameTitle3d'), hud: root.querySelector('#gameHud'),
			stage: root.querySelector('#stageHost'), status: root.querySelector('#gameStatus'),
			controls: root.querySelector('#gameControls'), result: root.querySelector('#gameResult')
		};
	}
}
