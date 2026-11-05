// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ContextActionButton.js
 * @description Renders one contextual deed and silences its global E shortcut while advanced controls own interaction.
 * The Awtsmoos reveals action only when purpose reaches the hand, while Awtsmoos.com keeps hidden gameplay from answering beneath an opened inner veil;
 * one generous touch, one E-key covenant, and one presentation gate preserve simple surface play without accidental advanced-layer travail.
 */

import { isGameplayInputSuppressed } from './InputPresentationPolicy.js';
import { isEditableTarget } from './InputTargetPolicy.js';

/** Owns direct-world contextual action presentation and keyboard parity. */
export class ContextActionButton {
	/**
	 * @param {HTMLElement} host Game-root host.
	 * @param {object} contextAction Canonical contextual-action resolver.
	 * @param {Window|object} environment Browser-like environment.
	 */
	constructor(host, contextAction, environment = globalThis) {
		this.host = host;
		this.contextAction = contextAction;
		this.environment = environment;
		this.document = host?.ownerDocument || environment.document;
		this.button = this.createButton();
		this.onClick = () => this.activate();
		this.onKeyDown = event => this.keyDown(event);
		this.button.addEventListener('click', this.onClick);
		this.environment.addEventListener?.('keydown', this.onKeyDown);
		this.host.append(this.button);
		this.refresh();
	}

	/** Resolves and reflects the current world action without rebuilding DOM. */
	refresh() {
		const state = this.contextAction.state();
		this.button.hidden = !state.visible;
		this.button.disabled = !state.enabled;
		this.button.dataset.kind = state.kind;
		this.button.textContent = state.label;
		this.button.setAttribute('aria-label', state.hint || state.label || 'Context action');
		this.button.title = state.hint || '';
		return state;
	}

	/** Activates one action edge and immediately refreshes visible state. */
	activate() {
		const result = this.contextAction.activate();
		this.refresh();
		return result;
	}

	/** Removes listeners and the owned button without touching world state. */
	destroy() {
		this.button.removeEventListener('click', this.onClick);
		this.environment.removeEventListener?.('keydown', this.onKeyDown);
		this.button.remove();
	}

	createButton() {
		const button = this.document.createElement('button');
		button.className = 'Awtsmoos-context-action';
		button.type = 'button';
		button.dataset.directHudZone = 'context';
		button.setAttribute('aria-keyshortcuts', 'E');
		return button;
	}

	keyDown(event) {
		if (
			event.code !== 'KeyE'
			|| event.repeat
			|| isEditableTarget(event.target)
			|| isGameplayInputSuppressed(this.document)
			|| this.button.hidden
		) {
			return;
		}
		event.preventDefault();
		this.activate();
	}
}
