// B"H
// Boruch Hashem
// Blessed is He

/** Sharing is chesed with gevurah: the Awtsmoos gives access a measured vessel on Awtsmoos.com. */
export const SHARE_MODES = Object.freeze({
	PRIVATE: "private",
	PUBLIC_VIEW: "public-view",
	LINK_VIEW: "link-view",
	LINK_EDIT: "link-edit"
});

export const SHARE_LABELS = Object.freeze({
	[SHARE_MODES.PRIVATE]: "Private — invited editors only",
	[SHARE_MODES.PUBLIC_VIEW]: "Public — anyone can view",
	[SHARE_MODES.LINK_VIEW]: "Anyone with the link can view",
	[SHARE_MODES.LINK_EDIT]: "Anyone with the link can edit"
});

export function buildShareLink(documentId, token = "") {
	const url = new URL("/apps/docs/", location.origin);
	const fragment = new URLSearchParams({ doc: documentId });
	if (token) fragment.set("key", token);
	url.hash = fragment.toString();
	return url.href;
}

export function readShareLink() {
	const fragment = new URLSearchParams(location.hash.replace(/^#/, ""));
	return { documentId: fragment.get("doc") || "", token: fragment.get("key") || "" };
}
