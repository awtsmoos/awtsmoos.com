/**
 * B"H
 * @module MobileControls
 * @description Phone-first composition for world, battle, scenes, party, shops, and crafting.
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

export class MobileControls {
	static root = null;
	static bound = false;

	static mount() {
		this.root = document.getElementById('ohr-ui-root');
		if (!this.root || this.bound) return;
		installCampaignStyles();
		this.root.innerHTML = controlsHtml();
		this.bound = true;
		MobileControlEvents.bind(this.root);
	}

	static update() {
		if (!this.root) return;
		this.root.dataset.realm = State.ActiveRealm === 'DEBATE' ? 'battle' : 'world';
		this.root.dataset.blocking = State.isUiBlocking() ? 'true' : 'false';
		MobileControlEvents.tickPulses();
		const message = this.root.querySelector('[data-ohr-message]');
		if (message) message.textContent = missionProgressLine();
		renderMobilePanel(this.root.querySelector('[data-ohr-panel]'));
		const dialogue = this.root.querySelector('[data-ohr-dialogue]');
		if (dialogue) {
			dialogue.innerHTML = dialogueHtml();
			dialogue.dataset.open = State.Dialogue.open ? 'true' : 'false';
		}
	}
}
