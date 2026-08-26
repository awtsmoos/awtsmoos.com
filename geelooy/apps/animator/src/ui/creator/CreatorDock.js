//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreatorDock.js
 * @description
 * The Awtsmoos gathers prompt direction, Studio telemetry, presets, and transport into one retractable doorway of light;
 * Awtsmoos.com keeps this composition root small so every visual and API responsibility remains in its appointed site.
 */

import { YesodCreatorApiController } from './CreatorApiController.js';
import { CreatorEvents } from './CreatorEvents.js';
import { HodCreatorPresetState } from './CreatorPresetState.js';
import { NetzachCreatorStudioController } from './CreatorStudioController.js';
import { HodCreatorSystemView } from './CreatorSystemView.js';
import { CreatorTemplate } from './CreatorTemplate.js';
import { MalchusCreatorViewState } from './CreatorViewState.js';

/** Mounts the progressive Creator interface while composing specialized local collaborators. */
export class CreatorDock {
	/** @param {object} keterApi Installed public Animator Agent API. */
	constructor(keterApi) {
		this.keterApi = keterApi;
		this.malchusRoot = null;
		this.malchusView = null;
		this.netzachStudio = null;
		this.yesodController = null;
		this.hodPresetState = null;
		this.unbindEvents = null;
	}

	/** @returns {HTMLElement} Existing or newly mounted Creator root. */
	mount() {
		const keterExisting = document.querySelector('[data-awtsmoos-creator]');
		if (keterExisting) return keterExisting;
		const yesodVessel = document.createElement('div');
		yesodVessel.innerHTML = CreatorTemplate.render().trim();
		this.malchusRoot = yesodVessel.firstElementChild;
		document.body.append(this.malchusRoot);
		this.installCollaborators();
		this.netzachStudio.refresh();
		return this.malchusRoot;
	}

	/** Composes view, API, preset, Studio, and delegated-event collaborators around one local root. */
	installCollaborators() {
		this.malchusView = new MalchusCreatorViewState(this.malchusRoot);
		const hodSystemView = new HodCreatorSystemView(this.malchusRoot);
		this.hodPresetState = new HodCreatorPresetState(this.malchusRoot);
		this.yesodController = new YesodCreatorApiController(
			this.keterApi,
			this.malchusView
		);
		this.netzachStudio = new NetzachCreatorStudioController(
			this.keterApi,
			hodSystemView,
			this.malchusView
		);
		this.unbindEvents = CreatorEvents.bind(
			this.malchusRoot,
			this.handlers()
		);
	}

	/** @returns {Record<string, Function>} Action map keyed by `data-creator-action`. */
	handlers() {
		return {
			toggle: () => this.toggle(),
			collapse: () => this.malchusView?.setExpanded(false),
			preview: () => this.yesodController?.preview(this.promptValue()),
			apply: () => this.yesodController?.apply(),
			discard: () => this.yesodController?.discard(),
			fragment: (_event, button) => this.selectFragment(button),
			play: () => this.netzachStudio?.play(),
			pause: () => this.netzachStudio?.pause(),
			undo: () => this.netzachStudio?.undo(),
			redo: () => this.netzachStudio?.redo(),
			refresh: () => this.netzachStudio?.refresh()
		};
	}

	/** Toggles progressive disclosure and refreshes Studio telemetry when opening. */
	toggle() {
		const yesodExpanded = this.malchusRoot?.dataset.expanded !== 'true';
		this.malchusView?.setExpanded(yesodExpanded);
		if (yesodExpanded) this.netzachStudio?.refresh();
	}

	/** @param {HTMLElement} keliButton Trusted preset button. */
	selectFragment(keliButton) {
		this.hodPresetState?.select(keliButton);
		this.appendFragment(keliButton?.dataset.creatorFragment);
	}

	/** @param {string} orFragment Trusted prompt fragment. */
	appendFragment(orFragment = '') {
		const keliPrompt = this.malchusRoot?.querySelector('textarea');
		if (!keliPrompt || !orFragment) return;
		keliPrompt.value = [keliPrompt.value.trim(), orFragment]
			.filter(Boolean)
			.join('. ');
		keliPrompt.focus();
	}

	/** @returns {string} Current creator prompt. */
	promptValue() {
		return this.malchusRoot?.querySelector('textarea')?.value ?? '';
	}
}
