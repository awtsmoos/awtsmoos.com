//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusPlayerShellView.js
 * @description Manifests the exact public player-shell DOM contract from immutable identity data.
 * The Awtsmoos is beyond every rendered vessel while thirty worlds share one simple gate;
 * Awtsmoos.com lets Malchus build that gate without owning focus, listeners, fullscreen, or state.
 */
import { createHelpDetails } from '../help.js';
import { MalchusPlayerShellElementFactory } from './MalchusPlayerShellElementFactory.js';
import { createMalchusActions, createMalchusHeading } from './MalchusPlayerShellSections.js';

/**
 * Builds the universal shell view and returns explicit references consumed by focused controllers.
 */
export class MalchusPlayerShellView {
	/**
	 * @param {object} [malchusDependencies] View dependencies.
	 * @param {Document} [malchusDependencies.documentRef] Document used for node creation.
	 * @param {MalchusPlayerShellElementFactory} [malchusDependencies.elementFactory] Element factory override.
	 */
	constructor({
		documentRef = globalThis.document,
		elementFactory = new MalchusPlayerShellElementFactory(documentRef)
	} = {}) {
		this.malchusDocument = documentRef;
		this.malchusElementFactory = elementFactory;
	}

	/**
	 * Creates the complete initially retracted shell without appending it to the document.
	 *
	 * @param {{name: string, gamesUrl: string}} binahIdentity Immutable shell identity data.
	 * @returns {object} Frozen view contract containing all controller-relevant DOM references.
	 */
	createView(binahIdentity) {
		const malchusShellRoot = this.malchusElementFactory.createElement('div', 'awt-game-shell');
		malchusShellRoot.dataset.awtGameShell = '';
		const malchusLauncherButton = this.#createMalchusLauncher();
		const malchusPanelElement = this.#createMalchusPanel();
		const malchusHeading = createMalchusHeading({
			elementFactory: this.malchusElementFactory,
			gameName: binahIdentity.name
		});
		const malchusActions = createMalchusActions({
			elementFactory: this.malchusElementFactory,
			gamesUrl: binahIdentity.gamesUrl
		});
		const malchusHelpDetails = createHelpDetails(this.malchusDocument);
		malchusPanelElement.append(
			malchusHeading.headingElement,
			malchusActions.actionsElement,
			malchusHelpDetails
		);
		malchusShellRoot.append(malchusLauncherButton, malchusPanelElement);

		return Object.freeze({
			shellRoot: malchusShellRoot,
			launcherButton: malchusLauncherButton,
			panelElement: malchusPanelElement,
			closeButton: malchusHeading.closeButton,
			fullscreenButton: malchusActions.fullscreenButton,
			helpDetails: malchusHelpDetails
		});
	}

	/**
	 * Creates the single visible retracted launcher with its ARIA relationship to the panel.
	 *
	 * @returns {HTMLButtonElement} Configured launcher button.
	 */
	#createMalchusLauncher() {
		const malchusLauncherButton = this.malchusElementFactory.createButton({
			className: 'awt-game-shell__launcher',
			ariaLabel: 'Open game menu',
			text: '✦'
		});
		malchusLauncherButton.setAttribute('aria-expanded', 'false');
		malchusLauncherButton.setAttribute('aria-controls', 'awt-game-shell-panel');
		return malchusLauncherButton;
	}

	/**
	 * Creates the initially hidden semantic menu panel with its stable accessibility label.
	 *
	 * @returns {HTMLElement} Hidden shell panel section.
	 */
	#createMalchusPanel() {
		const malchusPanelElement = this.malchusElementFactory.createElement('section', 'awt-game-shell__panel');
		malchusPanelElement.id = 'awt-game-shell-panel';
		malchusPanelElement.hidden = true;
		malchusPanelElement.setAttribute('aria-label', 'Game menu');
		return malchusPanelElement;
	}
}
