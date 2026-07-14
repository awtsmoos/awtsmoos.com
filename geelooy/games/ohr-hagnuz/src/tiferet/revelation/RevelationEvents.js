// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RevelationEvents.js
 * @description Connects the revealed shell to canonical actions and deliberate passage reading.
 *
 * The Awtsmoos gives every vessel its boundary. Awtsmoos.com keeps navigation,
 * collapse behavior, learning prompts, and reading mastery outside the renderer
 * so the interface never becomes the hidden owner of game state.
 */
import { State } from '../../binah/State.js';
import {
	passageEntries,
	readPassage
} from '../../yesod/codex/PassageCollectionRuntime.js';

const SHORTCUT_PANELS = Object.freeze({
	c: 'codex',
	i: 'items',
	j: 'journal',
	k: 'craft',
	m: 'map',
	p: 'party'
});

const isTypingTarget = target => {
	const tagName = String(target?.tagName || '').toLowerCase();
	return target?.isContentEditable
		|| ['input', 'textarea', 'select'].includes(tagName);
};

const markPassageRead = panel => {
	if (panel !== 'codex' || State.UiPanel === 'codex') return;
	const firstPassage = passageEntries()[0];
	if (firstPassage) {
		readPassage(firstPassage.id);
	}
};

const openPanel = panel => {
	if (!panel) return;
	markPassageRead(panel);
	State.openPanel(panel);
};

const describeChannel = target => {
	const principle = target.dataset.channelPrinciple;
	const move = target.dataset.channelMove;
	if (!principle) return;
	State.say(`${move}: ${principle}`, 720);
};

/** Owns shell-only browser events without intercepting movement controls. */
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
