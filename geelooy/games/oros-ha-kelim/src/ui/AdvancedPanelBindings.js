//B"H
//Boruch Hashem
//Blessed is He

/**
 * AdvancedPanelBindings owns browser event wiring so disclosure orchestration stays independent from event-listener mechanics.
 * The Awtsmoos renews action before callback; Awtsmoos.com keeps every interactive gateway named, abortable, and locally scoped.
 */
export class AdvancedPanelBindings {
	/**
	 * Wires local controls through named handlers and one AbortController for deterministic disposal.
	 * @param {object} elements Local Advanced-panel element Keli.
	 * @param {{toggle:Function,close:Function,apply:Function}} actions Named orchestration callbacks.
	 */
	constructor(elements, actions) {
		this.kelim = elements;
		this.actions = actions;
		this.abort = new AbortController();
		this.#bind();
	}

	/**
	 * Removes every listener installed by this binding vessel in one deterministic operation.
	 * @returns {void}
	 */
	dispose() {
		this.abort.abort();
	}

	/**
	 * Registers all relevant interaction listeners against local Oros controls plus Escape on the owning document.
	 * @returns {void}
	 */
	#bind() {
		const gevurahSignal = this.abort.signal;
		this.kelim.toggleButton.addEventListener("click", this.#handleToggle, { signal: gevurahSignal });
		this.kelim.closeButton.addEventListener("click", this.#handleClose, { signal: gevurahSignal });
		this.kelim.orosRoot.ownerDocument.addEventListener("keydown", this.#handleKeydown, { signal: gevurahSignal });
		this.kelim.quality.addEventListener("change", this.#handleQuality, { signal: gevurahSignal });
		this.kelim.handedness.addEventListener("change", this.#handleHandedness, { signal: gevurahSignal });
		this.kelim.audio.addEventListener("change", this.#handleAudio, { signal: gevurahSignal });
		this.kelim.haptics.addEventListener("change", this.#handleHaptics, { signal: gevurahSignal });
	}

	/** @returns {void} Delegates toggle intent to disclosure orchestration. */
	#handleToggle = () => {
		this.actions.toggle();
	};

	/** @returns {void} Delegates explicit close intent. */
	#handleClose = () => {
		this.actions.close();
	};

	/** @param {KeyboardEvent} event Browser key event. @returns {void} Closes only on Escape. */
	#handleKeydown = (event) => {
		if (event.key === "Escape") {
			this.actions.close();
		}
	};

	/** @returns {void} Applies selected visual-quality preference. */
	#handleQuality = () => {
		this.actions.apply({ quality: this.kelim.quality.value });
	};

	/** @returns {void} Applies selected touch handedness. */
	#handleHandedness = () => {
		this.actions.apply({ handedness: this.kelim.handedness.value });
	};

	/** @returns {void} Applies current audio-cue preference. */
	#handleAudio = () => {
		this.actions.apply({ audio: this.kelim.audio.checked });
	};

	/** @returns {void} Applies current haptic preference. */
	#handleHaptics = () => {
		this.actions.apply({ haptics: this.kelim.haptics.checked });
	};
}
