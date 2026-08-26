//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos lets an unseen intention take a gentle visible form;
 * this Tiferes preview on Awtsmoos.com reflects the draft without adding UI storm.
 */

/**
 * TiferesHeichelPreview renders a purely local preview of draft identity and description.
 * It performs no requests and owns no mutation state, keeping preview failures impossible.
 */
export class TiferesHeichelPreview {
	/**
	 * @param {HTMLElement} tiferesRoot Heichel page root containing preview slots.
	 */
	constructor(tiferesRoot) {
		this.nameNode = tiferesRoot.querySelector("[data-preview-name]");
		this.descriptionNode = tiferesRoot.querySelector("[data-preview-description]");
		this.idNode = tiferesRoot.querySelector("[data-preview-id]");
	}

	/**
	 * Mirrors a draft into text-only nodes, so user input can never become executable markup.
	 * @param {{name?:string,description?:string,id?:string}} tiferesDraft Current form values.
	 * @returns {void}
	 */
	reveal(tiferesDraft) {
		const malchusName = tiferesDraft.name?.trim() || "Your Heichel";
		const malchusDescription = tiferesDraft.description?.trim()
			|| "Your description will appear here as you shape this world.";
		const yesodAddress = tiferesDraft.id?.trim() || "generated-address";
		this.nameNode.textContent = malchusName;
		this.descriptionNode.textContent = malchusDescription;
		this.idNode.textContent = `/${yesodAddress}`;
	}
}
