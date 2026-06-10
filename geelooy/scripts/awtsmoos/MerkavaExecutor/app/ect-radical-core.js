// B"H
(function radicalCore(root) {
  const ect = root.AwtsECT = root.AwtsECT || {};
  const alpha = " etaoinshrdlucmfwypvbgkqjxzETAOINSHRDLUCMFWYPVBGKQJXZ0123456789.,:#-'\"/()";

  /** B"H. A sub-byte quill: the Awtsmoos lets no field own a whole byte unless it must. */
  class Writer {
    constructor() { this.bytes = []; this.bitLength = 0; }
    bit(v) { const p = this.bitLength >> 3, s = 7 - (this.bitLength & 7); this.bytes[p] = this.bytes[p] || 0; this.bytes[p] |= (v & 1) << s; this.bitLength += 1; }
    write(v, n) { for (let i = n - 1; i >= 0; i -= 1) this.bit((v >> i) & 1); }
    width(n) { return Math.max(1, Math.ceil(Math.log2(Math.max(2, n)))); }
    enum(v, n) { this.write(v, this.width(n)); }
    tiny(v) { if (v < 8) { this.write(0, 1); this.write(v, 3); } else if (v < 64) { this.write(2, 2); this.write(v, 6); } else { this.write(3, 2); this.write(v, 14); } }
    text(s) { const text = String(s || ""); this.tiny(text.length); for (const ch of text) writeChar(this, ch); }
  }

  function writeChar(w, ch) {
    const id = alpha.indexOf(ch);
    if (id >= 0) { w.write(0, 1); w.enum(id, alpha.length); return; }
    w.write(1, 1); w.write(ch.charCodeAt(0) & 255, 8);
  }

  function pool() { return { strings: [], symbols: [], nums: [], colors: [], custom: [] }; }
  function ref(list, value) { const v = String(value || ""); let i = list.indexOf(v); if (i < 0) i = list.push(v) - 1; return i; }
  function files(project, ext) { return Object.keys(project.files).filter(k => k.endsWith(ext)).map(k => project.files[k]).join("\n"); }
  function originalText(project) { return Object.keys(project.files).map(k => `// FILE: ${k}\n${project.files[k]}`).join("\n\n"); }
  function bytesOf(text) { return new TextEncoder().encode(String(text || "")).length; }

  ect.rad = { Writer, pool, ref, files, originalText, bytesOf, alpha };
})(window);
