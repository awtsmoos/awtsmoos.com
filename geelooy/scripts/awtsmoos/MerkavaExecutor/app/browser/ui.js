// B"H
(function browserUi(root) {
  const ect = root.AwtsEctBrowser;

  /**
   * B"H. The UI does not hide failure. Metrics stay bound to the compact
   * stream, while preview/render proof is shown separately so the user can see
   * that Virtual DOM/WebGL are drinking the render-preserved vessel.
   */
  ect.mount = function mount() {
    ect.el("app").innerHTML = shell();
    ect.el("projectSelect").innerHTML = ect.examples.map((p, i) => `<option value="${i}">${ect.escapeHtml(p.title)}</option>`).join("");
    bind();
    selectExample(0);
  };

  function shell() {
    return `<section class="forgeGrid"><section class="actionPanel"><label class="panelTitle">Project</label><select id="projectSelect"></select><label class="panelTitle">Engine</label><select id="rendererSelect"><option value="native">Native DOM</option><option value="virtual">Merkava Virtual DOM</option><option value="webgl">Merkava WebGL</option></select><input id="sourceUpload" type="file" multiple accept=".html,.css,.js,.mjs,.cjs,.awtect"><button id="loadExample">Load Example</button><button id="compile">Compile</button><button id="downloadBinary">Save .awtect</button><p class="hint">Metrics use maximum semantic compression. Preview uses render-preserved reconstruction.</p></section><section class="filesPanel"><div class="panelTitle">Merged Source</div><textarea id="sourceView"></textarea></section><section class="metricPanel"><div class="panelTitle">Metrics</div><div id="metrics" class="metrics"></div></section><section class="previewPanel"><div class="panelTitle">Preview</div><iframe id="preview"></iframe></section><section class="bytePanel"><div class="panelTitle">Binary / Proof</div><pre id="bytecode"></pre></section><section class="rebuiltPanel"><div class="panelTitle">Universe</div><pre id="universe"></pre></section></section>`;
  }

  function bind() {
    ect.el("loadExample").onclick = () => selectExample(Number(ect.el("projectSelect").value || 0));
    ect.el("projectSelect").onchange = () => selectExample(Number(ect.el("projectSelect").value || 0));
    ect.el("rendererSelect").onchange = () => renderOnly();
    ect.el("compile").onclick = () => compile();
    ect.el("downloadBinary").onclick = () => downloadBinary();
    ect.el("sourceUpload").onchange = event => upload(event.target.files);
  }

  function selectExample(index) {
    ect.state.project = ect.examples[index] || ect.examples[0];
    ect.el("sourceView").value = ect.sourceText(ect.state.project);
    compile();
  }

  async function upload(files) {
    const first = files && files[0];
    if (!first) return;
    if (first.name.endsWith(".awtect")) return uploadBinary(first);
    ect.state.project = await ect.projectFromFiles(files);
    ect.el("sourceView").value = ect.sourceText(ect.state.project);
    compile();
  }

  async function uploadBinary(file) {
    try {
      const pack = ect.decodePackage(await file.arrayBuffer());
      ect.state.lastPackage = pack;
      ect.state.project = ect.projectFromPackage(pack);
      ect.state.lastCompile = {
        metrics: pack.metrics,
        renderMetrics: pack.renderMetrics,
        byteCount: pack.byteCount,
        reconstruction: pack.reconstruction,
        renderReconstruction: pack.renderReconstruction,
        universe: pack.universe,
        bytes: pack.storage
      };
      ect.el("sourceView").value = ect.sourceText(ect.state.project);
      showPackage(pack);
      renderOnly();
    } catch (error) { showError(error); }
  }

  function compile() {
    ect.state.project = ect.syncEditorToProject(ect.state.project || ect.examples[0]);
    ect.status("compiling");
    ect.state.worker.postMessage({ project: ect.state.project });
  }

  ect.onCompile = function onCompile(result) {
    if (result.error) return showError(new Error(result.error));
    ect.state.lastCompile = result;
    ect.state.lastPackage = ect.makePackage(ect.state.project, result);
    showMetrics(result);
    renderOnly();
  };

  function renderOnly() {
    const verdict = ect.render(ect.state.project || ect.examples[0], ect.state.lastCompile);
    ect.status(verdict.ok ? verdict.engine : verdict.engine + " error");
    if (ect.state.lastCompile) showMetrics(ect.state.lastCompile, verdict);
  }

  function downloadBinary() {
    if (!ect.state.lastPackage) return showError(new Error("Compile first; no binary package exists."));
    ect.downloadBytes((ect.state.project.title || "project") + ".awtect", ect.encodePackage(ect.state.lastPackage));
  }

  function showMetrics(result, render) {
    const m = result.metrics || {}, detail = m.detail || {}, pools = detail.pools || {};
    const rows = [
      ["Original", m.originalSourceBytes], ["Storage", m.storageBytes], ["RAM", m.ramBytes], ["Ratio", m.compressionX + "x"],
      ["Ops", detail.ops], ["Pools", `t${pools.text||0}/s${pools.symbols||0}/n${pools.numbers||0}/c${pools.colors||0}/x${pools.custom||0}`],
      ["Engine", render ? render.engine : ect.el("rendererSelect").selectedOptions[0].text], ["Proof", proofYes(result) ? "yes" : "no"]
    ];
    ect.el("metrics").innerHTML = rows.map(r => `<div><b>${ect.escapeHtml(r[1])}</b><span>${ect.escapeHtml(r[0])}</span></div>`).join("");
    ect.el("bytecode").textContent = JSON.stringify(byteProof(result, render), null, 2);
    ect.el("universe").textContent = JSON.stringify(result.universe || {}, null, 2);
  }

  function byteProof(result, render) {
    return {
      byteCount: result.byteCount,
      bitLength: result.bitLength,
      storagePreview: result.bytes,
      metrics: result.metrics,
      renderMetrics: result.renderMetrics,
      activeRenderer: render || null,
      compactProof: result.reconstruction && result.reconstruction.proof,
      renderProof: result.renderReconstruction && result.renderReconstruction.proof,
      renderHasVisibleText: hasVisibleText(result.renderReconstruction)
    };
  }

  function proofYes(result) { return !!(result.reconstruction && result.reconstruction.proof && result.reconstruction.proof.reconstructable); }
  function hasVisibleText(reconstruction) { return !!(reconstruction && /[A-Za-z0-9]/.test((reconstruction.html || "").replace(/<[^>]*>/g, ""))); }
  function showPackage(pack) { ect.el("bytecode").textContent = JSON.stringify({ uploadedBinary: pack.format, byteCount: pack.byteCount, hasRenderReconstruction: !!pack.renderReconstruction, metrics: pack.metrics, renderMetrics: pack.renderMetrics }, null, 2); }
  function showError(error) { ect.status("error"); ect.el("metrics").innerHTML = `<div><b>ERROR</b><span>${ect.escapeHtml(error.message)}</span></div>`; }
})(window);
