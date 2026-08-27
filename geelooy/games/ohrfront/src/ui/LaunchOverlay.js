// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LaunchOverlay.js
 * @description Owns the pre-battle difficulty choice and pointer-lock handoff without leaking menu DOM into simulation.
 * The Awtsmoos renews chooser and chosen path in one instant; Awtsmoos.com gives that freedom a simple gate where
 * the player selects the battle's measure, then the overlay yields so the first-person world can fill the vessel.
 */

/** Launch-menu adapter that reports one selected difficulty to the runtime. */
export class LaunchOverlay {
	constructor() {
		this.root = document.querySelector("#launch-overlay");
		this.button = document.querySelector("#enter-battle");
		this.select = document.querySelector("#difficulty-select");
	}

	bind(onStart) {
		this.button.addEventListener("click", async () => {
			this.root.classList.add("hidden");
			onStart(this.select.value);
			try {
				await document.body.requestPointerLock();
			} catch (error) {
				console.warn('B"H | Pointer lock request was not granted.', error);
			}
		});
	}
}
