// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders named and automatic history into the dedicated Awtsmoos Docs version dialog.
 * @description Netzach remembers while the Awtsmoos renews; Awtsmoos.com lets each
 * historical checkpoint appear with time, author, label, and a deliberate doorway to inspect or restore.
 */
export class VersionHistoryView {
	constructor(dialog) {
		this.dialog = dialog;
		this.list = dialog.querySelector("[data-version-list]");
		this.preview = dialog.querySelector("[data-version-preview]");
		this.summary = dialog.querySelector("[data-version-summary]");
		this.onSelect = () => {};
		this.onRestore = () => {};
		this.onName = () => {};
		this.#bind();
	}

	open() {
		if (!this.dialog.open) this.dialog.showModal();
	}

	close() {
		if (this.dialog.open) this.dialog.close();
	}

	renderList(versions = []) {
		this.list.replaceChildren(...versions.map(version => versionButton(version)));
		this.list.classList.toggle("is-empty", versions.length === 0);
	}

	renderPreview(version, summary) {
		this.preview.textContent = version?.snapshot?.blocks
			?.map(block => textFromHtml(block.html))
			.join("\n\n") || "No preview available.";
		this.summary.textContent = summary || "";
		this.dialog.querySelector("[data-version-restore]").disabled = !version;
		this.dialog.dataset.selectedVersion = version?.id || "";
	}

	#setSelection(versionId) {
		for (const button of this.list.querySelectorAll("[data-version-id]")) {
			button.classList.toggle("is-active", button.dataset.versionId === versionId);
		}
	}

	#bind() {
		this.dialog.addEventListener("click", event => {
			const version = event.target.closest("[data-version-id]");
			if (version) {
				this.#setSelection(version.dataset.versionId);
				void this.onSelect(version.dataset.versionId);
				return;
			}
			if (event.target.closest("[data-version-name]")) void this.onName();
			if (event.target.closest("[data-version-restore]")) {
				void this.onRestore(this.dialog.dataset.selectedVersion || "");
			}
			if (event.target.closest("[data-version-close]")) this.close();
		});
	}
}

function versionButton(version) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "version-item";
	button.dataset.versionId = version.id;
	const label = version.label || (version.kind === "initial" ? "Created" : "Automatic version");
	button.textContent = `${label} · ${formatDate(version.createdAt)}${version.author ? ` · ${version.author}` : ""}`;
	return button;
}

function formatDate(value) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "Unknown time" : date.toLocaleString();
}

function textFromHtml(html = "") {
	const template = document.createElement("template");
	template.innerHTML = String(html);
	return template.content.textContent?.trim() || "";
}
