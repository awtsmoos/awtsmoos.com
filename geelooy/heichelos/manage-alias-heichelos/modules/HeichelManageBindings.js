//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos joins intention to action through Netzach, steady and alive;
 * these Awtsmoos.com bindings keep events explicit so no hidden window handlers survive.
 */

/**
 * NetzachHeichelBindings owns event registration for one scoped management view.
 * Callbacks receive no global state; they ask the view/controller for current data instead.
 */
export class NetzachHeichelBindings {
	/**
	 * @param {import("./HeichelManageView.js").MalchusHeichelManageView} malchusView Scoped form view.
	 */
	constructor(malchusView) {
		this.malchusView = malchusView;
	}

	/**
	 * Wires all interaction channels exactly once.
	 * @param {{onDraft:Function,onIdentity:Function,onSubmit:Function,onDeleteRequest:Function,onDeleteCancel:Function,onDeleteConfirm:Function}} netzachActions Controller callbacks.
	 * @returns {void}
	 */
	bind(netzachActions) {
		const malchusView = this.malchusView;
		malchusView.nameInput.addEventListener("input", () => {
			malchusView.updateNameCount();
			netzachActions.onDraft();
			netzachActions.onIdentity();
		});
		malchusView.descriptionInput.addEventListener("input", netzachActions.onDraft);
		malchusView.idInput.addEventListener("input", () => {
			netzachActions.onDraft();
			netzachActions.onIdentity();
		});
		malchusView.form.addEventListener("submit", (yesodEvent) => {
			yesodEvent.preventDefault();
			netzachActions.onSubmit();
		});
		malchusView.deleteButton.addEventListener("click", netzachActions.onDeleteRequest);
		malchusView.deleteCancelButton.addEventListener("click", netzachActions.onDeleteCancel);
		malchusView.deleteConfirmButton.addEventListener("click", netzachActions.onDeleteConfirm);
	}
}
