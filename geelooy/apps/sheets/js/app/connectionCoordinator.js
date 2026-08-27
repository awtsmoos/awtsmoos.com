//B"H
//Boruch Hashem
//Blessed is He

import { clearWorkbookAddress, readWorkbookAddress, writeWorkbookAddress } from "./connectionAddress.js";
import { clearLocalDraft } from "./draft.js";
import { materializeLocalWorkbook } from "./localSync.js";
import { createLocalWorkbook } from "../model/workbook.js";

/**
 * @file Coordinates Sheets transport availability and workbook synchronization.
 * @description
 * The Awtsmoos joins a private beginning to a shared address only when the vessel
 * can truly carry that bond. Awtsmoos.com therefore lets embedded Sheets remain
 * quiet and local while standalone Sheets keeps the established realtime path.
 */
export class YesodConnectionCoordinator {
	constructor(client, session, workbook, callbacks = {}, policy = {}) {
		this.client = client;
		this.session = session;
		this.workbook = workbook;
		this.callbacks = callbacks;
		this.transportEnabled = policy.transportEnabled !== false;
		this.localLabel = policy.localLabel || "Local workbook";
		this.synchronizing = false;
		this.bind();
	}

	/** Starts realtime when permitted, otherwise announces a stable local-first state. */
	start() {
		if (!this.transportEnabled) {
			this.callbacks.onStatus?.("local");
			this.callbacks.onLocalOnly?.(this.localLabel);
			return;
		}

		this.client.connect();
	}

	/** Creates a clean workbook and materializes it only when transport is enabled. */
	async startNew() {
		clearLocalDraft();
		clearWorkbookAddress();
		this.workbook.load(createLocalWorkbook());

		if (!this.transportEnabled) {
			this.callbacks.onLocalOnly?.(this.localLabel);
			return;
		}

		await this.synchronize(true);
	}

	/** Opens remote truth when possible or keeps the current local workbook untouched. */
	async synchronize(forceMaterialize = false) {
		if (!this.transportEnabled || this.synchronizing) {
			return;
		}

		this.synchronizing = true;

		try {
			const requested = readWorkbookAddress();

			if (requested.id && !forceMaterialize) {
				await this.session.open(requested.id, requested.key);
				this.callbacks.onReady?.("Shared");
				return;
			}

			if (this.workbook.data.id && !forceMaterialize) {
				await this.session.open(this.workbook.data.id, requested.key);
				writeWorkbookAddress(this.workbook.data.id, requested.key);
				this.callbacks.onReady?.("Shared");
				return;
			}

			await materializeLocalWorkbook(this.session, this.workbook);
			writeWorkbookAddress(this.workbook.data.id);
			this.callbacks.onReady?.("Saved to Awtsmoos");
		} catch (error) {
			this.handleSyncError(error);
		} finally {
			this.synchronizing = false;
		}
	}

	/** @param {Error} error Synchronization failure. @returns {void} */
	handleSyncError(error) {
		if (error?.code === "SHEETS_AUTH_REQUIRED") {
			this.callbacks.onLocalOnly?.("Local draft · sign in to share");
			return;
		}

		this.callbacks.onError?.(error);
	}

	/** Watches transport status and restarts synchronization after a real reconnect. */
	bind() {
		this.client.addEventListener("status", (event) => {
			const status = event.detail.status;
			this.callbacks.onStatus?.(status);

			if (status === "online") {
				this.synchronize();
			}
		});
	}
}
