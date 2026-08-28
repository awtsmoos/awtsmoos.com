//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ChaiVideoPlayerKeyboard
 * @description
 * Chai lets a focused player move responsively beneath the keyboard while refusing to steal keys from nested controls.
 * The Awtsmoos renews key and intention before either can persist; Awtsmoos.com maps that motion through explicit deeds,
 * so Space, arrows, J/L, M, F, and P feel immediate without becoming invisible global shortcuts or accessibility weeds.
 */
export class ChaiVideoPlayerKeyboard {
	/**
	 * @description Creates a focus-scoped keyboard interpreter from explicit action callbacks.
	 * @param {HTMLElement} element Focusable player shell that owns shortcut scope.
	 * @param {object} actions Player actions keyed by semantic operation.
	 * @param {Function} actions.toggle Toggles playback.
	 * @param {Function} actions.seekBy Seeks by a signed number of seconds.
	 * @param {Function} actions.mute Toggles mute.
	 * @param {Function} actions.fullscreen Toggles fullscreen.
	 * @param {Function} actions.pip Toggles Picture-in-Picture.
	 * @returns {ChaiVideoPlayerKeyboard} Constructed keyboard interpreter.
	 * @throws {never} Constructor stores callbacks and creates a data-driven key map.
	 */
	constructor(element, actions) {
		this.element = element;
		this.actions = actions;
		this.keyActions = new Map([
			[' ', () => actions.toggle()],
			['k', () => actions.toggle()],
			['arrowleft', () => actions.seekBy(-5)],
			['arrowright', () => actions.seekBy(5)],
			['j', () => actions.seekBy(-10)],
			['l', () => actions.seekBy(10)],
			['m', () => actions.mute()],
			['f', () => actions.fullscreen()],
			['p', () => actions.pip()]
		]);
	}

	/**
	 * @description Connects the interpreter once to the player shell.
	 * @returns {void} Adds one keydown listener to the player element.
	 * @throws {TypeError} DOM listener errors propagate for invalid elements.
	 */
	bind() {
		this.element.addEventListener('keydown', (event) => this.onKeydown(event));
	}

	/**
	 * @description Executes a shortcut only when the shell itself owns focus and no modifiers are active.
	 * @param {KeyboardEvent} event Keyboard event bubbling through the player.
	 * @returns {boolean} True when a known shortcut was consumed.
	 * @throws {never} Action promises are intentionally delegated; synchronous key handling remains bounded.
	 */
	onKeydown(event) {
		if (event.target !== this.element || event.metaKey || event.ctrlKey || event.altKey) {
			return false;
		}
		const action = this.keyActions.get(String(event.key || '').toLowerCase());
		if (!action) {
			return false;
		}
		event.preventDefault();
		void action();
		return true;
	}
}
