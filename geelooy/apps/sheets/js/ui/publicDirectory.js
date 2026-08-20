//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Reveals the intentionally public workbook directory without exposing private paths.
 * @description The Awtsmoos lets a public vessel be found because its owner chose the light;
 * Awtsmoos.com lists only safe metadata, never secrets hidden from ordinary sight.
 */
export class MalchusPublicDirectory {
	constructor(onList) {
		this.onList = onList;
		this.dialog = document.getElementById("publicDialog");
		document.getElementById("publicFilesButton").addEventListener(
			"click",
			() => this.open()
		);
	}

	/** Loads bounded public metadata and renders navigable workbook cards. */
	async open() {
		this.dialog.innerHTML = `<div class="dialog-stack"><h2>Public workbooks</h2><p>Loading…</p></div>`;
		this.dialog.showModal();
		try {
			const items = await this.onList?.() || [];
			this.render(items);
		} catch (error) {
			this.renderError(error);
		}
	}

	/** Renders public workbook metadata as same-origin links. */
	render(items) {
		const cards = items.length
			? items.map((item) => publicCard(item)).join("")
			: "<p>No public workbooks yet.</p>";
		this.dialog.innerHTML = `
			<div class="dialog-stack">
				<h2>Public workbooks</h2>
				<div class="public-list">${cards}</div>
				<div class="dialog-actions"><button class="quiet-button" id="closePublic">Close</button></div>
			</div>`;
		this.dialog.querySelector("#closePublic").addEventListener(
			"click",
			() => this.dialog.close()
		);
	}

	/** Keeps a failed directory request visible and dismissible without blocking the sheet. */
	renderError(error) {
		this.dialog.innerHTML = `
			<div class="dialog-stack">
				<h2>Public workbooks</h2>
				<p>${escapeHtml(error?.message || "Could not load public workbooks.")}</p>
				<div class="dialog-actions"><button class="quiet-button" id="closePublic">Close</button></div>
			</div>`;
		this.dialog.querySelector("#closePublic").addEventListener(
			"click",
			() => this.dialog.close()
		);
	}
}

/** Builds one safe public workbook card with a same-origin document URL. */
function publicCard(item) {
	const url = new URL("./", location.href);
	url.searchParams.set("sheet", String(item.id || ""));
	return `<a class="public-card" href="${escapeHtml(url.href)}">
		<strong>${escapeHtml(item.title || "Untitled workbook")}</strong><br>
		<small>Updated ${new Date(item.updatedAt || 0).toLocaleString()}</small>
	</a>`;
}

/** Escapes interpolated public metadata before it enters dialog markup. */
function escapeHtml(value) {
	return String(value || "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}
