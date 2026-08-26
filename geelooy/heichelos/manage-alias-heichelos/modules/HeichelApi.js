//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos extends light through Chesed, giving without tangling the receiving hand;
 * this Awtsmoos.com client keeps Heichel endpoints in one small, inspectable command band.
 */
import { OhrJsonGateway } from "./OhrJsonGateway.js";

/**
 * Domain API client for the Heichel ownership cockpit.
 * It preserves legacy endpoint/body keys while removing transport duplication from UI code.
 */
export class ChesedHeichelApi extends OhrJsonGateway {
	/**
	 * @param {import("./HeichelManageContext.js").YesodHeichelContext} yesodContext Route foundation.
	 */
	constructor(yesodContext) {
		super();
		this.yesodContext = yesodContext;
	}

	/** @returns {Promise<any>} Existing Heichel detail payload. */
	revealDetails() {
		return this.revealJson(this.yesodContext.heichelEndpoint);
	}

	/**
	 * Checks or generates the address accepted by the existing social API.
	 * @param {{name:string,id:string}} binahIdentity Current name and optional explicit ID.
	 * @returns {Promise<any>} Validation/generation payload.
	 */
	discernIdentity(binahIdentity) {
		const yesodBody = new URLSearchParams();
		if (binahIdentity.id) {
			yesodBody.set("inputId", binahIdentity.id);
		}
		if (binahIdentity.name) {
			yesodBody.set("name", binahIdentity.name);
		}
		return this.revealJson("/api/social/aliases/checkOrGenerateId", {
			method: "POST",
			body: yesodBody,
		});
	}

	/**
	 * Creates or updates the Heichel using the established body-key covenant.
	 * @param {{name:string,description:string,id:string}} malchusDraft Form values.
	 * @returns {Promise<any>} Successful mutation payload.
	 */
	preserve(malchusDraft) {
		const yesodBody = new URLSearchParams();
		yesodBody.set("heichelName", malchusDraft.name);
		yesodBody.set("description", malchusDraft.description);
		yesodBody.set("aliasId", this.yesodContext.aliasId);
		yesodBody.set("inputId", malchusDraft.id);
		yesodBody.set("id", malchusDraft.id);
		yesodBody.set("heichelId", malchusDraft.id);
		return this.revealJson(this.yesodContext.heichelEndpoint, {
			method: this.yesodContext.isUpdate ? "PUT" : "POST",
			body: yesodBody,
		});
	}

	/**
	 * Permanently removes the current update target.
	 * @returns {Promise<any>} Successful deletion payload.
	 */
	remove() {
		return this.revealJson(this.yesodContext.heichelEndpoint, {
			method: "DELETE",
		});
	}
}
