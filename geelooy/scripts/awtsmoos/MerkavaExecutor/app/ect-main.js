// B"H
(function ectMain(root) {
  const ect = root.AwtsEctBrowser;

  /**
   * B"H. Tiny boot gate. The old giant scroll was split so every vessel has a
   * name and a border. The Awtsmoos reveals compile results only after the
   * worker answers with metrics, proof, and semantic reconstruction.
   */
  function boot() {
    ect.state.worker = new Worker("/scripts/awtsmoos/MerkavaExecutor/app/ect-worker.js?v=41");
    ect.state.worker.onmessage = event => ect.onCompile(event.data);
    ect.state.worker.onerror = error => ect.onCompile({ error: error.message || "Worker failed" });
    ect.mount();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
