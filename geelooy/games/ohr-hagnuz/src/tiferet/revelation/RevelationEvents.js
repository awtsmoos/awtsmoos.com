// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RevelationEvents.js
 * @description Connects the revealed shell to the canonical game actions.
 * The Awtsmoos gives each vessel its boundary; this module keeps navigation,
 * collapse behavior, and learning prompts outside the visual renderer.
 */
import { State } from '../../binah/State.js';

const SHORTCUT_PANELS = Object.freeze({
	j: 'journal',
	m: 'map',
	p: 'party',
	i: 'items',
	k: 'craft'
});

const isTypingTarget = target => {
	const tagName = String(target?.tagName || '').toLowerCase();
	return target?.isContentEditable || ['input', 'textarea', 'select'].includes(tagName);
};

const openPanel = panel => {
	if (!panel) return;
	State.openPanel(panel);
};

const describeChannel = target => {
	const principle = target.dataset.channelPrinciple;
	const move = target.dataset.channelMove;
	if (!principle) return;
	State.say(`${move}: ${principle}`, 720);
};

/**
 * Owns shell-only browser events without intercepting movement controls.
 */
export class RevelationEvents {
	static root = null;
	static bound = false;
	static clickHandler = null;
	static keyHandler = null;

	static bind(root) {
		if (!root || this.bound) return;
		this.root = root;
		this.clickHandler = event => this.handleClick(event);
		this.keyHandler = event => this.handleKey(event);
		root.addEventListener('click', this.clickHandler);
		window.addEventListener('keydown', this.keyHandler);
		this.bound = true;
	}

	static handleClick(event) {
		const panelButton = event.target.closest('[data-revelation-panel]');
		if (panelButton) {
			openPanel(panelButton.dataset.revelationPanel);
			return;
		}

		const channelButton = event.target.closest('[data-revelation-channel]');
		if (channelButton) {
			describeChannel(channelButton);
			return;
		}

		if (event.target.closest('[data-revelation-collapse]')) {
			document.body.dataset.hudCollapsed = document.body.dataset.hudCollapsed === 'true'
				? 'false'
				: 'true';
		}
	}

	static handleKey(event) {
		if (isTypingTarget(event.target)) return;
		const key = String(event.key || '').toLowerCase();
		if (SHORTCUT_PANELS[key]) {
			event.preventDefault();
			openPanel(SHORTCUT_PANELS[key]);
			return;
		}
		if (key === 'escape' && State.UiPanel) {
			event.preventDefault();
			State.openPanel(State.UiPanel);
		}
	}

	static unbind() {
		if (!this.bound) return;
		this.root?.removeEventListener('click', this.clickHandler);
		window.removeEventListener('keydown', this.keyHandler);
		this.root = null;
		this.clickHandler = null;
		this.keyHandler = null;
		this.bound = false;
	}
}
