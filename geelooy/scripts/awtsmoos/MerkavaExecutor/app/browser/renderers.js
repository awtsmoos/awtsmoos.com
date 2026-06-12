// B"H
(function browserRenderers(root) {
  const ect = root.AwtsEctBrowser;

  /**
   * B"H. The renderer gate.
   * Native runs source. Virtual renders compiled HTML with exact render CSS.
   * WebGL first measures that same compiled/CSS DOM, then draws the measured
   * boxes as GPU quads with live text overlays. The Awtsmoos refuses fake bars.
   */
  ect.render = function render(project, compileResult) {
    const frame = ect.el("preview");
    const engine = ect.el("rendererSelect").value;
    const doc = frame && frame.contentDocument;
    if (!doc) return { ok: false, engine: "Preview", error: "Preview document unavailable." };
    if (engine === "native") return nativeDom(doc, project);
    const reconstruction = compileResult && (compileResult.renderReconstruction || compileResult.reconstruction);
    if (!reconstruction) return fail(doc, label(engine), "No compiled semantic reconstruction yet.");
    if (engine === "virtual") return virtualDom(doc, reconstruction, compileResult.renderCss || "");
    if (engine === "webgl") return webglDom(doc, reconstruction, compileResult.renderCss || "");
    return fail(doc, label(engine), "Unknown renderer engine.");
  };

  function nativeDom(doc, project) {
    writeDoc(doc, ect.concatFiles(project, ".html"), ect.concatFiles(project, ".css"), "");
    try { Function("document", "window", ect.concatFiles(project, ".js"))(doc, doc.defaultView); }
    catch (error) { return fail(doc, "Native DOM", error.message); }
    return { ok: true, engine: "Native DOM" };
  }

  function virtualDom(doc, reconstruction, css) {
    writeDoc(doc, reconstruction.html || "<main></main>", css, virtualBaseCss());
    const count = doc.body ? doc.body.querySelectorAll("*").length : 0;
    if (!count) return fail(doc, "Merkava Virtual DOM", "Compiled tree produced no renderable elements.");
    markPreview(doc, "Merkava Virtual DOM", count);
    return { ok: true, engine: "Merkava Virtual DOM", primitives: count };
  }

  function webglDom(doc, reconstruction, css) {
    writeDoc(doc, webglShell(reconstruction.html || "<main></main>", css), "", webglCss());
    const canvas = doc.getElementById("merkavaCanvas");
    const gl = canvas.getContext("webgl", { antialias: true }) || canvas.getContext("experimental-webgl");
    if (!gl) return fail(doc, "Merkava WebGL", "Browser refused WebGL context.");
    let primitives = measurePrimitives(doc);
    const measured = primitives.length > 0;
    if (!measured) primitives = fallbackPrimitives(doc, reconstruction.html || "<main></main>");
    if (!primitives.length) return fail(doc, "Merkava WebGL", "Compiled DOM produced no WebGL boxes.");
    const program = makeProgram(gl);
    if (!program) return fail(doc, "Merkava WebGL", "WebGL shader program failed.");
    paintPrimitives(gl, program, primitives);
    canvas.dataset.primitiveCount = String(primitives.length);
    fillOverlay(doc, primitives, measured);
    return { ok: true, engine: "Merkava WebGL", primitives: primitives.length, measured };
  }

  function webglShell(html, css) {
    return '<div class="awts-webgl-wrap"><canvas id="merkavaCanvas" width="720" height="520"></canvas><section id="awtsMeasure" class="awts-measure"><style>' + css + '</style>' + html + '</section><div id="merkavaOverlay" class="awts-webgl-overlay"></div></div>';
  }

  function measurePrimitives(doc) {
    const root = doc.getElementById("awtsMeasure");
    const canvas = doc.getElementById("merkavaCanvas");
    if (!root || !canvas) return [];
    const bounds = root.getBoundingClientRect();
    const nodes = Array.from(root.querySelectorAll("*"));
    return nodes.map((node, index) => primitiveFromNode(doc, node, bounds, canvas, index)).filter(Boolean).slice(0, 128);
  }

  function primitiveFromNode(doc, node, bounds, canvas, index) {
    const rect = node.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return null;
    const style = doc.defaultView.getComputedStyle(node);
    const left = ((rect.left - bounds.left) / Math.max(1, bounds.width)) * 100;
    const top = ((rect.top - bounds.top) / Math.max(1, bounds.height)) * 100;
    const x1 = (left / 50) - 1;
    const y1 = 1 - (top / 50);
    const x2 = (((rect.right - bounds.left) / Math.max(1, bounds.width)) * 2) - 1;
    const y2 = 1 - (((rect.bottom - bounds.top) / Math.max(1, bounds.height)) * 2);
    return {
      x: clamp(x1, -1, 1), y: clamp(y1, -1, 1), width: clamp(x2 - x1, 0.02, 2), height: clamp(y1 - y2, 0.02, 2),
      left: Math.round(left), top: Math.round(top), tag: node.tagName || "X", text: directText(node).trim(),
      childCount: node.children ? node.children.length : 0, color: parseColor(style.backgroundColor, index)
    };
  }

  function fillOverlay(doc, primitives, measured) {
    const overlay = doc.getElementById("merkavaOverlay");
    if (!overlay) return;
    const title = measured ? "measured CSS boxes" : "compiled tree fallback";
    overlay.innerHTML = '<div class="awts-webgl-title">Merkava WebGL • ' + title + ': ' + primitives.length + '</div>' + primitives.filter(item => item.text || item.tag === "BUTTON" || item.tag === "OUTPUT" || item.tag === "H2").slice(0, 16).map(item => '<div class="awts-gl-label" style="left:' + item.left + '%;top:' + item.top + '%"><b>' + ect.escapeHtml(item.tag.toLowerCase()) + '</b>' + (item.text ? '<span>' + ect.escapeHtml(item.text).slice(0, 44) + '</span>' : '<span>children ' + item.childCount + '</span>') + '</div>').join("");
  }

  function markPreview(doc, engine, count) {
    const mark = doc.createElement("div");
    mark.className = "awts-engine-mark";
    mark.textContent = engine + " • compiled nodes " + count;
    doc.body.appendChild(mark);
  }

  function fallbackPrimitives(doc, html) {
    const template = doc.createElement("template");
    template.innerHTML = html || "<main></main>";
    const nodes = [];
    Array.from(template.content.children || []).forEach(node => collectFallback(node, 0, nodes));
    return nodes;
  }

  function collectFallback(node, depth, list) {
    if (!node || node.nodeType !== 1) return;
    const index = list.length;
    const text = directText(node).trim();
    list.push({ x: -0.88 + depth * 0.14, y: 0.82 - index * 0.18, width: Math.max(0.25, 1.55 - depth * 0.16), height: 0.14, left: 6 + depth * 9, top: 9 + index * 10, tag: node.tagName || "X", text, childCount: node.children ? node.children.length : 0, color: [0.08 + depth * 0.08, 0.42, 0.56] });
    Array.from(node.children || []).forEach(child => collectFallback(child, depth + 1, list));
  }

  function fallbackPrimitives(doc, html) {
    const template = doc.createElement("template");
    template.innerHTML = html || "<main></main>";
    const nodes = [];
    Array.from(template.content.children || []).forEach(node => collectFallback(node, 0, nodes));
    return nodes;
  }

  function collectFallback(node, depth, list) {
    if (!node || node.nodeType !== 1) return;
    const index = list.length;
    const text = directText(node).trim();
    list.push({ x: -0.88 + depth * 0.14, y: 0.82 - index * 0.18, width: Math.max(0.25, 1.55 - depth * 0.16), height: 0.14, left: 6 + depth * 9, top: 9 + index * 10, tag: node.tagName || "X", text, childCount: node.children ? node.children.length : 0, color: [0.08 + depth * 0.08, 0.42, 0.56] });
    Array.from(node.children || []).forEach(child => collectFallback(child, depth + 1, list));
  }

  function makeProgram(gl) {
    const vert = shader(gl, gl.VERTEX_SHADER, "attribute vec2 p;attribute vec3 c;varying vec3 v;void main(){v=c;gl_Position=vec4(p,0.0,1.0);}");
    const frag = shader(gl, gl.FRAGMENT_SHADER, "precision mediump float;varying vec3 v;void main(){gl_FragColor=vec4(v,1.0);}");
    if (!vert || !frag) return null;
    const program = gl.createProgram();
    gl.attachShader(program, vert); gl.attachShader(program, frag); gl.linkProgram(program);
    return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
  }

  function shader(gl, type, source) {
    const item = gl.createShader(type);
    gl.shaderSource(item, source); gl.compileShader(item);
    return gl.getShaderParameter(item, gl.COMPILE_STATUS) ? item : null;
  }

  function paintPrimitives(gl, program, primitives) {
    const data = [];
    primitives.forEach(box => quad(data, box, box.color));
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.01, 0.02, 0.04, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "p"), col = gl.getAttribLocation(program, "c");
    gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(col); gl.vertexAttribPointer(col, 3, gl.FLOAT, false, 20, 8);
    gl.drawArrays(gl.TRIANGLES, 0, data.length / 5);
  }

  function quad(out, box, c) {
    const x1 = box.x, y1 = box.y, x2 = box.x + box.width, y2 = box.y - box.height;
    [[x1, y1], [x2, y1], [x1, y2], [x1, y2], [x2, y1], [x2, y2]].forEach(p => out.push(p[0], p[1], c[0], c[1], c[2]));
  }

  function parseColor(value, index) {
    const match = String(value || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];
    return [0.08 + (index % 4) * 0.08, 0.42, 0.54];
  }

  function virtualBaseCss() { return "body{margin:0;min-height:100%;background:white;color:#06141f;font-family:system-ui,sans-serif;padding:16px;box-sizing:border-box}.awts-engine-mark{position:fixed;right:8px;bottom:8px;z-index:9999;padding:6px 9px;border-radius:999px;background:#02050a;color:#73fff2;font:700 11px monospace;opacity:.86;pointer-events:none}"; }
  function webglCss() { return "body{margin:0;background:#02050a;color:#eaffff;font-family:system-ui,sans-serif}.awts-webgl-wrap{position:relative;min-height:440px;background:#02050a;overflow:hidden}canvas{display:block;width:100%;height:100%;min-height:440px}.awts-measure{position:absolute;inset:0;z-index:-1;opacity:0;pointer-events:none;background:white;color:#06141f;padding:16px;box-sizing:border-box}.awts-webgl-overlay{position:absolute;inset:0;pointer-events:none}.awts-webgl-title{position:absolute;left:10px;right:10px;bottom:10px;padding:8px 10px;border-radius:12px;background:rgba(2,5,10,.82);color:#73fff2;font:700 12px monospace}.awts-gl-label{position:absolute;max-width:55%;padding:5px 7px;border-radius:8px;background:rgba(2,5,10,.82);color:#fff;font:11px monospace;box-shadow:0 0 0 1px rgba(115,255,242,.35)}.awts-gl-label b{color:#73fff2;margin-right:6px}.awts-gl-label span{color:#fff}"; }
  function directText(node) { return Array.from(node.childNodes || []).filter(child => child.nodeType === 3).map(child => child.nodeValue || "").join(" "); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function label(value) { return value === "virtual" ? "Merkava Virtual DOM" : value === "webgl" ? "Merkava WebGL" : String(value || "Engine"); }
  function fail(doc, engine, message) { writeDoc(doc, `<pre class="rendererError">${ect.escapeHtml(engine)} error: ${ect.escapeHtml(message)}</pre>`, ".rendererError{color:#ffb4b4;background:#24070a;padding:20px;white-space:pre-wrap}", "body{margin:0;background:#02050a}"); return { ok: false, engine, error: message }; }
  function writeDoc(doc, html, css, baseCss) { doc.open(); doc.write(`<!doctype html><html><head><style>${baseCss || ""}\n${css || ""}</style></head><body>${html || "<main></main>"}</body></html>`); doc.close(); }
})(window);
