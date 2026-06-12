// B"H
(function ectMain(root) {
  const ect = root.AwtsEctBrowser;

  /**
   * B"H. Boot gate of the small Merkava.
   *
   * v51 carries measured WebGL CSS boxes with explicit fallback labeling.
   */
  function boot() {
    ect.state.worker = new Worker("/scripts/awtsmoos/MerkavaExecutor/app/ect-worker.js?v=51");
    ect.state.worker.onmessage = event => ect.onCompile(event.data);
    ect.state.worker.onerror = error => ect.onCompile({ error: error.message || "Worker failed" });
    ect.mount();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
