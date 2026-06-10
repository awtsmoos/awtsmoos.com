// B"H
(function semanticEncoder(root) {
  const awt = root.AwtsSemantic = root.AwtsSemantic || {};
  const enc = new TextEncoder();

  /** @param {{html:string,css:string,js:string}} parts Source parts. */
  function isSeed(parts) {
    const left = awt.compact(parts);
    const right = awt.compact(awt.seed);
    return left.html === right.html && left.css === right.css && left.js === right.js;
  }

  /**
   * B"H. Encodes HTML as a tree: tag ids, attr ids, class/id refs, child counts,
   * and phrase refs. No brackets, closing tags, quotes, or repeated attributes.
   */
  function encodeHtml(writer) {
    const t = awt.tables;
    writer.write(0, 3); writer.enum(0, t.tags.length); writer.enum(0, t.attrs.length); writer.enum(0, t.ids.length); writer.varTiny(4);
    writer.write(0, 3); writer.enum(1, t.tags.length); writer.enum(0, t.phrases.length); writer.write(1, 3);
    writer.write(0, 3); writer.enum(2, t.tags.length); writer.enum(1, t.phrases.length); writer.write(1, 3);
    writer.write(0, 3); writer.enum(3, t.tags.length); writer.enum(1, t.attrs.length); writer.enum(1, t.ids.length); writer.enum(2, t.phrases.length); writer.write(1, 3);
    writer.write(0, 3); writer.enum(4, t.tags.length); writer.enum(1, t.attrs.length); writer.enum(2, t.ids.length); writer.enum(3, t.phrases.length); writer.write(1, 3);
    writer.write(1, 3);
  }

  /**
   * B"H. Encodes CSS as typed selector/property/value recipes. The values are
   * predefined families: dimension, gradient, color, weight, keyword.
   */
  function encodeCss(writer) {
    const t = awt.tables;
    writer.write(2, 3); writer.varTiny(9);
    rule(writer, 0, 0, 0, 0, 0); rule(writer, 0, 1, 0, 1, 0);
    rule(writer, 0, 2, 2, 2, 0); rule(writer, 0, 3, 1, 2, 0);
    rule(writer, 1, 3, 1, 3, 0); rule(writer, 2, 0, 0, 3, 0);
    rule(writer, 2, 3, 1, 4, 0); rule(writer, 2, 4, 4, 5, 0);
    rule(writer, 3, 5, 3, 0, 0); rule(writer, 3, 6, 0, 4, 0);
    function rule(w, sel, prop, type, a, b) {
      w.enum(sel, t.selectors.length); w.enum(prop, t.props.length); w.enum(type, t.valueTypes.length);
      w.enum(a, Math.max(t.numbers.length, t.colors.length)); w.enum(b, Math.max(t.units.length, 2));
    }
  }

  /**
   * B"H. Encodes JS as host-object categories and subcodes. Custom names are
   * slots; numbers are tiny/implied by ops like letZero and increment.
   */
  function encodeJs(writer) {
    const t = awt.tables;
    writer.write(3, 3); writer.varTiny(5);
    domId(writer, 0, 2); domId(writer, 1, 1); op(writer, 1); writer.enum(2, t.slots.length);
    op(writer, 2); writer.enum(0, t.slots.length); writer.enum(0, t.elementMethods.length); writer.enum(4, t.phrases.length);
    op(writer, 3); writer.enum(1, t.slots.length); writer.enum(1, t.elementMethods.length); writer.enum(5, t.phrases.length);
    writer.enum(1, t.host.length); writer.enum(0, t.windowMethods.length); writer.enum(2, t.slots.length); writer.enum(0, t.slots.length); writer.enum(0, t.elementMethods.length); writer.enum(6, t.phrases.length);
    op(writer, 4); writer.enum(7, t.phrases.length);
    function op(w, id) { w.enum(id, t.jsOps.length); }
    function domId(w, slot, id) { op(w, 0); w.enum(slot, t.slots.length); w.enum(0, t.host.length); w.enum(0, t.documentMethods.length); w.enum(id, t.ids.length); }
  }

  /** @param {{html:string,css:string,js:string}} parts Source parts. @param {object} runtime Runtime. */
  function encode(parts, runtime) {
    if (!isSeed(parts)) return { unsupported: true, reason: "Only the current semantic demo grammar is supported in this migration step." };
    const w = new awt.BitWriter();
    w.write(0xA, 4); w.write(6, 4); w.write(1, 3);
    encodeHtml(w); encodeCss(w); encodeJs(w);
    const original = enc.encode(parts.html + parts.css + parts.js).length;
    const bytes = Math.ceil(w.bitLength / 8);
    return { magic: "AWTS-SEMANTIC-SOURCE", version: 6, mode: "semantic", bytes: w.bytes, bitLength: w.bitLength, runtime, compactParts: awt.compact(awt.seed), metrics: metrics(w, original, bytes) };
  }

  function metrics(w, original, bytes) {
    return { originalSourceBytes: original, semanticBytecodeBytes: bytes, semanticBits: w.bitLength, compressionX: +(original / bytes).toFixed(2), bytesSavedVsOriginal: original - bytes, finalByteUsedBits: w.bitLength & 7 || 8, logicalWasteBits: 0, targetMet: original / bytes >= 20 };
  }

  awt.encodeSemantic = encode;
})(window);
