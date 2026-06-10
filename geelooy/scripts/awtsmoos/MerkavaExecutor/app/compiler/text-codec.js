// B"H
(function compilerTextCodec(root) {
  const ns = root.AwtsEctCompilerParts = root.AwtsEctCompilerParts || {};
  const WORDS = "Awtsmoos Bit Garden Every logical bit is counted Fields share bytes Ignite waiting dashboard ready vessel sparks repeated tile shell rendered touch canvas Pointer controlled RAM source semantic bytecode exact pulse ball particles canvas stage pointer update draw frame ready hello world app engine compiler demo".split(" ");
  const SEGS = ["th", "he", "in", "er", "an", "re", "on", "at", "en", "ed", "it", "ou", "ea", "is", "or", "ar", "px", "em", "ng", "st", "sh", "Awts", "moos", "tion", "ing", "ent", "ion", "card", "spark", "ignite", "canvas", "pointer", "stage"];
  const PUNCT = [".", ",", ":", ";", "#", "-", "_", "'", "\"", " ", "(", ")", "{", "}", "[", "]", "=", "+", "=>", "++", "/"];

  /** B"H. Text clusters: not final entropy, just stable semantic text sparks. */
  function writeClusterText(writer, value) {
    const pieces = segment(value);
    writer.tiny(pieces.length);
    pieces.forEach(piece => {
      writer.enum(piece.kind, 4);
      if (piece.kind === 0) writer.enum(piece.id, WORDS.length);
      else if (piece.kind === 1) writer.enum(piece.id, SEGS.length);
      else if (piece.kind === 2) writer.enum(piece.id, PUNCT.length);
      else writer.write(piece.id & 255, 8);
    });
  }

  function segment(value) {
    const out = [];
    let index = 0;
    while (index < value.length) {
      const word = starting(WORDS, value, index);
      if (word) { out.push({ kind: 0, id: word.id }); index += word.value.length; continue; }
      const seg = starting(SEGS, value, index);
      if (seg) { out.push({ kind: 1, id: seg.id }); index += seg.value.length; continue; }
      const punct = PUNCT.indexOf(value[index]);
      if (punct >= 0) { out.push({ kind: 2, id: punct }); index += 1; continue; }
      out.push({ kind: 3, id: value.charCodeAt(index) });
      index += 1;
    }
    return out;
  }

  function starting(list, text, at) {
    for (let index = 0; index < list.length; index += 1) {
      const item = list[index];
      if (String(text).slice(at, at + item.length) === item) return { id: index, value: item };
    }
    return null;
  }

  ns.writeClusterText = writeClusterText;
})(typeof self !== "undefined" ? self : globalThis);
