// B"H
const path = require("path");
const { findMerkavaRoot } = require("./paths.js");

/**
 * B"H
 * Opens the existing Merkava browser palace. No duplicate DOM kingdom is built;
 * Node receives the living VirtualWindow that already knows canvas, WebGL,
 * Worker, fetch, storage, events, serialization, and interactions.
 */
function loadMerkavaBrowser() {
  const root = findMerkavaRoot(__dirname);
  return {
    root,
    VirtualWindow: require(path.join(root, "merkava-browser/VirtualWindow.js")).VirtualWindow,
    SyntheticBrowserRuntime: require(path.join(root, "merkava-browser/SyntheticBrowserRuntime.js")).SyntheticBrowserRuntime,
    HTMLAssembler: require(path.join(root, "merkava-runtime/HTMLAssembler.js")).HTMLAssembler,
    hydrateHTML: require(path.join(root, "merkava-runtime/DOMHydrator.js")).hydrateHTML
  };
}

function createRuntime(options) {
  const { SyntheticBrowserRuntime } = loadMerkavaBrowser();
  const runtime = new SyntheticBrowserRuntime({ files: options.files, url: options.url, graph: null });
  const globals = runtime.globals();
  runtime.__merkavaGlobals = globals;
  return { runtime, window: runtime.window, globals };
}

module.exports = { loadMerkavaBrowser, createRuntime };
