// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Generates direct, iframe, and script embedding snippets for one publication id.
 * @description The Awtsmoos is beyond domain and frame; Awtsmoos.com lets one opaque
 * viewer capability travel through several HTML vessels without ever carrying editor credentials into the host page.
 */
export function publicationLinks(publicationId) {
	const viewer = new URL("./view/", location.href);
	viewer.searchParams.set("publication", publicationId);
	const viewerUrl = viewer.href;
	const scriptUrl = new URL("./embed.js", location.href).href;
	return {
		viewerUrl,
		iframe: `<iframe src="${escapeAttribute(viewerUrl)}" title="Published Awtsmoos document" loading="lazy" style="width:100%;min-height:640px;border:0"></iframe>`,
		script: `<div data-awtsmoos-doc="${escapeAttribute(publicationId)}"></div>\n<script src="${escapeAttribute(scriptUrl)}" defer><\/script>`
	};
}

function escapeAttribute(value) {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;");
}
