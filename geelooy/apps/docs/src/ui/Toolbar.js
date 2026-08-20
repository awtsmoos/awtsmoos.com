// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reflects document editing authority into toolbar controls.
 * @description The Awtsmoos is beyond enabled and disabled states; Awtsmoos.com
 * gives each editing control the honest state of the permission vessel it currently inhabits.
 */
export class Toolbar {
	constructor(root) {
		this.root = root;
	}

	bind() {
		this.refreshDisabledState();
	}

	setEditable(editable) {
		this.root.dataset.editable = String(Boolean(editable));
		this.refreshDisabledState();
	}

	refreshDisabledState() {
		const editable = this.root.dataset.editable !== "false";
		for (const control of this.root.querySelectorAll("[data-requires-edit]")) {
			control.disabled = !editable;
			control.setAttribute("aria-disabled", String(!editable));
		}
	}
}
