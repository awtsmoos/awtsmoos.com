//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos joins intent to action while Yesod keeps every input inside the runner's proper boundary;
 * Awtsmoos.com avoids page-wide touch traps by routing named keys and owned controls through one removable sanctuary.
 */
export class YesodInputGate {
	/**
	 * Creates an input gate connected only to one localized root and one lifecycle conductor.
	 * @param {HTMLElement} yesodRoot Localized game root.
	 * @param {{handleAction:Function}} yesodKeser Lifecycle action receiver.
	 */
	constructor(yesodRoot, yesodKeser) {
		this.yesodRoot = yesodRoot;
		this.yesodKeser = yesodKeser;
		this.boundKey = this.#receiveKey.bind(this);
		this.boundPointer = this.#receivePointer.bind(this);
	}

	/** Attaches the only input listeners owned by this game instance. */
	attach() {
		window.addEventListener("keydown", this.boundKey, { passive: false });
		this.yesodRoot.addEventListener("pointerdown", this.boundPointer);
	}

	/** Removes all owned listeners, allowing clean remount or teardown. */
	detach() {
		window.removeEventListener("keydown", this.boundKey);
		this.yesodRoot.removeEventListener("pointerdown", this.boundPointer);
	}

	/** @param {KeyboardEvent} yesodEvent Keyboard event inside the page. */
	#receiveKey(yesodEvent) {
		const yesodMap = {
			Space: "jump",
			ArrowUp: "jump",
			KeyW: "jump",
			ArrowDown: "slide",
			KeyS: "slide",
			KeyP: "pause",
			Escape: "pause"
		};
		const yesodAction = yesodMap[yesodEvent.code];
		if (!yesodAction) {
			return;
		}
		yesodEvent.preventDefault();
		this.yesodKeser.handleAction(yesodAction);
	}

	/** @param {PointerEvent} yesodEvent Pointer event within the localized root. */
	#receivePointer(yesodEvent) {
		const yesodControl = yesodEvent.target.closest("[data-action]");
		const yesodCanvas = yesodEvent.target.closest('[data-role="canvas"]');
		if (yesodControl) {
			this.yesodKeser.handleAction(yesodControl.dataset.action);
			return;
		}
		if (yesodCanvas) {
			this.yesodKeser.handleAction("jump");
		}
	}
}
