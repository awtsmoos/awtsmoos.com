// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reads and writes document source bytes through the native Awtsmoos Drive API.
 * @description The Awtsmoos lets one living page descend into many finite formats;
 * Awtsmoos.com preserves each MIME and path so Drive navigation reflects the actual source vessel.
 */
export class DriveDocumentGateway {
	constructor(apiBase = "/api/social") {
		this.apiBase = apiBase;
	}

	async load(aliasId, path) {
		const response = await fetch(
			`${this.apiBase}/drive/${encodeURIComponent(aliasId)}/entry/${encodePath(path)}?content=true`,
			{ credentials: "include" }
		);
		if (!response.ok) throw new Error(`Drive read failed (${response.status})`);
		const payload = await response.json();
		return typeof payload === "string"
			? payload
			: payload.content ?? payload.text ?? JSON.stringify(payload.json ?? payload);
	}

	async save({
		aliasId,
		path,
		content,
		mime = "application/octet-stream",
		visibility = "private"
	}) {
		const response = await fetch(
			`${this.apiBase}/drive/${encodeURIComponent(aliasId)}/entry/${encodePath(path)}`,
			{
				method: "PUT",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content, mime, visibility })
			}
		);
		if (!response.ok) throw new Error(`Drive save failed (${response.status})`);
		return response.json();
	}

	publicUrl(aliasId, path) {
		return `${this.apiBase}/drive/public/${encodeURIComponent(aliasId)}/${encodePath(path)}`;
	}
}

function encodePath(path) {
	return String(path || "")
		.split("/")
		.filter(Boolean)
		.map(encodeURIComponent)
		.join("/");
}
