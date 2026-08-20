//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Owns the workbook sharing dialog and its owner-only controls.
 * @description The Awtsmoos gives every gate its measure: private, link, or public in sight;
 * Awtsmoos.com lets an owner widen the vessel without confusing permission with light.
 */
export class GevurahShareDialog {
	constructor(workbook, callbacks = {}) {
		this.workbook = workbook;
		this.callbacks = callbacks;
		this.dialog = document.getElementById("shareDialog");
		document.getElementById("shareButton").addEventListener("click", () => this.open());
	}

	/** Rebuilds and opens sharing controls from current server-authoritative capabilities. */
	open() {
		const canShare = Boolean(this.workbook.data.canShare);
		const link = this.shareLink();
		this.dialog.innerHTML = `
			<form method="dialog" class="dialog-stack">
				<h2>Share workbook</h2>
				<label>Access
					<select id="shareVisibility" ${canShare ? "" : "disabled"}>
						<option value="private">Private</option>
						<option value="link">Anyone with link can view</option>
						<option value="public">Public and discoverable</option>
					</select>
				</label>
				<label>Share link
					<input id="shareLink" readonly value="${escapeAttribute(link)}">
				</label>
				<label>Invite editor by account ID
					<input id="editorIdentity" ${canShare ? "" : "disabled"} placeholder="Verified Awtsmoos account ID">
				</label>
				<div class="dialog-actions">
					<button value="cancel" class="quiet-button">Close</button>
					<button type="button" id="copyShareLink" class="quiet-button">Copy link</button>
					<button type="button" id="saveSharing" class="primary-button" ${canShare ? "" : "disabled"}>Save</button>
				</div>
			</form>`;
		this.dialog.querySelector("#shareVisibility").value = this.workbook.data.visibility || "private";
		this.bindDialogActions();
		this.dialog.showModal();
	}

	/** Builds a same-origin URL and includes the link capability only when present. */
	shareLink() {
		if (!this.workbook.data.id) {
			return location.href;
		}
		const url = new URL("./", location.href);
		url.searchParams.set("sheet", this.workbook.data.id);
		if (this.workbook.data.visibility === "link" && this.workbook.data.linkToken) {
			url.searchParams.set("key", this.workbook.data.linkToken);
		}
		return url.href;
	}

	/** Connects dialog buttons to capability-aware application commands. */
	bindDialogActions() {
		this.dialog.querySelector("#copyShareLink").addEventListener("click", async () => {
			await navigator.clipboard.writeText(this.shareLink());
		});
		this.dialog.querySelector("#saveSharing").addEventListener("click", async () => {
			const visibility = this.dialog.querySelector("#shareVisibility").value;
			const editorId = this.dialog.querySelector("#editorIdentity").value.trim();
			await this.callbacks.onVisibility?.(visibility);
			if (editorId) {
				await this.callbacks.onInvite?.(editorId);
			}
			this.dialog.close();
		});
	}
}

/** Escapes text before placing it inside an HTML attribute assembled for a dialog. */
function escapeAttribute(value) {
	return String(value || "")
		.replaceAll("&", "&amp;")
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;");
}
