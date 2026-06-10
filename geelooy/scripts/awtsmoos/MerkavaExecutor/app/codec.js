// B"H
(function sourceCodec(root) {
  const forge = root.MerkavaForge = root.MerkavaForge || {};
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const OPS = { SECTION: 1, HTML_TAG: 2, HTML_TEXT: 3, CSS_RULE: 4, JS_HINT: 5 };

  /**
   * Chapter One: the Awtsmoos speaks; letters condense into opcodes, yet remain
   * reversible. These records are not RAM fire. They are packed source-scrolls.
   * @param {string} text Human source.
   * @returns {number[]} UTF-8 bytes.
   */
  function toBytes(text) {
    return Array.from(encoder.encode(String(text || "")));
  }

  /** @param {number[]} bytes UTF-8 bytes. @returns {string} Human source. */
  function fromBytes(bytes) {
    return decoder.decode(new Uint8Array(bytes || []));
  }

  /** @param {string} kind Section kind. @param {string} text Section body. */
  function sectionRecord(kind, text) {
    return { op: OPS.SECTION, name: kind, bytes: toBytes(text), text };
  }

  /** @param {string} html HTML source. @returns {object[]} Structural hints. */
  function htmlHints(html) {
    const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
    const records = [];
    function walk(node) {
      if (node.nodeType === 3 && node.textContent.trim()) {
        records.push({ op: OPS.HTML_TEXT, text: node.textContent });
      }
      if (node.nodeType === 1 && node.tagName !== "BODY") {
        records.push({ op: OPS.HTML_TAG, tag: node.tagName.toLowerCase(), attrs: Array.from(node.attributes).map(a => [a.name, a.value]) });
      }
      Array.from(node.childNodes).forEach(walk);
    }
    walk(doc.body);
    return records;
  }

  /** @param {string} css CSS source. @returns {object[]} Rule hints. */
  function cssHints(css) {
    return String(css || "").split("}").map(s => s.trim()).filter(Boolean).map(rule => {
      const parts = rule.split("{");
      return { op: OPS.CSS_RULE, selector: (parts[0] || "").trim(), body: (parts[1] || "").trim() };
    });
  }

  /** @param {string} js JS source. @returns {object[]} Semantic JS hints. */
  function jsHints(js) {
    const text = String(js || "");
    const names = Array.from(text.matchAll(/\b(class|function)\s+([A-Za-z_$][\w$]*)/g));
    return names.map(m => ({ op: OPS.JS_HINT, kind: m[1], name: m[2] }));
  }

  /** @param {{html:string,css:string,js:string}} parts Source sections. */
  function recordsFromParts(parts) {
    return [
      sectionRecord("html", parts.html), ...htmlHints(parts.html),
      sectionRecord("css", parts.css), ...cssHints(parts.css),
      sectionRecord("js", parts.js), ...jsHints(parts.js)
    ];
  }

  /** @param {{html:string,css:string,js:string}} parts Source sections. @param {object} runtime Runtime metadata. */
  function makeWebBytecode(parts, runtime) {
    const records = recordsFromParts(parts);
    const packed = toBytes(JSON.stringify({ magic: "AWTS-SOURCE-BYTECODE", version: 2, records }));
    return { magic: "AWTS-SOURCE-BYTECODE", version: 2, records, bytes: packed, runtime: runtime || {}, metrics: metrics(parts, packed, records) };
  }

  /** @param {object|number[]} bytecode Bytecode object or packed bytes. */
  function decodeWebBytecode(bytecode) {
    const bytes = Array.isArray(bytecode) ? bytecode : bytecode.bytes;
    return JSON.parse(fromBytes(bytes));
  }

  /** @param {object|number[]} bytecode Bytecode object or packed bytes. */
  function rebuildSources(bytecode) {
    const decoded = Array.isArray(bytecode) || bytecode.bytes ? decodeWebBytecode(bytecode) : bytecode;
    return decoded.records.filter(r => r.op === OPS.SECTION).reduce((out, r) => {
      out[r.name] = r.text || fromBytes(r.bytes);
      return out;
    }, { html: "", css: "", js: "" });
  }

  /** @param {{html:string,css:string,js:string}} parts Source sections. @param {number[]} packed Packed bytes. @param {object[]} records Records. */
  function metrics(parts, packed, records) {
    const sourceBytes = toBytes(parts.html).length + toBytes(parts.css).length + toBytes(parts.js).length;
    return { sourceBytes, packedBytes: packed.length, recordCount: records.length, ratio: sourceBytes ? +(packed.length / sourceBytes).toFixed(3) : 0 };
  }

  forge.SourceOps = OPS;
  forge.toBytes = toBytes;
  forge.fromBytes = fromBytes;
  forge.makeWebBytecode = makeWebBytecode;
  forge.decodeWebBytecode = decodeWebBytecode;
  forge.rebuildSources = rebuildSources;
  forge.printBytecode = value => JSON.stringify(value, null, 2);
})(window);
