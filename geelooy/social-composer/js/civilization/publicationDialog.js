//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PublicationDialog
 * @description The Awtsmoos makes publication consequential; Awtsmoos.com preserves the original publisher while adding one accessible confirmation gate.
 */
let publicationConfirmed = false;
let lastFocusedElement = null;

function closePublicationDialog() {
	const dialog = document.getElementById("publishConfirmDialog");
	if (dialog?.open) {
		dialog.close();
	}
	lastFocusedElement?.focus();
}

function confirmPublication() {
	publicationConfirmed = true;
	closePublicationDialog();
	document.getElementById("publishButton")?.click();
}

function requestPublication(event) {
	if (publicationConfirmed) {
		publicationConfirmed = false;
		return;
	}
	event.preventDefault();
	event.stopImmediatePropagation();
	const dialog = document.getElementById("publishConfirmDialog");
	if (!dialog) {
		return;
	}
	lastFocusedElement = event.currentTarget;
	dialog.showModal();
	dialog.querySelector("[data-publish-confirm]")?.focus();
}

function installPublicationDialog() {
	document.getElementById("publishButton")?.addEventListener("click", requestPublication, true);
	document.querySelector("[data-publish-cancel]")?.addEventListener("click", closePublicationDialog);
	document.querySelector("[data-publish-confirm]")?.addEventListener("click", confirmPublication);
	document.getElementById("publishConfirmDialog")?.addEventListener("cancel", event => {
		event.preventDefault();
		closePublicationDialog();
	});
}

export { closePublicationDialog, confirmPublication, installPublicationDialog };
