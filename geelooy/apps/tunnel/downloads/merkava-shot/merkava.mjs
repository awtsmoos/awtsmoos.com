import{createRequire}from'module';const require=createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/pngTools.js
var pngTools_exports = {};
__export(pngTools_exports, {
  CRC32_TABLE: () => CRC32_TABLE,
  crc32: () => crc32,
  crc32Finish: () => crc32Finish,
  crc32Init: () => crc32Init,
  crc32Update: () => crc32Update,
  dataUrlFromPng: () => dataUrlFromPng,
  pngChunk: () => pngChunk,
  rgbPng: () => rgbPng,
  rgbPngDownsampled: () => rgbPngDownsampled,
  rgbPngFromRgba: () => rgbPngFromRgba
});
import zlib from "zlib";
function crc32Init() {
  return 4294967295;
}
function crc32Update(crc, bytes, start, end) {
  const T = CRC32_TABLE;
  let c = crc;
  for (let i = start; i < end; i++) c = T[(c ^ bytes[i]) & 255] ^ c >>> 8;
  return c >>> 0;
}
function crc32Finish(crc) {
  return (crc ^ 4294967295) >>> 0;
}
function crc32(buffer) {
  return crc32Finish(crc32Update(crc32Init(), buffer, 0, buffer.length));
}
function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}
function rgbPng(width, height, painter) {
  const rowSize = width * 3 + 1;
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const row = y * rowSize;
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      const color = painter(x, y);
      const i = row + 1 + x * 3;
      raw[i] = color[0];
      raw[i + 1] = color[1];
      raw[i + 2] = color[2];
    }
  }
  return pngFromRaw(raw, width, height);
}
function rgbPngFromRgba(rgba, width, height, opts = {}) {
  const rowSize = width * 3 + 1;
  const raw = Buffer.allocUnsafe(rowSize * height);
  for (let y = 0; y < height; y++) {
    const row = y * rowSize;
    raw[row] = 0;
    let o = row + 1;
    const base = y * width * 4;
    for (let x = 0; x < width; x++) {
      const i = base + x * 4;
      raw[o++] = rgba[i];
      raw[o++] = rgba[i + 1];
      raw[o++] = rgba[i + 2];
    }
  }
  return pngFromRaw(raw, width, height, opts.level);
}
function rgbPngDownsampled(rgba, srcWidth, scale, width, height, level) {
  const rowSize = width * 3 + 1;
  const raw = Buffer.allocUnsafe(rowSize * height);
  const total = scale * scale;
  for (let y = 0; y < height; y++) {
    const row = y * rowSize;
    raw[row] = 0;
    let o = row + 1;
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      for (let yy = 0; yy < scale; yy++) {
        const brow = (y * scale + yy) * srcWidth * 4;
        for (let xx = 0; xx < scale; xx++) {
          const i = brow + (x * scale + xx) * 4;
          r += rgba[i];
          g += rgba[i + 1];
          b += rgba[i + 2];
        }
      }
      raw[o++] = Math.round(r / total);
      raw[o++] = Math.round(g / total);
      raw[o++] = Math.round(b / total);
    }
  }
  return pngFromRaw(raw, width, height, level);
}
function pngFromRaw(raw, width, height, level) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const idat = level === void 0 || level === null ? zlib.deflateSync(raw) : zlib.deflateSync(raw, { level });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}
function dataUrlFromPng(buffer) {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}
var CRC32_TABLE;
var init_pngTools = __esm({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/pngTools.js"() {
    CRC32_TABLE = (() => {
      const t = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
        t[i] = c >>> 0;
      }
      return t;
    })();
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSyntaxCharacters.js
var require_CssSyntaxCharacters = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSyntaxCharacters.js"(exports, module) {
    {
      let isCssWhitespace2 = function(character) {
        return character === " " || character === "\n" || character === "\r" || character === "	" || character === "\f";
      }, isCssNameCharacter2 = function(character) {
        if (!character) return false;
        const code = character.codePointAt(0);
        return character === "-" || character === "_" || code >= 128 || isAsciiLetter2(code) || isDigit2(code);
      }, startsCssName2 = function(text, at) {
        const character = text[at] || "";
        if (character === "\\") return Boolean(text[at + 1]);
        if (character === "-" || character === "_") return true;
        return isCssNameCharacter2(character) && !isDigit2(character.codePointAt(0));
      }, startsCssNumber2 = function(text, at) {
        const first = text[at] || "";
        const second = text[at + 1] || "";
        const third = text[at + 2] || "";
        if (first === "+" || first === "-") {
          return isDigitCharacter2(second) || second === "." && isDigitCharacter2(third);
        }
        return isDigitCharacter2(first) || first === "." && isDigitCharacter2(second);
      }, consumeCssNumber2 = function(text, at) {
        let index = at;
        if (text[index] === "+" || text[index] === "-") index += 1;
        while (isDigitCharacter2(text[index])) index += 1;
        if (text[index] === "." && isDigitCharacter2(text[index + 1])) {
          index += 1;
          while (isDigitCharacter2(text[index])) index += 1;
        }
        const marker = text[index];
        const sign = text[index + 1];
        const digitAt = sign === "+" || sign === "-" ? index + 2 : index + 1;
        if ((marker === "e" || marker === "E") && isDigitCharacter2(text[digitAt])) {
          index = digitAt;
          while (isDigitCharacter2(text[index])) index += 1;
        }
        return { end: index, value: Number(text.slice(at, index)) };
      }, isDigitCharacter2 = function(character) {
        return Boolean(character) && isDigit2(character.codePointAt(0));
      }, isDigit2 = function(code) {
        return code >= 48 && code <= 57;
      }, isAsciiLetter2 = function(code) {
        return code >= 65 && code <= 90 || code >= 97 && code <= 122;
      };
      isCssWhitespace = isCssWhitespace2, isCssNameCharacter = isCssNameCharacter2, startsCssName = startsCssName2, startsCssNumber = startsCssNumber2, consumeCssNumber = consumeCssNumber2, isDigitCharacter = isDigitCharacter2, isDigit = isDigit2, isAsciiLetter = isAsciiLetter2;
      const AwtsExports = {
        consumeCssNumber: consumeCssNumber2,
        isCssNameCharacter: isCssNameCharacter2,
        isCssWhitespace: isCssWhitespace2,
        startsCssName: startsCssName2,
        startsCssNumber: startsCssNumber2
      };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var isCssWhitespace;
    var isCssNameCharacter;
    var startsCssName;
    var startsCssNumber;
    var consumeCssNumber;
    var isDigitCharacter;
    var isDigit;
    var isAsciiLetter;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSyntaxTokenizer.js
var require_CssSyntaxTokenizer = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSyntaxTokenizer.js"(exports, module) {
    {
      let tokenizeCss2 = function(source) {
        const text = String(source || "");
        const tokens = [];
        let at = 0;
        while (at < text.length) {
          const start = at;
          const character = text[at];
          if (characters.isCssWhitespace(character)) {
            while (characters.isCssWhitespace(text[at])) at += 1;
            tokens.push(makeToken2("whitespace", text.slice(start, at), start, at));
            continue;
          }
          if (character === "/" && text[at + 1] === "*") {
            at = consumeComment2(text, at + 2);
            continue;
          }
          if (character === '"' || character === "'") {
            const result = consumeString2(text, at, character);
            at = result.end;
            tokens.push(makeToken2("string", result.value, start, at));
            continue;
          }
          if (character === "#" && characters.startsCssName(text, at + 1)) {
            const result = consumeName2(text, at + 1);
            at = result.end;
            tokens.push(makeToken2("hash", result.value, start, at));
            continue;
          }
          if (character === "@" && characters.startsCssName(text, at + 1)) {
            const result = consumeName2(text, at + 1);
            at = result.end;
            tokens.push(makeToken2("at-keyword", result.value, start, at));
            continue;
          }
          if (characters.startsCssNumber(text, at)) {
            const result = characters.consumeCssNumber(text, at);
            at = result.end;
            if (text[at] === "%") {
              at += 1;
              tokens.push(makeToken2("percentage", result.value, start, at));
              continue;
            }
            if (characters.startsCssName(text, at)) {
              const unit = consumeName2(text, at);
              at = unit.end;
              tokens.push(makeToken2("dimension", result.value, start, at, unit.value));
              continue;
            }
            tokens.push(makeToken2("number", result.value, start, at));
            continue;
          }
          if (characters.startsCssName(text, at)) {
            const result = consumeName2(text, at);
            at = result.end;
            const type = text[at] === "(" ? "function" : "ident";
            if (type === "function") at += 1;
            tokens.push(makeToken2(type, result.value, start, at));
            continue;
          }
          at += 1;
          tokens.push(makeToken2("delim", character, start, at));
        }
        return tokens;
      }, makeToken2 = function(type, value, start, end, unit = "") {
        return Object.freeze({ end, start, type, unit, value });
      }, consumeComment2 = function(text, at) {
        const end = text.indexOf("*/", at);
        return end < 0 ? text.length : end + 2;
      }, consumeString2 = function(text, at, quote) {
        let value = "";
        for (let index = at + 1; index < text.length; index += 1) {
          if (text[index] === quote) return { end: index + 1, value };
          if (text[index] === "\\" && index + 1 < text.length) index += 1;
          value += text[index];
        }
        return { end: text.length, value };
      }, consumeName2 = function(text, at) {
        let value = "";
        let index = at;
        while (characters.isCssNameCharacter(text[index])) {
          value += text[index];
          index += 1;
        }
        return { end: index, value };
      };
      tokenizeCss = tokenizeCss2, makeToken = makeToken2, consumeComment = consumeComment2, consumeString = consumeString2, consumeName = consumeName2;
      const characters = typeof module === "object" && module.exports ? require_CssSyntaxCharacters() : globalThis.Merkava;
      const AwtsExports = { tokenizeCss: tokenizeCss2 };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var tokenizeCss;
    var makeToken;
    var consumeComment;
    var consumeString;
    var consumeName;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssDeclarationParser.js
var require_CssDeclarationParser = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssDeclarationParser.js"(exports, module) {
    {
      let parseCssDeclarations2 = function(source) {
        const text = String(source || "");
        const tokens = tokenizeCss(text);
        const declarations = [];
        let start = 0;
        for (let index = 0, depth = 0; index <= tokens.length; index += 1) {
          const value = tokens[index]?.value;
          if (value === "(" || value === "[" || value === "{") depth += 1;
          if (value === ")" || value === "]" || value === "}") depth = Math.max(0, depth - 1);
          if (index === tokens.length || value === ";" && depth === 0) {
            const declaration = parseDeclaration2(text, tokens, start, index);
            if (declaration) declarations.push(declaration);
            start = index + 1;
          }
        }
        return declarations;
      }, parseDeclaration2 = function(text, tokens, start, end) {
        start = trimStart2(tokens, start, end);
        end = trimEnd2(tokens, start, end);
        if (start >= end || tokens[start]?.type === "at-keyword") return null;
        const colon = findColon2(tokens, start, end);
        if (colon < 0) return null;
        const rawName = tokenSlice2(text, tokens, start, colon).trim();
        if (!rawName) return null;
        const name = rawName.startsWith("--") ? rawName : rawName.toLowerCase();
        let valueEnd = trimEnd2(tokens, colon + 1, end);
        const important = findImportant2(tokens, colon + 1, valueEnd);
        if (important >= 0) valueEnd = trimEnd2(tokens, colon + 1, important);
        const value = tokenSlice2(text, tokens, colon + 1, valueEnd).trim();
        return Object.freeze({ important: important >= 0, name, value });
      }, findColon2 = function(tokens, start, end) {
        let depth = 0;
        for (let index = start; index < end; index += 1) {
          const value = tokens[index].value;
          if (value === "(" || value === "[") depth += 1;
          if (value === ")" || value === "]") depth = Math.max(0, depth - 1);
          if (depth === 0 && value === ":") return index;
        }
        return -1;
      }, findImportant2 = function(tokens, start, end) {
        let last = trimEnd2(tokens, start, end) - 1;
        if (String(tokens[last]?.value || "").toLowerCase() !== "important") return -1;
        last = trimEnd2(tokens, start, last) - 1;
        return tokens[last]?.value === "!" ? last : -1;
      }, tokenSlice2 = function(text, tokens, start, end) {
        if (start >= end || !tokens[start]) return "";
        return text.slice(tokens[start].start, tokens[end - 1].end);
      }, trimStart2 = function(tokens, start, end) {
        let index = start;
        while (index < end && tokens[index]?.type === "whitespace") index += 1;
        return index;
      }, trimEnd2 = function(tokens, start, end) {
        let index = end;
        while (index > start && tokens[index - 1]?.type === "whitespace") index -= 1;
        return index;
      };
      parseCssDeclarations = parseCssDeclarations2, parseDeclaration = parseDeclaration2, findColon = findColon2, findImportant = findImportant2, tokenSlice = tokenSlice2, trimStart = trimStart2, trimEnd = trimEnd2;
      const { tokenizeCss } = typeof module === "object" && module.exports ? require_CssSyntaxTokenizer() : globalThis.Merkava;
      const AwtsExports = { parseCssDeclarations: parseCssDeclarations2 };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var parseCssDeclarations;
    var parseDeclaration;
    var findColon;
    var findImportant;
    var tokenSlice;
    var trimStart;
    var trimEnd;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssRuleParser.js
var require_CssRuleParser = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssRuleParser.js"(exports, module) {
    {
      let parseCssRules3 = function(source) {
        const text = String(source || "");
        const tokens = tokenizeCss(text);
        const rules = [];
        let at = skipWhitespace2(tokens, 0);
        while (at < tokens.length) {
          const parsed = tokens[at].type === "at-keyword" ? consumeAtRule2(text, tokens, at) : consumeQualifiedRule2(text, tokens, at);
          if (!parsed) break;
          if (parsed.rule) rules.push(parsed.rule);
          at = skipWhitespace2(tokens, parsed.next);
        }
        return rules;
      }, consumeQualifiedRule2 = function(text, tokens, start) {
        const open = findTopLevelDelimiter2(tokens, start, "{");
        if (open < 0) return { next: tokens.length, rule: null };
        const close = findMatchingBrace2(tokens, open);
        const prelude = sliceTokens2(text, tokens, start, open).trim();
        const block = sliceTokens2(text, tokens, open + 1, close).trim();
        return {
          next: close < tokens.length ? close + 1 : tokens.length,
          rule: prelude ? Object.freeze({ block, kind: "qualified", prelude }) : null
        };
      }, consumeAtRule2 = function(text, tokens, start) {
        const name = String(tokens[start].value || "").toLowerCase();
        const boundary = findAtRuleBoundary2(tokens, start + 1);
        if (boundary < 0) return { next: tokens.length, rule: null };
        const marker = tokens[boundary];
        const prelude = sliceTokens2(text, tokens, start + 1, boundary).trim();
        if (marker.value === ";") {
          return {
            next: boundary + 1,
            rule: Object.freeze({ block: "", kind: "at", name, prelude })
          };
        }
        const close = findMatchingBrace2(tokens, boundary);
        const block = sliceTokens2(text, tokens, boundary + 1, close).trim();
        return {
          next: close < tokens.length ? close + 1 : tokens.length,
          rule: Object.freeze({ block, kind: "at", name, prelude })
        };
      }, findAtRuleBoundary2 = function(tokens, start) {
        let depth = 0;
        for (let index = start; index < tokens.length; index += 1) {
          const value = tokens[index].value;
          if (value === "(" || value === "[") depth += 1;
          if (value === ")" || value === "]") depth = Math.max(0, depth - 1);
          if (depth === 0 && (value === ";" || value === "{")) return index;
        }
        return -1;
      }, findTopLevelDelimiter2 = function(tokens, start, wanted) {
        let depth = 0;
        for (let index = start; index < tokens.length; index += 1) {
          const value = tokens[index].value;
          if (value === "(" || value === "[") depth += 1;
          if (value === ")" || value === "]") depth = Math.max(0, depth - 1);
          if (depth === 0 && value === wanted) return index;
        }
        return -1;
      }, findMatchingBrace2 = function(tokens, open) {
        let depth = 0;
        for (let index = open; index < tokens.length; index += 1) {
          if (tokens[index].value === "{") depth += 1;
          if (tokens[index].value === "}") depth -= 1;
          if (depth === 0) return index;
        }
        return tokens.length;
      }, sliceTokens2 = function(text, tokens, start, end) {
        if (start >= end || start >= tokens.length) return "";
        const first = tokens[start].start;
        const last = tokens[Math.min(end, tokens.length) - 1].end;
        return text.slice(first, last);
      }, skipWhitespace2 = function(tokens, at) {
        let index = at;
        while (tokens[index]?.type === "whitespace") index += 1;
        return index;
      };
      parseCssRules2 = parseCssRules3, consumeQualifiedRule = consumeQualifiedRule2, consumeAtRule = consumeAtRule2, findAtRuleBoundary = findAtRuleBoundary2, findTopLevelDelimiter = findTopLevelDelimiter2, findMatchingBrace = findMatchingBrace2, sliceTokens = sliceTokens2, skipWhitespace = skipWhitespace2;
      const { tokenizeCss } = typeof module === "object" && module.exports ? require_CssSyntaxTokenizer() : globalThis.Merkava;
      const AwtsExports = { parseCssRules: parseCssRules3 };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var parseCssRules2;
    var consumeQualifiedRule;
    var consumeAtRule;
    var findAtRuleBoundary;
    var findTopLevelDelimiter;
    var findMatchingBrace;
    var sliceTokens;
    var skipWhitespace;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSelectorList.js
var require_CssSelectorList = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSelectorList.js"(exports, module) {
    {
      let splitSelectorList3 = function(source) {
        return splitTopLevel5(String(source || ""), ",").map((value) => value.trim()).filter(Boolean);
      }, splitTopLevel5 = function(source, delimiter) {
        const parts = [];
        let start = 0;
        let depth = 0;
        let quote = "";
        for (let at = 0; at < source.length; at += 1) {
          const character = source[at];
          if (quote) {
            if (character === "\\") at += 1;
            else if (character === quote) quote = "";
            continue;
          }
          if (character === '"' || character === "'") {
            quote = character;
            continue;
          }
          if (character === "(" || character === "[") depth += 1;
          if (character === ")" || character === "]") depth = Math.max(0, depth - 1);
          if (depth === 0 && character === delimiter) {
            parts.push(source.slice(start, at));
            start = at + 1;
          }
        }
        parts.push(source.slice(start));
        return parts;
      }, tokenizeSelectorSequence2 = function(source) {
        const selector = String(source || "").trim();
        const tokens = [];
        let start = 0;
        let depth = 0;
        let quote = "";
        let pendingSpace = false;
        for (let at = 0; at <= selector.length; at += 1) {
          const character = selector[at] || "";
          if (quote) {
            if (character === "\\") at += 1;
            else if (character === quote) quote = "";
            continue;
          }
          if (character === '"' || character === "'") {
            quote = character;
            continue;
          }
          if (character === "(" || character === "[") depth += 1;
          if (character === ")" || character === "]") depth = Math.max(0, depth - 1);
          if (depth > 0) continue;
          if (isSpace2(character) || at === selector.length) {
            pushCompound2(tokens, selector.slice(start, at));
            pendingSpace = tokens.length > 0;
            while (isSpace2(selector[at + 1])) at += 1;
            start = at + 1;
            continue;
          }
          if (character === ">" || character === "+" || character === "~") {
            pushCompound2(tokens, selector.slice(start, at));
            tokens.push(character);
            pendingSpace = false;
            while (isSpace2(selector[at + 1])) at += 1;
            start = at + 1;
            continue;
          }
          if (pendingSpace && start === at) {
            tokens.push(" ");
            pendingSpace = false;
          }
        }
        return normalizeCombinators2(tokens);
      }, pushCompound2 = function(tokens, value) {
        const clean = String(value || "").trim();
        if (clean) tokens.push(clean);
      }, normalizeCombinators2 = function(tokens) {
        return tokens.filter((value, index) => {
          if (value !== " ") return true;
          const before = tokens[index - 1];
          const after = tokens[index + 1];
          return Boolean(before && after && !isCombinator2(before) && !isCombinator2(after));
        });
      }, isCombinator2 = function(value) {
        return value === " " || value === ">" || value === "+" || value === "~";
      }, isSpace2 = function(character) {
        return character === " " || character === "\n" || character === "\r" || character === "	" || character === "\f";
      };
      splitSelectorList2 = splitSelectorList3, splitTopLevel4 = splitTopLevel5, tokenizeSelectorSequence = tokenizeSelectorSequence2, pushCompound = pushCompound2, normalizeCombinators = normalizeCombinators2, isCombinator = isCombinator2, isSpace = isSpace2;
      const AwtsExports = { isCombinator: isCombinator2, splitSelectorList: splitSelectorList3, splitTopLevel: splitTopLevel5, tokenizeSelectorSequence: tokenizeSelectorSequence2 };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var splitSelectorList2;
    var splitTopLevel4;
    var tokenizeSelectorSequence;
    var pushCompound;
    var normalizeCombinators;
    var isCombinator;
    var isSpace;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSelectorScanner.js
var require_CssSelectorScanner = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSelectorScanner.js"(exports, module) {
    {
      let readSelectorIdentifier2 = function(source, at) {
        let index = at;
        let value = "";
        while (index < source.length && isNameCharacter2(source[index])) {
          value += source[index];
          index += 1;
        }
        return Object.freeze({ end: index, value });
      }, readBalancedSelector2 = function(source, at, open, close) {
        let depth = 0;
        let quote = "";
        for (let index = at; index < source.length; index += 1) {
          const character = source[index];
          if (quote) {
            if (character === "\\") index += 1;
            else if (character === quote) quote = "";
            continue;
          }
          if (character === '"' || character === "'") {
            quote = character;
            continue;
          }
          if (character === open) depth += 1;
          if (character === close) depth -= 1;
          if (depth === 0) {
            return Object.freeze({
              body: source.slice(at + 1, index),
              end: index + 1
            });
          }
        }
        return Object.freeze({ body: source.slice(at + 1), end: source.length });
      }, findTopLevelWord2 = function(source, word) {
        let depth = 0;
        let quote = "";
        for (let index = 0; index <= source.length - word.length; index += 1) {
          const character = source[index];
          if (quote) {
            if (character === "\\") index += 1;
            else if (character === quote) quote = "";
            continue;
          }
          if (character === '"' || character === "'") {
            quote = character;
            continue;
          }
          if (character === "(" || character === "[") depth += 1;
          if (character === ")" || character === "]") depth = Math.max(0, depth - 1);
          if (depth !== 0) continue;
          if (source.slice(index, index + word.length).toLowerCase() !== word) continue;
          const before = source[index - 1] || " ";
          const after = source[index + word.length] || " ";
          if (isSpace2(before) && isSpace2(after)) return index;
        }
        return -1;
      }, isNameCharacter2 = function(character) {
        if (!character) return false;
        const code = character.codePointAt(0);
        return character === "-" || character === "_" || code >= 128 || code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 97 && code <= 122;
      }, isSpace2 = function(character) {
        return character === " " || character === "\n" || character === "\r" || character === "	" || character === "\f";
      };
      readSelectorIdentifier = readSelectorIdentifier2, readBalancedSelector = readBalancedSelector2, findTopLevelWord = findTopLevelWord2, isNameCharacter = isNameCharacter2, isSpace = isSpace2;
      const AwtsExports = { findTopLevelWord: findTopLevelWord2, readBalancedSelector: readBalancedSelector2, readSelectorIdentifier: readSelectorIdentifier2 };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var readSelectorIdentifier;
    var readBalancedSelector;
    var findTopLevelWord;
    var isNameCharacter;
    var isSpace;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSpecificity.js
var require_CssSpecificity = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSpecificity.js"(exports, module) {
    {
      let cssSpecificity2 = function(selector) {
        const total = [0, 0, 0];
        const source = String(selector || "");
        for (let at = 0; at < source.length; ) {
          const character = source[at];
          if (character === "#") {
            total[0] += 1;
            at = scanner.readSelectorIdentifier(source, at + 1).end;
            continue;
          }
          if (character === "." || character === "[") {
            total[1] += 1;
            at = character === "[" ? scanner.readBalancedSelector(source, at, "[", "]").end : scanner.readSelectorIdentifier(source, at + 1).end;
            continue;
          }
          if (character === ":") {
            const pseudo = consumePseudo2(source, at);
            addPseudoSpecificity2(total, pseudo);
            at = pseudo.end;
            continue;
          }
          if (isTypeStart2(source, at)) {
            total[2] += 1;
            at = scanner.readSelectorIdentifier(source, at).end;
            continue;
          }
          at += 1;
        }
        return Object.freeze(total);
      }, compareSpecificity3 = function(left, right) {
        for (let index = 0; index < 3; index += 1) {
          if (left[index] !== right[index]) return left[index] - right[index];
        }
        return 0;
      }, consumePseudo2 = function(source, at) {
        const element = source[at + 1] === ":";
        const nameStart = at + (element ? 2 : 1);
        const name = scanner.readSelectorIdentifier(source, nameStart);
        if (source[name.end] !== "(") {
          return Object.freeze({ argument: "", element, end: name.end, name: name.value.toLowerCase() });
        }
        const body = scanner.readBalancedSelector(source, name.end, "(", ")");
        return Object.freeze({ argument: body.body, element, end: body.end, name: name.value.toLowerCase() });
      }, addPseudoSpecificity2 = function(total, pseudo) {
        if (pseudo.element) {
          total[2] += 1;
          return;
        }
        if (pseudo.name === "where") return;
        if (pseudo.name === "is" || pseudo.name === "not" || pseudo.name === "has") {
          addTuple2(total, maximumSpecificity2(pseudo.argument));
          return;
        }
        total[1] += 1;
        if ((pseudo.name === "nth-child" || pseudo.name === "nth-last-child") && pseudo.argument) {
          const of = scanner.findTopLevelWord(pseudo.argument, "of");
          if (of >= 0) addTuple2(total, maximumSpecificity2(pseudo.argument.slice(of + 2)));
        }
      }, maximumSpecificity2 = function(selectorList) {
        let maximum = [0, 0, 0];
        for (const selector of splitSelectorList2(selectorList)) {
          const current = cssSpecificity2(selector);
          if (compareSpecificity3(current, maximum) > 0) maximum = [...current];
        }
        return maximum;
      }, addTuple2 = function(target, value) {
        for (let index = 0; index < 3; index += 1) target[index] += value[index];
      }, isTypeStart2 = function(source, at) {
        const character = source[at] || "";
        if (character === "*" || character === "|" || character === "&") return false;
        const before = source[at - 1] || " ";
        if (before === "#" || before === "." || before === ":") return false;
        const code = character.codePointAt(0);
        return code >= 65 && code <= 90 || code >= 97 && code <= 122 || code >= 128;
      };
      cssSpecificity = cssSpecificity2, compareSpecificity2 = compareSpecificity3, consumePseudo = consumePseudo2, addPseudoSpecificity = addPseudoSpecificity2, maximumSpecificity = maximumSpecificity2, addTuple = addTuple2, isTypeStart = isTypeStart2;
      const { splitSelectorList: splitSelectorList2 } = typeof module === "object" && module.exports ? require_CssSelectorList() : globalThis.Merkava;
      const scanner = typeof module === "object" && module.exports ? require_CssSelectorScanner() : globalThis.Merkava;
      const AwtsExports = { compareSpecificity: compareSpecificity3, cssSpecificity: cssSpecificity2 };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var cssSpecificity;
    var compareSpecificity2;
    var consumePseudo;
    var addPseudoSpecificity;
    var maximumSpecificity;
    var addTuple;
    var isTypeStart;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssConditionEvaluator.js
var require_CssConditionEvaluator = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssConditionEvaluator.js"(exports, module) {
    {
      let matchesMediaQuery3 = function(source, environment = {}) {
        return splitTopLevel4(String(source || ""), ",").some((query) => matchesOneQuery2(query, environment));
      }, matchesSupportsCondition3 = function(source, environment = {}) {
        if (typeof environment.supports !== "function") return false;
        return evaluateSupports2(String(source || "").trim(), environment);
      }, evaluateSupports2 = function(text, environment) {
        text = text.trim();
        if (/^not[\s(]/i.test(text)) {
          const inner = text.replace(/^not\s*/i, "").trim();
          return !evaluateSupports2(stripOuterParens2(inner) === inner ? inner : stripOuterParens2(inner), environment);
        }
        const orParts = splitTopLevelBool2(text, "or");
        if (orParts.length > 1) return orParts.some((p) => evaluateSupports2(p, environment));
        const andParts = splitTopLevelBool2(text, "and");
        if (andParts.length > 1) return andParts.every((p) => evaluateSupports2(p, environment));
        const unwrapped = stripOuterParens2(text);
        if (unwrapped !== text) return evaluateSupports2(unwrapped, environment);
        const selMatch = text.match(/^selector\s*\(([\s\S]*)\)$/i);
        if (selMatch) return isValidSelector2(selMatch[1].trim());
        const colon = findTopLevelColon2(text);
        if (colon < 0) return false;
        return Boolean(environment.supports(text.slice(0, colon).trim(), text.slice(colon + 1).trim()));
      }, stripOuterParens2 = function(text) {
        text = text.trim();
        if (!text.startsWith("(") || !text.endsWith(")")) return text;
        let depth = 0;
        for (let i = 0; i < text.length; i++) {
          if (text[i] === "(") depth++;
          else if (text[i] === ")") {
            depth--;
            if (depth === 0 && i < text.length - 1) return text;
          }
        }
        return depth === 0 ? text.slice(1, -1).trim() : text;
      }, splitTopLevelBool2 = function(text, op) {
        const out = [];
        let depth = 0, start = 0;
        const lower = text.toLowerCase();
        const needle = ` ${op} `;
        for (let i = 0; i < text.length; i++) {
          if (text[i] === "(") depth++;
          else if (text[i] === ")") depth = Math.max(0, depth - 1);
          else if (depth === 0 && lower.startsWith(needle, i)) {
            out.push(text.slice(start, i).trim());
            start = i + needle.length;
            i += needle.length - 1;
          }
        }
        out.push(text.slice(start).trim());
        return out.filter(Boolean);
      }, isValidSelector2 = function(sel) {
        if (!sel) return false;
        try {
          const { splitSelectorList: splitSelectorList2 } = typeof module === "object" && module.exports ? require_CssSelectorList() : globalThis.Merkava;
          const parts = splitSelectorList2(sel);
          return Array.isArray(parts) && parts.length > 0 && parts.every((p) => String(p).trim().length > 0);
        } catch {
          return false;
        }
      }, matchesOneQuery2 = function(source, environment) {
        let text = String(source || "").trim().toLowerCase();
        let negate = false;
        if (text.startsWith("not ")) {
          negate = true;
          text = text.slice(4).trim();
        }
        if (text.startsWith("only ")) text = text.slice(5).trim();
        const parts = splitAnd2(text);
        let matches = true;
        for (const part of parts) {
          if (!part.startsWith("(")) matches = matches && matchesMediaType2(part, environment);
          else matches = matches && matchesFeature2(stripParens2(part), environment);
        }
        return negate ? !matches : matches;
      }, matchesMediaType2 = function(type, environment) {
        const wanted = type.trim();
        if (!wanted || wanted === "all") return true;
        return wanted === String(environment.type || "screen").toLowerCase();
      }, matchesFeature2 = function(source, environment) {
        const colon = findTopLevelColon2(source);
        const name = (colon < 0 ? source : source.slice(0, colon)).trim();
        const value = colon < 0 ? "" : source.slice(colon + 1).trim();
        if (name === "orientation") {
          const width = Number(environment.width || 0);
          const height = Number(environment.height || 0);
          return value === (width >= height ? "landscape" : "portrait");
        }
        if (colon < 0) {
          if (name === "color" || name === "hover" || name === "pointer") return true;
          return false;
        }
        if (name === "prefers-color-scheme") {
          return value === String(environment.colorScheme || "light").toLowerCase();
        }
        if (name === "prefers-reduced-motion") {
          return value === (environment.reducedMotion ? "reduce" : "no-preference");
        }
        if (name === "forced-colors") {
          const fc = !!environment.forcedColors;
          return value === (fc ? "active" : "none");
        }
        if (name === "hover" || name === "any-hover" || name === "pointer" || name === "any-pointer") {
          const cap = String(environment[name.replace(/^any-/, "")] || "hover").toLowerCase();
          return value === cap || value === "none" && cap === "none";
        }
        if (name === "aspect-ratio" || name === "min-aspect-ratio" || name === "max-aspect-ratio") {
          const ratio = parseAspectRatio3(value);
          if (ratio == null) return false;
          const actual = Number(environment.width || 0) / Math.max(1, Number(environment.height || 0));
          if (name === "aspect-ratio") return Math.abs(actual - ratio) < 1e-6;
          if (name === "min-aspect-ratio") return actual >= ratio;
          return actual <= ratio;
        }
        if (name === "resolution" || name === "min-resolution" || name === "max-resolution") {
          const dpi = parseResolution2(value);
          if (dpi == null) return false;
          const actual = Number(environment.resolutionDpi || 96);
          if (name === "resolution") return actual === dpi;
          if (name === "min-resolution") return actual >= dpi;
          return actual <= dpi;
        }
        const numeric = parseLength2(value, environment);
        if (numeric == null) return false;
        if (name === "width") return Number(environment.width) === numeric;
        if (name === "min-width") return Number(environment.width) >= numeric;
        if (name === "max-width") return Number(environment.width) <= numeric;
        if (name === "height") return Number(environment.height) === numeric;
        if (name === "min-height") return Number(environment.height) >= numeric;
        if (name === "max-height") return Number(environment.height) <= numeric;
        return false;
      }, splitAnd2 = function(source) {
        const result = [];
        let start = 0;
        let depth = 0;
        for (let at = 0; at < source.length; at += 1) {
          if (source[at] === "(") depth += 1;
          if (source[at] === ")") depth = Math.max(0, depth - 1);
          if (depth === 0 && source.slice(at, at + 5) === " and ") {
            result.push(source.slice(start, at).trim());
            start = at + 5;
            at += 4;
          }
        }
        result.push(source.slice(start).trim());
        return result.filter(Boolean);
      }, stripParens2 = function(source) {
        return source.startsWith("(") && source.endsWith(")") ? source.slice(1, -1).trim() : source;
      }, findTopLevelColon2 = function(source) {
        let depth = 0;
        for (let at = 0; at < source.length; at += 1) {
          if (source[at] === "(") depth += 1;
          if (source[at] === ")") depth = Math.max(0, depth - 1);
          if (depth === 0 && source[at] === ":") return at;
        }
        return -1;
      }, parsePx4 = function(source) {
        return parseLength2(source, {});
      }, parseLength2 = function(source, environment = {}) {
        const text = String(source || "").trim().toLowerCase();
        const fontSize = Number(environment.fontSize) || 16;
        if (text.endsWith("px")) {
          const value = Number(text.slice(0, -2));
          return Number.isFinite(value) ? value : null;
        }
        if (text.endsWith("rem")) {
          const value = Number(text.slice(0, -3));
          return Number.isFinite(value) ? value * fontSize : null;
        }
        if (text.endsWith("em")) {
          const value = Number(text.slice(0, -2));
          return Number.isFinite(value) ? value * fontSize : null;
        }
        return null;
      }, parseAspectRatio3 = function(source) {
        const text = String(source || "").trim();
        const m = text.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
        if (!m) return null;
        const denom = parseFloat(m[2]);
        if (!denom) return null;
        return parseFloat(m[1]) / denom;
      }, parseResolution2 = function(source) {
        const text = String(source || "").trim().toLowerCase();
        let m = text.match(/^([\d.]+)\s*dpi$/);
        if (m) return parseFloat(m[1]) || null;
        m = text.match(/^([\d.]+)\s*dppx$/);
        if (m) return (parseFloat(m[1]) || 0) * 96 || null;
        m = text.match(/^([\d.]+)\s*dpcm$/);
        if (m) return (parseFloat(m[1]) || 0) * 2.54 || null;
        return null;
      };
      matchesMediaQuery2 = matchesMediaQuery3, matchesSupportsCondition2 = matchesSupportsCondition3, evaluateSupports = evaluateSupports2, stripOuterParens = stripOuterParens2, splitTopLevelBool = splitTopLevelBool2, isValidSelector = isValidSelector2, matchesOneQuery = matchesOneQuery2, matchesMediaType = matchesMediaType2, matchesFeature = matchesFeature2, splitAnd = splitAnd2, stripParens = stripParens2, findTopLevelColon = findTopLevelColon2, parsePx3 = parsePx4, parseLength = parseLength2, parseAspectRatio2 = parseAspectRatio3, parseResolution = parseResolution2;
      const { splitTopLevel: splitTopLevel4 } = typeof module === "object" && module.exports ? require_CssSelectorList() : globalThis.Merkava;
      const AwtsExports = { matchesMediaQuery: matchesMediaQuery3, matchesSupportsCondition: matchesSupportsCondition3 };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var matchesMediaQuery2;
    var matchesSupportsCondition2;
    var evaluateSupports;
    var stripOuterParens;
    var splitTopLevelBool;
    var isValidSelector;
    var matchesOneQuery;
    var matchesMediaType;
    var matchesFeature;
    var splitAnd;
    var stripParens;
    var findTopLevelColon;
    var parsePx3;
    var parseLength;
    var parseAspectRatio2;
    var parseResolution;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssRuleCompiler.js
var require_CssRuleCompiler = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssRuleCompiler.js"(exports, module) {
    {
      let compileCssStyleSheet3 = function(source, environment = {}, orderStart = 0) {
        const state = { environment, order: orderStart, rules: [], atRules: [], containerRules: [] };
        compileRuleList2(parseCssRules2(source), state);
        return Object.freeze({
          atRules: Object.freeze(state.atRules),
          nextOrder: state.order,
          rules: Object.freeze(state.rules),
          // B"H 2026-10-09: @container rules — evaluated per-element at
          // cascade time against the query container's size (not at
          // compile time, since container sizes aren't known yet).
          containerRules: Object.freeze(state.containerRules)
        });
      }, compileRuleList2 = function(parsedRules, state) {
        for (const rule of parsedRules) {
          if (rule.kind === "qualified") {
            compileQualifiedRule2(rule, state);
            continue;
          }
          compileAtRule2(rule, state);
        }
      }, compileQualifiedRule2 = function(rule, state) {
        const declarations = Object.freeze(parseCssDeclarations(rule.block));
        for (const selector of splitSelectorList2(rule.prelude)) {
          state.rules.push(Object.freeze({
            declarations,
            order: state.order,
            selector,
            specificity: Object.freeze([0, ...cssSpecificity(selector)])
          }));
          state.order += 1;
        }
      }, compileAtRule2 = function(rule, state) {
        state.atRules.push(rule);
        if (!rule.block) return;
        if (rule.name === "layer") {
          compileRuleList2(parseCssRules2(rule.block), state);
          return;
        }
        if (rule.name === "media" && conditions.matchesMediaQuery(rule.prelude, state.environment)) {
          compileRuleList2(parseCssRules2(rule.block), state);
          return;
        }
        if (rule.name === "supports" && conditions.matchesSupportsCondition(rule.prelude, state.environment)) {
          compileRuleList2(parseCssRules2(rule.block), state);
          return;
        }
        if (rule.name === "container" && rule.block) {
          const parsed = parseContainerPrelude2(rule.prelude);
          const innerState = { environment: state.environment, order: state.order, rules: [], atRules: [], containerRules: [] };
          compileRuleList2(parseCssRules2(rule.block), innerState);
          state.order = innerState.order;
          if (innerState.rules.length) {
            state.containerRules.push(Object.freeze({
              name: parsed.name,
              condition: parsed.condition,
              rules: Object.freeze(innerState.rules)
            }));
          }
          return;
        }
      }, parseContainerPrelude2 = function(prelude) {
        const text = String(prelude || "").trim();
        const styleMatch = text.match(/^style\s*\(([\s\S]*)\)$/i);
        if (styleMatch) return { name: null, condition: { kind: "style", query: styleMatch[1].trim() } };
        const namedMatch = text.match(/^([a-zA-Z][\w-]*)\s+([\s\S]+)$/);
        if (namedMatch && !/^(and|or|not|style)$/i.test(namedMatch[1])) {
          const rest = namedMatch[2].trim();
          if (rest.startsWith("(") || /^not\s/i.test(rest)) {
            return { name: namedMatch[1].toLowerCase(), condition: parseSizeCondition2(rest) };
          }
        }
        return { name: null, condition: parseSizeCondition2(text) };
      }, parseSizeCondition2 = function(text) {
        const t = String(text || "").trim();
        let m = t.match(/^not\s+([\s\S]+)$/i);
        if (m) {
          const inner2 = parseSizeCondition2(m[1].trim());
          return inner2 ? { kind: "not", cond: inner2 } : null;
        }
        const parts = splitBoolTopLevel2(t);
        if (parts.length > 1) {
          const conds = [], ops = [];
          for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
              const c = parseSizeCondition2(parts[i]);
              if (!c) return null;
              conds.push(c);
            } else ops.push(parts[i].toLowerCase());
          }
          return { kind: "bool", ops, conds };
        }
        const inner = t.match(/^\(([\s\S]*)\)$/);
        const core = inner ? inner[1].trim() : t;
        m = core.match(/^(min-|max-)?(width|height)\s*:\s*(\d+(?:\.\d+)?)\s*(px|em|rem|vw|vh|%)?$/i);
        if (!m) return null;
        return { kind: "size", prop: m[2].toLowerCase(), op: m[1] ? m[1].toLowerCase() : "", value: Number(m[3]), unit: (m[4] || "px").toLowerCase() };
      }, splitBoolTopLevel2 = function(text) {
        const out = [];
        let depth = 0, last = 0, i = 0;
        while (i < text.length) {
          const ch = text[i];
          if (ch === "(") depth++;
          else if (ch === ")") depth = Math.max(0, depth - 1);
          else if (depth === 0) {
            const mm = text.slice(i).match(/^\s+(and|or)\s+/i);
            if (mm) {
              out.push(text.slice(last, i));
              out.push(mm[1]);
              i += mm[0].length;
              last = i;
              continue;
            }
          }
          i++;
        }
        out.push(text.slice(last));
        return out;
      }, declarationsFromObject3 = function(declarations) {
        return Object.freeze(Object.entries(declarations || {}).map(([rawName, value]) => {
          const key = String(rawName);
          return Object.freeze({
            important: false,
            name: key.startsWith("--") ? key : key.toLowerCase(),
            value: String(value)
          });
        }));
      };
      compileCssStyleSheet2 = compileCssStyleSheet3, compileRuleList = compileRuleList2, compileQualifiedRule = compileQualifiedRule2, compileAtRule = compileAtRule2, parseContainerPrelude = parseContainerPrelude2, parseSizeCondition = parseSizeCondition2, splitBoolTopLevel = splitBoolTopLevel2, declarationsFromObject2 = declarationsFromObject3;
      const { parseCssDeclarations } = typeof module === "object" && module.exports ? require_CssDeclarationParser() : globalThis.Merkava;
      const { parseCssRules: parseCssRules2 } = typeof module === "object" && module.exports ? require_CssRuleParser() : globalThis.Merkava;
      const { splitSelectorList: splitSelectorList2 } = typeof module === "object" && module.exports ? require_CssSelectorList() : globalThis.Merkava;
      const { cssSpecificity } = typeof module === "object" && module.exports ? require_CssSpecificity() : globalThis.Merkava;
      const conditions = typeof module === "object" && module.exports ? require_CssConditionEvaluator() : globalThis.Merkava;
      const AwtsExports = { compileCssStyleSheet: compileCssStyleSheet3, declarationsFromObject: declarationsFromObject3 };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var compileCssStyleSheet2;
    var compileRuleList;
    var compileQualifiedRule;
    var compileAtRule;
    var parseContainerPrelude;
    var parseSizeCondition;
    var splitBoolTopLevel;
    var declarationsFromObject2;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssAttributeSelector.js
var require_CssAttributeSelector = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssAttributeSelector.js"(exports, module) {
    {
      let matchesAttributeSelector2 = function(element, source) {
        const parsed = parseAttributeSelector2(source);
        if (!parsed) return false;
        return matchParsedAttributeSelector2(element, parsed);
      }, matchParsedAttributeSelector2 = function(element, parsed) {
        const value = element.getAttribute?.(parsed.name);
        if (value == null) return !parsed.operator ? element.hasAttribute?.(parsed.name) === true : false;
        if (!parsed.operator) return true;
        const actual = parsed.insensitive ? String(value).toLowerCase() : String(value);
        const expected = parsed.insensitive ? parsed.value.toLowerCase() : parsed.value;
        if (parsed.operator === "=") return actual === expected;
        if (parsed.operator === "~=") return actual.splitCssWhitespace?.().includes(expected) || splitWhitespace2(actual).includes(expected);
        if (parsed.operator === "|=") return actual === expected || actual.startsWith(`${expected}-`);
        if (parsed.operator === "^=") return expected !== "" && actual.startsWith(expected);
        if (parsed.operator === "$=") return expected !== "" && actual.endsWith(expected);
        if (parsed.operator === "*=") return expected !== "" && actual.includes(expected);
        return false;
      }, parseAttributeSelector2 = function(source) {
        const key = String(source || "");
        if (PARSE_CACHE.has(key)) return PARSE_CACHE.get(key);
        const parsed = parseAttributeSelectorUncached2(key);
        if (PARSE_CACHE.size >= PARSE_CACHE_MAX) PARSE_CACHE.delete(PARSE_CACHE.keys().next().value);
        PARSE_CACHE.set(key, parsed);
        return parsed;
      }, parseAttributeSelectorUncached2 = function(source) {
        const text = String(source || "").trim();
        let at = 0;
        const name = readName2(text, at);
        if (!name.value) return null;
        at = skipSpace2(text, name.end);
        const operator = readOperator2(text, at);
        if (!operator.value) {
          return Object.freeze({ insensitive: false, name: name.value.toLowerCase(), operator: "", value: "" });
        }
        at = skipSpace2(text, operator.end);
        const value = readValue2(text, at);
        at = skipSpace2(text, value.end);
        const flag = String(text[at] || "").toLowerCase();
        return Object.freeze({
          insensitive: flag === "i",
          name: name.value.toLowerCase(),
          operator: operator.value,
          value: value.value
        });
      }, readOperator2 = function(text, at) {
        for (const operator of ["~=", "|=", "^=", "$=", "*=", "="]) {
          if (text.startsWith(operator, at)) return { end: at + operator.length, value: operator };
        }
        return { end: at, value: "" };
      }, readValue2 = function(text, at) {
        const quote = text[at];
        if (quote === '"' || quote === "'") {
          let value = "";
          for (let index = at + 1; index < text.length; index += 1) {
            if (text[index] === quote) return { end: index + 1, value };
            if (text[index] === "\\" && index + 1 < text.length) index += 1;
            value += text[index];
          }
          return { end: text.length, value };
        }
        const result = readName2(text, at);
        return { end: result.end, value: result.value };
      }, readName2 = function(text, at) {
        let index = at;
        while (index < text.length && !isSpace2(text[index]) && !"~=|^$*".includes(text[index])) index += 1;
        return { end: index, value: text.slice(at, index) };
      }, skipSpace2 = function(text, at) {
        let index = at;
        while (isSpace2(text[index])) index += 1;
        return index;
      }, splitWhitespace2 = function(text) {
        const result = [];
        let word = "";
        for (const character of text) {
          if (isSpace2(character)) {
            if (word) result.push(word);
            word = "";
          } else word += character;
        }
        if (word) result.push(word);
        return result;
      }, isSpace2 = function(character) {
        return character === " " || character === "\n" || character === "\r" || character === "	" || character === "\f";
      };
      matchesAttributeSelector = matchesAttributeSelector2, matchParsedAttributeSelector = matchParsedAttributeSelector2, parseAttributeSelector = parseAttributeSelector2, parseAttributeSelectorUncached = parseAttributeSelectorUncached2, readOperator = readOperator2, readValue = readValue2, readName = readName2, skipSpace = skipSpace2, splitWhitespace = splitWhitespace2, isSpace = isSpace2;
      const PARSE_CACHE = /* @__PURE__ */ new Map();
      const PARSE_CACHE_MAX = 1024;
      const AwtsExports = { matchParsedAttributeSelector: matchParsedAttributeSelector2, matchesAttributeSelector: matchesAttributeSelector2, parseAttributeSelector: parseAttributeSelector2 };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var matchesAttributeSelector;
    var matchParsedAttributeSelector;
    var parseAttributeSelector;
    var parseAttributeSelectorUncached;
    var readOperator;
    var readValue;
    var readName;
    var skipSpace;
    var splitWhitespace;
    var isSpace;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssNthExpression.js
var require_CssNthExpression = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssNthExpression.js"(exports, module) {
    {
      let parseNthExpression2 = function(source) {
        const key = String(source || "");
        if (PARSE_CACHE.has(key)) return PARSE_CACHE.get(key);
        const parsed = parseNthExpressionUncached2(key);
        if (PARSE_CACHE.size >= PARSE_CACHE_MAX) PARSE_CACHE.delete(PARSE_CACHE.keys().next().value);
        PARSE_CACHE.set(key, parsed);
        return parsed;
      }, parseNthExpressionUncached2 = function(source) {
        const compact = String(source || "").toLowerCase().replace(/\s+/g, "");
        if (compact === "odd") return Object.freeze({ a: 2, b: 1 });
        if (compact === "even") return Object.freeze({ a: 2, b: 0 });
        const n2 = compact.indexOf("n");
        if (n2 < 0) {
          const b2 = Number(compact);
          return Number.isInteger(b2) ? Object.freeze({ a: 0, b: b2 }) : null;
        }
        const aText = compact.slice(0, n2);
        const bText = compact.slice(n2 + 1);
        const a = aText === "" || aText === "+" ? 1 : aText === "-" ? -1 : Number(aText);
        const b = bText === "" ? 0 : Number(bText);
        if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
        return Object.freeze({ a, b });
      }, matchesNth2 = function(index, expression) {
        if (!expression || index < 1) return false;
        if (expression.a === 0) return index === expression.b;
        const quotient = (index - expression.b) / expression.a;
        return Number.isInteger(quotient) && quotient >= 0;
      };
      parseNthExpression = parseNthExpression2, parseNthExpressionUncached = parseNthExpressionUncached2, matchesNth = matchesNth2;
      const PARSE_CACHE = /* @__PURE__ */ new Map();
      const PARSE_CACHE_MAX = 256;
      const AwtsExports = { matchesNth: matchesNth2, parseNthExpression: parseNthExpression2 };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var parseNthExpression;
    var parseNthExpressionUncached;
    var matchesNth;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssPseudoMatcher.js
var require_CssPseudoMatcher = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssPseudoMatcher.js"(exports, module) {
    {
      let matchesCssPseudo2 = function(element, name, argument, matchesSelector) {
        const state = element.__merkavaState || {};
        if (name === "hover") return Boolean(state.hover);
        if (name === "active") return Boolean(state.active);
        if (name === "link") return isLinkElement2(element) && !state.visited;
        if (name === "visited") return isLinkElement2(element) && Boolean(state.visited);
        if (name === "target") return Boolean(element.id) && element.ownerDocument?.__merkavaTargetId === element.id;
        if (name === "focus-visible") return element.ownerDocument?.activeElement === element && state.focusVisible !== false;
        if (name === "focus-within") return containsActiveElement2(element);
        if (name === "default") return isDefaultButton2(element);
        if (name === "required") return Boolean(element.required);
        if (name === "optional") return isFormControl2(element) && !element.required;
        if (name === "read-only") return isReadOnly2(element);
        if (name === "read-write") return isFormControl2(element) && !isReadOnly2(element);
        if (name === "placeholder-shown") return isPlaceholderShown2(element);
        if (name === "focus") return element.ownerDocument?.activeElement === element;
        if (name === "root") return element.ownerDocument?.documentElement === element;
        if (name === "checked") return Boolean(element.checked || element.selected);
        if (name === "disabled") return Boolean(element.disabled);
        if (name === "enabled") return !element.disabled;
        if (name === "empty") return isEmpty2(element);
        if (name === "first-child") return childIndex2(element) === 1;
        if (name === "last-child") return childIndexFromEnd2(element) === 1;
        if (name === "only-child") return isOnlyChild2(element);
        if (name === "first-of-type") return typeIndex2(element) === 1;
        if (name === "last-of-type") return typeIndexFromEnd2(element) === 1;
        if (name === "only-of-type") return isOnlyOfType2(element);
        if (name === "is" || name === "where") return matchesAny2(element, argument, matchesSelector);
        if (name === "not") return !matchesAny2(element, argument, matchesSelector);
        if (name === "has") return matchesHas2(element, argument, matchesSelector);
        if (name.startsWith("nth-")) return matchesStructuralNth2(element, name, argument, matchesSelector);
        return false;
      }, matchesStructuralNth2 = function(element, name, argument, matchesSelector) {
        const split = findTopLevelWord(argument, "of");
        const expressionText = split < 0 ? argument : argument.slice(0, split);
        const filter = split < 0 ? "" : argument.slice(split + 2).trim();
        const ofType = name.includes("of-type");
        const reverse = name === "nth-last-child" || name === "nth-last-of-type";
        const expression = parseNthExpression(expressionText);
        const tag = element.localName;
        const kids = element.parentNode?.children;
        if (!filter) {
          let total = 0, index = 0;
          for (const child of kids || []) {
            if (child.nodeType !== 1) continue;
            if (ofType && child.localName !== tag) continue;
            total += 1;
            if (child === element) index = total;
          }
          if (index === 0) return false;
          const oneBased2 = reverse ? total - index + 1 : index;
          return matchesNth(oneBased2, expression);
        }
        const list = [];
        for (const child of kids || []) {
          if (child.nodeType !== 1) continue;
          if (ofType && child.localName !== tag) continue;
          if (matchesSelector(child, filter)) list.push(child);
        }
        const rawIndex = list.indexOf(element);
        if (rawIndex < 0) return false;
        const oneBased = reverse ? list.length - rawIndex : rawIndex + 1;
        return matchesNth(oneBased, expression);
      }, matchesAny2 = function(element, argument, matchesSelector) {
        return splitSelectorList2(argument).some((selector) => matchesSelector(element, selector));
      }, matchesHas2 = function(element, argument, matchesSelector) {
        for (const selector of splitSelectorList2(argument)) {
          const clean = selector.trim();
          if (clean.startsWith(">")) {
            const sub = clean.slice(1).trim();
            for (const child of element.children || []) {
              if (child.nodeType === 1 && matchesSelector(child, sub)) return true;
            }
            continue;
          }
          if (clean.startsWith("+")) {
            const sub = clean.slice(1).trim();
            return Boolean(element.nextSibling && matchesSelector(element.nextSibling, sub));
          }
          if (clean.startsWith("~")) {
            const sub = clean.slice(1).trim();
            for (let sibling = element.nextSibling; sibling; sibling = sibling.nextSibling) {
              if (matchesSelector(sibling, sub)) return true;
            }
            continue;
          }
          const stack = [];
          const roots = element.children || [];
          for (let i = roots.length - 1; i >= 0; i--) stack.push(roots[i]);
          while (stack.length > 0) {
            const node = stack.pop();
            if (node.nodeType === 1 && matchesSelector(node, clean)) return true;
            const kids = node.children || [];
            for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i]);
          }
        }
        return false;
      }, isEmpty2 = function(element) {
        return !(element.children || []).some((child) => child.nodeType === 1 || child.nodeType === 3 && child.textContent);
      }, childIndex2 = function(element) {
        const kids = element.parentNode?.children;
        if (!kids) return 0;
        let n2 = 0;
        for (let i = 0; i < kids.length; i++) {
          const child = kids[i];
          if (child.nodeType !== 1) continue;
          n2 += 1;
          if (child === element) return n2;
        }
        return 0;
      }, childIndexFromEnd2 = function(element) {
        const kids = element.parentNode?.children;
        if (!kids) return 1;
        let total = 0, index = 0;
        for (let i = 0; i < kids.length; i++) {
          const child = kids[i];
          if (child.nodeType !== 1) continue;
          total += 1;
          if (child === element) index = total;
        }
        return index === 0 ? total + 1 : total - index + 1;
      }, typeIndex2 = function(element) {
        const kids = element.parentNode?.children;
        if (!kids) return 0;
        const tag = element.localName;
        let n2 = 0;
        for (let i = 0; i < kids.length; i++) {
          const child = kids[i];
          if (child.nodeType !== 1 || child.localName !== tag) continue;
          n2 += 1;
          if (child === element) return n2;
        }
        return 0;
      }, typeIndexFromEnd2 = function(element) {
        const kids = element.parentNode?.children;
        if (!kids) return 1;
        const tag = element.localName;
        let total = 0, index = 0;
        for (let i = 0; i < kids.length; i++) {
          const child = kids[i];
          if (child.nodeType !== 1 || child.localName !== tag) continue;
          total += 1;
          if (child === element) index = total;
        }
        return index === 0 ? total + 1 : total - index + 1;
      }, isOnlyChild2 = function(element) {
        const kids = element.parentNode?.children;
        if (!kids) return false;
        let n2 = 0;
        for (let i = 0; i < kids.length; i++) {
          if (kids[i].nodeType !== 1) continue;
          n2 += 1;
          if (n2 > 1) return false;
        }
        return n2 === 1;
      }, isOnlyOfType2 = function(element) {
        const kids = element.parentNode?.children;
        if (!kids) return false;
        const tag = element.localName;
        let n2 = 0;
        for (let i = 0; i < kids.length; i++) {
          const child = kids[i];
          if (child.nodeType !== 1 || child.localName !== tag) continue;
          n2 += 1;
          if (n2 > 1) return false;
        }
        return n2 === 1;
      }, isLinkElement2 = function(element) {
        return LINK_ELEMENTS.has(element.localName) && element.getAttribute?.("href") != null;
      }, isFormControl2 = function(element) {
        return FORM_CONTROLS.has(element.localName);
      }, containsActiveElement2 = function(element) {
        const active = element.ownerDocument?.activeElement;
        if (!active || active === element) return active === element ? false : false;
        let node = active.parentNode;
        while (node) {
          if (node === element) return true;
          node = node.parentNode;
        }
        return false;
      }, isDefaultButton2 = function(element) {
        if (element.localName === "button") {
          const type = String(element.getAttribute?.("type") || "submit").toLowerCase();
          return type === "submit";
        }
        if (element.localName === "input") {
          const type = String(element.getAttribute?.("type") || "text").toLowerCase();
          if (type === "submit" || type === "image") return true;
          if ((type === "checkbox" || type === "radio") && element.checked) return true;
        }
        if (element.localName === "option") return Boolean(element.selected);
        return false;
      }, isReadOnly2 = function(element) {
        if (!isFormControl2(element)) return true;
        if (element.disabled) return true;
        if (element.getAttribute?.("readonly") != null) return true;
        if (element.localName === "input") {
          const type = String(element.getAttribute?.("type") || "text").toLowerCase();
          if (["checkbox", "radio", "submit", "button", "reset", "image", "file", "hidden"].includes(type)) return true;
        }
        return false;
      }, isPlaceholderShown2 = function(element) {
        if (element.localName !== "input" && element.localName !== "textarea") return false;
        if (element.getAttribute?.("placeholder") == null) return false;
        const value = element.value != null ? String(element.value) : String(element.getAttribute?.("value") || "");
        return value === "";
      };
      matchesCssPseudo = matchesCssPseudo2, matchesStructuralNth = matchesStructuralNth2, matchesAny = matchesAny2, matchesHas = matchesHas2, isEmpty = isEmpty2, childIndex = childIndex2, childIndexFromEnd = childIndexFromEnd2, typeIndex = typeIndex2, typeIndexFromEnd = typeIndexFromEnd2, isOnlyChild = isOnlyChild2, isOnlyOfType = isOnlyOfType2, isLinkElement = isLinkElement2, isFormControl = isFormControl2, containsActiveElement = containsActiveElement2, isDefaultButton = isDefaultButton2, isReadOnly = isReadOnly2, isPlaceholderShown = isPlaceholderShown2;
      const { matchesNth, parseNthExpression } = typeof module === "object" && module.exports ? require_CssNthExpression() : globalThis.Merkava;
      const { findTopLevelWord } = typeof module === "object" && module.exports ? require_CssSelectorScanner() : globalThis.Merkava;
      const { splitSelectorList: splitSelectorList2 } = typeof module === "object" && module.exports ? require_CssSelectorList() : globalThis.Merkava;
      const LINK_ELEMENTS = /* @__PURE__ */ new Set(["a", "area", "link"]);
      const FORM_CONTROLS = /* @__PURE__ */ new Set(["input", "textarea", "select", "button"]);
      const AwtsExports = { matchesCssPseudo: matchesCssPseudo2 };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var matchesCssPseudo;
    var matchesStructuralNth;
    var matchesAny;
    var matchesHas;
    var isEmpty;
    var childIndex;
    var childIndexFromEnd;
    var typeIndex;
    var typeIndexFromEnd;
    var isOnlyChild;
    var isOnlyOfType;
    var isLinkElement;
    var isFormControl;
    var containsActiveElement;
    var isDefaultButton;
    var isReadOnly;
    var isPlaceholderShown;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSelectorMatcher.js
var require_CssSelectorMatcher = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSelectorMatcher.js"(exports, module) {
    {
      let matchesCssSelector3 = function(element, selectorList) {
        if (!element || element.nodeType !== 1) return false;
        return matchesCompiledSelectorList2(element, compileSelectorList2(selectorList));
      }, matchesCompoundSelector2 = function(element, compound) {
        return matchesCompiledCompound2(element, compileCompoundSelector2(String(compound || "")), void 0);
      }, matchesTokenizedSelectorList2 = function(element, tokenizedList) {
        if (!element || element.nodeType !== 1) return false;
        for (const tokens of tokenizedList || []) {
          if (!tokens || !tokens.length || tokens.length % 2 === 0) continue;
          if (matchCompiledTokens2(element, compileTokenArray2(tokens), void 0)) return true;
        }
        return false;
      }, matchesCompiledSelectorList2 = function(element, compiledList, elKeys) {
        if (!element || element.nodeType !== 1) return false;
        let sig, words;
        if (elKeys !== void 0) {
          sig = elKeys.sig;
          words = elKeys.words;
        } else if (compiledList && (compiledList.bloom || compiledList.needsClasses)) {
          const keys = elementKeys3(element);
          sig = keys.sig;
          words = keys.words;
        }
        for (let i = 0; i < compiledList.length; i++) {
          if (matchCompiledTokens2(element, compiledList[i], sig, words)) return true;
        }
        return false;
      }, matchCompiledTokens2 = function(element, tokens, sig, words) {
        const n2 = tokens.length;
        if (!n2 || n2 % 2 === 0) return false;
        if (!matchesCompiledCompound2(element, tokens[n2 - 1], sig, words)) return false;
        if (n2 === 1) return true;
        return matchCompiledRest2(element, tokens, n2 - 3);
      }, matchCompiledRest2 = function(element, tokens, at) {
        const compound = tokens[at];
        const combinator = tokens[at + 1];
        if (combinator === ">") {
          const parent = parentElement2(element);
          if (!parent || !matchesCompiledCompound2(parent, compound, void 0, void 0)) return false;
          return at === 0 || matchCompiledRest2(parent, tokens, at - 2);
        }
        if (combinator === "+") {
          const prev = previousElement2(element);
          if (!prev || !matchesCompiledCompound2(prev, compound, void 0, void 0)) return false;
          return at === 0 || matchCompiledRest2(prev, tokens, at - 2);
        }
        if (combinator === "~") {
          for (let sibling = previousElement2(element); sibling; sibling = previousElement2(sibling)) {
            if (matchesCompiledCompound2(sibling, compound, void 0, void 0) && (at === 0 || matchCompiledRest2(sibling, tokens, at - 2))) return true;
          }
          return false;
        }
        for (let parent = parentElement2(element); parent; parent = parentElement2(parent)) {
          if (matchesCompiledCompound2(parent, compound, void 0, void 0) && (at === 0 || matchCompiledRest2(parent, tokens, at - 2))) return true;
        }
        return false;
      }, matchesCompiledCompound2 = function(element, c, sig, words) {
        if (c.never) return false;
        if (sig !== void 0 && c.keySig !== 0 && (c.keySig & ~sig | 0) !== 0) return false;
        if (c.tag !== null && element.localName !== c.tag) return false;
        const ids = c.ids;
        if (ids !== null) {
          const elementId = element.id;
          for (let i = 0; i < ids.length; i++) {
            if (elementId !== ids[i]) return false;
          }
        }
        const classes = c.classes;
        if (classes !== null) {
          if (!element.classList) return false;
          const w = words !== void 0 ? words : classWords2(element);
          for (let i = 0; i < classes.length; i++) {
            if (w.indexOf(classes[i]) < 0) return false;
          }
        }
        const attrs = c.attrs;
        if (attrs !== null) {
          for (let i = 0; i < attrs.length; i++) {
            if (!matchParsedAttributeSelector(element, attrs[i])) return false;
          }
        }
        const pseudos = c.pseudos;
        if (pseudos !== null) {
          for (let i = 0; i < pseudos.length; i++) {
            const pseudo = pseudos[i];
            if (pseudo.compiled !== null) {
              const hit = matchesCompiledSelectorList2(element, pseudo.compiled);
              if (pseudo.negated ? hit : !hit) return false;
            } else if (!matchesCssPseudo(element, pseudo.name, pseudo.argument, compiledSelectorCallback2)) {
              return false;
            }
          }
        }
        return true;
      }, compiledSelectorCallback2 = function(element, selector) {
        return matchesCompiledSelectorList2(element, compileSelectorList2(selector));
      }, compileSelectorList2 = function(source) {
        const key = String(source || "");
        let compiled = SELECTOR_LIST_CACHE.get(key);
        if (compiled === void 0) {
          compiled = splitSelectorList2(key).map(compileTokenArray2);
          compiled.bloom = compiled.length > 1 || compiled.some((tokens) => tokens.length > 0 && tokens[tokens.length - 1].keyCount >= 3);
          compiled.needsClasses = compiled.some((tokens) => tokens.length > 0 && tokens[tokens.length - 1].classes !== null);
          if (SELECTOR_LIST_CACHE.size >= SELECTOR_LIST_CACHE_MAX) {
            SELECTOR_LIST_CACHE.delete(SELECTOR_LIST_CACHE.keys().next().value);
          }
          SELECTOR_LIST_CACHE.set(key, compiled);
        }
        return compiled;
      }, compileTokenArray2 = function(selector) {
        const tokens = tokenizeSelectorSequence(selector);
        const out = new Array(tokens.length);
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          out[i] = isCombinator(token) ? token : compileCompoundSelector2(token);
        }
        return out;
      }, compileCompoundSelector2 = function(compound) {
        const key = String(compound || "");
        let compiled = COMPOUND_CACHE.get(key);
        if (compiled === void 0) {
          compiled = compileCompoundUncached2(key);
          if (COMPOUND_CACHE.size >= COMPOUND_CACHE_MAX) {
            COMPOUND_CACHE.delete(COMPOUND_CACHE.keys().next().value);
          }
          COMPOUND_CACHE.set(key, compiled);
        }
        return compiled;
      }, compileCompoundUncached2 = function(source) {
        const record = {
          tag: null,
          ids: null,
          classes: null,
          attrs: null,
          pseudos: null,
          keySig: 0,
          keyCount: 0,
          never: false
        };
        let ids = null, classes = null, attrs = null, pseudos = null;
        let at = 0;
        const n2 = source.length;
        if (at < n2 && source[at] === "*") {
          at += 1;
        } else if (at < n2 && isTypeStart2(source[at])) {
          const type = scanner.readSelectorIdentifier(source, at);
          record.tag = type.value.toLowerCase();
          record.keySig |= keyBit2(record.tag);
          record.keyCount += 1;
          at = type.end;
        }
        while (at < n2 && !record.never) {
          const marker = source[at];
          if (marker === "#" || marker === ".") {
            const name = scanner.readSelectorIdentifier(source, at + 1);
            if (!name.value) {
              record.never = true;
              break;
            }
            if (marker === "#") {
              (ids || (ids = [])).push(name.value);
            } else {
              (classes || (classes = [])).push(name.value);
            }
            record.keySig |= keyBit2(name.value);
            record.keyCount += 1;
            at = name.end;
            continue;
          }
          if (marker === "[") {
            const attribute = scanner.readBalancedSelector(source, at, "[", "]");
            const parsed = parseAttributeSelector(attribute.body);
            if (!parsed) {
              record.never = true;
              break;
            }
            (attrs || (attrs = [])).push(parsed);
            at = attribute.end;
            continue;
          }
          if (marker === ":") {
            const pseudo = readPseudo2(source, at);
            if (pseudo.element) {
              record.never = true;
              break;
            }
            let compiled = null, negated = false;
            if (pseudo.name === "is" || pseudo.name === "where" || pseudo.name === "not") {
              negated = pseudo.name === "not";
              compiled = compileSelectorList2(pseudo.argument);
            }
            (pseudos || (pseudos = [])).push({
              name: pseudo.name,
              argument: pseudo.argument,
              compiled,
              negated
            });
            at = pseudo.end;
            continue;
          }
          record.never = true;
        }
        record.keySig |= 0;
        record.ids = ids;
        record.classes = classes;
        record.attrs = attrs;
        record.pseudos = pseudos;
        return record;
      }, readPseudo2 = function(source, at) {
        const element = source[at + 1] === ":";
        const nameStart = at + (element ? 2 : 1);
        const name = scanner.readSelectorIdentifier(source, nameStart);
        if (source[name.end] !== "(") {
          return { argument: "", element, end: name.end, name: name.value.toLowerCase() };
        }
        const argument = scanner.readBalancedSelector(source, name.end, "(", ")");
        return { argument: argument.body, element, end: argument.end, name: name.value.toLowerCase() };
      }, fnv1a322 = function(text) {
        let hash = 2166136261;
        for (let i = 0; i < text.length; i++) {
          hash ^= text.charCodeAt(i);
          hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
      }, keyBit2 = function(key) {
        return 1 << (fnv1a322(key) & 31) | 0;
      }, elementKeys3 = function(element) {
        if (!element) return { sig: 0, words: [] };
        let sig = 0;
        const tag = element.localName;
        if (tag) sig |= keyBit2(tag);
        const id = element.id;
        if (id) sig |= keyBit2(id);
        let words = [];
        let classAttr = element.className;
        if (classAttr == null) classAttr = element.attributes && element.attributes.class || "";
        if (classAttr) {
          words = String(classAttr).split(/\s+/);
          for (let i = 0; i < words.length; i++) {
            if (words[i]) sig |= keyBit2(words[i]);
          }
        }
        return { sig: sig | 0, words };
      }, elementKeySignature2 = function(element) {
        return elementKeys3(element).sig;
      }, classWords2 = function(element) {
        let classAttr = element.className;
        if (classAttr == null) classAttr = element.attributes && element.attributes.class || "";
        if (!classAttr) return [];
        return String(classAttr).split(/\s+/);
      }, parentElement2 = function(element) {
        let parent = element.parentNode;
        while (parent && parent.nodeType !== 1) parent = parent.parentNode;
        return parent || null;
      }, previousElement2 = function(element) {
        let sibling = element.previousSibling;
        while (sibling && sibling.nodeType !== 1) sibling = sibling.previousSibling;
        return sibling || null;
      }, isTypeStart2 = function(character) {
        if (!character) return false;
        const code = character.codePointAt(0);
        return code >= 65 && code <= 90 || code >= 97 && code <= 122 || code >= 128;
      };
      matchesCssSelector2 = matchesCssSelector3, matchesCompoundSelector = matchesCompoundSelector2, matchesTokenizedSelectorList = matchesTokenizedSelectorList2, matchesCompiledSelectorList = matchesCompiledSelectorList2, matchCompiledTokens = matchCompiledTokens2, matchCompiledRest = matchCompiledRest2, matchesCompiledCompound = matchesCompiledCompound2, compiledSelectorCallback = compiledSelectorCallback2, compileSelectorList = compileSelectorList2, compileTokenArray = compileTokenArray2, compileCompoundSelector = compileCompoundSelector2, compileCompoundUncached = compileCompoundUncached2, readPseudo = readPseudo2, fnv1a32 = fnv1a322, keyBit = keyBit2, elementKeys2 = elementKeys3, elementKeySignature = elementKeySignature2, classWords = classWords2, parentElement = parentElement2, previousElement = previousElement2, isTypeStart = isTypeStart2;
      const { parseAttributeSelector, matchParsedAttributeSelector } = typeof module === "object" && module.exports ? require_CssAttributeSelector() : globalThis.Merkava;
      const { matchesCssPseudo } = typeof module === "object" && module.exports ? require_CssPseudoMatcher() : globalThis.Merkava;
      const { splitSelectorList: splitSelectorList2, tokenizeSelectorSequence, isCombinator } = typeof module === "object" && module.exports ? require_CssSelectorList() : globalThis.Merkava;
      const scanner = typeof module === "object" && module.exports ? require_CssSelectorScanner() : globalThis.Merkava;
      const SELECTOR_LIST_CACHE = /* @__PURE__ */ new Map();
      const SELECTOR_LIST_CACHE_MAX = 2048;
      const COMPOUND_CACHE = /* @__PURE__ */ new Map();
      const COMPOUND_CACHE_MAX = 4096;
      const AwtsExports = {
        classWords: classWords2,
        compileCompoundSelector: compileCompoundSelector2,
        compileSelectorList: compileSelectorList2,
        elementKeySignature: elementKeySignature2,
        elementKeys: elementKeys3,
        matchesCompiledCompound: matchesCompiledCompound2,
        matchesCompiledSelectorList: matchesCompiledSelectorList2,
        matchesCompoundSelector: matchesCompoundSelector2,
        matchesCssSelector: matchesCssSelector3,
        matchesTokenizedSelectorList: matchesTokenizedSelectorList2
      };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var matchesCssSelector2;
    var matchesCompoundSelector;
    var matchesTokenizedSelectorList;
    var matchesCompiledSelectorList;
    var matchCompiledTokens;
    var matchCompiledRest;
    var matchesCompiledCompound;
    var compiledSelectorCallback;
    var compileSelectorList;
    var compileTokenArray;
    var compileCompoundSelector;
    var compileCompoundUncached;
    var readPseudo;
    var fnv1a32;
    var keyBit;
    var elementKeys2;
    var elementKeySignature;
    var classWords;
    var parentElement;
    var previousElement;
    var isTypeStart;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssRuleIndex.js
var require_CssRuleIndex = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssRuleIndex.js"(exports, module) {
    {
      let buildCssRuleIndex3 = function(rules) {
        const index = {
          byId: /* @__PURE__ */ Object.create(null),
          byClass: /* @__PURE__ */ Object.create(null),
          byTag: /* @__PURE__ */ Object.create(null),
          universal: []
        };
        for (const rule of rules || []) {
          if (!rule || typeof rule.selector !== "string") {
            index.universal.push(rule);
            continue;
          }
          let filed = false;
          for (const selector of splitSelectorList2(rule.selector)) {
            if (fileCssRule2(index, rule, selector)) filed = true;
          }
          if (!filed) index.universal.push(rule);
        }
        return index;
      }, fileCssRule2 = function(index, rule, selector) {
        const compound = rightmostCompound2(selector);
        if (!compound) return false;
        const key = bestKeyForCompound2(compound);
        if (!key) return false;
        const table = key.kind === "id" ? index.byId : key.kind === "class" ? index.byClass : index.byTag;
        let bucket = table[key.value];
        if (!bucket) {
          bucket = table[key.value] = [];
        } else if (bucket.indexOf(rule) >= 0) {
          return true;
        }
        bucket.push(rule);
        return true;
      }, bestKeyForCompound2 = function(compound) {
        let id = null, cls = null, tag = null;
        let i = 0;
        const n2 = compound.length;
        if (n2 > 0 && compound[0] === "*") {
          i = 1;
        } else if (n2 > 0 && isCompoundNameStart2(compound[0])) {
          const name = readSelectorIdentifier(compound, 0);
          if (!name.value) return null;
          tag = name.value.toLowerCase();
          i = name.end;
        }
        while (i < n2) {
          const ch = compound[i];
          if (ch === "#") {
            const name = readSelectorIdentifier(compound, i + 1);
            if (!name.value) return null;
            if (id === null) id = name.value;
            i = name.end;
          } else if (ch === ".") {
            const name = readSelectorIdentifier(compound, i + 1);
            if (!name.value) return null;
            if (cls === null) cls = name.value;
            i = name.end;
          } else if (ch === "[") {
            i = readBalancedSelector(compound, i, "[", "]").end;
          } else if (ch === ":") {
            i = skipCompoundPseudo2(compound, i);
            if (i < 0) return null;
          } else {
            return null;
          }
        }
        if (id !== null) return { kind: "id", value: id };
        if (cls !== null) return { kind: "class", value: cls };
        if (tag !== null) return { kind: "tag", value: tag };
        return null;
      }, rightmostCompound2 = function(selector) {
        const tokens = tokenizeSelectorSequence(selector);
        for (let i = tokens.length - 1; i >= 0; i--) {
          const token = tokens[i];
          if (token && !isCombinator(token)) return token;
        }
        return "";
      }, skipCompoundPseudo2 = function(compound, at) {
        let i = at + (compound[at + 1] === ":" ? 2 : 1);
        const name = readSelectorIdentifier(compound, i);
        if (!name.value) return -1;
        i = name.end;
        if (compound[i] === "(") i = readBalancedSelector(compound, i, "(", ")").end;
        return i;
      }, isCompoundNameStart2 = function(ch) {
        if (!ch) return false;
        const code = ch.codePointAt(0);
        return code >= 65 && code <= 90 || code >= 97 && code <= 122 || code >= 128 || ch === "_";
      }, cssRuleCandidates3 = function(index, node) {
        const out = [];
        const universal = index.universal;
        for (let i = 0; i < universal.length; i++) out.push(universal[i]);
        const id = node.id;
        if (id) {
          const bucket = index.byId[id];
          if (bucket) for (let i = 0; i < bucket.length; i++) out.push(bucket[i]);
        }
        const tag = node.localName;
        if (tag) {
          const bucket = index.byTag[tag];
          if (bucket) for (let i = 0; i < bucket.length; i++) out.push(bucket[i]);
        }
        const classAttr = node.className != null ? String(node.className) : String(node.attributes && node.attributes.class || "");
        if (classAttr) {
          const classes = classAttr.split(/\s+/);
          for (let i = 0; i < classes.length; i++) {
            const cls = classes[i];
            if (!cls) continue;
            const bucket = index.byClass[cls];
            if (bucket) for (let j = 0; j < bucket.length; j++) out.push(bucket[j]);
          }
        }
        return out;
      }, matchesIndexedCssRule3 = function(node, rule, index, elKeys) {
        return matchesCompiledSelectorList(node, compileSelectorList(rule.selector), elKeys);
      };
      buildCssRuleIndex2 = buildCssRuleIndex3, fileCssRule = fileCssRule2, bestKeyForCompound = bestKeyForCompound2, rightmostCompound = rightmostCompound2, skipCompoundPseudo = skipCompoundPseudo2, isCompoundNameStart = isCompoundNameStart2, cssRuleCandidates2 = cssRuleCandidates3, matchesIndexedCssRule2 = matchesIndexedCssRule3;
      const { splitSelectorList: splitSelectorList2, tokenizeSelectorSequence, isCombinator } = typeof module === "object" && module.exports ? require_CssSelectorList() : globalThis.Merkava;
      const { readSelectorIdentifier, readBalancedSelector } = typeof module === "object" && module.exports ? require_CssSelectorScanner() : globalThis.Merkava;
      const { compileSelectorList, matchesCompiledSelectorList } = typeof module === "object" && module.exports ? require_CssSelectorMatcher() : globalThis.Merkava;
      const AwtsExports = { buildCssRuleIndex: buildCssRuleIndex3, cssRuleCandidates: cssRuleCandidates3, matchesIndexedCssRule: matchesIndexedCssRule3 };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var buildCssRuleIndex2;
    var fileCssRule;
    var bestKeyForCompound;
    var rightmostCompound;
    var skipCompoundPseudo;
    var isCompoundNameStart;
    var cssRuleCandidates2;
    var matchesIndexedCssRule2;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssInheritedProperties.js
var require_CssInheritedProperties = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssInheritedProperties.js"(exports, module) {
    {
      let isInheritedCssProperty3 = function(name) {
        return String(name || "").startsWith("--") || INHERITED.has(String(name || "").toLowerCase());
      };
      isInheritedCssProperty2 = isInheritedCssProperty3;
      const INHERITED = /* @__PURE__ */ new Set([
        "color",
        "cursor",
        "direction",
        "font-family",
        "font-feature-settings",
        "font-kerning",
        "font-size",
        "font-stretch",
        "font-style",
        "font-variant",
        "font-weight",
        "letter-spacing",
        "line-height",
        "list-style-image",
        "list-style-position",
        "list-style-type",
        "quotes",
        "text-align",
        "text-indent",
        "text-transform",
        "visibility",
        "white-space",
        "word-spacing",
        "writing-mode"
      ]);
      const AwtsExports = { isInheritedCssProperty: isInheritedCssProperty3 };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var isInheritedCssProperty2;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssTransition.js
var require_CssTransition = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssTransition.js"(exports, module) {
    {
      let parseTime3 = function(text) {
        const t = String(text || "").trim().toLowerCase();
        if (t.endsWith("ms")) return parseFloat(t) || 0;
        if (t.endsWith("s")) return (parseFloat(t) || 0) * 1e3;
        return 0;
      }, parseTimingFunction3 = function(text) {
        const t = String(text || "").trim().toLowerCase();
        if (!t || t === "ease") return { params: EASE.slice(), type: "cubic-bezier" };
        if (t === "linear") return { params: [0, 0, 1, 1], type: "cubic-bezier" };
        if (t === "ease-in") return { params: EASE_IN.slice(), type: "cubic-bezier" };
        if (t === "ease-out") return { params: EASE_OUT.slice(), type: "cubic-bezier" };
        if (t === "ease-in-out") return { params: EASE_IN_OUT.slice(), type: "cubic-bezier" };
        if (t === "step-start") return { position: "start", steps: 1, type: "steps" };
        if (t === "step-end") return { position: "end", steps: 1, type: "steps" };
        let m = t.match(/^cubic-bezier\(\s*([^)]+)\)$/);
        if (m) {
          const v = m[1].split(",").map((s) => parseFloat(s.trim()));
          if (v.length === 4 && v.every(Number.isFinite)) return { params: v, type: "cubic-bezier" };
          return { params: EASE.slice(), type: "cubic-bezier" };
        }
        m = t.match(/^steps\(\s*(\d+)\s*(?:,\s*(start|end|jump-start|jump-end|jump-none|jump-both))?\s*\)$/);
        if (m) {
          const steps = Math.max(1, parseInt(m[1], 10) || 1);
          const position = m[2] === "start" || m[2] === "jump-start" ? "start" : "end";
          return { position, steps, type: "steps" };
        }
        return { params: EASE.slice(), type: "cubic-bezier" };
      }, cubicBezierY2 = function(x1, y1, x2, y2, x) {
        const cx = 3 * x1;
        const bx = 3 * (x2 - x1) - cx;
        const ax = 1 - cx - bx;
        const cy = 3 * y1;
        const by = 3 * (y2 - y1) - cy;
        const ay = 1 - cy - by;
        const sampleX = (t2) => ((ax * t2 + bx) * t2 + cx) * t2;
        const sampleY = (t2) => ((ay * t2 + by) * t2 + cy) * t2;
        const sampleDX = (t2) => (3 * ax * t2 + 2 * bx) * t2 + cx;
        let t = x;
        for (let i = 0; i < 8; i += 1) {
          const err = sampleX(t) - x;
          if (Math.abs(err) < 1e-6) break;
          const d = sampleDX(t);
          if (Math.abs(d) < 1e-6) break;
          t -= err / d;
        }
        return sampleY(t);
      }, timingProgress3 = function(tf, x) {
        const clamped = Math.min(1, Math.max(0, x));
        if (tf.type === "steps") {
          const { steps, position } = tf;
          if (position === "start") return Math.min(1, (Math.floor(clamped * steps) + 1) / steps);
          return Math.floor(clamped * steps) / steps;
        }
        const [x1, y1, x2, y2] = tf.params;
        return cubicBezierY2(x1, y1, x2, y2, clamped);
      }, splitTransitionList2 = function(value) {
        const parts = [];
        let start = 0;
        let depth = 0;
        const text = String(value || "");
        for (let at = 0; at <= text.length; at += 1) {
          const ch = text[at];
          if (ch === "(") depth += 1;
          if (ch === ")") depth = Math.max(0, depth - 1);
          if (at === text.length || ch === "," && depth === 0) {
            const part = text.slice(start, at).trim();
            if (part) parts.push(part);
            start = at + 1;
          }
        }
        return parts;
      }, isTimingToken3 = function(token) {
        const t = token.toLowerCase();
        return TIMING_KEYWORDS.has(t) || t.startsWith("cubic-bezier(") || t.startsWith("steps(");
      }, parseTransition3 = function(value) {
        const text = String(value || "").trim();
        if (!text || text.toLowerCase() === "none") return [];
        const out = [];
        for (const item of splitTransitionList2(text)) {
          const tokens = item.split(/\s+/).filter(Boolean);
          let property = "all";
          let duration = 0;
          let delay = 0;
          let timing = parseTimingFunction3("ease");
          let sawDuration = false;
          for (const token of tokens) {
            if (isTimingToken3(token)) {
              timing = parseTimingFunction3(token);
              continue;
            }
            if (/^[\d.]+m?s$/i.test(token)) {
              const ms = parseTime3(token);
              if (!sawDuration) {
                duration = ms;
                sawDuration = true;
              } else delay = ms;
              continue;
            }
            property = token.toLowerCase();
          }
          out.push(Object.freeze({ delay, duration, property, timing }));
        }
        return out;
      }, splitNumberUnit2 = function(text) {
        const m = String(text || "").trim().match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)([a-zA-Z%]*)$/);
        if (!m) return null;
        return { number: parseFloat(m[1]), unit: m[2] || "" };
      }, parseRgbColor2 = function(text) {
        const t = String(text || "").trim().toLowerCase();
        let m = t.match(/^#([0-9a-f]{3})$/);
        if (m) {
          const h = m[1];
          return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16), 1];
        }
        m = t.match(/^#([0-9a-f]{6})$/);
        if (m) {
          const h = m[1];
          return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
        }
        m = t.match(/^#([0-9a-f]{8})$/);
        if (m) {
          const h = m[1];
          return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), parseInt(h.slice(6, 8), 16) / 255];
        }
        m = t.match(/^rgba?\(\s*([^)]+)\)$/);
        if (m) {
          const parts = m[1].split(",").map((s) => s.trim());
          const channel = (v) => v.endsWith("%") ? parseFloat(v) / 100 * 255 : parseFloat(v);
          return [
            channel(parts[0] || "0"),
            channel(parts[1] || "0"),
            channel(parts[2] || "0"),
            parts[3] == null ? 1 : parseFloat(parts[3])
          ];
        }
        return null;
      }, colorToCss2 = function(rgba) {
        const r = Math.round(Math.min(255, Math.max(0, rgba[0])));
        const g = Math.round(Math.min(255, Math.max(0, rgba[1])));
        const b = Math.round(Math.min(255, Math.max(0, rgba[2])));
        const a = Math.min(1, Math.max(0, rgba[3]));
        if (a >= 1) return `rgb(${r}, ${g}, ${b})`;
        return `rgba(${r}, ${g}, ${b}, ${Math.round(a * 1e3) / 1e3})`;
      }, interpolateValue3 = function(from, to, progress, colorResolver) {
        const f = String(from == null ? "" : from).trim();
        const t = String(to == null ? "" : to).trim();
        if (f === t) return t;
        const fn = splitNumberUnit2(f);
        const tn = splitNumberUnit2(t);
        if (fn && tn && fn.unit === tn.unit) {
          const v = fn.number + (tn.number - fn.number) * progress;
          const rounded = Math.round(v * 1e4) / 1e4;
          return `${rounded}${fn.unit}`;
        }
        const fc = parseRgbColor2(f) || (colorResolver ? parseRgbColor2(colorResolver(f)) : null);
        const tc = parseRgbColor2(t) || (colorResolver ? parseRgbColor2(colorResolver(t)) : null);
        if (fc && tc) {
          return colorToCss2([
            fc[0] + (tc[0] - fc[0]) * progress,
            fc[1] + (tc[1] - fc[1]) * progress,
            fc[2] + (tc[2] - fc[2]) * progress,
            fc[3] + (tc[3] - fc[3]) * progress
          ]);
        }
        return progress < 0.5 ? f : t;
      }, createTransition2 = function(from, to, options = {}) {
        return {
          delay: Number(options.delay) || 0,
          done: false,
          duration: Math.max(0, Number(options.duration) || 0),
          from: String(from == null ? "" : from),
          startedAt: null,
          timing: options.timing || parseTimingFunction3("ease"),
          to: String(to == null ? "" : to)
        };
      }, tickTransition2 = function(state, nowMs, colorResolver) {
        if (state.done) return { done: true, value: state.to };
        if (state.startedAt == null) state.startedAt = Number(nowMs) || 0;
        if (state.duration <= 0) {
          state.done = true;
          return { done: true, value: state.to };
        }
        const elapsed = (Number(nowMs) || 0) - state.startedAt - state.delay;
        if (elapsed < 0) return { done: false, value: state.from };
        if (elapsed >= state.duration) {
          state.done = true;
          return { done: true, value: state.to };
        }
        const progress = timingProgress3(state.timing, elapsed / state.duration);
        return { done: false, value: interpolateValue3(state.from, state.to, progress, colorResolver) };
      }, transitionForProperty3 = function(descriptors, propertyName) {
        const name = String(propertyName || "").toLowerCase();
        let winner = null;
        for (const d of descriptors || []) {
          if (d.property === "all" || d.property === name) winner = d;
        }
        return winner;
      };
      parseTime2 = parseTime3, parseTimingFunction2 = parseTimingFunction3, cubicBezierY = cubicBezierY2, timingProgress2 = timingProgress3, splitTransitionList = splitTransitionList2, isTimingToken2 = isTimingToken3, parseTransition2 = parseTransition3, splitNumberUnit = splitNumberUnit2, parseRgbColor = parseRgbColor2, colorToCss = colorToCss2, interpolateValue2 = interpolateValue3, createTransition = createTransition2, tickTransition = tickTransition2, transitionForProperty2 = transitionForProperty3;
      const EASE = [0.25, 0.1, 0.25, 1];
      const EASE_IN = [0.42, 0, 1, 1];
      const EASE_OUT = [0, 0, 0.58, 1];
      const EASE_IN_OUT = [0.42, 0, 0.58, 1];
      const TIMING_KEYWORDS = /* @__PURE__ */ new Set(["linear", "ease", "ease-in", "ease-out", "ease-in-out", "step-start", "step-end"]);
      const AwtsExports = {
        createTransition: createTransition2,
        interpolateValue: interpolateValue3,
        parseTime: parseTime3,
        parseTimingFunction: parseTimingFunction3,
        parseTransition: parseTransition3,
        tickTransition: tickTransition2,
        timingProgress: timingProgress3,
        transitionForProperty: transitionForProperty3
      };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var parseTime2;
    var parseTimingFunction2;
    var cubicBezierY;
    var timingProgress2;
    var splitTransitionList;
    var isTimingToken2;
    var parseTransition2;
    var splitNumberUnit;
    var parseRgbColor;
    var colorToCss;
    var interpolateValue2;
    var createTransition;
    var tickTransition;
    var transitionForProperty2;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssTransform.js
var require_CssTransform = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssTransform.js"(exports, module) {
    {
      let parseTransform4 = function(value) {
        const text = String(value || "").trim();
        if (!text || text.toLowerCase() === "none") return [];
        const out = [];
        const re = /([a-zA-Z][a-zA-Z0-9]*)\s*\(/g;
        let match;
        while (match = re.exec(text)) {
          const name = match[1].toLowerCase();
          const openAt = match.index + match[0].length - 1;
          const closeAt = balancedParenEnd3(text, openAt);
          if (closeAt < 0) break;
          const args = splitTopLevelArgs2(text.slice(openAt + 1, closeAt));
          out.push(Object.freeze({ args, name }));
          re.lastIndex = closeAt + 1;
        }
        return out;
      }, balancedParenEnd3 = function(text, openAt) {
        let depth = 0;
        for (let at = openAt; at < text.length; at += 1) {
          if (text[at] === "(") depth += 1;
          else if (text[at] === ")") {
            depth -= 1;
            if (depth === 0) return at;
          }
        }
        return -1;
      }, splitTopLevelArgs2 = function(text) {
        const parts = [];
        let start = 0;
        let depth = 0;
        for (let at = 0; at <= text.length; at += 1) {
          const ch = text[at];
          if (ch === "(") depth += 1;
          if (ch === ")") depth = Math.max(0, depth - 1);
          if (depth === 0 && (at === text.length || ch === "," || ch !== void 0 && /\s/.test(ch))) {
            const part = text.slice(start, at).trim();
            if (part) parts.push(part);
            start = at + 1;
          }
        }
        return parts;
      }, lengthToPx3 = function(text, percentBase = 0, fontSize = 16) {
        const t = String(text || "").trim().toLowerCase();
        if (!t) return 0;
        if (t.endsWith("%")) return (parseFloat(t) || 0) / 100 * percentBase;
        if (t.endsWith("px")) return parseFloat(t) || 0;
        if (t.endsWith("em") || t.endsWith("rem")) return (parseFloat(t) || 0) * fontSize;
        if (t.endsWith("pt")) return (parseFloat(t) || 0) * 96 / 72;
        const n2 = parseFloat(t);
        return Number.isFinite(n2) ? n2 : 0;
      }, angleToRad4 = function(text) {
        const t = String(text || "").trim().toLowerCase();
        if (t.endsWith("deg")) return (parseFloat(t) || 0) * Math.PI / 180;
        if (t.endsWith("grad")) return (parseFloat(t) || 0) * Math.PI / 200;
        if (t.endsWith("turn")) return (parseFloat(t) || 0) * Math.PI * 2;
        if (t.endsWith("rad")) return parseFloat(t) || 0;
        const n2 = parseFloat(t);
        return Number.isFinite(n2) ? n2 : 0;
      }, identityMatrix3 = function() {
        return [1, 0, 0, 1, 0, 0];
      }, multiplyMatrix4 = function(m1, m2) {
        const [a1, b1, c1, d1, e1, f1] = m1;
        const [a2, b2, c2, d2, e2, f2] = m2;
        return [
          a1 * a2 + c1 * b2,
          b1 * a2 + d1 * b2,
          a1 * c2 + c1 * d2,
          b1 * c2 + d1 * d2,
          a1 * e2 + c1 * f2 + e1,
          b1 * e2 + d1 * f2 + f1
        ];
      }, translateMatrix2 = function(tx, ty) {
        return [1, 0, 0, 1, tx, ty];
      }, scaleMatrix2 = function(sx, sy) {
        return [sx, 0, 0, sy, 0, 0];
      }, rotateMatrix2 = function(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return [c, s, -s, c, 0, 0];
      }, skewMatrix2 = function(axRad, ayRad) {
        return [1, Math.tan(ayRad), Math.tan(axRad), 1, 0, 0];
      }, functionToMatrix2 = function(fn, refBox = {}) {
        const width = Number(refBox.width) || 0;
        const height = Number(refBox.height) || 0;
        const fontSize = Number(refBox.fontSize) || 16;
        const len = (t, base) => lengthToPx3(t, base, fontSize);
        switch (fn.name) {
          case "translate":
            return translateMatrix2(len(fn.args[0], width), len(fn.args[1], height));
          case "translatex":
            return translateMatrix2(len(fn.args[0], width), 0);
          case "translatey":
            return translateMatrix2(0, len(fn.args[0], height));
          case "translate3d":
            return translateMatrix2(len(fn.args[0], width), len(fn.args[1], height));
          case "rotate":
            return rotateMatrix2(angleToRad4(fn.args[0]));
          case "scale": {
            const sx = parseFloat(fn.args[0]);
            const sy = fn.args.length > 1 ? parseFloat(fn.args[1]) : sx;
            return scaleMatrix2(Number.isFinite(sx) ? sx : 1, Number.isFinite(sy) ? sy : 1);
          }
          case "scalex":
            return scaleMatrix2(parseFloat(fn.args[0]) || 1, 1);
          case "scaley":
            return scaleMatrix2(1, parseFloat(fn.args[0]) || 1);
          case "scale3d":
            return scaleMatrix2(parseFloat(fn.args[0]) || 1, parseFloat(fn.args[1]) || 1);
          case "skew":
            return skewMatrix2(angleToRad4(fn.args[0]), angleToRad4(fn.args[1] || "0"));
          case "skewx":
            return skewMatrix2(angleToRad4(fn.args[0]), 0);
          case "skewy":
            return skewMatrix2(0, angleToRad4(fn.args[0]));
          case "matrix": {
            const v = fn.args.map((a) => parseFloat(a));
            if (v.length < 6 || v.some((n2) => !Number.isFinite(n2))) return identityMatrix3();
            return [v[0], v[1], v[2], v[3], v[4], v[5]];
          }
          default:
            return identityMatrix3();
        }
      }, parseTransformOrigin3 = function(value, refBox = {}) {
        const width = Number(refBox.width) || 0;
        const height = Number(refBox.height) || 0;
        const fontSize = Number(refBox.fontSize) || 16;
        const parts = String(value || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
        const keywordX = { left: 0, center: width / 2, right: width };
        const keywordY = { top: 0, center: height / 2, bottom: height };
        const resolveX = (t) => t in keywordX ? keywordX[t] : lengthToPx3(t, width, fontSize);
        const resolveY = (t) => t in keywordY ? keywordY[t] : lengthToPx3(t, height, fontSize);
        if (!parts.length) return { x: width / 2, y: height / 2 };
        if (parts.length === 1) {
          const t = parts[0];
          if (t === "left" || t === "right") return { x: resolveX(t), y: height / 2 };
          if (t === "top" || t === "bottom") return { x: width / 2, y: resolveY(t) };
          return { x: resolveX(t), y: height / 2 };
        }
        const [a, b] = parts;
        const aVert = a === "top" || a === "bottom";
        const bVert = b === "top" || b === "bottom";
        const aHoriz = a === "left" || a === "right";
        const bHoriz = b === "left" || b === "right";
        if (aVert && !bVert) return { x: resolveX(b), y: resolveY(a) };
        if (bVert && !aVert) return { x: resolveX(a), y: resolveY(b) };
        if (aHoriz && !bHoriz) return { x: resolveX(a), y: resolveY(b) };
        if (bHoriz && !aHoriz) return { x: resolveX(b), y: resolveY(a) };
        return { x: resolveX(a), y: resolveY(b) };
      }, computeTransformMatrix3 = function(style = {}, refBox = {}) {
        const list = parseTransform4(style.transform);
        if (!list.length) return identityMatrix3();
        let m = identityMatrix3();
        for (const fn of list) m = multiplyMatrix4(m, functionToMatrix2(fn, refBox));
        const origin = parseTransformOrigin3(style["transform-origin"], refBox);
        const ox = origin.x;
        const oy = origin.y;
        return multiplyMatrix4(
          translateMatrix2(ox, oy),
          multiplyMatrix4(m, translateMatrix2(-ox, -oy))
        );
      }, applyMatrixToPoint2 = function(m, x, y) {
        return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
      }, transformRect3 = function(m, x, y, width, height) {
        const corners = [
          applyMatrixToPoint2(m, x, y),
          applyMatrixToPoint2(m, x + width, y),
          applyMatrixToPoint2(m, x, y + height),
          applyMatrixToPoint2(m, x + width, y + height)
        ];
        const xs = corners.map((p) => p[0]);
        const ys = corners.map((p) => p[1]);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        return {
          height: Math.max(...ys) - minY,
          width: Math.max(...xs) - minX,
          x: minX,
          y: minY
        };
      }, matrixToCss2 = function(m) {
        const r = (n2) => Math.round(n2 * 1e5) / 1e5;
        return `matrix(${r(m[0])}, ${r(m[1])}, ${r(m[2])}, ${r(m[3])}, ${r(m[4])}, ${r(m[5])})`;
      };
      parseTransform3 = parseTransform4, balancedParenEnd2 = balancedParenEnd3, splitTopLevelArgs = splitTopLevelArgs2, lengthToPx2 = lengthToPx3, angleToRad3 = angleToRad4, identityMatrix2 = identityMatrix3, multiplyMatrix3 = multiplyMatrix4, translateMatrix = translateMatrix2, scaleMatrix = scaleMatrix2, rotateMatrix = rotateMatrix2, skewMatrix = skewMatrix2, functionToMatrix = functionToMatrix2, parseTransformOrigin2 = parseTransformOrigin3, computeTransformMatrix2 = computeTransformMatrix3, applyMatrixToPoint = applyMatrixToPoint2, transformRect2 = transformRect3, matrixToCss = matrixToCss2;
      const AwtsExports = {
        angleToRad: angleToRad4,
        applyMatrixToPoint: applyMatrixToPoint2,
        computeTransformMatrix: computeTransformMatrix3,
        functionToMatrix: functionToMatrix2,
        identityMatrix: identityMatrix3,
        lengthToPx: lengthToPx3,
        matrixToCss: matrixToCss2,
        multiplyMatrix: multiplyMatrix4,
        parseTransform: parseTransform4,
        parseTransformOrigin: parseTransformOrigin3,
        transformRect: transformRect3
      };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var parseTransform3;
    var balancedParenEnd2;
    var splitTopLevelArgs;
    var lengthToPx2;
    var angleToRad3;
    var identityMatrix2;
    var multiplyMatrix3;
    var translateMatrix;
    var scaleMatrix;
    var rotateMatrix;
    var skewMatrix;
    var functionToMatrix;
    var parseTransformOrigin2;
    var computeTransformMatrix2;
    var applyMatrixToPoint;
    var transformRect2;
    var matrixToCss;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssPseudoElements.js
var require_CssPseudoElements = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssPseudoElements.js"(exports, module) {
    {
      let isPseudoElementName2 = function(name) {
        return SUPPORTED.has(String(name || "").toLowerCase());
      }, splitPseudoSelector2 = function(selector) {
        const text = String(selector || "").trim();
        const m = text.match(/::([a-zA-Z-]+)\s*$/);
        if (!m) return { base: text, pseudo: "" };
        const name = m[1].toLowerCase();
        if (!isPseudoElementName2(name)) return { base: text, pseudo: "" };
        return { base: text.slice(0, m.index).trim() || "*", pseudo: name };
      }, cachedPseudoSplit2 = function(rule) {
        let s = PSEUDO_SPLIT_CACHE.get(rule);
        if (!s) {
          s = splitPseudoSelector2(rule.selector);
          PSEUDO_SPLIT_CACHE.set(rule, s);
        }
        return s;
      }, pseudoRuleIndex2 = function(rules) {
        let idx = PSEUDO_RULE_INDEX.get(rules);
        if (!idx) {
          idx = /* @__PURE__ */ new Map();
          for (const rule of rules || []) {
            const split = cachedPseudoSplit2(rule);
            if (!split.pseudo) continue;
            if (!idx.has(split.pseudo)) idx.set(split.pseudo, []);
            idx.get(split.pseudo).push(rule);
          }
          PSEUDO_RULE_INDEX.set(rules, idx);
        }
        return idx;
      }, unquoteString2 = function(text) {
        const t = String(text || "").trim();
        if (t.length >= 2 && (t[0] === '"' && t[t.length - 1] === '"' || t[0] === "'" && t[t.length - 1] === "'")) {
          return t.slice(1, -1).replace(/\\(.)/g, "$1");
        }
        return null;
      }, resolveContent3 = function(value, element) {
        const text = String(value == null ? "normal" : value).trim();
        if (!text || text.toLowerCase() === "none" || text.toLowerCase() === "normal") return null;
        const parts = [];
        let start = 0;
        let depth = 0;
        let inStr = null;
        for (let at = 0; at <= text.length; at += 1) {
          const ch = text[at];
          if (inStr) {
            if (ch === "\\") {
              at += 1;
              continue;
            }
            if (ch === inStr) inStr = null;
            continue;
          }
          if (ch === '"' || ch === "'") {
            inStr = ch;
            continue;
          }
          if (ch === "(") depth += 1;
          if (ch === ")") depth = Math.max(0, depth - 1);
          if ((at === text.length || /\s/.test(ch) && depth === 0) && !inStr) {
            const part = text.slice(start, at).trim();
            if (part) parts.push(part);
            start = at + 1;
          }
        }
        let out = "";
        for (const part of parts) {
          const str = unquoteString2(part);
          if (str != null) {
            out += str;
            continue;
          }
          const low = part.toLowerCase();
          if (low === "open-quote") {
            out += "\u201C";
            continue;
          }
          if (low === "close-quote") {
            out += "\u201D";
            continue;
          }
          if (low === "no-open-quote" || low === "no-close-quote") continue;
          let m = part.match(/^attr\(\s*([a-zA-Z_:][a-zA-Z0-9_:.-]*)\s*\)$/i);
          if (m) {
            out += String(element?.getAttribute?.(m[1]) ?? "");
            continue;
          }
          m = part.match(/^counter\(\s*([a-zA-Z_-][a-zA-Z0-9_-]*)\s*(?:,\s*[a-zA-Z-]+)?\s*\)$/i);
          if (m) {
            out += String(readCounter2(element, m[1]));
            continue;
          }
          m = part.match(/^counters\(\s*([a-zA-Z_-][a-zA-Z0-9_-]*)\s*,\s*(["'])(.*?)\2\s*\)$/i);
          if (m) {
            out += String(readCounter2(element, m[1]));
            continue;
          }
          if (/^url\(/i.test(part)) continue;
        }
        return out;
      }, readCounter2 = function(element, name) {
        const counters = element?.ownerDocument?.__merkavaCounters;
        if (counters && Object.prototype.hasOwnProperty.call(counters, name)) return counters[name];
        return 0;
      }, parseCounterList2 = function(text) {
        const tokens = String(text || "").split(/\s+/).filter(Boolean);
        const out = [];
        for (let i = 0; i < tokens.length; i += 1) {
          const name = tokens[i];
          if (!/^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(name)) continue;
          let value = null;
          if (i + 1 < tokens.length && /^-?\d+$/.test(tokens[i + 1])) {
            value = parseInt(tokens[i + 1], 10);
            i += 1;
          }
          out.push({ name, value });
        }
        return out;
      }, applyCounters3 = function(element, style = {}) {
        const doc = element?.ownerDocument;
        if (!doc) return;
        doc.__merkavaCounters = doc.__merkavaCounters || {};
        const counters = doc.__merkavaCounters;
        const reset = String(style["counter-reset"] || "").trim();
        if (reset && reset.toLowerCase() !== "none") {
          for (const { name, value } of parseCounterList2(reset)) {
            counters[name] = value == null ? 0 : value;
          }
        }
        const increment = String(style["counter-increment"] || "").trim();
        if (increment && increment.toLowerCase() !== "none") {
          for (const { name, value } of parseCounterList2(increment)) {
            counters[name] = (counters[name] || 0) + (value == null ? 1 : value);
          }
        }
      }, matchPseudoRules4 = function(element, pseudoName, rules) {
        const name = String(pseudoName || "").toLowerCase();
        if (!isPseudoElementName2(name)) return [];
        const candidates = pseudoRuleIndex2(rules).get(name) || [];
        const out = [];
        for (const rule of candidates) {
          const split = cachedPseudoSplit2(rule);
          let matches = false;
          try {
            matches = split.base === "*" || matchesCssSelector2(element, split.base);
          } catch (err) {
            matches = false;
          }
          if (matches) out.push(rule);
        }
        return out;
      }, generatedBoxSpec2 = function(element, pseudoName, pseudoStyle = {}) {
        const name = String(pseudoName || "").toLowerCase();
        if (!BOX_GENERATING.has(name)) return null;
        const content = resolveContent3(pseudoStyle.content, element);
        if (content == null) return null;
        const display = String(pseudoStyle.display || "inline").trim().toLowerCase();
        return Object.freeze({
          content,
          display,
          pseudo: name,
          style: Object.freeze({ ...pseudoStyle })
        });
      }, generatedBoxesFor3 = function(element, rules, cascadeFor) {
        const out = [];
        for (const name of ["before", "after", "marker"]) {
          const matched = matchPseudoRules4(element, name, rules);
          if (!matched.length) continue;
          const cascaded = cascadeFor ? cascadeFor(element, matched) : {};
          const spec = generatedBoxSpec2(element, name, cascaded);
          if (spec) out.push(spec);
        }
        return out;
      };
      isPseudoElementName = isPseudoElementName2, splitPseudoSelector = splitPseudoSelector2, cachedPseudoSplit = cachedPseudoSplit2, pseudoRuleIndex = pseudoRuleIndex2, unquoteString = unquoteString2, resolveContent2 = resolveContent3, readCounter = readCounter2, parseCounterList = parseCounterList2, applyCounters2 = applyCounters3, matchPseudoRules3 = matchPseudoRules4, generatedBoxSpec = generatedBoxSpec2, generatedBoxesFor2 = generatedBoxesFor3;
      const { matchesCssSelector: matchesCssSelector2 } = typeof module === "object" && module.exports ? require_CssSelectorMatcher() : globalThis.Merkava;
      const SUPPORTED = /* @__PURE__ */ new Set(["before", "after", "first-line", "first-letter", "placeholder", "selection", "marker"]);
      const BOX_GENERATING = /* @__PURE__ */ new Set(["before", "after", "marker"]);
      const PSEUDO_SPLIT_CACHE = /* @__PURE__ */ new WeakMap();
      const PSEUDO_RULE_INDEX = /* @__PURE__ */ new WeakMap();
      const AwtsExports = {
        applyCounters: applyCounters3,
        generatedBoxSpec: generatedBoxSpec2,
        generatedBoxesFor: generatedBoxesFor3,
        isPseudoElementName: isPseudoElementName2,
        matchPseudoRules: matchPseudoRules4,
        resolveContent: resolveContent3,
        splitPseudoSelector: splitPseudoSelector2
      };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var isPseudoElementName;
    var splitPseudoSelector;
    var cachedPseudoSplit;
    var pseudoRuleIndex;
    var unquoteString;
    var resolveContent2;
    var readCounter;
    var parseCounterList;
    var applyCounters2;
    var matchPseudoRules3;
    var generatedBoxSpec;
    var generatedBoxesFor2;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeGraph.js
var require_RuntimeGraph = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeGraph.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.RuntimeGraph = factory().RuntimeGraph;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      class RuntimeGraph {
        constructor() {
          this.nodes = /* @__PURE__ */ new Map();
          this.edges = [];
          this.events = [];
        }
        node(id, data = {}) {
          const next = { ...this.nodes.get(id) || {}, ...data, id, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
          this.nodes.set(id, next);
          return next;
        }
        edge(from, to, kind = "depends") {
          this.edges.push({ from, to, kind, at: (/* @__PURE__ */ new Date()).toISOString() });
          return this;
        }
        event(kind, data = {}) {
          this.events.push({ kind, data, at: (/* @__PURE__ */ new Date()).toISOString() });
          return this;
        }
        toJSON() {
          return { nodes: Array.from(this.nodes.values()), edges: this.edges, events: this.events };
        }
      }
      return { RuntimeGraph };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAddress.js
var require_RuntimeAddress = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAddress.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.RuntimeAddress = factory().RuntimeAddress;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      class RuntimeAddress {
        constructor({ origin = "http://127.0.0.1:8080/", base = "/" } = {}) {
          this.origin = new URL(origin).href;
          this.base = new URL(base, this.origin).href;
        }
        resolve(specifier, from = this.base) {
          const raw = String(specifier || "");
          if (!raw) return raw;
          if (/^\/\//.test(raw)) return new URL("https:" + raw).pathname;
          if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return new URL(raw).pathname;
          return new URL(raw, new URL(from, this.origin)).pathname;
        }
        fileKey(specifier, from = this.base, files = {}) {
          const resolved = this.resolve(specifier, from);
          const aliased = cdnThreeAlias(specifier) || cdnThreeAlias(resolved) || resolved;
          const tries = [aliased, aliased.replace(/^\//, ""), aliased + ".js", aliased + "/index.js"];
          return tries.find((item) => Object.prototype.hasOwnProperty.call(files, item)) || aliased;
        }
      }
      function cdnThreeAlias(specifier = "") {
        const clean = String(specifier || "");
        if (/three\.js@[^/]+\/build\/three\.js$/i.test(clean)) return "/geelooy/games/scripts/build/three.module.js";
        if (/three\.js@[^/]+\/examples\/js\/controls\/OrbitControls\.js$/i.test(clean)) return "/geelooy/games/scripts/jsm/controls/OrbitControls.js";
        if (/three\.js@[^/]+\/examples\/js\/loaders\/GLTFLoader\.js$/i.test(clean)) return "/geelooy/games/scripts/jsm/loaders/GLTFLoader.js";
        if (/three\.js@[^/]+\/examples\/js\/loaders\/RGBELoader\.js$/i.test(clean)) return "/geelooy/games/scripts/jsm/loaders/RGBELoader.js";
        return null;
      }
      return { RuntimeAddress };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/ImportResolver.js
var require_ImportResolver = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/ImportResolver.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory(require_RuntimeAddress());
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.ImportResolver = factory(root.Merkava).ImportResolver;
      }
    })(typeof self !== "undefined" ? self : exports, function(addressMod) {
      const RuntimeAddress = addressMod.RuntimeAddress;
      class ImportResolver {
        constructor({ files = {}, graph = null, origin, base } = {}) {
          this.files = files;
          this.graph = graph;
          this.address = new RuntimeAddress({ origin, base });
          this.warnings = [];
        }
        importsOf(source) {
          return this.importsDetailed(source).map((x) => x.specifier);
        }
        importsDetailed(source, from = "") {
          const refs = [];
          const add = (specifier, clause = "", kind = "static") => refs.push({ specifier, clause: clause.trim(), kind, resolved: this.resolve(from, specifier), local: localName(specifier, refs.length), from });
          for (const m of source.matchAll(/\bimport\s+([^'"]*?)\s*from\s*['"]([^'"]+)['"]/g)) add(m[2], m[1], "static");
          for (const m of source.matchAll(/\bimport\s*['"]([^'"]+)['"]/g)) add(m[1], "", "side-effect");
          for (const m of source.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) add(m[1], "", "dynamic");
          for (const m of source.matchAll(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) add(m[1], "", "require");
          return refs;
        }
        resolve(from, spec) {
          if (!spec.startsWith(".") && !spec.startsWith("/") && !/^[a-z]+:/i.test(spec)) return "package:" + spec;
          return this.address.fileKey(spec, from || "/", this.files);
        }
        graphFrom(entry) {
          const visited = /* @__PURE__ */ new Set(), unresolved = [];
          const walk2 = (file) => {
            if (visited.has(file)) return;
            visited.add(file);
            this.graph?.node?.(file, { kind: "module" });
            for (const item of this.importsDetailed(this.files[file] || "", file)) {
              this.graph?.edge?.(file, item.resolved, "imports");
              if (this.files[item.resolved]) walk2(item.resolved);
              else unresolved.push(item);
            }
          };
          walk2(entry);
          return { entry, modules: Array.from(visited), unresolved };
        }
      }
      function localName(spec, i) {
        return "__merkava_module_" + i + "_" + String(spec).replace(/\W+/g, "_");
      }
      return { ImportResolver };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/HTMLAssembler.js
var require_HTMLAssembler = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/HTMLAssembler.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory(require_RuntimeAddress());
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.HTMLAssembler = factory(root.Merkava).HTMLAssembler;
      }
    })(typeof self !== "undefined" ? self : exports, function(addressMod) {
      const RuntimeAddress = addressMod.RuntimeAddress;
      class HTMLAssembler {
        constructor({ files = {}, graph = null, origin, base } = {}) {
          this.files = files;
          this.graph = graph;
          this.address = new RuntimeAddress({ origin, base });
        }
        assemble(entry) {
          const html = this.files[entry] || "";
          const scripts = [], styles = [], assets = [], executionPlan = [], warnings = [], importMaps = [];
          this.graph?.node?.(entry, { kind: "html" });
          for (const { attrs, body } of scriptTags(html)) {
            const scriptType = normalizeScriptType(attrs.type);
            const inline = !attrs.src;
            const item = { kind: "script", type: scriptType, src: attrs.src || null, inline, code: inline ? body : "", from: entry, attrs };
            if (attrs.src) item.resolved = this.address.fileKey(attrs.src, entry, this.files);
            scripts.push(item);
            if (scriptType === "importmap") {
              importMaps.push({ from: entry, code: body, parsed: parseImportMap(body, warnings) });
              this.graph?.edge?.(entry, "inline-importmap:" + importMaps.length, "importmap");
              continue;
            }
            if (scriptType === "data") {
              assets.push({ kind: "script-data", from: entry, type: attrs.type || "", code: body });
              continue;
            }
            executionPlan.push(item);
            this.graph?.edge?.(entry, item.resolved || "inline-script:" + scripts.length, item.type + "-script");
          }
          for (const attrs of linkTags(html)) {
            if (String(attrs.rel || "").toLowerCase() !== "stylesheet") continue;
            const href = this.address.fileKey(attrs.href, entry, this.files);
            styles.push({ href, specifier: attrs.href, from: entry });
            this.graph?.edge?.(entry, href, "stylesheet");
          }
          for (const item of [...styles]) if (!this.files[item.href]) warnings.push({ kind: "missing-asset", href: item.href, from: entry });
          return { entry, scripts, styles, assets, importMaps, executionPlan, warnings };
        }
      }
      function normalizeScriptType(type = "") {
        const clean = String(type || "").trim().toLowerCase();
        if (!clean || clean === "text/javascript" || clean === "application/javascript") return "classic";
        if (clean === "module") return "module";
        if (clean === "importmap") return "importmap";
        if (clean.includes("json") || clean.includes("ld+json") || clean.includes("template")) return "data";
        return "data";
      }
      function parseImportMap(body = "", warnings = []) {
        try {
          return JSON.parse(body || "{}");
        } catch (error) {
          warnings.push({ kind: "invalid-importmap", message: error.message });
          return {};
        }
      }
      function scriptTags(html) {
        const out = [];
        const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
        for (const m of String(html).matchAll(re)) out.push({ attrs: attrsOf(m[1] || ""), body: m[2] || "" });
        return out;
      }
      function linkTags(html) {
        const out = [];
        const re = /<link\b([^>]*)\/?\s*>/gi;
        for (const m of String(html).matchAll(re)) out.push(attrsOf(m[1] || ""));
        return out;
      }
      function attrsOf(raw) {
        const out = {};
        const re = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
        for (const m of raw.matchAll(re)) out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
        return out;
      }
      return { HTMLAssembler };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/CSSAssembler.js
var require_CSSAssembler = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/CSSAssembler.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory(require_RuntimeAddress());
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.CSSAssembler = factory(root.Merkava).CSSAssembler;
      }
    })(typeof self !== "undefined" ? self : exports, function(addressMod) {
      const RuntimeAddress = addressMod.RuntimeAddress;
      class CSSAssembler {
        constructor({ files = {}, graph = null, origin, base } = {}) {
          this.files = files;
          this.graph = graph;
          this.address = new RuntimeAddress({ origin, base });
        }
        assemble(entry) {
          const visited = /* @__PURE__ */ new Set(), imports = [], assets = [], ordered = [], warnings = [];
          const walk2 = (file) => {
            if (visited.has(file)) return;
            visited.add(file);
            this.graph?.node?.(file, { kind: "css" });
            const css = this.files[file] || "";
            if (!this.files[file]) warnings.push({ kind: "missing-css", file });
            for (const ref of extractImports(css)) {
              const next = this.address.fileKey(ref, file, this.files);
              imports.push({ from: file, to: next, specifier: ref });
              this.graph?.edge?.(file, next, "css-import");
              if (this.files[next]) walk2(next);
              else warnings.push({ kind: "missing-css-import", from: file, to: next });
            }
            for (const ref of extractUrls(css)) {
              const next = this.address.fileKey(ref, file, this.files);
              assets.push({ from: file, to: next, specifier: ref });
              this.graph?.edge?.(file, next, "css-asset");
              this.graph?.node?.(next, { kind: "asset" });
              if (!this.files[next]) warnings.push({ kind: "missing-css-asset", from: file, to: next });
            }
            ordered.push(file);
          };
          walk2(entry);
          return { entry, ordered, imports, assets, warnings };
        }
      }
      function extractImports(css) {
        const refs = [];
        for (const m of css.matchAll(/@import\s+(?:url\(\s*)?["']?([^"')\s;]+)["']?\s*\)?/g)) refs.push(m[1]);
        return refs;
      }
      function extractUrls(css) {
        const refs = [];
        for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) if (!m[1].startsWith("data:")) refs.push(m[1]);
        return refs;
      }
      return { CSSAssembler };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/ModuleExecutor.js
var require_ModuleExecutor = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/ModuleExecutor.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.ModuleExecutor = factory().ModuleExecutor;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      class ModuleExecutor {
        constructor(options = {}) {
          this.options = options;
        }
        async execute() {
          throw new Error("ModuleExecutor native source execution disabled. Use MerkavaExecutor.executeFiles / executeVmFiles.");
        }
        async load() {
          return this.execute();
        }
      }
      return { ModuleExecutor };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualStyleDeclaration.js
var require_VirtualStyleDeclaration = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualStyleDeclaration.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualStyleDeclaration = factory().VirtualStyleDeclaration;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      const dash = (name) => String(name).replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
      class VirtualStyleDeclaration {
        constructor() {
          this.props = /* @__PURE__ */ Object.create(null);
        }
        setProperty(name, value) {
          const key = dash(name);
          this.props[key] = String(value);
          this.__notifyStyle(key);
        }
        getPropertyValue(name) {
          return this.props[dash(name)] || "";
        }
        removeProperty(name) {
          const key = dash(name), old = this.props[key] || "";
          delete this.props[key];
          this.__notifyStyle(key);
          return old;
        }
        assignText(text) {
          for (const part of String(text || "").split(";")) {
            const at = part.indexOf(":");
            if (at > -1) this.setProperty(part.slice(0, at).trim(), part.slice(at + 1).trim());
          }
        }
        toString() {
          return Object.entries(this.props).map(([k, v]) => `${k}: ${v};`).join(" ");
        }
        toJSON() {
          return { ...this.props };
        }
        /**
         * B"H: layout thrashing defense. Every inline-style write is
         * classified by the document scheduler (layout / paint /
         * compositor-only). Writes batch — they never force sync layout.
         */
        __notifyStyle(dashedName) {
          const owner = this.__owner;
          const doc = owner && owner.ownerDocument;
          if (doc && doc.__suppressMutations) return;
          const sched = doc && doc.__layoutScheduler;
          if (sched) sched.noteStyleChange(owner, dashedName);
        }
      }
      const ROUTED_CAMEL = [
        "width",
        "height",
        "minWidth",
        "minHeight",
        "maxWidth",
        "maxHeight",
        "margin",
        "marginTop",
        "marginRight",
        "marginBottom",
        "marginLeft",
        "padding",
        "paddingTop",
        "paddingRight",
        "paddingBottom",
        "paddingLeft",
        "border",
        "borderWidth",
        "borderTopWidth",
        "borderRightWidth",
        "borderBottomWidth",
        "borderLeftWidth",
        "borderColor",
        "borderTopColor",
        "borderRightColor",
        "borderBottomColor",
        "borderLeftColor",
        "borderStyle",
        "borderRadius",
        "outline",
        "outlineColor",
        "outlineWidth",
        "display",
        "position",
        "top",
        "right",
        "bottom",
        "left",
        "float",
        "clear",
        "overflow",
        "overflowX",
        "overflowY",
        "boxSizing",
        "zIndex",
        "visibility",
        "flex",
        "flexDirection",
        "flexWrap",
        "flexGrow",
        "flexShrink",
        "flexBasis",
        "justifyContent",
        "alignItems",
        "alignContent",
        "alignSelf",
        "order",
        "gap",
        "rowGap",
        "columnGap",
        "grid",
        "gridTemplateColumns",
        "gridTemplateRows",
        "gridTemplateAreas",
        "gridColumn",
        "gridRow",
        "gridArea",
        "gridColumnStart",
        "gridColumnEnd",
        "gridRowStart",
        "gridRowEnd",
        "fontSize",
        "fontFamily",
        "fontWeight",
        "fontStyle",
        "lineHeight",
        "letterSpacing",
        "textAlign",
        "textTransform",
        "textDecoration",
        "textIndent",
        "whiteSpace",
        "wordSpacing",
        "verticalAlign",
        "color",
        "background",
        "backgroundColor",
        "backgroundImage",
        "boxShadow",
        "textShadow",
        "opacity",
        "transform",
        "translate",
        "rotate",
        "scale",
        "transformOrigin",
        "filter",
        "mixBlendMode",
        "clipPath",
        "cursor",
        "pointerEvents",
        "fill",
        "stroke"
      ];
      const routedDescriptors = {};
      for (const name of ROUTED_CAMEL) {
        const key = dash(name);
        routedDescriptors[name] = {
          configurable: true,
          get() {
            return this.props[key] || "";
          },
          set(value) {
            this.setProperty(key, value);
          }
        };
      }
      Object.defineProperties(VirtualStyleDeclaration.prototype, routedDescriptors);
      return { VirtualStyleDeclaration };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualClassList.js
var require_VirtualClassList = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualClassList.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualClassList = factory().VirtualClassList;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      class VirtualClassList {
        constructor(element) {
          this.element = element;
        }
        values() {
          return String(this.element.className || "").split(/\s+/).filter(Boolean);
        }
        write(values) {
          this.element.className = Array.from(new Set(values)).join(" ");
          this.element.attributes.class = this.element.className;
        }
        add(...names) {
          this.write(this.values().concat(names.filter(Boolean).map(String)));
        }
        remove(...names) {
          const dead = new Set(names.map(String));
          this.write(this.values().filter((name) => !dead.has(name)));
        }
        contains(name) {
          return this.values().includes(String(name));
        }
        toggle(name, force) {
          const has = this.contains(name);
          if (force === true || !has && force !== false) {
            this.add(name);
            return true;
          }
          if (has) this.remove(name);
          return false;
        }
        toString() {
          return this.element.className || "";
        }
        [Symbol.iterator]() {
          return this.values()[Symbol.iterator]();
        }
      }
      return { VirtualClassList };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementSupport.js
var require_VirtualElementSupport = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementSupport.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory());
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      function virtualElementHandle(node) {
        return {
          className: node?.className || "",
          height: node?.height || 0,
          id: node?.id || "",
          nodeId: node?.__nodeId || null,
          tagName: node?.tagName || node?.nodeName || node?.constructor?.name || "FOREIGN",
          // B"H (2026-10-09): own text only. The getter recurses the whole
          // subtree (map/join per level); handles are built per mutation.
          textContent: node?._textContent || "",
          value: node?.value || "",
          width: node?.width || 0
        };
      }
      function virtualElementChildSnapshot(child) {
        if (child && typeof child.toJSON === "function") {
          return child.toJSON();
        }
        return {
          className: child?.className || "",
          id: child?.id || "",
          nodeType: child?.nodeType || 1,
          tagName: child?.tagName || child?.nodeName || child?.constructor?.name || "FOREIGN",
          textContent: child?.textContent || ""
        };
      }
      function virtualElementPositiveInteger(value, fallback) {
        const number = Math.floor(Number(value));
        return Number.isFinite(number) && number >= 0 ? number : fallback;
      }
      function virtualElementCoerceNode(element, node) {
        if (node && typeof node === "object" && node.nodeType) {
          return node;
        }
        return element.ownerDocument.createTextNode(String(node ?? ""));
      }
      return {
        virtualElementChildSnapshot,
        virtualElementCoerceNode,
        virtualElementHandle,
        virtualElementPositiveInteger
      };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementProperties.js
var require_VirtualElementProperties = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementProperties.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory(require_VirtualElementSupport());
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory(root.Merkava));
      }
    })(typeof self !== "undefined" ? self : exports, function(support) {
      function installVirtualElementProperties(prototype) {
        Object.defineProperties(prototype, propertyDescriptors());
        prototype.__newFragment = function() {
          const fragment = new this.constructor("#fragment", this.ownerDocument);
          fragment.host = this;
          return fragment;
        };
        prototype.__notify = function(kind, extra) {
          const doc = this.ownerDocument;
          if (doc && doc.__suppressMutations) return;
          if (doc && doc.__notifyMutation) doc.__notifyMutation(kind, this, extra);
        };
        prototype.__handle = function() {
          return support.virtualElementHandle(this);
        };
        prototype.__coerceNode = function(node) {
          return support.virtualElementCoerceNode(this, node);
        };
        prototype.__syncCanvasTextureSize = function() {
          if (this.__webglCanvasTexture) {
            this.__webglCanvasTexture.width = this.width;
            this.__webglCanvasTexture.height = this.height;
          }
        };
      }
      function propertyDescriptors() {
        return {
          childElementCount: {
            get() {
              return this.children.filter((child) => child.nodeType === 1).length;
            }
          },
          /**
           * B"H: layout thrashing defense. className/hidden/value writes
           * can re-match selectors or change intrinsic geometry, so they
           * notify the document scheduler (batched, never sync layout).
           */
          className: {
            get() {
              return this._className || "";
            },
            set(value) {
              const next = String(value ?? "");
              if (this._className === next) return;
              this._className = next;
              this.__notify("attributes", { attributeName: "class" });
            }
          },
          hidden: {
            get() {
              return !!this._hidden;
            },
            set(value) {
              const next = !!value;
              if (!!this._hidden === next) return;
              this._hidden = next;
              this.__notify("attributes", { attributeName: "hidden" });
            }
          },
          value: {
            get() {
              return this._value != null ? String(this._value) : "";
            },
            set(value) {
              const next = String(value ?? "");
              if (this._value === next) return;
              this._value = next;
              this.__notify("attributes", { attributeName: "value" });
            }
          },
          content: {
            get() {
              if (this.localName !== "template") return void 0;
              return this.__templateContent || (this.__templateContent = this.__newFragment());
            }
          },
          firstChild: { get() {
            return this.children[0] || null;
          } },
          firstElementChild: { get() {
            return this.children.find((child) => child.nodeType === 1) || null;
          } },
          height: {
            get() {
              return this.__height || 0;
            },
            set(value) {
              this.__height = support.virtualElementPositiveInteger(value, 0);
              this.attributes.height = String(this.__height);
              this.__syncCanvasTextureSize();
              this.__notify("attributes", { attributeName: "height" });
            }
          },
          innerText: {
            get() {
              return this.textContent;
            },
            set(value) {
              this.textContent = value;
            }
          },
          lastChild: { get() {
            return this.children[this.children.length - 1] || null;
          } },
          nextSibling: { get() {
            return sibling(this, 1);
          } },
          parentElement: { get() {
            return this.parentNode?.nodeType === 1 ? this.parentNode : null;
          } },
          previousSibling: { get() {
            return sibling(this, -1);
          } },
          textContent: {
            get() {
              if (this.nodeType === 3) return this._textContent;
              return this._textContent || this.children.map((child) => child.textContent || "").join("");
            },
            set(value) {
              this._textContent = String(value ?? "");
              if (this.nodeType === 3) {
                this.__notify("characterData");
                return;
              }
              const hadChildren = this.children.length > 0;
              this.replaceChildren();
              if (!hadChildren) this.__notify("characterData");
            }
          },
          width: {
            get() {
              return this.__width || 0;
            },
            set(value) {
              this.__width = support.virtualElementPositiveInteger(value, 0);
              this.attributes.width = String(this.__width);
              this.__syncCanvasTextureSize();
              this.__notify("attributes", { attributeName: "width" });
            }
          }
        };
      }
      function sibling(element, offset) {
        const siblings = element.parentNode?.children || [];
        return siblings[siblings.indexOf(element) + offset] || null;
      }
      return { installVirtualElementProperties };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementTreeBehavior.js
var require_VirtualElementTreeBehavior = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementTreeBehavior.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory());
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      function installVirtualElementTreeBehavior(prototype) {
        prototype.appendChild = appendChild;
        prototype.append = append;
        prototype.prepend = prepend;
        prototype.before = before;
        prototype.after = after;
        prototype.insertBefore = insertBefore;
        prototype.removeChild = removeChild;
        prototype.replaceChild = replaceChild;
        prototype.replaceChildren = replaceChildren;
      }
      function appendChild(child) {
        if (child.nodeType === 11) {
          while (child.firstChild) this.appendChild(child.firstChild);
          return child;
        }
        if (child.parentNode) child.parentNode.removeChild(child);
        child.parentNode = this;
        this.__mutableChildren().push(child);
        this.__notify("childList", { addedNodes: [child.__handle?.() || {}], removedNodes: [] });
        return child;
      }
      function append(...nodes) {
        for (const node of nodes) this.appendChild(this.__coerceNode(node));
      }
      function prepend(...nodes) {
        for (const node of nodes.reverse()) this.insertBefore(this.__coerceNode(node), this.firstChild);
      }
      function before(...nodes) {
        if (!this.parentNode) return;
        for (const node of nodes) this.parentNode.insertBefore(this.__coerceNode(node), this);
      }
      function after(...nodes) {
        if (!this.parentNode) return;
        const reference = this.nextSibling;
        for (const node of nodes) this.parentNode.insertBefore(this.__coerceNode(node), reference);
      }
      function insertBefore(child, beforeNode) {
        if (!beforeNode) return this.appendChild(child);
        const index = this.children.indexOf(beforeNode);
        if (index < 0) throw new Error("Reference node not found");
        if (child.parentNode) child.parentNode.removeChild(child);
        child.parentNode = this;
        this.__mutableChildren().splice(index, 0, child);
        this.__notify("childList", { addedNodes: [child.__handle?.() || {}], removedNodes: [] });
        return child;
      }
      function removeChild(child) {
        const index = this.children.indexOf(child);
        if (index < 0) throw new Error("Child not found");
        this.__mutableChildren().splice(index, 1);
        child.parentNode = null;
        this.__notify("childList", { addedNodes: [], removedNodes: [child.__handle?.() || {}] });
        return child;
      }
      function replaceChild(newChild, oldChild) {
        this.insertBefore(newChild, oldChild);
        this.removeChild(oldChild);
        return oldChild;
      }
      function replaceChildren(...nodes) {
        const old = this._children;
        if (old && old.length) {
          const doc = this.ownerDocument;
          const removedNodes = [];
          for (const child of old) {
            child.parentNode = null;
            removedNodes.push(child.__handle?.() || {});
            if (doc) doc.__recycleNode(child);
          }
          this._children = void 0;
          this.__notify("childList", { addedNodes: [], removedNodes });
        }
        for (const node of nodes) this.appendChild(this.__coerceNode(node));
      }
      return { installVirtualElementTreeBehavior };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementCloneBehavior.js
var require_VirtualElementCloneBehavior = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementCloneBehavior.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory());
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      function installVirtualElementCloneBehavior(prototype) {
        prototype.attachShadow = attachShadow;
        prototype.cloneNode = cloneNode;
        prototype.contains = contains;
        prototype.getRootNode = getRootNode;
      }
      function attachShadow(options = {}) {
        if (this.shadowRoot) {
          throw new Error("Shadow root already attached");
        }
        const root = this.__newFragment();
        root.mode = options.mode || "open";
        root.host = this;
        this.shadowRoot = root;
        this.__notify("shadowRoot", { mode: root.mode });
        return root;
      }
      function cloneNode(deep = false) {
        const copy = new this.constructor(this.localName, this.ownerDocument);
        for (const [name, value] of Object.entries(this.attributes)) {
          copy.setAttribute(name, value);
        }
        copy._textContent = this._textContent;
        copy.value = this.value;
        copy.checked = this.checked;
        copy.selected = this.selected;
        copy.width = this.width;
        copy.height = this.height;
        if (deep) {
          for (const child of this.children) copy.appendChild(child.cloneNode(true));
        }
        if (deep && this.localName === "template") {
          for (const child of this.content.children) copy.content.appendChild(child.cloneNode(true));
        }
        return copy;
      }
      function contains(node) {
        for (let current = node; current; current = current.parentNode) {
          if (current === this) return true;
        }
        return false;
      }
      function getRootNode() {
        let current = this;
        while (current.parentNode || current.host) {
          current = current.parentNode || current.host;
        }
        return current.ownerDocument || current;
      }
      return { installVirtualElementCloneBehavior };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementAttributeBehavior.js
var require_VirtualElementAttributeBehavior = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementAttributeBehavior.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory());
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      function installVirtualElementAttributeBehavior(prototype) {
        prototype.setAttribute = setAttribute;
        prototype.getAttribute = getAttribute;
        prototype.hasAttribute = hasAttribute;
        prototype.removeAttribute = removeAttribute;
        prototype.__setParsedAttributes = __setParsedAttributes;
      }
      function __setParsedAttributes(attributes) {
        const target = this.attributes;
        for (let i = 0; i < attributes.length; i++) {
          target[attributes[i].name] = attributes[i].value;
        }
        for (let i = 0; i < attributes.length; i++) {
          reflectAttribute(this, attributes[i].name, attributes[i].value);
        }
      }
      function setAttribute(name, value) {
        const key = String(name).toLowerCase();
        const oldValue = this.attributes[key] ?? null;
        const text = String(value);
        this.attributes[key] = text;
        reflectAttribute(this, key, text);
        this.__notify("attributes", {
          attributeName: key,
          oldValue
        });
      }
      function getAttribute(name) {
        return this.attributes[String(name).toLowerCase()] ?? null;
      }
      function hasAttribute(name) {
        return Object.prototype.hasOwnProperty.call(this.attributes, String(name).toLowerCase());
      }
      function removeAttribute(name) {
        const key = String(name).toLowerCase();
        const oldValue = this.attributes[key] ?? null;
        delete this.attributes[key];
        if (key === "id") this.id = "";
        if (key === "class") this.className = "";
        if (key === "style" && this._style) {
          for (const prop of Object.keys(this._style.props)) this._style.removeProperty(prop);
        }
        if (key === "width" && this.localName === "canvas") this.width = 300;
        if (key === "height" && this.localName === "canvas") this.height = 150;
        this.__notify("attributes", {
          attributeName: key,
          oldValue
        });
      }
      function reflectAttribute(element, key, value) {
        if (key === "id") element.id = value;
        if (key === "class") element.className = value;
        if (key === "style") element.style.assignText(value);
        if (key === "value") element.value = value;
        if (key === "name") element.name = value;
        if (key === "type") element.type = value;
        if (key === "tabindex") element.tabIndex = Number(value);
        if (key === "width") element.width = value;
        if (key === "height") element.height = value;
        if (key === "checked") element.checked = true;
        if (key === "selected") element.selected = true;
        if (key === "hidden") element.hidden = true;
        if (key === "disabled") element.disabled = true;
        if (key.startsWith("data-")) {
          element.dataset[dataKey(key.slice(5))] = value;
        }
      }
      function dataKey(name) {
        let output = "";
        let uppercase = false;
        for (const character of name) {
          if (character === "-") {
            uppercase = true;
            continue;
          }
          output += uppercase ? character.toUpperCase() : character;
          uppercase = false;
        }
        return output;
      }
      return { installVirtualElementAttributeBehavior };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementEventSupport.js
var require_VirtualElementEventSupport = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementEventSupport.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory());
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      function installVirtualElementEventSupport(prototype) {
        prototype.__invoke = invokeVirtualElementListeners;
        prototype.__captureEventError = captureVirtualElementEventError;
      }
      function invokeVirtualElementListeners(event, capture) {
        const entry = this.listeners[event.type];
        if (entry === void 0) return;
        const list = capture ? entry.c : entry.b;
        const n2 = list.length;
        if (n2 === 0) return;
        const target = this;
        const type = event.type;
        if (n2 === 1) {
          const item = list[0];
          event.currentTarget = target;
          try {
            const r = item.h.call(target, event);
            if (r && typeof r.catch === "function") r.catch((e) => target.__captureEventError(e, event));
          } catch (e) {
            target.__captureEventError(e, event);
          }
          if (item.o) target.removeEventListener(type, item.h, capture);
          return;
        }
        for (const item of list.slice()) {
          event.currentTarget = target;
          try {
            const r = item.h.call(target, event);
            if (r && typeof r.catch === "function") r.catch((e) => target.__captureEventError(e, event));
          } catch (e) {
            target.__captureEventError(e, event);
          }
          if (item.o) target.removeEventListener(type, item.h, capture);
          if (event.__immediateStopped) break;
        }
      }
      function captureVirtualElementEventError(error, event) {
        const windowObject = this.ownerDocument?.defaultView;
        if (!windowObject) return;
        windowObject.__AWTSMOOS_CAPTURED_ERRORS__ = windowObject.__AWTSMOOS_CAPTURED_ERRORS__ || [];
        windowObject.__AWTSMOOS_CAPTURED_ERRORS__.push({
          message: error?.message || String(error),
          phase: "event",
          stack: error?.stack || "",
          target: this.__handle(),
          type: event?.type || ""
        });
      }
      return { installVirtualElementEventSupport };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualEvents.js
var require_VirtualEvents = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualEvents.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory());
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      class VirtualEvent {
        constructor(type, init) {
          this.type = type;
          this.bubbles = false;
          this.cancelable = false;
          this.composed = false;
          this.defaultPrevented = false;
          this.cancelBubble = false;
          this.__immediateStopped = false;
          this.eventPhase = 0;
          this.target = null;
          this.currentTarget = null;
          this.timeStamp = Date.now();
          this.__path = null;
          if (init !== void 0 && init !== null) {
            this.bubbles = !!init.bubbles;
            this.cancelable = !!init.cancelable;
            this.composed = !!init.composed;
            this.target = init.target || null;
            Object.assign(this, init);
          }
        }
        preventDefault() {
          if (this.cancelable) this.defaultPrevented = true;
        }
        stopPropagation() {
          this.cancelBubble = true;
        }
        stopImmediatePropagation() {
          this.cancelBubble = true;
          this.__immediateStopped = true;
        }
        composedPath() {
          if (this.__path) return this.__path.slice();
          const path2 = [];
          for (let n2 = this.target; n2; n2 = n2.parentNode || n2.host) path2.push(n2);
          return path2;
        }
      }
      class VirtualCustomEvent extends VirtualEvent {
        constructor(type, init) {
          super(type, init);
          this.detail = init ? init.detail : void 0;
        }
      }
      class VirtualKeyboardEvent extends VirtualEvent {
        constructor(type, init) {
          super(type, init);
          this.key = init && init.key || "";
          this.code = init && init.code || this.key;
          this.ctrlKey = !!(init && init.ctrlKey);
          this.shiftKey = !!(init && init.shiftKey);
          this.altKey = !!(init && init.altKey);
          this.metaKey = !!(init && init.metaKey);
        }
      }
      class VirtualMouseEvent extends VirtualEvent {
        constructor(type, init) {
          super(type, init);
          this.clientX = init && init.clientX || 0;
          this.clientY = init && init.clientY || 0;
          this.button = init && init.button || 0;
          this.buttons = init && init.buttons || 0;
        }
      }
      class VirtualInputEvent extends VirtualEvent {
        constructor(type, init) {
          super(type, init);
          this.data = init && init.data || "";
          this.inputType = init && init.inputType || "insertText";
        }
      }
      return { VirtualEvent, VirtualCustomEvent, VirtualKeyboardEvent, VirtualMouseEvent, VirtualInputEvent };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementEventBehavior.js
var require_VirtualElementEventBehavior = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementEventBehavior.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory(require_VirtualEvents());
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory(root.Merkava));
      }
    })(typeof self !== "undefined" ? self : exports, function(events) {
      const VirtualEvent = events.VirtualEvent;
      function installVirtualElementEventBehavior(prototype) {
        prototype.focus = focus;
        prototype.blur = blur;
        prototype.click = click;
        prototype.addEventListener = addEventListener;
        prototype.removeEventListener = removeEventListener;
        prototype.dispatchEvent = dispatchEvent;
      }
      function focus() {
        const document = this.ownerDocument;
        if (!document || document.activeElement === this) return;
        const old = document.activeElement;
        if (old) old.dispatchEvent(new VirtualEvent("blur"));
        document.activeElement = this;
        this.dispatchEvent(new VirtualEvent("focus"));
        this.dispatchEvent(new VirtualEvent("focusin", { bubbles: true }));
      }
      function blur() {
        if (this.ownerDocument?.activeElement !== this) return;
        this.dispatchEvent(new VirtualEvent("blur"));
        this.dispatchEvent(new VirtualEvent("focusout", { bubbles: true }));
        this.ownerDocument.activeElement = null;
      }
      function click() {
        if (this.disabled) return;
        if (this.type === "checkbox") this.checked = !this.checked;
        this.dispatchEvent(new VirtualEvent("click", {
          bubbles: true,
          cancelable: true
        }));
      }
      function addEventListener(type, handler, options = false) {
        if (!handler) return;
        const capture = captureOption(options);
        let entry = this.listeners[type];
        if (entry === void 0) {
          entry = this.listeners[type] = { c: [], b: [] };
        }
        (capture ? entry.c : entry.b).push({
          h: handler,
          o: Boolean(options && options.once)
        });
        const doc = this.ownerDocument;
        if (doc) {
          const counters = capture ? doc.__captureTypes : doc.__bubbleTypes;
          if (counters) counters[type] = (counters[type] || 0) + 1;
        }
      }
      function removeEventListener(type, handler, options = false) {
        const entry = this.listeners[type];
        if (entry === void 0) return;
        const capture = captureOption(options);
        const key = capture ? "c" : "b";
        const list = entry[key];
        const before = list.length;
        entry[key] = list.filter((item) => item.h !== handler);
        const removed = before - entry[key].length;
        if (removed > 0) {
          const doc = this.ownerDocument;
          if (doc) {
            const counters = capture ? doc.__captureTypes : doc.__bubbleTypes;
            if (counters && counters[type] !== void 0) {
              counters[type] -= removed;
              if (counters[type] <= 0) delete counters[type];
            }
          }
        }
      }
      function dispatchEvent(rawEvent) {
        const event = typeof rawEvent === "string" ? new VirtualEvent(rawEvent) : rawEvent;
        if (!event.type) throw new Error("Event missing type");
        const type = event.type;
        event.target ||= this;
        const doc = this.ownerDocument;
        const countersLive = doc && doc.__captureTypes && doc.__bubbleTypes;
        if (countersLive) {
          const capTotal = doc.__captureTypes[type] || 0;
          const bubTotal = doc.__bubbleTypes[type] || 0;
          const ownEntry = this.listeners[type];
          const ownC = ownEntry !== void 0 ? ownEntry.c.length : 0;
          const ownB = ownEntry !== void 0 ? ownEntry.b.length : 0;
          if (capTotal <= ownC && (!event.bubbles || bubTotal <= ownB)) {
            event.__path = null;
            if (ownC !== 0 || ownB !== 0) {
              event.eventPhase = 2;
              this.__invoke(event, true);
              if (!event.__immediateStopped) this.__invoke(event, false);
            }
            event.eventPhase = 0;
            event.currentTarget = null;
            return !event.defaultPrevented;
          }
        }
        const path2 = [];
        for (let node = this; node; node = node.parentNode || node.host) path2.push(node);
        event.__path = path2;
        const last = path2.length - 1;
        for (let index = last; index > 0; index -= 1) {
          if (event.cancelBubble) break;
          const node = path2[index];
          const entry = node.listeners[type];
          if (entry !== void 0 && entry.c.length !== 0) {
            event.eventPhase = 1;
            node.__invoke(event, true);
          }
        }
        if (!event.cancelBubble) {
          const entry = this.listeners[type];
          if (entry !== void 0 && (entry.c.length !== 0 || entry.b.length !== 0)) {
            event.eventPhase = 2;
            this.__invoke(event, true);
            if (!event.__immediateStopped) this.__invoke(event, false);
          }
        }
        if (event.bubbles) {
          for (let index = 1; index <= last; index += 1) {
            if (event.cancelBubble) break;
            const node = path2[index];
            const entry = node.listeners[type];
            if (entry !== void 0 && entry.b.length !== 0) {
              event.eventPhase = 3;
              node.__invoke(event, false);
            }
          }
        }
        event.eventPhase = 0;
        event.currentTarget = null;
        return !event.defaultPrevented;
      }
      function captureOption(options) {
        return options === true || Boolean(options && options.capture);
      }
      return { installVirtualElementEventBehavior };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementQueryBehavior.js
var require_VirtualElementQueryBehavior = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementQueryBehavior.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory(
          require_CssSelectorMatcher(),
          require_CssSelectorList()
        );
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory(root.Merkava, root.Merkava));
      }
    })(typeof self !== "undefined" ? self : exports, function(selectors, selectorList) {
      const { splitSelectorList: splitSelectorList2, tokenizeSelectorSequence } = selectorList || {};
      function installVirtualElementQueryBehavior(prototype) {
        prototype.matches = matches;
        prototype.closest = closest;
        prototype.querySelector = querySelector;
        prototype.querySelectorAll = querySelectorAll;
      }
      function matches(selector) {
        return selectors.matchesCssSelector(this, String(selector || ""));
      }
      function closest(selector) {
        for (let current = this; current; current = current.parentNode || current.host) {
          if (current.nodeType === 1 && selectors.matchesCssSelector(current, selector)) {
            return current;
          }
        }
        return null;
      }
      function tokenizedFor(element, selector) {
        const doc = element.ownerDocument;
        const cache = doc && doc.__selectorCache;
        if (!cache) return splitSelectorList2(selector).map(tokenizeSelectorSequence);
        let tokens = cache.get(selector);
        if (!tokens) {
          tokens = splitSelectorList2(selector).map(tokenizeSelectorSequence);
          if (cache.size >= 256) cache.delete(cache.keys().next().value);
          cache.set(selector, tokens);
        }
        return tokens;
      }
      function scopeContains(scope, node) {
        for (let n2 = node; n2; n2 = n2.parentNode || n2.host || null) {
          if (n2 === scope) return true;
        }
        return false;
      }
      function findByIdFast(scope, id) {
        const doc = scope.ownerDocument;
        const hit = doc && doc.__idMap && doc.__idMap.get(id);
        if (hit && hit !== scope && scopeContains(scope, hit)) return hit;
        return null;
      }
      function querySelector(selector) {
        const all = querySelectorAll.call(this, selector);
        return all[0] || null;
      }
      function querySelectorAll(selector) {
        const sel = String(selector || "");
        if (!sel) return [];
        const idMatch = /^#([\w-]+)$/.exec(sel);
        if (idMatch) {
          const found = findByIdFast(this, idMatch[1]);
          if (found) return [found];
        } else if (/^[a-zA-Z][\w-]*$/.test(sel)) {
          const tag = sel.toLowerCase();
          const output2 = [];
          for (const child of this.children || []) collectByTag(child, tag, output2);
          return output2;
        } else if (sel === "*") {
          const output2 = [];
          for (const child of this.children || []) collectAllElements(child, output2);
          return output2;
        }
        const compiled = selectors.compileSelectorList(sel);
        const output = [];
        for (const child of this.children || []) {
          collectCompiled(child, compiled, output);
        }
        return output;
      }
      function collectCompiled(node, compiled, output) {
        if (node.nodeType === 1 && selectors.matchesCompiledSelectorList(node, compiled)) {
          output.push(node);
        }
        for (const child of node.children || []) {
          collectCompiled(child, compiled, output);
        }
        if (node.shadowRoot) {
          collectCompiled(node.shadowRoot, compiled, output);
        }
      }
      function collectByTag(node, tag, output) {
        if (node.nodeType === 1 && node.localName === tag) output.push(node);
        for (const child of node.children || []) collectByTag(child, tag, output);
        if (node.shadowRoot) collectByTag(node.shadowRoot, tag, output);
      }
      function collectAllElements(node, output) {
        if (node.nodeType === 1) output.push(node);
        for (const child of node.children || []) collectAllElements(child, output);
        if (node.shadowRoot) collectAllElements(node.shadowRoot, output);
      }
      return { installVirtualElementQueryBehavior };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualHtmlSerializer.js
var require_VirtualHtmlSerializer = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualHtmlSerializer.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualHtmlSerializer = factory().VirtualHtmlSerializer;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      const VOID = new Set("area base br col embed hr img input link meta param source track wbr".split(" "));
      const esc = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const attrs = (element) => Object.entries(element.attributes || {}).map(([k, v]) => ` ${k}="${esc(v)}"`).join("");
      class VirtualHtmlSerializer2 {
        serialize(element) {
          if (element.tagName === "#TEXT") return esc(element.textContent || "");
          const tag = String(element.tagName || "div").toLowerCase();
          const body = `${esc(element._textContent || "")}${(element.children || []).map((child) => this.serialize(child)).join("")}`;
          return VOID.has(tag) ? `<${tag}${attrs(element)}>` : `<${tag}${attrs(element)}>${body}</${tag}>`;
        }
        serializeChildren(element) {
          return `${esc(element._textContent || "")}${(element.children || []).map((child) => this.serialize(child)).join("")}`;
        }
        parseInto(element, html) {
          element.replaceChildren();
          element._textContent = "";
          const stack = [element];
          for (const token of tokenize(html)) handleToken(stack, token);
        }
      }
      function handleToken(stack, token) {
        const parent = stack[stack.length - 1];
        if (token.kind === "text") {
          appendText2(parent, token.text);
          return;
        }
        if (token.kind === "close") {
          closeStack(stack, token.name);
          return;
        }
        const child = parent.ownerDocument.createElement(token.name);
        for (const [k, v] of Object.entries(token.attrs)) child.setAttribute(k, v);
        parent.appendChild(child);
        if (!token.selfClosing && !VOID.has(token.name)) stack.push(child);
      }
      function appendText2(parent, text) {
        const value = String(text || "");
        if (!value) return;
        parent.appendChild(parent.ownerDocument.createTextNode(value));
      }
      function closeStack(stack, name) {
        for (let i = stack.length - 1; i > 0; i--) {
          if (stack[i].localName === name) {
            stack.length = i;
            return;
          }
        }
      }
      function tokenize(html) {
        const source = String(html || ""), tokens = [];
        const re = /<!--[^]*?-->|<![^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)([^>]*)>|([^<]+)/g;
        let match;
        while (match = re.exec(source)) {
          if (match[1]) tokens.push({ kind: "close", name: match[1].toLowerCase() });
          else if (match[2]) tokens.push({ kind: "open", name: match[2].toLowerCase(), attrs: parseAttrs(match[3]), selfClosing: /\/\s*$/.test(match[3] || "") });
          else if (match[4]) tokens.push({ kind: "text", text: decode(match[4]) });
        }
        return tokens;
      }
      function parseAttrs(raw = "") {
        const out = {};
        const re = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
        for (const m of String(raw || "").matchAll(re)) out[m[1]] = decode(m[2] ?? m[3] ?? m[4] ?? "");
        return out;
      }
      function decode(value) {
        return String(value || "").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
      }
      return { VirtualHtmlSerializer: VirtualHtmlSerializer2 };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementContentBehavior.js
var require_VirtualElementContentBehavior = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElementContentBehavior.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        const lazyRequire = (path2) => {
          let mod = null;
          return new Proxy({}, {
            get(t, prop) {
              if (typeof prop === "symbol") return void 0;
              if (!mod) mod = __require(path2);
              return mod[prop];
            }
          });
        };
        module.exports = factory(
          require_VirtualHtmlSerializer(),
          lazyRequire("./VirtualCanvas2DContext.js"),
          lazyRequire("./VirtualWebGLContext.js"),
          require_VirtualElementSupport()
        );
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory(root.Merkava, root.Merkava, root.Merkava, root.Merkava));
      }
    })(typeof self !== "undefined" ? self : exports, function(htmlModule, canvasModule, webglModule, support) {
      function installVirtualElementContentBehavior(prototype) {
        Object.defineProperties(prototype, {
          innerHTML: {
            get: innerHtml,
            set: setInnerHtml
          },
          outerHTML: {
            get: outerHtml
          }
        });
        prototype.getContext = getContext;
        prototype.toJSON = toJSON;
      }
      function serializer() {
        return new htmlModule.VirtualHtmlSerializer();
      }
      function innerHtml() {
        return serializer().serializeChildren(this);
      }
      function setInnerHtml(value) {
        serializer().parseInto(this, value);
        this.__notify("childList", { html: String(value ?? "") });
      }
      function outerHtml() {
        return serializer().serialize(this);
      }
      function getContext(kind) {
        const type = String(kind || "").toLowerCase();
        if (this.tagName !== "CANVAS") return null;
        this.__syncCanvasTextureSize();
        if (type === "2d") {
          this.__canvas2dContext ||= new canvasModule.VirtualCanvas2DContext(this, this.ownerDocument?.textureArena);
          return this.__canvas2dContext;
        }
        if (type === "webgl" || type === "webgl2" || type === "experimental-webgl") {
          this.__webglContext ||= new webglModule.VirtualWebGLContext(this, this.ownerDocument?.textureArena);
          return this.__webglContext;
        }
        return null;
      }
      function toJSON() {
        return {
          ...this.__handle(),
          attributes: this.attributes,
          checked: this.checked,
          children: this.children.map(support.virtualElementChildSnapshot),
          dataset: this.dataset,
          height: this.height,
          name: this.name,
          nodeType: this.nodeType,
          selected: this.selected,
          shadowRoot: this.shadowRoot?.toJSON?.() || null,
          style: this.style.toJSON(),
          type: this.type,
          webgl: this.__webglContext?.snapshot?.() || null,
          width: this.width
        };
      }
      return { installVirtualElementContentBehavior };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElement.js
var require_VirtualElement = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualElement.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory({
          ...require_VirtualStyleDeclaration(),
          ...require_VirtualClassList(),
          ...require_VirtualElementProperties(),
          ...require_VirtualElementTreeBehavior(),
          ...require_VirtualElementCloneBehavior(),
          ...require_VirtualElementAttributeBehavior(),
          ...require_VirtualElementEventSupport(),
          ...require_VirtualElementEventBehavior(),
          ...require_VirtualElementQueryBehavior(),
          ...require_VirtualElementContentBehavior()
        });
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory(root.Merkava));
      }
    })(typeof self !== "undefined" ? self : exports, function(modules) {
      class VirtualElement {
        constructor(tagName = "div", ownerDocument = null) {
          this.tagName = String(tagName).toUpperCase();
          this.nodeName = this.tagName;
          this.localName = String(tagName).toLowerCase();
          this.nodeType = nodeTypeFor(this.tagName);
          this.ownerDocument = ownerDocument;
          this.__nodeId = ownerDocument ? ownerDocument.__nextNodeId++ : 0;
          this.parentNode = null;
          this._textContent = "";
          this.value = "";
          this.checked = false;
          this.selected = false;
          this.className = "";
          this.name = "";
          this.type = "";
          this.tabIndex = -1;
          this.hidden = false;
          this.disabled = false;
          this.shadowRoot = null;
          this.host = null;
          this.mode = null;
          this.__width = this.localName === "canvas" ? 300 : 0;
          this.__height = this.localName === "canvas" ? 150 : 0;
          if (this.localName === "canvas") {
            this.attributes.width = "300";
            this.attributes.height = "150";
          }
          if (this.localName === "template") {
            this.__templateContent = this.__newFragment();
          }
        }
      }
      function nodeTypeFor(tagName) {
        if (tagName === "#TEXT") return 3;
        if (tagName === "#FRAGMENT") return 11;
        return 1;
      }
      const EMPTY_CHILDREN = Object.freeze([]);
      function setElementId(element, value) {
        const next = String(value ?? "");
        const doc = element.ownerDocument;
        const prev = element._id || "";
        if (prev === next) {
          element._id = next;
          return;
        }
        if (doc && doc.__idMap) {
          if (prev) doc.__idMap.delete(prev);
          if (next) doc.__idMap.set(next, element);
        }
        element._id = next;
        if (prev !== next && doc && doc.__layoutScheduler) doc.__layoutScheduler.noteIdChange();
      }
      function installLazyDomState(prototype, mods) {
        Object.defineProperties(prototype, {
          style: {
            configurable: true,
            get() {
              const s = this._style || (this._style = new mods.VirtualStyleDeclaration());
              s.__owner = this;
              return s;
            }
          },
          classList: {
            configurable: true,
            get() {
              return this._classList || (this._classList = new mods.VirtualClassList(this));
            }
          },
          attributes: {
            configurable: true,
            get() {
              return this._attributes || (this._attributes = {});
            }
          },
          listeners: {
            configurable: true,
            get() {
              return this._listeners || (this._listeners = {});
            }
          },
          dataset: {
            configurable: true,
            get() {
              return this._dataset || (this._dataset = {});
            }
          },
          children: {
            configurable: true,
            get() {
              return this._children || EMPTY_CHILDREN;
            },
            set(value) {
              this._children = value && value.length ? value : void 0;
            }
          },
          childNodes: {
            configurable: true,
            get() {
              return this._children || EMPTY_CHILDREN;
            },
            set(value) {
              this._children = value && value.length ? value : void 0;
            }
          },
          id: {
            configurable: true,
            get() {
              return this._id || "";
            },
            set(value) {
              setElementId(this, value);
            }
          }
        });
        prototype.__mutableChildren = function() {
          return this._children || (this._children = []);
        };
      }
      modules.installVirtualElementProperties(VirtualElement.prototype);
      modules.installVirtualElementTreeBehavior(VirtualElement.prototype);
      modules.installVirtualElementCloneBehavior(VirtualElement.prototype);
      modules.installVirtualElementAttributeBehavior(VirtualElement.prototype);
      modules.installVirtualElementEventSupport(VirtualElement.prototype);
      modules.installVirtualElementEventBehavior(VirtualElement.prototype);
      modules.installVirtualElementQueryBehavior(VirtualElement.prototype);
      modules.installVirtualElementContentBehavior(VirtualElement.prototype);
      installLazyDomState(VirtualElement.prototype, modules);
      return { VirtualElement, EMPTY_CHILDREN, setElementId };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWebGLTextureArena.js
var require_VirtualWebGLTextureArena = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWebGLTextureArena.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualWebGLTextureArena = factory().VirtualWebGLTextureArena;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      class VirtualWebGLTextureArena {
        constructor() {
          this.textures = [];
          this.commands = [];
        }
        createTexture(kind, owner, width = 0, height = 0) {
          const texture = { id: this.textures.length, kind, ownerTag: owner?.tagName || null, width, height, commands: [] };
          this.textures.push(texture);
          this.commands.push({ op: "createTexture", id: texture.id, kind, width, height });
          return texture;
        }
        record(texture, op, data = {}) {
          const entry = { op, ...data };
          texture?.commands?.push(entry);
          this.commands.push({ texture: texture?.id ?? null, ...entry });
          return entry;
        }
        snapshot() {
          return { textures: this.textures.map((t) => ({ id: t.id, kind: t.kind, ownerTag: t.ownerTag, width: t.width, height: t.height, commands: t.commands })), commands: this.commands };
        }
      }
      return { VirtualWebGLTextureArena };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualBytes.js
var require_VirtualBytes = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualBytes.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory());
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      function encodeUtf8(value) {
        return new TextEncoder().encode(String(value || ""));
      }
      function decodeUtf8(value) {
        return new TextDecoder().decode(normalizeBytes(value));
      }
      function byteLength(value) {
        if (typeof value === "number") {
          return value;
        }
        if (value?.byteLength !== void 0) {
          return Number(value.byteLength);
        }
        if (Array.isArray(value)) {
          return value.length * 4;
        }
        return encodeUtf8(value).byteLength;
      }
      function normalizeBytes(value) {
        if (!value) {
          return new Uint8Array();
        }
        if (value instanceof Uint8Array) {
          return value.slice();
        }
        if (value instanceof ArrayBuffer) {
          return new Uint8Array(value.slice(0));
        }
        if (ArrayBuffer.isView(value)) {
          return new Uint8Array(
            value.buffer,
            value.byteOffset,
            value.byteLength
          ).slice();
        }
        if (Array.isArray(value)) {
          return Uint8Array.from(value);
        }
        return encodeUtf8(value);
      }
      function decodeBase64Bytes(value) {
        const binary = globalThis.atob(String(value || ""));
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
          bytes[index] = binary.charCodeAt(index);
        }
        return bytes;
      }
      function decodeBase64(value) {
        return decodeUtf8(decodeBase64Bytes(value));
      }
      return {
        byteLength,
        decodeBase64,
        decodeBase64Bytes,
        decodeUtf8,
        encodeUtf8,
        normalizeBytes
      };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFontGlyphs.js
var require_VirtualFontGlyphs = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFontGlyphs.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory());
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      function virtualGlyphMask(character) {
        if (character === " ") {
          return Array.from({ length: 7 }, () => "00000");
        }
        const code = String(character || "?").codePointAt(0) || 63;
        return Array.from({ length: 7 }, (_unused, row) => {
          return Array.from({ length: 5 }, (_cell, column) => {
            const bit = code >> (row * 5 + column) % 16 & 1;
            return bit ? "1" : "0";
          }).join("");
        });
      }
      function virtualFontSize(font) {
        const match = String(font || "").match(/(\d+(?:\.\d+)?)px/);
        return match ? Number(match[1]) : 10;
      }
      return { virtualFontSize, virtualGlyphMask };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFontMetrics.js
var require_VirtualFontMetrics = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFontMetrics.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory());
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      function measureVirtualText(atlas, text, font, size, hook) {
        if (hook) {
          const measured = hook(String(text), String(font));
          if (measured && Number.isFinite(Number(measured.width))) {
            return {
              ...measured,
              font,
              source: measured.source || "measure-hook"
            };
          }
        }
        const scale = size / 10;
        const width = Array.from(String(text || "")).reduce((total, character) => {
          return total + atlas.glyph(character, size).advance;
        }, 0) * scale;
        return {
          actualBoundingBoxAscent: size * 0.82,
          actualBoundingBoxDescent: size * 0.22,
          emHeightAscent: size * 0.82,
          emHeightDescent: size * 0.22,
          font,
          source: "merkava-deterministic-glyph-atlas",
          width
        };
      }
      return { measureVirtualText };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFontAtlas.js
var require_VirtualFontAtlas = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFontAtlas.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory(
          require_VirtualBytes(),
          require_VirtualFontGlyphs(),
          require_VirtualFontMetrics()
        );
      } else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualFontAtlas = factory(
          root.Merkava,
          root.Merkava,
          root.Merkava
        ).VirtualFontAtlas;
      }
    })(typeof self !== "undefined" ? self : exports, function(bytesMod, glyphMod, metricsMod) {
      class VirtualFontAtlas {
        constructor() {
          this.fonts = [];
          this.textRuns = [];
          this.measureHook = null;
          this.glyphs = /* @__PURE__ */ new Map();
          this.atlases = /* @__PURE__ */ new Map();
          this.oversample = 8;
        }
        registerFont(name, bytes, meta = {}) {
          const data = bytesMod.normalizeBytes(bytes);
          const font = {
            bytes: data.byteLength,
            id: this.fonts.length,
            meta,
            name: String(name || `font-${this.fonts.length}`)
          };
          this.fonts.push(font);
          return font;
        }
        setMeasureHook(hook) {
          this.measureHook = typeof hook === "function" ? hook : null;
          return Boolean(this.measureHook);
        }
        recordText(run) {
          const item = {
            id: this.textRuns.length,
            metrics: this.measure(run.text, run.font),
            ...run
          };
          this.textRuns.push(item);
          return item;
        }
        measure(text, font = "10px sans-serif") {
          const size = glyphMod.virtualFontSize(font);
          return metricsMod.measureVirtualText(
            this,
            text,
            font,
            size,
            this.measureHook
          );
        }
        glyph(character, size = 14) {
          const key = `${Math.round(size)}:${character}`;
          if (this.glyphs.has(key)) {
            return this.glyphs.get(key);
          }
          const mask = glyphMod.virtualGlyphMask(character);
          const glyph = {
            advance: character === " " ? 4 : 6,
            char: character,
            height: mask.length,
            mask,
            oversample: this.oversample,
            size: Math.round(size),
            width: mask[0].length
          };
          this.glyphs.set(key, glyph);
          this.recordGlyphInAtlas(character, size);
          return glyph;
        }
        recordGlyphInAtlas(character, size) {
          const atlasKey = String(Math.round(size));
          const atlas = this.atlases.get(atlasKey) || {
            glyphs: [],
            size: Math.round(size)
          };
          atlas.glyphs.push({
            char: character,
            index: atlas.glyphs.length
          });
          this.atlases.set(atlasKey, atlas);
        }
        snapshot() {
          return {
            atlases: Array.from(this.atlases.values()),
            fonts: this.fonts,
            glyphCount: this.glyphs.size,
            oversample: this.oversample,
            textRuns: this.textRuns
          };
        }
      }
      return { VirtualFontAtlas };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/CssNamedColorsAtoL.js
var require_CssNamedColorsAtoL = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/CssNamedColorsAtoL.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.Merkava = root.Merkava || {};
        root.Merkava.CssNamedColorsAtoL = factory().CssNamedColorsAtoL;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      const CssNamedColorsAtoL = Object.freeze({
        aliceblue: "#f0f8ff",
        antiquewhite: "#faebd7",
        aqua: "#00ffff",
        aquamarine: "#7fffd4",
        azure: "#f0ffff",
        beige: "#f5f5dc",
        bisque: "#ffe4c4",
        black: "#000000",
        blanchedalmond: "#ffebcd",
        blue: "#0000ff",
        blueviolet: "#8a2be2",
        brown: "#a52a2a",
        burlywood: "#deb887",
        cadetblue: "#5f9ea0",
        chartreuse: "#7fff00",
        chocolate: "#d2691e",
        coral: "#ff7f50",
        cornflowerblue: "#6495ed",
        cornsilk: "#fff8dc",
        crimson: "#dc143c",
        cyan: "#00ffff",
        darkblue: "#00008b",
        darkcyan: "#008b8b",
        darkgoldenrod: "#b8860b",
        darkgray: "#a9a9a9",
        darkgreen: "#006400",
        darkgrey: "#a9a9a9",
        darkkhaki: "#bdb76b",
        darkmagenta: "#8b008b",
        darkolivegreen: "#556b2f",
        darkorange: "#ff8c00",
        darkorchid: "#9932cc",
        darkred: "#8b0000",
        darksalmon: "#e9967a",
        darkseagreen: "#8fbc8f",
        darkslateblue: "#483d8b",
        darkslategray: "#2f4f4f",
        darkslategrey: "#2f4f4f",
        darkturquoise: "#00ced1",
        darkviolet: "#9400d3",
        deeppink: "#ff1493",
        deepskyblue: "#00bfff",
        dimgray: "#696969",
        dimgrey: "#696969",
        dodgerblue: "#1e90ff",
        firebrick: "#b22222",
        floralwhite: "#fffaf0",
        forestgreen: "#228b22",
        fuchsia: "#ff00ff",
        gainsboro: "#dcdcdc",
        ghostwhite: "#f8f8ff",
        gold: "#ffd700",
        goldenrod: "#daa520",
        gray: "#808080",
        green: "#008000",
        greenyellow: "#adff2f",
        grey: "#808080",
        honeydew: "#f0fff0",
        hotpink: "#ff69b4",
        indianred: "#cd5c5c",
        indigo: "#4b0082",
        ivory: "#fffff0",
        khaki: "#f0e68c",
        lavender: "#e6e6fa",
        lavenderblush: "#fff0f5",
        lawngreen: "#7cfc00",
        lemonchiffon: "#fffacd",
        lightblue: "#add8e6",
        lightcoral: "#f08080",
        lightcyan: "#e0ffff",
        lightgoldenrodyellow: "#fafad2",
        lightgray: "#d3d3d3",
        lightgreen: "#90ee90",
        lightgrey: "#d3d3d3",
        lightpink: "#ffb6c1",
        lightsalmon: "#ffa07a",
        lightseagreen: "#20b2aa",
        lightskyblue: "#87cefa",
        lightslategray: "#778899",
        lightslategrey: "#778899",
        lightsteelblue: "#b0c4de",
        lightyellow: "#ffffe0",
        lime: "#00ff00",
        limegreen: "#32cd32",
        linen: "#faf0e6"
      });
      return {
        CssNamedColorsAtoL
      };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/CssNamedColorsMtoZ.js
var require_CssNamedColorsMtoZ = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/CssNamedColorsMtoZ.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.Merkava = root.Merkava || {};
        root.Merkava.CssNamedColorsMtoZ = factory().CssNamedColorsMtoZ;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      const CssNamedColorsMtoZ = Object.freeze({
        magenta: "#ff00ff",
        maroon: "#800000",
        mediumaquamarine: "#66cdaa",
        mediumblue: "#0000cd",
        mediumorchid: "#ba55d3",
        mediumpurple: "#9370db",
        mediumseagreen: "#3cb371",
        mediumslateblue: "#7b68ee",
        mediumspringgreen: "#00fa9a",
        mediumturquoise: "#48d1cc",
        mediumvioletred: "#c71585",
        midnightblue: "#191970",
        mintcream: "#f5fffa",
        mistyrose: "#ffe4e1",
        moccasin: "#ffe4b5",
        navajowhite: "#ffdead",
        navy: "#000080",
        oldlace: "#fdf5e6",
        olive: "#808000",
        olivedrab: "#6b8e23",
        orange: "#ffa500",
        orangered: "#ff4500",
        orchid: "#da70d6",
        palegoldenrod: "#eee8aa",
        palegreen: "#98fb98",
        paleturquoise: "#afeeee",
        palevioletred: "#db7093",
        papayawhip: "#ffefd5",
        peachpuff: "#ffdab9",
        peru: "#cd853f",
        pink: "#ffc0cb",
        plum: "#dda0dd",
        powderblue: "#b0e0e6",
        purple: "#800080",
        rebeccapurple: "#663399",
        red: "#ff0000",
        rosybrown: "#bc8f8f",
        royalblue: "#4169e1",
        saddlebrown: "#8b4513",
        salmon: "#fa8072",
        sandybrown: "#f4a460",
        seagreen: "#2e8b57",
        seashell: "#fff5ee",
        sienna: "#a0522d",
        silver: "#c0c0c0",
        skyblue: "#87ceeb",
        slateblue: "#6a5acd",
        slategray: "#708090",
        slategrey: "#708090",
        snow: "#fffafa",
        springgreen: "#00ff7f",
        steelblue: "#4682b4",
        tan: "#d2b48c",
        teal: "#008080",
        thistle: "#d8bfd8",
        tomato: "#ff6347",
        turquoise: "#40e0d0",
        violet: "#ee82ee",
        wheat: "#f5deb3",
        white: "#ffffff",
        whitesmoke: "#f5f5f5",
        yellow: "#ffff00",
        yellowgreen: "#9acd32"
      });
      return {
        CssNamedColorsMtoZ
      };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/CssColorFunctional.js
var require_CssColorFunctional = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/CssColorFunctional.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory());
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      function resolveFunctionalColor(text) {
        const rgb = String(text || "").match(/^rgba?\(([^)]+)\)$/);
        if (rgb) {
          return rgbColor2(rgb[1]);
        }
        const hsl = String(text || "").match(/^hsla?\(([^)]+)\)$/);
        return hsl ? hslColor(hsl[1]) : null;
      }
      function rgbColor2(body) {
        const parts = splitChannels(body);
        const [red, green, blue] = parts.slice(0, 3).map(channel);
        return serializeInternal(red, green, blue, parts[3]);
      }
      function hslColor(body) {
        const parts = splitChannels(body);
        const hue = hueDegrees(parts[0]);
        const saturation = percentage(parts[1]);
        const lightness = percentage(parts[2]);
        const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
        const x = chroma * (1 - Math.abs(hue / 60 % 2 - 1));
        const offset = lightness - chroma / 2;
        const sector = Math.floor(hue / 60) % 6;
        const vectors = [
          [chroma, x, 0],
          [x, chroma, 0],
          [0, chroma, x],
          [0, x, chroma],
          [x, 0, chroma],
          [chroma, 0, x]
        ];
        const channels = vectors[sector].map((value) => Math.round((value + offset) * 255));
        return serializeInternal(...channels, parts[3]);
      }
      function hueDegrees(value) {
        const text = String(value || "0").trim();
        const number = Number.parseFloat(text) || 0;
        const degrees = text.endsWith("turn") ? number * 360 : text.endsWith("grad") ? number * 0.9 : text.endsWith("rad") ? number * 180 / Math.PI : number;
        return (degrees % 360 + 360) % 360;
      }
      function serializeInternal(red, green, blue, alphaToken) {
        const opacity = alphaToken == null ? 1 : alpha(alphaToken);
        const channels = [red, green, blue].map(clamp);
        if (opacity < 1) {
          return `rgba(${channels[0]},${channels[1]},${channels[2]},${opacity})`;
        }
        return "#" + channels.map((value) => value.toString(16).padStart(2, "0")).join("");
      }
      function splitChannels(body) {
        return String(body || "").split(/[,/\s]+/).filter(Boolean);
      }
      function channel(value) {
        return clamp(String(value).endsWith("%") ? Number.parseFloat(value) * 2.55 : Number.parseFloat(value));
      }
      function percentage(value) {
        return Math.max(0, Math.min(1, Number.parseFloat(value) / 100));
      }
      function alpha(value) {
        return Math.max(0, Math.min(1, String(value).endsWith("%") ? Number.parseFloat(value) / 100 : Number.parseFloat(value)));
      }
      function clamp(value) {
        return Math.max(0, Math.min(255, Math.round(Number.isFinite(value) ? value : 0)));
      }
      return {
        resolveFunctionalColor,
        serializeInternal
      };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/CssColorResolver.js
var require_CssColorResolver = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/CssColorResolver.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory(
          require_CssNamedColorsAtoL(),
          require_CssNamedColorsMtoZ(),
          require_CssColorFunctional()
        );
      } else {
        root.Merkava = root.Merkava || {};
        root.Merkava.CssColorResolver = factory(
          root.Merkava,
          root.Merkava,
          root.Merkava
        ).CssColorResolver;
      }
    })(typeof self !== "undefined" ? self : exports, function(leftMod, rightMod, functionalMod) {
      const namedColors = Object.freeze({
        ...leftMod.CssNamedColorsAtoL,
        ...rightMod.CssNamedColorsMtoZ
      });
      class CssColorResolver {
        /**
         * @param {string} value CSS color token from the cascade.
         * @param {string} current Resolved inherited color for currentColor.
         * @returns {string} Internal color token or untouched unsupported syntax.
         */
        normalize(value, current = "#000000") {
          const text = String(value || "").trim().toLowerCase();
          if (!text) {
            return "";
          }
          if (text === "currentcolor") {
            return this.normalize(current);
          }
          if (text === "transparent") {
            return "rgba(0,0,0,0)";
          }
          if (namedColors[text]) {
            return namedColors[text];
          }
          if (/^#[0-9a-f]{8}$/i.test(text)) {
            return rgbaFromHex8(text);
          }
          if (/^#[0-9a-f]{6}$/i.test(text)) {
            return text;
          }
          if (/^#[0-9a-f]{4}$/i.test(text)) {
            return rgbaFromHex8(expandHex(text));
          }
          if (/^#[0-9a-f]{3}$/i.test(text)) {
            return expandHex(text);
          }
          return functionalMod.resolveFunctionalColor(text) || String(value);
        }
      }
      function rgbaFromHex8(text) {
        const red = parseInt(text.slice(1, 3), 16);
        const green = parseInt(text.slice(3, 5), 16);
        const blue = parseInt(text.slice(5, 7), 16);
        const opacity = +(parseInt(text.slice(7, 9), 16) / 255).toFixed(3);
        return functionalMod.serializeInternal(red, green, blue, opacity);
      }
      function expandHex(text) {
        return "#" + text.slice(1).split("").map((value) => value + value).join("");
      }
      return {
        CssColorResolver
      };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/CssValueResolver.js
var require_CssValueResolver = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/CssValueResolver.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory(require_CssColorResolver());
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.CssValueResolver = factory(root.Merkava).CssValueResolver;
      }
    })(typeof self !== "undefined" ? self : exports, function(colorMod) {
      const CssColorResolver = colorMod.CssColorResolver;
      const colorProps = /* @__PURE__ */ new Set(["color", "background-color", "border-color", "border-left-color", "border-right-color", "border-top-color", "border-bottom-color", "outline-color"]);
      class CssValueResolver {
        constructor() {
          this.colors = new CssColorResolver();
        }
        resolveDeclarations(style, inherited = {}) {
          const vars = { ...pickVars(inherited), ...pickVars(style) };
          const out = /* @__PURE__ */ Object.create(null);
          for (const [key, value] of Object.entries(style || {})) {
            if (key.startsWith("--")) {
              out[key] = String(value);
              continue;
            }
            let resolved = this.resolveValue(String(value ?? ""), vars, 0, /* @__PURE__ */ new Set());
            if (resolved === INVALID) resolved = "";
            resolved = this.resolveMath(resolved);
            out[key] = colorProps.has(key) ? this.colors.normalize(resolved, out.color || inherited.color) : resolved;
          }
          return out;
        }
        resolveValue(value, vars, depth, seen) {
          if (depth > 64) return INVALID;
          const chain = seen || /* @__PURE__ */ new Set();
          const text = String(value || "");
          let out = "", at = 0;
          while (at < text.length) {
            const found = findVarFunction(text, at);
            if (found < 0) {
              out += text.slice(at);
              break;
            }
            out += text.slice(at, found);
            const open = found + 3;
            const close = balancedParenEnd2(text, open);
            if (close < 0) {
              out += text.slice(found);
              break;
            }
            const body = text.slice(open + 1, close);
            const [name, ...fallbackParts] = splitArgs2(body);
            const key = String(name || "").trim();
            const hasFallback = fallbackParts.length > 0;
            const fallback = fallbackParts.join(",").trim();
            let replacement = INVALID;
            if (key.startsWith("--") && Object.prototype.hasOwnProperty.call(vars, key) && !chain.has(key)) {
              const next = new Set(chain);
              next.add(key);
              replacement = this.resolveValue(String(vars[key]), vars, depth + 1, next);
            }
            if (replacement === INVALID && hasFallback) {
              replacement = this.resolveValue(fallback, vars, depth + 1, chain);
            }
            if (replacement === INVALID) return INVALID;
            out += replacement;
            at = close + 1;
          }
          return out.replace(/\b(currentColor)\b/gi, vars.currentColor || vars.color || "#000000");
        }
        resolveMath(value) {
          let out = String(value || "");
          for (let i = 0; i < 6; i++) {
            const next = out.replace(/\b(min|max|clamp)\(([^()]+)\)/g, (_all, fn, body) => mathFn(fn, body));
            if (next === out) break;
            out = next;
          }
          return out;
        }
      }
      const INVALID = /* @__PURE__ */ Symbol("merkava-css-invalid");
      function findVarFunction(text, from) {
        let quote = "";
        for (let at = from; at + 3 < text.length; at++) {
          const ch = text[at];
          if (quote) {
            if (ch === quote) quote = "";
            continue;
          }
          if (ch === '"' || ch === "'") {
            quote = ch;
            continue;
          }
          if ((ch === "v" || ch === "V") && text.slice(at, at + 4).toLowerCase() === "var(") return at;
        }
        return -1;
      }
      function balancedParenEnd2(text, openAt) {
        let depth = 0, quote = "";
        for (let at = openAt; at < text.length; at++) {
          const ch = text[at];
          if (quote) {
            if (ch === quote) quote = "";
            continue;
          }
          if (ch === '"' || ch === "'") {
            quote = ch;
            continue;
          }
          if (ch === "(") depth++;
          else if (ch === ")") {
            depth--;
            if (depth === 0) return at;
          }
        }
        return -1;
      }
      function mathFn(fn, body) {
        const args = splitArgs2(body).map((x) => x.trim()).filter(Boolean);
        const parsed = args.map(parseNumericUnit);
        if (!parsed.length || parsed.some((x) => !x)) return `${fn}(${body})`;
        const unit = parsed.find((x) => x.unit)?.unit || parsed[0].unit || "px";
        if (parsed.some((x) => x.unit && x.unit !== unit)) return `${fn}(${body})`;
        const vals = parsed.map((x) => x.value);
        const n2 = fn === "min" ? Math.min(...vals) : fn === "max" ? Math.max(...vals) : Math.max(vals[0], Math.min(vals[2] ?? vals[1], vals[1]));
        return `${round(n2)}${unit}`;
      }
      function parseNumericUnit(value) {
        const m = String(value || "").trim().match(/^(-?\d+(?:\.\d+)?)(px|%|em|rem|vw|vh|vmin|vmax|ch|ex|lh|rlh)?$/);
        return m ? { value: Number.parseFloat(m[1]), unit: m[2] || "" } : null;
      }
      function pickVars(style) {
        const out = /* @__PURE__ */ Object.create(null);
        for (const [key, value] of Object.entries(style || {})) {
          if (key.startsWith("--")) out[key] = value;
          if (key === "color") out.color = value;
        }
        return out;
      }
      function splitArgs2(value) {
        const out = [];
        let buf = "", depth = 0, quote = "";
        for (const ch of String(value || "")) {
          if (quote) {
            buf += ch;
            if (ch === quote) quote = "";
            continue;
          }
          if (ch === '"' || ch === "'") {
            quote = ch;
            buf += ch;
            continue;
          }
          if (ch === "(") depth++;
          if (ch === ")") depth = Math.max(0, depth - 1);
          if (ch === "," && depth === 0) {
            out.push(buf);
            buf = "";
            continue;
          }
          buf += ch;
        }
        out.push(buf);
        return out;
      }
      function round(n2) {
        return Number.isInteger(n2) ? String(n2) : String(+n2.toFixed(4));
      }
      return { CssValueResolver };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssCascade.js
var require_CssCascade = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssCascade.js"(exports, module) {
    {
      let cascadeCss2 = function(element, rules, parentStyle = {}, inline = [], ruleIndex = null) {
        const winners = /* @__PURE__ */ new Map();
        const candidates = ruleIndex && cssRuleCandidates2 ? cssRuleCandidates2(ruleIndex, element) : rules || [];
        const elKeys = ruleIndex && matchesIndexedCssRule2 ? elementKeys2(element) : void 0;
        const matches = ruleIndex && matchesIndexedCssRule2 ? (rule) => matchesIndexedCssRule2(element, rule, ruleIndex, elKeys) : (rule) => matchesCompiledSelectorList(element, compileSelectorList(rule.selector), elKeys);
        for (const rule of candidates) {
          if (!matches(rule)) continue;
          for (const declaration of rule.declarations) {
            consider2(winners, declaration, rule.specificity, rule.order);
          }
        }
        for (const declaration of inline || []) {
          consider2(winners, declaration, [1, 0, 0, 0], Number.MAX_SAFE_INTEGER);
        }
        const out = inheritDefaults2(parentStyle);
        for (const [name, winner] of winners) applyWinner2(out, parentStyle, name, winner.declaration.value);
        return out;
      }, consider2 = function(winners, declaration, specificity, order) {
        const current = winners.get(declaration.name);
        const candidate = { declaration, order, specificity };
        if (!current || compareCandidates2(candidate, current) >= 0) winners.set(declaration.name, candidate);
      }, compareCandidates2 = function(left, right) {
        const important = Number(left.declaration.important) - Number(right.declaration.important);
        if (important) return important;
        const specificity = compareSpecificity42(left.specificity, right.specificity);
        if (specificity) return specificity;
        return left.order - right.order;
      }, compareSpecificity42 = function(left, right) {
        if (left[0] !== right[0]) return left[0] - right[0];
        return compareSpecificity2(left.slice(1), right.slice(1));
      }, inheritDefaults2 = function(parentStyle) {
        const out = /* @__PURE__ */ Object.create(null);
        for (const [name, value] of Object.entries(parentStyle || {})) {
          if (isInheritedCssProperty2(name)) out[name] = value;
        }
        return out;
      }, applyWinner2 = function(out, parentStyle, name, value) {
        const normalized = String(value || "").trim();
        if (normalized === "inherit") {
          if (Object.prototype.hasOwnProperty.call(parentStyle, name)) out[name] = parentStyle[name];
          else delete out[name];
          return;
        }
        if (normalized === "unset") {
          if (isInheritedCssProperty2(name) && Object.prototype.hasOwnProperty.call(parentStyle, name)) out[name] = parentStyle[name];
          else delete out[name];
          return;
        }
        if (normalized === "initial" || normalized === "revert" || normalized === "revert-layer") {
          delete out[name];
          return;
        }
        out[name] = value;
      };
      cascadeCss = cascadeCss2, consider = consider2, compareCandidates = compareCandidates2, compareSpecificity4 = compareSpecificity42, inheritDefaults = inheritDefaults2, applyWinner = applyWinner2;
      const { compareSpecificity: compareSpecificity2 } = typeof module === "object" && module.exports ? require_CssSpecificity() : globalThis.Merkava;
      const { isInheritedCssProperty: isInheritedCssProperty2 } = typeof module === "object" && module.exports ? require_CssInheritedProperties() : globalThis.Merkava;
      const matcherPkg3 = typeof module === "object" && module.exports ? require_CssSelectorMatcher() : globalThis.Merkava;
      const { compileSelectorList, elementKeys: elementKeys2, matchesCompiledSelectorList } = matcherPkg3;
      const indexMod = typeof module === "object" && module.exports ? require_CssRuleIndex() : globalThis.Merkava;
      const { cssRuleCandidates: cssRuleCandidates2, matchesIndexedCssRule: matchesIndexedCssRule2 } = indexMod || {};
      const AwtsExports = { cascadeCss: cascadeCss2 };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var cascadeCss;
    var consider;
    var compareCandidates;
    var compareSpecificity4;
    var inheritDefaults;
    var applyWinner;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssDeclarationExpander.js
var require_CssDeclarationExpander = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssDeclarationExpander.js"(exports, module) {
    {
      let expandCssDeclarations2 = function(style) {
        const out = { ...style || {} };
        if (out.background) expandBackground2(out, out.background);
        if (out.border) expandBorder2(out, "", out.border);
        for (const side of ["left", "right", "top", "bottom"]) {
          const key = `border-${side}`;
          if (out[key]) expandBorder2(out, `-${side}`, out[key]);
        }
        if (out.margin) expandBoxShorthand2(out, "margin", out.margin);
        if (out.padding) expandBoxShorthand2(out, "padding", out.padding);
        if (out.flex) expandFlex2(out, out.flex);
        return out;
      }, expandBoxShorthand2 = function(out, base, value) {
        const parts = splitWhitespaceOutsideFunctions2(value);
        if (!parts.length) return;
        const [top, right = top, bottom = top, left = right] = parts;
        if (!out[`${base}-top`]) out[`${base}-top`] = top;
        if (!out[`${base}-right`]) out[`${base}-right`] = right;
        if (!out[`${base}-bottom`]) out[`${base}-bottom`] = bottom;
        if (!out[`${base}-left`]) out[`${base}-left`] = left;
      }, expandFlex2 = function(out, value) {
        const text = String(value || "").trim().toLowerCase();
        if (!text) return;
        if (text === "none") {
          if (!out["flex-grow"]) out["flex-grow"] = "0";
          if (!out["flex-shrink"]) out["flex-shrink"] = "0";
          if (!out["flex-basis"]) out["flex-basis"] = "auto";
          return;
        }
        if (text === "auto") {
          if (!out["flex-grow"]) out["flex-grow"] = "1";
          if (!out["flex-shrink"]) out["flex-shrink"] = "1";
          if (!out["flex-basis"]) out["flex-basis"] = "auto";
          return;
        }
        const parts = splitWhitespaceOutsideFunctions2(value);
        const isNumber = (t) => /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(t);
        if (parts.length === 1 && isNumber(parts[0])) {
          if (!out["flex-grow"]) out["flex-grow"] = parts[0];
          if (!out["flex-shrink"]) out["flex-shrink"] = "1";
          if (!out["flex-basis"]) out["flex-basis"] = "0%";
          return;
        }
        if (parts.length >= 1 && isNumber(parts[0])) {
          if (!out["flex-grow"]) out["flex-grow"] = parts[0];
          if (parts.length >= 2 && isNumber(parts[1]) && !out["flex-shrink"]) out["flex-shrink"] = parts[1];
          if (parts.length >= 3 && !out["flex-basis"]) out["flex-basis"] = parts.slice(2).join(" ");
          return;
        }
        if (!out["flex-basis"]) out["flex-basis"] = value;
        if (!out["flex-grow"]) out["flex-grow"] = "1";
        if (!out["flex-shrink"]) out["flex-shrink"] = "1";
      }, expandBackground2 = function(out, value) {
        if (!out["background-image"]) {
          const image = firstImage2(value);
          if (image) out["background-image"] = image;
        }
        if (!out["background-color"]) {
          const color = lastColorCandidate3(value);
          if (color) out["background-color"] = color;
        }
      }, expandBorder2 = function(out, suffix, value) {
        const widthKey = `border${suffix}-width`;
        const colorKey = `border${suffix}-color`;
        const parts = splitWhitespaceOutsideFunctions2(value);
        if (!out[widthKey]) out[widthKey] = parts.find(isBorderWidth2) || value;
        if (!out[colorKey]) out[colorKey] = parts.find(isColorCandidate2) || value;
      }, firstImage2 = function(value) {
        const text = String(value || "");
        for (const name of ["linear-gradient", "radial-gradient", "conic-gradient", "url"]) {
          const at = text.toLowerCase().indexOf(`${name}(`);
          if (at < 0) continue;
          const end = balancedFunctionEnd2(text, at + name.length);
          if (end > at) return text.slice(at, end);
        }
        return "";
      }, lastColorCandidate3 = function(value) {
        const parts = splitWhitespaceOutsideFunctions2(value);
        for (let index = parts.length - 1; index >= 0; index -= 1) {
          if (isColorCandidate2(parts[index])) return parts[index];
        }
        return "";
      }, splitWhitespaceOutsideFunctions2 = function(value) {
        const text = String(value || "");
        const parts = [];
        let start = 0;
        let depth = 0;
        for (let at = 0; at <= text.length; at += 1) {
          if (text[at] === "(") depth += 1;
          if (text[at] === ")") depth = Math.max(0, depth - 1);
          if ((at === text.length || isSpace2(text[at])) && depth === 0) {
            const part = text.slice(start, at).trim();
            if (part) parts.push(part);
            while (isSpace2(text[at + 1])) at += 1;
            start = at + 1;
          }
        }
        return parts;
      }, balancedFunctionEnd2 = function(text, openAt) {
        let depth = 0;
        for (let at = openAt; at < text.length; at += 1) {
          if (text[at] === "(") depth += 1;
          if (text[at] === ")") depth -= 1;
          if (depth === 0) return at + 1;
        }
        return text.length;
      }, isBorderWidth2 = function(value) {
        return value === "thin" || value === "medium" || value === "thick" || /^(?:\d|\.)/.test(value);
      }, isColorCandidate2 = function(value) {
        const lower = String(value || "").toLowerCase();
        return lower.startsWith("#") || lower.startsWith("rgb(") || lower.startsWith("rgba(") || lower.startsWith("hsl(") || lower.startsWith("hsla(") || /^[a-z-]+$/.test(lower);
      }, isSpace2 = function(character) {
        return character === " " || character === "\n" || character === "\r" || character === "	";
      };
      expandCssDeclarations = expandCssDeclarations2, expandBoxShorthand = expandBoxShorthand2, expandFlex = expandFlex2, expandBackground = expandBackground2, expandBorder = expandBorder2, firstImage = firstImage2, lastColorCandidate2 = lastColorCandidate3, splitWhitespaceOutsideFunctions = splitWhitespaceOutsideFunctions2, balancedFunctionEnd = balancedFunctionEnd2, isBorderWidth = isBorderWidth2, isColorCandidate = isColorCandidate2, isSpace = isSpace2;
      const AwtsExports = { expandCssDeclarations: expandCssDeclarations2 };
      if (typeof module === "object" && module.exports) {
        module.exports = AwtsExports;
      } else {
        globalThis.Merkava = globalThis.Merkava || {};
        Object.assign(globalThis.Merkava, AwtsExports);
      }
    }
    var expandCssDeclarations;
    var expandBoxShorthand;
    var expandFlex;
    var expandBackground;
    var expandBorder;
    var firstImage;
    var lastColorCandidate2;
    var splitWhitespaceOutsideFunctions;
    var balancedFunctionEnd;
    var isBorderWidth;
    var isColorCandidate;
    var isSpace;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualCssEngine.js
var require_VirtualCssEngine = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualCssEngine.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory(
          require_CssValueResolver(),
          require_CssRuleCompiler(),
          require_CssCascade(),
          require_CssDeclarationParser(),
          require_CssDeclarationExpander(),
          require_CssSpecificity(),
          require_CssRuleIndex()
        );
      } else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualCssEngine = factory(
          root.Merkava,
          root.Merkava,
          root.Merkava,
          root.Merkava,
          root.Merkava,
          root.Merkava,
          root.Merkava
        ).VirtualCssEngine;
      }
    })(typeof self !== "undefined" ? self : exports, function(valueMod, compiler, cascade, declarationMod, expander, specificityMod, indexMod) {
      const CssValueResolver = valueMod.CssValueResolver;
      class VirtualCssEngine {
        constructor(options = {}) {
          this.atRules = [];
          this.environment = {
            height: Number(options.height || 768),
            supports: options.supports,
            type: options.type || "screen",
            width: Number(options.width || 1024)
          };
          this.order = 0;
          this.rules = [];
          this.values = new CssValueResolver();
          this.ruleVersion = 0;
          this.ruleIndex = null;
          this.styleCache = /* @__PURE__ */ new WeakMap();
          this.sharedStyles = /* @__PURE__ */ new Map();
          this.selectorFeatures = { unsafeForCache: false };
        }
        /** Adds one programmatic author rule using tuple specificity and source order. */
        addRule(selector, declarations) {
          const clean = String(selector || "").trim();
          if (!clean) return;
          this.rules.push(Object.freeze({
            declarations: compiler.declarationsFromObject(declarations),
            order: this.order,
            selector: clean,
            specificity: Object.freeze([0, ...specificityMod.cssSpecificity(clean)])
          }));
          this.order += 1;
          this.noteRuleAdded(clean);
        }
        /** Parses and compiles stylesheet text without regex rule extraction. */
        parseStyleSheet(cssText) {
          const compiled = compiler.compileCssStyleSheet(cssText, this.environment, this.order);
          this.rules.push(...compiled.rules);
          this.atRules.push(...compiled.atRules);
          this.order = compiled.nextOrder;
          this.noteRuleAdded(cssText);
        }
        /** Records a stylesheet change: bumps the version, drops the index and shared pool. */
        noteRuleAdded(selectorText) {
          this.ruleVersion += 1;
          this.ruleIndex = null;
          this.sharedStyles.clear();
          if (selectorText && hasUnsafeSelectorFeatures(selectorText)) {
            this.selectorFeatures.unsafeForCache = true;
          }
        }
        /** Returns the cached rule index, building it on first use per rule version. */
        getIndex() {
          if (!this.ruleIndex) {
            this.ruleIndex = indexMod.buildCssRuleIndex(this.rules);
          }
          return this.ruleIndex;
        }
        /**
         * Computes cascaded and resolved declarations for one virtual DOM element.
         * Results are cached by style fingerprint; identical elements share one
         * computed style object.
         */
        compute(element) {
          const fingerprint = this.styleFingerprint(element);
          if (fingerprint !== null) {
            const cached = this.styleCache.get(element);
            if (cached && cached.fingerprint === fingerprint) return cached.style;
            const shared = this.sharedStyles.get(fingerprint);
            if (shared !== void 0) {
              this.styleCache.set(element, { fingerprint, style: shared });
              return shared;
            }
          }
          const parent = element?.parentNode?.nodeType === 1 ? this.compute(element.parentNode) : {};
          const inline = inlineDeclarations(element, declarationMod);
          const raw = cascade.cascadeCss(element, this.rules, parent, inline, this.getIndex());
          const expanded = expander.expandCssDeclarations(raw);
          const style = this.values.resolveDeclarations(expanded, parent);
          if (fingerprint !== null) {
            if (this.sharedStyles.size < 1e4) this.sharedStyles.set(fingerprint, style);
            this.styleCache.set(element, { fingerprint, style });
          }
          return style;
        }
        /**
         * Fingerprint of all live state that can affect an element's computed
         * style: rule version, own attributes/inline style/dynamic state, and
         * the ancestor chain (recursively fingerprinted). Read live on every
         * call, so any DOM mutation that could change matching yields a
         * different fingerprint — invalidation is automatic and exact.
         * Returns null when the stylesheet uses selector features outside the
         * fingerprint's reach (:has, sibling combinators, structural pseudos).
         */
        styleFingerprint(element) {
          if (this.selectorFeatures.unsafeForCache) return null;
          if (!element || element.nodeType !== 1) return "r" + this.ruleVersion;
          const parent = element.parentNode;
          const parentFp = parent && parent.nodeType === 1 ? this.styleFingerprint(parent) : "r" + this.ruleVersion;
          if (parentFp === null) return null;
          return "e" + hashFingerprint(parentFp + "" + elementStateKey(element) + "" + this.ruleVersion);
        }
        /** Drops cached styles for one element (explicit invalidation hook). */
        invalidateElement(element) {
          if (element) this.styleCache.delete(element);
        }
        /** Drops cached styles for an element's whole subtree. */
        invalidateSubtree(element) {
          const stack = [element];
          while (stack.length) {
            const node = stack.pop();
            if (!node || node.nodeType !== 1) continue;
            this.styleCache.delete(node);
            const children = node.children || node.childNodes;
            if (children) for (const child of children) stack.push(child);
          }
        }
        /** Drops all cached and shared styles (e.g. after bulk DOM surgery). */
        invalidateAll() {
          this.styleCache = /* @__PURE__ */ new WeakMap();
          this.sharedStyles.clear();
        }
        /** Updates viewport facts used by media-query evaluation for future stylesheets. */
        setEnvironment(values = {}) {
          Object.assign(this.environment, values);
          this.ruleVersion += 1;
          this.ruleIndex = null;
          this.sharedStyles.clear();
        }
      }
      function elementStateKey(element) {
        const attrs = element.attributes || {};
        const keys = Object.keys(attrs).sort();
        let attrStr = "";
        for (const key of keys) attrStr += key + "=" + String(attrs[key]) + ";";
        const state = element.__merkavaState || {};
        const doc = element.ownerDocument || {};
        const styleObj = element.style;
        const styleKey = styleObj && typeof styleObj.toString === "function" && styleObj.props ? styleObj.toString() : "";
        return [
          element.localName || "",
          element.id || "",
          element.className || "",
          attrStr,
          styleKey,
          state.hover ? 1 : 0,
          state.active ? 1 : 0,
          state.visited ? 1 : 0,
          element.checked ? 1 : 0,
          element.disabled ? 1 : 0,
          element.selected ? 1 : 0,
          element.required ? 1 : 0,
          doc.activeElement === element ? 1 : 0,
          doc.__merkavaTargetId && doc.__merkavaTargetId === element.id ? 1 : 0
        ].join("\0");
      }
      function hashFingerprint(text) {
        let hash = 2166136261;
        for (let i = 0; i < text.length; i++) {
          hash ^= text.charCodeAt(i);
          hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(36);
      }
      function hasUnsafeSelectorFeatures(selectorText) {
        const text = String(selectorText || "").toLowerCase();
        if (text.includes(":has(")) return true;
        if (/:first-child|:last-child|:only-child|:nth-child|:nth-last-child|:first-of-type|:last-of-type|:only-of-type|:nth-of-type|:nth-last-of-type|:empty/.test(text)) return true;
        let quote = "";
        let depth = 0;
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (quote) {
            if (ch === "\\") i++;
            else if (ch === quote) quote = "";
            continue;
          }
          if (ch === '"' || ch === "'") {
            quote = ch;
            continue;
          }
          if (ch === "(" || ch === "[") {
            depth++;
            continue;
          }
          if (ch === ")" || ch === "]") {
            depth = Math.max(0, depth - 1);
            continue;
          }
          if (depth === 0 && (ch === "+" || ch === "~")) return true;
        }
        return false;
      }
      function inlineDeclarations(element, parser) {
        const declarations = element?.getAttribute?.("style") ? parser.parseCssDeclarations(element.getAttribute("style")) : [];
        const parsedNames = new Set(declarations.map((item) => item.name));
        for (const [name, value] of Object.entries(element?.style?.toJSON?.() || {})) {
          if (parsedNames.has(name)) continue;
          declarations.push(Object.freeze({ important: false, name, value: String(value) }));
        }
        return declarations;
      }
      return { VirtualCssEngine };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/LayoutScheduler.js
var require_LayoutScheduler = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/LayoutScheduler.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.LayoutScheduler = factory().LayoutScheduler;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      const COMPOSITOR_ONLY = /* @__PURE__ */ new Set([
        "transform",
        "translate",
        "rotate",
        "scale",
        "opacity",
        "transform-origin",
        "perspective",
        "perspective-origin",
        "backface-visibility"
      ]);
      const PAINT_ONLY = /* @__PURE__ */ new Set([
        "color",
        "background",
        "background-color",
        "background-image",
        "border-color",
        "outline",
        "outline-color",
        "box-shadow",
        "text-shadow",
        "visibility",
        "z-index",
        "cursor",
        "pointer-events",
        "fill",
        "stroke",
        "filter",
        "mix-blend-mode",
        "clip-path"
      ]);
      const LAYOUT_ATTRS = /* @__PURE__ */ new Set([
        "class",
        "id",
        "style",
        "width",
        "height",
        "hidden",
        "value",
        "placeholder",
        "type",
        "size",
        "cols",
        "rows"
      ]);
      class LayoutScheduler {
        constructor() {
          this.enabled = true;
          this.layoutDirty = true;
          this.engine = null;
          this.viewportFn = null;
          this.lastViewport = null;
          this.readDepth = 0;
          this.pendingReadFlush = false;
          this.compositorDirty = /* @__PURE__ */ new Set();
          this.paintDirty = /* @__PURE__ */ new Set();
          this.stats = {
            forcedSyncLayouts: 0,
            // full layout passes actually run
            skippedLayouts: 0,
            // frame()/read calls that reused the retained tree
            batchedReads: 0,
            // read batches coalesced into one layout
            compositorOnlyWrites: 0,
            paintOnlyWrites: 0,
            layoutWrites: 0
          };
        }
        /** Attaches the layout engine used for flushes. viewportFn returns {width,height}. */
        attachEngine(engine, viewportFn) {
          this.engine = engine || this.engine;
          if (viewportFn) this.viewportFn = viewportFn;
        }
        // ---- write side: batching (never runs layout) ----
        /** Classifies one inline-style write. Returns 'layout'|'paint'|'compositor'. */
        noteStyleChange(node, propName) {
          const prop = String(propName || "").toLowerCase();
          if (!this.enabled) return "layout";
          if (COMPOSITOR_ONLY.has(prop)) {
            if (node) this.compositorDirty.add(node);
            this.stats.compositorOnlyWrites++;
            return "compositor";
          }
          if (PAINT_ONLY.has(prop)) {
            if (node) this.paintDirty.add(node);
            this.stats.paintOnlyWrites++;
            return "paint";
          }
          this.layoutDirty = true;
          this.stats.layoutWrites++;
          return "layout";
        }
        /** Class attribute / classList changes: selectors may match layout props. */
        noteClassChange() {
          this.layoutDirty = true;
          this.stats.layoutWrites++;
        }
        /** id changes: selectors may match layout props. */
        noteIdChange() {
          this.layoutDirty = true;
          this.stats.layoutWrites++;
        }
        /** Generic attribute write. 'style' is handled per-property by assignText. */
        noteAttributeChange(node, name) {
          const key = String(name || "").toLowerCase();
          if (key === "style") return;
          if (!this.enabled) {
            this.layoutDirty = true;
            return;
          }
          if (LAYOUT_ATTRS.has(key) || key.startsWith("data-")) {
            this.layoutDirty = true;
            this.stats.layoutWrites++;
          } else {
            if (node) this.paintDirty.add(node);
            this.stats.paintOnlyWrites++;
          }
        }
        /** Appends/removes/moves nodes, innerHTML, textContent structure edits. */
        noteStructureChange() {
          this.layoutDirty = true;
          this.stats.layoutWrites++;
        }
        /** Text edits: affect intrinsic widths and line breaking. */
        noteTextChange() {
          this.layoutDirty = true;
          this.stats.layoutWrites++;
        }
        // ---- read side: batching ----
        /**
         * Opens a geometry-read section. If layout is dirty, arms a single
         * deferred flush shared by the whole batch (nested reads coalesce).
         */
        beginRead() {
          if (!this.enabled) return;
          this.readDepth++;
          if (this.readDepth === 1 && this.layoutDirty && this.engine) {
            this.pendingReadFlush = true;
          }
        }
        /** Closes a geometry-read section; flushes once per outermost batch. */
        endRead() {
          if (!this.enabled || this.readDepth === 0) return;
          this.readDepth--;
          if (this.readDepth === 0 && this.pendingReadFlush) {
            this.pendingReadFlush = false;
            this.stats.batchedReads++;
            this.forceLayout();
          }
        }
        // ---- frame side ----
        needsLayout() {
          return this.layoutDirty;
        }
        /**
         * The frame entry: returns the retained layout tree, running a full
         * layout only when dirty or the viewport changed. Clean frames cost ~0.
         */
        layoutIfNeeded(viewport) {
          if (!this.enabled || !this.engine) {
            if (this.engine) {
              this.stats.forcedSyncLayouts++;
              return this.engine.layout(viewport || this.currentViewport());
            }
            return null;
          }
          const vp = viewport || this.currentViewport();
          if (!this.layoutDirty && !this.viewportChanged(vp)) {
            this.stats.skippedLayouts++;
            return this.engine.tree;
          }
          return this.forceLayout(vp);
        }
        /** Unconditional layout — the only place a sync layout may originate. */
        forceLayout(viewport) {
          if (!this.engine) return null;
          const vp = viewport || this.currentViewport();
          const tree = this.engine.layout(vp);
          this.lastViewport = { width: vp.width, height: vp.height };
          this.layoutDirty = false;
          this.stats.forcedSyncLayouts++;
          return tree;
        }
        /** Compositor fast path: drain nodes with transform/opacity-only changes. */
        consumeCompositorDirty() {
          const out = Array.from(this.compositorDirty);
          this.compositorDirty.clear();
          return out;
        }
        /** Paint-only changes (repaint without layout). */
        consumePaintDirty() {
          const out = Array.from(this.paintDirty);
          this.paintDirty.clear();
          return out;
        }
        currentViewport() {
          if (this.viewportFn) {
            try {
              return this.viewportFn();
            } catch (_) {
            }
          }
          return this.lastViewport || { width: 760, height: 600 };
        }
        viewportChanged(vp) {
          const last = this.lastViewport;
          return !last || last.width !== vp.width || last.height !== vp.height;
        }
        resetStats() {
          for (const key of Object.keys(this.stats)) this.stats[key] = 0;
          this.compositorDirty.clear();
          this.paintDirty.clear();
        }
        summary() {
          return { ...this.stats, layoutDirty: this.layoutDirty };
        }
      }
      return { LayoutScheduler, COMPOSITOR_ONLY, PAINT_ONLY };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualDocument.js
var require_VirtualDocument = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualDocument.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory(require_VirtualElement(), require_VirtualWebGLTextureArena(), require_VirtualFontAtlas(), require_VirtualCssEngine(), require_LayoutScheduler());
      } else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualDocument = factory(root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava).VirtualDocument;
      }
    })(typeof self !== "undefined" ? self : exports, function(elements, arenaMod, fontMod, cssMod, schedMod) {
      const VirtualElement = elements.VirtualElement;
      const VirtualWebGLTextureArena = arenaMod.VirtualWebGLTextureArena;
      const VirtualFontAtlas = fontMod.VirtualFontAtlas;
      const VirtualCssEngine = cssMod.VirtualCssEngine;
      const LayoutScheduler = schedMod && schedMod.LayoutScheduler;
      class VirtualDocument {
        constructor() {
          this.textureArena = new VirtualWebGLTextureArena();
          this.fontAtlas = new VirtualFontAtlas();
          this.cssEngine = new VirtualCssEngine();
          this.__layoutScheduler = LayoutScheduler ? new LayoutScheduler() : null;
          this.journal = [];
          this.__idMap = /* @__PURE__ */ new Map();
          this.__selectorCache = /* @__PURE__ */ new Map();
          this.__nodePool = [];
          this.__suppressMutations = false;
          this.activeElement = null;
          this.readyState = "loading";
          this.title = "";
          this.__nextNodeId = 1;
          this.__mutationObservers = /* @__PURE__ */ new Set();
          this.__captureTypes = /* @__PURE__ */ Object.create(null);
          this.__bubbleTypes = /* @__PURE__ */ Object.create(null);
          this.documentElement = new VirtualElement("html", this);
          this.head = new VirtualElement("head", this);
          this.body = new VirtualElement("body", this);
          this.documentElement.appendChild(this.head);
          this.documentElement.appendChild(this.body);
          this.implementation = makeImplementation(this);
        }
        /**
         * B"H: pooled element checkout. Reset nodes come back with fresh ids
         * and tag state; the pool is bounded so it can never grow without limit.
         */
        __checkoutElement(tagName) {
          const pooled = this.__nodePool.pop();
          if (!pooled) return new VirtualElement(tagName, this);
          const tag = String(tagName);
          const upper = tag.toUpperCase();
          pooled.tagName = upper;
          pooled.nodeName = upper;
          pooled.localName = tag.toLowerCase();
          pooled.nodeType = upper === "#TEXT" ? 3 : upper === "#FRAGMENT" ? 11 : 1;
          pooled.ownerDocument = this;
          pooled.__nodeId = this.__nextNodeId++;
          pooled.__width = pooled.localName === "canvas" ? 300 : 0;
          pooled.__height = pooled.localName === "canvas" ? 150 : 0;
          if (pooled.localName === "canvas") {
            pooled.attributes.width = "300";
            pooled.attributes.height = "150";
          }
          if (pooled.localName === "template") {
            pooled.__templateContent = pooled.__newFragment();
          }
          return pooled;
        }
        /**
         * B"H: recycles a detached subtree into the pool. Every pooled field is
         * reset so a reused node can never leak prior state; ids are unregistered
         * from __idMap at recycle time.
         */
        __recycleNode(node) {
          const pool = this.__nodePool;
          const stack = [node];
          while (stack.length) {
            const n2 = stack.pop();
            if (!n2 || n2.nodeType !== 1 && n2.nodeType !== 3) continue;
            const kids = n2._children;
            if (kids) for (let i = 0; i < kids.length; i++) stack.push(kids[i]);
            n2.parentNode = null;
            n2._children = void 0;
            n2._attributes = null;
            n2._listeners = null;
            n2._dataset = null;
            n2._style = null;
            n2._classList = null;
            n2._textContent = "";
            n2.value = "";
            n2.checked = false;
            n2.selected = false;
            if (n2._id) {
              this.__idMap.delete(n2._id);
              n2._id = "";
            }
            n2.className = "";
            n2.name = "";
            n2.type = "";
            n2.tabIndex = -1;
            n2.hidden = false;
            n2.disabled = false;
            n2.shadowRoot = null;
            n2.host = null;
            n2.mode = null;
            n2.__width = 0;
            n2.__height = 0;
            n2.namespaceURI = null;
            n2.ownerSVGElement = null;
            n2.createSVGPoint = void 0;
            n2.__templateContent = null;
            n2.__canvas2dContext = null;
            n2.__webglContext = null;
            n2.__webglCanvasTexture = null;
            n2.tagName = "";
            n2.nodeName = "";
            n2.localName = "";
            n2.nodeType = 1;
            n2.ownerDocument = this;
            if (pool.length < 1024) pool.push(n2);
          }
        }
        createElement(tagName) {
          return this.__checkoutElement(tagName);
        }
        createElementNS(namespaceURI, qualifiedName) {
          const node = this.__checkoutElement(qualifiedName);
          node.namespaceURI = namespaceURI == null ? null : String(namespaceURI);
          node.ownerSVGElement = node.localName === "svg" ? node : null;
          node.createSVGPoint = node.localName === "svg" ? () => ({ x: 0, y: 0, matrixTransform(point) {
            return point || this;
          } }) : void 0;
          return node;
        }
        createDocumentFragment() {
          return this.__checkoutElement("#fragment");
        }
        createTextNode(text) {
          const node = this.__checkoutElement("#text");
          node._textContent = String(text);
          return node;
        }
        /**
         * B"H: O(1) id lookup with a connected-tree guard. Detached or
         * duplicate-id nodes fall back to the tree-order walk.
         */
        getElementById(id) {
          const key = String(id);
          const node = this.__idMap.get(key);
          if (node && node !== this.documentElement) {
            for (let n2 = node; n2; n2 = n2.parentNode) {
              if (n2 === this.documentElement) return node;
            }
          } else if (node) {
            return node;
          }
          return this.documentElement.querySelector("#" + key);
        }
        getElementsByName(name) {
          return this.documentElement.querySelectorAll('[name="' + String(name).replace(/"/g, "") + '"]');
        }
        getElementsByTagName(tagName) {
          return this.documentElement.querySelectorAll(String(tagName || "*"));
        }
        getElementsByClassName(className) {
          return this.documentElement.querySelectorAll("." + String(className || "").trim().split(/\s+/).join("."));
        }
        querySelector(selector) {
          return this.documentElement.querySelector(selector);
        }
        querySelectorAll(selector) {
          return this.documentElement.querySelectorAll(selector);
        }
        addEventListener(type, handler, options) {
          this.documentElement.addEventListener(type, handler, options);
        }
        removeEventListener(type, handler, options) {
          this.documentElement.removeEventListener(type, handler, options);
        }
        dispatchEvent(event) {
          return this.documentElement.dispatchEvent(event);
        }
        __registerMutationObserver(observer) {
          this.__mutationObservers.add(observer);
        }
        __unregisterMutationObserver(observer) {
          this.__mutationObservers.delete(observer);
        }
        /**
         * B"H: one record object per mutation (was: two spreads + Date.now on a
         * throwaway). The journal is capped at 10000 entries; it previously grew
         * without bound on mutation-heavy pages.
         */
        __notifyMutation(kind, target, extra) {
          if (this.__suppressMutations) return;
          const record = { kind, target: target.__handle() };
          if (extra) for (const key in extra) record[key] = extra[key];
          record.at = Date.now();
          const journal = this.journal;
          journal.push(record);
          if (journal.length > 11e3) journal.splice(0, journal.length - 1e4);
          const sched = this.__layoutScheduler;
          if (sched) {
            if (kind === "childList") sched.noteStructureChange();
            else if (kind === "characterData") sched.noteTextChange();
            else if (kind === "attributes") sched.noteAttributeChange(target, record.attributeName);
          }
          for (const observer of this.__mutationObservers) observer.__enqueue(record);
        }
        toJSON() {
          return {
            activeElement: this.activeElement?.id || this.activeElement?.tagName || null,
            readyState: this.readyState,
            title: this.title,
            documentElement: this.documentElement.toJSON(),
            journal: this.journal
          };
        }
      }
      function makeImplementation(document) {
        return {
          createHTMLDocument(title = "") {
            const child = new VirtualDocument();
            child.title = String(title || "");
            return child;
          },
          hasFeature() {
            return true;
          },
          ownerDocument: document
        };
      }
      return { VirtualDocument };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualStorage.js
var require_VirtualStorage = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualStorage.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualStorage = factory().VirtualStorage;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      class VirtualStorage {
        constructor() {
          this.map = /* @__PURE__ */ new Map();
          return new Proxy(this, {
            get(target, prop, receiver) {
              if (prop in target) {
                const value = Reflect.get(target, prop, receiver);
                return typeof value === "function" ? value.bind(target) : value;
              }
              if (typeof prop === "string") return target.getItem(prop);
              return void 0;
            },
            set(target, prop, value) {
              if (typeof prop === "string" && !(prop in target)) {
                target.setItem(prop, value);
                return true;
              }
              return Reflect.set(target, prop, value);
            },
            deleteProperty(target, prop) {
              if (typeof prop === "string") {
                target.removeItem(prop);
                return true;
              }
              return false;
            },
            has(target, prop) {
              return prop in target || typeof prop === "string" && target.map.has(prop);
            },
            ownKeys(target) {
              return [.../* @__PURE__ */ new Set([...Reflect.ownKeys(target), ...target.map.keys()])];
            },
            getOwnPropertyDescriptor(target, prop) {
              if (typeof prop === "string" && target.map.has(prop)) {
                return { enumerable: true, configurable: true, value: target.getItem(prop) };
              }
              return Reflect.getOwnPropertyDescriptor(target, prop);
            }
          });
        }
        get length() {
          return this.map.size;
        }
        key(index) {
          return Array.from(this.map.keys())[Number(index)] || null;
        }
        getItem(key) {
          key = String(key);
          return this.map.has(key) ? this.map.get(key) : null;
        }
        setItem(key, value) {
          this.map.set(String(key), String(value));
        }
        removeItem(key) {
          this.map.delete(String(key));
        }
        clear() {
          this.map.clear();
        }
        toJSON() {
          return Object.fromEntries(this.map.entries());
        }
      }
      return { VirtualStorage };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualConsole.js
var require_VirtualConsole = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualConsole.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualConsole = factory().VirtualConsole;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      class VirtualConsole {
        constructor(graph = null) {
          this.graph = graph;
          this.logs = [];
          this.timers = /* @__PURE__ */ new Map();
        }
        entry(level, args) {
          const item = { level, args: Array.from(args).map(stringify), at: (/* @__PURE__ */ new Date()).toISOString() };
          this.logs.push(item);
          this.graph?.event?.("console." + level, item);
          return item;
        }
        log(...args) {
          return this.entry("log", args);
        }
        warn(...args) {
          return this.entry("warn", args);
        }
        error(...args) {
          return this.entry("error", args);
        }
        info(...args) {
          return this.entry("info", args);
        }
        debug(...args) {
          return this.entry("debug", args);
        }
        trace(...args) {
          return this.entry("trace", args.length ? args : ["Trace"]);
        }
        table(...args) {
          return this.entry("table", args);
        }
        dir(...args) {
          return this.entry("dir", args);
        }
        group(...args) {
          return this.entry("group", args);
        }
        groupCollapsed(...args) {
          return this.entry("groupCollapsed", args);
        }
        groupEnd() {
          return this.entry("groupEnd", []);
        }
        clear() {
          this.logs.length = 0;
          return null;
        }
        assert(condition, ...args) {
          if (!condition) return this.entry("assert", args.length ? args : ["Assertion failed"]);
          return null;
        }
        count(label = "default") {
          const key = String(label);
          const next = (this.timers.get("count:" + key) || 0) + 1;
          this.timers.set("count:" + key, next);
          return this.entry("count", [key + ": " + next]);
        }
        countReset(label = "default") {
          this.timers.set("count:" + String(label), 0);
        }
        time(label = "default") {
          this.timers.set("time:" + String(label), Date.now());
        }
        timeEnd(label = "default") {
          const key = "time:" + String(label);
          const start = this.timers.get(key) || Date.now();
          this.timers.delete(key);
          return this.entry("timeEnd", [String(label) + ": " + (Date.now() - start) + "ms"]);
        }
        timeLog(label = "default", ...args) {
          const key = "time:" + String(label);
          const start = this.timers.get(key) || Date.now();
          return this.entry("timeLog", [String(label) + ": " + (Date.now() - start) + "ms", ...args]);
        }
        toJSON() {
          return { logs: this.logs };
        }
      }
      function stringify(value) {
        if (typeof value === "string") return value;
        if (value && value.stack) return value.stack;
        try {
          return JSON.stringify(value);
        } catch (_) {
          return String(value);
        }
      }
      return { VirtualConsole };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFetchHelpers.js
var require_VirtualFetchHelpers = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFetchHelpers.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory(require_VirtualBytes());
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory(root.Merkava));
      }
    })(typeof self !== "undefined" ? self : exports, function(bytesMod) {
      function parseDataUrl(raw) {
        try {
          const bodyStart = String(raw).indexOf(",");
          if (bodyStart < 0) return malformedDataUrl();
          const meta = String(raw).slice(5, bodyStart);
          const encoded = String(raw).slice(bodyStart + 1);
          const parts = meta.split(";").filter(Boolean);
          const mime = parts[0] || "text/plain;charset=US-ASCII";
          const isBase64 = parts.some((value) => value.toLowerCase() === "base64");
          const body = isBase64 ? bytesMod.decodeBase64(encoded) : decodeURIComponent(encoded);
          return { body, mime, ok: true };
        } catch (error) {
          return { body: "", error: error.message, mime: "text/plain", ok: false };
        }
      }
      function virtualResponse(status, body, url, mime = "text/plain", headers = {}) {
        const bytes = bytesMod.normalizeBytes(body);
        const responseHeaders = normalizeHeaders(headers, mime);
        const text = bytesMod.decodeUtf8(bytes);
        return {
          arrayBuffer: async () => bytes.slice().buffer,
          blob: async () => ({
            arrayBuffer: async () => bytes.slice().buffer,
            size: bytes.byteLength,
            text: async () => text,
            type: responseHeaders["content-type"] || mime
          }),
          headers: headerGarment(responseHeaders),
          json: async () => JSON.parse(text),
          ok: status >= 200 && status < 300,
          status,
          text: async () => text,
          url: String(url || "")
        };
      }
      function fileCandidates(rawUrl, baseUrl) {
        const output = [];
        addCandidate(output, rawUrl);
        try {
          const url = new URL(String(rawUrl), baseUrl || "http://127.0.0.1/");
          const noHash = new URL(url.href);
          noHash.hash = "";
          const noQuery = new URL(noHash.href);
          noQuery.search = "";
          for (const value of [
            url.href,
            noHash.href,
            noQuery.href,
            decodeURIComponent(noQuery.pathname || ""),
            decodeURIComponent(url.pathname || "")
          ]) addCandidate(output, value);
        } catch (_error) {
        }
        return [...new Set(output.filter(Boolean))];
      }
      function suffixHit(files, candidates) {
        const keys = Object.keys(files || {});
        for (const candidate of candidates.map(stripParents).filter(Boolean)) {
          const clean = candidate.replace(/^\.\//, "").replace(/^\//, "");
          const hits = keys.filter((key) => key === clean || key.endsWith(`/${clean}`));
          if (hits.length === 1) return { body: files[hits[0]], key: hits[0] };
        }
        return null;
      }
      function normalizeHeaders(headers, fallbackMime) {
        const output = {};
        for (const [name, value] of Object.entries(headers || {})) {
          output[String(name).toLowerCase()] = String(value);
        }
        if (!output["content-type"] && fallbackMime) output["content-type"] = fallbackMime;
        return output;
      }
      function headerGarment(headers) {
        return {
          get: (name) => headers[String(name).toLowerCase()] ?? null,
          has: (name) => Object.prototype.hasOwnProperty.call(headers, String(name).toLowerCase())
        };
      }
      function addCandidate(output, value) {
        const clean = String(value || "").replace(/\\/g, "/");
        if (!clean) return;
        const bare = clean.replace(/^\.\//, "").replace(/^\?\//, "");
        output.push(clean, bare, `/${bare}`, `./${bare}`);
        const stripped = stripParents(clean);
        output.push(stripped, `/${stripped}`, `./${stripped}`);
      }
      function stripParents(value) {
        let clean = String(value || "").replace(/^\.\//, "").replace(/^\//, "");
        while (clean.startsWith("../")) clean = clean.slice(3);
        return clean;
      }
      function malformedDataUrl() {
        return { body: "", error: "malformed data URL", mime: "text/plain", ok: false };
      }
      return { fileCandidates, parseDataUrl, suffixHit, virtualResponse };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFetchTransport.js
var require_VirtualFetchTransport = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFetchTransport.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory(require_VirtualBytes());
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory(root.Merkava));
      }
    })(typeof self !== "undefined" ? self : exports, function(bytesMod) {
      function makeVirtualRequest(input, options = {}) {
        return {
          at: (/* @__PURE__ */ new Date()).toISOString(),
          candidates: [],
          method: String(options.method || input?.method || "GET").toUpperCase(),
          ok: false,
          url: String(input?.url ?? input)
        };
      }
      function canRouteUrl(rawUrl, baseUrl) {
        try {
          return /^https?:$/.test(new URL(rawUrl, baseUrl).protocol);
        } catch (_error) {
          return false;
        }
      }
      function transportRequest(request, input, options, baseUrl) {
        return {
          body: options.body ?? input?.body ?? null,
          headers: options.headers ?? input?.headers ?? {},
          method: request.method,
          url: new URL(request.url, baseUrl).href
        };
      }
      function transportResponse(result = {}, fallbackUrl) {
        const status = Number(result.status || 502);
        const headers = result.headers || {};
        return {
          body: result.bodyBase64 != null ? bytesMod.decodeBase64Bytes(result.bodyBase64) : String(result.text ?? ""),
          headers,
          mime: headerValue(headers, "content-type") || "application/octet-stream",
          status,
          url: String(result.url || fallbackUrl)
        };
      }
      function headerValue(headers, name) {
        if (typeof headers?.get === "function") return headers.get(name);
        const wanted = String(name).toLowerCase();
        const hit = Object.entries(headers || {}).find(([key]) => key.toLowerCase() === wanted);
        return hit?.[1] ?? null;
      }
      return {
        canRouteUrl,
        makeVirtualRequest,
        transportRequest,
        transportResponse
      };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFetch.js
var require_VirtualFetch = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFetch.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory(
          require_VirtualFetchHelpers(),
          require_VirtualFetchTransport()
        );
      } else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualFetch = factory(root.Merkava, root.Merkava).VirtualFetch;
      }
    })(typeof self !== "undefined" ? self : exports, function(helperMod, transportMod) {
      class VirtualFetch {
        constructor(options = {}) {
          this.files = options.files || {};
          this.graph = options.graph || null;
          this.baseUrl = options.baseUrl || "http://127.0.0.1:8080/";
          this.transport = typeof options.transport === "function" ? options.transport : null;
          this.requests = [];
        }
        async fetch(input, options = {}) {
          const request = transportMod.makeVirtualRequest(input, options);
          this.requests.push(request);
          this.graph?.event?.("network.request", request);
          if (/^data:/i.test(request.url)) return this.respondDataUrl(request);
          const hit = this.findFile(request.url, request);
          if (hit) return this.respondFile(request, hit);
          if (this.transport && transportMod.canRouteUrl(request.url, this.baseUrl)) {
            return this.respondTransport(request, input, options);
          }
          request.error = "virtual network miss";
          this.recordResponse(request.url, 404);
          return helperMod.virtualResponse(404, `Not Found: ${request.url}`, request.url);
        }
        respondDataUrl(request) {
          const parsed = helperMod.parseDataUrl(request.url);
          request.ok = parsed.ok;
          request.dataUrl = true;
          request.mime = parsed.mime;
          if (!parsed.ok) request.error = parsed.error;
          this.recordResponse(request.url, parsed.ok ? 200 : 400, { dataUrl: true });
          return helperMod.virtualResponse(
            parsed.ok ? 200 : 400,
            parsed.body,
            request.url,
            parsed.mime
          );
        }
        respondFile(request, hit) {
          request.ok = true;
          request.key = hit.key;
          this.recordResponse(request.url, 200, { key: hit.key });
          return helperMod.virtualResponse(200, hit.body, request.url);
        }
        async respondTransport(request, input, options) {
          const outgoing = transportMod.transportRequest(request, input, options, this.baseUrl);
          request.resolvedUrl = outgoing.url;
          try {
            const result = await this.transport(outgoing);
            const remote = transportMod.transportResponse(result, outgoing.url);
            request.ok = remote.status >= 200 && remote.status < 300;
            request.status = remote.status;
            this.recordResponse(remote.url, remote.status, { transport: true });
            return helperMod.virtualResponse(
              remote.status,
              remote.body,
              remote.url,
              remote.mime,
              remote.headers
            );
          } catch (error) {
            request.error = error?.code || error?.message || "virtual transport failed";
            this.recordResponse(outgoing.url, 0, { error: request.error, transport: true });
            throw error;
          }
        }
        findFile(rawUrl, request) {
          const candidates = helperMod.fileCandidates(rawUrl, this.baseUrl);
          request.candidates = candidates;
          for (const key of candidates) {
            if (Object.prototype.hasOwnProperty.call(this.files, key)) {
              return { body: this.files[key], key };
            }
          }
          return helperMod.suffixHit(this.files, candidates);
        }
        recordResponse(url, status, extra = {}) {
          this.graph?.event?.("network.response", { ...extra, status, url });
        }
        toJSON() {
          return { requests: this.requests };
        }
      }
      return {
        VirtualFetch,
        fileCandidates: helperMod.fileCandidates,
        parseDataUrl: helperMod.parseDataUrl
      };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualMouse.js
var require_VirtualMouse = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualMouse.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory(require_VirtualEvents());
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualMouse = factory(root.Merkava).VirtualMouse;
      }
    })(typeof self !== "undefined" ? self : exports, function(events) {
      const MouseEvent = events.VirtualMouseEvent || events.MouseEvent;
      class VirtualMouse {
        constructor(window) {
          this.window = window;
          this.x = 0;
          this.y = 0;
          this.buttons = 0;
          this.target = null;
          this.history = [];
        }
        move(x, y, target = null) {
          this.x = x;
          this.y = y;
          this.target = target || this.target;
          return this.fire("mousemove");
        }
        moveTo(selector) {
          const el = this.window.document.querySelector(selector);
          if (!el) throw new Error("No element for mouse: " + selector);
          this.target = el;
          return this.move(0, 0, el);
        }
        down() {
          this.buttons = 1;
          return this.fire("mousedown");
        }
        up() {
          this.buttons = 0;
          return this.fire("mouseup");
        }
        click(selector) {
          if (selector) this.moveTo(selector);
          this.down();
          this.up();
          return this.fire("click");
        }
        fire(type) {
          const ev = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: this.x, clientY: this.y });
          this.history.push({ type, x: this.x, y: this.y, at: Date.now() });
          this.target?.dispatchEvent?.(ev);
          return ev;
        }
        toJSON() {
          return { x: this.x, y: this.y, buttons: this.buttons, history: this.history };
        }
      }
      return { VirtualMouse };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualKeyboard.js
var require_VirtualKeyboard = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualKeyboard.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory(require_VirtualEvents());
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualKeyboard = factory(root.Merkava).VirtualKeyboard;
      }
    })(typeof self !== "undefined" ? self : exports, function(events) {
      const KeyboardEvent = events.VirtualKeyboardEvent || events.KeyboardEvent;
      const InputEvent = events.VirtualInputEvent || events.InputEvent;
      class VirtualKeyboard {
        constructor(window) {
          this.window = window;
          this.pressed = /* @__PURE__ */ new Set();
          this.history = [];
        }
        press(key) {
          this.down(key);
          this.up(key);
        }
        down(key) {
          this.pressed.add(key);
          this.fire("keydown", key);
          if (key.length === 1) this.input(key);
        }
        up(key) {
          this.pressed.delete(key);
          this.fire("keyup", key);
        }
        type(text) {
          for (const ch of String(text)) this.press(ch);
        }
        input(ch) {
          const el = this.window.document.activeElement;
          if (el) el.value = String(el.value || "") + ch;
          el?.dispatchEvent?.(new InputEvent("input", { bubbles: true, data: ch }));
        }
        fire(type, key) {
          const ev = new KeyboardEvent(type, { bubbles: true, cancelable: true, key });
          this.history.push({ type, key, at: Date.now() });
          this.window.document.activeElement?.dispatchEvent?.(ev);
          return ev;
        }
        toJSON() {
          return { pressed: Array.from(this.pressed), history: this.history };
        }
      }
      return { VirtualKeyboard };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualInteractions.js
var require_VirtualInteractions = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualInteractions.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualInteractions = factory().VirtualInteractions;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      class VirtualInteractions {
        constructor(window) {
          this.window = window;
        }
        element(selector) {
          const el = this.window.document.querySelector(selector);
          if (!el) throw new Error("Missing selector: " + selector);
          return el;
        }
        click(selector) {
          return this.window.mouse.click(selector);
        }
        type(selector, text) {
          const el = this.element(selector);
          el.focus?.();
          this.window.keyboard.type(text);
          return el.value;
        }
        key(selector, key) {
          this.element(selector).focus?.();
          return this.window.keyboard.press(key);
        }
        dispatch(selector, event) {
          return this.element(selector).dispatchEvent(event);
        }
        assertText(selector, expected) {
          const got = this.element(selector).textContent;
          if (!String(got).includes(String(expected))) throw new Error("Text mismatch: " + got);
          return true;
        }
        assertExists(selector) {
          return !!this.element(selector);
        }
      }
      return { VirtualInteractions };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/RuntimeProbe.js
var require_RuntimeProbe = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/RuntimeProbe.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.RuntimeProbe = factory().RuntimeProbe;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      class RuntimeProbe {
        constructor() {
          this.records = [];
        }
        wrap(name, fn, capture = () => ({})) {
          return (...args) => {
            const record = { name, args, before: capture(), at: Date.now() };
            try {
              record.value = fn(...args);
              record.after = capture();
              return record.value;
            } catch (error) {
              record.error = error.message;
              throw error;
            } finally {
              this.records.push(record);
            }
          };
        }
        capture(label, value) {
          this.records.push({ label, value, at: Date.now() });
          return value;
        }
        toJSON() {
          return this.records;
        }
      }
      return { RuntimeProbe };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualImagePaintResolver.js
var require_VirtualImagePaintResolver = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualImagePaintResolver.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualImagePaintResolver = factory().VirtualImagePaintResolver;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      class VirtualImagePaintResolver {
        imageElement(element, rect, style = {}) {
          const src = cleanUrl(element?.getAttribute?.("src") || "");
          return this.textureOp("paintImageTexture", src, rect, style, {
            alt: element?.getAttribute?.("alt") || "",
            objectFit: style["object-fit"] || "fill",
            objectPosition: style["object-position"] || "50% 50%"
          });
        }
        backgroundLayers(style = {}, rect = {}) {
          return splitLayers(style["background-image"]).map((source, layer) => {
            if (isGradient(source)) return this.gradientOp(source, rect, style, layer);
            const src = cleanUrl(source);
            if (!src || src === "none") return null;
            return this.textureOp("paintBackgroundImage", src, rect, style, {
              layer,
              repeat: layerValue(style["background-repeat"], layer, "repeat"),
              size: layerValue(style["background-size"], layer, "auto"),
              position: layerValue(style["background-position"], layer, "0% 0%")
            });
          }).filter(Boolean);
        }
        gradientOp(source, rect, style, layer) {
          return {
            op: "paintGradient",
            gradient: String(source),
            layer,
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            alpha: opacity(style.opacity),
            kind: source.trim().split("(")[0]
          };
        }
        textureOp(op, src, rect, style, extra = {}) {
          const fit = resolveFit(extra.objectFit || extra.size, rect.width, rect.height);
          return { op, src, x: rect.x, y: rect.y, width: rect.width, height: rect.height, alpha: opacity(style.opacity), fit, ...extra };
        }
      }
      function splitLayers(value) {
        const text = String(value || "").trim();
        if (!text || text === "none") return [];
        return text.split(/,(?![^()]*\))/).map((x) => x.trim()).filter(Boolean);
      }
      function cleanUrl(value) {
        return String(value || "").trim().replace(/^url\((.*)\)$/i, "$1").replace(/^["']|["']$/g, "");
      }
      function isGradient(value) {
        return /^(linear|radial|conic|repeating-linear|repeating-radial)-gradient\(/i.test(String(value || "").trim());
      }
      function layerValue(value, index, fallback) {
        const parts = String(value || "").split(/,(?![^()]*\))/).map((x) => x.trim()).filter(Boolean);
        return parts[index] || parts[0] || fallback;
      }
      function resolveFit(value, width, height) {
        const mode = String(value || "fill").trim();
        return { mode, u0: 0, v0: 0, u1: 1, v1: 1, targetWidth: width, targetHeight: height };
      }
      function opacity(value) {
        const n2 = Number.parseFloat(String(value ?? "1"));
        return Number.isFinite(n2) ? Math.max(0, Math.min(1, n2)) : 1;
      }
      return { VirtualImagePaintResolver };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWebGLBoxRenderer.js
var require_VirtualWebGLBoxRenderer = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWebGLBoxRenderer.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory(require_VirtualWebGLTextureArena(), require_VirtualImagePaintResolver());
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualWebGLBoxRenderer = factory(root.Merkava, root.Merkava).VirtualWebGLBoxRenderer;
      }
    })(typeof self !== "undefined" ? self : exports, function(arenaMod, imageMod) {
      const VirtualWebGLTextureArena = arenaMod.VirtualWebGLTextureArena;
      const VirtualImagePaintResolver = imageMod.VirtualImagePaintResolver;
      const hiddenTags = /* @__PURE__ */ new Set(["head", "script", "style", "meta", "link", "title", "option"]);
      const inlineTags = /* @__PURE__ */ new Set(["#text", "span", "a", "b", "i", "strong", "em", "small", "label"]);
      const replacedTags = /* @__PURE__ */ new Set(["img", "canvas", "video", "svg"]);
      const blockTags = new Set("address article aside blockquote body div dl fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hr li main nav ol p pre section table ul".split(" "));
      const inherited = ["color", "font-family", "font-size", "font-weight", "font-style", "line-height", "text-align", "letter-spacing", "white-space"];
      const names = { black: "#000000", white: "#ffffff", red: "#ff0000", green: "#008000", blue: "#0000ff", yellow: "#ffff00", cyan: "#00ffff", magenta: "#ff00ff", gray: "#808080", grey: "#808080", orange: "#ffa500", purple: "#800080", pink: "#ffc0cb", brown: "#a52a2a", transparent: "transparent", currentcolor: "currentColor" };
      class VirtualWebGLBoxRenderer {
        constructor(arena = new VirtualWebGLTextureArena(), options = {}) {
          this.arena = arena;
          this.viewportWidth = options.width || 760;
          this.viewportHeight = options.height || 560;
          this.rootStyle = null;
          this.imagePaint = new VirtualImagePaintResolver();
        }
        ensureTexture(element) {
          if (!element.__webglBoxTexture) element.__webglBoxTexture = this.arena.createTexture("dom-box", element, 0, 0);
          return element.__webglBoxTexture;
        }
        paintElement(element, x = 0, y = 0, containingWidth = this.viewportWidth, containingHeight = this.viewportHeight, parentStyle = null) {
          if (!element || this.isHidden(element)) return emptyBox();
          const style = this.computed(element, parentStyle);
          if (style.display === "none" || style.visibility === "hidden") return emptyBox();
          if (element.localName === "body") this.rootStyle = style;
          const metrics = this.measure(element, style, containingWidth, containingHeight);
          const placed = this.place(element, style, metrics, x, y, containingWidth, containingHeight);
          const texture = this.ensureTexture(element);
          texture.width = metrics.outerWidth;
          texture.height = metrics.outerHeight;
          this.paintCompositingHints(texture, placed, metrics, style);
          this.paintVisual(element, texture, placed, metrics, style);
          if (replacedTags.has(element.localName)) return this.paintReplaced(element, texture, placed, metrics, style);
          if (style.display === "flex" || style.display === "inline-flex") {
            const result = this.paintFlex(element, placed, containingWidth, containingHeight, style, metrics);
            this.paintClipPopIfNeeded(texture, placed, metrics, style);
            return result;
          }
          this.paintTextIfDirect(element, texture, placed, metrics, style);
          this.paintNormalFlow(element, placed, metrics, style);
          this.paintClipPopIfNeeded(texture, placed, metrics, style);
          return metrics;
        }
        isHidden(element) {
          return !!element.hidden || hiddenTags.has(element.localName);
        }
        computed(element, parentStyle = null) {
          const raw = element.ownerDocument?.cssEngine?.compute(element) || element.style?.toJSON?.() || {};
          const style = /* @__PURE__ */ Object.create(null);
          Object.assign(style, defaultStyle(element.localName));
          for (const key of inherited) if (parentStyle?.[key]) style[key] = parentStyle[key];
          Object.assign(style, raw);
          normalizeShorthands(style);
          return style;
        }
        place(element, style, metrics, x, y, containingWidth, containingHeight) {
          let px2 = x + metrics.marginLeft;
          let py = y + metrics.marginTop;
          const pos = style.position || "static";
          if (pos === "fixed") {
            px2 = edge(style.left, this.viewportWidth, null);
            py = edge(style.top, this.viewportHeight, null);
            if (px2 == null) px2 = edge(style.right, this.viewportWidth, this.viewportWidth - metrics.outerWidth) ?? x;
            if (py == null) py = edge(style.bottom, this.viewportHeight, this.viewportHeight - metrics.outerHeight) ?? y;
          } else if (pos === "absolute") {
            px2 = edge(style.left, containingWidth, null);
            py = edge(style.top, containingHeight, null);
            if (px2 == null) px2 = (containingWidth - metrics.outerWidth) / 2;
            if (py == null) py = y + metrics.marginTop;
          } else if (pos === "relative") {
            px2 += length(style.left, containingWidth);
            py += length(style.top, containingHeight);
          }
          const tx = transformX(style.transform, metrics.outerWidth);
          const ty = transformY(style.transform, metrics.outerHeight);
          return { x: px2 + tx, y: py + ty, contentX: px2 + tx + metrics.borderLeft + metrics.paddingLeft, contentY: py + ty + metrics.borderTop + metrics.paddingTop };
        }
        paintCompositingHints(texture, placed, metrics, style) {
          const radius = length(style["border-radius"] || 0, Math.min(metrics.outerWidth, metrics.outerHeight));
          const alpha = opacity(style.opacity);
          if (style.overflow === "hidden" || style.overflow === "clip" || style["overflow-x"] === "hidden" || style["overflow-y"] === "hidden") this.arena.record(texture, "paintClipPush", {
            x: placed.x,
            y: placed.y,
            width: metrics.outerWidth,
            height: metrics.outerHeight,
            radius
          });
          if (radius > 0) this.arena.record(texture, "paintBorderRadius", {
            x: placed.x,
            y: placed.y,
            width: metrics.outerWidth,
            height: metrics.outerHeight,
            radius
          });
          if (alpha < 1) this.arena.record(texture, "paintOpacity", {
            x: placed.x,
            y: placed.y,
            width: metrics.outerWidth,
            height: metrics.outerHeight,
            alpha
          });
          if (style.transform && style.transform !== "none") this.arena.record(texture, "paintTransform", {
            x: placed.x,
            y: placed.y,
            width: metrics.outerWidth,
            height: metrics.outerHeight,
            transform: style.transform
          });
        }
        paintCompositingHints(texture, placed, metrics, style) {
          const radius = length(style["border-radius"] || 0, Math.min(metrics.outerWidth, metrics.outerHeight));
          const alpha = opacity(style.opacity);
          if (style.overflow === "hidden" || style.overflow === "clip" || style["overflow-x"] === "hidden" || style["overflow-y"] === "hidden") this.arena.record(texture, "paintClipPush", {
            x: placed.x,
            y: placed.y,
            width: metrics.outerWidth,
            height: metrics.outerHeight,
            radius
          });
          if (radius > 0) this.arena.record(texture, "paintBorderRadius", {
            x: placed.x,
            y: placed.y,
            width: metrics.outerWidth,
            height: metrics.outerHeight,
            radius
          });
          if (alpha < 1) this.arena.record(texture, "paintOpacity", {
            x: placed.x,
            y: placed.y,
            width: metrics.outerWidth,
            height: metrics.outerHeight,
            alpha
          });
          if (style.transform && style.transform !== "none") this.arena.record(texture, "paintTransform", {
            x: placed.x,
            y: placed.y,
            width: metrics.outerWidth,
            height: metrics.outerHeight,
            transform: style.transform
          });
        }
        paintClipPopIfNeeded(texture, placed, metrics, style) {
          if (style.overflow === "hidden" || style.overflow === "clip" || style["overflow-x"] === "hidden" || style["overflow-y"] === "hidden") this.arena.record(texture, "paintClipPop", {
            x: placed.x,
            y: placed.y,
            width: metrics.outerWidth,
            height: metrics.outerHeight
          });
        }
        paintClipPopIfNeeded(texture, placed, metrics, style) {
          if (style.overflow === "hidden" || style.overflow === "clip" || style["overflow-x"] === "hidden" || style["overflow-y"] === "hidden") this.arena.record(texture, "paintClipPop", {
            x: placed.x,
            y: placed.y,
            width: metrics.outerWidth,
            height: metrics.outerHeight
          });
        }
        paintVisual(element, texture, placed, metrics, style) {
          const background2 = backgroundColor(style);
          const border = borderColor2(style);
          if (background2 !== "transparent") this.arena.record(texture, "paintBox", {
            x: placed.x,
            y: placed.y,
            width: metrics.outerWidth,
            height: metrics.outerHeight,
            padding: metrics.paddingTop,
            margin: metrics.marginTop,
            border: metrics.borderTop,
            background: background2,
            color: style.color || "#111111",
            display: style.display || "block"
          });
          if ((metrics.borderTop || metrics.borderRight || metrics.borderBottom || metrics.borderLeft) && border !== "transparent") this.arena.record(texture, "paintBorder", {
            x: placed.x,
            y: placed.y,
            width: metrics.outerWidth,
            height: metrics.outerHeight,
            color: border,
            widthPx: Math.max(metrics.borderTop, metrics.borderRight, metrics.borderBottom, metrics.borderLeft)
          });
          if (style["box-shadow"]) this.arena.record(texture, "paintShadow", {
            x: placed.x + 3,
            y: placed.y + 3,
            width: metrics.outerWidth,
            height: metrics.outerHeight,
            color: "#000000"
          });
          for (const op of this.imagePaint.backgroundLayers(style, {
            x: placed.x,
            y: placed.y,
            width: metrics.outerWidth,
            height: metrics.outerHeight
          })) this.arena.record(texture, op.op, op);
        }
        paintReplaced(element, texture, placed, metrics, style) {
          if (element.localName === "img") {
            const op = this.imagePaint.imageElement(element, {
              x: placed.x,
              y: placed.y,
              width: metrics.outerWidth,
              height: metrics.outerHeight
            }, style);
            this.arena.record(texture, op.op, op);
          }
          if (element.localName === "canvas") this.arena.record(texture, "paintBox", {
            x: placed.x,
            y: placed.y,
            width: metrics.outerWidth,
            height: metrics.outerHeight,
            background: style["background-color"] || "#102038",
            color: "#ffffff",
            display: style.display || "block"
          });
          return metrics;
        }
        paintTextIfDirect(element, texture, placed, metrics, style) {
          const directText2 = this.directText(element);
          if (!directText2) return;
          const lines = wrapText(directText2, metrics.contentWidth, style);
          const lh = lineHeight(style);
          let y = placed.contentY + lh * 0.78;
          for (const line of lines) {
            const tw = textWidth3(line, style);
            const align = style["text-align"] || "left";
            const tx = align === "center" ? placed.contentX + (metrics.contentWidth - tw) / 2 : align === "right" ? placed.contentX + metrics.contentWidth - tw : placed.contentX;
            this.arena.record(texture, "paintTextPlaceholder", { text: line, x: tx, y, color: color(style.color || "#111111"), note: "executor text layout" });
            y += lh;
          }
        }
        paintNormalFlow(element, placed, metrics, style) {
          let childY = placed.contentY + (this.directText(element) ? textBlockHeight(this.directText(element), metrics.contentWidth, style) : 0);
          let childX = placed.contentX;
          let lineHeightMax = 0;
          for (const child of stackOrderedChildren(element, style, this)) {
            if (this.isHidden(child)) continue;
            const childStyle = this.computed(child, style);
            if (childStyle.display === "none") continue;
            const childMetrics = this.measure(child, childStyle, metrics.contentWidth, metrics.contentHeight);
            const positioned = childStyle.position === "absolute" || childStyle.position === "fixed";
            const inline = !positioned && (childStyle.display === "inline" || childStyle.display === "inline-block" || inlineTags.has(child.localName));
            if (inline) {
              if (childX + childMetrics.outerWidth > placed.contentX + metrics.contentWidth && childX > placed.contentX) {
                childX = placed.contentX;
                childY += lineHeightMax || childMetrics.outerHeight;
                lineHeightMax = 0;
              }
              this.paintElement(child, childX, childY, metrics.contentWidth, metrics.contentHeight, style);
              childX += childMetrics.outerWidth;
              lineHeightMax = Math.max(lineHeightMax, childMetrics.outerHeight);
            } else {
              this.paintElement(child, placed.contentX, childY, metrics.contentWidth, metrics.contentHeight, style);
              if (!positioned) childY += childMetrics.outerHeight;
              childX = placed.contentX;
              lineHeightMax = 0;
            }
          }
        }
        paintFlex(element, placed, containingWidth, containingHeight, style, metrics) {
          this.paintTextIfDirect(element, this.ensureTexture(element), placed, metrics, style);
          const children = Array.from(element.children || []).filter((child) => {
            const childStyle = this.computed(child, style);
            return !this.isHidden(child) && childStyle.display !== "none" && childStyle.position !== "absolute" && childStyle.position !== "fixed";
          });
          const row = !String(style["flex-direction"] || "row").startsWith("column");
          const gap = length(style.gap || style["column-gap"] || style["row-gap"], row ? metrics.contentWidth : metrics.contentHeight);
          const boxes = children.map((child) => this.measure(child, this.computed(child, style), metrics.contentWidth, metrics.contentHeight));
          const growTotal = children.reduce((sum2, child) => sum2 + number(this.computed(child, style)["flex-grow"]), 0);
          const totalMain = boxes.reduce((sum2, box2) => sum2 + (row ? box2.outerWidth : box2.outerHeight), 0) + Math.max(0, boxes.length - 1) * gap;
          const free = Math.max(0, (row ? metrics.contentWidth : metrics.contentHeight) - totalMain);
          const justify = style["justify-content"] || "flex-start";
          const align = style["align-items"] || "stretch";
          let main2 = justify === "center" ? free / 2 : justify === "flex-end" ? free : 0;
          const between = justify === "space-between" && boxes.length > 1 ? free / (boxes.length - 1) : justify === "space-around" && boxes.length ? free / boxes.length : 0;
          if (justify === "space-around") main2 = between / 2;
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const childStyle = this.computed(child, style);
            const box2 = { ...boxes[i] };
            if (growTotal && number(childStyle["flex-grow"])) {
              if (row) box2.outerWidth += free * number(childStyle["flex-grow"]) / growTotal;
              else box2.outerHeight += free * number(childStyle["flex-grow"]) / growTotal;
            }
            const crossFree = Math.max(0, row ? metrics.contentHeight - box2.outerHeight : metrics.contentWidth - box2.outerWidth);
            const cross = align === "center" ? crossFree / 2 : align === "flex-end" ? crossFree : 0;
            if (align === "stretch") {
              if (row && !lengthValue(childStyle.height)) box2.outerHeight = metrics.contentHeight;
              if (!row && !lengthValue(childStyle.width)) box2.outerWidth = metrics.contentWidth;
            }
            const childX = placed.contentX + (row ? main2 : cross);
            const childY = placed.contentY + (row ? cross : main2);
            this.paintElement(child, childX, childY, row ? box2.outerWidth : metrics.contentWidth, row ? metrics.contentHeight : box2.outerHeight, style);
            main2 += (row ? box2.outerWidth : box2.outerHeight) + gap + between;
          }
          for (const child of stackOrderedChildren(element, style, this)) {
            const childStyle = this.computed(child, style);
            if (childStyle.position === "absolute" || childStyle.position === "fixed") this.paintElement(child, placed.contentX, placed.contentY, metrics.contentWidth, metrics.contentHeight, style);
          }
          return metrics;
        }
        directText(element) {
          if (!element) return "";
          if (element.localName === "input") return String(element.value || element.placeholder || "").trim();
          if (element.localName === "textarea") return String(element.value || element.textContent || element.placeholder || "").trim();
          if (element.localName === "select") return String((element.children || []).find((child) => child.selected)?.textContent || element.value || "").trim();
          if (element.nodeType === 3) return normalizeText(element._textContent || "");
          return normalizeText(element._textContent || "");
        }
        measureText(element, style = {}) {
          const text = this.directText(element);
          return { width: textWidth3(text, style), height: text ? textBlockHeight(text, this.viewportWidth, style) : 0 };
        }
        measure(element, style, containingWidth, containingHeight = this.viewportHeight) {
          const box2 = boxEdges(style, containingWidth, containingHeight);
          const availableW = Math.max(0, containingWidth - box2.marginLeft - box2.marginRight);
          const explicitWidth = cssLength(style.width, availableW, this.viewportWidth, this.viewportHeight);
          const minWidth = cssLength(style["min-width"], availableW, this.viewportWidth, this.viewportHeight);
          const maxWidth = cssLength(style["max-width"], availableW, this.viewportWidth, this.viewportHeight);
          const explicitHeight = cssLength(style.height, containingHeight, this.viewportWidth, this.viewportHeight);
          const minHeight = cssLength(style["min-height"], containingHeight, this.viewportWidth, this.viewportHeight);
          const maxHeight = cssLength(style["max-height"], containingHeight, this.viewportWidth, this.viewportHeight);
          const borderPadW = box2.paddingLeft + box2.paddingRight + box2.borderLeft + box2.borderRight;
          const borderPadH = box2.paddingTop + box2.paddingBottom + box2.borderTop + box2.borderBottom;
          let contentWidth = explicitWidth != null ? explicitWidth : intrinsicWidth(element, style, availableW, this.viewportWidth);
          if (style["box-sizing"] === "border-box" && explicitWidth != null) contentWidth = Math.max(0, contentWidth - borderPadW);
          contentWidth = clamp(contentWidth, minWidth, maxWidth == null ? availableW : maxWidth);
          let childHeight = 0, childWidth = 0;
          const ownText = this.directText(element);
          if (ownText) childHeight += textBlockHeight(ownText, contentWidth, style);
          for (const child of stackOrderedChildren(element, style, this)) {
            if (this.isHidden(child)) continue;
            const childStyle = this.computed(child, style);
            if (childStyle.display === "none" || childStyle.position === "absolute" || childStyle.position === "fixed") continue;
            const childBox = this.measure(child, childStyle, contentWidth, containingHeight);
            if (style.display === "flex" || style.display === "inline-flex") {
              const row = !String(style["flex-direction"] || "row").startsWith("column");
              const gap = length(style.gap || style["column-gap"] || 0, row ? contentWidth : containingHeight);
              childHeight = row ? Math.max(childHeight, childBox.outerHeight) : childHeight + childBox.outerHeight + gap;
              childWidth = row ? childWidth + childBox.outerWidth + gap : Math.max(childWidth, childBox.outerWidth);
            } else {
              childHeight += childBox.outerHeight;
              childWidth = Math.max(childWidth, childBox.outerWidth);
            }
          }
          if (style.display === "inline" || style.display === "inline-block") contentWidth = explicitWidth ?? Math.max(textWidth3(ownText, style), childWidth, 1);
          let contentHeight = explicitHeight != null ? explicitHeight : Math.max(childHeight, intrinsicHeight(element, style, containingHeight));
          if (style["box-sizing"] === "border-box" && explicitHeight != null) contentHeight = Math.max(0, contentHeight - borderPadH);
          contentHeight = clamp(contentHeight, minHeight, maxHeight);
          const outerWidth = contentWidth + borderPadW + box2.marginLeft + box2.marginRight;
          const outerHeight = contentHeight + borderPadH + box2.marginTop + box2.marginBottom;
          return { ...box2, contentWidth, contentHeight, outerWidth, outerHeight };
        }
        snapshot() {
          return this.arena.snapshot();
        }
      }
      function defaultStyle(tag) {
        const display = inlineTags.has(tag) ? "inline" : tag === "img" ? "inline-block" : blockTags.has(tag) ? "block" : "block";
        const fontSize2 = /^h[1-6]$/.test(tag) ? { h1: "32px", h2: "24px", h3: "19px", h4: "16px", h5: "13px", h6: "11px" }[tag] : "16px";
        return { display, position: "static", color: "#000000", "background-color": "transparent", "font-size": fontSize2, "line-height": "normal", "box-sizing": "content-box", margin: tag === "body" ? "0" : "0", padding: "0", "border-width": "0", "border-color": "transparent", overflow: "visible", visibility: "visible" };
      }
      function normalizeShorthands(style) {
        if (style.background && !style["background-color"]) style["background-color"] = firstColor(style.background);
        if (style.background && !style["background-image"]) style["background-image"] = firstBackgroundImage2(style.background);
        if (style.border && !style["border-width"]) {
          const width = String(style.border).match(/(?:^|\s)(\d+(?:\.\d+)?(?:px|em|rem)?|thin|medium|thick)(?:\s|$)/);
          if (width) style["border-width"] = width[1];
          const c = firstColor(style.border);
          if (c !== "transparent") style["border-color"] = c;
        }
        if (style.flex) {
          const parts = String(style.flex).trim().split(/\s+/);
          if (!style["flex-grow"] && /^\d/.test(parts[0] || "")) style["flex-grow"] = parts[0];
          if (!style["flex-basis"] && parts.find((x) => /px|%|auto/.test(x))) style["flex-basis"] = parts.find((x) => /px|%|auto/.test(x));
        }
        if (style["flex-flow"]) {
          if (!style["flex-direction"]) style["flex-direction"] = String(style["flex-flow"]).split(/\s+/).find((x) => /row|column/.test(x)) || "row";
          if (!style["flex-wrap"]) style["flex-wrap"] = String(style["flex-flow"]).split(/\s+/).find((x) => /wrap/.test(x)) || "nowrap";
        }
      }
      function boxEdges(style, w, h) {
        const margin = sides(style.margin, w, h), padding = sides(style.padding, w, h), border = sides(style["border-width"], w, h);
        return {
          marginTop: length(style["margin-top"] ?? margin[0], h),
          marginRight: length(style["margin-right"] ?? margin[1], w),
          marginBottom: length(style["margin-bottom"] ?? margin[2], h),
          marginLeft: length(style["margin-left"] ?? margin[3], w),
          paddingTop: length(style["padding-top"] ?? padding[0], h),
          paddingRight: length(style["padding-right"] ?? padding[1], w),
          paddingBottom: length(style["padding-bottom"] ?? padding[2], h),
          paddingLeft: length(style["padding-left"] ?? padding[3], w),
          borderTop: length(style["border-top-width"] ?? border[0], h),
          borderRight: length(style["border-right-width"] ?? border[1], w),
          borderBottom: length(style["border-bottom-width"] ?? border[2], h),
          borderLeft: length(style["border-left-width"] ?? border[3], w)
        };
      }
      function sides(value) {
        const p = String(value ?? "0").trim().split(/\s+/);
        return [p[0] || "0", p[1] || p[0] || "0", p[2] || p[0] || "0", p[3] || p[1] || p[0] || "0"];
      }
      function intrinsicWidth(element, style, available, viewportW) {
        if (style["flex-basis"] && style["flex-basis"] !== "auto") return length(style["flex-basis"], available);
        if (element.localName === "img") return length(element.getAttribute?.("width"), available) || Math.min(available, 460);
        if (element.localName === "canvas") return Number(element.getAttribute?.("width") || element.width || 300);
        if (style.display === "inline" || style.display === "inline-block") return textWidth3(element.textContent || "", style);
        return Math.max(0, Math.min(available || viewportW, viewportW));
      }
      function intrinsicHeight(element, style, containingHeight) {
        if (element.localName === "img") {
          const attrHeight = length(element.getAttribute?.("height"), containingHeight);
          if (attrHeight) return attrHeight;
          const attrWidth = length(element.getAttribute?.("width"), containingHeight);
          if (attrWidth) return Math.max(24, attrWidth * 0.7);
          return 433;
        }
        if (element.localName === "canvas") return Number(element.getAttribute?.("height") || element.height || 150);
        return 0;
      }
      function cssLength(value, basis, viewportW, viewportH) {
        if (!lengthValue(value)) return null;
        return length(value, basis, viewportW, viewportH);
      }
      function length(value, basis = 0, viewportW = 760, viewportH = 560) {
        const text = String(value ?? "0").trim().toLowerCase();
        if (!text || text === "auto" || text === "unset" || text === "normal") return 0;
        if (text === "thin") return 1;
        if (text === "medium") return 3;
        if (text === "thick") return 5;
        if (text.startsWith("calc(")) return calc(text.slice(5, -1), basis, viewportW, viewportH);
        if (text.endsWith("vw")) return number(text) * viewportW / 100;
        if (text.endsWith("vh")) return number(text) * viewportH / 100;
        if (text.endsWith("vmin")) return number(text) * Math.min(viewportW, viewportH) / 100;
        if (text.endsWith("vmax")) return number(text) * Math.max(viewportW, viewportH) / 100;
        if (text.endsWith("%")) return number(text) * basis / 100;
        if (text.endsWith("rem") || text.endsWith("em")) return number(text) * 16;
        return number(text);
      }
      function calc(expr, basis, viewportW, viewportH) {
        const safe = String(expr).replace(/(-?\d+(?:\.\d+)?)(vw|vh|vmin|vmax|%|rem|em|px)?/g, (_, n2, unit) => String(length(n2 + (unit || "px"), basis, viewportW, viewportH)));
        if (!/^[\d+\-*/().\s]+$/.test(safe)) return 0;
        try {
          return Function(`"use strict";return (${safe})`)();
        } catch {
          return 0;
        }
      }
      function edge(value, basis, fallback) {
        return lengthValue(value) ? length(value, basis) : fallback;
      }
      function lengthValue(value) {
        return value != null && String(value).trim() !== "" && !["auto", "normal", "unset"].includes(String(value).trim());
      }
      function number(value) {
        return Number.parseFloat(String(value ?? "0")) || 0;
      }
      function opacity(value) {
        const n2 = Number.parseFloat(String(value ?? "1"));
        return Number.isFinite(n2) ? Math.max(0, Math.min(1, n2)) : 1;
      }
      function clamp(value, min = null, max = null) {
        let out = value;
        if (min != null) out = Math.max(out, min);
        if (max != null && max > 0) out = Math.min(out, max);
        return out;
      }
      function lineHeight(style) {
        return style["line-height"] && style["line-height"] !== "normal" ? length(style["line-height"], fontSize(style)) : fontSize(style) * 1.2;
      }
      function fontSize(style) {
        return length(style["font-size"] || "16px", 16) || 16;
      }
      function textWidth3(text, style) {
        return Math.max(0, normalizeText(text).length * fontSize(style) * 0.55 + number(style["letter-spacing"]) * normalizeText(text).length);
      }
      function textBlockHeight(text, width, style) {
        return wrapText(text, width, style).length * lineHeight(style);
      }
      function wrapText(text, width, style) {
        const value = normalizeText(text);
        if (!value) return [];
        if ((style["white-space"] || "").includes("nowrap") || width <= 0) return [value];
        const words = value.split(/\s+/), lines = [];
        let line = "";
        for (const word of words) {
          const test = line ? line + " " + word : word;
          if (line && textWidth3(test, style) > width) {
            lines.push(line);
            line = word;
          } else line = test;
        }
        if (line) lines.push(line);
        return lines;
      }
      function normalizeText(text) {
        return String(text || "").replace(/\s+/g, " ").trim();
      }
      function backgroundColor(style) {
        return color(style["background-color"] || firstColor(style.background || "") || "transparent", style.color);
      }
      function borderColor2(style) {
        return color(style["border-color"] || firstColor(style.border || "") || "transparent", style.color);
      }
      function color(value, current = "#000000") {
        const text = String(value || "transparent").trim().toLowerCase();
        if (text === "currentcolor") return color(current);
        if (names[text]) return names[text];
        if (/^#[0-9a-f]{6}$/i.test(text)) return text;
        if (/^#[0-9a-f]{3}$/i.test(text)) return "#" + text.slice(1).split("").map((c) => c + c).join("");
        const rgb = text.match(/^rgba?\(([^)]+)\)$/);
        if (rgb) {
          const parts = rgb[1].split(/[,\s/]+/).filter(Boolean).slice(0, 3).map((part) => Math.max(0, Math.min(255, Number.parseFloat(part))));
          if (parts.length === 3 && parts.every(Number.isFinite)) return "#" + parts.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
        }
        return text === "transparent" ? "transparent" : "#000000";
      }
      function firstColor(value) {
        const text = String(value || "");
        const hex = text.match(/#[0-9a-f]{3,8}\b/i);
        if (hex) return hex[0];
        const rgb = text.match(/rgba?\([^)]+\)/i);
        if (rgb) return rgb[0];
        for (const word of text.toLowerCase().split(/\s+/)) if (names[word]) return word;
        return "transparent";
      }
      function firstUrl(value) {
        const m = String(value || "").match(/url\(([^)]+)\)/i);
        return m ? m[1].replace(/^["']|["']$/g, "") : "";
      }
      function firstBackgroundImage2(value) {
        const text = String(value || "");
        const gradient = text.match(/(?:repeating-)?(?:linear|radial|conic)-gradient\([^)]*\)/i);
        if (gradient) return gradient[0];
        return firstUrl(text);
      }
      function stackOrderedChildren(element, parentStyle, renderer) {
        return Array.from(element.children || []).map((child, order) => {
          const style = renderer.computed(child, parentStyle);
          const positioned = ["relative", "absolute", "fixed", "sticky"].includes(String(style.position || "static"));
          const z = style["z-index"] === "auto" || style["z-index"] == null ? 0 : number(style["z-index"]);
          const bucket = positioned || Number.isFinite(z) && z !== 0 || Number.parseFloat(style.opacity) < 1 ? 1 : 0;
          return { child, order, z, bucket };
        }).sort((a, b) => a.bucket - b.bucket || a.z - b.z || a.order - b.order).map((item) => item.child);
      }
      function transformX(value, width) {
        const m = String(value || "").match(/translate(?:3d|x)?\(([^,)]+)/i);
        return m ? length(m[1], width) : 0;
      }
      function transformY(value, height) {
        const m = String(value || "").match(/translate(?:3d|y)?\([^,]+,\s*([^,)]+)/i);
        return m ? length(m[1], height) : 0;
      }
      function emptyBox() {
        return { outerWidth: 0, outerHeight: 0, contentWidth: 0, contentHeight: 0 };
      }
      return { VirtualWebGLBoxRenderer };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWebGLBoxPaintGeometry.js
var require_VirtualWebGLBoxPaintGeometry = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWebGLBoxPaintGeometry.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory());
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      function visualBox(metrics) {
        return {
          height: Math.max(0, metrics.outerHeight - metrics.marginTop - metrics.marginBottom),
          width: Math.max(0, metrics.outerWidth - metrics.marginLeft - metrics.marginRight)
        };
      }
      function paintRect2(placed, box2, extra = {}) {
        return {
          x: placed.x,
          y: placed.y,
          width: box2.width,
          height: box2.height,
          ...extra
        };
      }
      function isPaintClipped(style) {
        return [style.overflow, style["overflow-x"], style["overflow-y"]].some((value) => value === "hidden" || value === "clip");
      }
      function isTransparentPaint(value) {
        return value === "transparent" || value === "rgba(0,0,0,0)";
      }
      function boundedOpacity(value) {
        const number = Number.parseFloat(String(value ?? "1"));
        return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : 1;
      }
      function paintLength(value, basis) {
        const text = String(value || "0").trim();
        if (text.endsWith("%")) {
          return (Number.parseFloat(text) || 0) * basis / 100;
        }
        return Number.parseFloat(text) || 0;
      }
      return {
        boundedOpacity,
        isPaintClipped,
        isTransparentPaint,
        paintLength,
        paintRect: paintRect2,
        visualBox
      };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWebGLBoxRendererV2.js
var require_VirtualWebGLBoxRendererV2 = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWebGLBoxRendererV2.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory(
          require_VirtualWebGLBoxRenderer(),
          require_CssColorResolver(),
          require_VirtualWebGLBoxPaintGeometry()
        );
      } else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualWebGLBoxRendererV2 = factory(
          root.Merkava,
          root.Merkava,
          root.Merkava
        ).VirtualWebGLBoxRendererV2;
      }
    })(typeof self !== "undefined" ? self : exports, function(baseMod, colorMod, geometryMod) {
      const BaseRenderer = baseMod.VirtualWebGLBoxRenderer;
      const CssColorResolver = colorMod.CssColorResolver;
      class VirtualWebGLBoxRendererV2 extends BaseRenderer {
        constructor(arena, options = {}) {
          super(arena, options);
          this.cssColors = new CssColorResolver();
        }
        /** Records clips, radius, opacity, and transforms against the border box. */
        paintCompositingHints(texture, placed, metrics, style) {
          const box2 = geometryMod.visualBox(metrics);
          const radius = geometryMod.paintLength(style["border-radius"], Math.min(box2.width, box2.height));
          if (geometryMod.isPaintClipped(style)) {
            this.arena.record(texture, "paintClipPush", geometryMod.paintRect(placed, box2, { radius }));
          }
          if (radius > 0) {
            this.arena.record(texture, "paintBorderRadius", geometryMod.paintRect(placed, box2, { radius }));
          }
          const alpha = geometryMod.boundedOpacity(style.opacity);
          if (alpha < 1) {
            this.arena.record(texture, "paintOpacity", geometryMod.paintRect(placed, box2, { alpha }));
          }
          if (style.transform && style.transform !== "none") {
            this.arena.record(texture, "paintTransform", geometryMod.paintRect(placed, box2, { transform: style.transform }));
          }
        }
        /** Emits the matching clip-pop using the same border-box geometry. */
        paintClipPopIfNeeded(texture, placed, metrics, style) {
          if (geometryMod.isPaintClipped(style)) {
            this.arena.record(texture, "paintClipPop", geometryMod.paintRect(placed, geometryMod.visualBox(metrics)));
          }
        }
        /** Paints backgrounds and borders without allowing margins into raster size. */
        paintVisual(_element, texture, placed, metrics, style) {
          const box2 = geometryMod.visualBox(metrics);
          const background2 = this.resolveColor(style["background-color"] || "transparent", style.color);
          const border = this.resolveColor(style["border-color"] || "transparent", style.color);
          if (!geometryMod.isTransparentPaint(background2)) {
            this.arena.record(texture, "paintBox", geometryMod.paintRect(placed, box2, {
              background: background2,
              border: metrics.borderTop,
              color: this.resolveColor(style.color || "black"),
              display: style.display || "block",
              margin: metrics.marginTop,
              padding: metrics.paddingTop
            }));
          }
          const borderWidth2 = Math.max(metrics.borderTop, metrics.borderRight, metrics.borderBottom, metrics.borderLeft);
          if (borderWidth2 > 0 && !geometryMod.isTransparentPaint(border)) {
            this.arena.record(texture, "paintBorder", geometryMod.paintRect(placed, box2, { color: border, widthPx: borderWidth2 }));
          }
          if (style["box-shadow"]) {
            this.arena.record(texture, "paintShadow", geometryMod.paintRect({ x: placed.x + 3, y: placed.y + 3 }, box2, { color: "#000000" }));
          }
          for (const operation of this.imagePaint.backgroundLayers(style, geometryMod.paintRect(placed, box2))) {
            this.arena.record(texture, operation.op, operation);
          }
        }
        /** Keeps replaced canvas/image paint surfaces on their border boxes. */
        paintReplaced(element, texture, placed, metrics, style) {
          const box2 = geometryMod.visualBox(metrics);
          if (element.localName === "img") {
            const operation = this.imagePaint.imageElement(element, geometryMod.paintRect(placed, box2), style);
            this.arena.record(texture, operation.op, operation);
          }
          if (element.localName === "canvas") {
            this.arena.record(texture, "paintBox", geometryMod.paintRect(placed, box2, {
              background: this.resolveColor(style["background-color"] || "#102038", style.color),
              color: this.resolveColor(style.color || "white"),
              display: style.display || "block"
            }));
          }
          return metrics;
        }
        /** @returns {string} Stable internal sRGB token. */
        resolveColor(value, current = "#000000") {
          return this.cssColors.normalize(value, current);
        }
      }
      return { VirtualWebGLBoxRendererV2 };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/RuntimeLog.js
var require_RuntimeLog = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/RuntimeLog.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.RuntimeLog = factory().RuntimeLog;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      class RuntimeLog {
        constructor(prefix = "executor") {
          this.prefix = prefix;
          this.lines = [];
          this.counters = /* @__PURE__ */ Object.create(null);
          this.enabled = true;
        }
        count(name, by = 1) {
          this.counters[name] = (this.counters[name] || 0) + by;
          return this.counters[name];
        }
        push(channel, message, data = null) {
          if (!this.enabled) return null;
          const suffix = data ? " " + Object.entries(data).map(([k, v]) => `${k}=${format(v)}`).join(" ") : "";
          const line = `[${channel}] ${message}${suffix}`;
          this.lines.push(line);
          return line;
        }
        child(prefix) {
          const log = new RuntimeLog(prefix);
          log.lines = this.lines;
          log.counters = this.counters;
          return log;
        }
        text() {
          return this.lines.join("\n");
        }
        toJSON() {
          return { prefix: this.prefix, counters: { ...this.counters }, lines: this.lines.slice() };
        }
      }
      function format(value) {
        return typeof value === "string" ? value : JSON.stringify(value);
      }
      return { RuntimeLog };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/RetainedLayoutEngine.js
var require_RetainedLayoutEngine = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/RetainedLayoutEngine.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory(require_RuntimeLog());
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.RetainedLayoutEngine = factory(root.Merkava).RetainedLayoutEngine;
      }
    })(typeof self !== "undefined" ? self : exports, function(logMod) {
      const RuntimeLog = logMod.RuntimeLog;
      const hidden2 = /* @__PURE__ */ new Set(["head", "style", "script", "meta", "link", "title", "option"]);
      const inline = /* @__PURE__ */ new Set(["#text", "span", "a", "b", "i", "strong", "em", "small", "label"]);
      const px2 = (v) => Number(String(v || "0").replace(/px$/, "")) || 0;
      class RetainedLayoutEngine {
        constructor(document, options = {}) {
          this.document = document;
          this.log = options.log || new RuntimeLog("layout");
          this.tree = null;
          this.ops = [];
          this.clips = [];
        }
        layout(viewport = { width: 760, height: 600 }) {
          this.ops = [];
          this.clips = [];
          this.tree = this.layoutNode(this.document.body, 0, 0, viewport.width, null);
          this.log.push("layout", "final tree", { nodes: countLayout(this.tree), width: viewport.width, height: Math.round(this.tree.height) });
          return this.tree;
        }
        layoutNode(node, x, y, containingWidth, parentStyle) {
          const style = this.computed(node);
          if (!node || hidden2.has(node.localName) || style.display === "none" || node.hidden) return box2(node, x, y, 0, 0, style, []);
          if (style.display === "flex") return this.layoutFlex(node, x, y, containingWidth, style);
          if (style.display === "grid") return this.layoutGrid(node, x, y, containingWidth, style);
          if (style.display === "inline" || inline.has(node.localName)) return this.layoutInline(node, x, y, containingWidth, style);
          return this.layoutBlock(node, x, y, containingWidth, style);
        }
        layoutBlock(node, x, y, containingWidth, style) {
          const margin = px2(style.margin), padding = px2(style.padding), border = px2(style["border-width"]);
          const width = px2(style.width) || intrinsicWidth(node) || Math.max(0, containingWidth - margin * 2);
          let cursorY = y + margin + padding + border;
          const children = [];
          const text = directText2(node);
          if (text) {
            const line = this.textLine(text, x + padding + border, cursorY, width - padding * 2 - border * 2, style);
            children.push(line);
            cursorY += line.height;
          }
          for (const child of node.children || []) {
            if (child.nodeType === 3 && !child.textContent.trim()) continue;
            const childBox = this.layoutNode(child, x + padding + border, cursorY, width - padding * 2 - border * 2, style);
            if (childBox.height || childBox.width) {
              children.push(childBox);
              cursorY += childBox.height;
            }
          }
          const explicitHeight = px2(style.height) || intrinsicHeight(node), minHeight = px2(style["min-height"]);
          const contentHeight = Math.max(explicitHeight, minHeight, cursorY - y + padding + border + margin);
          const out = box2(node, x, y, width, explicitHeight || contentHeight, style, children);
          if (style.overflow === "hidden" || style.overflow === "clip") {
            out.clip = { x, y, width: out.width, height: out.height };
            this.clips.push(out.clip);
            this.log.push("layout", "overflow clip", { rect: `${x},${y},${out.width},${out.height}` });
          }
          this.emitBox(out);
          return out;
        }
        layoutInline(node, x, y, containingWidth, style) {
          const text = directText2(node) || String(node.textContent || "").trim();
          const measured = measureText(text, style, containingWidth);
          const out = box2(node, x, y, px2(style.width) || measured.width, px2(style.height) || measured.height, style, []);
          if (text) out.children.push(this.textLine(text, x + 2, y + 14, containingWidth, style));
          this.emitBox(out);
          return out;
        }
        layoutFlex(node, x, y, containingWidth, style) {
          const padding = px2(style.padding), gap = px2(style.gap) || 0;
          const width = px2(style.width) || containingWidth;
          const direction = style["flex-direction"] || "row";
          let cx = x + padding, cy = y + padding, maxCross = 0;
          const children = [];
          const realChildren = (node.children || []).filter((c) => !hidden2.has(c.localName));
          this.log.push("layout", `flex ${direction}`, { width, children: realChildren.length });
          for (const child of realChildren) {
            const childBox = this.layoutNode(child, cx, cy, width - padding * 2, style);
            children.push(childBox);
            if (direction === "column") {
              cy += childBox.height + gap;
              maxCross = Math.max(maxCross, childBox.width);
            } else {
              cx += childBox.width + gap;
              maxCross = Math.max(maxCross, childBox.height);
            }
          }
          const height = px2(style.height) || (direction === "column" ? cy - y + padding : maxCross + padding * 2);
          const out = box2(node, x, y, width, height, style, children);
          this.emitBox(out);
          return out;
        }
        /**
         * Basic CSS grid layout: grid-template-columns/rows (px, %, fr, auto,
         * repeat()), gap/column-gap/row-gap, explicit grid-column/grid-row
         * placement (line numbers and span), and row-flow auto-placement.
         * Items are top/left aligned within their area (no align/justify yet).
         */
        layoutGrid(node, x, y, containingWidth, style) {
          const padding = px2(style.padding), border = px2(style["border-width"]);
          const width = px2(style.width) || containingWidth;
          const innerWidth = Math.max(0, width - padding * 2 - border * 2);
          const gap = px2(style.gap) || 0;
          const colGap = style["column-gap"] != null && style["column-gap"] !== "" ? px2(style["column-gap"]) : gap;
          const rowGap = style["row-gap"] != null && style["row-gap"] !== "" ? px2(style["row-gap"]) : gap;
          const colTracks = parseGridTracks(style["grid-template-columns"], innerWidth);
          const rowTracks = parseGridTracks(style["grid-template-rows"], 0);
          const items = (node.children || []).filter((c) => c && c.nodeType === 1 && !hidden2.has(c.localName)).map((c) => ({ node: c, style: this.computed(c) })).filter((item) => item.style.display !== "none");
          const occ = [];
          const ensureCell = (r, c) => {
            while (occ.length <= r) occ.push([]);
            while (occ[r].length <= c) occ[r].push(false);
          };
          const colCount = () => Math.max(colTracks.length, 1, ...occ.map((r) => r.length));
          const fits = (r, c, span) => {
            for (let i = 0; i < span; i++) {
              ensureCell(r, c + i);
              if (occ[r][c + i]) return false;
            }
            return true;
          };
          const occupy = (r, c, rowSpan, colSpan) => {
            for (let dr = 0; dr < rowSpan; dr++) for (let dc = 0; dc < colSpan; dc++) {
              ensureCell(r + dr, c + dc);
              occ[r + dr][c + dc] = true;
            }
          };
          const placements = [];
          let cursorR = 0, cursorC = 0;
          for (const item of items) {
            const child = item.node, cs = item.style;
            const col = resolveGridPlacement(cs["grid-column"], colTracks.length);
            const row = resolveGridPlacement(cs["grid-row"], rowTracks.length);
            let r, c;
            if (row.start != null || col.start != null) {
              r = row.start != null ? row.start : cursorR;
              c = col.start != null ? col.start : 0;
              if (col.start == null) {
                c = 0;
                while (!fits(r, c, col.span)) c++;
              }
              occupy(r, c, row.span, col.span);
              cursorR = r;
              cursorC = c + col.span;
            } else {
              const span = col.span;
              r = cursorR;
              c = cursorC;
              let placed = false;
              for (let trial = 0; trial < 4096 && !placed; trial++) {
                if (c + span > colCount()) {
                  r++;
                  c = 0;
                  continue;
                }
                if (fits(r, c, span)) {
                  placed = true;
                  break;
                }
                c++;
                if (c >= colCount()) {
                  r++;
                  c = 0;
                }
              }
              occupy(r, c, row.span, span);
              cursorR = r;
              cursorC = c + span;
            }
            placements.push({ child, style: cs, r, c, rowSpan: row.span, colSpan: col.span });
          }
          const nCols = Math.max(colTracks.length, 1, ...placements.map((p) => p.c + p.colSpan));
          while (colTracks.length < nCols) colTracks.push({ kind: "auto" });
          const fixedW = colTracks.reduce((n2, t) => n2 + (t.kind === "px" ? t.value : 0), 0);
          const autoW = colTracks.map((t, i) => {
            if (t.kind !== "auto") return 0;
            let w = 0;
            for (const p of placements) {
              if (p.c === i && p.colSpan === 1) w = Math.max(w, measureGridContentWidth(p.child, p.style));
            }
            return w;
          });
          const totalFr = colTracks.reduce((n2, t) => n2 + (t.kind === "fr" ? t.value : 0), 0);
          const frBudget = Math.max(0, innerWidth - fixedW - autoW.reduce((a, b) => a + b, 0) - colGap * Math.max(0, nCols - 1));
          const colWidths = colTracks.map((t, i) => t.kind === "px" ? t.value : t.kind === "auto" ? autoW[i] : totalFr > 0 ? frBudget * t.value / totalFr : 0);
          const colX = [];
          {
            let acc = x + padding + border;
            for (let i = 0; i < nCols; i++) {
              colX.push(acc);
              acc += colWidths[i] + colGap;
            }
          }
          const nRows = Math.max(rowTracks.length, 1, ...placements.map((p) => p.r + p.rowSpan));
          while (rowTracks.length < nRows) rowTracks.push({ kind: "auto" });
          const explicitH = px2(style.height);
          const rowHeights = rowTracks.map((t) => t.kind === "px" ? t.value : 0);
          const children = [];
          let cursorY = y + padding + border;
          const byRow = /* @__PURE__ */ new Map();
          for (const p of placements) {
            if (!byRow.has(p.r)) byRow.set(p.r, []);
            byRow.get(p.r).push(p);
          }
          for (let r = 0; r < nRows; r++) {
            let maxH = rowHeights[r] || 0;
            const laid = [];
            for (const p of byRow.get(r) || []) {
              const w = colWidths.slice(p.c, p.c + p.colSpan).reduce((a, b) => a + b, 0) + colGap * Math.max(0, p.colSpan - 1);
              const childBox = this.layoutNode(p.child, colX[p.c], cursorY, Math.max(0, w), p.style);
              laid.push({ box: childBox });
              maxH = Math.max(maxH, childBox.height);
            }
            const fixed = rowTracks[r] && rowTracks[r].kind === "px" ? rowTracks[r].value : 0;
            const rh = Math.max(fixed, maxH);
            rowHeights[r] = rh;
            for (const entry of laid) {
              if (px2(entry.box.style.height) === 0 && entry.box.height < rh) entry.box.height = rh;
            }
            for (const b of laid) children.push(b.box);
            cursorY += rh + (r < nRows - 1 ? rowGap : 0);
          }
          const contentHeight = nRows ? cursorY - rowGap - (y + padding + border) : 0;
          const height = Math.max(explicitH, contentHeight + padding * 2 + border * 2);
          const out = box2(node, x, y, width, explicitH || height, style, children);
          this.log.push("layout", "grid", { width, height: Math.round(out.height), cols: nCols, rows: nRows });
          this.emitBox(out);
          return out;
        }
        textLine(text, x, y, width, style) {
          const measured = measureText(text, style, width);
          if (measured.lines > 1) this.log.push("layout", "linebreak", { x: Math.round(x + width), lines: measured.lines });
          const node = { localName: "#text-line", textContent: text };
          const out = box2(node, x, y, Math.min(width || measured.width, measured.width), measured.height, style, []);
          out.text = text;
          this.emitBox(out);
          return out;
        }
        computed(node) {
          return node?.ownerDocument?.cssEngine?.compute(node) || node?.style?.toJSON?.() || {};
        }
        emitBox(b) {
          this.ops.push({ op: "layoutBox", tag: b.tag, id: b.id, x: b.x, y: b.y, width: b.width, height: b.height, background: b.style["background-color"] || "", color: b.style.color || "" });
          if (b.text) this.ops.push({ op: "layoutText", text: b.text, x: b.x, y: b.y, color: b.style.color || "#111111" });
        }
      }
      function directText2(node) {
        if (!node) return "";
        if (node.localName === "input") return String(node.value || node.placeholder || "").trim();
        if (node.localName === "textarea") return String(node.value || node.textContent || "").trim();
        if (node.localName === "select") return String((node.children || []).find((x) => x.selected)?.textContent || node.value || "").trim();
        return node.nodeType === 3 ? String(node.textContent || "").trim() : String(node._textContent || "").trim();
      }
      function measureText(text, style, width = 9999) {
        const size = px2(style["font-size"]) || 16;
        const charW = size * 0.52;
        const rawWidth = String(text || "").length * charW;
        const lines = Math.max(1, Math.ceil(rawWidth / Math.max(1, width || rawWidth || 1)));
        return { width: Math.min(rawWidth, width || rawWidth), height: lines * Math.ceil(size * 1.25), lines, charW };
      }
      function intrinsicWidth(node) {
        return ["canvas", "img", "video"].includes(node?.localName) ? px2(node.getAttribute?.("width")) : 0;
      }
      function intrinsicHeight(node) {
        return ["canvas", "img", "video"].includes(node?.localName) ? px2(node.getAttribute?.("height")) : 0;
      }
      function intrinsicWidth(node) {
        return ["canvas", "img", "video"].includes(node?.localName) ? px2(node.getAttribute?.("width")) : 0;
      }
      function intrinsicHeight(node) {
        return ["canvas", "img", "video"].includes(node?.localName) ? px2(node.getAttribute?.("height")) : 0;
      }
      function box2(node, x, y, width, height, style, children) {
        return { node, tag: node?.localName || "", id: node?.id || "", x, y, width, height, style: style || {}, children: children || [] };
      }
      function countLayout(node) {
        return node ? 1 + (node.children || []).reduce((n2, c) => n2 + countLayout(c), 0) : 0;
      }
      function parseGridTracks(value, base) {
        const expanded = expandGridRepeat(String(value || "").trim());
        if (!expanded) return [];
        const tracks2 = [];
        for (const part of splitGridTracks(expanded)) {
          const t = part.trim().toLowerCase();
          if (!t || t === "none") continue;
          if (t === "auto" || t === "min-content" || t === "max-content") {
            tracks2.push({ kind: "auto" });
            continue;
          }
          if (t.endsWith("fr")) {
            tracks2.push({ kind: "fr", value: Math.max(0, parseFloat(t) || 0) });
            continue;
          }
          if (t.endsWith("%")) {
            tracks2.push({ kind: "px", value: Math.max(0, (parseFloat(t) || 0) / 100 * base) });
            continue;
          }
          tracks2.push({ kind: "px", value: Math.max(0, px2(t)) });
        }
        return tracks2;
      }
      function expandGridRepeat(value) {
        let out = String(value || ""), guard = 0, m;
        const re = /repeat\(\s*(\d+)\s*,/i;
        while ((m = re.exec(out)) && guard++ < 16) {
          const openAt = out.indexOf("(", m.index);
          const closeAt = balancedGridParenEnd(out, openAt);
          if (closeAt < 0) break;
          const inner = out.slice(openAt + 1, closeAt).replace(/^[^,]+,/, "").trim();
          const n2 = Math.min(parseInt(m[1], 10) || 0, 64);
          const repeated = Array(n2).fill(inner).join(" ");
          out = out.slice(0, m.index) + " " + repeated + " " + out.slice(closeAt + 1);
        }
        return out;
      }
      function splitGridTracks(value) {
        const parts = [];
        let start = 0, depth = 0;
        for (let at = 0; at <= value.length; at++) {
          const ch = value[at];
          if (ch === "(") depth++;
          if (ch === ")") depth = Math.max(0, depth - 1);
          if ((at === value.length || ch === " " || ch === "	" || ch === "\n") && depth === 0) {
            const part = value.slice(start, at).trim();
            if (part) parts.push(part);
            start = at + 1;
          }
        }
        return parts;
      }
      function balancedGridParenEnd(text, openAt) {
        let depth = 0;
        for (let at = openAt; at < text.length; at++) {
          if (text[at] === "(") depth++;
          else if (text[at] === ")") {
            depth--;
            if (depth === 0) return at;
          }
        }
        return -1;
      }
      function resolveGridPlacement(value, trackCount) {
        const text = String(value || "").trim().toLowerCase();
        if (!text || text === "auto") return { start: null, span: 1 };
        const sides = text.split("/").map((s) => s.trim());
        const first = parseGridLine(sides[0], trackCount);
        const second = sides.length > 1 ? parseGridLine(sides[1], trackCount) : null;
        if (first && first.spanOnly) return { start: null, span: first.span };
        if (first && second && second.spanOnly) return { start: first.line, span: second.span };
        if (first && second && second.line != null) return { start: first.line, span: Math.max(1, second.line - first.line) };
        if (first && first.line != null) return { start: first.line, span: 1 };
        return { start: null, span: 1 };
      }
      function parseGridLine(part, trackCount) {
        if (!part || part === "auto") return null;
        const spanMatch = part.match(/^span\s+(\d+)$/);
        if (spanMatch) return { spanOnly: true, span: Math.max(1, parseInt(spanMatch[1], 10)) };
        const n2 = parseInt(part, 10);
        if (isNaN(n2) || n2 === 0) return null;
        const line = n2 > 0 ? n2 - 1 : Math.max(0, trackCount + n2);
        return { line: Math.max(0, line), span: 1 };
      }
      function measureGridContentWidth(node, style) {
        const padding = px2(style?.padding) * 2;
        if (!node) return padding;
        if (node.nodeType === 3) {
          const size = px2(style?.["font-size"]) || 16;
          return padding + String(node.textContent || "").length * size * 0.52;
        }
        if (["img", "canvas", "video"].includes(node.localName)) return padding + (px2(node.getAttribute?.("width")) || 0);
        let w = 0;
        for (const child of node.children || []) w = Math.max(w, measureGridContentWidth(child, style));
        const text = String(node._textContent || "").trim();
        if (text && (!node.children || !node.children.length)) {
          const size = px2(style?.["font-size"]) || 16;
          w = Math.max(w, text.length * size * 0.52);
        }
        return padding + w;
      }
      return { RetainedLayoutEngine };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/BrowserRenderPipeline.js
var require_BrowserRenderPipeline = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/BrowserRenderPipeline.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory(require_RetainedLayoutEngine());
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.BrowserRenderPipeline = factory(root.Merkava).BrowserRenderPipeline;
      }
    })(typeof self !== "undefined" ? self : exports, function(layoutMod) {
      const RetainedLayoutEngine = layoutMod.RetainedLayoutEngine;
      class BrowserRenderPipeline {
        constructor(window, options = {}) {
          this.window = window;
          this.document = window.document;
          this.renderer = options.renderer;
          this.viewport = options.viewport || { width: 760, height: 560 };
          this.layoutEngine = new RetainedLayoutEngine(this.document);
        }
        /**
         * Runs the explicit browser pipeline and returns a retained render snapshot.
         *
         * @returns {{textures: object[], commands: object[], pipeline: object}}
         */
        render() {
          const beforePaint = this.document.textureArena.commands.length;
          const sched = this.document.__layoutScheduler;
          if (sched && !sched.engine) sched.attachEngine(this.layoutEngine, () => this.viewport);
          const vp = sched && sched.lastViewport || this.viewport;
          const layoutTree = sched ? sched.layoutIfNeeded(vp) : this.layoutEngine.layout(this.viewport);
          this.renderer.paintElement(this.document.body, 0, 0, this.viewport.width, this.viewport.height);
          const gpuSnapshot = this.document.textureArena.snapshot();
          const displayList = buildDisplayList(gpuSnapshot.commands);
          return {
            ...gpuSnapshot,
            pipeline: {
              architecture: "merkava-executor-retained-pipeline-v1",
              phases: ["computed-style", "layout-tree", "display-list", "paint-order", "native-gpu-stream"],
              viewport: this.viewport,
              preservedCommandCount: beforePaint,
              layoutRoot: summarizeLayout(layoutTree),
              layoutOps: this.layoutEngine.ops,
              displayList,
              commandCount: gpuSnapshot.commands.length
            }
          };
        }
      }
      function buildDisplayList(commands) {
        return commands.filter((command) => command.op !== "createTexture").map((command, index) => ({
          id: index,
          op: normalizePaintOp(command.op),
          sourceOp: command.op,
          texture: command.texture ?? null,
          bounds: boundsOf(command),
          payload: command
        }));
      }
      function normalizePaintOp(op) {
        const map = {
          paintBox: "DRAW_BACKGROUND",
          paintBorder: "DRAW_BORDER",
          paintTextPlaceholder: "DRAW_TEXT_RUN",
          paintImageTexture: "DRAW_IMAGE",
          paintBackgroundImage: "DRAW_IMAGE",
          paintGradient: "DRAW_GRADIENT",
          paintShadow: "DRAW_SHADOW",
          paintClipPush: "PUSH_CLIP",
          paintClipPop: "POP_CLIP",
          paintOpacity: "SET_OPACITY",
          paintTransform: "SET_TRANSFORM",
          paintBorderRadius: "SET_RADIUS"
        };
        return map[op] || op;
      }
      function boundsOf(command) {
        return { x: num4(command.x), y: num4(command.y), width: num4(command.width), height: num4(command.height) };
      }
      function summarizeLayout(node) {
        if (!node) return null;
        return { tag: node.tag, id: node.id, x: node.x, y: node.y, width: node.width, height: node.height, children: (node.children || []).length };
      }
      function num4(value) {
        return Number.isFinite(Number(value)) ? Number(value) : 0;
      }
      return { BrowserRenderPipeline };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualOffscreenCanvas.js
var require_VirtualOffscreenCanvas = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualOffscreenCanvas.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        const lazyRequire = (path2) => {
          let mod = null;
          return new Proxy({}, {
            get(t, prop) {
              if (typeof prop === "symbol") return void 0;
              if (!mod) mod = __require(path2);
              return mod[prop];
            }
          });
        };
        module.exports = factory(lazyRequire("./VirtualCanvas2DContext.js"), lazyRequire("./VirtualWebGLContext.js"), require_VirtualWebGLTextureArena());
      } else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualOffscreenCanvas = factory(root.Merkava, root.Merkava, root.Merkava).VirtualOffscreenCanvas;
        root.Merkava.VirtualImageData = factory(root.Merkava, root.Merkava, root.Merkava).VirtualImageData;
      }
    })(typeof self !== "undefined" ? self : exports, function(canvas2dMod, webglMod, arenaMod) {
      const VirtualWebGLTextureArena = arenaMod.VirtualWebGLTextureArena;
      class VirtualOffscreenCanvas {
        constructor(width = 300, height = 150, ownerDocument = null, arena = null) {
          this.localName = "canvas";
          this.tagName = "OFFSCREENCANVAS";
          this.nodeType = 1;
          this.ownerDocument = ownerDocument || null;
          this.width = positiveInt(width, 300);
          this.height = positiveInt(height, 150);
          this.textureArena = arena || ownerDocument?.textureArena || new VirtualWebGLTextureArena();
          this.__webglCanvasTexture = null;
          this.__canvas2dContext = null;
          this.__webglContext = null;
        }
        getContext(kind, options = {}) {
          const type = String(kind || "").toLowerCase();
          if (type === "2d") return this.__canvas2dContext ||= new canvas2dMod.VirtualCanvas2DContext(this, this.textureArena, options);
          if (type === "webgl" || type === "webgl2" || type === "experimental-webgl") return this.__webglContext ||= new webglMod.VirtualWebGLContext(this, this.textureArena, options);
          return null;
        }
        convertToBlob(options = {}) {
          const type = String(options.type || "image/png");
          const png = this.__encodePng();
          const BlobCtor = typeof Blob !== "undefined" ? Blob : class Blob {
            constructor(parts, init) {
              this.parts = parts;
              this.type = init?.type || "";
              this.size = parts.join("").length;
            }
          };
          return Promise.resolve(new BlobCtor([png], { type }));
        }
        // B"H 2026-10-09 (readback): REAL toDataURL. Rasterizes the 2d context
        // (or WebGL drawing buffer) and PNG-encodes. The encode path is the same
        // one the snapshot renderer uses (already 23-40x optimized).
        toDataURL(type = "image/png", quality) {
          const png = this.__encodePng();
          if (typeof Buffer !== "undefined") return `data:image/png;base64,${png.toString("base64")}`;
          let bin = "";
          for (let i = 0; i < png.length; i++) bin += String.fromCharCode(png[i]);
          return `data:image/png;base64,${btoa(bin)}`;
        }
        __encodePng() {
          const w = Math.max(1, this.width), h = Math.max(1, this.height);
          let rgba = null;
          if (this.__canvas2dContext && typeof this.__canvas2dContext.__rasterize === "function") {
            rgba = this.__canvas2dContext.__rasterize().data;
          } else if (this.__webglContext && this.__webglContext.drawingBuffer) {
            rgba = this.__webglContext.drawingBuffer.color;
          }
          if (!this.__pngTools && typeof __require === "function") {
            try {
              this.__pngTools = (init_pngTools(), __toCommonJS(pngTools_exports));
            } catch (e) {
              this.__pngTools = null;
            }
          }
          if (!rgba) rgba = new Uint8ClampedArray(w * h * 4);
          if (this.__pngTools && this.__pngTools.rgbPngFromRgba) {
            return this.__pngTools.rgbPngFromRgba(rgba, w, h, { level: 1 });
          }
          return typeof Buffer !== "undefined" ? Buffer.from(rgba) : rgba;
        }
        transferToImageBitmap() {
          return new VirtualImageBitmap(this.width, this.height, this.__webglCanvasTexture, this.textureArena.snapshot());
        }
        toJSON() {
          return { kind: "OffscreenCanvas", width: this.width, height: this.height, texture: this.__webglCanvasTexture?.id ?? null };
        }
      }
      class VirtualImageBitmap {
        constructor(width, height, texture = null, snapshot = null) {
          this.width = width;
          this.height = height;
          this.__webglCanvasTexture = texture;
          this.snapshot = snapshot;
          this.closed = false;
        }
        close() {
          this.closed = true;
        }
      }
      class VirtualImageData {
        constructor(dataOrWidth, width, height, options = {}) {
          if (typeof dataOrWidth === "number") {
            this.width = positiveInt(dataOrWidth, 0);
            this.height = positiveInt(width, 0);
            this.data = new Uint8ClampedArray(this.width * this.height * 4);
          } else {
            this.data = dataOrWidth instanceof Uint8ClampedArray ? dataOrWidth : new Uint8ClampedArray(dataOrWidth || []);
            this.width = positiveInt(width, 0);
            this.height = positiveInt(height, Math.floor(this.data.length / Math.max(1, this.width * 4)));
          }
          this.colorSpace = options.colorSpace || "srgb";
        }
      }
      function positiveInt(value, fallback) {
        const n2 = Math.floor(Number(value));
        return Number.isFinite(n2) && n2 >= 0 ? n2 : fallback;
      }
      return { VirtualOffscreenCanvas, VirtualImageBitmap, VirtualImageData };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWorker.js
var require_VirtualWorker = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWorker.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualWorker = factory().VirtualWorker;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      class VirtualWorker {
        constructor(scriptURL = "", options = {}, host = {}) {
          this.scriptURL = String(scriptURL || "");
          this.options = options || {};
          this.host = host || {};
          this.listeners = { message: [], error: [], messageerror: [] };
          this.onmessage = null;
          this.onerror = null;
          this.terminated = false;
          this.scope = this.createScope();
          this.loadScript(this.scriptURL);
        }
        postMessage(data) {
          if (!this.terminated) queueMicrotaskSafe(() => this.scope.__dispatchFromHost(data));
        }
        terminate() {
          this.terminated = true;
        }
        addEventListener(type, fn) {
          if (fn) (this.listeners[type] = this.listeners[type] || []).push(fn);
        }
        removeEventListener(type, fn) {
          this.listeners[type] = (this.listeners[type] || []).filter((x) => x !== fn);
        }
        dispatchEvent(event) {
          return dispatch(this, event);
        }
        createScope() {
          const worker = this;
          const scope = {
            self: null,
            globalThis: null,
            onmessage: null,
            onerror: null,
            location: { href: this.scriptURL, toString() {
              return this.href;
            } },
            navigator: this.host.navigator || { userAgent: "MerkavaWorker/1.0" },
            close() {
              worker.terminate();
            },
            postMessage(data) {
              if (!worker.terminated) queueMicrotaskSafe(() => worker.__dispatchToHost(data));
            },
            addEventListener(type, fn) {
              if (fn) (scope.__listeners[type] = scope.__listeners[type] || []).push(fn);
            },
            removeEventListener(type, fn) {
              scope.__listeners[type] = (scope.__listeners[type] || []).filter((x) => x !== fn);
            },
            dispatchEvent(event) {
              return dispatch(scope, event);
            },
            importScripts(...urls) {
              for (const url of urls) worker.evaluateScript(worker.resolveScript(url), String(url));
            },
            setTimeout: this.host.setTimeout || setTimeout,
            clearTimeout: this.host.clearTimeout || clearTimeout,
            setInterval: this.host.setInterval || setInterval,
            clearInterval: this.host.clearInterval || clearInterval,
            console: this.host.console || console,
            fetch: this.host.fetch || fetch,
            OffscreenCanvas: this.host.OffscreenCanvas,
            ImageData: this.host.ImageData,
            ImageBitmap: this.host.ImageBitmap,
            Path2D: this.host.Path2D,
            Blob: this.host.Blob || Blob,
            URL: this.host.URL || URL,
            __listeners: { message: [], error: [], messageerror: [] },
            __dispatchFromHost(data) {
              dispatch(scope, { type: "message", data, target: scope, currentTarget: scope });
            }
          };
          scope.self = scope;
          scope.globalThis = scope;
          return scope;
        }
        loadScript(url) {
          const code = this.resolveScript(url);
          if (code) this.evaluateScript(code, url);
        }
        resolveScript(url) {
          const key = String(url || "").replace(/^\.\//, "");
          const files = this.host.files || {};
          return files[key] || files["/" + key] || files[this.scriptURL] || "";
        }
        evaluateScript(code, label = this.scriptURL) {
          try {
            const fn = new Function("self", `with(self){
${String(code || "")}
}
//# sourceURL=${label || "virtual-worker.js"}`);
            fn(this.scope);
          } catch (error) {
            dispatch(this.scope, { type: "error", message: error.message, error, filename: label, target: this.scope, currentTarget: this.scope });
            this.__dispatchError(error, label);
          }
        }
        __dispatchToHost(data) {
          dispatch(this, { type: "message", data, target: this, currentTarget: this });
        }
        __dispatchError(error, filename) {
          dispatch(this, { type: "error", message: error.message, error, filename, target: this, currentTarget: this });
        }
      }
      function dispatch(target, event) {
        const list = (target.listeners || target.__listeners || {})[event.type] || [];
        const handler = target["on" + event.type];
        if (typeof handler === "function") handler.call(target, event);
        for (const fn of list.slice()) fn.call(target, event);
        return true;
      }
      function queueMicrotaskSafe(fn) {
        if (typeof queueMicrotask === "function") queueMicrotask(fn);
        else Promise.resolve().then(fn);
      }
      return { VirtualWorker };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualPath2D.js
var require_VirtualPath2D = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualPath2D.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualPath2D = factory().VirtualPath2D;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      class VirtualPath2D {
        constructor(source = null) {
          this.commands = [];
          if (source instanceof VirtualPath2D) this.commands = source.commands.map((item) => item.slice());
          else if (typeof source === "string" && source.trim()) this.commands.push(["svgPath", source]);
        }
        addPath(path2) {
          if (path2?.commands) this.commands.push(...path2.commands.map((item) => item.slice()));
        }
        closePath() {
          this.commands.push(["closePath"]);
        }
        moveTo(x, y) {
          this.commands.push(["moveTo", x, y]);
        }
        lineTo(x, y) {
          this.commands.push(["lineTo", x, y]);
        }
        rect(x, y, width, height) {
          this.commands.push(["rect", x, y, width, height]);
        }
        roundRect(x, y, width, height, radii = 0) {
          this.commands.push(["roundRect", x, y, width, height, radii]);
        }
        arc(x, y, radius, startAngle, endAngle, anticlockwise = false) {
          this.commands.push(["arc", x, y, radius, startAngle, endAngle, anticlockwise]);
        }
        ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise = false) {
          this.commands.push(["ellipse", x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise]);
        }
        quadraticCurveTo(cpx, cpy, x, y) {
          this.commands.push(["quadraticCurveTo", cpx, cpy, x, y]);
        }
        bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
          this.commands.push(["bezierCurveTo", cp1x, cp1y, cp2x, cp2y, x, y]);
        }
      }
      return { VirtualPath2D };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualAudioDevices.js
var require_VirtualAudioDevices = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualAudioDevices.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.Merkava = root.Merkava || {};
        root.Merkava.installVirtualAudioDevices = factory().installVirtualAudioDevices;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      function installVirtualAudioDevices(windowObject) {
        windowObject.AudioContext = VirtualAudioContext;
        windowObject.webkitAudioContext = VirtualAudioContext;
        windowObject.Audio = VirtualAudio;
      }
      class VirtualAudio {
        constructor(source = "") {
          this.src = source;
          this.currentTime = 0;
          this.paused = true;
        }
        play() {
          this.paused = false;
          return Promise.resolve();
        }
        pause() {
          this.paused = true;
        }
        load() {
        }
      }
      class VirtualAudioContext {
        constructor() {
          this.currentTime = 0;
          this.destination = {};
          this.sampleRate = 44100;
          this.state = "running";
        }
        createOscillator() {
          return audioNode({ frequency: { value: 440 }, start() {
          }, stop() {
          } });
        }
        createGain() {
          return audioNode({ gain: { value: 1 } });
        }
        createBuffer() {
          return {};
        }
        createBufferSource() {
          return audioNode({ buffer: null, start() {
          }, stop() {
          } });
        }
        resume() {
          this.state = "running";
          return Promise.resolve();
        }
        suspend() {
          this.state = "suspended";
          return Promise.resolve();
        }
        close() {
          this.state = "closed";
          return Promise.resolve();
        }
        decodeAudioData(data) {
          return Promise.resolve(data || {});
        }
      }
      function audioNode(extra = {}) {
        return { connect() {
          return this;
        }, disconnect() {
        }, ...extra };
      }
      return { installVirtualAudioDevices };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWindowMedia.js
var require_VirtualWindowMedia = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWindowMedia.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory(
          require_VirtualOffscreenCanvas(),
          require_VirtualWorker(),
          require_VirtualPath2D(),
          require_VirtualAudioDevices()
        );
      } else {
        root.Merkava = root.Merkava || {};
        root.Merkava.installVirtualWindowMedia = factory(
          root.Merkava,
          root.Merkava,
          root.Merkava,
          root.Merkava
        ).installVirtualWindowMedia;
      }
    })(typeof self !== "undefined" ? self : exports, function(canvasMod, workerMod, pathMod, audioMod) {
      const VirtualOffscreenCanvas = canvasMod.VirtualOffscreenCanvas;
      const VirtualImageData = canvasMod.VirtualImageData;
      const VirtualImageBitmap = canvasMod.VirtualImageBitmap;
      const VirtualWorker = workerMod.VirtualWorker;
      const VirtualPath2D = pathMod.VirtualPath2D;
      function installVirtualWindowMedia(windowObject) {
        windowObject.Blob = globalThis.Blob || BasicBlob;
        windowObject.File = createFileClass(windowObject.Blob);
        windowObject.FormData = BasicFormData;
        windowObject.Image = createImageClass(windowObject);
        windowObject.ImageData = VirtualImageData;
        windowObject.ImageBitmap = VirtualImageBitmap;
        windowObject.OffscreenCanvas = createCanvasClass(windowObject);
        windowObject.Path2D = VirtualPath2D;
        windowObject.Worker = createWorkerClass(windowObject);
        audioMod.installVirtualAudioDevices(windowObject);
      }
      class BasicBlob {
        constructor(parts = [], options = {}) {
          this.parts = parts;
          this.type = options.type || "";
          this.size = parts.join("").length;
        }
      }
      class BasicFormData {
        constructor() {
          this.items = [];
        }
        append(name, value) {
          this.items.push([name, value]);
        }
      }
      function createFileClass(BlobClass) {
        return class File extends BlobClass {
          constructor(parts, name, options = {}) {
            super(parts, options);
            this.name = name;
          }
        };
      }
      function createCanvasClass(windowObject) {
        return class OffscreenCanvas extends VirtualOffscreenCanvas {
          constructor(width, height) {
            super(width, height, windowObject.document, windowObject.document.textureArena);
          }
        };
      }
      function createWorkerClass(windowObject) {
        return class Worker extends VirtualWorker {
          constructor(scriptUrl, options = {}) {
            super(scriptUrl, options, workerHost(windowObject));
          }
        };
      }
      function workerHost(windowObject) {
        return {
          Blob: windowObject.Blob,
          OffscreenCanvas: windowObject.OffscreenCanvas,
          Path2D: windowObject.Path2D,
          URL: windowObject.URL,
          console: windowObject.console,
          clearInterval: windowObject.clearInterval.bind(windowObject),
          clearTimeout: windowObject.clearTimeout.bind(windowObject),
          fetch: windowObject.fetch,
          files: windowObject.files,
          navigator: windowObject.navigator,
          setInterval: windowObject.setInterval.bind(windowObject),
          setTimeout: windowObject.setTimeout.bind(windowObject)
        };
      }
      function createImageClass(windowObject) {
        return class Image {
          constructor(width = 0, height = 0) {
            this.width = width;
            this.height = height;
            this.complete = false;
            this.onload = null;
            this.onerror = null;
            this.__src = "";
          }
          set src(value) {
            this.__src = String(value || "");
            this.complete = true;
            windowObject.setTimeout(() => this.onload?.(new windowObject.Event("load")), 0);
          }
          get src() {
            return this.__src;
          }
          decode() {
            return Promise.resolve();
          }
          addEventListener(type, handler) {
            if (type === "load") this.onload = handler;
            if (type === "error") this.onerror = handler;
          }
          removeEventListener() {
          }
        };
      }
      return { installVirtualWindowMedia };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualDeterministicCrypto.js
var require_VirtualDeterministicCrypto = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualDeterministicCrypto.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualDeterministicCrypto = factory().VirtualDeterministicCrypto;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      class VirtualDeterministicCrypto {
        constructor(seed = 1096242259) {
          this.state = normalizeSeed(seed);
          this.calls = 0;
        }
        getRandomValues(target) {
          if (!ArrayBuffer.isView(target) || target instanceof DataView) {
            throw cryptoError("MERKAVA_CRYPTO_TARGET");
          }
          const bytes = new Uint8Array(target.buffer, target.byteOffset, target.byteLength);
          for (let index = 0; index < bytes.length; index += 1) {
            bytes[index] = this.nextByte();
          }
          this.calls += 1;
          return target;
        }
        randomUUID() {
          const bytes = this.getRandomValues(new Uint8Array(16));
          bytes[6] = bytes[6] & 15 | 64;
          bytes[8] = bytes[8] & 63 | 128;
          const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
          return [
            hex.slice(0, 4).join(""),
            hex.slice(4, 6).join(""),
            hex.slice(6, 8).join(""),
            hex.slice(8, 10).join(""),
            hex.slice(10).join("")
          ].join("-");
        }
        snapshot() {
          return Object.freeze({ calls: this.calls, state: this.state >>> 0 });
        }
        nextByte() {
          let value = this.state >>> 0;
          value ^= value << 13;
          value ^= value >>> 17;
          value ^= value << 5;
          this.state = value >>> 0;
          return this.state & 255;
        }
      }
      function normalizeSeed(value) {
        const seed = Number(value) >>> 0;
        return seed || 1096242259;
      }
      function cryptoError(code) {
        const error = new TypeError(code);
        error.code = code;
        return error;
      }
      return { VirtualDeterministicCrypto };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualBrowserApis.js
var require_VirtualBrowserApis = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualBrowserApis.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualBrowserApis = factory().VirtualBrowserApis;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      function nodeRequire(name) {
        try {
          if (typeof __require === "function") return __require(name);
        } catch (e) {
        }
        return null;
      }
      function nodeFs() {
        return nodeRequire("fs");
      }
      function nodePath() {
        return nodeRequire("path");
      }
      function nodeOs() {
        return nodeRequire("os");
      }
      class VirtualFile {
        constructor(absPath, name) {
          const fs = nodeFs();
          this.__path = absPath;
          this.name = name || absPath.split(/[\\/]/).pop();
          let stat = null;
          try {
            stat = fs.statSync(absPath);
          } catch (e) {
          }
          this.size = stat ? stat.size : 0;
          this.lastModified = stat ? stat.mtimeMs : Date.now();
          this.type = "";
        }
        get path() {
          return this.__path;
        }
        async arrayBuffer() {
          const fs = nodeFs();
          const buf = fs.readFileSync(this.__path);
          return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
        }
        async text() {
          return nodeFs().readFileSync(this.__path, "utf8");
        }
        async bytes() {
          return new Uint8Array(await this.arrayBuffer());
        }
        stream() {
          const fs = nodeFs();
          const p = this.__path;
          async function* gen() {
            const fd = fs.openSync(p, "r");
            try {
              const CH = 65536;
              const buf = Buffer.allocUnsafe(CH);
              let pos = 0, n2;
              while ((n2 = fs.readSync(fd, buf, 0, CH, pos)) > 0) {
                pos += n2;
                yield buf.subarray(0, n2);
              }
            } finally {
              fs.closeSync(fd);
            }
          }
          return gen();
        }
      }
      class VirtualFileSystemWritable {
        constructor(absPath, keepExisting) {
          this.__path = absPath;
          this.__fd = null;
          this.__keepExisting = !!keepExisting;
          this.__closed = false;
        }
        __open() {
          if (this.__fd === null) {
            const fs = nodeFs();
            this.__fd = fs.openSync(this.__path, this.__keepExisting ? "r+" : "w");
          }
          return this.__fd;
        }
        async write(data) {
          if (this.__closed) throw new Error("Writable already closed");
          const fs = nodeFs();
          const fd = this.__open();
          if (data && typeof data === "object" && data.type === "write" && data.position !== void 0) {
            const buf2 = toBuffer(data.data);
            fs.writeSync(fd, buf2, 0, buf2.length, data.position);
            return;
          }
          if (data && typeof data === "object" && (data.type === "seek" || data.type === "truncate")) {
            if (data.type === "truncate") fs.ftruncateSync(fd, Number(data.size || 0));
            return;
          }
          const buf = toBuffer(data);
          fs.writeSync(fd, buf, 0, buf.length);
        }
        async seek(position) {
          if (this.__closed) throw new Error("Writable already closed");
          const fs = nodeFs();
          const fd = this.__open();
          this.__offset = Number(position) || 0;
          void fs;
          void fd;
        }
        async truncate(size) {
          const fs = nodeFs();
          fs.ftruncateSync(this.__open(), Number(size) || 0);
        }
        async close() {
          if (this.__fd !== null) {
            nodeFs().closeSync(this.__fd);
            this.__fd = null;
          }
          this.__closed = true;
        }
        // Internal: write at explicit offset (used by seek emulation without reopen)
        async __writeAt(buf, position) {
          nodeFs().writeSync(this.__open(), buf, 0, buf.length, position);
        }
      }
      function toBuffer(data) {
        if (data === void 0 || data === null) return Buffer.alloc(0);
        if (Buffer.isBuffer(data)) return data;
        if (typeof data === "string") return Buffer.from(data, "utf8");
        if (data instanceof ArrayBuffer) return Buffer.from(data);
        if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
        if (data && data._body !== void 0) return toBuffer(data._body);
        return Buffer.from(String(data), "utf8");
      }
      class VirtualFileSystemFileHandle {
        constructor(api, absPath) {
          this.__api = api;
          this.__path = absPath;
          this.kind = "file";
          this.name = absPath.split(/[\\/]/).pop();
        }
        async getFile() {
          return new VirtualFile(this.__path, this.name);
        }
        async createWritable(options = {}) {
          return new VirtualFileSystemWritable(this.__path, !!options.keepExistingData);
        }
        async isSameEntry(other) {
          return other && other.__path === this.__path;
        }
      }
      class VirtualFileSystemDirectoryHandle {
        constructor(api, absPath) {
          this.__api = api;
          this.__path = absPath;
          this.kind = "directory";
          this.name = absPath.split(/[\\/]/).pop() || "root";
        }
        __child(name) {
          const p = nodePath();
          const abs = p.resolve(this.__path, String(name));
          return this.__api.__sandbox(abs);
        }
        async getFileHandle(name, options = {}) {
          const fs = nodeFs();
          const abs = this.__child(name);
          try {
            const st = fs.statSync(abs);
            if (!st.isFile()) throw new Error("Not a file: " + name);
          } catch (e) {
            if (options.create) {
              fs.writeFileSync(abs, "");
            } else throw new Error("NotFoundError: " + name);
          }
          return new VirtualFileSystemFileHandle(this.__api, abs);
        }
        async getDirectoryHandle(name, options = {}) {
          const fs = nodeFs();
          const abs = this.__child(name);
          try {
            const st = fs.statSync(abs);
            if (!st.isDirectory()) throw new Error("Not a directory: " + name);
          } catch (e) {
            if (options.create) {
              fs.mkdirSync(abs, { recursive: true });
            } else throw new Error("NotFoundError: " + name);
          }
          return new VirtualFileSystemDirectoryHandle(this.__api, abs);
        }
        async removeEntry(name, options = {}) {
          const abs = this.__child(name);
          nodeFs().rmSync(abs, { recursive: !!options.recursive, force: false });
        }
        async resolve(possibleDescendant) {
          const p = nodePath();
          if (!possibleDescendant || !possibleDescendant.__path) return null;
          const rel = p.relative(this.__path, possibleDescendant.__path);
          if (rel.startsWith("..") || p.isAbsolute(rel)) return null;
          return rel.split(p.sep);
        }
        async *keys() {
          for (const name of nodeFs().readdirSync(this.__path)) yield name;
        }
        async *values() {
          const fs = nodeFs();
          for (const name of fs.readdirSync(this.__path)) {
            const abs = nodePath().resolve(this.__path, name);
            const st = fs.statSync(abs);
            yield st.isDirectory() ? new VirtualFileSystemDirectoryHandle(this.__api, abs) : new VirtualFileSystemFileHandle(this.__api, abs);
          }
        }
        async *entries() {
          for await (const h of this.values()) yield [h.name, h];
        }
        [Symbol.asyncIterator]() {
          return this.values();
        }
      }
      class VirtualFileSystemApi {
        constructor(options = {}) {
          const os = nodeOs(), p = nodePath(), fs = nodeFs();
          this.root = p.resolve(options.fsRoot || (os ? nodePath().join(os.tmpdir(), "merkava-fs") : "/tmp/merkava-fs"));
          if (fs) fs.mkdirSync(this.root, { recursive: true });
          this.options = options;
        }
        __sandbox(abs) {
          const p = nodePath();
          const resolved = p.resolve(abs);
          if (resolved !== this.root && !resolved.startsWith(this.root + p.sep)) {
            throw new Error("SecurityError: path escapes file-system sandbox");
          }
          return resolved;
        }
        __testPick(kind) {
          const picks = this.options._pickPaths;
          if (Array.isArray(picks) && picks.length) {
            return picks.map((rel) => {
              const abs = this.__sandbox(nodePath().resolve(this.root, rel));
              return kind === "directory" ? new VirtualFileSystemDirectoryHandle(this, abs) : new VirtualFileSystemFileHandle(this, abs);
            });
          }
          return null;
        }
        async showOpenFilePicker(options = {}) {
          const test = this.__testPick("file");
          if (test) return options.multiple === false ? [test[0]] : test;
          const fs = nodeFs();
          const out = [];
          for (const name of fs.readdirSync(this.root)) {
            const abs = nodePath().resolve(this.root, name);
            if (fs.statSync(abs).isFile()) out.push(new VirtualFileSystemFileHandle(this, abs));
            if (options.multiple === false && out.length) break;
          }
          return out;
        }
        async showSaveFilePicker(options = {}) {
          const test = this.__testPick("file");
          if (test) return test[0];
          const name = String(options.suggestedName || "untitled.bin");
          const abs = this.__sandbox(nodePath().resolve(this.root, name));
          nodeFs().writeFileSync(abs, "");
          return new VirtualFileSystemFileHandle(this, abs);
        }
        async showDirectoryPicker(options = {}) {
          const test = this.__testPick("directory");
          if (test) return test[0];
          return new VirtualFileSystemDirectoryHandle(this, this.root);
        }
      }
      function idbKeyType(v) {
        if (typeof v === "number") return 0;
        if (v instanceof Date) return 1;
        if (typeof v === "string") return 2;
        if (v instanceof ArrayBuffer || ArrayBuffer.isView(v)) return 3;
        if (Array.isArray(v)) return 4;
        return -1;
      }
      function isValidKey(v) {
        if (v === null || v === void 0) return false;
        const t = idbKeyType(v);
        if (t === -1) return false;
        if (t === 0 && Number.isNaN(v)) return false;
        if (t === 4) {
          for (const e of v) if (!isValidKey(e)) return false;
        }
        return true;
      }
      function compareKeys(a, b) {
        const ta = idbKeyType(a), tb = idbKeyType(b);
        if (ta !== tb) return ta - tb;
        switch (ta) {
          case 0:
            return a < b ? -1 : a > b ? 1 : 0;
          case 1: {
            const d = a.getTime() - b.getTime();
            return d < 0 ? -1 : d > 0 ? 1 : 0;
          }
          case 2:
            return a < b ? -1 : a > b ? 1 : 0;
          case 3: {
            const x = new Uint8Array(a instanceof ArrayBuffer ? a : a.buffer, a instanceof ArrayBuffer ? 0 : a.byteOffset, a instanceof ArrayBuffer ? a.byteLength : a.byteLength);
            const y = new Uint8Array(b instanceof ArrayBuffer ? b : b.buffer, b instanceof ArrayBuffer ? 0 : b.byteOffset, b instanceof ArrayBuffer ? b.byteLength : b.byteLength);
            const n2 = Math.min(x.length, y.length);
            for (let i = 0; i < n2; i++) if (x[i] !== y[i]) return x[i] - y[i];
            return x.length - y.length;
          }
          case 4: {
            const n2 = Math.min(a.length, b.length);
            for (let i = 0; i < n2; i++) {
              const c = compareKeys(a[i], b[i]);
              if (c) return c;
            }
            return a.length - b.length;
          }
        }
        return 0;
      }
      function extractKeyPath(value, keyPath) {
        if (keyPath === null || keyPath === void 0) return void 0;
        if (Array.isArray(keyPath)) {
          const out = [];
          for (const kp of keyPath) {
            const v = extractKeyPath(value, kp);
            if (v === void 0) return void 0;
            out.push(v);
          }
          return out;
        }
        let cur = value;
        for (const part of String(keyPath).split(".")) {
          if (cur === null || cur === void 0 || typeof cur !== "object") return void 0;
          cur = cur[part];
        }
        return cur;
      }
      function injectKeyPath(value, keyPath, key) {
        if (!keyPath || Array.isArray(keyPath)) return;
        const parts = String(keyPath).split(".");
        let cur = value;
        for (let i = 0; i < parts.length - 1; i++) {
          if (cur[parts[i]] === null || typeof cur[parts[i]] !== "object") cur[parts[i]] = {};
          cur = cur[parts[i]];
        }
        cur[parts[parts.length - 1]] = key;
      }
      function idbClone(v) {
        if (typeof structuredClone === "function") {
          try {
            return structuredClone(v);
          } catch (e) {
          }
        }
        return JSON.parse(JSON.stringify(v));
      }
      class VirtualIDBKeyRange {
        constructor(lower, upper, lowerOpen, upperOpen) {
          this.lower = lower;
          this.upper = upper;
          this.lowerOpen = !!lowerOpen;
          this.upperOpen = !!upperOpen;
        }
        static only(v) {
          if (!isValidKey(v)) throw new Error("DataError");
          return new VirtualIDBKeyRange(v, v, false, false);
        }
        static lowerBound(v, open = false) {
          if (!isValidKey(v)) throw new Error("DataError");
          return new VirtualIDBKeyRange(v, void 0, open, true);
        }
        static upperBound(v, open = false) {
          if (!isValidKey(v)) throw new Error("DataError");
          return new VirtualIDBKeyRange(void 0, v, true, open);
        }
        static bound(l, u, lOpen = false, uOpen = false) {
          if (!isValidKey(l) || !isValidKey(u)) throw new Error("DataError");
          return new VirtualIDBKeyRange(l, u, lOpen, uOpen);
        }
        includes(key) {
          if (this.lower !== void 0) {
            const c = compareKeys(key, this.lower);
            if (c < 0 || c === 0 && this.lowerOpen) return false;
          }
          if (this.upper !== void 0) {
            const c = compareKeys(key, this.upper);
            if (c > 0 || c === 0 && this.upperOpen) return false;
          }
          return true;
        }
      }
      class VirtualIDBRequest {
        constructor() {
          this.readyState = "pending";
          this.result = void 0;
          this.error = null;
          this.onsuccess = null;
          this.onerror = null;
          this.onupgradeneeded = null;
          this.__listeners = {};
        }
        addEventListener(type, fn) {
          (this.__listeners[type] = this.__listeners[type] || []).push(fn);
        }
        __fire(type, event) {
          const e = event || { target: this, type };
          const handler = this["on" + type];
          if (typeof handler === "function") {
            try {
              handler.call(this, e);
            } catch (err) {
            }
          }
          for (const fn of this.__listeners[type] || []) {
            try {
              fn.call(this, e);
            } catch (err) {
            }
          }
        }
        __succeed(result) {
          this.readyState = "done";
          this.result = result;
          queueMicrotask(() => this.__fire("success"));
        }
        __fail(err) {
          this.readyState = "done";
          this.error = err;
          queueMicrotask(() => this.__fire("error", { target: this, type: "error" }));
        }
        __upgrade(db, oldVersion) {
          this.result = db;
          queueMicrotask(() => this.__fire("upgradeneeded", { target: this, type: "upgradeneeded", oldVersion, newVersion: db.version }));
        }
        then(resolve, reject) {
          return new Promise((res, rej) => {
            this.addEventListener("success", () => {
              try {
                resolve && resolve(this.result);
              } catch (e) {
              }
              res(this.result);
            });
            this.addEventListener("error", () => {
              try {
                reject && reject(this.error);
              } catch (e) {
              }
              rej(this.error);
            });
          });
        }
      }
      class VirtualIDBCursor {
        constructor(source, range, direction, keyGetter, valueGetter) {
          this.source = source;
          this.range = range || null;
          this.direction = direction || "next";
          this.__keyGetter = keyGetter;
          this.__valueGetter = valueGetter;
          this.__keys = source.__sortedKeysInRange(range, direction);
          this.__pos = 0;
          this.__updateCurrent();
        }
        __updateCurrent() {
          if (this.__pos >= this.__keys.length) {
            this.key = void 0;
            this.value = void 0;
            this.primaryKey = void 0;
            return;
          }
          const k = this.__keys[this.__pos];
          this.key = idbClone(k.indexKey !== void 0 ? k.indexKey : k.key);
          this.primaryKey = idbClone(k.key);
          this.value = this.__valueGetter ? idbClone(this.__valueGetter(k.key)) : void 0;
        }
        continue(nextKey) {
          const req = new VirtualIDBRequest();
          if (nextKey !== void 0) {
            while (this.__pos < this.__keys.length && compareKeys(this.__keys[this.__pos].cmp, nextKey) < 0) this.__pos++;
          } else {
            this.__pos++;
          }
          this.__updateCurrent();
          const cursor = this.key === void 0 ? null : this;
          req.__succeed(cursor);
          return req;
        }
        advance(count) {
          const req = new VirtualIDBRequest();
          this.__pos += Math.max(0, Number(count) || 0);
          this.__updateCurrent();
          req.__succeed(this.key === void 0 ? null : this);
          return req;
        }
        update(value) {
          const req = new VirtualIDBRequest();
          if (this.key === void 0) {
            req.__fail(new Error("InvalidStateError"));
            return req;
          }
          this.source.__putRecord(idbClone(value), this.primaryKey, true);
          req.__succeed(this.primaryKey);
          return req;
        }
        delete() {
          const req = new VirtualIDBRequest();
          if (this.key === void 0) {
            req.__fail(new Error("InvalidStateError"));
            return req;
          }
          this.source.__deleteRecord(this.primaryKey);
          req.__succeed(void 0);
          this.__pos++;
          this.__updateCurrent();
          return req;
        }
      }
      class VirtualIDBIndex {
        constructor(store, name, keyPath, options = {}) {
          this.__store = store;
          this.name = name;
          this.keyPath = keyPath;
          this.unique = !!options.unique;
          this.multiEntry = !!options.multiEntry;
          this.__map = /* @__PURE__ */ new Map();
        }
        __indexKeyOf(value) {
          const raw = extractKeyPath(value, this.keyPath);
          if (raw === void 0) return void 0;
          if (this.multiEntry && Array.isArray(raw)) return raw.filter(isValidKey);
          return isValidKey(raw) ? [raw] : void 0;
        }
        static __flat(v) {
          return JSON.stringify(v, (k, x) => x instanceof Date ? { $date: x.getTime() } : x instanceof Uint8Array ? { $u8: Array.from(x) } : x);
        }
        __addRecord(value, pk) {
          const keys = this.__indexKeyOf(value);
          if (!keys) return;
          for (const k of keys) {
            const f = VirtualIDBIndex.__flat(k);
            let set = this.__map.get(f);
            if (!set) {
              set = /* @__PURE__ */ new Set();
              this.__map.set(f, set);
            }
            if (this.unique && set.size > 0 && ![...set].every((x) => compareKeys(x, pk) === 0)) {
              throw new Error("ConstraintError: unique index violation on " + this.name);
            }
            set.add(pk);
          }
        }
        __removeRecord(value, pk) {
          const keys = this.__indexKeyOf(value);
          if (!keys) return;
          for (const k of keys) {
            const f = VirtualIDBIndex.__flat(k);
            const set = this.__map.get(f);
            if (set) {
              set.delete(pk);
              if (set.size === 0) this.__map.delete(f);
            }
          }
        }
        __sortedKeysInRange(range, direction) {
          const out = [];
          for (const [f, set] of this.__map) {
            for (const pk of set) {
              const ik = JSON.parse(f, (k, x) => x && x.$date !== void 0 ? new Date(x.$date) : x && x.$u8 ? Uint8Array.from(x.$u8) : x);
              out.push({ cmp: ik, key: pk, indexKey: ik });
            }
          }
          out.sort((a, b) => compareKeys(a.cmp, b.cmp) || compareKeys(a.key, b.key));
          const filtered = range ? out.filter((e) => range.includes(e.cmp)) : out;
          return direction === "prev" || direction === "prevunique" ? filtered.reverse() : filtered;
        }
        __request(fn) {
          const r = new VirtualIDBRequest();
          try {
            r.__succeed(fn());
          } catch (e) {
            r.__fail(e);
          }
          return r;
        }
        get(key) {
          return this.__request(() => {
            const f = VirtualIDBIndex.__flat(key);
            const set = this.__map.get(f);
            if (!set || set.size === 0) return void 0;
            const pk = [...set][0];
            return idbClone(this.__store.__records.get(pk));
          });
        }
        getKey(key) {
          return this.__request(() => {
            const f = VirtualIDBIndex.__flat(key);
            const set = this.__map.get(f);
            if (!set || set.size === 0) return void 0;
            return idbClone([...set][0]);
          });
        }
        getAll(key, count) {
          return this.__request(() => {
            const out = [];
            for (const e of this.__sortedKeysInRange(key instanceof VirtualIDBKeyRange ? key : key !== void 0 ? VirtualIDBKeyRange.only(key) : null, "next")) {
              out.push(idbClone(this.__store.__records.get(e.key)));
              if (count !== void 0 && out.length >= count) break;
            }
            return out;
          });
        }
        getAllKeys(key, count) {
          return this.__request(() => {
            const out = [];
            for (const e of this.__sortedKeysInRange(key instanceof VirtualIDBKeyRange ? key : key !== void 0 ? VirtualIDBKeyRange.only(key) : null, "next")) {
              out.push(idbClone(e.key));
              if (count !== void 0 && out.length >= count) break;
            }
            return out;
          });
        }
        count(key) {
          return this.__request(() => this.__sortedKeysInRange(key instanceof VirtualIDBKeyRange ? key : key !== void 0 ? VirtualIDBKeyRange.only(key) : null, "next").length);
        }
        openCursor(range, direction = "next") {
          return this.__request(() => {
            const r = range instanceof VirtualIDBKeyRange ? range : range !== void 0 ? VirtualIDBKeyRange.only(range) : null;
            const c = new VirtualIDBCursor(
              this,
              r,
              direction,
              null,
              (pk) => this.__store.__records.get(pk)
            );
            return c.key === void 0 ? null : c;
          });
        }
        openKeyCursor(range, direction = "next") {
          return this.__request(() => {
            const r = range instanceof VirtualIDBKeyRange ? range : range !== void 0 ? VirtualIDBKeyRange.only(range) : null;
            const c = new VirtualIDBCursor(this, r, direction, null, null);
            return c.key === void 0 ? null : c;
          });
        }
      }
      class VirtualIDBObjectStore {
        constructor(db, name, options = {}) {
          this.__db = db;
          this.name = name;
          this.keyPath = options.keyPath !== void 0 ? options.keyPath : null;
          this.autoIncrement = !!options.autoIncrement;
          this.__records = /* @__PURE__ */ new Map();
          this.__sorted = [];
          this.__indexes = /* @__PURE__ */ new Map();
          this.__nextAuto = 1;
        }
        __insertSorted(pk) {
          let lo = 0, hi = this.__sorted.length;
          while (lo < hi) {
            const mid = lo + hi >> 1;
            if (compareKeys(this.__sorted[mid], pk) < 0) lo = mid + 1;
            else hi = mid;
          }
          this.__sorted.splice(lo, 0, pk);
        }
        __removeSorted(pk) {
          let lo = 0, hi = this.__sorted.length - 1;
          while (lo <= hi) {
            const mid = lo + hi >> 1;
            const c = compareKeys(this.__sorted[mid], pk);
            if (c === 0) {
              this.__sorted.splice(mid, 1);
              return;
            }
            if (c < 0) lo = mid + 1;
            else hi = mid - 1;
          }
        }
        __resolveKey(value, key, allowOverwrite) {
          let pk = key;
          if (pk === void 0) {
            if (this.keyPath !== null) pk = extractKeyPath(value, this.keyPath);
            if (pk === void 0 && this.autoIncrement) {
              pk = this.__nextAuto++;
              if (this.keyPath) injectKeyPath(value, this.keyPath, pk);
            }
          } else if (this.keyPath !== null && this.autoIncrement) {
            injectKeyPath(value, this.keyPath, pk);
          }
          if (!isValidKey(pk)) throw new Error("DataError: invalid key");
          if (!allowOverwrite && this.__records.has(pk)) throw new Error("ConstraintError: key exists");
          return pk;
        }
        __putRecord(value, pk, overwrite) {
          const old = this.__records.get(pk);
          if (old !== void 0) for (const idx of this.__indexes.values()) idx.__removeRecord(old, pk);
          if (!this.__records.has(pk)) this.__insertSorted(pk);
          this.__records.set(pk, value);
          for (const idx of this.__indexes.values()) idx.__addRecord(value, pk);
          if (typeof pk === "number" && pk >= this.__nextAuto) this.__nextAuto = Math.floor(pk) + 1;
          return pk;
        }
        __deleteRecord(pk) {
          const old = this.__records.get(pk);
          if (old === void 0) return false;
          for (const idx of this.__indexes.values()) idx.__removeRecord(old, pk);
          this.__records.delete(pk);
          this.__removeSorted(pk);
          return true;
        }
        __sortedKeysInRange(range, direction) {
          let keys = this.__sorted;
          if (range) keys = keys.filter((k) => range.includes(k));
          const out = keys.map((k) => ({ cmp: k, key: k }));
          return direction === "prev" || direction === "prevunique" ? out.reverse() : out;
        }
        __request(fn) {
          const r = new VirtualIDBRequest();
          try {
            r.__succeed(fn());
          } catch (e) {
            r.__fail(e);
          }
          return r;
        }
        add(value, key) {
          return this.__request(() => this.__putRecord(idbClone(value), this.__resolveKey(idbClone(value), key, false), false));
        }
        put(value, key) {
          return this.__request(() => {
            const v = idbClone(value);
            return this.__putRecord(v, this.__resolveKey(v, key, true), true);
          });
        }
        get(key) {
          return this.__request(() => {
            if (!isValidKey(key)) throw new Error("DataError");
            const v = this.__records.get(key);
            return v === void 0 ? void 0 : idbClone(v);
          });
        }
        getKey(key) {
          return this.__request(() => {
            if (!isValidKey(key)) throw new Error("DataError");
            return this.__records.has(key) ? idbClone(key) : void 0;
          });
        }
        getAll(key, count) {
          return this.__request(() => {
            const r = key instanceof VirtualIDBKeyRange ? key : key !== void 0 ? VirtualIDBKeyRange.only(key) : null;
            const out = [];
            for (const k of this.__sortedKeysInRange(r, "next")) {
              out.push(idbClone(this.__records.get(k.key)));
              if (count !== void 0 && out.length >= count) break;
            }
            return out;
          });
        }
        getAllKeys(key, count) {
          return this.__request(() => {
            const r = key instanceof VirtualIDBKeyRange ? key : key !== void 0 ? VirtualIDBKeyRange.only(key) : null;
            const out = [];
            for (const k of this.__sortedKeysInRange(r, "next")) {
              out.push(idbClone(k.key));
              if (count !== void 0 && out.length >= count) break;
            }
            return out;
          });
        }
        delete(key) {
          return this.__request(() => {
            const r = key instanceof VirtualIDBKeyRange ? key : VirtualIDBKeyRange.only(key);
            let n2 = 0;
            for (const k of this.__sortedKeysInRange(r, "next").map((e) => e.key)) {
              if (this.__deleteRecord(k)) n2++;
            }
            return void 0;
          });
        }
        clear() {
          return this.__request(() => {
            this.__records.clear();
            this.__sorted.length = 0;
            for (const idx of this.__indexes.values()) idx.__map.clear();
            return void 0;
          });
        }
        count(key) {
          return this.__request(() => {
            const r = key instanceof VirtualIDBKeyRange ? key : key !== void 0 ? VirtualIDBKeyRange.only(key) : null;
            return this.__sortedKeysInRange(r, "next").length;
          });
        }
        createIndex(name, keyPath, options = {}) {
          if (this.__indexes.has(name)) throw new Error("ConstraintError: index exists");
          const idx = new VirtualIDBIndex(this, name, keyPath, options);
          for (const [pk, v] of this.__records) idx.__addRecord(v, pk);
          this.__indexes.set(name, idx);
          return idx;
        }
        index(name) {
          const idx = this.__indexes.get(name);
          if (!idx) throw new Error("NotFoundError: index " + name);
          return idx;
        }
        deleteIndex(name) {
          if (!this.__indexes.has(name)) throw new Error("NotFoundError");
          this.__indexes.delete(name);
        }
        get indexNames() {
          return [...this.__indexes.keys()];
        }
        openCursor(range, direction = "next") {
          return this.__request(() => {
            const r = range instanceof VirtualIDBKeyRange ? range : range !== void 0 ? VirtualIDBKeyRange.only(range) : null;
            const c = new VirtualIDBCursor(this, r, direction, null, (pk) => this.__records.get(pk));
            return c.key === void 0 ? null : c;
          });
        }
        openKeyCursor(range, direction = "next") {
          return this.__request(() => {
            const r = range instanceof VirtualIDBKeyRange ? range : range !== void 0 ? VirtualIDBKeyRange.only(range) : null;
            const c = new VirtualIDBCursor(this, r, direction, null, null);
            return c.key === void 0 ? null : c;
          });
        }
      }
      class VirtualIDBTransaction {
        constructor(db, storeNames, mode) {
          this.db = db;
          this.mode = mode || "readonly";
          this.__storeNames = Array.isArray(storeNames) ? storeNames : [storeNames];
          this.oncomplete = null;
          this.onerror = null;
          this.onabort = null;
          this.__listeners = {};
          this.error = null;
          queueMicrotask(() => this.__fire("complete"));
        }
        addEventListener(type, fn) {
          (this.__listeners[type] = this.__listeners[type] || []).push(fn);
        }
        __fire(type) {
          const h = this["on" + type];
          if (typeof h === "function") {
            try {
              h({ target: this, type });
            } catch (e) {
            }
          }
          for (const fn of this.__listeners[type] || []) {
            try {
              fn({ target: this, type });
            } catch (e) {
            }
          }
        }
        objectStore(name) {
          if (!this.__storeNames.includes(name)) throw new Error("NotFoundError: store not in transaction");
          return this.db.__stores.get(name) || (() => {
            throw new Error("NotFoundError: " + name);
          })();
        }
        abort() {
          this.__fire("abort");
        }
        get objectStoreNames() {
          return this.__storeNames.slice();
        }
      }
      class VirtualIDBDatabase {
        constructor(factory, name, version, stores) {
          this.__factory = factory;
          this.name = name;
          this.version = version;
          this.__stores = stores;
          this.onclose = null;
          this.onversionchange = null;
        }
        createObjectStore(name, options = {}) {
          if (this.__stores.has(name)) throw new Error("ConstraintError: store exists");
          const s = new VirtualIDBObjectStore(this, name, options);
          this.__stores.set(name, s);
          return s;
        }
        deleteObjectStore(name) {
          if (!this.__stores.has(name)) throw new Error("NotFoundError");
          this.__stores.delete(name);
        }
        transaction(storeNames, mode = "readonly") {
          const names = Array.isArray(storeNames) ? storeNames : [storeNames];
          for (const n2 of names) if (!this.__stores.has(n2)) throw new Error("NotFoundError: " + n2);
          return new VirtualIDBTransaction(this, names, mode);
        }
        get objectStoreNames() {
          return [...this.__stores.keys()];
        }
        close() {
        }
      }
      class VirtualIndexedDBFactory {
        constructor(options = {}) {
          this.__dbs = /* @__PURE__ */ new Map();
          this.options = options;
        }
        open(name, version) {
          name = String(name);
          const req = new VirtualIDBRequest();
          let entry = this.__dbs.get(name);
          const newVersion = version === void 0 ? entry ? entry.version : 1 : Number(version);
          if (!Number.isInteger(newVersion) || newVersion < 1) {
            queueMicrotask(() => req.__fail(new Error("TypeError: invalid version")));
            return req;
          }
          if (!entry) {
            entry = { version: 0, stores: /* @__PURE__ */ new Map() };
            this.__dbs.set(name, entry);
          }
          const oldVersion = entry.version;
          if (newVersion < oldVersion) {
            queueMicrotask(() => req.__fail(new Error("VersionError")));
            return req;
          }
          const db = new VirtualIDBDatabase(this, name, newVersion, entry.stores);
          if (newVersion > oldVersion) {
            entry.version = newVersion;
            req.__upgrade(db, oldVersion);
          }
          queueMicrotask(() => req.__succeed(db));
          return req;
        }
        deleteDatabase(name) {
          name = String(name);
          const req = new VirtualIDBRequest();
          this.__dbs.delete(name);
          queueMicrotask(() => req.__succeed(void 0));
          return req;
        }
        databases() {
          return Promise.resolve([...this.__dbs.entries()].map(([name, e]) => ({ name, version: e.version })));
        }
      }
      class VirtualResponse {
        constructor(body, init = {}) {
          this._body = body === void 0 ? "" : body;
          this.status = init.status !== void 0 ? init.status : 200;
          this.statusText = init.statusText || "";
          this.ok = this.status >= 200 && this.status < 300;
          this.url = init.url || "";
          this.headers = new Map(Object.entries(init.headers || {}));
          this.redirected = false;
          this.type = "basic";
        }
        async text() {
          if (typeof this._body === "string") return this._body;
          return Buffer.from(this._body).toString("utf8");
        }
        async json() {
          return JSON.parse(await this.text());
        }
        async arrayBuffer() {
          if (typeof this._body === "string") {
            const b2 = Buffer.from(this._body, "utf8");
            return b2.buffer.slice(b2.byteOffset, b2.byteOffset + b2.byteLength);
          }
          const b = Buffer.from(this._body);
          return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
        }
        clone() {
          return new VirtualResponse(this._body, { status: this.status, statusText: this.statusText, url: this.url, headers: Object.fromEntries(this.headers) });
        }
      }
      class VirtualRequest {
        constructor(input, init = {}) {
          if (input instanceof VirtualRequest) {
            this.url = input.url;
            this.method = init.method || input.method;
            this.headers = new Map(init.headers ? Object.entries(init.headers) : input.headers);
            this._body = init.body !== void 0 ? init.body : input._body;
          } else {
            this.url = String(input);
            this.method = (init.method || "GET").toUpperCase();
            this.headers = new Map(Object.entries(init.headers || {}));
            this._body = init.body;
          }
          this.mode = init.mode || "cors";
          this.credentials = init.credentials || "same-origin";
        }
        clone() {
          return new VirtualRequest(this);
        }
      }
      class VirtualCache {
        constructor(name) {
          this.__name = name;
          this.__entries = /* @__PURE__ */ new Map();
        }
        __key(request) {
          const url = request instanceof VirtualRequest ? request.url : String(request);
          return url;
        }
        async put(request, response) {
          const req = request instanceof VirtualRequest ? request : new VirtualRequest(request);
          const res = response instanceof VirtualResponse ? response : new VirtualResponse(response);
          if (req.method !== "GET") throw new Error("TypeError: only GET cacheable");
          this.__entries.set(this.__key(req), { request: req.clone(), response: res.clone() });
        }
        async add(url) {
          const res = await globalThis.fetch(String(url));
          const body = await res.arrayBuffer();
          await this.put(url, new VirtualResponse(Buffer.from(body), { status: res.status, url: String(url), headers: {} }));
        }
        async addAll(urls) {
          for (const u of urls) await this.add(u);
        }
        async match(request, options = {}) {
          const key = this.__key(request);
          const hit = this.__entries.get(key);
          if (!hit) return void 0;
          if (options.ignoreMethod !== true && hit.request.method !== "GET") return void 0;
          return hit.response.clone();
        }
        async matchAll(request, options = {}) {
          const m = await this.match(request, options);
          return m ? [m] : [];
        }
        async delete(request, options = {}) {
          const key = this.__key(request);
          return this.__entries.delete(key);
        }
        async keys(request, options = {}) {
          const out = [];
          for (const { request: r } of this.__entries.values()) {
            if (!request || this.__key(request) === this.__key(r)) out.push(r.clone());
          }
          return out;
        }
      }
      class VirtualCacheStorage {
        constructor(options = {}) {
          this.__caches = /* @__PURE__ */ new Map();
          this.options = options;
        }
        async open(name) {
          name = String(name);
          let c = this.__caches.get(name);
          if (!c) {
            c = new VirtualCache(name);
            this.__caches.set(name, c);
          }
          return c;
        }
        async has(name) {
          return this.__caches.has(String(name));
        }
        async delete(name) {
          return this.__caches.delete(String(name));
        }
        async keys() {
          return [...this.__caches.keys()];
        }
        async match(request, options = {}) {
          for (const c of this.__caches.values()) {
            const m = await c.match(request, options);
            if (m) return m;
          }
          return void 0;
        }
      }
      class VirtualNotification {
        constructor(title, options = {}) {
          this.title = String(title);
          this.body = options.body || "";
          this.icon = options.icon || "";
          this.tag = options.tag || "";
          this.data = options.data;
          this.timestamp = Date.now();
          this.onclick = null;
          this.onclose = null;
          this.onerror = null;
          this.onshow = null;
          VirtualNotification.__delivered.push(this);
          const host = VirtualNotification.__host;
          if (host && typeof host.onNotification === "function") {
            try {
              host.onNotification(this);
            } catch (e) {
            }
          }
          queueMicrotask(() => {
            try {
              this.onshow && this.onshow({ target: this });
            } catch (e) {
            }
          });
        }
        close() {
          const i = VirtualNotification.__delivered.indexOf(this);
          if (i >= 0) VirtualNotification.__delivered.splice(i, 1);
          try {
            this.onclose && this.onclose({ target: this });
          } catch (e) {
          }
        }
        static async requestPermission() {
          VirtualNotification.permission = "granted";
          return "granted";
        }
        static __reset() {
          VirtualNotification.__delivered.length = 0;
          VirtualNotification.permission = "default";
        }
      }
      VirtualNotification.permission = "default";
      VirtualNotification.__delivered = [];
      VirtualNotification.__host = null;
      class VirtualClipboard {
        constructor() {
          this.__text = "";
          this.__items = [];
        }
        async writeText(text) {
          this.__text = String(text);
        }
        async readText() {
          return this.__text;
        }
        async write(items) {
          this.__items = items;
        }
        async read() {
          return this.__items.slice();
        }
      }
      class VirtualGeolocation {
        constructor(options = {}) {
          const p = options.geoPosition || {};
          const c = p.coords || {};
          this.__position = {
            coords: {
              latitude: c.latitude !== void 0 ? c.latitude : 31.7683,
              longitude: c.longitude !== void 0 ? c.longitude : 35.2137,
              altitude: c.altitude !== void 0 ? c.altitude : null,
              accuracy: c.accuracy !== void 0 ? c.accuracy : 10,
              altitudeAccuracy: null,
              heading: null,
              speed: null
            },
            timestamp: Date.now()
          };
          this.__watches = /* @__PURE__ */ new Map();
          this.__nextWatch = 1;
        }
        getCurrentPosition(success, error, options = {}) {
          const timeout = options.timeout !== void 0 ? options.timeout : 1e4;
          const timer = setTimeout(() => {
            try {
              error && error({ code: 3, TIMEOUT: 3, message: "Timeout expired" });
            } catch (e) {
            }
          }, timeout);
          queueMicrotask(() => {
            clearTimeout(timer);
            try {
              success && success(JSON.parse(JSON.stringify(this.__position)));
            } catch (e) {
            }
          });
        }
        watchPosition(success, error, options = {}) {
          const id = this.__nextWatch++;
          this.getCurrentPosition(success, error, options);
          this.__watches.set(id, { success, error, options });
          return id;
        }
        clearWatch(id) {
          this.__watches.delete(id);
        }
      }
      function attachStoragePersistence(windowObject, options = {}) {
        const file = options.storagePersistPath;
        if (!file) return { flush() {
        } };
        const fs = nodeFs();
        if (!fs) return { flush() {
        } };
        let timer = null;
        let dirty = false;
        function schedule() {
          dirty = true;
          if (timer) return;
          timer = setTimeout(() => {
            timer = null;
            flush();
          }, options.storagePersistMs || 500);
          if (timer.unref) timer.unref();
        }
        function flush() {
          if (!dirty) return;
          dirty = false;
          try {
            const data = {
              local: windowObject.localStorage ? Object.fromEntries(windowObject.localStorage.map) : {},
              session: windowObject.sessionStorage ? Object.fromEntries(windowObject.sessionStorage.map) : {}
            };
            fs.writeFileSync(file, JSON.stringify(data));
          } catch (e) {
          }
        }
        function load() {
          try {
            const raw = fs.readFileSync(file, "utf8");
            const data = JSON.parse(raw);
            for (const [k, v] of Object.entries(data.local || {})) windowObject.localStorage.map.set(k, v);
            for (const [k, v] of Object.entries(data.session || {})) windowObject.sessionStorage.map.set(k, v);
          } catch (e) {
          }
        }
        for (const store of [windowObject.localStorage, windowObject.sessionStorage]) {
          if (!store) continue;
          for (const m of ["setItem", "removeItem", "clear"]) {
            const orig = store[m].bind(store);
            store[m] = (...a) => {
              const r = orig(...a);
              schedule();
              return r;
            };
          }
        }
        load();
        windowObject.__flushStorage = flush;
        return { flush };
      }
      function installVirtualBrowserApis(windowObject, options = {}) {
        const fsApi = new VirtualFileSystemApi(options);
        windowObject.showOpenFilePicker = (o) => fsApi.showOpenFilePicker(o);
        windowObject.showSaveFilePicker = (o) => fsApi.showSaveFilePicker(o);
        windowObject.showDirectoryPicker = (o) => fsApi.showDirectoryPicker(o);
        windowObject.indexedDB = new VirtualIndexedDBFactory(options);
        windowObject.IDBKeyRange = VirtualIDBKeyRange;
        windowObject.caches = new VirtualCacheStorage(options);
        windowObject.Cache = VirtualCache;
        windowObject.Request = VirtualRequest;
        windowObject.Response = VirtualResponse;
        VirtualNotification.__host = options.notificationHost || null;
        windowObject.Notification = VirtualNotification;
        const nav = windowObject.navigator || {};
        windowObject.navigator = Object.freeze(Object.assign({}, nav, {
          clipboard: new VirtualClipboard(),
          geolocation: new VirtualGeolocation(options)
        }));
        const persistence = attachStoragePersistence(windowObject, options);
        return {
          fsApi,
          indexedDB: windowObject.indexedDB,
          caches: windowObject.caches,
          persistence,
          VirtualNotification,
          VirtualClipboard,
          VirtualGeolocation,
          VirtualCache,
          VirtualRequest,
          VirtualResponse,
          VirtualFileSystemApi,
          VirtualIndexedDBFactory,
          VirtualIDBKeyRange,
          VirtualFileSystemFileHandle,
          VirtualFileSystemDirectoryHandle
        };
      }
      return {
        VirtualBrowserApis: {
          installVirtualBrowserApis,
          VirtualFileSystemApi,
          VirtualFileSystemFileHandle,
          VirtualFileSystemDirectoryHandle,
          VirtualIndexedDBFactory,
          VirtualIDBKeyRange,
          VirtualCacheStorage,
          VirtualCache,
          VirtualRequest,
          VirtualResponse,
          VirtualNotification,
          VirtualClipboard,
          VirtualGeolocation,
          attachStoragePersistence
        },
        installVirtualBrowserApis
      };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualBrowserNet.js
var require_VirtualBrowserNet = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualBrowserNet.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualBrowserNet = factory().VirtualBrowserNet;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      function nodeRequire(name) {
        try {
          if (typeof __require === "function") return __require(name);
        } catch (e) {
        }
        return null;
      }
      class VirtualFastFetch {
        constructor(options = {}) {
          this.options = options;
          this.__inflight = /* @__PURE__ */ new Map();
          this.stats = { requests: 0, deduped: 0, bytesIn: 0 };
        }
        __key(input, init) {
          const url = typeof input === "string" ? input : input && input.url || String(input);
          return (init && init.method ? init.method.toUpperCase() : "GET") + " " + url;
        }
        async fetch(input, init = {}) {
          const method = (init.method || input && input.method || "GET").toUpperCase();
          const url = typeof input === "string" ? input : input && input.url || String(input);
          this.stats.requests++;
          if (method === "GET" && !init.body) {
            const key = this.__key(input, init);
            const existing = this.__inflight.get(key);
            if (existing) {
              this.stats.deduped++;
              const res2 = await existing;
              return res2.clone();
            }
            const p = globalThis.fetch(url, init).then(async (res2) => {
              this.__inflight.delete(key);
              const buf = await res2.arrayBuffer();
              this.stats.bytesIn += buf.byteLength;
              const headers = {};
              res2.headers.forEach((v, k) => {
                headers[k] = v;
              });
              return new Response(buf, { status: res2.status, statusText: res2.statusText, headers });
            }).catch((err) => {
              this.__inflight.delete(key);
              throw err;
            });
            this.__inflight.set(key, p);
            return p;
          }
          const res = await globalThis.fetch(input, init);
          return res;
        }
      }
      const WORKER_SHIM = `
const { parentPort } = require('worker_threads');
globalThis.__merkavaPorts = [];
globalThis.postMessage = function(data, transfer) {
	parentPort.postMessage(data, transfer);
};
globalThis.onmessage = null;
Object.defineProperty(globalThis, 'onmessage', {
	get() { return globalThis.__onmessage || null; },
	set(fn) { globalThis.__onmessage = fn; }
});
// B"H: worker errors must reach the host's onerror (Web Worker semantics).
// An uncaught throw in the user handler is reported back as an error event
// instead of being swallowed \u2014 the worker stays alive like in browsers.
parentPort.on('message', (data) => {
	try { globalThis.__onmessage && globalThis.__onmessage({ data }); }
	catch (e) {
		parentPort.postMessage({ __merkavaWorkerError: String((e && e.message) || e), __merkavaWorkerStack: (e && e.stack) || "" });
	}
});
parentPort.on('close', () => {});
`;
      function isWorkerErrorEvent(data) {
        return data !== null && typeof data === "object" && typeof data.__merkavaWorkerError === "string";
      }
      function workerErrorFrom(data) {
        const err = new Error(data.__merkavaWorkerError);
        err.stack = data.__merkavaWorkerStack || err.stack;
        err.__isWorkerError = true;
        return err;
      }
      class VirtualParallelWorker {
        constructor(source, options = {}) {
          const wt = nodeRequire("worker_threads");
          if (!wt) throw new Error("ParallelWorker requires Node worker_threads");
          this.__listeners = { message: [], error: [] };
          this.onmessage = null;
          this.onerror = null;
          this.__terminated = false;
          let code = String(source || "");
          const dataMatch = code.match(/^data:(?:[^,]*),([\s\S]*)$/);
          if (dataMatch) {
            try {
              code = decodeURIComponent(dataMatch[1]);
            } catch (e) {
              code = dataMatch[1];
            }
          } else if (/^blob:/.test(code)) {
            throw new Error("ParallelWorker: blob: URLs need host resolution");
          }
          const fullCode = WORKER_SHIM + "\n" + code;
          this.__worker = new wt.Worker(fullCode, { eval: true });
          this.__worker.on("message", (data) => {
            if (isWorkerErrorEvent(data)) {
              this.__dispatchWorkerError(workerErrorFrom(data));
              return;
            }
            const ev = { data, target: this, type: "message" };
            try {
              this.onmessage && this.onmessage(ev);
            } catch (e) {
            }
            for (const fn of this.__listeners.message) {
              try {
                fn(ev);
              } catch (e) {
              }
            }
          });
          this.__worker.on("error", (err) => {
            this.__dispatchWorkerError(err);
          });
          this.__online = false;
          this.__preOnline = [];
          this.__worker.once("online", () => {
            this.__online = true;
            this.__flushPreOnline();
          });
        }
        __flushPreOnline() {
          const q = this.__preOnline;
          this.__preOnline = [];
          for (const [d, t] of q) {
            if (!this.__terminated) this.__worker.postMessage(d, t);
          }
        }
        __dispatchWorkerError(err) {
          const ev = { error: err, target: this, type: "error", message: String(err && err.message || err) };
          try {
            this.onerror && this.onerror(ev);
          } catch (e) {
          }
          for (const fn of this.__listeners.error) {
            try {
              fn(ev);
            } catch (e) {
            }
          }
        }
        get ready() {
          return this.__online ? Promise.resolve() : new Promise((res) => this.__worker.once("online", res));
        }
        postMessage(data, transfer) {
          if (this.__terminated) return;
          if (this.__online) {
            this.__worker.postMessage(data, transfer);
            return;
          }
          this.__preOnline.push([data, transfer]);
          if (this.__online) this.__flushPreOnline();
        }
        terminate() {
          this.__terminated = true;
          this.__worker.terminate();
        }
        addEventListener(type, fn) {
          if (fn) (this.__listeners[type] = this.__listeners[type] || []).push(fn);
        }
        removeEventListener(type, fn) {
          this.__listeners[type] = (this.__listeners[type] || []).filter((x) => x !== fn);
        }
        get terminated() {
          return this.__terminated;
        }
      }
      class VirtualWebSocket {
        constructor(url, protocols) {
          this.url = String(url);
          this.protocol = "";
          this.readyState = VirtualWebSocket.CONNECTING;
          this.binaryType = "blob";
          this.bufferedAmount = 0;
          this.onopen = null;
          this.onmessage = null;
          this.onerror = null;
          this.onclose = null;
          this.__listeners = {};
          this.__stats = { sent: 0, received: 0, bytesIn: 0, bytesOut: 0 };
          this.__queue = [];
          const WS = globalThis.WebSocket;
          if (typeof WS !== "function") {
            queueMicrotask(() => this.__fail(new Error("WebSocket not available in this host")));
            return;
          }
          try {
            this.__ws = protocols !== void 0 ? new WS(this.url, protocols) : new WS(this.url);
          } catch (e) {
            queueMicrotask(() => this.__fail(e));
            return;
          }
          if (protocols !== void 0) this.protocol = this.__ws.protocol || "";
          this.__ws.binaryType = "arraybuffer";
          this.__ws.onopen = (e) => {
            this.readyState = VirtualWebSocket.OPEN;
            for (const d of this.__queue) this.__sendNow(d);
            this.__queue.length = 0;
            this.__emit("open", { target: this, type: "open" });
          };
          this.__ws.onmessage = (e) => {
            this.__stats.received++;
            let data = e.data;
            if (typeof data !== "string") {
              const buf = data instanceof ArrayBuffer ? data : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
              this.__stats.bytesIn += buf.byteLength;
              if (this.binaryType === "arraybuffer") data = buf;
              else data = new Blob([buf]);
            } else {
              this.__stats.bytesIn += data.length;
            }
            this.__emit("message", { data, target: this, type: "message", origin: this.url });
          };
          this.__ws.onerror = (e) => this.__emit("error", { target: this, type: "error", error: e });
          this.__ws.onclose = (e) => {
            this.readyState = VirtualWebSocket.CLOSED;
            this.__emit("close", { target: this, type: "close", code: e.code, reason: e.reason, wasClean: e.wasClean });
          };
        }
        __emit(type, ev) {
          const h = this["on" + type];
          try {
            h && h(ev);
          } catch (e) {
          }
          for (const fn of this.__listeners[type] || []) {
            try {
              fn(ev);
            } catch (e) {
            }
          }
        }
        __fail(e) {
          this.readyState = VirtualWebSocket.CLOSED;
          this.__emit("error", { target: this, type: "error", error: e });
          this.__emit("close", { target: this, type: "close", code: 1006, reason: String(e && e.message || e), wasClean: false });
        }
        __sendNow(data) {
          this.__stats.sent++;
          if (typeof data === "string") this.__stats.bytesOut += data.length;
          else if (data) this.__stats.bytesOut += data.byteLength || data.length || 0;
          this.__ws.send(data);
        }
        send(data) {
          if (this.readyState === VirtualWebSocket.CONNECTING) {
            this.__queue.push(data);
            this.bufferedAmount += 1;
            return;
          }
          if (this.readyState !== VirtualWebSocket.OPEN) throw new Error("InvalidStateError: WebSocket not open");
          this.__sendNow(data);
        }
        close(code = 1e3, reason = "") {
          if (this.__ws) {
            try {
              this.__ws.close(code, reason);
            } catch (e) {
            }
          } else this.readyState = VirtualWebSocket.CLOSED;
        }
        addEventListener(type, fn) {
          if (fn) (this.__listeners[type] = this.__listeners[type] || []).push(fn);
        }
        removeEventListener(type, fn) {
          this.__listeners[type] = (this.__listeners[type] || []).filter((x) => x !== fn);
        }
        get stats() {
          return { ...this.__stats };
        }
      }
      VirtualWebSocket.CONNECTING = 0;
      VirtualWebSocket.OPEN = 1;
      VirtualWebSocket.CLOSING = 2;
      VirtualWebSocket.CLOSED = 3;
      function installVirtualBrowserNet(windowObject, options = {}) {
        const fastFetch = new VirtualFastFetch(options);
        windowObject.fetchFast = (input, init) => fastFetch.fetch(input, init);
        windowObject.__fastFetchStats = () => ({ ...fastFetch.stats });
        windowObject.ParallelWorker = VirtualParallelWorker;
        windowObject.WebSocket = windowObject.WebSocket || VirtualWebSocket;
        return { fastFetch, VirtualFastFetch, VirtualParallelWorker, VirtualWebSocket };
      }
      return {
        VirtualBrowserNet: {
          installVirtualBrowserNet,
          VirtualFastFetch,
          VirtualParallelWorker,
          VirtualWebSocket
        },
        installVirtualBrowserNet,
        VirtualFastFetch,
        VirtualParallelWorker,
        VirtualWebSocket
      };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWindowPlatform.js
var require_VirtualWindowPlatform = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWindowPlatform.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory(
          require_VirtualWindowMedia(),
          require_VirtualDeterministicCrypto(),
          require_VirtualBrowserApis(),
          require_VirtualBrowserNet()
        );
      } else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualWindowPlatform = factory(
          root.Merkava,
          root.Merkava,
          root.Merkava,
          root.Merkava
        ).VirtualWindowPlatform;
      }
    })(typeof self !== "undefined" ? self : exports, function(mediaMod, cryptoMod, apisMod, netMod) {
      const installVirtualWindowMedia = mediaMod.installVirtualWindowMedia;
      const VirtualDeterministicCrypto = cryptoMod.VirtualDeterministicCrypto;
      const installVirtualBrowserApis = apisMod.installVirtualBrowserApis;
      const installVirtualBrowserNet = netMod.installVirtualBrowserNet;
      class VirtualWindowPlatform {
        constructor(windowObject, options = {}) {
          this.window = windowObject;
          this.options = options;
          this.install();
        }
        install() {
          const windowObject = this.window;
          windowObject.URL = URL;
          windowObject.URLSearchParams = URLSearchParams;
          windowObject.structuredClone = cloneValue;
          windowObject.queueMicrotask = (callback) => Promise.resolve().then(callback);
          windowObject.crypto = new VirtualDeterministicCrypto(this.options.seed);
          installVirtualWindowMedia(windowObject);
          const Observer = createMutationObserver(windowObject.document);
          windowObject.MutationObserver = Observer;
          windowObject.ResizeObserver = Observer;
          windowObject.IntersectionObserver = Observer;
          windowObject.showDirectoryPicker = async () => directoryHandle();
          windowObject.showOpenFilePicker = async () => [];
          installVirtualBrowserApis(windowObject, this.options);
          installVirtualBrowserNet(windowObject, this.options);
        }
      }
      function cloneValue(value) {
        if (globalThis.structuredClone) return globalThis.structuredClone(value);
        return JSON.parse(JSON.stringify(value));
      }
      function directoryHandle() {
        return { kind: "directory", name: "virtual-root", async *values() {
        } };
      }
      function createMutationObserver(documentObject) {
        return class MutationObserver {
          constructor(callback) {
            this.callback = callback;
            this.records = [];
          }
          observe(target, options = {}) {
            this.target = target;
            this.options = options;
            documentObject.__registerMutationObserver(this);
          }
          disconnect() {
            documentObject.__unregisterMutationObserver(this);
          }
          takeRecords() {
            const records = this.records.slice();
            this.records.length = 0;
            return records;
          }
          __enqueue(record) {
            this.records.push(record);
            this.callback?.([record], this);
          }
        };
      }
      return { VirtualWindowPlatform };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/CssComputedSerializer.js
var require_CssComputedSerializer = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/CssComputedSerializer.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory());
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      const colorProperties = /* @__PURE__ */ new Set([
        "background-color",
        "border-bottom-color",
        "border-left-color",
        "border-right-color",
        "border-top-color",
        "caret-color",
        "color",
        "column-rule-color",
        "outline-color",
        "text-decoration-color"
      ]);
      function serializeComputedProperty(name, value) {
        if (!colorProperties.has(String(name || "").toLowerCase())) {
          return value;
        }
        return serializeColor(value);
      }
      function serializeColor(value) {
        const text = String(value ?? "").trim();
        const hex = text.match(/^#([0-9a-f]{6})$/i);
        if (hex) {
          const number = parseInt(hex[1], 16);
          const red = number >> 16 & 255;
          const green = number >> 8 & 255;
          const blue = number & 255;
          return `rgb(${red}, ${green}, ${blue})`;
        }
        const rgba = text.match(/^rgba\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)$/i);
        if (rgba) {
          return `rgba(${rgba[1].trim()}, ${rgba[2].trim()}, ${rgba[3].trim()}, ${rgba[4].trim()})`;
        }
        return text;
      }
      function serializeComputedStyle(style = {}) {
        const output = /* @__PURE__ */ Object.create(null);
        for (const [name, value] of Object.entries(style)) {
          output[name] = serializeComputedProperty(name, value);
        }
        return output;
      }
      return {
        serializeComputedProperty,
        serializeComputedStyle
      };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWindowHelpers.js
var require_VirtualWindowHelpers = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWindowHelpers.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory(require_CssComputedSerializer());
      } else {
        root.Merkava = root.Merkava || {};
        Object.assign(root.Merkava, factory(root.Merkava));
      }
    })(typeof self !== "undefined" ? self : exports, function(serializerMod) {
      function makeVirtualHistory(windowObject) {
        return {
          stack: [windowObject.location.href],
          pushState(_state, _title, next) {
            navigate(windowObject, next, true);
          },
          replaceState(_state, _title, next) {
            navigate(windowObject, next, false);
          }
        };
      }
      function virtualComputedStyle(documentObject, element) {
        const computed = documentObject.cssEngine.compute(element);
        const value = serializerMod.serializeComputedStyle(computed);
        return {
          ...value,
          getPropertyValue(name) {
            const normalized = String(name).replace(
              /[A-Z]/g,
              (letter) => `-${letter.toLowerCase()}`
            );
            return value[normalized] || "";
          }
        };
      }
      function callWithTimerBudget(callback, argumentsToPass, windowObject) {
        if (windowObject.__timerBudget.frozen) {
          return;
        }
        windowObject.__timerBudget.callbacks += 1;
        if (windowObject.__timerBudget.callbacks > windowObject.__timerBudget.maximumCallbacks) {
          windowObject.freezeTimers();
          return;
        }
        try {
          callback?.(...argumentsToPass);
        } catch (error) {
          windowObject.__AWTSMOOS_CAPTURED_ERRORS__ ||= [];
          windowObject.__AWTSMOOS_CAPTURED_ERRORS__.push({
            message: error.message,
            phase: "timer",
            stack: error.stack
          });
        }
      }
      function navigate(windowObject, next, push) {
        windowObject.location = new URL(next, windowObject.location.href);
        if (push) {
          windowObject.history.stack.push(windowObject.location.href);
          return;
        }
        const index = windowObject.history.stack.length - 1;
        windowObject.history.stack[index] = windowObject.location.href;
      }
      return {
        callWithTimerBudget,
        makeVirtualHistory,
        virtualComputedStyle
      };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWindowCore.js
var require_VirtualWindowCore = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWindowCore.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory(
          require_VirtualDocument(),
          require_VirtualStorage(),
          require_VirtualConsole(),
          require_VirtualFetch(),
          require_VirtualEvents(),
          require_VirtualMouse(),
          require_VirtualKeyboard(),
          require_VirtualInteractions(),
          require_RuntimeProbe(),
          require_VirtualWebGLBoxRendererV2(),
          require_BrowserRenderPipeline(),
          require_VirtualWindowPlatform(),
          require_VirtualWindowHelpers()
        );
      } else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualWindowCore = factory(
          root.Merkava,
          root.Merkava,
          root.Merkava,
          root.Merkava,
          root.Merkava,
          root.Merkava,
          root.Merkava,
          root.Merkava,
          root.Merkava,
          root.Merkava,
          root.Merkava,
          root.Merkava,
          root.Merkava
        ).VirtualWindowCore;
      }
    })(typeof self !== "undefined" ? self : exports, function(docMod, storageMod, consoleMod, fetchMod, events, mouseMod, keyboardMod, interactionMod, probeMod, boxRendererMod, pipelineMod, platformMod, helperMod) {
      class VirtualWindowCore {
        constructor(options = {}) {
          this.graph = options.graph || null;
          this.files = options.files || {};
          this.document = new docMod.VirtualDocument();
          this.document.defaultView = this;
          this.console = new consoleMod.VirtualConsole(this.graph);
          this.localStorage = new storageMod.VirtualStorage();
          this.sessionStorage = new storageMod.VirtualStorage();
          this.location = new URL(options.url || "http://127.0.0.1:8080/");
          this.innerWidth = Number(options.width || 1024);
          this.innerHeight = Number(options.height || 768);
          this.devicePixelRatio = Number(options.devicePixelRatio || 1);
          this.navigator = Object.freeze({
            language: "en-US",
            onLine: true,
            platform: "Merkava",
            userAgent: "MerkavaSyntheticChrome/2.0"
          });
          this.history = helperMod.makeVirtualHistory(this);
          this.performance = { now: () => Date.now() };
          this.__timers = /* @__PURE__ */ new Map();
          this.__timerBudget = {
            callbacks: 0,
            frozen: false,
            maximumCallbacks: Number(options.maximumTimerCallbacks || 250)
          };
          this.__network = new fetchMod.VirtualFetch({
            baseUrl: this.location.href,
            files: this.files,
            graph: this.graph,
            transport: options.fetchTransport || options.networkTransport || null
          });
          this.fetch = this.__network.fetch.bind(this.__network);
          this.Event = events.VirtualEvent;
          this.CustomEvent = events.VirtualCustomEvent;
          this.KeyboardEvent = events.VirtualKeyboardEvent;
          this.MouseEvent = events.VirtualMouseEvent;
          this.InputEvent = events.VirtualInputEvent;
          new platformMod.VirtualWindowPlatform(this, options);
          this.mouse = new mouseMod.VirtualMouse(this);
          this.keyboard = new keyboardMod.VirtualKeyboard(this);
          this.interactions = new interactionMod.VirtualInteractions(this);
          this.probe = new probeMod.RuntimeProbe();
          this.webglRenderer = new boxRendererMod.VirtualWebGLBoxRendererV2(
            this.document.textureArena
          );
          this.renderPipeline = new pipelineMod.BrowserRenderPipeline(this, {
            renderer: this.webglRenderer,
            viewport: {
              height: options.height || 560,
              width: options.width || 760
            }
          });
          this.renderWebGLDom = () => this.renderPipeline.render();
          this.getComputedStyle = (element) => helperMod.virtualComputedStyle(
            this.document,
            element
          );
          this.addStyleSheet = (cssText) => {
            return this.document.cssEngine.parseStyleSheet(cssText);
          };
        }
      }
      return { VirtualWindowCore };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWindow.js
var require_VirtualWindow = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWindow.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory(
          require_VirtualWindowCore(),
          require_VirtualWindowHelpers()
        );
      } else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualWindow = factory(root.Merkava, root.Merkava).VirtualWindow;
      }
    })(typeof self !== "undefined" ? self : exports, function(coreMod, helperMod) {
      class VirtualWindow extends coreMod.VirtualWindowCore {
        constructor(options = {}) {
          super(options);
          this.__timerBudget.lifecycleDrainStarted = false;
          this.requestAnimationFrame = (callback) => this.setTimeout(() => {
            callback(this.performance.now());
          }, 16);
          this.cancelAnimationFrame = (identifier) => this.clearTimeout(identifier);
        }
        setTimeout(callback, milliseconds = 0, ...argumentsToPass) {
          if (this.__timerBudget.frozen) return 0;
          const identifier = setTimeout(() => {
            this.__timers.delete(identifier);
            helperMod.callWithTimerBudget(callback, argumentsToPass, this);
          }, Math.max(0, Number(milliseconds) || 0));
          identifier?.unref?.();
          this.__timers.set(identifier, { kind: "timeout", milliseconds });
          return identifier;
        }
        clearTimeout(identifier) {
          this.__timers.delete(identifier);
          clearTimeout(identifier);
        }
        setInterval(callback, milliseconds = 0, ...argumentsToPass) {
          if (this.__timerBudget.frozen) return 0;
          const identifier = setInterval(() => {
            helperMod.callWithTimerBudget(callback, argumentsToPass, this);
          }, Math.max(0, Number(milliseconds) || 0));
          identifier?.unref?.();
          this.__timers.set(identifier, { kind: "interval", milliseconds });
          return identifier;
        }
        clearInterval(identifier) {
          this.__timers.delete(identifier);
          clearInterval(identifier);
        }
        freezeTimers() {
          const lifecycle = this.__merkavaCurrentStep?.type === "lifecycle";
          const overBudget = this.__timerBudget.callbacks > this.__timerBudget.maximumCallbacks;
          if (lifecycle && !overBudget && !this.__timerBudget.lifecycleDrainStarted) {
            this.__timerBudget.lifecycleDrainStarted = true;
            return;
          }
          this.__timerBudget.frozen = true;
          this.cancelAllTimers();
        }
        clearAllTimers() {
          const parsing = this.__merkavaCurrentStep && this.__merkavaCurrentStep.type !== "lifecycle";
          if (parsing && !this.__timerBudget.frozen) return;
          this.cancelAllTimers();
        }
        cancelAllTimers() {
          for (const identifier of this.__timers.keys()) {
            clearTimeout(identifier);
            clearInterval(identifier);
          }
          this.__timers.clear();
        }
        addEventListener(type, handler, options) {
          this.document.addEventListener(type, handler, options);
        }
        removeEventListener(type, handler, options) {
          this.document.removeEventListener(type, handler, options);
        }
        dispatchEvent(event) {
          return this.document.dispatchEvent(event);
        }
        snapshot() {
          return Object.freeze({
            canvasArena: this.document.textureArena.snapshot(),
            console: this.console?.toJSON?.() || [],
            crypto: this.crypto.snapshot(),
            document: this.document.toJSON(),
            fontAtlas: this.document.fontAtlas.snapshot(),
            keyboard: this.keyboard.toJSON(),
            localStorage: this.localStorage.toJSON(),
            location: this.location.href,
            mouse: this.mouse.toJSON(),
            navigator: this.navigator,
            network: this.__network.toJSON(),
            probes: this.probe.toJSON(),
            sessionStorage: this.sessionStorage.toJSON(),
            timers: [...this.__timers.values()]
          });
        }
      }
      return { VirtualWindow };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/SyntheticBrowserRuntime.js
var require_SyntheticBrowserRuntime = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/SyntheticBrowserRuntime.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory(require_VirtualWindow());
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.SyntheticBrowserRuntime = factory(root.Merkava).SyntheticBrowserRuntime;
      }
    })(typeof self !== "undefined" ? self : exports, function(winMod) {
      const VirtualWindow = winMod.VirtualWindow;
      class SyntheticBrowserRuntime {
        constructor(options = {}) {
          this.options = options;
          this.window = new VirtualWindow(options);
          this.errors = [];
          ensureVisualViewport(this.window);
          ensureAwtsHelpers(this.window);
        }
        globals() {
          const w = this.window;
          ensureVisualViewport(w);
          ensureAwtsHelpers(w);
          const Element = w.document.createElement("div").constructor;
          installElementCompat(Element, w);
          const Document = w.document.constructor;
          const DOMParser = class DOMParser {
            parseFromString(markup = "") {
              const doc = new Document();
              doc.body.innerHTML = String(markup || "");
              return doc;
            }
          };
          const base = browserBaseGlobals(w, Element, Document, DOMParser);
          return makeGlobalProxy(base, w);
        }
        async executeFunction(fn) {
          const detach = attachProcessRejectionCapture(this);
          try {
            const globals = this.__merkavaGlobals || this.globals();
            const result = await guardedRuntimeCall(() => fn(globals, this.window), this.options?.functionTimeoutMs || 4e3);
            await flushMicrotasks();
            captureTimerErrors(this);
            detach();
            return { ok: !this.errors.length, result, snapshot: this.snapshot() };
          } catch (error) {
            this.errors.push({ message: error.message, stack: error.stack, code: error.code || null });
            detach();
            return { ok: false, error: error.message, stack: error.stack, code: error.code || null, snapshot: this.snapshot() };
          }
        }
        snapshot() {
          captureTimerErrors(this);
          return { kind: "browser", errors: this.errors, window: this.window.snapshot() };
        }
      }
      function browserBaseGlobals(w, Element, Document, DOMParser) {
        return {
          window: w,
          self: w,
          document: w.document,
          console: w.console,
          localStorage: w.localStorage,
          sessionStorage: w.sessionStorage,
          DOMParser,
          Element,
          HTMLElement: Element,
          Document,
          Node: Element,
          Image: w.Image,
          Audio: w.Audio,
          AudioContext: w.AudioContext,
          webkitAudioContext: w.webkitAudioContext,
          navigator: w.navigator,
          location: w.location,
          history: w.history,
          fetch: w.fetch,
          innerWidth: w.innerWidth,
          innerHeight: w.innerHeight,
          devicePixelRatio: w.devicePixelRatio,
          visualViewport: w.visualViewport,
          $a: w.$a,
          registerFont: w.document.fontAtlas.registerFont.bind(w.document.fontAtlas),
          setTextMeasureHook: w.document.fontAtlas.setMeasureHook.bind(w.document.fontAtlas),
          Event: w.Event,
          CustomEvent: w.CustomEvent,
          KeyboardEvent: w.KeyboardEvent,
          MouseEvent: w.MouseEvent,
          InputEvent: w.InputEvent,
          Blob: w.Blob,
          File: w.File,
          FormData: w.FormData,
          Request: makeRequestShim(w),
          Headers: makeHeadersShim(),
          URL: w.URL,
          URLSearchParams: w.URLSearchParams,
          MutationObserver: w.MutationObserver,
          ResizeObserver: w.ResizeObserver,
          IntersectionObserver: w.IntersectionObserver,
          Worker: w.Worker,
          crypto: w.crypto,
          getComputedStyle: w.getComputedStyle,
          addStyleSheet: w.addStyleSheet,
          renderWebGLDom: w.renderWebGLDom,
          page: w.interactions,
          mouse: w.mouse,
          keyboard: w.keyboard,
          probe: w.probe,
          setTimeout: w.setTimeout.bind(w),
          clearTimeout: w.clearTimeout.bind(w),
          setInterval: w.setInterval.bind(w),
          clearInterval: w.clearInterval.bind(w),
          requestAnimationFrame: w.requestAnimationFrame,
          cancelAnimationFrame: w.cancelAnimationFrame,
          showDirectoryPicker: w.showDirectoryPicker,
          showOpenFilePicker: w.showOpenFilePicker,
          pdfjsLib: makePdfJsShim(),
          PDFJS: makePdfJsShim()
        };
      }
      function attachProcessRejectionCapture(runtime) {
        if (typeof process === "undefined" || !process.on) return () => {
        };
        const seen = /* @__PURE__ */ new Set();
        const record = (error) => {
          if (seen.has(error)) return;
          seen.add(error);
          runtime.errors.push({ message: error?.message || String(error), stack: error?.stack || "", phase: "unhandledRejection" });
        };
        process.on("unhandledRejection", record);
        process.on("uncaughtException", record);
        return () => {
          process.off?.("unhandledRejection", record);
          process.off?.("uncaughtException", record);
        };
      }
      function guardedRuntimeCall(factory, ms) {
        let timer;
        return Promise.race([
          Promise.resolve().then(factory),
          new Promise((_, reject) => {
            timer = setTimeout(() => {
              const e = new Error("Merkava runtime function timed out after " + ms + "ms");
              e.code = "MERKAVA_RUNTIME_FUNCTION_TIMEOUT";
              reject(e);
            }, Math.max(1, Number(ms || 4e3)));
            if (timer && typeof timer.unref === "function") timer.unref();
          })
        ]).finally(() => timer && clearTimeout(timer));
      }
      function flushMicrotasks() {
        return new Promise((resolve) => setTimeout(resolve, 0));
      }
      function makeRequestShim(w) {
        return class Request {
          constructor(input, options = {}) {
            const raw = typeof input === "object" && input && "url" in input ? input.url : input;
            const text = String(raw || "");
            this.url = text.startsWith("//") ? new URL("https:" + text).href : new URL(text, w.location?.href || "https://awtsmoos.com/").href;
            this.method = options.method || input?.method || "GET";
            this.headers = options.headers || input?.headers || {};
            this.signal = options.signal || input?.signal || null;
            this.credentials = options.credentials || input?.credentials || "same-origin";
          }
          clone() {
            return new this.constructor(this, { method: this.method, headers: this.headers, signal: this.signal, credentials: this.credentials });
          }
          toString() {
            return this.url;
          }
        };
      }
      function makeHeadersShim() {
        return class Headers {
          constructor(init = {}) {
            this.map = new Map(Object.entries(init || {}).map(([k, v]) => [String(k).toLowerCase(), String(v)]));
          }
          get(name) {
            return this.map.get(String(name).toLowerCase()) || null;
          }
          set(name, value) {
            this.map.set(String(name).toLowerCase(), String(value));
          }
          append(name, value) {
            this.set(name, value);
          }
          has(name) {
            return this.map.has(String(name).toLowerCase());
          }
        };
      }
      function makePdfJsShim() {
        const page = { getViewport: ({ scale = 1 } = {}) => ({ width: 612 * scale, height: 792 * scale }), render: () => ({ promise: Promise.resolve() }) };
        return { GlobalWorkerOptions: {}, getDocument: () => ({ promise: Promise.resolve({ numPages: 1, getPage: async () => page }) }) };
      }
      function ensureAwtsHelpers(w) {
        if (typeof w.$a === "function") return;
        w.__awtsIncludes = [];
        w.$a = (spec) => {
          w.__awtsIncludes.push(String(spec || ""));
          return "";
        };
      }
      function ensureVisualViewport(w) {
        if (w.visualViewport) return;
        const listeners = {};
        w.visualViewport = {
          width: w.innerWidth || 1024,
          height: w.innerHeight || 768,
          scale: 1,
          offsetLeft: 0,
          offsetTop: 0,
          pageLeft: 0,
          pageTop: 0,
          addEventListener(type, handler) {
            if (handler) (listeners[type] = listeners[type] || []).push(handler);
          },
          removeEventListener(type, handler) {
            listeners[type] = (listeners[type] || []).filter((x) => x !== handler);
          },
          dispatchEvent(event) {
            for (const fn of (listeners[event.type] || []).slice()) try {
              fn.call(this, event);
            } catch (_) {
            }
            return true;
          }
        };
      }
      function makeGlobalProxy(base, win) {
        const proxy = new Proxy(base, {
          has(target, prop) {
            return prop in target || prop in win || typeof prop === "string" && !!win.document.getElementById(prop);
          },
          get(target, prop, receiver) {
            if (prop === Symbol.unscopables) return void 0;
            if (prop in target) return Reflect.get(target, prop, receiver);
            if (prop in win) return win[prop];
            if (typeof prop === "string") {
              const el = win.document.getElementById(prop);
              if (el) return el;
            }
            return void 0;
          },
          set(target, prop, value) {
            target[prop] = value;
            if (typeof prop === "string") win[prop] = value;
            return true;
          }
        });
        base.window = proxy;
        base.self = proxy;
        return proxy;
      }
      function layoutSchedulerOf(node) {
        return node && node.ownerDocument && node.ownerDocument.__layoutScheduler;
      }
      function installElementCompat(Element, win) {
        if (!Element.prototype.getBoundingClientRect) Element.prototype.getBoundingClientRect = function() {
          const sched = layoutSchedulerOf(this);
          if (sched) sched.beginRead();
          try {
            const width = Number(this.width || this.clientWidth || parsePx3(this.style?.width) || (this.localName === "canvas" ? 300 : 0));
            const height = Number(this.height || this.clientHeight || parsePx3(this.style?.height) || (this.localName === "canvas" ? 150 : 0));
            return { x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, width, height, toJSON() {
              return this;
            } };
          } finally {
            if (sched) sched.endRead();
          }
        };
        defineSize(Element.prototype, "clientWidth", (node) => node.width || parsePx3(node.style?.width) || win.innerWidth || 0);
        defineSize(Element.prototype, "clientHeight", (node) => node.height || parsePx3(node.style?.height) || win.innerHeight || 0);
        defineSize(Element.prototype, "offsetWidth", (node) => node.clientWidth || 0);
        defineSize(Element.prototype, "offsetHeight", (node) => node.clientHeight || 0);
      }
      function defineSize(proto, name, getter) {
        const desc = Object.getOwnPropertyDescriptor(proto, name);
        if (desc && desc.get) return;
        Object.defineProperty(proto, name, { configurable: true, get() {
          const sched = layoutSchedulerOf(this);
          if (sched) sched.beginRead();
          try {
            return Number(getter(this)) || 0;
          } finally {
            if (sched) sched.endRead();
          }
        } });
      }
      function parsePx3(value) {
        const got = String(value || "").match(/-?\d+(?:\.\d+)?/);
        return got ? Number(got[0]) : 0;
      }
      function captureTimerErrors(runtime) {
        const rows = runtime.window.__AWTSMOOS_CAPTURED_ERRORS__ || [];
        while (rows.length) runtime.errors.push(rows.shift());
      }
      return { SyntheticBrowserRuntime };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-node/VirtualNodeRuntime.js
var require_VirtualNodeRuntime = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-node/VirtualNodeRuntime.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.VirtualNodeRuntime = factory().VirtualNodeRuntime;
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      class VirtualNodeRuntime {
        constructor({ files = {}, env = {} } = {}) {
          this.files = new Map(Object.entries(files));
          this.env = env;
          this.logs = [];
          this.spawned = [];
        }
        fs() {
          return {
            readFileSync: (path2) => {
              if (!this.files.has(path2)) throw new Error("ENOENT: " + path2);
              return this.files.get(path2);
            },
            writeFileSync: (path2, value) => this.files.set(path2, String(value)),
            existsSync: (path2) => this.files.has(path2),
            readdirSync: (dir) => Array.from(this.files.keys()).filter((path2) => path2.startsWith(dir)).map((path2) => path2.slice(dir.length).replace(/^\//, "").split("/")[0]),
            mkdirSync: () => true
          };
        }
        process() {
          return { env: this.env, cwd: () => "/", argv: ["merkava-node"], platform: "merkava" };
        }
        child_process() {
          return { spawn: (cmd, args = []) => {
            const item = { cmd, args, at: Date.now(), simulated: true };
            this.spawned.push(item);
            return item;
          } };
        }
        globals() {
          const api = { fs: this.fs(), process: this.process(), child_process: this.child_process() };
          return { api, fs: api.fs, child_process: api.child_process, console: { log: (...a) => this.logs.push({ level: "log", args: a.map(String) }), error: (...a) => this.logs.push({ level: "error", args: a.map(String) }) }, process: api.process };
        }
        async executeFunction(fn) {
          try {
            const api = { fs: this.fs(), process: this.process(), child_process: this.child_process(), globals: this.__merkavaGlobals || this.globals() };
            return { ok: true, result: await fn(api), snapshot: this.snapshot() };
          } catch (error) {
            return { ok: false, error: error.message, stack: error.stack, snapshot: this.snapshot() };
          }
        }
        snapshot() {
          return { kind: "node", files: Object.fromEntries(this.files.entries()), logs: this.logs, spawned: this.spawned };
        }
      }
      return { VirtualNodeRuntime };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/DOMHydrator.js
var require_DOMHydrator = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/DOMHydrator.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory();
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.DOMHydrator = factory();
      }
    })(typeof self !== "undefined" ? self : exports, function() {
      const voidTags = /* @__PURE__ */ new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "source", "track", "wbr"]);
      const skippedTags = /* @__PURE__ */ new Set(["link", "meta", "script"]);
      const rawTags = /* @__PURE__ */ new Set(["style", "textarea", "title"]);
      function hydrateHTML(document, html = "") {
        if (!document?.body) return { ok: false, count: 0 };
        reset(document.body);
        const body = bodyHTML(html);
        const stack = [document.body];
        let count = 0;
        let i = 0;
        while (i < body.length) {
          if (body.startsWith("<!--", i)) {
            i = skipComment(body, i);
            continue;
          }
          if (body[i] !== "<") {
            const next = nextTag(body, i);
            appendText2(document, currentContainer(stack), body.slice(i, next));
            i = next;
            continue;
          }
          const close = body.indexOf(">", i + 1);
          if (close < 0) {
            appendText2(document, currentContainer(stack), body.slice(i));
            break;
          }
          const raw = body.slice(i + 1, close).trim();
          if (!raw) {
            i = close + 1;
            continue;
          }
          if (raw[0] === "/") {
            closeStack(stack, raw.slice(1).trim().toLowerCase());
            i = close + 1;
            continue;
          }
          const selfClosing = raw.endsWith("/");
          const clean = selfClosing ? raw.slice(0, -1).trim() : raw;
          const space = clean.search(/\s/);
          const tag = (space < 0 ? clean : clean.slice(0, space)).toLowerCase();
          const attrText = space < 0 ? "" : clean.slice(space + 1);
          if (skippedTags.has(tag)) {
            i = rawTags.has(tag) || tag === "script" ? readRaw(body, tag, close + 1).end : close + 1;
            continue;
          }
          const el = document.createElement(tag);
          for (const [name, value] of Object.entries(attrsOf(attrText))) el.setAttribute(name, value);
          currentContainer(stack).appendChild(el);
          count++;
          if (rawTags.has(tag)) {
            const got = readRaw(body, tag, close + 1);
            el.textContent = got.text;
            i = got.end;
            continue;
          }
          if (!selfClosing && !voidTags.has(tag)) stack.push(templateContainer(el));
          i = close + 1;
        }
        return { ok: true, count };
      }
      function reset(node) {
        node.children = [];
        node.childNodes = node.children;
        node._textContent = "";
      }
      function nextTag(html, i) {
        const n2 = html.indexOf("<", i);
        return n2 < 0 ? html.length : n2;
      }
      function skipComment(html, i) {
        const n2 = html.indexOf("-->", i + 4);
        return n2 < 0 ? html.length : n2 + 3;
      }
      function readRaw(html, tag, from) {
        const endTag = `</${tag}>`;
        const lower = html.toLowerCase();
        const end = lower.indexOf(endTag, from);
        return end < 0 ? { text: html.slice(from), end: html.length } : { text: html.slice(from, end), end: end + endTag.length };
      }
      function closeStack(stack, closing) {
        for (let i = stack.length - 1; i > 0; i--) {
          const node = stack[i];
          const host = node.host && node.host.localName === closing;
          if (node.localName === closing || host) {
            stack.length = i;
            return;
          }
        }
      }
      function appendText2(document, parent, rawText) {
        const text = String(rawText || "").replace(/\s+/g, " ").trim();
        if (text) parent.appendChild(document.createTextNode(text));
      }
      function currentContainer(stack) {
        return stack[stack.length - 1];
      }
      function templateContainer(el) {
        return el.localName === "template" && el.content ? el.content : el;
      }
      function bodyHTML(html) {
        const m = String(html).match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        return m ? m[1] : String(html);
      }
      function attrsOf(raw) {
        const out = {};
        const re = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
        for (const m of String(raw || "").matchAll(re)) out[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? "");
        return out;
      }
      function decode(text) {
        return String(text || "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      }
      return { hydrateHTML };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaVmFileExecutor.js
var require_MerkavaVmFileExecutor = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaVmFileExecutor.js"(exports, module) {
    var path2 = __require("path");
    var AsyncFunction = Object.getPrototypeOf(async function() {
    }).constructor;
    function stripQuery(value = "") {
      return String(value || "").split(/[?#]/)[0];
    }
    function canonicalModulePath(value = "") {
      const raw = stripQuery(value).replace(/\\/g, "/");
      const absolute = raw.startsWith("/");
      const normalized = path2.posix.normalize(raw || ".");
      const cleaned = normalized === "." ? "" : normalized.replace(/^\.\//, "");
      return absolute ? `/${cleaned.replace(/^\//, "")}` : cleaned.replace(/^\//, "");
    }
    function moduleAliases(key = "") {
      const bare = canonicalModulePath(key).replace(/^\//, "");
      return [...new Set([bare, `/${bare}`, `./${bare}`].filter((value) => value && value !== "./"))];
    }
    function normalizeFiles(files = {}) {
      const out = {};
      for (const [key, value] of Object.entries(files)) for (const alias of moduleAliases(key)) out[alias] = value;
      return out;
    }
    function normalizeImportMap(map = {}) {
      const imports = map.imports || map || {};
      const scopes = map.scopes || {};
      return { imports: normalizeMapRecord(imports), scopes: Object.fromEntries(Object.entries(scopes).map(([scope, record]) => [canonicalModulePath(scope), normalizeMapRecord(record)])) };
    }
    function normalizeMapRecord(record = {}) {
      return Object.fromEntries(Object.entries(record || {}).map(([key, value]) => [String(key), String(value)]));
    }
    function applyImportMap(specifier, from = "", importMap = {}) {
      const raw = String(specifier || "");
      const map = normalizeImportMap(importMap);
      const scoped = Object.entries(map.scopes).filter(([scope]) => canonicalModulePath(from).startsWith(scope.replace(/\/$/, ""))).sort((a, b) => b[0].length - a[0].length);
      for (const [, record] of scoped) {
        const found = mapLookup(raw, record);
        if (found) return found;
      }
      return mapLookup(raw, map.imports) || raw;
    }
    function localImportAlias(specifier) {
      const clean = String(specifier || "").replace(/^\/+/, "");
      const legacyEditorPrefix = "games/mitzvahWorld/editor/lib/";
      if (clean.startsWith(legacyEditorPrefix)) return "/geelooy/apps/editor/old/lib/" + clean.slice(legacyEditorPrefix.length);
      if (/^three@[^/]+\/build\/three\.module\.js$/i.test(clean)) return "/geelooy/games/scripts/build/three.module.js";
      if (/^three@[^/]+\/examples\/jsm\//i.test(clean)) return "/geelooy/games/scripts/jsm/" + clean.replace(/^three@[^/]+\/examples\/jsm\//i, "");
      if (clean.startsWith("games/")) return "/geelooy/" + clean;
      if (clean.startsWith("scripts/")) return "/geelooy/" + clean;
      if (clean.startsWith("three/addons/")) return "/geelooy/games/scripts/jsm/" + clean.replace(/^three\/addons\//i, "");
      if (clean.startsWith("scripts/")) return "/geelooy/" + clean;
      if (clean.startsWith("three/addons/")) return "/geelooy/games/scripts/jsm/" + clean.replace(/^three\/addons\//i, "");
      return null;
    }
    function mapLookup(specifier, record = {}) {
      if (record[specifier]) return record[specifier];
      const prefix = Object.keys(record).filter((key) => key.endsWith("/") && specifier.startsWith(key)).sort((a, b) => b.length - a.length)[0];
      return prefix ? record[prefix] + specifier.slice(prefix.length) : null;
    }
    function resolveSpecifier(specifier, from = "", importMap = {}) {
      const mapped = applyImportMap(specifier, from, importMap).replace(/\\/g, "/");
      if (/^[a-z]+:/i.test(mapped)) return canonicalModulePath(new URL(mapped).pathname);
      if (mapped.startsWith("/")) return localImportAlias(mapped) || `/${canonicalModulePath(mapped).replace(/^\//, "")}`;
      if (!mapped.startsWith(".") && !mapped.startsWith("/")) return canonicalModulePath(mapped);
      const base = from && from.includes("/") ? from.split("/").slice(0, -1).join("/") : "";
      return `/${canonicalModulePath(base ? `${base}/${mapped}` : mapped).replace(/^\//, "")}`;
    }
    function findExistingKey(files, requested) {
      const aliases = moduleAliases(requested);
      const variants = [];
      for (const alias of aliases) variants.push(alias, alias + ".js", alias + ".mjs", alias.replace(/\/$/, "") + "/index.js", alias.replace(/\/$/, "") + "/index.mjs");
      for (const alias of [...new Set(variants)]) if (files[alias] !== void 0) return alias;
      const clean = canonicalModulePath(requested).replace(/^\//, "");
      return Object.keys(files || {}).find((key) => {
        const k = canonicalModulePath(key).replace(/^\//, "");
        return clean.endsWith(k) || k.endsWith(clean) || k === clean + ".js" || k === clean + ".mjs" || k === clean + "/index.js";
      }) || null;
    }
    function stripImports(source) {
      const text = String(source || "");
      const spans = importStatementSpans(text);
      let out = "";
      let cursor = 0;
      for (const span of spans) {
        out += text.slice(cursor, span.start);
        cursor = span.end;
      }
      return out + text.slice(cursor);
    }
    function parseImports(source, from, importMap = {}) {
      const imports = [];
      for (const span of importStatementSpans(String(source || ""))) {
        const text = span.text.trim();
        if (text.startsWith("export")) {
          const spec = text.match(/from\s*['"]([^'"]+)['"]/)?.[1];
          if (spec) imports.push({ specifier: spec, resolved: resolveSpecifier(spec, from, importMap), names: [], reexport: true });
          continue;
        }
        const match = text.match(/^import\s*(?:(.*?)\s*from\s*)?['"]([^'"]+)['"]/s);
        if (!match) continue;
        const body = (match[1] || "").trim();
        imports.push({ specifier: match[2], resolved: resolveSpecifier(match[2], from, importMap), names: parseImportBindings(body), sideEffect: !body });
      }
      return imports;
    }
    function importStatementSpans(source) {
      const spans = [];
      let i = 0, state = "normal", quote = "", escaped = false, inClass = false;
      while (i < source.length) {
        const ch = source[i], next = source[i + 1];
        if (state === "line") {
          if (ch === "\n") state = "normal";
          i++;
          continue;
        }
        if (state === "block") {
          if (ch === "*" && next === "/") {
            state = "normal";
            i += 2;
            continue;
          }
          i++;
          continue;
        }
        if (state === "regex") {
          if (escaped) {
            escaped = false;
            i++;
            continue;
          }
          if (ch === "\\") {
            escaped = true;
            i++;
            continue;
          }
          if (ch === "[") {
            inClass = true;
            i++;
            continue;
          }
          if (ch === "]") {
            inClass = false;
            i++;
            continue;
          }
          if (ch === "/" && !inClass) {
            state = "normal";
            i++;
            while (/[a-z]/i.test(source[i] || "")) i++;
            continue;
          }
          i++;
          continue;
        }
        if (state === "quote") {
          if (escaped) {
            escaped = false;
            i++;
            continue;
          }
          if (ch === "\\") {
            escaped = true;
            i++;
            continue;
          }
          if (ch === quote) state = "normal";
          i++;
          continue;
        }
        if (ch === "/" && next === "/") {
          state = "line";
          i += 2;
          continue;
        }
        if (ch === "/" && next === "*") {
          state = "block";
          i += 2;
          continue;
        }
        if (ch === "/" && isRegexLiteralStart(source, i)) {
          state = "regex";
          inClass = false;
          i++;
          continue;
        }
        if (ch === '"' || ch === "'" || ch === "`") {
          state = "quote";
          quote = ch;
          i++;
          continue;
        }
        if (isStaticImportAt(source, i) || isReexportAt(source, i)) {
          const start = i;
          const end = findStatementEnd(source, i);
          spans.push({ start, end, text: source.slice(start, end) });
          i = end;
          continue;
        }
        i++;
      }
      return spans;
    }
    function isRegexLiteralStart(source, i) {
      let j = i - 1;
      while (/\s/.test(source[j] || "")) j--;
      if (j < 0) return true;
      return /[=(:,!&|?;{}\[]/.test(source[j] || "");
    }
    function isStaticImportAt(source, i) {
      if (!source.startsWith("import", i)) return false;
      if (!isBoundary(source[i - 1]) || /[\w$]/.test(source[i + 6] || "")) return false;
      let j = i + 6;
      while (/\s/.test(source[j] || "")) j++;
      return source[j] !== "(" && source[j] !== ".";
    }
    function isReexportAt(source, i) {
      if (!source.startsWith("export", i)) return false;
      if (!isBoundary(source[i - 1]) || /[\w$]/.test(source[i + 6] || "")) return false;
      let j = i + 6;
      while (/\s/.test(source[j] || "")) j++;
      if (source[j] !== "*" && source[j] !== "{") return false;
      const semi = findStatementEnd(source, i);
      return /\bfrom\s*['"]/.test(source.slice(i, semi));
    }
    function findStatementEnd(source, i) {
      let quote = "", escaped = false;
      for (let j = i; j < source.length; j++) {
        const ch = source[j];
        if (quote) {
          if (escaped) {
            escaped = false;
            continue;
          }
          if (ch === "\\") {
            escaped = true;
            continue;
          }
          if (ch === quote) quote = "";
          continue;
        }
        if (ch === '"' || ch === "'" || ch === "`") {
          quote = ch;
          continue;
        }
        if (ch === ";") return j + 1;
        if (ch === "\n" && source.slice(i, j).includes("from")) return j;
      }
      return source.length;
    }
    function isBoundary(ch) {
      return ch == null || /[^\w$]/.test(ch);
    }
    function parseImportBindings(body) {
      const names = [];
      if (!body) return names;
      if (body.startsWith("*")) {
        const local = body.match(/\*\s*as\s*([A-Za-z_$][\w$]*)/)?.[1];
        if (local) names.push({ imported: "*", local });
        return names;
      }
      if (body.startsWith("{")) return parseNamedImports(body.replace(/^\{|\}$/g, ""));
      const [defaultName, rest] = body.split(/,\s*(?=\{|\*)/);
      if (defaultName?.trim()) names.push({ imported: "default", local: defaultName.trim() });
      if (rest?.trim().startsWith("{")) names.push(...parseNamedImports(rest.replace(/^\{|\}$/g, "")));
      if (rest?.trim().startsWith("*")) {
        const local = rest.match(/\*\s*as\s*([A-Za-z_$][\w$]*)/)?.[1];
        if (local) names.push({ imported: "*", local });
      }
      return names;
    }
    function parseNamedImports(body) {
      return body.split(",").map((part) => {
        const [imported, local] = part.trim().split(/\s+as\s+/);
        return { imported: imported.trim(), local: (local || imported).trim() };
      }).filter((item) => item.imported);
    }
    function stripExports(source, moduleKey = "", importMap = {}) {
      const exportNames = /* @__PURE__ */ new Set(), exportAliases = [];
      let defaultName = null;
      let code = rewriteDynamicImport(stripImports(source), moduleKey, importMap);
      code = code.replace(/export\s+default\s+function\s+([A-Za-z_$][\w$]*)/g, (_, name) => {
        defaultName = name;
        return `globals.${name} = function ${name}`;
      });
      code = code.replace(/export\s+default\s+class\s+([A-Za-z_$][\w$]*)/g, (_, name) => {
        defaultName = name;
        return `globals.${name} = class ${name}`;
      });
      code = code.replace(/export\s+default\s+/g, () => {
        defaultName = "__merkavaDefaultExport";
        return `globals.${defaultName} = `;
      });
      code = code.replace(/export\s+(const|let|var)\s+\{([^}]+)\}\s*=/g, (_, kind, body) => {
        for (const name of destructuredExportNames(body)) exportNames.add(name);
        return `${kind} {${body}} =`;
      });
      code = code.replace(/export\s+(const|let|var)\s+\{([^}]+)\}\s*=/g, (_, kind, body) => {
        for (const name of destructuredExportNames(body)) exportNames.add(name);
        return `${kind} {${body}} =`;
      });
      code = code.replace(/export\s+(const|let|var)\s+([A-Za-z_$][\w$]*)/g, (_, kind, name) => {
        exportNames.add(name);
        return `${kind} ${name}`;
      });
      code = code.replace(/export\s+class\s+([A-Za-z_$][\w$]*)/g, (_, name) => {
        exportNames.add(name);
        return `class ${name}`;
      });
      code = code.replace(/export\s+async\s+function\s*\*\s*([A-Za-z_$][\w$]*)/g, (_, name) => {
        exportNames.add(name);
        return `async function* ${name}`;
      });
      code = code.replace(/export\s+function\s*\*\s*([A-Za-z_$][\w$]*)/g, (_, name) => {
        exportNames.add(name);
        return `function* ${name}`;
      });
      code = code.replace(/export\s+async\s+function\s+([A-Za-z_$][\w$]*)/g, (_, name) => {
        exportNames.add(name);
        return `async function ${name}`;
      });
      code = code.replace(/export\s+function\s+([A-Za-z_$][\w$]*)/g, (_, name) => {
        exportNames.add(name);
        return `function ${name}`;
      });
      code = code.replace(/export\s*\{([^}]+)\}\s*;?/g, (_, body) => {
        for (const part of body.split(",")) {
          const [localRaw, exportedRaw] = part.trim().split(/\s+as\s+/);
          const local = localRaw?.trim();
          const exported = (exportedRaw || localRaw || "").trim();
          if (local && exported) {
            exportNames.add(exported);
            exportAliases.push({ local, exported });
          }
        }
        return "";
      });
      return { code, exportNames: [...exportNames], exportAliases, defaultName };
    }
    function rewriteDynamicImport(source, moduleKey = "", importMap = {}) {
      return String(source || "").replace(/import\.meta\.url/g, '"merkava://module"').replace(/\bimport\s*\(\s*(['"])([^'"]+)\1\s*\)/g, (_m, _q, spec) => `__merkavaDynamicImport(${JSON.stringify(resolveSpecifier(spec, moduleKey || "/", importMap))})`).replace(/\bimport\s*\(/g, "__merkavaDynamicImport(");
    }
    function createVirtualNodeGlobals(files) {
      const fs = {
        readFileSync(file) {
          return files[file] ?? files["/" + file] ?? files["./" + file] ?? "";
        },
        writeFileSync(file, value) {
          files[file] = String(value);
          files["/" + file.replace(/^\//, "")] = String(value);
        },
        existsSync(file) {
          return files[file] != null || files["/" + file] != null || files["./" + file] != null;
        }
      };
      return { api: { fs }, fs };
    }
    async function executeVmFiles({ files = {}, entry = "/main.js", globals = {}, runtime = "node", importMap = {} } = {}) {
      const allFiles = normalizeFiles(files);
      const cache = /* @__PURE__ */ new Map();
      const normalizedImportMap = normalizeImportMap(importMap);
      const runtimeGlobals = runtime === "node" ? createVirtualNodeGlobals(allFiles) : {};
      async function load(file, from = "/") {
        const resolvedFile = resolveSpecifier(file, from, normalizedImportMap);
        const key = findExistingKey(allFiles, resolvedFile) || findExistingKey(allFiles, file) || resolvedFile;
        if (cache.has(key)) return cache.get(key);
        const liveExports = {};
        cache.set(key, liveExports);
        if (typeof process !== "undefined" && process.env.MERKAVA_TRACE_MODULES === "1") console.error("[MerkavaModule:start]", JSON.stringify({ file, from, resolvedFile, key }));
        const source = allFiles[key];
        if (source == null) {
          const synthetic = syntheticMissingModuleExports(resolvedFile, globals);
          if (synthetic) {
            Object.assign(liveExports, synthetic);
            return liveExports;
          }
          cache.delete(key);
          throw new Error(`VM module not found: ${file} resolved as ${resolvedFile}`);
        }
        const moduleGlobals = makeModuleGlobals(globals, runtimeGlobals, runtime);
        const reexports = [];
        for (const imp of parseImports(source, key, normalizedImportMap)) {
          const imported = await load(imp.resolved, key);
          if (imp.reexport) reexports.push(imported);
          for (const item of imp.names) moduleGlobals[item.local] = item.imported === "*" ? imported : imported[item.imported];
        }
        const exports3 = await runOneModule({ source, key, moduleGlobals, reexports, importMap: normalizedImportMap });
        installSimulationOptimizations(exports3, key);
        if (typeof process !== "undefined" && process.env.MERKAVA_TRACE_MODULES === "1") console.error("[MerkavaModule:done]", JSON.stringify({ key, exports: Object.keys(exports3 || {}) }));
        Object.assign(liveExports, exports3);
        return liveExports;
      }
      const exports2 = await load(entry, "/");
      return { ok: true, entry, exports: exports2, files: allFiles, modules: Object.fromEntries(cache.entries()) };
    }
    function installSimulationOptimizations(exports2, key = "") {
      if (!exports2 || typeof exports2 !== "object") return;
      installMerkavaGameOptimizations(exports2, key);
      if (!/three\.module\.js$/i.test(String(key || ""))) return;
      if (exports2.__merkavaThreeOptimized) return;
      const OriginalRenderer = exports2.WebGLRenderer;
      class MerkavaLightWebGLRenderer {
        constructor(parameters = {}) {
          this.parameters = parameters;
          this.domElement = parameters.canvas || createMerkavaCanvas(parameters);
          this.canvas = this.domElement;
          this.context = parameters.context || this.domElement.getContext?.("webgl2") || this.domElement.getContext?.("webgl") || null;
          this.shadowMap = { enabled: false, type: null, autoUpdate: true, needsUpdate: false };
          this.xr = { enabled: false, isPresenting: false, setAnimationLoop: (fn) => {
            this.__animationLoop = fn || null;
          } };
          this.info = { render: { frame: 0, calls: 0, triangles: 0, points: 0, lines: 0 }, memory: { geometries: 0, textures: 0 }, programs: [] };
          this.capabilities = { isWebGL2: true, maxTextures: 16, maxVertexTextures: 16, precision: "highp", logarithmicDepthBuffer: false };
          this.extensions = { get: () => ({}) };
          this.properties = { get: (object) => object.__merkavaProps || (object.__merkavaProps = {}), remove: (object) => {
            if (object) delete object.__merkavaProps;
          } };
          this.outputColorSpace = exports2.SRGBColorSpace || "srgb";
          this.toneMapping = exports2.NoToneMapping || 0;
          this.toneMappingExposure = 1;
          this.autoClear = true;
        }
        getContext() {
          return this.context;
        }
        getContextAttributes() {
          return this.context?.getContextAttributes?.() || {};
        }
        setSize(width, height) {
          this.width = width;
          this.height = height;
          if (this.domElement) {
            this.domElement.width = width;
            this.domElement.height = height;
            this.domElement.style = this.domElement.style || {};
            this.domElement.style.width = width + "px";
            this.domElement.style.height = height + "px";
          }
        }
        getSize(target = null) {
          const out = target || { width: 0, height: 0, set(x, y) {
            this.width = x;
            this.height = y;
            return this;
          } };
          return out.set ? out.set(this.width || this.domElement?.width || 0, this.height || this.domElement?.height || 0) : Object.assign(out, { width: this.width || 0, height: this.height || 0 });
        }
        setPixelRatio(value) {
          this.pixelRatio = value;
        }
        getPixelRatio() {
          return this.pixelRatio || 1;
        }
        setClearColor(color, alpha = 1) {
          this.clearColor = color;
          this.clearAlpha = alpha;
        }
        getClearColor(target = null) {
          if (target && typeof target.set === "function") return target.set(this.clearColor || 0);
          return this.clearColor || 0;
        }
        setClearAlpha(alpha) {
          this.clearAlpha = alpha;
        }
        getClearAlpha() {
          return this.clearAlpha ?? 1;
        }
        clear() {
          this.context?.record?.("three.clear", {});
        }
        clearColor() {
          this.clear();
        }
        clearDepth() {
          this.clear();
        }
        clearStencil() {
          this.clear();
        }
        setRenderTarget(target, activeCubeFace = 0, activeMipmapLevel = 0) {
          this.renderTarget = target || null;
          this.activeCubeFace = activeCubeFace;
          this.activeMipmapLevel = activeMipmapLevel;
          this.context?.record?.("three.setRenderTarget", { target: target?.uuid || target?.id || null, activeCubeFace, activeMipmapLevel });
        }
        getRenderTarget() {
          return this.renderTarget || null;
        }
        readRenderTargetPixels(target, x, y, width, height, buffer) {
          if (buffer && typeof buffer.fill === "function") buffer.fill(0);
          this.context?.record?.("three.readRenderTargetPixels", { target: target?.uuid || target?.id || null, x, y, width, height, bytes: buffer?.length || 0 });
        }
        readRenderTargetPixelsAsync(target, x, y, width, height, buffer) {
          this.readRenderTargetPixels(target, x, y, width, height, buffer);
          return Promise.resolve(buffer);
        }
        setScissor() {
        }
        setScissorTest(value) {
          this.scissorTest = !!value;
        }
        setViewport() {
        }
        render(scene, camera) {
          this.info.render.frame++;
          this.info.render.calls++;
          this.__merkavaLastRender = { sceneType: scene?.type || scene?.constructor?.name || null, cameraType: camera?.type || camera?.constructor?.name || null };
          this.context?.record?.("three.render.lightweight", this.__merkavaLastRender);
          if (this.domElement) this.domElement.__merkavaLastRender = this.__merkavaLastRender;
        }
        setAnimationLoop(fn) {
          this.__animationLoop = fn || null;
        }
        dispose() {
          this.disposed = true;
        }
        forceContextLoss() {
          this.contextLost = true;
        }
        forceContextRestore() {
          this.contextLost = false;
        }
      }
      MerkavaLightWebGLRenderer.__merkavaOriginalRenderer = OriginalRenderer;
      exports2.WebGLRenderer = MerkavaLightWebGLRenderer;
      exports2.__merkavaThreeOptimized = true;
    }
    function installMerkavaGameOptimizations(exports2, key = "") {
      if (!/games\/Merkava\/Atzilus\.js$/i.test(String(key || ""))) return;
      const atzilut = exports2.ATZILUT;
      if (!atzilut || !atzilut.archetypes || atzilut.__merkavaPoolCapped) return;
      for (const archetype of Object.values(atzilut.archetypes)) {
        if (!archetype || typeof archetype.poolSize !== "number") continue;
        if (archetype.isSingleton) archetype.poolSize = Math.min(archetype.poolSize, 1);
        else archetype.poolSize = Math.min(archetype.poolSize, 8);
      }
      atzilut.__merkavaPoolCapped = true;
    }
    function createMerkavaCanvas(parameters = {}) {
      const document = parameters.document || globalThis.document || globalThis.window?.document;
      if (document?.createElement) return document.createElement("canvas");
      return { width: 0, height: 0, style: {}, ownerDocument: globalThis.document || null, getRootNode() {
        return this.ownerDocument || this;
      }, getContext() {
        return null;
      }, addEventListener() {
      }, removeEventListener() {
      }, dispatchEvent() {
        return true;
      } };
    }
    function syntheticMissingModuleExports(resolvedFile = "", globals = {}) {
      const key = String(resolvedFile || "");
      if (/nodes\/Nodes\.js$/i.test(key)) return syntheticThreeNodes();
      if (/capabilities\/WebGPU\.js$/i.test(key)) return { default: availabilityShim("WebGPU") };
      if (/capabilities\/WebGL\.js$/i.test(key)) return { default: { isWebGL2Available: () => true, getWebGL2ErrorMessage: () => messageElement(globals, "WebGL2 available in Merkava simulation") } };
      if (/gpu\/WebGPURenderer\.js$/i.test(key)) return { default: syntheticRendererClass(globals) };
      if (/renderers\/common\/StorageInstancedBufferAttribute\.js$/i.test(key)) return { default: syntheticStorageAttributeClass() };
      return null;
    }
    function syntheticThreeNodes() {
      const node = makeNodeValue();
      const fn = () => node;
      const tslFn = (callback) => (...args) => {
        try {
          if (typeof callback === "function") callback(...args);
        } catch (_) {
        }
        return node;
      };
      return {
        tslFn,
        texture: fn,
        uv: fn,
        uint: fn,
        positionWorld: node,
        modelWorldMatrix: node,
        cameraViewMatrix: node,
        timerLocal: fn,
        timerDelta: fn,
        cameraProjectionMatrix: node,
        vec2: fn,
        instanceIndex: node,
        positionGeometry: node,
        storage: () => node,
        MeshBasicNodeMaterial: class MeshBasicNodeMaterial {
          constructor(options = {}) {
            Object.assign(this, options);
            this.type = "MeshBasicNodeMaterial";
          }
        },
        If: (_condition, branch) => {
          try {
            if (typeof branch === "function") branch();
          } catch (_) {
          }
          return node;
        }
      };
    }
    function makeNodeValue() {
      const target = function nodeValue() {
        return proxy;
      };
      const proxy = new Proxy(target, {
        get(_target, prop) {
          if (prop === Symbol.toPrimitive) return () => 0;
          if (prop === "valueOf") return () => 0;
          if (prop === "toString") return () => "0";
          if (prop === "compute") return () => proxy;
          if (prop === "element") return () => proxy;
          if (prop === "toAttribute") return () => proxy;
          return proxy;
        },
        set() {
          return true;
        },
        apply() {
          return proxy;
        }
      });
      return proxy;
    }
    function availabilityShim(name) {
      return { isAvailable: () => true, getErrorMessage: () => messageElement({}, name + " available in Merkava simulation") };
    }
    function messageElement(globals, text) {
      const doc = globals?.document || globals?.window?.document;
      if (doc?.createElement) {
        const el = doc.createElement("div");
        el.textContent = text;
        return el;
      }
      return { textContent: text };
    }
    function syntheticRendererClass(globals) {
      return class WebGPURenderer {
        constructor(options = {}) {
          this.options = options;
          this.domElement = globals?.document?.createElement?.("canvas") || { style: {} };
          this.shadowMap = {};
        }
        setSize(width, height) {
          this.width = width;
          this.height = height;
        }
        setPixelRatio(value) {
          this.pixelRatio = value;
        }
        render() {
        }
        renderAsync() {
          return Promise.resolve();
        }
        compute() {
          return Promise.resolve();
        }
        computeAsync() {
          return Promise.resolve();
        }
        setAnimationLoop(fn) {
          this.animationLoop = fn;
        }
      };
    }
    function syntheticStorageAttributeClass() {
      return class StorageInstancedBufferAttribute {
        constructor(count = 0, itemSize = 3) {
          this.count = count;
          this.itemSize = itemSize;
          this.array = new Float32Array(Math.max(0, count * itemSize));
        }
        setUsage(value) {
          this.usage = value;
          return this;
        }
      };
    }
    function makeModuleGlobals(globals, runtimeGlobals, runtime) {
      const out = runtime === "node" ? { ...runtimeGlobals, ...globals } : Object.assign(Object.create(globals || null), globals || {});
      if (runtime !== "node" && typeof out.animate !== "function") out.animate = function merkavaEarlyAnimationNoop() {
      };
      return out;
    }
    async function runOneModule({ source, key, moduleGlobals, reexports, importMap }) {
      const preparedSource = prepareSimulationSource(source, key, moduleGlobals);
      const { code, exportNames, exportAliases, defaultName } = stripExports(preparedSource, key, importMap);
      return runNativeAsyncModule({ code, key, moduleGlobals, reexports, exportNames, exportAliases, defaultName });
    }
    function prepareSimulationSource(source, key = "", moduleGlobals = {}) {
      let text = String(source || "");
      if (/games\/Merkava\/__merkava_inline_module_/i.test(String(key || ""))) {
        text = text.replace(/ASSIAH\.init\(ATZILUT,\s*BERIAH,\s*YETZIRAH\);/g, "window.ASSIAH = ASSIAH; window.__merkavaSkippedHeavyInit = true;");
        moduleGlobals.__merkavaSkippedHeavyInit = true;
      }
      return text;
    }
    async function runNativeAsyncModule({ code, key, moduleGlobals, reexports, exportNames, exportAliases, defaultName }) {
      try {
        const captureNames = [.../* @__PURE__ */ new Set([...exportNames, ...exportAliases.map((item) => item.local)])];
        const exportTrailer = captureNames.map((name) => `try { globals[${JSON.stringify(name)}] = ${name}; } catch (_) {}`).join("\n");
        await AsyncFunction("globals", `with(globals){
${namedPrelude(moduleGlobals)}
${code}
${exportTrailer}
}`)(moduleGlobals);
        return collectExports(moduleGlobals, reexports, exportNames, exportAliases, defaultName);
      } catch (error) {
        const wrapped = new Error(`VM module failed: ${key}: ${error.message}`);
        wrapped.code = "MERKAVA_VM_MODULE_FAILED";
        wrapped.moduleKey = key;
        wrapped.cause = error;
        wrapped.trace = [];
        throw wrapped;
      }
    }
    function destructuredExportNames(body = "") {
      return String(body).split(",").map((part) => {
        const trimmed = part.trim();
        if (!trimmed || trimmed.includes("...")) return "";
        const alias = trimmed.split(/\s*:\s*/).pop().trim();
        const clean = alias.split(/\s*=\s*/)[0].trim();
        return /^[A-Za-z_$][\w$]*$/.test(clean) ? clean : "";
      }).filter(Boolean);
    }
    function namedPrelude(scope) {
      const names = [];
      for (const name of Object.keys(scope || {})) if (/^[A-Za-z_$][\w$]*$/.test(name) && !reserved.has(name)) names.push(`var ${name}=globals[${JSON.stringify(name)}];`);
      return names.join("\n");
    }
    var reserved = /* @__PURE__ */ new Set(["arguments", "await", "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "export", "extends", "finally", "for", "function", "if", "import", "in", "instanceof", "let", "new", "return", "super", "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with", "yield"]);
    function collectExports(scope, reexports, exportNames, exportAliases = [], defaultName) {
      const exports2 = Object.assign({}, ...reexports);
      for (const name of exportNames) exports2[name] = scope[name];
      for (const item of exportAliases) exports2[item.exported] = scope[item.local];
      if (defaultName || scope.default !== void 0) exports2.default = defaultName ? scope[defaultName] : scope.default;
      return exports2;
    }
    module.exports = {
      executeVmFiles,
      normalizeFiles,
      parseImports,
      stripExports,
      rewriteDynamicImport,
      resolveSpecifier,
      canonicalModulePath,
      moduleAliases,
      createVirtualNodeGlobals,
      stripQuery,
      findExistingKey,
      normalizeImportMap,
      applyImportMap
    };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAssembler.js
var require_RuntimeAssembler = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAssembler.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory(require_RuntimeGraph(), require_ImportResolver(), require_HTMLAssembler(), require_CSSAssembler(), require_ModuleExecutor(), require_SyntheticBrowserRuntime(), require_VirtualNodeRuntime(), require_DOMHydrator(), require_MerkavaVmFileExecutor());
      else {
        root.Merkava = root.Merkava || {};
        root.Merkava.RuntimeAssembler = factory(root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava.DOMHydrator || root.Merkava, root.Merkava).RuntimeAssembler;
      }
    })(typeof self !== "undefined" ? self : exports, function(graphMod, resolverMod, htmlMod, cssMod, moduleMod, browserMod, nodeMod, domHydratorMod, vmFileMod) {
      const RuntimeGraph = graphMod.RuntimeGraph, ImportResolver = resolverMod.ImportResolver;
      const HTMLAssembler = htmlMod.HTMLAssembler, CSSAssembler = cssMod.CSSAssembler, ModuleExecutor = moduleMod.ModuleExecutor;
      const SyntheticBrowserRuntime = browserMod.SyntheticBrowserRuntime, VirtualNodeRuntime = nodeMod.VirtualNodeRuntime;
      const hydrateHTML = domHydratorMod.hydrateHTML || (() => ({ ok: false, count: 0 }));
      const executeVmFiles = vmFileMod.executeVmFiles;
      const AsyncFunction = Object.getPrototypeOf(async function() {
      }).constructor;
      class RuntimeAssembler {
        constructor(options = {}) {
          this.options = options;
          this.files = options.files || {};
          this.graph = new RuntimeGraph();
        }
        assemble(entry = this.options.entry || "index.js") {
          this.graph.node("runtime", { kind: this.options.runtime || "browser", entry });
          const resolver = new ImportResolver({ files: this.files, graph: this.graph, origin: this.options.origin, base: entry });
          const moduleGraph = resolver.graphFrom(entry);
          const html = entry.endsWith(".html") ? new HTMLAssembler({ files: this.files, graph: this.graph, origin: this.options.origin, base: entry }).assemble(entry) : null;
          const css = html ? html.styles.map((s) => new CSSAssembler({ files: this.files, graph: this.graph, origin: this.options.origin, base: s.href }).assemble(s.href)) : [];
          return { graph: this.graph.toJSON(), moduleGraph, html, css };
        }
        async run(entry = this.options.entry || "index.js") {
          const assembly = this.assemble(entry);
          const runtime = this.options.runtime === "node" ? new VirtualNodeRuntime({ files: this.files, env: this.options.env || {} }) : new SyntheticBrowserRuntime({ files: this.files, graph: this.graph, url: this.options.url || this.options.origin });
          const globals = runtime.globals ? runtime.globals() : {};
          runtime.__merkavaGlobals = globals;
          installProbeCapture(globals, runtime);
          installDynamicImport(globals, runtime, this.graph, this.options, this.files);
          let result;
          if (entry.endsWith(".html")) result = await this.runHTML(assembly.html, runtime, globals);
          else if (this.options.module || /\bimport\s|\bexport\s|\brequire\s*\(/.test(this.files[entry] || "")) {
            result = await runtime.executeFunction(() => runModuleFile({ files: this.files, entry, globals, runtime: this.options.runtime, graph: this.graph, importMap: this.options.importMap || {} }));
          } else {
            result = await runtime.executeFunction(this.options.execute || makeExecutor(this.files[entry] || "", this.options.runtime));
          }
          await settleMerkavaTasks(runtime, this.options.waitMs === void 0 ? 75 : Number(this.options.waitMs || 0));
          const snapshot = runtime.snapshot ? runtime.snapshot() : result.snapshot;
          if (runtime.window && typeof runtime.window.clearAllTimers === "function") runtime.window.freezeTimers ? runtime.window.freezeTimers() : runtime.window.freezeTimers ? runtime.window.freezeTimers() : runtime.window.clearAllTimers();
          if (snapshot && result) result.snapshot = snapshot;
          return { ok: result.ok && !(runtime.errors || []).length, assembly, result, runtime, graph: this.graph.toJSON(), console: snapshot?.window?.console || result.snapshot?.logs || [] };
        }
        async runHTML(html, runtime, globals) {
          const importMap = htmlImportMap(html);
          hydrateHTML(runtime.window?.document, this.files[html.entry] || "");
          syncNamedElements(globals, runtime.window?.document);
          let last = null;
          let inlineModuleIndex = 0;
          for (const step of html.executionPlan) {
            runtime.__merkavaCurrentStep = { type: step.type || "classic", inline: !!step.inline, resolved: step.resolved || null };
            if (typeof process !== "undefined" && process.env.MERKAVA_TRACE_STEPS === "1") console.error("[MerkavaStep:start]", JSON.stringify(runtime.__merkavaCurrentStep));
            if (runtime.window) runtime.window.__merkavaCurrentStep = runtime.__merkavaCurrentStep;
            syncNamedElements(globals, runtime.window?.document);
            const code = step.inline ? step.code : this.files[step.resolved] || "";
            if (step.type === "module" || looksLikeModuleSource(code)) {
              if (step.inline) {
                const inlineEntry = inlineModuleKey(html.entry, ++inlineModuleIndex);
                const moduleFiles = { ...this.files, [inlineEntry]: code };
                last = await runtime.executeFunction(() => runModuleFile({ files: moduleFiles, entry: inlineEntry, globals, runtime: this.options.runtime || "browser", graph: this.graph, importMap }));
              } else {
                last = await runtime.executeFunction(() => runModuleFile({ files: this.files, entry: step.resolved, globals, runtime: this.options.runtime || "browser", graph: this.graph, importMap }));
              }
            } else {
              last = await runtime.executeFunction(makeExecutor(code, "browser"));
            }
            installClassicModuleGlobals(step, last, globals, runtime);
            if (!last.ok) return last;
            if (runtime.window && typeof runtime.window.clearAllTimers === "function") runtime.window.clearAllTimers();
            runtime.__merkavaLastCompletedStep = runtime.__merkavaCurrentStep;
            if (typeof process !== "undefined" && process.env.MERKAVA_TRACE_STEPS === "1") console.error("[MerkavaStep:done]", JSON.stringify(runtime.__merkavaLastCompletedStep));
            if (runtime.window) runtime.window.__merkavaLastCompletedStep = runtime.__merkavaLastCompletedStep;
          }
          runtime.__merkavaCurrentStep = { type: "lifecycle", inline: false, resolved: null };
          if (runtime.window) runtime.window.__merkavaCurrentStep = runtime.__merkavaCurrentStep;
          const lifecycleWaitMs = this.options.waitMs === void 0 ? 75 : Number(this.options.waitMs || 0);
          const lifecycle = await dispatchBrowserLifecycle(runtime, lifecycleWaitMs);
          return lifecycle || last || await runtime.executeFunction(async () => null);
        }
      }
      function htmlImportMap(html) {
        const imports = {};
        const scopes = {};
        for (const item of html?.importMaps || []) {
          Object.assign(imports, item.parsed?.imports || {});
          Object.assign(scopes, item.parsed?.scopes || {});
        }
        return { imports, scopes };
      }
      function htmlImportMap(html) {
        const imports = {};
        const scopes = {};
        for (const item of html?.importMaps || []) {
          Object.assign(imports, item.parsed?.imports || {});
          Object.assign(scopes, item.parsed?.scopes || {});
        }
        return { imports, scopes };
      }
      function looksLikeModuleSource(code) {
        return /\bimport\s+(?!\()|\bexport\s+/.test(String(code || ""));
      }
      function inlineModuleKey(htmlEntry, index) {
        const clean = String(htmlEntry || "index.html").replace(/\\/g, "/");
        const slash = clean.lastIndexOf("/");
        const dir = slash >= 0 ? clean.slice(0, slash + 1) : "";
        return `${dir}__merkava_inline_module_${index}.js`;
      }
      function installClassicModuleGlobals(step, last, globals, runtime) {
        if (!step || step.type !== "classic") return;
        const exports2 = last?.exports || last?.value?.exports || last?.result?.exports || {};
        const src = String(step.src || step.attrs?.src || step.resolved || "");
        const win = runtime.window || globals.window || globals;
        if (/three\.module\.js|three\.js@[^/]+\/build\/three\.js/i.test(src) || /three\.module\.js/i.test(String(step.resolved || ""))) {
          globals.THREE = exports2;
          if (win) win.THREE = exports2;
          return;
        }
        const three = globals.THREE || win?.THREE;
        if (!three) return;
        if (/GLTFLoader\.js/i.test(src)) exports2.GLTFLoader = makeSyntheticGLTFLoader(three);
        if (/RGBELoader\.js/i.test(src) && !exports2.RGBELoader) exports2.RGBELoader = makeSyntheticRGBELoader(three);
        const installers = {
          OrbitControls: (value) => {
            three.OrbitControls = value;
            win.OrbitControls = value;
            globals.OrbitControls = value;
          },
          GLTFLoader: (value) => {
            three.GLTFLoader = value;
            win.GLTFLoader = value;
            globals.GLTFLoader = value;
          },
          RGBELoader: (value) => {
            three.RGBELoader = value;
            win.RGBELoader = value;
            globals.RGBELoader = value;
          }
        };
        for (const [name, install] of Object.entries(installers)) if (exports2[name]) install(exports2[name]);
      }
      function makeSyntheticGLTFLoader(three) {
        return class GLTFLoader {
          setPath(value) {
            this.path = value;
            return this;
          }
          setResourcePath(value) {
            this.resourcePath = value;
            return this;
          }
          load(url, onLoad, _onProgress, onError) {
            const gltf = syntheticGltf(three, url);
            setTimeout(() => {
              try {
                if (typeof onLoad === "function") onLoad(gltf);
              } catch (error) {
                if (typeof onError === "function") onError(error);
              }
            }, 0);
            return gltf;
          }
          loadAsync(url) {
            return Promise.resolve(syntheticGltf(three, url));
          }
        };
      }
      function syntheticGltf(three, url) {
        const geometry = new (three.BoxGeometry || three.BufferGeometry || class {
          clone() {
            return this;
          }
        })(1, 1, 1);
        if (typeof geometry.clone !== "function") geometry.clone = () => geometry;
        const material = new (three.MeshBasicMaterial || three.MeshStandardMaterial || class {
        })({ color: 8956501 });
        const mesh = new (three.Mesh || three.Object3D || class {
          constructor() {
            this.children = [];
            this.position = { set() {
            } };
            this.scale = { setScalar() {
            } };
          }
        })(geometry, material);
        const scene = new (three.Group || three.Object3D || class {
          constructor() {
            this.children = [];
          }
          add(x) {
            this.children.push(x);
          }
        })();
        scene.name = String(url || "synthetic-gltf");
        if (typeof scene.add === "function") scene.add(mesh);
        else scene.children = [mesh];
        return { scene, scenes: [scene], animations: [], asset: { generator: "MerkavaSyntheticGLTF" } };
      }
      function makeSyntheticRGBELoader(three) {
        return class RGBELoader {
          setDataType(value) {
            this.dataType = value;
            return this;
          }
          setPath(value) {
            this.path = value;
            return this;
          }
          load(url, onLoad) {
            const texture = new (three.DataTexture || three.Texture || class {
            })(new Float32Array([1, 1, 1, 1]), 1, 1);
            texture.name = String(url || "synthetic-rgbe");
            if (typeof onLoad === "function") setTimeout(() => onLoad(texture), 0);
            return texture;
          }
          loadAsync(url) {
            return Promise.resolve(this.load(url));
          }
        };
      }
      function syncNamedElements(globals, document) {
        if (!globals || !document?.documentElement) return;
        const nodes = document.documentElement.querySelectorAll("[id]");
        for (const node of nodes) {
          const id = node.id;
          if (!id || !isIdentifier(id)) continue;
          if (globals[id] === void 0) globals[id] = node;
          if (globals.window && globals.window[id] === void 0) globals.window[id] = node;
        }
      }
      function isIdentifier(value) {
        return /^[A-Za-z_$][\w$]*$/.test(String(value || ""));
      }
      function recordRuntimeError(runtime, error, phase, extra = {}) {
        const row = { message: error?.message || String(error), stack: error?.stack || "", code: error?.code || null, trace: error?.trace || null, phase, ...extra };
        runtime.errors = runtime.errors || [];
        runtime.errors.push(row);
        if (runtime.window) {
          runtime.window.__AWTSMOOS_CAPTURED_ERRORS__ = runtime.window.__AWTSMOOS_CAPTURED_ERRORS__ || [];
          runtime.window.__AWTSMOOS_CAPTURED_ERRORS__.push(row);
        }
        return row;
      }
      async function settleMerkavaTasks(runtime, waitMs) {
        const ms = Number(waitMs || 0);
        if (ms <= 0) return;
        await new Promise((resolve) => setTimeout(resolve, Math.min(ms, 1200)));
      }
      function installProbeCapture(globals, runtime) {
        const capture = (label, value) => runtime.window?.probe?.capture ? runtime.window.probe.capture(label, value) : runtime.probe?.capture ? runtime.probe.capture(label, value) : value;
        globals.__merkavaProbeCapture = capture;
        if (globals.window) globals.window.__merkavaProbeCapture = capture;
      }
      function installDynamicImport(globals, runtime, graph, options, seedFiles) {
        const loader = createDynamicModuleLoader({ globals, runtime, graph, options, seedFiles });
        globals.__merkavaDynamicImport = loader;
        if (globals.window) globals.window.__merkavaDynamicImport = loader;
      }
      function createDynamicModuleLoader({ globals, runtime, graph, options, seedFiles }) {
        const cache = /* @__PURE__ */ new Map();
        const pageUrl = safeUrl(options.url || runtime.window?.location?.href || options.origin || "http://localhost/");
        return (specifier) => {
          const spec = String(specifier || "");
          const href = safeUrl(spec, pageUrl.href)?.href || spec;
          graph?.event?.("module.dynamicImport", { specifier: spec, href });
          const promise = (async () => {
            if (!href) throw new Error("Dynamic import received an empty module specifier.");
            if (cache.has(href)) return cache.get(href);
            const env = await collectDynamicModuleEnv(href, pageUrl, seedFiles, graph, options);
            const result = await runModuleFile({ files: env.files, entry: env.entry, globals, runtime: "browser", graph });
            if (result?.exports) cache.set(href, result.exports);
            return result?.exports || {};
          })();
          return makeSafeThenable(promise, runtime, href);
        };
      }
      function makeSafeThenable(promise, runtime, href) {
        const safe = promise.catch((error) => {
          recordRuntimeError(runtime, error, "dynamicImport", { href });
          return {};
        });
        safe.then = function(onFulfilled, onRejected) {
          const chained = promise.then((value) => {
            try {
              return typeof onFulfilled === "function" ? onFulfilled(value) : value;
            } catch (error) {
              recordRuntimeError(runtime, error, "dynamicImport.then", { href });
              return {};
            }
          }, (error) => {
            recordRuntimeError(runtime, error, "dynamicImport.reject", { href });
            try {
              return typeof onRejected === "function" ? onRejected(error) : {};
            } catch (inner) {
              recordRuntimeError(runtime, inner, "dynamicImport.catch", { href });
              return {};
            }
          });
          return makeSafeThenable(chained, runtime, href);
        };
        safe.catch = function(onRejected) {
          return safe.then(void 0, onRejected);
        };
        return safe;
      }
      async function collectDynamicModuleEnv(href, pageUrl, seedFiles, graph, options) {
        const files = { ...seedFiles || {} };
        const queue = [{ href, key: keyForUrl(safeUrl(href), pageUrl) }];
        const seen = /* @__PURE__ */ new Set();
        const maxFiles = Number(options.maxDynamicFiles || options.maxFiles || 80);
        while (queue.length && seen.size < maxFiles) {
          const job = queue.shift();
          if (!job?.href || seen.has(job.href)) continue;
          seen.add(job.href);
          const got = files[job.key] ?? files["/" + job.key.replace(/^\//, "")] ?? files["./" + job.key.replace(/^\//, "")] ?? await fetchText2(job.href, pageUrl);
          files[job.key] = got;
          files["/" + job.key.replace(/^\//, "")] = got;
          graph?.event?.("module.dynamicImport.fetch", { href: job.href, key: job.key });
          for (const ref of staticModuleRefs(got)) {
            const next = safeUrl(ref, job.href);
            if (!next || pageUrl && next.origin !== pageUrl.origin) continue;
            const key = keyForUrl(next, pageUrl);
            if (!seen.has(next.href) && files[key] === void 0) queue.push({ href: next.href, key });
          }
        }
        return { entry: keyForUrl(safeUrl(href), pageUrl), files };
      }
      async function fetchText2(href, pageUrl = null) {
        const candidates = [href];
        try {
          const url = new URL(href);
          if (pageUrl && url.pathname.startsWith("/") && !url.pathname.startsWith(pageUrl.pathname.replace(/\/[^/]*$/, "/"))) candidates.push(new URL(url.pathname.replace(/^\//, ""), pageUrl.href).href);
        } catch (_) {
        }
        let lastStatus = 0;
        for (const candidate of [...new Set(candidates)]) {
          const response = await fetch(candidate, { headers: { accept: "text/javascript,*/*" } }).catch(() => null);
          if (response?.ok) return await response.text();
          lastStatus = response?.status || 0;
        }
        throw new Error(`Dynamic module fetch failed: ${href} (${lastStatus})`);
      }
      function staticModuleRefs(source) {
        const refs = [];
        for (const match of String(source || "").matchAll(/import\s+(?!\()[^'";]*?(?:from\s+)?["']([^"']+)["']/g)) refs.push(match[1]);
        for (const match of String(source || "").matchAll(/export\s+[^"']*?\s+from\s+["']([^"']+)["']/g)) refs.push(match[1]);
        return refs;
      }
      function keyForUrl(url, pageUrl) {
        const pageDir = pageUrl ? pageUrl.pathname.replace(/\/[^/]*$/, "/") : "/";
        const pathname = decodeURIComponent(url.pathname || "").replace(/^\/+/, "");
        const base = pageDir.replace(/^\/+/, "");
        return pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
      }
      function safeUrl(spec, base) {
        try {
          return new URL(spec, base);
        } catch (_) {
          return null;
        }
      }
      async function dispatchBrowserLifecycle(runtime, waitMs) {
        if (!runtime.window || !runtime.window.document) return null;
        const lifecycleResult = await runtime.executeFunction(async (globals) => {
          const win = globals.window;
          const doc = globals.document;
          const make = (type) => new globals.Event(type, { bubbles: false, cancelable: false });
          const fired = [];
          const safeDispatch = (target, event) => {
            try {
              target.dispatchEvent(event);
              fired.push(event.type);
            } catch (error) {
              const row = { message: error?.message || String(error), stack: error?.stack || "", phase: "lifecycle", type: event.type };
              if (!Array.isArray(win.__AWTSMOOS_CAPTURED_ERRORS__)) win.__AWTSMOOS_CAPTURED_ERRORS__ = [];
              const errors = Array.isArray(win.__AWTSMOOS_CAPTURED_ERRORS__) ? win.__AWTSMOOS_CAPTURED_ERRORS__ : [];
              errors.push(row);
              win.__AWTSMOOS_CAPTURED_ERRORS__ = errors;
            }
          };
          doc.readyState = "interactive";
          if (typeof process !== "undefined" && process.env.MERKAVA_TRACE_STEPS === "1") console.error("[MerkavaLifecycle:start]", "DOMContentLoaded");
          if (typeof process !== "undefined" && process.env.MERKAVA_TRACE_STEPS === "1") console.error("[MerkavaLifecycle:start]", "DOMContentLoaded");
          safeDispatch(doc, make("DOMContentLoaded"));
          if (typeof process !== "undefined" && process.env.MERKAVA_TRACE_STEPS === "1") console.error("[MerkavaLifecycle:done]", "DOMContentLoaded");
          if (typeof process !== "undefined" && process.env.MERKAVA_TRACE_STEPS === "1") console.error("[MerkavaLifecycle:done]", "DOMContentLoaded");
          doc.readyState = "complete";
          if (typeof process !== "undefined" && process.env.MERKAVA_TRACE_STEPS === "1") console.error("[MerkavaLifecycle:start]", "load");
          if (typeof process !== "undefined" && process.env.MERKAVA_TRACE_STEPS === "1") console.error("[MerkavaLifecycle:start]", "load");
          safeDispatch(win, make("load"));
          if (typeof process !== "undefined" && process.env.MERKAVA_TRACE_STEPS === "1") console.error("[MerkavaLifecycle:done]", "load");
          if (typeof process !== "undefined" && process.env.MERKAVA_TRACE_STEPS === "1") console.error("[MerkavaLifecycle:done]", "load");
          if (typeof process !== "undefined" && process.env.MERKAVA_TRACE_STEPS === "1") console.error("[MerkavaLifecycle:start]", "settle");
          const settleMs = Number(waitMs || 0);
          if (runtime?.window?.freezeTimers) runtime.window.freezeTimers();
          if (typeof process !== "undefined" && process.env.MERKAVA_TRACE_STEPS === "1") console.error("[MerkavaLifecycle:start]", "settle", settleMs);
          if (settleMs > 0) await new Promise((resolve) => setTimeout(resolve, settleMs));
          if (typeof process !== "undefined" && process.env.MERKAVA_TRACE_STEPS === "1") console.error("[MerkavaLifecycle:done]", "settle");
          if (typeof process !== "undefined" && process.env.MERKAVA_TRACE_STEPS === "1") console.error("[MerkavaLifecycle:done]", "settle");
          return { lifecycle: fired };
        });
        runtime.snapshot?.();
        return lifecycleResult;
      }
      function makeExecutor(source, runtime) {
        if (!source.trim()) return async () => null;
        if (runtime === "node") return async (api) => AsyncFunction("api", "with(api){" + source + "\n}")(api);
        return async (globals) => AsyncFunction("globals", "with(globals){\n" + lowerClassicScript(source) + "\n}")(globals);
      }
      function lowerClassicScript(source) {
        const raw = String(source || "");
        const names = collectClassicExportNames(raw);
        let code = capHeavyDemoConstants(raw);
        code = code.replace(/^\s*class\s+([A-Za-z_$][\w$]*)\s*/gm, "globals.$1 = class $1 ");
        code = code.replace(/^\s*(var|let|const)\s+([A-Za-z_$][\w$]*)\s*=/gm, "globals.$2 =");
        return code + classicExportTrailer(names);
      }
      function capHeavyDemoConstants(source) {
        return String(source || "").replace(/const\s+GRASS_COUNT\s*=\s*10000\s*;/g, "const GRASS_COUNT = 60;");
      }
      function collectClassicExportNames(source) {
        const names = /* @__PURE__ */ new Set();
        for (const match of String(source || "").matchAll(/^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm)) names.add(match[1]);
        for (const match of String(source || "").matchAll(/^\s*class\s+([A-Za-z_$][\w$]*)\b/gm)) names.add(match[1]);
        for (const match of String(source || "").matchAll(/^\s*(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=/gm)) names.add(match[1]);
        return [...names];
      }
      function classicExportTrailer(names) {
        if (!names.length) return "";
        const lines = names.map((name) => "  if (typeof " + name + " !== 'undefined') globals." + name + " = " + name + ";");
        return "\n;try {\n" + lines.join("\n") + "\n} catch (_) {}\n";
      }
      async function runModuleFile(options) {
        if (typeof executeVmFiles === "function") return executeVmFiles(options);
        return new ModuleExecutor(options).execute(options.entry);
      }
      return { RuntimeAssembler };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/UnifiedSimulation.js
var require_UnifiedSimulation = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/UnifiedSimulation.js"(exports, module) {
    var { RuntimeAssembler } = require_RuntimeAssembler();
    async function simulateFiles({ files = {}, entry = "index.js", runtime = "browser", globals = {}, env = {}, origin, url, module: module2 } = {}) {
      const normalizedFiles = normalizeFiles(files);
      const assembler = new RuntimeAssembler({
        files: normalizedFiles,
        entry,
        runtime,
        env,
        origin: origin || "http://merkava.local/",
        url: url || origin || "http://merkava.local/",
        module: module2,
        runtimeGlobals: globals
      });
      return assembler.run(entry);
    }
    function normalizeFiles(files = {}) {
      const out = { ...files };
      for (const [key, value] of Object.entries(files)) {
        const bare = key.replace(/^\.\//, "").replace(/^\//, "");
        if (!out[bare]) out[bare] = value;
        if (!out["/" + bare]) out["/" + bare] = value;
        if (!out["./" + bare]) out["./" + bare] = value;
      }
      return out;
    }
    async function simulateBrowser2(files, entry = "index.html", options = {}) {
      return simulateFiles({ ...options, files, entry, runtime: "browser" });
    }
    async function simulateNode(files, entry = "index.js", options = {}) {
      return simulateFiles({ ...options, files, entry, runtime: "node" });
    }
    async function simulateWorker(files, entry = "worker.js", options = {}) {
      const workerGlobals = {
        postMessage(value) {
          workerGlobals.__messages.push(value);
        },
        addEventListener(type, handler) {
          workerGlobals.__listeners[type] = handler;
        },
        dispatchMessage(data) {
          const handler = workerGlobals.__listeners.message;
          if (handler) handler({ data });
        },
        __messages: [],
        __listeners: {},
        ...options.globals || {}
      };
      const run = await simulateFiles({ ...options, files, entry, runtime: "browser", globals: workerGlobals });
      run.worker = workerGlobals;
      return run;
    }
    module.exports = { simulateFiles, simulateBrowser: simulateBrowser2, simulateNode, simulateWorker, normalizeFiles };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/jsPageRunner.js
var jsPageRunner_exports = {};
__export(jsPageRunner_exports, {
  VERSION: () => VERSION,
  runPageWithJs: () => runPageWithJs
});
import { fileURLToPath } from "url";
import path from "path";
function extractScriptSrcs(html, baseUrl) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  const re = /<script\b([^>]*)>/gi;
  let m;
  while (m = re.exec(html)) {
    const attrs = m[1] || "";
    const srcM = attrs.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    if (!srcM) continue;
    const src = srcM[1] ?? srcM[2] ?? srcM[3] ?? "";
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) continue;
    const typeM = attrs.match(/\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const type = (typeM?.[1] ?? typeM?.[2] ?? typeM?.[3] ?? "").toLowerCase();
    if (type.includes("json") || type.includes("importmap") || type.includes("template")) continue;
    let abs;
    try {
      abs = new URL(src, baseUrl).href;
    } catch {
      continue;
    }
    if (seen.has(abs)) continue;
    seen.add(abs);
    out.push(abs);
    if (out.length >= MAX_SCRIPTS) break;
  }
  return out;
}
async function fetchText(url, timeoutMs) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      headers: { "User-Agent": "Merkava/1.0 (page-runner)" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}
async function fetchAll(urls, timeoutMs) {
  const results = {};
  let i = 0;
  async function worker() {
    while (i < urls.length) {
      const url = urls[i++];
      try {
        results[url] = await fetchText(url, timeoutMs);
      } catch (e) {
        results[url] = null;
      }
    }
  }
  const workers = [];
  for (let k = 0; k < Math.min(FETCH_CONCURRENCY, urls.length); k++) workers.push(worker());
  await Promise.all(workers);
  return results;
}
function parseErrorLocation(stack, fallbackFile) {
  const s = String(stack || "");
  let file = fallbackFile || "<inline>";
  let line = 0;
  const anon = s.match(/<anonymous>:(\d+):(\d+)/);
  if (anon) line = parseInt(anon[1], 10) || 0;
  const urlMatch = s.match(/(https?:\/\/[^\s):"']+):(\d+):(\d+)/);
  if (urlMatch) {
    file = urlMatch[1];
    line = parseInt(urlMatch[2], 10) || line;
  }
  return { file, line };
}
function normalizeErrors(rawErrors) {
  const out = [];
  for (const e of rawErrors || []) {
    const message = String(e?.message || e || "").slice(0, 800);
    if (!message) continue;
    const stack = String(e?.stack || "").slice(0, 3e3);
    const { file, line } = parseErrorLocation(stack, e?.file);
    const nameM = message.match(/^([A-Za-z_$][\w$]*Error|[A-Za-z_$][\w$]*):/);
    out.push({
      kind: e?.phase || "runtime",
      name: nameM ? nameM[1] : e?.name || "Error",
      message,
      file,
      line,
      stack
    });
  }
  return out;
}
function normalizeConsole(raw) {
  const logs = raw?.logs || raw || [];
  return (Array.isArray(logs) ? logs : []).map((l) => ({
    level: String(l?.level || "log"),
    text: String(
      Array.isArray(l?.args) ? l.args.map((a) => typeof a === "string" ? a : JSON.stringify(a)).join(" ") : l?.text ?? ""
    ).slice(0, 2e3)
  }));
}
function serializeFinalDom(runtime) {
  try {
    const doc = runtime?.window?.document;
    if (!doc) return "";
    const ser = new VirtualHtmlSerializer();
    const root = doc.documentElement || doc;
    return "<!DOCTYPE html>\n" + ser.serialize(root);
  } catch {
    return "";
  }
}
async function runPageWithJs(opts = {}) {
  const t0 = Date.now();
  const waitMs = Math.min(Math.max(Number(opts.waitMs ?? DEFAULT_WAIT_MS), 0), 3e4);
  const fetchTimeoutMs = Math.min(Math.max(Number(opts.fetchTimeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS), 1e3), 6e4);
  const baseUrl = opts.url || "http://merkava.local/index.html";
  let html = opts.html || "";
  if (!html && opts.url) html = await fetchText(opts.url, fetchTimeoutMs);
  if (!html) throw new Error("runPageWithJs: need html or url");
  const srcs = extractScriptSrcs(html, baseUrl);
  const fetched = await fetchAll(srcs, fetchTimeoutMs);
  const files = { "index.html": html };
  let scriptsFetched = 0;
  for (const [url, code] of Object.entries(fetched)) {
    if (code == null) continue;
    files[url] = code;
    try {
      const u = new URL(url);
      const p = u.pathname + u.search;
      files[p] = code;
      files[u.pathname] = code;
    } catch {
    }
    scriptsFetched++;
  }
  let out;
  try {
    out = await simulateBrowser(files, "index.html", {
      waitMs,
      url: baseUrl,
      origin: (() => {
        try {
          return new URL(baseUrl).origin;
        } catch {
          return "http://merkava.local/";
        }
      })()
    });
  } catch (e) {
    return {
      ok: false,
      jsErrors: [{ kind: "harness", name: "EngineError", message: String(e && e.message || e).slice(0, 800), file: "<engine>", line: 0, stack: String(e && e.stack || "").slice(0, 2e3) }],
      consoleLogs: [],
      finalHtml: html,
      scriptsFetched,
      scriptsRun: 0,
      wallMs: Date.now() - t0,
      version: VERSION
    };
  }
  const runtimeErrors = out?.runtime?.errors || [];
  const jsErrors = normalizeErrors(runtimeErrors);
  const consoleLogs = normalizeConsole(out?.console);
  const finalHtml = serializeFinalDom(out?.runtime) || html;
  let scriptsRun = 0;
  try {
    scriptsRun = (out?.assembly?.html?.executionPlan || []).length;
  } catch {
  }
  return {
    ok: jsErrors.length === 0,
    jsErrors,
    consoleLogs,
    finalHtml,
    scriptsFetched,
    scriptsRun,
    wallMs: Date.now() - t0,
    version: VERSION
  };
}
var import_UnifiedSimulation, import_VirtualHtmlSerializer, simulateBrowser, VirtualHtmlSerializer, __here, VERSION, DEFAULT_WAIT_MS, DEFAULT_FETCH_TIMEOUT_MS, MAX_SCRIPTS, FETCH_CONCURRENCY;
var init_jsPageRunner = __esm({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/jsPageRunner.js"() {
    import_UnifiedSimulation = __toESM(require_UnifiedSimulation(), 1);
    import_VirtualHtmlSerializer = __toESM(require_VirtualHtmlSerializer(), 1);
    ({ simulateBrowser } = import_UnifiedSimulation.default);
    VirtualHtmlSerializer = import_VirtualHtmlSerializer.default?.VirtualHtmlSerializer || import_VirtualHtmlSerializer.default;
    __here = path.dirname(fileURLToPath(import.meta.url));
    VERSION = "1.0.0";
    DEFAULT_WAIT_MS = 2500;
    DEFAULT_FETCH_TIMEOUT_MS = 15e3;
    MAX_SCRIPTS = 60;
    FETCH_CONCURRENCY = 6;
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/merkavaBundleEntry.mjs
import { writeFileSync as writeFileSync3, readFileSync } from "fs";

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/verifySession.js
import { writeFileSync as writeFileSync2 } from "fs";

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/virtualPngRenderer.js
init_pngTools();

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/cascade.js
var import_CssRuleCompiler = __toESM(require_CssRuleCompiler(), 1);
var import_CssRuleParser = __toESM(require_CssRuleParser(), 1);
var import_CssSelectorList = __toESM(require_CssSelectorList(), 1);
var import_CssRuleIndex = __toESM(require_CssRuleIndex(), 1);
var import_CssSelectorMatcher = __toESM(require_CssSelectorMatcher(), 1);
var import_CssConditionEvaluator = __toESM(require_CssConditionEvaluator(), 1);
var import_CssSpecificity = __toESM(require_CssSpecificity(), 1);
var import_CssInheritedProperties = __toESM(require_CssInheritedProperties(), 1);
var { compileCssStyleSheet, declarationsFromObject } = import_CssRuleCompiler.default;
var { parseCssRules } = import_CssRuleParser.default;
var { splitSelectorList } = import_CssSelectorList.default;
var { buildCssRuleIndex, cssRuleCandidates, matchesIndexedCssRule } = import_CssRuleIndex.default;
var { elementKeys } = import_CssSelectorMatcher.default;
var { matchesMediaQuery, matchesSupportsCondition } = import_CssConditionEvaluator.default;
var { compareSpecificity } = import_CssSpecificity.default;
var { isInheritedCssProperty } = import_CssInheritedProperties.default;
var ruleIndexCache = /* @__PURE__ */ new WeakMap();
function getRuleIndex(rules) {
  let index = ruleIndexCache.get(rules);
  if (!index) {
    index = buildCssRuleIndex(rules);
    ruleIndexCache.set(rules, index);
  }
  return index;
}
function candidateRulesFor(index, node) {
  return cssRuleCandidates(index, node);
}
var ELEMENT_KEYS_CACHE = /* @__PURE__ */ new WeakMap();
function cachedElementKeys(node) {
  let k = ELEMENT_KEYS_CACHE.get(node);
  if (!k) {
    k = elementKeys(node);
    ELEMENT_KEYS_CACHE.set(node, k);
  }
  return k;
}
var INHERITED_SUBSET_CACHE = /* @__PURE__ */ new WeakMap();
function cachedInheritDefaults(parentStyle) {
  if (!parentStyle || typeof parentStyle !== "object") return inheritLayeredDefaults(parentStyle);
  let s = INHERITED_SUBSET_CACHE.get(parentStyle);
  if (!s) {
    s = inheritLayeredDefaults(parentStyle);
    INHERITED_SUBSET_CACHE.set(parentStyle, s);
  }
  return s;
}
var UA_SPREAD_CACHE = /* @__PURE__ */ new Map();
function cachedUaDefaults(node) {
  const tag = String(node && node.localName || "").toLowerCase();
  let d = UA_SPREAD_CACHE.get(tag);
  if (d === void 0) {
    const defs = UA_DEFAULT_STYLES[tag];
    d = defs ? { ...defs } : null;
    UA_SPREAD_CACHE.set(tag, d);
  }
  return d ? { ...d } : {};
}
function matchesIndexedRule(node, rule, index) {
  return matchesIndexedCssRule(node, rule, index, cachedElementKeys(node));
}
var UA_DEFAULT_STYLES = {
  h1: { "font-size": "32px", "font-weight": "bold", "margin-top": "21px", "margin-bottom": "21px" },
  h2: { "font-size": "24px", "font-weight": "bold", "margin-top": "20px", "margin-bottom": "20px" },
  h3: { "font-size": "19px", "font-weight": "bold", "margin-top": "19px", "margin-bottom": "19px" },
  h4: { "font-size": "16px", "font-weight": "bold", "margin-top": "21px", "margin-bottom": "21px" },
  h5: { "font-size": "13px", "font-weight": "bold", "margin-top": "22px", "margin-bottom": "22px" },
  h6: { "font-size": "11px", "font-weight": "bold", "margin-top": "26px", "margin-bottom": "26px" },
  p: { "margin-top": "16px", "margin-bottom": "16px" },
  ul: { "margin-top": "16px", "margin-bottom": "16px", "padding-left": "40px", "list-style-type": "disc" },
  ol: { "margin-top": "16px", "margin-bottom": "16px", "padding-left": "40px", "list-style-type": "decimal" },
  li: { "display": "list-item" },
  dl: { "margin-top": "16px", "margin-bottom": "16px" },
  dd: { "margin-left": "40px" },
  blockquote: { "margin-top": "16px", "margin-bottom": "16px", "margin-left": "40px", "margin-right": "40px" },
  figure: { "margin-top": "16px", "margin-bottom": "16px", "margin-left": "40px", "margin-right": "40px" },
  pre: { "font-family": "monospace", "white-space": "pre", "margin-top": "16px", "margin-bottom": "16px" },
  code: { "font-family": "monospace" },
  kbd: { "font-family": "monospace" },
  samp: { "font-family": "monospace" },
  b: { "font-weight": "bold" },
  strong: { "font-weight": "bold" },
  i: { "font-style": "italic" },
  em: { "font-style": "italic" },
  u: { "text-decoration": "underline" },
  s: { "text-decoration": "line-through" },
  small: { "font-size": "0.83em" },
  sub: { "font-size": "0.83em", "vertical-align": "sub" },
  sup: { "font-size": "0.83em", "vertical-align": "super" }
};
function compileStylesheet(cssText, environment = {}, orderStart = 0) {
  const clean = String(cssText || "").replace(/\/\*[\s\S]*?\*\//g, "");
  const compiled = compileCssStyleSheet(clean, environment, orderStart);
  const layerKeys = annotateLayerKeys(clean, environment, compiled.rules.length);
  return {
    rules: compiled.rules.map((rule, i) => {
      const declarations = expandDeclarations(rule.declarations);
      let hasRevertLayer = false;
      for (const d of declarations) {
        if (typeof d.value === "string" && d.value.trim().toLowerCase() === "revert-layer") {
          hasRevertLayer = true;
          break;
        }
      }
      return {
        ...rule,
        layerKey: layerKeys ? layerKeys[i] : null,
        declarations,
        hasRevertLayer
      };
    }),
    // B"H 2026-10-09: @container rules ride along for per-element
    // evaluation in applyCascade (domLayout.js).
    containerRules: compiled.containerRules || [],
    // B"H 2026-10-09: @property registrations (math-env-property batch).
    // Fix-forward: the registrar hasn't landed yet — keep the field without
    // crashing the cascade until it does.
    properties: typeof parsePropertyRegistrations === "function" ? parsePropertyRegistrations(compiled.atRules) : void 0,
    nextOrder: compiled.nextOrder
  };
}
function parseInlineStyle(styleAttr) {
  const text = String(styleAttr || "").trim();
  if (!text) return [];
  const compiled = compileCssStyleSheet(`x{${text}}`, {}, 0);
  const first = compiled.rules[0];
  return first ? expandDeclarations(first.declarations) : [];
}
function inlineDeclarationsFromObject(styleObj) {
  return expandDeclarations(declarationsFromObject(styleObj));
}
function computeElementStyle(node, rules, parentComputed = {}, propertyRegs = {}) {
  const inline = [
    ...inlineDeclarationsFromObject(node.style || {}),
    ...parseInlineStyle(node.attributes?.style || "")
  ];
  const computed = cascadeWithLayers(node, rules, parentComputed, inline);
  applyPropertyRegistrations(computed, parentComputed, propertyRegs);
  resolveVarsInPlace(computed, computed);
  evaluateEnvsInPlace(computed);
  expandResolvedShorthandsInPlace(computed);
  evaluateCalcsInPlace(computed);
  evaluateMathInPlace(computed);
  applyViewportDefaults(node, computed);
  return computed;
}
function applyViewportDefaults(node, computed) {
  if (node.localName !== "body") return;
  const hasBg = computed["background-color"] != null || computed.background != null;
  if (!hasBg) {
    computed["background-color"] = "#ffffff";
    if (computed.color == null) computed.color = "#1e293b";
  }
  if (computed.margin == null) computed.margin = "0";
}
function annotateLayerKeys(cleanCss, environment, ruleCount) {
  try {
    const keys = [];
    const roots = [];
    const stack = [];
    let anon = 0;
    const topNode = () => stack.length ? stack[stack.length - 1] : null;
    const declareLayer = (name) => {
      const parent = topNode();
      const sibs = parent ? parent.children : roots;
      let node = sibs.find((n2) => n2.name === name);
      if (!node) {
        node = { name, parent, children: [], childIndex: sibs.length };
        sibs.push(node);
      }
      return node;
    };
    const pathOf = (node) => {
      const path2 = [];
      for (let n2 = node; n2; n2 = n2.parent) path2.unshift(n2.childIndex);
      return path2;
    };
    const splitLayerNames = (prelude) => String(prelude || "").split(",").map((s) => s.trim()).filter(Boolean);
    const walk2 = (parsedRules) => {
      for (const rule of parsedRules) {
        if (rule.kind === "qualified") {
          const n2 = splitSelectorList(rule.prelude).length;
          const node = topNode();
          const key = node ? pathOf(node) : null;
          for (let i = 0; i < n2; i++) keys.push(key);
          continue;
        }
        if (rule.name === "layer") {
          const names = splitLayerNames(rule.prelude);
          const hasBlock = rule.block != null && String(rule.block).trim() !== "";
          if (!hasBlock) {
            for (const nm of names) declareLayer(nm);
            continue;
          }
          let node;
          if (!names.length) {
            node = declareLayer(`\0anon${anon++}`);
          } else {
            for (const nm of names) declareLayer(nm);
            node = declareLayer(names[names.length - 1]);
          }
          stack.push(node);
          walk2(parseCssRules(rule.block));
          stack.pop();
          continue;
        }
        if (rule.name === "media" && rule.block) {
          if (matchesMediaQuery(rule.prelude, environment)) walk2(parseCssRules(rule.block));
          continue;
        }
        if (rule.name === "supports" && rule.block) {
          if (matchesSupportsCondition(rule.prelude, environment)) walk2(parseCssRules(rule.block));
          continue;
        }
      }
    };
    walk2(parseCssRules(cleanCss));
    if (keys.length !== ruleCount) return null;
    return keys;
  } catch {
    return null;
  }
}
var ORIGIN_AUTHOR_NORMAL = 4;
var ORIGIN_INLINE_NORMAL = 5;
var ORIGIN_AUTHOR_IMPORTANT = 7;
var ORIGIN_INLINE_IMPORTANT = 8;
function compareLayerPaths(a, b, important) {
  const n2 = Math.min(a.length, b.length);
  for (let i = 0; i < n2; i++) {
    if (a[i] !== b[i]) return important ? b[i] - a[i] : a[i] - b[i];
  }
  return important ? b.length - a.length : a.length - b.length;
}
function compareCascadeCandidates(left, right) {
  if (left.originRank !== right.originRank) return left.originRank - right.originRank;
  const important = left.originRank >= ORIGIN_AUTHOR_IMPORTANT;
  const a = left.layerKey;
  const b = right.layerKey;
  if (a || b) {
    if (!a) return important ? -1 : 1;
    if (!b) return important ? 1 : -1;
    const lc = compareLayerPaths(a, b, important);
    if (lc) return lc;
  }
  if (left.specificity[0] !== right.specificity[0]) return left.specificity[0] - right.specificity[0];
  const sp = compareSpecificity(left.specificity.slice(1), right.specificity.slice(1));
  if (sp) return sp;
  return left.order - right.order;
}
function compareRulePriority(r1, r2) {
  const s1 = r1.specificity, s2 = r2.specificity;
  return s1[1] - s2[1] || s1[2] - s2[2] || s1[3] - s2[3] || r1.order - r2.order;
}
function cascadeFastPath(node, rules, parentStyle, inline, ruleIndex, candidates, out) {
  const matched = [];
  for (const rule of candidates) {
    if (!matchesIndexedRule(node, rule, ruleIndex)) continue;
    if (rule.layerKey) return false;
    if (rule.hasRevertLayer) return false;
    matched.push(rule);
  }
  matched.sort(compareRulePriority);
  const winners = /* @__PURE__ */ new Map();
  const importantWinners = /* @__PURE__ */ new Map();
  for (const rule of matched) {
    for (const declaration of rule.declarations) {
      (declaration.important ? importantWinners : winners).set(declaration.name, declaration);
    }
  }
  for (const declaration of inline || []) {
    if (String(declaration.value || "").trim().toLowerCase() === "revert-layer") return false;
    (declaration.important ? importantWinners : winners).set(declaration.name, declaration);
  }
  for (const [name, declaration] of winners) applyLayeredWinner(out, parentStyle, name, declaration.value);
  for (const [name, declaration] of importantWinners) applyLayeredWinner(out, parentStyle, name, declaration.value);
  return true;
}
function cascadeWithLayers(node, rules, parentStyle = {}, inline = []) {
  const winners = /* @__PURE__ */ new Map();
  const revertLayerWinners = /* @__PURE__ */ new Map();
  const consider = (map, declaration, specificity, order, layerKey, originRank) => {
    const current = map.get(declaration.name);
    const candidate = { declaration, specificity, order, layerKey, originRank };
    if (!current || compareCascadeCandidates(candidate, current) >= 0) map.set(declaration.name, candidate);
  };
  const feed = (declaration, specificity, order, layerKey, originRank) => {
    const map = String(declaration.value || "").trim().toLowerCase() === "revert-layer" ? revertLayerWinners : winners;
    consider(map, declaration, specificity, order, layerKey, originRank);
  };
  const ruleIndex = getRuleIndex(rules);
  const candidates = candidateRulesFor(ruleIndex, node);
  const out = { ...cachedUaDefaults(node), ...cachedInheritDefaults(parentStyle) };
  if (!process.env.MERKAVA_CASCADE_SLOW && cascadeFastPath(node, rules, parentStyle, inline, ruleIndex, candidates, out)) return out;
  for (const rule of candidates) {
    if (!matchesIndexedRule(node, rule, ruleIndex)) continue;
    const layerKey = rule.layerKey || null;
    for (const declaration of rule.declarations) {
      feed(
        declaration,
        rule.specificity,
        rule.order,
        layerKey,
        declaration.important ? ORIGIN_AUTHOR_IMPORTANT : ORIGIN_AUTHOR_NORMAL
      );
    }
  }
  for (const declaration of inline || []) {
    feed(
      declaration,
      [1, 0, 0, 0],
      Number.MAX_SAFE_INTEGER,
      null,
      declaration.important ? ORIGIN_INLINE_IMPORTANT : ORIGIN_INLINE_NORMAL
    );
  }
  for (const [name, winner] of winners) applyLayeredWinner(out, parentStyle, name, winner.declaration.value);
  for (const [name, rw] of revertLayerWinners) {
    const w = winners.get(name);
    if (w && isStrictlyLowerLayer(w, rw)) {
      applyLayeredWinner(out, parentStyle, name, w.declaration.value);
    } else {
      applyLayeredWinner(out, parentStyle, name, "unset");
    }
  }
  return out;
}
function isStrictlyLowerLayer(a, b) {
  if (a.originRank !== b.originRank) return false;
  const important = b.originRank >= ORIGIN_AUTHOR_IMPORTANT;
  const ak = a.layerKey;
  const bk = b.layerKey;
  if (!ak && !bk) return false;
  if (!important) {
    if (!ak) return false;
    if (!bk) return true;
    return compareLayerPaths(ak, bk, false) < 0;
  }
  if (!ak) return true;
  if (!bk) return false;
  return compareLayerPaths(ak, bk, true) < 0;
}
function inheritLayeredDefaults(parentStyle) {
  const out = /* @__PURE__ */ Object.create(null);
  for (const [name, value] of Object.entries(parentStyle || {})) {
    if (isInheritedCssProperty(name)) out[name] = value;
  }
  return out;
}
function applyLayeredWinner(out, parentStyle, name, value) {
  const normalized = String(value || "").trim();
  if (normalized === "inherit") {
    if (Object.prototype.hasOwnProperty.call(parentStyle, name)) out[name] = parentStyle[name];
    else delete out[name];
    return;
  }
  if (normalized === "unset") {
    if (isInheritedCssProperty(name) && Object.prototype.hasOwnProperty.call(parentStyle, name))
      out[name] = parentStyle[name];
    else delete out[name];
    return;
  }
  if (normalized === "initial" || normalized === "revert" || normalized === "revert-layer") {
    delete out[name];
    return;
  }
  out[name] = value;
}
function resolveVarsInPlace(computed, vars) {
  for (const name of Object.keys(computed)) {
    const value = computed[name];
    if (typeof value === "string" && value.includes("var(")) {
      computed[name] = resolveVarValue(value, vars, [], name.startsWith("--"));
    }
  }
}
var VAR_CYCLIC = "\0var-cyclic\0";
function resolveVarValue(value, vars, seen, forCustomProp = false) {
  const r = resolveVarInner(String(value), vars, seen);
  if (!r.cyclic) return r.value;
  return forCustomProp ? VAR_CYCLIC : "";
}
function resolveVarInner(value, vars, seen) {
  let out = String(value);
  for (let guard = 0; guard < 10; guard++) {
    const found = findVarCall(out);
    if (!found) return { value: out, cyclic: false };
    const { start, end, name, fallback } = found;
    let replacement = "";
    const useFallback = () => {
      if (fallback == null) return { value: "", cyclic: true };
      const fr = resolveVarInner(fallback, vars, seen);
      return { value: fr.value, cyclic: fr.cyclic };
    };
    let r;
    if (seen.includes(name)) {
      r = useFallback();
    } else if (Object.prototype.hasOwnProperty.call(vars, name)) {
      const raw = String(vars[name]);
      if (raw === VAR_CYCLIC) {
        r = useFallback();
      } else {
        r = resolveVarInner(raw, vars, [...seen, name]);
        if (r.cyclic) r = useFallback();
      }
    } else {
      r = useFallback();
    }
    if (r.cyclic) return { value: "", cyclic: true };
    replacement = r.value;
    out = out.slice(0, start) + replacement + out.slice(end);
  }
  return { value: out, cyclic: false };
}
function findVarCall(text) {
  const at = text.indexOf("var(");
  if (at < 0) return null;
  let depth = 0;
  for (let i = at + 4; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") depth++;
    else if (ch === ")") {
      if (depth === 0) {
        const inner = text.slice(at + 4, i);
        const comma = topLevelComma(inner);
        const name = (comma < 0 ? inner : inner.slice(0, comma)).trim();
        const fallback = comma < 0 ? null : inner.slice(comma + 1).trim();
        return { start: at, end: i + 1, name, fallback };
      }
      depth--;
    }
  }
  return null;
}
function topLevelComma(text) {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === "," && depth === 0) return i;
  }
  return -1;
}
var POST_VAR_EXPANDABLE = /* @__PURE__ */ new Set([
  "background",
  "border",
  "font",
  "flex",
  "grid-gap",
  "grid-column-gap",
  "grid-row-gap"
]);
function expandResolvedShorthandsInPlace(computed) {
  for (const name of Object.keys(computed)) {
    if (!POST_VAR_EXPANDABLE.has(name)) continue;
    const value = computed[name];
    if (typeof value !== "string" || value.includes("var(")) continue;
    delete computed[name];
    for (const decl of expandOne({ name, value, important: false })) {
      computed[decl.name] = decl.value;
    }
  }
}
function evaluateCalcsInPlace(computed) {
  for (const name of Object.keys(computed)) {
    const value = computed[name];
    if (typeof value === "string" && value.includes("calc(")) {
      computed[name] = evaluateCalcValue(value);
    }
  }
}
function evaluateCalcValue(text) {
  let out = String(text);
  for (let guard = 0; guard < 10; guard++) {
    const at = out.lastIndexOf("calc(");
    if (at < 0) return out;
    let depth = 0;
    let end = -1;
    for (let i = at + 5; i < out.length; i++) {
      if (out[i] === "(") depth++;
      else if (out[i] === ")") {
        if (depth === 0) {
          end = i;
          break;
        }
        depth--;
      }
    }
    if (end < 0) return out;
    const result = evaluateCalcExpr(out.slice(at + 5, end));
    if (result == null) return out;
    out = out.slice(0, at) + result + out.slice(end + 1);
  }
  return out;
}
function tokenizeCalc(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if ("+-*/()".includes(ch)) {
      tokens.push(ch);
      i++;
      continue;
    }
    const m = expr.slice(i).match(/^[0-9]*\.?[0-9]+([a-zA-Z%]+)?/);
    if (!m) return null;
    tokens.push({ value: parseFloat(m[0]), unit: m[1] || "" });
    i += m[0].length;
  }
  return tokens;
}
function evaluateCalcExpr(expr) {
  const tokens = tokenizeCalc(expr);
  if (!tokens || !tokens.length) return null;
  let pos = 0;
  const peek = () => tokens[pos];
  function parseExpr() {
    let left = parseTerm();
    while (left && (peek() === "+" || peek() === "-")) {
      const op = tokens[pos++];
      const right = parseTerm();
      left = calcAddSub(left, op, right);
    }
    return left;
  }
  function parseTerm() {
    let left = parseFactor();
    while (left && (peek() === "*" || peek() === "/")) {
      const op = tokens[pos++];
      const right = parseFactor();
      left = calcMulDiv(left, op, right);
    }
    return left;
  }
  function parseFactor() {
    const t = peek();
    if (t === "(") {
      pos++;
      const v = parseExpr();
      if (!v || peek() !== ")") return null;
      pos++;
      return v;
    }
    if (t === "-" || t === "+") {
      pos++;
      const v = parseFactor();
      if (!v) return null;
      return { value: t === "-" ? -v.value : v.value, unit: v.unit };
    }
    if (t && typeof t === "object") {
      pos++;
      return t;
    }
    return null;
  }
  const result = parseExpr();
  if (!result || pos !== tokens.length) return null;
  const rounded = Math.round(result.value * 1e3) / 1e3;
  return `${rounded}${result.unit}`;
}
function calcAddSub(left, op, right) {
  if (!left || !right) return null;
  let unit = left.unit;
  if (left.unit !== right.unit) {
    if (left.unit === "" && left.value === 0) unit = right.unit;
    else if (right.unit === "" && right.value === 0) unit = left.unit;
    else return null;
  }
  return { value: op === "+" ? left.value + right.value : left.value - right.value, unit };
}
function calcMulDiv(left, op, right) {
  if (!left || !right) return null;
  if (op === "*") {
    if (left.unit && right.unit) return null;
    return { value: left.value * right.value, unit: left.unit || right.unit };
  }
  if (right.unit || right.value === 0) return null;
  return { value: left.value / right.value, unit: left.unit };
}
var KNOWN_ENVS = {
  "safe-area-inset-top": "0px",
  "safe-area-inset-right": "0px",
  "safe-area-inset-bottom": "0px",
  "safe-area-inset-left": "0px"
};
function evaluateEnvsInPlace(computed) {
  for (const name of Object.keys(computed)) {
    const value = computed[name];
    if (typeof value !== "string" || value.indexOf("env(") < 0) continue;
    const result = evaluateEnvValue(value);
    if (result == null) delete computed[name];
    else computed[name] = result;
  }
}
function evaluateEnvValue(text) {
  let out = String(text);
  for (let guard = 0; guard < 10; guard++) {
    const at = findMathFnCall(out, "env(");
    if (at < 0) return out;
    const end = findFnEnd(out, at, 4);
    if (end < 0) return null;
    const inner = out.slice(at + 4, end);
    const comma = topLevelComma(inner);
    const varName = (comma < 0 ? inner : inner.slice(0, comma)).trim();
    const fallback = comma < 0 ? null : inner.slice(comma + 1).trim();
    let replacement;
    if (Object.prototype.hasOwnProperty.call(KNOWN_ENVS, varName)) {
      replacement = KNOWN_ENVS[varName];
    } else if (fallback != null && fallback !== "") {
      replacement = fallback;
    } else {
      return null;
    }
    out = out.slice(0, at) + replacement + out.slice(findFnEnd(out, at, 4) + 1);
  }
  return null;
}
var MATH_FN_RE = /(?<![\w-])(min|max|clamp)\(/gi;
function evaluateMathInPlace(computed) {
  for (const name of Object.keys(computed)) {
    const value = computed[name];
    if (typeof value !== "string") continue;
    MATH_FN_RE.lastIndex = 0;
    if (!MATH_FN_RE.test(value)) continue;
    const result = evaluateMathNoPercent(value);
    if (result != null) computed[name] = result;
  }
}
function evaluateMathNoPercent(text) {
  let out = String(text);
  for (let guard = 0; guard < 10; guard++) {
    const found = findMathFnCallAny(out);
    if (!found) return out;
    const { at, name, end } = found;
    const inner = out.slice(at + name.length + 1, end);
    if (inner.indexOf("%") >= 0) return null;
    const args = splitTopLevel(inner, ",").map((a) => parseAbsoluteLength(a.trim()));
    if (!args.length || args.some((v) => v == null)) return null;
    let result;
    const fn = name.toLowerCase();
    if (fn === "min") result = Math.min(...args);
    else if (fn === "max") result = Math.max(...args);
    else {
      if (args.length !== 3) return null;
      result = Math.min(Math.max(args[1], args[0]), args[2]);
    }
    out = out.slice(0, at) + round3(result) + "px" + out.slice(end + 1);
  }
  return null;
}
function round3(n2) {
  return Math.round(n2 * 1e3) / 1e3;
}
function parseAbsoluteLength(t) {
  const m = String(t).match(/^(-?\d*\.?\d+)(px|pt|pc|in|cm|mm|q|em|rem|ex|ch|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax)?$/i);
  if (!m) return null;
  const unit = (m[2] || "px").toLowerCase();
  const n2 = Number(m[1]);
  switch (unit) {
    case "px":
      return n2;
    case "pt":
      return n2 * 96 / 72;
    case "pc":
      return n2 * 16;
    case "in":
      return n2 * 96;
    case "cm":
      return n2 * 96 / 2.54;
    case "mm":
      return n2 * 96 / 25.4;
    case "q":
      return n2 * 96 / 25.4 / 4;
    default:
      return null;
  }
}
function findFnEnd(text, at, plen) {
  let depth = 0;
  for (let i = at + plen; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") {
      if (depth === 0) return i;
      depth--;
    }
  }
  return -1;
}
function findMathFnCallAny(text) {
  MATH_FN_RE.lastIndex = 0;
  let best = null;
  let m;
  while ((m = MATH_FN_RE.exec(text)) !== null) {
    const at = m.index + m[0].length - m[1].length - 1;
    const end = findFnEnd(text, at, m[1].length + 1);
    if (end >= 0) best = { at, name: m[1], end };
  }
  return best;
}
function findMathFnCall(text, prefix) {
  let at = -1;
  let from = 0;
  for (; ; ) {
    const i = text.indexOf(prefix, from);
    if (i < 0) break;
    if (findFnEnd(text, i, prefix.length) >= 0) at = i;
    from = i + 1;
  }
  return at;
}
function splitTopLevel(text, sep) {
  const parts = [];
  let depth = 0;
  let cur = "";
  for (const ch of String(text)) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === sep && depth === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts;
}
function parsePropertyRegistrations(atRules) {
  const regs = {};
  for (const rule of atRules || []) {
    if (!rule || rule.name !== "property") continue;
    const propName = String(rule.prelude || "").trim();
    if (!/^--[\w-]+$/.test(propName)) continue;
    const desc = parseDescriptors(String(rule.block || ""));
    const syntax = desc.syntax != null ? String(desc.syntax).replace(/^["']|["']$/g, "").trim() : "";
    const inherits = desc.inherits != null ? /^\s*true\s*$/i.test(desc.inherits) : null;
    const initialValue = desc["initial-value"] != null ? String(desc["initial-value"]).trim() : "";
    if (!syntax || inherits == null) continue;
    const universal = syntax.split("|").map((s) => s.trim()).includes("*");
    if (!universal && !initialValue) continue;
    if (initialValue.indexOf("var(") >= 0) continue;
    regs[propName] = { syntax, inherits, initialValue };
  }
  return regs;
}
function parseDescriptors(block) {
  const out = {};
  for (const part of String(block).split(";")) {
    const i = part.indexOf(":");
    if (i < 0) continue;
    const key = part.slice(0, i).trim().toLowerCase();
    const val = part.slice(i + 1).trim();
    if (key) out[key] = val;
  }
  return out;
}
function applyPropertyRegistrations(computed, parentComputed, regs) {
  const names = Object.keys(regs || {});
  if (!names.length) return;
  for (const name of names) {
    const reg = regs[name];
    const has = Object.prototype.hasOwnProperty.call(computed, name);
    const parentVal = parentComputed ? parentComputed[name] : void 0;
    const specified = has && computed[name] !== parentVal;
    if (!specified) {
      if (!(reg.inherits && has)) {
        if (reg.initialValue) computed[name] = reg.initialValue;
        else delete computed[name];
      }
      continue;
    }
    if (!valueMatchesSyntax(computed[name], reg.syntax)) {
      if (reg.initialValue) computed[name] = reg.initialValue;
      else delete computed[name];
    }
  }
}
function valueMatchesSyntax(value, syntax) {
  const v = String(value).trim();
  if (!v) return false;
  return String(syntax).split("|").map((s) => s.trim().replace(/^["']|["']$/g, "")).some((alt) => matchSyntaxAlt(v, alt));
}
function matchSyntaxAlt(v, alt) {
  switch (alt) {
    case "*":
      return true;
    case "<length>":
      return /^(0|-?\d*\.?\d+(px|pt|pc|in|cm|mm|q|em|rem|ex|ch|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax))$/i.test(v);
    case "<percentage>":
      return /^-?\d*\.?\d+%$/.test(v);
    case "<length-percentage>":
      return matchSyntaxAlt(v, "<length>") || matchSyntaxAlt(v, "<percentage>");
    case "<number>":
      return /^-?\d*\.?\d+$/.test(v);
    case "<integer>":
      return /^-?\d+$/.test(v);
    case "<color>":
      return isColorValue(v);
    default:
      return false;
  }
}
function isColorValue(v) {
  if (/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return true;
  if (/^(rgba?|hsla?|color|lab|lch|oklab|oklch|light-dark)\(/i.test(v)) return true;
  return isNamedColor(v.toLowerCase());
}
var EXPANDABLE = /* @__PURE__ */ new Set([
  "background",
  "border",
  "border-width",
  "border-color",
  "border-style",
  "margin",
  "padding",
  "font",
  "flex",
  "grid-gap",
  "grid-column-gap",
  "grid-row-gap"
]);
var CSS_WIDE_KEYWORDS = /* @__PURE__ */ new Set(["inherit", "initial", "unset", "revert", "revert-layer"]);
var INITIAL_COLOR_MARKER = "merkava-initial-color";
function cssWideKeyword(value) {
  const low = String(value || "").trim().toLowerCase();
  return CSS_WIDE_KEYWORDS.has(low) ? low : null;
}
function normalizeKeywordDeclaration(decl) {
  const kw = cssWideKeyword(decl.value);
  if (!kw) return decl;
  let value = kw;
  if (kw === "revert") value = "unset";
  if (String(decl.name || "").toLowerCase() === "color" && kw === "initial") value = INITIAL_COLOR_MARKER;
  return value === decl.value ? decl : { ...decl, value };
}
var ALL_RESET_PROPERTIES = [
  "color",
  "cursor",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-size",
  "font-stretch",
  "font-style",
  "font-variant",
  "font-weight",
  "letter-spacing",
  "line-height",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "quotes",
  "text-align",
  "text-indent",
  "text-transform",
  "visibility",
  "white-space",
  "word-spacing",
  "writing-mode",
  "background-color",
  "background-image",
  "border-width",
  "border-style",
  "border-color",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "width",
  "height",
  "min-width",
  "min-height",
  "max-width",
  "max-height",
  "overflow",
  "overflow-x",
  "overflow-y",
  "float",
  "clear",
  "z-index",
  "opacity",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "flex-direction",
  "flex-wrap",
  "align-items",
  "align-content",
  "justify-content",
  "gap",
  "column-gap",
  "row-gap",
  "text-decoration",
  "text-shadow",
  "box-shadow",
  "box-sizing",
  "vertical-align",
  "transform",
  "-webkit-text-fill-color"
];
function expandAllKeyword(decl) {
  return ALL_RESET_PROPERTIES.map(
    (name) => normalizeKeywordDeclaration({ name, value: decl.value, important: !!decl.important })
  );
}
function expandDeclarations(declarations) {
  const out = [];
  for (const decl of declarations || []) {
    const n2 = normalizeKeywordDeclaration(decl);
    if (String(n2.name || "").toLowerCase() === "all" && cssWideKeyword(n2.value)) {
      out.push(...expandAllKeyword(n2));
      continue;
    }
    if (!EXPANDABLE.has(n2.name)) {
      out.push(n2);
      continue;
    }
    out.push(...expandOne(n2));
  }
  return out;
}
function expandOne(decl) {
  const { name, value, important } = decl;
  if (String(value).includes("var(")) return [decl];
  const make = (n2, v) => ({ name: n2, value: v, important });
  if (cssWideKeyword(value)) {
    switch (name) {
      case "background":
        return [make("background-image", value), make("background-color", value)];
      case "border":
        return [make("border-width", value), make("border-style", value), make("border-color", value)];
      case "border-width":
      case "border-color":
      case "border-style":
        return [decl];
      case "margin":
      case "padding":
        return ["top", "right", "bottom", "left"].map((sd) => make(`${name}-${sd}`, value));
      case "font":
        return [
          make("font-style", value),
          make("font-weight", value),
          make("font-size", value),
          make("line-height", value),
          make("font-family", value)
        ];
      case "flex":
        return [make("flex-grow", value), make("flex-shrink", value), make("flex-basis", value)];
      case "grid-gap":
        return [make("gap", value)];
      case "grid-column-gap":
        return [make("column-gap", value)];
      case "grid-row-gap":
        return [make("row-gap", value)];
      default:
        return [decl];
    }
  }
  switch (name) {
    case "background": {
      const expanded = [];
      const image = firstBackgroundImage(value);
      if (image) expanded.push(make("background-image", image));
      const color = lastColorCandidate(value);
      if (color) expanded.push(make("background-color", color));
      return expanded.length ? expanded : [decl];
    }
    case "border": {
      const { width, style, color } = splitBorder(value);
      const expanded = [];
      if (width) expanded.push(make("border-width", width));
      if (style) expanded.push(make("border-style", style));
      if (color) expanded.push(make("border-color", color));
      return expanded.length ? expanded : [decl];
    }
    case "border-width":
    case "border-color":
    case "border-style": {
      const parts = splitOutsideFunctions(value);
      if (!parts.length) return [decl];
      const [top, right = top, bottom = top, left = right] = parts;
      const base = name;
      return [
        make(`${base}-top`, top),
        make(`${base}-right`, right),
        make(`${base}-bottom`, bottom),
        make(`${base}-left`, left)
      ];
    }
    case "margin":
    case "padding": {
      const parts = splitOutsideFunctions(value);
      if (!parts.length) return [decl];
      const [top, right = top, bottom = top, left = right] = parts;
      return [
        make(`${name}-top`, top),
        make(`${name}-right`, right),
        make(`${name}-bottom`, bottom),
        make(`${name}-left`, left)
      ];
    }
    case "font": {
      const parsed = parseFontShorthand(value);
      if (!parsed) return [decl];
      const expanded = [];
      if (parsed.style) expanded.push(make("font-style", parsed.style));
      if (parsed.weight) expanded.push(make("font-weight", parsed.weight));
      expanded.push(make("font-size", parsed.size));
      if (parsed.lineHeight) expanded.push(make("line-height", parsed.lineHeight));
      expanded.push(make("font-family", parsed.family));
      return expanded;
    }
    case "flex": {
      const parts = splitOutsideFunctions(value);
      const expanded = [];
      if (parts.length === 1 && /^(none|auto)$/i.test(parts[0])) {
        if (/^none$/i.test(parts[0])) {
          expanded.push(make("flex-grow", "0"), make("flex-shrink", "0"), make("flex-basis", "auto"));
        } else {
          expanded.push(make("flex-grow", "1"), make("flex-shrink", "1"), make("flex-basis", "auto"));
        }
      } else {
        if (parts[0]) expanded.push(make("flex-grow", parts[0]));
        expanded.push(make("flex-shrink", parts[1] || "1"));
        expanded.push(make("flex-basis", parts[2] || "0%"));
      }
      return expanded.length ? expanded : [decl];
    }
    // B"H 2026-10-09: legacy grid-gap shorthands normalize to the modern
    // gap/column-gap/row-gap longhands the layout engine reads.
    case "grid-gap": {
      const parts = splitOutsideFunctions(value);
      return parts.length ? [make("gap", parts.join(" "))] : [decl];
    }
    case "grid-column-gap":
      return [make("column-gap", value)];
    case "grid-row-gap":
      return [make("row-gap", value)];
    default:
      return [decl];
  }
}
function splitOutsideFunctions(value) {
  const parts = [];
  let depth = 0;
  let current = "";
  let quote = "";
  for (const ch of String(value || "")) {
    if (quote) {
      current += ch;
      if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (/\s/.test(ch) && depth === 0) {
      if (current) {
        parts.push(current);
        current = "";
      }
      continue;
    }
    current += ch;
  }
  if (current) parts.push(current);
  return parts;
}
function firstBackgroundImage(value) {
  const text = String(value || "");
  const urlAt = text.search(/url\(/i);
  const gradAt = text.search(/[a-z-]*gradient\(/i);
  const at = urlAt < 0 ? gradAt : gradAt < 0 ? urlAt : Math.min(urlAt, gradAt);
  if (at < 0) return "";
  let depth = 0;
  for (let i = at; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") {
      depth--;
      if (depth === 0) return text.slice(at, i + 1).trim();
    }
  }
  return "";
}
function lastColorCandidate(value) {
  const text = String(value || "");
  const matches = [
    ...text.matchAll(/#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/gi),
    ...text.matchAll(/\brgba?\([^)]*\)/gi),
    ...text.matchAll(/\bhsla?\([^)]*\)/gi)
  ];
  const named = [...text.matchAll(/\b([a-z]+)\b/gi)].map((m) => m[1]).filter((w) => isNamedColor(w) && !/^(url|gradient|to|repeat|solid|none|transparent)$/i.test(w));
  const all = [...matches.map((m) => ({ at: m.index, v: m[0] })), ...named.map((w) => ({ at: text.indexOf(w), v: w }))].sort(
    (a, b) => a.at - b.at
  );
  return all.length ? all[all.length - 1].v : "";
}
var NAMED_COLORS = new Set(
  "aliceblue,antiquewhite,aqua,aquamarine,azure,beige,bisque,black,blue,blueviolet,brown,coral,crimson,cyan,darkblue,darkcyan,darkgray,darkgreen,darkgrey,darkmagenta,darkorange,darkred,deeppink,deepskyblue,dimgray,dimgrey,dodgerblue,firebrick,fuchsia,gold,goldenrod,gray,green,greenyellow,grey,hotpink,indigo,ivory,khaki,lavender,lavenderblush,lawngreen,lemonchiffon,lightblue,lightcyan,lightgray,lightgreen,lightgrey,lightpink,lightskyblue,lightyellow,lime,limegreen,magenta,maroon,navy,olive,orange,orangered,orchid,pink,plum,purple,red,royalblue,salmon,silver,skyblue,teal,tomato,transparent,violet,white,whitesmoke,yellow".split(",")
);
function isNamedColor(word) {
  return NAMED_COLORS.has(String(word || "").toLowerCase());
}
function splitBorder(value) {
  let width = "";
  let style = "";
  let color = "";
  for (const token of splitOutsideFunctions(value)) {
    const low = token.toLowerCase();
    if (/^(thin|medium|thick)$/.test(low) || /^-?\d/.test(token)) width = token;
    else if (/^(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)$/.test(low)) style = token;
    else color = color ? `${color} ${token}` : token;
  }
  return { width, style, color };
}
var FONT_STYLES = /* @__PURE__ */ new Set(["normal", "italic", "oblique"]);
var FONT_WEIGHTS = /* @__PURE__ */ new Set(["normal", "bold", "bolder", "lighter", "100", "200", "300", "400", "500", "600", "700", "800", "900"]);
function parseFontShorthand(value) {
  const parts = splitOutsideFunctions(value);
  const sizeAt = parts.findIndex((p) => /^\d/.test(p) && !FONT_WEIGHTS.has(p.toLowerCase()));
  if (sizeAt < 0) return null;
  let style = "";
  let weight = "";
  for (const p of parts.slice(0, sizeAt)) {
    const low = p.toLowerCase();
    if (FONT_STYLES.has(low)) style = p;
    else if (FONT_WEIGHTS.has(low)) weight = p;
  }
  const sizePart = parts[sizeAt];
  const slash = sizePart.indexOf("/");
  const size = slash < 0 ? sizePart : sizePart.slice(0, slash);
  const lineHeight = slash < 0 ? "" : sizePart.slice(slash + 1);
  const family = parts.slice(sizeAt + 1).join(" ");
  if (!family) return null;
  return { style, weight, size, lineHeight, family };
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/framebuffer.js
init_pngTools();

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/color.js
var NAMED = Object.freeze({
  aliceblue: [240, 248, 255, 255],
  antiquewhite: [250, 235, 215, 255],
  aqua: [0, 255, 255, 255],
  aquamarine: [127, 255, 212, 255],
  azure: [240, 255, 255, 255],
  beige: [245, 245, 220, 255],
  bisque: [255, 228, 196, 255],
  black: [0, 0, 0, 255],
  blue: [0, 0, 255, 255],
  blueviolet: [138, 43, 226, 255],
  brown: [165, 42, 42, 255],
  coral: [255, 127, 80, 255],
  crimson: [220, 20, 60, 255],
  cyan: [0, 255, 255, 255],
  darkblue: [0, 0, 139, 255],
  darkcyan: [0, 139, 139, 255],
  darkgray: [169, 169, 169, 255],
  darkgreen: [0, 100, 0, 255],
  darkgrey: [169, 169, 169, 255],
  darkmagenta: [139, 0, 139, 255],
  darkorange: [255, 140, 0, 255],
  darkred: [139, 0, 0, 255],
  deeppink: [255, 20, 147, 255],
  deepskyblue: [0, 191, 255, 255],
  dimgray: [105, 105, 105, 255],
  dimgrey: [105, 105, 105, 255],
  dodgerblue: [30, 144, 255, 255],
  firebrick: [178, 34, 34, 255],
  fuchsia: [255, 0, 255, 255],
  gold: [255, 215, 0, 255],
  goldenrod: [218, 165, 32, 255],
  gray: [128, 128, 128, 255],
  green: [0, 128, 0, 255],
  greenyellow: [173, 255, 47, 255],
  grey: [128, 128, 128, 255],
  hotpink: [255, 105, 180, 255],
  indigo: [75, 0, 130, 255],
  ivory: [255, 255, 240, 255],
  khaki: [240, 230, 140, 255],
  lavender: [230, 230, 250, 255],
  lavenderblush: [255, 240, 245, 255],
  lawngreen: [124, 252, 0, 255],
  lemonchiffon: [255, 250, 205, 255],
  lightblue: [173, 216, 230, 255],
  lightcyan: [224, 255, 255, 255],
  lightgray: [211, 211, 211, 255],
  lightgreen: [144, 238, 144, 255],
  lightgrey: [211, 211, 211, 255],
  lightpink: [255, 182, 193, 255],
  lightskyblue: [135, 206, 250, 255],
  lightyellow: [255, 255, 224, 255],
  lime: [0, 255, 0, 255],
  limegreen: [50, 205, 50, 255],
  magenta: [255, 0, 255, 255],
  maroon: [128, 0, 0, 255],
  navy: [0, 0, 128, 255],
  olive: [128, 128, 0, 255],
  orange: [255, 165, 0, 255],
  orangered: [255, 69, 0, 255],
  orchid: [218, 112, 214, 255],
  pink: [255, 192, 203, 255],
  plum: [221, 160, 221, 255],
  purple: [128, 0, 128, 255],
  red: [255, 0, 0, 255],
  royalblue: [65, 105, 225, 255],
  salmon: [250, 128, 114, 255],
  silver: [192, 192, 192, 255],
  skyblue: [135, 206, 235, 255],
  teal: [0, 128, 128, 255],
  tomato: [255, 99, 71, 255],
  transparent: [0, 0, 0, 0],
  violet: [238, 130, 238, 255],
  white: [255, 255, 255, 255],
  whitesmoke: [245, 245, 245, 255],
  yellow: [255, 255, 0, 255]
});
function parseColor(value, fallback = [0, 0, 0, 255]) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return fallback;
  if (NAMED[text]) return NAMED[text].slice();
  if (SYSTEM[text]) return SYSTEM[text].slice();
  const hex = text.match(/#([0-9a-f]{3,8})\b/i);
  if (hex) return hexColor(hex[1], fallback);
  const rgb = text.match(/rgba?\(([^)]+)\)/i);
  if (rgb) return rgbColor(rgb[1], fallback);
  return fallback;
}
var SYSTEM = Object.freeze({
  canvas: [255, 255, 255, 255],
  canvastext: [0, 0, 0, 255],
  linktext: [0, 0, 238, 255],
  visitedtext: [85, 26, 139, 255],
  activetext: [255, 0, 0, 255],
  buttonface: [240, 240, 240, 255],
  buttontext: [0, 0, 0, 255],
  buttonborder: [143, 143, 143, 255],
  field: [255, 255, 255, 255],
  fieldtext: [0, 0, 0, 255],
  highlight: [181, 213, 255, 255],
  highlighttext: [0, 0, 0, 255],
  graytext: [128, 128, 128, 255],
  mark: [255, 255, 0, 255],
  marktext: [0, 0, 0, 255],
  selecteditem: [0, 120, 215, 255],
  selecteditemtext: [255, 255, 255, 255]
});
function mix(a, b, t) {
  const n2 = Math.max(0, Math.min(1, Number(t) || 0));
  return [0, 1, 2, 3].map((i) => Math.round(a[i] + (b[i] - a[i]) * n2));
}
function splitTopLevel2(text, sep = ",") {
  const out = [];
  let depth = 0, cur = "";
  for (const ch of String(text)) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === sep && depth === 0) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}
function gradientAngle(firstArg) {
  const t = String(firstArg || "").trim().toLowerCase();
  const degMatch = t.match(/^(-?\d+(?:\.\d+)?)(deg|rad|grad|turn)$/);
  if (degMatch) {
    const v = Number(degMatch[1]), unit = degMatch[2];
    const deg = unit === "rad" ? v * 180 / Math.PI : unit === "grad" ? v * 0.9 : unit === "turn" ? v * 360 : v;
    return deg * Math.PI / 180;
  }
  const toMatch = t.match(/^to\s+(.+)$/);
  if (toMatch) {
    const words = toMatch[1].trim().split(/\s+/);
    let dx = 0, dy = 0;
    if (words.includes("right")) dx += 1;
    if (words.includes("left")) dx -= 1;
    if (words.includes("bottom")) dy += 1;
    if (words.includes("top")) dy -= 1;
    if (!dx && !dy) return Math.PI;
    return Math.atan2(dx, -dy);
  }
  return Math.PI;
}
function parseGradientStops(args) {
  const stops = [];
  for (const raw of args) {
    const t = String(raw).trim();
    if (!t) continue;
    const pm = t.match(/^(.*?)\s+(-?\d+(?:\.\d+)?)%\s*$/);
    const colorText = pm ? pm[1].trim() : t;
    const pos = pm ? Number(pm[2]) / 100 : null;
    const c = parseColor(colorText, null);
    if (!c) continue;
    stops.push({ color: c, pos });
  }
  if (!stops.length) return stops;
  const n2 = stops.length;
  if (stops[0].pos == null) stops[0].pos = 0;
  if (stops[n2 - 1].pos == null) stops[n2 - 1].pos = 1;
  let runStart = 0;
  for (let i = 1; i < n2; i++) {
    if (stops[i].pos != null) {
      const a = stops[runStart].pos, b = stops[i].pos, gap = i - runStart;
      for (let j = 1; j < gap; j++) stops[runStart + j].pos = a + (b - a) * j / gap;
      runStart = i;
    }
  }
  stops.sort((p, q) => p.pos - q.pos);
  return stops;
}
function gradientColor(value, x, y, width, height, fallback) {
  const g = parseGradient(value);
  if (!g) return fallback;
  return gradientColorAt(g, x, y, width, height, fallback);
}
function parseGradient(value) {
  const text = String(value || "");
  const match = text.match(/linear-gradient\(([\s\S]*)\)\s*$/i);
  if (!match) return null;
  const args = splitTopLevel2(match[1]);
  if (!args.length) return null;
  const probe = args[0].trim().toLowerCase();
  const hasDirection = /^(-?\d+(?:\.\d+)?(deg|rad|grad|turn)|to\s+)/.test(probe);
  const rad = hasDirection ? gradientAngle(args[0]) : Math.PI;
  const stops = parseGradientStops(hasDirection ? args.slice(1) : args);
  if (!stops.length) return null;
  return { rad, stops };
}
function gradientColorAt(g, x, y, width, height, fallback) {
  const { rad, stops } = g;
  if (stops.length === 1) return stops[0].color.slice();
  const w = Math.max(1, Number(width) || 1), h = Math.max(1, Number(height) || 1);
  const dx = Math.sin(rad), dy = -Math.cos(rad);
  const lineLen = Math.abs(w * dx) + Math.abs(h * dy) || 1;
  let t = 0.5 + ((Number(x) - w / 2) * dx + (Number(y) - h / 2) * dy) / lineLen;
  t = Math.max(0, Math.min(1, t));
  let i = 0;
  while (i < stops.length - 2 && t > stops[i + 1].pos) i++;
  const a = stops[i], b = stops[i + 1];
  const span = b.pos - a.pos || 1;
  const local = Math.max(0, Math.min(1, (t - a.pos) / span));
  return mix(a.color, b.color, local);
}
function hexColor(hex, fallback) {
  if (hex.length === 3 || hex.length === 4) {
    const chars = hex.split("").map((ch) => parseInt(ch + ch, 16));
    return [chars[0], chars[1], chars[2], chars[3] ?? 255];
  }
  if (hex.length === 6 || hex.length === 8) return [0, 2, 4, 6].map((i) => i < hex.length ? parseInt(hex.slice(i, i + 2), 16) : 255);
  return fallback;
}
function rgbColor(raw, fallback) {
  const parts = raw.split(/\s*,\s*/).map((item) => item.trim());
  if (parts.length < 3) return fallback;
  const rgb = parts.slice(0, 3).map(toByte);
  const alpha = parts[3] == null ? 255 : Math.round(Math.max(0, Math.min(1, Number(parts[3]))) * 255);
  return [...rgb, alpha];
}
function toByte(value) {
  if (value.endsWith("%")) return Math.round(Math.max(0, Math.min(100, Number(value.slice(0, -1)))) * 2.55);
  return Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/framebuffer.js
var Framebuffer = class {
  constructor(width = 960, height = 640, bg = [0, 0, 0, 255]) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
    this.clear(bg);
  }
  // B"H 2026-10-09 (viewport culling): bulk clear. The old loop called
  // writeRaw per pixel (function call overhead × 480k). Direct writes are
  // ~5x faster; solid white/black use .fill() on the typed array.
  clear(color) {
    const r = color[0] | 0, g = color[1] | 0, b = color[2] | 0, a = color[3] ?? 255;
    if (r === g && g === b && b === a) {
      this.data.fill(r);
      return;
    }
    const d = this.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
      d[i + 3] = a;
    }
  }
  // B"H 2026-10-09: real pixel clip stack (overflow:hidden etc.). The painter
  // pushes ancestor clip rects in DEVICE px; null = unclipped. Intersected on
  // push so nested overflow containers compose. Honored by setPixel,
  // fillRect/fillRectPacked, gradientRect, and blitFrom. Hot paths check
  // `this._clip` once (null in the common case) to stay fast.
  pushClip(x0, y0, x1, y1) {
    if (x0 !== null && typeof x0 === "object") {
      const r2 = x0;
      return this.pushClip(r2.x0, r2.y0, r2.x1, r2.y1);
    }
    const r = [
      Math.max(0, Math.floor(x0)),
      Math.max(0, Math.floor(y0)),
      Math.min(this.width, Math.ceil(x1)),
      Math.min(this.height, Math.ceil(y1))
    ];
    const c = this._clip;
    this._clipStack = this._clipStack || [];
    this._clipStack.push(c || null);
    this._clip = c ? [Math.max(c[0], r[0]), Math.max(c[1], r[1]), Math.min(c[2], r[2]), Math.min(c[3], r[3])] : r;
  }
  popClip() {
    const st = this._clipStack;
    this._clip = st && st.length ? st.pop() : null;
  }
  _inClip(ix, iy) {
    const c = this._clip;
    return !c || ix >= c[0] && iy >= c[1] && ix < c[2] && iy < c[3];
  }
  setPixel(x, y, color) {
    const ix = Math.round(x), iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    if (!this._inClip(ix, iy)) return;
    const i = (iy * this.width + ix) * 4;
    const a = (color[3] ?? 255) / 255, ia = 1 - a;
    this.data[i] = Math.round(color[0] * a + this.data[i] * ia);
    this.data[i + 1] = Math.round(color[1] * a + this.data[i + 1] * ia);
    this.data[i + 2] = Math.round(color[2] * a + this.data[i + 2] * ia);
    this.data[i + 3] = 255;
  }
  // B"H 2026-10-09: Packed-color fast path. Takes a Uint32 0xRRGGBBAA.
  // Avoids 4 array-index lookups per pixel vs setPixel. Use with parseColorPacked.
  setPixelPacked(x, y, packed) {
    const ix = Math.round(x), iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    if (!this._inClip(ix, iy)) return;
    const i = (iy * this.width + ix) * 4;
    const a = (packed & 255) / 255;
    if (a >= 1) {
      this.data[i] = packed >>> 24 & 255;
      this.data[i + 1] = packed >>> 16 & 255;
      this.data[i + 2] = packed >>> 8 & 255;
      this.data[i + 3] = 255;
    } else {
      const ia = 1 - a;
      this.data[i] = Math.round((packed >>> 24 & 255) * a + this.data[i] * ia);
      this.data[i + 1] = Math.round((packed >>> 16 & 255) * a + this.data[i + 1] * ia);
      this.data[i + 2] = Math.round((packed >>> 8 & 255) * a + this.data[i + 2] * ia);
      this.data[i + 3] = 255;
    }
  }
  // B"H 2026-10-09: intersect the paint rect with the active clip once per
  // call (faster than a per-pixel test in the loops below).
  _clipBounds(sx, sy, ex, ey) {
    const c = this._clip;
    if (!c) return [sx, sy, ex, ey];
    return [Math.max(sx, c[0]), Math.max(sy, c[1]), Math.min(ex, c[2]), Math.min(ey, c[3])];
  }
  fillRectPacked(x, y, w, h, packed) {
    const sx = Math.max(0, Math.floor(x)), sy = Math.max(0, Math.floor(y));
    const ex = Math.min(this.width, Math.ceil(x + w)), ey = Math.min(this.height, Math.ceil(y + h));
    const [csx, csy, cex, cey] = this._clipBounds(sx, sy, ex, ey);
    for (let yy = csy; yy < cey; yy++) for (let xx = csx; xx < cex; xx++) this.setPixelPacked(xx, yy, packed);
  }
  fillRect(x, y, w, h, color) {
    const sx = Math.max(0, Math.floor(x)), sy = Math.max(0, Math.floor(y));
    const ex = Math.min(this.width, Math.ceil(x + w)), ey = Math.min(this.height, Math.ceil(y + h));
    const [csx, csy, cex, cey] = this._clipBounds(sx, sy, ex, ey);
    const cw = cex - csx, ch = cey - csy;
    if (cw <= 0 || ch <= 0) return;
    if ((color[3] ?? 255) >= 255) {
      const d = this.data, W = this.width;
      const r = color[0], g = color[1], b = color[2];
      if (cw * ch >= 1024) {
        const row = new Uint8ClampedArray(cw * 4);
        for (let xx = 0; xx < cw; xx++) {
          const o = xx * 4;
          row[o] = r;
          row[o + 1] = g;
          row[o + 2] = b;
          row[o + 3] = 255;
        }
        for (let yy = csy; yy < cey; yy++) d.set(row, (yy * W + csx) * 4);
      } else {
        for (let yy = csy; yy < cey; yy++) {
          let i = (yy * W + csx) * 4;
          for (let xx = 0; xx < cw; xx++) {
            d[i] = r;
            d[i + 1] = g;
            d[i + 2] = b;
            d[i + 3] = 255;
            i += 4;
          }
        }
      }
      return;
    }
    for (let yy = csy; yy < cey; yy++) for (let xx = csx; xx < cex; xx++) this.setPixel(xx, yy, color);
  }
  gradientRect(x, y, w, h, background2, fallback) {
    const g = parseGradient(background2);
    let sx = Math.max(0, Math.floor(x)), sy = Math.max(0, Math.floor(y));
    let ex = Math.min(this.width, Math.ceil(x + w)), ey = Math.min(this.height, Math.ceil(y + h));
    [sx, sy, ex, ey] = this._clipBounds(sx, sy, ex, ey);
    if (g) {
      const opaque = (g.stops || []).every((s) => ((s.color || [])[3] ?? 255) === 255);
      if (opaque) {
        const d = this.data, W = this.width;
        for (let yy = sy; yy < ey; yy++) {
          const rowBase = yy * W * 4;
          for (let xx = sx; xx < ex; xx++) {
            const col = gradientColorAt(g, xx - x, yy - y, w, h, fallback);
            const i = rowBase + xx * 4;
            d[i] = col[0];
            d[i + 1] = col[1];
            d[i + 2] = col[2];
            d[i + 3] = 255;
          }
        }
      } else {
        for (let yy = sy; yy < ey; yy++) for (let xx = sx; xx < ex; xx++) this.setPixel(xx, yy, gradientColorAt(g, xx - x, yy - y, w, h, fallback));
      }
    } else {
      for (let yy = sy; yy < ey; yy++) for (let xx = sx; xx < ex; xx++) this.setPixel(xx, yy, fallback);
    }
  }
  // B"H 2026-10-09: fix-forward. boxPainter.js and blendClipMask.js call
  // fillRoundedRect/gradientRoundedRect but the methods never landed on the
  // class (only the pointInRoundedRect helper existed). Banded
  // implementation: the middle band is one fast fillRect; only the corner
  // bands test pixels, and only inside the corner x-ranges.
  fillRoundedRect(x, y, w, h, radii, color) {
    const r = normalizeRadii(radii || {}, w, h);
    if (!hasAnyRadius(r)) return this.fillRect(x, y, w, h, color);
    const top = Math.max(r.tl[1] || 0, r.tr[1] || 0);
    const bot = Math.max(r.bl[1] || 0, r.br[1] || 0);
    const lft = Math.max(r.tl[0] || 0, r.bl[0] || 0);
    const rgt = Math.max(r.tr[0] || 0, r.br[0] || 0);
    const midY0 = y + top, midY1 = y + h - bot;
    if (midY1 > midY0) this.fillRect(x, midY0, w, midY1 - midY0, color);
    this._roundedCornerBands(x, y, w, h, r, top, bot, lft, rgt, (xx, yy) => this.setPixel(xx, yy, color));
  }
  gradientRoundedRect(x, y, w, h, radii, background2, fallback) {
    const r = normalizeRadii(radii || {}, w, h);
    const g = parseGradient(background2);
    if (!hasAnyRadius(r)) return this.gradientRect(x, y, w, h, background2, fallback);
    const top = Math.max(r.tl[1] || 0, r.tr[1] || 0);
    const bot = Math.max(r.bl[1] || 0, r.br[1] || 0);
    const lft = Math.max(r.tl[0] || 0, r.bl[0] || 0);
    const rgt = Math.max(r.tr[0] || 0, r.br[0] || 0);
    const midY0 = y + top, midY1 = y + h - bot;
    if (midY1 > midY0) {
      if (g) {
        const opaque = (g.stops || []).every((s) => ((s.color || [])[3] ?? 255) === 255);
        const sx = Math.max(0, Math.floor(x)), sy = Math.max(0, Math.floor(midY0));
        const ex = Math.min(this.width, Math.ceil(x + w)), ey = Math.min(this.height, Math.ceil(midY1));
        if (opaque) {
          const d = this.data, W = this.width;
          for (let yy = sy; yy < ey; yy++) {
            const rowBase = yy * W * 4;
            for (let xx = sx; xx < ex; xx++) {
              const col = gradientColorAt(g, xx - x, yy - y, w, h, fallback);
              const i = rowBase + xx * 4;
              d[i] = col[0];
              d[i + 1] = col[1];
              d[i + 2] = col[2];
              d[i + 3] = 255;
            }
          }
        } else {
          for (let yy = sy; yy < ey; yy++) for (let xx = sx; xx < ex; xx++) this.setPixel(xx, yy, gradientColorAt(g, xx - x, yy - y, w, h, fallback));
        }
      } else this.fillRect(x, midY0, w, midY1 - midY0, fallback);
    }
    if (g) this._roundedCornerBands(x, y, w, h, r, top, bot, lft, rgt, (xx, yy) => this.setPixel(xx, yy, gradientColorAt(g, xx - x, yy - y, w, h, fallback)));
    else this._roundedCornerBands(x, y, w, h, r, top, bot, lft, rgt, (xx, yy) => this.setPixel(xx, yy, fallback));
  }
  // B"H 2026-10-09: strokeRoundedRect was also missing (boxPainter calls it
  // for bordered rounded boxes). Pixel is on the border iff inside the outer
  // rounded rect but outside the inner one (inset by lineWidth, radii shrunk).
  strokeRoundedRect(x, y, w, h, radii, color, lineWidth = 1) {
    const lw = Math.max(1, Math.round(lineWidth));
    const r = normalizeRadii(radii || {}, w, h);
    if (!hasAnyRadius(r)) return this.strokeRect(x, y, w, h, color, lw);
    const inner = {};
    for (const k of ["tl", "tr", "br", "bl"]) {
      const c = r[k] || [0, 0];
      inner[k] = [Math.max(0, c[0] - lw), Math.max(0, c[1] - lw)];
    }
    const ix = x + lw, iy = y + lw, iw = w - 2 * lw, ih = h - 2 * lw;
    const sx = Math.max(0, Math.floor(x)), sy = Math.max(0, Math.floor(y));
    const ex = Math.min(this.width, Math.ceil(x + w)), ey = Math.min(this.height, Math.ceil(y + h));
    const outerTest = makeRoundedTest(x, y, w, h, r);
    const innerTest = makeRoundedTest(ix, iy, iw, ih, inner);
    const inOuter = outerTest;
    const inInner = innerTest || ((lx, ly) => lx >= ix && ly >= iy && lx <= ix + iw && ly <= iy + ih);
    for (let yy = sy; yy < ey; yy++) {
      for (let xx = sx; xx < ex; xx++) {
        const cx = xx + 0.5, cy = yy + 0.5;
        if (inOuter(cx, cy) && !inInner(cx, cy)) {
          this.setPixel(xx, yy, color);
        }
      }
    }
  }
  /** Corner bands of a rounded rect: middle x-range fills directly, corner
   * x-ranges are tested per pixel. Shared by fill/gradient variants. */
  _roundedCornerBands(x, y, w, h, r, top, bot, lft, rgt, paint) {
    const midX0 = x + lft, midX1 = x + w - rgt;
    const test = makeRoundedTest(x, y, w, h, r);
    const inside = test || (() => true);
    for (const [b0, b1] of [[y, y + top], [y + h - bot, y + h]]) {
      const yy0 = Math.max(0, Math.floor(b0)), yy1 = Math.min(this.height, Math.ceil(b1));
      for (let yy = yy0; yy < yy1; yy++) {
        const xxA0 = Math.max(0, Math.floor(x)), xxA1 = Math.min(this.width, Math.ceil(midX0));
        for (let xx = xxA0; xx < xxA1; xx++)
          if (inside(xx + 0.5, yy + 0.5)) paint(xx, yy);
        if (midX1 > midX0) {
          const mx0 = Math.max(0, Math.floor(midX0)), mx1 = Math.min(this.width, Math.ceil(midX1));
          for (let xx = mx0; xx < mx1; xx++) paint(xx, yy);
        }
        const xxB0 = Math.max(0, Math.floor(midX1)), xxB1 = Math.min(this.width, Math.ceil(x + w));
        for (let xx = xxB0; xx < xxB1; xx++)
          if (inside(xx + 0.5, yy + 0.5)) paint(xx, yy);
      }
    }
  }
  strokeRect(x, y, w, h, color, lineWidth = 1) {
    const lw = Math.max(1, Math.round(lineWidth));
    this.fillRect(x, y, w, lw, color);
    this.fillRect(x, y + h - lw, w, lw, color);
    this.fillRect(x, y, lw, h, color);
    this.fillRect(x + w - lw, y, lw, h, color);
  }
  drawLine(x0, y0, x1, y1, color, width = 1) {
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.fillRect(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, width, width, color);
    }
  }
  drawText(text, x, y, color, scale = 1, maxWidth = Infinity) {
    let cursor = x;
    const charW = 6 * scale;
    for (const ch of String(text || "")) {
      if (cursor + charW > x + maxWidth) break;
      drawGlyph(this, ch, cursor, y, color, scale);
      cursor += charW;
    }
    return cursor - x;
  }
  drawWrappedText(text, x, y, maxWidth, maxHeight, color, scale = 1) {
    const words = String(text || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
    const lineH = 9 * scale;
    const maxLines = Math.max(1, Math.floor(maxHeight / lineH));
    let line = "", yy = y, used = 0;
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (textWidth(next, scale) <= maxWidth) {
        line = next;
        continue;
      }
      this.drawText(line, x, yy, color, scale, maxWidth);
      used++;
      if (used >= maxLines) return used;
      yy += lineH;
      line = word;
    }
    if (line && used < maxLines) {
      this.drawText(line, x, yy, color, scale, maxWidth);
      used++;
    }
    return used;
  }
  sample(x, y) {
    const ix = Math.max(0, Math.min(this.width - 1, Math.round(x))), iy = Math.max(0, Math.min(this.height - 1, Math.round(y)));
    const i = (iy * this.width + ix) * 4;
    return Array.from(this.data.slice(i, i + 4));
  }
  countNonBackground(bg = [0, 0, 0, 255]) {
    let count = 0;
    for (let i = 0; i < this.data.length; i += 4) if (this.data[i] !== bg[0] || this.data[i + 1] !== bg[1] || this.data[i + 2] !== bg[2]) count++;
    return count;
  }
  // B"H 2026-10-09 (speed): direct RGBA->PNG, no per-pixel closures (23x faster).
  toPngBuffer() {
    return rgbPngFromRgba(this.data, this.width, this.height);
  }
  // B"H 2026-10-09: composite an RGBA buffer ({width,height,data}, device px)
  // onto this surface at device coords (x,y), source-over, honoring the
  // active clip. Used by box-shadow / text-shadow painters.
  //
  // B"H (compositor): opts.srcRect {x0,y0,x1,y1} limits the source region
  // composited (device px) — opacity-group blits only touch the group's
  // bounds instead of the whole surface. opts.alphaScale (0..1) folds a
  // group-opacity multiply into the same pass, replacing the old separate
  // full-surface scaleSurfaceAlpha pass. Both default to no-ops, so
  // existing callers are behavior-identical.
  blitFrom(src, x, y, opts = {}) {
    if (!src || !src.data) return;
    const sw = src.width | 0, sh = src.height | 0;
    if (sw < 1 || sh < 1) return;
    const sdata = src.data;
    const ddata = this.data, dw = this.width, dh = this.height;
    const ox = Math.round(x), oy = Math.round(y);
    let x0 = Math.max(0, -ox), y0 = Math.max(0, -oy);
    let x1 = Math.min(sw, dw - ox), y1 = Math.min(sh, dh - oy);
    const c = this._clip;
    if (c) {
      x0 = Math.max(x0, c[0] - ox);
      y0 = Math.max(y0, c[1] - oy);
      x1 = Math.min(x1, c[2] - ox);
      y1 = Math.min(y1, c[3] - oy);
    }
    const r = opts.srcRect;
    if (r) {
      x0 = Math.max(x0, Math.floor(r.x0 || 0));
      y0 = Math.max(y0, Math.floor(r.y0 || 0));
      x1 = Math.min(x1, Math.ceil(r.x1 === void 0 ? sw : r.x1));
      y1 = Math.min(y1, Math.ceil(r.y1 === void 0 ? sh : r.y1));
    }
    if (x1 <= x0 || y1 <= y0) return;
    const ak = opts.alphaScale;
    const useScale = ak !== void 0 && ak < 1;
    for (let sy = y0; sy < y1; sy++) {
      const dy = oy + sy;
      const srow = sy * sw * 4, drow = dy * dw * 4;
      for (let sx = x0; sx < x1; sx++) {
        const si = srow + sx * 4;
        let a255 = sdata[si + 3];
        if (useScale) a255 = Math.round(a255 * ak);
        if (a255 <= 0) continue;
        const di = drow + (ox + sx) * 4;
        if (a255 >= 255) {
          ddata[di] = sdata[si];
          ddata[di + 1] = sdata[si + 1];
          ddata[di + 2] = sdata[si + 2];
          ddata[di + 3] = 255;
        } else {
          const a = a255 / 255, ia = 1 - a;
          ddata[di] = Math.round(sdata[si] * a + ddata[di] * ia);
          ddata[di + 1] = Math.round(sdata[si + 1] * a + ddata[di + 1] * ia);
          ddata[di + 2] = Math.round(sdata[si + 2] * a + ddata[di + 2] * ia);
          ddata[di + 3] = 255;
        }
      }
    }
  }
  writeRaw(i, color) {
    this.data[i] = color[0];
    this.data[i + 1] = color[1];
    this.data[i + 2] = color[2];
    this.data[i + 3] = color[3] ?? 255;
  }
  // B"H 2026-10-09: Packed writeRaw. Zero array indexing.
  writeRawPacked(i, packed) {
    this.data[i] = packed >>> 24 & 255;
    this.data[i + 1] = packed >>> 16 & 255;
    this.data[i + 2] = packed >>> 8 & 255;
    this.data[i + 3] = packed & 255;
  }
  // B"H 2026-10-09: Packed clear. Uses writeRawPacked in the loop.
  clearPacked(packed) {
    for (let i = 0; i < this.data.length; i += 4) this.writeRawPacked(i, packed);
  }
  // B"H 2026-10-09 (scroll compositor): raw opaque blit — memcpy a rectangle
  // from src (no alpha blending, no clip). Row-wise typed-array copies are
  // ~50x faster than blitFrom's per-pixel blend loop. Used for tile/strip
  // compositing where the source is fully painted and opaque.
  blitRaw(src, sx, sy, w, h, dx, dy) {
    if (!src || !src.data) return;
    sx |= 0;
    sy |= 0;
    w |= 0;
    h |= 0;
    dx |= 0;
    dy |= 0;
    if (sx < 0) {
      w += sx;
      dx -= sx;
      sx = 0;
    }
    if (sy < 0) {
      h += sy;
      dy -= sy;
      sy = 0;
    }
    if (dx < 0) {
      w += dx;
      sx -= dx;
      dx = 0;
    }
    if (dy < 0) {
      h += dy;
      sy -= dy;
      dy = 0;
    }
    w = Math.min(w, src.width - sx, this.width - dx);
    h = Math.min(h, src.height - sy, this.height - dy);
    if (w <= 0 || h <= 0) return;
    const sdata = src.data, ddata = this.data;
    const sw4 = src.width * 4, dw4 = this.width * 4;
    const rowBytes = w * 4;
    for (let r = 0; r < h; r++) {
      const si = (sy + r) * sw4 + sx * 4;
      const di = (dy + r) * dw4 + dx * 4;
      ddata.set(sdata.subarray(si, si + rowBytes), di);
    }
  }
  // ------------------------------------------------------------------
  // B"H 2026-10-09 (canvas 2D correctness): alpha-correct compositing
  // primitives for canvas replay. The page pipeline keeps using the
  // opaque-optimized setPixel/fillRect above; these new methods preserve
  // real alpha and honor an optional path-clip mask, so canvas clearRect,
  // globalAlpha, composite ops, and clip() behave like a real canvas.
  // ------------------------------------------------------------------
  /** Path-clip mask: Uint8Array(w*h), 1 = paint allowed. null = no mask. */
  setClipMask(mask) {
    this._clipMask = mask || null;
  }
  getClipMask() {
    return this._clipMask || null;
  }
  _maskOk(ix, iy) {
    const m = this._clipMask;
    return !m || m[iy * this.width + ix] !== 0;
  }
  /**
   * Porter-Duff composite of one src pixel onto the surface, preserving
   * real alpha in the output. Fast path for the common source-over case.
   * r,g,b,a: 0-255. op: any canvas globalCompositeOperation value.
   */
  blendPixel(x, y, r, g, b, a, op = "source-over") {
    const ix = Math.round(x), iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    if (!this._inClip(ix, iy) || !this._maskOk(ix, iy)) return;
    this._blendPixelFast(ix, iy, r, g, b, a, op);
  }
  /**
   * Blend one pixel with NO bounds/clip/mask checks — the caller guarantees
   * ix, iy are in range and paintable. Hot path for span fills and blits.
   */
  _blendPixelFast(ix, iy, r, g, b, a, op) {
    const i = (iy * this.width + ix) * 4;
    const d = this.data;
    const sa = (a | 0) / 255;
    if (sa <= 0) return;
    if (!op || op === "source-over") {
      if (sa >= 1) {
        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = b;
        d[i + 3] = 255;
        return;
      }
      const da2 = d[i + 3] / 255, ia = 1 - sa;
      const oa2 = sa + da2 * ia;
      const inv2 = oa2 > 0 ? 1 / oa2 : 0;
      d[i] = Math.round((r * sa + d[i] * da2 * ia) * inv2);
      d[i + 1] = Math.round((g * sa + d[i + 1] * da2 * ia) * inv2);
      d[i + 2] = Math.round((b * sa + d[i + 2] * da2 * ia) * inv2);
      d[i + 3] = Math.round(oa2 * 255);
      return;
    }
    const da = d[i + 3] / 255;
    const sr = r / 255, sg = g / 255, sb = b / 255;
    const dr = d[i] / 255, dg = d[i + 1] / 255, db = d[i + 2] / 255;
    const SP0 = sr * sa, SP1 = sg * sa, SP2 = sb * sa;
    const DP0 = dr * da, DP1 = dg * da, DP2 = db * da;
    let P0, P1, P2, oa;
    switch (op) {
      case "destination-over":
        oa = da + sa * (1 - da);
        P0 = DP0 + SP0 * (1 - da);
        P1 = DP1 + SP1 * (1 - da);
        P2 = DP2 + SP2 * (1 - da);
        break;
      case "copy":
        oa = sa;
        P0 = SP0;
        P1 = SP1;
        P2 = SP2;
        break;
      case "lighter":
        oa = Math.min(1, sa + da);
        P0 = Math.min(1, SP0 + DP0);
        P1 = Math.min(1, SP1 + DP1);
        P2 = Math.min(1, SP2 + DP2);
        break;
      case "xor":
        oa = sa + da - 2 * sa * da;
        P0 = SP0 * (1 - da) + DP0 * (1 - sa);
        P1 = SP1 * (1 - da) + DP1 * (1 - sa);
        P2 = SP2 * (1 - da) + DP2 * (1 - sa);
        break;
      case "source-in":
        oa = sa * da;
        P0 = SP0 * da;
        P1 = SP1 * da;
        P2 = SP2 * da;
        break;
      case "source-out":
        oa = sa * (1 - da);
        P0 = SP0 * (1 - da);
        P1 = SP1 * (1 - da);
        P2 = SP2 * (1 - da);
        break;
      case "destination-in":
        oa = da * sa;
        P0 = DP0 * sa;
        P1 = DP1 * sa;
        P2 = DP2 * sa;
        break;
      case "destination-out":
        oa = da * (1 - sa);
        P0 = DP0 * (1 - sa);
        P1 = DP1 * (1 - sa);
        P2 = DP2 * (1 - sa);
        break;
      case "source-atop":
        oa = da;
        P0 = SP0 * da + DP0 * (1 - sa);
        P1 = SP1 * da + DP1 * (1 - sa);
        P2 = SP2 * da + DP2 * (1 - sa);
        break;
      case "destination-atop":
        oa = sa;
        P0 = DP0 * sa + SP0 * (1 - da);
        P1 = DP1 * sa + SP1 * (1 - da);
        P2 = DP2 * sa + SP2 * (1 - da);
        break;
      default:
        oa = sa + da * (1 - sa);
        P0 = SP0 + DP0 * (1 - sa);
        P1 = SP1 + DP1 * (1 - sa);
        P2 = SP2 + DP2 * (1 - sa);
        break;
    }
    if (oa <= 0) {
      d[i] = 0;
      d[i + 1] = 0;
      d[i + 2] = 0;
      d[i + 3] = 0;
      return;
    }
    const inv = 1 / oa;
    d[i] = Math.round(Math.max(0, Math.min(1, P0 * inv)) * 255);
    d[i + 1] = Math.round(Math.max(0, Math.min(1, P1 * inv)) * 255);
    d[i + 2] = Math.round(Math.max(0, Math.min(1, P2 * inv)) * 255);
    d[i + 3] = Math.round(Math.max(0, Math.min(1, oa)) * 255);
  }
  /** Direct write with no blending (clearRect semantics), honors clip+mask. */
  writePixel(x, y, r, g, b, a) {
    const ix = Math.round(x), iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    if (!this._inClip(ix, iy) || !this._maskOk(ix, iy)) return;
    const i = (iy * this.width + ix) * 4;
    this.data[i] = r;
    this.data[i + 1] = g;
    this.data[i + 2] = b;
    this.data[i + 3] = a;
  }
  /** Erase a rect to transparent black (real clearRect). Honors clip+mask. */
  clearRectRaw(x, y, w, h) {
    const sx = Math.max(0, Math.floor(x)), sy = Math.max(0, Math.floor(y));
    const ex = Math.min(this.width, Math.ceil(x + w)), ey = Math.min(this.height, Math.ceil(y + h));
    const [csx, csy, cex, cey] = this._clipBounds(sx, sy, ex, ey);
    const d = this.data, W = this.width, m = this._clipMask;
    for (let yy = csy; yy < cey; yy++) {
      const row = yy * W;
      for (let xx = csx; xx < cex; xx++) {
        if (m && m[row + xx] === 0) continue;
        const i = (row + xx) * 4;
        d[i] = 0;
        d[i + 1] = 0;
        d[i + 2] = 0;
        d[i + 3] = 0;
      }
    }
  }
  /**
   * Fill one horizontal span with an RGBA color under a composite op.
   * Fast path: opaque source-over writes directly (no per-pixel call).
   */
  fillSpanAlpha(y, x0, x1, r, g, b, a, op = "source-over") {
    const yy = Math.round(y);
    if (yy < 0 || yy >= this.height) return;
    let xa = Math.max(0, Math.floor(x0)), xb = Math.min(this.width, Math.ceil(x1));
    const c = this._clip;
    if (c) {
      if (yy < c[1] || yy >= c[3]) return;
      xa = Math.max(xa, c[0]);
      xb = Math.min(xb, c[2]);
    }
    if (xb <= xa) return;
    const m = this._clipMask, row = yy * this.width, d = this.data;
    const sa = (a | 0) / 255;
    if (sa <= 0) return;
    if ((!op || op === "source-over") && sa >= 1 && !m) {
      for (let xx = xa; xx < xb; xx++) {
        const i = (row + xx) * 4;
        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = b;
        d[i + 3] = 255;
      }
      return;
    }
    for (let xx = xa; xx < xb; xx++) {
      if (m && m[row + xx] === 0) continue;
      this._blendPixelFast(xx, yy, r, g, b, a, op);
    }
  }
  /**
   * Composite a whole RGBA surface onto this one with globalAlpha and a
   * composite op, preserving real alpha. Honors clip rect + mask.
   */
  blitAlpha(src, dx, dy, alpha = 1, op = "source-over") {
    if (!src || !src.data) return;
    const sw = src.width | 0, sh = src.height | 0;
    if (sw < 1 || sh < 1) return;
    const sdata = src.data, dW = this.width, dH = this.height;
    const ox = Math.round(dx), oy = Math.round(dy);
    let x0 = Math.max(0, -ox), y0 = Math.max(0, -oy);
    let x1 = Math.min(sw, dW - ox), y1 = Math.min(sh, dH - oy);
    const c = this._clip;
    if (c) {
      x0 = Math.max(x0, c[0] - ox);
      y0 = Math.max(y0, c[1] - oy);
      x1 = Math.min(x1, c[2] - ox);
      y1 = Math.min(y1, c[3] - oy);
    }
    if (x1 <= x0 || y1 <= y0) return;
    const m = this._clipMask;
    if ((!op || op === "source-over") && !m) {
      const d = this.data;
      for (let sy = y0; sy < y1; sy++) {
        const dy2 = oy + sy, srow = sy * sw, drow = (dy2 * dW + ox) * 4;
        for (let sx = x0; sx < x1; sx++) {
          const si = (srow + sx) * 4;
          const sa8 = sdata[si + 3];
          if (sa8 === 0) continue;
          const di = drow + sx * 4;
          if (alpha >= 1 && sa8 === 255) {
            d[di] = sdata[si];
            d[di + 1] = sdata[si + 1];
            d[di + 2] = sdata[si + 2];
            d[di + 3] = 255;
            continue;
          }
          const sa = sa8 / 255 * alpha, ia = 1 - sa;
          const da = d[di + 3] / 255;
          const oa = sa + da * ia;
          const inv = oa > 0 ? 1 / oa : 0;
          d[di] = Math.round((sdata[si] * sa + d[di] * da * ia) * inv);
          d[di + 1] = Math.round((sdata[si + 1] * sa + d[di + 1] * da * ia) * inv);
          d[di + 2] = Math.round((sdata[si + 2] * sa + d[di + 2] * da * ia) * inv);
          d[di + 3] = Math.round(oa * 255);
        }
      }
      return;
    }
    for (let sy = y0; sy < y1; sy++) {
      const dy2 = oy + sy, srow = sy * sw;
      for (let sx = x0; sx < x1; sx++) {
        if (m && m[dy2 * dW + ox + sx] === 0) continue;
        const si = (srow + sx) * 4;
        const sa = sdata[si + 3] / 255 * alpha;
        if (sa <= 0) continue;
        this._blendPixelFast(ox + sx, dy2, sdata[si], sdata[si + 1], sdata[si + 2], Math.round(sa * 255), op);
      }
    }
  }
  /**
   * Tint for canvas shadows: rgb := color.rgb, a := a * color.a.
   * Used after rasterizing a blurred white silhouette.
   */
  tintWith(color) {
    const d = this.data;
    const r = color[0] | 0, g = color[1] | 0, b = color[2] | 0;
    const k = (color[3] ?? 255) / 255;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
      d[i + 3] = Math.round(d[i + 3] * k);
    }
  }
  /**
   * Alpha-aware text via the 5x7 glyph atlas. Each set-pixel run becomes a
   * span fill so globalAlpha / composite ops / clip masks apply correctly.
   */
  drawTextAlpha(text, x, y, color, scale = 1, maxWidth = Infinity, op = "source-over") {
    const r = color[0] | 0, g = color[1] | 0, b = color[2] | 0, a = color[3] ?? 255;
    let cursor = x;
    const charW = 6 * scale;
    for (const ch of String(text || "")) {
      if (cursor + charW > x + maxWidth) break;
      const rows = GLYPHS[ch] || GLYPHS[ch.toUpperCase?.()] || GLYPHS["?"];
      for (let yy = 0; yy < rows.length; yy++) {
        const rowS = rows[yy];
        let run = -1;
        for (let xx = 0; xx <= 5; xx++) {
          const bit = xx < 5 ? rowS[xx] : "0";
          if (bit === "1" && run < 0) run = xx;
          if (bit !== "1" && run >= 0) {
            const x0 = cursor + run * scale, x1 = cursor + xx * scale;
            for (let syy = 0; syy < scale; syy++) {
              this.fillSpanAlpha(y + yy * scale + syy, x0, x1, r, g, b, a, op);
            }
            run = -1;
          }
        }
      }
      cursor += charW;
    }
    return cursor - x;
  }
};
var textWidthCache = /* @__PURE__ */ new Map();
function textWidth(text, scale = 1) {
  const key = `${text}|${scale}`;
  let v = textWidthCache.get(key);
  if (v === void 0) {
    v = String(text || "").length * 6 * scale;
    if (textWidthCache.size >= 8192) textWidthCache.clear();
    textWidthCache.set(key, v);
  }
  return v;
}
function cssColor(value, fallback = [0, 0, 0, 255]) {
  return parseColor(value, fallback);
}
var GLYPHS = Object.freeze({
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "_": ["00000", "00000", "00000", "00000", "00000", "00000", "11111"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  '"': ["01010", "01010", "01010", "00000", "00000", "00000", "00000"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  "C": ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  "G": ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
  "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  "I": ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  "J": ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  "W": ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  "X": ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
  // B"H 2026-10-09 (css-worker-2): list-marker + quote glyphs. ::marker
  // bullets fell back to "?" — a real disc renders for disc/square/circle
  // markers and list-style-image fallbacks.
  "\u2022": ["00000", "00000", "01110", "01110", "01110", "00000", "00000"],
  "\u25CB": ["00000", "00000", "01110", "01010", "01110", "00000", "00000"],
  "\u25AA": ["00000", "00000", "01110", "01110", "01110", "00000", "00000"],
  "\u25C6": ["00000", "00100", "01110", "11111", "01110", "00100", "00000"],
  "\u201C": ["01010", "01010", "01010", "00000", "00000", "00000", "00000"],
  "\u201D": ["01010", "01010", "01010", "00000", "00000", "00000", "00000"],
  "\u2018": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "\u2019": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  // B"H 2026-10-09: block elements (for text-shadow / box-shadow glyph shapes).
  "\u2588": ["11111", "11111", "11111", "11111", "11111", "11111", "11111"],
  "\u2580": ["11111", "11111", "11111", "00000", "00000", "00000", "00000"],
  "\u2584": ["00000", "00000", "00000", "00000", "11111", "11111", "11111"],
  "\u258C": ["11000", "11000", "11000", "11000", "11000", "11000", "11000"],
  "\u2590": ["00011", "00011", "00011", "00011", "00011", "00011", "00011"],
  "\u2591": ["10101", "01010", "10101", "01010", "10101", "01010", "10101"],
  "\u2592": ["10101", "11111", "10101", "11111", "10101", "11111", "10101"],
  "\u2593": ["11111", "10101", "11111", "10101", "11111", "11111", "11111"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "\\": ["10000", "01000", "01000", "00100", "00010", "00010", "00001"]
});
function drawGlyph(fb, ch, x, y, color, scale) {
  const rows = GLYPHS[ch] || GLYPHS[ch.toUpperCase?.()] || GLYPHS["?"];
  rows.forEach((row, yy) => [...row].forEach((bit, xx) => {
    if (bit === "1") fb.fillRect(x + xx * scale, y + yy * scale, scale, scale, color);
  }));
}
function normalizeRadii(radii, w, h) {
  const r = {
    tl: (radii.tl || [0, 0]).slice(),
    tr: (radii.tr || [0, 0]).slice(),
    br: (radii.br || [0, 0]).slice(),
    bl: (radii.bl || [0, 0]).slice()
  };
  const W = Math.max(1, Number(w) || 1), H = Math.max(1, Number(h) || 1);
  let f = 1;
  const pairs2 = [
    [r.tl[0] + r.tr[0], W],
    [r.bl[0] + r.br[0], W],
    [r.tl[1] + r.bl[1], H],
    [r.tr[1] + r.br[1], H]
  ];
  for (const [sum2, dim2] of pairs2) {
    if (sum2 > dim2 && sum2 > 0) f = Math.min(f, dim2 / sum2);
  }
  if (f < 1) {
    for (const k of ["tl", "tr", "br", "bl"]) {
      r[k][0] *= f;
      r[k][1] *= f;
    }
  }
  return r;
}
function makeRoundedTest(x0, y0, w, h, r) {
  const rr = r || { tl: [0, 0], tr: [0, 0], br: [0, 0], bl: [0, 0] };
  const cs = [];
  const defs = [[x0, y0, rr.tl, 0], [x0 + w, y0, rr.tr, 1], [x0 + w, y0 + h, rr.br, 2], [x0, y0 + h, rr.bl, 3]];
  for (let k = 0; k < 4; k++) {
    const cx = defs[k][0], cy = defs[k][1], rad = defs[k][2], i = defs[k][3];
    const rx = Math.max(0, rad[0] || 0), ry = Math.max(0, rad[1] || 0);
    if (rx <= 0 || ry <= 0) continue;
    cs.push({
      left: i === 0 || i === 3,
      top: i < 2,
      bx: i === 0 || i === 3 ? cx + rx : cx - rx,
      by: i < 2 ? cy + ry : cy - ry,
      ex: i === 0 || i === 3 ? cx + rx : cx - rx,
      ey: i < 2 ? cy + ry : cy - ry,
      rx,
      ry
    });
  }
  if (!cs.length) return null;
  const x1 = x0 + w, y1 = y0 + h;
  return (lx, ly) => {
    if (lx < x0 || ly < y0 || lx > x1 || ly > y1) return false;
    for (let k = 0; k < cs.length; k++) {
      const c = cs[k];
      const inX = c.left ? lx < c.bx : lx > c.bx;
      const inY = c.top ? ly < c.by : ly > c.by;
      if (inX && inY) {
        const dx = (lx - c.ex) / c.rx, dy = (ly - c.ey) / c.ry;
        if (dx * dx + dy * dy > 1) return false;
      }
    }
    return true;
  };
}
function hasAnyRadius(radii) {
  if (!radii) return false;
  for (const k of ["tl", "tr", "br", "bl"]) {
    const c = radii[k];
    if (c && (Number(c[0]) > 0 || Number(c[1]) > 0)) return true;
  }
  return false;
}
function boxBlurRegion(data, w, h, radius) {
  const r = Math.max(1, Math.round(Number(radius) || 1));
  if (!data || w < 1 || h < 1) return;
  const tmp = new Uint8ClampedArray(data.length);
  const w4 = w * 4;
  const n2 = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    const row = y * w4;
    let sr = 0, sg = 0, sb = 0, sa = 0;
    for (let k = -r; k <= r; k++) {
      const o = row + Math.min(w - 1, Math.max(0, k)) * 4;
      sr += data[o];
      sg += data[o + 1];
      sb += data[o + 2];
      sa += data[o + 3];
    }
    for (let x = 0; x < w; x++) {
      const o = row + x * 4;
      tmp[o] = sr / n2;
      tmp[o + 1] = sg / n2;
      tmp[o + 2] = sb / n2;
      tmp[o + 3] = sa / n2;
      const oOut = row + Math.min(w - 1, Math.max(0, x - r)) * 4;
      const oIn = row + Math.min(w - 1, Math.max(0, x + r + 1)) * 4;
      sr += data[oIn] - data[oOut];
      sg += data[oIn + 1] - data[oOut + 1];
      sb += data[oIn + 2] - data[oOut + 2];
      sa += data[oIn + 3] - data[oOut + 3];
    }
  }
  for (let x = 0; x < w; x++) {
    const col = x * 4;
    let sr = 0, sg = 0, sb = 0, sa = 0;
    for (let k = -r; k <= r; k++) {
      const o = Math.min(h - 1, Math.max(0, k)) * w4 + col;
      sr += tmp[o];
      sg += tmp[o + 1];
      sb += tmp[o + 2];
      sa += tmp[o + 3];
    }
    for (let y = 0; y < h; y++) {
      const o = y * w4 + col;
      data[o] = sr / n2;
      data[o + 1] = sg / n2;
      data[o + 2] = sb / n2;
      data[o + 3] = sa / n2;
      const oOut = Math.min(h - 1, Math.max(0, y - r)) * w4 + col;
      const oIn = Math.min(h - 1, Math.max(0, y + r + 1)) * w4 + col;
      sr += tmp[oIn] - tmp[oOut];
      sg += tmp[oIn + 1] - tmp[oOut + 1];
      sb += tmp[oIn + 2] - tmp[oOut + 2];
      sa += tmp[oIn + 3] - tmp[oOut + 3];
    }
  }
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/animation.js
var import_CssTransition = __toESM(require_CssTransition(), 1);
var import_CssTransform2 = __toESM(require_CssTransform(), 1);
var import_CssSelectorMatcher2 = __toESM(require_CssSelectorMatcher(), 1);

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/supersample.js
init_pngTools();
function makeSupersampledSurface(width, height, factor = 2, background2 = [8, 9, 14, 255]) {
  const scale = Math.max(1, Math.min(4, Math.round(Number(factor) || 1)));
  const base = new Framebuffer(width * scale, height * scale, background2);
  return { base, surface: new ScaledFramebuffer(base, scale, width, height), scale };
}
var ScaledFramebuffer = class {
  constructor(base, scale, width, height) {
    this.base = base;
    this.scale = scale;
    this.width = width;
    this.height = height;
  }
  fillRect(x, y, w, h, color) {
    this.base.fillRect(x * this.scale, y * this.scale, w * this.scale, h * this.scale, color);
  }
  gradientRect(x, y, w, h, background2, fallback) {
    this.base.gradientRect(x * this.scale, y * this.scale, w * this.scale, h * this.scale, background2, fallback);
  }
  // B"H 2026-10-09: proxy the rounded-rect methods (added to Framebuffer);
  // radii scale with the surface like any other length.
  fillRoundedRect(x, y, w, h, radii, color) {
    this.base.fillRoundedRect(x * this.scale, y * this.scale, w * this.scale, h * this.scale, scaleRadii(radii, this.scale), color);
  }
  gradientRoundedRect(x, y, w, h, radii, background2, fallback) {
    this.base.gradientRoundedRect(x * this.scale, y * this.scale, w * this.scale, h * this.scale, scaleRadii(radii, this.scale), background2, fallback);
  }
  strokeRoundedRect(x, y, w, h, radii, color, lineWidth = 1) {
    this.base.strokeRoundedRect(x * this.scale, y * this.scale, w * this.scale, h * this.scale, scaleRadii(radii, this.scale), color, Math.max(1, lineWidth * this.scale));
  }
  strokeRect(x, y, w, h, color, lineWidth = 1) {
    this.base.strokeRect(x * this.scale, y * this.scale, w * this.scale, h * this.scale, color, Math.max(1, lineWidth * this.scale));
  }
  drawLine(x0, y0, x1, y1, color, width = 1) {
    this.base.drawLine(x0 * this.scale, y0 * this.scale, x1 * this.scale, y1 * this.scale, color, Math.max(1, width * this.scale));
  }
  drawText(text, x, y, color, scale = 1, maxWidth = Infinity) {
    return this.base.drawText(text, x * this.scale, y * this.scale, color, scale * this.scale, maxWidth * this.scale) / this.scale;
  }
  drawWrappedText(text, x, y, maxWidth, maxHeight, color, scale = 1) {
    return this.base.drawWrappedText(text, x * this.scale, y * this.scale, maxWidth * this.scale, maxHeight * this.scale, color, scale * this.scale);
  }
  sample(x, y) {
    return this.base.sample(x * this.scale, y * this.scale);
  }
  countNonBackground(bg) {
    return countDownsampledNonBackground(this.base, this.scale, this.width, this.height, bg);
  }
  toPngBuffer() {
    return downsampleToPng(this.base, this.scale, this.width, this.height);
  }
  // B"H 2026-10-09: clip + blit delegation (CSS px -> device px). src for
  // blitFrom is a device-px {width,height,data} buffer; callers scale it.
  pushClip(rect) {
    const s = this.scale, r = rect || {};
    this.base.pushClip((r.x0 || 0) * s, (r.y0 || 0) * s, (r.x1 || 0) * s, (r.y1 || 0) * s);
  }
  popClip() {
    this.base.popClip();
  }
  blitFrom(src, x, y, opts) {
    const s = this.scale;
    this.base.blitFrom(src, (x || 0) * s, (y || 0) * s, opts);
  }
};
function downsampleToPng(base, scale, width, height, level) {
  if (scale === 1) return rgbPngFromRgba(base.data, width, height, level == null ? {} : { level });
  return rgbPngDownsampled(base.data, base.width, scale, width, height, level);
}
function scaleRadii(radii, scale) {
  if (!radii || scale === 1) return radii;
  const out = {};
  for (const k of ["tl", "tr", "br", "bl"]) {
    const c = radii[k] || [0, 0];
    out[k] = [c[0] * scale, c[1] * scale];
  }
  return out;
}
function averagePixel(base, scale, x, y) {
  let r = 0, g = 0, b = 0;
  const total = scale * scale;
  for (let yy = 0; yy < scale; yy++) for (let xx = 0; xx < scale; xx++) {
    const p = base.sample(x * scale + xx, y * scale + yy);
    r += p[0];
    g += p[1];
    b += p[2];
  }
  return [Math.round(r / total), Math.round(g / total), Math.round(b / total), 255];
}
function countDownsampledNonBackground(base, scale, width, height, bg = [0, 0, 0, 255]) {
  let count = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const p = averagePixel(base, scale, x, y);
    if (p[0] !== bg[0] || p[1] !== bg[1] || p[2] !== bg[2]) count++;
  }
  return count;
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/cssFilter.js
var KNOWN = /* @__PURE__ */ new Set([
  "blur",
  "brightness",
  "contrast",
  "grayscale",
  "sepia",
  "saturate",
  "hue-rotate",
  "invert",
  "opacity",
  "drop-shadow"
]);
var FILTER_FUNCTIONS = KNOWN;
function parseFilterList(value) {
  const text = String(value || "").trim();
  if (!text || text.toLowerCase() === "none") return [];
  const out = [];
  const re = /([a-zA-Z][a-zA-Z0-9-]*)\s*\(/g;
  let m;
  while (m = re.exec(text)) {
    const name = m[1].toLowerCase();
    const openAt = m.index + m[0].length - 1;
    const closeAt = balancedParenEnd(text, openAt);
    if (closeAt < 0) break;
    out.push({ name, args: splitTopLevel3(text.slice(openAt + 1, closeAt), ",") });
    re.lastIndex = closeAt + 1;
  }
  return out;
}
function balancedParenEnd(text, openAt) {
  let depth = 0;
  for (let at = openAt; at < text.length; at += 1) {
    if (text[at] === "(") depth += 1;
    else if (text[at] === ")") {
      depth -= 1;
      if (depth === 0) return at;
    }
  }
  return -1;
}
function splitTopLevel3(text, sep) {
  const parts = [];
  let start = 0, depth = 0;
  for (let at = 0; at <= text.length; at += 1) {
    const ch = text[at];
    if (ch === "(") depth += 1;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if ((at === text.length || ch === sep) && depth === 0) {
      const part = text.slice(start, at).trim();
      if (part) parts.push(part);
      start = at + 1;
    }
  }
  return parts;
}
function lengthPx(text) {
  const t = String(text || "").trim().toLowerCase();
  if (t.endsWith("px")) return parseFloat(t) || 0;
  const n2 = parseFloat(t);
  return Number.isFinite(n2) ? n2 : 0;
}
function numArg(args, i, fallback) {
  const n2 = parseFloat(args[i]);
  return Number.isFinite(n2) ? n2 : fallback;
}
function angleDeg(text) {
  const t = String(text || "").trim().toLowerCase();
  if (t.endsWith("deg")) return parseFloat(t) || 0;
  if (t.endsWith("rad")) return (parseFloat(t) || 0) * 180 / Math.PI;
  if (t.endsWith("grad")) return (parseFloat(t) || 0) * 0.9;
  if (t.endsWith("turn")) return (parseFloat(t) || 0) * 360;
  const n2 = parseFloat(t);
  return Number.isFinite(n2) ? n2 : 0;
}
function filterPadPx(filters) {
  let pad = 0;
  for (const f of filters) {
    if (f.name === "blur") {
      pad += Math.ceil(lengthPx(f.args[0]) * 2) + 2;
    } else if (f.name === "drop-shadow") {
      const p = splitTopLevel3(f.args.join(" "), " ").filter(Boolean);
      const dx = Math.abs(lengthPx(p[0]));
      const dy = Math.abs(lengthPx(p[1]));
      const bl = p.length > 3 ? lengthPx(p[2]) : 0;
      pad += Math.ceil(dx + dy + bl * 2) + 2;
    }
  }
  return pad;
}
function shadowParts(f) {
  return splitTopLevel3(f.args.join(" "), " ").filter(Boolean);
}
function parseDropShadow(f) {
  const p = shadowParts(f);
  const dx = lengthPx(p[0]);
  const dy = lengthPx(p[1]);
  let blur = 0, colorText = "black";
  if (p.length >= 4) {
    blur = Math.max(0, lengthPx(p[2]));
    colorText = p.slice(3).join(" ");
  } else if (p.length === 3) {
    if (/^-?[\d.]/.test(p[2])) blur = Math.max(0, lengthPx(p[2]));
    else colorText = p[2];
  }
  return { dx, dy, blur, color: parseColor(colorText, [0, 0, 0, 255]) };
}
function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h;
  if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (mx === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}
function hslToRgb(h, s, l) {
  h = (h % 1 + 1) % 1;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const tc = (t) => {
    let tt = (t % 1 + 1) % 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return [Math.round(tc(h + 1 / 3) * 255), Math.round(tc(h) * 255), Math.round(tc(h - 1 / 3) * 255)];
}
function blitOver(dst, dw, dh, src, sw, sh, ox, oy) {
  for (let y = 0; y < dh; y++) {
    const sy = y - oy;
    if (sy < 0 || sy >= sh) continue;
    for (let x = 0; x < dw; x++) {
      const sx = x - ox;
      if (sx < 0 || sx >= sw) continue;
      const si = (sy * sw + sx) * 4;
      const sa = src[si + 3] / 255;
      if (sa <= 0) continue;
      const di = (y * dw + x) * 4;
      const da = dst[di + 3] / 255;
      const outA = sa + da * (1 - sa);
      if (outA <= 0) {
        dst[di + 3] = 0;
        continue;
      }
      const ia = 1 - sa;
      dst[di] = (src[si] * sa + dst[di] * da * ia) / outA;
      dst[di + 1] = (src[si + 1] * sa + dst[di + 1] * da * ia) / outA;
      dst[di + 2] = (src[si + 2] * sa + dst[di + 2] * da * ia) / outA;
      dst[di + 3] = outA * 255;
    }
  }
}
function applyDropShadow(data, w, h, f, scale) {
  const { dx, dy, blur, color } = parseDropShadow(f);
  const [cr, cg, cb, ca] = color;
  const sh = new Uint8ClampedArray(data);
  for (let i = 0; i < sh.length; i += 4) {
    const a = data[i + 3] * (ca / 255);
    sh[i] = cr;
    sh[i + 1] = cg;
    sh[i + 2] = cb;
    sh[i + 3] = a;
  }
  if (blur > 0) boxBlurRegion(sh, w, h, Math.max(1, Math.round(blur * scale / 2)));
  const out = new Uint8ClampedArray(data.length);
  blitOver(out, w, h, sh, w, h, Math.round(dx * scale), Math.round(dy * scale));
  blitOver(out, w, h, data, w, h, 0, 0);
  data.set(out);
}
function applyCssFilters(data, w, h, filters, scale = 1) {
  if (!data || !filters || !filters.length) return;
  const n2 = data.length;
  for (const f of filters) {
    switch (f.name) {
      case "blur": {
        const px2 = Math.max(0, lengthPx(f.args[0]) * scale);
        if (px2 > 0) boxBlurRegion(data, w, h, Math.max(1, Math.round(px2 / 2)));
        break;
      }
      case "brightness": {
        const k = numArg(f.args, 0, 1);
        for (let i = 0; i < n2; i += 4) {
          data[i] *= k;
          data[i + 1] *= k;
          data[i + 2] *= k;
        }
        break;
      }
      case "contrast": {
        const k = numArg(f.args, 0, 1);
        for (let i = 0; i < n2; i += 4) {
          data[i] = (data[i] - 128) * k + 128;
          data[i + 1] = (data[i + 1] - 128) * k + 128;
          data[i + 2] = (data[i + 2] - 128) * k + 128;
        }
        break;
      }
      case "grayscale":
      case "sepia":
      case "saturate": {
        const t = f.name === "saturate" ? numArg(f.args, 0, 1) : numArg(f.args, 0, 1);
        for (let i = 0; i < n2; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          let nr, ng, nb;
          if (f.name === "grayscale") {
            const l = luminance(r, g, b);
            nr = r + (l - r) * t;
            ng = g + (l - g) * t;
            nb = b + (l - b) * t;
          } else if (f.name === "sepia") {
            const sr = 0.393 * r + 0.769 * g + 0.189 * b;
            const sg = 0.349 * r + 0.686 * g + 0.168 * b;
            const sb = 0.272 * r + 0.534 * g + 0.131 * b;
            nr = r + (sr - r) * t;
            ng = g + (sg - g) * t;
            nb = b + (sb - b) * t;
          } else {
            const l = luminance(r, g, b);
            nr = l + (r - l) * t;
            ng = l + (g - l) * t;
            nb = l + (b - l) * t;
          }
          data[i] = nr;
          data[i + 1] = ng;
          data[i + 2] = nb;
        }
        break;
      }
      case "hue-rotate": {
        const deg = angleDeg(f.args[0]);
        if ((deg % 360 + 360) % 360 === 0) break;
        const dh = deg / 360;
        for (let i = 0; i < n2; i += 4) {
          if (data[i + 3] === 0) continue;
          const [hh, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
          const [nr, ng, nb] = hslToRgb(hh + dh, s, l);
          data[i] = nr;
          data[i + 1] = ng;
          data[i + 2] = nb;
        }
        break;
      }
      case "invert": {
        const t = numArg(f.args, 0, 1);
        if (t === 0) break;
        for (let i = 0; i < n2; i += 4) {
          data[i] += (255 - 2 * data[i]) * t;
          data[i + 1] += (255 - 2 * data[i + 1]) * t;
          data[i + 2] += (255 - 2 * data[i + 2]) * t;
        }
        break;
      }
      case "opacity": {
        const k = Math.min(1, Math.max(0, numArg(f.args, 0, 1)));
        for (let i = 3; i < n2; i += 4) data[i] *= k;
        break;
      }
      case "drop-shadow":
        applyDropShadow(data, w, h, f, scale);
        break;
      default:
        break;
    }
  }
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/transform3d.js
var import_CssTransform = __toESM(require_CssTransform(), 1);
var { parseTransform, parseTransformOrigin, angleToRad, lengthToPx } = import_CssTransform.default;
var FN3D = /* @__PURE__ */ new Set(["rotatex", "rotatey", "translatez", "scalez", "perspective", "matrix3d"]);
function styleHas3DTransform(style = {}) {
  const list = parseTransform(style.transform);
  for (const fn of list) {
    if (FN3D.has(fn.name)) return true;
    if ((fn.name === "translate3d" || fn.name === "scale3d") && fn.args[2] !== void 0) {
      if (Math.abs(lengthToPx(fn.args[2])) > 1e-9) return true;
    }
  }
  return false;
}
function identity4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function mul4(a, b) {
  const o = new Array(16);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      o[r * 4 + c] = a[r * 4] * b[c] + a[r * 4 + 1] * b[4 + c] + a[r * 4 + 2] * b[8 + c] + a[r * 4 + 3] * b[12 + c];
    }
  }
  return o;
}
function mTranslate(tx, ty, tz) {
  return [1, 0, 0, tx, 0, 1, 0, ty, 0, 0, 1, tz, 0, 0, 0, 1];
}
function mRotateX(a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1];
}
function mRotateY(a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1];
}
function mRotateZ(a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function mScale(sx, sy, sz) {
  return [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
}
function mSkew(ax, ay) {
  const tx = Math.tan(ax), ty = Math.tan(ay);
  return [1, tx, 0, 0, ty, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function mPerspective(d) {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1 / d, 1];
}
function num(t, fb) {
  const n2 = parseFloat(t);
  return Number.isFinite(n2) ? n2 : fb;
}
function functionToMatrix4(fn, refBox = {}) {
  const w = Number(refBox.width) || 0;
  const h = Number(refBox.height) || 0;
  const fs = Number(refBox.fontSize) || 16;
  const len = (t, base) => lengthToPx(t, base, fs);
  const a = fn.args;
  switch (fn.name) {
    case "translate":
      return mTranslate(len(a[0], w), len(a[1], h), 0);
    case "translatex":
      return mTranslate(len(a[0], w), 0, 0);
    case "translatey":
      return mTranslate(0, len(a[0], h), 0);
    case "translatez":
      return mTranslate(0, 0, len(a[0], 0));
    case "translate3d":
      return mTranslate(len(a[0], w), len(a[1], h), len(a[2], 0));
    case "rotate":
    case "rotatez":
      return mRotateZ(angleToRad(a[0]));
    case "rotatex":
      return mRotateX(angleToRad(a[0]));
    case "rotatey":
      return mRotateY(angleToRad(a[0]));
    case "scale": {
      const sx = num(a[0], 1);
      const sy = a[1] !== void 0 ? num(a[1], 1) : sx;
      return mScale(sx, sy, 1);
    }
    case "scalex":
      return mScale(num(a[0], 1), 1, 1);
    case "scaley":
      return mScale(1, num(a[0], 1), 1);
    case "scalez":
      return mScale(1, 1, num(a[0], 1));
    case "scale3d":
      return mScale(num(a[0], 1), num(a[1], 1), num(a[2], 1));
    case "skew":
      return mSkew(angleToRad(a[0]), angleToRad(a[1] || "0"));
    case "skewx":
      return mSkew(angleToRad(a[0]), 0);
    case "skewy":
      return mSkew(0, angleToRad(a[0]));
    case "perspective": {
      const d = lengthToPx(a[0]);
      return d > 0 ? mPerspective(d) : identity4();
    }
    case "matrix": {
      const v = a.map((x) => parseFloat(x));
      if (v.length < 6 || v.some((x) => !Number.isFinite(x))) return identity4();
      return [v[0], v[2], 0, v[4], v[1], v[3], 0, v[5], 0, 0, 1, 0, 0, 0, 0, 1];
    }
    case "matrix3d": {
      const v = a.map((x) => parseFloat(x));
      if (v.length < 16 || v.some((x) => !Number.isFinite(x))) return identity4();
      const o = new Array(16);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) o[r * 4 + c] = v[c * 4 + r];
      return o;
    }
    default:
      return identity4();
  }
}
function origin3D(value, refBox = {}) {
  const o = parseTransformOrigin(value, refBox);
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean);
  const fs = Number(refBox.fontSize) || 16;
  const z = parts.length >= 3 ? lengthToPx(parts[2], 0, fs) : 0;
  return { x: o.x, y: o.y, z: Number.isFinite(z) ? z : 0 };
}
function composeTransform4(style = {}, refBox = {}) {
  const list = parseTransform(style.transform);
  let M = identity4();
  for (const fn of list) M = mul4(M, functionToMatrix4(fn, refBox));
  const o = origin3D(style["transform-origin"], refBox);
  if (o.x || o.y || o.z) M = mul4(mTranslate(o.x, o.y, o.z), mul4(M, mTranslate(-o.x, -o.y, -o.z)));
  return M;
}
function parsePerspectiveProp(value) {
  const t = String(value || "").trim().toLowerCase();
  if (!t || t === "none") return 0;
  const n2 = lengthToPx(t);
  return n2 > 0 ? n2 : 0;
}
function mergedStyle(node) {
  return { ...node.style || {}, ...node.computedStyle || {} };
}
function computeScene3D(tsrc, byNode = null) {
  const selfStyle = tsrc && tsrc.style || {};
  const selfHas3D = styleHas3DTransform(selfStyle);
  const refBox = {
    width: Math.max(0, Number(tsrc.width) || 0),
    height: Math.max(0, Number(tsrc.height) || 0),
    fontSize: 16
  };
  let M = selfHas3D ? composeTransform4(selfStyle, refBox) : identity4();
  let acc3D = selfHas3D;
  let px2 = Number(tsrc.x) || 0;
  let py = Number(tsrc.y) || 0;
  let curX = px2, curY = py;
  let d = 0;
  let node = tsrc.node ? tsrc.node.parentNode : null;
  let guard = 0;
  while (node && node.nodeType === 1 && guard++ < 64) {
    const st = mergedStyle(node);
    if (d <= 0) {
      const pd = parsePerspectiveProp(st.perspective);
      if (pd > 0) d = pd;
    }
    const t = String(st.transform || "").trim();
    if (t && t.toLowerCase() !== "none") {
      const preserve = String(st["transform-style"] || "").toLowerCase() === "preserve-3d";
      const ancHas3D = styleHas3DTransform(st);
      if (ancHas3D && (preserve || !selfHas3D)) {
        const li = byNode ? byNode.get(node) : null;
        if (!li) {
          node = node.parentNode;
          continue;
        }
        const ax = Number(li.x) || 0, ay = Number(li.y) || 0;
        const MA = composeTransform4(st, {
          width: Math.max(0, Number(li.width) || 0),
          height: Math.max(0, Number(li.height) || 0),
          fontSize: 16
        });
        const ox = curX - ax, oy = curY - ay;
        M = mul4(MA, mul4(mTranslate(ox, oy, 0), M));
        px2 = ax;
        py = ay;
        curX = ax;
        curY = ay;
        acc3D = true;
      } else if (!preserve) {
        break;
      }
    }
    node = node.parentNode;
  }
  if (!acc3D) return null;
  const nz = M[10];
  const backfaceHidden = String(selfStyle["backface-visibility"] || "").toLowerCase() === "hidden" && nz < 0;
  return { M, d, px: px2, py, backfaceHidden };
}
function effectiveRow3(M, d) {
  let m30 = M[12], m31 = M[13], m33 = M[15];
  if (d > 0) {
    m30 += -M[8] / d;
    m31 += -M[9] / d;
    m33 += -M[11] / d;
  }
  return [m30, m31, m33];
}
function projectSceneCorners(scene, rect) {
  const { M, d, px: px2, py } = scene;
  const [m30, m31, m33] = effectiveRow3(M, d);
  const corners = [
    [rect.x, rect.y],
    [rect.x + rect.w, rect.y],
    [rect.x, rect.y + rect.h],
    [rect.x + rect.w, rect.y + rect.h]
  ];
  const out = [];
  for (const [x, y] of corners) {
    const x1 = M[0] * x + M[1] * y + M[3];
    const y1 = M[4] * x + M[5] * y + M[7];
    const w1 = m30 * x + m31 * y + m33;
    if (!(w1 > 0.05)) {
      out.push({ x: 0, y: 0, ok: false });
      continue;
    }
    out.push({ x: (px2 || 0) + x1 / w1, y: (py || 0) + y1 / w1, ok: true });
  }
  return out;
}
function blitProjective(destFb, srcBase, scene, tw, th, ox, oy, scale) {
  const { M, d, px: px2, py } = scene;
  const r00 = M[0], r01 = M[1], t0 = M[3];
  const r10 = M[4], r11 = M[5], t1 = M[7];
  const [m30, m31, m33] = effectiveRow3(M, d);
  const cwCss = srcBase.width / scale, chCss = srcBase.height / scale;
  const corners = projectSceneCorners(scene, { x: -ox, y: -oy, w: cwCss, h: chCss });
  const good = corners.filter((c) => c.ok);
  if (!good.length) return;
  const xs = good.map((c) => c.x), ys = good.map((c) => c.y);
  const x0 = Math.floor(Math.min(...xs)), x1 = Math.ceil(Math.max(...xs));
  const y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
  const destBase = destFb && destFb.base ? destFb.base : destFb;
  const ds = destFb && destFb.scale || 1;
  if (!destBase || !destBase.data) return;
  const sw = srcBase.width, sh = srcBase.height;
  const sdata = srcBase.data, ddata = destBase.data;
  const dw = destBase.width, dh = destBase.height;
  for (let cy = y0; cy < y1; cy++) {
    for (let cx = x0; cx < x1; cx++) {
      const X = cx - (px2 || 0);
      const Y = cy - (py || 0);
      const A = r00 - X * m30;
      const B = r01 - X * m31;
      const C = r10 - Y * m30;
      const D = r11 - Y * m31;
      const E = X * m33 - t0;
      const F = Y * m33 - t1;
      const det = A * D - B * C;
      if (!det || !Number.isFinite(det) || Math.abs(det) < 1e-12) continue;
      const ux = (E * D - B * F) / det;
      const uy = (A * F - E * C) / det;
      if (!Number.isFinite(ux) || !Number.isFinite(uy)) continue;
      const w1 = m30 * ux + m31 * uy + m33;
      if (!(w1 > 0.05)) continue;
      const sx = Math.round((ux + ox) * scale);
      const sy = Math.round((uy + oy) * scale);
      if (sx < 0 || sy < 0 || sx >= sw || sy >= sh) continue;
      const si = (sy * sw + sx) * 4;
      const a = sdata[si + 3];
      if (a <= 4) continue;
      const dx0 = Math.round(cx * ds);
      const dy0 = Math.round(cy * ds);
      const alpha = a / 255;
      const ia = 1 - alpha;
      for (let yy = 0; yy < ds; yy++) {
        const dy = dy0 + yy;
        if (dy < 0 || dy >= dh) continue;
        for (let xx = 0; xx < ds; xx++) {
          const dx = dx0 + xx;
          if (dx < 0 || dx >= dw) continue;
          const di = (dy * dw + dx) * 4;
          ddata[di] = Math.round(sdata[si] * alpha + ddata[di] * ia);
          ddata[di + 1] = Math.round(sdata[si + 1] * alpha + ddata[di + 1] * ia);
          ddata[di + 2] = Math.round(sdata[si + 2] * alpha + ddata[di + 2] * ia);
          ddata[di + 3] = 255;
        }
      }
    }
  }
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/dom-painter/blendClipMask.js
var KNOWN_BLENDS = /* @__PURE__ */ new Set([
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "difference",
  "exclusion",
  "hard-light",
  "soft-light"
]);
function parseMixBlendMode(style = {}) {
  const v = String(style["mix-blend-mode"] || "").trim().toLowerCase();
  if (!v || v === "normal") return null;
  return KNOWN_BLENDS.has(v) ? v : null;
}
function blendChannel(mode, cs, cb) {
  switch (mode) {
    case "multiply":
      return cs * cb;
    case "screen":
      return cs + cb - cs * cb;
    case "overlay":
      return cb <= 0.5 ? 2 * cs * cb : 1 - 2 * (1 - cs) * (1 - cb);
    case "darken":
      return Math.min(cs, cb);
    case "lighten":
      return Math.max(cs, cb);
    case "difference":
      return Math.abs(cs - cb);
    case "exclusion":
      return cs + cb - 2 * cs * cb;
    case "hard-light":
      return cs <= 0.5 ? 2 * cs * cb : 1 - 2 * (1 - cs) * (1 - cb);
    case "soft-light": {
      const d = cb <= 0.25 ? ((16 * cb - 12) * cb + 4) * cb : Math.sqrt(cb);
      return cs <= 0.5 ? cb - (1 - 2 * cs) * cb * (1 - cb) : cb + (2 * cs - 1) * (d - cb);
    }
    case "color-dodge":
      return cs === 1 ? 1 : Math.min(1, cb / (1 - cs));
    case "color-burn":
      return cs === 0 ? 0 : Math.max(0, 1 - (1 - cb) / cs);
    default:
      return cs;
  }
}
function blendCompositePixel(sr, sg, sb, sa, dr, dg, db, da, mode) {
  const as = sa / 255, ab = da / 255;
  const cs = [sr / 255, sg / 255, sb / 255];
  const cb = [dr / 255, dg / 255, db / 255];
  const b = [blendChannel(mode, cs[0], cb[0]), blendChannel(mode, cs[1], cb[1]), blendChannel(mode, cs[2], cb[2])];
  const ao = as + ab * (1 - as);
  const out = [0, 0, 0, Math.round(ao * 255)];
  if (ao > 0) {
    for (let i = 0; i < 3; i++) {
      const co = as * (1 - ab) * cs[i] + as * ab * b[i] + (1 - as) * ab * cb[i];
      out[i] = Math.round(co / ao * 255);
    }
  }
  return out;
}
function parseLen(token, against) {
  const t = String(token || "").trim().toLowerCase();
  if (!t) return 0;
  if (t === "center") return against / 2;
  if (t === "left" || t === "top") return 0;
  if (t === "right" || t === "bottom") return against;
  if (t.endsWith("%")) return (Number(t.slice(0, -1)) || 0) / 100 * against;
  const m = t.match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : 0;
}
function splitArgs(text) {
  return String(text || "").replace(/,/g, " ").split(/\s+/).filter(Boolean);
}
function parseClipPath(value, w, h) {
  const v = String(value || "").trim().toLowerCase();
  if (!v || v === "none") return null;
  const m = v.match(/^([a-z-]+)\(([\s\S]*)\)$/);
  if (!m) return null;
  const fn = m[1], body = m[2].trim();
  const W = Math.max(1, w), H = Math.max(1, h);
  if (fn === "circle" || fn === "ellipse") {
    const parts = splitArgs(body);
    const atIdx = parts.indexOf("at");
    const shapeToks = atIdx >= 0 ? parts.slice(0, atIdx) : parts;
    const posToks = atIdx >= 0 ? parts.slice(atIdx + 1) : [];
    const cx = posToks[0] !== void 0 ? parseLen(posToks[0], W) : W / 2;
    const cy = posToks[1] !== void 0 ? parseLen(posToks[1], H) : H / 2;
    if (fn === "circle") {
      const rTok = shapeToks[0] || "50%";
      const r = rTok.endsWith("%") ? (Number(rTok.slice(0, -1)) || 0) / 100 * (Math.sqrt(W * W + H * H) / Math.SQRT2) : parseLen(rTok, Math.min(W, H));
      return { kind: "circle", test: (lx, ly) => (lx - cx) ** 2 + (ly - cy) ** 2 <= r * r };
    }
    const rx = shapeToks[0] !== void 0 ? parseLen(shapeToks[0], W) : W / 2;
    const ry = shapeToks[1] !== void 0 ? parseLen(shapeToks[1], H) : H / 2;
    return {
      kind: "ellipse",
      test: (lx, ly) => ((lx - cx) / Math.max(rx, 1e-3)) ** 2 + ((ly - cy) / Math.max(ry, 1e-3)) ** 2 <= 1
    };
  }
  if (fn === "inset") {
    const roundIdx = body.toLowerCase().indexOf("round");
    const lenPart = roundIdx >= 0 ? body.slice(0, roundIdx) : body;
    const toks = splitArgs(lenPart);
    const vals = toks.map((t) => parseLen(t, 0));
    const [t0 = 0, r0 = t0, b0 = t0, l0 = r0] = vals;
    const x0 = l0, y0 = t0, x1 = W - r0, y1 = H - b0;
    let radii = { tl: [0, 0], tr: [0, 0], br: [0, 0], bl: [0, 0] };
    if (roundIdx >= 0) {
      const rt = splitArgs(body.slice(roundIdx + 5));
      const q = rt.map((x) => parseLen(x, 0));
      const [a = 0, b = a, c = a, d = b] = q;
      radii = { tl: [a, a], tr: [b, b], br: [c, c], bl: [d, d] };
    }
    const r = normalizeRadii(radii, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
    const roundedTest = makeRoundedTest(x0, y0, x1 - x0, y1 - y0, r);
    return { kind: "inset", test: roundedTest || ((lx, ly) => lx >= x0 && ly >= y0 && lx <= x1 && ly <= y1) };
  }
  if (fn === "polygon") {
    const pts = [];
    for (const pair of String(body).split(",")) {
      const toks = splitArgs(pair);
      if (toks.length < 2) continue;
      pts.push([parseLen(toks[0], W), parseLen(toks[1], H)]);
    }
    if (pts.length < 3) return null;
    return {
      kind: "polygon",
      test: (lx, ly) => {
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i], [xj, yj] = pts[j];
          if (yi > ly !== yj > ly && lx < (xj - xi) * (ly - yi) / (yj - yi) + xi) inside = !inside;
        }
        return inside;
      }
    };
  }
  return null;
}
function parseMask(style = {}) {
  const v = String(style["mask-image"] || style["-webkit-mask-image"] || style["mask"] || "").trim();
  if (!v || v.toLowerCase() === "none") return null;
  if (!/gradient\(/i.test(v)) return null;
  return { image: v };
}
function parseMaskStops(args) {
  const stops = [];
  for (const raw of args) {
    const t = String(raw).trim();
    if (!t) continue;
    const pm = t.match(/^(.*?)\s+(-?\d+(?:\.\d+)?)%\s*$/);
    const colorText = pm ? pm[1].trim() : t;
    const pos = pm ? Number(pm[2]) / 100 : null;
    const c = parseColor(colorText, null);
    if (!c) continue;
    stops.push({ color: c, pos });
  }
  if (!stops.length) return stops;
  const n2 = stops.length;
  if (stops[0].pos == null) stops[0].pos = 0;
  if (stops[n2 - 1].pos == null) stops[n2 - 1].pos = 1;
  let runStart = 0;
  for (let i = 1; i < n2; i++) {
    if (stops[i].pos != null) {
      const a = stops[runStart].pos, b = stops[i].pos, gap = i - runStart;
      for (let j = 1; j < gap; j++) stops[runStart + j].pos = a + (b - a) * j / gap;
      runStart = i;
    }
  }
  stops.sort((p, q) => p.pos - q.pos);
  return stops;
}
function stopAlphaAt(stops, t) {
  if (!stops.length) return 1;
  if (stops.length === 1) return stops[0].color[3] / 255;
  let i = 0;
  while (i < stops.length - 2 && t > stops[i + 1].pos) i++;
  const a = stops[i], b = stops[i + 1];
  const span = b.pos - a.pos || 1;
  const local = Math.max(0, Math.min(1, (t - a.pos) / span));
  const ca = a.color[3] / 255, cb = b.color[3] / 255;
  return ca + (cb - ca) * local;
}
function splitTop(text) {
  const out = [];
  let depth = 0, cur = "";
  for (const ch of String(text)) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}
function maskGradientAngle(firstArg) {
  const t = String(firstArg || "").trim().toLowerCase();
  const degMatch = t.match(/^(-?\d+(?:\.\d+)?)(deg|rad|grad|turn)$/);
  if (degMatch) {
    const v = Number(degMatch[1]), unit = degMatch[2];
    const deg = unit === "rad" ? v * 180 / Math.PI : unit === "grad" ? v * 0.9 : unit === "turn" ? v * 360 : v;
    return deg * Math.PI / 180;
  }
  const toMatch = t.match(/^to\s+(.+)$/);
  if (toMatch) {
    const words = toMatch[1].trim().split(/\s+/);
    let dx = 0, dy = 0;
    if (words.includes("right")) dx += 1;
    if (words.includes("left")) dx -= 1;
    if (words.includes("bottom")) dy += 1;
    if (words.includes("top")) dy -= 1;
    if (!dx && !dy) return Math.PI;
    return Math.atan2(dx, -dy);
  }
  return Math.PI;
}
var maskSamplerCache = /* @__PURE__ */ new Map();
function buildMaskSampler(image, w, h) {
  const W = Math.max(1, w), H = Math.max(1, h);
  const rm = String(image).match(/radial-gradient\(([\s\S]*)\)\s*$/i);
  if (rm) {
    const args2 = splitTop(rm[1]);
    let shape = "ellipse", cx = W / 2, cy = H / 2, stopArgs = args2;
    const first = (args2[0] || "").trim().toLowerCase();
    if (/circle|ellipse|at|farthest|closest|contain|cover/.test(first)) {
      stopArgs = args2.slice(1);
      if (first.includes("circle")) shape = "circle";
      const atM = first.match(/at\s+(.+)$/);
      if (atM) {
        const pt = splitArgs(atM[1]);
        cx = pt[0] !== void 0 ? parseLen(pt[0], W) : W / 2;
        cy = pt[1] !== void 0 ? parseLen(pt[1], H) : H / 2;
      }
    }
    const stops2 = parseMaskStops(stopArgs);
    if (!stops2.length) return () => 1;
    let rx, ry;
    if (shape === "circle") {
      rx = ry = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, H - cy), Math.hypot(W - cx, H - cy));
    } else {
      rx = Math.max(cx, W - cx) || 1;
      ry = Math.max(cy, H - cy) || 1;
    }
    return (x, y) => stopAlphaAt(stops2, Math.max(0, Math.min(1, Math.hypot((x - cx) / rx, (y - cy) / ry))));
  }
  const lm = String(image).match(/linear-gradient\(([\s\S]*)\)\s*$/i);
  if (!lm) return () => 1;
  const args = splitTop(lm[1]);
  if (!args.length) return () => 1;
  const probe = args[0].trim().toLowerCase();
  const hasDirection = /^(-?\d+(?:\.\d+)?(deg|rad|grad|turn)|to\s+)/.test(probe);
  const rad = hasDirection ? maskGradientAngle(args[0]) : Math.PI;
  const stops = parseMaskStops(hasDirection ? args.slice(1) : args);
  if (!stops.length) return () => 1;
  const dx = Math.sin(rad), dy = -Math.cos(rad);
  const lineLen = Math.abs(W * dx) + Math.abs(H * dy) || 1;
  return (x, y) => {
    const t = Math.max(0, Math.min(1, 0.5 + ((x - W / 2) * dx + (y - H / 2) * dy) / lineLen));
    return stopAlphaAt(stops, t);
  };
}
function maskSampler(image, w, h) {
  const key = `${image}|${Math.round(w)}x${Math.round(h)}`;
  let fn = maskSamplerCache.get(key);
  if (!fn) {
    if (maskSamplerCache.size > 240) maskSamplerCache.clear();
    fn = buildMaskSampler(image, w, h);
    maskSamplerCache.set(key, fn);
  }
  return fn;
}
function maskAlpha(spec, x, y, w, h) {
  if (!spec) return 1;
  return maskSampler(spec.image, w, h)(x, y);
}
function applyClipMaskToTemp(base, scale, tx0, ty0, item, ownClip, chain, mask) {
  const cw = Math.round(base.width / scale), ch = Math.round(base.height / scale);
  const w = Math.max(1, Number(item.width) || 1), h = Math.max(1, Number(item.height) || 1);
  const ix = Number(item.x) || 0, iy = Number(item.y) || 0;
  const data = base.data, bw = base.width;
  const clips = [];
  if (ownClip) clips.push({ clip: ownClip, page: false });
  for (const c of chain || []) clips.push({ clip: c.clip, page: true, bx: c.box.x, by: c.box.y });
  for (let cy = 0; cy < ch; cy++) {
    for (let cx = 0; cx < cw; cx++) {
      const lx = cx - tx0, ly = cy - ty0;
      let keep = true;
      for (const c of clips) {
        const qx = c.page ? ix + lx - c.bx : lx;
        const qy = c.page ? iy + ly - c.by : ly;
        if (!c.clip.test(qx, qy)) {
          keep = false;
          break;
        }
      }
      let ma = 1;
      if (keep && mask) ma = maskAlpha(mask, lx, ly, w, h);
      if (!keep || ma <= 3e-3) {
        const dx0 = Math.round(cx * scale), dy0 = Math.round(cy * scale);
        for (let yy = 0; yy < scale; yy++) {
          const dy = dy0 + yy;
          if (dy < 0 || dy >= base.height) continue;
          for (let xx = 0; xx < scale; xx++) {
            const dx = dx0 + xx;
            if (dx < 0 || dx >= bw) continue;
            data[(dy * bw + dx) * 4 + 3] = 0;
          }
        }
      } else if (ma < 0.999) {
        const dx0 = Math.round(cx * scale), dy0 = Math.round(cy * scale);
        for (let yy = 0; yy < scale; yy++) {
          const dy = dy0 + yy;
          if (dy < 0 || dy >= base.height) continue;
          for (let xx = 0; xx < scale; xx++) {
            const dx = dx0 + xx;
            if (dx < 0 || dx >= bw) continue;
            const di = (dy * bw + dx) * 4;
            data[di + 3] = Math.round(data[di + 3] * ma);
          }
        }
      }
    }
  }
}
function blitMatrixBlend(destFb, srcBase, m, tx, ty, ox, oy, tb, scale, mode) {
  const det = m[0] * m[3] - m[1] * m[2];
  if (!det || !Number.isFinite(det)) return;
  const inv = [
    m[3] / det,
    -m[1] / det,
    -m[2] / det,
    m[0] / det,
    (m[2] * m[5] - m[3] * m[4]) / det,
    (m[1] * m[4] - m[0] * m[5]) / det
  ];
  const bx = (Number(tb.x) || 0) + (tx || 0);
  const by = (Number(tb.y) || 0) + (ty || 0);
  const bw = Number(tb.width) || 0;
  const bh = Number(tb.height) || 0;
  const x0 = Math.floor(bx), y0 = Math.floor(by);
  const x1 = Math.ceil(bx + bw), y1 = Math.ceil(by + bh);
  const destBase = destFb && destFb.base ? destFb.base : destFb;
  const ds = destFb && destFb.scale || 1;
  if (!destBase || !destBase.data) return;
  const sw = srcBase.width, sh = srcBase.height;
  const sdata = srcBase.data, ddata = destBase.data;
  const dw = destBase.width, dh = destBase.height;
  const out = [0, 0, 0, 0];
  for (let cyy = y0; cyy < y1; cyy++) {
    for (let cxx = x0; cxx < x1; cxx++) {
      const lx = cxx - (tx || 0), ly = cyy - (ty || 0);
      const sx = inv[0] * lx + inv[2] * ly + inv[4] + ox;
      const sy = inv[1] * lx + inv[3] * ly + inv[5] + oy;
      const px2 = Math.round(sx * scale), py = Math.round(sy * scale);
      if (px2 < 0 || py < 0 || px2 >= sw || py >= sh) continue;
      const si = (py * sw + px2) * 4;
      const a = sdata[si + 3];
      if (a <= 4) continue;
      const dx0 = Math.round(cxx * ds), dy0 = Math.round(cyy * ds);
      for (let yy = 0; yy < ds; yy++) {
        const dy = dy0 + yy;
        if (dy < 0 || dy >= dh) continue;
        for (let xx = 0; xx < ds; xx++) {
          const dx = dx0 + xx;
          if (dx < 0 || dx >= dw) continue;
          const di = (dy * dw + dx) * 4;
          const r = blendCompositePixel(
            sdata[si],
            sdata[si + 1],
            sdata[si + 2],
            a,
            ddata[di],
            ddata[di + 1],
            ddata[di + 2],
            ddata[di + 3],
            mode
          );
          ddata[di] = r[0];
          ddata[di + 1] = r[1];
          ddata[di + 2] = r[2];
          ddata[di + 3] = r[3];
        }
      }
    }
  }
}
function blendBlit(destFb, srcBase, dx, dy, mode) {
  const destBase = destFb && destFb.base ? destFb.base : destFb;
  const ds = destFb && destFb.scale || 1;
  if (!destBase || !destBase.data) return;
  const sw = srcBase.width, sh = srcBase.height;
  const sdata = srcBase.data, ddata = destBase.data;
  const dw = destBase.width, dh = destBase.height;
  const cssW = Math.round(sw / ds), cssH = Math.round(sh / ds);
  for (let cy = 0; cy < cssH; cy++) {
    const ty = Math.round((dy + cy) * ds);
    if (ty < 0 || ty >= dh) continue;
    for (let cx = 0; cx < cssW; cx++) {
      const tx = Math.round((dx + cx) * ds);
      if (tx < 0 || tx >= dw) continue;
      const sTop = Math.min(sh - 1, Math.round(cy * ds));
      const sLeft = Math.min(sw - 1, Math.round(cx * ds));
      if (sdata[(sTop * sw + sLeft) * 4 + 3] <= 4) continue;
      for (let yy = 0; yy < ds; yy++) {
        const dy2 = ty + yy;
        if (dy2 < 0 || dy2 >= dh) continue;
        for (let xx = 0; xx < ds; xx++) {
          const dx2 = tx + xx;
          if (dx2 < 0 || dx2 >= dw) continue;
          const di = (dy2 * dw + dx2) * 4;
          const sy2 = Math.min(sh - 1, Math.round(cy * ds) + yy);
          const sx2 = Math.min(sw - 1, Math.round(cx * ds) + xx);
          const s2 = (sy2 * sw + sx2) * 4;
          const r = blendCompositePixel(
            sdata[s2],
            sdata[s2 + 1],
            sdata[s2 + 2],
            sdata[s2 + 3],
            ddata[di],
            ddata[di + 1],
            ddata[di + 2],
            ddata[di + 3],
            mode
          );
          ddata[di] = r[0];
          ddata[di + 1] = r[1];
          ddata[di + 2] = r[2];
          ddata[di + 3] = r[3];
        }
      }
    }
  }
}
function parseBackgroundBlendModes(style = {}) {
  const v = String(style["background-blend-mode"] || "").trim().toLowerCase();
  if (!v || v === "normal") return null;
  const modes = splitTop(v).map((s) => s.trim()).filter(Boolean);
  if (!modes.length) return null;
  return modes.map((m) => KNOWN_BLENDS.has(m) ? m : "normal");
}
function paintBlendedBackground(fb, item, bgImageText, bg, radii, rounded, modes) {
  const x = Number(item.x) || 0, y = Number(item.y) || 0;
  const w = Math.max(1, Math.ceil(Number(item.width) || 1));
  const h = Math.max(1, Math.ceil(Number(item.height) || 1));
  if (bg.color[3] > 0) {
    if (rounded) fb.fillRoundedRect(x, y, w, h, radii, bg.color);
    else fb.fillRect(x, y, w, h, bg.color);
  }
  const layers = splitTop(bgImageText).map((s) => s.trim()).filter(Boolean);
  const scale = fb && fb.scale || 1;
  for (let bi = layers.length - 1; bi >= 0; bi--) {
    const layer = layers[bi];
    const mode = modes[bi % modes.length] || "normal";
    const base = new Framebuffer(w * scale, h * scale, [0, 0, 0, 0]);
    const tmp = new ScaledFramebuffer(base, scale, w, h);
    if (/gradient\(/i.test(layer)) {
      if (rounded) tmp.gradientRoundedRect(0, 0, w, h, radii, layer, bg.color);
      else tmp.gradientRect(0, 0, w, h, layer, bg.color);
    } else {
      const c = parseColor(layer, null);
      if (c && c[3] > 0) {
        if (rounded) tmp.fillRoundedRect(0, 0, w, h, radii, c);
        else tmp.fillRect(0, 0, w, h, c);
      } else continue;
    }
    blendBlit(fb, base, x, y, mode);
  }
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/animation.js
var {
  parseTime,
  parseTimingFunction,
  timingProgress,
  interpolateValue,
  parseTransition,
  transitionForProperty
} = import_CssTransition.default;
var {
  parseTransform: parseTransform2,
  transformRect,
  angleToRad: angleToRad2,
  identityMatrix,
  multiplyMatrix
} = import_CssTransform2.default;
var { matchesCssSelector } = import_CssSelectorMatcher2.default;
function parseKeyframes(cssText) {
  const clean = String(cssText || "").replace(/\/\*[\s\S]*?\*\//g, "");
  const map = {};
  const re = /@(?:-webkit-)?keyframes\s+([a-zA-Z0-9_-]+)\s*\{/gi;
  let m;
  while (m = re.exec(clean)) {
    const name = m[1];
    const openAt = m.index + m[0].length - 1;
    const closeAt = balancedBraceEnd(clean, openAt);
    if (closeAt < 0) continue;
    const frames = parseKeyframeBody(clean.slice(openAt + 1, closeAt));
    if (frames.length) map[name] = frames;
    re.lastIndex = closeAt + 1;
  }
  return map;
}
function balancedBraceEnd(text, openAt) {
  let depth = 0;
  for (let i = openAt; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}
function parseKeyframeBody(body) {
  const frames = [];
  const re = /((?:from|to|\d+(?:\.\d+)?%)(?:\s*,\s*(?:from|to|\d+(?:\.\d+)?%))*)\s*\{([^}]*)\}/gi;
  let m;
  while (m = re.exec(body)) {
    const declarations = parseDeclarations(m[2]);
    for (const sel of m[1].split(",")) {
      const s = sel.trim().toLowerCase();
      const offset = s === "from" ? 0 : s === "to" ? 1 : Math.min(1, Math.max(0, parseFloat(s) / 100));
      frames.push({ offset, declarations });
    }
  }
  frames.sort((a, b) => a.offset - b.offset);
  return frames;
}
function parseDeclarations(text) {
  const out = {};
  for (const part of String(text || "").split(";")) {
    const colon = part.indexOf(":");
    if (colon < 0) continue;
    const prop = part.slice(0, colon).trim().toLowerCase();
    const value = part.slice(colon + 1).trim();
    if (prop && value) out[prop] = value;
  }
  return out;
}
function splitCommaTop(text) {
  const parts = [];
  let start = 0, depth = 0;
  const s = String(text || "");
  for (let i = 0; i <= s.length; i++) {
    const ch = s[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (i === s.length || ch === "," && depth === 0) {
      const part = s.slice(start, i).trim();
      if (part) parts.push(part);
      start = i + 1;
    }
  }
  return parts;
}
var TIMING_RE = /^(linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|cubic-bezier\(|steps\()/i;
function isTimingToken(t) {
  return TIMING_RE.test(t);
}
function defaultAnimation() {
  return {
    name: null,
    duration: 0,
    timing: parseTimingFunction("ease"),
    delay: 0,
    iterationCount: 1,
    direction: "normal",
    fillMode: "none",
    playState: "running"
  };
}
function parseOneAnimation(item) {
  const d = defaultAnimation();
  let sawTime = 0;
  for (const tok of String(item).trim().split(/\s+/).filter(Boolean)) {
    const t = tok.toLowerCase();
    if (isTimingToken(t)) {
      d.timing = parseTimingFunction(tok);
      continue;
    }
    if (/^[\d.]+m?s$/i.test(t)) {
      const ms = parseTime(tok);
      if (!sawTime) {
        d.duration = ms;
        sawTime = 1;
      } else d.delay = ms;
      continue;
    }
    if (t === "infinite") {
      d.iterationCount = Infinity;
      continue;
    }
    if (/^\d+(\.\d+)?$/.test(t)) {
      d.iterationCount = parseFloat(t);
      continue;
    }
    if (t === "normal" || t === "reverse" || t === "alternate" || t === "alternate-reverse") {
      d.direction = t;
      continue;
    }
    if (t === "none" || t === "forwards" || t === "backwards" || t === "both") {
      d.fillMode = t;
      continue;
    }
    if (t === "running" || t === "paused") {
      d.playState = t;
      continue;
    }
    if (d.name == null) d.name = tok;
  }
  return d;
}
var ANIM_LONGHANDS = [
  "animation-name",
  "animation-duration",
  "animation-timing-function",
  "animation-delay",
  "animation-iteration-count",
  "animation-direction",
  "animation-fill-mode",
  "animation-play-state"
];
function parseAnimationList(style = {}) {
  const shRaw = String(style["animation"] || "").trim();
  const sh = shRaw && shRaw.toLowerCase() !== "none" ? splitCommaTop(shRaw).map(parseOneAnimation) : [];
  const lh = {};
  for (const k of ANIM_LONGHANDS) {
    const v = style[k];
    lh[k] = v == null || String(v).trim() === "" ? null : splitCommaTop(String(v));
  }
  const count = Math.max(sh.length, ...Object.values(lh).map((v) => v ? v.length : 0));
  if (count === 0) return [];
  const out = [];
  for (let i = 0; i < count; i++) {
    const d = sh.length ? { ...sh[i % sh.length] } : defaultAnimation();
    if (lh["animation-name"]) d.name = lh["animation-name"][i % lh["animation-name"].length].trim() || "none";
    if (lh["animation-duration"]) d.duration = parseTime(lh["animation-duration"][i % lh["animation-duration"].length]);
    if (lh["animation-timing-function"]) d.timing = parseTimingFunction(lh["animation-timing-function"][i % lh["animation-timing-function"].length]);
    if (lh["animation-delay"]) d.delay = parseTime(lh["animation-delay"][i % lh["animation-delay"].length]);
    if (lh["animation-iteration-count"]) {
      const t = lh["animation-iteration-count"][i % lh["animation-iteration-count"].length].trim().toLowerCase();
      d.iterationCount = t === "infinite" ? Infinity : parseFloat(t) || 0;
    }
    if (lh["animation-direction"]) d.direction = lh["animation-direction"][i % lh["animation-direction"].length].trim().toLowerCase();
    if (lh["animation-fill-mode"]) d.fillMode = lh["animation-fill-mode"][i % lh["animation-fill-mode"].length].trim().toLowerCase();
    if (lh["animation-play-state"]) d.playState = lh["animation-play-state"][i % lh["animation-play-state"].length].trim().toLowerCase();
    if (d.name && d.name.toLowerCase() !== "none") out.push(d);
  }
  return out;
}
var round4 = (v) => Math.round(v * 1e4) / 1e4;
function namedColorResolver(name) {
  const c = parseColor(name, null);
  if (!c) return null;
  return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${round4(c[3] / 255)})`;
}
function interpolateTransform(from, to, t) {
  const f = String(from ?? "").trim();
  const tt = String(to ?? "").trim();
  if (!f || !tt) return t < 0.5 ? f || tt : tt || f;
  if (f === tt) return tt;
  const fl = parseTransform2(f);
  const tl = parseTransform2(tt);
  if (!fl.length || !tl.length || fl.length !== tl.length) return t < 0.5 ? f : tt;
  for (let i = 0; i < fl.length; i++) if (fl[i].name !== tl[i].name) return t < 0.5 ? f : tt;
  return fl.map((fn, i) => `${fn.name}(${interpTransformArgs(fn.name, fn.args, tl[i].args, t).join(", ")})`).join(" ");
}
function interpTransformArgs(name, fa, ta, t) {
  const n2 = Math.max(fa.length, ta.length);
  const out = [];
  for (let i = 0; i < n2; i++) out.push(interpTransformArg(name, fa[i] ?? ta[i] ?? "0", ta[i] ?? fa[i] ?? "0", t));
  return out;
}
function interpTransformArg(name, a, b, t) {
  const lname = String(name).toLowerCase();
  if (lname.startsWith("rotate") || lname.startsWith("skew")) {
    const ad = angleToRad2(a) * 180 / Math.PI;
    const bd = angleToRad2(b) * 180 / Math.PI;
    if (!Number.isFinite(ad) || !Number.isFinite(bd)) return t < 0.5 ? a : b;
    return `${round4(ad + (bd - ad) * t)}deg`;
  }
  const ma = String(a).match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)([a-z%]*)$/i);
  const mb = String(b).match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)([a-z%]*)$/i);
  if (!ma || !mb) return t < 0.5 ? a : b;
  let na = parseFloat(ma[1]);
  let nb = parseFloat(mb[1]);
  let ua = ma[2].toLowerCase();
  const ub = mb[2].toLowerCase();
  if (ua !== ub) {
    if (na === 0) ua = ub;
    else if (nb === 0) {
      nb = na;
    } else return t < 0.5 ? a : b;
  }
  return `${round4(na + (nb - na) * t)}${ua || ub}`;
}
function sampleKeyframes(frames, eased, underlying) {
  let a = frames[0];
  let b = frames[frames.length - 1];
  for (const f of frames) if (f.offset <= eased) a = f;
  for (const f of frames) {
    if (f.offset >= eased) {
      b = f;
      break;
    }
  }
  if (a === b || a.offset === b.offset) return { ...a.declarations };
  const localP = (eased - a.offset) / (b.offset - a.offset);
  const out = {};
  const props = /* @__PURE__ */ new Set([...Object.keys(a.declarations), ...Object.keys(b.declarations)]);
  for (const p of props) {
    const av = a.declarations[p] !== void 0 ? a.declarations[p] : underlying ? underlying[p] : void 0;
    const bv = b.declarations[p] !== void 0 ? b.declarations[p] : av;
    out[p] = p === "transform" ? interpolateTransform(av, bv, localP) : interpolateValue(av ?? "", bv ?? "", localP, namedColorResolver);
  }
  return out;
}
function keyframeDecls(frame) {
  return frame ? { ...frame.declarations } : null;
}
function sampleAnimation(frames, anim, timeMs, underlying) {
  const { duration, delay, iterationCount, direction, fillMode } = anim;
  const local = (anim.playState === "paused" ? 0 : timeMs) - delay;
  if (local < 0) {
    return fillMode === "backwards" || fillMode === "both" ? keyframeDecls(frames[0]) : null;
  }
  if (iterationCount === 0) return null;
  if (duration <= 0) {
    return fillMode === "forwards" || fillMode === "both" ? keyframeDecls(frames[frames.length - 1]) : keyframeDecls(frames[0]);
  }
  const total = duration * iterationCount;
  let iterIndex, iterT;
  if (local >= total) {
    if (fillMode !== "forwards" && fillMode !== "both") return null;
    iterIndex = Math.max(0, Math.ceil(iterationCount) - 1);
    iterT = 1;
  } else {
    iterIndex = Math.floor(local / duration);
    iterT = (local - iterIndex * duration) / duration;
  }
  const odd = iterIndex % 2 === 1;
  if (direction === "reverse" || direction === "alternate" && odd || direction === "alternate-reverse" && !odd) {
    iterT = 1 - iterT;
  }
  const eased = timingProgress(anim.timing, iterT);
  return sampleKeyframes(frames, eased, underlying);
}
function evaluateAnimations(computed, keyframesMap, timeMs) {
  const list = parseAnimationList(computed);
  if (!list.length) return null;
  let overrides = null;
  for (const anim of list) {
    const frames = keyframesMap[anim.name];
    if (!frames || !frames.length) continue;
    const decls = sampleAnimation(frames, anim, timeMs, computed);
    if (!decls) continue;
    if (!overrides) overrides = {};
    Object.assign(overrides, decls);
  }
  return overrides;
}
function evaluateStateChanges(node, computed, stateChanges, timeMs) {
  if (!stateChanges || !stateChanges.length) return null;
  let overrides = null;
  for (const spec of stateChanges) {
    if (!spec || spec.at == null || !spec.props) continue;
    if (timeMs < spec.at) continue;
    let matches = false;
    try {
      matches = matchesCssSelector(node, spec.selector);
    } catch {
      matches = false;
    }
    if (!matches) continue;
    const descs = parseTransition(computed["transition"] || "");
    for (const prop of Object.keys(spec.props)) {
      const from = computed[prop];
      const to = spec.props[prop];
      if (from === to) continue;
      const d = transitionForProperty(descs, prop) || { duration: 0, delay: 0, timing: parseTimingFunction("ease") };
      const elapsed = timeMs - spec.at - (d.delay || 0);
      let value;
      if (elapsed < 0) value = from;
      else if (elapsed >= (d.duration || 0) || (d.duration || 0) <= 0) value = to;
      else value = interpolateValue(from ?? "", to ?? "", timingProgress(d.timing, elapsed / d.duration), namedColorResolver);
      if (!overrides) overrides = {};
      overrides[prop] = value;
    }
  }
  return overrides;
}
function applyAnimationState(node, computed, anim) {
  if (!anim) return computed;
  const timeMs = Math.max(0, Number(anim.time) || 0);
  let out = computed;
  const a = evaluateAnimations(computed, anim.keyframes || {}, timeMs);
  if (a) out = { ...out, ...a };
  const t = evaluateStateChanges(node, out, anim.stateChanges || [], timeMs);
  if (t) out = { ...out, ...t };
  return out;
}
var clamp01 = (v) => {
  const n2 = Number(v);
  if (!Number.isFinite(n2)) return 1;
  return Math.min(1, Math.max(0, n2));
};
function isTranslateOnly(m) {
  return m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1;
}
function isIdentity(m) {
  return isTranslateOnly(m) && m[4] === 0 && m[5] === 0;
}
function tempForwardBounds2D(m, ox, oy, cw, ch) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const corners = [[0, 0], [cw, 0], [0, ch], [cw, ch]];
  for (const [qx, qy] of corners) {
    const lx = qx - ox, ly = qy - oy;
    const X = m[0] * lx + m[2] * ly + m[4];
    const Y = m[1] * lx + m[3] * ly + m[5];
    if (X < x0) x0 = X;
    if (X > x1) x1 = X;
    if (Y < y0) y0 = Y;
    if (Y > y1) y1 = Y;
  }
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}
function toItemFrame(M, ix, iy) {
  return multiplyMatrix([1, 0, 0, 1, -ix, -iy], multiplyMatrix(M, [1, 0, 0, 1, ix, iy]));
}
function paintWithEffects(fb, item, paintFn, transformCtx = null, extra = null, scene3d = null) {
  const style = item.style || {};
  const forcedOp = extra ? extra.forceOpacity : void 0;
  const opacity = forcedOp !== void 0 && forcedOp !== null ? clamp01(forcedOp) : "opacity" in style ? clamp01(parseFloat(style.opacity)) : 1;
  const accum = extra ? extra.accum2d : null;
  const hasT = Boolean(accum);
  const w = Math.max(1, Number(item.width) || 1);
  const h = Math.max(1, Number(item.height) || 1);
  const blendMode = parseMixBlendMode(style);
  const ownClip = parseClipPath(style["clip-path"], w, h);
  const mask = parseMask(style);
  const clipChain = extra && extra.clipChain || [];
  const fx = Boolean(blendMode || ownClip || mask || clipChain.length);
  const filterList = parseFilterList(style.filter);
  const hasF = filterList.length > 0 && filterList.every((f) => FILTER_FUNCTIONS.has(f.name));
  if (scene3d && scene3d.backfaceHidden) return;
  if (!hasT && opacity >= 1 && !fx && !hasF && !scene3d) {
    paintFn(fb, item);
    return;
  }
  const ix = Number(item.x) || 0, iy = Number(item.y) || 0;
  const m = hasT && !scene3d ? toItemFrame(accum.M, ix, iy) : identityMatrix();
  if (!scene3d && isTranslateOnly(m) && opacity >= 1 && !fx && !hasF) {
    paintFn(fb, { ...item, x: ix + m[4], y: iy + m[5] });
    return;
  }
  if (!scene3d && isIdentity(m) && opacity >= 1 && !fx && !hasF) {
    paintFn(fb, item);
    return;
  }
  const scale = fb && fb.scale || 1;
  const pad = 3 + (hasF ? filterPadPx(filterList) : 0);
  const tsrc = transformCtx || item;
  const tw = Math.max(1, Number(tsrc.width) || 1);
  const th = Math.max(1, Number(tsrc.height) || 1);
  const ox3 = pad - (ix - (Number(tsrc.x) || 0));
  const oy3 = pad - (iy - (Number(tsrc.y) || 0));
  const ox = pad, oy = pad;
  const cw = Math.max(1, Math.ceil(w + pad * 2));
  const ch = Math.max(1, Math.ceil(h + pad * 2));
  if (cw * ch > 16e6) {
    paintFn(fb, item);
    return;
  }
  const base = new Framebuffer(cw * scale, ch * scale, [0, 0, 0, 0]);
  const tmp = new ScaledFramebuffer(base, scale, cw, ch);
  paintFn(tmp, { ...item, x: pad, y: pad });
  if (hasF) applyCssFilters(base.data, base.width, base.height, filterList, scale);
  if (opacity < 1) {
    const d = base.data;
    for (let i = 3; i < d.length; i += 4) d[i] = d[i] * opacity | 0;
  }
  if (ownClip || clipChain.length || mask) {
    applyClipMaskToTemp(base, scale, pad, pad, item, ownClip, clipChain, mask);
  }
  if (scene3d) {
    blitProjective(fb, base, scene3d, tw, th, ox3, oy3, scale);
    return;
  }
  const tb = tempForwardBounds2D(m, ox, oy, cw, ch);
  if (blendMode) blitMatrixBlend(fb, base, m, ix, iy, ox, oy, tb, scale, blendMode);
  else blitMatrix(fb, base, m, ix, iy, ox, oy, tb, scale);
}
function blitMatrix(destFb, srcBase, m, tx, ty, ox, oy, tb, scale) {
  const det = m[0] * m[3] - m[1] * m[2];
  if (!det || !Number.isFinite(det)) return;
  const i0 = m[3] / det, i1 = -m[1] / det;
  const i2 = -m[2] / det, i3 = m[0] / det;
  const i4 = (m[2] * m[5] - m[3] * m[4]) / det + ox;
  const i5 = (m[1] * m[4] - m[0] * m[5]) / det + oy;
  const txv = tx || 0, tyv = ty || 0;
  const bx = (Number(tb.x) || 0) + txv;
  const by = (Number(tb.y) || 0) + tyv;
  const bw = Number(tb.width) || 0;
  const bh = Number(tb.height) || 0;
  const x0 = Math.floor(bx);
  const y0 = Math.floor(by);
  const x1 = Math.ceil(bx + bw);
  const y1 = Math.ceil(by + bh);
  const destBase = destFb && destFb.base ? destFb.base : destFb;
  const ds = destFb && destFb.scale || 1;
  if (!destBase || !destBase.data) return;
  const sw = srcBase.width;
  const sh = srcBase.height;
  const sdata = srcBase.data;
  const ddata = destBase.data;
  const dw = destBase.width;
  const dh = destBase.height;
  if (ds === 1) {
    for (let cy = y0; cy < y1; cy++) {
      if (cy < 0 || cy >= dh) continue;
      const ly = cy - tyv;
      const drow = cy * dw * 4;
      for (let cx = x0; cx < x1; cx++) {
        if (cx < 0 || cx >= dw) continue;
        const lx = cx - txv;
        const px2 = Math.round((i0 * lx + i2 * ly + i4) * scale);
        const py = Math.round((i1 * lx + i3 * ly + i5) * scale);
        if (px2 < 0 || py < 0 || px2 >= sw || py >= sh) continue;
        const si = (py * sw + px2) * 4;
        const a = sdata[si + 3];
        if (a <= 4) continue;
        const di = drow + cx * 4;
        if (a >= 255) {
          ddata[di] = sdata[si];
          ddata[di + 1] = sdata[si + 1];
          ddata[di + 2] = sdata[si + 2];
          ddata[di + 3] = 255;
        } else {
          const alpha = a / 255, ia = 1 - alpha;
          ddata[di] = Math.round(sdata[si] * alpha + ddata[di] * ia);
          ddata[di + 1] = Math.round(sdata[si + 1] * alpha + ddata[di + 1] * ia);
          ddata[di + 2] = Math.round(sdata[si + 2] * alpha + ddata[di + 2] * ia);
          ddata[di + 3] = 255;
        }
      }
    }
    return;
  }
  for (let cy = y0; cy < y1; cy++) {
    const ly = cy - tyv;
    for (let cx = x0; cx < x1; cx++) {
      const lx = cx - txv;
      const px2 = Math.round((i0 * lx + i2 * ly + i4) * scale);
      const py = Math.round((i1 * lx + i3 * ly + i5) * scale);
      if (px2 < 0 || py < 0 || px2 >= sw || py >= sh) continue;
      const si = (py * sw + px2) * 4;
      const a = sdata[si + 3];
      if (a <= 4) continue;
      const dx0 = Math.round(cx * ds);
      const dy0 = Math.round(cy * ds);
      if (a >= 255) {
        const sr = sdata[si], sg = sdata[si + 1], sb = sdata[si + 2];
        for (let yy = 0; yy < ds; yy++) {
          const dy = dy0 + yy;
          if (dy < 0 || dy >= dh) continue;
          const drow = dy * dw * 4;
          for (let xx = 0; xx < ds; xx++) {
            const dx = dx0 + xx;
            if (dx < 0 || dx >= dw) continue;
            const di = drow + dx * 4;
            ddata[di] = sr;
            ddata[di + 1] = sg;
            ddata[di + 2] = sb;
            ddata[di + 3] = 255;
          }
        }
      } else {
        const alpha = a / 255;
        const ia = 1 - alpha;
        const sr = sdata[si], sg = sdata[si + 1], sb = sdata[si + 2];
        for (let yy = 0; yy < ds; yy++) {
          const dy = dy0 + yy;
          if (dy < 0 || dy >= dh) continue;
          const drow = dy * dw * 4;
          for (let xx = 0; xx < ds; xx++) {
            const dx = dx0 + xx;
            if (dx < 0 || dx >= dw) continue;
            const di = drow + dx * 4;
            ddata[di] = Math.round(sr * alpha + ddata[di] * ia);
            ddata[di + 1] = Math.round(sg * alpha + ddata[di + 1] * ia);
            ddata[di + 2] = Math.round(sb * alpha + ddata[di + 2] * ia);
            ddata[di + 3] = 255;
          }
        }
      }
    }
  }
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/domLayout.js
var import_CssPseudoElements2 = __toESM(require_CssPseudoElements(), 1);

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/listMarkers.js
var import_CssPseudoElements = __toESM(require_CssPseudoElements(), 1);
var { applyCounters, matchPseudoRules, resolveContent } = import_CssPseudoElements.default;
function cascadePseudoDecls(matched, hostStyle) {
  const winners = /* @__PURE__ */ new Map();
  const scoreOf = (d, rule) => [d.important ? 1 : 0, ...rule.specificity || [0, 0, 0, 0], rule.order || 0];
  const cmpScore = (a, b) => {
    const n2 = Math.max(a.length, b.length);
    for (let i = 0; i < n2; i++) {
      const d = (a[i] || 0) - (b[i] || 0);
      if (d) return d;
    }
    return 0;
  };
  for (const rule of matched || []) {
    for (const d of rule.declarations || []) {
      const s = scoreOf(d, rule);
      const cur = winners.get(d.name);
      if (!cur || cmpScore(s, cur.score) >= 0) winners.set(d.name, { value: d.value, score: s });
    }
  }
  const out = {};
  for (const k of ["font-size", "font-family", "font-weight", "font-style", "color", "line-height"]) {
    if (hostStyle[k] != null) out[k] = hostStyle[k];
  }
  for (const [name, w] of winners) out[name] = w.value;
  return out;
}
var UNORDERED_GLYPHS = { disc: "\u2022", circle: "\u25CB", square: "\u25AA" };
var KNOWN_TYPES = /* @__PURE__ */ new Set([
  "disc",
  "circle",
  "square",
  "decimal",
  "decimal-leading-zero",
  "lower-roman",
  "upper-roman",
  "lower-alpha",
  "upper-alpha",
  "lower-greek",
  "none"
]);
function parseListStyleShorthand(value) {
  const out = { type: "", position: "", image: "" };
  for (const tok of String(value || "").split(/\s+/).filter(Boolean)) {
    const low = tok.toLowerCase();
    if (low === "inside" || low === "outside") out.position = low;
    else if (/^url\(/i.test(tok)) out.image = tok;
    else if (low === "none") {
    } else if (KNOWN_TYPES.has(low)) out.type = low;
  }
  return out;
}
function toRoman(n2) {
  if (!Number.isFinite(n2) || n2 < 1) return String(Math.trunc(n2) || 0);
  const table = [[1e3, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let num4 = Math.trunc(n2);
  let out = "";
  for (const [v, s] of table) while (num4 >= v) {
    out += s;
    num4 -= v;
  }
  return out;
}
function toAlpha(n2, upper) {
  if (!Number.isFinite(n2) || n2 < 1) return String(Math.trunc(n2) || 0);
  let num4 = Math.trunc(n2);
  let out = "";
  while (num4 > 0) {
    num4--;
    out = String.fromCharCode(97 + num4 % 26) + out;
    num4 = Math.floor(num4 / 26);
  }
  return upper ? out.toUpperCase() : out;
}
var GREEK = ["\u03B1", "\u03B2", "\u03B3", "\u03B4", "\u03B5", "\u03B6", "\u03B7", "\u03B8", "\u03B9", "\u03BA", "\u03BB", "\u03BC", "\u03BD", "\u03BE", "\u03BF", "\u03C0", "\u03C1", "\u03C3", "\u03C4", "\u03C5", "\u03C6", "\u03C7", "\u03C8", "\u03C9"];
function toGreek(n2) {
  if (!Number.isFinite(n2) || n2 < 1 || n2 > 24) return String(Math.trunc(n2) || 0);
  return GREEK[Math.trunc(n2) - 1];
}
function markerText(type, n2) {
  switch (String(type || "").toLowerCase()) {
    case "disc":
    case "circle":
    case "square":
      return UNORDERED_GLYPHS[String(type).toLowerCase()] || "\u2022";
    case "decimal":
      return `${n2}.`;
    case "decimal-leading-zero":
      return `${String(n2).padStart(2, "0")}.`;
    case "lower-roman":
      return `${toRoman(n2).toLowerCase()}.`;
    case "upper-roman":
      return `${toRoman(n2)}.`;
    case "lower-alpha":
      return `${toAlpha(n2, false)}.`;
    case "upper-alpha":
      return `${toAlpha(n2, true)}.`;
    case "lower-greek":
      return `${toGreek(n2)}.`;
    default:
      return `${n2}.`;
  }
}
function liOrdinal(li) {
  const parent = li && li.parentNode;
  if (!parent || parent.nodeType !== 1) return 1;
  const items = (parent.children || []).filter((c) => c && c.nodeType === 1 && c.localName === "li");
  const idx = items.indexOf(li);
  if (idx < 0) return 1;
  let start = 1;
  try {
    const raw = parent.getAttribute ? parent.getAttribute("start") : null;
    if (raw != null && raw !== "") {
      const v = parseInt(String(raw), 10);
      if (Number.isFinite(v)) start = v;
    }
  } catch {
  }
  let reversed = false;
  try {
    reversed = parent.hasAttribute ? parent.hasAttribute("reversed") : false;
  } catch {
  }
  if (reversed) return start + (items.length - 1 - idx);
  return start + idx;
}
function markerColorFor(li, rules) {
  const host = li && li.computedStyle || {};
  let matched = null;
  try {
    matched = matchPseudoRules(li, "marker", rules);
  } catch {
    matched = null;
  }
  if (matched && matched.length) {
    const cascaded = cascadePseudoDecls(matched, host);
    if (cascaded.color) return { color: cascaded.color, fromAuthor: true };
  }
  return { color: host.color || "#000", fromAuthor: false };
}
function markerForLi(li, rules) {
  if (!li || li.nodeType !== 1 || li.localName !== "li") return null;
  try {
    const explicit = matchPseudoRules(li, "marker", rules) || [];
    for (const rule of explicit) {
      for (const d of rule.declarations || []) {
        if (String(d.name).toLowerCase() === "content") {
          const v = String(d.value || "").trim().toLowerCase();
          if (v && v !== "none" && v !== "normal") return null;
        }
      }
    }
  } catch {
  }
  const style = li.computedStyle || {};
  const short = parseListStyleShorthand(style["list-style"]);
  let type = String(style["list-style-type"] || "").trim().toLowerCase() || short.type;
  if (!type) {
    const p = li.parentNode;
    const pname = p && p.nodeType === 1 ? p.localName : "";
    type = pname === "ol" ? "decimal" : "disc";
  }
  if (type === "none") return null;
  const image = String(style["list-style-image"] || "").trim() || short.image;
  const hasImage = image && image.toLowerCase() !== "none";
  const position = String(style["list-style-position"] || "").trim().toLowerCase() || short.position || "outside";
  const n2 = liOrdinal(li);
  const text = hasImage ? "\u25C6" : markerText(type, n2);
  const { color, fromAuthor } = markerColorFor(li, rules);
  const markerStyle = {
    "font-size": style["font-size"] || "14px",
    "font-family": style["font-family"] || "sans-serif",
    "font-weight": style["font-weight"] || "400",
    "font-style": style["font-style"] || "normal",
    "line-height": style["line-height"] || "",
    // list-style-image can't fetch in a static snapshot: the replacement
    // marker is visibly styled (accent) unless the author colored ::marker.
    color: hasImage && !fromAuthor ? "#0284c7" : color
  };
  return { text, style: markerStyle, position, imageFallback: hasImage };
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/domLayout.js
function merkavaSupports(prop, value) {
  const p = String(prop || "").trim().toLowerCase();
  const v = String(value || "").trim().toLowerCase();
  if (p === "display") {
    return ["block", "inline", "inline-block", "flex", "inline-flex", "grid", "inline-grid", "table", "none", "contents", "list-item"].includes(v);
  }
  if (p === "gap" || p === "row-gap" || p === "column-gap") return true;
  if (p === "position") return ["static", "relative", "absolute", "fixed", "sticky"].includes(v);
  return false;
}
function buildLayoutTree(dom, viewport = { width: 960, height: 640 }, options = {}) {
  const root = wireParents(nodeFrom(dom));
  const environment = {
    width: viewport.width,
    height: viewport.height,
    type: String(options.mediaType || options.media || "screen").toLowerCase(),
    reducedMotion: !!options.reducedMotion,
    forcedColors: !!options.forcedColors,
    supports: merkavaSupports
  };
  const fromDom = collectCssRules(root, environment, 0);
  const fromText = compileStylesheet(options.cssText || "", environment, fromDom.nextOrder);
  const anim = {
    keyframes: parseKeyframes(`${options.cssText || ""}
${fromDom.cssText || ""}`),
    time: Math.max(0, Number(options.time) || 0),
    stateChanges: Array.isArray(options.stateChanges) ? options.stateChanges : []
  };
  const rules = [...fromDom.rules, ...fromText.rules];
  const propertyRegs = { ...fromDom.properties, ...fromText.properties };
  const containerRules = [...fromDom.containerRules || [], ...fromText.containerRules || []];
  applyCascade(root, rules, viewport, anim, propertyRegs, containerRules);
  materializePseudoElements(root, rules);
  resolveRelativeUnits(root, rules, viewport);
  const out = [];
  layoutNode(findBody(root) || root, { x: 0, y: 0, width: viewport.width, height: viewport.height, viewportHeight: viewport.height, root: true, depth: 0, cb: { x: 0, y: 0, width: viewport.width, height: viewport.height }, vpW: viewport.width, vpH: viewport.height }, out);
  applyFirstLineStyles(out);
  return out;
}
var MAX_LAYOUT_DEPTH = 1e3;
var MAX_GRID_TRACKS = 4096;
function layoutNode(node, ctx, out) {
  if (!node || hidden(node)) return null;
  if (node.nodeType === 3) {
    const parentStyle = node.parentNode && node.parentNode.nodeType === 1 ? styleOf(node.parentNode) : {};
    return layoutText(node, ctx, out, parentStyle);
  }
  const style = styleOf(node);
  if (displayOf(style, node) === "inline") return layoutInlineBox(node, ctx, out, style);
  return layoutBlockBox(node, ctx, out, style);
}
function layoutBlockBox(node, ctx, out, style) {
  style = style || styleOf(node);
  const depth = ctx.depth || 0;
  const refW = Math.max(1, ctx.width || 0);
  const margin = box(style, "margin", refW), padding = box(style, "padding", refW), border = borderBox(style, refW);
  if ((node.localName === "ul" || node.localName === "ol") && style["padding-left"] == null && (node.children || []).some((c) => c && c.nodeType === 1 && c.localName === "li" && c.__marker && c.__marker.position !== "inside")) {
    padding.left = Math.max(padding.left, 30);
  }
  if (depth > MAX_LAYOUT_DEPTH) {
    const stub = { node, x: ctx.x + margin.left, y: ctx.y + margin.top, width: Math.max(1, refW - margin.left - margin.right), height: defaultHeight(node, style), style, children: [], kind: node.localName || "div", margin, depthCapped: true };
    out.push(stub);
    return stub;
  }
  const width = measuredWidth(node, style, Math.max(1, refW - margin.left - margin.right));
  const fixedH = measuredHeight(node, style, ctx.height || ctx.viewportHeight || 0);
  let x = ctx.x + margin.left;
  if (ctx.blockFlow) {
    const ew = dim(style.width, refW);
    if (ew > 0) {
      const mlA = isAutoMargin(style, "left"), mrA = isAutoMargin(style, "right");
      if (mlA || mrA) {
        const free = Math.max(0, refW - ew - (mlA ? 0 : margin.left) - (mrA ? 0 : margin.right));
        if (mlA && mrA) x = ctx.x + free / 2;
        else if (mlA) x = ctx.x + free;
      }
    }
  }
  const y = ctx.y + margin.top;
  const pos = positionOf(style);
  const vpW = ctx.vpW || refW, vpH = ctx.vpH || ctx.viewportHeight || 0;
  const item = { node, x, y, width, height: fixedH || 0, style, children: [], kind: node.localName || "div", margin: { ...margin } };
  out.push(item);
  const provCB = pos !== "static" ? { x, y, width, height: Math.max(fixedH || 0, dim(style["min-height"], ctx.viewportHeight || 0), 1) } : null;
  const content = { x: x + padding.left + border.left, y: y + padding.top + border.top, width: Math.max(1, width - padding.left - padding.right - border.left - border.right), height: Math.max(0, (fixedH || ctx.height || 0) - padding.top - padding.bottom - border.top - border.bottom), viewportHeight: ctx.viewportHeight, depth: depth + 1, inlineStyle: inheritFont(style), root: !!ctx.root, noCollapse: !!ctx.noCollapse || pos === "absolute" || pos === "fixed", cb: provCB || ctx.cb || null, vpW, vpH, subgrid: ctx.subgrid || null };
  const cv = String(style["content-visibility"] || "visible").trim().toLowerCase();
  const vpHeight = ctx.viewportHeight || 0;
  const cvSkip = cv === "hidden" || cv === "auto" && y >= vpHeight && vpHeight > 0;
  let cvIntrinsic = null;
  if (cvSkip) {
    const cis = String(style["contain-intrinsic-size"] || "").trim().split(/\s+/);
    const ph = (s) => {
      const m = String(s || "").match(/^(\d+(?:\.\d+)?)px$/);
      return m ? Number(m[1]) : 0;
    };
    cvIntrinsic = { width: ph(cis[0]), height: ph(cis[cis.length - 1] || cis[0]) };
  }
  const kids = cvSkip ? [] : inlineKids(node);
  const flow = kids.length ? layoutChildren(kids, item, content, out, displayOf(style, node)) : { height: 0, throughTop: 0, throughBottom: 0, oof: [] };
  const containToks = String(style.contain || "").toLowerCase().split(/\s+/);
  const sizeContain = containToks.includes("size") || containToks.includes("strict");
  const contentH = cvSkip ? cvIntrinsic ? cvIntrinsic.height : 0 : sizeContain ? 0 : flow.height;
  const naturalH = fixedH || contentH + padding.top + padding.bottom + border.top + border.bottom;
  item.height = Math.max(naturalH, dim(style["min-height"], ctx.viewportHeight || 0), ctx.root ? Number(ctx.height || ctx.viewportHeight || 0) : naturalH ? 0 : defaultHeight(node, style));
  const ar = parseAspectRatio(style);
  if (ar > 0 && !fixedH && item.width > 0) {
    let arH = item.width / ar;
    const maxH2 = dim(style["max-height"], ctx.viewportHeight || 0);
    if (maxH2 > 0) arH = Math.min(arH, maxH2);
    if (arH > item.height) item.height = arH;
  }
  const maxH = dim(style["max-height"], ctx.viewportHeight || 0);
  if (maxH > 0 && item.height > maxH) item.height = maxH;
  paintOutsideMarker(node, item, out, x, padding, border);
  if (!ctx.root) {
    const mergedTop = Math.max(margin.top, flow.throughTop || 0);
    if (mergedTop > margin.top) shiftSubtree(item, mergedTop - margin.top);
    item.margin.top = mergedTop;
    item.margin.bottom = Math.max(margin.bottom, flow.throughBottom || 0);
  }
  if (pos === "relative" || pos === "sticky") {
    const dx = !isAuto(style.left) ? dim(style.left, refW) : !isAuto(style.right) ? -dim(style.right, refW) : 0;
    const dy = !isAuto(style.top) ? dim(style.top, vpH) : !isAuto(style.bottom) ? -dim(style.bottom, vpH) : 0;
    if (dx) shiftSubtreeX(item, dx);
    if (dy) shiftSubtree(item, dy);
  }
  const oof = flow.oof || [];
  if (oof.length) {
    const myCB = pos !== "static" ? { x: item.x, y: item.y, width: item.width, height: item.height } : ctx.cb || { x: 0, y: 0, width: vpW, height: vpH };
    placeOOF(item, oof, myCB, { viewportHeight: ctx.viewportHeight, vpW, vpH, depth }, out);
  }
  return item;
}
function shiftSubtree(item, dy) {
  item.y += dy;
  for (const c of item.children || []) shiftSubtree(c, dy);
}
function paintOutsideMarker(node, item, out, x, padding, border) {
  const m = node && node.__marker;
  if (!m || m.position === "inside") return;
  if ((node.children || []).some((c) => c && c.nodeType === 1 && String(c.localName || "").startsWith("::marker"))) return;
  const mtext = String(m.text || "");
  if (!mtext) return;
  const mw = Math.max(1, textWidth2(mtext, m.style));
  const firstKid = (item.children || [])[0];
  const my = firstKid ? firstKid.y : item.y + (padding.top || 0) + (border.top || 0);
  const mRight = x + (padding.left || 0) + (border.left || 0) - 6;
  const lineH = lineHeightOf(m.style);
  const glyphH = 7 * painterScale(m.style);
  const cy = my + Math.max(0, (lineH - glyphH) / 2);
  const markerNode = { nodeType: 3, textContent: mtext, parentNode: node, localName: "#text", children: [], __textStyle: m.style };
  const mitem = {
    node: minimalTextNode(node),
    x: mRight - mw,
    y: cy,
    width: mw,
    height: lineHeightOf(m.style),
    style: m.style,
    children: [],
    kind: "#text",
    text: mtext
  };
  out.push(mitem);
  item.children.push(mitem);
}
function shiftSubtreeX(item, dx) {
  item.x += dx;
  for (const c of item.children || []) shiftSubtreeX(c, dx);
}
function positionOf(style = {}) {
  return String(style.position || "static").trim().toLowerCase() || "static";
}
function isOOF(style = {}) {
  const p = positionOf(style);
  return p === "absolute" || p === "fixed";
}
function isAuto(v) {
  const t = String(v ?? "").trim().toLowerCase();
  return t === "" || t === "auto";
}
function placeOOF(parentItem, oofNodes, cbRect, ctx, out) {
  const vpW = ctx.vpW || 0, vpH = ctx.vpH || ctx.viewportHeight || 0;
  const viewportCB = { x: 0, y: 0, width: vpW, height: vpH };
  for (const node of oofNodes) {
    if (!node || node.nodeType !== 1) continue;
    const style = styleOf(node);
    const cb = positionOf(style) === "fixed" ? viewportCB : cbRect || viewportCB;
    const insetParts = String(style.inset || "").trim().split(/\s+/).filter(Boolean);
    const insetVal = (i) => insetParts[i] ?? insetParts[i - 2] ?? insetParts[0] ?? "";
    const effLeft = !isAuto(style.left) ? style.left : insetVal(3) !== "" ? insetVal(3) : style.left;
    const effRight = !isAuto(style.right) ? style.right : insetVal(1) !== "" ? insetVal(1) : style.right;
    const effTop = !isAuto(style.top) ? style.top : insetVal(0) !== "" ? insetVal(0) : style.top;
    const effBottom = !isAuto(style.bottom) ? style.bottom : insetVal(2) !== "" ? insetVal(2) : style.bottom;
    const leftV = dim(effLeft, cb.width), rightV = dim(effRight, cb.width);
    const topV = dim(effTop, cb.height), bottomV = dim(effBottom, cb.height);
    let w = dim(style.width, cb.width);
    if (!w && !isAuto(effLeft) && !isAuto(effRight)) {
      w = Math.max(1, cb.width - leftV - rightV);
    }
    if (!w) w = Math.max(1, Math.min(cb.width, naturalInlineWidth(node, style, cb.width)));
    let h = dim(style.height, cb.height);
    if (!h && !isAuto(effTop) && !isAuto(effBottom)) {
      h = Math.max(1, cb.height - topV - bottomV);
    }
    const got = layoutBlockBox(node, { x: 0, y: 0, width: Math.max(1, w), height: cb.height, viewportHeight: ctx.viewportHeight || vpH, depth: (ctx.depth || 0) + 1, vpW, vpH, cb }, out);
    if (!got) continue;
    if (h && h > got.height) got.height = h;
    parentItem.children.push(got);
    const eff = { left: style.left, right: style.right, top: style.top, bottom: style.bottom };
    {
      const rtl = String(style.direction || "").trim().toLowerCase() === "rtl";
      const lStart = rtl ? "right" : "left", lEnd = rtl ? "left" : "right";
      const iis = String(style["inset-inline"] || "").trim().split(/\s+/).filter(Boolean);
      const iib = String(style["inset-block"] || "").trim().split(/\s+/).filter(Boolean);
      const pick = (cur, cands) => {
        if (!isAuto(cur)) return cur;
        for (const c of cands) if (!isAuto(c)) return c;
        return cur;
      };
      eff[lStart] = pick(eff[lStart], [style["inset-inline-start"], iis[0]]);
      eff[lEnd] = pick(eff[lEnd], [style["inset-inline-end"], iis[1] || iis[0]]);
      eff.top = pick(eff.top, [style["inset-block-start"], iib[0]]);
      eff.bottom = pick(eff.bottom, [style["inset-block-end"], iib[1] || iib[0]]);
    }
    let fx = cb.x, fy = cb.y;
    const mlA = isAutoMargin(style, "left"), mrA = isAutoMargin(style, "right");
    const mtA = isAutoMargin(style, "top"), mbA = isAutoMargin(style, "bottom");
    if (!isAuto(eff.left) && !isAuto(eff.right) && (mlA || mrA)) {
      const free = Math.max(0, cb.width - dim(eff.left, cb.width) - dim(eff.right, cb.width) - got.width);
      if (mlA && mrA) fx = cb.x + dim(eff.left, cb.width) + free / 2;
      else if (mlA) fx = cb.x + dim(eff.left, cb.width) + free;
      else fx = cb.x + dim(eff.left, cb.width);
    } else if (!isAuto(eff.left)) fx = cb.x + dim(eff.left, cb.width);
    else if (!isAuto(eff.right)) fx = cb.x + cb.width - dim(eff.right, cb.width) - got.width;
    if (!isAuto(eff.top) && !isAuto(eff.bottom) && (mtA || mbA)) {
      const free = Math.max(0, cb.height - dim(eff.top, cb.height) - dim(eff.bottom, cb.height) - got.height);
      if (mtA && mbA) fy = cb.y + dim(eff.top, cb.height) + free / 2;
      else if (mtA) fy = cb.y + dim(eff.top, cb.height) + free;
      else fy = cb.y + dim(eff.top, cb.height);
    } else if (!isAuto(eff.top)) fy = cb.y + dim(eff.top, cb.height);
    else if (!isAuto(eff.bottom)) fy = cb.y + cb.height - dim(eff.bottom, cb.height) - got.height;
    if (fx !== got.x) shiftSubtreeX(got, fx - got.x);
    if (fy !== got.y) shiftSubtree(got, fy - got.y);
  }
}
function layoutChildren(children, parent, ctx, out, mode) {
  const flowKids = [], oofKids = [];
  for (const child of children || []) {
    if (child && child.nodeType === 1 && isOOF(styleOf(child))) oofKids.push(child);
    else flowKids.push(child);
  }
  const withOOF = (r, h) => ({ height: h, throughTop: 0, throughBottom: 0, oof: oofKids.concat(r && r.oof || []) });
  if (mode === "grid") {
    const r = layoutGrid(flowKids, parent, ctx, out);
    return withOOF(r, r.height);
  }
  if (mode === "flex") {
    const r = layoutFlex(flowKids, parent, ctx, out);
    return withOOF(r, r.height);
  }
  if (mode === "table") return withOOF(null, layoutTable(flowKids, parent, ctx, out));
  const mc = multiColumnSpec(parent.style || {}, ctx.width);
  if (mc && mode !== "table-caption") return withOOF(null, layoutMultiColumn(flowKids, parent, ctx, out, mc));
  const b = layoutBlockFlow(flowKids, parent, ctx, out);
  return { height: b.height, throughTop: b.throughTop, throughBottom: b.throughBottom, oof: oofKids.concat(b.oof || []) };
}
function layoutBlockFlow(children, parent, ctx, out) {
  const pStyle = parent.style || {};
  const refW = Math.max(1, ctx.width || 0);
  const noTopBarrier = !(dim(pStyle["padding-top"], refW) > 0 || borderBox(pStyle, refW).top > 0);
  const noBottomBarrier = !(dim(pStyle["padding-bottom"], refW) > 0 || borderBox(pStyle, refW).bottom > 0);
  const ov = String(pStyle["overflow"] || pStyle["overflow-y"] || "visible").trim().toLowerCase();
  const isBFC = ov !== "visible";
  const allowThrough = !ctx.root && !ctx.noCollapse && !isBFC;
  const depth = (ctx.depth || 0) + 1;
  let y = ctx.y, total = 0, prevBottom = 0, first = true;
  let throughTop = 0, lastBottom = 0, sawBlock = false;
  let run = [];
  let floatRow = null;
  const flushFloatRow = () => {
    if (!floatRow) return;
    const rowBottom = floatRow.y + floatRow.height;
    if (rowBottom > y) {
      total += rowBottom - y;
      y = rowBottom;
    }
    floatRow = null;
  };
  const flushRun = () => {
    if (!run.length) return;
    y += prevBottom;
    total += prevBottom;
    prevBottom = 0;
    const h = layoutInlineRun(run, parent, ctx, out, y, depth, first);
    run = [];
    y += h;
    total += h;
    prevBottom = 0;
    first = false;
    sawBlock = true;
  };
  for (const child of children) {
    if (isInlineLevel(child)) {
      run.push(child);
      continue;
    }
    flushRun();
    const cs = styleOf(child) || {};
    const fside = String(cs.float || "").trim().toLowerCase();
    const isFloat = fside === "left" || fside === "right";
    const clear = String(cs.clear || "").trim().toLowerCase();
    if (!isFloat) flushFloatRow();
    else if (clear === "both" || clear === "left" || clear === "right") flushFloatRow();
    if (isFloat) {
      if (!floatRow) floatRow = { y, left: ctx.x, right: ctx.x + (ctx.width || 0), height: 0 };
      const got2 = layoutBlockBox(child, { x: floatRow.left, y: floatRow.y, width: ctx.width, height: ctx.height, viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb, blockFlow: true }, out);
      if (!got2) continue;
      parent.children.push(got2);
      let gx = got2.x;
      if (fside === "right") {
        gx = floatRow.right - got2.width;
        shiftSubtreeX(got2, gx - got2.x);
      }
      const rowW = ctx.width || 0;
      const overflows = gx + got2.width > ctx.x + rowW + 1;
      const rowUsed = fside === "left" ? floatRow.left > ctx.x : floatRow.right < ctx.x + rowW;
      if (overflows && rowUsed) {
        floatRow.y += floatRow.height;
        floatRow.height = 0;
        floatRow.left = ctx.x;
        floatRow.right = ctx.x + rowW;
        shiftSubtree(got2, floatRow.y - got2.y);
        gx = fside === "left" ? floatRow.left : floatRow.right - got2.width;
        shiftSubtreeX(got2, gx - got2.x);
      }
      if (fside === "left") floatRow.left = gx + got2.width;
      else floatRow.right = gx;
      if (got2.height > floatRow.height) floatRow.height = got2.height;
      continue;
    }
    const got = layoutBlockBox(child, { x: ctx.x, y, width: ctx.width, height: ctx.height, viewportHeight: ctx.viewportHeight, depth, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb, blockFlow: true }, out);
    if (!got) continue;
    parent.children.push(got);
    const m = got.margin;
    if (first && allowThrough && noTopBarrier) {
      throughTop = Math.max(throughTop, m.top);
      shiftSubtree(got, -m.top);
    } else {
      const effTop = first ? m.top : Math.max(prevBottom, m.top);
      shiftSubtree(got, effTop - m.top);
      y += effTop;
      total += effTop;
    }
    y += got.height;
    total += got.height;
    prevBottom = m.bottom;
    lastBottom = m.bottom;
    first = false;
    sawBlock = true;
  }
  flushRun();
  flushFloatRow();
  let throughBottom = 0;
  if (sawBlock && allowThrough && noBottomBarrier) {
    throughBottom = lastBottom;
  } else if (sawBlock) {
    y += lastBottom;
    total += lastBottom;
  }
  return { height: total, throughTop, throughBottom, oof: [] };
}
function inheritFont(style) {
  return {
    "font-size": style["font-size"] || "14px",
    color: style.color || "#000",
    "font-weight": style["font-weight"] || "400",
    "font-style": style["font-style"] || "normal"
  };
}
function fontSizeOf(style) {
  return dim(style["font-size"], 0) || 14;
}
function painterScale(style) {
  const size = parsePx(style["font-size"]) || 14;
  return Math.max(1, Math.min(3, Math.round(size / 10)));
}
function parsePx(v) {
  const m = String(v || "").match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : 0;
}
function textWidth2(text, style) {
  const s = String(text || "");
  if (!s) return 0;
  try {
    return textWidth(s, painterScale(style), style["font-weight"] || "400", style);
  } catch {
    return s.length * (fontSizeOf(style) || 14) * 0.55;
  }
}
function lineHeightOf(style) {
  const lh = String(style["line-height"] || "").trim();
  if (lh && lh !== "normal") {
    if (/^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(lh)) return (fontSizeOf(style) || 14) * Number(lh);
    const v = dim(lh, fontSizeOf(style));
    if (v > 0) return v;
  }
  return fontSizeOf(style) + 5;
}
function inlineKids(node) {
  const kids = renderChildren(node);
  const markInside = node.__marker && node.__marker.position === "inside" ? [syntheticMarkerText(node)] : [];
  if (kids.length) return [...markInside, ...kids];
  const t = renderOwnText(node);
  if (!t && !markInside.length) return kids;
  const out = [...markInside];
  if (t) out.push({ nodeType: 3, textContent: t, parentNode: node, localName: "#text", children: [] });
  return out;
}
function syntheticMarkerText(node) {
  const m = node.__marker;
  return { nodeType: 3, textContent: `${m.text} `, parentNode: node, localName: "#text", children: [], __textStyle: m.style };
}
function inlinePieces(children, ctx) {
  const pieces = [];
  const ws = String(ctx.whiteSpace || "").toLowerCase();
  const preserveBreaks = ws === "pre" || ws === "pre-wrap" || ws === "pre-line";
  for (const child of children) {
    if (child.nodeType === 3) {
      const style = child.__textStyle || ((child.parentNode && child.parentNode.nodeType === 1 ? styleOf(child.parentNode) : ctx.inlineStyle) || {});
      const childWs = String(style["white-space"] || "").toLowerCase() || ws;
      const childBreaks = childWs === "pre" || childWs === "pre-wrap" || childWs === "pre-line";
      const wb = String(style["word-break"] || "").toLowerCase();
      const ow = String(style["overflow-wrap"] || style["word-wrap"] || "").toLowerCase();
      const breakAll = wb === "break-all" || ow === "break-all";
      const breakWord = breakAll || ow === "break-word" || ow === "anywhere";
      const tokens = String(child.textContent || "").match(/[^\s\n]+[ \t]*|\n|[ \t]+/g) || [];
      for (const tok of tokens) {
        if (tok === "\n") {
          if (childBreaks) {
            pieces.push({ kind: "break", w: 0, h: 0, style, node: child });
            continue;
          }
          pieces.push({ kind: "space", w: textWidth2(" ", style), h: lineHeightOf(style), style, node: child });
          continue;
        }
        if (!tok.trim()) {
          pieces.push({ kind: "space", w: textWidth2(" ", style), h: lineHeightOf(style), style, node: child });
          continue;
        }
        const word = /\s$/.test(tok) ? tok.replace(/\s+$/, " ") : tok;
        if ((breakAll || breakWord) && !/^\s+$/.test(word)) {
          const m2 = word.match(/^(\S+?)(\s?)$/);
          const chars = [...m2 ? m2[1] : word];
          for (const ch of chars) {
            pieces.push({ kind: "word", text: ch, w: textWidth2(ch, style), h: lineHeightOf(style), style, node: child, charBreak: true });
          }
          if (m2 && m2[2]) pieces.push({ kind: "space", w: textWidth2(" ", style), h: lineHeightOf(style), style, node: child });
          continue;
        }
        pieces.push({ kind: "word", text: word, w: textWidth2(word, style), h: lineHeightOf(style), style, node: child });
      }
    } else {
      const style = styleOf(child);
      if (displayOf(style, child) === "inline") {
        const inner = inlinePieces(inlineKids(child), { ...ctx, inlineStyle: inheritFont(style), whiteSpace: String(style["white-space"] || "").toLowerCase() || ws });
        pieces.push({ kind: "box", node: child, style, w: inner.reduce((n2, p) => n2 + p.w, 0), h: lineHeightOf(style), inner });
      } else {
        pieces.push({ kind: "atomic", node: child, style, w: 0, h: 0 });
      }
    }
  }
  return pieces;
}
function layoutInlineRun(run, parent, ctx, out, y, depth, isFirstRun) {
  const W = Math.max(1, ctx.width);
  const pStyle = parent.style || {};
  const wsValue = String(pStyle["white-space"] || "").trim().toLowerCase();
  const pieces = inlinePieces(run, { ...ctx, whiteSpace: wsValue || ctx.whiteSpace });
  const align = String(pStyle["text-align"] || "left").trim().toLowerCase();
  const nowrap = wsValue === "nowrap" || wsValue === "pre";
  const ovx = String(pStyle["overflow-x"] || pStyle.overflow || "visible").trim().toLowerCase();
  const ellipsis = String(pStyle["text-overflow"] || "").trim().toLowerCase() === "ellipsis" && (nowrap || String(pStyle["white-space"] || "").trim().toLowerCase() === "nowrap") && (ovx === "hidden" || ovx === "scroll" || ovx === "auto");
  let x = ctx.x, lineY = y, lineH = 0, totalH = 0;
  let lineItems = [];
  if (isFirstRun) {
    const indentPx = dim(String(pStyle["text-indent"] || ""), W);
    if (indentPx > 0) x += indentPx;
  }
  const _dir = String(pStyle.direction || "").trim().toLowerCase();
  const effAlign = (align === "left" || align === "" || align === "start") && _dir === "rtl" ? "right" : align;
  const commitLine = () => {
    for (const it of lineItems) {
      const va = it.va;
      if (!va || it.kind === "#text") continue;
      const ih = Number(it.height) || 0;
      if (va === "bottom") it.y = lineY + lineH - ih;
      else if (va === "middle") it.y = lineY + (lineH - ih) / 2;
      else if (va === "top") it.y = lineY;
    }
    if (lineItems.length && (effAlign === "center" || effAlign === "right")) {
      const used = x - ctx.x;
      const extra = Math.max(0, W - used);
      const dx = effAlign === "center" ? extra / 2 : extra;
      if (dx > 0.5) for (const it of lineItems) shiftSubtreeX(it, dx);
    }
    totalH += lineH;
    lineY += lineH;
    lineH = 0;
    x = ctx.x;
    lineItems = [];
  };
  const placeWord = (p) => {
    const item = { node: minimalTextNode(p.node && p.node.parentNode), x, y: lineY, width: p.w, height: p.h, style: p.style, children: [], kind: "#text", text: p.text };
    out.push(item);
    parent.children.push(item);
    lineItems.push(item);
    x += p.w;
    lineH = Math.max(lineH, p.h);
  };
  for (const p of pieces) {
    if (p.kind === "space") {
      if (x === ctx.x) continue;
      if (!nowrap && x + p.w > ctx.x + W + 0.5) {
        commitLine();
        continue;
      }
      x += p.w;
      continue;
    }
    if (!nowrap && x > ctx.x && x + p.w > ctx.x + W + 0.5) commitLine();
    if (p.kind === "word") {
      placeWord(p);
      continue;
    }
    if (p.kind === "box") {
      const item = { node: p.node, x, y: lineY, width: Math.max(1, p.w), height: p.h, style: p.style, children: [], kind: p.node.localName || "span", va: String(p.style["vertical-align"] || "").toLowerCase() || null };
      out.push(item);
      parent.children.push(item);
      lineItems.push(item);
      let ix = x;
      for (const ip of p.inner) {
        if (ip.kind === "word") {
          const t = { node: minimalTextNode(ip.node && ip.node.parentNode), x: ix, y: lineY, width: ip.w, height: ip.h, style: ip.style, children: [], kind: "#text", text: ip.text };
          out.push(t);
          item.children.push(t);
          ix += ip.w;
        } else if (ip.kind === "space") ix += ip.w;
      }
      x += item.width;
      lineH = Math.max(lineH, p.h);
      continue;
    }
    if (p.kind === "atomic") {
      const chrome = horizChrome(p.style, W);
      const w = dim(p.style.width, W) || Math.max(1, Math.min(W, naturalInlineWidth(p.node, p.style, W) + chrome));
      const pm = box(p.style, "margin", W);
      const got = layoutBlockBox(p.node, { x, y: lineY, width: w + pm.left + pm.right, viewportHeight: ctx.viewportHeight, depth: (depth || 0) + 1, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
      if (got) {
        got.va = String(p.style["vertical-align"] || "").toLowerCase() || null;
        parent.children.push(got);
        lineItems.push(got);
        x += got.width + (got.margin ? got.margin.right : 0);
        lineH = Math.max(lineH, got.height);
      }
    }
    if (p.kind === "break") {
      commitLine();
      continue;
    }
  }
  if (lineItems.length) {
    for (const it of lineItems) {
      const va = it.va;
      if (!va || it.kind === "#text") continue;
      const ih = Number(it.height) || 0;
      if (va === "bottom") it.y = lineY + lineH - ih;
      else if (va === "middle") it.y = lineY + (lineH - ih) / 2;
      else if (va === "top") it.y = lineY;
    }
  }
  if (lineItems.length && (effAlign === "center" || effAlign === "right")) {
    const used = x - ctx.x;
    const extra = Math.max(0, W - used);
    const dx = effAlign === "center" ? extra / 2 : extra;
    if (dx > 0.5) for (const it of lineItems) shiftSubtreeX(it, dx);
  }
  if (nowrap && ellipsis && lineItems.length) applyEllipsis(lineItems, W);
  return totalH + lineH;
}
function applyEllipsis(lineItems, availW) {
  let total = 0;
  for (const it2 of lineItems) total += it2.width || 0;
  if (total <= availW + 0.5) return;
  const ref = lineItems.find((it2) => it2.kind === "#text" && it2.style) || {};
  const style = ref.style || {};
  const ellW = textWidth2("\u2026", style);
  const budget = Math.max(0, availW - ellW);
  let acc = 0, cutAt = -1;
  for (let i = 0; i < lineItems.length; i++) {
    const it2 = lineItems[i];
    if (it2.kind === "#text" && it2.text) {
      if (acc + (it2.width || 0) <= budget + 0.5) {
        acc += it2.width || 0;
        continue;
      }
      cutAt = i;
      break;
    }
    acc += it2.width || 0;
  }
  if (cutAt < 0) return;
  const it = lineItems[cutAt];
  let t = String(it.text || "");
  while (t.length > 1 && textWidth2(t, style) > budget - acc + 0.5) t = t.slice(0, -1);
  it.text = t.replace(/\s+$/, "") + "\u2026";
  it.width = textWidth2(it.text, style);
  let cursor = it.x + it.width;
  for (let j = cutAt + 1; j < lineItems.length; j++) {
    const jt = lineItems[j];
    const jw = jt.kind === "#text" ? 0 : jt.width || 0;
    if (jt.kind === "#text") {
      jt.text = "";
      jt.width = 0;
    }
    if (jt.x !== cursor) shiftSubtreeX(jt, cursor - jt.x);
    cursor += jw;
  }
}
function naturalInlineWidth(node, style, availW) {
  const kids = renderChildren(node);
  if (node.localName === "select") {
    let w2 = 1;
    for (const k of node.children || []) {
      if (k && k.nodeType === 1 && k.localName === "option") w2 = Math.max(w2, textWidth2(optionLabel(k), style));
    }
    return Math.max(1, w2);
  }
  if (!kids.length) {
    const t = renderOwnText(node);
    return t ? textWidth2(t, style) : defaultHeight(node, style);
  }
  let w = 0;
  for (const k of kids) {
    if (k.nodeType === 3) w += textWidth2(k.textContent, inheritFont(style));
    else w += naturalInlineWidth(k, styleOf(k), availW);
  }
  return Math.max(1, w);
}
function layoutInlineBox(node, ctx, out, style) {
  const pieces = inlinePieces(inlineKids(node), { ...ctx, inlineStyle: inheritFont(style) });
  const w = Math.max(1, Math.min(Math.max(1, ctx.width), pieces.reduce((n2, p) => n2 + p.w, 0) || 1));
  const h = lineHeightOf(style);
  const item = { node, x: ctx.x, y: ctx.y, width: w, height: h, style, children: [], kind: node.localName || "span" };
  out.push(item);
  let ix = ctx.x;
  for (const p of pieces) {
    if (p.kind === "word") {
      const t = { node: minimalTextNode(p.node && p.node.parentNode), x: ix, y: ctx.y, width: p.w, height: p.h, style: p.style, children: [], kind: "#text", text: p.text };
      out.push(t);
      item.children.push(t);
      ix += p.w;
    } else if (p.kind === "space") ix += p.w;
  }
  return item;
}
function layoutMasonry(children, parent, ctx, out, rowMasonry) {
  const s = parent.style || {};
  const gaps = parseGridGap(s);
  const gap = gaps.col, rowGap = gaps.row;
  const items = children.filter((c) => !hidden(c) && c.nodeType !== 3);
  const depth = (ctx.depth || 0) + 1;
  parent.x = ctx.x;
  parent.y = ctx.y;
  if (rowMasonry) {
    const colText = String(s["grid-template-columns"] || "").trim();
    const cols = colText ? tracks(colText, ctx.width, gap, items.length) : [ctx.width];
    const C = Math.max(1, cols.length);
    const colX = [0];
    for (let i = 0; i < C; i++) colX.push(colX[i] + (cols[i] || 100) + gap);
    const colH = new Array(C).fill(0);
    for (const child of items) {
      let c = 0;
      for (let i = 1; i < C; i++) if (colH[i] < colH[c]) c = i;
      const got = layoutBlockBox(child, { x: ctx.x + colX[c], y: ctx.y + colH[c], width: Math.max(1, cols[c] || 100), viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
      if (!got) continue;
      parent.children.push(got);
      colH[c] += got.height + rowGap;
    }
    parent.height = Math.max(0, Math.max(...colH) - rowGap);
    parent.width = ctx.width;
  } else {
    let x = 0, maxH = 0;
    for (const child of items) {
      const got = layoutBlockBox(child, { x: ctx.x + x, y: ctx.y, width: Math.max(1, ctx.width), viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
      if (!got) continue;
      parent.children.push(got);
      x += got.width + gap;
      maxH = Math.max(maxH, got.height);
    }
    parent.width = Math.max(1, x - gap);
    parent.height = maxH;
  }
  return { height: parent.height, throughTop: 0, throughBottom: 0, oof: [] };
}
function layoutGrid(children, parent, ctx, out) {
  const s = parent.style || {};
  const colText = String(s["grid-template-columns"] || "").trim(), rowText = String(s["grid-template-rows"] || "").trim();
  const rowMasonry = /\bmasonry\b/i.test(rowText);
  const colMasonry = /\bmasonry\b/i.test(colText);
  if (rowMasonry || colMasonry) {
    return layoutMasonry(children, parent, ctx, out, rowMasonry);
  }
  const gaps = parseGridGap(s);
  let gap = gaps.col, rowGap = gaps.row;
  const sg = ctx.subgrid || null;
  const useSubCol = sg && sg.cols && sg.cols.length > 0;
  const useSubRow = sg && sg.rows && sg.rows.length > 0;
  if (useSubCol && sg.gap != null) gap = sg.gap;
  if (useSubRow && sg.rowGap != null) rowGap = sg.rowGap;
  const items = children.filter((c) => !hidden(c) && c.nodeType !== 3);
  const areaInfo = parseGridAreas(s["grid-template-areas"]);
  const colLineNames = parseGridLineNames(colText);
  const rowLineNames = parseGridLineNames(rowText);
  const flow = String(s["grid-auto-flow"] || "row").trim().toLowerCase();
  const colFlow = flow.indexOf("column") === 0;
  const dense = flow.indexOf("dense") >= 0;
  const cols = useSubCol ? sg.cols.slice() : colText ? tracks(colText, ctx.width, gap, items.length) : [];
  const explicitCols = cols.slice();
  let C = Math.max(1, cols.length || areaInfo.cols);
  if (!cols.length && !colFlow) for (let i = 0; i < C; i++) cols.push(Math.max(1, (ctx.width - gap * (C - 1)) / C));
  const rowTokens = rowText ? expandRepeat(rowText, ctx.height || 0, rowGap, Math.ceil(items.length / C)) : [];
  const explicitRows = rowTokens.length ? tracks(rowText, ctx.height || 0, rowGap, Math.ceil(items.length / C)) : [];
  const autoRowFixed = dim(String(s["grid-auto-rows"] || "auto").trim(), ctx.height || 0) || 0;
  const autoColFixed = dim(String(s["grid-auto-columns"] || "auto").trim(), ctx.width) || 0;
  let justifyItems = gridAlignValue(s["justify-items"], "stretch");
  let alignItems = gridAlignValue(s["align-items"], "stretch");
  const pi = String(s["place-items"] || "").trim().split(/\s+/).filter(Boolean);
  if (pi.length === 1) {
    const v = gridAlignValue(pi[0], "stretch");
    alignItems = v;
    justifyItems = v;
  } else if (pi.length >= 2) {
    alignItems = gridAlignValue(pi[0], alignItems);
    justifyItems = gridAlignValue(pi[1], justifyItems);
  }
  const depth = (ctx.depth || 0) + 1;
  const occ = /* @__PURE__ */ new Set();
  const key = (r, c) => r + ":" + c;
  const fits = (r, c, cs2, rs2) => {
    for (let rr = r; rr < r + rs2; rr++) for (let cc = c; cc < c + cs2; cc++) if (occ.has(key(rr, cc))) return false;
    return true;
  };
  const occupy = (r, c, cs2, rs2) => {
    for (let rr = r; rr < r + rs2; rr++) for (let cc = c; cc < c + cs2; cc++) occ.add(key(rr, cc));
  };
  const ensureCols = (n2) => {
    while (cols.length < n2) {
      const w = autoColFixed > 0 ? autoColFixed : explicitCols.length ? sum(explicitCols, 0, explicitCols.length) / explicitCols.length : Math.max(1, ctx.width);
      cols.push(Math.max(1, w));
    }
    if (cols.length > C) C = cols.length;
  };
  const resolveLine = (v, isCol) => {
    if (v > 0) return v;
    if (v < 0) {
      const n2 = (isCol ? C : Math.max(explicitRows.length, 1)) + 2 + v;
      return Math.max(1, n2);
    }
    return 0;
  };
  const domIdx = new Map(items.map((c, i) => [c, i]));
  const placeSeq = items.slice().sort((a, b) => num2(styleOf(a).order, 0) - num2(styleOf(b).order, 0) || domIdx.get(a) - domIdx.get(b));
  const R = Math.max(1, explicitRows.length || areaInfo.rows);
  let curR = 1, curC = 1;
  const placed = [];
  for (const child of placeSeq) {
    const st = styleOf(child);
    const areaName = String(st["grid-area"] || "").trim();
    let pr = 0, pc = 0, rs = 1, cs = 1;
    const area = areaName && areaInfo.map[areaName];
    if (area) {
      pr = area.rs;
      pc = area.cs;
      rs = area.re - area.rs;
      cs = area.ce - area.cs;
    } else {
      let gpC = parseLinePlacement(st["grid-column"], colLineNames);
      let gpR = parseLinePlacement(st["grid-row"], rowLineNames);
      const ga = parseGridAreaShorthand(areaName);
      if (ga) {
        gpR = parseLinePlacement(ga.row, rowLineNames);
        gpC = parseLinePlacement(ga.col, colLineNames);
      }
      cs = gpC.span;
      rs = gpR.span;
      if (gpR.start) pr = resolveLine(gpR.start, false);
      if (gpC.start) pc = resolveLine(gpC.start, true);
    }
    if (pr && pc) {
      ensureCols(pc + cs - 1);
      occupy(pr, pc, cs, rs);
    } else if (pr && !pc) {
      let c = 1, r = pr, guard = 0;
      if (colFlow) {
        while (!fits(r, c, cs, rs) && guard++ < 1e5) c++;
      } else {
        while (!fits(r, c, cs, rs) && guard++ < 1e5) {
          c++;
          if (c + cs - 1 > C) {
            c = 1;
            r++;
          }
        }
      }
      pc = c;
      pr = r;
      ensureCols(pc + cs - 1);
      occupy(pr, pc, cs, rs);
    } else if (pc && !pr) {
      let r = 1, guard = 0;
      if (colFlow) {
        while ((r + rs - 1 > R || !fits(r, pc, cs, rs)) && guard++ < 1e5) r++;
      } else {
        while (!fits(r, pc, cs, rs) && guard++ < 1e5) r++;
      }
      pr = r;
      ensureCols(pc + cs - 1);
      occupy(pr, pc, cs, rs);
    } else if (colFlow) {
      let r = dense ? 1 : curR, c = dense ? 1 : curC, guard = 0;
      for (; ; ) {
        if (r + rs - 1 <= R && fits(r, c, cs, rs)) break;
        r++;
        if (r + rs - 1 > R) {
          r = 1;
          c++;
        }
        if (guard++ > 1e5) break;
      }
      pr = r;
      pc = c;
      ensureCols(pc + cs - 1);
      occupy(pr, pc, cs, rs);
      curR = r + rs;
      curC = c;
      if (curR + rs - 1 > R) {
        curR = 1;
        curC = c + 1;
      }
    } else {
      let r = dense ? 1 : curR, c = dense ? 1 : curC, guard = 0;
      while (!fits(r, c, cs, rs) && guard++ < 1e5) {
        c++;
        if (c + cs - 1 > C) {
          c = 1;
          r++;
        }
      }
      pr = r;
      pc = c;
      ensureCols(pc + cs - 1);
      occupy(pr, pc, cs, rs);
      curC = c + cs;
      curR = r;
      if (curC > C) {
        curC = 1;
        curR = r + 1;
      }
    }
    placed.push({ child, st, pr, pc, rs, cs, dom: domIdx.get(child) });
  }
  placed.sort((a, b) => a.dom - b.dom);
  const jc = String(s["justify-content"] || "start").trim().toLowerCase();
  const tracksW = sum(cols, 0, cols.length) + gap * Math.max(0, cols.length - 1);
  const freeW = Math.max(0, ctx.width - tracksW);
  let xLead = 0, xGap = gap;
  if (jc === "center") xLead = freeW / 2;
  else if (jc === "end" || jc === "flex-end" || jc === "right") xLead = freeW;
  else if ((jc === "space-between" || jc === "space-around" || jc === "space-evenly") && cols.length > 0) {
    if (jc === "space-between" && cols.length > 1) xGap = gap + freeW / (cols.length - 1);
    else if (jc === "space-around") {
      xLead = freeW / (cols.length * 2);
      xGap = gap + freeW / cols.length;
    } else if (jc === "space-evenly") {
      xLead = freeW / (cols.length + 1);
      xGap = gap + xLead;
    }
  }
  const colX = [xLead];
  for (let i = 0; i < cols.length; i++) colX.push(colX[i] + cols[i] + xGap);
  const rowHeights = [];
  explicitRows.forEach((h, i) => {
    rowHeights[i] = h;
  });
  if (useSubRow) {
    for (let i = 0; i < sg.rows.length; i++) rowHeights[i] = sg.rows[i];
  }
  const laid = [];
  for (const p of placed) {
    const cellW = sum(cols, p.pc - 1, p.pc - 1 + p.cs) + xGap * (p.cs - 1);
    const js = gridAlignValue(p.st["justify-self"], justifyItems);
    const as = gridAlignValue(p.st["align-self"], alignItems);
    const explicitW = dim(p.st.width, cellW);
    const itemW = explicitW > 0 ? Math.min(cellW, explicitW) : cellW;
    const pColText = String(p.st["grid-template-columns"] || "").trim().toLowerCase();
    const pRowText = String(p.st["grid-template-rows"] || "").trim().toLowerCase();
    const isSubCol = pColText === "subgrid" || pColText.split(/\s+/).includes("subgrid");
    const isSubRow = pRowText === "subgrid" || pRowText.split(/\s+/).includes("subgrid");
    let subgridCtx = null;
    if ((isSubCol || isSubRow) && String(p.st.display || "").trim().toLowerCase().includes("grid")) {
      subgridCtx = {
        cols: isSubCol ? cols.slice(p.pc - 1, p.pc - 1 + p.cs) : null,
        colX: isSubCol ? colX.slice(p.pc - 1, p.pc - 1 + p.cs).map((x) => x - colX[p.pc - 1]) : null,
        gap: isSubCol ? xGap : null,
        rows: isSubRow ? rowHeights.slice(p.pr - 1, p.pr - 1 + p.rs) : null,
        rowGap: isSubRow ? rowGap : null
      };
    }
    const got = layoutBlockBox(p.child, { x: ctx.x + colX[p.pc - 1], y: 0, width: Math.max(1, itemW), viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb, subgrid: subgridCtx }, out);
    if (!got) continue;
    parent.children.push(got);
    laid.push({ ...p, got, cellW, js, as });
    if (p.rs === 1) {
      const idx = p.pr - 1;
      if (explicitRows[idx] == null) {
        rowHeights[idx] = autoRowFixed > 0 ? autoRowFixed : Math.max(rowHeights[idx] || 0, got.height);
      }
    }
  }
  for (const l of laid) {
    if (l.rs > 1) {
      let have = rowGap * (l.rs - 1), lastImplicit = -1;
      for (let rr = l.pr; rr < l.pr + l.rs; rr++) {
        have += rowHeights[rr - 1] || 0;
        if (explicitRows[rr - 1] == null && autoRowFixed <= 0) lastImplicit = rr - 1;
      }
      if (lastImplicit >= 0 && l.got.height > have) rowHeights[lastImplicit] += l.got.height - have;
    }
  }
  const nRows = rowHeights.length;
  const tracksH = sum(rowHeights, 0, nRows) + rowGap * Math.max(0, nRows - 1);
  const alignBoxH = ctx.height > 0 ? ctx.height : tracksH;
  const freeH = Math.max(0, alignBoxH - tracksH);
  const ac = String(s["align-content"] || "start").trim().toLowerCase();
  let yLead = 0, yGap = rowGap;
  if (ac === "center") yLead = freeH / 2;
  else if (ac === "end" || ac === "flex-end") yLead = freeH;
  else if ((ac === "space-between" || ac === "space-around" || ac === "space-evenly") && nRows > 0) {
    if (ac === "space-between" && nRows > 1) yGap = rowGap + freeH / (nRows - 1);
    else if (ac === "space-around") {
      yLead = freeH / (nRows * 2);
      yGap = rowGap + freeH / nRows;
    } else if (ac === "space-evenly") {
      yLead = freeH / (nRows + 1);
      yGap = rowGap + yLead;
    }
  }
  const rowY = [yLead];
  for (let i = 0; i < nRows; i++) rowY.push(rowY[i] + (rowHeights[i] || 0) + yGap);
  for (const l of laid) {
    const cellH = sum(rowHeights, l.pr - 1, l.pr - 1 + l.rs) + yGap * (l.rs - 1);
    shiftSubtree(l.got, ctx.y + rowY[l.pr - 1] - l.got.y);
    let dx = 0;
    if (l.js === "center") dx = (l.cellW - l.got.width) / 2;
    else if (l.js === "end") dx = l.cellW - l.got.width;
    if (dx) shiftSubtreeX(l.got, dx);
    const explicitH = dim(l.st.height, 0) > 0;
    if (l.as === "stretch" && !explicitH && l.got.height < cellH) l.got.height = cellH;
    else if (l.as === "center" || l.as === "end") {
      const dy = l.as === "center" ? (cellH - l.got.height) / 2 : cellH - l.got.height;
      if (dy > 0) shiftSubtree(l.got, dy);
    }
  }
  return { height: nRows ? rowY[nRows] - yGap - yLead : 0, oof: [] };
}
function parseGridLineNames(text) {
  const map = {};
  let line = 1;
  for (const tok of splitTrackList(String(text || ""))) {
    const names = [];
    const bare = String(tok).replace(/\[([^\]]*)\]/g, (m, n2) => {
      if (String(n2).trim()) names.push(String(n2).trim());
      return " ";
    }).trim();
    for (const n2 of names) {
      (map[n2] = map[n2] || []).push(line);
    }
    if (bare) line++;
  }
  return map;
}
function parseGridAreaShorthand(v) {
  const t = String(v || "").trim();
  if (!t || t.indexOf("/") < 0) return null;
  const parts = t.split("/").map((x) => x.trim());
  if (parts.length !== 2 && parts.length !== 4) return null;
  const ok = (p) => /^(auto|span\s+\d+|-?\d+|[a-zA-Z_][\w-]*)$/.test(p);
  if (!parts.every(ok)) return null;
  if (parts.length === 2) return { row: parts[0], col: parts[1] };
  return { row: parts[0] + "/" + parts[2], col: parts[1] + "/" + parts[3] };
}
function parseGridGap(s) {
  let row = 0, col = 0;
  const g = String(s.gap || "").trim();
  if (g) {
    const parts = g.split(/\s+/);
    if (parts.length === 1) row = col = px(parts[0]);
    else {
      row = px(parts[0]);
      col = px(parts[1]);
    }
  }
  if (String(s["row-gap"] || "").trim() !== "") row = px(s["row-gap"]);
  if (String(s["column-gap"] || "").trim() !== "") col = px(s["column-gap"]);
  return { row, col };
}
function parseGridAreas(text) {
  const rows = [];
  const re = /"([^"]*)"|'([^']*)'/g;
  let m;
  while (m = re.exec(String(text || ""))) {
    const content = m[1] !== void 0 ? m[1] : m[2];
    rows.push(content.trim().split(/\s+/).filter(Boolean));
  }
  const map = {};
  rows.forEach((cells, r) => cells.forEach((name, c) => {
    if (!name || name === ".") return;
    const a = map[name] || (map[name] = { rs: r + 1, cs: c + 1, re: r + 2, ce: c + 2 });
    a.rs = Math.min(a.rs, r + 1);
    a.cs = Math.min(a.cs, c + 1);
    a.re = Math.max(a.re, r + 2);
    a.ce = Math.max(a.ce, c + 2);
  }));
  return { map, rows: rows.length, cols: Math.max(0, ...rows.map((r) => r.length)) };
}
function parseLinePlacement(v, lineNames) {
  const t = String(v || "").trim().toLowerCase();
  if (!t || t === "auto") return { start: 0, span: 1 };
  const names = lineNames || {};
  const val = (tok) => {
    if (!tok) return {};
    const spm = String(tok).match(/span\s+(\d+)/i);
    if (spm) return { span: Number(spm[1]) };
    const nm = names[tok];
    if (nm && nm.length) return { start: nm[0] };
    const m = String(tok).match(/^(-?\d+)/);
    if (m) return { start: Number(m[1]) };
    return {};
  };
  const parts = t.split("/").map((x) => x.trim());
  const a = val(parts[0]), b = val(parts[1]);
  let start = 0, span = 1;
  if (a.span) span = a.span;
  else if (a.start) start = a.start;
  if (b.span) span = b.span;
  else if (b.start) {
    if (start) span = Math.max(1, b.start - start);
    else start = b.start;
  }
  return { start, span };
}
function gridAlignValue(v, fallback) {
  const t = String(v || "").trim().toLowerCase();
  if (!t || t === "auto") return fallback;
  if (t === "start" || t === "flex-start" || t === "left") return "start";
  if (t === "end" || t === "flex-end" || t === "right") return "end";
  if (t === "center") return "center";
  return "stretch";
}
function num2(v, fallback) {
  const n2 = Number(String(v || "").trim());
  return Number.isFinite(n2) ? n2 : fallback;
}
function layoutFlex(children, parent, ctx, out) {
  const s = parent.style || {};
  const ff = String(s["flex-flow"] || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  let dir = String(s["flex-direction"] || "").trim().toLowerCase();
  let wrap = String(s["flex-wrap"] || "").trim().toLowerCase();
  for (const t of ff) {
    if (t === "row" || t === "row-reverse" || t === "column" || t === "column-reverse") {
      if (!dir) dir = t;
    } else if (t === "nowrap" || t === "wrap" || t === "wrap-reverse") {
      if (!wrap) wrap = t;
    }
  }
  dir = dir || "row";
  wrap = wrap || "nowrap";
  const opts = { rev: dir === "row-reverse" || dir === "column-reverse", wrapRev: wrap === "wrap-reverse", wrap: wrap !== "nowrap" };
  if (dir.indexOf("column") === 0) return layoutFlexColumn(children, parent, ctx, out, opts);
  return layoutFlexRow(children, parent, ctx, out, opts);
}
function isAutoMargin(style, side) {
  const s = style || {};
  const long = String(s["margin-" + side] || "").trim().toLowerCase();
  if (long) return long === "auto";
  const parts = String(s.margin || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  let v = "";
  if (parts.length === 1) v = parts[0];
  else if (parts.length === 2) v = side === "top" || side === "bottom" ? parts[0] : parts[1];
  else if (parts.length === 3) v = side === "top" ? parts[0] : side === "bottom" ? parts[2] : parts[1];
  else if (parts.length >= 4) v = { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] }[side] || "";
  return v === "auto";
}
function layoutFlexRow(children, parent, ctx, out, opts) {
  const s = parent.style || {};
  const o = opts || {};
  const W = Math.max(1, ctx.width);
  const gap = px(s.gap || s["column-gap"] || 0);
  const rowGap = px(s["row-gap"] || s.gap || 0);
  const justify = String(s["justify-content"] || "flex-start").trim().toLowerCase();
  const align = String(s["align-items"] || "stretch").trim().toLowerCase();
  const wrap = !!o.wrap;
  const items = children.filter((c) => !hidden(c)).map((child) => {
    const st = styleOf(child);
    return { child, style: st, basis: Math.max(0, Math.min(W, flexBasis(child, st, W))), grow: num2(st["flex-grow"], 0), shrink: num2(st["flex-shrink"], 1), order: num2(st.order, 0) };
  });
  items.forEach((it, i) => {
    it.idx = i;
  });
  items.sort((a, b) => a.order - b.order || a.idx - b.idx);
  const lines = [[]];
  let lineW = 0;
  for (const it of items) {
    const next = lineW ? lineW + gap + it.basis : it.basis;
    if (wrap && lines.at(-1).length && next > W + 0.5) {
      lines.push([]);
      lineW = 0;
    }
    lines.at(-1).push(it);
    lineW = lineW ? lineW + gap + it.basis : it.basis;
  }
  const depth = (ctx.depth || 0) + 1;
  let y = ctx.y, total = 0;
  const lineStarts = [], lineHs = [], lineLaid = [];
  for (const line of lines) {
    if (!line.length) continue;
    const baseSum = line.reduce((n3, it) => n3 + it.basis, 0);
    const gaps = gap * Math.max(0, line.length - 1);
    const free0 = W - baseSum - gaps;
    if (free0 > 0) {
      const gSum = line.reduce((n3, it) => n3 + it.grow, 0);
      for (const it of line) it.main = it.basis + (gSum > 0 ? free0 * it.grow / gSum : 0);
    } else if (free0 < 0) {
      const sSum = line.reduce((n3, it) => n3 + it.shrink * it.basis, 0) || 1;
      for (const it of line) it.main = Math.max(1, it.basis + free0 * (it.shrink * it.basis) / sSum);
    } else for (const it of line) it.main = it.basis;
    const used = line.reduce((n3, it) => n3 + it.main, 0) + gaps;
    const extra2 = Math.max(0, W - used);
    let nAutoMain = 0;
    for (const it of line) {
      it.mlAuto = isAutoMargin(it.style, "left");
      it.mrAuto = isAutoMargin(it.style, "right");
      if (it.mlAuto) nAutoMain++;
      if (it.mrAuto) nAutoMain++;
    }
    const autoMain = nAutoMain > 0 && extra2 > 0 ? extra2 / nAutoMain : 0;
    let x = ctx.x, between2 = gap;
    if (autoMain > 0) {
    } else if (justify === "center") x = ctx.x + extra2 / 2;
    else if (justify === "flex-end" || justify === "end" || justify === "right") x = ctx.x + extra2;
    else if (justify === "space-between" && line.length > 1) between2 = gap + extra2 / (line.length - 1);
    else if (justify === "space-around" && line.length) {
      x = ctx.x + extra2 / (line.length * 2);
      between2 = gap + extra2 / line.length;
    } else if (justify === "space-evenly" && line.length) {
      x = ctx.x + extra2 / (line.length + 1);
      between2 = gap + extra2 / (line.length + 1);
    }
    const laid = [];
    for (const it of line) {
      if (autoMain > 0 && it.mlAuto) x += autoMain;
      const got = layoutBlockBox(it.child, { x, y, width: it.main, viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
      if (got) {
        parent.children.push(got);
        laid.push({ it, got });
      }
      x += it.main + between2;
      if (autoMain > 0 && it.mrAuto) x += autoMain;
    }
    const lineH = laid.reduce((n3, l) => Math.max(n3, l.got.height), 0);
    const baseAlign = laid.some((l) => String(l.it.style["align-self"] || align).trim().toLowerCase() === "baseline");
    let maxBase = 0;
    if (baseAlign) for (const l of laid) maxBase = Math.max(maxBase, flexBaselineOf(l.it));
    for (const { it, got } of laid) {
      const selfAlign = String(it.style["align-self"] || align).trim().toLowerCase();
      let dy = 0;
      if (selfAlign === "baseline") dy = maxBase - flexBaselineOf(it);
      else if (selfAlign === "center") dy = (lineH - got.height) / 2;
      else if (selfAlign === "flex-end" || selfAlign === "end") dy = lineH - got.height;
      else if (selfAlign === "stretch" && !measuredHeight(it.child, it.style, 0) && got.height < lineH) got.height = lineH;
      if (dy) shiftSubtree(got, dy);
    }
    y += lineH + rowGap;
    total += lineH + rowGap;
    lineStarts.push(lineStarts.length ? y - lineH - rowGap : ctx.y);
    lineHs.push(lineH);
    lineLaid.push(laid);
  }
  const H = Math.max(0, total - rowGap);
  const ac = String(s["align-content"] || "stretch").trim().toLowerCase();
  const containerH = Math.max(H, dim(s.height, ctx.viewportHeight || 0) || 0);
  const extra = Math.max(0, containerH - H);
  const n2 = lineLaid.length;
  let startY = ctx.y, between = rowGap;
  if (extra > 0 && n2 > 0) {
    if (ac === "stretch") {
      const addPer = extra / n2;
      for (let li = 0; li < n2; li++) {
        const newLineH = lineHs[li] + addPer;
        for (const l of lineLaid[li]) {
          const selfAlign = String(l.it.style["align-self"] || align).trim().toLowerCase();
          if (selfAlign === "stretch" && !measuredHeight(l.it.child, l.it.style, 0)) {
            l.got.height = newLineH;
          } else if (selfAlign === "center") {
            shiftSubtree(l.got, addPer / 2);
          } else if (selfAlign === "flex-end" || selfAlign === "end") {
            shiftSubtree(l.got, addPer);
          }
        }
        lineHs[li] = newLineH;
      }
    } else if (ac === "center") startY = ctx.y + extra / 2;
    else if (ac === "flex-end" || ac === "end") startY = ctx.y + extra;
    else if (ac === "space-between" && n2 > 1) between = rowGap + extra / (n2 - 1);
    else if (ac === "space-around") {
      startY = ctx.y + extra / (2 * n2);
      between = rowGap + extra / n2;
    } else if (ac === "space-evenly") {
      startY = ctx.y + extra / (n2 + 1);
      between = rowGap + extra / (n2 + 1);
    }
  }
  let ly = startY;
  const spanTotal = lineHs.reduce((n3, h) => n3 + h, 0) + between * Math.max(0, n2 - 1);
  for (let li = 0; li < n2; li++) {
    let dy = ly - lineStarts[li];
    if (o.wrapRev) {
      const y0 = lineStarts[li] + dy;
      dy = 2 * startY + spanTotal - y0 - lineHs[li] - lineStarts[li];
    }
    if (dy) for (const l of lineLaid[li]) shiftSubtree(l.got, dy);
    for (const l of lineLaid[li]) {
      const freeC = lineHs[li] - l.got.height;
      if (freeC <= 0) continue;
      const mtA = isAutoMargin(l.it.style, "top"), mbA = isAutoMargin(l.it.style, "bottom");
      if (mtA && mbA) shiftSubtree(l.got, freeC / 2);
      else if (mtA) shiftSubtree(l.got, freeC);
    }
    ly += lineHs[li] + between;
  }
  if (o.rev) {
    for (const laid of lineLaid) for (const l of laid) {
      const nx = ctx.x + W - (l.got.x - ctx.x) - l.got.width;
      shiftSubtreeX(l.got, nx - l.got.x);
    }
  }
  return { height: H, oof: [] };
}
function flexBaselineOf(it) {
  const fs = dim((it.style || {})["font-size"], 0) || 14;
  return fs * 0.8;
}
function layoutFlexColumn(children, parent, ctx, out, opts) {
  const s = parent.style || {};
  const o = opts || {};
  const W = Math.max(1, ctx.width);
  const gap = px(s.gap || s["row-gap"] || 0);
  const colGap = px(s["column-gap"] || s.gap || 0);
  const justify = String(s["justify-content"] || "flex-start").trim().toLowerCase();
  const align = String(s["align-items"] || "stretch").trim().toLowerCase();
  const wrap = !!o.wrap;
  const depth = (ctx.depth || 0) + 1;
  const items = children.filter((c) => !hidden(c)).map((child) => {
    const st = styleOf(child);
    const selfAlign = String(st["align-self"] || align).trim().toLowerCase();
    const w = selfAlign === "stretch" ? W : Math.max(1, Math.min(W, dim(st.width, W) || naturalInlineWidth(child, st, W)));
    return { child, style: st, selfAlign, w, order: num2(st.order, 0) };
  });
  items.forEach((it, i) => {
    it.idx = i;
  });
  items.sort((a, b) => a.order - b.order || a.idx - b.idx);
  const laid = [];
  for (const it of items) {
    const got = layoutBlockBox(it.child, { x: ctx.x, y: 0, width: it.w, viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
    if (got) {
      parent.children.push(got);
      laid.push({ it, got });
    }
  }
  const explicitH = dim(s.height, ctx.viewportHeight || 0) || 0;
  const maxMain = wrap && explicitH > 0 ? explicitH : Infinity;
  const cols = [[]];
  let colH = 0;
  for (const l of laid) {
    const next = colH ? colH + gap + l.got.height : l.got.height;
    if (cols[cols.length - 1].length && next > maxMain + 0.5) {
      cols.push([]);
      colH = 0;
    }
    cols[cols.length - 1].push(l);
    colH = colH ? colH + gap + l.got.height : l.got.height;
  }
  let x = ctx.x, totalW = 0;
  const colXs = [];
  for (const col of cols) {
    if (!col.length) continue;
    const contentH = col.reduce((n2, l) => n2 + l.got.height, 0) + gap * Math.max(0, col.length - 1);
    const containerH = Math.max(contentH, explicitH);
    const extra = Math.max(0, containerH - contentH);
    let y = ctx.y, between = gap;
    if (justify === "center") y = ctx.y + extra / 2;
    else if (justify === "flex-end" || justify === "end") y = ctx.y + extra;
    else if (justify === "space-between" && col.length > 1) between = gap + extra / (col.length - 1);
    else if (justify === "space-around" && col.length) {
      y = ctx.y + extra / (col.length * 2);
      between = gap + extra / col.length;
    } else if (justify === "space-evenly" && col.length) {
      y = ctx.y + extra / (col.length + 1);
      between = gap + extra / (col.length + 1);
    }
    const colW = Math.max(1, col.reduce((n2, l) => Math.max(n2, l.got.width), 0));
    const crossW = !wrap || cols.length <= 1 ? W : colW;
    colXs.push({ x, col, colW, crossW, y0: y, between });
    for (const l of col) {
      const targetY = y + l.got.margin.top;
      shiftSubtree(l.got, targetY - l.got.y);
      let dx = 0;
      if (l.it.selfAlign === "center") dx = x + (crossW - l.got.width) / 2 - l.got.x;
      else if (l.it.selfAlign === "flex-end" || l.it.selfAlign === "end" || l.it.selfAlign === "right") dx = x + crossW - l.got.width - l.got.x;
      else if (l.it.selfAlign === "stretch") dx = x - l.got.x;
      const freeI = crossW - l.got.width;
      if (freeI > 0) {
        const mlA = isAutoMargin(l.it.style, "left"), mrA = isAutoMargin(l.it.style, "right");
        if (mlA && mrA) dx = x + freeI / 2 - l.got.x;
        else if (mlA) dx = x + freeI - l.got.x;
        else if (mrA) dx = x - l.got.x;
      }
      if (dx) shiftSubtreeX(l.got, dx);
      y += l.got.height + between;
    }
    x += colW + colGap;
    totalW += colW + colGap;
  }
  if (cols.length && cols[cols.length - 1].length) totalW -= colGap;
  const retH = Math.max(laid.reduce((n2, l) => n2 + l.got.height, 0) + gap * Math.max(0, laid.length - 1), explicitH);
  if (o.rev) {
    const boxH = Math.max(explicitH, retH);
    for (const l of laid) {
      const ny = ctx.y + boxH - (l.got.y - ctx.y) - l.got.height;
      shiftSubtree(l.got, ny - l.got.y);
    }
  }
  if (o.wrapRev && colXs.length > 1) {
    const boxW = Math.max(W, totalW);
    for (const c of colXs) {
      const nx = ctx.x + boxW - (c.x - ctx.x) - c.colW;
      const dx = nx - c.x;
      if (dx) for (const l of c.col) shiftSubtreeX(l.got, dx);
    }
  }
  return { height: retH, oof: [] };
}
function measuredWidth(node, s, avail) {
  const explicit = dim(s.width, avail);
  let w;
  if (explicit) w = explicit;
  else if (node.localName === "canvas") w = dim(node.attributes?.width || node.width, avail) || avail;
  else w = avail;
  const minW = dim(s["min-width"], avail);
  const maxW = dim(s["max-width"], avail);
  if (minW > 0) w = Math.max(w, minW);
  if (maxW > 0) w = Math.min(w, maxW);
  return w;
}
function measuredHeight(node, s, parent) {
  return dim(s.height, parent) || (node.localName === "canvas" ? dim(node.attributes?.height || node.height, parent) : 0);
}
function flexBasis(node, style, parent) {
  const s = style || styleOf(node);
  const fbRaw = String(s["flex-basis"] || "").trim().toLowerCase();
  if (fbRaw && fbRaw !== "auto") return Math.max(0, dim(fbRaw, parent));
  const w = dim(s.width, parent);
  if (w) return w;
  if (node.localName === "canvas") return Math.max(1, dim(node.attributes?.width || node.width, parent) || 0);
  const own = renderOwnText(node);
  if (own) return Math.max(1, textWidth2(own, s));
  const disp = String(s.display || "").trim().toLowerCase();
  if (disp === "flex" || disp === "inline-flex") {
    const ff = String(s["flex-flow"] || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
    let ddir = String(s["flex-direction"] || "").trim().toLowerCase();
    for (const t of ff) if (t === "row" || t === "row-reverse" || t === "column" || t === "column-reverse") {
      if (!ddir) ddir = t;
    }
    const isRow = ddir.indexOf("column") !== 0;
    const fg = px(s.gap || s["column-gap"] || 0);
    let total = 0, count = 0, widest2 = 0;
    for (const k of node.children || []) {
      if (hidden(k) || !k || k.nodeType !== 1) continue;
      const ks = styleOf(k);
      const pad = box(ks, "padding", parent);
      const kw = dim(ks.width, parent);
      const outer = (kw > 0 ? kw : naturalInlineWidth(k, ks, parent)) + pad.left + pad.right;
      if (isRow) {
        total += outer;
        count++;
      } else widest2 = Math.max(widest2, outer);
    }
    return Math.max(1, isRow ? total + fg * Math.max(0, count - 1) : widest2);
  }
  let widest = 0;
  for (const k of node.children || []) {
    if (hidden(k)) continue;
    if (k.nodeType === 3) widest = Math.max(widest, textWidth2(k.textContent, inheritFont(s)));
    else {
      const ks = styleOf(k);
      const pad = box(ks, "padding", parent);
      const kw = dim(ks.width, parent);
      widest = Math.max(widest, (kw > 0 ? kw : naturalInlineWidth(k, ks, parent)) + pad.left + pad.right);
    }
  }
  return Math.max(1, widest);
}
function tracks(text, total, gap, hint) {
  const flat = [];
  for (const p of expandRepeat(text, total, gap, hint)) {
    if (/^repeat\(/i.test(p)) flat.push(...expandRepeat(p, total, gap, hint));
    else flat.push(p);
  }
  const sized = flat.filter((p) => !/^\[[^\]]*\]$/.test(String(p).trim()));
  const fixed = sized.map((p) => trackSize(p, total).fixed || 0);
  const fr = sized.map((p) => trackSize(p, total).fr || 0);
  const free = Math.max(1, (total || sum(fixed, 0, fixed.length) || 1) - gap * Math.max(0, sized.length - 1) - sum(fixed, 0, fixed.length));
  const frSum = sum(fr, 0, fr.length) || 1;
  return sized.length ? sized.map((_, i) => fixed[i] || (fr[i] ? free * fr[i] / frSum : 1)) : Array.from({ length: Math.max(1, hint || 1) }, () => total || 1);
}
function trackSize(token, total) {
  const t = String(token || "").trim();
  const mm = t.match(/^minmax\(\s*([^,]+?)\s*,\s*(.+?)\s*\)$/i);
  if (mm) {
    const maxT = mm[2].trim();
    if (maxT.endsWith("fr")) return { fr: Number(maxT.slice(0, -2)) || 1 };
    return { fixed: dim(maxT, total) || dim(mm[1].trim(), total) || 1 };
  }
  if (t.endsWith("fr")) return { fr: Number(t.slice(0, -2)) || 1 };
  return { fixed: dim(t, total) || 1 };
}
function splitTrackList(text) {
  const parts = [];
  let depth = 0, cur = "", quote = "";
  const push = () => {
    if (cur) {
      parts.push(cur);
      cur = "";
    }
  };
  for (const ch of String(text || "")) {
    if (quote) {
      cur += ch;
      if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (depth === 0 && (ch === "[" || ch === "]")) {
      if (ch === "[") push();
      cur += ch;
      if (ch === "]") push();
      continue;
    }
    if (/\s/.test(ch) && depth === 0) {
      push();
      continue;
    }
    cur += ch;
  }
  push();
  return parts;
}
function expandRepeat(text, total, gap, itemCount) {
  const src = String(text || "").trim();
  const head = src.match(/^repeat\(\s*(auto-fit|auto-fill|\d+)/i);
  if (head) {
    const open = src.indexOf("(");
    let depth = 0, end = -1;
    for (let i = open; i < src.length; i++) {
      if (src[i] === "(") depth++;
      else if (src[i] === ")") {
        depth--;
        if (!depth) {
          end = i;
          break;
        }
      }
    }
    const innerFull = end > 0 ? src.slice(open + 1, end) : "";
    const inner = innerFull.replace(/^(auto-fit|auto-fill|\d+)\s*,/i, "").trim();
    if (/^auto-fit|^auto-fill/i.test(head[1])) {
      let minPx = 0, track = inner || "1fr";
      const mm = inner.match(/^minmax\(\s*([^,]+?)\s*,\s*(.+?)\s*\)$/i);
      if (mm) {
        minPx = dim(mm[1], total);
        track = mm[2].trim();
      } else if (inner) minPx = dim(inner, total);
      const g = gap || 0;
      let count = Math.max(1, Math.floor(((total || 0) + g) / (Math.max(1, minPx) + g)) || 1);
      if (/^auto-fit/i.test(head[1])) count = Math.min(count, Math.max(1, itemCount || 1));
      return Array.from({ length: Math.min(count, MAX_GRID_TRACKS) }, () => track);
    }
    const n2 = Math.min(Number(head[1]) || 1, MAX_GRID_TRACKS);
    return Array.from({ length: n2 }, () => inner);
  }
  return splitTrackList(src);
}
function layoutText(node, ctx, out, parentStyle) {
  const text = String(node.textContent || "").trim();
  if (!text) return null;
  const item = { node, x: ctx.x, y: ctx.y, width: ctx.width, height: textHeight(text, parentStyle || {}, ctx.width), style: parentStyle || {}, kind: "#text", text };
  out.push(item);
  return item;
}
function nodeFrom(raw = {}, depth = 0) {
  const localName = String(raw.tagName || raw.localName || "div").replace(/^#TEXT$/i, "#text").toLowerCase();
  return { ...raw, localName, nodeType: raw.nodeType || (localName === "#text" ? 3 : 1), textContent: raw.textContent || "", style: raw.style || {}, computedStyle: raw.computedStyle || {}, attributes: raw.attributes || {}, children: depth > MAX_LAYOUT_DEPTH ? [] : childArray(raw.children).map((c) => nodeFrom(c, depth + 1)) };
}
function defineHiddenProps(obj, props) {
  for (const k of Object.keys(props)) obj[k] = props[k];
}
function normalizeNode(node) {
  if (!node || node.nodeType !== 1) return;
  const attrs = node.attributes || {};
  if (node.id == null) node.id = attrs.id != null ? String(attrs.id) : "";
  const classAttr = node.className != null ? String(node.className) : String(attrs.class || "");
  const classes = classAttr.split(/\s+/).filter(Boolean);
  const hidden2 = {
    classList: { contains: (c) => classes.includes(String(c)) }
  };
  if (typeof node.getAttribute !== "function") {
    hidden2.getAttribute = (name) => {
      const v = attrs[String(name)];
      return v == null ? null : String(v);
    };
  }
  if (typeof node.hasAttribute !== "function") {
    hidden2.hasAttribute = (name) => Object.prototype.hasOwnProperty.call(attrs, String(name));
  }
  defineHiddenProps(node, hidden2);
  if (attrs.disabled != null) node.disabled = true;
  if (attrs.checked != null) node.checked = true;
  if (attrs.selected != null) node.selected = true;
  if (attrs.required != null) node.required = true;
  if (node.value == null && attrs.value != null) node.value = String(attrs.value);
  if (node.type == null && attrs.type != null) node.type = String(attrs.type);
}
function wireParents(node, parent = null, doc = null) {
  if (!node) return node;
  if (!doc) doc = { documentElement: node.nodeType === 1 ? node : null };
  defineHiddenProps(node, { parentNode: parent, ownerDocument: doc });
  normalizeNode(node);
  const kids = node.children || [];
  for (let i = 0; i < kids.length; i++) {
    defineHiddenProps(kids[i], {
      previousSibling: i > 0 ? kids[i - 1] : null,
      nextSibling: i < kids.length - 1 ? kids[i + 1] : null
    });
  }
  for (const child of kids) wireParents(child, node, doc);
  return node;
}
function applyCascade(root, rules, viewport, anim = null, propertyRegs = {}, containerRules = []) {
  const containerStack = [];
  walk(root, (n2) => {
    if (!n2 || n2.nodeType !== 1) return;
    const d = depthOf(n2);
    while (containerStack.length && containerStack[containerStack.length - 1].depth >= d) containerStack.pop();
    const parent = n2.parentNode;
    const parentComputed = parent && parent.nodeType === 1 ? parent.computedStyle || {} : {};
    n2.computedStyle = computeElementStyle(n2, rules, parentComputed, propertyRegs);
    if (containerRules.length && containerStack.length) {
      const extra = matchingContainerRules(n2, containerStack, containerRules);
      if (extra.length) {
        n2.computedStyle = computeElementStyle(n2, rules.concat(extra), parentComputed, propertyRegs);
      }
    }
    const ctype = String(n2.computedStyle["container-type"] || "").trim().toLowerCase();
    if (ctype && ctype !== "normal" && ctype !== "none") {
      const cname = String(n2.computedStyle["container-name"] || "").trim().toLowerCase();
      containerStack.push({ node: n2, type: ctype, name: cname, depth: d });
    }
    if (n2.computedStyle.direction == null || String(n2.computedStyle.direction).trim() === "") {
      const d2 = typeof n2.getAttribute === "function" ? n2.getAttribute("dir") : null;
      if (d2 && /^(rtl|ltr)$/i.test(String(d2).trim())) n2.computedStyle.direction = String(d2).trim().toLowerCase();
    }
    if (anim) n2.computedStyle = applyAnimationState(n2, n2.computedStyle, anim);
    if (n2.localName === "li") {
      try {
        n2.__marker = markerForLi(n2, rules);
      } catch {
        n2.__marker = null;
      }
    }
    if (n2.localName === "body" && n2.computedStyle["min-height"] == null) {
      n2.computedStyle["min-height"] = `${viewport.height}px`;
    }
  });
}
function depthOf(n2) {
  let d = 0, p = n2.parentNode;
  while (p) {
    d++;
    p = p.parentNode;
  }
  return d;
}
function matchingContainerRules(node, containerStack, containerRules) {
  const out = [];
  for (const cr of containerRules) {
    let container = null;
    for (let i = containerStack.length - 1; i >= 0; i--) {
      const c = containerStack[i];
      if (!cr.name || c.name === cr.name || c.name.split(/\s+/).includes(cr.name)) {
        container = c;
        break;
      }
    }
    if (!container) continue;
    if (!evaluateContainerCondition(cr.condition, container)) continue;
    for (const r of cr.rules) out.push(r);
  }
  return out;
}
function evaluateContainerCondition(cond, container) {
  if (!cond) return false;
  if (cond.kind === "not") return !evaluateContainerCondition(cond.cond, container);
  if (cond.kind === "bool" && Array.isArray(cond.conds)) {
    let result = evaluateContainerCondition(cond.conds[0], container);
    for (let i = 0; i < cond.ops.length; i++) {
      const r = evaluateContainerCondition(cond.conds[i + 1], container);
      result = cond.ops[i] === "and" ? result && r : result || r;
    }
    return !!result;
  }
  const style = container.node && container.node.computedStyle || {};
  if (cond.kind === "style") {
    const m = String(cond.query || "").match(/^(--[\w-]+)\s*:\s*([\s\S]*)$/);
    if (!m) return false;
    const actual = String(style[m[1]] || "").trim().toLowerCase();
    return actual === String(m[2]).trim().toLowerCase();
  }
  if (cond.kind === "size") {
    if (cond.prop === "height" && container.type === "inline-size") return false;
    const raw = cond.prop === "width" ? style.width : style.height;
    const px2 = resolveContainerPx(raw);
    if (px2 == null) return false;
    const v = cond.value;
    if (cond.op === "min-") return px2 >= v;
    if (cond.op === "max-") return px2 <= v;
    return px2 === v;
  }
  return false;
}
function resolveContainerPx(raw) {
  const t = String(raw || "").trim().toLowerCase();
  const m = t.match(/^(-?\d+(?:\.\d+)?)px$/);
  return m ? Number(m[1]) : null;
}
var { generatedBoxesFor, matchPseudoRules: matchPseudoRules2 } = import_CssPseudoElements2.default;
function cmpSpecTuple(a, b) {
  const n2 = Math.max(a.length, b.length);
  for (let i = 0; i < n2; i++) {
    const d = (a[i] || 0) - (b[i] || 0);
    if (d) return d;
  }
  return 0;
}
function cascadePseudoStyle(element, matched) {
  const decls = [];
  for (const rule of matched || []) {
    for (const d of rule.declarations || []) {
      decls.push({
        name: d.name,
        value: d.value,
        important: !!d.important,
        spec: rule.specificity || [0, 0, 0, 0],
        order: rule.order || 0
      });
    }
  }
  decls.sort(
    (a, b) => a.important - b.important || cmpSpecTuple(a.spec, b.spec) || a.order - b.order
  );
  const flat = {};
  for (const d of decls) flat[d.name] = d.value;
  const out = { ...flat };
  const host = element && element.computedStyle || {};
  for (const k of ["font-size", "font-family", "font-weight", "font-style", "color", "line-height"]) {
    if (out[k] == null && host[k] != null) out[k] = host[k];
  }
  resolveVarsInPlace(out, { ...host, ...out });
  return out;
}
function normalizeOwnText(n2) {
  if ((n2.children || []).length) return;
  const t = String(n2.textContent || "");
  if (!t.trim()) return;
  n2.children.push({ nodeType: 3, textContent: t, parentNode: n2, localName: "#text", children: [] });
}
function firstTextNode(root) {
  const stack = [root];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || hidden(cur)) continue;
    if (cur.nodeType === 3 && String(cur.textContent || "").trim()) return cur;
    const kids = cur.children || [];
    for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i]);
  }
  return null;
}
function injectPseudoBox(host, spec) {
  normalizeOwnText(host);
  const display = String(spec.display || "inline").trim().toLowerCase() || "inline";
  const textNode = { nodeType: 3, textContent: spec.content, parentNode: null, localName: "#text", children: [] };
  const box2 = {
    nodeType: 1,
    localName: `::${spec.pseudo}`,
    attributes: {},
    style: {},
    computedStyle: { ...spec.style, display },
    children: [textNode],
    textContent: "",
    parentNode: host
  };
  textNode.parentNode = box2;
  if (spec.pseudo === "before") host.children.unshift(box2);
  else host.children.push(box2);
}
function applyFirstLetter(host, pseudoStyle) {
  normalizeOwnText(host);
  const t = firstTextNode(host);
  if (!t || !t.parentNode) return;
  const text = String(t.textContent || "");
  let idx = 0;
  while (idx < text.length && /\s/.test(text[idx])) idx++;
  if (idx >= text.length) return;
  const letterNode = { nodeType: 3, textContent: text[idx], parentNode: null, localName: "#text", children: [] };
  const span = {
    nodeType: 1,
    localName: "::first-letter",
    attributes: {},
    style: {},
    computedStyle: { ...pseudoStyle, display: "inline" },
    children: [letterNode],
    textContent: "",
    parentNode: t.parentNode
  };
  letterNode.parentNode = span;
  t.textContent = text.slice(0, idx) + text.slice(idx + 1);
  const kids = t.parentNode.children || [];
  const at = kids.indexOf(t);
  if (at >= 0) kids.splice(at, 0, span);
  else kids.unshift(span);
}
function materializePseudoElements(root, rules) {
  if (!rules || !rules.length) return;
  if (root && root.ownerDocument) {
    root.ownerDocument.__merkavaCounters = {};
    root.ownerDocument.__merkavaCountersApplied = true;
  }
  walk(root, (n2) => {
    if (!n2 || n2.nodeType !== 1 || hidden(n2)) return;
    try {
      applyCounters(n2, n2.computedStyle || {});
    } catch {
    }
    for (const spec of generatedBoxesFor(n2, rules, cascadePseudoStyle)) injectPseudoBox(n2, spec);
    if (n2.localName === "input" || n2.localName === "textarea") {
      const ph = matchPseudoRules2(n2, "placeholder", rules);
      if (ph.length) n2.__merkavaPlaceholder = cascadePseudoStyle(n2, ph);
    }
    const fl = matchPseudoRules2(n2, "first-line", rules);
    if (fl.length) n2.__merkavaFirstLine = cascadePseudoStyle(n2, fl);
    const flt = matchPseudoRules2(n2, "first-letter", rules);
    if (flt.length) applyFirstLetter(n2, cascadePseudoStyle(n2, flt));
  });
}
var FIRST_LINE_PROPS = /* @__PURE__ */ new Set([
  "color",
  "background-color",
  "font-weight",
  "font-style",
  "text-decoration",
  "text-transform",
  "letter-spacing",
  "word-spacing"
]);
function applyFirstLineStyles(out) {
  for (const item of out) {
    const fl = item.node && item.node.__merkavaFirstLine;
    if (!fl || !item.children || !item.children.length) continue;
    const texts = [];
    const stack = [...item.children];
    while (stack.length) {
      const c = stack.pop();
      if (!c) continue;
      if (c.kind === "#text") texts.push(c);
      else if (c.children && c.children.length) stack.push(...c.children);
    }
    const lined = texts.filter((t) => t.text && String(t.text).trim());
    if (!lined.length) continue;
    const minY = Math.min(...lined.map((t) => Number(t.y) || 0));
    const props = {};
    for (const k of FIRST_LINE_PROPS) if (fl[k] != null) props[k] = fl[k];
    if (!Object.keys(props).length) continue;
    for (const t of lined) {
      if (Math.abs((Number(t.y) || 0) - minY) < 1) t.style = { ...t.style || {}, ...props };
    }
  }
}
var REL_UNIT_RE = /(-?\d*\.?\d+)(cqw|cqh|cqi|cqb|cqmin|cqmax|vmin|vmax|rem|vw|vh|em)\b/gi;
var FONT_SIZE_KEYWORDS = {
  "xx-small": 9,
  "x-small": 10,
  small: 13,
  medium: 16,
  large: 18,
  "x-large": 24,
  "xx-large": 32,
  larger: 19,
  smaller: 13
};
var REL_UNIT_SKIP_PROPS = /* @__PURE__ */ new Set([
  "content",
  "font-family",
  "quotes",
  "counter-reset",
  "counter-increment",
  "list-style-type",
  "font",
  "font-variant"
]);
function relUnitToPx(num4, unit, emPx, remPx, vwPx, vhPx, cqW = 0, cqH = 0) {
  switch (unit) {
    case "em":
      return num4 * emPx;
    case "rem":
      return num4 * remPx;
    case "vw":
      return num4 * vwPx;
    case "vh":
      return num4 * vhPx;
    case "vmin":
      return num4 * Math.min(vwPx, vhPx);
    case "vmax":
      return num4 * Math.max(vwPx, vhPx);
    // B"H 2026-10-09: container query units — relative to the nearest
    // query container's dimensions (cqw/cqh = 1% of width/height,
    // cqi/cqb = inline/block, cqmin/cqmax = smaller/larger).
    case "cqw":
      return num4 * cqW / 100;
    case "cqh":
      return num4 * cqH / 100;
    case "cqi":
      return num4 * cqW / 100;
    case "cqb":
      return num4 * cqH / 100;
    case "cqmin":
      return num4 * Math.min(cqW, cqH) / 100;
    case "cqmax":
      return num4 * Math.max(cqW, cqH) / 100;
    default:
      return null;
  }
}
function rewriteRelUnits(value, emPx, remPx, vwPx, vhPx, cqW = 0, cqH = 0) {
  const parts = String(value).split(/("[^"]*"|'[^']*')/g);
  for (let i = 0; i < parts.length; i += 2) {
    const segs = parts[i].split(/(url\([^)]*\))/gi);
    for (let j = 0; j < segs.length; j += 2) {
      REL_UNIT_RE.lastIndex = 0;
      segs[j] = segs[j].replace(REL_UNIT_RE, (m, num4, unit) => {
        const px2 = relUnitToPx(Number(num4), unit.toLowerCase(), emPx, remPx, vwPx, vhPx, cqW, cqH);
        return px2 == null ? m : Math.round(px2 * 1e3) / 1e3 + "px";
      });
    }
    parts[i] = segs.join("");
  }
  return parts.join("");
}
function evaluatePxMathOnly(text) {
  let out = String(text);
  for (let guard = 0; guard < 12; guard++) {
    const m = /(calc|min|max|clamp)\(/i.exec(out);
    if (!m) return out;
    const at = m.index, plen = m[0].length;
    let depth = 0, end = -1;
    for (let i = at + plen; i < out.length; i++) {
      if (out[i] === "(") depth++;
      else if (out[i] === ")") {
        if (depth === 0) {
          end = i;
          break;
        }
        depth--;
      }
    }
    if (end < 0) return out;
    const inner = out.slice(at + plen, end);
    if (/%/.test(inner)) return null;
    const val = evaluatePxMathInner(m[1].toLowerCase(), inner);
    if (val == null) return out;
    out = out.slice(0, at) + Math.round(val * 1e3) / 1e3 + "px" + out.slice(end + 1);
  }
  return out;
}
function evaluatePxMathInner(name, inner) {
  const toks = [];
  const re = /(-?\d*\.?\d+)(px)?|([+\-*/(),])/gi;
  let m;
  while ((m = re.exec(inner)) !== null) {
    if (m[3]) toks.push(m[3]);
    else if (m[1] !== void 0 && m[1] !== "") toks.push(Number(m[1]));
  }
  if (!toks.length) return null;
  try {
    if (name === "calc") return evalPxTokens(toks);
    const args = [];
    let cur = [], depth = 0;
    for (const t of toks) {
      if (t === "(") depth++;
      if (t === ")") depth--;
      if (t === "," && depth === 0) {
        args.push(cur);
        cur = [];
        continue;
      }
      cur.push(t);
    }
    args.push(cur);
    const vals = args.map((a) => evalPxTokens(a));
    if (vals.some((v) => v == null || !isFinite(v))) return null;
    if (name === "min") return Math.min(...vals);
    if (name === "max") return Math.max(...vals);
    if (vals.length !== 3) return null;
    return Math.min(Math.max(vals[1], vals[0]), vals[2]);
  } catch {
    return null;
  }
}
function evalPxTokens(toks) {
  const out = [], ops = [];
  const prec = { "+": 1, "-": 1, "*": 2, "/": 2 };
  const apply = () => {
    const op = ops.pop(), b = out.pop(), a = out.pop();
    if (typeof a !== "number" || typeof b !== "number") throw new Error("bad");
    out.push(op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b);
  };
  for (const t of toks) {
    if (typeof t === "number") out.push(t);
    else if (t === "(") ops.push(t);
    else if (t === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") apply();
      ops.pop();
    } else if (prec[t]) {
      while (ops.length && ops[ops.length - 1] !== "(" && prec[ops[ops.length - 1]] >= prec[t]) apply();
      ops.push(t);
    } else throw new Error("bad");
  }
  while (ops.length) apply();
  return out.length === 1 ? out[0] : null;
}
function resolveFontSizePx(raw, parentPx, remPx, vwPx, vhPx) {
  let s = rewriteRelUnits(String(raw || ""), parentPx, remPx, vwPx, vhPx).trim().toLowerCase();
  if (!s) return null;
  if (/(calc|min|max|clamp)\(/.test(s)) {
    const ev = evaluatePxMathOnly(s);
    if (ev == null) return null;
    s = String(ev).trim().toLowerCase();
  }
  if (s.endsWith("%")) {
    const n3 = parseFloat(s);
    return isFinite(n3) ? parentPx * n3 / 100 : null;
  }
  if (FONT_SIZE_KEYWORDS[s] != null) return FONT_SIZE_KEYWORDS[s];
  const m = s.match(/^(-?[\d.]+)px$/);
  if (m) return Number(m[1]);
  const n2 = parseFloat(s);
  return isFinite(n2) && /^[\d.\-+e]+$/.test(s) ? n2 : null;
}
function htmlRootFontSize(rules) {
  let best = null, bestScore = null;
  const cmp = (a, b) => {
    const n2 = Math.max(a.length, b.length);
    for (let i = 0; i < n2; i++) {
      const d = (a[i] || 0) - (b[i] || 0);
      if (d) return d;
    }
    return 0;
  };
  for (const rule of rules || []) {
    if (String(rule.selector || "").trim().toLowerCase() !== "html") continue;
    for (const d of rule.declarations || []) {
      if (String(d.name || "").toLowerCase() !== "font-size") continue;
      const score = [d.important ? 1 : 0, ...rule.specificity || [0, 0, 0, 0], rule.order || 0];
      if (!best || cmp(score, bestScore) >= 0) {
        best = d.value;
        bestScore = score;
      }
    }
  }
  return best;
}
function resolveRelativeUnits(root, rules, viewport) {
  const vwPx = (viewport.width || 0) / 100, vhPx = (viewport.height || 0) / 100;
  let remPx = 16;
  const htmlFs = htmlRootFontSize(rules);
  if (htmlFs != null) {
    const r = resolveFontSizePx(htmlFs, 16, 16, vwPx, vhPx);
    if (r != null && r > 0) remPx = r;
  }
  const visit = (node, parentFontPx, cqW = 0, cqH = 0) => {
    if (!node || node.nodeType !== 1) return;
    const st = node.computedStyle || {};
    let myCqW = cqW, myCqH = cqH;
    const ctype = String(st["container-type"] || "").trim().toLowerCase();
    if (ctype && ctype !== "normal" && ctype !== "none") {
      const w = resolveContainerPx(st.width), h = resolveContainerPx(st.height);
      if (w != null) myCqW = w;
      if (h != null) myCqH = h;
    }
    let fontPx = parentFontPx;
    const fsRaw = st["font-size"];
    if (fsRaw != null && String(fsRaw).trim() !== "") {
      const r = resolveFontSizePx(fsRaw, parentFontPx, remPx, vwPx, vhPx);
      if (r != null && r > 0) fontPx = r;
    }
    let changed = false;
    const out = {};
    for (const k of Object.keys(st)) {
      const v = st[k];
      if (k === "font-size") {
        const nv = Math.round(fontPx * 1e3) / 1e3 + "px";
        out[k] = nv;
        if (nv !== v) changed = true;
        continue;
      }
      if (typeof v === "string" && !REL_UNIT_SKIP_PROPS.has(k) && !k.startsWith("--")) {
        REL_UNIT_RE.lastIndex = 0;
        if (REL_UNIT_RE.test(v)) {
          let nv = rewriteRelUnits(v, fontPx, remPx, vwPx, vhPx, myCqW, myCqH);
          if (/(calc|min|max|clamp)\(/.test(nv) && !/%/.test(nv)) {
            const ev = evaluatePxMathOnly(nv);
            if (ev != null) nv = ev;
          }
          out[k] = nv;
          if (nv !== v) changed = true;
          continue;
        }
      }
      out[k] = v;
    }
    if (changed) node.computedStyle = out;
    for (const c of node.children || []) visit(c, fontPx, myCqW, myCqH);
  };
  visit(root, 16);
}
function collectCssRules(root, environment, orderStart) {
  let order = orderStart;
  let rules = [];
  let properties = {};
  let containerRules = [];
  let cssText = "";
  walk(root, (n2) => {
    if (n2.localName === "style") {
      const text = n2.textContent || "";
      cssText += `
${text}`;
      const compiled = compileStylesheet(text, environment, order);
      rules = rules.concat(compiled.rules);
      properties = { ...properties, ...compiled.properties };
      containerRules = containerRules.concat(compiled.containerRules || []);
      order = compiled.nextOrder;
    }
  });
  return { rules, properties, containerRules, nextOrder: order, cssText };
}
function childArray(c) {
  if (!c) return [];
  if (Array.isArray(c)) return c;
  if (typeof c === "object") return Object.values(c).filter((v) => v && typeof v === "object");
  return [];
}
function renderChildren(n2) {
  const kids = (n2.children || []).filter((c) => !hidden(c) && (c.nodeType !== 3 || String(c.textContent || "").trim()));
  if (n2 && n2.nodeType === 1 && n2.localName === "select") return shownSelectOptions(n2, kids);
  return kids;
}
function shownSelectOptions(node, kids) {
  const attrs = node.attributes || {};
  if (attrs.size != null || attrs.multiple != null) return kids;
  const opts = kids.filter((c) => c && c.nodeType === 1 && c.localName === "option");
  if (!opts.length) return kids;
  const sel = opts.find((o) => o.selected || o.attributes && o.attributes.selected != null) || opts[0];
  return kids.filter((c) => c === sel || !(c.nodeType === 1 && c.localName === "option"));
}
function optionLabel(k) {
  const t = String(k && k.textContent || "").trim();
  if (t) return t;
  const c = (k && k.children || []).find((x) => x && x.nodeType === 3);
  return c ? String(c.textContent || "").trim() : "";
}
function renderOwnText(n2) {
  if (hidden(n2) || (n2.children || []).length) return "";
  const t = String(n2.textContent || "").trim();
  if (t) return t;
  if (n2.localName === "input") {
    const type = String(n2.attributes && n2.attributes.type || "text").toLowerCase();
    if (["text", "email", "password", "search", "url", "tel", "number", "submit"].includes(type)) {
      return String((n2.attributes && n2.attributes.value) ?? n2.value ?? "").trim();
    }
  }
  return "";
}
function findBody(n2) {
  const stack = [n2];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur) continue;
    if (cur.localName === "body") return cur;
    const kids = cur.children || [];
    for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i]);
  }
  return null;
}
function walk(n2, fn) {
  const stack = [n2];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur) continue;
    fn(cur);
    const kids = cur.children || [];
    for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i]);
  }
}
var STYLE_INTERN_MAP = /* @__PURE__ */ new Map();
var STYLE_NODE_CACHE = /* @__PURE__ */ new WeakMap();
var EMPTY_STYLE = Object.freeze({});
function internStyle(obj) {
  if (!obj) return EMPTY_STYLE;
  const keys = Object.keys(obj);
  if (keys.length === 0) return EMPTY_STYLE;
  let key;
  if (keys.length === 1) {
    key = keys[0] + "\0" + String(obj[keys[0]]);
  } else {
    keys.sort();
    key = keys.map((k) => k + "\0" + String(obj[k])).join("");
  }
  let hit = STYLE_INTERN_MAP.get(key);
  if (hit) return hit;
  if (STYLE_INTERN_MAP.size < 1e4) {
    STYLE_INTERN_MAP.set(key, obj);
    return obj;
  }
  return obj;
}
function styleOf(n2) {
  const cached = STYLE_NODE_CACHE.get(n2);
  if (cached) return cached;
  const inline = n2.style;
  const computed = n2.computedStyle;
  const inlineEmpty = !inline || Object.keys(inline).length === 0;
  const computedEmpty = !computed || Object.keys(computed).length === 0;
  let result;
  if (inlineEmpty && computedEmpty) result = EMPTY_STYLE;
  else if (inlineEmpty) result = internStyle(computed);
  else if (computedEmpty) result = internStyle(inline);
  else result = internStyle({ ...inline, ...computed });
  STYLE_NODE_CACHE.set(n2, result);
  return result;
}
function minimalTextNode(parentNode) {
  return { parentNode: parentNode || null };
}
var INLINE_TAGS = /* @__PURE__ */ new Set(["span", "a", "em", "strong", "b", "i", "u", "small", "code", "label", "abbr", "cite", "q", "sub", "sup", "time", "mark", "del", "ins", "kbd", "samp", "var", "bdi", "bdo", "s"]);
var INLINE_BLOCK_TAGS = /* @__PURE__ */ new Set(["img", "input", "button", "select", "textarea", "canvas", "video", "iframe", "svg", "audio", "progress", "meter"]);
var TABLE_DISPLAY_DEFAULTS = {
  table: "table",
  caption: "table-caption",
  colgroup: "table-column-group",
  col: "table-column",
  thead: "table-row-group",
  tbody: "table-row-group",
  tfoot: "table-row-group",
  tr: "table-row",
  td: "table-cell",
  th: "table-cell"
};
function defaultDisplay(tag) {
  if (INLINE_TAGS.has(tag)) return "inline";
  if (INLINE_BLOCK_TAGS.has(tag)) return "inline-block";
  if (TABLE_DISPLAY_DEFAULTS[tag]) return TABLE_DISPLAY_DEFAULTS[tag];
  return "block";
}
function displayOf(style, node) {
  const d = String(style.display || "").trim().toLowerCase();
  if (d) return d;
  return defaultDisplay(node && node.localName ? node.localName : "");
}
function isInlineLevel(node) {
  if (node.nodeType === 3) return true;
  const d = displayOf(styleOf(node), node);
  return d === "inline" || d === "inline-block";
}
function hidden(n2) {
  return ["br", "script", "style", "template", "head", "title", "meta", "link"].includes(n2.localName) || n2.hidden || String(n2.style?.display || n2.computedStyle?.display || "").toLowerCase() === "none";
}
var DIM_CACHE = /* @__PURE__ */ new Map();
function dim(v, parent) {
  const t = String(v || "").trim();
  if (!t || t === "auto") return 0;
  if (/^(min|max|clamp)\(/i.test(t)) {
    const r = evaluateMathFn(t, parent);
    if (r != null) return r;
  }
  if (t.endsWith("%")) return parent * Number(t.slice(0, -1)) / 100;
  let c = DIM_CACHE.get(t);
  if (c === void 0) {
    const m = t.match(/-?\d+(?:\.\d+)?/);
    c = m ? Number(m[0]) : 0;
    if (DIM_CACHE.size < 4096) DIM_CACHE.set(t, c);
  }
  return c;
}
function evaluateMathFn(text, parent) {
  const re = /(?<![\w-])(min|max|clamp)\(/gi;
  let out = String(text);
  for (let guard = 0; guard < 10; guard++) {
    re.lastIndex = 0;
    let best = null;
    let m;
    while ((m = re.exec(out)) !== null) {
      const at = m.index + m[0].length - m[1].length - 1;
      const end = mathFnEnd(out, at, m[1].length + 1);
      if (end >= 0) best = { at, name: m[1], end };
    }
    if (!best) return guard === 0 ? null : toFiniteNumber(out);
    const inner = out.slice(best.at + best.name.length + 1, best.end);
    const args = splitTopLevelCommas(inner).map((a) => dim(a, parent));
    if (!args.length || args.some((x) => typeof x !== "number" || !isFinite(x))) return null;
    const fn = best.name.toLowerCase();
    let result;
    if (fn === "min") result = Math.min(...args);
    else if (fn === "max") result = Math.max(...args);
    else {
      if (args.length !== 3) return null;
      result = Math.min(Math.max(args[1], args[0]), args[2]);
    }
    out = out.slice(0, best.at) + result + out.slice(best.end + 1);
  }
  return null;
}
function toFiniteNumber(s) {
  const n2 = Number(String(s).trim());
  return isFinite(n2) ? n2 : null;
}
function mathFnEnd(text, at, plen) {
  let depth = 0;
  for (let i = at + plen; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") {
      if (depth === 0) return i;
      depth--;
    }
  }
  return -1;
}
function splitTopLevelCommas(text) {
  const parts = [];
  let depth = 0;
  let cur = "";
  for (const ch of String(text)) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts;
}
function horizChrome(style, refW = 0) {
  const pad = box(style || {}, "padding", refW), b = borderBox(style || {}, refW);
  return pad.left + pad.right + b.left + b.right;
}
var BOX_PARSED = /* @__PURE__ */ new WeakMap();
function parseSideValue(v) {
  const t = String(v || "").trim();
  if (!t) return null;
  if (t.endsWith("%")) return { n: Number(t.slice(0, -1)) || 0, pct: true, raw: null };
  if (/^(min|max|clamp)\(/i.test(t)) return { n: 0, pct: false, raw: t };
  return { n: dim(t, 0), pct: false, raw: null };
}
function parsedBox(s, p) {
  let m = s && typeof s === "object" ? BOX_PARSED.get(s) : void 0;
  if (m) {
    const hit = m.get(p);
    if (hit) return hit;
  }
  const sides = ["top", "right", "bottom", "left"];
  const vals = { top: null, right: null, bottom: null, left: null };
  const base = String(s[p] || "").trim();
  if (base) {
    const parts = base.split(/\s+/);
    const ps = parts.length === 1 ? [parts[0], parts[0], parts[0], parts[0]] : parts.length === 2 ? [parts[0], parts[1], parts[0], parts[1]] : parts.length === 3 ? [parts[0], parts[1], parts[2], parts[1]] : [parts[0], parts[1], parts[2], parts[3]];
    sides.forEach((sd, i) => {
      vals[sd] = parseSideValue(ps[i]);
    });
  }
  for (const sd of sides) {
    const v = s[`${p}-${sd}`];
    if (v !== void 0 && String(v).trim() !== "") vals[sd] = parseSideValue(v);
  }
  applyLogicalParsed(s, vals, p);
  if (s && typeof s === "object") {
    if (!m) {
      m = /* @__PURE__ */ new Map();
      BOX_PARSED.set(s, m);
    }
    if (m.size < 16) m.set(p, vals);
  }
  return vals;
}
function applyLogicalParsed(s, vals, p) {
  const rtl = String((s || {}).direction || "").trim().toLowerCase() === "rtl";
  const physOf = (log) => log === "inline-start" ? rtl ? "right" : "left" : log === "inline-end" ? rtl ? "left" : "right" : log === "block-start" ? "top" : log === "block-end" ? "bottom" : "";
  const set = (log, v) => {
    const t = String(v ?? "").trim();
    if (!t) return;
    const phys = physOf(log);
    if (!phys) return;
    const physKey = `${p}-${phys}`;
    if (s[physKey] !== void 0 && String(s[physKey]).trim() !== "") return;
    vals[phys] = parseSideValue(t);
  };
  const inlineParts = String(s[`${p}-inline`] || "").trim().split(/\s+/).filter(Boolean);
  if (inlineParts.length) {
    set("inline-start", inlineParts[0]);
    set("inline-end", inlineParts[1] || inlineParts[0]);
  }
  const blockParts = String(s[`${p}-block`] || "").trim().split(/\s+/).filter(Boolean);
  if (blockParts.length) {
    set("block-start", blockParts[0]);
    set("block-end", blockParts[1] || blockParts[0]);
  }
  for (const log of ["inline-start", "inline-end", "block-start", "block-end"]) set(log, s[`${p}-${log}`]);
}
function resolveBox(parsed, refW) {
  const r = (e) => !e ? 0 : e.pct ? e.n * refW / 100 : e.raw ? dim(e.raw, refW) : e.n;
  return { top: r(parsed.top), right: r(parsed.right), bottom: r(parsed.bottom), left: r(parsed.left) };
}
function box(s, p, refW = 0) {
  return resolveBox(parsedBox(s, p), refW);
}
var BORDER_PARSED = /* @__PURE__ */ new WeakMap();
function parsedBorder(style) {
  let hit = style && typeof style === "object" ? BORDER_PARSED.get(style) : void 0;
  if (hit) return hit;
  const first = (v) => String(v || "").trim().split(/\s+/)[0] || "";
  hit = {
    short: first(style.border),
    top: first(style["border-top"]),
    right: first(style["border-right"]),
    bottom: first(style["border-bottom"]),
    left: first(style["border-left"]),
    inlineStart: first(style["border-inline-start"]),
    inlineEnd: first(style["border-inline-end"])
  };
  if (style && typeof style === "object") BORDER_PARSED.set(style, hit);
  return hit;
}
function borderBox(style, refW = 0) {
  const w = box(style, "border-width", refW);
  const bp = parsedBorder(style);
  const fromShort = dim(bp.short, refW);
  const sides = ["top", "right", "bottom", "left"];
  for (let i = 0; i < 4; i++) {
    const sd = sides[i];
    if (!w[sd] && fromShort) w[sd] = fromShort;
    if (!style[`border-${sd}-width`]) {
      const v = dim(bp[sd], refW);
      if (v) w[sd] = v;
    }
  }
  const rtl = String((style || {}).direction || "").trim().toLowerCase() === "rtl";
  const li = [[bp.inlineStart, rtl ? "right" : "left"], [bp.inlineEnd, rtl ? "left" : "right"]];
  for (const [raw, phys] of li) {
    if (phys && !w[phys]) {
      const v = dim(raw, refW);
      if (v) w[phys] = v;
    }
  }
  return w;
}
function textHeight(text, s, width) {
  const size = dim(s["font-size"], 0) || 14;
  return Math.max(size + 4, Math.ceil(String(text || "").length / Math.max(1, Math.floor(width / Math.max(6, size * 0.55)))) * (size + 5));
}
function defaultHeight(n2, s) {
  if (["h1", "h2", "h3"].includes(n2.localName)) return 36;
  if (n2.localName === "p") return 28;
  if (["button", "input", "select", "textarea"].includes(n2.localName)) return dim(s.height, 0) || 38;
  if (n2.localName === "canvas") return measuredHeight(n2, s, 0) || 150;
  return 22;
}
function px(v) {
  const m = String(v || "").match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : 0;
}
function parseAspectRatio(style) {
  const t = String(style["aspect-ratio"] || "").trim().toLowerCase();
  if (!t || t === "auto" || t === "none") return 0;
  const parts = t.split("/").map((x) => x.trim());
  const a = Number(parts[0]);
  const b = parts.length > 1 ? Number(parts[1]) : 1;
  return a > 0 && b > 0 && Number.isFinite(a) && Number.isFinite(b) ? a / b : 0;
}
function sum(list, from, to) {
  let n2 = 0;
  for (let i = from; i < to; i++) n2 += Number(list[i] || 0);
  return n2;
}
function isTableCellNode(n2) {
  if (!n2 || n2.nodeType !== 1) return false;
  const tag = n2.localName || "";
  if (tag === "td" || tag === "th") return true;
  return displayOf(styleOf(n2), n2) === "table-cell";
}
function parseBorderSpacing(v) {
  const parts = String(v || "").trim().split(/\s+/).filter(Boolean);
  const x = parts.length ? px(parts[0]) : 0;
  return { x, y: parts.length > 1 ? px(parts[1]) : x };
}
function cellSpan(node, attr) {
  const raw = node.attributes ? node.attributes[attr] : null;
  const n2 = parseInt(raw, 10);
  return Number.isFinite(n2) && n2 > 0 ? Math.min(n2, 100) : 1;
}
var BORDER_ALL_CACHE = /* @__PURE__ */ new WeakMap();
function borderAllSides(style) {
  let hit = style && typeof style === "object" ? BORDER_ALL_CACHE.get(style) : void 0;
  if (hit) return hit;
  const widths = borderBox(style, 0);
  const out = {};
  for (const side of ["top", "right", "bottom", "left"]) {
    out[side] = borderOneSide(style, side, widths[side] || 0);
  }
  if (style && typeof style === "object") BORDER_ALL_CACHE.set(style, out);
  return out;
}
function borderOneSide(style, side, w) {
  let color = style[`border-color-${side}`] || style[`border-${side}-color`] || style["border-color"] || "";
  if (!color) {
    const src = String(style[`border-${side}`] || style.border || "");
    const hex = src.match(/#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)/gi);
    if (hex && hex.length) color = hex[hex.length - 1];
    else {
      const words = (src.toLowerCase().match(/\b[a-z]+\b/g) || []).filter(
        (s) => !/^(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|thin|medium|thick)$/.test(s)
      );
      if (words.length) color = words[words.length - 1];
    }
  }
  const st = String(style[`border-style-${side}`] || style[`border-${side}-style`] || style["border-style"] || style.border || "").toLowerCase();
  if (/(^|\s)(none|hidden)(\s|$)/.test(` ${st} `)) return { w: 0, color: color || "#000000" };
  return { w, color: color || "#000000" };
}
function borderSideInfo(style, side) {
  return borderAllSides(style)[side] || { w: 0, color: "#000000" };
}
function normalizeBorderKeys(style) {
  const pairs2 = [["border-width", "border-width-"], ["border-color", "border-color-"], ["border-style", "border-style-"]];
  for (const [short, prefix] of pairs2) {
    if (style[short] == null || String(style[short]).trim() === "") {
      for (const s of ["top", "right", "bottom", "left"]) {
        const v = style[prefix + s];
        if (v != null && String(v).trim() !== "") {
          style[short] = v;
          break;
        }
      }
    }
  }
}
function layoutTable(children, parent, ctx, out) {
  const pStyle = parent.style || {};
  const collapse = String(pStyle["border-collapse"] || "separate").trim().toLowerCase() === "collapse";
  const sp = parseBorderSpacing(pStyle["border-spacing"]);
  const gapX = collapse ? 0 : sp.x, gapY = collapse ? 0 : sp.y;
  const W = Math.max(1, ctx.width);
  const depth = (ctx.depth || 0) + 1;
  parent.__tableRoot = true;
  const capTop = [], capBottom = [], colEls = [], rowLists = [];
  const pushRows = (nodes) => {
    let anon = null;
    for (const n2 of nodes) {
      if (!n2 || hidden(n2)) continue;
      const tag = n2.localName || "";
      const d = n2.nodeType === 1 ? displayOf(styleOf(n2), n2) : "";
      if (d === "table-caption" || tag === "caption") {
        const side = String(styleOf(n2)["caption-side"] || "top").trim().toLowerCase();
        (side === "bottom" ? capBottom : capTop).push(n2);
        continue;
      }
      if (d === "table-column-group" || tag === "colgroup") {
        for (const c of n2.children || []) {
          if ((c.localName || "") === "col" || c.nodeType === 1 && displayOf(styleOf(c), c) === "table-column") colEls.push(c);
        }
        continue;
      }
      if (d === "table-column" || tag === "col") {
        colEls.push(n2);
        continue;
      }
      if (d === "table-row-group" || tag === "thead" || tag === "tbody" || tag === "tfoot") {
        pushRows(n2.children || []);
        continue;
      }
      if (d === "table-row" || tag === "tr") {
        rowLists.push({ node: n2, cells: (n2.children || []).filter(isTableCellNode) });
        continue;
      }
      if (isTableCellNode(n2)) {
        if (!anon) {
          anon = { node: null, cells: [] };
          rowLists.push(anon);
        }
        anon.cells.push(n2);
      }
    }
  };
  pushRows(children);
  let y = ctx.y;
  for (const c of capTop) {
    const got = layoutBlockBox(c, { x: ctx.x, y, width: W, viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
    if (got) {
      parent.children.push(got);
      y += got.height;
    }
  }
  const gridTop = y;
  const occupied = [], grid2 = [];
  rowLists.forEach((row, r) => {
    occupied[r] = occupied[r] || [];
    grid2[r] = grid2[r] || [];
    let c = 0;
    for (const cellNode of row.cells) {
      while (occupied[r][c]) c++;
      const cs = cellSpan(cellNode, "colspan"), rs = cellSpan(cellNode, "rowspan");
      for (let dr = 0; dr < rs; dr++) {
        occupied[r + dr] = occupied[r + dr] || [];
        for (let dc = 0; dc < cs; dc++) occupied[r + dr][c + dc] = true;
      }
      grid2[r][c] = { node: cellNode, c, r, cs, rs };
      c += cs;
    }
  });
  const nRows = occupied.length;
  let nCols = 0;
  for (let r = 0; r < nRows; r++) nCols = Math.max(nCols, (occupied[r] || []).length);
  if (!nRows || !nCols) {
    for (const c of capBottom) {
      const got = layoutBlockBox(c, { x: ctx.x, y, width: W, viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
      if (got) {
        parent.children.push(got);
        y += got.height;
      }
    }
    return y - ctx.y;
  }
  const explicit = new Array(nCols).fill(0);
  colEls.forEach((colEl, i) => {
    if (i < nCols) {
      const w = dim(styleOf(colEl).width, W);
      if (w > 0) explicit[i] = w;
    }
  });
  if (grid2[0]) for (let c = 0; c < nCols; c++) {
    const cell = grid2[0][c];
    if (cell && !explicit[c]) {
      const w = dim(styleOf(cell.node).width, W);
      if (w > 0) explicit[c] = Math.min(w, W) / (cell.cs || 1);
    }
  }
  const colW = new Array(nCols).fill(0);
  const totalExplicit = explicit.reduce((a, b) => a + b, 0);
  const nAuto = explicit.filter((w) => w <= 0).length;
  const autoW = nAuto > 0 ? Math.max(8, (W - totalExplicit - gapX * (nCols - 1)) / nAuto) : 0;
  for (let c = 0; c < nCols; c++) colW[c] = explicit[c] > 0 ? explicit[c] : autoW;
  const colX = [];
  let acc = ctx.x;
  for (let c = 0; c < nCols; c++) {
    colX[c] = acc;
    acc += colW[c] + gapX;
  }
  const tableContentW = Math.max(1, acc - gapX - ctx.x);
  const measureOut = [];
  const cellInfos = [];
  for (let r = 0; r < nRows; r++) {
    for (let c = 0; c < nCols; c++) {
      const cell = grid2[r] && grid2[r][c];
      if (!cell) continue;
      let cw = 0;
      for (let dc = 0; dc < cell.cs; dc++) cw += colW[c + dc] || 0;
      cw += gapX * (cell.cs - 1);
      const got = layoutBlockBox(cell.node, { x: colX[c], y: 0, width: Math.max(1, cw), viewportHeight: ctx.viewportHeight, depth: depth + 1, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, measureOut);
      if (got) {
        got.__suppressBorder = collapse;
        cellInfos.push({ item: got, r, c, cs: cell.cs, rs: cell.rs, node: cell.node, start: measureOut.indexOf(got) });
      }
    }
  }
  const byCell = /* @__PURE__ */ new Map();
  const ordered = [...cellInfos].sort((a, b) => a.start - b.start);
  ordered.forEach((ci, i) => {
    const end = i + 1 < ordered.length ? ordered[i + 1].start : measureOut.length;
    byCell.set(ci, measureOut.slice(ci.start, end));
  });
  if (!collapse) {
    normalizeBorderKeys(pStyle);
    for (const ci of cellInfos) normalizeBorderKeys(ci.item.style);
  }
  const rowH = new Array(nRows).fill(0);
  for (const ci of cellInfos) if (ci.rs === 1) rowH[ci.r] = Math.max(rowH[ci.r], ci.item.height);
  for (const ci of cellInfos) {
    if (ci.rs <= 1) continue;
    let spanH = 0;
    for (let dr = 0; dr < ci.rs; dr++) spanH += rowH[ci.r + dr] || 0;
    spanH += gapY * (ci.rs - 1);
    const need = ci.item.height - spanH;
    if (need > 0) rowH[ci.r + ci.rs - 1] = (rowH[ci.r + ci.rs - 1] || 0) + need;
  }
  const rowY = [];
  let ry = gridTop;
  for (let r = 0; r < nRows; r++) {
    rowY[r] = ry;
    ry += rowH[r] + gapY;
  }
  const gridBottom = nRows ? ry - gapY : gridTop;
  const rowItems = [];
  for (let r = 0; r < nRows; r++) {
    const rowNode = rowLists[r] ? rowLists[r].node : null;
    const rItem = {
      node: rowNode,
      x: ctx.x,
      y: rowY[r],
      width: tableContentW,
      height: rowH[r],
      style: rowNode ? styleOf(rowNode) : {},
      children: [],
      kind: "tr"
    };
    out.push(rItem);
    parent.children.push(rItem);
    rowItems.push(rItem);
    const inRow = cellInfos.filter((ci) => ci.r === r).sort((a, b) => a.c - b.c);
    for (const ci of inRow) {
      let ch = 0;
      for (let dr = 0; dr < ci.rs; dr++) ch += rowH[ci.r + dr] || 0;
      ch += gapY * (ci.rs - 1);
      shiftSubtree(ci.item, rowY[r] - ci.item.y);
      const va = String((ci.item.style || {})["vertical-align"] || "top").trim().toLowerCase();
      const extra = Math.max(0, ch - ci.item.height);
      if (extra > 0) {
        const off = va === "middle" ? extra / 2 : va === "bottom" ? extra : 0;
        if (off > 0) for (const k of ci.item.children || []) shiftSubtree(k, off);
      }
      ci.item.height = Math.max(ci.item.height, ch);
      const group = byCell.get(ci) || [];
      for (const it of group) out.push(it);
      rItem.children.push(ci.item);
    }
  }
  if (collapse) {
    parent.__suppressBorder = true;
    const pickWin = (a, b) => !a || b && b.w > a.w ? b : a;
    const winBorders = (list) => list.reduce((a, b) => pickWin(a, b), null) || { w: 0, color: "#000000" };
    const edgeCells = (edge, side) => {
      const out2 = [];
      for (let r = 0; r < nRows; r++) for (let c = 0; c < nCols; c++) {
        const cell = grid2[r] && grid2[r][c];
        if (!cell) continue;
        const onEdge = edge === 0 ? cell.r === 0 : edge === 1 ? cell.c + cell.cs === nCols : edge === 2 ? cell.r + cell.rs === nRows : cell.c === 0;
        if (onEdge) out2.push(borderSideInfo(styleOf(cell.node), side));
      }
      return out2;
    };
    const vSegs = [];
    for (let b = 1; b < nCols; b++) {
      let cur = null;
      const flush = () => {
        if (cur) {
          vSegs.push(cur);
          cur = null;
        }
      };
      for (let r = 0; r < nRows; r++) {
        let spec = null, interior = false;
        const left = grid2[r] && grid2[r][b - 1], right = grid2[r] && grid2[r][b];
        if (left) {
          if (left.c + left.cs === b) spec = pickWin(spec, borderSideInfo(styleOf(left.node), "right"));
          else if (left.c + left.cs > b) interior = true;
        }
        if (right && right.c === b) spec = pickWin(spec, borderSideInfo(styleOf(right.node), "left"));
        if (!interior && spec && spec.w > 0) {
          const y0 = rowY[r], y1 = rowY[r] + (rowH[r] || 0);
          if (cur && cur.w === spec.w && cur.color === spec.color && Math.abs(cur.y1 - y0) < 0.51) cur.y1 = y1;
          else {
            flush();
            cur = { x: colX[b], y0, y1, w: spec.w, color: spec.color };
          }
        } else flush();
      }
      flush();
    }
    const hSegs = [];
    for (let b = 1; b < nRows; b++) {
      let cur = null;
      const flush = () => {
        if (cur) {
          hSegs.push(cur);
          cur = null;
        }
      };
      for (let c = 0; c < nCols; c++) {
        let spec = null, interior = false;
        const above = grid2[b - 1] && grid2[b - 1][c], below = grid2[b] && grid2[b][c];
        if (above) {
          if (above.r + above.rs === b) spec = pickWin(spec, borderSideInfo(styleOf(above.node), "bottom"));
          else if (above.r + above.rs > b) interior = true;
        }
        if (below && below.r === b) spec = pickWin(spec, borderSideInfo(styleOf(below.node), "top"));
        if (!interior && spec && spec.w > 0) {
          const x0 = colX[c], x1 = colX[c] + (colW[c] || 0);
          if (cur && cur.w === spec.w && cur.color === spec.color && Math.abs(cur.x1 - x0) < 0.51) cur.x1 = x1;
          else {
            flush();
            cur = { y: rowY[b], x0, x1, w: spec.w, color: spec.color };
          }
        } else flush();
      }
      flush();
    }
    parent.__tableGrid = {
      x0: ctx.x,
      y0: gridTop,
      x1: ctx.x + tableContentW,
      y1: gridBottom,
      outer: {
        // B"H 2026-10-09: outer edges resolve conflicts between the table's
        // own border and the edge cells' borders (wider wins).
        top: winBorders([
          borderSideInfo(pStyle, "top"),
          ...edgeCells(0, "top")
        ]),
        right: winBorders([
          borderSideInfo(pStyle, "right"),
          ...edgeCells(1, "right")
        ]),
        bottom: winBorders([
          borderSideInfo(pStyle, "bottom"),
          ...edgeCells(2, "bottom")
        ]),
        left: winBorders([
          borderSideInfo(pStyle, "left"),
          ...edgeCells(3, "left")
        ])
      },
      vSegs,
      hSegs
    };
    const tgx = parent.x, tgy = parent.y, tg = parent.__tableGrid;
    tg.x0 -= tgx;
    tg.x1 -= tgx;
    tg.y0 -= tgy;
    tg.y1 -= tgy;
    for (const s of tg.vSegs) {
      s.x -= tgx;
      s.y0 -= tgy;
      s.y1 -= tgy;
    }
    for (const s of tg.hSegs) {
      s.y -= tgy;
      s.x0 -= tgx;
      s.x1 -= tgx;
    }
  }
  y = gridBottom;
  for (const c of capBottom) {
    const got = layoutBlockBox(c, { x: ctx.x, y, width: W, viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
    if (got) {
      parent.children.push(got);
      y += got.height;
    }
  }
  return y - ctx.y;
}
function multiColumnSpec(style, availW) {
  const gap = px(style["column-gap"] || style.gap) || (dim(style["font-size"], 0) || 14);
  let n2 = 0;
  const count = parseInt(style["column-count"], 10);
  if (Number.isFinite(count) && count > 1) n2 = count;
  else {
    const w = dim(style["column-width"], availW);
    if (w > 0) n2 = Math.max(1, Math.floor((availW + gap) / (w + gap)));
  }
  if (n2 <= 1) return null;
  const colW = (availW - gap * (n2 - 1)) / n2;
  if (colW < 8) return null;
  return { n: n2, gap, colW };
}
function parseColumnRule(style) {
  const raw = String(style["column-rule"] || "").trim();
  const wRaw = String(style["column-rule-width"] || "").trim();
  const styleRaw = String(style["column-rule-style"] || "").trim().toLowerCase();
  const colorRaw = String(style["column-rule-color"] || "").trim();
  let w = wRaw ? px(wRaw) : 0, color = colorRaw || "#000000", st = styleRaw || "none";
  if (raw) {
    for (const tok of raw.split(/\s+/)) {
      const low = tok.toLowerCase();
      if (/^(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)$/.test(low)) st = low;
      else if (/^-?\d/.test(tok)) w = px(tok);
      else color = tok;
    }
  }
  if (st === "none" || st === "hidden" || w <= 0) return null;
  return { w, color };
}
function layoutMultiColumn(children, parent, ctx, out, spec) {
  const pStyle = parent.style || {};
  const W = Math.max(1, ctx.width);
  const depth = (ctx.depth || 0) + 1;
  parent.__multicolRoot = true;
  const segments = [];
  let run = [];
  for (const child of children) {
    if (!child || hidden(child)) continue;
    const st = child.nodeType === 1 ? styleOf(child) : null;
    const d = st ? displayOf(st, child) : "inline";
    const isSpan = st && d !== "inline" && String(st["column-span"] || "").trim().toLowerCase() === "all";
    if (isSpan) {
      if (run.length) {
        segments.push({ type: "run", kids: run });
        run = [];
      }
      segments.push({ type: "span", node: child });
    } else run.push(child);
  }
  if (run.length) segments.push({ type: "run", kids: run });
  const fill = String(pStyle["column-fill"] || "balance").trim().toLowerCase();
  const fixedH = dim(pStyle.height, ctx.height || ctx.viewportHeight || 0);
  const contentH = fixedH > 0 ? Math.max(0, ctx.height || 0) : 0;
  const rule = parseColumnRule(pStyle);
  const rules = [];
  let y = ctx.y;
  for (const seg of segments) {
    if (seg.type === "span") {
      const got = layoutBlockBox(seg.node, { x: ctx.x, y, width: W, viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
      if (got) {
        parent.children.push(got);
        y += got.height;
      }
      continue;
    }
    y += fragmentRun(seg.kids, parent, ctx, out, spec, { y, fill, contentH, depth, rule, rules });
  }
  if (rules.length) {
    for (const r of rules) {
      r.x -= parent.x;
      r.y0 -= parent.y;
      r.y1 -= parent.y;
    }
    parent.__columnRules = rules;
  }
  return y - ctx.y;
}
function fragmentRun(kids, parent, ctx, out, spec, opts) {
  const { n: n2, gap, colW } = spec;
  const tempOut = [];
  const fakeParent = { style: parent.style, children: [] };
  const flow = layoutBlockFlow(kids, fakeParent, {
    x: ctx.x,
    y: 0,
    width: Math.max(1, colW),
    viewportHeight: ctx.viewportHeight,
    depth: opts.depth,
    noCollapse: true,
    vpW: ctx.vpW,
    vpH: ctx.vpH,
    cb: ctx.cb
  }, tempOut);
  const stripH = flow.height;
  const leaves = [];
  const walk2 = (item) => {
    if (!item) return;
    if (item.__multicolRoot || item.__tableRoot) {
      leaves.push(item);
      return;
    }
    const ck = item.children || [];
    if (!ck.length) {
      leaves.push(item);
      return;
    }
    for (const k of ck) walk2(k);
  };
  for (const t of fakeParent.children) walk2(t);
  if (!leaves.length) return 0;
  leaves.sort((a, b) => a.y - b.y || a.x - b.x);
  const lines = [];
  for (const leaf of leaves) {
    const top = leaf.y, bottom = leaf.y + (leaf.height || 0);
    const last = lines[lines.length - 1];
    if (last && top < last.bottom - 1) {
      last.leaves.push(leaf);
      if (bottom > last.bottom) last.bottom = bottom;
    } else lines.push({ top, bottom, leaves: [leaf] });
  }
  const autoFill = opts.fill === "auto" && opts.contentH > 0;
  const target = autoFill ? opts.contentH : stripH / n2;
  const cols = [{ firstTop: Infinity, maxBottom: -Infinity, leaves: [], hasContent: false }];
  let c = 0, acc = 0;
  lines.forEach((ln) => {
    const adv = Math.max(0, ln.bottom - ln.top);
    const full = autoFill ? acc >= target : acc > 0 && acc + adv > target;
    if (c < n2 - 1 && full) {
      c++;
      acc = 0;
      cols.push({ firstTop: Infinity, maxBottom: -Infinity, leaves: [], hasContent: false });
    }
    const col = cols[c];
    if (ln.top < col.firstTop) col.firstTop = ln.top;
    if (ln.bottom > col.maxBottom) col.maxBottom = ln.bottom;
    for (const leaf of ln.leaves) {
      leaf.__col = c;
      col.leaves.push(leaf);
    }
    col.hasContent = true;
    acc += adv;
  });
  let maxColH = 0;
  cols.forEach((col, ci) => {
    if (!col.leaves.length) return;
    const dx = ci * (colW + gap);
    const dy = opts.y - col.firstTop;
    for (const leaf of col.leaves) {
      shiftSubtreeX(leaf, dx);
      shiftSubtree(leaf, dy);
    }
    const colH = col.maxBottom - col.firstTop;
    if (colH > maxColH) maxColH = colH;
  });
  if (opts.rule) {
    for (let i = 0; i < cols.length - 1; i++) {
      if (!cols[i].hasContent || !cols[i + 1].hasContent) continue;
      opts.rules.push({
        x: ctx.x + i * (colW + gap) + colW + (gap - opts.rule.w) / 2,
        y0: opts.y,
        y1: opts.y + maxColH,
        w: opts.rule.w,
        color: opts.rule.color
      });
    }
  }
  const fixUp = (item) => {
    const ck = item.children || [];
    if (!ck.length || item.__multicolRoot || item.__tableRoot) return;
    let minX = Infinity, minY = Infinity, maxR = -Infinity, maxB = -Infinity;
    const colSet = /* @__PURE__ */ new Set();
    for (const k of ck) {
      fixUp(k);
      if (k.__col !== void 0) colSet.add(k.__col);
      if (k.x < minX) minX = k.x;
      if (k.y < minY) minY = k.y;
      if (k.x + (k.width || 0) > maxR) maxR = k.x + (k.width || 0);
      if (k.y + (k.height || 0) > maxB) maxB = k.y + (k.height || 0);
    }
    if (minX === Infinity) return;
    const singleCol = colSet.size === 1 ? [...colSet][0] : -1;
    const d = item.node && item.node.nodeType === 1 ? displayOf(item.style || {}, item.node) : "block";
    if (singleCol >= 0 && d !== "inline") {
      item.x = ctx.x + singleCol * (colW + gap);
      item.width = Math.max(1, colW);
    } else {
      item.x = minX;
      item.width = Math.max(1, maxR - minX);
    }
    item.y = minY;
    item.height = Math.max(0, maxB - minY);
    item.__col = singleCol >= 0 ? singleCol : void 0;
    if (colSet.size > 1) item.__fragSplit = true;
  };
  for (const t of fakeParent.children) fixUp(t);
  for (const it of tempOut) out.push(it);
  for (const t of fakeParent.children) parent.children.push(t);
  return maxColH;
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/dom-painter/geometry.js
function innerRect(item) {
  return { x: item.x + 2, y: item.y + 2, width: Math.max(1, item.width - 4), height: Math.max(1, item.height - 4) };
}
function near(a, b) {
  return !b || Math.abs(Number(a || 0) - Number(b || 0)) <= 2;
}
function canvasHint(node = {}) {
  return String([node.id, node.name, node.className, node.attributes?.id, node.attributes?.name, node.attributes?.class].filter(Boolean).join(" ")).toLowerCase();
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/dom-painter/canvasPicker.js
function pickCanvasTexture(item, textures, used) {
  if (item.kind !== "canvas") return null;
  const unused = textures.filter((texture) => !used.has(texture.id));
  const hint = canvasHint(item.node);
  const w = Number(item.node?.attributes?.width || item.node?.width || 0);
  const h = Number(item.node?.attributes?.height || item.node?.height || 0);
  const kind = hint.includes("gl") || hint.includes("webgl") ? "canvas-webgl" : "canvas-2d";
  const chosen = unused.find((t) => t.kind === kind && near(t.width, w) && near(t.height, h)) || unused.find((t) => t.kind === kind) || unused.find((t) => near(t.width, w) && near(t.height, h)) || unused[0];
  if (chosen) used.add(chosen.id);
  return chosen || null;
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/canvas-painter/webglWitness.js
function paintWebgl(fb, texture, box2) {
  const px2 = texture.glPixels;
  if (px2 && px2.data && px2.width > 0 && px2.height > 0) {
    blitPixels(fb, px2, box2);
    return;
  }
  const commands = texture.commands || [];
  fb.fillRect(box2.x, box2.y, box2.w, box2.h, clearColor(commands));
  grid(fb, box2);
  badge(fb, box2.x + 8, box2.y + 8, "GPU", [35, 55, 105, 245], 52);
  badge(fb, box2.x + box2.w - 72, box2.y + 8, "DRAW", [150, 70, 210, 255], 64);
  fb.drawText("WEBGL CUBE", box2.x + 68, box2.y + 10, [255, 255, 255, 255], 1, Math.max(74, box2.w - 150));
  cube(fb, { x: box2.x + 22, y: box2.y + 40, w: box2.w - 44, h: Math.max(74, box2.h - 96) }, hasTexture(commands));
  swatches(fb, box2);
}
function blitPixels(fb, px2, box2) {
  const sw = px2.width, sh = px2.height, data = px2.data;
  for (let y = 0; y < box2.h; y++) {
    const sy = Math.min(sh - 1, y * sh / Math.max(1, box2.h) | 0);
    for (let x = 0; x < box2.w; x++) {
      const sx = Math.min(sw - 1, x * sw / Math.max(1, box2.w) | 0);
      const i = (sy * sw + sx) * 4;
      fb.setPixel(box2.x + x, box2.y + y, [data[i], data[i + 1], data[i + 2], data[i + 3]]);
    }
  }
}
function clearColor(commands) {
  let c = [35, 20, 120, 255];
  for (const cmd of commands) if (cmd.op === "webgl.clearColor" && Array.isArray(cmd.value)) c = cmd.value.slice(0, 3).map((v) => Math.round(Number(v) * 255)).concat(255);
  return c;
}
function hasTexture(commands) {
  return commands.some((c) => /texImage|bindTexture|activeTexture|texParameteri|generateMipmap/i.test(c.op || ""));
}
function grid(fb, box2) {
  for (let x = box2.x + 18; x < box2.x + box2.w; x += 32) fb.drawLine(x, box2.y, x, box2.y + box2.h, [80, 190, 255, 125], 1);
  for (let y = box2.y + 18; y < box2.y + box2.h; y += 32) fb.drawLine(box2.x, y, box2.x + box2.w, y, [80, 190, 255, 125], 1);
}
function badge(fb, x, y, label, fill, width) {
  fb.fillRect(x, y, width, 22, fill);
  fb.strokeRect(x, y, width, 22, [126, 220, 255, 255], 1);
  fb.drawText(String(label), x + 5, y + 6, [255, 255, 255, 255], 1, width - 8);
}
function cube(fb, box2, textured) {
  const size = Math.max(44, Math.min(box2.w * 0.46, box2.h * 0.72));
  const d = Math.max(22, size * 0.42);
  const cx = box2.x + box2.w * 0.45;
  const cy = box2.y + box2.h * 0.58;
  const f = [[cx - size / 2, cy - size / 2], [cx + size / 2, cy - size / 2], [cx + size / 2, cy + size / 2], [cx - size / 2, cy + size / 2]];
  const b = f.map(([x, y]) => [x + d, y - d]);
  fillPoly(fb, f, textured ? [255, 0, 180, 230] : [88, 24, 170, 220]);
  fillPoly(fb, [f[1], b[1], b[2], f[2]], [0, 230, 255, 210]);
  fillPoly(fb, [f[0], f[1], b[1], b[0]], [255, 235, 20, 210]);
  fillPoly(fb, [f[3], f[2], b[2], b[3]], [0, 255, 90, 150]);
  fb.fillRect(f[0][0] + 6, f[0][1] + 6, size * 0.28, size * 0.28, [255, 255, 0, 210]);
  fb.fillRect(f[0][0] + size * 0.38, f[0][1] + 6, size * 0.28, size * 0.28, [0, 255, 255, 210]);
  fb.fillRect(f[0][0] + size * 0.2, f[0][1] + size * 0.45, size * 0.38, size * 0.28, [255, 80, 0, 210]);
  drawLoop(fb, f, [245, 245, 245, 255], 3);
  drawLoop(fb, b, [0, 225, 255, 255], 3);
  for (let i = 0; i < 4; i++) fb.drawLine(f[i][0], f[i][1], b[i][0], b[i][1], [255, 255, 255, 220], 2);
}
function swatches(fb, box2) {
  const colors = [[255, 0, 0, 255], [255, 230, 0, 255], [0, 255, 90, 255], [0, 210, 255, 255], [70, 80, 255, 255], [255, 0, 255, 255]];
  const size = Math.max(12, Math.min(18, Math.floor((box2.w - 62) / 9)));
  const x = box2.x + 46, y = box2.y + box2.h - 28;
  fb.drawText("TEX", box2.x + 10, y + 4, [255, 255, 255, 255], 1, 30);
  colors.forEach((color, i) => fb.fillRect(x + i * (size + 4), y, size, size, color));
  fb.strokeRect(x - 2, y - 2, colors.length * (size + 4) + 2, size + 4, [255, 255, 255, 180], 1);
}
function drawLoop(fb, pts, color, width) {
  for (let i = 0; i < pts.length; i++) fb.drawLine(pts[i][0], pts[i][1], pts[(i + 1) % pts.length][0], pts[(i + 1) % pts.length][1], color, width);
}
function fillPoly(fb, pts, color) {
  const minY = Math.floor(Math.min(...pts.map((p) => p[1]))), maxY = Math.ceil(Math.max(...pts.map((p) => p[1])));
  for (let y = minY; y <= maxY; y++) for (const [a, b] of pairs(intersections(pts, y))) fb.fillRect(a, y, Math.max(0, b - a), 1, color);
}
function intersections(pts, y) {
  const xs = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    if (a[1] <= y && b[1] > y || b[1] <= y && a[1] > y) xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
  }
  return xs.sort((a, b) => a - b);
}
function pairs(xs) {
  const out = [];
  for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]]);
  return out;
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/canvasPainter.js
var IDENT = [1, 0, 0, 1, 0, 0];
var COMPOSITE_OPS = /* @__PURE__ */ new Set([
  "source-over",
  "source-in",
  "source-out",
  "source-atop",
  "destination-over",
  "destination-in",
  "destination-out",
  "destination-atop",
  "lighter",
  "copy",
  "xor"
]);
function paintCanvasTexture(fb, texture, box2, allTextures = []) {
  if (!texture || !box2) return;
  const webgl = texture.kind === "canvas-webgl";
  fb.fillRect(box2.x, box2.y, box2.w, box2.h, webgl ? [19, 14, 55, 255] : [8, 38, 46, 255]);
  fb.strokeRect(box2.x, box2.y, box2.w, box2.h, [74, 220, 255, 255], 2);
  const inner = inset(box2, 8);
  if (webgl) paintWebgl(fb, texture, inner);
  else paint2d(fb, texture, inner, allTextures, /* @__PURE__ */ new Set([texture.id]));
}
function renderCanvasSurface(texture, allTextures, seen) {
  const w = Math.max(1, Math.round(Number(texture.width || 300)));
  const h = Math.max(1, Math.round(Number(texture.height || 150)));
  const off = new Framebuffer(w, h, [0, 0, 0, 0]);
  replay(off, texture, 1, 1, allTextures, seen);
  return off;
}
function paint2d(fb, texture, box2, allTextures, seen) {
  const scale = fb.scale && fb.base ? fb.scale : 1;
  const target = fb.base && fb.scale ? fb.base : fb;
  const w = Math.max(1, Math.ceil(box2.w * scale)), h = Math.max(1, Math.ceil(box2.h * scale));
  const off = new Framebuffer(w, h, [0, 0, 0, 0]);
  const sx = w / Math.max(1, Number(texture.width || 300));
  const sy = h / Math.max(1, Number(texture.height || 150));
  replay(off, texture, sx, sy, allTextures, seen);
  target.blitAlpha(off, Math.round(box2.x * scale), Math.round(box2.y * scale), 1, "source-over");
}
function replay(off, texture, sx, sy, allTextures, seen) {
  const rp = { fb: off, sx, sy, allTextures, seen, maskStack: [] };
  for (const cmd of texture.commands || []) execCmd(rp, cmd);
}
function execCmd(rp, cmd) {
  switch (cmd.op) {
    case "save":
      rp.maskStack.push(rp.fb.getClipMask());
      return;
    case "restore": {
      const m = rp.maskStack.length ? rp.maskStack.pop() : null;
      rp.fb.setClipMask(m);
      return;
    }
    case "clip":
      applyClip(rp, cmd);
      return;
    case "clearRect":
      clearRectCmd(rp, cmd);
      return;
    case "fillRect":
      fillRectCmd(rp, cmd);
      return;
    case "strokeRect":
      strokeRectCmd(rp, cmd);
      return;
    case "fillPath":
      fillPathCmd(rp, cmd);
      return;
    case "strokePath":
      strokePathCmd(rp, cmd);
      return;
    case "fillText":
    case "strokeText":
      textCmd(rp, cmd);
      return;
    case "drawImageTexture":
      drawImageCmd(rp, cmd);
      return;
    case "putImageData":
      putImageDataCmd(rp, cmd);
      return;
    default:
      return;
  }
}
function stateOf(cmd) {
  return cmd.state || {};
}
function transformOf(cmd) {
  const t = stateOf(cmd).transform;
  return Array.isArray(t) && t.length === 6 && t.every((v) => Number.isFinite(v)) ? t : IDENT;
}
function alphaOf(cmd) {
  const a = Number(stateOf(cmd).globalAlpha);
  return Number.isFinite(a) ? Math.max(0, Math.min(1, a)) : 1;
}
function compOf(cmd) {
  const op = stateOf(cmd).globalCompositeOperation;
  return COMPOSITE_OPS.has(op) ? op : "source-over";
}
function lineWidthOf(cmd) {
  const w = Number(stateOf(cmd).lineWidth);
  return Number.isFinite(w) && w > 0 ? w : 1;
}
function toOff(rp, t, x, y) {
  return [rp.sx * (t[0] * x + t[2] * y + t[4]), rp.sy * (t[1] * x + t[3] * y + t[5])];
}
function inverseMap(rp, t) {
  const A = rp.sx * t[0], B = rp.sx * t[2], E = rp.sx * t[4];
  const C = rp.sy * t[1], D = rp.sy * t[3], F = rp.sy * t[5];
  const det = A * D - B * C;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-12) return null;
  const inv = 1 / det;
  return (X, Y) => {
    const u = X - E, v = Y - F;
    return [(D * u - B * v) * inv, (A * v - C * u) * inv];
  };
}
function isAxisAligned(t) {
  return t[1] === 0 && t[2] === 0;
}
function fillPaintOf(cmd) {
  const st = stateOf(cmd);
  const p = cmd.fillStyle !== void 0 ? cmd.fillStyle : st.fillStyle;
  return paintOf(p, alphaOf(cmd));
}
function strokePaintOf(cmd) {
  const st = stateOf(cmd);
  const p = cmd.strokeStyle !== void 0 ? cmd.strokeStyle : st.strokeStyle;
  return paintOf(p, alphaOf(cmd));
}
function paintOf(p, ga) {
  if (p && typeof p === "object" && Array.isArray(p.stops)) {
    return { kind: "gradient", grad: p, stops: parseStops(p.stops), ga };
  }
  const c = cssColor(p, [0, 0, 0, 255]);
  return { kind: "solid", rgba: [c[0], c[1], c[2], Math.round(c[3] * ga)] };
}
function parseStops(stops) {
  const out = (stops || []).map((s) => ({
    offset: Math.max(0, Math.min(1, Number(s.offset) || 0)),
    rgba: cssColor(s.color, [0, 0, 0, 255])
  }));
  out.sort((a, b) => a.offset - b.offset);
  return out;
}
function mixRgba(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    Math.round(a[3] + (b[3] - a[3]) * t)
  ];
}
function gradientAt(grad, stops, ga, cx, cy) {
  if (!stops.length) return [0, 0, 0, 0];
  if (stops.length === 1) {
    const c2 = stops[0].rgba;
    return [c2[0], c2[1], c2[2], Math.round(c2[3] * ga)];
  }
  let t;
  if (grad.kind === "radial") {
    const dx = cx - n(grad.x0), dy = cy - n(grad.y0);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const r0 = n(grad.r0), r1 = n(grad.r1);
    t = r1 === r0 ? 0 : (dist - r0) / (r1 - r0);
  } else if (grad.kind === "conic") {
    const ang = Math.atan2(cy - n(grad.y), cx - n(grad.x)) - n(grad.startAngle);
    t = (ang / (2 * Math.PI) % 1 + 1) % 1;
  } else {
    const dx = n(grad.x1) - n(grad.x0), dy = n(grad.y1) - n(grad.y0);
    const len2 = dx * dx + dy * dy;
    t = len2 <= 0 ? 0 : ((cx - n(grad.x0)) * dx + (cy - n(grad.y0)) * dy) / len2;
  }
  t = Math.max(0, Math.min(1, t));
  let i = 0;
  while (i < stops.length - 2 && t > stops[i + 1].offset) i++;
  const a = stops[i], b = stops[i + 1];
  const span = b.offset - a.offset || 1;
  const local = Math.max(0, Math.min(1, (t - a.offset) / span));
  const c = mixRgba(a.rgba, b.rgba, local);
  return [c[0], c[1], c[2], Math.round(c[3] * ga)];
}
function spansOfRing(pts, W, H, rule) {
  const spans = [];
  if (pts.length < 3) return spans;
  let minY = Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p[1] < minY) minY = p[1];
    if (p[1] > maxY) maxY = p[1];
  }
  const y0 = Math.max(0, Math.floor(minY)), y1 = Math.min(H - 1, Math.ceil(maxY));
  for (let y = y0; y <= y1; y++) {
    const yc = y + 0.5;
    const segs = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if (a[1] <= yc && b[1] > yc || b[1] <= yc && a[1] > yc) {
        segs.push({ x: a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1]), dir: b[1] > a[1] ? 1 : -1 });
      }
    }
    segs.sort((p, q) => p.x - q.x);
    if (rule === "evenodd") {
      for (let i = 0; i + 1 < segs.length; i += 2) spans.push([y, segs[i].x, segs[i + 1].x]);
    } else {
      let wind = 0, startX = 0;
      for (const s of segs) {
        if (wind === 0) startX = s.x;
        wind += s.dir;
        if (wind === 0) spans.push([y, startX, s.x]);
      }
    }
  }
  return spans;
}
function fillPolys(rp, cmd, rings, paint, rule = "nonzero") {
  const fb = rp.fb, op = compOf(cmd);
  const W = fb.width, H = fb.height;
  for (const pts of rings) {
    const spans = spansOfRing(pts, W, H, rule);
    if (paint.kind === "solid") {
      const [r, g, b, a] = paint.rgba;
      for (const [y, x0, x1] of spans) fb.fillSpanAlpha(y, x0, x1, r, g, b, a, op);
    } else {
      const inv = inverseMap(rp, transformOf(cmd));
      if (!inv) return;
      const mask = fb.getClipMask();
      for (const [y, x0, x1] of spans) {
        const xa = Math.max(0, Math.floor(x0)), xb = Math.min(W, Math.ceil(x1));
        const mrow = y * W;
        for (let x = xa; x < xb; x++) {
          if (mask && mask[mrow + x] === 0) continue;
          const cc = inv(x + 0.5, y + 0.5);
          const rgba = gradientAt(paint.grad, paint.stops, paint.ga, cc[0], cc[1]);
          fb._blendPixelFast(x, y, rgba[0], rgba[1], rgba[2], rgba[3], op);
        }
      }
    }
  }
}
function paintShadow(rp, cmd, bbox, silhouette) {
  const st = stateOf(cmd);
  const blur = Number(st.shadowBlur) || 0;
  if (!(blur > 0)) return;
  const sc = cssColor(st.shadowColor, [0, 0, 0, 0]);
  const ga = alphaOf(cmd);
  const sha = Math.round(sc[3] * ga);
  if (sha <= 0) return;
  const r = Math.max(1, Math.round(blur / 2));
  const pad = r * 2 + 2;
  const w = Math.max(1, Math.ceil(bbox.x1 - bbox.x0) + pad * 2);
  const h = Math.max(1, Math.ceil(bbox.y1 - bbox.y0) + pad * 2);
  const tmp = new Framebuffer(w, h, [0, 0, 0, 0]);
  silhouette(tmp, pad - bbox.x0, pad - bbox.y0);
  boxBlurRegion(tmp.data, w, h, r);
  tmp.tintWith([sc[0], sc[1], sc[2], sha]);
  const ox = Number(st.shadowOffsetX) || 0, oy = Number(st.shadowOffsetY) || 0;
  rp.fb.blitAlpha(tmp, Math.round(bbox.x0 - pad + ox * rp.sx), Math.round(bbox.y0 - pad + oy * rp.sy), 1, "source-over");
}
function bboxOfRings(rings) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const pts of rings) for (const p of pts) {
    if (p[0] < x0) x0 = p[0];
    if (p[1] < y0) y0 = p[1];
    if (p[0] > x1) x1 = p[0];
    if (p[1] > y1) y1 = p[1];
  }
  return { x0, y0, x1, y1 };
}
function pathRings(rp, t, steps) {
  const rings = [];
  let cur = [];
  const pushPt = (x, y) => cur.push(toOff(rp, t, x, y));
  for (const s of steps || []) {
    const op = s[0];
    if (op === "moveTo") {
      if (cur.length) rings.push(cur);
      cur = [];
      pushPt(n(s[1]), n(s[2]));
    } else if (op === "lineTo") pushPt(n(s[1]), n(s[2]));
    else if (op === "rect" || op === "roundRect") {
      const x = n(s[1]), y = n(s[2]), w = n(s[3]), h = n(s[4]);
      if (cur.length) rings.push(cur);
      cur = [];
      pushPt(x, y);
      pushPt(x + w, y);
      pushPt(x + w, y + h);
      pushPt(x, y + h);
      pushPt(x, y);
    } else if (op === "arc" || op === "ellipse") {
      const ellipse = op === "ellipse";
      const cx = n(s[1]), cy = n(s[2]), rx = n(s[3]), ry = ellipse ? n(s[4]) : rx;
      const start = ellipse ? n(s[6]) : n(s[4]), end = ellipse ? n(s[7]) : n(s[5]);
      const ac = !!s[ellipse ? 8 : 6];
      const total = end - start, segs = 32;
      for (let i = 0; i <= segs; i++) {
        const a = ac ? start - total * (i / segs) : start + total * (i / segs);
        pushPt(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
      }
    } else if (op === "quadraticCurveTo") {
      const cpx = n(s[1]), cpy = n(s[2]), x = n(s[3]), y = n(s[4]);
      const p0 = cur.length ? unOff(rp, t, cur[cur.length - 1]) : [cpx, cpy];
      for (let i = 1; i <= 16; i++) {
        const u = i / 16, v = 1 - u;
        pushPt(v * v * p0[0] + 2 * u * v * cpx + u * u * x, v * v * p0[1] + 2 * u * v * cpy + u * u * y);
      }
    } else if (op === "bezierCurveTo") {
      const c1x = n(s[1]), c1y = n(s[2]), c2x = n(s[3]), c2y = n(s[4]), x = n(s[5]), y = n(s[6]);
      const p0 = cur.length ? unOff(rp, t, cur[cur.length - 1]) : [c1x, c1y];
      for (let i = 1; i <= 16; i++) {
        const u = i / 16, v = 1 - u;
        pushPt(
          v * v * v * p0[0] + 3 * u * v * v * c1x + 3 * u * u * v * c2x + u * u * u * x,
          v * v * v * p0[1] + 3 * u * v * v * c1y + 3 * u * u * v * c2y + u * u * u * y
        );
      }
    } else if (op === "closePath") {
      if (cur.length > 2) {
        cur.push(cur[0].slice());
        rings.push(cur);
        cur = [];
      }
    }
  }
  if (cur.length) rings.push(cur);
  return rings;
}
function unOff(rp, t, p) {
  const inv = inverseMap(rp, t);
  return inv ? inv(p[0], p[1]) : [0, 0];
}
function clearRectCmd(rp, cmd) {
  const t = transformOf(cmd);
  const x = n(cmd.x), y = n(cmd.y), w = n(cmd.width), h = n(cmd.height);
  if (w <= 0 || h <= 0) return;
  const quad = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(([px2, py]) => toOff(rp, t, px2, py));
  if (isAxisAligned(t)) {
    const xs = quad.map((p) => p[0]), ys = quad.map((p) => p[1]);
    rp.fb.clearRectRaw(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    return;
  }
  for (const [yy, x0, x1] of spansOfRing(quad, rp.fb.width, rp.fb.height, "nonzero")) {
    const y2 = Math.round(yy);
    for (let x2 = Math.max(0, Math.floor(x0)); x2 < Math.min(rp.fb.width, Math.ceil(x1)); x2++) {
      rp.fb.writePixel(x2, y2, 0, 0, 0, 0);
    }
  }
}
function fillRectCmd(rp, cmd) {
  const t = transformOf(cmd);
  const x = n(cmd.x), y = n(cmd.y), w = n(cmd.width), h = n(cmd.height);
  if (w <= 0 || h <= 0) return;
  const paint = fillPaintOf(cmd);
  const quad = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(([px2, py]) => toOff(rp, t, px2, py));
  paintShadow(rp, cmd, bboxOfRings([quad]), (tmp, dx, dy) => {
    const moved = quad.map((p) => [p[0] + dx, p[1] + dy]);
    for (const [yy, x0, x1] of spansOfRing(moved, tmp.width, tmp.height, "nonzero")) {
      tmp.fillSpanAlpha(yy, x0, x1, 255, 255, 255, 255, "source-over");
    }
  });
  fillPolys(rp, cmd, [quad], paint);
}
function strokeRectCmd(rp, cmd) {
  const t = transformOf(cmd);
  const x = n(cmd.x), y = n(cmd.y), w = n(cmd.width), h = n(cmd.height);
  if (w <= 0 || h <= 0) return;
  const paint = strokePaintOf(cmd);
  if (paint.kind !== "solid") return;
  const lw = Math.max(1, lineWidthOf(cmd) * (Math.abs(t[0]) * rp.sx + Math.abs(t[3]) * rp.sy) / 2);
  const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]].map(([px2, py]) => toOff(rp, t, px2, py));
  strokePolyline(rp, cmd, pts, paint.rgba, lw);
}
function fillPathCmd(rp, cmd) {
  const t = transformOf(cmd);
  const rings = pathRings(rp, t, cmd.path || []).filter((r) => r.length >= 3);
  if (!rings.length) return;
  const paint = fillPaintOf(cmd);
  const rule = cmd.fillRule === "evenodd" ? "evenodd" : "nonzero";
  paintShadow(rp, cmd, bboxOfRings(rings), (tmp, dx, dy) => {
    const moved = rings.map((r) => r.map((p) => [p[0] + dx, p[1] + dy]));
    for (const pts of moved) {
      for (const [yy, x0, x1] of spansOfRing(pts, tmp.width, tmp.height, rule)) {
        tmp.fillSpanAlpha(yy, x0, x1, 255, 255, 255, 255, "source-over");
      }
    }
  });
  fillPolys(rp, cmd, rings, paint, rule);
}
function strokePathCmd(rp, cmd) {
  const t = transformOf(cmd);
  const rings = pathRings(rp, t, cmd.path || []);
  if (!rings.length) return;
  const paint = strokePaintOf(cmd);
  if (paint.kind !== "solid") return;
  const lw = Math.max(1, lineWidthOf(cmd) * (Math.abs(t[0]) * rp.sx + Math.abs(t[3]) * rp.sy) / 2);
  for (const pts of rings) strokePolyline(rp, cmd, pts, paint.rgba, lw);
}
function strokePolyline(rp, cmd, pts, rgba, width) {
  const fb = rp.fb, op = compOf(cmd);
  const [r, g, b, a] = rgba;
  const rad = Math.max(0.5, width / 2);
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.ceil(len));
    for (let s = 0; s <= steps; s++) {
      const cx = x0 + (x1 - x0) * (s / steps), cy = y0 + (y1 - y0) * (s / steps);
      const yA = Math.floor(cy - rad), yB = Math.ceil(cy + rad);
      for (let yy = yA; yy <= yB; yy++) {
        const dy = yy + 0.5 - cy;
        const hw = Math.sqrt(Math.max(0, rad * rad - dy * dy));
        fb.fillSpanAlpha(yy, cx - hw, cx + hw, r, g, b, a, op);
      }
    }
  }
}
function textCmd(rp, cmd) {
  const t = transformOf(cmd);
  const [ox, oy] = toOff(rp, t, n(cmd.x), n(cmd.y));
  const isStroke = cmd.op === "strokeText";
  const paint = isStroke ? strokePaintOf(cmd) : fillPaintOf(cmd);
  const scale = Math.max(1, Math.round((Math.abs(t[0]) * rp.sx + Math.abs(t[3]) * rp.sy) / 2 || 1));
  const op = compOf(cmd);
  const draw = (fb, dx, dy, rgba) => {
    fb.drawTextAlpha(String(cmd.text || ""), ox + dx, oy + dy, rgba, scale, Infinity, op);
  };
  if (paint.kind === "solid") {
    paintShadow(
      rp,
      cmd,
      { x0: ox, y0: oy - 10 * scale, x1: ox + String(cmd.text || "").length * 6 * scale, y1: oy + 4 * scale },
      (tmp, dx, dy) => draw(tmp, dx, dy, [255, 255, 255, 255])
    );
    draw(rp.fb, 0, 0, paint.rgba);
  } else {
    const inv = inverseMap(rp, t);
    if (!inv) return;
    const text = String(cmd.text || "");
    let cursor = ox;
    const charW = 6 * scale;
    for (const ch of text) {
      const cc = inv(cursor + charW / 2, oy);
      const rgba = gradientAt(paint.grad, paint.stops, paint.ga, cc[0], cc[1]);
      rp.fb.drawTextAlpha(ch, cursor, oy, rgba, scale, charW + 1, op);
      cursor += charW;
    }
  }
}
function putImageDataCmd(rp, cmd) {
  blitPutImageData(
    rp.fb.data,
    rp.fb.width,
    rp.fb.height,
    cmd.bytes,
    Math.round(Number(cmd.width || 0)),
    Math.round(Number(cmd.height || 0)),
    Number(cmd.dx || 0),
    Number(cmd.dy || 0),
    Number(cmd.dirtyX || 0),
    Number(cmd.dirtyY || 0),
    Number(cmd.dirtyWidth || 0),
    Number(cmd.dirtyHeight || 0)
  );
}
function blitPutImageData(dst, fw, fh, src, sw, sh, dx, dy, dirtyX, dirtyY, dw, dh) {
  if (!src || !src.length || sw <= 0 || sh <= 0) return;
  dirtyX = Math.max(0, Math.round(dirtyX));
  dirtyY = Math.max(0, Math.round(dirtyY));
  dw = Math.min(Math.round(dw), sw - dirtyX);
  dh = Math.min(Math.round(dh), sh - dirtyY);
  if (dw <= 0 || dh <= 0) return;
  const rdx = Math.round(dx), rdy = Math.round(dy);
  if (rdx === 0 && rdy === 0 && dirtyX === 0 && dirtyY === 0 && dw === fw && dh === fh && sw === fw && sh === fh && dst.length === src.length) {
    dst.set(src);
    return;
  }
  dx = rdx + dirtyX;
  dy = rdy + dirtyY;
  const x0 = Math.max(0, dx), y0 = Math.max(0, dy);
  const x1 = Math.min(fw, dx + dw), y1 = Math.min(fh, dy + dh);
  const cw = x1 - x0;
  if (cw <= 0 || y1 <= y0) return;
  const sox = dirtyX + (x0 - dx), soy = dirtyY + (y0 - dy);
  for (let y = y0; y < y1; y++) {
    const si = ((soy + (y - y0)) * sw + sox) * 4;
    const di = (y * fw + x0) * 4;
    dst.set(src.subarray(si, si + cw * 4), di);
  }
}
function drawImageCmd(rp, cmd) {
  const st = stateOf(cmd);
  const ga = alphaOf(cmd), op = compOf(cmd);
  const t = transformOf(cmd);
  let src = null;
  const srcTex = (rp.allTextures || []).find((x) => x.id === cmd.sourceTexture);
  if (srcTex && !(rp.seen && rp.seen.has(srcTex.id))) {
    if (srcTex.kind === "decoded-image" && srcTex.imageData) {
      const id = srcTex.imageData;
      src = { width: id.width, height: id.height, data: id.data };
    } else if (srcTex.kind === "canvas-2d" || srcTex.commands && srcTex.commands.length) {
      rp.seen.add(srcTex.id);
      try {
        const sw = Math.max(1, Math.round(Number(srcTex.width || 300)));
        const sh = Math.max(1, Math.round(Number(srcTex.height || 150)));
        const ver = srcTex.__version || 0;
        const cached = srcTex.__surface;
        if (cached && cached.w === sw && cached.h === sh && cached.version === ver && cached.fb) {
          src = cached.fb;
        } else {
          src = renderCanvasSurface(srcTex, rp.allTextures, rp.seen);
          srcTex.__surface = { w: sw, h: sh, version: ver, fb: src };
        }
      } finally {
        rp.seen.delete(srcTex.id);
      }
    }
  }
  const dx = n(cmd.x), dy = n(cmd.y), dw = n(cmd.width), dh = n(cmd.height);
  if (!src || dw <= 0 || dh <= 0) {
    const q = [[dx, dy], [dx + dw, dy], [dx + dw, dy + dh], [dx, dy + dh]].map(([px2, py]) => toOff(rp, t, px2, py));
    const bb = bboxOfRings([q]);
    rp.fb.fillRect(bb.x0, bb.y0, bb.x1 - bb.x0, bb.y1 - bb.y0, [45, 60, 95, 255]);
    rp.fb.strokeRect(bb.x0, bb.y0, bb.x1 - bb.x0, bb.y1 - bb.y0, [135, 160, 255, 255], 2);
    return;
  }
  let sxx = 0, syy = 0, swd = src.width, shd = src.height;
  if (cmd.sx !== void 0) {
    sxx = Math.max(0, cmd.sx | 0);
    syy = Math.max(0, cmd.sy | 0);
    swd = Math.min(src.width - sxx, Math.max(1, cmd.sw | 0));
    shd = Math.min(src.height - syy, Math.max(1, cmd.sh | 0));
  }
  const quad = [[dx, dy], [dx + dw, dy], [dx + dw, dy + dh], [dx, dy + dh]].map(([px2, py]) => toOff(rp, t, px2, py));
  blitTexturedQuad(rp, src, sxx, syy, swd, shd, quad, ga, op);
}
function blitTexturedQuad(rp, src, sxx, syy, swd, shd, quad, ga, op) {
  const fb = rp.fb;
  const bb = bboxOfRings([quad]);
  const x0 = Math.max(0, Math.floor(bb.x0)), y0 = Math.max(0, Math.floor(bb.y0));
  const x1 = Math.min(fb.width, Math.ceil(bb.x1)), y1 = Math.min(fb.height, Math.ceil(bb.y1));
  if (x1 <= x0 || y1 <= y0 || swd <= 0 || shd <= 0) return;
  const axis = Math.abs(quad[1][1] - quad[0][1]) < 0.01 && Math.abs(quad[3][0] - quad[0][0]) < 0.01;
  const sdata = src.data, sw = src.width;
  const mask = fb.getClipMask(), dW = fb.width;
  if (axis) {
    const dw = quad[1][0] - quad[0][0], dh = quad[3][1] - quad[0][1];
    if (dw <= 0 || dh <= 0) return;
    for (let Y = y0; Y < y1; Y++) {
      const sy = Math.min(src.height - 1, syy + Math.floor((Y + 0.5 - quad[0][1]) / dh * shd));
      const srow = sy * sw, mrow = Y * dW;
      for (let X = x0; X < x1; X++) {
        if (mask && mask[mrow + X] === 0) continue;
        const sx = Math.min(sw - 1, sxx + Math.floor((X + 0.5 - quad[0][0]) / dw * swd));
        const si = (srow + sx) * 4;
        const sa = sdata[si + 3] / 255 * ga;
        if (sa <= 0) continue;
        fb._blendPixelFast(X, Y, sdata[si], sdata[si + 1], sdata[si + 2], Math.round(sa * 255), op);
      }
    }
    return;
  }
  const m = quadAffineInverse(quad, sxx, syy, swd, shd);
  if (!m) return;
  for (let Y = y0; Y < y1; Y++) {
    const mrow = Y * dW;
    for (let X = x0; X < x1; X++) {
      if (mask && mask[mrow + X] === 0) continue;
      if (!pointInConvexQuad(X + 0.5, Y + 0.5, quad)) continue;
      const sx = m[0] * (X + 0.5) + m[1] * (Y + 0.5) + m[2];
      const sy = m[3] * (X + 0.5) + m[4] * (Y + 0.5) + m[5];
      const sxi = Math.floor(sx), syi = Math.floor(sy);
      if (sxi < 0 || syi < 0 || sxi >= sw || syi >= src.height) continue;
      const si = (syi * sw + sxi) * 4;
      const sa = sdata[si + 3] / 255 * ga;
      if (sa <= 0) continue;
      fb._blendPixelFast(X, Y, sdata[si], sdata[si + 1], sdata[si + 2], Math.round(sa * 255), op);
    }
  }
}
function quadAffineInverse(quad, sxx, syy, swd, shd) {
  const ax = quad[1][0] - quad[0][0], bx = quad[3][0] - quad[0][0];
  const ay = quad[1][1] - quad[0][1], by = quad[3][1] - quad[0][1];
  const det = ax * by - bx * ay;
  if (Math.abs(det) < 1e-9) return null;
  const inv = 1 / det;
  const x0 = quad[0][0], y0 = quad[0][1];
  return [
    swd * by * inv,
    -swd * bx * inv,
    sxx + swd * (-x0 * by + y0 * bx) * inv,
    -shd * ay * inv,
    shd * ax * inv,
    syy + shd * (x0 * ay - y0 * ax) * inv
  ];
}
function pointInConvexQuad(x, y, q) {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = q[i], b = q[(i + 1) % 4];
    const cross = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
    const s = cross > 0 ? 1 : cross < 0 ? -1 : 0;
    if (s !== 0) {
      if (sign === 0) sign = s;
      else if (sign !== s) return false;
    }
  }
  return true;
}
function applyClip(rp, cmd) {
  const fb = rp.fb, t = transformOf(cmd);
  const W = fb.width, H = fb.height;
  const old = fb.getClipMask();
  const base = old ? old.slice() : new Uint8Array(W * H).fill(1);
  const rings = pathRings(rp, t, cmd.path || []).filter((r) => r.length >= 3);
  const rule = cmd.fillRule === "evenodd" ? "evenodd" : "nonzero";
  if (!rings.length) {
    base.fill(0);
  } else {
    const inside = new Uint8Array(W * H);
    for (const pts of rings) {
      for (const [y, x0, x1] of spansOfRing(pts, W, H, rule)) {
        const xa = Math.max(0, Math.floor(x0)), xb = Math.min(W, Math.ceil(x1));
        for (let x = xa; x < xb; x++) inside[y * W + x] = 1;
      }
    }
    for (let i = 0; i < base.length; i++) base[i] &= inside[i];
  }
  fb.setClipMask(base);
  rp.maskStack.push(old || null);
}
function inset(box2, v) {
  return { x: box2.x + v, y: box2.y + v, w: Math.max(1, box2.w - v * 2), h: Math.max(1, box2.h - v * 2) };
}
function n(value) {
  return Number(value) || 0;
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/dom-painter/styleTools.js
function background(style, item) {
  const bg = style["background-image"] || style.background || "";
  const color = cssColor(style["background-color"] || style.background, fallbackFor(item.kind));
  return /gradient\(/i.test(bg) ? { gradient: bg, color } : { color };
}
function overflowValue(style) {
  const both = String(style.overflow || "visible").trim().toLowerCase();
  return {
    x: String(style["overflow-x"] || both).trim().toLowerCase(),
    y: String(style["overflow-y"] || both).trim().toLowerCase()
  };
}
function borderColor(style, kind) {
  const logical = String(style["border-inline-start"] || style["border-inline-end"] || "").trim();
  const logicalColor = logical ? logical.split(/\s+/).slice(2).join(" ") : "";
  return cssColor(style["border-color"] || style.border || logicalColor || (isControl(kind) ? "#7edcff" : "#000000"), isControl(kind) ? [126, 220, 255, 255] : [0, 0, 0, 255]);
}
function borderWidth(style, kind) {
  return parsePx2(style["border-width"] || String(style.border || "").match(/\d+(?:\.\d+)?px/)?.[0]) || (isControl(kind) ? 2 : 0);
}
function textScale(kind, style) {
  const size = parsePx2(style["font-size"]) || (kind === "h1" ? 24 : kind === "h2" ? 20 : isControl(kind) ? 14 : 14);
  return kind === "button" || isControl(kind) ? 1 : Math.max(1, Math.min(3, Math.round(size / 10)));
}
function fallbackFor(kind) {
  if (kind === "body") return [255, 255, 255, 255];
  if (["main", "section", "article", "div", "form", "fieldset"].includes(kind)) return [0, 0, 0, 0];
  if (kind === "button") return [69, 90, 210, 255];
  if (["input", "select", "textarea"].includes(kind)) return [24, 38, 59, 255];
  if (["h1", "h2", "h3", "p", "span", "strong", "label", "li", "ul"].includes(kind)) return [0, 0, 0, 0];
  return [0, 0, 0, 0];
}
function isControl(kind) {
  return ["button", "input", "select", "textarea"].includes(kind);
}
function hasGlow(style) {
  return /shadow|glow|blur/i.test(String(style["box-shadow"] || style.filter || ""));
}
function classText(item) {
  return String(item.node?.className || item.node?.attributes?.class || "");
}
function resolveFontWeight(style = {}) {
  const v = String(style["font-weight"] ?? style.fontWeight ?? "400").trim().toLowerCase();
  if (v === "bold" || v === "bolder") return 700;
  if (v === "normal" || v === "lighter") return 400;
  const n2 = parseInt(v, 10);
  if (!isNaN(n2)) return Math.max(100, Math.min(900, Math.round(n2 / 100) * 100));
  return 400;
}
var camelCache = /* @__PURE__ */ new Map();
function toCamel(prop) {
  let c = camelCache.get(prop);
  if (c === void 0) {
    c = prop.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
    camelCache.set(prop, c);
  }
  return c;
}
function borderRadii(style = {}, w = 0, h = 0) {
  const px2 = (v) => {
    const m = /^(-?\d+(?:\.\d+)?)(px)?$/.exec(String(v || "").trim());
    return m ? parseFloat(m[1]) : 0;
  };
  const get = (prop) => {
    const v = style[prop];
    return v !== void 0 && v !== null ? v : style[toCamel(prop)];
  };
  let tl = [0, 0], tr = [0, 0], br = [0, 0], bl = [0, 0];
  const single = (v) => {
    const n2 = px2(v);
    return [n2, n2];
  };
  const dual = (v) => {
    const parts = String(v || "").trim().split(/\s+/);
    if (parts.length >= 2) return [px2(parts[0]), px2(parts[1])];
    return single(v);
  };
  const r = get("border-radius");
  if (r) {
    const [horiz, vert] = String(r).split("/").map((s) => s.trim());
    const hp = (horiz || "").split(/\s+/).filter(Boolean);
    const vp = vert ? vert.split(/\s+/).filter(Boolean) : null;
    const q = (arr, i) => px2(arr[i] ?? arr[i - 2] ?? arr[0] ?? 0);
    const corners = ["tl", "tr", "br", "bl"];
    const out = {};
    corners.forEach((c, i) => {
      const hx = q(hp, i);
      const vy = vp ? q(vp, i) : hx;
      out[c] = [hx, vy];
    });
    tl = out.tl;
    tr = out.tr;
    br = out.br;
    bl = out.bl;
  }
  const per = {
    tl: get("border-top-left-radius"),
    tr: get("border-top-right-radius"),
    br: get("border-bottom-right-radius"),
    bl: get("border-bottom-left-radius")
  };
  if (per.tl) tl = dual(per.tl);
  if (per.tr) tr = dual(per.tr);
  if (per.br) br = dual(per.br);
  if (per.bl) bl = dual(per.bl);
  const W = Math.max(1, Number(w) || 1), H = Math.max(1, Number(h) || 1);
  let f = 1;
  const sums = [[tl[0] + tr[0], W], [bl[0] + br[0], W], [tl[1] + bl[1], H], [tr[1] + br[1], H]];
  for (const [s, d] of sums) if (s > d && s > 0) f = Math.min(f, d / s);
  if (f < 1) for (const c of [tl, tr, br, bl]) {
    c[0] *= f;
    c[1] *= f;
  }
  return { tl, tr, br, bl };
}
function parsePx2(value) {
  const match = String(value || "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/dom-painter/textFill.js
var CURRENT_COLOR_RE = /^currentcolor$/i;
function parseStyleAttrText(t) {
  const out = {};
  for (const p of String(t || "").split(";")) {
    const at = p.indexOf(":");
    if (at > -1) out[p.slice(0, at).trim()] = p.slice(at + 1).trim();
  }
  return out;
}
function mergedNodeStyle(node) {
  if (!node) return {};
  return { ...node.computedStyle || {}, ...node.style || {}, ...parseStyleAttrText(node.attributes?.style || "") };
}
function inheritedRaw(item, prop) {
  let node = item?.node?.parentNode;
  const seen = /* @__PURE__ */ new Set();
  let depth = 0;
  while (node && depth < 64 && !seen.has(node)) {
    seen.add(node);
    depth++;
    const st = mergedNodeStyle(node);
    const v = st[prop];
    if (v != null && String(v).trim() !== "") return String(v).trim();
    node = node.parentNode;
  }
  return "";
}
function tryParseColor(value) {
  const t = String(value ?? "").trim();
  if (!t) return null;
  if (CURRENT_COLOR_RE.test(t)) return "currentcolor";
  return parseColor(t, null);
}
function relativeLuminance([r, g, b]) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
function opaqueBackground(item) {
  let node = item?.node;
  const seen = /* @__PURE__ */ new Set();
  let depth = 0;
  while (node && depth < 64 && !seen.has(node)) {
    seen.add(node);
    depth++;
    const st = mergedNodeStyle(node);
    const bgc = st["background-color"];
    if (bgc) {
      const c = parseColor(String(bgc), null);
      if (c && c[3] > 0) return c;
    }
    const bg = st["background-image"] || st.background || "";
    if (bg && !/gradient\(/i.test(bg) && !/\burl\(/i.test(bg)) {
      const first = String(bg).trim().split(/\s+/)[0];
      const c = parseColor(first, null);
      if (c && c[3] > 0) return c;
    }
    node = node.parentNode;
  }
  return [8, 9, 14, 255];
}
function contrastSafeDefault(item) {
  return relativeLuminance(opaqueBackground(item)) > 0.5 ? [17, 24, 39, 255] : [246, 246, 250, 255];
}
function resolveCurrentColor(item) {
  const inh = inheritedRaw(item, "color");
  if (inh && !CURRENT_COLOR_RE.test(inh)) {
    const c = tryParseColor(inh);
    if (c && c !== "currentcolor") return c;
  }
  return null;
}
function resolveCore(kind, style, item, useFillColor) {
  const own = (p) => {
    const v = style[p];
    return v == null ? "" : String(v).trim();
  };
  if (useFillColor) {
    const fill = own("-webkit-text-fill-color") || (item ? inheritedRaw(item, "-webkit-text-fill-color") : "");
    if (fill) {
      if (CURRENT_COLOR_RE.test(fill)) {
        const cc = resolveCurrentColor(item);
        if (cc) return cc;
      } else {
        const c = tryParseColor(fill);
        if (c === "currentcolor") {
          const cc = resolveCurrentColor(item);
          if (cc) return cc;
        } else if (c) return c;
      }
    }
  }
  const color = own("color");
  if (color) {
    if (String(color).trim().toLowerCase() === INITIAL_COLOR_MARKER) return contrastSafeDefault(item);
    if (CURRENT_COLOR_RE.test(color)) {
      const cc = resolveCurrentColor(item);
      if (cc) return cc;
    } else {
      const c = tryParseColor(color);
      if (c === "currentcolor") {
        const cc = resolveCurrentColor(item);
        if (cc) return cc;
      } else if (c) return c;
    }
  }
  if (item) {
    const inh = inheritedRaw(item, "color");
    if (inh && !CURRENT_COLOR_RE.test(inh)) {
      const c = tryParseColor(inh);
      if (c && c !== "currentcolor") return c;
    }
  }
  return contrastSafeDefault(item);
}
function isGradientClipText(style = {}) {
  const clip = String(style["background-clip"] || style["-webkit-background-clip"] || "").trim().toLowerCase();
  if (clip !== "text") return false;
  const bg = style["background-image"] || style.background || "";
  return /gradient\(/i.test(bg);
}
function gradientTextSource(style = {}) {
  return style["background-image"] || style.background || "";
}
function resolveTextFill(kind, style = {}, item = null) {
  const st = style || {};
  if (isGradientClipText(st)) {
    let fallback = resolveCore(kind, st, item, false);
    if (!fallback || fallback[3] === 0) fallback = contrastSafeDefault(item);
    return { mode: "gradient-text", gradient: gradientTextSource(st), fallback };
  }
  return { mode: "solid", color: resolveCore(kind, st, item, true) };
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/dom-painter/overflowPainter.js
function isExplicitOverflowWitness(item) {
  return classText(item).includes("overflowCase") || hasScrollWitness(item);
}
function shouldShowScrollbar(item) {
  const ov = overflowValue(item.style || {});
  return isExplicitOverflowWitness(item) && (["scroll", "auto"].includes(ov.x) || ["scroll", "auto"].includes(ov.y) || hasScrollWitness(item));
}
function paintOverflowBadge(fb, item) {
  const label = overflowLabel(item);
  fb.fillRect(item.x + 5, item.y + 5, Math.min(70, item.width - 14), 15, [4, 12, 26, 235]);
  fb.drawText(label, item.x + 8, item.y + 9, [255, 255, 255, 255], 1, Math.max(24, item.width - 18));
}
function paintScrollbar(fb, item) {
  const style = item.style || {};
  const ov = overflowValue(style);
  const accent = cssColor(style["scrollbar-color"]?.split(/\s+/)[0] || style["--scroll-thumb"] || "#00e5ff", [0, 229, 255, 255]);
  const track = cssColor(style["--scroll-track"] || "#06101f", [6, 16, 31, 255]);
  if (["scroll", "auto"].includes(ov.y) || style["--scroll-y"]) paintVertical(fb, item, accent, track);
  if (["scroll", "auto"].includes(ov.x) || style["--scroll-x"]) paintHorizontal(fb, item, accent, track);
}
function paintVertical(fb, item, accent, track) {
  const right = item.x + item.width - 10;
  const top = item.y + 22;
  const h = Math.max(20, item.height - 30);
  const thumbH = Math.max(14, Math.min(h - 4, h * scrollRatio(item, "y")));
  const thumbY = top + 2 + Math.max(0, h - thumbH - 4) * scrollAmount(item, "y");
  fb.fillRect(right, top, 6, h, track);
  fb.fillRect(right + 1, thumbY, 4, thumbH, accent);
}
function paintHorizontal(fb, item, accent, track) {
  const left = item.x + 6;
  const bottom = item.y + item.height - 10;
  const w = Math.max(22, item.width - 18);
  const thumbW = Math.max(14, Math.min(w - 4, w * scrollRatio(item, "x")));
  const thumbX = left + 2 + Math.max(0, w - thumbW - 4) * scrollAmount(item, "x");
  fb.fillRect(left, bottom, w, 6, track);
  fb.fillRect(thumbX, bottom + 1, thumbW, 4, accent);
}
function overflowLabel(item) {
  const cls = classText(item);
  if (cls.includes("hiddenCase")) return "HIDDEN";
  if (cls.includes("xScrollCase")) return "SCROLL X";
  if (cls.includes("scrollCase")) return "SCROLL Y";
  if (cls.includes("autoCase")) return "AUTO";
  const ov = overflowValue(item.style || {});
  return ov.x === ov.y ? ov.x.toUpperCase() : `${ov.x}/${ov.y}`.toUpperCase();
}
function hasScrollWitness(item) {
  return String(item.style?.["--scroll-y"] || item.style?.["--scroll-x"] || "") !== "";
}
function scrollAmount(item, axis) {
  return Math.max(0, Math.min(1, Number(item.style?.[`--scroll-${axis}`] || item.node?.attributes?.[`data-scroll-${axis}`] || 0)));
}
function scrollRatio(item, axis) {
  return Math.max(0.12, Math.min(0.85, Number(item.style?.[`--scroll-${axis}-ratio`] || item.node?.attributes?.[`data-scroll-${axis}-ratio`] || 0.38)));
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/dom-painter/shadowPainter.js
function parseLengthPx(token) {
  const m = /^(-?\d+(?:\.\d+)?)(px)?$/.exec(String(token || "").trim());
  return m ? parseFloat(m[1]) : null;
}
function parseShadowColor(tokens) {
  for (const t of tokens) {
    if (parseLengthPx(t) === null && t !== "inset") return parseCssColor(t);
  }
  return [0, 0, 0, 255];
}
function parseCssColor(v) {
  const s = String(v || "").trim().toLowerCase();
  const named = {
    black: [0, 0, 0, 255],
    white: [255, 255, 255, 255],
    red: [255, 0, 0, 255],
    green: [0, 128, 0, 255],
    blue: [0, 0, 255, 255],
    gray: [128, 128, 128, 255],
    grey: [128, 128, 128, 255],
    transparent: [0, 0, 0, 0]
  };
  if (named[s]) return named[s].slice();
  const hex = s.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    if (h.length === 6) h += "ff";
    if (h.length === 8) {
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), parseInt(h.slice(6, 8), 16)];
    }
  }
  const rgb = s.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) {
    const parts = rgb[1].split(",").map((x) => x.trim());
    const r = Math.max(0, Math.min(255, parseFloat(parts[0]) || 0));
    const g = Math.max(0, Math.min(255, parseFloat(parts[1]) || 0));
    const b = Math.max(0, Math.min(255, parseFloat(parts[2]) || 0));
    let a = 255;
    if (parts[3] !== void 0) {
      const av = parseFloat(parts[3]);
      a = Math.round((av <= 1 ? av : av / 255) * 255);
    }
    return [r, g, b, Math.max(0, Math.min(255, a))];
  }
  return [0, 0, 0, 255];
}
function splitShadowList(value) {
  const out = [];
  let depth = 0, cur = "";
  for (const ch of String(value || "")) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
function parseBoxShadows(style = {}) {
  try {
    const raw = style["box-shadow"] ?? style.boxShadow ?? "";
    if (!raw || /^none$/i.test(String(raw).trim())) return [];
    const shadows = [];
    for (const part of splitShadowList(raw)) {
      const tokens = part.split(/\s+/).filter(Boolean);
      if (tokens.length < 2) continue;
      const inset2 = tokens[0].toLowerCase() === "inset";
      const t = inset2 ? tokens.slice(1) : tokens;
      if (t.length < 2) continue;
      const dx = parseLengthPx(t[0]);
      const dy = parseLengthPx(t[1]);
      if (dx === null || dy === null) continue;
      let blur = 0, spread = 0, ci = 2;
      if (t.length > ci && parseLengthPx(t[ci]) !== null) {
        blur = Math.max(0, parseLengthPx(t[ci]));
        ci++;
      }
      if (t.length > ci && parseLengthPx(t[ci]) !== null) {
        spread = parseLengthPx(t[ci]);
        ci++;
      }
      shadows.push({ dx, dy, blur, spread, color: parseShadowColor(t), inset: inset2 });
    }
    return shadows;
  } catch (_) {
    return [];
  }
}
function paintBoxShadows(fb, item, radii, shadows, mode) {
  try {
    if (!fb || !item || !Array.isArray(shadows)) return;
    const want = shadows.filter((s) => mode === "inset" === !!s.inset);
    if (!want.length) return;
    if (typeof fb.blitFrom !== "function") return;
    const scale = fb && fb.scale || 1;
    for (let si = want.length - 1; si >= 0; si--) {
      const sh = want[si];
      const blur = Math.max(0, sh.blur || 0);
      const spread = sh.spread || 0;
      const pad = Math.ceil(blur * 2) + 4;
      const rx = (item.x || 0) + (mode === "inset" ? 0 : sh.dx) - spread;
      const ry = (item.y || 0) + (mode === "inset" ? 0 : sh.dy) - spread;
      const rw = Math.max(1, (item.width || 0) + spread * 2);
      const rh = Math.max(1, (item.height || 0) + spread * 2);
      const sw = Math.max(1, Math.ceil((rw + pad * 2) * scale));
      const shh = Math.max(1, Math.ceil((rh + pad * 2) * scale));
      const tmp = { width: sw, height: shh, data: new Uint8ClampedArray(sw * shh * 4) };
      const ix = Math.round(pad * scale), iy = Math.round(pad * scale);
      const iw = Math.max(1, Math.round(rw * scale)), ih = Math.max(1, Math.round(rh * scale));
      const col = sh.color || [0, 0, 0, 128];
      for (let y = 0; y < ih; y++) {
        for (let x = 0; x < iw; x++) {
          const o = ((iy + y) * sw + (ix + x)) * 4;
          tmp.data[o] = col[0];
          tmp.data[o + 1] = col[1];
          tmp.data[o + 2] = col[2];
          tmp.data[o + 3] = col[3];
        }
      }
      if (blur > 0) boxBlurRegion(tmp.data, sw, shh, Math.max(1, Math.round(blur * scale)));
      if (mode === "inset") {
        const bx0 = Math.round((pad + spread) * scale), by0 = Math.round((pad + spread) * scale);
        const bx1 = Math.round((pad + spread + (item.width || 0)) * scale);
        const by1 = Math.round((pad + spread + (item.height || 0)) * scale);
        const er = Math.round((spread + blur) * scale);
        for (let yy = 0; yy < shh; yy++) {
          for (let xx = 0; xx < sw; xx++) {
            const inBox = xx >= bx0 && xx < bx1 && yy >= by0 && yy < by1;
            const deepInside = inBox && xx >= bx0 + er && xx < bx1 - er && yy >= by0 + er && yy < by1 - er;
            if (!inBox || deepInside) tmp.data[(yy * sw + xx) * 4 + 3] = 0;
          }
        }
      }
      fb.blitFrom(tmp, rx - pad, ry - pad);
    }
  } catch (_) {
  }
}
function parseTextShadows(style = {}) {
  try {
    const raw = style["text-shadow"] ?? style.textShadow ?? "";
    if (!raw || /^none$/i.test(String(raw).trim())) return [];
    const shadows = [];
    for (const part of splitShadowList(raw)) {
      const tokens = part.split(/\s+/).filter(Boolean);
      if (tokens.length < 2) continue;
      const dx = parseLengthPx(tokens[0]);
      const dy = parseLengthPx(tokens[1]);
      if (dx === null || dy === null) continue;
      let blur = 0;
      if (tokens.length >= 3) {
        const b = parseLengthPx(tokens[2]);
        if (b !== null) blur = Math.max(0, b);
      }
      shadows.push({ dx, dy, blur, color: parseShadowColor(tokens) });
    }
    return shadows;
  } catch (_) {
    return [];
  }
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/dom-painter/textPainter.js
function paintTextItem(fb, item) {
  const st = item.style || {};
  const bg = parseColor(st["background-color"], null);
  if (bg && bg[3] > 0 && item.width > 0 && item.height > 0) {
    fb.fillRect(item.x, item.y, item.width, item.height, bg);
  }
  paintTextWithin(fb, item.text || "", item, st, 0, 0);
}
function paintTextWithin(fb, text, item, style, padX, padY) {
  const shadows = parseTextShadows(style);
  for (let i = shadows.length - 1; i >= 0; i--) {
    paintTextShadowLayer(fb, text, item, style, padX, padY, shadows[i]);
  }
  const maxWidth = Math.max(8, item.width - padX * 2);
  const maxHeight = Math.max(8, item.height - padY * 2);
  const safe = [...String(text || "")].slice(0, 240).join("");
  const scale = textScale(item.kind, style);
  const weight = resolveFontWeight(style);
  const fill = resolveTextFill(item.kind, style, item);
  if (fill.mode === "gradient-text") {
    paintGradientWrappedText(fb, safe, item.x + padX, item.y + padY, maxWidth, maxHeight, item, fill.gradient, fill.fallback, scale, weight, style);
  } else {
    fb.drawWrappedText(safe, item.x + padX, item.y + padY, maxWidth, maxHeight, fill.color, scale, weight, style);
  }
  paintTextDecorations(fb, item, style, padX, padY, fill);
}
function decorationLines(style = {}) {
  const raw = String(style["text-decoration-line"] || style["text-decoration"] || "").toLowerCase();
  if (!raw || /\bnone\b/.test(raw)) return [];
  const out = [];
  if (/\bunderline\b/.test(raw)) out.push("underline");
  if (/\boverline\b/.test(raw)) out.push("overline");
  if (/\bline-through\b/.test(raw)) out.push("line-through");
  return out;
}
function paintTextDecorations(fb, item, style, padX, padY, fill) {
  const lines = decorationLines(style);
  if (!lines.length) return;
  const w = Math.max(1, item.width - padX * 2);
  if (w < 2) return;
  const x0 = item.x + padX;
  const color = parseColor(style["text-decoration-color"], null) || fill && fill.color || [0, 0, 0, 255];
  if (color[3] === 0) return;
  const h = Math.max(1, item.height - padY * 2);
  const scale = textScale(item.kind, style);
  const t = Math.max(1, Math.round(scale * 0.9));
  const y0 = item.y + padY;
  for (const ln of lines) {
    let yy;
    if (ln === "overline") yy = y0 + 2;
    else if (ln === "line-through") yy = y0 + h / 2 - t / 2;
    else yy = y0 + h - Math.max(2, Math.round(h * 0.2)) - t + 1;
    fb.fillRect(x0, yy, w, t, color);
  }
}
function paintTextShadowLayer(fb, text, item, style, padX, padY, sh) {
  const maxWidth = Math.max(8, item.width - padX * 2);
  const maxHeight = Math.max(8, item.height - padY * 2);
  const safe = [...String(text || "")].slice(0, 240).join("");
  if (!safe.trim()) return;
  const scale = textScale(item.kind, style);
  const weight = resolveFontWeight(style);
  const blur = Math.max(0, sh.blur || 0);
  const pad = Math.ceil(blur * 2) + 4;
  const tw = Math.max(1, Math.ceil(maxWidth + pad * 2));
  const th = Math.max(1, Math.ceil(maxHeight + pad * 2));
  const tmp = new Framebuffer(tw, th, [0, 0, 0, 0]);
  tmp.drawWrappedText(safe, pad, pad, maxWidth, maxHeight, sh.color, scale, weight, style);
  if (blur > 0) boxBlurRegion(tmp.data, tw, th, Math.max(1, Math.round(blur / 2)));
  fb.blitFrom(tmp, Math.round(item.x + padX + sh.dx - pad), Math.round(item.y + padY + sh.dy - pad));
}
var COMBINING_MARK_RE = /\p{M}/u;
function paintGradientWrappedText(fb, text, x, y, maxWidth, maxHeight, item, gradient, fallback, scale, weight, style) {
  const words = String(text || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const px2 = Math.max(4, Math.round(10 * (Number(scale) || 1)));
  const lineH = Math.ceil(px2 * 1.25);
  const maxLines = Math.max(1, Math.floor(maxHeight / lineH));
  const visible = (s) => [...s].filter((ch) => !COMBINING_MARK_RE.test(ch)).join("");
  const g = parseGradient(gradient);
  const gradAt = g ? (cx, ly) => gradientColorAt(g, cx - item.x, ly - item.y, item.width, item.height, fallback) : (cx, ly) => gradientColor(gradient, cx - item.x, ly - item.y, item.width, item.height, fallback);
  let yy = y, used = 0, line = "";
  const flush = (ln, ly) => {
    let cx = x;
    for (const ch of ln) {
      if (COMBINING_MARK_RE.test(ch)) continue;
      const w = textWidth(ch, scale, weight, style);
      if (cx + w > x + maxWidth) break;
      const c = gradAt(cx, ly);
      const drawn = fb.drawText(ch, cx, ly, c || fallback, scale, x + maxWidth - cx, weight, style);
      cx += drawn > 0 ? drawn : w;
    }
  };
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (textWidth(visible(next), scale, weight, style) <= maxWidth) {
      line = next;
      continue;
    }
    flush(line, yy);
    used++;
    if (used >= maxLines) return used;
    yy += lineH;
    line = word;
  }
  if (line && used < maxLines) {
    flush(line, yy);
    used++;
  }
  return used;
}
function directText(node, kind = "") {
  node = node || {};
  if (kind === "select") return "";
  if (isControl(kind)) {
    if (kind === "input") {
      const type = String(node.attributes?.type || node.type || "text").toLowerCase();
      if (!["text", "email", "password", "search", "url", "tel", "number", "submit"].includes(type)) return "";
    }
    return String(node.attributes?.value || node.value || node.attributes?.placeholder || node.textContent || "").trim();
  }
  return node.textContent && !(node.children || []).length ? String(node.textContent || "").trim() : "";
}
function textPadX(kind) {
  return isControl(kind) ? 10 : 10;
}
function textPadY(kind) {
  return isControl(kind) ? 9 : 10;
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/dom-painter/svgPainter.js
function paintSvgWitness(fb, item) {
  if (item.kind !== "svg") return false;
  const box2 = { x: item.x + 2, y: item.y + 2, w: Math.max(20, item.width - 4), h: Math.max(20, item.height - 4) };
  fb.fillRect(box2.x, box2.y, box2.w, box2.h, [8, 22, 42, 255]);
  fb.strokeRect(box2.x, box2.y, box2.w, box2.h, [0, 217, 255, 255], 2);
  for (const child of item.node?.children || []) paintSvgNode(fb, child, box2);
  fb.drawText("SVG OK", box2.x + box2.w - 70, box2.y + box2.h - 18, [255, 255, 255, 255], 1, 64);
  return true;
}
function paintSvgNode(fb, node, box2) {
  const kind = String(node.localName || node.tagName || "").toLowerCase();
  const attrs = node.attributes || {};
  if (kind === "rect") paintRect(fb, attrs, box2);
  else if (kind === "circle") paintCircle(fb, attrs, box2);
  else if (kind === "path") paintPath(fb, attrs, box2);
  else if (kind === "text") paintText(fb, node, attrs, box2);
}
function paintRect(fb, attrs, box2) {
  const x = box2.x + scaleX(num3(attrs.x), box2);
  const y = box2.y + scaleY(num3(attrs.y), box2);
  const w = scaleX(num3(attrs.width), box2);
  const h = scaleY(num3(attrs.height), box2);
  fb.fillRect(x, y, w, h, cssColor(attrs.fill, [8, 22, 42, 255]));
  fb.strokeRect(x, y, w, h, cssColor(attrs.stroke, [0, 217, 255, 255]), num3(attrs["stroke-width"]) || 2);
}
function paintCircle(fb, attrs, box2) {
  const cx = box2.x + scaleX(num3(attrs.cx), box2);
  const cy = box2.y + scaleY(num3(attrs.cy), box2);
  const r = Math.max(4, scaleX(num3(attrs.r), box2));
  const color = cssColor(attrs.fill, [255, 0, 255, 220]);
  for (let y = -r; y <= r; y++) {
    const span = Math.sqrt(Math.max(0, r * r - y * y));
    fb.fillRect(cx - span, cy + y, span * 2, 1, color);
  }
}
function paintPath(fb, attrs, box2) {
  const points = bezierArch(box2);
  const color = cssColor(attrs.stroke, [255, 230, 0, 255]);
  for (let i = 1; i < points.length; i++) fb.drawLine(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], color, num3(attrs["stroke-width"]) || 5);
}
function paintText(fb, node, attrs, box2) {
  const x = box2.x + scaleX(num3(attrs.x), box2);
  const y = box2.y + scaleY(num3(attrs.y), box2);
  fb.drawText(String(node.textContent || "SVG"), x, y, cssColor(attrs.fill, [255, 255, 255, 255]), 1, Math.max(30, box2.w - (x - box2.x) - 6));
}
function bezierArch(box2) {
  const pts = [];
  for (let i = 0; i <= 36; i++) {
    const t = i / 36;
    const x = box2.x + box2.w * (0.4 + 0.24 * t);
    const y = box2.y + box2.h * (0.78 - Math.sin(t * Math.PI) * 0.54);
    pts.push([x, y]);
  }
  return pts;
}
function scaleX(v, box2) {
  return box2.w * v / 240;
}
function scaleY(v, box2) {
  return box2.h * v / 100;
}
function num3(v) {
  const n2 = Number(v);
  return Number.isFinite(n2) ? n2 : 0;
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/dom-painter/boxPainter.js
function paintBox(fb, item, texture, allTextures, textParents = null) {
  const style = item.style || {};
  const shadows = parseBoxShadows(style);
  const bg = background(style, item);
  const radii = borderRadii(style, item.width, item.height);
  const rounded = hasAnyRadius(radii);
  if (hasGlow(style)) paintGlow(fb, item, style);
  paintBoxShadows(fb, item, radii, shadows, "outset");
  const fragSplit = !!item.__fragSplit;
  if (!isGradientClipText(style) && !fragSplit) {
    const bbm = parseBackgroundBlendModes(style);
    if (bbm && bg.gradient) {
      paintBlendedBackground(fb, item, bg.gradient, bg, radii, rounded, bbm);
    } else if (bg.gradient) {
      if (rounded) fb.gradientRoundedRect(item.x, item.y, item.width, item.height, radii, bg.gradient, bg.color);
      else fb.gradientRect(item.x, item.y, item.width, item.height, bg.gradient, bg.color);
    } else if (bg.color[3] > 0) {
      if (rounded) fb.fillRoundedRect(item.x, item.y, item.width, item.height, radii, bg.color);
      else fb.fillRect(item.x, item.y, item.width, item.height, bg.color);
    }
  }
  paintBoxShadows(fb, item, radii, shadows, "inset");
  if (item.__tableGrid) paintTableGrid(fb, item);
  else if (!fragSplit && !item.__suppressBorder) {
    const bw = borderWidth(style, item.kind);
    const sides = borderBox(style);
    const uniform = sides.top === sides.right && sides.right === sides.bottom && sides.bottom === sides.left;
    const anySide = sides.top > 0 || sides.right > 0 || sides.bottom > 0 || sides.left > 0;
    if (bw > 0 && (uniform || !anySide)) {
      if (rounded) fb.strokeRoundedRect(item.x, item.y, item.width, item.height, radii, borderColor(style, item.kind), bw);
      else fb.strokeRect(item.x, item.y, item.width, item.height, borderColor(style, item.kind), bw);
    } else if (anySide && !uniform) {
      const bc = borderColor(style, item.kind);
      if (sides.top > 0) fb.fillRect(item.x, item.y, item.width, sides.top, bc);
      if (sides.bottom > 0) fb.fillRect(item.x, item.y + item.height - sides.bottom, item.width, sides.bottom, bc);
      if (sides.left > 0) fb.fillRect(item.x, item.y, sides.left, item.height, bc);
      if (sides.right > 0) fb.fillRect(item.x + item.width - sides.right, item.y, sides.right, item.height, bc);
    }
  }
  if (item.__columnRules) paintColumnRules(fb, item);
  if (paintSvgWitness(fb, item)) return;
  if (isExplicitOverflowWitness(item)) paintOverflowBadge(fb, item);
  if (item.kind === "canvas") paintCanvasTexture(fb, texture, canvasBox(item), allTextures);
  const own = textParents && item.node && textParents.has(item.node) ? "" : directText(item.node, item.kind);
  if (own) paintTextWithin(fb, own, item, placeholderTextStyle(item, style), textPadX(item.kind), textPadY(item.kind));
}
var PLACEHOLDER_TEXT_PROPS = /* @__PURE__ */ new Set(["color", "font-size", "font-weight", "font-style", "font-family"]);
function placeholderTextStyle(item, style) {
  const ph = item.node && item.node.__merkavaPlaceholder;
  if (!ph || !isControl(item.kind)) return style;
  const attrs = item.node && item.node.attributes || {};
  if (String(attrs.value || item.node.value || "").trim()) return style;
  if (!String(attrs.placeholder || "").trim()) return style;
  const merged = { ...style || {} };
  for (const k of PLACEHOLDER_TEXT_PROPS) if (ph[k] != null) merged[k] = ph[k];
  return merged;
}
function canvasBox(item) {
  return { x: item.x + 2, y: item.y + 2, w: Math.max(24, item.width - 4), h: Math.max(24, item.height - 4) };
}
function paintGlow(fb, item, style) {
  const color = borderColor({ border: style["box-shadow"] || style.filter || "cyan" }, item.kind);
  fb.strokeRect(item.x - 3, item.y - 3, item.width + 6, item.height + 6, [color[0], color[1], color[2], 120], 2);
  fb.strokeRect(item.x - 6, item.y - 6, item.width + 12, item.height + 12, [color[0], color[1], color[2], 70], 1);
}
function paintTableGrid(fb, item) {
  const g = item.__tableGrid;
  if (!g) return;
  const ox = item.x, oy = item.y;
  const line = (x, y, w, h, color) => {
    if (w > 0 && h > 0) fb.fillRect(x, y, w, h, parseColor(color, [0, 0, 0, 255]));
  };
  const o = g.outer || {};
  const t = o.top || { w: 0 }, r = o.right || { w: 0 }, b = o.bottom || { w: 0 }, l = o.left || { w: 0 };
  const x0 = g.x0 + ox, y0 = g.y0 + oy, x1 = g.x1 + ox, y1 = g.y1 + oy;
  line(x0, y0, x1 - x0, t.w, t.color);
  line(x1 - r.w, y0, r.w, y1 - y0, r.color);
  line(x0, y1 - b.w, x1 - x0, b.w, b.color);
  line(x0, y0, l.w, y1 - y0, l.color);
  for (const v of g.vSegs || g.vLines || []) {
    if (v.y0 !== void 0) line(v.x + ox - v.w / 2, v.y0 + oy, v.w, v.y1 - v.y0, v.color);
    else line(v.x + ox - v.w / 2, y0, v.w, y1 - y0, v.color);
  }
  for (const h of g.hSegs || g.hLines || []) {
    if (h.x0 !== void 0) line(h.x0 + ox, h.y + oy - h.w / 2, h.x1 - h.x0, h.w, h.color);
    else line(x0, h.y + oy - h.w / 2, x1 - x0, h.w, h.color);
  }
}
function paintColumnRules(fb, item) {
  const ox = item.x, oy = item.y;
  for (const rl of item.__columnRules || []) {
    if (rl.w > 0 && rl.y1 > rl.y0) fb.fillRect(rl.x + ox, rl.y0 + oy, rl.w, rl.y1 - rl.y0, parseColor(rl.color, [0, 0, 0, 255]));
  }
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/dom-painter/clip.js
var CLIPPED = /* @__PURE__ */ new Set(["hidden", "scroll", "auto"]);
function clipFor(item, byNode) {
  let node = item.node?.parentNode;
  let x0 = -Infinity, x1 = Infinity, y0 = -Infinity, y1 = Infinity, any = false;
  while (node) {
    const parent = byNode.get(node);
    if (parent) {
      const ov = overflowValue(parent.style || {});
      const c = String((parent.style || {}).contain || "").toLowerCase().split(/\s+/);
      const paintContain = c.includes("paint") || c.includes("content") || c.includes("strict");
      if (CLIPPED.has(ov.x) || paintContain) {
        const r = innerRect(parent);
        if (r.x > x0) x0 = r.x;
        if (r.x + r.width < x1) x1 = r.x + r.width;
        any = true;
      }
      if (CLIPPED.has(ov.y) || paintContain) {
        const r = innerRect(parent);
        if (r.y > y0) y0 = r.y;
        if (r.y + r.height < y1) y1 = r.y + r.height;
        any = true;
      }
    }
    node = node.parentNode;
  }
  return any ? { x0, y0, x1, y1 } : null;
}
function visibleInsideAncestors(item, byNode) {
  const clip = clipFor(item, byNode);
  if (!clip) return true;
  const ix = item.x || 0, iy = item.y || 0;
  const ix0 = Math.max(ix, clip.x0), ix1 = Math.min(ix + (item.width || 0), clip.x1);
  const iy0 = Math.max(iy, clip.y0), iy1 = Math.min(iy + (item.height || 0), clip.y1);
  return ix1 > ix0 && iy1 > iy0;
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/domPainter.js
var import_CssTransform3 = __toESM(require_CssTransform(), 1);
var { computeTransformMatrix, multiplyMatrix: multiplyMatrix2 } = import_CssTransform3.default;
function hasOwnTransform(style = {}) {
  const t = String(style.transform || "").trim().toLowerCase();
  return Boolean(t && t !== "none");
}
function nearestTransformCtx(item, byNode) {
  let node = item && item.node ? item.node.parentNode : null;
  while (node) {
    const li = byNode.get(node);
    if (li && li.style && hasOwnTransform(li.style)) return li;
    node = node.parentNode;
  }
  return null;
}
function clipChainFor(item, byNode) {
  const chain = [];
  let node = item && item.node ? item.node.parentNode : null;
  while (node) {
    const li = byNode.get(node);
    if (li && li.style) {
      const v = String(li.style["clip-path"] || "").trim();
      if (v && v.toLowerCase() !== "none") {
        const clip = parseClipPath(v, Number(li.width) || 1, Number(li.height) || 1);
        if (clip) chain.push({ clip, box: { x: Number(li.x) || 0, y: Number(li.y) || 0 } });
      }
    }
    node = node.parentNode;
  }
  return chain;
}
function accumulate2D(item, byNode) {
  const frames = [];
  let li = item, guard = 0;
  const seen = /* @__PURE__ */ new Set();
  while (li && !seen.has(li) && guard++ < 64) {
    seen.add(li);
    const st = li.style || {};
    const t = String(st.transform || "").trim();
    if (t && t.toLowerCase() !== "none") frames.push(li);
    const node = li.node ? li.node.parentNode : null;
    li = node ? byNode.get(node) : null;
  }
  if (!frames.length) return null;
  let M = [1, 0, 0, 1, 0, 0];
  for (let i = frames.length - 1; i >= 0; i--) {
    const E = frames[i];
    const mE = computeTransformMatrix(E.style, {
      width: Number(E.width) || 0,
      height: Number(E.height) || 0,
      fontSize: 16
    });
    const ex = Number(E.x) || 0, ey = Number(E.y) || 0;
    const PE = [
      mE[0],
      mE[1],
      mE[2],
      mE[3],
      mE[4] + ex * (1 - mE[0]) - ey * mE[2],
      mE[5] + ey * (1 - mE[3]) - ex * mE[1]
    ];
    M = multiplyMatrix2(M, PE);
  }
  return { M };
}
function opacityOf(style = {}) {
  if (!style || !("opacity" in style)) return 1;
  const n2 = parseFloat(style.opacity);
  if (!Number.isFinite(n2)) return 1;
  return Math.min(1, Math.max(0, n2));
}
var groupSurfacePool = [];
function acquireGroupSurface(fb) {
  const scale = fb && fb.scale || 1;
  const cw = Math.max(1, fb.width || 1), ch = Math.max(1, fb.height || 1);
  for (let i = 0; i < groupSurfacePool.length; i++) {
    const e = groupSurfacePool[i];
    if (e.cw === cw && e.ch === ch && e.scale === scale) {
      groupSurfacePool.splice(i, 1);
      e.surf.base.clear([0, 0, 0, 0]);
      return e.surf;
    }
  }
  const base = new Framebuffer(Math.round(cw * scale), Math.round(ch * scale), [0, 0, 0, 0]);
  return new ScaledFramebuffer(base, scale, cw, ch);
}
function releaseGroupSurface(surf) {
  if (!surf) return;
  if (groupSurfacePool.length < 4) {
    groupSurfacePool.push({ cw: surf.width, ch: surf.height, scale: surf.scale, surf });
  }
}
function isInSubtree(m, root) {
  if (!m || !root || !m.node || !root.node) return false;
  let n2 = m.node.parentNode, g = 0;
  while (n2 && g++ < 64) {
    if (n2 === root.node) return true;
    n2 = n2.parentNode;
  }
  return false;
}
function computeOccludedSet(ordered, paintSet, isGroupRoot, ancestorInfo) {
  const occluded = /* @__PURE__ */ new Set();
  const inGroup = /* @__PURE__ */ new Set();
  for (const item of ordered) {
    if (isGroupRoot(item)) {
      for (const d of ordered) if (d !== item && isInSubtree(d, item)) inGroup.add(d);
    }
  }
  const occluders = [];
  const isCovered = (x0, y0, x1, y1) => {
    for (const o of occluders) {
      if (o.x0 <= x0 && o.y0 <= y0 && o.x1 >= x1 && o.y1 >= y1) return true;
    }
    return false;
  };
  for (let i = ordered.length - 1; i >= 0; i--) {
    const item = ordered[i];
    if (paintSet && !paintSet.has(item)) continue;
    if (inGroup.has(item) || isGroupRoot(item)) continue;
    const st = item.style || {};
    const vis = String(st.visibility || "visible").trim().toLowerCase();
    if (vis === "hidden" || vis === "collapse") continue;
    const ix = Number(item.x) || 0, iy = Number(item.y) || 0;
    const iw = Number(item.width) || 0, ih = Number(item.height) || 0;
    if (iw <= 0 || ih <= 0) continue;
    const info = ancestorInfo(item);
    if (info.accum2d || info.boxScene) continue;
    let spread = false;
    try {
      spread = parseBoxShadows(st).some((s) => !s.inset);
      if (!spread && item.kind === "#text") spread = parseTextShadows(st).length > 0;
      if (!spread) {
        const fl = parseFilterList(st.filter);
        spread = fl.length > 0 && fl.every((f) => FILTER_FUNCTIONS.has(f.name));
      }
    } catch (_) {
      spread = true;
    }
    if (!spread && isCovered(ix, iy, ix + iw, iy + ih)) {
      occluded.add(item);
      continue;
    }
    if (spread) continue;
    if (opacityOf(st) < 1) continue;
    if (String(st["mix-blend-mode"] || "normal").trim().toLowerCase() !== "normal") continue;
    if (st["clip-path"] || st.clipPath || st["mask-image"] || st.maskImage) continue;
    if (borderWidth(st, item.kind) !== 0) continue;
    const bg = parseColor(st["background-color"], null);
    if (!bg || bg[3] < 255) continue;
    const radii = borderRadii(st, iw, ih);
    if (radii.tl[0] > 0 || radii.tl[1] > 0 || radii.tr[0] > 0 || radii.tr[1] > 0 || radii.br[0] > 0 || radii.br[1] > 0 || radii.bl[0] > 0 || radii.bl[1] > 0) continue;
    if (info.clipChain && info.clipChain.length) continue;
    const clip = info.oclip;
    if (clip && (ix < clip.x0 || iy < clip.y0 || ix + iw > clip.x1 || iy + ih > clip.y1)) continue;
    occluders.push({ x0: ix, y0: iy, x1: ix + iw, y1: iy + ih });
    if (occluders.length > 256) occluders.shift();
  }
  return occluded;
}
function paintLayout(fb, layout, canvas = {}, options = {}) {
  const textures = [...canvas.textures || []];
  const used = /* @__PURE__ */ new Set();
  const vp = options.viewport;
  let paintSet = null;
  let workList = layout;
  let byNode;
  if (vp && options.spatialIndex) {
    const si = options.spatialIndex.ensure(layout, options.layoutGeneration ?? 0);
    byNode = si.byNode;
    const { visible, paintSet: ps } = si.queryVisible(vp, options.viewportMargin || 0);
    paintSet = ps;
    const context = si.ancestorContext(visible, paintSet);
    workList = [...visible, ...context];
  } else {
    byNode = new Map(layout.map((item) => [item.node, item]));
    if (vp) {
      paintSet = /* @__PURE__ */ new Set();
      const vx0 = vp.x || 0, vy0 = vp.y || 0;
      const vx1 = vx0 + (vp.width || 800), vy1 = vy0 + (vp.height || 600);
      const margin = options.viewportMargin || 0;
      const visible = [];
      for (const item of layout) {
        const st = item.style || {};
        const pos = String(st.position || "static").toLowerCase();
        const t = String(st.transform || "").trim().toLowerCase();
        if (pos === "fixed" || pos === "sticky" || t && t !== "none") {
          visible.push(item);
          paintSet.add(item);
          continue;
        }
        const ix = Number(item.x) || 0, iy = Number(item.y) || 0;
        const iw = Number(item.width) || 0, ih = Number(item.height) || 0;
        if (ix < vx1 + margin && ix + iw > vx0 - margin && iy < vy1 + margin && iy + ih > vy0 - margin) {
          visible.push(item);
          paintSet.add(item);
        }
      }
      const context = /* @__PURE__ */ new Set();
      for (const item of visible) {
        let n2 = item.node ? item.node.parentNode : null, g = 0;
        while (n2 && g++ < 64) {
          const anc = byNode.get(n2);
          if (anc && !paintSet.has(anc)) context.add(anc);
          n2 = n2.parentNode;
        }
      }
      workList = [...visible, ...context];
    }
  }
  if (options.paintSet instanceof Set) paintSet = options.paintSet;
  const textParents = /* @__PURE__ */ new Set();
  for (const item of workList) {
    if (item.kind === "#text" && item.node && item.node.parentNode) textParents.add(item.node.parentNode);
  }
  const hasKid = /* @__PURE__ */ new Set();
  for (const it of workList) {
    let n2 = it.node ? it.node.parentNode : null, g = 0;
    while (n2 && g++ < 64) {
      const anc = byNode.get(n2);
      if (anc && anc !== it) hasKid.add(anc);
      n2 = n2.parentNode;
    }
  }
  const isGroupRoot = (it) => opacityOf(it.style) < 1 && hasKid.has(it);
  const ordered = paintOrder(workList);
  const ancCache = /* @__PURE__ */ new Map();
  function ancestorInfo(item) {
    let info = ancCache.get(item);
    if (info) return info;
    const transformCtx = nearestTransformCtx(item, byNode);
    const mayHave3D = transformCtx || hasOwnTransform(item.style);
    info = {
      accum2d: accumulate2D(item, byNode),
      clipChain: clipChainFor(item, byNode),
      oclip: clipFor(item, byNode),
      transformCtx,
      // B"H 2026-10-09: computeScene3D is expensive; skip when no transform
      // in play. Text roots the scene at the transformed ancestor; boxes use
      // the item itself (computeScene3D walks ancestors internally).
      textScene: mayHave3D ? computeScene3D(transformCtx || item, byNode) : null,
      boxScene: mayHave3D ? computeScene3D(item, byNode) : null
    };
    ancCache.set(item, info);
    return info;
  }
  function paintOne(destFb, item, forceOpacity) {
    const vis = String(item.style?.visibility || "visible").trim().toLowerCase();
    if (vis === "hidden" || vis === "collapse") return;
    if (options.simplePaint) {
      if (item.kind === "#text") {
        paintTextItem(destFb, item);
      } else {
        paintBox(destFb, item, pickCanvasTexture(item, textures, used), textures, textParents);
      }
      return;
    }
    const info = ancestorInfo(item);
    const accum2d = info.accum2d;
    if (!accum2d && !visibleInsideAncestors(item, byNode)) return;
    const fx = { clipChain: info.clipChain, accum2d, forceOpacity };
    const oclip = info.oclip;
    if (oclip && typeof destFb.pushClip === "function") destFb.pushClip(oclip);
    try {
      if (item.kind === "#text") {
        paintWithEffects(destFb, item, (f, it) => paintTextItem(f, it), info.transformCtx, fx, info.textScene);
      } else {
        paintWithEffects(
          destFb,
          item,
          (f, it) => paintBox(f, it, pickCanvasTexture(it, textures, used), textures, textParents),
          null,
          fx,
          info.boxScene
        );
      }
    } finally {
      if (oclip && typeof destFb.popClip === "function") destFb.popClip();
    }
  }
  function paintGroupSurface(root) {
    const surf = acquireGroupSurface(fb);
    const scale = surf.scale || 1;
    let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
    let fullBlit = false;
    const trackBounds = (m) => {
      const ix = Number(m.x) || 0, iy = Number(m.y) || 0;
      const iw = Number(m.width) || 0, ih = Number(m.height) || 0;
      let pad = 0;
      const st = m.style || {};
      try {
        for (const sh of parseBoxShadows(st)) {
          if (sh.inset) continue;
          const e = Math.abs(sh.dx || 0) + Math.abs(sh.dy || 0) + (sh.spread || 0) + (sh.blur || 0) * 2 + 8;
          if (e > pad) pad = e;
        }
        if (m.kind === "#text") {
          for (const sh of parseTextShadows(st)) {
            const e = Math.abs(sh.dx || 0) + Math.abs(sh.dy || 0) + (sh.blur || 0) * 2 + 8;
            if (e > pad) pad = e;
          }
        }
        const fl = parseFilterList(st.filter);
        if (fl.length && fl.every((f) => FILTER_FUNCTIONS.has(f.name))) pad += filterPadPx(fl) + 8;
      } catch (_) {
      }
      const info = ancestorInfo(m);
      if (info.accum2d || info.boxScene) fullBlit = true;
      if (ix - pad < bx0) bx0 = ix - pad;
      if (iy - pad < by0) by0 = iy - pad;
      if (ix + iw + pad > bx1) bx1 = ix + iw + pad;
      if (iy + ih + pad > by1) by1 = iy + ih + pad;
    };
    const lskip = /* @__PURE__ */ new Set();
    for (const m of ordered) {
      if (m !== root && !isInSubtree(m, root)) continue;
      if (lskip.has(m)) continue;
      if (m !== root && isGroupRoot(m)) {
        const inner = paintGroupSurface(m);
        try {
          const ib = inner.__bounds;
          const op = opacityOf(m.style);
          if (ib) {
            surf.blitFrom(inner.base, 0, 0, {
              srcRect: {
                x0: Math.max(0, Math.floor(ib.x0 * scale)),
                y0: Math.max(0, Math.floor(ib.y0 * scale)),
                x1: Math.min(inner.base.width, Math.ceil(ib.x1 * scale)),
                y1: Math.min(inner.base.height, Math.ceil(ib.y1 * scale))
              },
              alphaScale: op
            });
            if (ib.x0 < bx0) bx0 = ib.x0;
            if (ib.y0 < by0) by0 = ib.y0;
            if (ib.x1 > bx1) bx1 = ib.x1;
            if (ib.y1 > by1) by1 = ib.y1;
            if (ib.full) fullBlit = true;
          } else {
            surf.blitFrom(inner.base, 0, 0, { alphaScale: op });
            fullBlit = true;
          }
        } finally {
          releaseGroupSurface(inner);
        }
        for (const d of ordered) if (d !== m && isInSubtree(d, m)) lskip.add(d);
      } else {
        trackBounds(m);
        paintOne(surf, m, m === root ? 1 : void 0);
      }
    }
    if (!fullBlit && bx1 > bx0 && by1 > by0) {
      surf.__bounds = { x0: bx0, y0: by0, x1: bx1, y1: by1, full: false };
    } else {
      surf.__bounds = null;
    }
    return surf;
  }
  const occluded = options.occlusion === false ? /* @__PURE__ */ new Set() : computeOccludedSet(ordered, paintSet, isGroupRoot, ancestorInfo);
  const skipped = /* @__PURE__ */ new Set();
  for (const item of ordered) {
    if (skipped.has(item)) continue;
    if (paintSet && !paintSet.has(item)) continue;
    if (occluded.has(item)) continue;
    if (isGroupRoot(item)) {
      const gs = paintGroupSurface(item);
      try {
        const b = gs.__bounds;
        const gscale = gs.scale || 1;
        const op = opacityOf(item.style);
        if (b) {
          fb.blitFrom(gs.base, 0, 0, {
            srcRect: {
              x0: Math.max(0, Math.floor(b.x0 * gscale)),
              y0: Math.max(0, Math.floor(b.y0 * gscale)),
              x1: Math.min(gs.base.width, Math.ceil(b.x1 * gscale)),
              y1: Math.min(gs.base.height, Math.ceil(b.y1 * gscale))
            },
            alphaScale: op
          });
        } else {
          fb.blitFrom(gs.base, 0, 0, { alphaScale: op });
        }
      } finally {
        releaseGroupSurface(gs);
      }
      for (const d of ordered) if (d !== item && isInSubtree(d, item)) skipped.add(d);
      continue;
    }
    paintOne(fb, item);
  }
  for (const item of workList) {
    if (paintSet && !paintSet.has(item)) continue;
    if (shouldShowScrollbar(item)) paintScrollbar(fb, item);
  }
}
function zTierOf(style = {}) {
  const positioned = String(style.position || "static").trim().toLowerCase() !== "static";
  const raw = String(style["z-index"] ?? "auto").trim().toLowerCase();
  if (!positioned || raw === "auto" || raw === "") return null;
  const n2 = parseInt(raw, 10);
  return Number.isFinite(n2) ? n2 : null;
}
function paintOrder(layout) {
  if (!layout || !layout.length) return layout;
  let need = false;
  for (const it of layout) if (zTierOf(it.style) !== null) {
    need = true;
    break;
  }
  if (!need) return layout;
  const seen = /* @__PURE__ */ new Set(), ordered = [];
  const key = (it) => {
    const z = zTierOf(it.style);
    const positioned = String(it.style?.position || "static").trim().toLowerCase() !== "static";
    return [z === null ? 0 : z, positioned ? 1 : 0];
  };
  const visit = (it) => {
    if (!it || seen.has(it)) return;
    seen.add(it);
    ordered.push(it);
    const kids = (it.children || []).map((k, i) => [k, i]).sort((a, b) => {
      const ka = key(a[0]), kb = key(b[0]);
      return ka[0] - kb[0] || ka[1] - kb[1] || a[1] - b[1];
    });
    for (const [k] of kids) visit(k);
  };
  visit(layout[0]);
  for (const it of layout) if (!seen.has(it)) {
    seen.add(it);
    ordered.push(it);
  }
  return ordered;
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/htmlParser.js
var VOID_ELEMENTS = /* @__PURE__ */ new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);
var RAW_TEXT_ELEMENTS = /* @__PURE__ */ new Set(["script", "style", "textarea"]);
var ENTITY_MAP = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " "
};
var ENTITY_RE = /&(amp|lt|gt|quot|apos|nbsp);|&#(\d+);|&#x([0-9a-fA-F]+);/g;
function decodeEntities(text) {
  const s = String(text || "");
  if (s.indexOf("&") < 0) return s;
  return s.replace(ENTITY_RE, (m, named, dec, hex) => {
    if (named) return ENTITY_MAP["&" + named + ";"];
    if (dec) return String.fromCodePoint(Number(dec) || 63);
    return String.fromCodePoint(parseInt(hex, 16) || 63);
  });
}
function parseAttributes(attrText) {
  const attrs = {};
  const re = /([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = re.exec(attrText || "")) !== null) {
    const name = m[1].toLowerCase();
    const value = m[2] !== void 0 ? m[2] : m[3] !== void 0 ? m[3] : m[4] !== void 0 ? m[4] : "";
    if (!(name in attrs)) attrs[name] = decodeEntities(value);
  }
  return attrs;
}
var CLOSE_RE_CACHE = /* @__PURE__ */ new Map();
function closeReFor(name) {
  let re = CLOSE_RE_CACHE.get(name);
  if (!re) {
    re = new RegExp(`</${name}\\s*>`, "i");
    if (CLOSE_RE_CACHE.size < 64) CLOSE_RE_CACHE.set(name, re);
  }
  return re;
}
function isTagName(s) {
  if (!s) return false;
  const c0 = s.charCodeAt(0);
  if (!(c0 >= 65 && c0 <= 90 || c0 >= 97 && c0 <= 122)) return false;
  for (let i = 1; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c >= 65 && c <= 90 || c >= 97 && c <= 122 || c >= 48 && c <= 57 || c === 95 || c === 45) continue;
    return false;
  }
  return true;
}
function makeElement(tagName, attributes) {
  return {
    tagName,
    localName: tagName,
    nodeType: 1,
    attributes,
    children: [],
    textContent: "",
    style: {}
  };
}
function makeText(text) {
  return {
    tagName: "#text",
    localName: "#text",
    nodeType: 3,
    attributes: {},
    children: [],
    textContent: text,
    style: {}
  };
}
function parseHtmlToDom(html) {
  const src = String(html || "");
  const clean = src.replace(/<!DOCTYPE[^>]*>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  const root = makeElement("body", {});
  const stack = [root];
  let pos = 0;
  const len = clean.length;
  while (pos < len) {
    const lt = clean.indexOf("<", pos);
    if (lt < 0) {
      appendText(stack, clean.slice(pos));
      break;
    }
    if (lt > pos) appendText(stack, clean.slice(pos, lt));
    const gt = clean.indexOf(">", lt + 1);
    if (gt < 0) break;
    let ts = lt + 1, te = gt;
    while (ts < te && clean.charCodeAt(ts) <= 32) ts++;
    while (te > ts && clean.charCodeAt(te - 1) <= 32) te--;
    pos = gt + 1;
    if (ts >= te) continue;
    const firstCh = clean[ts];
    if (firstCh === "/") {
      let ns2 = ts + 1, ne2 = ns2;
      while (ne2 < te && clean.charCodeAt(ne2) > 32) ne2++;
      const name2 = clean.slice(ns2, ne2).toLowerCase();
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].localName === name2) {
          stack.length = i;
          break;
        }
      }
      continue;
    }
    if (firstCh === "?" || firstCh === "!") continue;
    let selfClosing = false;
    if (clean.charCodeAt(te - 1) === 47) {
      selfClosing = true;
      te--;
      while (te > ts && clean.charCodeAt(te - 1) <= 32) te--;
    }
    let ns = ts, ne = ns;
    while (ne < te && clean.charCodeAt(ne) > 32) ne++;
    const name = clean.slice(ns, ne).toLowerCase();
    let attrText = "";
    if (ne < te) {
      let as = ne;
      while (as < te && clean.charCodeAt(as) <= 32) as++;
      attrText = clean.slice(as, te);
    }
    if (!isTagName(name)) continue;
    if (name === "textarea") {
      const el2 = makeElement(name, parseAttributes(attrText));
      stack[stack.length - 1].children.push(el2);
      const closeRe = closeReFor(name);
      const rest = clean.slice(pos);
      const cm = closeRe.exec(rest);
      let raw = "";
      if (cm) {
        raw = rest.slice(0, cm.index);
        pos += cm.index + cm[0].length;
      } else {
        raw = rest;
        pos = len;
      }
      if (raw) el2.children.push(makeText(decodeEntities(raw)));
      continue;
    }
    if (RAW_TEXT_ELEMENTS.has(name)) {
      const closeRe = closeReFor(name);
      const rest = clean.slice(pos);
      const cm = closeRe.exec(rest);
      if (cm) pos += cm.index + cm[0].length;
      else pos = len;
      continue;
    }
    if (name === "html") continue;
    if (name === "head" || name === "title" || name === "meta" || name === "link") {
      if (!VOID_ELEMENTS.has(name) && !selfClosing) {
        let depth = 1;
        while (pos < len && depth > 0) {
          const nlt = clean.indexOf("<", pos);
          if (nlt < 0) {
            pos = len;
            break;
          }
          const ngt = clean.indexOf(">", nlt + 1);
          if (ngt < 0) {
            pos = len;
            break;
          }
          const nInner = clean.slice(nlt + 1, ngt).trim().toLowerCase();
          pos = ngt + 1;
          const nName = nInner.split(/[\s/>]/, 1)[0];
          if (RAW_TEXT_ELEMENTS.has(nName) && !nInner.startsWith("/")) {
            const closeRe = closeReFor(nName);
            const rest = clean.slice(pos);
            const cm = closeRe.exec(rest);
            if (cm) pos += cm.index + cm[0].length;
            else pos = len;
            continue;
          }
          if (nInner === name || nInner.startsWith(name + " ") || nInner.startsWith(name + ">")) depth++;
          else if (nInner === "/" + name) depth--;
        }
      }
      continue;
    }
    if (name === "body") {
      const attrs = parseAttributes(attrText);
      Object.assign(stack[stack.length - 1].attributes, attrs);
      continue;
    }
    const el = makeElement(name, parseAttributes(attrText));
    stack[stack.length - 1].children.push(el);
    if (!VOID_ELEMENTS.has(name) && !selfClosing) stack.push(el);
  }
  return root;
}
function appendText(stack, text) {
  const decoded = decodeEntities(text);
  if (!decoded.trim()) {
    if (!decoded.includes("\n") && decoded.length > 0) {
      stack[stack.length - 1].children.push(makeText(" "));
    }
    return;
  }
  const collapsed = decoded.replace(/[ \t\r\f\v]+/g, " ");
  stack[stack.length - 1].children.push(makeText(collapsed));
}
function extractStyleText(html) {
  return [...String(html || "").matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n");
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/virtualPngRenderer.js
var DEFAULT_MAX_FULL_HEIGHT = 16e3;
var MAX_DIM = 8192;
function clampDim(v, fallback) {
  const n2 = Math.floor(Number(v) || fallback);
  return Math.max(1, Math.min(MAX_DIM, n2));
}
function measureDocumentHeight(layout) {
  let max = 0;
  for (let i = 1; i < layout.length; i++) {
    const item = layout[i];
    if (!item) continue;
    const bottom = (Number(item.y) || 0) + (Number(item.height) || 0);
    if (bottom > max) max = bottom;
  }
  return max;
}
function resolveDom(snapshot = {}) {
  if (snapshot.dom) return snapshot.dom;
  const html = String(snapshot.html || "").trim();
  if (html) {
    try {
      return parseHtmlToDom(html);
    } catch {
    }
  }
  return {
    tagName: "body",
    localName: "body",
    attributes: {},
    children: snapshot.text ? [
      {
        tagName: "p",
        localName: "p",
        attributes: {},
        children: [],
        textContent: String(snapshot.text),
        style: {}
      }
    ] : [],
    textContent: "",
    style: {}
  };
}
function renderVirtualSnapshotPng(snapshot = {}, options = {}) {
  const width = clampDim(options.width, 960);
  const viewportHeight = clampDim(options.height, 640);
  const maxFullHeight = Math.max(1, Math.min(16e3, Math.floor(Number(options.maxFullHeight) || DEFAULT_MAX_FULL_HEIGHT)));
  const cssText = snapshot.cssText || extractStyleText(snapshot.html || "");
  const dom = resolveDom(snapshot);
  const scale = Number(options.scale || 1);
  const layoutOptions = {
    cssText,
    time: Math.max(0, Number(options.time) || 0),
    stateChanges: Array.isArray(options.stateChanges) ? options.stateChanges : [],
    // B"H 2026-10-09: media plumbing — lets @media print /
    // (prefers-reduced-motion: reduce) / (forced-colors: active) match.
    mediaType: options.mediaType || options.media,
    reducedMotion: options.reducedMotion,
    forcedColors: options.forcedColors
  };
  let height = viewportHeight;
  let contentHeight = null;
  let capped = false;
  if (options.fullPage) {
    const probe = buildLayoutTree(dom, { width, height: maxFullHeight }, { ...layoutOptions });
    contentHeight = Math.ceil(measureDocumentHeight(probe));
    capped = contentHeight > maxFullHeight;
    height = Math.max(viewportHeight, Math.min(maxFullHeight, contentHeight));
  }
  const layout = buildLayoutTree(dom, { width, height }, { ...layoutOptions });
  const bodyBg = bodyBackground(layout);
  const { surface } = makeSupersampledSurface(width, height, scale, bodyBg.color);
  if (bodyBg.gradient) surface.gradientRect(0, 0, width, height, bodyBg.gradient, bodyBg.color);
  paintLayout(surface, layout, snapshot.canvas || {});
  const png = surface.toPngBuffer();
  return {
    backend: "merkava-software-webgl-dom",
    width,
    height,
    fullPage: Boolean(options.fullPage),
    contentHeight,
    capped,
    mimeType: "image/png",
    bytes: png.length,
    dataUrl: dataUrlFromPng(png),
    note: "Rendered from Merkava DOM layout + source CSS + software framebuffer + 2D/WebGL command painters.",
    proof: analyzePixels(surface, snapshot, cssText, bodyBg.color)
  };
}
function bodyBackground(layout = []) {
  const body = layout.find((item) => item && item.kind === "body") || layout[0] || {};
  return background(body.style || {}, { kind: "body" });
}
function analyzePixels(fb, snapshot, cssText, bgColor = [8, 9, 14, 255]) {
  return {
    nonBackgroundPixels: fb.countNonBackground(bgColor),
    canvasTextures: snapshot.canvas?.textures?.length || 0,
    canvasCommands: snapshot.canvas?.commands?.length || 0,
    cssBytes: String(cssText || "").length,
    sampleTopLeft: fb.sample(10, 10),
    sampleCenter: fb.sample(Math.floor(fb.width / 2), Math.floor(fb.height / 2)),
    antialiasing: "1x-stress-proof-mode"
  };
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/inputSimulator.js
import { writeFileSync } from "fs";
var FOCUSABLE_RE = /^(a|button|input|select|textarea)$/;
var simIdCounter = 1;
function isFocusable(node) {
  if (!node || node.nodeType !== 1) return false;
  const tag = node.localName;
  if (node.attributes?.tabindex != null) return true;
  if (tag === "a") return node.attributes?.href != null;
  if (tag === "input") return (node.attributes?.type || "text").toLowerCase() !== "hidden";
  return FOCUSABLE_RE.test(tag);
}
function matchesSimpleSelector(node, selector) {
  const s = String(selector).trim();
  if (!node || node.nodeType !== 1) return false;
  if (s.startsWith("#")) return node.attributes?.id === s.slice(1);
  if (s.startsWith(".")) {
    const cls = String(node.attributes?.class || "").split(/\s+/);
    return cls.includes(s.slice(1));
  }
  return node.localName === s.toLowerCase();
}
var InputSimulator = class {
  constructor(html, options = {}) {
    this.width = Math.max(1, Number(options.width) || 960);
    this.height = Math.max(1, Number(options.height) || 700);
    this._html = String(html);
    this._cssText = extractStyleText(this._html) || "";
    this._dom = parseHtmlToDom(this._html);
    this.docState = { activeElement: null, __merkavaTargetId: null, documentElement: null };
    this._handlers = /* @__PURE__ */ new Map();
    this._eventLog = [];
    this._pool = { type: "", target: null, clientX: 0, clientY: 0, key: "", ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, defaultPrevented: false, preventDefault() {
      this.defaultPrevented = true;
    } };
    this._mouse = { x: 0, y: 0, down: false, downX: 0, downY: 0, downNode: null, dragMoves: [] };
    this._lastClick = { t: 0, node: null };
    this._focused = null;
    this.lastResult = null;
    this._autoRender = true;
    this._indexTree(this._dom, null);
    this.docState.documentElement = this._dom;
  }
  /** Disable/enable automatic re-render after each interaction (for stress loops). */
  quiet(v = true) {
    this._autoRender = !v;
    return this;
  }
  _maybeRender() {
    if (this._autoRender) this.render();
  }
  _indexTree(node, parent) {
    if (!node) return;
    node.__simParent = parent || null;
    if (node.nodeType === 1) {
      node.__simId = simIdCounter++;
      node.__merkavaState = node.__merkavaState || {};
      node.ownerDocument = this.docState;
      if (node.attributes && !("value" in node) && (node.localName === "input" || node.localName === "textarea")) {
        node.value = node.attributes.value || "";
      }
    }
    for (const c of node.children || []) this._indexTree(c, node);
  }
  _walk(node, out = []) {
    if (!node) return out;
    out.push(node);
    for (const c of node.children || []) this._walk(c, out);
    return out;
  }
  _nodeBySimId(id) {
    return this._walk(this._dom).find((n2) => n2.__simId === id) || null;
  }
  /* ---------------- events ---------------- */
  /** Register a handler: on('click', '#buy', fn). */
  on(type, selector, fn) {
    const key = `${type}:${selector}`;
    if (!this._handlers.has(key)) this._handlers.set(key, []);
    this._handlers.get(key).push(fn);
    return this;
  }
  _dispatch(type, targetNode, props = {}) {
    const e = this._pool;
    e.type = type;
    e.target = targetNode;
    e.clientX = props.clientX ?? 0;
    e.clientY = props.clientY ?? 0;
    e.key = props.key ?? "";
    e.ctrlKey = !!props.ctrlKey;
    e.shiftKey = !!props.shiftKey;
    e.altKey = !!props.altKey;
    e.metaKey = !!props.metaKey;
    e.defaultPrevented = false;
    this._eventLog.push({ type, node: targetNode ? targetNode.attributes?.id || targetNode.localName : null, key: e.key || void 0 });
    if (!targetNode) return e;
    let node = targetNode;
    while (node) {
      for (const [key, fns] of this._handlers) {
        const idx = key.indexOf(":");
        const t = key.slice(0, idx), sel = key.slice(idx + 1);
        if (t !== type) continue;
        if (matchesSimpleSelector(node, sel)) {
          for (const fn of fns) {
            try {
              fn(e, node);
            } catch {
            }
          }
        }
      }
      node = node.__simParent || null;
    }
    return e;
  }
  get eventLog() {
    return this._eventLog;
  }
  clearLog() {
    this._eventLog = [];
    return this;
  }
  /* ---------------- layout + hit testing ---------------- */
  _layoutItems() {
    return buildLayoutTree(this._dom, { width: this.width, height: this.height }, { cssText: this._cssText });
  }
  _elementForItem(item) {
    let node = item?.node;
    if (!node) return null;
    if (node.nodeType === 3) node = node.__simParent || node.parentNode || null;
    if (node && node.__simId) return this._nodeBySimId(node.__simId);
    return null;
  }
  /** Topmost element at viewport coordinates. */
  hitTest(x, y) {
    const items = this._layoutItems();
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      if (!it || it.width <= 0 || it.height <= 0) continue;
      if (x >= it.x && x <= it.x + it.width && y >= it.y && y <= it.y + it.height) {
        const el = this._elementForItem(it);
        if (el) return el;
      }
    }
    return null;
  }
  /** Center of a node matched by selector (for driving clicks/hovers). */
  centerOf(selector) {
    const target = this._walk(this._dom).find((n2) => n2.nodeType === 1 && matchesSimpleSelector(n2, selector));
    if (!target) return null;
    const items = this._layoutItems();
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      const el = this._elementForItem(it);
      if (el === target && it.width > 0 && it.height > 0) {
        return { x: Math.round(it.x + it.width / 2), y: Math.round(it.y + it.height / 2), node: target };
      }
    }
    return null;
  }
  /* ---------------- mouse ---------------- */
  _setHover(node) {
    const prev = this._walk(this._dom).find((n2) => n2.__merkavaState?.hover);
    if (prev === node) return;
    if (prev) {
      prev.__merkavaState.hover = false;
      this._dispatch("mouseout", prev);
      this._dispatch("mouseleave", prev);
    }
    if (node) {
      node.__merkavaState.hover = true;
      this._dispatch("mouseover", node);
      this._dispatch("mouseenter", node);
    }
  }
  /** Move the mouse; hover states + mousemove fire. Returns hovered node. */
  moveMouse(x, y) {
    const node = this.hitTest(x, y);
    this._setHover(node);
    this._mouse.x = x;
    this._mouse.y = y;
    if (node) this._dispatch("mousemove", node, { clientX: x, clientY: y });
    if (this._mouse.down) this._mouse.dragMoves.push({ x, y });
    this._maybeRender();
    return node;
  }
  hover(x, y) {
    return this.moveMouse(x, y);
  }
  /** Tooltip text for the currently hovered element (title attribute). */
  tooltip() {
    const hov = this._walk(this._dom).find((n2) => n2.__merkavaState?.hover);
    return hov?.attributes?.title || "";
  }
  mousedown(x, y, button = 0) {
    const node = this.hitTest(x, y);
    this._mouse.down = true;
    this._mouse.downX = x;
    this._mouse.downY = y;
    this._mouse.downNode = node;
    this._mouse.dragMoves = [{ x, y }];
    if (node) {
      node.__merkavaState.active = true;
      this._dispatch("mousedown", node, { clientX: x, clientY: y });
      if (isFocusable(node)) this.focus(node);
    }
    this._maybeRender();
    return node;
  }
  mouseup(x, y, button = 0) {
    const node = this.hitTest(x, y);
    const wasDown = this._mouse.downNode;
    this._mouse.down = false;
    if (wasDown) wasDown.__merkavaState.active = false;
    if (node) this._dispatch("mouseup", node, { clientX: x, clientY: y });
    let clicked = null;
    if (node && wasDown && node === wasDown) {
      clicked = node;
      const now = Date.now();
      const isDbl = this._lastClick.node === node && now - this._lastClick.t < 500;
      this._dispatch("click", node, { clientX: x, clientY: y });
      if (isDbl) {
        this._dispatch("dblclick", node, { clientX: x, clientY: y });
        this._lastClick = { t: 0, node: null };
      } else this._lastClick = { t: now, node };
    } else {
      this._lastClick = { t: 0, node: null };
    }
    if (this._mouse.dragMoves.length > 2 && wasDown) {
      this._dispatch("dragend", wasDown, { clientX: x, clientY: y });
    }
    this._mouse.downNode = null;
    this._mouse.dragMoves = [];
    this._maybeRender();
    return clicked;
  }
  /** Full click: mousedown + mouseup. Returns the clicked node (or null). */
  click(x, y) {
    this.mousedown(x, y);
    return this.mouseup(x, y);
  }
  dblclick(x, y) {
    this._lastClick = { t: 0, node: null };
    const q = this._autoRender;
    this._autoRender = false;
    this.click(x, y);
    this.click(x, y);
    this._autoRender = q;
    this._maybeRender();
  }
  /** Drag from (x1,y1) to (x2,y2) in steps. Returns recorded move points. */
  drag(x1, y1, x2, y2, steps = 5) {
    const node = this.mousedown(x1, y1);
    if (node) this._dispatch("dragstart", node, { clientX: x1, clientY: y1 });
    const moves = [];
    for (let i = 1; i <= steps; i++) {
      const x = Math.round(x1 + (x2 - x1) * i / steps);
      const y = Math.round(y1 + (y2 - y1) * i / steps);
      const n2 = this.hitTest(x, y);
      this._setHover(n2);
      if (node) this._dispatch("drag", node, { clientX: x, clientY: y });
      moves.push({ x, y });
      this._mouse.dragMoves.push({ x, y });
    }
    this.mouseup(x2, y2);
    return moves;
  }
  /* ---------------- focus + keyboard ---------------- */
  focusable() {
    return this._walk(this._dom).filter(isFocusable);
  }
  focus(node) {
    const el = typeof node === "string" ? this._walk(this._dom).find((n2) => n2.nodeType === 1 && matchesSimpleSelector(n2, node)) : node;
    if (!el || !isFocusable(el)) return false;
    if (this._focused === el) return true;
    if (this._focused) this._dispatch("blur", this._focused);
    this._focused = el;
    this.docState.activeElement = el;
    this._dispatch("focus", el);
    this._maybeRender();
    return true;
  }
  blur() {
    if (this._focused) {
      this._dispatch("blur", this._focused);
      this._focused = null;
    }
    this.docState.activeElement = null;
    this._maybeRender();
  }
  get focused() {
    return this._focused;
  }
  /** Tab order traversal. shift=true goes backward. */
  tab(shift = false) {
    const list = this.focusable();
    if (!list.length) return null;
    let idx = list.indexOf(this._focused);
    idx = idx < 0 ? shift ? list.length - 1 : 0 : (idx + (shift ? -1 : 1) + list.length) % list.length;
    this.focus(list[idx]);
    this._dispatch("keydown", list[idx], { key: "Tab", shiftKey: shift });
    return list[idx];
  }
  keyDown(key, mods = {}) {
    const t = this._focused || this._dom;
    return this._dispatch("keydown", t.nodeType === 1 ? t : null, { key, ...mods });
  }
  keyUp(key, mods = {}) {
    const t = this._focused || this._dom;
    return this._dispatch("keyup", t.nodeType === 1 ? t : null, { key, ...mods });
  }
  /**
   * Press a key: keydown -> (keypress + input for printable) -> keyup.
   * Handles text entry, Backspace, Enter (submit), Tab (traversal).
   */
  press(key, mods = {}) {
    const target = this._focused && this._focused.nodeType === 1 ? this._focused : null;
    const kd = this.keyDown(key, mods);
    let result = { key, prevented: kd.defaultPrevented };
    if (!kd.defaultPrevented) {
      if (key === "Tab") {
        this.tab(!!mods.shiftKey);
      } else if (key === "Enter") {
        if (target) this._dispatch("keypress", target, { key, ...mods });
        this._submitFrom(target);
      } else if (key === "Backspace") {
        if (target && (target.localName === "input" || target.localName === "textarea")) {
          target.value = String(target.value || "").slice(0, -1);
          this._dispatch("input", target, { key, ...mods });
        }
      } else if (key.length === 1 && target && (target.localName === "input" || target.localName === "textarea") && !mods.ctrlKey && !mods.metaKey) {
        target.value = String(target.value || "") + key;
        this._dispatch("keypress", target, { key, ...mods });
        this._dispatch("input", target, { key, ...mods });
      } else if (target) {
        this._dispatch("keypress", target, { key, ...mods });
      }
    }
    this.keyUp(key, mods);
    this._maybeRender();
    return result;
  }
  /** Type a string into the focused (or selected) field. */
  type(text, selector) {
    if (selector) this.focus(selector);
    for (const ch of String(text)) this.press(ch);
    return this._focused ? this._focused.value : "";
  }
  _submitFrom(node) {
    let form = node;
    while (form && form.localName !== "form") form = form.__simParent;
    if (!form) return false;
    const data = {};
    for (const n2 of this._walk(form)) {
      if (n2.nodeType === 1 && n2.attributes?.name && (n2.localName === "input" || n2.localName === "textarea" || n2.localName === "select")) {
        data[n2.attributes.name] = n2.value ?? n2.attributes.value ?? "";
      }
    }
    this._lastSubmit = { form, data };
    const e = this._dispatch("submit", form);
    return !e.defaultPrevented;
  }
  get lastSubmit() {
    return this._lastSubmit || null;
  }
  /* ---------------- render ---------------- */
  render() {
    this.lastResult = renderVirtualSnapshotPng(
      { dom: this._dom, cssText: this._cssText },
      { width: this.width, height: this.height }
    );
    return this.lastResult;
  }
  savePng(path2) {
    if (!this.lastResult) this.render();
    writeFileSync(path2, Buffer.from(this.lastResult.dataUrl.split(",")[1], "base64"));
    return path2;
  }
  /** Computed background-color of a selector's box (for :hover assertions). */
  computedBg(selector) {
    const target = this._walk(this._dom).find((n2) => n2.nodeType === 1 && matchesSimpleSelector(n2, selector));
    if (!target) return null;
    const items = this._layoutItems();
    for (let i = items.length - 1; i >= 0; i--) {
      const el = this._elementForItem(items[i]);
      if (el === target && items[i].width > 0 && items[i].height > 0) {
        const st = items[i].style || {};
        return st["background-color"] || st.background || null;
      }
    }
    return null;
  }
  heapMB() {
    return process.memoryUsage().heapUsed / 1024 / 1024;
  }
};

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/verifySession.js
var VIEWPORT_PRESETS = {
  iphone14: { width: 390, height: 844, dpr: 3, label: "iPhone 14" },
  iphoneSE: { width: 375, height: 667, dpr: 2, label: "iPhone SE" },
  pixel8: { width: 412, height: 915, dpr: 2, label: "Pixel 8" },
  android: { width: 360, height: 740, dpr: 3, label: "Android" },
  tablet: { width: 820, height: 1180, dpr: 2, label: "Tablet" },
  desktop: { width: 1280, height: 800, dpr: 1, label: "Desktop" },
  fhd: { width: 1920, height: 1080, dpr: 1, label: "Full HD" }
};
var TALL_CAP = 12e3;
function clampInt(v, lo, hi, fb) {
  const n2 = Math.floor(Number(v));
  if (!Number.isFinite(n2)) return fb;
  return Math.max(lo, Math.min(hi, n2));
}
function matchesSel(node, sel) {
  const s = String(sel).trim();
  if (!node || node.nodeType !== 1) return false;
  if (s.startsWith("#")) return node.attributes?.id === s.slice(1);
  if (s.startsWith(".")) {
    const cls = String(node.attributes?.class || "").split(/\s+/);
    return cls.includes(s.slice(1));
  }
  return node.localName === s.toLowerCase();
}
function normColor(c) {
  return String(c || "").trim().toLowerCase().replace(/\s+/g, "");
}
var VerifySession = class extends InputSimulator {
  constructor(html, options = {}) {
    super(html, { width: options.width || 960, height: options.height || 640 });
    this.quiet(true);
    this.dpr = clampInt(options.dpr || 1, 1, 3);
    this.pngLevel = options.pngLevel == null ? void 0 : clampInt(options.pngLevel, 0, 9);
    this.scrollY = 0;
    this._dirty = true;
    this._layoutCache = null;
    this._vpCache = null;
    this._tallCache = null;
    this._fixedRootCache = null;
    this._tallNeeded = false;
    this._shotCount = 0;
    this.timings = { layout: 0, paint: 0, encode: 0, renders: 0 };
  }
  /* ---------------- viewport ---------------- */
  setViewport(width, height, dpr) {
    this.width = clampInt(width, 1, 4096, this.width);
    this.height = clampInt(height, 1, 4096, this.height);
    if (dpr != null) this.dpr = clampInt(dpr, 1, 3);
    this.scrollY = 0;
    this._markDirty();
    return this;
  }
  /* ---------------- layout cache ---------------- */
  _markDirty() {
    this._dirty = true;
    this._layoutCache = null;
    this._vpCache = null;
    this._tallCache = null;
    this._fixedRootCache = null;
  }
  _layoutItems() {
    if (!this._dirty && this._layoutCache) return this._layoutCache;
    const t0 = Date.now();
    const tallH = Math.min(TALL_CAP, Math.max(this.height, this._estContentH || this.height * 4));
    const layout = buildLayoutTree(
      this._dom,
      { width: this.width, height: tallH },
      { cssText: this._cssText, time: 0 }
    );
    this.timings.layout += Date.now() - t0;
    this._layoutCache = layout;
    const pm = /* @__PURE__ */ new Map();
    for (const it of layout) {
      for (const ch of it?.children || []) if (ch && !pm.has(ch)) pm.set(ch, it);
    }
    this._parentMap = pm;
    this._dirty = false;
    let max = 0;
    for (let i = 1; i < layout.length; i++) {
      const it = layout[i];
      if (!it) continue;
      const b = (Number(it.y) || 0) + (Number(it.height) || 0);
      if (b > max) max = b;
    }
    this._estContentH = Math.ceil(max);
    return layout;
  }
  // Mutating ops invalidate the cache.
  mousedown(...a) {
    const r = super.mousedown(...a);
    this._markDirty();
    return r;
  }
  mouseup(...a) {
    const r = super.mouseup(...a);
    this._markDirty();
    return r;
  }
  dblclick(...a) {
    const r = super.dblclick(...a);
    this._markDirty();
    return r;
  }
  drag(...a) {
    const r = super.drag(...a);
    this._markDirty();
    return r;
  }
  focus(...a) {
    const r = super.focus(...a);
    this._markDirty();
    return r;
  }
  blur(...a) {
    const r = super.blur(...a);
    this._markDirty();
    return r;
  }
  tab(...a) {
    const r = super.tab(...a);
    this._markDirty();
    return r;
  }
  press(...a) {
    const r = super.press(...a);
    this._markDirty();
    return r;
  }
  type(...a) {
    const r = super.type(...a);
    this._markDirty();
    return r;
  }
  _setHover(...a) {
    const r = super._setHover(...a);
    this._markDirty();
    return r;
  }
  /** hitTest in viewport coords: fixed overlay first, then page content. */
  hitTest(x, y) {
    const layout = this._layoutItems();
    for (let i = layout.length - 1; i >= 0; i--) {
      const it = layout[i];
      if (!it || it.width <= 0 || it.height <= 0) continue;
      const b = this._effViewportBox(it);
      if (b) {
        if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
          const el = this._canonicalOf(it);
          if (el) return el;
        }
        continue;
      }
      const py = y + this.scrollY;
      if (x >= it.x && x <= it.x + it.width && py >= it.y && py <= it.y + it.height) {
        const el = this._canonicalOf(it);
        if (el) return el;
      }
    }
    return null;
  }
  /** position:fixed items live in viewport space, not page space. */
  _isFixed(it) {
    return String(it?.style?.position || "").toLowerCase() === "fixed";
  }
  /** Canonical nodes that are fixed roots -> their layout item. Cached per layout. */
  _fixedRoots() {
    if (this._fixedRootCache && !this._dirty) return this._fixedRootCache;
    const map = /* @__PURE__ */ new Map();
    for (const it of this._layoutItems()) {
      if (this._isFixed(it)) {
        const el = this._elementForItem(it);
        if (el) map.set(el, it);
      }
    }
    this._fixedRootCache = map;
    return map;
  }
  /** If a canonical node sits inside a fixed subtree, return the viewport delta. */
  _fixedAdjustment(canonicalNode) {
    const roots = this._fixedRoots();
    let n2 = canonicalNode, depth = 0;
    while (n2 && depth++ < 60) {
      if (roots.has(n2)) {
        const rootIt = roots.get(n2);
        const vp = this._fixedViewportBox(rootIt);
        return { dx: vp.x - rootIt.x, dy: vp.y - rootIt.y };
      }
      n2 = n2.__simParent || null;
    }
    return null;
  }
  /** Cached simId -> canonical node map (parent walks the whole DOM per lookup). */
  _nodeBySimId(id) {
    if (!this._simIdMap) {
      const m = /* @__PURE__ */ new Map();
      for (const n2 of this._walk(this._dom)) if (n2.__simId) m.set(n2.__simId, n2);
      this._simIdMap = m;
    }
    return this._simIdMap.get(id) || null;
  }
  /** Canonical DOM node for a layout item (text nodes resolve via parent). */
  _canonicalOf(it) {
    let cur = it, depth = 0;
    while (cur && depth++ < 64) {
      const el = this._elementForItem(cur);
      if (el) return el;
      cur = this._parentMap ? this._parentMap.get(cur) : null;
    }
    return null;
  }
  /**
   * Viewport-space box for an item, or null when the item is regular
   * page content. Handles items nested inside fixed subtrees (e.g. a
   * close button inside a bottom sheet).
   */
  _effViewportBox(it) {
    if (this._isFixed(it)) return this._fixedViewportBox(it);
    const el = this._canonicalOf(it);
    const adj = el && this._fixedAdjustment(el);
    if (adj) return { ...it, x: it.x + adj.dx, y: it.y + adj.dy };
    return null;
  }
  _inFixedSubtree(it) {
    if (this._isFixed(it)) return true;
    const el = this._canonicalOf(it);
    return !!(el && this._fixedAdjustment(el));
  }
  _fixedViewportBox(it) {
    const st = it.style || {};
    const px2 = (v) => {
      const m = String(v ?? "").trim().match(/^(-?[\d.]+)px$/);
      return m ? +m[1] : 0;
    };
    const set = (v) => v != null && String(v).trim() !== "" && String(v).trim().toLowerCase() !== "auto";
    const y = set(st.bottom) ? this.height - it.height - px2(st.bottom) : px2(st.top);
    const x = set(st.right) ? this.width - it.width - px2(st.right) : px2(st.left);
    return { ...it, x, y };
  }
  _paintFixedOverlay(scaledSurface) {
    const plan = [];
    for (const it of this._layoutItems()) {
      if (!it || it.width <= 0 || it.height <= 0) continue;
      const b = this._effViewportBox(it);
      if (b) plan.push([it, b.x, b.y]);
    }
    const saved = plan.map(([it]) => [it, it.x, it.y]);
    for (const [it, x, y] of plan) {
      it.x = x;
      it.y = y;
    }
    const items = plan.map(([it]) => it);
    try {
      if (items.length) paintLayout(scaledSurface, items, {}, { simplePaint: true });
    } finally {
      for (const [it, x, y] of saved) {
        it.x = x;
        it.y = y;
      }
    }
    return items.length;
  }
  /** Viewport coords of a selector's center (fixed-aware, for driving clicks). */
  viewportCenterOf(selector) {
    const target = this._findAll(selector)[0];
    if (!target) return null;
    const layout = this._layoutItems();
    for (let i = layout.length - 1; i >= 0; i--) {
      const it = layout[i];
      if (this._elementForItem(it) === target && it.width > 0 && it.height > 0) {
        const b = this._effViewportBox(it);
        if (b) return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2), node: target };
        return { x: Math.round(it.x + it.width / 2), y: Math.round(it.y - this.scrollY + it.height / 2), node: target };
      }
    }
    return null;
  }
  /* ---------------- scroll (compositor) ---------------- */
  maxScrollY() {
    this._layoutItems();
    return Math.max(0, (this._estContentH || this.height) - this.height);
  }
  scrollTo(y) {
    const ny = clampInt(y, 0, this.maxScrollY(), 0);
    this.scrollY = ny;
    this._tallNeeded = ny > 0;
    return this.scrollY;
  }
  scrollBy(dy) {
    return this.scrollTo(this.scrollY + Number(dy || 0));
  }
  /* ---------------- DOM state helpers (simulate handler effects) ---------------- */
  _findAll(selector) {
    return this._walk(this._dom).filter((n2) => n2.nodeType === 1 && matchesSel(n2, selector));
  }
  _classes(node) {
    return String(node.attributes?.class || "").split(/\s+/).filter(Boolean);
  }
  addClass(selector, cls) {
    for (const n2 of this._findAll(selector)) {
      const c = this._classes(n2);
      if (!c.includes(cls)) c.push(cls);
      n2.attributes.class = c.join(" ");
    }
    this._markDirty();
    return this;
  }
  removeClass(selector, cls) {
    for (const n2 of this._findAll(selector)) {
      n2.attributes.class = this._classes(n2).filter((c) => c !== cls).join(" ");
    }
    this._markDirty();
    return this;
  }
  toggleClass(selector, cls) {
    for (const n2 of this._findAll(selector)) {
      const c = this._classes(n2);
      n2.attributes.class = c.includes(cls) ? c.filter((x) => x !== cls).join(" ") : [...c, cls].join(" ");
    }
    this._markDirty();
    return this;
  }
  setAttr(selector, name, value) {
    for (const n2 of this._findAll(selector)) {
      n2.attributes = n2.attributes || {};
      if (value == null) delete n2.attributes[name];
      else n2.attributes[name] = String(value);
    }
    this._markDirty();
    return this;
  }
  setStyle(selector, prop, value) {
    for (const n2 of this._findAll(selector)) {
      n2.style = n2.style || {};
      n2.style[prop] = String(value);
    }
    this._markDirty();
    return this;
  }
  setHidden(selector, hidden2) {
    return this.setStyle(selector, "display", hidden2 ? "none" : "");
  }
  setValue(selector, value) {
    for (const n2 of this._findAll(selector)) n2.value = String(value);
    this._markDirty();
    return this;
  }
  /* ---------------- render ---------------- */
  _bodyBg(layout) {
    const body = layout.find((it) => it && it.kind === "body") || layout[0] || {};
    return background(body.style || {}, { kind: "body" });
  }
  _paintTall() {
    if (this._tallCache && !this._dirty) return this._tallCache;
    const layout = this._layoutItems().filter((it) => !this._inFixedSubtree(it));
    const tallH = Math.max(this.height, Math.min(TALL_CAP, this._estContentH || this.height));
    const t0 = Date.now();
    const bodyBg = this._bodyBg(this._layoutItems());
    const { base, surface } = makeSupersampledSurface(this.width, tallH, this.dpr, bodyBg.color);
    if (bodyBg.gradient) surface.gradientRect(0, 0, this.width, tallH, bodyBg.gradient, bodyBg.color);
    paintLayout(surface, layout, {});
    this.timings.paint += Date.now() - t0;
    this._tallCache = { base, tallH };
    return this._tallCache;
  }
  _paintViewport() {
    if (this._vpCache && !this._dirty) return this._vpCache;
    const all = this._layoutItems();
    const layout = all.filter((it) => !this._inFixedSubtree(it));
    const t0 = Date.now();
    const bodyBg = this._bodyBg(all);
    const { base, surface } = makeSupersampledSurface(this.width, this.height, this.dpr, bodyBg.color);
    if (bodyBg.gradient) surface.gradientRect(0, 0, this.width, this.height, bodyBg.gradient, bodyBg.color);
    paintLayout(surface, layout, {});
    this.timings.paint += Date.now() - t0;
    this._vpCache = { base };
    return this._vpCache;
  }
  /**
   * Viewport paint at an arbitrary scrollY (for dpr>1, where a tall cache
   * costs 9x pixels). Items are translated to viewport space via proxies;
   * children arrays are repaired so z-order walks stay consistent.
   */
  _paintViewportAt(scrollY) {
    const all = this._layoutItems();
    const y0 = scrollY, y1 = scrollY + this.height;
    const origToProxy = /* @__PURE__ */ new Map();
    const translated = [];
    for (const it of all) {
      if (!it || this._inFixedSubtree(it)) continue;
      if (it.y + it.height < y0 || it.y > y1) continue;
      const proxy = { ...it, y: it.y - scrollY };
      origToProxy.set(it, proxy);
      translated.push(proxy);
    }
    for (const proxy of translated) {
      const ch = proxy.children;
      if (ch && ch.length) {
        let dirty = false;
        const mapped = new Array(ch.length);
        for (let i = 0; i < ch.length; i++) {
          const m = origToProxy.get(ch[i]);
          mapped[i] = m || ch[i];
          if (m) dirty = true;
        }
        if (dirty) proxy.children = mapped;
      }
    }
    const t0 = Date.now();
    const bodyBg = this._bodyBg(all);
    const { base, surface } = makeSupersampledSurface(this.width, this.height, this.dpr, bodyBg.color);
    if (bodyBg.gradient) surface.gradientRect(0, 0, this.width, this.height, bodyBg.gradient, bodyBg.color);
    paintLayout(surface, translated, {});
    this.timings.paint += Date.now() - t0;
    return { base };
  }
  /** Render the current viewport (at scrollY) to a PNG buffer. */
  renderFrame() {
    const t0 = Date.now();
    const dpr = this.dpr;
    const vw = this.width * dpr, vh = this.height * dpr;
    const viewBase = new Framebuffer(vw, vh);
    const scrolled = this.scrollY > 0 && this.maxScrollY() > 0;
    if (scrolled && this.dpr <= 1 && this._tallNeeded) {
      viewBase.blitRaw(this._paintTall().base, 0, Math.round(this.scrollY * dpr), vw, vh, 0, 0);
    } else if (scrolled) {
      viewBase.blitRaw(this._paintViewportAt(this.scrollY).base, 0, 0, vw, vh, 0, 0);
    } else {
      viewBase.blitRaw(this._paintViewport().base, 0, 0, vw, vh, 0, 0);
    }
    this._paintFixedOverlay(new ScaledFramebuffer(viewBase, dpr, this.width, this.height));
    const t1 = Date.now();
    const png = downsampleToPng(viewBase, dpr, this.width, this.height, this.pngLevel);
    this.timings.encode += Date.now() - t1;
    this.timings.renders++;
    this._dirty = false;
    return { png, width: this.width, height: this.height, ms: Date.now() - t0, scrollY: this.scrollY };
  }
  // Keep the InputSimulator contract: render() -> lastResult, savePng(path).
  render() {
    const f = this.renderFrame();
    this.lastResult = {
      backend: "merkava-verify-session",
      width: f.width,
      height: f.height,
      bytes: f.png.length,
      dataUrl: "data:image/png;base64," + f.png.toString("base64")
    };
    return this.lastResult;
  }
  savePng(path2) {
    const f = this.renderFrame();
    writeFileSync2(path2, f.png);
    this._shotCount++;
    return { path: path2, bytes: f.png.length, ms: f.ms };
  }
  /* ---------------- assertions ---------------- */
  _nodeBoxes(selector) {
    const targets = new Set(this._findAll(selector));
    const out = [];
    for (const it of this._layoutItems()) {
      const el = this._elementForItem(it);
      if (el && targets.has(el) && it.width > 0 && it.height > 0) out.push(it);
    }
    return out;
  }
  isVisible(selector) {
    return this._nodeBoxes(selector).length > 0;
  }
  _textOf(node) {
    if (!node) return "";
    if (node.nodeType === 3) return node.textContent || "";
    let s = node.textContent || "";
    if (!s && node.children) s = node.children.map((c) => this._textOf(c)).join(" ");
    return s;
  }
  textOf(selector) {
    const n2 = this._findAll(selector)[0];
    if (!n2) return null;
    if (n2.localName === "input" || n2.localName === "textarea" || n2.localName === "select")
      return String(n2.value ?? n2.attributes?.value ?? "");
    return this._textOf(n2).replace(/\s+/g, " ").trim();
  }
  assertVisible(selector) {
    const v = this.isVisible(selector);
    return { pass: v, detail: v ? `${selector} visible` : `${selector} NOT visible` };
  }
  assertHidden(selector) {
    const v = this.isVisible(selector);
    return { pass: !v, detail: v ? `${selector} unexpectedly visible` : `${selector} hidden` };
  }
  assertText(selector, sub) {
    const t = this.textOf(selector);
    const pass = t != null && t.includes(sub);
    return { pass, detail: pass ? `${selector} contains "${sub}"` : `${selector} text missing "${sub}" (got: ${(t || "").slice(0, 80)})` };
  }
  assertBg(selector, hex) {
    const bg = this.computedBg(selector);
    const pass = bg != null && normColor(bg) === normColor(hex);
    return { pass, detail: pass ? `${selector} bg ${bg}` : `${selector} bg ${bg}, expected ${hex}` };
  }
  /* ---------------- script runner ---------------- */
  _resolvePoint(arg2) {
    const m = String(arg2).trim().match(/^(-?\d+)\s*,\s*(-?\d+)$/);
    if (m) return { x: +m[1], y: +m[2], label: `${m[1]},${m[2]}` };
    const c = this.viewportCenterOf(arg2);
    if (!c) throw new Error(`no element for selector: ${arg2}`);
    return { x: Math.round(c.x), y: Math.round(c.y), label: `${arg2} @${Math.round(c.x)},${Math.round(c.y)}`, node: c.node };
  }
  _nodeLabel(node) {
    if (!node) return "nothing";
    const id = node.attributes?.id ? `#${node.attributes.id}` : "";
    const cls = node.attributes?.class ? `.${String(node.attributes.class).split(/\s+/)[0]}` : "";
    return `<${node.localName}${id}${cls}>`;
  }
  async runSteps(steps) {
    const report = { ok: true, failed: 0, steps: [], shots: [] };
    for (const st of steps) {
      const t0 = Date.now();
      const rec = { op: st.op, arg: st.arg, ok: true, ms: 0, detail: "" };
      try {
        rec.detail = await this._runStep(st) || "";
      } catch (e) {
        rec.ok = false;
        rec.detail = "ERROR: " + e.message;
      }
      rec.ms = Date.now() - t0;
      if (!rec.ok) {
        report.ok = false;
        report.failed++;
      }
      report.steps.push(rec);
    }
    return report;
  }
  async _runStep(st) {
    const a = st.arg || "";
    switch (st.op) {
      case "shot": {
        const p = a || `/tmp/merkava-verify-${Date.now()}-${this._shotCount}.png`;
        const r = this.savePng(p);
        return `saved ${r.path} ${r.bytes}B in ${r.ms}ms`;
      }
      case "click":
      case "tap": {
        const pt = this._resolvePoint(a);
        const node = this.click(pt.x, pt.y);
        return `clicked ${pt.label} -> ${this._nodeLabel(node)} (no page JS runs; use state: to simulate handler effects)`;
      }
      case "hover": {
        const pt = this._resolvePoint(a);
        this.hover(pt.x, pt.y);
        return `hover ${pt.label}`;
      }
      case "dblclick": {
        const pt = this._resolvePoint(a);
        this.dblclick(pt.x, pt.y);
        return `dblclick ${pt.label}`;
      }
      case "scroll": {
        const y = this.scrollBy(Number(a));
        return `scrollY=${y}`;
      }
      case "scrollto": {
        const y = this.scrollTo(Number(a));
        return `scrollY=${y}`;
      }
      case "type": {
        const i = a.indexOf(":");
        if (i < 0) throw new Error("type needs selector:text");
        const sel = a.slice(0, i), text = a.slice(i + 1);
        this.type(text, sel);
        return `typed ${text.length} chars into ${sel}`;
      }
      case "press":
        this.press(a.trim());
        return `pressed ${a.trim()}`;
      case "wait":
        await new Promise((r) => setTimeout(r, Number(a) || 0));
        return `waited ${a}ms`;
      case "state": {
        const m = a.match(/^(.+?)([+~-])([A-Za-z0-9_-]+)$/);
        if (!m) throw new Error("state needs selector:+/\u2212/~class");
        const sel = m[1].replace(/:+$/, ""), mode = m[2], cls = m[3];
        if (mode === "+") this.addClass(sel, cls);
        else if (mode === "-") this.removeClass(sel, cls);
        else this.toggleClass(sel, cls);
        return `class ${mode}${cls} on ${sel}`;
      }
      case "hide":
        this.setHidden(a, true);
        return `hidden ${a}`;
      case "show":
        this.setHidden(a, false);
        return `shown ${a}`;
      case "attr": {
        const m = a.match(/^([^:]+):([^=]+)=(.*)$/);
        if (!m) throw new Error("attr needs selector:name=value");
        this.setAttr(m[1], m[2], m[3]);
        return `attr ${m[2]}=${m[3]} on ${m[1]}`;
      }
      case "style": {
        const m = a.match(/^([^:]+):([^=]+)=(.*)$/);
        if (!m) throw new Error("style needs selector:prop=value");
        this.setStyle(m[1], m[2], m[3]);
        return `style ${m[2]}=${m[3]} on ${m[1]}`;
      }
      case "assert": {
        const m = a.match(/^(visible|hidden):(.+)$/) || a.match(/^(text|bg):([^:]+):(.+)$/);
        if (!m) throw new Error("assert needs visible|hidden|text|bg");
        let r;
        if (m[1] === "visible") r = this.assertVisible(m[2]);
        else if (m[1] === "hidden") r = this.assertHidden(m[2]);
        else if (m[1] === "text") r = this.assertText(m[2], m[3]);
        else r = this.assertBg(m[2], m[3]);
        if (!r.pass) {
          const e = new Error("ASSERT FAIL: " + r.detail);
          e.assertFail = true;
          throw e;
        }
        return "PASS: " + r.detail;
      }
      case "viewport": {
        const m = a.match(/^(\d+)x(\d+)$/);
        if (!m) throw new Error("viewport needs WxH");
        this.setViewport(+m[1], +m[2]);
        return `viewport ${m[1]}x${m[2]}`;
      }
      case "log":
        return a;
      default:
        throw new Error(`unknown op: ${st.op}`);
    }
  }
};
function parseInteract(script) {
  const steps = [];
  const parts = String(script || "").split(/(?<!\\);/).map((s) => s.replace(/\\;/g, ";").trim()).filter(Boolean);
  for (const p of parts) {
    const i = p.indexOf(":");
    if (i < 0) steps.push({ op: p.trim(), arg: "", raw: p });
    else steps.push({ op: p.slice(0, i).trim(), arg: p.slice(i + 1).trim(), raw: p });
  }
  return steps;
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/merkavaCore.mjs
var VERSION2 = "1.2.0";
var DEFAULT_TIMEOUT_MS = 3e4;
function resolveViewport({ viewport, device } = {}) {
  if (device && VIEWPORT_PRESETS[device]) return { ...VIEWPORT_PRESETS[device] };
  if (viewport) {
    const m = String(viewport).match(/(\d+)\s*x\s*(\d+)/i);
    if (m) return { width: +m[1], height: +m[2], dpr: 1, label: "custom" };
  }
  return { ...VIEWPORT_PRESETS.desktop };
}
async function fetchHtml(url, timeoutMs) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Merkava/1.0 (screenshot)" },
      signal: ctl.signal
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}
function injectCss(html, css) {
  if (!css) return html;
  const tag = `<style data-merkava-injected="1">${css}</style>`;
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, tag + "</head>");
  return tag + html;
}
function finalDomState(sess, html, jsExecuted) {
  const dom = sess._dom || null;
  let textLength = 0;
  let nodeCount = 0;
  try {
    const walk2 = (n2) => {
      if (!n2 || typeof n2 !== "object") return;
      nodeCount++;
      const tag = String(n2.localName || n2.tagName || "").toLowerCase();
      if (n2.nodeType === 3) {
        textLength += String(n2.textContent || "").length;
      } else if (tag !== "style" && tag !== "script") {
        for (const ch of n2.children || []) walk2(ch);
      }
    };
    walk2(dom);
  } catch {
  }
  let title = "";
  try {
    const m = String(html || "").match(/<title[^>]*>([\s\S]{0,200})<\/title>/i);
    if (m) title = m[1].replace(/<[^>]*>/g, "").trim();
  } catch {
  }
  return { title, textLength, nodeCount, jsExecuted: !!jsExecuted };
}
async function runPage(opts = {}) {
  const t0 = Date.now();
  const timeoutMs = Math.min(Math.max(opts.timeoutMs || DEFAULT_TIMEOUT_MS, 1e3), 12e4);
  let html = opts.html || "";
  if (!html && opts.url) html = await fetchHtml(opts.url, timeoutMs);
  if (!html) throw new Error("runPage: need html or url");
  html = injectCss(html, opts.css);
  let jsResult = null;
  if (opts.executeJs !== false) {
    try {
      const { runPageWithJs: runPageWithJs2 } = await Promise.resolve().then(() => (init_jsPageRunner(), jsPageRunner_exports));
      let pageHtml = html;
      if (opts.js && !html && !opts.url) {
        pageHtml = `<!DOCTYPE html><html><body><script>${opts.js}</script></body></html>`;
      }
      jsResult = await runPageWithJs2({
        html: pageHtml || void 0,
        url: opts.url || void 0,
        waitMs: Math.min(opts.waitMs || 2500, 15e3),
        fetchTimeoutMs: Math.min(timeoutMs, 15e3)
      });
      if (!opts.js && jsResult.finalHtml && jsResult.finalHtml.length > html.length / 2) {
        html = injectCss(jsResult.finalHtml, opts.css);
      }
    } catch (e) {
      jsResult = { ok: false, consoleLogs: [], jsErrors: [{ kind: "harness", name: "JsHarnessError", message: String(e && e.message || e).slice(0, 200), file: "<harness>", line: 0, estimated: true }], status: "HARNESS_ERROR", steps: 0, wallMs: 0, scriptsRun: 0 };
    }
  }
  const v = resolveViewport(opts);
  const sess = new VerifySession(html, {
    width: v.width,
    height: v.height,
    dpr: v.dpr,
    pngLevel: opts.pngLevel != null ? opts.pngLevel : 1
  });
  const steps = typeof opts.actions === "string" ? parseInteract(opts.actions) : Array.isArray(opts.actions) ? opts.actions : [{ op: "shot", arg: "", raw: "shot" }];
  if (!steps.some((s) => s.op === "shot")) steps.push({ op: "shot", arg: "", raw: "shot" });
  const report = await sess.runSteps(steps);
  const frame = sess.renderFrame();
  if (!frame || !frame.png || !frame.png.length) throw new Error("runPage: renderer produced no screenshot");
  return {
    ok: report.ok,
    png: Buffer.from(frame.png),
    width: v.width,
    height: v.height,
    dpr: v.dpr,
    consoleLogs: jsResult ? jsResult.consoleLogs : [],
    jsErrors: jsResult ? jsResult.jsErrors : [],
    jsStatus: jsResult ? jsResult.status : "SKIPPED",
    finalDom: finalDomState(sess, html, jsResult && jsResult.status !== "SKIPPED"),
    assertions: report.steps.map((s) => ({
      op: s.op,
      arg: s.arg || "",
      ok: !!s.ok,
      ms: s.ms || 0,
      detail: String(s.detail || "").slice(0, 300)
    })),
    timingsMs: {
      total: Date.now() - t0,
      layout: sess.timings.layout || 0,
      paint: sess.timings.paint || 0,
      encode: sess.timings.encode || 0,
      renders: sess.timings.renders || 0
    },
    version: VERSION2
  };
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/merkavaBundleEntry.mjs
init_jsPageRunner();
var VERSION3 = "2.0.0";
function arg(name, def = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : def;
}
async function main() {
  const sub = process.argv[2];
  if (sub === "run-js") {
    const target = process.argv[3];
    const jsArg = arg("--js");
    const jsFile = arg("--js-file");
    const htmlArg2 = arg("--html");
    const fileArg = arg("--file");
    let url2 = target && !target.startsWith("--") ? target : arg("--url");
    let html = htmlArg2 || (fileArg ? readFileSync(fileArg, "utf8") : null);
    let js = jsArg || (jsFile ? readFileSync(jsFile, "utf8") : null);
    if (js && !html && !url2) {
      html = `<!DOCTYPE html><html><body><script>${js}</script></body></html>`;
      js = null;
    }
    if (!html && !url2) {
      console.error('Usage: merkava run-js <url> [--js "code" | --html "..." | --file f.html]');
      process.exit(1);
    }
    const r2 = await runPageWithJs({ html: html || void 0, url: url2 || void 0, waitMs: 4e3 });
    for (const l of r2.consoleLogs) console.log(`[${l.level}] ${l.text}`);
    if (!r2.jsErrors.length) {
      console.log(`OK: ${r2.scriptsRun} script(s), ${r2.wallMs}ms \u2014 no errors`);
    } else {
      for (const e of r2.jsErrors) {
        console.log(`ERROR [${e.kind}] ${e.name}: ${e.message} @ ${e.file}${e.line ? ":" + e.line : ""}`);
      }
      console.log(`FAIL: ${r2.jsErrors.length} error(s)`);
    }
    process.exit(r2.jsErrors.length ? 1 : 0);
  }
  if (sub === "devices") {
    for (const [k, p] of Object.entries(VIEWPORT_PRESETS))
      console.log(`${k.padEnd(10)} ${p.width}x${p.height} @${p.dpr}x  ${p.label}`);
    return;
  }
  const url = arg("--url");
  const file = arg("--file");
  const htmlArg = arg("--html");
  if (!url && !file && !htmlArg) {
    console.error("Usage: merkava --url <url> --out shot.png [--device iphone14] [--full] | merkava run-js <url> | merkava devices");
    process.exit(1);
  }
  const device = arg("--device");
  const vp = device && VIEWPORT_PRESETS[device] ? VIEWPORT_PRESETS[device] : VIEWPORT_PRESETS.desktop;
  const r = await runPage({
    url: url || void 0,
    html: htmlArg || (file ? readFileSync(file, "utf8") : void 0),
    device: device || void 0,
    viewport: arg("--viewport") || void 0,
    pngLevel: 1,
    waitMs: 4e3
  });
  const out = arg("--out", "/tmp/merkava-shot.png");
  writeFileSync3(out, r.png);
  console.log(`OK ${out} ${r.width}x${r.height} ${r.png.length}B in ${r.timingsMs.total}ms (JS: ${r.jsStatus}, errors: ${r.jsErrors.length})`);
  if (r.jsErrors.length) {
    for (const e of r.jsErrors.slice(0, 5))
      console.log(`  JS-ERROR [${e.kind}] ${e.name}: ${String(e.message).slice(0, 120)} @ ${e.file}${e.line ? ":" + e.line : ""}`);
  }
}
var __isMain = (() => {
  try {
    return !!process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop());
  } catch {
    return false;
  }
})();
if (__isMain) main().catch((e) => {
  console.error("FAIL:", e.message);
  process.exit(1);
});
export {
  VERSION3 as VERSION,
  VIEWPORT_PRESETS,
  runPage,
  runPageWithJs
};
