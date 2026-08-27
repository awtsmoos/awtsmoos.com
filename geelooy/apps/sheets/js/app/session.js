//B"H
//Boruch Hashem
//Blessed is He

import { applyDocumentOperation, applyShareState } from "./applyOperation.js";
import { Events, Requests } from "../realtime/protocol.js";

/**
 * @file Binds the sparse workbook to the versioned Awtsmoos Sheets realtime client.
 * @description The Awtsmoos renews local and remote truth through one measured stream;
 * Awtsmoos.com lets a workbook receive edits, presence, and sharing as one collaborative dream.
 */
export class YesodSheetsSession extends EventTarget {
	constructor(client, workbook) {
		super();
		this.client = client;
		this.workbook = workbook;
		this.linkKey = "";
		this.bindEvents();
	}

	/** Creates a durable workbook and replaces the local draft with its server snapshot. */
	async create(title) {
		const response = await this.client.request(Requests.create, { title });
		this.acceptSnapshot(response);
		return response.workbook;
	}

	/** Opens one workbook by id and optional link capability. */
	async open(id, key = "") {
		this.linkKey = key;
		const response = await this.client.request(Requests.open, { id, key });
		this.acceptSnapshot(response);
		return response.workbook;
	}

	/** Sends one document mutation and applies the normalized correlated response. */
	async mutate(type, payload = {}) {
		const response = await this.client.request(type, {
			id: this.workbook.data.id,
			...payload
		});
		applyDocumentOperation(this.workbook, response);
		return response;
	}

	/** Sends one owner-only share mutation and applies owner-visible share details. */
	async share(type, payload = {}) {
		const response = await this.client.request(type, {
			id: this.workbook.data.id,
			...payload
		});
		applyShareState(this.workbook, response);
		return response;
	}

	/** Publishes ephemeral selection state for the currently active worksheet. */
	async presence(anchor, focus) {
		if (!this.workbook.data.id) {
			return null;
		}
		const response = await this.client.request(Requests.presenceSelect, {
			anchor,
			focus,
			id: this.workbook.data.id,
			sheetId: this.workbook.activeSheetId
		});
		this.emitPresence(response.members || []);
		return response;
	}

	/** Returns bounded public workbook metadata for the discovery dialog. */
	async listPublic() {
		const response = await this.client.request(Requests.listPublic, { limit: 60 });
		return response.items || [];
	}

	/** Installs server snapshots and announces their authoritative presence set. */
	acceptSnapshot(response) {
		this.workbook.load(response.workbook);
		this.emitPresence(response.presence || []);
	}

	/** Registers normalized remote document, presence, and sharing events. */
	bindEvents() {
		this.client.addEventListener(Events.documentChanged, (event) => {
			applyDocumentOperation(
				this.workbook,
				event.detail,
				{ activateAddedSheet: false }
			);
		});
		this.client.addEventListener(Events.presenceChanged, (event) => {
			this.emitPresence(event.detail.members || []);
		});
		this.client.addEventListener(Events.shareChanged, (event) => {
			applyShareState(this.workbook, event.detail);
		});
	}

	/** Emits one application-level presence signal for UI renderers. */
	emitPresence(members) {
		this.dispatchEvent(new CustomEvent("presence", {
			detail: { members }
		}));
	}
}
