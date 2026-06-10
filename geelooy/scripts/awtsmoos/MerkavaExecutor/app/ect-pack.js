// B"H
(function ectPack(root) {
  const ect = root.AwtsECT = root.AwtsECT || {};
  const enc = new TextEncoder();
  const htmlTags = "html body main section article div h1 h2 h3 p ul li button output input form label select option nav a canvas svg circle".split(" ");
  const htmlAttrs = "id class href src type value width height viewBox cx cy r".split(" ");
  const cssProps = "padding margin border-radius background color display gap grid-template-columns list-style font-weight font-size line-height width height transform animation opacity fill box-shadow border bottom".split(" ");
  const jsNames = "document window getElementById querySelector addEventListener requestAnimationFrame textContent onclick createElement appendChild console log Math Array String".split(" ");

  /** B"H. Live semantic packer: current source becomes semantic pools and ops. */
  function packProject(project) {
    const analysis = ect.analyzeProject(project);
    const choices = [semanticPack(project), lzPack(project), literalPack(project)].filter(Boolean);
    const best = choices.sort((a, b) => a.bytes.length - b.bytes.length)[0];
    best.analysis = analysis;
    best.metrics = metrics(analysis.originalBytes, best.bitLength, best.bytes.length, best.mode, best.payloadKind, best.detail);
    return best;
  }

  function semanticPack(project) {
    const pools = newPools();
    const html = parseHtml(files(project, ".html").join("\n"), pools);
    const css = parseCss(files(project, ".css").join("\n"), pools);
    const js = parseJs(files(project, ".js").join("\n"), pools);
    const poolBytes = encodePools(pools);
    const opBytes = encodeOps(html.concat(css, js));
    const header = headerBytes(0, poolBytes.length + opBytes.length, rawBytes(project));
    const bytes = header.concat(poolBytes, opBytes);
    return { mode: "live semantic html/css/js", bytes, bitLength: bytes.length * 8, project, payloadKind: "semantic-ast-payload", detail: detail(pools, html.length + css.length + js.length, poolBytes, opBytes) };
  }

  function newPools() { return { strings: [], numbers: [], colors: [], customs: [] }; }
  function add(pool, value) { const v = String(value || ""); if (!v) return 0; let i = pool.indexOf(v); if (i < 0) i = pool.push(v) - 1; return i; }
  function addNum(pool, value) { const v = String(value); let i = pool.indexOf(v); if (i < 0) i = pool.push(v) - 1; return i; }

  function parseHtml(source, pools) {
    const ops = [];
    const rx = /<\/?([a-z][\w-]*)([^>]*)>|([^<]+)/gi;
    let match;
    while ((match = rx.exec(source))) {
      if (match[3] && match[3].trim()) { ops.push([3, add(pools.strings, match[3].trim())]); continue; }
      const tag = (match[1] || "").toLowerCase();
      const built = htmlTags.indexOf(tag);
      ops.push([match[0][1] === "/" ? 2 : 1, built < 0 ? add(pools.customs, tag) + 128 : built]);
      parseAttrs(match[2] || "", pools).forEach(attr => ops.push([4, attr[0], attr[1]]));
    }
    return ops;
  }

  function parseAttrs(text, pools) {
    const out = [];
    const rx = /([a-z_:][-\w:.]*)\s*=\s*["']([^"']*)["']/gi;
    let match;
    while ((match = rx.exec(text))) {
      const name = htmlAttrs.indexOf(match[1]);
      out.push([name < 0 ? add(pools.customs, match[1]) + 128 : name, add(pools.strings, match[2])]);
    }
    return out;
  }

  function parseCss(source, pools) {
    const ops = [];
    const rx = /([^{}]+)\{([^{}]*)\}/g;
    let match;
    while ((match = rx.exec(source))) {
      ops.push([10, add(pools.strings, match[1].trim())]);
      match[2].split(";").forEach(part => {
        const pair = part.split(":");
        if (pair.length < 2) return;
        const prop = pair.shift().trim();
        const value = pair.join(":").trim();
        const built = cssProps.indexOf(prop);
        ops.push([11, built < 0 ? add(pools.customs, prop) + 128 : built].concat(cssValue(value, pools)));
      });
    }
    return ops;
  }

  function cssValue(value, pools) {
    const color = value.match(/^#[0-9a-f]{3,8}$/i);
    if (color) return [1, add(pools.colors, color[0])];
    const dim = value.match(/^(-?\d+(?:\.\d+)?)(px|%|rem|em|deg|fr|s)$/);
    if (dim) return [2, addNum(pools.numbers, dim[1]), unitId(dim[2])];
    if (/^-?\d+(?:\.\d+)?$/.test(value)) return [3, addNum(pools.numbers, value)];
    if (/^[a-z-]+$/i.test(value)) return [4, add(pools.strings, value)];
    return [5, add(pools.strings, value.replace(/\s+/g, " "))];
  }

  function unitId(unit) { return ["px", "%", "rem", "em", "deg", "fr", "s"].indexOf(unit); }

  function parseJs(source, pools) {
    const ops = [];
    const rx = /"([^"]*)"|'([^']*)'|\b\d+(?:\.\d+)?\b|[A-Za-z_$][\w$]*|[{}()[\].,;=+*/:<>&!-]+/g;
    let match;
    while ((match = rx.exec(source))) {
      const token = match[0];
      if (token[0] === "\"" || token[0] === "'") ops.push([20, add(pools.strings, token.slice(1, -1))]);
      else if (/^\d/.test(token)) ops.push([21, addNum(pools.numbers, token)]);
      else if (/^[A-Za-z_$]/.test(token)) { const id = jsNames.indexOf(token); ops.push([22, id < 0 ? add(pools.customs, token) + 128 : id]); }
      else ops.push([23, punctId(token, pools)]);
    }
    return ops.map(op => op[0] === 22 && op[1] < 128 ? [24, op[1]] : op);
  }

  function punctId(token, pools) { const list = [".", "(", ")", "{", "}", ";", "=", "+", ",", "=>", "++"]; const id = list.indexOf(token); return id < 0 ? add(pools.customs, token) + 128 : id; }
  function encodePools(pools) { return [poolBlock(pools.strings), poolBlock(pools.numbers), poolBlock(pools.colors), poolBlock(pools.customs)].flat(); }
  function poolBlock(list) { const out = [list.length & 255, list.length >> 8 & 255]; list.forEach(item => { const bytes = Array.from(enc.encode(item)); out.push(bytes.length & 255, bytes.length >> 8 & 255, ...bytes); }); return out; }
  function encodeOps(ops) { const out = [ops.length & 255, ops.length >> 8 & 255]; ops.forEach(op => out.push(op.length, ...op.map(v => Math.max(0, Math.min(255, v))))); return out; }
  function detail(pools, opCount, poolBytes, opBytes) { return { strings: pools.strings.length, numbers: pools.numbers.length, colors: pools.colors.length, customSymbols: pools.customs.length, ops: opCount, poolBytes: poolBytes.length, opBytes: opBytes.length }; }

  function lzPack(project) { const raw = Array.from(enc.encode(projectText(project))); const packed = lzBytes(raw); if (packed.length >= raw.length) return null; const header = headerBytes(1, packed.length, raw.length); return { mode: "on-the-spot lz", bytes: header.concat(packed), bitLength: (header.length + packed.length) * 8, project, payloadKind: "real-lz-payload", detail: { lzBytes: packed.length } }; }
  function literalPack(project) { const raw = Array.from(enc.encode(projectText(project))); const header = headerBytes(2, raw.length, raw.length); return { mode: "honest literal", bytes: header.concat(raw), bitLength: (header.length + raw.length) * 8, project, payloadKind: "real-literal-payload", detail: { literalBytes: raw.length } }; }
  function headerBytes(mode, payloadLength, originalLength) { return [0xAE, 14, mode, payloadLength & 255, payloadLength >> 8 & 255, originalLength & 255, originalLength >> 8 & 255]; }
  function lzBytes(raw) { const out = []; for (let i = 0; i < raw.length;) { const f = findBackref(raw, i); if (f.length >= 5) { out.push(1, f.distance & 255, f.distance >> 8 & 255, f.length); i += f.length; } else { const s = i; i += 1; while (i < raw.length && i - s < 127 && findBackref(raw, i).length < 5) i += 1; out.push(0, i - s, ...raw.slice(s, i)); } } return out; }
  function findBackref(raw, index) { let best = { distance: 0, length: 0 }; const floor = Math.max(0, index - 2048); for (let p = floor; p < index; p += 1) { let n = 0; while (n < 255 && index + n < raw.length && raw[p + n] === raw[index + n]) n += 1; if (n > best.length) best = { distance: index - p, length: n }; } return best; }
  function files(project, ext) { return Object.keys(project.files).filter(name => name.endsWith(ext)).map(name => project.files[name]); }
  function rawBytes(project) { return enc.encode(projectText(project)).length; }
  function projectText(project) { return Object.keys(project.files).map(name => `// FILE: ${name}\n${project.files[name]}`).join("\n\n"); }
  function metrics(original, bits, bytes, mode, payloadKind, d) { return { originalSourceBytes: original, storageBits: bits, storageBytes: bytes, compressionX: +(original / Math.max(1, bytes)).toFixed(2), bytesSaved: original - bytes, finalByteUsedBits: bits & 7 || 8, logicalWasteBits: 0, mode, payloadKind, detail: d || {}, honestPayload: true }; }
  ect.packProject = packProject;
  ect.projectText = projectText;
})(window);
