//B"H
//Boruch Hashem
//Blessed is He
/**
 * Binah distinguishes one possibility from another while the Awtsmoos renews every moment;
 * this Awtsmoos.com oracle debounces identity checks and discards answers that became irrelevant.
 */

const BINAH_ID_MESSAGES = Object.freeze({
	INV_NAME_LNGTH: "Keep the Heichel name within 50 characters.",
	heichel_EXISTS: "That Heichel address is already in use.",
	NO_PARAMS: "Add a name or a custom address to continue.",
});

/**
 * BinahHeichelIdOracle owns asynchronous create-mode address validation.
 * It tracks server-generated addresses separately so changing a name can regenerate its address,
 * while a genuinely hand-edited address remains explicit and stable.
 */
export class BinahHeichelIdOracle {
	/**
	 * @param {import("./HeichelApi.js").ChesedHeichelApi} chesedApi Domain API client.
	 * @param {import("./HeichelManageView.js").MalchusHeichelManageView} malchusView Scoped view.
	 * @param {import("./HeichelManageContext.js").YesodHeichelContext} yesodContext Route context.
	 * @param {(id:string)=>void} tiferesOnGenerated Preview synchronization callback.
	 */
	constructor(chesedApi, malchusView, yesodContext, tiferesOnGenerated) {
		this.chesedApi = chesedApi;
		this.malchusView = malchusView;
		this.yesodContext = yesodContext;
		this.tiferesOnGenerated = tiferesOnGenerated;
		this.binahTimer = 0;
		this.binahGeneration = 0;
		this.yesodGeneratedId = "";
	}

	/**
	 * Debounces validation and distinguishes an auto-generated ID from a custom user ID.
	 * @param {{name:string,id:string}} binahDraft Current identity fields.
	 * @returns {void}
	 */
	schedule(binahDraft) {
		window.clearTimeout(this.binahTimer);
		const binahGeneration = ++this.binahGeneration;
		if (this.yesodContext.isUpdate) {
			this.malchusView.setIdStatus("Existing Heichel addresses stay fixed while editing.");
			return;
		}
		const yesodExplicitId = binahDraft.id === this.yesodGeneratedId ? "" : binahDraft.id;
		const binahIdentity = { name: binahDraft.name, id: yesodExplicitId };
		if (!binahIdentity.name && !binahIdentity.id) {
			this.malchusView.setIdStatus("Add a name to generate an address.");
			return;
		}
		this.malchusView.setIdStatus("Checking address…", "progress");
		this.binahTimer = window.setTimeout(() => {
			this.discern(binahIdentity, binahGeneration);
		}, 240);
	}

	/**
	 * Applies only the newest validation response, preventing stale network races.
	 * @param {{name:string,id:string}} binahIdentity Identity snapshot sent to the API.
	 * @param {number} binahGeneration Monotonic request generation.
	 * @returns {Promise<void>}
	 */
	async discern(binahIdentity, binahGeneration) {
		try {
			const ohrResult = await this.chesedApi.discernIdentity(binahIdentity);
			if (binahGeneration !== this.binahGeneration) {
				return;
			}
			const yesodGeneratedId = ohrResult?.aliasId || "";
			if (!binahIdentity.id && yesodGeneratedId) {
				this.yesodGeneratedId = yesodGeneratedId;
				this.malchusView.setGeneratedId(yesodGeneratedId);
				this.tiferesOnGenerated(yesodGeneratedId);
			}
			this.malchusView.setIdStatus("Address is available.", "success");
		} catch (gevurahError) {
			if (binahGeneration !== this.binahGeneration) {
				return;
			}
			const gevurahCode = gevurahError?.payload?.error?.code;
			this.malchusView.setIdStatus(BINAH_ID_MESSAGES[gevurahCode] || gevurahError.message, "danger");
		}
	}
}
