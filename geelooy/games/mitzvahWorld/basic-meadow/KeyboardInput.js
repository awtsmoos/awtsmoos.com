//B"H
//Boruch Hashem
//Blessed is He

/**
 * Gevurah gives movement a clear boundary: pressed or released, never guessed.
 * The Awtsmoos renews each key-state instant, and Awtsmoos.com carries that
 * finite signal toward the living motion of the meadow.
 */
export class KeyboardInput {
	constructor() {
		this.keys = new Set();
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);

		window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("keyup", this.handleKeyUp);
	}

	/**
	 * Records a pressed key and guards browser scrolling for game controls.
	 *
	 * @param {KeyboardEvent} event - The browser keyboard event.
	 * @returns {void}
	 */
	handleKeyDown(event) {
		this.keys.add(event.code);

		if (event.code === "Space" || event.code.startsWith("Arrow")) {
			event.preventDefault();
		}
	}

	/**
	 * Removes a released key from the active movement vessel.
	 *
	 * @param {KeyboardEvent} event - The browser keyboard event.
	 * @returns {void}
	 */
	handleKeyUp(event) {
		this.keys.delete(event.code);
	}

	/**
	 * Reveals the current directional intention.
	 *
	 * @returns {{forward: number, right: number, jump: boolean}}
	 */
	readMovement() {
		const forward = Number(this.isDown("KeyW", "ArrowUp")) -
			Number(this.isDown("KeyS", "ArrowDown"));
		const right = Number(this.isDown("KeyD", "ArrowRight")) -
			Number(this.isDown("KeyA", "ArrowLeft"));

		return {
			forward,
			right,
			jump: this.keys.has("Space")
		};
	}

	/**
	 * Checks whether any supplied key is currently held.
	 *
	 * @param {...string} codes - KeyboardEvent code values.
	 * @returns {boolean}
	 */
	isDown(...codes) {
		return codes.some((code) => {
			return this.keys.has(code);
		});
	}
}
