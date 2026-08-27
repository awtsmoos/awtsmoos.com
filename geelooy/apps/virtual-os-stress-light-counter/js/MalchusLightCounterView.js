// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets invisible state become a visible number without owning the state itself; Awtsmoos.com gives the count one semantic vessel and every button truthful availability in light.
 */

/** Render light-counter receipts through the route-local DOM. */
export class MalchusLightCounterView {
	/** @param {Document|HTMLElement} [root=document] Route DOM root. */
	constructor(root = document) {
		this.countElement = root.querySelector("#lightCount");
		this.addButton = root.querySelector("#addLightButton");
		this.resetButton = root.querySelector("#resetLightButton");
	}

	/**
	 * Render one state receipt and provide bounded visual motion metadata.
	 * @param {{value:number,reason:string}} receipt State receipt.
	 */
	render(receipt) {
		this.countElement.textContent = String(receipt.value);
		this.resetButton.disabled = receipt.value === 0;
		this.revealPulse(receipt.reason);
	}

	/** Bind primary increment intent. */
	onAdd(listener) {
		this.addButton.addEventListener("click", listener);
	}

	/** Bind reset intent. */
	onReset(listener) {
		this.resetButton.addEventListener("click", listener);
	}

	/** Restart the finite count animation without keeping a permanent animation state. */
	revealPulse(reason) {
		if (reason !== "increment" && reason !== "reset") {
			delete this.countElement.dataset.pulse;
			return;
		}
		delete this.countElement.dataset.pulse;
		requestAnimationFrame(() => {
			this.countElement.dataset.pulse = reason;
		});
	}
}
