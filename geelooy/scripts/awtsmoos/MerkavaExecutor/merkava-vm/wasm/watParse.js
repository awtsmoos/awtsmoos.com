// B"H — WAT text format: tokenizer + S-expression parser (from scratch).
export function tokenize(src) {
  const toks = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f' || c === '\v' || c === ',') { i++; continue; }
    if (c === ';' && src[i + 1] === ';') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '(' && src[i + 1] === ';') {
      i += 2;
      let depth = 1;
      while (i < n && depth > 0) {
        if (src[i] === '(' && src[i + 1] === ';') { depth++; i += 2; }
        else if (src[i] === ';' && src[i + 1] === ')') { depth--; i += 2; }
        else i++;
      }
      continue;
    }
    if (c === '(' || c === ')') { toks.push(c); i++; continue; }
    if (c === '"') {
      let s = '';
      i++;
      while (i < n && src[i] !== '"') {
        if (src[i] === '\\') {
          const e = src[++i];
          if (e === 'n') s += '\n';
          else if (e === 't') s += '\t';
          else if (e === 'r') s += '\r';
          else if (e === '"') s += '"';
          else if (e === '\\') s += '\\';
          else if (e === 'x' || e === 'X') { s += String.fromCharCode(parseInt(src.substr(i + 1, 2), 16)); i += 2; }
          // WAT spec: \XX is a hex byte escape (two hex digits, e is the first)
          else if (/[0-9a-fA-F]/.test(e) && /[0-9a-fA-F]/.test(src[i + 1])) { s += String.fromCharCode(parseInt(src.substr(i, 2), 16)); i += 1; }
          else s += e;
          i++;
        } else { s += src[i++]; }
      }
      i++; // closing quote
      toks.push({ str: s });
      continue;
    }
    let j = i;
    while (j < n && !' \t\n\r\f\v(),;"'.includes(src[j])) j++;
    toks.push(src.slice(i, j));
    i = j;
  }
  return toks;
}

export function parseSexpr(toks) {
  let pos = 0;
  function parse() {
    if (pos >= toks.length) throw new Error('[wat] unexpected EOF');
    const t = toks[pos++];
    if (t === '(') {
      const list = [];
      while (pos < toks.length && toks[pos] !== ')') list.push(parse());
      if (pos >= toks.length) throw new Error('[wat] missing )');
      pos++;
      return list;
    }
    if (t === ')') throw new Error('[wat] unexpected )');
    return t;
  }
  const forms = [];
  while (pos < toks.length) forms.push(parse());
  return forms;
}

export function parseWat(src) {
  return parseSexpr(tokenize(src));
}

// Number literal parsing: decimal, hex, float, inf, nan (with optional sign/payload)
export function parseNum(tok) {
  if (typeof tok !== 'string') throw new Error('[wat] expected number, got ' + JSON.stringify(tok));
  let s = tok;
  let neg = false;
  if (s[0] === '-') { neg = true; s = s.slice(1); }
  else if (s[0] === '+') s = s.slice(1);
  const sign = neg ? -1 : 1;
  if (/^inf$/i.test(s)) return sign * Infinity;
  const nanm = s.match(/^nan(?::0x([0-9a-fA-F]+))?$/i);
  if (nanm) {
    let v = NaN;
    if (nanm[1]) {
      const payload = parseInt(nanm[1], 16);
      const buf = new ArrayBuffer(8);
      const dv = new DataView(buf);
      dv.setBigUint64(0, (0x7FF8000000000000n | BigInt(payload)) * BigInt(sign === -1 ? 1 : 1), true);
      if (sign === -1) dv.setBigUint64(0, dv.getBigUint64(0, true) | 0x8000000000000000n, true);
      v = dv.getFloat64(0, true);
    }
    return v;
  }
  if (/^0x/i.test(s)) {
    const hexfloat = s.match(/^0x([0-9a-fA-F]*)\.?([0-9a-fA-F]*)(?:[pP]([+-]?\d+))?$/i);
    if (hexfloat && (hexfloat[2] || /[pP]/.test(s))) {
      const intPart = hexfloat[1] ? parseInt(hexfloat[1], 16) : 0;
      let frac = 0;
      const fs = hexfloat[2] || '';
      for (let k = 0; k < fs.length; k++) frac += parseInt(fs[k], 16) / Math.pow(16, k + 1);
      const exp = hexfloat[3] ? parseInt(hexfloat[3], 10) : 0;
      return sign * (intPart + frac) * Math.pow(2, exp);
    }
    const v = parseInt(s, 16);
    if (!Number.isNaN(v)) return sign * v;
  }
  if (/[.eE]/.test(s) || /nan/i.test(s)) {
    const v = parseFloat((neg ? '-' : '') + s);
    if (Number.isNaN(v) && !/nan/i.test(s)) throw new Error('[wat] bad number ' + tok);
    return v;
  }
  const v = parseInt(s, 10);
  if (Number.isNaN(v)) throw new Error('[wat] bad number ' + tok);
  return sign * v;
}

export function parseBig(tok) {
  if (typeof tok !== 'string') throw new Error('[wat] expected integer, got ' + JSON.stringify(tok));
  let s = tok;
  let neg = false;
  if (s[0] === '-') { neg = true; s = s.slice(1); }
  else if (s[0] === '+') s = s.slice(1);
  // parse the digits directly as BigInt — never through a double (precision loss)
  let v;
  if (/^0x[0-9a-fA-F]+$/i.test(s)) v = BigInt(s);
  else if (/^\d+$/.test(s)) v = BigInt(s);
  else {
    const n = parseNum(tok);
    if (!Number.isInteger(n)) throw new Error('[wat] expected integer, got ' + tok);
    v = BigInt(n);
  }
  return neg ? -v : v;
}
