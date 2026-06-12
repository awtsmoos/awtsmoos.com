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
  runtime.window.document.readyState = "interactive";
  return got;
}

module.exports = { hydrate };
