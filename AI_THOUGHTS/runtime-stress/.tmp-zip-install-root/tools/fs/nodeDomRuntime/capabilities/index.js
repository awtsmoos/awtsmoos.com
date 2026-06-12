// B"H
/**
 * B"H
 * The capability report refuses false Chrome claims. Canvas/WebGL/Worker exist,
 * but they are virtual vessels unless a real backend is later attached.
 */
function capabilityReport() {
  return {
    chromeParity: false,
    javascript: "node-vm",
    dom: "merkava-virtual-dom",
    workers: "in-process-virtual-worker",
    canvas2d: "command-recorder",
    webgl: "state-command-recorder",
    offscreenCanvas: "command-recorder",
    css: "partial-synthetic-css-engine",
    layout: "synthetic-not-chrome-layout",
    fetch: "data-url-and-virtual-files",
    storage: "local-session-storage",
    indexedDB: "missing",
    cacheApi: "missing",
    serviceWorker: "missing",
    media: "stubbed-audio-no-real-video",
    puppeteerApi: "compat-subset",
    playwrightApi: "compat-subset"
  };
}
module.exports = { capabilityReport };
