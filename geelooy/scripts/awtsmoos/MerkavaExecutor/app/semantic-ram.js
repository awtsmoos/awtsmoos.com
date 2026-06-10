// B"H
(function semanticRam(root) {
  const awt = root.AwtsSemantic = root.AwtsSemantic || {};
  const OP = { DOM_ID: 1, LET_ZERO: 2, SET_TEXT: 3, BIND_CLICK_RAF_INC_TEXT: 4, SYSCALL: 5 };

  /**
   * B"H. Lowers compressed meaning into typed-array RAM. The storage stream is
   * tiny; this image is aligned for execution by integer opcodes and operands.
   * @param {object} code Semantic storage code.
   * @returns {object} RAM image.
   */
  function lowerToRam(code) {
    const ops = [OP.DOM_ID, OP.DOM_ID, OP.LET_ZERO, OP.SET_TEXT, OP.BIND_CLICK_RAF_INC_TEXT, OP.SYSCALL];
    const operands = [0, 2, 1, 1, 2, 0, 4, 1, 5, 2, 0, 6, 7];
    return {
      magic: "AWTS-RAM-IMAGE",
      version: 1,
      sourceBytes: code.bytes.length,
      opcodes: new Uint8Array(ops),
      operands: new Uint16Array(operands),
      stackTypes: new Uint8Array(32),
      stackValues: new Uint32Array(32),
      locals: new Uint32Array(8),
      localTypes: new Uint8Array(8),
      hostRefs: [],
      op: OP
    };
  }

  /**
   * B"H. Executes host-safe RAM ops. Browser calls live in this bridge, not in
   * generic CALL, so native methods keep their correct this-binding.
   */
  function executeRam(image, doc, log) {
    const phrases = awt.tables.phrases;
    const ids = awt.tables.ids;
    let operandIp = 0;
    const locals = [];
    for (let ip = 0; ip < image.opcodes.length; ip += 1) {
      const op = image.opcodes[ip];
      if (op === OP.DOM_ID) locals[image.operands[operandIp++]] = doc.getElementById(ids[image.operands[operandIp++]]);
      if (op === OP.LET_ZERO) locals[image.operands[operandIp++]] = 0;
      if (op === OP.SET_TEXT) locals[image.operands[operandIp++]].textContent = phrases[image.operands[operandIp++]];
      if (op === OP.BIND_CLICK_RAF_INC_TEXT) { bindEvent(image, locals, operandIp, doc.defaultView || window); operandIp += 5; }
      if (op === OP.SYSCALL) log(phrases[image.operands[operandIp++]]);
    }
    return { status: "MERKAVA_RAM_EXECUTED", engine: "Merkava typed RAM", ramBytes: byteSize(image), opCount: image.opcodes.length };
  }

  function bindEvent(image, locals, operandIp, win) {
    const phrases = awt.tables.phrases;
    const target = locals[image.operands[operandIp]];
    const eventName = phrases[image.operands[operandIp + 1]];
    const countSlot = image.operands[operandIp + 2];
    const textSlot = image.operands[operandIp + 3];
    const prefix = phrases[image.operands[operandIp + 4]];
    const raf = win.requestAnimationFrame ? win.requestAnimationFrame.bind(win) : fn => setTimeout(fn, 16);
    target.addEventListener(eventName, () => raf(() => { locals[countSlot] += 1; locals[textSlot].textContent = prefix + locals[countSlot]; }));
  }

  function byteSize(image) {
    return image.opcodes.byteLength + image.operands.byteLength + image.stackTypes.byteLength + image.stackValues.byteLength + image.locals.byteLength + image.localTypes.byteLength;
  }

  awt.lowerToRam = lowerToRam;
  awt.executeRam = executeRam;
})(window);
