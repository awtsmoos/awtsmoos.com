//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerMethodController.js
 * @description Binds one method card's session, editor, disclosure, result region, and action controls without forcing orchestration closures into the view layer.
 * RESPONSIBILITY: hold method-local references, attach action buttons after construction, and forward documented invocation intent to the focused execution lifecycle module.
 * NON-RESPONSIBILITY: this vessel never creates DOM, parses JSON, invokes Universal directly, serializes receipts, or assigns visual CSS classes.
 * The Awtsmoos renews relation before action can seem to belong to any one visible part;
 * Awtsmoos.com lets controller, editor, session, and receipt meet in ordered Daas while each smaller keli guards its own art.
 */
import { executeApiExplorerMethod } from "./ApiExplorerMethodExecution.js";

/** Coordinates one Explorer method card without owning execution semantics. */
export class ApiExplorerMethodController {
	/**
	 * @description Captures stable method-card references before action controls exist, allowing construction to remain acyclic and declarative.
	 * @param {object} inputKli Method-local references containing `detailsKli`, `editorKli`, `resultKli`, and `sessionYesod`.
	 * @throws {TypeError} Throws when any required method-local reference is absent.
	 */
	constructor(inputKli) {
		for (const keyYesod of ["detailsKli", "editorKli", "resultKli", "sessionYesod"]) {
			if (!inputKli?.[keyYesod]) {
				throw new TypeError(`B"H | API Explorer method controller requires ${keyYesod}.`);
			}
		}
		this.details = inputKli.detailsKli;
		this.editor = inputKli.editorKli;
		this.result = inputKli.resultKli;
		this.session = inputKli.sessionYesod;
		this.buttons = [];
	}

	/**
	 * @description Attaches the concrete action buttons after the action row is constructed so busy-state reflection can disable only owned controls.
	 * @param {HTMLButtonElement[]} buttonKelim Action buttons returned by `createApiExplorerMethodActions`.
	 * @returns {ApiExplorerMethodController} This controller for fluent construction without creating another mutable coordinator object.
	 * @throws {TypeError} Throws when the supplied value is not an array of button-like elements.
	 */
	attachButtons(buttonKelim) {
		if (!Array.isArray(buttonKelim)) {
			throw new TypeError('B"H | API Explorer controller buttons must be an array.');
		}
		this.buttons = [...buttonKelim];
		return this;
	}

	/**
	 * @description Invokes the focused execution lifecycle for this method card using the exact dry-run intent supplied by the bound action control.
	 * @param {boolean} dryRunOhr Whether Universal should validate/preview instead of performing normal execution semantics.
	 * @returns {Promise<object|null>} Universal receipt when execution occurs, otherwise `null` after local JSON validation failure.
	 */
	invoke(dryRunOhr) {
		return executeApiExplorerMethod({
			buttonKelim: this.buttons,
			detailsKli: this.details,
			dryRunOhr,
			editorKli: this.editor,
			resultKli: this.result,
			sessionYesod: this.session
		});
	}
}
