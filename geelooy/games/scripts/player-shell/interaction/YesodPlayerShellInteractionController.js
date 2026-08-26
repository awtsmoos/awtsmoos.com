//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file YesodPlayerShellInteractionController.js
 * @description Connects launcher, close, and Escape events to panel-state policy without constructing DOM.
 * The Awtsmoos joins action and result beyond every event while Yesod carries the finite signal through;
 * Awtsmoos.com keeps listeners named and disconnectable so gameplay receives only the keys that are due.
 */

/**
 * Owns event-listener lifetime for one shell panel interaction surface.
 *
 * Architectural role: Yesod event port between DOM actions and Gevurah state policy.
 * It never creates elements, changes routes, or decides visual styling.
 */
export class YesodPlayerShellInteractionController {
	/**
	 * @param {object} yesodDependencies Interaction dependencies.
	 * @param {HTMLButtonElement} yesodDependencies.launcherButton Launcher event source.
	 * @param {HTMLButtonElement} yesodDependencies.closeButton Close event source.
	 * @param {EventTarget} [yesodDependencies.keyboardTarget=globalThis.document] Keyboard event target.
	 * @param {{toggle: () => boolean, close: () => void, isOpen: () => boolean}} yesodDependencies.panelState Gevurah state policy.
	 */
	constructor({
		launcherButton,
		closeButton,
		keyboardTarget = globalThis.document,
		panelState
	}) {
		this.malchusLauncherButton = launcherButton;
		this.malchusCloseButton = closeButton;
		this.yesodKeyboardTarget = keyboardTarget;
		this.gevurahPanelState = panelState;
		this.yesodConnected = false;
		this.handleYesodLauncherClick = this.handleYesodLauncherClick.bind(this);
		this.handleYesodCloseClick = this.handleYesodCloseClick.bind(this);
		this.handleYesodEscapeKey = this.handleYesodEscapeKey.bind(this);
	}

	/**
	 * Connects each shell listener exactly once.
	 *
	 * Side effects: registers two click listeners and one capture-phase keydown listener.
	 * @returns {void}
	 */
	connect() {
		if (this.yesodConnected) {
			return;
		}

		this.malchusLauncherButton.addEventListener('click', this.handleYesodLauncherClick);
		this.malchusCloseButton.addEventListener('click', this.handleYesodCloseClick);
		this.yesodKeyboardTarget.addEventListener('keydown', this.handleYesodEscapeKey, true);
		this.yesodConnected = true;
	}

	/**
	 * Disconnects all owned listeners without mutating panel state.
	 *
	 * Side effects: removes exactly the listeners registered by `connect()`.
	 * @returns {void}
	 */
	disconnect() {
		if (!this.yesodConnected) {
			return;
		}

		this.malchusLauncherButton.removeEventListener('click', this.handleYesodLauncherClick);
		this.malchusCloseButton.removeEventListener('click', this.handleYesodCloseClick);
		this.yesodKeyboardTarget.removeEventListener('keydown', this.handleYesodEscapeKey, true);
		this.yesodConnected = false;
	}

	/**
	 * Delegates launcher activation to the Gevurah toggle policy.
	 *
	 * @returns {void}
	 */
	handleYesodLauncherClick() {
		this.gevurahPanelState.toggle();
	}

	/**
	 * Delegates explicit close activation to the Gevurah close/focus policy.
	 *
	 * @returns {void}
	 */
	handleYesodCloseClick() {
		this.gevurahPanelState.close();
	}

	/**
	 * Captures Escape only while the shell is open, preventing gameplay from consuming the same dismissal key.
	 *
	 * Side effects: prevents/stops the event and closes the panel only when shell ownership is active.
	 * @param {KeyboardEvent} yesodKeyboardEvent Browser keydown event.
	 * @returns {void}
	 */
	handleYesodEscapeKey(yesodKeyboardEvent) {
		if (yesodKeyboardEvent.key !== 'Escape' || !this.gevurahPanelState.isOpen()) {
			return;
		}

		yesodKeyboardEvent.preventDefault();
		yesodKeyboardEvent.stopPropagation();
		this.gevurahPanelState.close();
	}
}
