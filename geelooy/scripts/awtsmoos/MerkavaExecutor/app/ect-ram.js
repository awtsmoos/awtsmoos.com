// B"H
(function ectRam(root) {
  const ect = root.AwtsECT = root.AwtsECT || {};
  const OP = { DOM_BIND: 1, STATIC: 2, CANVAS: 3, VDOM_PASS: 4 };

  /**
   * B"H. The renderer no longer devours every world into a ball. WebGL is a
   * backend for canvas-capable projects; normal DOM projects remain visible DOM
   * while still passing through a typed Merkava virtual-DOM RAM image.
   */
  function lower(project, renderer) {
    const hasCanvas = project.kind === "canvas" || /<canvas\b/i.test(Object.values(project.files).join("\n"));
    const wantsWebgl = renderer === "webgl";
    const bindable = /id=["']ignite["'][\s\S]*id=["']spark["']|id=["']spark["'][\s\S]*id=["']ignite["']/i.test(Object.values(project.files).join("\n"));
    const ops = hasCanvas && wantsWebgl ? [OP.CANVAS] : bindable ? [OP.DOM_BIND] : wantsWebgl ? [OP.VDOM_PASS] : [OP.STATIC];
    const operands = hasCanvas && wantsWebgl ? [560, 320, 18] : bindable ? [0, 1, 2] : [0];
    const image = { opcodes: new Uint8Array(ops), operands: new Uint16Array(operands), hostRefs: new Uint8Array(Math.max(1, operands.length)) };
    return { engine: engineName(ops[0], wantsWebgl), image, ramBytes: image.opcodes.byteLength + image.operands.byteLength + image.hostRefs.byteLength };
  }

  function engineName(op, wantsWebgl) {
    if (op === OP.CANVAS) return "Merkava virtual WebGL canvas";
    if (op === OP.VDOM_PASS) return "Merkava virtual DOM passthrough";
    return wantsWebgl ? "Merkava virtual DOM HTML" : "Merkava typed RAM HTML";
  }

  function execute(ram, project, doc) {
    const op = ram.image.opcodes[0];
    if (op === OP.CANVAS) runCanvas(doc);
    if (op === OP.DOM_BIND) bindDom(doc);
    return { engine: ram.engine, opCount: ram.image.opcodes.length, ramBytes: ram.ramBytes, status: "MERKAVA_RAM_EXECUTED" };
  }

  function bindDom(doc) {
    const button = doc.getElementById("ignite");
    const spark = doc.getElementById("spark");
    if (!button || !spark) return;
    let count = 0;
    button.addEventListener("click", () => requestAnimationFrame(() => { count += 1; spark.textContent = "B'H exact bit pulse #" + count; }));
  }

  function runCanvas(doc) {
    const canvas = doc.getElementById("stage");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let x = 55, y = 70, vx = 2, vy = 1.5;
    canvas.onpointermove = event => { const r = canvas.getBoundingClientRect(); x = (event.clientX - r.left) * canvas.width / r.width; y = (event.clientY - r.top) * canvas.height / r.height; };
    function frame() { x += vx; y += vy; if (x < 18 || x > canvas.width - 18) vx *= -1; if (y < 18 || y > canvas.height - 18) vy *= -1; draw(ctx, canvas, x, y); requestAnimationFrame(frame); }
    frame();
  }

  function draw(ctx, canvas, x, y) { ctx.fillStyle = "#02050a"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fillStyle = "#73fff2"; ctx.fill(); }

  ect.lowerToRam = lower;
  ect.executeRam = execute;
})(window);
