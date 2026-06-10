// B"H
(function ectUi(root) {
  const ect = root.AwtsECT;

  function shell() {
    return `<section class="forgeGrid"><section class="actionPanel"><label class="panelTitle">Whole Project</label><select id="projectSelect">${ect.projects.map(p => `<option value="${p.id}">${p.title}</option>`).join("")}</select><label class="panelTitle">Renderer</label><select id="rendererSelect"><option value="html">Normal HTML rendering</option><option value="webgl">Merkava virtual WebGL DOM</option></select><button id="loadExample">Load Example</button><button id="compile">Compile Current Text</button><p class="hint">Current text is parsed live into HTML tree ops, CSS typed values, JS host/name ops, local pools, then packed.</p></section><section class="editorPanel"><label class="panelTitle">Merged Editable Source</label><textarea id="sourceView"></textarea></section><section class="metricPanel"><div class="panelTitle">ECT Metrics</div><div id="metrics" class="metrics"></div></section><section class="previewPanel"><div class="panelTitle">Live Preview</div><iframe id="preview"></iframe></section><section class="bmpPanel"><div class="panelTitle">BMP Byte Vessel</div><img id="bmpPreview"><pre id="bmpMeta"></pre></section><section class="bytePanel"><div class="panelTitle">Project Bytecode</div><pre id="bytecode"></pre></section><section class="rebuiltPanel"><div class="panelTitle">Discovered Universe</div><pre id="universe"></pre></section></section>`;
  }

  function compile() {
    const base = currentProject();
    const project = projectFromEditor(base);
    const renderer = el("rendererSelect").value;
    const code = ect.packProject(project);
    const doc = ect.renderProject(project, el("preview"));
    const ram = ect.lowerToRam(project, renderer);
    const result = ect.executeRam(ram, project, doc);
    const bmp = ect.toBmp(code);
    show(code, ram, result, bmp);
    el("status").textContent = result.status.toLowerCase();
  }

  function loadExample() {
    const project = currentProject();
    el("sourceView").value = ect.sourceText(project);
    compile();
  }

  function projectFromEditor(base) {
    const files = parseSourceView(el("sourceView").value);
    return { id: base.id, title: base.title, kind: base.kind, precompiled: false, files: Object.keys(files).length ? files : base.files };
  }

  function parseSourceView(text) {
    const files = {};
    const parts = String(text || "").split(/\/\/ FILE: /g).filter(Boolean);
    parts.forEach(part => {
      const firstBreak = part.indexOf("\n");
      if (firstBreak < 0) return;
      const name = part.slice(0, firstBreak).trim();
      files[name] = part.slice(firstBreak + 1).replace(/^\n+|\n+$/g, "");
    });
    return files;
  }

  function show(code, ram, result, bmp) {
    const m = code.metrics;
    const cards = [["Original bytes", m.originalSourceBytes], ["Storage bytes", m.storageBytes], ["Compression", m.compressionX + "x"], ["Mode", m.mode], ["Payload", m.payloadKind], ["RAM bytes", ram.ramBytes], ["Engine", result.engine], ["Pool/op bytes", poolOpText(m.detail)]];
    el("metrics").innerHTML = cards.map(card => `<div><b>${card[1]}</b><span>${card[0]}</span></div>`).join("");
    el("bytecode").textContent = JSON.stringify({ bytes: code.bytes.slice(0, 420), byteCount: code.bytes.length, bitLength: code.bitLength, metrics: m, payloadKind: code.payloadKind, ram: { opcodes: Array.from(ram.image.opcodes), operands: Array.from(ram.image.operands) } }, null, 2);
    el("universe").textContent = JSON.stringify({ symbols: code.analysis.symbols, repeats: code.analysis.repeats, files: Object.keys(code.project.files), semanticDetail: m.detail }, null, 2);
    el("bmpPreview").src = bmp.dataUrl;
    el("bmpMeta").textContent = `${bmp.width}x${bmp.height} BMP • ${bmp.bmpBytes} bytes • storage ${m.storageBytes} bytes`;
  }

  function poolOpText(detail) {
    if (!detail) return "n/a";
    if (detail.poolBytes || detail.opBytes) return `${detail.poolBytes || 0}/${detail.opBytes || 0}`;
    return detail.lzBytes || detail.literalBytes || "n/a";
  }

  function currentProject() {
    const id = Number(el("projectSelect").value || 0);
    return ect.projects.find(project => project.id === id) || ect.projects[0];
  }

  function el(id) { return document.getElementById(id); }

  function init() {
    el("app").innerHTML = shell();
    loadExample();
  }

  document.addEventListener("click", event => {
    if (event.target && event.target.id === "compile") compile();
    if (event.target && event.target.id === "loadExample") loadExample();
  });
  document.addEventListener("change", event => { if (event.target && /Select$/.test(event.target.id)) loadExample(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})(window);
