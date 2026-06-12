// B"H
const { loadMerkavaBrowser } = require("./merkavaAdapter.js");

/**
 * B"H
 * Reuses Merkava's HTMLAssembler so script/importmap/style discovery remains
 * one law across Merkava and node-dom.
 */
function assembleHtml(options) {
  const { HTMLAssembler } = loadMerkavaBrowser();
  const files = options.files || {};
  const entry = options.entry || Object.keys(files).find(x => /\.html?$/i.test(x)) || "index.html";
  const html = files[entry] || options.html || "";
  const hydratedFiles = files[entry] ? files : { ...files, [entry]: html };
  const assembler = new HTMLAssembler({ files: hydratedFiles, origin: options.origin, base: entry });
  return { entry, files: hydratedFiles, html, plan: assembler.assemble(entry) };
}

module.exports = { assembleHtml };
