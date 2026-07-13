// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileControls.js
 * @description Phone-first controls with immediate input and change-aware rendering.
 *
 * The hand must answer now while the panel may wait a breath. The Awtsmoos renews
 * touch and image together; this vessel keeps movement immediate and avoids empty
 * DOM labor so the adventure remains gentle on phones at Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { missionProgressLine } from '../../missions/MissionRuntime.js';
import { BATTLE_BUTTONS, DIRECTION_BUTTONS, OVERWORLD_BUTTONS } from './MobileControlSchema.js';
import { MobileControlEvents } from './MobileControlEvents.js';
import { installCampaignStyles } from './CampaignStyles.js';
import { buttonHtml } from './MobileUiHelpers.js';
import { dialogueHtml } from './MobileDialogueView.js';
import { renderMobilePanel } from './MobilePanelRenderer.js';

const worldCard = () => '<aside class="ohr-world-card" aria-live="polite"><b>✦ Current Mission</b><span data-ohr-message></span></aside>';
const controlsHtml = () => `${worldCard()}
	<section class="ohr-joy">${DIRECTION_BUTTONS.map(buttonHtml).join('')}<div class="ohr-joy-core"></div></section>
	<section class="ohr-right-rail">${OVERWORLD_BUTTONS.slice(1, 5).map(buttonHtml).join('')}</section>
	<section class="ohr-bottom-actions">${OVERWORLD_BUTTONS.slice(5).map(buttonHtml).join('')}</section>
	<section class="ohr-menu-action">${buttonHtml(OVERWORLD_BUTTONS[0])}</section>
	<section class="ohr-battle-actions">${BATTLE_BUTTONS.map(buttonHtml).join('')}</section>
	<section class="ohr-panel-shell" data-ohr-panel></section>
	<section class="ohr-dialogue-shell" data-ohr-dialogue></section>`;

const assignDataset = (root, key, value) => {
	if (root.dataset[key] !== value) root.dataset[key] = value;
};

export class MobileControls {
	static root = null;
	static bound = false;
	static lastRender = 0;
	static renderIntervalMs = 50;

	static mount() {
		this.root = document.getElementById('ohr-ui-root');
		if (!this.root || this.bound) return;
		installCampaignStyles();
		this.root.innerHTML = controlsHtml();
		this.bound = true;
		MobileControlEvents.bind(this.root);
	}

	static update(time = performance.now()) {
		if (!this.root) return;
		MobileControlEvents.tickPulses();
		if (time - this.lastRender < this.renderIntervalMs) return;
		this.lastRender = time;
		assignDataset(this.root, 'realm', State.ActiveRealm === 'DEBATE' ? 'battle' : 'world');
		assignDataset(this.root, 'blocking', State.isUiBlocking() ? 'true' : 'false');
		this.renderMessage();
		renderMobilePanel(this.root.querySelector('[data-ohr-panel]'));
		this.renderDialogue();
	}

	static renderMessage() {
		const message = this.root.querySelector('[data-ohr-message]');
		const text = missionProgressLine();
		if (message && message.textContent !== text) message.textContent = text;
	}

	static renderDialogue() {
		const shell = this.root.querySelector('[data-ohr-dialogue]');
		if (!shell) return;
		const html = dialogueHtml();
		if (shell.__ohrDialogueHtml !== html) {
			shell.innerHTML = html;
			shell.__ohrDialogueHtml = html;
		}
		assignDataset(shell, 'open', State.Dialogue.open ? 'true' : 'false');
	}

	static releaseAll() {
		MobileControlEvents.releaseAll();
	}
}
