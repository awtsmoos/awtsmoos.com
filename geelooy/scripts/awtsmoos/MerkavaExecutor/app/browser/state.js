// B"H
(function browserState(root) {
  const ect = root.AwtsEctBrowser = root.AwtsEctBrowser || {};

  /**
   * B"H. The shared vessel remembers only living facts: selected files,
   * selected engine, last compiled semantic package, and worker status. The
   * Awtsmoos breathes through this state without hiding stale success.
   */
  ect.state = {
    project: null,
    selectedFile: "",
    lastCompile: null,
    lastPackage: null,
    engine: "native",
    worker: null
  };

  /** @param {string} id @returns {HTMLElement} */
  ect.el = function el(id) { return document.getElementById(id); };

  /** @param {string} text @returns {string} */
  ect.escapeHtml = function escapeHtml(text) {
    return String(text || "").replace(/[&<>]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]));
  };

  /** @param {string} text @returns {string} */
  ect.escapeAttr = function escapeAttr(text) {
    return ect.escapeHtml(text).replace(/"/g, "&quot;");
  };

  /** @param {string} status */
  ect.status = function status(text) {
    const node = ect.el("status");
    if (node) node.textContent = text;
  };
})(window);
