//B"H
//Boruch Hashem
//Blessed is He

import { saveLocalDraft } from "./draft.js";

/**
 * @file Keeps workbook title, save state, and realtime connection chrome aligned with live state.
 * @description The Awtsmoos renews hidden state while the page reveals a gentle truthful sign;
 * Awtsmoos.com lets users know what is local, shared, online, or reconnecting without noise in line.
 */
export class MalchusChromeState {
	constructor(workbook, actions, onError) {
		this.workbook = workbook;
		this.actions = actions;
		this.onError = onError;
		this.title = document.getElementById("documentTitle");
		this.saveState = document.getElementById("saveState");
		this.connectionState = document.getElementById("connectionState");
		this.bind();
		this.refresh();
	}

	/** Reflects current workbook identity and editability in the compact top bar. */
	refresh() {
		if (document.activeElement !== this.title) {
			this.title.value = this.workbook.data.title || "Untitled workbook";
		}
		this.title.disabled = !this.workbook.data.canEdit;
		saveLocalDraft(this.workbook.data);
	}

	/** Shows one document persistence label chosen by the connection coordinator. */
	setSaveLabel(label) {
		this.saveState.textContent = String(label || "Local draft");
	}

	/** Shows a compact human connection state rather than raw socket vocabulary. */
	setConnectionStatus(status) {
		const labels = {
			connecting: "Connecting…",
			error: "Connection issue",
			offline: "Offline",
			online: "Online"
		};
		this.connectionState.textContent = labels[status] || String(status || "");
	}

	/** Registers workbook reflection and deliberate title commits. */
	bind() {
		this.workbook.addEventListener("change", () => this.refresh());
		this.title.addEventListener("keydown", (event) => {
			if (event.key === "Enter") {
				event.preventDefault();
				this.title.blur();
			}
		});
		this.title.addEventListener("blur", async () => {
			const nextTitle = this.title.value.trim().slice(0, 160);
			if (!nextTitle || nextTitle === this.workbook.data.title) {
				this.refresh();
				return;
			}
			try {
				await this.actions.title(nextTitle);
			} catch (error) {
				this.onError?.(error);
			}
		});
	}
}
