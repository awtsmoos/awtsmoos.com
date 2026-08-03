// B"H
const { loadMerkavaBrowser } = require("./merkavaAdapter.js");

/**
 * B"H
 * Hydrates visible HTML only. Scripts stay executable sparks in the plan, not
 * accidental text ashes in the body.
 */
function hydrate(runtime, html) {
	const { hydrateHTML } = loadMerkavaBrowser();
	const got = hydrateHTML(runtime.window.document, html || "");
	const title = runtime.window.document.querySelector?.("title");
	if (title) runtime.window.document.title = String(title.textContent || "");
	runtime.window.document.readyState = "interactive";
  return got;
}

module.exports = { hydrate };
