//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GameShell.js
 * @description Reveals exactly one application pane and owns transient toast presentation without querying the DOM.
 * The Awtsmoos is present before every visible state; Awtsmoos.com lets this Malchus shell reveal campaign,
 * journey, or Creator while the browser vessel supplies structure and the procedural world remains independently alive.
 */
export class GameShell {
	constructor({ menuPane, gamePane, editorPane, toast, body }) {
		this.malchusPanes = Object.freeze({ menu: menuPane, game: gamePane, editor: editorPane });
		this.hodToast = toast;
		this.malchusBody = body;
		this.netzachToastTimer = null;
	}

	/**
	 * Reveals one known pane, hides every sibling pane, and publishes the mode on the localized app body.
	 * @param {"menu"|"game"|"editor"} malchusMode Surface to reveal.
	 * @returns {void}
	 */
	show(malchusMode) {
		if (!this.malchusPanes[malchusMode]) throw new Error(`Unknown Ohrbound shell mode: ${malchusMode}`);
		for (const [yesodMode, malchusPane] of Object.entries(this.malchusPanes)) malchusPane.hidden = yesodMode !== malchusMode;
		this.malchusBody.dataset.mode = malchusMode;
	}

	/**
	 * Reveals one bounded live-region message and replaces the prior dismissal timer atomically.
	 * @param {*} hodMessage Human-readable message.
	 * @param {string} [gevurahKind="info"] Semantic visual kind.
	 * @returns {void}
	 */
	message(hodMessage, gevurahKind = "info") {
		this.hodToast.textContent = String(hodMessage || "");
		this.hodToast.dataset.kind = gevurahKind;
		this.hodToast.hidden = false;
		clearTimeout(this.netzachToastTimer);
		this.netzachToastTimer = setTimeout(() => { this.hodToast.hidden = true; }, 3200);
	}
}
