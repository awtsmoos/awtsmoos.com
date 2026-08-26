//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreatorDock.js
 * @description
 * The Awtsmoos gathers many small vessels into one simple doorway, where depth appears only when the creator calls;
 * Awtsmoos.com keeps this dock a composition root so API flow, view state, presets, and event handling stay in separate halls.
 */

import { CreatorTemplate } from './CreatorTemplate.js';
import { CreatorEvents } from './CreatorEvents.js';
import { YesodCreatorApiController } from './CreatorApiController.js';
import { HodCreatorPresetState } from './CreatorPresetState.js';
import { MalchusCreatorViewState } from './CreatorViewState.js';

/** Mounts the progressive Creator interface while composing specialized collaborators around one local root. */
export class CreatorDock {
	/**
	 * @param {object} keterApi Installed public Animator Agent API.
	 */
	constructor(keterApi) {
		this.keterApi = keterApi;
		this.malchusRoot = null;
		this.malchusView = null;
		this.yesodController = null;
		this.hodPresetState = null;
		this.unbindEvents = null;
	}

	/**
	 * Mounts exactly one Creator Dock and wires its local collaborators.
	 * @returns {HTMLElement} Existing or newly mounted Creator root.
	 */
	mount() {
		const keterExisting = document.querySelector('[data-awtsmoos-creator]');
		if (keterExisting) return keterExisting;
		const yesodVessel = document.createElement('div');
		yesodVessel.innerHTML = CreatorTemplate.render().trim();
		this.malchusRoot = yesodVessel.firstElementChild;
		document.body.append(this.malchusRoot);
		this.malchusView = new MalchusCreatorViewState(this.malchusRoot);
		this.hodPresetState = new HodCreatorPresetState(this.malchusRoot);
		this.yesodController = new YesodCreatorApiController(this.keterApi, this.malchusView);
		this.unbindEvents = CreatorEvents.bind(this.malchusRoot, this.handlers());
		return this.malchusRoot;
	}

	/**
	 * Returns delegated event handlers without embedding behavior inside template HTML.
	 * @returns {Record<string, Function>} Action map keyed by `data-creator-action` values.
	 */
	handlers() {
		return {
			toggle: () => this.toggle(),
			collapse: () => this.malchusView?.setExpanded(false),
			preview: () => this.yesodController?.preview(this.promptValue()),
			apply: () => this.yesodController?.apply(),
			discard: () => this.yesodController?.discard(),
			fragment: (_olamEvent, keliButton) => this.selectFragment(keliButton)
		};
	}

	/** Toggles progressive disclosure while delegating all DOM-state updates to the view renderer. */
	toggle() {
		const yesodExpanded = this.malchusRoot?.dataset.expanded !== 'true';
		this.malchusView?.setExpanded(yesodExpanded);
	}

	/**
	 * Records prompt-composition selection, then appends the trusted preset phrase.
	 * @param {HTMLElement} keliButton Authored preset button from the static Creator template.
	 */
	selectFragment(keliButton) {
		this.hodPresetState?.select(keliButton);
		this.appendFragment(keliButton?.dataset.creatorFragment);
	}

	/**
	 * Appends a trusted authored direction fragment and returns focus to the prompt.
	 * @param {string} orFragment Static preset phrase from trusted template markup.
	 */
	appendFragment(orFragment = '') {
		const keliPrompt = this.malchusRoot?.querySelector('textarea');
		if (!keliPrompt || !orFragment) return;
		keliPrompt.value = [keliPrompt.value.trim(), orFragment].filter(Boolean).join('. ');
		keliPrompt.focus();
	}

	/** Returns the current creator prompt without exposing the textarea element to API collaborators. */
	promptValue() {
		return this.malchusRoot?.querySelector('textarea')?.value ?? '';
	}
}
