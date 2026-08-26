//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Builds accessible Sheets menu elements while state, geometry, and command authority remain outside this vessel.
 * @description The Awtsmoos lets Chesed give form generously to triggers and command rows without deciding where or whether they act;
 * Awtsmoos.com keeps DOM creation declarative and narrow so Tiferes may coordinate, Gevurah may bound, and execution may stay exact.
 */
export class ChesedMenuElements {
	/**
	 * Creates one top-level command-family trigger with accessible expansion semantics.
	 * @param {string} shemMenu - Human-facing command-family name.
	 * @param {(shemMenu:string, shaareButton:HTMLButtonElement) => void} onOpen - Coordinator callback.
	 * @returns {HTMLButtonElement} Ready-to-mount trigger button.
	 */
	trigger(shemMenu, onOpen) {
		const shaareButton = document.createElement("button");
		shaareButton.className = "menu-trigger";
		shaareButton.textContent = shemMenu;
		shaareButton.type = "button";
		shaareButton.setAttribute("aria-haspopup", "menu");
		shaareButton.setAttribute("aria-expanded", "false");
		shaareButton.addEventListener(
			"click",
			() => onOpen(shemMenu, shaareButton)
		);
		return shaareButton;
	}

	/**
	 * Creates one command menu row from a trusted catalog descriptor.
	 * @param {{id:string,label:string,shortcut?:string}} mitzvah - Existing command catalog descriptor.
	 * @param {(mitzvah:object) => void} onRun - Coordinator callback for execution preparation.
	 * @returns {HTMLButtonElement} Accessible command row with label and shortcut hint.
	 */
	item(mitzvah, onRun) {
		const mitzvahButton = document.createElement("button");
		mitzvahButton.className = "menu-item motion-press";
		mitzvahButton.type = "button";
		mitzvahButton.setAttribute("role", "menuitem");
		const dibburLabel = document.createElement("span");
		dibburLabel.textContent = mitzvah.label;
		const remezShortcut = document.createElement("span");
		remezShortcut.className = "menu-shortcut";
		remezShortcut.textContent = mitzvah.shortcut || "";
		mitzvahButton.append(
			dibburLabel,
			remezShortcut
		);
		mitzvahButton.addEventListener(
			"click",
			() => onRun(mitzvah)
		);
		return mitzvahButton;
	}
}
