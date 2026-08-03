// B"H
const { loadMerkavaBrowser } = require("./merkavaAdapter.js");

/**
 * B"H
 * Hydrates visible HTML only. Scripts stay executable sparks in the plan, not
 * accidental text ashes in the body.
 */
function hydrate(runtime, html) {
	const { hydrateHTML } = loadMerkavaBrowser();
	const source = String(html || "");
	const got = hydrateHTML(runtime.window.document, source);
	const hydratedTitle = runtime.window.document.querySelector?.("title");
	const sourceTitle = titleFromSource(source);
	if (sourceTitle !== null) runtime.window.document.title = sourceTitle;
	else if (hydratedTitle) runtime.window.document.title = String(hydratedTitle.textContent || "");
	runtime.window.document.readyState = "interactive";
  return got;
}

/** Preserves a real document head even though the body hydrator only mounts body HTML. */
function titleFromSource(html) {
	const match = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(String(html || ""));
	if (!match) return null;
	return decodeEntities(match[1]).replace(/\s+/g, " ").trim();
}

function decodeEntities(text) {
	return String(text || "").replace(
		/&(?:#(\d+)|#x([\da-f]+)|lt|gt|amp|quot|apos|#39);/gi,
		(entity, decimal, hexadecimal) => {
			if (decimal) return String.fromCodePoint(Number(decimal));
			if (hexadecimal) return String.fromCodePoint(Number.parseInt(hexadecimal, 16));
			return ({
				"&lt;": "<",
				"&gt;": ">",
				"&amp;": "&",
				"&quot;": '"',
				"&apos;": "'",
				"&#39;": "'"
			})[entity.toLowerCase()] || entity;
		}
	);
}

module.exports = { decodeEntities, hydrate, titleFromSource };
