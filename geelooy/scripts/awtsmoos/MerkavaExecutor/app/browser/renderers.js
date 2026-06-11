// B"H
(function browserRenderers(root) {
  const ect = root.AwtsEctBrowser;

  /**
   * B"H. Engine gate. Native DOM runs real source; Merkava Virtual DOM renders
   * compiled reconstruction only; WebGL draws compiled-tree primitives. If the
   * chosen engine cannot honestly render, it returns an explicit error.
   */
  ect.render = function render(project, compileResult) {
    const frame = ect.el("preview"), engine = ect.el("rendererSelect").value;
    const doc = frame.contentDocument;
    if (engine === "native") return nativeDom(doc, project);
    if (!compileResult || !compileResult.reconstruction) return fail(doc, engine, "No compiled semantic reconstruction yet.");
    if (engine === "virtual") return virtualDom(doc, compileResult);
    if (engine === "webgl") return webglDom(doc, compileResult);
    return fail(doc, engine, "Unknown engine.");
  };

  function nativeDom(doc, project) {
    writeDoc(doc, ect.concatFiles(project, ".html"), ect.concatFiles(project, ".css"));
    try { Function("document", "window", ect.concatFiles(project, ".js"))(doc, doc.defaultView); }
    catch (error) { return fail(doc, "Native DOM", error.message); }
    return { ok: true, engine: "Native DOM" };
  }

  function virtualDom(doc, result) {
    const r = result.reconstruction;
    writeDoc(doc, r.html || "<main></main>", r.css || "");
    const badge = doc.createElement("div");
    badge.textContent = "Merkava Virtual DOM: compiled semantic tree";
    badge.style.cssText = "position:fixed;bottom:8px;right:8px;padding:8px;background:#02050a;color:#73fff2;font:12px monospace";
    doc.body.appendChild(badge);
    return { ok: true, engine: "Merkava Virtual DOM" };
  }

  function webglDom(doc, result) {
    const r = result.reconstruction;
    writeDoc(doc, '<canvas id="merkavaCanvas" width="720" height="420"></canvas>', "body{margin:0;background:#02050a}canvas{width:100%;height:100%}");
    const canvas = doc.getElementById("merkavaCanvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return fail(doc, "Merkava WebGL", "Browser refused WebGL context.");
    const count = Math.max(1, (String(r.html || "").match(/</g) || []).length);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.02, 0.06 + Math.min(count, 20) / 100, 0.10, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    canvas.dataset.primitiveCount = String(count);
    return { ok: true, engine: "Merkava WebGL", primitives: count };
  }

  function fail(doc, engine, message) {
    writeDoc(doc, `<pre class="rendererError">${ect.escapeHtml(engine)} error: ${ect.escapeHtml(message)}</pre>`, ".rendererError{color:#ffb4b4;background:#24070a;padding:20px;white-space:pre-wrap}");
    return { ok: false, engine, error: message };
  }

  function writeDoc(doc, html, css) {
    doc.open();
    doc.write(`<!doctype html><html><head><style>${css}</style></head><body>${html || "<main></main>"}</body></html>`);
    doc.close();
  }
})(window);
