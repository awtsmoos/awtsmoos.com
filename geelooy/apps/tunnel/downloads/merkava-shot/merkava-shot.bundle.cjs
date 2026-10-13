var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
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

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSyntaxCharacters.js
var require_CssSyntaxCharacters = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSyntaxCharacters.js"(exports2, module2) {
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
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSyntaxTokenizer.js"(exports2, module2) {
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
      const characters = typeof module2 === "object" && module2.exports ? require_CssSyntaxCharacters() : globalThis.Merkava;
      const AwtsExports = { tokenizeCss: tokenizeCss2 };
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssDeclarationParser.js"(exports2, module2) {
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
      const { tokenizeCss } = typeof module2 === "object" && module2.exports ? require_CssSyntaxTokenizer() : globalThis.Merkava;
      const AwtsExports = { parseCssDeclarations: parseCssDeclarations2 };
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssRuleParser.js"(exports2, module2) {
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
      const { tokenizeCss } = typeof module2 === "object" && module2.exports ? require_CssSyntaxTokenizer() : globalThis.Merkava;
      const AwtsExports = { parseCssRules: parseCssRules3 };
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSelectorList.js"(exports2, module2) {
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
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSelectorScanner.js"(exports2, module2) {
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
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSpecificity.js"(exports2, module2) {
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
      const { splitSelectorList: splitSelectorList2 } = typeof module2 === "object" && module2.exports ? require_CssSelectorList() : globalThis.Merkava;
      const scanner = typeof module2 === "object" && module2.exports ? require_CssSelectorScanner() : globalThis.Merkava;
      const AwtsExports = { compareSpecificity: compareSpecificity3, cssSpecificity: cssSpecificity2 };
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssConditionEvaluator.js"(exports2, module2) {
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
          const { splitSelectorList: splitSelectorList2 } = typeof module2 === "object" && module2.exports ? require_CssSelectorList() : globalThis.Merkava;
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
      const { splitTopLevel: splitTopLevel4 } = typeof module2 === "object" && module2.exports ? require_CssSelectorList() : globalThis.Merkava;
      const AwtsExports = { matchesMediaQuery: matchesMediaQuery3, matchesSupportsCondition: matchesSupportsCondition3 };
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssRuleCompiler.js"(exports2, module2) {
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
      const { parseCssDeclarations } = typeof module2 === "object" && module2.exports ? require_CssDeclarationParser() : globalThis.Merkava;
      const { parseCssRules: parseCssRules2 } = typeof module2 === "object" && module2.exports ? require_CssRuleParser() : globalThis.Merkava;
      const { splitSelectorList: splitSelectorList2 } = typeof module2 === "object" && module2.exports ? require_CssSelectorList() : globalThis.Merkava;
      const { cssSpecificity } = typeof module2 === "object" && module2.exports ? require_CssSpecificity() : globalThis.Merkava;
      const conditions = typeof module2 === "object" && module2.exports ? require_CssConditionEvaluator() : globalThis.Merkava;
      const AwtsExports = { compileCssStyleSheet: compileCssStyleSheet3, declarationsFromObject: declarationsFromObject3 };
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssAttributeSelector.js"(exports2, module2) {
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
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssNthExpression.js"(exports2, module2) {
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
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssPseudoMatcher.js"(exports2, module2) {
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
      const { matchesNth, parseNthExpression } = typeof module2 === "object" && module2.exports ? require_CssNthExpression() : globalThis.Merkava;
      const { findTopLevelWord } = typeof module2 === "object" && module2.exports ? require_CssSelectorScanner() : globalThis.Merkava;
      const { splitSelectorList: splitSelectorList2 } = typeof module2 === "object" && module2.exports ? require_CssSelectorList() : globalThis.Merkava;
      const LINK_ELEMENTS = /* @__PURE__ */ new Set(["a", "area", "link"]);
      const FORM_CONTROLS = /* @__PURE__ */ new Set(["input", "textarea", "select", "button"]);
      const AwtsExports = { matchesCssPseudo: matchesCssPseudo2 };
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssSelectorMatcher.js"(exports2, module2) {
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
      const { parseAttributeSelector, matchParsedAttributeSelector } = typeof module2 === "object" && module2.exports ? require_CssAttributeSelector() : globalThis.Merkava;
      const { matchesCssPseudo } = typeof module2 === "object" && module2.exports ? require_CssPseudoMatcher() : globalThis.Merkava;
      const { splitSelectorList: splitSelectorList2, tokenizeSelectorSequence, isCombinator } = typeof module2 === "object" && module2.exports ? require_CssSelectorList() : globalThis.Merkava;
      const scanner = typeof module2 === "object" && module2.exports ? require_CssSelectorScanner() : globalThis.Merkava;
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
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssRuleIndex.js"(exports2, module2) {
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
      const { splitSelectorList: splitSelectorList2, tokenizeSelectorSequence, isCombinator } = typeof module2 === "object" && module2.exports ? require_CssSelectorList() : globalThis.Merkava;
      const { readSelectorIdentifier, readBalancedSelector } = typeof module2 === "object" && module2.exports ? require_CssSelectorScanner() : globalThis.Merkava;
      const { compileSelectorList, matchesCompiledSelectorList } = typeof module2 === "object" && module2.exports ? require_CssSelectorMatcher() : globalThis.Merkava;
      const AwtsExports = { buildCssRuleIndex: buildCssRuleIndex3, cssRuleCandidates: cssRuleCandidates3, matchesIndexedCssRule: matchesIndexedCssRule3 };
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssInheritedProperties.js"(exports2, module2) {
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
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssTransition.js"(exports2, module2) {
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
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssTransform.js"(exports2, module2) {
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
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/standards/css/CssPseudoElements.js"(exports2, module2) {
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
      const { matchesCssSelector: matchesCssSelector2 } = typeof module2 === "object" && module2.exports ? require_CssSelectorMatcher() : globalThis.Merkava;
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
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = AwtsExports;
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

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/htmlParser.js
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
var VOID_ELEMENTS, RAW_TEXT_ELEMENTS, ENTITY_MAP, ENTITY_RE, CLOSE_RE_CACHE;
var init_htmlParser = __esm({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/htmlParser.js"() {
    VOID_ELEMENTS = /* @__PURE__ */ new Set([
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
    RAW_TEXT_ELEMENTS = /* @__PURE__ */ new Set(["script", "style", "textarea"]);
    ENTITY_MAP = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
      "&apos;": "'",
      "&nbsp;": " "
    };
    ENTITY_RE = /&(amp|lt|gt|quot|apos|nbsp);|&#(\d+);|&#x([0-9a-fA-F]+);/g;
    CLOSE_RE_CACHE = /* @__PURE__ */ new Map();
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-vm/regex/parser.js
var require_parser = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-vm/regex/parser.js"(exports2, module2) {
    "use strict";
    var T_LIT = 0;
    var T_DOT = 1;
    var T_CLS = 2;
    var T_BOL = 3;
    var T_EOL = 4;
    var T_WB = 5;
    var T_NWB = 6;
    var T_ALT = 7;
    var T_CAT = 8;
    var T_REP = 9;
    var T_GRP = 10;
    var T_NGRP = 11;
    var T_REF = 12;
    var T_LA = 13;
    function syntaxError(msg) {
      const e = new SyntaxError("Invalid regular expression: " + msg);
      return e;
    }
    function foldVariants(cp) {
      const out = [cp];
      if (cp >= 65 && cp <= 90) out.push(cp + 32);
      else if (cp >= 97 && cp <= 122) out.push(cp - 32);
      else if (cp >= 192 && cp <= 214) out.push(cp + 32);
      else if (cp >= 216 && cp <= 222) out.push(cp + 32);
      else if (cp >= 224 && cp <= 246) out.push(cp - 32);
      else if (cp >= 248 && cp <= 254) out.push(cp - 32);
      else if (cp === 304) out.push(305);
      else if (cp === 305) out.push(304);
      else if (cp === 383) out.push(115);
      return out;
    }
    function mergeRanges(rs) {
      if (!rs.length) return rs;
      rs.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const out = [rs[0].slice()];
      for (let i = 1; i < rs.length; i++) {
        const last = out[out.length - 1], cur = rs[i];
        if (cur[0] <= last[1] + 1) {
          if (cur[1] > last[1]) last[1] = cur[1];
        } else out.push(cur.slice());
      }
      return out;
    }
    var CLASS_D = [[48, 57]];
    var CLASS_W = [[48, 57], [65, 90], [95, 95], [97, 122]];
    var CLASS_S = [[9, 13], [32, 32], [160, 160], [5760, 5760], [6158, 6158], [8192, 8202], [8232, 8233], [8239, 8239], [8287, 8287], [12288, 12288], [65279, 65279]];
    var Parser = class {
      constructor(src, flags) {
        this.s = src;
        this.n = src.length;
        this.p = 0;
        this.ignoreCase = !!flags.ignoreCase;
        this.groupCount = 0;
        this.groupNames = [];
      }
      parse() {
        if (this.n === 0) {
          return { t: T_NGRP, x: { t: T_CAT, items: [] } };
        }
        const x = this.parseAlt();
        if (this.p < this.n) throw syntaxError("/" + this.s + "/: unexpected " + this.s[this.p]);
        return x;
      }
      parseAlt() {
        const l = this.parseCat();
        if (this.peek() === "|") {
          this.p++;
          const r = this.parseAlt();
          return { t: T_ALT, l, r };
        }
        return l;
      }
      parseCat() {
        const items = [];
        for (; ; ) {
          const c = this.peek();
          if (c === "" || c === "|" || c === ")") break;
          items.push(this.parseQuant());
        }
        if (items.length === 0) return { t: T_CAT, items: [] };
        if (items.length === 1) return items[0];
        return { t: T_CAT, items };
      }
      parseQuant() {
        const atom = this.parseAtom();
        const c = this.peek();
        let min = 1, max = 1, lazy = false;
        if (c === "*") {
          this.p++;
          min = 0;
          max = Infinity;
        } else if (c === "+") {
          this.p++;
          min = 1;
          max = Infinity;
        } else if (c === "?") {
          this.p++;
          min = 0;
          max = 1;
        } else if (c === "{") {
          const save = this.p;
          this.p++;
          const n1 = this.parseDigits();
          if (n1 === null) {
            this.p = save;
            return atom;
          }
          let n2 = n1;
          if (this.peek() === ",") {
            this.p++;
            if (this.peek() === "}") n2 = Infinity;
            else {
              n2 = this.parseDigits();
              if (n2 === null) {
                this.p = save;
                return atom;
              }
            }
          }
          if (this.peek() !== "}") {
            this.p = save;
            return atom;
          }
          this.p++;
          if (n2 < n1) throw syntaxError("/" + this.s + "/: numbers out of order in {} quantifier");
          min = n1;
          max = n2;
        } else return atom;
        if (this.peek() === "?") {
          this.p++;
          lazy = true;
        }
        return { t: T_REP, x: atom, min, max, lazy };
      }
      parseDigits() {
        let v = 0, found = false;
        while (this.p < this.n) {
          const c = this.s.charCodeAt(this.p);
          if (c < 48 || c > 57) break;
          v = v * 10 + (c - 48);
          if (v > 1e5) throw syntaxError("/" + this.s + "/: quantifier too large");
          found = true;
          this.p++;
        }
        return found ? v : null;
      }
      peek() {
        return this.p < this.n ? this.s[this.p] : "";
      }
      parseAtom() {
        const c = this.peek();
        if (c === "^") {
          this.p++;
          return { t: T_BOL };
        }
        if (c === "$") {
          this.p++;
          return { t: T_EOL };
        }
        if (c === ".") {
          this.p++;
          return { t: T_DOT };
        }
        if (c === "(") return this.parseGroup();
        if (c === "[") return this.parseClass();
        if (c === "\\") return this.parseEscape();
        if (c === "*" || c === "+" || c === "?" || c === "|" || c === ")" || c === "]" || c === "{" || c === "}")
          throw syntaxError("/" + this.s + "/: unexpected quantifier/target " + c);
        this.p++;
        return this.litNode(c);
      }
      litNode(ch) {
        if (this.ignoreCase) {
          const cp = ch.charCodeAt(0);
          const vs = foldVariants(cp);
          if (vs.length > 1) return { t: T_CLS, rs: mergeRanges(vs.map((v) => [v, v])), neg: false };
        }
        return { t: T_LIT, s: ch };
      }
      parseGroup() {
        this.p++;
        if (this.peek() === "?") {
          this.p++;
          const c = this.peek();
          if (c === ":") {
            this.p++;
            const x2 = this.parseAlt();
            this.expect(")");
            return { t: T_NGRP, x: x2 };
          }
          if (c === "=") {
            this.p++;
            const x2 = this.parseAlt();
            this.expect(")");
            return { t: T_LA, x: x2, neg: false };
          }
          if (c === "!") {
            this.p++;
            const x2 = this.parseAlt();
            this.expect(")");
            return { t: T_LA, x: x2, neg: true };
          }
          if (c === "<") {
            if (this.s[this.p + 1] === "=" || this.s[this.p + 1] === "!") throw syntaxError("/" + this.s + "/: lookbehind not supported");
            this.p++;
            let name = "";
            while (this.p < this.n && this.s[this.p] !== ">") {
              name += this.s[this.p];
              this.p++;
            }
            this.expect(">");
            if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) throw syntaxError("/" + this.s + "/: invalid group name");
            const i2 = ++this.groupCount;
            this.groupNames[i2] = name;
            const x2 = this.parseAlt();
            this.expect(")");
            return { t: T_GRP, x: x2, i: i2 };
          }
          throw syntaxError("/" + this.s + "/: unexpected (? " + c);
        }
        const i = ++this.groupCount;
        this.groupNames[i] = null;
        const x = this.parseAlt();
        this.expect(")");
        return { t: T_GRP, x, i };
      }
      expect(ch) {
        if (this.peek() !== ch) throw syntaxError("/" + this.s + "/: expected " + ch);
        this.p++;
      }
      parseClass() {
        this.p++;
        let neg = false;
        if (this.peek() === "^") {
          neg = true;
          this.p++;
        }
        const rs = [];
        let first = true;
        while (this.p < this.n && (this.peek() !== "]" || first)) {
          first = false;
          const lo = this.parseClassAtom();
          if (this.peek() === "-" && this.s[this.p + 1] !== "]") {
            this.p++;
            const hi = this.parseClassAtom();
            if (typeof lo !== "number" || typeof hi !== "number") throw syntaxError("/" + this.s + "/: range over class escape");
            if (hi < lo) throw syntaxError("/" + this.s + "/: range out of order in class");
            rs.push([lo, hi]);
          } else if (typeof lo === "number") rs.push([lo, lo]);
          else rs.push(...lo);
        }
        if (this.p >= this.n) throw syntaxError("/" + this.s + "/: unterminated class");
        this.p++;
        let merged = mergeRanges(rs);
        if (this.ignoreCase) {
          const extra = [];
          for (const [lo, hi] of merged) {
            for (let cp = lo; cp <= hi; cp++) {
              for (const v of foldVariants(cp)) if (v !== cp) extra.push([v, v]);
              if (hi - lo > 512) break;
            }
          }
          merged = mergeRanges(merged.concat(extra));
        }
        return { t: T_CLS, rs: merged, neg };
      }
      // Returns a code point number, or an array of ranges (for \d etc inside class).
      parseClassAtom() {
        const c = this.peek();
        if (c === "\\") {
          this.p++;
          return this.classEscape();
        }
        this.p++;
        return c.charCodeAt(0);
      }
      classEscape() {
        const c = this.peek();
        if (c === "") throw syntaxError("/" + this.s + "/: trailing \\");
        if (c === "d") {
          this.p++;
          return CLASS_D.map((r) => r.slice());
        }
        if (c === "w") {
          this.p++;
          return CLASS_W.map((r) => r.slice());
        }
        if (c === "s") {
          this.p++;
          return CLASS_S.map((r) => r.slice());
        }
        if (c === "D" || c === "W" || c === "S") throw syntaxError("/" + this.s + "/: \\" + c + " not allowed in class (negated class)");
        if (c === "b") {
          this.p++;
          return 8;
        }
        const v = this.simpleEscape(c);
        if (v !== null) {
          this.p++;
          return v;
        }
        if (c === "x" || c === "u") {
          return this.hexEscape();
        }
        if (c >= "0" && c <= "9") throw syntaxError("/" + this.s + "/: octal escapes not supported");
        this.p++;
        return c.charCodeAt(0);
      }
      simpleEscape(c) {
        switch (c) {
          case "n":
            return 10;
          case "r":
            return 13;
          case "t":
            return 9;
          case "f":
            return 12;
          case "v":
            return 11;
          case "0":
            return 0;
          default:
            return null;
        }
      }
      hexEscape() {
        const c = this.peek();
        this.p++;
        const want = c === "x" ? 2 : 4;
        let v = 0;
        for (let i = 0; i < want; i++) {
          const h = this.peek();
          const d = h >= "0" && h <= "9" ? h.charCodeAt(0) - 48 : h >= "a" && h <= "f" ? h.charCodeAt(0) - 87 : h >= "A" && h <= "F" ? h.charCodeAt(0) - 55 : -1;
          if (d < 0) throw syntaxError("/" + this.s + "/: bad hex escape");
          v = v * 16 + d;
          this.p++;
        }
        return v;
      }
      parseEscape() {
        this.p++;
        const c = this.peek();
        if (c === "") throw syntaxError("/" + this.s + "/: trailing \\");
        if (c === "d") {
          this.p++;
          return this.mkClass(CLASS_D, false);
        }
        if (c === "D") {
          this.p++;
          return this.mkClass(CLASS_D, true);
        }
        if (c === "w") {
          this.p++;
          return this.mkClass(CLASS_W, false);
        }
        if (c === "W") {
          this.p++;
          return this.mkClass(CLASS_W, true);
        }
        if (c === "s") {
          this.p++;
          return this.mkClass(CLASS_S, false);
        }
        if (c === "S") {
          this.p++;
          return this.mkClass(CLASS_S, true);
        }
        if (c === "b") {
          this.p++;
          return { t: T_WB };
        }
        if (c === "B") {
          this.p++;
          return { t: T_NWB };
        }
        const sv = this.simpleEscape(c);
        if (sv !== null) {
          this.p++;
          return this.litNode(String.fromCharCode(sv));
        }
        if (c === "x" || c === "u") {
          const v = this.hexEscape();
          return this.litNode(String.fromCharCode(v));
        }
        if (c >= "1" && c <= "9") {
          let v = 0;
          while (this.p < this.n && this.s[this.p] >= "0" && this.s[this.p] <= "9") {
            v = v * 10 + (this.s.charCodeAt(this.p) - 48);
            this.p++;
          }
          if (v > this.groupCount) throw syntaxError("/" + this.s + "/: backreference to undefined group");
          return { t: T_REF, i: v };
        }
        if (c === "0") {
          this.p++;
          return this.litNode(String.fromCharCode(0));
        }
        if (c === "k") {
          this.p++;
          if (this.peek() !== "<") throw syntaxError("/" + this.s + "/: expected < after \\k");
          this.p++;
          let name = "";
          while (this.p < this.n && this.s[this.p] !== ">") {
            name += this.s[this.p];
            this.p++;
          }
          this.expect(">");
          const idx = this.groupNames.indexOf(name);
          if (idx < 1) throw syntaxError("/" + this.s + "/: backreference to undefined group name");
          return { t: T_REF, i: idx };
        }
        this.p++;
        return this.litNode(c);
      }
      mkClass(base, neg) {
        let rs = mergeRanges(base.map((r) => r.slice()));
        if (this.ignoreCase) {
          const extra = [];
          for (const [lo, hi] of rs) for (let cp = lo; cp <= hi; cp++) for (const v of foldVariants(cp)) if (v !== cp) extra.push([v, v]);
          rs = mergeRanges(rs.concat(extra));
        }
        return { t: T_CLS, rs, neg };
      }
    };
    function parseRegexSource(src, flags) {
      const p = new Parser(src, flags);
      const ast = p.parse();
      return { ast, groupCount: p.groupCount, groupNames: p.groupNames };
    }
    module2.exports = { parseRegexSource, T_LIT, T_DOT, T_CLS, T_BOL, T_EOL, T_WB, T_NWB, T_ALT, T_CAT, T_REP, T_GRP, T_NGRP, T_REF, T_LA };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-vm/regex/engine.js
var require_engine = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-vm/regex/engine.js"(exports2, module2) {
    "use strict";
    var {
      T_LIT,
      T_DOT,
      T_CLS,
      T_BOL,
      T_EOL,
      T_WB,
      T_NWB,
      T_ALT,
      T_CAT,
      T_REP,
      T_GRP,
      T_NGRP,
      T_REF,
      T_LA
    } = require_parser();
    var OP_CHAR = 0;
    var OP_CLS = 1;
    var OP_ANY = 2;
    var OP_MATCH = 3;
    var OP_JMP = 4;
    var OP_SPLIT = 5;
    var OP_SAVE = 6;
    var OP_BOL = 7;
    var OP_EOL = 8;
    var OP_WB = 9;
    var OP_NWB = 10;
    function astHas(node, types) {
      if (!node) return false;
      if (types.has(node.t)) return true;
      switch (node.t) {
        case T_ALT:
          return astHas(node.l, types) || astHas(node.r, types);
        case T_CAT:
          return node.items.some((x) => astHas(x, types));
        case T_REP:
          return astHas(node.x, types);
        case T_GRP:
        case T_NGRP:
        case T_LA:
          return astHas(node.x, types);
        default:
          return false;
      }
    }
    function literalPrefix(node) {
      switch (node.t) {
        case T_LIT:
          return node.s;
        case T_CAT: {
          let out = "";
          for (const x of node.items) {
            if (x.t === T_LIT) {
              out += x.s;
              continue;
            }
            if (x.t === T_BOL || x.t === T_WB || x.t === T_NWB) continue;
            break;
          }
          return out;
        }
        default:
          return "";
      }
    }
    function isPureLiteral(node) {
      if (node.t === T_LIT) return true;
      if (node.t === T_CAT) return node.items.every(isPureLiteral);
      if (node.t === T_NGRP) return isPureLiteral(node.x);
      return false;
    }
    function literalOf(node) {
      if (node.t === T_LIT) return node.s;
      if (node.t === T_CAT) return node.items.map(literalOf).join("");
      if (node.t === T_NGRP) return literalOf(node.x);
      return "";
    }
    function bmhSkipTable(needle) {
      const m = needle.length;
      const skip = new Int32Array(65536);
      skip.fill(m);
      for (let i = 0; i < m - 1; i++) skip[needle.charCodeAt(i)] = m - 1 - i;
      return { skip, m };
    }
    function bmhSearch(hay, needle, table, from) {
      const n2 = hay.length, m = table.m;
      if (m === 0) return from <= n2 ? from : -1;
      if (m === 1) {
        const c = needle.charCodeAt(0);
        for (let i2 = from; i2 < n2; i2++) if (hay.charCodeAt(i2) === c) return i2;
        return -1;
      }
      let i = from;
      while (i <= n2 - m) {
        let j = m - 1;
        while (j >= 0 && hay.charCodeAt(i + j) === needle.charCodeAt(j)) j--;
        if (j < 0) return i;
        i += table.skip[hay.charCodeAt(i + m - 1)];
      }
      return -1;
    }
    var PikeBuilder = class {
      constructor(flags) {
        this.ins = [];
        this.classes = [];
        this.multiline = !!flags.multiline;
        this.dotAll = !!flags.dotAll;
      }
      emit(op, a, b) {
        this.ins.push([op, a | 0, b | 0]);
        return this.ins.length - 1;
      }
      patchList(list, target) {
        for (const a of list) this.ins[a][1] = target;
      }
      addClass(rs) {
        this.classes.push(rs);
        return this.classes.length - 1;
      }
      build(node, nsave) {
        const frag = this.gen(node);
        const m = this.emit(OP_MATCH, 0, 0);
        this.patchList(frag.out, m);
        return { ins: this.ins, classes: this.classes, nsave };
      }
      // Single non-branching instruction frag.
      one(op, a, b) {
        const at = this.emit(op, a, b);
        const j = this.emit(OP_JMP, 0, 0);
        return { start: at, out: [j] };
      }
      gen(node) {
        switch (node.t) {
          case T_LIT: {
            const s = node.s;
            if (!s.length) {
              const j2 = this.emit(OP_JMP, 0, 0);
              return { start: j2, out: [j2] };
            }
            const start = this.emit(OP_CHAR, s.charCodeAt(0), 0);
            for (let i = 1; i < s.length; i++) this.emit(OP_CHAR, s.charCodeAt(i), 0);
            const j = this.emit(OP_JMP, 0, 0);
            return { start, out: [j] };
          }
          case T_DOT:
            return this.one(OP_ANY, 0, 0);
          case T_CLS: {
            const id = this.addClass(node.rs);
            return this.one(OP_CLS, id, node.neg ? 1 : 0);
          }
          case T_BOL:
            return this.one(OP_BOL, 0, 0);
          case T_EOL:
            return this.one(OP_EOL, 0, 0);
          case T_WB:
            return this.one(OP_WB, 0, 0);
          case T_NWB:
            return this.one(OP_NWB, 0, 0);
          case T_CAT: {
            if (!node.items.length) {
              const j = this.emit(OP_JMP, 0, 0);
              return { start: j, out: [j] };
            }
            let f = this.gen(node.items[0]);
            for (let i = 1; i < node.items.length; i++) {
              const g = this.gen(node.items[i]);
              this.patchList(f.out, g.start);
              f = { start: f.start, out: g.out };
            }
            return f;
          }
          case T_ALT: {
            const s = this.emit(OP_SPLIT, 0, 0);
            const l = this.gen(node.l);
            const j = this.emit(OP_JMP, 0, 0);
            const r = this.gen(node.r);
            this.ins[s][1] = l.start;
            this.ins[s][2] = r.start;
            return { start: s, out: l.out.concat([j], r.out) };
          }
          case T_REP:
            return this.genRep(node);
          case T_GRP: {
            const s0 = this.emit(OP_SAVE, (node.i - 1) * 2, 0);
            const g = this.gen(node.x);
            const s1 = this.emit(OP_SAVE, (node.i - 1) * 2 + 1, 0);
            const j = this.emit(OP_JMP, 0, 0);
            this.patchList(g.out, s1);
            void s0;
            return { start: s0, out: [j] };
          }
          case T_NGRP:
            return this.gen(node.x);
          default:
            throw new Error("pike: unsupported node t=" + node.t);
        }
      }
      genRep(node) {
        const { x, min, max, lazy } = node;
        let f = null;
        for (let i = 0; i < min; i++) {
          const g = this.gen(x);
          if (!f) f = g;
          else {
            this.patchList(f.out, g.start);
            f = { start: f.start, out: g.out };
          }
        }
        const opt = max === Infinity ? Infinity : max - min;
        if (opt === 0) {
          if (!f) {
            const j = this.emit(OP_JMP, 0, 0);
            return { start: j, out: [j] };
          }
          return f;
        }
        if (opt === Infinity) {
          const s = this.emit(OP_SPLIT, 0, 0);
          const b = this.gen(x);
          const back = this.emit(OP_JMP, 0, 0);
          const exitJ = this.emit(OP_JMP, 0, 0);
          if (!lazy) {
            this.ins[s][1] = b.start;
            this.ins[s][2] = exitJ;
          } else {
            this.ins[s][1] = exitJ;
            this.ins[s][2] = b.start;
          }
          this.ins[back][1] = s;
          this.patchList(b.out, back);
          const loop = { start: s, out: [exitJ] };
          if (!f) return loop;
          this.patchList(f.out, s);
          return { start: f.start, out: [exitJ] };
        }
        let head = null, tailOut = null;
        for (let i = 0; i < opt; i++) {
          const s = this.emit(OP_SPLIT, 0, 0);
          const b = this.gen(x);
          if (!lazy) {
            this.ins[s][1] = b.start;
          } else {
            this.ins[s][2] = b.start;
          }
          this.patchList(b.out, this.ins.length);
          if (!head) head = { start: s };
          else {
            if (!lazy) this.ins[tailOut.s][2] = s;
            else this.ins[tailOut.s][1] = s;
          }
          tailOut = { s };
        }
        const endJ = this.emit(OP_JMP, 0, 0);
        if (!lazy) this.ins[tailOut.s][2] = endJ;
        else this.ins[tailOut.s][1] = endJ;
        const optFrag = { start: head.start, out: [endJ] };
        if (!f) return optFrag;
        this.patchList(f.out, head.start);
        return { start: f.start, out: [endJ] };
      }
    };
    function isWordChar(cp) {
      return cp >= 48 && cp <= 57 || cp >= 65 && cp <= 90 || cp >= 97 && cp <= 122 || cp === 95;
    }
    var PikeRunner = class {
      constructor(prog, flags) {
        this.ins = prog.ins;
        this.classes = prog.classes;
        this.nsave = prog.nsave;
        this.multiline = !!flags.multiline;
        this.dotAll = !!flags.dotAll;
        this.clist = [];
        this.nlist = [];
        this.stamp = new Int32Array(this.ins.length);
        this.gen = 1;
      }
      // -1-filled caps array: -1 = group did not participate.
      allocCaps() {
        const a = new Int32Array(Math.max(2, this.nsave));
        a.fill(-1);
        return a;
      }
      // Try match starting at `from`. Returns {end, caps} or null.
      // capsOut: Int32Array to receive save slots (may be null).
      matchAt(input, from, capsOut) {
        const ins = this.ins, n2 = input.length;
        let clist = this.clist, nlist = this.nlist;
        clist.length = 0;
        const gen = ++this.gen;
        if (!this.addThread(0, from, input, clist, gen, null)) return null;
        let pos = from;
        let pendPos = -1, pendCaps = null;
        const dotAll = this.dotAll, classes = this.classes;
        const canConsume = (t, c) => {
          const o = ins[t.pc];
          switch (o[0]) {
            case OP_CHAR:
              return c === o[1];
            case OP_CLS:
              return classHas(classes[o[1]], c) !== !!o[2];
            case OP_ANY:
              return dotAll || c !== 10 && c !== 13 && c !== 8232 && c !== 8233;
            default:
              return false;
          }
        };
        for (; ; ) {
          if (pos >= n2) {
            for (let i = 0; i < clist.length; i++) {
              const t = clist[i];
              if (ins[t.pc][0] === OP_MATCH) {
                if (capsOut) capsOut.set(t.caps);
                this.clist = clist;
                this.nlist = nlist;
                return { end: pos, caps: t.caps };
              }
            }
            this.clist = clist;
            this.nlist = nlist;
            if (pendPos >= 0) {
              if (capsOut) capsOut.set(pendCaps);
              return { end: pendPos, caps: pendCaps };
            }
            return null;
          }
          const c = input.charCodeAt(pos);
          let firstMatch = -1, firstConsumer = -1;
          for (let i = 0; i < clist.length; i++) {
            const t = clist[i];
            if (ins[t.pc][0] === OP_MATCH) {
              if (firstMatch < 0) firstMatch = i;
            } else if (firstConsumer < 0 && canConsume(t, c)) firstConsumer = i;
            if (firstMatch >= 0 && firstConsumer >= 0) break;
          }
          if (firstMatch >= 0 && (firstConsumer < 0 || firstMatch < firstConsumer)) {
            const t = clist[firstMatch];
            if (capsOut) capsOut.set(t.caps);
            this.clist = clist;
            this.nlist = nlist;
            return { end: pos, caps: t.caps };
          }
          if (firstMatch >= 0) {
            pendPos = pos;
            pendCaps = clist[firstMatch].caps;
          }
          if (firstConsumer < 0) {
            this.clist = clist;
            this.nlist = nlist;
            if (pendPos >= 0) {
              if (capsOut) capsOut.set(pendCaps);
              return { end: pendPos, caps: pendCaps };
            }
            return null;
          }
          nlist.length = 0;
          const gen2 = ++this.gen;
          for (let i = 0; i < clist.length; i++) {
            const t = clist[i];
            if (canConsume(t, c)) this.addThread(t.pc + 1, pos + 1, input, nlist, gen2, t.caps);
          }
          const tmp = clist;
          clist = nlist;
          nlist = tmp;
          pos++;
        }
      }
      // Single-pass unanchored search. Runs ONE NFA simulation across the input,
      // injecting a new start thread at each position. Per-pc we keep the
      // earliest start (leftmost priority). Linear time — no quadratic retry.
      // Returns {index, end, caps} or null.
      searchUnanchored(input, fromPos, capsOut) {
        const ins = this.ins, n2 = input.length;
        const dotAll = this.dotAll, classes = this.classes;
        const stamp = this.stamp;
        let clist = this.clist, nlist = this.nlist;
        clist.length = 0;
        const canConsume = (t, c) => {
          const o = ins[t.pc];
          switch (o[0]) {
            case OP_CHAR:
              return c === o[1];
            case OP_CLS:
              return classHas(classes[o[1]], c) !== !!o[2];
            case OP_ANY:
              return dotAll || c !== 10 && c !== 13 && c !== 8232 && c !== 8233;
            default:
              return false;
          }
        };
        const injectStart = (pos, list) => {
          const gen = ++this.gen;
          const stackPc = [0], stackCaps = [null];
          while (stackPc.length) {
            const p = stackPc.pop();
            const cur = stackCaps.pop();
            if (stamp[p] === gen) continue;
            stamp[p] = gen;
            const o = ins[p];
            switch (o[0]) {
              case OP_JMP:
                stackPc.push(o[1]);
                stackCaps.push(cur);
                break;
              case OP_SPLIT:
                stackPc.push(o[2]);
                stackCaps.push(cur);
                stackPc.push(o[1]);
                stackCaps.push(cur);
                break;
              case OP_SAVE: {
                const nc = cur ? cur.slice() : this.allocCaps();
                nc[o[1]] = pos;
                stackPc.push(p + 1);
                stackCaps.push(nc);
                break;
              }
              case OP_BOL: {
                const ok = pos === 0 || this.multiline && pos > 0 && input.charCodeAt(pos - 1) === 10;
                if (ok) {
                  stackPc.push(p + 1);
                  stackCaps.push(cur);
                }
                break;
              }
              case OP_EOL: {
                const ok = pos === n2 || this.multiline && pos < n2 && input.charCodeAt(pos) === 10;
                if (ok) {
                  stackPc.push(p + 1);
                  stackCaps.push(cur);
                }
                break;
              }
              case OP_WB: {
                const a = pos > 0 && isWordChar(input.charCodeAt(pos - 1));
                const b = pos < n2 && isWordChar(input.charCodeAt(pos));
                if (a !== b) {
                  stackPc.push(p + 1);
                  stackCaps.push(cur);
                }
                break;
              }
              case OP_NWB: {
                const a = pos > 0 && isWordChar(input.charCodeAt(pos - 1));
                const b = pos < n2 && isWordChar(input.charCodeAt(pos));
                if (a === b) {
                  stackPc.push(p + 1);
                  stackCaps.push(cur);
                }
                break;
              }
              default:
                let dup = false;
                for (let i = 0; i < list.length; i++) {
                  if (list[i].pc === p) {
                    dup = true;
                    break;
                  }
                }
                if (!dup) list.push({ pc: p, caps: cur || this.allocCaps(), start: pos });
                break;
            }
          }
        };
        let pendStart = -1, pendEnd = -1, pendCaps = null;
        for (let pos = fromPos; pos <= n2; pos++) {
          injectStart(pos, clist);
          if (pos >= n2) {
            for (let i = 0; i < clist.length; i++) {
              const t = clist[i];
              if (ins[t.pc][0] === OP_MATCH) {
                if (capsOut) capsOut.set(t.caps);
                this.clist = clist;
                this.nlist = nlist;
                return { index: t.start, end: pos, caps: t.caps };
              }
            }
            break;
          }
          const c = input.charCodeAt(pos);
          let firstMatch = -1, firstConsumer = -1;
          for (let i = 0; i < clist.length; i++) {
            const t = clist[i];
            if (ins[t.pc][0] === OP_MATCH) {
              if (firstMatch < 0) firstMatch = i;
            } else if (firstConsumer < 0 && canConsume(t, c)) firstConsumer = i;
            if (firstMatch >= 0 && firstConsumer >= 0) break;
          }
          if (firstMatch >= 0 && (firstConsumer < 0 || firstMatch < firstConsumer)) {
            const t = clist[firstMatch];
            if (capsOut) capsOut.set(t.caps);
            this.clist = clist;
            this.nlist = nlist;
            return { index: t.start, end: pos, caps: t.caps };
          }
          if (firstMatch >= 0) {
            const t = clist[firstMatch];
            pendStart = t.start;
            pendEnd = pos;
            pendCaps = t.caps;
          }
          if (firstConsumer < 0) {
            if (pendStart >= 0) {
              if (capsOut) capsOut.set(pendCaps);
              this.clist = clist;
              this.nlist = nlist;
              return { index: pendStart, end: pendEnd, caps: pendCaps };
            }
            clist.length = 0;
            continue;
          }
          nlist.length = 0;
          const gen2 = ++this.gen;
          for (let i = 0; i < clist.length; i++) {
            const t = clist[i];
            if (!canConsume(t, c)) continue;
            const stackPc = [t.pc + 1], stackCaps = [t.caps];
            while (stackPc.length) {
              const p = stackPc.pop();
              const cur = stackCaps.pop();
              if (stamp[p] === gen2) continue;
              stamp[p] = gen2;
              const o = ins[p];
              switch (o[0]) {
                case OP_JMP:
                  stackPc.push(o[1]);
                  stackCaps.push(cur);
                  break;
                case OP_SPLIT:
                  stackPc.push(o[2]);
                  stackCaps.push(cur);
                  stackPc.push(o[1]);
                  stackCaps.push(cur);
                  break;
                case OP_SAVE: {
                  const nc = cur.slice();
                  nc[o[1]] = pos + 1;
                  stackPc.push(p + 1);
                  stackCaps.push(nc);
                  break;
                }
                case OP_BOL: {
                  const ok = pos + 1 === 0 || this.multiline && input.charCodeAt(pos) === 10;
                  if (ok) {
                    stackPc.push(p + 1);
                    stackCaps.push(cur);
                  }
                  break;
                }
                case OP_EOL: {
                  const ok = pos + 1 === n2 || this.multiline && pos + 1 < n2 && input.charCodeAt(pos + 1) === 10;
                  if (ok) {
                    stackPc.push(p + 1);
                    stackCaps.push(cur);
                  }
                  break;
                }
                case OP_WB: {
                  const a = isWordChar(input.charCodeAt(pos));
                  const b = pos + 1 < n2 && isWordChar(input.charCodeAt(pos + 1));
                  if (a !== b) {
                    stackPc.push(p + 1);
                    stackCaps.push(cur);
                  }
                  break;
                }
                case OP_NWB: {
                  const a = isWordChar(input.charCodeAt(pos));
                  const b = pos + 1 < n2 && isWordChar(input.charCodeAt(pos + 1));
                  if (a === b) {
                    stackPc.push(p + 1);
                    stackCaps.push(cur);
                  }
                  break;
                }
                default: {
                  let dup = false;
                  for (let k = 0; k < nlist.length; k++) {
                    if (nlist[k].pc === p) {
                      dup = true;
                      break;
                    }
                  }
                  if (!dup) nlist.push({ pc: p, caps: cur || this.allocCaps(), start: t.start });
                  break;
                }
              }
            }
          }
          const tmp = clist;
          clist = nlist;
          nlist = tmp;
        }
        this.clist = clist;
        this.nlist = nlist;
        if (pendStart >= 0) {
          if (capsOut) capsOut.set(pendCaps);
          return { index: pendStart, end: pendEnd, caps: pendCaps };
        }
        return null;
      }
      // Epsilon closure: add thread for pc at position pos.
      // Uses explicit frames so SAVE slot updates travel with each pc.
      addThread(pc, pos, input, list, gen, caps) {
        const ins = this.ins, stamp = this.stamp, n2 = input.length;
        const nsave = Math.max(2, this.nsave);
        const stackPc = [pc];
        const stackCaps = [caps];
        while (stackPc.length) {
          const p = stackPc.pop();
          let cur = stackCaps.pop();
          if (stamp[p] === gen) continue;
          stamp[p] = gen;
          const o = ins[p];
          switch (o[0]) {
            case OP_JMP:
              stackPc.push(o[1]);
              stackCaps.push(cur);
              break;
            case OP_SPLIT:
              stackPc.push(o[2]);
              stackCaps.push(cur);
              stackPc.push(o[1]);
              stackCaps.push(cur);
              break;
            case OP_SAVE: {
              const nc = cur ? cur.slice() : this.allocCaps();
              nc[o[1]] = pos;
              stackPc.push(p + 1);
              stackCaps.push(nc);
              break;
            }
            case OP_BOL: {
              const ok = pos === 0 || this.multiline && pos > 0 && input.charCodeAt(pos - 1) === 10;
              if (ok) {
                stackPc.push(p + 1);
                stackCaps.push(cur);
              }
              break;
            }
            case OP_EOL: {
              const ok = pos === n2 || this.multiline && pos < n2 && input.charCodeAt(pos) === 10;
              if (ok) {
                stackPc.push(p + 1);
                stackCaps.push(cur);
              }
              break;
            }
            case OP_WB: {
              const a = pos > 0 && isWordChar(input.charCodeAt(pos - 1));
              const b = pos < n2 && isWordChar(input.charCodeAt(pos));
              if (a !== b) {
                stackPc.push(p + 1);
                stackCaps.push(cur);
              }
              break;
            }
            case OP_NWB: {
              const a = pos > 0 && isWordChar(input.charCodeAt(pos - 1));
              const b = pos < n2 && isWordChar(input.charCodeAt(pos));
              if (a === b) {
                stackPc.push(p + 1);
                stackCaps.push(cur);
              }
              break;
            }
            case OP_MATCH:
              list.push({ pc: p, caps: cur || this.allocCaps() });
              break;
            default:
              list.push({ pc: p, caps: cur || this.allocCaps() });
              break;
          }
        }
        return true;
      }
    };
    function classHas(rs, c) {
      let lo = 0, hi = rs.length - 1;
      while (lo <= hi) {
        const m = lo + hi >> 1;
        if (c < rs[m][0]) hi = m - 1;
        else if (c > rs[m][1]) lo = m + 1;
        else return true;
      }
      return false;
    }
    var Backtracker = class {
      constructor(ast, flags, nGroups) {
        this.ast = ast;
        this.multiline = !!flags.multiline;
        this.dotAll = !!flags.dotAll;
        this.nGroups = nGroups;
        this.steps = 0;
        this.budget = 1e6;
        this.input = "";
      }
      matchAt(input, from) {
        this.input = input;
        this.steps = 0;
        this.result = null;
        const caps = new Array(this.nGroups * 2).fill(-1);
        const ok = this.match(this.ast, from, caps, (pos, c) => {
          this.result = { end: pos, caps: c.slice() };
          return true;
        });
        return ok && this.result ? this.result : null;
      }
      // Returns true if cont-chain succeeded (stop backtracking), false to try next option.
      match(node, pos, caps, cont) {
        if (++this.steps > this.budget) return false;
        const input = this.input, n2 = input.length;
        switch (node.t) {
          case T_LIT: {
            const s = node.s, m = s.length;
            if (pos + m > n2) return false;
            for (let i = 0; i < m; i++)
              if (input.charCodeAt(pos + i) !== s.charCodeAt(i)) return false;
            return cont(pos + m, caps);
          }
          case T_DOT: {
            if (pos >= n2) return false;
            const c = input.charCodeAt(pos);
            if (!this.dotAll && (c === 10 || c === 13 || c === 8232 || c === 8233)) return false;
            return cont(pos + 1, caps);
          }
          case T_CLS: {
            if (pos >= n2) return false;
            const hit = classHas(node.rs, input.charCodeAt(pos));
            return hit !== node.neg ? cont(pos + 1, caps) : false;
          }
          case T_BOL:
            return pos === 0 || this.multiline && pos > 0 && input.charCodeAt(pos - 1) === 10 ? cont(pos, caps) : false;
          case T_EOL:
            return pos === n2 || this.multiline && pos < n2 && input.charCodeAt(pos) === 10 ? cont(pos, caps) : false;
          case T_WB: {
            const a = pos > 0 && isWordChar(input.charCodeAt(pos - 1));
            const b = pos < n2 && isWordChar(input.charCodeAt(pos));
            return a !== b ? cont(pos, caps) : false;
          }
          case T_NWB: {
            const a = pos > 0 && isWordChar(input.charCodeAt(pos - 1));
            const b = pos < n2 && isWordChar(input.charCodeAt(pos));
            return a === b ? cont(pos, caps) : false;
          }
          case T_ALT: {
            const s = caps.slice();
            if (this.match(node.l, pos, caps, cont)) return true;
            for (let i = 0; i < s.length; i++) caps[i] = s[i];
            return this.match(node.r, pos, caps, cont);
          }
          case T_CAT: {
            const items = node.items;
            const rec = (i, p, c) => {
              if (i === items.length) return cont(p, c);
              return this.match(items[i], p, c, (p2, c2) => rec(i + 1, p2, c2));
            };
            return rec(0, pos, caps);
          }
          case T_REP:
            return this.matchRep(node, pos, caps, cont);
          case T_GRP: {
            const gi = (node.i - 1) * 2;
            const o0 = caps[gi], o1 = caps[gi + 1];
            caps[gi] = pos;
            const r = this.match(node.x, pos, caps, (p2, c2) => {
              const prev = c2[gi + 1];
              c2[gi + 1] = p2;
              const rr = cont(p2, c2);
              if (!rr) c2[gi + 1] = prev;
              return rr;
            });
            if (!r) {
              caps[gi] = o0;
              caps[gi + 1] = o1;
            }
            return r;
          }
          case T_NGRP:
            return this.match(node.x, pos, caps, cont);
          case T_REF: {
            const gi = (node.i - 1) * 2;
            const s = caps[gi], e = caps[gi + 1];
            if (s < 0 || e < 0 || e < s) return cont(pos, caps);
            const len = e - s;
            if (pos + len > n2) return false;
            for (let k = 0; k < len; k++)
              if (input.charCodeAt(pos + k) !== input.charCodeAt(s + k)) return false;
            return cont(pos + len, caps);
          }
          case T_LA: {
            const probe = this.match(node.x, pos, caps.slice(), () => true);
            return probe !== false !== node.neg ? cont(pos, caps) : false;
          }
          default:
            return false;
        }
      }
      matchRep(node, pos, caps, cont) {
        const { x, min, max, lazy } = node;
        const self2 = this;
        function tryN(c, p, cp) {
          if (lazy) {
            if (c >= min) {
              if (cont(p, cp)) return true;
            }
            if (c < max) {
              const s = cp.slice();
              return self2.match(x, p, cp, (p2, c2) => {
                if (p2 === p) return cont(p, c2);
                return tryN(c + 1, p2, c2);
              }) || false;
            }
            return false;
          } else {
            if (c < max) {
              const s = cp.slice();
              if (self2.match(x, p, cp, (p2, c2) => {
                if (p2 === p) return cont(p, c2);
                return tryN(c + 1, p2, c2);
              })) return true;
              for (let i = 0; i < s.length; i++) cp[i] = s[i];
            }
            if (c >= min) return cont(p, cp);
            return false;
          }
        }
        return tryN(0, pos, caps);
      }
    };
    module2.exports = {
      PikeBuilder,
      PikeRunner,
      Backtracker,
      bmhSkipTable,
      bmhSearch,
      literalPrefix,
      isPureLiteral,
      literalOf,
      astHas,
      T_REF,
      T_LA
    };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-vm/regex/index.js
var require_regex = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-vm/regex/index.js"(exports2, module2) {
    "use strict";
    var { parseRegexSource, T_BOL, T_CAT, T_NGRP } = require_parser();
    var {
      PikeBuilder,
      PikeRunner,
      Backtracker,
      bmhSkipTable,
      bmhSearch,
      literalPrefix,
      isPureLiteral,
      literalOf,
      astHas,
      T_REF,
      T_LA
    } = require_engine();
    var FLAG_ORDER = "dgi msuvy".replace(/ /g, "");
    var VALID_FLAGS = /* @__PURE__ */ new Set(["d", "g", "i", "m", "s", "u", "v", "y"]);
    function parseFlags(flagStr) {
      const f = String(flagStr || "");
      const seen = /* @__PURE__ */ new Set();
      const out = { raw: "" };
      for (const ch of f) {
        if (!VALID_FLAGS.has(ch)) throw new SyntaxError("Invalid regular expression flags: " + flagStr);
        if (seen.has(ch)) throw new SyntaxError("Invalid regular expression flags: " + flagStr);
        seen.add(ch);
      }
      out.global = seen.has("g");
      out.ignoreCase = seen.has("i");
      out.multiline = seen.has("m");
      out.dotAll = seen.has("s");
      out.unicode = seen.has("u");
      out.unicodeSets = seen.has("v");
      out.sticky = seen.has("y");
      out.hasIndices = seen.has("d");
      if (out.unicodeSets) throw new SyntaxError("Invalid regular expression flags: v (unicodeSets not supported)");
      out.raw = [...seen].sort((a, b) => FLAG_ORDER.indexOf(a) - FLAG_ORDER.indexOf(b)).join("");
      return out;
    }
    var COMPILE_CACHE = /* @__PURE__ */ new Map();
    var COMPILE_CACHE_MAX = 256;
    function getOrCompile(source, flags) {
      const key = source + "\0" + flags.raw;
      let c = COMPILE_CACHE.get(key);
      if (c) {
        COMPILE_CACHE.delete(key);
        COMPILE_CACHE.set(key, c);
        return c;
      }
      c = compilePattern(source, flags);
      if (COMPILE_CACHE.size >= COMPILE_CACHE_MAX) {
        const oldest = COMPILE_CACHE.keys().next().value;
        COMPILE_CACHE.delete(oldest);
      }
      COMPILE_CACHE.set(key, c);
      return c;
    }
    function compilePattern(source, flags) {
      const { ast, groupCount, groupNames } = parseRegexSource(source, flags);
      const needsBT = astHas(ast, /* @__PURE__ */ new Set([T_REF, T_LA]));
      if (!needsBT && isPureLiteral(ast)) {
        const lit = literalOf(ast);
        return { tier: "lit", lit, table: bmhSkipTable(lit), groupCount, groupNames, source, flags };
      }
      if (!needsBT) {
        const builder = new PikeBuilder(flags);
        const prog = builder.build(ast, groupCount * 2);
        const prefix = literalPrefix(ast);
        const usePrefix = prefix.length >= 3;
        return {
          tier: "pike",
          prog,
          runner: null,
          prefix: usePrefix ? prefix : "",
          table: usePrefix ? bmhSkipTable(prefix) : null,
          anchored: isAnchored(ast),
          groupCount,
          groupNames,
          source,
          flags
        };
      }
      return { tier: "bt", ast, groupCount, groupNames, source, flags };
    }
    function isAnchored(ast) {
      if (ast.t === T_BOL) return true;
      if (ast.t === T_CAT && ast.items.length && ast.items[0].t === T_BOL) return true;
      if (ast.t === T_NGRP) return isAnchored(ast.x);
      return false;
    }
    function advanceIndex(s, i) {
      return i + 1;
    }
    var MerkavaRegExp = class _MerkavaRegExp {
      constructor(pattern, flags) {
        if (pattern instanceof _MerkavaRegExp) {
          if (flags !== void 0) throw new TypeError("Cannot supply flags when constructing from RegExp");
          this._source = pattern._source;
          this._flags = pattern._flags;
          this._c = pattern._c;
          this.lastIndex = pattern.lastIndex;
          return;
        }
        let src, fl;
        if (pattern !== null && typeof pattern === "object" && typeof pattern.source === "string") {
          src = pattern.source;
          fl = parseFlags(flags !== void 0 ? flags : typeof pattern.flags === "string" ? pattern.flags : "");
        } else {
          src = pattern === void 0 ? "" : String(pattern);
          fl = parseFlags(flags);
        }
        this._source = src;
        this._flags = fl;
        this._c = getOrCompile(src, fl);
        this.lastIndex = 0;
      }
      get source() {
        return this._source;
      }
      get flags() {
        return this._flags.raw;
      }
      get global() {
        return this._flags.global;
      }
      get ignoreCase() {
        return this._flags.ignoreCase;
      }
      get multiline() {
        return this._flags.multiline;
      }
      get dotAll() {
        return this._flags.dotAll;
      }
      get sticky() {
        return this._flags.sticky;
      }
      get unicode() {
        return this._flags.unicode;
      }
      get hasIndices() {
        return this._flags.hasIndices;
      }
      toString() {
        return "/" + this._source + "/" + this._flags.raw;
      }
      // Marker for the JSON compiler passthrough (mirrors instanceof RegExp).
      get __isMerkavaRegExp() {
        return true;
      }
      // ---- core search driver ----
      // Returns {index, end, caps} or null. Respects sticky/global lastIndex.
      _newCaps() {
        const a = new Int32Array(Math.max(2, this._c.groupCount * 2));
        a.fill(-1);
        return a;
      }
      // Fast boolean test: no match array, no caps allocation on lit tier.
      _testFrom(input, fromPos, stickyOnly) {
        const c = this._c, n2 = input.length;
        if (c.tier === "lit") {
          const lit = c.lit, m = lit.length;
          if (m === 0) return !(stickyOnly && fromPos > n2) && fromPos <= n2;
          if (stickyOnly) {
            if (fromPos + m > n2) return false;
            for (let i = 0; i < m; i++)
              if (input.charCodeAt(fromPos + i) !== lit.charCodeAt(i)) return false;
            return true;
          }
          return bmhSearch(input, lit, c.table, fromPos) >= 0;
        }
        return this._searchFrom(input, fromPos, stickyOnly) !== null;
      }
      _searchFrom(input, fromPos, stickyOnly) {
        const c = this._c, n2 = input.length;
        const caps = this._newCaps();
        if (c.tier === "lit") {
          const lit = c.lit, m = lit.length;
          if (m === 0) {
            const idx2 = Math.min(fromPos, n2);
            if (stickyOnly && idx2 !== fromPos) return null;
            return { index: idx2, end: idx2, caps };
          }
          if (stickyOnly) {
            if (fromPos + m > n2) return null;
            for (let i = 0; i < m; i++)
              if (input.charCodeAt(fromPos + i) !== lit.charCodeAt(i)) return null;
            return { index: fromPos, end: fromPos + m, caps };
          }
          const idx = bmhSearch(input, lit, c.table, fromPos);
          if (idx < 0) return null;
          return { index: idx, end: idx + m, caps };
        }
        if (c.tier === "pike") {
          let runner = c.runner;
          if (runner && runner._busy) runner = null;
          if (!runner) {
            runner = new PikeRunner(c.prog, this._flags);
            if (!c.runner) c.runner = runner;
          }
          runner._busy = true;
          let result = null;
          try {
            if (stickyOnly || c.anchored && !this._flags.multiline) {
              const r = runner.matchAt(input, fromPos, caps);
              result = r ? { index: fromPos, end: r.end, caps: r.caps } : null;
            } else if (c.prefix) {
              let p = bmhSearch(input, c.prefix, c.table, fromPos);
              while (p >= 0) {
                const r = runner.matchAt(input, p, caps);
                if (r) {
                  result = { index: p, end: r.end, caps: r.caps };
                  break;
                }
                if (p + 1 > n2) break;
                p = bmhSearch(input, c.prefix, c.table, p + 1);
              }
            } else if (this._flags.multiline && c.anchored) {
              if (fromPos === 0) {
                const r = runner.matchAt(input, 0, caps);
                if (r) result = { index: 0, end: r.end, caps: r.caps };
              }
              if (!result) {
                for (let p = Math.max(fromPos, 1); p <= n2; p++) {
                  if (input.charCodeAt(p - 1) === 10 && p >= fromPos) {
                    const r = runner.matchAt(input, p, caps);
                    if (r) {
                      result = { index: p, end: r.end, caps: r.caps };
                      break;
                    }
                  }
                }
              }
            } else {
              result = runner.searchUnanchored(input, fromPos, caps);
            }
          } finally {
            runner._busy = false;
          }
          return result;
        }
        const bt = new Backtracker(c.ast, this._flags, c.groupCount);
        if (stickyOnly) {
          const r = bt.matchAt(input, fromPos);
          return r ? { index: fromPos, end: r.end, caps: toCaps32(r.caps, c.groupCount) } : null;
        }
        for (let p = fromPos; p <= n2; p++) {
          const r = bt.matchAt(input, p);
          if (r) return { index: p, end: r.end, caps: toCaps32(r.caps, c.groupCount) };
        }
        return null;
      }
      _execCore(input, fromPos, stickyOnly) {
        const r = this._searchFrom(input, fromPos, stickyOnly);
        if (!r) return null;
        const c = this._c;
        const m = [input.slice(r.index, r.end)];
        for (let g = 1; g <= c.groupCount; g++) {
          const s = r.caps[(g - 1) * 2], e = r.caps[(g - 1) * 2 + 1];
          m.push(s < 0 || e < 0 ? void 0 : input.slice(s, e));
        }
        m.index = r.index;
        m.input = input;
        return { match: m, end: r.end };
      }
      exec(str) {
        const input = String(str);
        const fl = this._flags;
        let fromPos = 0;
        const sticky = fl.sticky, glob = fl.global;
        if (sticky || glob) {
          fromPos = this.lastIndex;
          if (fromPos > input.length) {
            this.lastIndex = 0;
            return null;
          }
        }
        const r = this._execCore(input, fromPos, sticky);
        if (!r) {
          if (sticky || glob) this.lastIndex = 0;
          return null;
        }
        if (sticky || glob) this.lastIndex = r.end;
        return r.match;
      }
      test(str) {
        const input = String(str);
        const fl = this._flags;
        let fromPos = 0;
        const sticky = fl.sticky, glob = fl.global;
        if (sticky || glob) {
          fromPos = this.lastIndex;
          if (fromPos > input.length) {
            this.lastIndex = 0;
            return false;
          }
        }
        const ok = this._testFrom(input, fromPos, sticky);
        if (!ok) {
          if (sticky || glob) this.lastIndex = 0;
          return false;
        }
        if (sticky || glob) {
          if (this._c.tier === "lit") {
            this.lastIndex = sticky ? fromPos + this._c.lit.length : bmhSearch(input, this._c.lit, this._c.table, fromPos) + this._c.lit.length;
          } else {
            const r = this._searchFrom(input, fromPos, sticky);
            this.lastIndex = r ? r.end : 0;
          }
        }
        return true;
      }
      // ---- well-known symbols (host String methods delegate here) ----
      [Symbol.search](str) {
        const input = String(str);
        const r = this._searchFrom(input, 0, false);
        return r ? r.index : -1;
      }
      [Symbol.match](str) {
        const input = String(str);
        if (!this._flags.global) {
          const r = this._execCore(input, 0, false);
          return r ? r.match : null;
        }
        const out = [];
        let p = 0;
        const n2 = input.length;
        for (; ; ) {
          const r = this._searchFrom(input, p, false);
          if (!r) break;
          out.push(input.slice(r.index, r.end));
          p = r.end === r.index ? advanceIndex(input, r.end) : r.end;
          if (p > n2) break;
        }
        return out.length ? out : null;
      }
      [Symbol.replace](str, rep) {
        const input = String(str);
        const isFn = typeof rep === "function";
        const glob = this._flags.global;
        let out = "", last = 0, p = 0;
        const n2 = input.length;
        const doOne = (r) => {
          const full = input.slice(r.index, r.end);
          out += input.slice(last, r.index);
          if (isFn) {
            const args = [full];
            const c = this._c;
            for (let g = 1; g <= c.groupCount; g++) {
              const s = r.caps[(g - 1) * 2], e = r.caps[(g - 1) * 2 + 1];
              args.push(s < 0 || e < 0 ? void 0 : input.slice(s, e));
            }
            args.push(r.index, input);
            out += String(rep.apply(void 0, args));
          } else {
            out += expandReplacement(String(rep), input, full, r.index, r.end, r.caps, this._c.groupNames);
          }
          last = r.end;
          return r.end === r.index ? advanceIndex(input, r.end) : r.end;
        };
        if (!glob) {
          const r = this._searchFrom(input, 0, false);
          if (!r) return input;
          doOne(r);
          out += input.slice(last);
          return out;
        }
        for (; ; ) {
          const r = this._searchFrom(input, p, false);
          if (!r) break;
          p = doOne(r);
          if (p > n2) break;
        }
        out += input.slice(last);
        return out;
      }
      [Symbol.split](str, limit) {
        const input = String(str);
        const lim = limit === void 0 ? 4294967295 : Number(limit) >>> 0;
        if (lim === 0) return [];
        const out = [];
        const c = this._c;
        let p = 0, last = 0;
        const n2 = input.length;
        for (; ; ) {
          if (out.length >= lim) break;
          const r = this._searchFrom(input, p, false);
          if (!r) break;
          if (r.end === p) {
            p = advanceIndex(input, p);
            continue;
          }
          out.push(input.slice(last, r.index));
          for (let g = 1; g <= c.groupCount && out.length < lim; g++) {
            const s = r.caps[(g - 1) * 2], e = r.caps[(g - 1) * 2 + 1];
            out.push(s < 0 || e < 0 ? void 0 : input.slice(s, e));
          }
          last = r.end;
          p = r.end;
          if (out.length >= lim) break;
        }
        out.push(input.slice(last));
        return out.length > lim ? out.slice(0, lim) : out;
      }
    };
    function toCaps32(arr, nGroups) {
      const out = new Int32Array(Math.max(2, nGroups * 2));
      for (let i = 0; i < out.length && i < arr.length; i++) out[i] = arr[i];
      return out;
    }
    function expandReplacement(rep, input, full, rIndex, rEnd, caps, groupNames) {
      let out = "";
      for (let i = 0; i < rep.length; i++) {
        const ch = rep[i];
        if (ch !== "$" || i + 1 >= rep.length) {
          out += ch;
          continue;
        }
        const nx = rep[i + 1];
        if (nx === "$") {
          out += "$";
          i++;
        } else if (nx === "&") {
          out += full;
          i++;
        } else if (nx === "`") {
          out += input.slice(0, rIndex);
          i++;
        } else if (nx === "'") {
          out += input.slice(rEnd);
          i++;
        } else if (nx >= "0" && nx <= "9") {
          let j = i + 1, num4 = 0;
          while (j < rep.length && rep[j] >= "0" && rep[j] <= "9" && j < i + 3) {
            num4 = num4 * 10 + (rep.charCodeAt(j) - 48);
            j++;
          }
          let use = num4, useLen = j - (i + 1);
          while (useLen > 1 && !groupExists(caps, use)) {
            use = Math.floor(use / 10);
            useLen--;
          }
          out += groupSlice(input, caps, use);
          i += useLen;
        } else if (nx === "<") {
          const e = rep.indexOf(">", i + 2);
          if (e > 0) {
            const name = rep.slice(i + 2, e);
            const gi = groupNames ? groupNames.indexOf(name) : -1;
            out += gi > 0 ? groupSlice(input, caps, gi) : "";
            i = e;
          } else out += "$";
        } else {
          out += "$";
        }
      }
      return out;
    }
    function groupExists(caps, gi) {
      if (gi < 1 || !caps) return false;
      const k = (gi - 1) * 2;
      return k + 1 < caps.length;
    }
    function groupSlice(input, caps, gi) {
      if (!caps || gi < 1) return "";
      const k = (gi - 1) * 2;
      if (k + 1 >= caps.length) return "";
      const s = caps[k], e = caps[k + 1];
      if (s < 0 || e < 0) return "";
      return input.slice(s, e);
    }
    module2.exports = { MerkavaRegExp };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaAstLowerer.js
var require_MerkavaAstLowerer = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaAstLowerer.js"(exports2, module2) {
    var { MerkavaRegExp } = require_regex();
    var OP = { "+": "add", "-": "sub", "*": "mul", "/": "div", "%": "mod", "**": "pow", "==": "eq", "===": "seq", "!=": "neq", "!==": "sneq", "<": "lt", "<=": "lte", ">": "gt", ">=": "gte", "&": "band", "|": "bor", "^": "bxor", "<<": "shl", ">>": "shr", ">>>": "ushr", "in": "in" };
    var LOGICAL = { "&&": "and", "||": "or", "??": "nullish" };
    var UNARY = { "!": "not", "-": "neg", "+": "pos", typeof: "typeof", void: "void", "~": "bitnot", delete: "deleteProp" };
    function lowerAstToJson(ast) {
      const steps = [];
      const lexicalScopeStack = [];
      const lexicalNamesOf = (body) => new Set((body?.body || []).filter((stmt) => stmt.type === "VariableDeclaration" && (stmt.kind === "let" || stmt.kind === "const")).flatMap((stmt) => (stmt.declarations || []).map((d) => d.id?.name).filter(Boolean)));
      const isLexicalNameInCurrentScope = (name) => lexicalScopeStack.length > 0 && lexicalScopeStack[lexicalScopeStack.length - 1].has(name);
      const blockSteps = (body) => {
        const out = [];
        lexicalScopeStack.push(lexicalNamesOf(body));
        try {
          for (const stmt of body?.body || []) {
            const lowered = lowerStmt(stmt, out);
            if (lowered?.result) out.push({ op: "return", value: lowered.result });
          }
          return out;
        } finally {
          lexicalScopeStack.pop();
        }
      };
      const statementSteps = (stmt) => {
        const out = [];
        const lowered = lowerStmt(stmt, out);
        if (lowered?.result) out.push({ op: "return", value: lowered.result });
        return out;
      };
      const returnExpr = (body) => {
        const stmt = (body?.body || []).find((s) => s.type === "ReturnStatement");
        return stmt ? expr(stmt.argument) : { const: void 0 };
      };
      const yieldsOf = (body) => (body?.body || []).filter((s) => s.type === "ExpressionStatement" && s.expression?.type === "YieldExpression").map((s) => literalValue(s.expression.argument));
      const literalValue = (node) => node?.type === "Literal" ? node.value : expr(node);
      const methodDescriptor = (method) => ({
        name: propName(method.key),
        kind: method.kind || "method",
        static: !!method.static,
        params: (method.value.params || []).map(paramName),
        body: { op: "block", body: blockSteps(method.value.body) }
      });
      const fieldDescriptor = (field) => ({
        name: propName(field.key),
        value: field.value ? expr(field.value) : { const: void 0 }
      });
      const classDescriptor = (node) => ({
        name: node.id?.name || "",
        superClass: node.superClass ? { get: node.superClass.name } : null,
        methods: (node.body?.body || []).filter((member) => member.type === "MethodDefinition").map(methodDescriptor),
        fields: (node.body?.body || []).filter((member) => member.type === "PropertyDefinition" || member.type === "FieldDefinition").map(fieldDescriptor)
      });
      const propName = (node) => node?.type === "Identifier" ? node.name : node?.type === "Literal" ? node.value : expr(node);
      const paramName = (p) => p?.type === "RestElement" ? { rest: p.argument.name } : p?.type === "AssignmentPattern" ? { name: p.left.name, default: expr(p.right) } : p?.name;
      const fnBody = (node) => node.body?.type === "BlockStatement" ? blockSteps(node.body) : [{ op: "return", value: expr(node.body) }];
      const fnDescriptor = (node) => ({
        op: "function",
        name: node.id?.name || "",
        params: (node.params || []).map(paramName),
        body: fnBody(node),
        arrow: node.type === "ArrowFunctionExpression"
      });
      const templateLiteral = (node) => {
        const parts = [];
        for (let i = 0; i < (node.quasis || []).length; i++) {
          const cooked = node.quasis[i]?.value?.cooked ?? node.quasis[i]?.value?.raw ?? "";
          parts.push({ const: cooked });
          if (node.expressions?.[i]) parts.push(expr(node.expressions[i]));
        }
        if (!parts.length) return { const: "" };
        return parts.reduce((left, right) => ({ op: "add", args: [left, right] }));
      };
      const spreadParts = (args) => {
        const flat = [];
        for (const a of args || []) {
          if (a && a.type === "SpreadElement") flat.push({ const: true }, expr(a.argument));
          else flat.push({ const: false }, expr(a));
        }
        return flat;
      };
      const hasSpreadArg = (args) => (args || []).some((a) => a && a.type === "SpreadElement");
      const expr = (node) => {
        if (!node) return { const: null };
        if (node.type === "Literal" && node.regex) return { const: new MerkavaRegExp(node.regex.pattern, node.regex.flags || "") };
        if (node.type === "Literal" && node.bigint != null) return { const: BigInt(node.bigint) };
        if (node.type === "Literal") return { const: node.value };
        if (node.type === "TemplateLiteral") return templateLiteral(node);
        if (node.type === "TaggedTemplateExpression") return templateLiteral(node.quasi);
        if (node.type === "MetaProperty") {
          const meta = node.meta?.name || node.meta?.value || "meta";
          const property = node.property?.name || node.property?.value || "";
          if (meta === "import" && property === "meta") return { const: { url: "merkava://module" } };
          return { const: `${meta}.${property}` };
        }
        if (node.type === "Identifier") return { get: node.name };
        if (node.type === "ChainExpression") return expr(node.expression);
        if (node.type === "ThisExpression") return { get: "this" };
        if (node.type === "Super") return { get: "super" };
        if (node.type === "AwaitExpression") return { op: "await", value: expr(node.argument) };
        if (node.type === "YieldExpression") return expr(node.argument);
        if (node.type === "SpreadElement") return expr(node.argument);
        if (node.type === "UnaryExpression") {
          if (node.operator === "typeof" && node.argument?.type === "Identifier" && !isLexicalNameInCurrentScope(node.argument.name)) return { op: "typeofName", name: node.argument.name };
          if (node.operator === "delete" && node.argument?.type === "MemberExpression") {
            return {
              op: "deleteProp",
              object: expr(node.argument.object),
              prop: node.argument.computed ? expr(node.argument.property) : { const: propName(node.argument.property) }
            };
          }
          if (node.operator === "delete") return { const: true };
          const op = UNARY[node.operator];
          if (!op) throw new Error(`Unsupported JS unary operator: ${node.operator}`);
          return { op, value: expr(node.argument) };
        }
        if (node.type === "LogicalExpression") {
          const op = LOGICAL[node.operator];
          if (!op) throw new Error(`Unsupported JS logical operator: ${node.operator}`);
          return { op, args: [expr(node.left), expr(node.right)] };
        }
        if (node.type === "ConditionalExpression") return { op: "conditional", test: expr(node.test), consequent: expr(node.consequent), alternate: expr(node.alternate) };
        if (node.type === "BinaryExpression") {
          if (node.operator === "instanceof") return { op: "instanceof", args: [expr(node.left), expr(node.right)] };
          const op = LOGICAL[node.operator] || OP[node.operator];
          if (!op) throw new Error(`Unsupported JS binary operator: ${node.operator}`);
          return { op, args: [expr(node.left), expr(node.right)] };
        }
        if (node.type === "ArrayExpression") {
          if (hasSpreadArg(node.elements)) return { op: "arraySpread", parts: spreadParts(node.elements) };
          return { op: "array", items: (node.elements || []).map(expr) };
        }
        if (node.type === "ObjectExpression") {
          if ((node.properties || []).some((p) => p.type === "SpreadElement")) return {
            op: "objectMerge",
            parts: (node.properties || []).map((p) => p.type === "SpreadElement" ? { spread: expr(p.argument) } : p.kind === "get" || p.kind === "set" ? { key: { __accessor: propName(p.key) }, [p.kind === "get" ? "getter" : "setter"]: fnDescriptor(p.value) } : { key: propName(p.key), value: expr(p.value) })
          };
          return { op: "object", props: (node.properties || []).map((p) => p.kind === "get" || p.kind === "set" ? { key: propName(p.key), [p.kind === "get" ? "getter" : "setter"]: fnDescriptor(p.value) } : { key: propName(p.key), value: expr(p.value) }) };
        }
        if (node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression") return fnDescriptor(node);
        if (node.type === "ClassExpression") return { op: "class", descriptor: classDescriptor(node) };
        if (node.type === "AssignmentExpression") {
          const compound = node.operator && node.operator !== "=" ? OP[node.operator.slice(0, -1)] : null;
          if (node.left.type === "Identifier") {
            const value = compound ? { op: compound, args: [{ get: node.left.name }, expr(node.right)] } : expr(node.right);
            return { op: "set", name: node.left.name, value };
          }
          if (node.left.type === "MemberExpression") {
            const object = expr(node.left.object), prop = node.left.computed ? expr(node.left.property) : { const: propName(node.left.property) };
            const value = compound ? { op: compound, args: [{ op: "getProp", object, prop }, expr(node.right)] } : expr(node.right);
            return { op: "setProp", object, prop, value };
          }
        }
        if (node.type === "UpdateExpression") {
          const delta = { const: node.operator === "++" ? 1 : -1 };
          if (!node.prefix && node.argument.type === "Identifier") {
            return { op: "postUpdate", name: node.argument.name, delta };
          }
          if (node.argument.type === "Identifier") return { op: "set", name: node.argument.name, value: { op: "add", args: [{ get: node.argument.name }, delta] } };
          if (node.argument.type === "MemberExpression") {
            const object = expr(node.argument.object), prop = node.argument.computed ? expr(node.argument.property) : { const: propName(node.argument.property) };
            return { op: "setProp", object, prop, value: { op: "add", args: [{ op: "getProp", object, prop }, delta] } };
          }
        }
        if (node.type === "NewExpression") {
          const calleeName = node.callee?.name;
          if (calleeName === "Error") return { op: "newError", message: expr(node.arguments?.[0] || { type: "Literal", value: "" }) };
          if (calleeName && /^(Uint8Array|Uint16Array|Uint32Array|Int8Array|Int16Array|Int32Array|Float32Array|Float64Array)$/.test(calleeName)) {
            const first = node.arguments?.[0];
            return { op: "typedArray", kind: calleeName, items: first?.type === "ArrayExpression" ? first.elements.map(expr) : [] };
          }
          return { op: "new", class: expr(node.callee), args: (node.arguments || []).map(expr) };
        }
        if (node.type === "MemberExpression") return { op: node.optional ? "optionalGetProp" : "getProp", object: expr(node.object), prop: node.computed ? expr(node.property) : propName(node.property) };
        if (node.type === "CallExpression") {
          const spread = hasSpreadArg(node.arguments);
          if (node.callee.type === "Super") return { op: "superConstructor", args: (node.arguments || []).map(expr) };
          if (node.callee.type === "Identifier") {
            if (spread) return { op: "spreadCall", fn: expr(node.callee), parts: spreadParts(node.arguments) };
            return { op: "callFunction", fn: expr(node.callee), args: (node.arguments || []).map(expr) };
          }
          if (node.callee.type === "MemberExpression" && !node.callee.computed) {
            if (spread) return { op: "spreadCallMethod", object: expr(node.callee.object), method: propName(node.callee.property), parts: spreadParts(node.arguments) };
            return { op: node.optional || node.callee.optional ? "optionalCallMethod" : "callMethod", object: expr(node.callee.object), method: propName(node.callee.property), args: (node.arguments || []).map(expr) };
          }
          if (node.callee.type === "MemberExpression" && node.callee.computed && spread) {
            return { op: "spreadCall", fn: expr(node.callee), parts: spreadParts(node.arguments) };
          }
          if (node.optional || node.callee.type === "ChainExpression") return { op: "optionalCallFunction", fn: expr(node.callee), args: (node.arguments || []).map(expr) };
          if (node.optional || node.callee.type === "ChainExpression") return { op: "optionalCallFunction", fn: expr(node.callee), args: (node.arguments || []).map(expr) };
          return { op: "callFunction", fn: expr(node.callee), args: (node.arguments || []).map(expr) };
        }
        throw new Error(`Unsupported JS AST expression: ${node.type}`);
      };
      const lowerStmt = (stmt, target = steps) => {
        if (stmt.type === "EmptyStatement") return null;
        if (stmt.type === "BlockStatement") {
          target.push({ op: "block", body: blockSteps(stmt) });
          return null;
        }
        if (stmt.type === "VariableDeclaration") {
          for (const d of stmt.declarations) {
            if (d.id.type === "ArrayPattern") {
              const tmp = `__destruct${target.length}`;
              target.push({ op: "declare", name: tmp, value: expr(d.init) });
              (d.id.elements || []).forEach((el, index) => {
                if (!el) return;
                if (el.type === "Identifier") target.push({ op: "declare", name: el.name, value: { op: "getProp", object: { get: tmp }, prop: { const: index } } });
                else if (el.type === "RestElement") target.push({ op: "declare", name: el.argument.name, value: { op: "callMethod", object: { get: tmp }, method: "slice", args: [{ const: index }] } });
              });
            } else target.push({ op: "declare", name: d.id.name, value: expr(d.init) });
          }
        } else if (stmt.type === "ExpressionStatement") {
          target.push(expr(stmt.expression));
        } else if (stmt.type === "ReturnStatement") {
          return { result: expr(stmt.argument) };
        } else if (stmt.type === "IfStatement") {
          target.push({
            op: "if",
            test: expr(stmt.test),
            consequent: stmt.consequent?.type === "BlockStatement" ? blockSteps(stmt.consequent) : statementSteps(stmt.consequent),
            alternate: stmt.alternate ? stmt.alternate.type === "BlockStatement" ? blockSteps(stmt.alternate) : statementSteps(stmt.alternate) : []
          });
        } else if (stmt.type === "ForOfStatement") {
          const left = stmt.left?.type === "VariableDeclaration" ? stmt.left.declarations?.[0]?.id?.name : stmt.left?.name;
          const kind = stmt.left?.type === "VariableDeclaration" ? stmt.left.kind : null;
          target.push({
            op: "forOf",
            left: left || `__forOf${target.length}`,
            kind,
            right: expr(stmt.right),
            body: stmt.body?.type === "BlockStatement" ? blockSteps(stmt.body) : statementSteps(stmt.body)
          });
        } else if (stmt.type === "ForInStatement") {
          const left = stmt.left?.type === "VariableDeclaration" ? stmt.left.declarations?.[0]?.id?.name : stmt.left?.name;
          const kind = stmt.left?.type === "VariableDeclaration" ? stmt.left.kind : null;
          target.push({
            op: "forOf",
            left: left || `__forIn${target.length}`,
            kind,
            right: { op: "callMethod", object: { get: "Object" }, method: "keys", args: [expr(stmt.right)] },
            body: stmt.body?.type === "BlockStatement" ? blockSteps(stmt.body) : statementSteps(stmt.body)
          });
        } else if (stmt.type === "WhileStatement") {
          target.push({
            op: "while",
            test: expr(stmt.test),
            body: stmt.body?.type === "BlockStatement" ? blockSteps(stmt.body) : statementSteps(stmt.body)
          });
        } else if (stmt.type === "ForStatement") {
          let letNames = null;
          if (stmt.init) {
            if (stmt.init.type === "VariableDeclaration") {
              lowerStmt(stmt.init, target);
              if (stmt.init.kind === "let" || stmt.init.kind === "const") {
                letNames = (stmt.init.declarations || []).map((d) => d.id?.name).filter(Boolean);
              }
            } else target.push(expr(stmt.init));
          }
          const body = stmt.body?.type === "BlockStatement" ? blockSteps(stmt.body) : statementSteps(stmt.body);
          target.push({
            op: "while",
            test: stmt.test ? expr(stmt.test) : { const: true },
            body,
            update: stmt.update ? expr(stmt.update) : null,
            letNames
          });
        } else if (stmt.type === "SwitchStatement") {
          target.push({
            op: "switch",
            discriminant: expr(stmt.discriminant),
            cases: (stmt.cases || []).map((item) => ({
              test: item.test ? expr(item.test) : null,
              body: blockSteps({ body: item.consequent || [] })
            }))
          });
        } else if (stmt.type === "ThrowStatement") {
          target.push({ op: "throw", value: expr(stmt.argument) });
        } else if (stmt.type === "TryStatement") {
          target.push({
            op: "try",
            body: blockSteps(stmt.block),
            catchParam: stmt.handler?.param?.name || null,
            catchBody: stmt.handler ? blockSteps(stmt.handler.body) : null,
            finallyBody: stmt.finalizer ? blockSteps(stmt.finalizer) : null
          });
        } else if (stmt.type === "ClassDeclaration") {
          target.push({ op: "set", name: stmt.id.name, value: { op: "class", descriptor: classDescriptor(stmt) } });
        } else if (stmt.type === "FunctionDeclaration") {
          if (stmt.generator) target.push({ op: "set", name: stmt.id.name, value: { op: "generator", values: yieldsOf(stmt.body) } });
          else if (stmt.async) target.push({ op: "set", name: stmt.id.name, value: fnDescriptor(stmt) });
          else target.push({ op: "set", name: stmt.id.name, value: fnDescriptor(stmt) });
        } else if (stmt.type === "ContinueStatement" || stmt.type === "BreakStatement") {
          return null;
        } else {
          throw new Error(`Unsupported JS AST statement: ${stmt.type}`);
        }
        return null;
      };
      lexicalScopeStack.push(lexicalNamesOf(ast));
      try {
        lexicalScopeStack.push(lexicalNamesOf(ast));
        try {
          for (const stmt of ast.body || []) {
            const returned = lowerStmt(stmt);
            if (returned) return { steps, ...returned };
          }
          return { steps };
        } finally {
          lexicalScopeStack.pop();
        }
      } finally {
        lexicalScopeStack.pop();
      }
    }
    module2.exports = { lowerAstToJson };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/VarInt.js
var require_VarInt = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/VarInt.js"(exports2, module2) {
    function writeVarUint(bytes, value) {
      let n2 = Number(value >>> 0);
      while (n2 >= 128) {
        bytes.push(n2 & 127 | 128);
        n2 >>>= 7;
      }
      bytes.push(n2);
    }
    function readVarUint(reader) {
      let shift = 0, result = 0;
      while (true) {
        const byte = reader.u8();
        result |= (byte & 127) << shift;
        if ((byte & 128) === 0) return result >>> 0;
        shift += 7;
      }
    }
    module2.exports = { writeVarUint, readVarUint };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/ByteWriter.js
var require_ByteWriter = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/ByteWriter.js"(exports2, module2) {
    var { writeVarUint } = require_VarInt();
    var ByteWriter = class {
      constructor() {
        this.bytes = [];
      }
      u8(value) {
        this.bytes.push(value & 255);
        return this;
      }
      u16(value) {
        this.u8(value);
        this.u8(value >> 8);
        return this;
      }
      varUint(value) {
        writeVarUint(this.bytes, value);
        return this;
      }
      raw(values) {
        for (const value of values) this.u8(value);
        return this;
      }
      utf8(text) {
        return Buffer.from(String(text), "utf8");
      }
      string(text) {
        const buf = this.utf8(text);
        this.varUint(buf.length);
        this.raw(buf);
        return this;
      }
      bytesWithLength(values) {
        const buf = Buffer.from(values || []);
        this.varUint(buf.length);
        this.raw(buf);
        return this;
      }
      json(value) {
        return this.string(JSON.stringify(value));
      }
      toBuffer() {
        return Buffer.from(this.bytes);
      }
    };
    module2.exports = { ByteWriter };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/ByteReader.js
var require_ByteReader = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/ByteReader.js"(exports2, module2) {
    var { readVarUint } = require_VarInt();
    var ByteReader = class {
      constructor(buffer) {
        this.buffer = Buffer.from(buffer);
        this.offset = 0;
      }
      u8() {
        return this.buffer[this.offset++];
      }
      u16() {
        const v = this.u8() | this.u8() << 8;
        return v;
      }
      varUint() {
        return readVarUint(this);
      }
      bytes(length) {
        const end = this.offset + length;
        const slice = this.buffer.slice(this.offset, end);
        this.offset = end;
        return slice;
      }
      bytesWithLength() {
        return this.bytes(this.varUint());
      }
      string() {
        return this.bytesWithLength().toString("utf8");
      }
      json() {
        return JSON.parse(this.string());
      }
      done() {
        return this.offset >= this.buffer.length;
      }
    };
    module2.exports = { ByteReader };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/SangCodec.js
var require_SangCodec = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/SangCodec.js"(exports2, module2) {
    var { ByteWriter } = require_ByteWriter();
    var { ByteReader } = require_ByteReader();
    var MAGIC = "SANG";
    var VERSION3 = 1;
    var T = { NULL: 0, FALSE: 1, TRUE: 2, NUM: 3, STR: 4, OBJ: 5, BIGINT: 6 };
    function encodeValue2(writer, value) {
      if (value == null) return writer.u8(T.NULL);
      if (value === false) return writer.u8(T.FALSE);
      if (value === true) return writer.u8(T.TRUE);
      if (typeof value === "bigint") return writer.u8(T.BIGINT).string(value.toString());
      if (typeof value === "number") return writer.u8(T.NUM).string(String(value));
      if (typeof value === "string") return writer.u8(T.STR).string(value);
      return writer.u8(T.OBJ).json(value);
    }
    function decodeValue2(reader) {
      const t = reader.u8();
      if (t === T.NULL) return null;
      if (t === T.FALSE) return false;
      if (t === T.TRUE) return true;
      if (t === T.BIGINT) return BigInt(reader.string());
      if (t === T.NUM) return Number(reader.string());
      if (t === T.STR) return reader.string();
      if (t === T.OBJ) return reader.json();
      throw new Error(`Bad SANG constant type: ${t}`);
    }
    function encodeConstants(writer, constants) {
      writer.varUint(constants.length);
      for (const constant of constants) encodeValue2(writer, constant);
    }
    function decodeConstants(reader) {
      const constants = [];
      const count = reader.varUint();
      for (let i = 0; i < count; i++) constants.push(decodeValue2(reader));
      return constants;
    }
    function encodeSangArtifact(artifact, options = {}) {
      const code = Buffer.from(artifact.bytecode || []);
      const writer = new ByteWriter();
      writer.raw(Buffer.from(MAGIC, "ascii")).u8(VERSION3);
      const flags = options.debug ? 1 : 0;
      writer.u8(flags);
      encodeConstants(writer, artifact.constants || []);
      writer.bytesWithLength(code);
      if (options.debug) {
        writer.json(artifact.web || null);
        writer.json(artifact.meta || {});
      }
      return writer.toBuffer();
    }
    function decodeSangArtifact(buffer) {
      const reader = new ByteReader(buffer);
      const magic = reader.bytes(4).toString("ascii");
      if (magic !== MAGIC) throw new Error(`Bad SANG magic: ${magic}`);
      const version = reader.u8();
      if (version !== VERSION3) throw new Error(`Unsupported SANG version: ${version}`);
      const flags = reader.u8();
      const constants = decodeConstants(reader);
      const bytecode = reader.bytesWithLength();
      return {
        version,
        flags,
        constants,
        bytecode,
        web: flags & 1 ? reader.json() : null,
        meta: flags & 1 ? reader.json() : {}
      };
    }
    module2.exports = { MAGIC, VERSION: VERSION3, encodeSangArtifact, decodeSangArtifact, encodeConstants, decodeConstants };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaJsonCompiler.js
var require_MerkavaJsonCompiler = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaJsonCompiler.js"(exports2, module2) {
    var { encodeSangArtifact } = require_SangCodec();
    var BIN = {
      add: 64,
      sub: 65,
      mul: 66,
      div: 67,
      mod: 68,
      band: 70,
      bor: 71,
      bxor: 72,
      shl: 73,
      shr: 74,
      ushr: 75
    };
    var SYS = {
      class: 20,
      new: 21,
      callMethod: 22,
      getProp: 23,
      generator: 24,
      asyncFunction: 25,
      callFunction: 26,
      array: 27,
      object: 28,
      typedArray: 29,
      setProp: 31,
      function: 32,
      binary: 33,
      unary: 34,
      conditional: 35,
      objectMerge: 36,
      awaitValue: 37,
      optionalGetProp: 38,
      newError: 39,
      forOf: 40,
      whileLoop: 41,
      switchStmt: 42,
      block: 43,
      optionalCallMethod: 44,
      optionalCallFunction: 45,
      typeofName: 46,
      typeofName: 46,
      optionalCallFunction: 45,
      arraySpread: 47,
      spreadCall: 48,
      spreadCallMethod: 49,
      // B"H: dedicated JSON fast-path syscalls (see merkava-vm/executors/json.js).
      // The compiler emits these for `JSON.parse(x)` / `JSON.stringify(x)` instead
      // of the generic callMethod — no arg array, no spread, no closure allocs.
      jsonParse: 50,
      jsonStringify: 51
    };
    function addConst(constants, value) {
      constants.push(value);
      return constants.length - 1;
    }
    function u16(bytes, value) {
      bytes.push(value & 255, value >> 8 & 255);
    }
    function patch16(bytes, at, value) {
      bytes[at] = value & 255;
      bytes[at + 1] = value >> 8 & 255;
    }
    function pushConst(bytes, constants, value) {
      bytes.push(19);
      u16(bytes, addConst(constants, value));
    }
    function load(bytes, constants, name) {
      bytes.push(34);
      u16(bytes, addConst(constants, name));
    }
    function store(bytes, constants, name) {
      bytes.push(35);
      u16(bytes, addConst(constants, name));
    }
    function propArg(prop) {
      if (prop && typeof prop === "object" && (prop.op || prop.get || Object.prototype.hasOwnProperty.call(prop, "const") || prop.value !== void 0)) return normalizeNode2(prop);
      return { const: prop };
    }
    function normalizeNode2(node) {
      if (!node || typeof node !== "object" || Array.isArray(node)) return node;
      const meaningful = Object.keys(node).filter((key) => node[key] !== void 0);
      if (meaningful.length === 1 && meaningful[0] === "value") return normalizeNode2(node.value);
      return node;
    }
    function normalizeTree(node) {
      const got = normalizeNode2(node);
      if (!got || typeof got !== "object") return got;
      if (Array.isArray(got)) return got.map(normalizeTree);
      if (got instanceof RegExp || got.__isMerkavaRegExp || got instanceof Date || got instanceof Map || got instanceof Set || got instanceof WeakMap) return got;
      const out = {};
      for (const [key, value] of Object.entries(got)) if (value !== void 0) out[key] = normalizeTree(value);
      return out;
    }
    function compileJsonCode(program = {}) {
      const constants = [], bytecode = [];
      const emitSys = (id, args) => {
        for (const arg2 of args || []) emit(arg2);
        bytecode.push(144, id, (args || []).length);
      };
      const emitConstSys = (id, rawArgs) => {
        for (const arg2 of rawArgs || []) pushConst(bytecode, constants, normalizeTree(arg2));
        bytecode.push(144, id, (rawArgs || []).length);
      };
      const emitBlock = (body) => {
        for (const step of body || []) {
          if (step?.op === "return") {
            emit(step.value);
            bytecode.push(2);
          } else emit(step);
        }
      };
      const emitJumpIfFalse = (test) => {
        emit(test);
        bytecode.push(4);
        const patchAt = bytecode.length;
        bytecode.push(0, 0);
        return patchAt;
      };
      const emitJump = () => {
        bytecode.push(3);
        const patchAt = bytecode.length;
        bytecode.push(0, 0);
        return patchAt;
      };
      const patchRelative = (patchAt) => patch16(bytecode, patchAt, bytecode.length - (patchAt + 2));
      const emit = (rawNode) => {
        const node = normalizeNode2(rawNode);
        if (typeof node === "number" || typeof node === "string" || typeof node === "boolean" || node == null) return pushConst(bytecode, constants, node);
        if (node.get) return load(bytecode, constants, node.get);
        if (Object.prototype.hasOwnProperty.call(node, "const")) return pushConst(bytecode, constants, node.const);
        if (BIN[node.op]) {
          emit(node.args[0]);
          emit(node.args[1]);
          bytecode.push(BIN[node.op]);
          return;
        }
        if (node.op === "bitnot") {
          emit(node.value);
          bytecode.push(97);
          return;
        }
        if (node.op === "deleteProp") {
          emit(node.object);
          emit(node.prop);
          bytecode.push(52);
          return;
        }
        if (node.op === "set" || node.op === "declare") {
          emit(node.value);
          store(bytecode, constants, node.name);
          load(bytecode, constants, node.name);
          return;
        }
        if (node.op === "postUpdate") {
          const tmp = `__post${bytecode.length}_${constants.length}`;
          load(bytecode, constants, node.name);
          store(bytecode, constants, tmp);
          load(bytecode, constants, tmp);
          pushConst(bytecode, constants, node.delta.const);
          bytecode.push(64);
          store(bytecode, constants, node.name);
          load(bytecode, constants, tmp);
          return;
        }
        if (node.op === "syscall") return emitSys(node.id || 0, node.args || []);
        if (node.op === "class") return emitSys(SYS.class, [{ const: normalizeTree(node.descriptor) }, node.descriptor.superClass || { const: null }]);
        if (node.op === "new") return emitSys(SYS.new, [node.class, ...node.args || []]);
        if (node.op === "callMethod") {
          const _cobj = normalizeNode2(node.object);
          if (_cobj && _cobj.get === "JSON" && (node.method === "parse" || node.method === "stringify")) {
            return emitSys(node.method === "parse" ? SYS.jsonParse : SYS.jsonStringify, [node.object, ...node.args || []]);
          }
          return emitSys(SYS.callMethod, [node.object, { const: node.method }, ...node.args || []]);
        }
        if (node.op === "optionalCallMethod") return emitSys(SYS.optionalCallMethod, [node.object, { const: node.method }, ...node.args || []]);
        if (node.op === "getProp") return emitSys(SYS.getProp, [node.object, propArg(node.prop)]);
        if (node.op === "optionalGetProp") return emitSys(SYS.optionalGetProp, [node.object, propArg(node.prop)]);
        if (node.op === "setProp") return emitSys(SYS.setProp, [node.object, propArg(node.prop), node.value]);
        if (node.op === "generator") return emitConstSys(SYS.generator, [node.values || []]);
        if (node.op === "asyncFunction") return emitConstSys(SYS.asyncFunction, [node.result]);
        if (node.op === "function") return emitConstSys(SYS.function, [node]);
        if (node.op === "callFunction") return emitSys(SYS.callFunction, [node.fn, ...node.args || []]);
        if (node.op === "optionalCallFunction") return emitSys(SYS.optionalCallFunction, [node.fn, ...node.args || []]);
        if (node.op === "optionalCallFunction") return emitSys(SYS.optionalCallFunction, [node.fn, ...node.args || []]);
        if (node.op === "await") return emitSys(SYS.awaitValue, [node.value]);
        if (node.op === "newError") return emitSys(SYS.newError, [node.message || { const: "" }]);
        if (node.op === "throw") {
          emit(node.value);
          bytecode.push(145);
          return;
        }
        if (node.op === "forOf") return emitSys(SYS.forOf, [{ const: normalizeTree(node) }]);
        if (node.op === "while") return emitSys(SYS.whileLoop, [{ const: normalizeTree(node) }]);
        if (node.op === "switch") return emitSys(SYS.switchStmt, [{ const: normalizeTree(node) }]);
        if (node.op === "if") {
          const falsePatch = emitJumpIfFalse(node.test);
          emitBlock(node.consequent || []);
          if (node.alternate && node.alternate.length) {
            const endPatch = emitJump();
            patchRelative(falsePatch);
            emitBlock(node.alternate || []);
            patchRelative(endPatch);
          } else patchRelative(falsePatch);
          pushConst(bytecode, constants, void 0);
          return;
        }
        if (node.op === "nullish") {
          const tmp = `__nullish${bytecode.length}_${constants.length}`;
          emit(node.args[0]);
          store(bytecode, constants, tmp);
          emitSys(SYS.binary, [{ const: "eq" }, { get: tmp }, { const: null }]);
          bytecode.push(4);
          const hasPatch = bytecode.length;
          bytecode.push(0, 0);
          emit(node.args[1]);
          const endPatch = emitJump();
          patchRelative(hasPatch);
          load(bytecode, constants, tmp);
          patchRelative(endPatch);
          return;
        }
        if (node.op === "block") return emitConstSys(SYS.block, [node]);
        if (node.op === "try") {
          bytecode.push(146);
          const catchPatch = bytecode.length;
          bytecode.push(0, 0);
          emitBlock(node.body || []);
          bytecode.push(147);
          const endPatch = emitJump();
          patchRelative(catchPatch);
          if (node.catchParam) store(bytecode, constants, node.catchParam);
          emitBlock(node.catchBody || []);
          patchRelative(endPatch);
          emitBlock(node.finallyBody || []);
          pushConst(bytecode, constants, void 0);
          return;
        }
        if (node.op === "array") return emitSys(SYS.array, node.items || []);
        if (node.op === "arraySpread") return emitSys(SYS.arraySpread, node.parts || []);
        if (node.op === "spreadCall") return emitSys(SYS.spreadCall, [node.fn, ...node.parts || []]);
        if (node.op === "spreadCallMethod") return emitSys(SYS.spreadCallMethod, [node.object, { const: node.method }, ...node.parts || []]);
        if (node.op === "object") {
          const flat = [];
          for (const prop of node.props || []) {
            if (prop.getter || prop.setter) flat.push({ const: { __accessor: prop.key } }, { const: normalizeTree(prop) });
            else flat.push({ const: prop.key }, prop.value);
          }
          return emitSys(SYS.object, flat);
        }
        if (node.op === "objectMerge") {
          const flat = [];
          for (const part of node.parts || []) {
            if (part.spread) flat.push({ const: true }, part.spread);
            else if (part.key && typeof part.key === "object" && part.key.__accessor) flat.push({ const: false }, { const: part.key }, { const: normalizeTree(part) });
            else flat.push({ const: false }, { const: part.key }, part.value);
          }
          return emitSys(SYS.objectMerge, flat);
        }
        if (node.op === "typedArray") return emitSys(SYS.typedArray, [{ const: node.kind }, ...node.items || []]);
        if (["eq", "seq", "neq", "sneq", "lt", "lte", "gt", "gte", "and", "or", "pow", "instanceof", "in"].includes(node.op)) return emitSys(SYS.binary, [{ const: node.op }, node.args[0], node.args[1]]);
        if (node.op === "typeofName") return emitSys(SYS.typeofName, [{ const: node.name }]);
        if (node.op === "typeofName") return emitSys(SYS.typeofName, [{ const: node.name }]);
        if (["not", "neg", "pos", "typeof", "void"].includes(node.op)) return emitSys(SYS.unary, [{ const: node.op }, node.value]);
        if (node.op === "conditional") return emitSys(SYS.conditional, [node.test, node.consequent, node.alternate]);
        throw new Error(`Unsupported Merkava JSON node: ${JSON.stringify(node)}`);
      };
      emitBlock(program.steps || []);
      if (program.result) emit(program.result);
      bytecode.push(1);
      return { constants, bytecode, meta: { kind: "merkava-json", program } };
    }
    function compileJsonToSang(program) {
      return encodeSangArtifact(compileJsonCode(program));
    }
    module2.exports = { compileJsonCode, compileJsonToSang, normalizeNode: normalizeNode2, normalizeTree };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/CompactClassCodec.js
var require_CompactClassCodec = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/CompactClassCodec.js"(exports2, module2) {
    var { encodeSangArtifact } = require_SangCodec();
    var SYS_COMPACT_CLASS = 60;
    var CC_OP = Object.freeze({
      RETURN: 0,
      SUPER_CTOR: 1,
      SET_THIS_SLOT_CONST: 2,
      GET_THIS_SLOT: 3,
      CALL_SUPER_METHOD: 4,
      ADD: 5,
      SET_DOM_TEXT_ARG: 6,
      SET_DOM_TEXT_CONST: 7,
      CONST: 8,
      END: 15
    });
    function methodName(node) {
      return node?.key?.name || String(node?.key?.value || "");
    }
    function propName(node) {
      return node?.property?.name || node?.property?.value || "";
    }
    function isThisProp(node) {
      return node?.type === "MemberExpression" && node.object?.type === "ThisExpression";
    }
    function isSuperCall(node) {
      return node?.type === "CallExpression" && node.callee?.type === "Super";
    }
    function isThisSet(stmt) {
      return stmt?.type === "ExpressionStatement" && stmt.expression?.type === "AssignmentExpression" && isThisProp(stmt.expression.left);
    }
    function isDomTextSet(stmt) {
      const e = stmt?.type === "ExpressionStatement" ? stmt.expression : stmt;
      return e?.type === "AssignmentExpression" && e.left?.type === "MemberExpression" && propName(e.left) === "textContent" && e.left.object?.type === "Identifier";
    }
    function literalValue(node) {
      return node?.type === "Literal" ? node.value : void 0;
    }
    function collectFields(cls) {
      const fields = [];
      for (const m of cls.body?.body || []) {
        for (const stmt of m.value?.body?.body || []) {
          if (isThisSet(stmt)) {
            const name = propName(stmt.expression.left);
            if (!fields.includes(name)) fields.push(name);
          }
        }
      }
      return fields;
    }
    function collectMethodNames(cls) {
      return (cls.body?.body || []).map(methodName);
    }
    function writeConst(constants, value) {
      constants.push(value);
      return constants.length - 1;
    }
    function emitVar(out, n2) {
      n2 >>>= 0;
      while (n2 >= 128) {
        out.push(n2 & 127 | 128);
        n2 >>>= 7;
      }
      out.push(n2);
    }
    function compileMethod(method, fields, methods, constants) {
      const out = [];
      const params = (method.value?.params || []).map((p) => p.name);
      const body = method.value?.body?.body || [];
      const fieldId = (name) => fields.indexOf(name);
      const methodId = (name) => methods.indexOf(name);
      const paramId = (name) => params.indexOf(name);
      for (const stmt of body) {
        if (stmt.type === "ExpressionStatement" && isSuperCall(stmt.expression)) {
          out.push(CC_OP.SUPER_CTOR);
          continue;
        }
        if (isThisSet(stmt)) {
          const left = stmt.expression.left;
          const value = stmt.expression.right;
          out.push(CC_OP.SET_THIS_SLOT_CONST, fieldId(propName(left)) & 255);
          emitVar(out, writeConst(constants, literalValue(value)));
          continue;
        }
        if (isDomTextSet(stmt)) {
          const e = stmt.expression || stmt;
          out.push(e.right?.type === "Identifier" ? CC_OP.SET_DOM_TEXT_ARG : CC_OP.SET_DOM_TEXT_CONST);
          emitVar(out, writeConst(constants, e.left.object.name));
          if (e.right?.type === "Identifier") out.push(paramId(e.right.name) & 255);
          else emitVar(out, writeConst(constants, literalValue(e.right)));
          continue;
        }
        if (stmt.type === "ReturnStatement") {
          compileReturnExpr(stmt.argument, out, fields, methods, constants);
          out.push(CC_OP.RETURN);
          continue;
        }
      }
      out.push(CC_OP.END);
      return { name: methodName(method), params, code: out };
    }
    function compileReturnExpr(node, out, fields, methods, constants) {
      if (!node) return;
      if (node.type === "Literal") {
        out.push(CC_OP.CONST);
        emitVar(out, writeConst(constants, node.value));
        return;
      }
      if (node.type === "MemberExpression" && isThisProp(node)) {
        out.push(CC_OP.GET_THIS_SLOT, fields.indexOf(propName(node)) & 255);
        return;
      }
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression" && node.callee.object?.type === "Super") {
        out.push(CC_OP.CALL_SUPER_METHOD);
        emitVar(out, writeConst(constants, propName(node.callee)));
        return;
      }
      if (node.type === "BinaryExpression" && node.operator === "+") {
        compileReturnExpr(node.left, out, fields, methods, constants);
        compileReturnExpr(node.right, out, fields, methods, constants);
        out.push(CC_OP.ADD);
      }
    }
    function classNodeToCompact(cls) {
      const constants = [];
      const fields = collectFields(cls);
      const methods = collectMethodNames(cls);
      const compiled = (cls.body?.body || []).map((m) => compileMethod(m, fields, methods, constants));
      return [cls.id.name, cls.superClass?.name || "", fields, compiled.map((m) => [m.name, m.params, m.code]), constants];
    }
    function tryCompileCompactClasses(ast) {
      const classes = [];
      for (const stmt of ast.body || []) if (stmt.type === "ClassDeclaration") classes.push(classNodeToCompact(stmt));
      if (!classes.length) return null;
      const constants = [classes];
      const bytecode = [19, 0, 0, 144, SYS_COMPACT_CLASS, 1, 1];
      return { constants, bytecode, meta: { kind: "compact-class", classCount: classes.length } };
    }
    module2.exports = { SYS_COMPACT_CLASS, CC_OP, tryCompileCompactClasses, classNodeToCompact };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/CompactClassRuntime.js
var require_CompactClassRuntime = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/CompactClassRuntime.js"(exports2, module2) {
    var { CC_OP } = require_CompactClassCodec();
    function specName(spec) {
      return Array.isArray(spec) ? spec[0] : spec.name;
    }
    function specSuper(spec) {
      return Array.isArray(spec) ? spec[1] : spec.superName;
    }
    function specFields(spec) {
      return Array.isArray(spec) ? spec[2] : spec.fields || [];
    }
    function specMethods(spec) {
      const raw = Array.isArray(spec) ? spec[3] : spec.methods || [];
      return raw.map((m) => Array.isArray(m) ? { name: m[0], params: m[1] || [], code: m[2] || [] } : m);
    }
    function specConstants(spec) {
      return Array.isArray(spec) ? spec[4] || [] : spec.constants || [];
    }
    function specClassId(spec, index) {
      return Array.isArray(spec) ? spec[5] ?? index : spec.classId ?? index;
    }
    function specScopeName(spec, fallback) {
      return Array.isArray(spec) ? spec[6] || fallback : spec.scopeName || fallback;
    }
    function ensureScope(rootScope, scopeName) {
      rootScope.__merkavaScopes = rootScope.__merkavaScopes || {};
      return rootScope.__merkavaScopes[scopeName] = rootScope.__merkavaScopes[scopeName] || { name: scopeName, classes: [], byName: {} };
    }
    function installCompactClasses(classes = [], rootScope = {}, options = {}) {
      const scopeName = options.scopeName || (classes[0] ? specScopeName(classes[0], "global") : "global");
      const scope = ensureScope(rootScope, scopeName);
      const byName = {};
      const makeClass = (spec, index) => {
        const classId = specClassId(spec, index);
        const klass = {
          __kind: "compactClass",
          scopeName,
          classId,
          name: specName(spec),
          fields: specFields(spec),
          methods: {},
          methodOrder: [],
          superClass: null,
          constants: specConstants(spec)
        };
        byName[klass.name] = klass;
        scope.byName[klass.name] = klass;
        scope.classes[classId] = klass;
        if (options.exposeGlobals !== false) rootScope[klass.name] = klass;
        return klass;
      };
      classes.forEach(makeClass);
      for (const spec of classes) {
        const klass = byName[specName(spec)];
        klass.superClass = byName[specSuper(spec)] || scope.byName[specSuper(spec)] || rootScope[specSuper(spec)] || null;
        for (const method of specMethods(spec)) {
          klass.methodOrder.push(method.name);
          klass.methods[method.name] = method;
        }
      }
      return { scope, byName };
    }
    function newCompactInstance(klass, args = [], rootScope = {}) {
      const instance = { __kind: "compactInstance", __class: klass, slots: Array((klass.fields || []).length).fill(void 0) };
      callCompactMethod(instance, "constructor", args, rootScope);
      return instance;
    }
    function findCompactMethod(klass, name) {
      if (!klass) return null;
      if (klass.methods?.[name]) return { klass, method: klass.methods[name] };
      return findCompactMethod(klass.superClass, name);
    }
    function callCompactMethod(instance, name, args = [], rootScope = {}) {
      const found = findCompactMethod(instance.__class, name);
      if (!found) return void 0;
      return runCompactMethod(instance, found.klass, found.method, args, rootScope);
    }
    function callSuperCompact(instance, ownerClass, name, args = [], rootScope = {}) {
      const found = findCompactMethod(ownerClass?.superClass, name);
      if (!found) return void 0;
      return runCompactMethod(instance, found.klass, found.method, args, rootScope);
    }
    function runCompactMethod(instance, ownerClass, method, args = [], rootScope = {}) {
      const stack = [];
      const code = method.code || [];
      const constants = ownerClass.constants || method.constants || [];
      let ip = 0;
      const readVar = () => {
        let shift = 0, out = 0;
        for (; ; ) {
          const b = code[ip++];
          out |= (b & 127) << shift;
          if (!(b & 128)) return out >>> 0;
          shift += 7;
        }
      };
      const c = (idx) => constants[idx];
      while (ip < code.length) {
        const op = code[ip++];
        if (op === CC_OP.END) break;
        if (op === CC_OP.SUPER_CTOR) continue;
        if (op === CC_OP.SET_THIS_SLOT_CONST) {
          instance.slots[code[ip++]] = c(readVar());
          continue;
        }
        if (op === CC_OP.GET_THIS_SLOT) {
          stack.push(instance.slots[code[ip++]]);
          continue;
        }
        if (op === CC_OP.CALL_SUPER_METHOD) {
          stack.push(callSuperCompact(instance, ownerClass, c(readVar()), [], rootScope));
          continue;
        }
        if (op === CC_OP.ADD) {
          const b = stack.pop(), a = stack.pop();
          stack.push(a + b);
          continue;
        }
        if (op === CC_OP.CONST) {
          stack.push(c(readVar()));
          continue;
        }
        if (op === CC_OP.SET_DOM_TEXT_ARG) {
          const target = rootScope[c(readVar())];
          const arg2 = args[code[ip++]];
          if (target) target.textContent = arg2;
          stack.push(arg2);
          continue;
        }
        if (op === CC_OP.SET_DOM_TEXT_CONST) {
          const target = rootScope[c(readVar())];
          const value = c(readVar());
          if (target) target.textContent = value;
          stack.push(value);
          continue;
        }
        if (op === CC_OP.RETURN) return stack.pop();
        throw new Error(`Unknown compact class opcode: ${op}`);
      }
      return stack.pop();
    }
    module2.exports = { installCompactClasses, newCompactInstance, callCompactMethod, ensureScope };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/CompactClassBinary.js
var require_CompactClassBinary = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/CompactClassBinary.js"(exports2, module2) {
    var { ByteWriter } = require_ByteWriter();
    var { ByteReader } = require_ByteReader();
    var { classNodeToCompact } = require_CompactClassCodec();
    var { installCompactClasses } = require_CompactClassRuntime();
    var MAGIC = "CCLS";
    var VERSION3 = 2;
    function poolRef(pool, text) {
      const value = String(text || "");
      let index = pool.indexOf(value);
      if (index < 0) {
        index = pool.length;
        pool.push(value);
      }
      return index;
    }
    function normalizeSpec(spec) {
      return Array.isArray(spec) ? spec : [spec.name, spec.superName || "", spec.fields || [], (spec.methods || []).map((m) => [m.name, m.params || [], m.code || []]), spec.constants || []];
    }
    function encodeConst(w, pool, value) {
      if (value == null) return w.u8(0);
      if (value === false) return w.u8(1);
      if (value === true) return w.u8(2);
      if (typeof value === "number" && Number.isInteger(value) && value >= 0) return w.u8(3).varUint(value);
      return w.u8(4).varUint(poolRef(pool, value));
    }
    function decodeConst(r, pool) {
      const t = r.u8();
      if (t === 0) return null;
      if (t === 1) return false;
      if (t === 2) return true;
      if (t === 3) return r.varUint();
      if (t === 4) return pool[r.varUint()] || "";
      throw new Error(`Bad CCLS constant type ${t}`);
    }
    function sameScopeName(scope) {
      return String(scope || "global");
    }
    function encodeCompactClassBinary(classes = [], options = {}) {
      const specs = classes.map(normalizeSpec);
      const pool = [];
      const scopeName = sameScopeName(options.scopeName || options.scopeId || "global");
      poolRef(pool, scopeName);
      for (const s of specs) {
        poolRef(pool, s[0]);
        if (s[1]) poolRef(pool, s[1]);
        for (const f of s[2]) poolRef(pool, f);
        for (const m of s[3]) {
          poolRef(pool, m[0]);
          for (const p of m[1] || []) poolRef(pool, p);
        }
        for (const c of s[4]) if (typeof c === "string") poolRef(pool, c);
      }
      const w = new ByteWriter();
      w.raw(Buffer.from(MAGIC, "ascii")).u8(VERSION3);
      w.varUint(pool.length);
      for (const s of pool) w.string(s);
      w.varUint(poolRef(pool, scopeName));
      w.varUint(specs.length);
      for (let classId = 0; classId < specs.length; classId++) {
        const s = specs[classId];
        w.varUint(poolRef(pool, s[0])).varUint(s[1] ? poolRef(pool, s[1]) + 1 : 0);
        w.varUint(s[2].length);
        for (const f of s[2]) w.varUint(poolRef(pool, f));
        w.varUint(s[4].length);
        for (const c of s[4]) encodeConst(w, pool, c);
        w.varUint(s[3].length);
        for (const m of s[3]) {
          w.varUint(poolRef(pool, m[0]));
          w.varUint((m[1] || []).length);
          for (const p of m[1] || []) w.varUint(poolRef(pool, p));
          w.bytesWithLength(m[2] || []);
        }
      }
      return w.toBuffer();
    }
    function decodeCompactClassBinary(buffer) {
      const r = new ByteReader(buffer);
      const magic = r.bytes(4).toString("ascii");
      if (magic !== MAGIC) throw new Error(`Bad CCLS magic: ${magic}`);
      const version = r.u8();
      if (version !== 1 && version !== VERSION3) throw new Error(`Unsupported CCLS version: ${version}`);
      const pool = [];
      const pc = r.varUint();
      for (let i = 0; i < pc; i++) pool.push(r.string());
      const scopeName = version >= 2 ? pool[r.varUint()] || "global" : "global";
      const classes = [];
      const cc = r.varUint();
      for (let i = 0; i < cc; i++) {
        const name = pool[r.varUint()] || "";
        const superIndex = r.varUint();
        const superName = superIndex ? pool[superIndex - 1] || "" : "";
        const fields = [];
        const fc = r.varUint();
        for (let f = 0; f < fc; f++) fields.push(pool[r.varUint()] || "");
        const constants = [];
        const kc = r.varUint();
        for (let k = 0; k < kc; k++) constants.push(decodeConst(r, pool));
        const methods = [];
        const mc = r.varUint();
        for (let m = 0; m < mc; m++) {
          const mn = pool[r.varUint()] || "";
          const params = [];
          const pc2 = r.varUint();
          for (let p = 0; p < pc2; p++) params.push(pool[r.varUint()] || "");
          methods.push([mn, params, [...r.bytesWithLength()]]);
        }
        classes.push([name, superName, fields, methods, constants, i, scopeName]);
      }
      return { version, scopeName, pool, classes };
    }
    function astToCompactClassBinary(ast, options = {}) {
      const classes = (ast.body || []).filter((stmt) => stmt.type === "ClassDeclaration").map(classNodeToCompact);
      return encodeCompactClassBinary(classes, options);
    }
    function runCompactClassBinary(buffer, options = {}) {
      const decoded = decodeCompactClassBinary(buffer);
      const globals = options.globals || {};
      installCompactClasses(decoded.classes, globals, { scopeName: decoded.scopeName, exposeGlobals: options.exposeGlobals !== false });
      return { ok: true, globals: { ...globals }, decoded };
    }
    module2.exports = { MAGIC, VERSION: VERSION3, encodeCompactClassBinary, decodeCompactClassBinary, astToCompactClassBinary, runCompactClassBinary };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaSyntaxPreflight.js
var require_MerkavaSyntaxPreflight = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaSyntaxPreflight.js"(exports2, module2) {
    function lineColumnFor(source, index) {
      const before = String(source || "").slice(0, Math.max(0, index));
      const lines = before.split(/\r?\n/);
      return { line: lines.length, column: lines[lines.length - 1].length + 1 };
    }
    function codeFrame(source, index) {
      const text = String(source || "");
      const where = lineColumnFor(text, index);
      const row = text.split(/\r?\n/)[where.line - 1] || "";
      return String(where.line) + ":" + String(where.column) + "\n" + row + "\n" + " ".repeat(Math.max(0, where.column - 1)) + "^";
    }
    function makeSyntaxError(message, source, index, file = "<anonymous>") {
      const where = lineColumnFor(source, index);
      const error = new SyntaxError(message + " at " + file + ":" + where.line + ":" + where.column);
      error.code = "MERKAVA_JS_SYNTAX_ERROR";
      error.file = file;
      error.line = where.line;
      error.column = where.column;
      error.index = index;
      error.frame = codeFrame(source, index);
      return error;
    }
    function assertBasicJsSyntax(source, file = "<anonymous>") {
      const text = String(source || "");
      const stack = [];
      let quote = null;
      for (let index = 0; index < text.length; index += 1) {
        const ch = text[index];
        const next = text[index + 1];
        if (quote) {
          if (ch === "\\") {
            index += 1;
            continue;
          }
          if (quote === "`" && ch === "$" && next === "{") {
            index += 1;
            continue;
          }
          if (ch === quote) {
            quote = null;
            continue;
          }
          continue;
        }
        if (ch === "/" && next === "/") {
          while (index < text.length && !/\r|\n/.test(text[index])) index += 1;
          continue;
        }
        if (ch === "/" && next === "*") {
          const end = text.indexOf("*/", index + 2);
          if (end < 0) throw makeSyntaxError("Unterminated block comment", text, index, file);
          index = end + 1;
          continue;
        }
        if (ch === '"' || ch === "'" || ch === "`") {
          quote = ch;
          continue;
        }
        if (ch === "(" || ch === "[" || ch === "{") {
          stack.push({ ch, index });
          continue;
        }
        if (ch === ")" || ch === "]" || ch === "}") {
          const open = stack.pop();
          if (!open) throw makeSyntaxError("Unexpected closing " + ch, text, index, file);
          const wants = open.ch === "(" ? ")" : open.ch === "[" ? "]" : "}";
          if (ch !== wants) throw makeSyntaxError("Mismatched closing " + ch + "; expected " + wants, text, index, file);
        }
      }
      if (quote) throw makeSyntaxError("Unterminated " + (quote === "`" ? "template" : "string") + " literal", text, text.length - 1, file);
      if (stack.length) {
        const open = stack[stack.length - 1];
        const wants = open.ch === "(" ? ")" : open.ch === "[" ? "]" : "}";
        throw makeSyntaxError("Unclosed " + open.ch + "; expected " + wants, text, open.index, file);
      }
      return true;
    }
    module2.exports = { assertBasicJsSyntax, makeSyntaxError, codeFrame, lineColumnFor };
  }
});

// geelooy/scripts/awtsmoos/MerkavaASTParser/constants.js
var require_constants = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaASTParser/constants.js"(exports2, module2) {
    (function(root, factory) {
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = factory();
      } else {
        root.MerkavahConstants = factory();
      }
    })(typeof self !== "undefined" ? self : exports2, function() {
      const TOKEN = {
        EOF: "EOF",
        DELETE: "DELETE",
        VOID: "VOID",
        DEBUGGER: "DEBUGGER",
        LOGICAL_OR_ASSIGN: "||=",
        LOGICAL_AND_ASSIGN: "&&=",
        BITWISE_AND: "&",
        BITWISE_OR: "|",
        BITWISE_XOR: "^",
        BITWISE_NOT: "~",
        LEFT_SHIFT: "<<",
        RIGHT_SHIFT: ">>",
        UNSIGNED_RIGHT_SHIFT: ">>>",
        BITWISE_AND_ASSIGN: "&=",
        BITWISE_OR_ASSIGN: "|=",
        BITWISE_XOR_ASSIGN: "^=",
        LEFT_SHIFT_ASSIGN: "<<=",
        RIGHT_SHIFT_ASSIGN: ">>=",
        UNSIGNED_RIGHT_SHIFT_ASSIGN: ">>>=",
        ILLEGAL: "ILLEGAL",
        MODULO: "MODULO",
        // Add this
        MODULO_ASSIGN: "%=",
        // And this
        EXPONENT_ASSIGN: "**=",
        // Identifiers & Literals
        IDENT: "IDENT",
        NUMBER: "NUMBER",
        PRIVATE_IDENT: "PRIVATE_IDENT",
        STRING: "STRING",
        WITH: "WITH",
        TEMPLATE_HEAD: "TEMPLATE_HEAD",
        TEMPLATE_MIDDLE: "TEMPLATE_MIDDLE",
        TEMPLATE_TAIL: "TEMPLATE_TAIL",
        // Operators
        ASSIGN: "=",
        PLUS: "+",
        MINUS: "-",
        BANG: "!",
        ASTERISK: "*",
        SLASH: "/",
        LT: "<",
        GT: ">",
        EQ: "==",
        NOT_EQ: "!=",
        EQ_STRICT: "===",
        NOT_EQ_STRICT: "!==",
        LTE: "<=",
        GTE: ">=",
        // Delimiters
        COMMA: ",",
        SEMICOLON: ";",
        COLON: ":",
        DOT: ".",
        QUESTION: "?",
        LPAREN: "(",
        RPAREN: ")",
        LBRACE: "{",
        RBRACE: "}",
        LBRACKET: "[",
        RBRACKET: "]",
        // Keywords
        FUNCTION: "FUNCTION",
        LET: "LET",
        CONST: "CONST",
        VAR: "VAR",
        RETURN: "RETURN",
        IF: "IF",
        ELSE: "ELSE",
        FOR: "FOR",
        WHILE: "WHILE",
        DO: "DO",
        SWITCH: "SWITCH",
        CASE: "CASE",
        DEFAULT: "DEFAULT",
        BREAK: "BREAK",
        CONTINUE: "CONTINUE",
        TRUE: "TRUE",
        FALSE: "FALSE",
        NULL: "NULL",
        THIS: "THIS",
        CLASS: "CLASS",
        EXTENDS: "EXTENDS",
        SUPER: "SUPER",
        NEW: "NEW",
        IMPORT: "IMPORT",
        EXPORT: "EXPORT",
        FROM: "FROM",
        AS: "AS",
        ASYNC: "ASYNC",
        AWAIT: "AWAIT",
        YIELD: "YIELD",
        TYPEOF: "TYPEOF",
        INSTANCEOF: "INSTANCEOF",
        IN: "IN",
        TRY: "TRY",
        CATCH: "CATCH",
        FINALLY: "FINALLY",
        THROW: "THROW",
        // Multi-character
        ARROW: "=>",
        INCREMENT: "++",
        DECREMENT: "--",
        EXPONENT: "**",
        AND: "&&",
        OR: "||",
        NULLISH_COALESCING: "??",
        OPTIONAL_CHAINING: "?.",
        DOTDOTDOT: "...",
        // Assignments
        PLUS_ASSIGN: "+=",
        MINUS_ASSIGN: "-=",
        ASTERISK_ASSIGN: "*=",
        SLASH_ASSIGN: "/=",
        EXPONENT_ASSIGN: "**=",
        NULLISH_ASSIGN: "??="
      };
      const KEYWORDS = {
        "function": TOKEN.FUNCTION,
        "let": TOKEN.LET,
        "const": TOKEN.CONST,
        "var": TOKEN.VAR,
        "return": TOKEN.RETURN,
        "if": TOKEN.IF,
        "else": TOKEN.ELSE,
        "for": TOKEN.FOR,
        "while": TOKEN.WHILE,
        "do": TOKEN.DO,
        "switch": TOKEN.SWITCH,
        "case": TOKEN.CASE,
        "default": TOKEN.DEFAULT,
        "break": TOKEN.BREAK,
        "continue": TOKEN.CONTINUE,
        "true": TOKEN.TRUE,
        "false": TOKEN.FALSE,
        "null": TOKEN.NULL,
        "this": TOKEN.THIS,
        "class": TOKEN.CLASS,
        "extends": TOKEN.EXTENDS,
        "super": TOKEN.SUPER,
        "new": TOKEN.NEW,
        "import": TOKEN.IMPORT,
        "export": TOKEN.EXPORT,
        "from": TOKEN.FROM,
        "as": TOKEN.AS,
        "async": TOKEN.ASYNC,
        "await": TOKEN.AWAIT,
        "yield": TOKEN.YIELD,
        "typeof": TOKEN.TYPEOF,
        "instanceof": TOKEN.INSTANCEOF,
        "in": TOKEN.IN,
        "try": TOKEN.TRY,
        "catch": TOKEN.CATCH,
        "finally": TOKEN.FINALLY,
        "throw": TOKEN.THROW,
        "delete": TOKEN.DELETE,
        "void": TOKEN.VOID,
        "debugger": TOKEN.DEBUGGER,
        "with": TOKEN.WITH
        //the final frontier
      };
      const PRECEDENCE = {
        LOWEST: 0,
        SEQUENCE: 1,
        ASSIGNMENT: 2,
        CONDITIONAL: 3,
        NULLISH: 4,
        OR: 5,
        AND: 6,
        // --- NEW LEVELS ADDED ---
        BITWISE_OR: 7,
        BITWISE_XOR: 8,
        BITWISE_AND: 9,
        // --- END NEW LEVELS ---
        EQUALITY: 10,
        // Renumbered from 7
        COMPARISON: 11,
        // Renumbered from 8
        SHIFT: 12,
        // --- NEW LEVEL ADDED ---
        SUM: 13,
        // Renumbered from 9
        PRODUCT: 14,
        // Renumbered from 10
        EXPONENT: 15,
        // Renumbered from 11
        PREFIX: 16,
        // Renumbered from 12
        POSTFIX: 17,
        // Renumbered from 13
        CALL: 18,
        // Renumbered from 14
        MEMBER: 19,
        // Renumbered from 15
        NEW: 20
        // Renumbered from 16
      };
      const PRECEDENCES = {
        [TOKEN.VOID]: PRECEDENCE.PREFIX,
        [TOKEN.DELETE]: PRECEDENCE.PREFIX,
        // <-- Add this line
        [TOKEN.TYPEOF]: PRECEDENCE.PREFIX,
        [TOKEN.COMMA]: PRECEDENCE.SEQUENCE,
        // ALL Assignment operators have the same precedence.
        [TOKEN.ASSIGN]: PRECEDENCE.ASSIGNMENT,
        [TOKEN.PLUS_ASSIGN]: PRECEDENCE.ASSIGNMENT,
        [TOKEN.MINUS_ASSIGN]: PRECEDENCE.ASSIGNMENT,
        [TOKEN.ASTERISK_ASSIGN]: PRECEDENCE.ASSIGNMENT,
        [TOKEN.SLASH_ASSIGN]: PRECEDENCE.ASSIGNMENT,
        [TOKEN.EXPONENT_ASSIGN]: PRECEDENCE.ASSIGNMENT,
        [TOKEN.MODULO_ASSIGN]: PRECEDENCE.ASSIGNMENT,
        [TOKEN.NULLISH_ASSIGN]: PRECEDENCE.ASSIGNMENT,
        [TOKEN.LOGICAL_AND_ASSIGN]: PRECEDENCE.ASSIGNMENT,
        [TOKEN.LOGICAL_OR_ASSIGN]: PRECEDENCE.ASSIGNMENT,
        [TOKEN.BITWISE_AND_ASSIGN]: PRECEDENCE.ASSIGNMENT,
        [TOKEN.BITWISE_OR_ASSIGN]: PRECEDENCE.ASSIGNMENT,
        [TOKEN.BITWISE_XOR_ASSIGN]: PRECEDENCE.ASSIGNMENT,
        [TOKEN.LEFT_SHIFT_ASSIGN]: PRECEDENCE.ASSIGNMENT,
        [TOKEN.RIGHT_SHIFT_ASSIGN]: PRECEDENCE.ASSIGNMENT,
        [TOKEN.UNSIGNED_RIGHT_SHIFT_ASSIGN]: PRECEDENCE.ASSIGNMENT,
        // --- 
        [TOKEN.QUESTION]: PRECEDENCE.CONDITIONAL,
        [TOKEN.NULLISH_COALESCING]: PRECEDENCE.NULLISH,
        [TOKEN.OR]: PRECEDENCE.OR,
        [TOKEN.AND]: PRECEDENCE.AND,
        [TOKEN.BITWISE_OR]: PRECEDENCE.BITWISE_OR,
        [TOKEN.BITWISE_XOR]: PRECEDENCE.BITWISE_XOR,
        [TOKEN.BITWISE_AND]: PRECEDENCE.BITWISE_AND,
        [TOKEN.EQ]: PRECEDENCE.EQUALITY,
        [TOKEN.EQ_STRICT]: PRECEDENCE.EQUALITY,
        [TOKEN.NOT_EQ]: PRECEDENCE.EQUALITY,
        [TOKEN.NOT_EQ_STRICT]: PRECEDENCE.EQUALITY,
        [TOKEN.LT]: PRECEDENCE.COMPARISON,
        [TOKEN.GT]: PRECEDENCE.COMPARISON,
        [TOKEN.LTE]: PRECEDENCE.COMPARISON,
        [TOKEN.GTE]: PRECEDENCE.COMPARISON,
        [TOKEN.IN]: PRECEDENCE.COMPARISON,
        [TOKEN.INSTANCEOF]: PRECEDENCE.COMPARISON,
        [TOKEN.LEFT_SHIFT]: PRECEDENCE.SHIFT,
        [TOKEN.RIGHT_SHIFT]: PRECEDENCE.SHIFT,
        [TOKEN.UNSIGNED_RIGHT_SHIFT]: PRECEDENCE.SHIFT,
        [TOKEN.PLUS]: PRECEDENCE.SUM,
        [TOKEN.MINUS]: PRECEDENCE.SUM,
        [TOKEN.SLASH]: PRECEDENCE.PRODUCT,
        [TOKEN.ASTERISK]: PRECEDENCE.PRODUCT,
        [TOKEN.MODULO]: PRECEDENCE.PRODUCT,
        [TOKEN.EXPONENT]: PRECEDENCE.EXPONENT,
        [TOKEN.INCREMENT]: PRECEDENCE.POSTFIX,
        [TOKEN.DECREMENT]: PRECEDENCE.POSTFIX,
        [TOKEN.LPAREN]: PRECEDENCE.CALL,
        [TOKEN.LBRACKET]: PRECEDENCE.MEMBER,
        [TOKEN.DOT]: PRECEDENCE.MEMBER,
        [TOKEN.OPTIONAL_CHAINING]: PRECEDENCE.MEMBER,
        [TOKEN.TEMPLATE_HEAD]: PRECEDENCE.CALL,
        [TOKEN.TEMPLATE_TAIL]: PRECEDENCE.CALL
      };
      return { TOKEN, KEYWORDS, PRECEDENCE, PRECEDENCES };
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaASTParser/Lexer.js
var require_Lexer = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaASTParser/Lexer.js"(exports2, module2) {
    (function(root, factory) {
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = factory(require_constants());
      } else {
        root.Lexer = factory(root.MerkavahConstants);
      }
    })(typeof self !== "undefined" ? self : exports2, function({ TOKEN, KEYWORDS }) {
      class Lexer {
        constructor(s) {
          this.source = s;
          this.position = 0;
          this.readPosition = 0;
          this.ch = "";
          this.line = 1;
          this.column = 0;
          this.hasLineTerminatorBefore = false;
          this.templateStack = [];
          this.braceNestingStack = [0];
          this.comments = [];
          this.op_count = 0;
          this.max_ops = 25e4;
          this._advance();
        }
        _guard() {
          if ((++this.op_count & 1023) === 0 && this.op_count > this.max_ops) {
            throw new Error(
              `LEXER HALTED: Maximum operation count (${this.max_ops}) exceeded. This is a guaranteed infinite loop, likely caused by a bug in the lexer's state. Stuck near character: '${this.ch}' at Line: ${this.line}, Col: ${this.column}`
            );
          }
        }
        _advance() {
          this._guard();
          if (this.readPosition >= this.source.length) {
            this.ch = null;
          } else {
            this.ch = this.source[this.readPosition];
          }
          this.position = this.readPosition;
          this.readPosition++;
          if (this.ch !== "\n" && this.ch !== "\r") {
            this.column++;
          }
        }
        _peek() {
          this._guard();
          if (this.readPosition >= this.source.length) return null;
          return this.source[this.readPosition];
        }
        // -------------------------------------------------------------------------
        // --- THE SINGLE, CORRECT, AND FINAL _skipWhitespace METHOD ---
        // -------------------------------------------------------------------------
        // B"H
        // In Lexer.js, replace the entire _skipWhitespace method with this one.
        _skipWhitespace() {
          while (this.ch !== null) {
            this._guard();
            const c = this.ch;
            if (c === " " || c === "	") {
              this._advance();
            } else if (c === "\n" || c === "\r") {
              this.hasLineTerminatorBefore = true;
              if (this.ch === "\r" && this._peek() === "\n") this._advance();
              this._advance();
              this.line++;
              this.column = 0;
            } else if (this.ch === "/" && this._peek() === "/") {
              const startPos = this.position;
              const startLine = this.line;
              const startCol = this.column;
              this._advance();
              this._advance();
              const commentStart = this.position;
              while (this.ch !== "\n" && this.ch !== "\r" && this.ch !== null) {
                this._advance();
              }
              const commentEnd = this.position;
              const value = this.source.slice(commentStart, commentEnd);
              this.comments.push({
                type: "Line",
                value: " " + value,
                // ESTree spec often includes leading space
                start: startPos,
                end: commentEnd,
                loc: {
                  start: { line: startLine, column: startCol },
                  end: { line: this.line, column: this.column }
                }
              });
            } else if (this.ch === "/" && this._peek() === "*") {
              const startPos = this.position;
              const startLine = this.line;
              const startCol = this.column;
              this._advance();
              this._advance();
              const commentStart = this.position;
              while (this.ch !== null && (this.ch !== "*" || this._peek() !== "/")) {
                if ("\n\r".includes(this.ch)) {
                  this.hasLineTerminatorBefore = true;
                  if (this.ch === "\r" && this._peek() === "\n") this._advance();
                  this.line++;
                  this.column = 0;
                }
                this._advance();
              }
              const commentEnd = this.position;
              const value = this.source.slice(commentStart, commentEnd);
              if (this.ch !== null) {
                this._advance();
                this._advance();
              }
              this.comments.push({
                type: "Block",
                value,
                start: startPos,
                end: commentEnd + 2,
                // account for */
                loc: {
                  start: { line: startLine, column: startCol },
                  end: { line: this.line, column: this.column }
                }
              });
            } else if (this.hasLineTerminatorBefore && this.ch === "<" && this._peek() === "!" && this.source.substring(this.position, this.position + 4) === "<!--") {
              while (this.ch !== "\n" && this.ch !== "\r" && this.ch !== null) this._advance();
            } else if (this.hasLineTerminatorBefore && this.ch === "-" && this._peek() === "-" && this.source.substring(this.position, this.position + 3) === "-->") {
              while (this.ch !== "\n" && this.ch !== "\r" && this.ch !== null) this._advance();
            } else {
              break;
            }
          }
        }
        _readPrivateIdentifier() {
          this._advance();
          const startColumn = this.column - 1;
          const ident = this._readIdentifier();
          if (!ident) {
            return this._makeToken(TOKEN.ILLEGAL, "#", startColumn);
          }
          return this._makeToken(TOKEN.PRIVATE_IDENT, "#" + ident, startColumn);
        }
        _readTemplateHead() {
          this._guard();
          this._advance();
          return this._readTemplatePart("TEMPLATE_HEAD");
        }
        _readTemplateMiddleOrTail() {
          this._guard();
          this._advance();
          this.templateStack.pop();
          return this._readTemplatePart("TEMPLATE_MIDDLE");
        }
        // B"H 
        nextToken() {
          this._guard();
          this.hasLineTerminatorBefore = false;
          this._skipWhitespace();
          const startLine = this.line;
          const startColumn = this.column;
          const startPosition = this.position;
          if (this.ch === null) {
            return this._makeToken(TOKEN.EOF, "", startColumn, startLine, startPosition);
          }
          const c = this.ch;
          let tok;
          switch (c) {
            case "{":
              this.braceNestingStack[this.braceNestingStack.length - 1]++;
              tok = this._makeToken(TOKEN.LBRACE, "{", startColumn, startLine, startPosition);
              this._advance();
              return tok;
            case "}":
              const currentLevel = this.braceNestingStack[this.braceNestingStack.length - 1];
              if (currentLevel > 0) {
                this.braceNestingStack[this.braceNestingStack.length - 1]--;
                if (this.braceNestingStack[this.braceNestingStack.length - 1] === 0 && this.templateStack.length > 0) {
                  this.templateStack.pop();
                  this.braceNestingStack.pop();
                  this._advance();
                  return this._readTemplatePart(true, startPosition);
                }
              }
              tok = this._makeToken(TOKEN.RBRACE, "}", startColumn, startLine, startPosition);
              this._advance();
              return tok;
            // ... The rest of the switch cases remain exactly as they were in the previous valid version ...
            case "`":
              this._advance();
              return this._readTemplatePart(false, startPosition);
            case "=":
              this._advance();
              if (this.ch === ">") {
                this._advance();
                return this._makeToken(TOKEN.ARROW, "=>", startColumn, startLine, startPosition);
              }
              if (this.ch === "=") {
                this._advance();
                return this.ch === "=" ? (this._advance(), this._makeToken(TOKEN.EQ_STRICT, "===", startColumn, startLine, startPosition)) : this._makeToken(TOKEN.EQ, "==", startColumn, startLine, startPosition);
              }
              return this._makeToken(TOKEN.ASSIGN, "=", startColumn, startLine, startPosition);
            case "!":
              this._advance();
              if (this.ch === "=") {
                this._advance();
                return this.ch === "=" ? (this._advance(), this._makeToken(TOKEN.NOT_EQ_STRICT, "!==", startColumn, startLine, startPosition)) : this._makeToken(TOKEN.NOT_EQ, "!=", startColumn, startLine, startPosition);
              }
              return this._makeToken(TOKEN.BANG, "!", startColumn, startLine, startPosition);
            case "+":
              this._advance();
              if (this.ch === "+") {
                this._advance();
                return this._makeToken(TOKEN.INCREMENT, "++", startColumn, startLine, startPosition);
              }
              if (this.ch === "=") {
                this._advance();
                return this._makeToken(TOKEN.PLUS_ASSIGN, "+=", startColumn, startLine, startPosition);
              }
              return this._makeToken(TOKEN.PLUS, "+", startColumn, startLine, startPosition);
            case "-":
              this._advance();
              if (this.ch === "-") {
                this._advance();
                return this._makeToken(TOKEN.DECREMENT, "--", startColumn, startLine, startPosition);
              }
              if (this.ch === "=") {
                this._advance();
                return this._makeToken(TOKEN.MINUS_ASSIGN, "-=", startColumn, startLine, startPosition);
              }
              return this._makeToken(TOKEN.MINUS, "-", startColumn, startLine, startPosition);
            case "*":
              this._advance();
              if (this.ch === "*") {
                this._advance();
                return this.ch === "=" ? (this._advance(), this._makeToken(TOKEN.EXPONENT_ASSIGN, "**=", startColumn, startLine, startPosition)) : this._makeToken(TOKEN.EXPONENT, "**", startColumn, startLine, startPosition);
              }
              if (this.ch === "=") {
                this._advance();
                return this._makeToken(TOKEN.ASTERISK_ASSIGN, "*=", startColumn, startLine, startPosition);
              }
              return this._makeToken(TOKEN.ASTERISK, "*", startColumn, startLine, startPosition);
            case "/":
              this._advance();
              if (this.ch === "=") {
                this._advance();
                return this._makeToken(TOKEN.SLASH_ASSIGN, "/=", startColumn, startLine, startPosition);
              }
              return this._makeToken(TOKEN.SLASH, "/", startColumn, startLine, startPosition);
            case "%":
              this._advance();
              if (this.ch === "=") {
                this._advance();
                return this._makeToken(TOKEN.MODULO_ASSIGN, "%=", startColumn, startLine, startPosition);
              }
              return this._makeToken(TOKEN.MODULO, "%", startColumn, startLine, startPosition);
            case "<":
              this._advance();
              if (this.ch === "<") {
                this._advance();
                return this.ch === "=" ? (this._advance(), this._makeToken(TOKEN.LEFT_SHIFT_ASSIGN, "<<=", startColumn, startLine, startPosition)) : this._makeToken(TOKEN.LEFT_SHIFT, "<<", startColumn, startLine, startPosition);
              }
              if (this.ch === "=") {
                this._advance();
                return this._makeToken(TOKEN.LTE, "<=", startColumn, startLine, startPosition);
              }
              return this._makeToken(TOKEN.LT, "<", startColumn, startLine, startPosition);
            case ">":
              this._advance();
              if (this.ch === ">") {
                this._advance();
                if (this.ch === ">") {
                  this._advance();
                  return this.ch === "=" ? (this._advance(), this._makeToken(TOKEN.UNSIGNED_RIGHT_SHIFT_ASSIGN, ">>>=", startColumn, startLine, startPosition)) : this._makeToken(TOKEN.UNSIGNED_RIGHT_SHIFT, ">>>", startColumn, startLine, startPosition);
                }
                if (this.ch === "=") {
                  this._advance();
                  return this._makeToken(TOKEN.RIGHT_SHIFT_ASSIGN, ">>=", startColumn, startLine, startPosition);
                }
                return this._makeToken(TOKEN.RIGHT_SHIFT, ">>", startColumn, startLine, startPosition);
              }
              if (this.ch === "=") {
                this._advance();
                return this._makeToken(TOKEN.GTE, ">=", startColumn, startLine, startPosition);
              }
              return this._makeToken(TOKEN.GT, ">", startColumn, startLine, startPosition);
            case "&":
              this._advance();
              if (this.ch === "&") {
                this._advance();
                return this.ch === "=" ? (this._advance(), this._makeToken(TOKEN.LOGICAL_AND_ASSIGN, "&&=", startColumn, startLine, startPosition)) : this._makeToken(TOKEN.AND, "&&", startColumn, startLine, startPosition);
              }
              if (this.ch === "=") {
                this._advance();
                return this._makeToken(TOKEN.BITWISE_AND_ASSIGN, "&=", startColumn, startLine, startPosition);
              }
              return this._makeToken(TOKEN.BITWISE_AND, "&", startColumn, startLine, startPosition);
            case "|":
              this._advance();
              if (this.ch === "|") {
                this._advance();
                return this.ch === "=" ? (this._advance(), this._makeToken(TOKEN.LOGICAL_OR_ASSIGN, "||=", startColumn, startLine, startPosition)) : this._makeToken(TOKEN.OR, "||", startColumn, startLine, startPosition);
              }
              if (this.ch === "=") {
                this._advance();
                return this._makeToken(TOKEN.BITWISE_OR_ASSIGN, "|=", startColumn, startLine, startPosition);
              }
              return this._makeToken(TOKEN.BITWISE_OR, "|", startColumn, startLine, startPosition);
            case "^":
              this._advance();
              if (this.ch === "=") {
                this._advance();
                return this._makeToken(TOKEN.BITWISE_XOR_ASSIGN, "^=", startColumn, startLine, startPosition);
              }
              return this._makeToken(TOKEN.BITWISE_XOR, "^", startColumn, startLine, startPosition);
            case "~":
              tok = this._makeToken(TOKEN.BITWISE_NOT, "~", startColumn, startLine, startPosition);
              this._advance();
              return tok;
            case "?":
              this._advance();
              if (this.ch === "?") {
                this._advance();
                return this.ch === "=" ? (this._advance(), this._makeToken(TOKEN.NULLISH_ASSIGN, "??=", startColumn, startLine, startPosition)) : this._makeToken(TOKEN.NULLISH_COALESCING, "??", startColumn, startLine, startPosition);
              }
              if (this.ch === ".") {
                this._advance();
                return this._makeToken(TOKEN.OPTIONAL_CHAINING, "?.", startColumn, startLine, startPosition);
              }
              return this._makeToken(TOKEN.QUESTION, "?", startColumn, startLine, startPosition);
            case ".":
              this._advance();
              if (this.ch === "." && this._peek() === ".") {
                this._advance();
                this._advance();
                return this._makeToken(TOKEN.DOTDOTDOT, "...", startColumn, startLine, startPosition);
              }
              return this._makeToken(TOKEN.DOT, ".", startColumn, startLine, startPosition);
            case "(":
              tok = this._makeToken(TOKEN.LPAREN, "(", startColumn, startLine, startPosition);
              this._advance();
              return tok;
            case ")":
              tok = this._makeToken(TOKEN.RPAREN, ")", startColumn, startLine, startPosition);
              this._advance();
              return tok;
            case "[":
              tok = this._makeToken(TOKEN.LBRACKET, "[", startColumn, startLine, startPosition);
              this._advance();
              return tok;
            case "]":
              tok = this._makeToken(TOKEN.RBRACKET, "]", startColumn, startLine, startPosition);
              this._advance();
              return tok;
            case ",":
              tok = this._makeToken(TOKEN.COMMA, ",", startColumn, startLine, startPosition);
              this._advance();
              return tok;
            case ";":
              tok = this._makeToken(TOKEN.SEMICOLON, ";", startColumn, startLine, startPosition);
              this._advance();
              return tok;
            case ":":
              tok = this._makeToken(TOKEN.COLON, ":", startColumn, startLine, startPosition);
              this._advance();
              return tok;
            case '"':
            case "'":
              return this._readString(c, startColumn, startLine, startPosition);
            case "#":
              return this._readPrivateIdentifier(startColumn, startLine, startPosition);
            case "\\":
              const ident = this._readIdentifier();
              return this._makeToken(TOKEN.IDENT, ident, startColumn, startLine, startPosition);
            default:
              if (this._isLetter(c)) {
                const ident2 = this._readIdentifier();
                const type = Object.prototype.hasOwnProperty.call(KEYWORDS, ident2) ? KEYWORDS[ident2] : TOKEN.IDENT;
                return this._makeToken(type, ident2, startColumn, startLine, startPosition);
              }
              if (this._isDigit(c)) {
                return this._makeToken(TOKEN.NUMBER, this._readNumber(), startColumn, startLine, startPosition);
              }
              tok = this._makeToken(TOKEN.ILLEGAL, c, startColumn, startLine, startPosition);
              this._advance();
              return tok;
          }
        }
        // B"H - Rectified _isLetter to include all non-ASCII chars (e.g. ಠ)
        _isLetter(c) {
          return c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c === "_" || c === "$" || c >= "\x80";
        }
        // B"H - Rectified _isIdentifierChar to include Backslash
        _isIdentifierChar(c) {
          return c !== null && (this._isLetter(c) || this._isDigit(c) || c === "\\");
        }
        // B"H 
        _readTemplatePart(isResuming = false, startPosition) {
          const p = this.position;
          while (this.ch !== null) {
            if (this.ch === "`") {
              const literal = this.source.slice(p, this.position);
              this._advance();
              return this._makeToken(TOKEN.TEMPLATE_TAIL || "TEMPLATE_TAIL", literal, void 0, void 0, startPosition);
            }
            if (this.ch === "$" && this._peek() === "{") {
              const literal = this.source.slice(p, this.position);
              this._advance();
              this._advance();
              this.templateStack.push(true);
              this.braceNestingStack.push(1);
              const type = isResuming ? TOKEN.TEMPLATE_MIDDLE || "TEMPLATE_MIDDLE" : TOKEN.TEMPLATE_HEAD || "TEMPLATE_HEAD";
              return this._makeToken(type, literal, void 0, void 0, startPosition);
            }
            if (this.ch === "\\") {
              this._advance();
              if (this.ch === null) break;
            }
            this._advance();
          }
          return this._makeToken(TOKEN.ILLEGAL, "Unterminated template literal", void 0, void 0, startPosition);
        }
        // B"H - Rectified _makeToken: fast path when positions are provided.
        _makeToken(type, literal, startColumn, startLine, startPosition) {
          if (startColumn !== void 0) {
            return {
              type,
              literal,
              line: startLine,
              column: startColumn,
              hasLineTerminatorBefore: this.hasLineTerminatorBefore,
              startIndex: startPosition
            };
          }
          const ll = literal ? literal.length : 0;
          return {
            type,
            literal,
            line: startLine || this.line,
            column: this.column - (ll || (this.ch === null ? 0 : 1)),
            hasLineTerminatorBefore: this.hasLineTerminatorBefore,
            startIndex: startPosition !== void 0 ? startPosition : this.position - ll
          };
        }
        _readIdentifier() {
          const s = this.source;
          const n2 = s.length;
          const start = this.position;
          let p = start;
          while (p < n2) {
            const c = s.charCodeAt(p);
            if (c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c === 95 || c === 36 || c === 92 || c >= 128) {
              p++;
            } else break;
          }
          const ident = s.slice(start, p);
          this.column += p - start;
          this.position = p;
          if (p >= n2) {
            this.ch = null;
            this.readPosition = n2 + 1;
          } else {
            this.ch = s[p];
            this.readPosition = p + 1;
          }
          this.op_count += p - start;
          return ident;
        }
        // B"H
        // In Lexer.js, replace the _readNumber method with this one.
        // This version adds support for numeric separators (e.g., 1_000_000)
        // to the existing logic for different number types.
        _readNumber() {
          const p = this.position;
          if (this.ch === "0" && this._peek() && "xob".includes(this._peek().toLowerCase())) {
            this._advance();
            this._advance();
            while (this.ch !== null) {
              if (this._isIdentifierChar(this.ch)) {
                this._advance();
                if (this.ch === "_" && this._isIdentifierChar(this._peek())) {
                  this._advance();
                }
              } else {
                break;
              }
            }
          } else {
            while (this.ch !== null) {
              if (this._isDigit(this.ch)) {
                this._advance();
                if (this.ch === "_" && this._isDigit(this._peek())) {
                  this._advance();
                }
              } else {
                break;
              }
            }
            if (this.ch === "." && this._isDigit(this._peek())) {
              this._advance();
              while (this.ch !== null) {
                if (this._isDigit(this.ch)) {
                  this._advance();
                  if (this.ch === "_" && this._isDigit(this._peek())) {
                    this._advance();
                  }
                } else {
                  break;
                }
              }
            }
          }
          if (this.ch === "n") {
            this._advance();
          }
          return this.source.slice(p, this.position);
        }
        _readString(quote) {
          this._advance();
          const p = this.position;
          while (this.ch !== quote && this.ch !== null) {
            this._guard();
            if (this.ch === "\\") this._advance();
            this._advance();
          }
          const s = this.source.slice(p, this.position);
          if (this.ch !== quote) return this._makeToken(TOKEN.ILLEGAL, s);
          this._advance();
          return this._makeToken(TOKEN.STRING, s);
        }
        _isDigit(c) {
          return c >= "0" && c <= "9";
        }
      }
      return Lexer;
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaASTParser/parser-core.js
var require_parser_core = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaASTParser/parser-core.js"(exports2, module2) {
    (function(root, factory) {
      const merkavaPromise = factory();
      if (typeof module2 === "object" && module2.exports) {
        module2.exports = merkavaPromise;
      } else {
        root.MerkavahParserPromise = merkavaPromise;
      }
      merkavaPromise.catch((err) => {
        console.error("CRITICAL: Merkava Parser initialization failed.", err);
      });
    })(typeof self !== "undefined" ? self : exports2, function() {
      const isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
      const isWorker = typeof importScripts === "function";
      const host = isNode ? globalThis : self;
      if (isNode && typeof globalThis.window === "undefined") {
        globalThis.window = globalThis;
      }
      let basePath = "";
      if (!isNode) {
        if (document.currentScript) {
          const src = document.currentScript.src;
          basePath = src.substring(0, src.lastIndexOf("/") + 1);
        } else {
          try {
            throw new Error();
          } catch (e) {
            const stackLines = e.stack.split("\n");
            const match = stackLines.find((l) => l.includes("parser-core.js"));
            if (match) {
              const urlMatch = match.match(/(https?|file):\/\/[^:\s)]+/);
              if (urlMatch) {
                const fullUrl = urlMatch[0];
                basePath = fullUrl.substring(0, fullUrl.lastIndexOf("/") + 1);
              }
            }
          }
        }
      }
      console.log("[Merkava Parser] Detected Base Path:", basePath);
      const loadScript = (filename) => {
        if (isNode) {
          return Promise.resolve(require(filename));
        }
        const cleanFile = filename.replace(/^\.\//, "");
        const url = basePath + cleanFile;
        return new Promise((resolve, reject) => {
          if (isWorker) {
            try {
              importScripts(url);
              resolve();
            } catch (e) {
              reject(new Error(`Worker importScripts failed for ${url}`));
            }
          } else {
            const script = document.createElement("script");
            script.src = url;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Script load failed: ${url}`));
            document.head.appendChild(script);
          }
        });
      };
      const initialize = async () => {
        await loadScript("./constants.js");
        await loadScript("./node_helpers.js");
        await loadScript("./Lexer.js");
        if (isNode) {
          host.MerkavahConstants = host.MerkavahConstants || require_constants();
          host.Lexer = host.Lexer || require_Lexer();
        }
        const { TOKEN, PRECEDENCES, PRECEDENCE } = isNode ? require_constants() : self.MerkavahConstants;
        const LexerClass = isNode ? require_Lexer() : self.Lexer;
        if (!LexerClass) throw new Error("Lexer class not found after loading.");
        class MerkavahParser {
          constructor(s) {
            this.l = new LexerClass(s);
            this.errors = [];
            this.panicMode = false;
            this.prevToken = null;
            this.currToken = null;
            this.peekToken = null;
            this.prefixParseFns = {};
            this.infixParseFns = {};
            if (typeof this.registerExpressionParsers === "function") {
              this.registerExpressionParsers();
            }
            if (typeof this.registerExpressionParsers === "function") {
              this.registerExpressionParsers();
            }
            this.recursionDepth = 0;
            this.maxRecursionDepth = 2e3;
            this.parsingTemplateExpression = 0;
            this.op_count = 0;
            this.max_ops = 5e5;
            this.currToken = this.l.nextToken();
            this.peekToken = this.l.nextToken();
          }
          _guard() {
            if ((++this.op_count & 1023) === 0 && this.op_count > this.max_ops) {
              throw new Error(`PARSER HALTED: Max ops exceeded near line ${this.currToken.line}.`);
            }
          }
          _advance() {
            this._guard();
            this.prevToken = this.currToken;
            this.currToken = this.peekToken;
            this.peekToken = this.l.nextToken();
          }
          _peekTokenIs(t) {
            return this.peekToken.type === t;
          }
          _currTokenIs(t) {
            return this.currToken.type === t;
          }
          _startNode() {
            if (this.noLoc) return { loc: {} };
            return {
              start: this.currToken.startIndex,
              loc: { start: { line: this.currToken.line, column: this.currToken.column } }
            };
          }
          _finishNode(node, startNodeInfo) {
            if (this.noLoc) {
              node.loc = startNodeInfo.loc;
              return node;
            }
            const combined = { ...startNodeInfo, ...node };
            const endToken = this.prevToken || this.currToken;
            if (endToken) {
              const len = endToken.literal ? endToken.literal.length : 0;
              combined.end = (endToken.startIndex || 0) + len;
              combined.loc.end = { line: endToken.line, column: endToken.column + len };
            }
            return combined;
          }
          _error(m) {
            if (!this.panicMode) {
              this.panicMode = true;
              const msg = `[Shevirah] ${m} on line ${this.currToken.line}:${this.currToken.column}. Got ${this.currToken.type}`;
              this.errors.push(msg);
              throw new Error(msg);
            }
          }
          _expect(t) {
            if (this._currTokenIs(t)) {
              this._advance();
              return true;
            }
            this._error(`Expected ${t}, got ${this.currToken.type}`);
          }
          _consumeSemicolon() {
            if (this._currTokenIs(TOKEN.SEMICOLON)) {
              this._advance();
              return;
            }
            if (this._currTokenIs(TOKEN.RBRACE) || this._currTokenIs(TOKEN.EOF) || this.currToken.hasLineTerminatorBefore) {
              return;
            }
          }
          _getPrecedence(t) {
            return PRECEDENCES[t.type] || PRECEDENCE.LOWEST;
          }
          parse() {
            const program = {
              type: "Program",
              body: [],
              sourceType: "module",
              loc: { start: { line: 1, column: 0 } }
            };
            while (!this._currTokenIs(TOKEN.EOF)) {
              try {
                if (typeof this._parseDeclaration !== "function") {
                  throw new Error("Parser configuration incomplete: _parseDeclaration is missing. The 'parser-declarations.js' extension may have failed to load.");
                }
                const stmt = this._parseDeclaration();
                if (stmt) program.body.push(stmt);
              } catch (e) {
                if (!this.errors.includes(e.message)) this.errors.push(e.message);
                break;
              }
            }
            const endToken = this.prevToken || this.currToken;
            program.loc.end = {
              line: endToken.line,
              column: endToken.column + (endToken.literal?.length || 0)
            };
            return program;
          }
        }
        host.MerkavahParser = MerkavahParser;
        await loadScript("./parser-expressions.js");
        await loadScript("./parser-statements.js");
        await loadScript("./parser-declarations.js");
        return host.MerkavahParser;
      };
      return initialize();
    });
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaJsCompiler.js
var require_MerkavaJsCompiler = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaJsCompiler.js"(exports2, module2) {
    var { lowerAstToJson } = require_MerkavaAstLowerer();
    var { compileJsonCode } = require_MerkavaJsonCompiler();
    var { encodeSangArtifact } = require_SangCodec();
    var { tryCompileCompactClasses } = require_CompactClassCodec();
    var { astToCompactClassBinary } = require_CompactClassBinary();
    var { assertBasicJsSyntax } = require_MerkavaSyntaxPreflight();
    function compileFileName(options = {}) {
      return options.file || options.filename || options.path || "<inline>";
    }
    async function parseJs2(source, options = {}) {
      const file = typeof options === "string" ? options : compileFileName(options);
      assertBasicJsSyntax(source, file);
      const Parser = await require_parser_core();
      const parser = new Parser(source);
      try {
        return parser.parse();
      } catch (error) {
        error.code = error.code || "MERKAVA_JS_PARSE_ERROR";
        error.file = error.file || file;
        throw error;
      }
    }
    function onlyClasses(ast) {
      const body = ast.body || [];
      if (body.length === 0 || !body.every((stmt) => stmt.type === "ClassDeclaration")) return false;
      const needsFull = (cls) => (cls.body?.body || []).some((m) => m.static || m.kind === "get" || m.kind === "set");
      return !body.some(needsFull);
    }
    async function compileJsToJson(source, options = {}) {
      return lowerAstToJson(await parseJs2(source, options));
    }
    async function compileJsToCode2(source, options = {}) {
      const ast = await parseJs2(source, options);
      const compact = onlyClasses(ast) ? tryCompileCompactClasses(ast) : null;
      return compact || compileJsonCode(lowerAstToJson(ast));
    }
    async function compileJsToSang(source, options = {}) {
      const ast = await parseJs2(source, options);
      if (onlyClasses(ast)) return astToCompactClassBinary(ast, options);
      return encodeSangArtifact(compileJsonCode(lowerAstToJson(ast)));
    }
    module2.exports = { parseJs: parseJs2, compileJsToJson, compileJsToCode: compileJsToCode2, compileJsToSang };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaVmLoader.js
var require_MerkavaVmLoader = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaVmLoader.js"(exports2, module2) {
    var fs2 = require("fs");
    var path2 = require("path");
    var vm2 = require("vm");
    var VM_FILES = [
      "../merkava-opcodes.js",
      "../merkava-vm/executors/flow.js",
      "../merkava-vm/executors/stack.js",
      "../merkava-vm/executors/math.js",
      "../merkava-vm/executors/objects.js",
      "../merkava-vm/executors/functions.js",
      "../merkava-vm/executors/json.js",
      "../merkava-vm/instructions.js",
      "../merkava-vm/thread.js",
      "../merkava-vm/index.js"
    ];
    function loadMerkavaVm2() {
      if (globalThis.MerkavaVM?.Thread && globalThis.MerkavaExecutor) return globalThis.MerkavaVM;
      for (const rel of VM_FILES) {
        const file = path2.join(__dirname, rel);
        vm2.runInThisContext(fs2.readFileSync(file, "utf8"), { filename: file });
      }
      return globalThis.MerkavaVM;
    }
    module2.exports = { loadMerkavaVm: loadMerkavaVm2 };
  }
});

// geelooy/scripts/awtsmoos/compiling/js/value-model.js
var value_model_exports = {};
__export(value_model_exports, {
  FIXNUM_BITS: () => FIXNUM_BITS,
  FIXNUM_MAX: () => FIXNUM_MAX,
  FIXNUM_MIN: () => FIXNUM_MIN,
  FLAG_FORWARDED: () => FLAG_FORWARDED,
  FLAG_GEN_MASK: () => FLAG_GEN_MASK,
  FLAG_GEN_SHIFT: () => FLAG_GEN_SHIFT,
  FLAG_MARKED: () => FLAG_MARKED,
  HEADER_SIZE: () => HEADER_SIZE,
  IMM_FALSE: () => IMM_FALSE,
  IMM_HOLE: () => IMM_HOLE,
  IMM_NAN: () => IMM_NAN,
  IMM_NULL: () => IMM_NULL,
  IMM_TRUE: () => IMM_TRUE,
  IMM_UNDEFINED: () => IMM_UNDEFINED,
  MASK64: () => MASK64,
  SSO_MAX_UNITS: () => SSO_MAX_UNITS,
  TAG_DOUBLE: () => TAG_DOUBLE,
  TAG_FIXNUM: () => TAG_FIXNUM,
  TAG_HEAPREF: () => TAG_HEAPREF,
  TAG_IMM: () => TAG_IMM,
  TAG_MASK: () => TAG_MASK,
  TAG_R5: () => TAG_R5,
  TAG_R6: () => TAG_R6,
  TAG_R7: () => TAG_R7,
  TAG_SMALLSTR: () => TAG_SMALLSTR,
  TYPE_ARRAY: () => TYPE_ARRAY,
  TYPE_BUFFER: () => TYPE_BUFFER,
  TYPE_CLOSURE: () => TYPE_CLOSURE,
  TYPE_DOUBLE: () => TYPE_DOUBLE,
  TYPE_OBJECT: () => TYPE_OBJECT,
  TYPE_SHAPE: () => TYPE_SHAPE,
  TYPE_SPARSE_ARRAY: () => TYPE_SPARSE_ARRAY,
  TYPE_STRING: () => TYPE_STRING,
  V_FALSE: () => V_FALSE,
  V_HOLE: () => V_HOLE,
  V_NAN: () => V_NAN,
  V_NULL: () => V_NULL,
  V_TRUE: () => V_TRUE,
  V_UNDEFINED: () => V_UNDEFINED,
  asI64: () => asI64,
  asU64: () => asU64,
  decodeValue: () => decodeValue,
  doubleref: () => doubleref,
  encodeValue: () => encodeValue,
  fixnum: () => fixnum,
  fixnumValue: () => fixnumValue,
  heapPtr: () => heapPtr,
  heapref: () => heapref,
  imm: () => imm,
  immCode: () => immCode,
  isDouble: () => isDouble,
  isFixnum: () => isFixnum,
  isHeapref: () => isHeapref,
  isImm: () => isImm,
  isSmallString: () => isSmallString,
  isTruthy: () => isTruthy,
  makeHeap: () => makeHeap,
  readHeader: () => readHeader,
  smallString: () => smallString,
  smallStringLength: () => smallStringLength,
  smallStringValue: () => smallStringValue,
  strictEqual: () => strictEqual,
  tagOf: () => tagOf,
  typeOf: () => typeOf,
  writeHeader: () => writeHeader
});
function fixnum(n2) {
  const b = BigInt(n2);
  if (b < FIXNUM_MIN || b > FIXNUM_MAX) throw new RangeError(`fixnum out of range: ${n2}`);
  return asU64(b << 3n);
}
function fixnumValue(v) {
  const u = asU64(v);
  const shifted = u >> 3n;
  return u & 1n << 63n ? shifted - (1n << 61n) : shifted;
}
function heapref(ptr) {
  const p = asU64(ptr);
  if ((p & 7n) !== 0n) throw new RangeError(`heapref ptr not 8-aligned: 0x${p.toString(16)}`);
  return p | TAG_HEAPREF;
}
function doubleref(ptr) {
  const p = asU64(ptr);
  if ((p & 7n) !== 0n) throw new RangeError(`doubleref ptr not 8-aligned: 0x${p.toString(16)}`);
  return p | TAG_DOUBLE;
}
function smallString(s) {
  if (typeof s !== "string") throw new TypeError("smallString expects a string");
  if (s.length > SSO_MAX_UNITS) throw new RangeError(`smallString max ${SSO_MAX_UNITS} units`);
  let v = TAG_SMALLSTR | BigInt(s.length) << 3n;
  for (let i = 0; i < s.length; i++) v |= BigInt(s.charCodeAt(i)) << 5n + 16n * BigInt(i);
  return asU64(v);
}
function smallStringValue(v) {
  const n2 = smallStringLength(v);
  let s = "";
  for (let i = 0; i < n2; i++) s += String.fromCharCode(Number(asU64(v) >> 5n + 16n * BigInt(i) & 0xffffn));
  return s;
}
function writeHeader(dv, off, type, flags, meta) {
  dv.setUint32(off, type >>> 0, true);
  dv.setUint32(off + 4, flags >>> 0, true);
  dv.setBigUint64(off + 8, asU64(meta), true);
}
function readHeader(dv, off) {
  return {
    type: dv.getUint32(off, true),
    flags: dv.getUint32(off + 4, true),
    meta: dv.getBigUint64(off + 8, true)
  };
}
function makeHeap(sizeBytes = 1 << 20) {
  const buf = new ArrayBuffer(sizeBytes);
  const dv = new DataView(buf);
  let top = 0;
  const heap = {
    dv,
    get top() {
      return top;
    },
    // Allocate a heap object: header + payloadBytes, 16-aligned. Returns byte offset.
    alloc(type, payloadBytes, meta = 0n, flags = 0) {
      const total = HEADER_SIZE + Number(payloadBytes);
      const aligned = total + 15 & ~15;
      if (top + aligned > sizeBytes) throw new RangeError("simulated heap exhausted");
      const off = top;
      top += aligned;
      writeHeader(dv, off, type, flags, meta);
      return off;
    },
    allocString(js) {
      if (js.length <= SSO_MAX_UNITS) return smallString(js);
      const off = heap.alloc(TYPE_STRING, js.length * 2, BigInt(js.length));
      for (let i = 0; i < js.length; i++) dv.setUint16(off + HEADER_SIZE + i * 2, js.charCodeAt(i), true);
      return heapref(BigInt(off));
    },
    allocArray(taggedElems, { length = taggedElems.length, capacity = Math.max(taggedElems.length, 4) } = {}) {
      const off = heap.alloc(
        TYPE_ARRAY,
        capacity * 8,
        BigInt(length) << 32n | BigInt(capacity)
      );
      for (let i = 0; i < taggedElems.length; i++) dv.setBigUint64(off + HEADER_SIZE + i * 8, asU64(taggedElems[i]), true);
      for (let i = taggedElems.length; i < capacity; i++) dv.setBigUint64(off + HEADER_SIZE + i * 8, V_HOLE, true);
      return heapref(BigInt(off));
    },
    allocDouble(num4) {
      const off = heap.alloc(TYPE_DOUBLE, 8);
      dv.setFloat64(off + HEADER_SIZE, num4, true);
      return doubleref(BigInt(off));
    }
  };
  return heap;
}
function identityTableFor(heap) {
  let t = heapIdentityTables.get(heap);
  if (!t) {
    t = /* @__PURE__ */ new WeakMap();
    heapIdentityTables.set(heap, t);
  }
  return t;
}
function encodeValue(heap, js) {
  if (typeof js !== "object" || js === null) {
    return encodeInner(heap, js, /* @__PURE__ */ new Map(), identityTableFor(heap));
  }
  const table = identityTableFor(heap);
  const hit = table.get(js);
  if (hit !== void 0) return hit;
  const memo = /* @__PURE__ */ new Map();
  const out = encodeInner(heap, js, memo, table);
  table.set(js, out);
  return out;
}
function encodeInner(heap, js, memo, table) {
  if (typeof js === "number") {
    if (Number.isNaN(js)) return V_NAN;
    if (Number.isInteger(js) && !Object.is(js, -0) && js >= Number(FIXNUM_MIN) && js < 2 ** 60) {
      return fixnum(js);
    }
    return heap.allocDouble(js);
  }
  if (typeof js === "bigint") return fixnum(js);
  if (typeof js === "string") {
    const hit = memo.get(js);
    if (hit !== void 0) return hit;
    const out = heap.allocString(js);
    memo.set(js, out);
    return out;
  }
  if (typeof js === "boolean") return js ? V_TRUE : V_FALSE;
  if (js === null) return V_NULL;
  if (js === void 0) return V_UNDEFINED;
  if (Array.isArray(js)) {
    const hit = memo.get(js);
    if (hit !== void 0) return hit;
    const known = table.get(js);
    if (known !== void 0) {
      memo.set(js, known);
      return known;
    }
    const length = js.length;
    const ref = heap.allocArray([], { length, capacity: Math.max(length, 4) });
    memo.set(js, ref);
    const ptr = Number(heapPtr(ref));
    for (let i = 0; i < length; i++) {
      heap.dv.setBigUint64(
        ptr + HEADER_SIZE + i * 8,
        asU64(i in js ? encodeInner(heap, js[i], memo, table) : V_HOLE),
        true
      );
    }
    return ref;
  }
  if (typeof js === "object") {
    const hit = memo.get(js);
    if (hit !== void 0) return hit;
    const known = table.get(js);
    if (known !== void 0) {
      memo.set(js, known);
      return known;
    }
    const names = Object.keys(js);
    const nameRefs = names.map((n2) => encodeInner(heap, n2, memo, table));
    const shapeOff = heap.alloc(TYPE_SHAPE, names.length * 16, BigInt(names.length));
    const dv = heap.dv;
    nameRefs.forEach((r, i) => dv.setBigUint64(shapeOff + HEADER_SIZE + i * 8, asU64(r), true));
    names.forEach((_, i) => dv.setUint32(shapeOff + HEADER_SIZE + names.length * 8 + i * 4, i, true));
    const objOff = heap.alloc(TYPE_OBJECT, names.length * 8, BigInt(shapeOff));
    const ref = heapref(BigInt(objOff));
    memo.set(js, ref);
    names.forEach((n2, i) => dv.setBigUint64(
      objOff + HEADER_SIZE + i * 8,
      asU64(encodeInner(heap, js[n2], memo, table)),
      true
    ));
    return ref;
  }
  throw new TypeError(`encodeValue: unsupported JS type ${typeof js}`);
}
function decodeValue(heap, v) {
  return decodeInner(heap, asU64(v), /* @__PURE__ */ new Map());
}
function decodeInner(heap, v, memo) {
  const t = tagOf(v);
  if (t === TAG_FIXNUM) return Number(fixnumValue(v));
  if (t === TAG_IMM) {
    switch (immCode(v)) {
      case IMM_UNDEFINED:
        return void 0;
      case IMM_NULL:
        return null;
      case IMM_TRUE:
        return true;
      case IMM_FALSE:
        return false;
      case IMM_NAN:
        return NaN;
      default:
        throw new Error(`decodeValue: cannot decode immediate code ${immCode(v)}`);
    }
  }
  if (t === TAG_SMALLSTR) return smallStringValue(v);
  const hit = memo.get(v);
  if (hit !== void 0) return hit;
  const dv = heap.dv;
  const ptr = Number(heapPtr(v));
  const { type, meta } = readHeader(dv, ptr);
  if (t === TAG_DOUBLE) {
    if (type !== TYPE_DOUBLE) throw new Error("doubleref points at non-double header");
    return dv.getFloat64(ptr + HEADER_SIZE, true);
  }
  if (type === TYPE_STRING) {
    const n2 = Number(meta);
    let s = "";
    for (let i = 0; i < n2; i++) s += String.fromCharCode(dv.getUint16(ptr + HEADER_SIZE + i * 2, true));
    memo.set(v, s);
    return s;
  }
  if (type === TYPE_ARRAY) {
    const length = Number(meta >> 32n);
    const out = new Array(length);
    memo.set(v, out);
    for (let i = 0; i < length; i++) {
      const e = dv.getBigUint64(ptr + HEADER_SIZE + i * 8, true);
      if (e !== V_HOLE) out[i] = decodeInner(heap, e, memo);
    }
    return out;
  }
  if (type === TYPE_SPARSE_ARRAY) {
    const count = Number(meta);
    const pairs2 = [];
    for (let i = 0; i < count; i++) {
      const key = dv.getUint32(ptr + HEADER_SIZE + i * 12, true);
      const val = dv.getBigUint64(ptr + HEADER_SIZE + i * 12 + 4, true);
      pairs2.push([key, val]);
    }
    const length = pairs2.length ? pairs2[pairs2.length - 1][0] + 1 : 0;
    const out = new Array(length);
    memo.set(v, out);
    for (const [k, val] of pairs2) out[k] = decodeInner(heap, val, memo);
    return out;
  }
  if (type === TYPE_OBJECT) {
    const shapeOff = Number(meta);
    const sh = readHeader(dv, shapeOff);
    if (sh.type !== TYPE_SHAPE) throw new Error("object meta is not a shape");
    const n2 = Number(sh.meta);
    const out = {};
    memo.set(v, out);
    for (let i = 0; i < n2; i++) {
      const name = decodeInner(heap, dv.getBigUint64(shapeOff + HEADER_SIZE + i * 8, true), memo);
      const slot = dv.getUint32(shapeOff + HEADER_SIZE + n2 * 8 + i * 4, true);
      out[name] = decodeInner(heap, dv.getBigUint64(ptr + HEADER_SIZE + slot * 8, true), memo);
    }
    return out;
  }
  if (type === TYPE_BUFFER) {
    const n2 = Number(meta);
    const out = new Uint8Array(dv.buffer, ptr + HEADER_SIZE, n2).slice();
    memo.set(v, out);
    return out;
  }
  throw new Error(`decodeValue: unsupported heap type ${type}`);
}
function isTruthy(heap, v) {
  const t = tagOf(v);
  if (t === TAG_FIXNUM) return asU64(v) !== 0n;
  if (t === TAG_SMALLSTR) return smallStringLength(v) !== 0;
  if (t === TAG_IMM) return immCode(v) === IMM_TRUE;
  if (t === TAG_DOUBLE) {
    const d = heap.dv.getFloat64(Number(heapPtr(v)) + HEADER_SIZE, true);
    return d !== 0 && !Number.isNaN(d);
  }
  const dv = heap.dv;
  const ptr = Number(heapPtr(v));
  const { type, meta } = readHeader(dv, ptr);
  if (type === TYPE_STRING) return meta !== 0n;
  return true;
}
function strictEqual(heap, a, b) {
  const ta = tagOf(a), tb = tagOf(b);
  if (ta === TAG_IMM && tb === TAG_IMM && immCode(a) === IMM_NAN && immCode(b) === IMM_NAN) return false;
  if (a === b) return true;
  if (ta !== tb) {
    if (ta === TAG_FIXNUM && tb === TAG_DOUBLE || ta === TAG_DOUBLE && tb === TAG_FIXNUM) {
      const f = ta === TAG_FIXNUM ? a : b;
      const d = ta === TAG_DOUBLE ? a : b;
      const dv = heap.dv.getFloat64(Number(heapPtr(d)) + HEADER_SIZE, true);
      return dv === Number(fixnumValue(f));
    }
    return false;
  }
  if (ta === TAG_DOUBLE) {
    const pa = Number(heapPtr(a)), pb = Number(heapPtr(b));
    const ba = heap.dv.getBigUint64(pa + HEADER_SIZE, true);
    const bb = heap.dv.getBigUint64(pb + HEADER_SIZE, true);
    const za = (ba & 0x7fffffffffffffffn) === 0n, zb = (bb & 0x7fffffffffffffffn) === 0n;
    if (za && zb) return true;
    if (za || zb) return false;
    const expA = ba & 0x7ff0000000000000n, expB = bb & 0x7ff0000000000000n;
    const mantA = ba & 0xfffffffffffffn, mantB = bb & 0xfffffffffffffn;
    if (expA === 0x7ff0000000000000n && mantA !== 0n || expB === 0x7ff0000000000000n && mantB !== 0n) return false;
    return ba === bb;
  }
  if (ta === TAG_HEAPREF) {
    const pa = Number(heapPtr(a)), pb = Number(heapPtr(b));
    const ha = readHeader(heap.dv, pa), hb = readHeader(heap.dv, pb);
    if (ha.type !== hb.type || ha.type !== TYPE_STRING) return false;
    if (ha.meta !== hb.meta) return false;
    const n2 = Number(ha.meta);
    for (let i = 0; i < n2; i++) {
      if (heap.dv.getUint16(pa + HEADER_SIZE + i * 2, true) !== heap.dv.getUint16(pb + HEADER_SIZE + i * 2, true)) return false;
    }
    return true;
  }
  return false;
}
function typeOf(heap, v) {
  const t = tagOf(v);
  if (t === TAG_FIXNUM || t === TAG_DOUBLE) return "number";
  if (t === TAG_SMALLSTR) return "string";
  if (t === TAG_IMM) {
    const c = immCode(v);
    if (c === IMM_UNDEFINED) return "undefined";
    if (c === IMM_NULL) return "object";
    if (c === IMM_TRUE || c === IMM_FALSE) return "boolean";
    return "number";
  }
  const { type } = readHeader(heap.dv, Number(heapPtr(v)));
  if (type === TYPE_STRING) return "string";
  if (type === TYPE_CLOSURE) return "function";
  return "object";
}
var MASK64, asU64, asI64, TAG_FIXNUM, TAG_HEAPREF, TAG_DOUBLE, TAG_SMALLSTR, TAG_IMM, TAG_R5, TAG_R6, TAG_R7, TAG_MASK, tagOf, FIXNUM_BITS, FIXNUM_MAX, FIXNUM_MIN, isFixnum, IMM_UNDEFINED, IMM_NULL, IMM_TRUE, IMM_FALSE, IMM_NAN, IMM_HOLE, imm, isImm, immCode, V_UNDEFINED, V_NULL, V_TRUE, V_FALSE, V_NAN, V_HOLE, isHeapref, heapPtr, isDouble, SSO_MAX_UNITS, isSmallString, smallStringLength, HEADER_SIZE, TYPE_STRING, TYPE_ARRAY, TYPE_OBJECT, TYPE_DOUBLE, TYPE_CLOSURE, TYPE_BUFFER, TYPE_SPARSE_ARRAY, TYPE_SHAPE, FLAG_MARKED, FLAG_FORWARDED, FLAG_GEN_SHIFT, FLAG_GEN_MASK, heapIdentityTables;
var init_value_model = __esm({
  "geelooy/scripts/awtsmoos/compiling/js/value-model.js"() {
    MASK64 = (1n << 64n) - 1n;
    asU64 = (v) => BigInt(v) & MASK64;
    asI64 = (v) => {
      const u = asU64(v);
      return u & 1n << 63n ? u - (1n << 64n) : u;
    };
    TAG_FIXNUM = 0n;
    TAG_HEAPREF = 1n;
    TAG_DOUBLE = 2n;
    TAG_SMALLSTR = 3n;
    TAG_IMM = 4n;
    TAG_R5 = 5n;
    TAG_R6 = 6n;
    TAG_R7 = 7n;
    TAG_MASK = 7n;
    tagOf = (v) => asU64(v) & TAG_MASK;
    FIXNUM_BITS = 61n;
    FIXNUM_MAX = (1n << 60n) - 1n;
    FIXNUM_MIN = -(1n << 60n);
    isFixnum = (v) => tagOf(v) === TAG_FIXNUM;
    IMM_UNDEFINED = 0n;
    IMM_NULL = 1n;
    IMM_TRUE = 2n;
    IMM_FALSE = 3n;
    IMM_NAN = 4n;
    IMM_HOLE = 5n;
    imm = (code) => asU64(BigInt(code) << 3n | TAG_IMM);
    isImm = (v) => tagOf(v) === TAG_IMM;
    immCode = (v) => asU64(v) >> 3n;
    V_UNDEFINED = imm(IMM_UNDEFINED);
    V_NULL = imm(IMM_NULL);
    V_TRUE = imm(IMM_TRUE);
    V_FALSE = imm(IMM_FALSE);
    V_NAN = imm(IMM_NAN);
    V_HOLE = imm(IMM_HOLE);
    isHeapref = (v) => tagOf(v) === TAG_HEAPREF;
    heapPtr = (v) => asU64(v) & ~TAG_MASK;
    isDouble = (v) => tagOf(v) === TAG_DOUBLE;
    SSO_MAX_UNITS = 3;
    isSmallString = (v) => tagOf(v) === TAG_SMALLSTR;
    smallStringLength = (v) => Number(asU64(v) >> 3n & 3n);
    HEADER_SIZE = 16;
    TYPE_STRING = 1;
    TYPE_ARRAY = 2;
    TYPE_OBJECT = 3;
    TYPE_DOUBLE = 4;
    TYPE_CLOSURE = 5;
    TYPE_BUFFER = 6;
    TYPE_SPARSE_ARRAY = 7;
    TYPE_SHAPE = 8;
    FLAG_MARKED = 1 << 0;
    FLAG_FORWARDED = 1 << 1;
    FLAG_GEN_SHIFT = 8;
    FLAG_GEN_MASK = 255 << FLAG_GEN_SHIFT;
    heapIdentityTables = /* @__PURE__ */ new WeakMap();
  }
});

// geelooy/shared/compiling/native/image/align.js
function alignUp(value, alignment) {
  const number = safeInteger(value, "alignment value");
  const boundary = safeInteger(alignment, "alignment boundary");
  if (boundary < 1 || (boundary & boundary - 1) !== 0) {
    throw new Error(`IMAGE_ALIGNMENT_INVALID:${boundary}`);
  }
  const result = Math.ceil(number / boundary) * boundary;
  if (!Number.isSafeInteger(result)) {
    throw new Error(`IMAGE_ALIGNMENT_OVERFLOW:${number}:${boundary}`);
  }
  return result;
}
function safeInteger(value, label = "integer") {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) {
    throw new Error(`IMAGE_INTEGER_INVALID:${label}`);
  }
  return number;
}
var init_align = __esm({
  "geelooy/shared/compiling/native/image/align.js"() {
  }
});

// geelooy/shared/compiling/native/image/bytes.js
function cloneBytes(value = new Uint8Array()) {
  if (value instanceof Uint8Array) {
    return Uint8Array.from(value);
  }
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value.slice(0));
  }
  if (ArrayBuffer.isView(value)) {
    return Uint8Array.from(new Uint8Array(
      value.buffer,
      value.byteOffset,
      value.byteLength
    ));
  }
  return Uint8Array.from(value || []);
}
function writeFixedAscii(bytes, offset, text, length) {
  const start = safeInteger(offset, "ASCII offset");
  const maximum = safeInteger(length, "ASCII length");
  if (start + maximum > bytes.length) {
    throw new Error("IMAGE_ASCII_RANGE");
  }
  const encoded = [...String(text)].map((character) => character.charCodeAt(0));
  if (encoded.some((value) => value > 127) || encoded.length > maximum) {
    throw new Error(`IMAGE_ASCII_INVALID:${text}`);
  }
  bytes.fill(0, start, start + maximum);
  bytes.set(encoded, start);
}
var init_bytes = __esm({
  "geelooy/shared/compiling/native/image/bytes.js"() {
    init_align();
  }
});

// geelooy/shared/compiling/native/image/model.js
function createExecutableImage(options = {}) {
  const architecture = String(options.architecture || "x86_64");
  if (architecture !== "x86_64") {
    throw new Error(`IMAGE_ARCHITECTURE_UNSUPPORTED:${architecture}`);
  }
  const sections = normalizeSections(options.sections || []);
  const sectionMap = new Map(sections.map((section) => [section.name, section]));
  const entry = normalizeEntry(options.entry, sectionMap);
  const relocations = Object.freeze((options.relocations || []).map((relocation) => {
    return normalizeRelocation(relocation, sectionMap);
  }));
  return Object.freeze({
    architecture,
    entry,
    relocations,
    sections,
    version: "awtsmoos-executable-image-v1"
  });
}
function imageSection(image, name) {
  const section = image.sections.find((candidate) => candidate.name === name);
  if (!section) {
    throw new Error(`IMAGE_SECTION_MISSING:${name}`);
  }
  return section;
}
function normalizeSections(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 16) {
    throw new Error(`IMAGE_SECTION_COUNT:${input?.length ?? -1}`);
  }
  const names = /* @__PURE__ */ new Set();
  const sections = input.map((section, index) => {
    const name = String(section.name || `section_${index}`);
    if (!/^[A-Za-z_.][A-Za-z0-9_.-]*$/.test(name) || names.has(name)) {
      throw new Error(`IMAGE_SECTION_NAME:${name}`);
    }
    names.add(name);
    const bytes = cloneBytes(section.bytes);
    const memorySize = safeInteger(section.memorySize ?? bytes.length, `${name} memory`);
    if (memorySize < bytes.length) {
      throw new Error(`IMAGE_SECTION_MEMORY:${name}`);
    }
    const alignment = safeInteger(section.alignment ?? 1, `${name} alignment`);
    alignUp(0, alignment);
    return Object.freeze({
      alignment,
      bytes,
      memorySize,
      name,
      permissions: Object.freeze({
        execute: Boolean(section.permissions?.execute),
        read: section.permissions?.read !== false,
        write: Boolean(section.permissions?.write)
      })
    });
  });
  return Object.freeze(sections);
}
function normalizeEntry(entry, sectionMap) {
  const section = sectionMap.get(String(entry?.section || ""));
  if (!section) throw new Error(`IMAGE_ENTRY_SECTION:${entry?.section}`);
  const offset = safeInteger(entry?.offset ?? 0, "entry offset");
  if (offset >= Math.max(1, section.memorySize)) {
    throw new Error(`IMAGE_ENTRY_RANGE:${section.name}:${offset}`);
  }
  return Object.freeze({ offset, section: section.name });
}
function normalizeRelocation(relocation, sectionMap) {
  const kind = String(relocation.kind || "");
  const width = RELOCATION_WIDTHS[kind];
  if (!width) throw new Error(`IMAGE_RELOCATION_KIND:${kind}`);
  const source = sectionMap.get(String(relocation.sourceSection || ""));
  const target = sectionMap.get(String(relocation.targetSection || ""));
  if (!source || !target) throw new Error("IMAGE_RELOCATION_SECTION");
  const sourceOffset = safeInteger(relocation.sourceOffset, "relocation source");
  const targetOffset = safeInteger(relocation.targetOffset ?? 0, "relocation target");
  if (sourceOffset + width > source.bytes.length || targetOffset > target.memorySize) {
    throw new Error(`IMAGE_RELOCATION_RANGE:${kind}`);
  }
  const addend = Number(relocation.addend || 0);
  if (!Number.isSafeInteger(addend)) throw new Error("IMAGE_RELOCATION_ADDEND");
  return Object.freeze({ addend, kind, sourceOffset, sourceSection: source.name, targetOffset, targetSection: target.name });
}
var RELOCATION_WIDTHS;
var init_model = __esm({
  "geelooy/shared/compiling/native/image/model.js"() {
    init_align();
    init_bytes();
    RELOCATION_WIDTHS = Object.freeze({ abs64: 8, rip32: 4 });
  }
});

// geelooy/shared/compiling/native/image/layout.js
function createImageLayout(image, placements) {
  if (!Array.isArray(placements) || placements.length !== image.sections.length) {
    throw new Error("IMAGE_LAYOUT_COUNT");
  }
  const names = /* @__PURE__ */ new Set();
  const sections = placements.map((placement) => {
    const section = imageSection(image, placement.name);
    if (names.has(section.name)) throw new Error(`IMAGE_LAYOUT_DUPLICATE:${section.name}`);
    names.add(section.name);
    const address = safeInteger(placement.address, `${section.name} address`);
    const fileOffset = safeInteger(placement.fileOffset, `${section.name} file offset`);
    if (address % section.alignment || fileOffset % section.alignment) {
      throw new Error(`IMAGE_LAYOUT_ALIGNMENT:${section.name}`);
    }
    return Object.freeze({
      address,
      fileOffset,
      memorySize: section.memorySize,
      name: section.name,
      size: section.bytes.length
    });
  });
  const entrySection = sections.find((section) => section.name === image.entry.section);
  return Object.freeze({
    entryAddress: entrySection.address + image.entry.offset,
    sections: Object.freeze(sections)
  });
}
function layoutSection(layout, name) {
  const section = layout.sections.find((candidate) => candidate.name === name);
  if (!section) throw new Error(`IMAGE_LAYOUT_SECTION:${name}`);
  return section;
}
var init_layout = __esm({
  "geelooy/shared/compiling/native/image/layout.js"() {
    init_align();
    init_model();
  }
});

// geelooy/shared/compiling/native/image/relocations.js
function materializeImageSections(image, layout) {
  const outputs = image.sections.map((section) => ({
    bytes: cloneBytes(section.bytes),
    name: section.name
  }));
  for (const relocation of image.relocations) {
    applyRelocation(relocation, layout, outputs);
  }
  return Object.freeze(outputs.map((output) => Object.freeze(output)));
}
function materializedSection(outputs, name) {
  const output = outputs.find((candidate) => candidate.name === name);
  if (!output) throw new Error(`IMAGE_MATERIALIZED_SECTION:${name}`);
  return output;
}
function applyRelocation(relocation, layout, outputs) {
  const sourceLayout = layoutSection(layout, relocation.sourceSection);
  const targetLayout = layoutSection(layout, relocation.targetSection);
  const output = materializedSection(outputs, relocation.sourceSection);
  const targetAddress = targetLayout.address + relocation.targetOffset + relocation.addend;
  const view = new DataView(
    output.bytes.buffer,
    output.bytes.byteOffset,
    output.bytes.byteLength
  );
  if (relocation.kind === "rip32") {
    const nextAddress = sourceLayout.address + relocation.sourceOffset + 4;
    const displacement = targetAddress - nextAddress;
    if (displacement < -2147483648 || displacement > 2147483647) {
      throw new Error(`IMAGE_RELOCATION_RIP32_RANGE:${displacement}`);
    }
    view.setInt32(relocation.sourceOffset, displacement, true);
    return;
  }
  if (relocation.kind === "abs64") {
    if (!Number.isSafeInteger(targetAddress) || targetAddress < 0) {
      throw new Error(`IMAGE_RELOCATION_ABS64_RANGE:${targetAddress}`);
    }
    view.setBigUint64(relocation.sourceOffset, BigInt(targetAddress), true);
    return;
  }
  throw new Error(`IMAGE_RELOCATION_KIND:${relocation.kind}`);
}
var init_relocations = __esm({
  "geelooy/shared/compiling/native/image/relocations.js"() {
    init_bytes();
    init_layout();
  }
});

// geelooy/shared/compiling/native/elf64/constants.js
var ELF64;
var init_constants = __esm({
  "geelooy/shared/compiling/native/elf64/constants.js"() {
    ELF64 = Object.freeze({
      BASE_ADDRESS: 4194304,
      CODE_OFFSET: 4096,
      EH_SIZE: 64,
      EM_X86_64: 62,
      ET_EXEC: 2,
      EV_CURRENT: 1,
      PAGE_SIZE: 4096,
      PF_R: 4,
      PF_W: 2,
      PF_X: 1,
      PH_SIZE: 56,
      PT_LOAD: 1
    });
  }
});

// geelooy/shared/compiling/native/elf64/header.js
function writeElf64Header(bytes, options = {}) {
  const segments = options.segments || [];
  const required = ELF64.EH_SIZE + segments.length * ELF64.PH_SIZE;
  if (segments.length < 1 || required > bytes.length) {
    throw new Error("ELF64_HEADER_RANGE");
  }
  bytes.set([127, 69, 76, 70], 0);
  bytes[4] = 2;
  bytes[5] = 1;
  bytes[6] = ELF64.EV_CURRENT;
  bytes[7] = 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  view.setUint16(16, ELF64.ET_EXEC, true);
  view.setUint16(18, ELF64.EM_X86_64, true);
  view.setUint32(20, ELF64.EV_CURRENT, true);
  view.setBigUint64(24, BigInt(options.entryAddress), true);
  view.setBigUint64(32, BigInt(ELF64.EH_SIZE), true);
  view.setBigUint64(40, 0n, true);
  view.setUint32(48, 0, true);
  view.setUint16(52, ELF64.EH_SIZE, true);
  view.setUint16(54, ELF64.PH_SIZE, true);
  view.setUint16(56, segments.length, true);
  view.setUint16(58, 0, true);
  view.setUint16(60, 0, true);
  view.setUint16(62, 0, true);
  segments.forEach((segment, index) => {
    writeProgramHeader(
      view,
      ELF64.EH_SIZE + index * ELF64.PH_SIZE,
      segment
    );
  });
}
function writeProgramHeader(view, offset, segment) {
  view.setUint32(offset, ELF64.PT_LOAD, true);
  view.setUint32(offset + 4, segment.flags, true);
  view.setBigUint64(offset + 8, BigInt(segment.fileOffset), true);
  view.setBigUint64(offset + 16, BigInt(segment.address), true);
  view.setBigUint64(offset + 24, BigInt(segment.address), true);
  view.setBigUint64(offset + 32, BigInt(segment.fileSize), true);
  view.setBigUint64(offset + 40, BigInt(segment.memorySize), true);
  view.setBigUint64(offset + 48, BigInt(segment.alignment), true);
}
var init_header = __esm({
  "geelooy/shared/compiling/native/elf64/header.js"() {
    init_constants();
  }
});

// geelooy/shared/compiling/native/elf64/writer.js
function writeElf64Executable(image, options = {}) {
  const code = imageSection(image, "code");
  const data = imageSection(image, "data");
  if (!code.bytes.length || !code.permissions.execute) {
    throw new Error("ELF64_CODE_REQUIRED");
  }
  const baseAddress = safeInteger(
    options.baseAddress ?? ELF64.BASE_ADDRESS,
    "ELF base address"
  );
  const codeOffset = ELF64.CODE_OFFSET;
  const dataOffset = alignUp(
    codeOffset + Math.max(code.bytes.length, 1),
    ELF64.PAGE_SIZE
  );
  const hasData = data.memorySize > 0;
  const layout = createImageLayout(image, [
    {
      address: baseAddress + codeOffset,
      fileOffset: codeOffset,
      name: "code"
    },
    {
      address: baseAddress + dataOffset,
      fileOffset: dataOffset,
      name: "data"
    }
  ]);
  const materialized = materializeImageSections(image, layout);
  const codeBytes = materializedSection(materialized, "code").bytes;
  const dataBytes = materializedSection(materialized, "data").bytes;
  const fileSize = hasData ? dataOffset + dataBytes.length : codeOffset + codeBytes.length;
  if (fileSize > Number(options.maximumBytes || 32 * 1024 * 1024)) {
    throw new Error(`ELF64_FILE_LIMIT:${fileSize}`);
  }
  const bytes = new Uint8Array(fileSize);
  bytes.set(codeBytes, codeOffset);
  if (dataBytes.length) {
    bytes.set(dataBytes, dataOffset);
  }
  const segments = createSegments({
    baseAddress,
    code,
    codeBytes,
    codeOffset,
    data,
    dataBytes,
    dataOffset,
    hasData
  });
  writeElf64Header(bytes, {
    entryAddress: layout.entryAddress,
    segments
  });
  return Object.freeze({
    bytes,
    entryPoint: layout.entryAddress,
    extension: ".elf",
    format: "elf",
    layout,
    mimeType: "application/x-elf",
    segments: Object.freeze(segments),
    writer: "awtsmoos-scratch-elf64-v1"
  });
}
function createSegments(context) {
  const textFileSize = context.codeOffset + context.codeBytes.length;
  const textMemorySize = alignUp(
    context.codeOffset + context.code.memorySize,
    ELF64.PAGE_SIZE
  );
  const segments = [{
    address: context.baseAddress,
    alignment: ELF64.PAGE_SIZE,
    fileOffset: 0,
    fileSize: textFileSize,
    flags: ELF64.PF_R | ELF64.PF_X,
    memorySize: textMemorySize
  }];
  if (context.hasData) {
    segments.push({
      address: context.baseAddress + context.dataOffset,
      alignment: ELF64.PAGE_SIZE,
      fileOffset: context.dataOffset,
      fileSize: context.dataBytes.length,
      flags: ELF64.PF_R | ELF64.PF_W,
      memorySize: context.data.memorySize
    });
  }
  return segments;
}
var init_writer = __esm({
  "geelooy/shared/compiling/native/elf64/writer.js"() {
    init_align();
    init_layout();
    init_model();
    init_relocations();
    init_constants();
    init_header();
  }
});

// geelooy/shared/compiling/native/macho64/constants.js
var MACHO64;
var init_constants2 = __esm({
  "geelooy/shared/compiling/native/macho64/constants.js"() {
    MACHO64 = Object.freeze({
      BASE_ADDRESS: 4294967296,
      CODE_OFFSET: 4096,
      CPU_SUBTYPE_X86_64_ALL: 3,
      CPU_TYPE_X86_64: 16777223,
      HEADER_SIZE: 32,
      LC_MAIN: 2147483688,
      LC_SEGMENT_64: 25,
      MAIN_COMMAND_SIZE: 24,
      MH_EXECUTE: 2,
      MH_MAGIC_64: 4277009103,
      PAGE_SIZE: 4096,
      SEGMENT_COMMAND_SIZE: 72,
      VM_PROT_EXECUTE: 4,
      VM_PROT_READ: 1,
      VM_PROT_WRITE: 2
    });
  }
});

// geelooy/shared/compiling/native/macho64/commands.js
function writeMachO64Header(bytes, options = {}) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  view.setUint32(0, MACHO64.MH_MAGIC_64, true);
  view.setUint32(4, MACHO64.CPU_TYPE_X86_64, true);
  view.setUint32(8, MACHO64.CPU_SUBTYPE_X86_64_ALL, true);
  view.setUint32(12, MACHO64.MH_EXECUTE, true);
  view.setUint32(16, options.commandCount, true);
  view.setUint32(20, options.commandBytes, true);
  view.setUint32(24, 1, true);
  view.setUint32(28, 0, true);
}
function writeSegment64(bytes, offset, segment) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  view.setUint32(offset, MACHO64.LC_SEGMENT_64, true);
  view.setUint32(offset + 4, MACHO64.SEGMENT_COMMAND_SIZE, true);
  writeFixedAscii(bytes, offset + 8, segment.name, 16);
  view.setBigUint64(offset + 24, BigInt(segment.address), true);
  view.setBigUint64(offset + 32, BigInt(segment.memorySize), true);
  view.setBigUint64(offset + 40, BigInt(segment.fileOffset), true);
  view.setBigUint64(offset + 48, BigInt(segment.fileSize), true);
  view.setUint32(offset + 56, segment.maximumProtection, true);
  view.setUint32(offset + 60, segment.initialProtection, true);
  view.setUint32(offset + 64, 0, true);
  view.setUint32(offset + 68, 0, true);
}
function writeMainCommand(bytes, offset, entryOffset) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  view.setUint32(offset, MACHO64.LC_MAIN, true);
  view.setUint32(offset + 4, MACHO64.MAIN_COMMAND_SIZE, true);
  view.setBigUint64(offset + 8, BigInt(entryOffset), true);
  view.setBigUint64(offset + 16, 0n, true);
}
var init_commands = __esm({
  "geelooy/shared/compiling/native/macho64/commands.js"() {
    init_bytes();
    init_constants2();
  }
});

// geelooy/shared/compiling/native/macho64/segments.js
function createMachO64Segments(context) {
  const read = MACHO64.VM_PROT_READ;
  const execute = MACHO64.VM_PROT_EXECUTE;
  const write = MACHO64.VM_PROT_WRITE;
  const segments = [{
    address: context.baseAddress,
    fileOffset: 0,
    fileSize: context.codeOffset + context.codeBytes.length,
    initialProtection: read | execute,
    maximumProtection: read | execute,
    memorySize: alignUp(
      context.codeOffset + context.code.memorySize,
      MACHO64.PAGE_SIZE
    ),
    name: "__TEXT"
  }];
  if (context.hasData) {
    segments.push({
      address: context.baseAddress + context.dataOffset,
      fileOffset: context.dataOffset,
      fileSize: context.dataBytes.length,
      initialProtection: read | write,
      maximumProtection: read | write,
      memorySize: context.data.memorySize,
      name: "__DATA"
    });
  }
  return Object.freeze(segments.map((segment) => Object.freeze(segment)));
}
var init_segments = __esm({
  "geelooy/shared/compiling/native/macho64/segments.js"() {
    init_align();
    init_constants2();
  }
});

// geelooy/shared/compiling/native/macho64/writer.js
function writeMachO64Executable(image, options = {}) {
  const code = imageSection(image, "code");
  const data = imageSection(image, "data");
  if (!code.bytes.length || !code.permissions.execute) {
    throw new Error("MACHO64_CODE_REQUIRED");
  }
  const baseAddress = safeInteger(
    options.baseAddress ?? MACHO64.BASE_ADDRESS,
    "Mach-O base address"
  );
  const codeOffset = MACHO64.CODE_OFFSET;
  const dataOffset = alignUp(
    codeOffset + Math.max(code.bytes.length, 1),
    MACHO64.PAGE_SIZE
  );
  const hasData = data.memorySize > 0;
  const layout = createImageLayout(image, [
    {
      address: baseAddress + codeOffset,
      fileOffset: codeOffset,
      name: "code"
    },
    {
      address: baseAddress + dataOffset,
      fileOffset: dataOffset,
      name: "data"
    }
  ]);
  const materialized = materializeImageSections(image, layout);
  const codeBytes = materializedSection(materialized, "code").bytes;
  const dataBytes = materializedSection(materialized, "data").bytes;
  const fileSize = hasData ? dataOffset + dataBytes.length : codeOffset + codeBytes.length;
  if (fileSize > Number(options.maximumBytes || 32 * 1024 * 1024)) {
    throw new Error(`MACHO64_FILE_LIMIT:${fileSize}`);
  }
  const bytes = new Uint8Array(fileSize);
  bytes.set(codeBytes, codeOffset);
  if (dataBytes.length) {
    bytes.set(dataBytes, dataOffset);
  }
  const segments = createMachO64Segments({
    baseAddress,
    code,
    codeBytes,
    codeOffset,
    data,
    dataBytes,
    dataOffset,
    hasData
  });
  writeCommands(bytes, segments, codeOffset + image.entry.offset);
  return Object.freeze({
    bytes,
    entryPoint: layout.entryAddress,
    extension: ".macho",
    format: "mach-o",
    layout,
    mimeType: "application/x-mach-binary",
    segments,
    writer: "awtsmoos-scratch-macho64-v1"
  });
}
function writeCommands(bytes, segments, entryOffset) {
  const commandCount = segments.length + 1;
  const commandBytes = segments.length * MACHO64.SEGMENT_COMMAND_SIZE + MACHO64.MAIN_COMMAND_SIZE;
  if (MACHO64.HEADER_SIZE + commandBytes > MACHO64.CODE_OFFSET) {
    throw new Error("MACHO64_COMMAND_RANGE");
  }
  writeMachO64Header(bytes, { commandBytes, commandCount });
  let offset = MACHO64.HEADER_SIZE;
  for (const segment of segments) {
    writeSegment64(bytes, offset, segment);
    offset += MACHO64.SEGMENT_COMMAND_SIZE;
  }
  writeMainCommand(bytes, offset, entryOffset);
}
var init_writer2 = __esm({
  "geelooy/shared/compiling/native/macho64/writer.js"() {
    init_align();
    init_layout();
    init_model();
    init_relocations();
    init_commands();
    init_constants2();
    init_segments();
  }
});

// geelooy/shared/compiling/native/targetTriples.js
function nativeTarget(id) {
  const found = NATIVE_TARGETS.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`unknown_native_target:${id}`);
  }
  return found;
}
function definition(id, label, platform, architecture, format, triple, outputType, subsystem, backend) {
  return Object.freeze({
    id,
    label,
    platform,
    architecture,
    format,
    triple,
    outputType,
    subsystem,
    backend
  });
}
var NATIVE_TARGETS;
var init_targetTriples = __esm({
  "geelooy/shared/compiling/native/targetTriples.js"() {
    NATIVE_TARGETS = Object.freeze([
      definition("windows-x64-console", "Windows x86_64 Console", "windows", "x86_64", "pe", "x86_64-w64-windows-gnu", "executable", "console", "windows-x64"),
      definition("windows-x64-gui", "Windows x86_64 GUI", "windows", "x86_64", "pe", "x86_64-w64-windows-gnu", "executable", "gui", "windows-x64"),
      definition("windows-arm64-console", "Windows ARM64 Console", "windows", "arm64", "pe", "aarch64-w64-windows-gnu", "executable", "console", "windows-arm64"),
      definition("windows-x64-dll", "Windows x86_64 DLL", "windows", "x86_64", "pe", "x86_64-w64-windows-gnu", "shared-library", null, "windows-x64"),
      definition("macos-x64", "macOS x86_64", "macos", "x86_64", "mach-o", "x86_64-apple-macosx10.13", "executable", "console", "macos-x64"),
      definition("macos-arm64", "macOS ARM64", "macos", "arm64", "mach-o", "arm64-apple-macosx11.0", "executable", "console", "macos-arm64"),
      definition("macos-universal", "macOS Universal", "macos", "universal", "mach-o-fat", "universal-apple-macos", "executable", "console", "macos-universal"),
      definition("macos-app", "macOS Application Bundle", "macos", "host", "app-bundle", "host-apple-macos", "application-bundle", "gui", "macos-app"),
      definition("linux-x64-dynamic", "Linux x86_64 Dynamic", "linux", "x86_64", "elf", "x86_64-linux-gnu", "executable", "console", "linux-x64"),
      definition("linux-x64-static", "Linux x86_64 Static", "linux", "x86_64", "elf", "x86_64-linux-gnu", "executable", "console", "linux-x64-static"),
      definition("linux-arm64-dynamic", "Linux ARM64 Dynamic", "linux", "arm64", "elf", "aarch64-linux-gnu", "executable", "console", "linux-arm64"),
      definition("wasm32-wasi", "WebAssembly WASI", "wasi", "wasm32", "webassembly", "wasm32-wasi", "module", null, "wasm-wasi"),
      definition("wasm32-browser", "WebAssembly Browser", "browser", "wasm32", "webassembly", "wasm32-unknown-unknown", "module", null, "wasm-browser"),
      definition("awtsmoos-simulated", "Awtsmoos Simulated Executable", "awtsmoos", "virtual", "awtexe", "awtsmoos-virtual-v1", "simulated-package", null, "awtsmoos-simulated")
    ]);
  }
});

// geelooy/scripts/awtsmoos/compiling/pe/utils.js
function align(val, alignment) {
  return val + alignment - 1 & ~(alignment - 1);
}
function stringToBytes(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}
var init_utils = __esm({
  "geelooy/scripts/awtsmoos/compiling/pe/utils.js"() {
  }
});

// geelooy/scripts/awtsmoos/compiling/pe/asm/parser.js
function parseAsm(source) {
  const importDef = [];
  const importMap = /* @__PURE__ */ new Map();
  const dataBlobs = [];
  const dataSymbols = /* @__PURE__ */ new Map();
  const dataRelocs = [];
  const tokens = [];
  let subsystem = "gui";
  const lines = source.split("\n").map((l) => {
    const commentIdx = l.indexOf(";");
    if (commentIdx !== -1) return l.substring(0, commentIdx).trim();
    return l.trim();
  }).filter((l) => l.length > 0);
  let currentSection = "code";
  for (let line of lines) {
    if (line.startsWith(".")) {
      const parts = line.split(/\s+/);
      const directive = parts[0].toLowerCase();
      if (directive === ".import") {
        if (parts.length < 3) throw new Error("Invalid import directive: " + line);
        const dll = parts[1];
        const dllKey = dll.endsWith("\0") ? dll : dll + "\0";
        let def = importMap.get(dllKey);
        if (!def) {
          def = { name: dllKey, funcs: [] };
          importMap.set(dllKey, def);
          importDef.push(def);
        }
        for (let i = 2; i < parts.length; i++) {
          const func = parts[i];
          const funcKey = func.endsWith("\0") ? func : func + "\0";
          def.funcs.push(funcKey);
        }
      } else if (directive === ".data") {
        currentSection = "data";
      } else if (directive === ".code") {
        currentSection = "code";
      } else if (directive === ".subsystem") {
        subsystem = parts[1].toLowerCase();
      }
      continue;
    }
    if (currentSection === "data") {
      const matchStr = line.match(/^(\w+):\s*"(.*)"$/);
      if (matchStr) {
        const label = matchStr[1];
        const rawContent = matchStr[2];
        const bytes = [];
        for (let i = 0; i < rawContent.length; i++) {
          const c = rawContent[i];
          if (c === "\\") {
            i++;
            if (i >= rawContent.length) {
              bytes.push(92);
              break;
            }
            const next = rawContent[i];
            if (next === "n") bytes.push(10);
            else if (next === "r") bytes.push(13);
            else if (next === "t") bytes.push(9);
            else if (next === "0") bytes.push(0);
            else if (next === '"') bytes.push(34);
            else if (next === "\\") bytes.push(92);
            else if (next === "x") {
              const hex = rawContent.substr(i + 1, 2);
              if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
                bytes.push(parseInt(hex, 16));
                i += 2;
              } else {
                bytes.push(92);
                bytes.push(120);
              }
            } else {
              bytes.push(92);
              bytes.push(next.charCodeAt(0));
            }
          } else {
            bytes.push(...stringToBytes(c));
          }
        }
        bytes.push(0);
        dataSymbols.set(label, dataBlobs.length);
        dataBlobs.push(new Uint8Array(bytes));
        continue;
      }
      const matchNum = line.match(/^(\w+):\s*(.+)$/);
      if (matchNum) {
        const label = matchNum[1];
        const rawVals = matchNum[2];
        const { buffer, relocs } = parseDataValues(rawVals);
        const blobId = dataBlobs.length;
        relocs.forEach((r) => {
          dataRelocs.push({ blobId, offset: r.offset, target: r.target });
        });
        dataSymbols.set(label, blobId);
        dataBlobs.push(buffer);
        continue;
      }
      if (line.match(/^(?:db|DB)\s+(.+)$/)) {
        const rawVals = line.replace(/^(?:db|DB)\s+/i, "");
        const { buffer, relocs } = parseDataValues(rawVals);
        if (dataBlobs.length > 0) {
          const lastBlobIdx = dataBlobs.length - 1;
          const lastBlob = dataBlobs[lastBlobIdx];
          const merged = new Uint8Array(lastBlob.length + buffer.length);
          merged.set(lastBlob);
          merged.set(buffer, lastBlob.length);
          dataBlobs[lastBlobIdx] = merged;
          relocs.forEach((r) => {
            dataRelocs.push({
              blobId: lastBlobIdx,
              offset: lastBlob.length + r.offset,
              target: r.target
            });
          });
        } else {
          const blobId = dataBlobs.length;
          relocs.forEach((r) => {
            dataRelocs.push({ blobId, offset: r.offset, target: r.target });
          });
          dataBlobs.push(buffer);
        }
        continue;
      }
      throw new Error("Invalid data definition: " + line);
    }
    if (currentSection === "code") {
      if (line.endsWith(":")) {
        const label = line.slice(0, -1);
        tokens.push({ type: "label", value: label });
        continue;
      }
      const firstSpace = line.indexOf(" ");
      if (firstSpace === -1) {
        tokens.push({ type: "instr", mnemonic: line.toUpperCase(), args: [] });
      } else {
        const mnemonic = line.substring(0, firstSpace).trim().toUpperCase();
        const argsStr = line.substring(firstSpace).trim();
        const args = argsStr.split(",").map((s) => s.trim());
        tokens.push({ type: "instr", mnemonic, args });
      }
    }
  }
  return {
    tokens,
    importDef,
    dataBlobs,
    dataSymbols,
    subsystem,
    dataRelocs
  };
}
function parseDataValues(rawVals) {
  const parts = rawVals.split(",").map((s) => s.trim());
  const bufferParts = [];
  const relocs = [];
  for (let part of parts) {
    if (part.match(/^-?0x[0-9A-Fa-f]+$/) || part.match(/^-?\d+$/)) {
      let val;
      if (part.toLowerCase().includes("0x")) {
        const isNeg = part.startsWith("-");
        const clean = part.replace("-", "");
        val = parseInt(clean, 16);
        if (isNeg) val = -val;
      } else {
        val = parseInt(part, 10);
      }
      bufferParts.push(val & 255);
    } else {
      for (let k = 0; k < 8; k++) bufferParts.push(0);
      relocs.push({
        offset: bufferParts.length - 8,
        target: part
      });
    }
  }
  return { buffer: new Uint8Array(bufferParts), relocs };
}
var init_parser = __esm({
  "geelooy/scripts/awtsmoos/compiling/pe/asm/parser.js"() {
    init_utils();
  }
});

// geelooy/scripts/awtsmoos/compiling/pe/asm/opcodes.js
function makeModRM(mod, reg, rm) {
  return (mod & 3) << 6 | (reg & 7) << 3 | rm & 7;
}
function makeSIB(scale, index, base) {
  return (scale & 3) << 6 | (index & 7) << 3 | base & 7;
}
var REGISTERS, REGISTER_SIZES, PREFIXES, OPCODES, MOD;
var init_opcodes = __esm({
  "geelooy/scripts/awtsmoos/compiling/pe/asm/opcodes.js"() {
    REGISTERS = {
      // 64-bit
      RAX: 0,
      RCX: 1,
      RDX: 2,
      RBX: 3,
      RSP: 4,
      RBP: 5,
      RSI: 6,
      RDI: 7,
      R8: 8,
      R9: 9,
      R10: 10,
      R11: 11,
      R12: 12,
      R13: 13,
      R14: 14,
      R15: 15,
      // 32-bit
      EAX: 0,
      ECX: 1,
      EDX: 2,
      EBX: 3,
      ESP: 4,
      EBP: 5,
      ESI: 6,
      EDI: 7,
      R8D: 8,
      R9D: 9,
      R10D: 10,
      R11D: 11,
      R12D: 12,
      R13D: 13,
      R14D: 14,
      R15D: 15,
      // 16-bit
      AX: 0,
      CX: 1,
      DX: 2,
      BX: 3,
      SP: 4,
      BP: 5,
      SI: 6,
      DI: 7,
      R8W: 8,
      R9W: 9,
      R10W: 10,
      R11W: 11,
      R12W: 12,
      R13W: 13,
      R14W: 14,
      R15W: 15,
      // 8-bit
      AL: 0,
      CL: 1,
      DL: 2,
      BL: 3,
      SPL: 4,
      BPL: 5,
      SIL: 6,
      DIL: 7,
      R8B: 8,
      R9B: 9,
      R10B: 10,
      R11B: 11,
      R12B: 12,
      R13B: 13,
      R14B: 14,
      R15B: 15
    };
    REGISTER_SIZES = {
      RAX: 64,
      RCX: 64,
      RDX: 64,
      RBX: 64,
      RSP: 64,
      RBP: 64,
      RSI: 64,
      RDI: 64,
      R8: 64,
      R9: 64,
      R10: 64,
      R11: 64,
      R12: 64,
      R13: 64,
      R14: 64,
      R15: 64,
      EAX: 32,
      ECX: 32,
      EDX: 32,
      EBX: 32,
      ESP: 32,
      EBP: 32,
      ESI: 32,
      EDI: 32,
      R8D: 32,
      R9D: 32,
      R10D: 32,
      R11D: 32,
      R12D: 32,
      R13D: 32,
      R14D: 32,
      R15D: 32,
      AX: 16,
      CX: 16,
      DX: 16,
      BX: 16,
      SP: 16,
      BP: 16,
      SI: 16,
      DI: 16,
      R8W: 16,
      R9W: 16,
      R10W: 16,
      R11W: 16,
      R12W: 16,
      R13W: 16,
      R14W: 16,
      R15W: 16,
      AL: 8,
      CL: 8,
      DL: 8,
      BL: 8,
      SPL: 8,
      BPL: 8,
      SIL: 8,
      DIL: 8,
      R8B: 8,
      R9B: 8,
      R10B: 8,
      R11B: 8,
      R12B: 8,
      R13B: 8,
      R14B: 8,
      R15B: 8
    };
    PREFIXES = {
      REX: 64,
      REX_W: 72,
      REX_R: 68,
      REX_X: 66,
      REX_B: 65,
      OS_OVERRIDE: 102,
      REP: 243,
      // Repeat prefix
      REPNE: 242
      // Repeat Not Equal
    };
    OPCODES = {
      MOV_RM_R: 137,
      MOV_R_RM: 139,
      MOV_RM8_R8: 136,
      MOV_R8_RM8: 138,
      MOV_RM_IMM32: 199,
      MOV_RM8_IMM8: 198,
      MOV_R64_IMM64_BASE: 184,
      MOV_R32_IMM32_BASE: 184,
      MOV_R8_IMM8_BASE: 176,
      LEA_R64_M: 141,
      PUSH_R64_BASE: 80,
      POP_R64_BASE: 88,
      ADD_RM64_R64: 1,
      ADD_R64_RM64: 3,
      ADD_RM64_IMM8: 131,
      ADD_RM64_IMM32: 129,
      SUB_RM64_R64: 41,
      SUB_R64_RM64: 43,
      SUB_RM64_IMM8: 131,
      SUB_RM64_IMM32: 129,
      OR_RM64_R64: 9,
      OR_R64_RM64: 11,
      OR_RM64_IMM8: 131,
      OR_RM64_IMM32: 129,
      XOR_RM64_R64: 49,
      XOR_R64_RM64: 51,
      XOR_RM64_IMM8: 131,
      AND_RM64_R64: 33,
      AND_R64_RM64: 35,
      AND_RM64_IMM8: 131,
      CMP_RM64_R64: 57,
      CMP_R64_RM64: 59,
      CMP_RM64_IMM8: 131,
      TEST_RM64_R64: 133,
      TEST_RM64_IMM32: 247,
      INC_RM64: 255,
      DEC_RM64: 255,
      NEG_RM64: 247,
      IMUL_R64_RM64: [15, 175],
      IDIV_RM64: 247,
      DIV_RM64: 247,
      CQO: 153,
      SAR_RM64_IMM8: 193,
      SHL_RM64_IMM8: 193,
      MOVSX_R64_RM8: [15, 190],
      MOVZX_R_RM: [15, 182],
      // Byte to Reg
      // String Instructions
      STOSB: 170,
      STOSD: 171,
      MOVSB: 164,
      MOVSD: 165,
      CLD: 252,
      STD: 253,
      CMOV_O: [15, 64],
      CMOV_NO: [15, 65],
      CMOV_B: [15, 66],
      CMOV_AE: [15, 67],
      CMOV_E: [15, 68],
      CMOV_NE: [15, 69],
      CMOV_BE: [15, 70],
      CMOV_A: [15, 71],
      CMOV_S: [15, 72],
      CMOV_NS: [15, 73],
      CMOV_P: [15, 74],
      CMOV_NP: [15, 75],
      CMOV_L: [15, 76],
      CMOV_GE: [15, 77],
      CMOV_LE: [15, 78],
      CMOV_G: [15, 79],
      CALL_REL32: 232,
      CALL_RM64: 255,
      RET: 195,
      JMP_REL32: 233,
      JMP_RM64: 255,
      JMP_REL8: 235,
      JO_REL8: 112,
      JNO_REL8: 113,
      JB_REL8: 114,
      JAE_REL8: 115,
      JE_REL8: 116,
      JNE_REL8: 117,
      JL_REL8: 124,
      JGE_REL8: 125,
      JLE_REL8: 126,
      JG_REL8: 127,
      JE_REL32: [15, 132],
      JNE_REL32: [15, 133],
      JL_REL32: [15, 140],
      JGE_REL32: [15, 141],
      JLE_REL32: [15, 142],
      JG_REL32: [15, 143],
      SETE_RM8: [15, 148],
      SETNE_RM8: [15, 149],
      SETL_RM8: [15, 156],
      SETG_RM8: [15, 159],
      SETLE_RM8: [15, 158],
      SETGE_RM8: [15, 157],
      NOP: 144,
      INT3: 204,
      SYSCALL: [15, 5]
    };
    MOD = {
      INDIRECT: 0,
      DISP8: 1,
      DISP32: 2,
      DIRECT: 3
    };
  }
});

// geelooy/scripts/awtsmoos/compiling/pe/asm/assembler.js
var CodeBuilder;
var init_assembler = __esm({
  "geelooy/scripts/awtsmoos/compiling/pe/asm/assembler.js"() {
    init_opcodes();
    CodeBuilder = class {
      constructor() {
        this.buffer = [];
        this.callPatches = [];
        this.leaPatches = [];
        this.labels = {};
        this.labelPatches = [];
        this.dataPatches = [];
      }
      get length() {
        return this.buffer.length;
      }
      addBytes(arr) {
        this.buffer.push(...arr);
      }
      add32(val) {
        this.buffer.push(val & 255, val >> 8 & 255, val >> 16 & 255, val >> 24 & 255);
      }
      // --- Labels & Jumps ---
      markLabel(name) {
        this.labels[name] = this.buffer.length;
      }
      // Jump to a label (Short jump 8-bit)
      addJumpRel8(opcode, labelName) {
        this.buffer.push(opcode);
        this.labelPatches.push({
          offset: this.buffer.length,
          type: "rel8",
          target: labelName,
          instSize: 1
        });
        this.buffer.push(0);
      }
      // Jump to a label (Long jump 32-bit)
      addJumpRel32(opcodes, labelName) {
        if (Array.isArray(opcodes)) {
          this.buffer.push(...opcodes);
        } else {
          this.buffer.push(opcodes);
        }
        this.labelPatches.push({
          offset: this.buffer.length,
          type: "rel32",
          target: labelName,
          instSize: 4
          // 32-bit displacement
        });
        this.add32(0);
      }
      // --- Imports & Data ---
      /**
       * Indirect Call to memory location (IAT)
       * Opcode: FF 15 [disp32]
       */
      addCall(funcName) {
        this.buffer.push(OPCODES.CALL_RM64, 21);
        this.callPatches.push({ offset: this.buffer.length, funcName });
        this.add32(0);
      }
      /**
       * Indirect Jump to memory location (IAT) - Used for Tail Calls
       * Opcode: FF 25 [disp32]
       */
      addJmpImport(funcName) {
        this.buffer.push(255, 37);
        this.callPatches.push({ offset: this.buffer.length, funcName });
        this.add32(0);
      }
      /**
       * CALL rel32 (Local Function)
       * Opcode: E8 rel32
       */
      addCallRel(labelName) {
        this.buffer.push(OPCODES.CALL_REL32);
        this.labelPatches.push({
          offset: this.buffer.length,
          type: "rel32",
          target: labelName,
          instSize: 4
        });
        this.add32(0);
      }
      /**
       * LEA RDX, [RIP + disp32]
       * Used for loading string addresses from Data Blob by ID.
       */
      addLeaRel(dataId) {
        const modRM = makeModRM(MOD.INDIRECT, 2, 5);
        this.buffer.push(PREFIXES.REX_W, OPCODES.LEA_R64_M, modRM);
        this.dataPatches.push({ offset: this.buffer.length, id: dataId });
        this.add32(0);
      }
      /**
       * Adds a patch point for a data reference at the current location.
       * Assumes the previous instruction bytes have set up a RIP-relative operand.
       * Inserts 4 bytes of 0s.
       */
      addDataPatch(dataId) {
        this.dataPatches.push({ offset: this.buffer.length, id: dataId });
        this.add32(0);
      }
      /**
       * LEA Reg, [RIP + disp32] -> To Data Blob ID
       * @param {number} reg - Destination register (0-15)
       * @param {number} dataId - The index of the data/string in the data section
       */
      addLeaRegRel(reg, dataId) {
        let rex = PREFIXES.REX_W;
        if (reg >= 8) {
          rex |= PREFIXES.REX_R;
        }
        const modRM = makeModRM(MOD.INDIRECT, reg & 7, 5);
        this.buffer.push(rex, OPCODES.LEA_R64_M, modRM);
        this.dataPatches.push({ offset: this.buffer.length, id: dataId });
        this.add32(0);
      }
      /**
       * LEA Reg, [RIP + disp32] -> To Code Label
       * Useful for getting the address of a function (e.g., WndProc).
       * @param {number} reg 
       * @param {string} labelName 
       */
      addLeaLabel(reg, labelName) {
        let rex = PREFIXES.REX_W;
        if (reg >= 8) {
          rex |= PREFIXES.REX_R;
        }
        const modRM = makeModRM(MOD.INDIRECT, reg & 7, 5);
        this.buffer.push(rex, OPCODES.LEA_R64_M, modRM);
        this.labelPatches.push({
          offset: this.buffer.length,
          type: "rel32",
          target: labelName,
          instSize: 4
          // Displacement is 4 bytes long, so Next IP is patchOffset + 4
        });
        this.add32(0);
      }
      // --- Finalize ---
      resolveLabels() {
        for (let patch of this.labelPatches) {
          const targetOffset = this.labels[patch.target];
          if (targetOffset === void 0) throw new Error(`Label not found: ${patch.target}`);
          const rel = targetOffset - (patch.offset + patch.instSize);
          if (patch.type === "rel8") {
            if (rel < -128 || rel > 127) throw new Error("Short jump out of range. Use addJumpRel32.");
            this.buffer[patch.offset] = rel & 255;
          } else if (patch.type === "rel32") {
            this.buffer[patch.offset] = rel & 255;
            this.buffer[patch.offset + 1] = rel >> 8 & 255;
            this.buffer[patch.offset + 2] = rel >> 16 & 255;
            this.buffer[patch.offset + 3] = rel >> 24 & 255;
          }
        }
      }
    };
  }
});

// geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/operands.js
function parseOperand(arg2, dataSymbols) {
  if (!arg2) return null;
  let raw = arg2;
  let sizeOverride = null;
  if (raw.startsWith("BYTE PTR ")) {
    sizeOverride = 8;
    raw = raw.substring(9).trim();
  } else if (raw.startsWith("WORD PTR ")) {
    sizeOverride = 16;
    raw = raw.substring(9).trim();
  } else if (raw.startsWith("DWORD PTR ")) {
    sizeOverride = 32;
    raw = raw.substring(10).trim();
  } else if (raw.startsWith("QWORD PTR ")) {
    sizeOverride = 64;
    raw = raw.substring(10).trim();
  }
  if (raw.startsWith("[") && raw.endsWith("]")) {
    const content = raw.slice(1, -1).trim();
    if (dataSymbols.has(content)) {
      return { type: "mem", isData: true, id: dataSymbols.get(content), size: sizeOverride || 64 };
    }
  }
  if (raw.startsWith("[") && raw.endsWith("]")) {
    const content = raw.slice(1, -1).trim();
    const memMatch = content.match(/^([A-Za-z]\w*)\s*(?:([+\-])\s*([A-Za-z]\w*)(?:\*([1248]))?)?\s*(?:([+\-])\s*(0x[0-9A-Fa-f]+|\d+))?$/);
    if (memMatch) {
      const baseName = memMatch[1].toUpperCase();
      if (REGISTERS[baseName] === void 0) throw new Error("Invalid Base Register: " + baseName);
      const base = REGISTERS[baseName];
      let index = null;
      let scale = 0;
      if (memMatch[3]) {
        const indexName = memMatch[3].toUpperCase();
        if (REGISTERS[indexName] === void 0) throw new Error("Invalid Index Register: " + indexName);
        index = REGISTERS[indexName];
        const sc = memMatch[4] ? parseInt(memMatch[4]) : 1;
        scale = sc === 1 ? 0 : sc === 2 ? 1 : sc === 4 ? 2 : 3;
      }
      let disp = 0;
      if (memMatch[6]) {
        disp = parseInt(memMatch[6]);
        if (memMatch[5] === "-") disp = -disp;
      }
      return { type: "mem", base, index, scale, disp, size: sizeOverride || 64 };
    }
  }
  const up = raw.toUpperCase();
  if (REGISTERS[up] !== void 0) {
    return {
      type: "reg",
      val: REGISTERS[up],
      size: REGISTER_SIZES[up] || 64
    };
  }
  if (raw.match(/^-?0x[0-9A-Fa-f]+$/) || raw.match(/^-?\d+$/)) {
    let val;
    try {
      const bi = BigInt(raw);
      val = bi >= BigInt(Number.MIN_SAFE_INTEGER) && bi <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(bi) : bi;
    } catch {
      val = parseInt(raw);
    }
    return { type: "imm", val };
  }
  if (dataSymbols.has(raw)) {
    return { type: "data", val: dataSymbols.get(raw) };
  }
  return { type: "label", val: raw };
}
var init_operands = __esm({
  "geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/operands.js"() {
    init_opcodes();
  }
});

// geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/utils.js
function emitMemBytes(memOp, regCode) {
  const { base, index, disp, scale } = memOp;
  const bytes = [];
  let mod = MOD.DISP32;
  if (disp === 0 && (base & 7) !== 5) mod = MOD.INDIRECT;
  else if (disp >= -128 && disp <= 127) mod = MOD.DISP8;
  const needsSib = index !== null || (base & 7) === 4;
  const rmField = needsSib ? 4 : base & 7;
  const modRM = makeModRM(mod, regCode & 7, rmField);
  bytes.push(modRM);
  if (needsSib) {
    const sibIndex = index !== null ? index & 7 : 4;
    const sibBase = base & 7;
    const sib = makeSIB(scale || 0, sibIndex, sibBase);
    bytes.push(sib);
  }
  if (mod === MOD.DISP32) {
    bytes.push(disp & 255, disp >> 8 & 255, disp >> 16 & 255, disp >> 24 & 255);
  } else if (mod === MOD.DISP8) {
    bytes.push(disp & 255);
  }
  return bytes;
}
var init_utils2 = __esm({
  "geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/utils.js"() {
    init_opcodes();
  }
});

// geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/data.js
function emitData(code, mnemonic, args, dataSymbols) {
  const op1 = parseOperand(args[0], dataSymbols);
  const op2 = parseOperand(args[1], dataSymbols);
  function emitRipData(regCode, dataId) {
    const modRM = makeModRM(0, regCode & 7, 5);
    code.addBytes([modRM]);
    code.addDataPatch(dataId);
  }
  if (mnemonic === "MOV") {
    const size = op1.size || 64;
    if (op1.type === "reg" && op2.type === "reg") {
      const rexW = size === 64 ? PREFIXES.REX_W : 0;
      const rex = rexW | (op2.val >= 8 ? PREFIXES.REX_R : 0) | (op1.val >= 8 ? PREFIXES.REX_B : 0);
      const modRM = makeModRM(MOD.DIRECT, op2.val & 7, op1.val & 7);
      if (size === 16) code.addBytes([PREFIXES.OS_OVERRIDE]);
      if (rex) code.addBytes([rex]);
      const opcode = size === 8 ? OPCODES.MOV_RM8_R8 : OPCODES.MOV_RM_R;
      code.addBytes([opcode, modRM]);
    } else if (op1.type === "reg" && op2.type === "imm") {
      const rexW = size === 64 ? PREFIXES.REX_W : 0;
      const rex = rexW | (op1.val >= 8 ? PREFIXES.REX_B : 0);
      if (size === 8) {
        if (rex) code.addBytes([rex]);
        code.addBytes([OPCODES.MOV_R8_IMM8_BASE + (op1.val & 7)]);
        code.addBytes([op2.val & 255]);
      } else if (size === 16) {
        code.addBytes([PREFIXES.OS_OVERRIDE]);
        if (rex) code.addBytes([rex]);
        code.addBytes([OPCODES.MOV_R32_IMM32_BASE + (op1.val & 7)]);
        code.addBytes([op2.val & 255, op2.val >> 8 & 255]);
      } else if (size === 32) {
        if (rex) code.addBytes([rex]);
        code.addBytes([OPCODES.MOV_R32_IMM32_BASE + (op1.val & 7)]);
        code.add32(op2.val);
      } else {
        if (rex) code.addBytes([rex]);
        code.addBytes([OPCODES.MOV_R64_IMM64_BASE + (op1.val & 7)]);
        const v = BigInt(op2.val);
        code.add32(Number(v & 0xFFFFFFFFn));
        code.add32(Number(v >> 32n & 0xFFFFFFFFn));
      }
    } else if (op1.type === "mem" && op2.type === "imm") {
      if (op1.isData) throw new Error("MOV [Label], Imm not supported directly. Use register.");
      const rexW = size === 64 ? PREFIXES.REX_W : 0;
      const rex = rexW | (op1.base >= 8 ? PREFIXES.REX_B : 0) | (op1.index && op1.index >= 8 ? PREFIXES.REX_X : 0);
      if (size === 16) code.addBytes([PREFIXES.OS_OVERRIDE]);
      if (rex) code.addBytes([rex]);
      if (size === 8) {
        code.addBytes([OPCODES.MOV_RM8_IMM8]);
        const bytes = emitMemBytes(op1, 0);
        code.addBytes(bytes);
        code.addBytes([op2.val & 255]);
      } else if (size === 16) {
        code.addBytes([OPCODES.MOV_RM_IMM32]);
        const bytes = emitMemBytes(op1, 0);
        code.addBytes(bytes);
        code.addBytes([op2.val & 255, op2.val >> 8 & 255]);
      } else if (size === 32) {
        code.addBytes([OPCODES.MOV_RM_IMM32]);
        const bytes = emitMemBytes(op1, 0);
        code.addBytes(bytes);
        code.add32(op2.val);
      } else {
        code.addBytes([OPCODES.MOV_RM_IMM32]);
        const bytes = emitMemBytes(op1, 0);
        code.addBytes(bytes);
        code.add32(op2.val);
      }
    } else if (op1.type === "mem" && op2.type === "reg") {
      const regSize = op2.size || 64;
      const opSize = size || regSize;
      const rexW = opSize === 64 ? PREFIXES.REX_W : 0;
      const rex = rexW | (op2.val >= 8 ? PREFIXES.REX_R : 0) | (op1.base >= 8 ? PREFIXES.REX_B : 0) | (op1.index && op1.index >= 8 ? PREFIXES.REX_X : 0);
      if (opSize === 16) code.addBytes([PREFIXES.OS_OVERRIDE]);
      if (op1.isData) {
        if (rex) code.addBytes([rex]);
        const opcode = opSize === 8 ? OPCODES.MOV_RM8_R8 : OPCODES.MOV_RM_R;
        code.addBytes([opcode]);
        emitRipData(op2.val, op1.id);
      } else {
        const bytes = emitMemBytes(op1, op2.val);
        if (rex) code.addBytes([rex]);
        const opcode = opSize === 8 ? OPCODES.MOV_RM8_R8 : OPCODES.MOV_RM_R;
        code.addBytes([opcode, ...bytes]);
      }
    } else if (op1.type === "reg" && op2.type === "mem") {
      const opSize = op1.size;
      const rexW = opSize === 64 ? PREFIXES.REX_W : 0;
      const rex = rexW | (op1.val >= 8 ? PREFIXES.REX_R : 0);
      if (opSize === 16) code.addBytes([PREFIXES.OS_OVERRIDE]);
      if (op2.isData) {
        if (rex) code.addBytes([rex]);
        const opcode = opSize === 8 ? OPCODES.MOV_R8_RM8 : OPCODES.MOV_R_RM;
        code.addBytes([opcode]);
        emitRipData(op1.val, op2.id);
      } else {
        const extraRex = (op2.base >= 8 ? PREFIXES.REX_B : 0) | (op2.index && op2.index >= 8 ? PREFIXES.REX_X : 0);
        if (rex | extraRex) code.addBytes([rex | extraRex]);
        const opcode = opSize === 8 ? OPCODES.MOV_R8_RM8 : OPCODES.MOV_R_RM;
        const bytes = emitMemBytes(op2, op1.val);
        code.addBytes([opcode, ...bytes]);
      }
    }
  } else if (mnemonic === "MOVZX") {
    if (op1.type === "reg" && (op2.type === "reg" || op2.type === "mem")) {
      const rexW = op1.size === 64 ? PREFIXES.REX_W : 0;
      const rex = rexW | (op1.val >= 8 ? PREFIXES.REX_R : 0);
      if (op2.type === "reg") {
        const finalRex = rex | (op2.val >= 8 ? PREFIXES.REX_B : 0);
        if (finalRex) code.addBytes([finalRex]);
        const modRM = makeModRM(MOD.DIRECT, op1.val & 7, op2.val & 7);
        code.addBytes([OPCODES.MOVZX_R_RM[0], OPCODES.MOVZX_R_RM[1], modRM]);
      } else {
        const extraRex = (op2.base >= 8 ? PREFIXES.REX_B : 0) | (op2.index && op2.index >= 8 ? PREFIXES.REX_X : 0);
        if (rex | extraRex) code.addBytes([rex | extraRex]);
        code.addBytes([OPCODES.MOVZX_R_RM[0], OPCODES.MOVZX_R_RM[1]]);
        const bytes = emitMemBytes(op2, op1.val);
        code.addBytes(bytes);
      }
    }
  } else if (mnemonic.startsWith("CMOV")) {
    if (op1.type !== "reg") throw new Error(`${mnemonic} destination must be a register`);
    let suffix = mnemonic.substring(4);
    if (suffix === "Z") suffix = "E";
    if (suffix === "NZ") suffix = "NE";
    const opcodeArr = OPCODES[`CMOV_${suffix}`];
    if (!opcodeArr) throw new Error(`Unknown Conditional Move: ${mnemonic}`);
    const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0);
    if (op2.type === "reg") {
      const finalRex = rex | (op2.val >= 8 ? PREFIXES.REX_B : 0);
      const modRM = makeModRM(MOD.DIRECT, op1.val & 7, op2.val & 7);
      if (finalRex) code.addBytes([finalRex]);
      code.addBytes([opcodeArr[0], opcodeArr[1], modRM]);
    } else if (op2.type === "mem") {
      const extraRex = (op2.base >= 8 ? PREFIXES.REX_B : 0) | (op2.index && op2.index >= 8 ? PREFIXES.REX_X : 0);
      const finalRex = rex | extraRex;
      if (finalRex) code.addBytes([finalRex]);
      code.addBytes([opcodeArr[0], opcodeArr[1]]);
      const bytes = emitMemBytes(op2, op1.val);
      code.addBytes(bytes);
    } else {
      throw new Error(`${mnemonic} supports Reg, Reg/Mem only`);
    }
  } else if (mnemonic === "MOVSX") {
    if (op1.type === "reg" && op2.type === "reg") {
      const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0) | (op2.val >= 8 ? PREFIXES.REX_B : 0);
      const modRM = makeModRM(MOD.DIRECT, op1.val & 7, op2.val & 7);
      code.addBytes([rex, OPCODES.MOVSX_R64_RM8[0], OPCODES.MOVSX_R64_RM8[1], modRM]);
    } else if (op1.type === "reg" && op2.type === "mem") {
      const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0) | (op2.base >= 8 ? PREFIXES.REX_B : 0) | (op2.index && op2.index >= 8 ? PREFIXES.REX_X : 0);
      const bytes = emitMemBytes(op2, op1.val);
      code.addBytes([rex, OPCODES.MOVSX_R64_RM8[0], OPCODES.MOVSX_R64_RM8[1], ...bytes]);
    }
  } else if (mnemonic === "LEA") {
    if (op1.type === "reg" && op2.type === "label") {
      code.addLeaLabel(op1.val, op2.val);
    } else if (op1.type === "reg" && op2.type === "data") {
      code.addLeaRegRel(op1.val, op2.val);
    } else if (op1.type === "reg" && op2.type === "mem") {
      const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0) | (op2.base >= 8 ? PREFIXES.REX_B : 0) | (op2.index && op2.index >= 8 ? PREFIXES.REX_X : 0);
      const bytes = emitMemBytes(op2, op1.val);
      code.addBytes([rex, OPCODES.LEA_R64_M, ...bytes]);
    }
  }
}
var init_data = __esm({
  "geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/data.js"() {
    init_opcodes();
    init_operands();
    init_utils2();
  }
});

// geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/flow.js
function emitFlow(code, mnemonic, args, dataSymbols, imports) {
  if (mnemonic === "RET") {
    code.addBytes([OPCODES.RET]);
    return;
  }
  if (mnemonic === "CLD") {
    code.addBytes([OPCODES.CLD]);
    return;
  }
  if (mnemonic === "STD") {
    code.addBytes([OPCODES.STD]);
    return;
  }
  const op1 = parseOperand(args[0], dataSymbols);
  if (mnemonic === "CALL") {
    if (op1.type === "label") {
      const name = op1.val;
      if (imports.has(name)) {
        code.addCall(name);
      } else if (imports.has(name + "\0")) {
        code.addCall(name + "\0");
      } else {
        code.addCallRel(name);
      }
    } else if (op1.type === "reg") {
      const rex = op1.val >= 8 ? PREFIXES.REX_B : 0;
      const modRM = makeModRM(MOD.DIRECT, 2, op1.val & 7);
      if (rex) code.addBytes([rex]);
      code.addBytes([OPCODES.CALL_RM64, modRM]);
    } else {
      throw new Error("CALL target not supported");
    }
    return;
  }
  if (op1.type !== "label") throw new Error(`${mnemonic} only supports Label`);
  if (mnemonic === "JMP") {
    const name = op1.val;
    if (imports.has(name)) {
      code.addJmpImport(name);
      return;
    } else if (imports.has(name + "\0")) {
      code.addJmpImport(name + "\0");
      return;
    }
  }
  switch (mnemonic) {
    case "JMP":
      code.addJumpRel32(OPCODES.JMP_REL32, op1.val);
      break;
    case "JE":
    case "JZ":
      code.addJumpRel32(OPCODES.JE_REL32, op1.val);
      break;
    case "JNE":
    case "JNZ":
      code.addJumpRel32(OPCODES.JNE_REL32, op1.val);
      break;
    case "JL":
      code.addJumpRel32(OPCODES.JL_REL32, op1.val);
      break;
    case "JGE":
      code.addJumpRel32(OPCODES.JGE_REL32, op1.val);
      break;
    case "JLE":
      code.addJumpRel32(OPCODES.JLE_REL32, op1.val);
      break;
    case "JG":
      code.addJumpRel32(OPCODES.JG_REL32, op1.val);
      break;
  }
}
var init_flow = __esm({
  "geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/flow.js"() {
    init_opcodes();
    init_operands();
  }
});

// geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/math.js
function emitMath(code, mnemonic, args, dataSymbols) {
  const op1 = parseOperand(args[0], dataSymbols);
  const op2 = args.length > 1 ? parseOperand(args[1], dataSymbols) : null;
  const op3 = args.length > 2 ? parseOperand(args[2], dataSymbols) : null;
  if (mnemonic.startsWith("SET")) {
    if (op1.type === "reg") {
      let rex = 0;
      if (op1.val >= 4 && op1.val <= 7 && op1.size === 8) {
        rex = PREFIXES.REX;
      }
      if (op1.val >= 8) {
        rex = PREFIXES.REX_B;
      }
      const modRM = makeModRM(MOD.DIRECT, 0, op1.val & 7);
      if (rex) code.addBytes([rex]);
      let opcodeArr;
      switch (mnemonic) {
        case "SETE":
          opcodeArr = OPCODES.SETE_RM8;
          break;
        case "SETNE":
          opcodeArr = OPCODES.SETNE_RM8;
          break;
        case "SETL":
          opcodeArr = OPCODES.SETL_RM8;
          break;
        case "SETG":
          opcodeArr = OPCODES.SETG_RM8;
          break;
        case "SETLE":
          opcodeArr = OPCODES.SETLE_RM8;
          break;
        case "SETGE":
          opcodeArr = OPCODES.SETGE_RM8;
          break;
        default:
          throw new Error("Unknown SETcc mnemonic: " + mnemonic);
      }
      code.addBytes([opcodeArr[0], opcodeArr[1], modRM]);
      return;
    } else {
      throw new Error(`${mnemonic} only supports Reg8`);
    }
  }
  if (mnemonic === "SAR" || mnemonic === "SHL") {
    const digit2 = mnemonic === "SAR" ? 7 : 4;
    if (op1.type === "reg" && op2.type === "imm") {
      const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_B : 0);
      const modRM = makeModRM(MOD.DIRECT, digit2, op1.val & 7);
      code.addBytes([rex, 193, modRM, op2.val & 255]);
    } else {
      throw new Error(`${mnemonic} only supports Reg, Imm`);
    }
    return;
  }
  if (mnemonic === "IDIV" || mnemonic === "DIV") {
    const digit2 = mnemonic === "IDIV" ? 7 : 6;
    if (op1.type === "reg") {
      const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_B : 0);
      const modRM = makeModRM(MOD.DIRECT, digit2, op1.val & 7);
      code.addBytes([rex, 247, modRM]);
    } else {
      throw new Error(`${mnemonic} only supports Reg`);
    }
    return;
  }
  if (mnemonic === "MUL") {
    if (op1.type === "reg") {
      const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_B : 0);
      const modRM = makeModRM(MOD.DIRECT, 4, op1.val & 7);
      code.addBytes([rex, 247, modRM]);
    } else {
      throw new Error("MUL only supports Reg");
    }
    return;
  }
  if (mnemonic === "IMUL") {
    if (op1.type === "reg" && op2.type === "reg" && op3 && op3.type === "imm") {
      const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0) | (op2.val >= 8 ? PREFIXES.REX_B : 0);
      const modRM = makeModRM(MOD.DIRECT, op1.val & 7, op2.val & 7);
      const imm2 = Number(op3.val);
      if (imm2 >= -128 && imm2 <= 127) {
        code.addBytes([rex, 107, modRM, imm2 & 255]);
      } else {
        code.addBytes([rex, 105, modRM]);
        code.add32(imm2);
      }
    } else if (op1.type === "reg" && op2.type === "reg") {
      const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0) | (op2.val >= 8 ? PREFIXES.REX_B : 0);
      const modRM = makeModRM(MOD.DIRECT, op1.val & 7, op2.val & 7);
      code.addBytes([rex, OPCODES.IMUL_R64_RM64[0], OPCODES.IMUL_R64_RM64[1], modRM]);
    } else if (op1.type === "reg" && op2.type === "imm") {
      const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0) | (op1.val >= 8 ? PREFIXES.REX_B : 0);
      const modRM = makeModRM(MOD.DIRECT, op1.val & 7, op1.val & 7);
      if (op2.val >= -128 && op2.val <= 127) {
        code.addBytes([rex, 107, modRM, op2.val & 255]);
      } else {
        code.addBytes([rex, 105, modRM]);
        code.add32(op2.val);
      }
    } else if (op1.type === "reg" && op2.type === "mem") {
      const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0) | (op2.base >= 8 ? PREFIXES.REX_B : 0) | (op2.index && op2.index >= 8 ? PREFIXES.REX_X : 0);
      const bytes = emitMemBytes(op2, op1.val);
      code.addBytes([rex, OPCODES.IMUL_R64_RM64[0], OPCODES.IMUL_R64_RM64[1], ...bytes]);
    } else {
      throw new Error("IMUL unsupported operands");
    }
    return;
  }
  if (mnemonic === "INC" || mnemonic === "DEC" || mnemonic === "NEG") {
    let extDigit;
    if (mnemonic === "INC") extDigit = 0;
    else if (mnemonic === "DEC") extDigit = 1;
    else if (mnemonic === "NEG") extDigit = 3;
    if (op1.type === "reg") {
      const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_B : 0);
      const modRM = makeModRM(MOD.DIRECT, extDigit, op1.val & 7);
      const opcode = mnemonic === "NEG" ? OPCODES.NEG_RM64 : 255;
      code.addBytes([rex, opcode, modRM]);
    } else {
      throw new Error(`${mnemonic} only supports Reg`);
    }
    return;
  }
  if (mnemonic === "TEST") {
    if (op1.type === "reg" && op2.type === "reg") {
      const rex = PREFIXES.REX_W | (op2.val >= 8 ? PREFIXES.REX_R : 0) | (op1.val >= 8 ? PREFIXES.REX_B : 0);
      const modRM = makeModRM(MOD.DIRECT, op2.val & 7, op1.val & 7);
      if (rex) code.addBytes([rex]);
      code.addBytes([OPCODES.TEST_RM64_R64, modRM]);
    } else if (op1.type === "reg" && op2.type === "imm") {
      const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_B : 0);
      const modRM = makeModRM(MOD.DIRECT, 0, op1.val & 7);
      if (rex) code.addBytes([rex]);
      code.addBytes([OPCODES.TEST_RM64_IMM32, modRM]);
      code.add32(op2.val);
    } else {
      throw new Error("TEST only supports Reg, Reg or Reg, Imm");
    }
    return;
  }
  let baseOpRM_R, baseOpR_RM, digit;
  if (mnemonic === "ADD") {
    baseOpRM_R = OPCODES.ADD_RM64_R64;
    baseOpR_RM = OPCODES.ADD_R64_RM64;
    digit = 0;
  }
  if (mnemonic === "SUB") {
    baseOpRM_R = OPCODES.SUB_RM64_R64;
    baseOpR_RM = OPCODES.SUB_R64_RM64;
    digit = 5;
  }
  if (mnemonic === "XOR") {
    baseOpRM_R = OPCODES.XOR_RM64_R64;
    baseOpR_RM = OPCODES.XOR_R64_RM64;
    digit = 6;
  }
  if (mnemonic === "OR") {
    baseOpRM_R = OPCODES.OR_RM64_R64;
    baseOpR_RM = OPCODES.OR_R64_RM64;
    digit = 1;
  }
  if (mnemonic === "AND") {
    baseOpRM_R = OPCODES.AND_RM64_R64;
    baseOpR_RM = OPCODES.AND_R64_RM64;
    digit = 4;
  }
  if (mnemonic === "CMP") {
    baseOpRM_R = OPCODES.CMP_RM64_R64;
    baseOpR_RM = OPCODES.CMP_R64_RM64;
    digit = 7;
  }
  if (op1.type === "reg" && op2.type === "reg") {
    const rex = PREFIXES.REX_W | (op2.val >= 8 ? PREFIXES.REX_R : 0) | (op1.val >= 8 ? PREFIXES.REX_B : 0);
    const modRM = makeModRM(MOD.DIRECT, op2.val & 7, op1.val & 7);
    code.addBytes([rex, baseOpRM_R, modRM]);
  } else if (op1.type === "reg" && op2.type === "imm") {
    const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_B : 0);
    const modRM = makeModRM(MOD.DIRECT, digit, op1.val & 7);
    if (op2.val >= -128 && op2.val <= 127) {
      code.addBytes([rex, 131, modRM, op2.val & 255]);
    } else {
      code.addBytes([rex, 129, modRM]);
      code.add32(op2.val);
    }
  } else if (op1.type === "reg" && op2.type === "mem") {
    const rex = PREFIXES.REX_W | (op1.val >= 8 ? PREFIXES.REX_R : 0) | (op2.base >= 8 ? PREFIXES.REX_B : 0) | (op2.index && op2.index >= 8 ? PREFIXES.REX_X : 0);
    const bytes = emitMemBytes(op2, op1.val);
    if (rex) code.addBytes([rex]);
    code.addBytes([baseOpR_RM, ...bytes]);
  } else if (op1.type === "mem" && op2.type === "reg") {
    const rex = PREFIXES.REX_W | (op2.val >= 8 ? PREFIXES.REX_R : 0) | (op1.base >= 8 ? PREFIXES.REX_B : 0) | (op1.index && op1.index >= 8 ? PREFIXES.REX_X : 0);
    const bytes = emitMemBytes(op1, op2.val);
    if (rex) code.addBytes([rex]);
    code.addBytes([baseOpRM_R, ...bytes]);
  } else {
    throw new Error(`${mnemonic} unsupported operands: ${op1.type}, ${op2.type}`);
  }
}
var init_math = __esm({
  "geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/math.js"() {
    init_opcodes();
    init_operands();
    init_utils2();
  }
});

// geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/misc.js
function emitMisc(code, mnemonic) {
  const bytes = bytesFor(mnemonic);
  if (!bytes) {
    return false;
  }
  code.addBytes(bytes);
  return true;
}
function bytesFor(mnemonic) {
  switch (mnemonic) {
    case "NOP":
      return [OPCODES.NOP];
    case "INT3":
      return [OPCODES.INT3];
    case "SYSCALL":
      return [...OPCODES.SYSCALL];
    case "CQO":
      return [72, 153];
    default:
      return null;
  }
}
var init_misc = __esm({
  "geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/misc.js"() {
    init_opcodes();
  }
});

// geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/stack.js
function emitStack(code, mnemonic, args, dataSymbols) {
  const op1 = parseOperand(args[0], dataSymbols);
  if (mnemonic === "PUSH") {
    if (op1.type === "reg") {
      if (op1.val >= 8) {
        code.addBytes([PREFIXES.REX_B, OPCODES.PUSH_R64_BASE + (op1.val & 7)]);
      } else {
        code.addBytes([OPCODES.PUSH_R64_BASE + (op1.val & 7)]);
      }
    } else {
      throw new Error("PUSH only supports Reg");
    }
  } else if (mnemonic === "POP") {
    if (op1.type === "reg") {
      if (op1.val >= 8) {
        code.addBytes([PREFIXES.REX_B, OPCODES.POP_R64_BASE + (op1.val & 7)]);
      } else {
        code.addBytes([OPCODES.POP_R64_BASE + (op1.val & 7)]);
      }
    } else {
      throw new Error("POP only supports Reg");
    }
  }
}
var init_stack = __esm({
  "geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/stack.js"() {
    init_opcodes();
    init_operands();
  }
});

// geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/index.js
function emitAsm(context) {
  const code = new CodeBuilder();
  const imports = collectImports(context.importDef);
  for (const token of context.tokens) {
    if (token.type === "label") {
      code.markLabel(token.value);
      continue;
    }
    if (token.type === "instr") {
      dispatchInstruction(
        code,
        token,
        context.dataSymbols,
        imports
      );
    }
  }
  return code;
}
function dispatchInstruction(code, token, dataSymbols, imports) {
  const { args, mnemonic } = token;
  if (mnemonic === "REP") {
    code.addBytes([PREFIXES.REP]);
    if (args.length) {
      dispatchInstruction(code, {
        args: args.slice(1),
        mnemonic: args[0].toUpperCase(),
        type: "instr"
      }, dataSymbols, imports);
    }
    return;
  }
  if (DATA_MNEMONICS.has(mnemonic)) {
    emitData(code, mnemonic, args, dataSymbols);
    return;
  }
  if (MATH_MNEMONICS.has(mnemonic)) {
    emitMath(code, mnemonic, args, dataSymbols);
    return;
  }
  if (["PUSH", "POP"].includes(mnemonic)) {
    emitStack(code, mnemonic, args, dataSymbols);
    return;
  }
  if (FLOW_MNEMONICS.has(mnemonic)) {
    emitFlow(code, mnemonic, args, dataSymbols, imports);
    return;
  }
  if (emitMisc(code, mnemonic)) {
    return;
  }
  throw new Error(`Unknown mnemonic: ${mnemonic}`);
}
function collectImports(importDefinitions = []) {
  const imports = /* @__PURE__ */ new Set();
  for (const definition2 of importDefinitions) {
    for (const functionName of definition2.funcs) {
      imports.add(functionName);
    }
  }
  return imports;
}
var DATA_MNEMONICS, MATH_MNEMONICS, FLOW_MNEMONICS;
var init_emitter = __esm({
  "geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/index.js"() {
    init_assembler();
    init_opcodes();
    init_data();
    init_flow();
    init_math();
    init_misc();
    init_stack();
    DATA_MNEMONICS = /* @__PURE__ */ new Set([
      "MOV",
      "LEA",
      "MOVSX",
      "MOVZX",
      "CMOVO",
      "CMOVNO",
      "CMOVB",
      "CMOVAE",
      "CMOVE",
      "CMOVNE",
      "CMOVBE",
      "CMOVA",
      "CMOVS",
      "CMOVNS",
      "CMOVP",
      "CMOVNP",
      "CMOVL",
      "CMOVGE",
      "CMOVLE",
      "CMOVG",
      "CMOVZ",
      "CMOVNZ"
    ]);
    MATH_MNEMONICS = /* @__PURE__ */ new Set([
      "ADD",
      "SUB",
      "XOR",
      "OR",
      "AND",
      "CMP",
      "TEST",
      "INC",
      "DEC",
      "NEG",
      "IMUL",
      "MUL",
      "IDIV",
      "DIV",
      "SAR",
      "SHL",
      "SETE",
      "SETNE",
      "SETG",
      "SETL",
      "SETGE",
      "SETLE"
    ]);
    FLOW_MNEMONICS = /* @__PURE__ */ new Set([
      "CALL",
      "RET",
      "JMP",
      "JE",
      "JZ",
      "JNE",
      "JNZ",
      "JL",
      "JGE",
      "JLE",
      "JG",
      "CLD",
      "STD"
    ]);
  }
});

// geelooy/scripts/awtsmoos/compiling/pe/compiler_asm.js
function createCustomAsmApp(source) {
  const context = parseAsm(source);
  const code = emitAsm(context);
  return {
    code,
    dataBlobs: context.dataBlobs,
    dataSymbols: context.dataSymbols,
    // Needed for linker relocs
    importDef: context.importDef,
    mode: context.subsystem,
    dataRelocs: context.dataRelocs
  };
}
var init_compiler_asm = __esm({
  "geelooy/scripts/awtsmoos/compiling/pe/compiler_asm.js"() {
    init_parser();
    init_emitter();
  }
});

// geelooy/scripts/awtsmoos/compiling/pe/pe_defs.js
var PE_CONSTANTS;
var init_pe_defs = __esm({
  "geelooy/scripts/awtsmoos/compiling/pe/pe_defs.js"() {
    PE_CONSTANTS = {
      IMAGE_DOS_SIGNATURE: 23117,
      // MZ
      IMAGE_NT_SIGNATURE: 17744,
      // PE\0\0
      // File Header
      IMAGE_FILE_MACHINE_AMD64: 34404,
      // Optional Header (PE32+)
      IMAGE_NT_OPTIONAL_HDR64_MAGIC: 523,
      // Subsystem
      IMAGE_SUBSYSTEM_WINDOWS_CUI: 3,
      // Console
      IMAGE_SUBSYSTEM_WINDOWS_GUI: 2,
      // DLL Characteristics
      IMAGE_DLLCHARACTERISTICS_DYNAMIC_BASE: 64,
      IMAGE_DLLCHARACTERISTICS_NX_COMPAT: 256,
      IMAGE_DLLCHARACTERISTICS_TERMINAL_SERVER_AWARE: 32768,
      // Section Characteristics
      IMAGE_SCN_CNT_CODE: 32,
      IMAGE_SCN_CNT_INITIALIZED_DATA: 64,
      IMAGE_SCN_MEM_EXECUTE: 536870912,
      IMAGE_SCN_MEM_READ: 1073741824,
      IMAGE_SCN_MEM_WRITE: 2147483648,
      // Defaults
      DEFAULT_SECT_ALIGN: 4096,
      DEFAULT_FILE_ALIGN: 512,
      // Standard 64-bit ImageBase to avoid memory conflicts (STATUS_NO_MEMORY)
      DEFAULT_IMAGE_BASE: 5368709120
    };
  }
});

// geelooy/scripts/awtsmoos/compiling/pe/pe_builder.js
var PEBuilder;
var init_pe_builder = __esm({
  "geelooy/scripts/awtsmoos/compiling/pe/pe_builder.js"() {
    init_utils();
    init_pe_defs();
    PEBuilder = class {
      constructor(codeSize, dataSize, totalVirtualSize, sectionData, entryPointRVA) {
        this.codeSize = codeSize;
        this.dataSize = dataSize;
        this.totalVirtualSize = totalVirtualSize;
        this.sectionData = sectionData;
        this.entryPointRVA = entryPointRVA;
        this.headersSize = 512;
        this.headerBuffer = new Uint8Array(this.headersSize);
        this.view = new DataView(this.headerBuffer.buffer);
        this.subsystem = PE_CONSTANTS.IMAGE_SUBSYSTEM_WINDOWS_CUI;
      }
      setGuiSubsystem() {
        this.subsystem = PE_CONSTANTS.IMAGE_SUBSYSTEM_WINDOWS_GUI;
      }
      setImportDirectory(rva, size) {
        const opt = 88;
        this.view.setUint32(opt + 120, rva, true);
        this.view.setUint32(opt + 124, size, true);
      }
      build() {
        this.buildDosHeader();
        this.buildPEHeader();
        this.buildOptionalHeader();
        this.buildSectionTable();
        return this.headerBuffer;
      }
      buildDosHeader() {
        this.view.setUint16(0, PE_CONSTANTS.IMAGE_DOS_SIGNATURE, true);
        this.view.setUint32(60, 64, true);
      }
      buildPEHeader() {
        const pe = 64;
        this.view.setUint32(pe, PE_CONSTANTS.IMAGE_NT_SIGNATURE, true);
        this.view.setUint16(pe + 4, PE_CONSTANTS.IMAGE_FILE_MACHINE_AMD64, true);
        this.view.setUint16(pe + 6, 1, true);
        this.view.setUint16(pe + 20, 240, true);
        this.view.setUint16(pe + 22, 35, true);
      }
      buildOptionalHeader() {
        const opt = 88;
        const { DEFAULT_IMAGE_BASE, DEFAULT_SECT_ALIGN, DEFAULT_FILE_ALIGN } = PE_CONSTANTS;
        this.view.setUint16(opt, PE_CONSTANTS.IMAGE_NT_OPTIONAL_HDR64_MAGIC, true);
        this.view.setUint8(opt + 2, 14);
        this.view.setUint8(opt + 3, 0);
        this.view.setUint32(opt + 4, align(this.codeSize, DEFAULT_FILE_ALIGN), true);
        this.view.setUint32(opt + 8, align(this.dataSize, DEFAULT_FILE_ALIGN), true);
        this.view.setUint32(opt + 16, this.entryPointRVA, true);
        this.view.setUint32(opt + 20, this.entryPointRVA, true);
        this.view.setBigUint64(opt + 24, BigInt(DEFAULT_IMAGE_BASE), true);
        this.view.setUint32(opt + 32, DEFAULT_SECT_ALIGN, true);
        this.view.setUint32(opt + 36, DEFAULT_FILE_ALIGN, true);
        this.view.setUint16(opt + 40, 6, true);
        this.view.setUint16(opt + 48, 6, true);
        const sizeOfImage = align(this.headersSize, DEFAULT_SECT_ALIGN) + align(this.totalVirtualSize, DEFAULT_SECT_ALIGN);
        this.view.setUint32(opt + 56, sizeOfImage, true);
        this.view.setUint32(opt + 60, this.headersSize, true);
        this.view.setUint32(opt + 64, 0, true);
        this.view.setUint16(opt + 68, this.subsystem, true);
        this.view.setUint16(opt + 70, 33024, true);
        this.view.setBigUint64(opt + 72, 0x100000n, true);
        this.view.setBigUint64(opt + 80, 0x1000n, true);
        this.view.setBigUint64(opt + 88, 0x100000n, true);
        this.view.setBigUint64(opt + 96, 0x1000n, true);
        this.view.setUint32(opt + 104, 0, true);
        this.view.setUint32(opt + 108, 16, true);
      }
      buildSectionTable() {
        const sect = 328;
        const { DEFAULT_SECT_ALIGN, DEFAULT_FILE_ALIGN } = PE_CONSTANTS;
        this.headerBuffer.set(stringToBytes(".text"), sect);
        this.view.setUint32(sect + 8, align(this.totalVirtualSize, DEFAULT_SECT_ALIGN), true);
        this.view.setUint32(sect + 12, DEFAULT_SECT_ALIGN, true);
        this.view.setUint32(sect + 16, align(this.totalVirtualSize, DEFAULT_FILE_ALIGN), true);
        this.view.setUint32(sect + 20, this.headersSize, true);
        this.view.setUint32(sect + 36, 3758096480, true);
      }
    };
  }
});

// geelooy/scripts/awtsmoos/compiling/pe/import_manager.js
function buildImportTable(importDef) {
  let iatSize = 0;
  let namesSize = 0;
  importDef.forEach((dll) => {
    iatSize += (dll.funcs.length + 1) * 8;
    let dLen = dll.name.length;
    if (dLen % 2 !== 0) dLen++;
    namesSize += dLen;
    dll.funcs.forEach((f) => {
      let fLen = 2 + f.length;
      if (fLen % 2 !== 0) fLen++;
      namesSize += fLen;
    });
  });
  return {
    iatSize,
    iltSize: iatSize,
    // Identical copy
    idtSize: (importDef.length + 1) * 20,
    // +1 Null IDT
    namesSize,
    definitions: importDef
  };
}
var init_import_manager = __esm({
  "geelooy/scripts/awtsmoos/compiling/pe/import_manager.js"() {
    init_utils();
  }
});

// geelooy/scripts/awtsmoos/compiling/pe/linker.js
function linkAndBuild(artifact, mode) {
  const { code, dataBlobs, importDef, dataRelocs } = artifact;
  const { DEFAULT_SECT_ALIGN, DEFAULT_FILE_ALIGN, DEFAULT_IMAGE_BASE } = PE_CONSTANTS;
  const RVA_TEXT = DEFAULT_SECT_ALIGN;
  code.resolveLabels();
  const importTable = buildImportTable(importDef);
  let offset = 0;
  const codeStart = offset;
  offset += code.buffer.length;
  offset = align(offset, 8);
  const dataOffsets = [];
  for (let blob of dataBlobs) {
    dataOffsets.push(offset);
    offset += blob.length;
    offset = align(offset, 8);
  }
  const iatOffset = offset;
  offset += importTable.iatSize;
  const idtOffset = offset;
  offset += importTable.idtSize;
  const iltOffset = offset;
  offset += importTable.iltSize;
  const namesOffset = offset;
  offset += importTable.namesSize;
  const sectionRawSize = offset;
  const sectionDiskSize = align(sectionRawSize, DEFAULT_FILE_ALIGN);
  const sectionData = new Uint8Array(sectionDiskSize);
  const dv = new DataView(sectionData.buffer);
  sectionData.set(new Uint8Array(code.buffer), codeStart);
  dataBlobs.forEach((blob, i) => {
    sectionData.set(blob, dataOffsets[i]);
  });
  let currentNameOffset = namesOffset;
  let currentIatOffset = iatOffset;
  let currentIltOffset = iltOffset;
  const funcRvaMap = {};
  importTable.definitions.forEach((dll, dllIdx) => {
    const idtEntry = idtOffset + dllIdx * 20;
    dv.setUint32(idtEntry + 12, RVA_TEXT + currentNameOffset, true);
    sectionData.set(stringToBytes(dll.name), currentNameOffset);
    currentNameOffset += dll.name.length;
    if (currentNameOffset % 2 !== 0) currentNameOffset++;
    dv.setUint32(idtEntry + 0, RVA_TEXT + currentIltOffset, true);
    dv.setUint32(idtEntry + 16, RVA_TEXT + currentIatOffset, true);
    dll.funcs.forEach((fn) => {
      const hintRva = RVA_TEXT + currentNameOffset;
      sectionData.set(stringToBytes(fn), currentNameOffset + 2);
      dv.setUint32(currentIltOffset, hintRva, true);
      dv.setUint32(currentIatOffset, hintRva, true);
      funcRvaMap[fn] = RVA_TEXT + currentIatOffset;
      currentIltOffset += 8;
      currentIatOffset += 8;
      currentNameOffset += 2 + fn.length;
      if (currentNameOffset % 2 !== 0) currentNameOffset++;
    });
    currentIltOffset += 8;
    currentIatOffset += 8;
  });
  function patchDisp32(patchOffset, targetRVA) {
    const rip = RVA_TEXT + patchOffset + 4;
    const disp = targetRVA - rip;
    dv.setUint32(codeStart + patchOffset, disp, true);
  }
  code.callPatches.forEach((patch) => {
    const targetRVA = funcRvaMap[patch.funcName];
    if (!targetRVA) {
      const targetWithNull = funcRvaMap[patch.funcName + "\0"];
      if (targetWithNull) {
        patchDisp32(patch.offset, targetWithNull);
        return;
      }
      throw new Error("Missing import: " + patch.funcName);
    }
    patchDisp32(patch.offset, targetRVA);
  });
  code.dataPatches.forEach((patch) => {
    const targetRVA = RVA_TEXT + dataOffsets[patch.id];
    patchDisp32(patch.offset, targetRVA);
  });
  let entryPointOffset = 0;
  if (code.labels["start"] !== void 0) {
    entryPointOffset = code.labels["start"];
  }
  const pe = new PEBuilder(
    sectionRawSize,
    // codeSize (Use full section size)
    0,
    // dataSize (Report 0 to avoid confusion/overlap)
    sectionRawSize,
    // totalVirtualSize
    sectionData,
    RVA_TEXT + entryPointOffset
  );
  pe.setImportDirectory(RVA_TEXT + idtOffset, importTable.idtSize);
  if (mode === "gui") {
    pe.setGuiSubsystem();
  }
  if (dataRelocs && artifact.dataSymbols) {
    const symMap = artifact.dataSymbols;
    dataRelocs.forEach((reloc) => {
      const blobOffset = dataOffsets[reloc.blobId];
      const patchPos = blobOffset + reloc.offset;
      let targetRva = 0;
      if (code.labels[reloc.target] !== void 0) {
        targetRva = RVA_TEXT + code.labels[reloc.target];
      } else if (symMap.has(reloc.target)) {
        const targetBlobId = symMap.get(reloc.target);
        targetRva = RVA_TEXT + dataOffsets[targetBlobId];
      } else {
        console.warn(`Linker: Undefined symbol '${reloc.target}' in data relocation.`);
        return;
      }
      const fullAddress = BigInt(DEFAULT_IMAGE_BASE) + BigInt(targetRva);
      dv.setBigUint64(patchPos, fullAddress, true);
    });
  }
  const headerBuffer = pe.build();
  return new Blob([headerBuffer, sectionData], { type: "application/vnd.microsoft.portable-executable" });
}
var init_linker = __esm({
  "geelooy/scripts/awtsmoos/compiling/pe/linker.js"() {
    init_utils();
    init_pe_defs();
    init_pe_builder();
    init_import_manager();
  }
});

// geelooy/shared/compiling/native/object/contributions.js
function mergeObjectSections(objects) {
  assertSupportedSections(objects);
  const offsets = /* @__PURE__ */ new Map();
  const sections = LINKED_SECTIONS.map((name) => {
    return mergeNamedSection(objects, name, offsets);
  });
  return Object.freeze({
    offsetOf(objectIndex, sectionName) {
      const key = contributionKey(objectIndex, sectionName);
      if (!offsets.has(key)) {
        throw new Error(`OBJECT_LINK_CONTRIBUTION:${key}`);
      }
      return offsets.get(key);
    },
    sections: Object.freeze(sections)
  });
}
function mergeNamedSection(objects, name, offsets) {
  const contributions = objects.map((object, objectIndex) => {
    const section = object.sections.find((candidate) => candidate.name === name);
    return { objectIndex, section };
  }).filter((item) => item.section);
  const alignment = contributions.reduce((maximum, item) => {
    return Math.max(maximum, item.section.alignment);
  }, 1);
  const permissions = permissionsFor(name);
  let fileSize = 0;
  let memorySize = 0;
  for (const item of contributions) {
    fileSize = alignUp(fileSize, item.section.alignment);
    memorySize = alignUp(memorySize, item.section.alignment);
    offsets.set(contributionKey(item.objectIndex, name), fileSize);
    fileSize += item.section.bytes.length;
    memorySize += item.section.memorySize;
  }
  const bytes = new Uint8Array(fileSize);
  for (const item of contributions) {
    bytes.set(
      item.section.bytes,
      offsets.get(contributionKey(item.objectIndex, name))
    );
  }
  return Object.freeze({
    alignment,
    bytes,
    memorySize,
    name,
    permissions
  });
}
function assertSupportedSections(objects) {
  for (const object of objects) {
    for (const section of object.sections) {
      if (!LINKED_SECTIONS.includes(section.name)) {
        throw new Error(`OBJECT_LINK_SECTION_UNSUPPORTED:${section.name}`);
      }
      const expected = permissionsFor(section.name);
      if (section.permissions.execute !== expected.execute || section.permissions.write !== expected.write) {
        throw new Error(`OBJECT_LINK_PERMISSIONS:${section.name}`);
      }
    }
  }
}
function permissionsFor(name) {
  return Object.freeze(name === "code" ? { execute: true, read: true, write: false } : { execute: false, read: true, write: true });
}
function contributionKey(objectIndex, sectionName) {
  return `${objectIndex}:${sectionName}`;
}
var LINKED_SECTIONS;
var init_contributions = __esm({
  "geelooy/shared/compiling/native/object/contributions.js"() {
    init_align();
    LINKED_SECTIONS = Object.freeze(["code", "data"]);
  }
});

// geelooy/shared/compiling/native/object/symbols.js
function buildLinkedSymbols(objects, merged) {
  const globals = /* @__PURE__ */ new Map();
  const locals = /* @__PURE__ */ new Map();
  objects.forEach((object, objectIndex) => {
    for (const symbol of object.symbols) {
      const linked = Object.freeze({
        binding: symbol.binding,
        kind: symbol.kind,
        name: symbol.name,
        offset: merged.offsetOf(objectIndex, symbol.section) + symbol.offset,
        objectIndex,
        section: symbol.section
      });
      locals.set(localKey(objectIndex, symbol.name), linked);
      if (symbol.binding === "global") {
        if (globals.has(symbol.name)) {
          throw new Error(`OBJECT_LINK_SYMBOL_DUPLICATE:${symbol.name}`);
        }
        globals.set(symbol.name, linked);
      }
    }
  });
  return Object.freeze({
    entry(name) {
      const symbol = globals.get(String(name));
      if (!symbol) throw new Error(`OBJECT_LINK_ENTRY:${name}`);
      return symbol;
    },
    globals: Object.freeze([...globals.values()]),
    resolve(objectIndex, name) {
      return locals.get(localKey(objectIndex, name)) || globals.get(String(name)) || unresolved(name);
    }
  });
}
function localKey(objectIndex, name) {
  return `${objectIndex}:${name}`;
}
function unresolved(name) {
  throw new Error(`OBJECT_LINK_SYMBOL_UNRESOLVED:${name}`);
}
var init_symbols = __esm({
  "geelooy/shared/compiling/native/object/symbols.js"() {
  }
});

// geelooy/shared/compiling/native/object/linker.js
function linkNativeObjects(objects, options = {}) {
  const normalized = normalizeObjects(objects);
  const merged = mergeObjectSections(normalized);
  const symbols = buildLinkedSymbols(normalized, merged);
  const entry = symbols.entry(options.entrySymbol || "start");
  if (entry.section !== "code") {
    throw new Error(`OBJECT_LINK_ENTRY_SECTION:${entry.section}`);
  }
  const relocations = [];
  normalized.forEach((object, objectIndex) => {
    for (const relocation of object.relocations) {
      const target = symbols.resolve(objectIndex, relocation.targetSymbol);
      relocations.push(Object.freeze({
        addend: relocation.addend,
        kind: relocation.kind,
        sourceOffset: merged.offsetOf(
          objectIndex,
          relocation.sourceSection
        ) + relocation.sourceOffset,
        sourceSection: relocation.sourceSection,
        targetOffset: target.offset,
        targetSection: target.section
      }));
    }
  });
  const image = createExecutableImage({
    architecture: normalized[0].architecture,
    entry: { offset: entry.offset, section: entry.section },
    relocations,
    sections: merged.sections
  });
  return Object.freeze({
    entrySymbol: entry.name,
    globalSymbols: symbols.globals,
    image,
    objectCount: normalized.length,
    relocationCount: relocations.length,
    version: "awtsmoos-static-link-v1"
  });
}
function normalizeObjects(objects) {
  if (!Array.isArray(objects) || !objects.length || objects.length > 256) {
    throw new Error(`OBJECT_LINK_COUNT:${objects?.length ?? -1}`);
  }
  const architecture = objects[0]?.architecture;
  for (const object of objects) {
    if (object?.version !== "awtsmoos-object-v1") {
      throw new Error(`OBJECT_LINK_VERSION:${object?.version}`);
    }
    if (object.architecture !== architecture) {
      throw new Error("OBJECT_LINK_ARCHITECTURE_MISMATCH");
    }
  }
  return Object.freeze([...objects]);
}
var init_linker2 = __esm({
  "geelooy/shared/compiling/native/object/linker.js"() {
    init_model();
    init_contributions();
    init_symbols();
  }
});

// geelooy/shared/compiling/native/object/normalize.js
function normalizeObjectParts(options = {}) {
  const sections = normalizeSections2(options.sections || []);
  const sectionMap = new Map(sections.map((section) => [section.name, section]));
  const symbols = normalizeSymbols(options.symbols || [], sectionMap);
  const symbolNames = new Set(symbols.map((symbol) => symbol.name));
  const relocations = Object.freeze((options.relocations || []).map((relocation) => {
    return normalizeRelocation2(relocation, sectionMap, symbolNames);
  }));
  return Object.freeze({ relocations, sections, symbols });
}
function normalizeSections2(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 16) {
    throw new Error(`OBJECT_SECTION_COUNT:${input?.length ?? -1}`);
  }
  const names = /* @__PURE__ */ new Set();
  return Object.freeze(input.map((section, index) => {
    const name = String(section.name || `section_${index}`);
    if (!/^[A-Za-z_.][A-Za-z0-9_.-]*$/.test(name) || names.has(name)) {
      throw new Error(`OBJECT_SECTION_NAME:${name}`);
    }
    names.add(name);
    const bytes = cloneBytes(section.bytes);
    const memorySize = safeInteger(
      section.memorySize ?? bytes.length,
      `${name} memory`
    );
    if (memorySize < bytes.length) {
      throw new Error(`OBJECT_SECTION_MEMORY:${name}`);
    }
    const alignment = safeInteger(section.alignment ?? 1, `${name} alignment`);
    alignUp(0, alignment);
    return Object.freeze({
      alignment,
      bytes,
      memorySize,
      name,
      permissions: Object.freeze({
        execute: Boolean(section.permissions?.execute),
        read: section.permissions?.read !== false,
        write: Boolean(section.permissions?.write)
      })
    });
  }));
}
function normalizeSymbols(input, sectionMap) {
  const names = /* @__PURE__ */ new Set();
  return Object.freeze(input.map((symbol) => {
    const name = String(symbol.name || "");
    if (!/^[A-Za-z_.$][A-Za-z0-9_.$-]*$/.test(name) || names.has(name)) {
      throw new Error(`OBJECT_SYMBOL_NAME:${name}`);
    }
    names.add(name);
    const section = sectionMap.get(String(symbol.section || ""));
    if (!section) throw new Error(`OBJECT_SYMBOL_SECTION:${name}`);
    const offset = safeInteger(symbol.offset ?? 0, `${name} offset`);
    if (offset > section.memorySize) {
      throw new Error(`OBJECT_SYMBOL_RANGE:${name}`);
    }
    return Object.freeze({
      binding: symbol.binding === "local" ? "local" : "global",
      kind: String(symbol.kind || "value"),
      name,
      offset,
      section: section.name
    });
  }));
}
function normalizeRelocation2(relocation, sectionMap, symbolNames) {
  const kind = String(relocation.kind || "");
  const width = RELOCATION_WIDTHS2[kind];
  if (!width) throw new Error(`OBJECT_RELOCATION_KIND:${kind}`);
  const source = sectionMap.get(String(relocation.sourceSection || ""));
  if (!source) throw new Error("OBJECT_RELOCATION_SECTION");
  const sourceOffset = safeInteger(relocation.sourceOffset, "relocation source");
  if (sourceOffset + width > source.bytes.length) {
    throw new Error(`OBJECT_RELOCATION_RANGE:${kind}`);
  }
  const targetSymbol = String(relocation.targetSymbol || "");
  if (!targetSymbol) throw new Error("OBJECT_RELOCATION_TARGET");
  const addend = Number(relocation.addend || 0);
  if (!Number.isSafeInteger(addend)) throw new Error("OBJECT_RELOCATION_ADDEND");
  return Object.freeze({
    addend,
    external: !symbolNames.has(targetSymbol),
    kind,
    sourceOffset,
    sourceSection: source.name,
    targetSymbol
  });
}
var RELOCATION_WIDTHS2;
var init_normalize = __esm({
  "geelooy/shared/compiling/native/object/normalize.js"() {
    init_align();
    init_bytes();
    RELOCATION_WIDTHS2 = Object.freeze({ abs64: 8, rip32: 4 });
  }
});

// geelooy/shared/compiling/native/object/model.js
function createNativeObject(options = {}) {
  const architecture = String(options.architecture || "x86_64");
  if (architecture !== "x86_64") {
    throw new Error(`OBJECT_ARCHITECTURE_UNSUPPORTED:${architecture}`);
  }
  const parts = normalizeObjectParts(options);
  return Object.freeze({
    architecture,
    name: String(options.name || "anonymous-object"),
    relocations: parts.relocations,
    sections: parts.sections,
    symbols: parts.symbols,
    version: "awtsmoos-object-v1"
  });
}
var init_model2 = __esm({
  "geelooy/shared/compiling/native/object/model.js"() {
    init_normalize();
  }
});

// geelooy/scripts/awtsmoos/compiling/native/asmObjectCode.js
function buildAsmCodeObject(code, options = {}) {
  const bytes = Uint8Array.from(code.buffer);
  const relocations = [];
  for (const patch of code.labelPatches) {
    const targetOffset = code.labels[patch.target];
    if (targetOffset !== void 0) {
      writeRelative(bytes, patch, targetOffset);
      continue;
    }
    if (patch.type !== "rel32" || options.allowExternals !== true) {
      throw new Error(`PORTABLE_ASM_SYMBOL:${patch.target}`);
    }
    relocations.push(Object.freeze({
      kind: "rip32",
      sourceOffset: patch.offset,
      sourceSection: "code",
      targetSymbol: patch.target
    }));
  }
  const symbols = Object.entries(code.labels).map(([name, offset]) => {
    return Object.freeze({
      binding: "global",
      kind: "function",
      name,
      offset,
      section: "code"
    });
  });
  return Object.freeze({
    bytes,
    relocations: Object.freeze(relocations),
    symbols: Object.freeze(symbols)
  });
}
function writeRelative(bytes, patch, targetOffset) {
  const relative = targetOffset - (patch.offset + patch.instSize);
  if (patch.type === "rel8") {
    if (relative < -128 || relative > 127) {
      throw new Error(`PORTABLE_ASM_REL8_RANGE:${relative}`);
    }
    bytes[patch.offset] = relative & 255;
    return;
  }
  if (relative < -2147483648 || relative > 2147483647) {
    throw new Error(`PORTABLE_ASM_REL32_RANGE:${relative}`);
  }
  new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).setInt32(patch.offset, relative, true);
}
var init_asmObjectCode = __esm({
  "geelooy/scripts/awtsmoos/compiling/native/asmObjectCode.js"() {
  }
});

// geelooy/scripts/awtsmoos/compiling/native/asmObjectData.js
function buildAsmDataObject(artifact) {
  const packed = packDataBlobs(artifact.dataBlobs);
  const symbols = [];
  for (let blobId = 0; blobId < packed.offsets.length; blobId += 1) {
    symbols.push(dataSymbol(`$data_${blobId}`, packed.offsets[blobId], "local"));
  }
  for (const [name, blobId] of artifact.dataSymbols.entries()) {
    const offset = packed.offsets[blobId];
    if (offset === void 0) throw new Error(`PORTABLE_ASM_DATA_SYMBOL:${name}`);
    symbols.push(dataSymbol(name, offset, "global"));
  }
  const relocations = artifact.dataRelocs.map((relocation) => {
    const sourceBase = packed.offsets[relocation.blobId];
    if (sourceBase === void 0) {
      throw new Error(`PORTABLE_ASM_DATA_RELOCATION:${relocation.blobId}`);
    }
    return Object.freeze({
      kind: "abs64",
      sourceOffset: sourceBase + relocation.offset,
      sourceSection: "data",
      targetSymbol: relocation.target
    });
  });
  return Object.freeze({
    bytes: packed.bytes,
    offsets: Object.freeze([...packed.offsets]),
    relocations: Object.freeze(relocations),
    symbols: Object.freeze(symbols)
  });
}
function codeDataRelocations(patches) {
  return Object.freeze(patches.map((patch) => Object.freeze({
    kind: "rip32",
    sourceOffset: patch.offset,
    sourceSection: "code",
    targetSymbol: `$data_${patch.id}`
  })));
}
function packDataBlobs(blobs) {
  const offsets = [];
  let total = 0;
  for (const blob of blobs) {
    total = alignUp(total, 8);
    offsets.push(total);
    total += blob.length;
  }
  const bytes = new Uint8Array(total);
  blobs.forEach((blob, index) => bytes.set(blob, offsets[index]));
  return { bytes, offsets };
}
function dataSymbol(name, offset, binding) {
  return Object.freeze({
    binding,
    kind: "data",
    name,
    offset,
    section: "data"
  });
}
var init_asmObjectData = __esm({
  "geelooy/scripts/awtsmoos/compiling/native/asmObjectData.js"() {
    init_align();
  }
});

// geelooy/scripts/awtsmoos/compiling/native/asmImage.js
function createPortableAsmObject(source, options = {}) {
  const artifact = createCustomAsmApp(String(source));
  assertPortableArtifact(artifact);
  const code = buildAsmCodeObject(artifact.code, options);
  const data = buildAsmDataObject(artifact);
  const relocations = [
    ...code.relocations,
    ...codeDataRelocations(artifact.code.dataPatches),
    ...data.relocations
  ];
  const object = createNativeObject({
    architecture: "x86_64",
    name: options.name || "awtsmoos-assembly-object",
    relocations,
    sections: [
      {
        alignment: 16,
        bytes: code.bytes,
        name: "code",
        permissions: { execute: true, read: true }
      },
      {
        alignment: 8,
        bytes: data.bytes,
        name: "data",
        permissions: { read: true, write: true }
      }
    ],
    symbols: [...code.symbols, ...data.symbols]
  });
  return Object.freeze({
    dataOffsets: data.offsets,
    labelCount: code.symbols.length,
    object,
    relocationCount: relocations.length
  });
}
function createPortableAsmImage(source, options = {}) {
  const objectResult = createPortableAsmObject(source, options);
  const linked = linkNativeObjects([objectResult.object], {
    entrySymbol: options.entrySymbol || "start"
  });
  return Object.freeze({
    ...objectResult,
    image: linked.image,
    linkVersion: linked.version,
    linked
  });
}
function assertPortableArtifact(artifact) {
  const importCount = artifact.importDef.reduce((sum2, item) => {
    return sum2 + item.funcs.length;
  }, 0);
  if (importCount || artifact.code.callPatches.length) {
    throw new Error("PORTABLE_ASM_IMPORTS_UNSUPPORTED");
  }
}
var init_asmImage = __esm({
  "geelooy/scripts/awtsmoos/compiling/native/asmImage.js"() {
    init_linker2();
    init_model2();
    init_compiler_asm();
    init_asmObjectCode();
    init_asmObjectData();
  }
});

// geelooy/scripts/awtsmoos/compiling/native/compiler.js
async function compileNativeAsm(source, targetId) {
  const target = nativeTarget(targetId);
  if (WINDOWS_TARGETS.has(target.id)) {
    return compileWindows(source, target);
  }
  if (!["linux-x64-static", "macos-x64"].includes(target.id)) {
    throw new Error(`native_asm_target_unsupported:${target.id}`);
  }
  const imageResult = createPortableAsmImage(source);
  const written = target.format === "elf" ? writeElf64Executable(imageResult.image) : writeMachO64Executable(imageResult.image);
  const blob = new Blob([written.bytes], {
    type: written.mimeType
  });
  return Object.freeze({
    ...written,
    blob,
    evidenceClass: "scratch-executable-writer",
    imageVersion: imageResult.image.version,
    linkVersion: imageResult.linkVersion,
    objectCount: imageResult.linked.objectCount,
    objectVersion: imageResult.object.version,
    relocationCount: imageResult.linked.relocationCount,
    target,
    targetId: target.id,
    triple: target.triple
  });
}
async function compileWindows(source, target) {
  const artifact = createCustomAsmApp(String(source));
  const blob = linkAndBuild(artifact, target.subsystem);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return Object.freeze({
    blob,
    bytes,
    evidenceClass: "scratch-executable-writer",
    extension: ".exe",
    format: "pe",
    mimeType: blob.type,
    target,
    targetId: target.id,
    triple: target.triple,
    writer: "awtsmoos-scratch-pe64-v1"
  });
}
var WINDOWS_TARGETS;
var init_compiler = __esm({
  "geelooy/scripts/awtsmoos/compiling/native/compiler.js"() {
    init_writer();
    init_writer2();
    init_targetTriples();
    init_compiler_asm();
    init_linker();
    init_asmImage();
    WINDOWS_TARGETS = /* @__PURE__ */ new Set([
      "windows-x64-console",
      "windows-x64-gui"
    ]);
  }
});

// geelooy/scripts/awtsmoos/compiling/js/asm.js
var asm_exports = {};
__export(asm_exports, {
  MERKAVA_BAILOUT_EXIT: () => MERKAVA_BAILOUT_EXIT,
  MERKAVA_SAFE_INT_MAX: () => MERKAVA_SAFE_INT_MAX,
  compileJsToNativeAsm: () => compileJsToNativeAsm,
  listCodegenExtensions: () => listCodegenExtensions,
  parseEntry: () => parseEntry,
  registerCodegenExtension: () => registerCodegenExtension,
  transpileJsToAsm: () => transpileJsToAsm,
  unregisterCodegenExtension: () => unregisterCodegenExtension
});
function fail(msg, node) {
  const where = node && node.start !== void 0 ? ` at offset ${node.start}` : "";
  throw new Error(`jsAsm: ${msg}${where}`);
}
function registerCodegenExtension(name, handlers) {
  if (typeof name !== "string" || !name) fail("extension name must be a non-empty string");
  if (!handlers || typeof handlers !== "object") fail(`extension '${name}': handlers must be an object`);
  for (const k of Object.keys(handlers)) {
    if (!EXT_HOOK_NAMES.includes(k)) fail(`extension '${name}': unknown hook '${k}' (want ${EXT_HOOK_NAMES.join("|")})`);
    if (typeof handlers[k] !== "function") fail(`extension '${name}': hook '${k}' must be a function`);
  }
  const i = codegenExtensions.findIndex((e) => e.name === name);
  if (i >= 0) codegenExtensions[i] = { name, handlers };
  else codegenExtensions.push({ name, handlers });
  return name;
}
function unregisterCodegenExtension(name) {
  const i = codegenExtensions.findIndex((e) => e.name === name);
  if (i >= 0) codegenExtensions.splice(i, 1);
  return i >= 0;
}
function listCodegenExtensions() {
  return codegenExtensions.map((e) => e.name);
}
function driverFns(includeParseArg) {
  const out = [
    `awts_putchar:`,
    // RDI = byte
    `PUSH RBP`,
    `MOV RBP, RSP`,
    `PUSH R12`,
    `MOV R12, RDI`,
    `PUSH R12`,
    // char byte at [RSP] (low byte)
    `MOV RAX, 1`,
    // sys_write
    `MOV RDI, 1`,
    `MOV RSI, RSP`,
    `MOV RDX, 1`,
    `SYSCALL`,
    `ADD RSP, 8`,
    `POP R12`,
    `MOV RSP, RBP`,
    `POP RBP`,
    `RET`,
    ``,
    `awts_print_u:`,
    // RDI = unsigned value
    `PUSH RBP`,
    `MOV RBP, RSP`,
    `PUSH RBX`,
    `PUSH R12`,
    `MOV R12, RDI`,
    `CMP R12, 10`,
    `JL $ppu_one`,
    `MOV RAX, R12`,
    `CQO`,
    `MOV RCX, 10`,
    `IDIV RCX`,
    // RAX = quo, RDX = rem
    `PUSH RDX`,
    `MOV RDI, RAX`,
    `CALL awts_print_u`,
    `POP RDX`,
    `MOV R12, RDX`,
    `$ppu_one:`,
    `ADD R12, 48`,
    `MOV RDI, R12`,
    `CALL awts_putchar`,
    `POP R12`,
    `POP RBX`,
    `MOV RSP, RBP`,
    `POP RBP`,
    `RET`,
    ``,
    `awts_print:`,
    // RDI = signed value
    `PUSH RBP`,
    `MOV RBP, RSP`,
    `PUSH RBX`,
    `PUSH R12`,
    `MOV R12, RDI`,
    `CMP R12, 0`,
    `JGE $pp_nonneg`,
    `MOV RDI, 45`,
    `CALL awts_putchar`,
    `MOV RAX, R12`,
    `NEG RAX`,
    `MOV RDI, RAX`,
    `CALL awts_print_u`,
    `JMP $pp_done`,
    `$pp_nonneg:`,
    `MOV RDI, R12`,
    `CALL awts_print_u`,
    `$pp_done:`,
    `POP R12`,
    `POP RBX`,
    `MOV RSP, RBP`,
    `POP RBP`,
    `RET`
  ];
  if (includeParseArg) out.push(
    ``,
    `__merkava_parse_arg:`,
    `XOR RAX, RAX`,
    `XOR R10, R10`,
    // sign flag
    `MOVZX R11, BYTE PTR [RDI]`,
    `CMP R11, 45`,
    // '-'
    `JNE $pap_digits`,
    `MOV R10, 1`,
    `INC RDI`,
    `$pap_digits:`,
    `MOVZX R11, BYTE PTR [RDI]`,
    `TEST R11, R11`,
    `JZ $pap_done`,
    `SUB R11, 48`,
    `IMUL RAX, RAX, 10`,
    `ADD RAX, R11`,
    `INC RDI`,
    `JMP $pap_digits`,
    `$pap_done:`,
    `TEST R10, R10`,
    `JZ $pap_ret`,
    `NEG RAX`,
    `$pap_ret:`,
    `RET`
  );
  return out.join("\n");
}
function mainFn(entry, functions, opts) {
  if (!functions.has(entry.name)) throw new Error(`jsAsm: entry '${entry.name}' not declared`);
  const repeat = Math.max(1, entry.repeat | 0 || 1);
  const L = [
    `main:`,
    `PUSH RBP`,
    `MOV RBP, RSP`,
    `PUSH RBX`,
    `PUSH R12`
  ];
  if (repeat > 1) L.push(`MOV R12, ${repeat}`, `$repeat:`);
  if (entry.args === "argv") {
    const nargs = opts && opts.nargs | 0 || 0;
    if (nargs > 6) throw new Error("jsAsm: max 6 entry args");
    for (let i = 0; i < nargs; i++) {
      L.push(`MOV RDI, QWORD PTR [RBP+${32 + 8 * i}]`);
      L.push(`CALL __merkava_parse_arg`);
      L.push(`PUSH RAX`);
    }
    for (let i = nargs - 1; i >= 0; i--) L.push(`POP ${ARG_REGS[i]}`);
  } else {
    entry.args.forEach((a, i) => {
      L.push(`MOV ${ARG_REGS[i]}, ${a}`);
    });
  }
  L.push(`CALL ${entry.name}`);
  if (repeat > 1) {
    L.push(`DEC R12`, `JNZ $repeat`);
  }
  L.push(`MOV RDI, RAX`);
  L.push(`CALL awts_print`);
  L.push(`MOV RDI, 10`);
  L.push(`CALL awts_putchar`);
  L.push(`MOV RAX, 0`);
  L.push(`POP R12`, `POP RBX`);
  L.push(`MOV RSP, RBP`, `POP RBP`, `RET`);
  return L.join("\n");
}
async function transpileJsToAsm(jsSource, entry, opts) {
  const Parser = await require2("../../MerkavaASTParser/parser-core.js");
  const program = new Parser(String(jsSource)).parse();
  const g = new AsmGen();
  if (opts && opts.repeat) g.repeatOverride = opts.repeat;
  if (opts && opts.checkedArithmetic) g.checkedArithmetic = true;
  if (opts && opts.nativeDepthGuard) g.nativeDepthGuard = true;
  if (opts && opts.nargs) g.entryNargs = opts.nargs | 0;
  return { asm: g.run(program, entry) };
}
async function compileJsToNativeAsm(jsSource, entry, opts) {
  const t0 = Date.now();
  const { asm } = await transpileJsToAsm(jsSource, entry, opts);
  const out = await compileNativeAsm(asm, "linux-x64-static");
  const compileMs = Date.now() - t0;
  const { chmodSync, mkdirSync, writeFileSync: writeFileSync4 } = await import("fs");
  const { tmpdir } = await import("os");
  const { join } = await import("path");
  const WORK = join(tmpdir(), "merkava-js-native");
  mkdirSync(WORK, { recursive: true });
  const path2 = join(WORK, `a${process.pid}_${Date.now() % 1e6}`);
  writeFileSync4(path2, Buffer.from(out.bytes));
  chmodSync(path2, 493);
  return { path: path2, asm, compileMs };
}
function parseEntry(entryCall) {
  const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*$/.exec(String(entryCall));
  if (!m) throw new Error(`jsAsm: bad entry '${entryCall}'`);
  const args = m[2].trim() === "" ? [] : m[2].split(",").map((s) => {
    const v = Number(s.trim());
    if (!Number.isInteger(v)) throw new Error(`jsAsm: entry arg '${s}' must be an integer`);
    return v;
  });
  if (args.length > 6) throw new Error("jsAsm: max 6 entry args");
  return { name: m[1], args };
}
var import_module, import_meta, require2, PINNED, ARG_REGS, INT64_MIN, INT64_MAX, CMP_OPS, codegenExtensions, EXT_HOOK_NAMES, MERKAVA_BAILOUT_EXIT, MERKAVA_SAFE_INT_MAX, AsmGen;
var init_asm = __esm({
  "geelooy/scripts/awtsmoos/compiling/js/asm.js"() {
    import_module = require("module");
    init_compiler();
    import_meta = {};
    require2 = (0, import_module.createRequire)(import_meta.url);
    PINNED = ["RBX", "R12", "R13", "R14", "R15"];
    ARG_REGS = ["RDI", "RSI", "RDX", "RCX", "R8", "R9"];
    INT64_MIN = -(2n ** 63n);
    INT64_MAX = 2n ** 63n - 1n;
    CMP_OPS = {
      "<": { set: "SETL", jt: "JL", jf: "JGE" },
      "<=": { set: "SETLE", jt: "JLE", jf: "JG" },
      ">": { set: "SETG", jt: "JG", jf: "JLE" },
      ">=": { set: "SETGE", jt: "JGE", jf: "JL" },
      "==": { set: "SETE", jt: "JE", jf: "JNE" },
      "!=": { set: "SETNE", jt: "JNE", jf: "JE" }
    };
    codegenExtensions = [];
    EXT_HOOK_NAMES = ["literal", "binary", "member", "call"];
    MERKAVA_BAILOUT_EXIT = 42;
    MERKAVA_SAFE_INT_MAX = 9007199254740991;
    AsmGen = class {
      constructor() {
        this.lines = [];
        this.labelN = 0;
        this.functions = /* @__PURE__ */ new Set();
        this.locals = /* @__PURE__ */ new Map();
        this.loopStack = [];
        this.stackReserve = 0;
        this.checkedArithmetic = false;
        this.nativeDepthGuard = false;
        this.entryNargs = 0;
        this.extData = [];
        this.extCode = [];
        this.extSeen = /* @__PURE__ */ new Set();
      }
      // Stream 7: run extension handlers for a dispatch hook. The first handler
      // returning strict true wins (result in RAX); anything else falls through
      // to the integer core.
      extensionHook(hook, node) {
        if (!codegenExtensions.length) return false;
        for (const ext of codegenExtensions) {
          const fn = ext.handlers[hook];
          if (typeof fn !== "function") continue;
          let handled = false;
          try {
            handled = fn(this, node) === true;
          } catch (e) {
            throw new Error(`jsAsm: extension '${ext.name}' hook '${hook}' failed: ${e && e.message}`);
          }
          if (handled) return true;
        }
        return false;
      }
      // Stream 7: extension-contributed top-level asm, emitted once per name.
      extensionData(name, text) {
        if (this.extSeen.has("data:" + name)) return;
        this.extSeen.add("data:" + name);
        this.extData.push(text);
      }
      extensionCode(name, text) {
        if (this.extSeen.has("code:" + name)) return;
        this.extSeen.add("code:" + name);
        this.extCode.push(text);
      }
      extensionSections() {
        if (!this.extData.length && !this.extCode.length) return "";
        const L = [];
        for (const chunk of this.extData) {
          L.push(".data", chunk);
        }
        L.push(".code");
        for (const chunk of this.extCode) L.push(chunk);
        L.push(".code");
        return L.join("\n");
      }
      // Stream 7: checked-arithmetic guards. The tiering maintains the invariant
      // that every value in a register is a safe integer (|v| <= 2^53-1):
      // arguments are marshal-checked, literals are analysis-checked, and every
      // op below traps unless its result is safe. Under that invariant ADD/SUB
      // can never wrap int64 (|a+b| <= 2^54-2 < 2^63), so the safe-range check
      // alone is exact — no overflow flag needed (the assembler has no JO).
      // A trap means "the interpreter computes this in doubles"; the host
      // re-runs the whole call interpreted (exit 42). R11 is the scratch.
      checkedIntResult() {
        this.checkedIntResultReg("RAX");
      }
      checkedIntResultReg(reg) {
        if (!this.checkedArithmetic) return;
        this.emit(`MOV R11, ${MERKAVA_SAFE_INT_MAX}`);
        this.emit(`CMP ${reg}, R11`);
        this.emit(`JG $jsa_bailout_trap`);
        this.emit(`NEG R11`);
        this.emit(`CMP ${reg}, R11`);
        this.emit(`JL $jsa_bailout_trap`);
      }
      // Stream 7: checked multiply. RAX=a, R10=b (safe ints). The 64-bit product
      // can wrap, so it is verified by division: writing p = a*b - k*2^64, if
      // k != 0 then p/a != b or p%a != 0 (since |k*2^64/a| >= 2^11 > 0 and a
      // divides k*2^64 only when the quotient differs). a==0 is exact directly.
      // The IDIV is fault-free: |p| < 2^63, 1 <= |a| <= 2^53. Result in RAX.
      checkedMul() {
        const done = this.lbl("muldone");
        this.emit(`PUSH R10`);
        this.emit(`PUSH RAX`);
        this.emit(`IMUL RAX, R10`);
        this.emit(`MOV R11, RAX`);
        this.emit(`POP RAX`);
        this.emit(`CMP RAX, 0`);
        this.emit(`JE ${done}`);
        this.emit(`MOV R10, R11`);
        this.emit(`MOV R11, RAX`);
        this.emit(`MOV RAX, R10`);
        this.emit(`CQO`);
        this.emit(`IDIV R11`);
        this.emit(`CMP RDX, 0`);
        this.emit(`JNE $jsa_bailout_trap`);
        this.emit(`CMP RAX, QWORD PTR [RSP]`);
        this.emit(`JNE $jsa_bailout_trap`);
        this.emit(`MOV RAX, R10`);
        this.emit(`${done}:`);
        this.emit(`POP R11`);
      }
      // Stream 7: checked division guards. R10 = divisor, RAX = dividend.
      // Traps on division by zero (JS: ±Infinity/NaN) and INT64_MIN / -1 (x86
      // fault; JS: 2^63). Callers add the inexact-division check (RDX != 0).
      emitDivGuards() {
        if (!this.checkedArithmetic) return;
        const ok = this.lbl("divok");
        this.emit(`CMP R10, 0`);
        this.emit(`JZ $jsa_bailout_trap`);
        this.emit(`CMP R10, -1`);
        this.emit(`JNE ${ok}`);
        this.emit(`MOV R11, -9223372036854775808`);
        this.emit(`CMP RAX, R11`);
        this.emit(`JE $jsa_bailout_trap`);
        this.emit(`${ok}:`);
      }
      // Stream 7: ToInt32 mask of RAX (resp. reg): SHL 32 then SAR 32 sign-extends
      // the low 32 bits, exactly JS ToInt32 for safe-integer inputs.
      toInt32RAX() {
        this.emit(`SHL RAX, 32`);
        this.emit(`SAR RAX, 32`);
      }
      emit(s) {
        this.lines.push(s);
      }
      lbl(prefix) {
        return `$jsa_${prefix}_${this.labelN++}`;
      }
      run(program, entry) {
        if (!program || program.type !== "Program") fail("expected Program node");
        const fns = [], rest = [];
        for (const stmt of program.body || []) (stmt.type === "FunctionDeclaration" ? fns : rest).push(stmt);
        let effEntry = entry;
        if (rest.length) {
          if (effEntry) fail("entry provided but program has top-level statements", rest[0]);
          for (const s of rest) if (s.type === "FunctionDeclaration") fail("unreachable", s);
          const bodyStmts = rest.map((s) => {
            if (s.type === "VariableDeclaration" || s.type === "ExpressionStatement" || s.type === "IfStatement" || s.type === "WhileStatement" || s.type === "ForStatement" || s.type === "ReturnStatement" || s.type === "BlockStatement" || s.type === "BreakStatement" || s.type === "ContinueStatement") return s;
            fail(`top-level ${s.type} not supported`, s);
          });
          const last = bodyStmts[bodyStmts.length - 1];
          if (last && last.type === "ExpressionStatement") {
            bodyStmts[bodyStmts.length - 1] = { type: "ReturnStatement", argument: last.expression };
          }
          fns.push({
            type: "FunctionDeclaration",
            id: { type: "Identifier", name: "__merkava_kernel" },
            params: [],
            body: { type: "BlockStatement", body: bodyStmts }
          });
          effEntry = { name: "__merkava_kernel", args: [] };
        }
        if (this.repeatOverride && effEntry) effEntry = { ...effEntry, repeat: this.repeatOverride };
        for (const stmt of fns) {
          if (stmt.type !== "FunctionDeclaration") fail(`top-level ${stmt.type} not supported`, stmt);
          if (!stmt.id || !stmt.id.name) fail("anonymous functions not supported", stmt);
          this.functions.add(stmt.id.name);
        }
        this.emit(`; B"H`);
        this.emit(`.code`);
        this.emit(`start:`);
        this.emit(`CALL main`);
        this.emit(`MOV RDI, RAX`);
        this.emit(`MOV RAX, 60`);
        this.emit(`SYSCALL`);
        for (const stmt of fns) this.functionDecl(stmt);
        this.emit(driverFns(!!(effEntry && effEntry.args === "argv")));
        if (this.checkedArithmetic || this.nativeDepthGuard) {
          this.emit(`$jsa_bailout_trap:`);
          this.emit(`MOV RAX, 60`);
          this.emit(`MOV RDI, ${MERKAVA_BAILOUT_EXIT}`);
          this.emit(`SYSCALL`);
        }
        if (this.nativeDepthGuard) {
          this.emit(`.data`);
          this.emit(`__tier_depth: 0, 0, 0, 0, 0, 0, 0, 0`);
          this.emit(`.code`);
        }
        const extSections = this.extensionSections();
        if (extSections) this.emit(extSections);
        this.emit(mainFn(effEntry, this.functions, { nargs: this.entryNargs }));
        return this.lines.join("\n");
      }
      functionDecl(node) {
        const name = node.id.name;
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) fail(`bad function name '${name}'`, node);
        const params = node.params || [];
        if (params.length > 6) fail("max 6 params supported", node);
        for (const p of params) if (p.type !== "Identifier") fail("only simple params", p);
        const localNames = [];
        const objInits = /* @__PURE__ */ new Map();
        const seen = new Set(params.map((p) => p.name));
        const isObjInit = (d) => d.init && d.init.type === "ObjectExpression";
        const collect = (n2) => {
          if (!n2 || typeof n2.type !== "string") return;
          if (n2.type === "VariableDeclaration") {
            for (const d of n2.declarations) {
              if (d.id.type !== "Identifier") fail("destructuring not supported", d);
              if (!seen.has(d.id.name)) {
                seen.add(d.id.name);
                localNames.push(d.id.name);
                if (isObjInit(d)) {
                  const fields = [];
                  for (const prop of d.init.properties || []) {
                    if (prop.type !== "Property" || prop.computed || prop.key.type !== "Identifier" && prop.key.type !== "Literal")
                      fail("only fixed identifier fields in object literals", prop);
                    const fname = prop.key.type === "Identifier" ? prop.key.name : String(prop.key.value);
                    if (fields.includes(fname)) fail(`duplicate field '${fname}'`, prop);
                    fields.push(fname);
                  }
                  objInits.set(d.id.name, { fields, node: d.init });
                }
              } else if (isObjInit(d)) {
                fail(`object literal re-init of '${d.id.name}' not supported (declare once)`, d);
              }
              if (d.init) collect(d.init);
            }
            return;
          }
          if (n2.type === "FunctionDeclaration") return;
          for (const k of Object.keys(n2)) {
            const v = n2[k];
            if (Array.isArray(v)) v.forEach(collect);
            else if (v && typeof v.type === "string") collect(v);
          }
        };
        collect(node.body);
        this.locals = /* @__PURE__ */ new Map();
        const allNames = [...params.map((p) => p.name), ...localNames];
        let stackBytes = 0;
        let regIdx = 0;
        for (const nm of allNames) {
          const oi = objInits.get(nm);
          if (oi) {
            const fieldOff = {};
            for (const f of oi.fields) {
              stackBytes += 8;
              fieldOff[f] = stackBytes;
            }
            this.locals.set(nm, { obj: true, fieldOff });
            continue;
          }
          if (regIdx < PINNED.length) {
            this.locals.set(nm, { reg: PINNED[regIdx++] });
          } else {
            stackBytes += 8;
            this.locals.set(nm, { stackOff: stackBytes });
          }
        }
        this.stackReserve = stackBytes;
        this.loopStack = [];
        this.objInits = objInits;
        this.emit(`${name}:`);
        this.emit(`PUSH RBP`);
        this.emit(`MOV RBP, RSP`);
        if (this.nativeDepthGuard) {
          this.emit(`MOV R11, QWORD PTR [__tier_depth]`);
          this.emit(`INC R11`);
          this.emit(`CMP R11, 1000`);
          this.emit(`JG $jsa_bailout_trap`);
          this.emit(`MOV QWORD PTR [__tier_depth], R11`);
        }
        const usedPinned = PINNED.slice(0, regIdx);
        for (const r of usedPinned) this.emit(`PUSH ${r}`);
        if (stackBytes) this.emit(`SUB RSP, ${stackBytes}`);
        params.forEach((p, i) => {
          const loc = this.locals.get(p.name);
          if (loc.reg) {
            if (ARG_REGS[i] !== loc.reg) this.emit(`MOV ${loc.reg}, ${ARG_REGS[i]}`);
          } else this.emit(`MOV QWORD PTR [RBP-${loc.stackOff + usedPinned.length * 8}], ${ARG_REGS[i]}`);
        });
        const epilogue = this.lbl("epilogue");
        this.epilogue = epilogue;
        this.pinnedCount = usedPinned.length;
        this.emitBlock(node.body);
        this.emit(`${epilogue}:`);
        if (this.nativeDepthGuard) {
          this.emit(`MOV R11, QWORD PTR [__tier_depth]`);
          this.emit(`DEC R11`);
          this.emit(`MOV QWORD PTR [__tier_depth], R11`);
        }
        if (stackBytes) this.emit(`ADD RSP, ${stackBytes}`);
        for (let i = usedPinned.length - 1; i >= 0; i--) this.emit(`POP ${usedPinned[i]}`);
        this.emit(`MOV RSP, RBP`);
        this.emit(`POP RBP`);
        this.emit(`RET`);
      }
      // frame offset of a stack local, accounting for pushed pinned regs.
      stackAddr(loc) {
        return `QWORD PTR [RBP-${loc.stackOff + this.pinnedCount * 8}]`;
      }
      // address of an object field.
      fieldAddr(loc, field, node) {
        if (!loc.obj) fail(`'${field}' accessed on non-object`, node);
        const off = loc.fieldOff[field];
        if (off === void 0) fail(`unknown field '${field}'`, node);
        return `QWORD PTR [RBP-${off + this.pinnedCount * 8}]`;
      }
      locOf(name, node) {
        const loc = this.locals.get(name);
        if (!loc) fail(`undeclared variable '${name}'`, node);
        return loc;
      }
      emitBlock(node) {
        if (!node || node.type !== "BlockStatement") fail("expected block", node);
        for (const s of node.body || []) this.statement(s);
      }
      stmtInPlace(node) {
        if (node.type === "BlockStatement") {
          this.emitBlock(node);
          return;
        }
        this.statement(node);
      }
      statement(node) {
        switch (node.type) {
          case "VariableDeclaration": {
            for (const d of node.declarations) {
              const loc = this.locOf(d.id.name, d);
              if (d.init) this.initLoc(loc, d.init);
            }
            return;
          }
          case "ExpressionStatement":
            this.exprVoid(node.expression);
            return;
          case "ReturnStatement":
            if (node.argument) this.expr(node.argument);
            else this.emit(`MOV RAX, 0`);
            this.emit(`JMP ${this.epilogue}`);
            return;
          case "IfStatement": {
            const elseLbl = this.lbl("else");
            const endLbl = this.lbl("endif");
            this.condJump(node.test, elseLbl, false);
            this.stmtInPlace(node.consequent);
            if (node.alternate) {
              this.emit(`JMP ${endLbl}`);
              this.emit(`${elseLbl}:`);
              this.stmtInPlace(node.alternate);
              this.emit(`${endLbl}:`);
            } else {
              this.emit(`${elseLbl}:`);
            }
            return;
          }
          case "WhileStatement": {
            const top = this.lbl("while");
            const end = this.lbl("wend");
            this.loopStack.push({ breakLbl: end, contLbl: top });
            this.emit(`${top}:`);
            this.condJump(node.test, end, false);
            this.stmtInPlace(node.body);
            this.emit(`JMP ${top}`);
            this.emit(`${end}:`);
            this.loopStack.pop();
            return;
          }
          case "ForStatement": {
            const top = this.lbl("for");
            const step = this.lbl("fstep");
            const end = this.lbl("fend");
            if (node.init) {
              if (node.init.type === "VariableDeclaration") {
                for (const d of node.init.declarations) {
                  this.initLoc(this.locOf(d.id.name, d), d.init || { type: "Literal", value: 0 });
                }
              } else this.exprVoid(node.init);
            }
            this.loopStack.push({ breakLbl: end, contLbl: step });
            this.emit(`${top}:`);
            if (node.test) this.condJump(node.test, end, false);
            this.stmtInPlace(node.body);
            this.emit(`${step}:`);
            if (node.update) this.exprVoid(node.update);
            this.emit(`JMP ${top}`);
            this.emit(`${end}:`);
            this.loopStack.pop();
            return;
          }
          case "BreakStatement": {
            const l = this.loopStack[this.loopStack.length - 1];
            if (!l) fail("break outside loop", node);
            this.emit(`JMP ${l.breakLbl}`);
            return;
          }
          case "ContinueStatement": {
            const l = this.loopStack[this.loopStack.length - 1];
            if (!l) fail("continue outside loop", node);
            this.emit(`JMP ${l.contLbl}`);
            return;
          }
          case "BlockStatement":
            this.emitBlock(node);
            return;
          default:
            fail(`statement ${node.type} not supported`, node);
        }
      }
      storeLoc(loc) {
        if (loc.obj) fail("cannot store a scalar into an object local (assign obj.field instead)");
        if (loc.reg) this.emit(`MOV ${loc.reg}, RAX`);
        else this.emit(`MOV ${this.stackAddr(loc)}, RAX`);
      }
      // Shared init: literal fast path; object literals fill fixed field slots.
      initLoc(loc, initNode) {
        if (loc.obj) {
          if (!initNode || initNode.type !== "ObjectExpression")
            fail("object local requires an object literal initializer", initNode);
          for (const prop of initNode.properties || []) {
            const fname = prop.key.type === "Identifier" ? prop.key.name : String(prop.key.value);
            this.expr(prop.value);
            this.emit(`MOV ${this.fieldAddr(loc, fname, prop)}, RAX`);
          }
          return;
        }
        if (initNode.type === "Literal" && typeof initNode.value === "number" && Number.isInteger(initNode.value)) {
          const bi = BigInt(initNode.value);
          if (bi < INT64_MIN || bi > INT64_MAX) fail(`literal out of int64 range`, initNode);
          const fits32 = bi >= -2147483648n && bi <= 2147483647n;
          if (loc.reg) {
            this.emit(`MOV ${loc.reg}, ${initNode.value}`);
            return;
          }
          if (fits32) {
            this.emit(`MOV ${this.stackAddr(loc)}, ${initNode.value}`);
            return;
          }
        }
        this.expr(initNode);
        this.storeLoc(loc);
      }
      loadLoc(loc) {
        if (loc.obj) fail("cannot load an object local as a scalar (use obj.field)");
        if (loc.reg) {
          if (loc.reg !== "RAX") this.emit(`MOV RAX, ${loc.reg}`);
        } else this.emit(`MOV RAX, ${this.stackAddr(loc)}`);
      }
      // Simple operand: returns asm text (register name or immediate) or null.
      // Immediates are only offered when they fit signed 32-bit (x86 CMP/arithmetic
      // cannot encode imm64; larger constants go through MOV+register).
      simpleOperand(node) {
        if (node.type === "Literal" && typeof node.value === "number" && Number.isInteger(node.value)) {
          const bi = BigInt(node.value);
          if (bi >= INT64_MIN && bi <= INT64_MAX) {
            const fits32 = bi >= -2147483648n && bi <= 2147483647n;
            return { text: String(node.value), isImm: true, immFits32: fits32, value: bi };
          }
          return null;
        }
        if (node.type === "Identifier") {
          const loc = this.locals.get(node.name);
          if (loc && !loc.obj && loc.reg) return { text: loc.reg, isImm: false, immFits32: false, value: null };
        }
        return null;
      }
      // Compile condition; jump to lbl when the condition is (wantTrue? true : false).
      // Fuses comparisons directly into jumps — no boolean materialization.
      condJump(node, lbl, wantTrue) {
        if (node.type === "BinaryExpression" && CMP_OPS[node.operator]) {
          const info = CMP_OPS[node.operator];
          const l = this.simpleOperand(node.left), r = this.simpleOperand(node.right);
          if (l && r && !(l.isImm && r.isImm) && (!l.isImm || l.immFits32) && (!r.isImm || r.immFits32)) {
            if (!l.isImm) this.emit(`CMP ${l.text}, ${r.text}`);
            else {
              const flip = { "<": ">", "<=": ">=", ">": "<", ">=": "<=", "==": "==", "!=": "!=" };
              const finfo = CMP_OPS[flip[node.operator]];
              this.emit(`CMP ${r.text}, ${l.text}`);
              this.emit(`${wantTrue ? finfo.jt : finfo.jf} ${lbl}`);
              return;
            }
            this.emit(`${wantTrue ? info.jt : info.jf} ${lbl}`);
            return;
          }
          this.expr(node.left);
          this.emit(`PUSH RAX`);
          this.expr(node.right);
          this.emit(`MOV R10, RAX`);
          this.emit(`POP RAX`);
          this.emit(`CMP RAX, R10`);
          this.emit(`${wantTrue ? info.jt : info.jf} ${lbl}`);
          return;
        }
        if (node.type === "UnaryExpression" && node.operator === "!") {
          this.condJump(node.argument, lbl, !wantTrue);
          return;
        }
        this.expr(node);
        this.emit(`TEST RAX, RAX`);
        this.emit(`${wantTrue ? "JNZ" : "JZ"} ${lbl}`);
      }
      // Expression in void context (value discarded): skips dead value copies.
      exprVoid(node) {
        if (node.type === "UpdateExpression" && (node.operator === "++" || node.operator === "--")) {
          const desc = this.lvalue(node.argument);
          const ins = node.operator === "++" ? "INC" : "DEC";
          if (desc.kind === "local" && desc.loc.reg) {
            this.emit(`${ins} ${desc.loc.reg}`);
            this.checkedIntResultReg(desc.loc.reg);
          } else {
            this.loadDesc(desc, node.argument);
            this.emit(`${ins} RAX`);
            this.checkedIntResult();
            this.storeDesc(desc);
          }
          return;
        }
        if (node.type === "AssignmentExpression") {
          const desc = this.lvalue(node.left);
          if (node.operator === "=") {
            this.expr(node.right);
            this.storeDesc(desc);
            return;
          }
          this.compoundAssign(desc, node.operator.slice(0, -1), node.right, false, node);
          return;
        }
        this.expr(node);
      }
      // True if the expression tree contains any call (arg registers unsafe
      // for direct MOV: a nested call would clobber RDI/RSI/... mid-sequence).
      hasCall(node) {
        if (!node || typeof node.type !== "string") return false;
        if (node.type === "CallExpression") return true;
        return Object.keys(node).some((k) => {
          const v = node[k];
          if (Array.isArray(v)) return v.some((x) => x && typeof x.type === "string" && this.hasCall(x));
          return v && typeof v.type === "string" && this.hasCall(v);
        });
      }
      // Compile expression, result in RAX. R10/R11 scratch (dead across calls
      // by construction: live only inside one binary-op evaluation).
      expr(node) {
        switch (node.type) {
          case "Literal": {
            if (this.extensionHook("literal", node)) return;
            if (typeof node.value !== "number" || !Number.isInteger(node.value))
              fail(`only integer literals, got ${JSON.stringify(node.value)}`, node);
            const bi = BigInt(node.value);
            if (bi < INT64_MIN || bi > INT64_MAX) fail(`literal out of int64 range`, node);
            this.emit(`MOV RAX, ${node.value}`);
            return;
          }
          case "Identifier":
            this.loadLoc(this.locOf(node.name, node));
            return;
          case "MemberExpression": {
            if (this.extensionHook("member", node)) return;
            if (node.computed || node.object.type !== "Identifier" || node.property.type !== "Identifier")
              fail("only obj.field access supported", node);
            const oloc = this.locOf(node.object.name, node.object);
            this.emit(`MOV RAX, ${this.fieldAddr(oloc, node.property.name, node)}`);
            return;
          }
          case "BinaryExpression":
            this.binary(node);
            return;
          case "AssignmentExpression": {
            const op = node.operator;
            if (!["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", "&=", "|=", "^="].includes(op))
              fail(`assignment operator ${op} not supported`, node);
            const desc = this.lvalue(node.left);
            if (op === "=") {
              this.expr(node.right);
              this.storeDesc(desc);
              return;
            }
            this.compoundAssign(desc, op.slice(0, -1), node.right, true, node);
            return;
          }
          case "UpdateExpression": {
            const desc = this.lvalue(node.argument);
            const delta = node.operator === "++" ? 1 : node.operator === "--" ? -1 : fail(`bad update`, node);
            const ins = delta === 1 ? "INC" : "DEC";
            if (desc.kind === "local" && desc.loc.reg) {
              const r = desc.loc.reg;
              if (node.prefix) {
                this.emit(`${ins} ${r}`);
                this.checkedIntResultReg(r);
                if (r !== "RAX") this.emit(`MOV RAX, ${r}`);
              } else {
                if (r !== "RAX") this.emit(`MOV RAX, ${r}`);
                this.emit(`${ins} ${r}`);
                this.checkedIntResultReg(r);
              }
            } else {
              this.loadDesc(desc, node.argument);
              if (!node.prefix) this.emit(`PUSH RAX`);
              this.emit(delta === 1 ? `INC RAX` : `DEC RAX`);
              this.checkedIntResult();
              this.storeDesc(desc);
              if (!node.prefix) this.emit(`POP RAX`);
            }
            return;
          }
          case "UnaryExpression": {
            const op = node.operator;
            if (op === "-") {
              this.expr(node.argument);
              this.emit(`NEG RAX`);
              return;
            }
            if (op === "+") {
              this.expr(node.argument);
              return;
            }
            if (op === "~") {
              this.expr(node.argument);
              this.emit(`NOT RAX`);
              return;
            }
            if (op === "!") {
              this.expr(node.argument);
              this.emit(`TEST RAX, RAX`);
              this.emit(`SETZ AL`);
              this.emit(`MOVZX RAX, AL`);
              return;
            }
            fail(`unary ${op} not supported`, node);
          }
          case "CallExpression": {
            if (this.extensionHook("call", node)) return;
            if (node.callee.type !== "Identifier") fail("only direct calls", node);
            const nm = node.callee.name;
            if (!this.functions.has(nm)) fail(`call to undeclared '${nm}'`, node);
            const args = node.arguments || [];
            if (args.length > 6) fail("max 6 call args", node);
            if (args.some((a) => this.hasCall(a))) {
              for (const a of args) {
                this.expr(a);
                this.emit(`PUSH RAX`);
              }
              for (let i = args.length - 1; i >= 0; i--) this.emit(`POP ${ARG_REGS[i]}`);
            } else {
              for (let i = 0; i < args.length; i++) {
                this.expr(args[i]);
                if (ARG_REGS[i] !== "RAX") this.emit(`MOV ${ARG_REGS[i]}, RAX`);
              }
            }
            this.emit(`CALL ${nm}`);
            return;
          }
          case "ConditionalExpression": {
            const elseLbl = this.lbl("celse");
            const endLbl = this.lbl("cend");
            this.condJump(node.test, elseLbl, false);
            this.expr(node.consequent);
            this.emit(`JMP ${endLbl}`);
            this.emit(`${elseLbl}:`);
            this.expr(node.alternate);
            this.emit(`${endLbl}:`);
            return;
          }
          default:
            fail(`expression ${node.type} not supported`, node);
        }
      }
      lvalue(node) {
        if (node.type === "Identifier") return { kind: "local", loc: this.locOf(node.name, node) };
        if (node.type === "MemberExpression" && !node.computed && node.object.type === "Identifier" && node.property.type === "Identifier") {
          const loc = this.locOf(node.object.name, node.object);
          if (!loc.obj) fail(`property access on non-object '${node.object.name}'`, node);
          const field = node.property.name;
          if (loc.fieldOff[field] === void 0) fail(`unknown field '${field}'`, node);
          return { kind: "field", loc, field };
        }
        fail("only identifier and obj.field lvalues supported", node);
      }
      storeDesc(desc) {
        if (desc.kind === "local") {
          this.storeLoc(desc.loc);
          return;
        }
        this.emit(`MOV ${this.fieldAddr(desc.loc, desc.field)}, RAX`);
      }
      loadDesc(desc, node) {
        if (desc.kind === "local") {
          this.loadLoc(desc.loc);
          return;
        }
        this.emit(`MOV RAX, ${this.fieldAddr(desc.loc, desc.field, node)}`);
      }
      // RAX = n (signed 64) on entry; RAX = n % d on exit. d > 0, fits 32 bits.
      // Barrett reduction: q = mulhi(|n|, μ), r = |n| - q*d, correct by loop.
      // μ = floor(2^64/d). Branchless abs via sign mask; no IDIV (~10cy vs ~30).
      barrettMod(d) {
        const mu = (1n << 64n) / BigInt(d);
        const corr = this.lbl("bcorr"), cdone = this.lbl("bcdone");
        this.emit(`MOV R11, RAX`);
        this.emit(`SAR R11, 63`);
        this.emit(`XOR RAX, R11`);
        this.emit(`SUB RAX, R11`);
        this.emit(`PUSH RAX`);
        this.emit(`MOV R10, ${mu}`);
        this.emit(`MUL R10`);
        this.emit(`IMUL R10, RDX, ${d}`);
        this.emit(`POP RAX`);
        this.emit(`SUB RAX, R10`);
        this.emit(`${corr}:`);
        this.emit(`CMP RAX, ${d}`);
        this.emit(`JL ${cdone}`);
        this.emit(`SUB RAX, ${d}`);
        this.emit(`JMP ${corr}`);
        this.emit(`${cdone}:`);
        this.emit(`XOR RAX, R11`);
        this.emit(`SUB RAX, R11`);
      }
      // RAX = left, R10 = right on entry; result in RAX.
      // Stream 7: in checked mode, integer ops trap on overflow/unsafe results,
      // division traps on zero / INT64_MIN/-1 / inexact, and bitwise ops apply
      // JS ToInt32 semantics to both operands first.
      arithOp(op, node) {
        const ck = this.checkedArithmetic;
        const ckBit = ck && (op === "&" || op === "|" || op === "^");
        switch (op) {
          case "+":
            this.emit(`ADD RAX, R10`);
            this.checkedIntResult();
            return;
          case "-":
            this.emit(`SUB RAX, R10`);
            this.checkedIntResult();
            return;
          case "*":
            if (ck) {
              this.checkedMul();
              this.checkedIntResult();
            } else this.emit(`IMUL RAX, R10`);
            return;
          case "/":
            this.emitDivGuards();
            this.emit(`CQO`);
            this.emit(`IDIV R10`);
            if (ck) {
              this.emit(`CMP RDX, 0`);
              this.emit(`JNE $jsa_bailout_trap`);
            }
            return;
          case "%":
            this.emitDivGuards();
            this.emit(`CQO`);
            this.emit(`IDIV R10`);
            this.emit(`MOV RAX, RDX`);
            return;
          case "&":
          case "|":
          case "^": {
            if (ckBit) {
              this.emit(`SHL RAX, 32`);
              this.emit(`SAR RAX, 32`);
              this.emit(`SHL R10, 32`);
              this.emit(`SAR R10, 32`);
            }
            this.emit(`${{ "&": "AND", "|": "OR", "^": "XOR" }[op]} RAX, R10`);
            return;
          }
          case "<<":
          case ">>":
          case ">>>":
            fail(`variable ${op} not supported in v1 (use constant shift)`, node);
          default:
            fail(`arith op ${op}`, node);
        }
      }
      // Compound assignment core. wantValue=false skips materializing the
      // assignment value in RAX (void context).
      compoundAssign(desc, aop, rhsNode, wantValue, node) {
        const loc = desc.kind === "local" ? desc.loc : null;
        if (loc && loc.reg) {
          if (aop === "/" || aop === "%") {
            if (aop === "%" && rhsNode.type === "Literal" && typeof rhsNode.value === "number" && Number.isInteger(rhsNode.value) && rhsNode.value !== 0) {
              const d = BigInt(rhsNode.value < 0 ? -rhsNode.value : rhsNode.value);
              if (d === 1n) {
                this.emit(`MOV ${loc.reg}, 0`);
                if (wantValue) this.emit(`XOR RAX, RAX`);
                return;
              }
              if (d <= 2147483647n) {
                this.emit(`MOV RAX, ${loc.reg}`);
                this.barrettMod(d);
                this.emit(`MOV ${loc.reg}, RAX`);
                return;
              }
            }
            this.expr(rhsNode);
            this.emit(`MOV R10, RAX`);
            this.emit(`MOV RAX, ${loc.reg}`);
            this.emitDivGuards();
            this.emit(`CQO`);
            this.emit(`IDIV R10`);
            if (aop === "/" && this.checkedArithmetic) {
              this.emit(`CMP RDX, 0`);
              this.emit(`JNE $jsa_bailout_trap`);
            } else if (aop === "%") this.emit(`MOV RAX, RDX`);
            this.emit(`MOV ${loc.reg}, RAX`);
            return;
          }
          if ((aop === "<<" || aop === ">>" || aop === ">>>") && rhsNode.type === "Literal" && Number.isInteger(rhsNode.value)) {
            const ck = this.checkedArithmetic;
            const n2 = ck ? (rhsNode.value % 32 + 32) % 32 : (rhsNode.value % 64 + 64) % 64;
            if (ck) {
              this.emit(`SHL ${loc.reg}, 32`);
              this.emit(`SAR ${loc.reg}, 32`);
            }
            if (aop === "<<") {
              this.emit(`SHL ${loc.reg}, ${n2}`);
              if (ck) {
                this.emit(`SHL ${loc.reg}, 32`);
                this.emit(`SAR ${loc.reg}, 32`);
              }
            } else if (aop === ">>") this.emit(`SAR ${loc.reg}, ${n2}`);
            else {
              this.emit(`AND ${loc.reg}, 4294967295`);
              this.emit(`SAR ${loc.reg}, ${n2}`);
            }
            if (wantValue) this.emit(`MOV RAX, ${loc.reg}`);
            return;
          }
          if (["+", "-", "*", "&", "|", "^"].includes(aop)) {
            const ck = this.checkedArithmetic;
            const ckBit = ck && (aop === "&" || aop === "|" || aop === "^");
            this.expr(rhsNode);
            if (ckBit) {
              this.emit(`SHL ${loc.reg}, 32`);
              this.emit(`SAR ${loc.reg}, 32`);
              this.emit(`SHL RAX, 32`);
              this.emit(`SAR RAX, 32`);
            }
            if (ck && aop === "*") {
              this.emit(`MOV R10, RAX`);
              this.emit(`MOV RAX, ${loc.reg}`);
              this.checkedMul();
              this.checkedIntResult();
              this.emit(`MOV ${loc.reg}, RAX`);
            } else {
              const mop = { "+": "ADD", "-": "SUB", "*": "IMUL", "&": "AND", "|": "OR", "^": "XOR" }[aop];
              this.emit(`${mop} ${loc.reg}, RAX`);
              if (ck && (aop === "+" || aop === "-")) this.checkedIntResultReg(loc.reg);
            }
            if (wantValue) this.emit(`MOV RAX, ${loc.reg}`);
            return;
          }
          fail(`compound ${aop}= with register lhs not supported`, node);
        }
        this.loadDesc(desc, node);
        this.emit(`PUSH RAX`);
        this.expr(rhsNode);
        this.emit(`MOV R10, RAX`);
        this.emit(`POP RAX`);
        this.arithOp(aop, node);
        this.storeDesc(desc);
      }
      binary(node) {
        const op = node.operator;
        if (this.extensionHook("binary", node)) return;
        if (CMP_OPS[op]) {
          const info = CMP_OPS[op];
          const l2 = this.simpleOperand(node.left), r2 = this.simpleOperand(node.right);
          if (l2 && r2 && !(l2.isImm && r2.isImm) && (!l2.isImm || l2.immFits32) && (!r2.isImm || r2.immFits32)) {
            if (!l2.isImm) {
              this.emit(`CMP ${l2.text}, ${r2.text}`);
              this.emit(`${info.set} AL`);
            } else {
              const flip = { "<": ">", "<=": ">=", ">": "<", ">=": "<=", "==": "==", "!=": "!=" };
              const finfo = CMP_OPS[flip[op]];
              this.emit(`CMP ${r2.text}, ${l2.text}`);
              this.emit(`${finfo.set} AL`);
            }
            this.emit(`MOVZX RAX, AL`);
            return;
          }
          this.expr(node.left);
          this.emit(`PUSH RAX`);
          this.expr(node.right);
          this.emit(`MOV R10, RAX`);
          this.emit(`POP RAX`);
          this.emit(`CMP RAX, R10`);
          this.emit(`${info.set} AL`);
          this.emit(`MOVZX RAX, AL`);
          return;
        }
        if (op === "&&" || op === "||") {
          const end = this.lbl("logic");
          this.expr(node.left);
          this.emit(`TEST RAX, RAX`);
          this.emit(`${op === "&&" ? "JZ" : "JNZ"} ${end}`);
          this.expr(node.right);
          this.emit(`${end}:`);
          return;
        }
        if ((op === "<<" || op === ">>" || op === ">>>") && node.right.type === "Literal" && Number.isInteger(node.right.value)) {
          const ck = this.checkedArithmetic;
          const n2 = ck ? (node.right.value % 32 + 32) % 32 : (node.right.value % 64 + 64) % 64;
          this.expr(node.left);
          if (ck) this.toInt32RAX();
          if (op === "<<") {
            this.emit(`SHL RAX, ${n2}`);
            if (ck) {
              this.emit(`SHL RAX, 32`);
              this.emit(`SAR RAX, 32`);
            }
          } else if (op === ">>") this.emit(`SAR RAX, ${n2}`);
          else {
            this.emit(`AND RAX, 4294967295`);
            this.emit(`SAR RAX, ${n2}`);
          }
          return;
        }
        const MOP = { "+": "ADD", "-": "SUB", "*": "IMUL", "&": "AND", "|": "OR", "^": "XOR" };
        const l = this.simpleOperand(node.left), r = this.simpleOperand(node.right);
        const immOk = (o) => !o.isImm || o.immFits32;
        if (!this.checkedArithmetic && (op === "+" || op === "-" && node.left.type === "BinaryExpression" && node.left.operator === "*")) {
          const mulNode = op === "+" ? node.left.type === "BinaryExpression" && node.left.operator === "*" ? node.left : node.right.type === "BinaryExpression" && node.right.operator === "*" ? node.right : null : node.left;
          const kNode = mulNode === node.left ? node.right : node.left;
          if (mulNode && kNode.type === "Literal" && Number.isInteger(kNode.value)) {
            const ml = this.simpleOperand(mulNode.left), mr = this.simpleOperand(mulNode.right);
            const regOp = ml && !ml.isImm ? ml : mr && !mr.isImm ? mr : null;
            const cOp = ml && ml.isImm ? ml : mr && mr.isImm ? mr : null;
            if (regOp && cOp && cOp.value > 0n) {
              const C = Number(cOp.value);
              let K = BigInt(kNode.value);
              if (op === "-") K = -K;
              if (K >= -2147483648n && K <= 2147483647n && [3, 5, 9].includes(C)) {
                const R = regOp.text, ks = K >= 0n ? `+${K}` : `${K}`;
                const mem = C === 3 ? `[${R}+${R}*2${ks}]` : C === 5 ? `[${R}+${R}*4${ks}]` : `[${R}+${R}*8${ks}]`;
                this.emit(`LEA RAX, ${mem}`);
                return;
              }
            }
          }
        }
        if (op === "%" && r && r.isImm && r.value !== 0n) {
          const d = r.value < 0n ? -r.value : r.value;
          if (d === 1n) {
            this.expr(node.left);
            this.emit(`XOR RAX, RAX`);
            return;
          }
          if (d <= 2147483647n) {
            this.expr(node.left);
            this.barrettMod(d);
            return;
          }
        }
        const ckBit = this.checkedArithmetic && (op === "&" || op === "|" || op === "^");
        const ckMul = this.checkedArithmetic && op === "*";
        if (r && immOk(r) && MOP[op] && !ckBit && !ckMul) {
          this.expr(node.left);
          this.emit(`${MOP[op]} RAX, ${r.text}`);
          if (this.checkedArithmetic) this.checkedIntResult();
          return;
        }
        if (l && immOk(l) && ["+", "*", "&", "|", "^"].includes(op) && !ckBit && !ckMul) {
          this.expr(node.right);
          this.emit(`${MOP[op]} RAX, ${l.text}`);
          if (this.checkedArithmetic) this.checkedIntResult();
          return;
        }
        if (l && !l.isImm && (op === "-" || op === "/" || op === "%")) {
          this.expr(node.right);
          this.emit(`MOV R10, RAX`);
          this.emit(`MOV RAX, ${l.text}`);
          if (op === "-") {
            this.emit(`SUB RAX, R10`);
            this.checkedIntResult();
          } else {
            this.emitDivGuards();
            this.emit(`CQO`);
            this.emit(`IDIV R10`);
            if (op === "/" && this.checkedArithmetic) {
              this.emit(`CMP RDX, 0`);
              this.emit(`JNE $jsa_bailout_trap`);
            } else if (op === "%") this.emit(`MOV RAX, RDX`);
          }
          return;
        }
        if ((op === "/" || op === "%") && r && r.isImm && r.immFits32) {
          this.expr(node.left);
          this.emit(`MOV R10, ${r.text}`);
          this.arithOp(op, node);
          return;
        }
        this.expr(node.left);
        this.emit(`PUSH RAX`);
        this.expr(node.right);
        this.emit(`MOV R10, RAX`);
        this.emit(`POP RAX`);
        this.arithOp(op, node);
      }
    };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js
var require_DefaultMerkavaHost = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js"(exports2, module2) {
    var { installCompactClasses, newCompactInstance, callCompactMethod } = require_CompactClassRuntime();
    var { execFileSync } = require("child_process");
    function createDefaultHost2(rootScope = {}) {
      const MAX_DEPTH = Number(rootScope.__merkavaMaxDepth || 900);
      const MAX_STEPS = Number(rootScope.__merkavaMaxSteps || 24e4);
      const MAX_LOOP = Number(rootScope.__merkavaMaxLoop || 1e8);
      let stepCount = 0;
      const trace = [];
      const hasOwn = Object.prototype.hasOwnProperty;
      const RETURN = /* @__PURE__ */ Symbol("merkavaReturn");
      const isReturn = (value) => value && value.__signal === RETURN;
      const makeReturn = (value) => ({ __signal: RETURN, value });
      const defineClass = (desc, superClass = null, closure = {}) => {
        const klassClosure = Object.assign(/* @__PURE__ */ Object.create(null), rootScope, closure || {});
        const klass = { __kind: "class", name: desc.name || "", prototype: {}, methods: [], fields: desc.fields || [], superClass, closure: klassClosure };
        const fnDescOf = (m) => ({ op: "function", name: m.name, params: m.params || [], body: m.body && m.body.op === "block" && Array.isArray(m.body.body) ? m.body.body : m.body, arrow: false });
        for (const m of desc.methods || []) {
          if (m.static) {
            if (m.kind === "get") defineAccessor(klass, m.name, { getter: fnDescOf(m) }, klassClosure);
            else if (m.kind === "set") defineAccessor(klass, m.name, { setter: fnDescOf(m) }, klassClosure);
            else klass[m.name] = interpretNode(fnDescOf(m), klassClosure);
          } else if (m.kind === "get") {
            const cur = Object.getOwnPropertyDescriptor(klass.prototype, m.name);
            const d = cur || { enumerable: false, configurable: true };
            const g = interpretNode(fnDescOf(m), klassClosure);
            d.get = function() {
              return g.call([], this);
            };
            Object.defineProperty(klass.prototype, m.name, d);
          } else if (m.kind === "set") {
            const cur = Object.getOwnPropertyDescriptor(klass.prototype, m.name);
            const d = cur || { enumerable: false, configurable: true };
            const s = interpretNode(fnDescOf(m), klassClosure);
            d.set = function(v) {
              s.call([v], this);
            };
            Object.defineProperty(klass.prototype, m.name, d);
          } else {
            klass.methods.push(m);
          }
        }
        if (klass.methods.length > 0) {
          const methodMap = /* @__PURE__ */ new Map();
          for (const m of klass.methods) {
            if (m && m.name !== void 0 && !methodMap.has(m.name)) methodMap.set(m.name, { ...m, owner: klass });
          }
          klass._methodMap = methodMap;
        }
        return klass;
      };
      const traceLabels = () => {
        const out = new Array(trace.length);
        for (let i = 0; i < trace.length; i++) out[i] = nodeLabel(trace[i]);
        return out;
      };
      const makeVmError = (message) => {
        const labels = traceLabels();
        const error = new Error(`${message} | trace=${labels.slice(-18).join(" > ")}`);
        error.code = "MERKAVA_VM_INTERPRETER_GUARD";
        error.trace = labels.slice(-80);
        return error;
      };
      const findMethod = (klass, name) => {
        if (!klass) return null;
        if (klass.prototype && klass.prototype[name]?.__kind === "function") {
          return { __patchedFn: klass.prototype[name], owner: klass };
        }
        if (klass._methodMap) {
          const found = klass._methodMap.get(name);
          if (found !== void 0) return found;
        } else {
          const method = (klass.methods || []).find((m) => m.name === name);
          if (method) return { ...method, owner: klass };
        }
        return findMethod(klass.superClass, name);
      };
      const newInstance = (klass, args = []) => {
        if (!klass) throw new TypeError("undefined is not a constructor");
        if (!klass) throw new TypeError("undefined is not a constructor");
        const instance = Object.create(klass.prototype || null);
        instance.__kind = "instance";
        instance.__class = klass;
        instance.fields = {};
        for (const field of klass.fields || []) instance[field.name] = interpretNode(field.value, Object.assign(Object.create(klass.closure || null), { this: instance }));
        for (const field of klass.fields || []) instance[field.name] = interpretNode(field.value, Object.assign(Object.create(klass.closure || null), { this: instance }));
        const ctor = findMethod(klass, "constructor");
        if (ctor) {
          const scope = Object.assign(Object.create(ctor.owner.closure || null), { this: instance, arguments: args, __class: ctor.owner });
          bindParams(scope, ctor.params || [], args);
          interpretNode(ctor.body, scope);
        }
        return instance;
      };
      const makeSyncPromise = (value) => ({ __kind: "syncPromise", value, then(fn) {
        return makeSyncPromise(callFunction(fn, value));
      }, catch() {
        return this;
      } });
      const unwrapPromiseValue = (value) => value && value.__kind === "syncPromise" ? value.value : value;
      const nativePromise = { resolve: (value) => makeSyncPromise(value), reject: (reason) => {
        throw reason;
      }, all: (values) => makeSyncPromise(Array.from(values || []).map(unwrapPromiseValue)), race: (values) => makeSyncPromise(Array.from(values || []).map(unwrapPromiseValue)[0]) };
      const bindParams = (scope, params = [], args = []) => {
        let argIndex = 0;
        for (const param of params || []) {
          if (param && typeof param === "object" && param.rest) scope[param.rest] = args.slice(argIndex);
          else if (param && typeof param === "object" && param.name) {
            const value = args[argIndex++];
            scope[param.name] = value === void 0 ? interpretNode(param.default, scope) : value;
          } else scope[param] = args[argIndex++];
        }
      };
      const writeHolder = (scope, key) => {
        let cursor = scope;
        while (cursor && cursor !== Object.prototype) {
          if (hasOwn.call(cursor, key)) return cursor;
          cursor = Object.getPrototypeOf(cursor);
        }
        return scope;
      };
      const read = (name, scope = {}, site = null) => {
        const key = typeof name === "string" ? name : typeof name === "symbol" ? name : String(name);
        if (site) {
          const rs = site._rIC;
          if (rs !== void 0) {
            if (rs === scope) return scope[key];
            site._rIC = void 0;
            site._rCand = scope;
          } else if (site._rCand === scope) {
            if (scope && key in scope) site._rIC = scope;
          } else {
            site._rCand = scope;
          }
        }
        if (scope && key in scope) return scope[key];
        if (hasOwn.call(rootScope, key)) return rootScope[key];
        if (key === "undefined") return void 0;
        if (key === "Promise") return nativePromise;
        if (hasOwn.call(globalThis, key)) return globalThis[key];
        throw new ReferenceError(String(key) + " is not defined");
      };
      const write = (name, value, scope = {}, site = null) => {
        const key = typeof name === "string" ? name : String(name);
        if (site) {
          const wic = site._wIC;
          if (wic !== void 0) {
            if (wic.s === scope) {
              wic.h[key] = value;
              return value;
            }
            site._wIC = void 0;
            site._wCand = scope;
          } else if (site._wCand === scope) {
            const h2 = writeHolder(scope, key);
            site._wIC = { s: scope, h: h2 };
            h2[key] = value;
            return value;
          } else {
            site._wCand = scope;
          }
        }
        const h = writeHolder(scope, key);
        h[key] = value;
        return value;
      };
      const nodeLabel = (node) => {
        if (node == null) return "null";
        if (typeof node !== "object") return typeof node;
        if (node.op) return `op:${node.op}`;
        if (node.get) return `get:${String(node.get).slice(0, 40)}`;
        if (hasOwn.call(node, "const")) return "const";
        return "object-node";
      };
      const evalBlock = (body = [], scope = {}) => {
        let value;
        for (const step of body) {
          if (step?.op === "return") return makeReturn(interpretNode(step.value, scope));
          value = interpretNode(step, scope);
          if (isReturn(value)) return value;
        }
        return value;
      };
      const spreadFlat = (flat) => {
        const out = [];
        for (let i = 0; i < flat.length; ) {
          if (flat[i++] === true) out.push(...Array.from(flat[i++] || []));
          else out.push(flat[i++]);
        }
        return out;
      };
      const interpretNode = (node, scope = {}, depth = 0) => {
        stepCount += 1;
        if (stepCount > MAX_STEPS) throw makeVmError("Merkava interpreter step budget exceeded at " + nodeLabel(node));
        if (depth > MAX_DEPTH) throw makeVmError(`Merkava interpreter depth exceeded at ${nodeLabel(node)}`);
        trace.push(node);
        try {
          if (node == null) return null;
          if (typeof node !== "object") return node;
          if (hasOwn.call(node, "const")) return node.const;
          if (node.get) return read(node.get, scope, node);
          if (node.op === "set") return write(node.name, interpretNode(node.value, scope, depth + 1), scope, node);
          if (node.op === "declare") {
            const v = interpretNode(node.value, scope, depth + 1);
            scope[node.name] = v;
            return v;
          }
          if (node.op === "postUpdate") {
            const old = read(node.name, scope, node);
            write(node.name, old + node.delta.const, scope, node);
            return old;
          }
          if (node.op === "add") return interpretNode(node.args[0], scope, depth + 1) + interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "sub") return interpretNode(node.args[0], scope, depth + 1) - interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "mul") return interpretNode(node.args[0], scope, depth + 1) * interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "div") return interpretNode(node.args[0], scope, depth + 1) / interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "mod") return interpretNode(node.args[0], scope, depth + 1) % interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "pow") return Math.pow(interpretNode(node.args[0], scope, depth + 1), interpretNode(node.args[1], scope, depth + 1));
          if (node.op === "band") return interpretNode(node.args[0], scope, depth + 1) & interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "bor") return interpretNode(node.args[0], scope, depth + 1) | interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "bxor") return interpretNode(node.args[0], scope, depth + 1) ^ interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "shl") return interpretNode(node.args[0], scope, depth + 1) << interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "shr") return interpretNode(node.args[0], scope, depth + 1) >> interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "ushr") return interpretNode(node.args[0], scope, depth + 1) >>> interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "bitnot") return ~interpretNode(node.value, scope, depth + 1);
          if (node.op === "deleteProp") {
            const target = interpretNode(node.object, scope, depth + 1);
            const key = interpretNode(node.prop, scope, depth + 1);
            if (target == null) throw new TypeError("Cannot convert undefined or null to object");
            return delete target[key];
          }
          if (node.op === "in") return interpretNode(node.args[0], scope, depth + 1) in Object(interpretNode(node.args[1], scope, depth + 1));
          if (node.op === "nullish") {
            const a = interpretNode(node.args[0], scope, depth + 1);
            return a != null ? a : interpretNode(node.args[1], scope, depth + 1);
          }
          if (node.op === "arraySpread") {
            const out = [];
            const parts = node.parts || [];
            for (let i = 0; i < parts.length; ) {
              const isSpread = interpretNode(parts[i++], scope, depth + 1);
              const val = interpretNode(parts[i++], scope, depth + 1);
              if (isSpread) out.push(...Array.from(val || []));
              else out.push(val);
            }
            return out;
          }
          if (node.op === "spreadCall" || node.op === "spreadCallMethod") {
            const args = [];
            const parts = node.parts || [];
            for (let i = 0; i < parts.length; ) {
              const isSpread = interpretNode(parts[i++], scope, depth + 1);
              const val = interpretNode(parts[i++], scope, depth + 1);
              if (isSpread) args.push(...Array.from(val || []));
              else args.push(val);
            }
            if (node.op === "spreadCall") return callFunction(interpretNode(node.fn, scope, depth + 1), ...args);
            return callMethod(interpretNode(node.object, scope, depth + 1), node.method, ...args);
          }
          if (node.op === "eq") return interpretNode(node.args[0], scope, depth + 1) == interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "seq") return interpretNode(node.args[0], scope, depth + 1) === interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "neq") return interpretNode(node.args[0], scope, depth + 1) != interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "sneq") return interpretNode(node.args[0], scope, depth + 1) !== interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "lt") return interpretNode(node.args[0], scope, depth + 1) < interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "lte") return interpretNode(node.args[0], scope, depth + 1) <= interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "gt") return interpretNode(node.args[0], scope, depth + 1) > interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "gte") return interpretNode(node.args[0], scope, depth + 1) >= interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "and") return interpretNode(node.args[0], scope, depth + 1) && interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "or") return interpretNode(node.args[0], scope, depth + 1) || interpretNode(node.args[1], scope, depth + 1);
          if (node.op === "not") return !interpretNode(node.value, scope, depth + 1);
          if (node.op === "neg") return -interpretNode(node.value, scope, depth + 1);
          if (node.op === "pos") return +interpretNode(node.value, scope, depth + 1);
          if (node.op === "typeof") {
            try {
              const v = interpretNode(node.value, scope, depth + 1);
              if (v && v.__kind === "function") return "function";
              return typeof v;
            } catch (error) {
              if (error instanceof ReferenceError) return "undefined";
              throw error;
            }
          }
          if (node.op === "void") return void interpretNode(node.value, scope, depth + 1);
          if (node.op === "typeofName") {
            try {
              const tv = read(node.name, scope, node);
              if (tv && tv.__kind === "function") return "function";
              return typeof tv;
            } catch (error) {
              if (error instanceof ReferenceError) return "undefined";
              throw error;
            }
          }
          if (node.op === "typeofName") {
            try {
              const tv = read(node.name, scope, node);
              if (tv && tv.__kind === "function") return "function";
              return typeof tv;
            } catch (error) {
              if (error instanceof ReferenceError) return "undefined";
              throw error;
            }
          }
          if (node.op === "await") {
            const value = interpretNode(node.value, scope, depth + 1);
            return value && value.__kind === "syncPromise" ? value.value : value;
          }
          if (node.op === "array") return (node.items || []).map((item) => interpretNode(item, scope, depth + 1));
          if (node.op === "object") {
            const out = {};
            for (const prop of node.props || []) {
              if (prop.getter || prop.setter) defineAccessor(out, prop.key, prop, scope);
              else out[prop.key] = interpretNode(prop.value, scope, depth + 1);
            }
            return out;
          }
          if (node.op === "objectMerge") {
            const out = {};
            for (const part of node.parts || []) {
              if (part.spread) Object.assign(out, interpretNode(part.spread, scope, depth + 1) || {});
              else out[part.key] = interpretNode(part.value, scope, depth + 1);
            }
            return out;
          }
          if (node.op === "typedArray") {
            const values = (node.items || []).map((item) => interpretNode(item, scope, depth + 1));
            const Ctor = globalThis[node.kind] || Uint8Array;
            return new Ctor(values);
          }
          if (node.op === "newError") return new Error(interpretNode(node.message, scope, depth + 1));
          if (node.op === "throw") throw interpretNode(node.value, scope, depth + 1);
          if (node.op === "try") {
            try {
              return evalBlock(node.body || [], scope);
            } catch (error) {
              const catchScope = Object.create(scope || null);
              if (node.catchParam) catchScope[node.catchParam] = error;
              return evalBlock(node.catchBody || [], catchScope);
            } finally {
              evalBlock(node.finallyBody || [], scope);
            }
          }
          if (node.op === "instanceof") {
            const a = interpretNode(node.args[0], scope, depth + 1);
            const b = interpretNode(node.args[1], scope, depth + 1);
            let cls = a && a.__class;
            while (cls) {
              if (cls === b) return true;
              cls = cls.superClass;
            }
            try {
              return a instanceof b;
            } catch {
              return false;
            }
          }
          if (node.op === "class") return defineClass(node.descriptor, interpretNode(node.descriptor.superClass, scope, depth + 1), scope);
          if (node.op === "new") {
            const klass = interpretNode(node.class, scope, depth + 1);
            const args = (node.args || []).map((arg2) => interpretNode(arg2, scope, depth + 1));
            if (typeof klass === "function") return new klass(...args);
            return klass?.__kind === "compactClass" ? newCompactInstance(klass, args, rootScope) : newInstance(klass, args);
          }
          if (node.op === "function") return makeFunction(node, scope);
          if (node.op === "callMethod") return callMethod(interpretNode(node.object, scope, depth + 1), node.method, ...(node.args || []).map((arg2) => interpretNode(arg2, scope, depth + 1)));
          if (node.op === "optionalCallMethod") return optionalCallMethod(interpretNode(node.object, scope, depth + 1), node.method, ...(node.args || []).map((arg2) => interpretNode(arg2, scope, depth + 1)));
          if (node.op === "getProp") return getProp(interpretNode(node.object, scope, depth + 1), interpretNode(node.prop, scope, depth + 1));
          if (node.op === "setProp") return setProp(interpretNode(node.object, scope, depth + 1), interpretNode(node.prop, scope, depth + 1), interpretNode(node.value, scope, depth + 1));
          if (node.op === "callFunction") return callFunction(interpretNode(node.fn, scope, depth + 1), ...(node.args || []).map((arg2) => interpretNode(arg2, scope, depth + 1)));
          if (node.op === "optionalCallFunction") {
            const fn = interpretNode(node.fn, scope, depth + 1);
            return fn == null ? void 0 : callFunction(fn, ...(node.args || []).map((arg2) => interpretNode(arg2, scope, depth + 1)));
          }
          if (node.op === "optionalCallFunction") {
            const fn = interpretNode(node.fn, scope, depth + 1);
            return fn == null ? void 0 : callFunction(fn, ...(node.args || []).map((arg2) => interpretNode(arg2, scope, depth + 1)));
          }
          if (node.op === "conditional") return interpretNode(node.test, scope, depth + 1) ? interpretNode(node.consequent, scope, depth + 1) : interpretNode(node.alternate, scope, depth + 1);
          if (node.op === "optionalGetProp") {
            const object = interpretNode(node.object, scope, depth + 1);
            return object == null ? void 0 : getProp(object, interpretNode(node.prop, scope, depth + 1));
          }
          if (node.op === "if") return evalBlock(interpretNode(node.test, scope, depth + 1) ? node.consequent || [] : node.alternate || [], scope);
          if (node.op === "forOf") {
            const values = interpretNode(node.right, scope, depth + 1) || [];
            const scoped = node.kind === "let" || node.kind === "const";
            for (const value of values) {
              let r;
              if (!scoped) {
                scope[node.left] = value;
                r = evalBlock(node.body || [], scope);
              } else {
                const iter = Object.create(scope);
                iter[node.left] = value;
                r = evalBlock(node.body || [], iter);
                scope[node.left] = iter[node.left];
              }
              if (isReturn(r)) return r;
            }
            return void 0;
          }
          if (node.op === "while") {
            const lets = node.letNames;
            let guard = MAX_LOOP;
            const update = node.update;
            if (!lets || lets.length === 0) {
              while (interpretNode(node.test, scope, depth + 1) && guard-- > 0) {
                const r = evalBlock(node.body || [], scope);
                if (isReturn(r)) return r;
                if (update) interpretNode(update, scope, depth + 1);
              }
              return void 0;
            }
            while (interpretNode(node.test, scope, depth + 1) && guard-- > 0) {
              const iter = Object.create(scope);
              for (let i = 0; i < lets.length; i++) iter[lets[i]] = scope[lets[i]];
              const r = evalBlock(node.body || [], iter);
              if (isReturn(r)) return r;
              const next = Object.create(scope);
              for (let i = 0; i < lets.length; i++) next[lets[i]] = iter[lets[i]];
              if (update) interpretNode(update, next, depth + 1);
              for (let i = 0; i < lets.length; i++) scope[lets[i]] = next[lets[i]];
            }
            return void 0;
          }
          if (node.op === "switch") {
            const value = interpretNode(node.discriminant, scope, depth + 1);
            const cases = node.cases || [];
            const start = Math.max(0, cases.findIndex((item) => item.test == null || interpretNode(item.test, scope, depth + 1) === value));
            for (const item of cases.slice(start)) evalBlock(item.body || [], scope);
            return void 0;
          }
          if (node.op === "superConstructor") {
            const superClass = scope.__class?.superClass || scope.super?.__class || null;
            const args = (node.args || []).map((arg2) => interpretNode(arg2, scope, depth + 1));
            if (!superClass || !scope.this) return scope.super || null;
            const parent = newInstance(superClass, args);
            for (const [key, value] of Object.entries(parent || {})) {
              if (!["__kind", "__class", "__selfClass", "fields"].includes(key)) scope.this[key] = value;
            }
            if (parent?.fields) Object.assign(scope.this.fields || (scope.this.fields = {}), parent.fields);
            return scope.this;
          }
          if (node.op === "block") return evalBlock(node.body || [], Object.create(scope || null));
          return node;
        } finally {
          trace.pop();
        }
      };
      const callInterpreted = (vessel, args = [], thisArg = void 0) => {
        const scope = Object.create(vessel.closure || null);
        scope.this = vessel.arrow ? vessel.closure?.this : thisArg;
        scope.arguments = args;
        let argIndex = 0;
        vessel.params.forEach((param) => {
          if (param && typeof param === "object" && param.rest) scope[param.rest] = args.slice(argIndex);
          else if (param && typeof param === "object" && param.name) {
            const value2 = args[argIndex++];
            scope[param.name] = value2 === void 0 ? interpretNode(param.default, scope) : value2;
          } else scope[param] = args[argIndex++];
        });
        const value = evalBlock(vessel.body, scope);
        return isReturn(value) ? value.value : value;
      };
      const makeFunction = (descriptor, closureScope = {}) => ({
        __kind: "function",
        name: descriptor.name || "",
        params: descriptor.params || [],
        body: descriptor.body || [],
        closure: closureScope,
        arrow: !!descriptor.arrow,
        // B"H 2026-10-09: functions get a prototype object for `new` constructor pattern.
        prototype: {},
        call(args = [], thisArg = void 0) {
          const tiered = nativeTierEnter(this, args, thisArg);
          if (tiered !== TIER_MISS) return tiered;
          return callInterpreted(this, args, thisArg);
        }
      });
      const callFunction = (fn, ...args) => {
        if (fn && fn.__kind === "function") return fn.call(args);
        if (typeof fn === "function") return fn(...args);
        if (fn && typeof fn.call === "function") return fn.call(args);
        throw new TypeError(String(fn) + " is not a function");
      };
      const tryCompileSortComparator = (fn) => {
        if (!fn || fn.__kind !== "function") return null;
        const params = fn.params;
        if (!Array.isArray(params) || params.length !== 2) return null;
        if (typeof params[0] !== "string" || typeof params[1] !== "string") return null;
        const body = fn.body;
        if (!Array.isArray(body) || body.length !== 1) return null;
        const ret = body[0];
        if (!ret || ret.op !== "return" || !ret.value || typeof ret.value !== "object") return null;
        const expr = ret.value;
        const binOps = { sub: (a, b) => a - b, add: (a, b) => a + b, mul: (a, b) => a * b, div: (a, b) => a / b, mod: (a, b) => a % b };
        const opFn = binOps[expr.op];
        if (!opFn || !Array.isArray(expr.args) || expr.args.length !== 2) return null;
        const resolveIdx = (node) => {
          if (!node || typeof node !== "object") return -1;
          if (typeof node.get === "string") {
            if (node.get === params[0]) return 0;
            if (node.get === params[1]) return 1;
            return -1;
          }
          if (Object.prototype.hasOwnProperty.call(node, "const")) return 2;
          return -1;
        };
        const i0 = resolveIdx(expr.args[0]), i1 = resolveIdx(expr.args[1]);
        if (i0 < 0 || i1 < 0) return null;
        const c0 = i0 === 2 ? expr.args[0].const : null;
        const c1 = i1 === 2 ? expr.args[1].const : null;
        return (a, b) => {
          const v0 = i0 === 0 ? a : i0 === 1 ? b : c0;
          const v1 = i1 === 0 ? a : i1 === 1 ? b : c0;
          return opFn(v0, v1);
        };
      };
      const TIER_BAILOUT_EXIT = 42;
      const TIER_MISS = /* @__PURE__ */ Symbol("merkavaTierMiss");
      const TIER_FAIL = /* @__PURE__ */ Symbol("merkavaTierFail");
      const nativeTierEnabled = process.env.MERKAVA_NO_NATIVE !== "1" && !rootScope.__merkavaNoNative;
      const nativeHotThreshold = Math.max(1, Number(rootScope.__merkavaNativeHotThreshold) || 10);
      const nativeCallTimeoutMs = Number(rootScope.__merkavaNativeTimeoutMs) || 3e4;
      const tierCache = /* @__PURE__ */ new WeakMap();
      const tierCallCounts = /* @__PURE__ */ new WeakMap();
      let tierInflight = 0;
      let tierCacheEntries = 0;
      const tierStats = { compiled: 0, rejected: 0, nativeCalls: 0, bailouts: 0, marshalFallback: 0, compileMsTotal: 0 };
      const TIER_BINOPS = /* @__PURE__ */ new Set(["add", "sub", "mul", "div", "mod", "band", "bor", "bxor", "shl", "shr", "ushr"]);
      const TIER_CMPOPS = /* @__PURE__ */ new Set(["eq", "seq", "neq", "sneq", "lt", "lte", "gt", "gte"]);
      const TIER_UNOPS = /* @__PURE__ */ new Set(["neg", "pos", "bitnot", "not"]);
      const TIER_IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;
      const tierBad = (reason) => {
        throw { [TIER_FAIL]: true, reason };
      };
      const analyzeSingleVessel = (v, jsName) => {
        if (!v || v.__kind !== "function") return null;
        const vparams = v.params || [];
        if (vparams.length > 6) return null;
        for (const p of vparams) {
          if (typeof p !== "string" || !TIER_IDENT.test(p) || p.startsWith("__tier")) return null;
        }
        const vbody = v.body;
        if (!Array.isArray(vbody)) return null;
        const vselfName = typeof v.name === "string" && TIER_IDENT.test(v.name) ? v.name : null;
        const declared = new Set(vparams);
        const collectDeclares = (node) => {
          if (!node || typeof node !== "object") return;
          if (node.op === "declare" && typeof node.name === "string") declared.add(node.name);
          if (node.op === "function") return;
          for (const k of Object.keys(node)) {
            const c = node[k];
            if (Array.isArray(c)) {
              for (const x of c) collectDeclares(x);
            } else if (c && typeof c === "object") collectDeclares(c);
          }
        };
        for (const s of vbody) collectDeclares(s);
        const callSites = [];
        const resolveInClosure = (name) => {
          let cursor = v.closure;
          while (cursor && cursor !== Object.prototype) {
            if (Object.prototype.hasOwnProperty.call(cursor, name)) return { scope: cursor, value: cursor[name] };
            cursor = Object.getPrototypeOf(cursor);
          }
          return null;
        };
        const checkCallTarget = (fnNode) => {
          if (!fnNode || typeof fnNode !== "object" || typeof fnNode.get !== "string") tierBad("indirect-call");
          const name = fnNode.get;
          if (vselfName && name === vselfName) {
            const found2 = resolveInClosure(name);
            if (found2 && found2.value === v) callSites.push({ fnName: name, kind: "self", vessel: v, scope: found2.scope });
            else callSites.push({ fnName: name, kind: "trap" });
            return;
          }
          const found = resolveInClosure(name);
          if (found && found.value && found.value.__kind === "function") {
            callSites.push({ fnName: name, kind: "resolved", vessel: found.value, scope: found.scope });
          } else {
            callSites.push({ fnName: name, kind: "trap" });
          }
        };
        const checkExpr = (node) => {
          if (node == null) tierBad("null-expr");
          if (typeof node !== "object") tierBad("primitive-expr");
          if (Object.prototype.hasOwnProperty.call(node, "const")) {
            if (!Number.isSafeInteger(node.const)) tierBad("non-safe-int-const");
            return;
          }
          if (typeof node.get === "string") {
            const name = node.get;
            if (name === "this" || name === "arguments" || name === "super") tierBad("this-like-read");
            if (!declared.has(name)) tierBad("free-variable:" + name);
            return;
          }
          const op = node.op;
          if (typeof op !== "string") tierBad("op-less-node");
          if (TIER_BINOPS.has(op) || TIER_CMPOPS.has(op) || op === "and" || op === "or") {
            const args = node.args;
            if (!Array.isArray(args) || args.length !== 2) tierBad("bad-args:" + op);
            checkExpr(args[0]);
            checkExpr(args[1]);
            return;
          }
          if (TIER_UNOPS.has(op)) {
            if (!node.value || typeof node.value !== "object") tierBad("unary-no-value:" + op);
            checkExpr(node.value);
            return;
          }
          if (op === "conditional") {
            checkExpr(node.test);
            checkExpr(node.consequent);
            checkExpr(node.alternate);
            return;
          }
          if (op === "callFunction") {
            checkCallTarget(node.fn);
            const args = node.args || [];
            if (args.length > 6) tierBad("too-many-args");
            for (const a of args) checkExpr(a);
            return;
          }
          if (op === "postUpdate") {
            if (typeof node.name !== "string" || !declared.has(node.name)) tierBad("postupdate-nonlocal");
            const d = node.delta;
            if (!d || typeof d !== "object" || !Object.prototype.hasOwnProperty.call(d, "const") || !Number.isSafeInteger(d.const) || d.const === 0) tierBad("postupdate-bad-delta");
            return;
          }
          tierBad("unsupported-expr-op:" + op);
        };
        const checkStmt = (node) => {
          if (!node || typeof node !== "object") tierBad("bad-stmt");
          const op = node.op;
          if (op === "declare") {
            if (typeof node.name !== "string" || !TIER_IDENT.test(node.name)) tierBad("bad-declare-name");
            if (!node.value || typeof node.value !== "object") tierBad("declare-no-value");
            checkExpr(node.value);
            return;
          }
          if (op === "set") {
            if (typeof node.name !== "string" || !declared.has(node.name)) tierBad("set-nonlocal:" + String(node.name));
            if (!node.value || typeof node.value !== "object") tierBad("set-no-value");
            checkExpr(node.value);
            return;
          }
          if (op === "return") {
            if (node.value != null) {
              if (typeof node.value !== "object") tierBad("return-primitive");
              checkExpr(node.value);
            }
            return;
          }
          if (op === "if") {
            checkExpr(node.test);
            for (const s of node.consequent || []) checkStmt(s);
            for (const s of node.alternate || []) checkStmt(s);
            return;
          }
          if (op === "while") {
            checkExpr(node.test);
            for (const s of node.body || []) checkStmt(s);
            if (node.update != null) {
              if (typeof node.update !== "object") tierBad("while-update-primitive");
              checkExpr(node.update);
            }
            return;
          }
          if (op === "callFunction" || op === "postUpdate") {
            checkExpr(node);
            return;
          }
          tierBad("unsupported-stmt-op:" + String(op));
        };
        try {
          for (const s of vbody) checkStmt(s);
        } catch (e) {
          if (e && e[TIER_FAIL]) {
            analyzeSingleVessel.lastReason = e.reason;
            return null;
          }
          throw e;
        }
        return { vessel: v, jsName, params: vparams, body: vbody, declared, callSites, selfName: vselfName, nativeName: null, renames: null };
      };
      const analyzeFunction = (vessel) => {
        const seen = /* @__PURE__ */ new Map();
        const queue = [{ vessel, jsName: typeof vessel.name === "string" && TIER_IDENT.test(vessel.name) ? vessel.name : null }];
        const recs = [];
        let firstReason = "rejected";
        while (queue.length) {
          const { vessel: v, jsName } = queue.shift();
          if (seen.has(v)) continue;
          const rec = analyzeSingleVessel(v, jsName);
          seen.set(v, rec);
          if (!rec) {
            if (v === vessel) return { ok: false, reason: firstReason };
            continue;
          }
          recs.push(rec);
          for (const cs of rec.callSites) {
            if (cs.kind === "resolved" && !seen.has(cs.vessel) && !queue.some((q) => q.vessel === cs.vessel)) {
              queue.push({ vessel: cs.vessel, jsName: cs.fnName });
            }
          }
        }
        const top = seen.get(vessel);
        if (!top) return { ok: false, reason: firstReason };
        recs.forEach((rec, i) => {
          rec.nativeName = `__tier${i}`;
        });
        const bindings = [];
        const seenBinding = /* @__PURE__ */ new Set();
        for (const rec of recs) {
          rec.renames = /* @__PURE__ */ new Map();
          for (const cs of rec.callSites) {
            if (cs.kind === "self") {
              rec.renames.set(cs.fnName, rec.nativeName);
            } else if (cs.kind === "resolved") {
              const target = seen.get(cs.vessel);
              if (target) rec.renames.set(cs.fnName, target.nativeName);
            }
            if ((cs.kind === "self" || cs.kind === "resolved") && cs.scope && !seenBinding.has(cs.vessel)) {
              seenBinding.add(cs.vessel);
              bindings.push({ scope: cs.scope, name: cs.fnName, vessel: cs.vessel });
            }
          }
        }
        return { ok: true, functions: recs, bindings };
      };
      const TIER_JS_BINOP = { add: "+", sub: "-", mul: "*", div: "/", mod: "%", band: "&", bor: "|", bxor: "^", shl: "<<", shr: ">>", ushr: ">>>" };
      const TIER_JS_CMP = { eq: "==", seq: "===", neq: "!=", sneq: "!==", lt: "<", lte: "<=", gt: ">", gte: ">=" };
      const TIER_JS_UNOP = { neg: "-", pos: "+", bitnot: "~", not: "!" };
      const tierPrintExpr = (rec, node) => {
        if (Object.prototype.hasOwnProperty.call(node, "const")) {
          const v = node.const;
          return v < 0 ? `(0 - ${-v})` : `${v}`;
        }
        if (typeof node.get === "string") return node.get;
        const op = node.op;
        if (TIER_JS_BINOP[op]) return `(${tierPrintExpr(rec, node.args[0])} ${TIER_JS_BINOP[op]} ${tierPrintExpr(rec, node.args[1])})`;
        if (TIER_JS_CMP[op]) return `(${tierPrintExpr(rec, node.args[0])} ${TIER_JS_CMP[op]} ${tierPrintExpr(rec, node.args[1])})`;
        if (op === "and" || op === "or") return `(${tierPrintExpr(rec, node.args[0])} ${op === "and" ? "&&" : "||"} ${tierPrintExpr(rec, node.args[1])})`;
        if (TIER_JS_UNOP[op]) {
          const v = tierPrintExpr(rec, node.value);
          return op === "not" ? `(!${v})` : `(${TIER_JS_UNOP[op]}${v})`;
        }
        if (op === "conditional") return `(${tierPrintExpr(rec, node.test)} ? ${tierPrintExpr(rec, node.consequent)} : ${tierPrintExpr(rec, node.alternate)})`;
        if (op === "callFunction") {
          const name = node.fn.get;
          const target = rec.renames.get(name);
          const args = (node.args || []).map((a) => tierPrintExpr(rec, a)).join(", ");
          if (!target) return `__merkava_trap(${args})`;
          return `${target}(${args})`;
        }
        if (op === "postUpdate") {
          const d = node.delta.const;
          if (d === 1) return `(${node.name}++)`;
          if (d === -1) return `(${node.name}--)`;
          return `(${node.name} += ${d})`;
        }
        throw new Error("tierPrint: unexpected op " + op);
      };
      const tierPrintStmt = (rec, node, pad) => {
        const op = node.op;
        if (op === "declare") return `${pad}var ${node.name} = ${tierPrintExpr(rec, node.value)};`;
        if (op === "set") return `${pad}${node.name} = ${tierPrintExpr(rec, node.value)};`;
        if (op === "return") return node.value == null ? `${pad}return;` : `${pad}return ${tierPrintExpr(rec, node.value)};`;
        if (op === "if") {
          const cons = (node.consequent || []).map((s) => tierPrintStmt(rec, s, pad + "  ")).join("\n");
          const alt = (node.alternate || []).map((s) => tierPrintStmt(rec, s, pad + "  ")).join("\n");
          let out = `${pad}if (${tierPrintExpr(rec, node.test)}) {
${cons}
${pad}}`;
          if ((node.alternate || []).length) out += ` else {
${alt}
${pad}}`;
          return out;
        }
        if (op === "while") {
          const b = (node.body || []).map((s) => tierPrintStmt(rec, s, pad + "  ")).join("\n");
          const u = node.update != null ? `
${pad}  ${tierPrintExpr(rec, node.update)};` : "";
          return `${pad}while (${tierPrintExpr(rec, node.test)}) {
${b}${u}
${pad}}`;
        }
        return `${pad}${tierPrintExpr(rec, node)};`;
      };
      const printTierSource = (analysis) => analysis.functions.map((rec) => {
        const params = rec.params.join(", ");
        const body = rec.body.map((s) => tierPrintStmt(rec, s, "  ")).join("\n");
        return `function ${rec.nativeName}(${params}) {
${body}
}`;
      }).join("\n\n");
      const marshalTierArgs = (params, args) => {
        const argv = new Array(params.length);
        for (let i = 0; i < params.length; i++) {
          const a = i < args.length ? args[i] : void 0;
          if (!Number.isSafeInteger(a)) return { kind: "unsupported" };
          argv[i] = { kind: "int", text: String(a) };
        }
        return { kind: "ok", argv: argv.map((x) => x.text) };
      };
      const unmarshalTierResult = (stdout) => {
        const text = String(stdout).trim();
        if (!/^-?\d+$/.test(text)) throw new Error("merkavaTier: native binary printed non-integer result: " + text.slice(0, 80));
        const v = Number(text);
        if (!Number.isSafeInteger(v)) throw new Error("merkavaTier: native result outside safe range");
        return v;
      };
      const tierFreshCopy = (js) => {
        const memo = /* @__PURE__ */ new Map();
        const copy = (v) => {
          if (v === null || typeof v !== "object") return v;
          const hit = memo.get(v);
          if (hit !== void 0) return hit;
          let out;
          if (Array.isArray(v)) {
            out = new Array(v.length);
            memo.set(v, out);
            for (let i = 0; i < v.length; i++) if (i in v) out[i] = copy(v[i]);
          } else if (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null) {
            out = {};
            memo.set(v, out);
            for (const k of Object.keys(v)) out[k] = copy(v[k]);
          } else {
            throw new Error("merkavaTier: cannot marshal " + (v.constructor && v.constructor.name || typeof v) + " across the native boundary");
          }
          return out;
        };
        return copy(js);
      };
      const tierEncodeCrossing = async (heap, js) => {
        const vm2 = await Promise.resolve().then(() => (init_value_model(), value_model_exports));
        return vm2.encodeValue(heap, tierFreshCopy(js));
      };
      const tierDecodeCrossing = async (heap, handle) => {
        const vm2 = await Promise.resolve().then(() => (init_value_model(), value_model_exports));
        return vm2.decodeValue(heap, handle);
      };
      const verifyTierBindings = (rec) => {
        const bindings = rec.bindings;
        if (!bindings) return true;
        for (const b of bindings) {
          if (!b.scope || b.scope[b.name] !== b.vessel) return false;
        }
        return true;
      };
      const compileVesselNative = async (vessel, rec) => {
        tierInflight++;
        try {
          const analysis = analyzeFunction(vessel);
          if (!analysis.ok) {
            rec.state = "rejected";
            rec.reason = analysis.reason;
            tierStats.rejected++;
            return;
          }
          const asmMod = await Promise.resolve().then(() => (init_asm(), asm_exports));
          asmMod.registerCodegenExtension("merkava-tier-trap", {
            call(gen, node) {
              if (node.callee && node.callee.type === "Identifier" && node.callee.name === "__merkava_trap") {
                for (const a of node.arguments || []) gen.exprVoid(a);
                gen.emit(`JMP $jsa_bailout_trap`);
                return true;
              }
              return false;
            }
          });
          const source = printTierSource(analysis);
          const t0 = Date.now();
          const built = await asmMod.compileJsToNativeAsm(
            source,
            { name: analysis.functions[0].nativeName, args: "argv" },
            { checkedArithmetic: true, nativeDepthGuard: true, nargs: (vessel.params || []).length }
          );
          rec.state = "ready";
          rec.path = built.path;
          rec.bindings = analysis.bindings;
          rec.compileMs = Date.now() - t0;
          tierStats.compiled++;
          tierStats.compileMsTotal += rec.compileMs;
        } catch (e) {
          rec.state = "rejected";
          rec.reason = "compile-error: " + (e && e.message);
          tierStats.rejected++;
        } finally {
          tierInflight--;
        }
      };
      const nativeTierEnter = (vessel, args, thisArg) => {
        if (!nativeTierEnabled) return TIER_MISS;
        let rec = tierCache.get(vessel);
        if (rec === void 0) {
          const n2 = (tierCallCounts.get(vessel) || 0) + 1;
          tierCallCounts.set(vessel, n2);
          if (n2 < nativeHotThreshold) return TIER_MISS;
          rec = { state: "compiling" };
          tierCache.set(vessel, rec);
          tierCacheEntries++;
          void compileVesselNative(vessel, rec);
          return TIER_MISS;
        }
        if (rec.state !== "ready") return TIER_MISS;
        if (!verifyTierBindings(rec)) {
          rec.state = "rejected";
          rec.reason = "bindings-changed";
          return TIER_MISS;
        }
        const marshalled = marshalTierArgs(vessel.params || [], args);
        if (marshalled.kind !== "ok") {
          tierStats.marshalFallback++;
          return TIER_MISS;
        }
        try {
          const out = execFileSync(rec.path, marshalled.argv, { encoding: "utf8", timeout: nativeCallTimeoutMs });
          tierStats.nativeCalls++;
          return unmarshalTierResult(out);
        } catch (e) {
          if (e && e.status === TIER_BAILOUT_EXIT) {
            tierStats.bailouts++;
            return callInterpreted(vessel, args, thisArg);
          }
          throw e;
        }
      };
      const nativeTierDebug = {
        stats: tierStats,
        cacheEntries: () => tierCacheEntries,
        inflight: () => tierInflight,
        // v2 boundary protocol (option (c)): fresh-copy marshal per crossing.
        marshal: { copy: tierFreshCopy, encode: tierEncodeCrossing, decode: tierDecodeCrossing },
        async idle() {
          for (; ; ) {
            if (tierInflight <= 0) return;
            await new Promise((r) => setTimeout(r, 25));
          }
        }
      };
      const callMethod = (receiver, method, ...args) => {
        if (receiver == null) throw new TypeError(String(receiver) + " has no method " + String(method));
        if (receiver === JSON && (method === "parse" || method === "stringify")) {
          const w = (a) => a && a.__kind === "function" ? (...inner) => callFunction(a, ...inner) : a;
          return method === "parse" ? JSON.parse(w(args[0]), w(args[1])) : JSON.stringify(w(args[0]), w(args[1]), args[2]);
        }
        if (receiver && receiver.__kind === "function") {
          if (method === "apply") return receiver.call(args[1] != null ? Array.from(args[1]) : [], args[0]);
          if (method === "call") return receiver.call(args.slice(1), args[0]);
          if (method === "bind") {
            const target = receiver, boundThis = args[0], boundArgs = args.slice(1);
            return (...callArgs) => target.call([...boundArgs, ...callArgs], boundThis);
          }
        }
        if (receiver && receiver.__kind === "iterator" && method === "next") return receiver.next();
        if (receiver && receiver.__kind === "compactInstance") return callCompactMethod(receiver, method, args, rootScope);
        if (receiver && receiver[method]?.__kind === "function") return receiver[method].call(args, receiver);
        if (method === "sort" && args.length === 1) {
          const fastCmp = tryCompileSortComparator(args[0]);
          if (fastCmp) return receiver.sort(fastCmp);
        }
        if (receiver && typeof receiver[method] === "function" && receiver.__kind !== "instance") {
          const bridged = args.map((arg2) => arg2 && arg2.__kind === "function" ? (...inner) => callFunction(arg2, ...inner) : arg2);
          return receiver[method](...bridged);
        }
        const klass = receiver?.__selfClass || receiver?.__class;
        const found = findMethod(klass, method);
        if (!found) {
          const protoFn = klass?.prototype?.[method];
          if (protoFn?.call) return protoFn.call(args, receiver);
          throw new TypeError(String(method) + " is not a function");
        }
        if (found.__patchedFn) return found.__patchedFn.call(args, receiver);
        const superReceiver = found.owner.superClass ? { __kind: "instance", __class: found.owner.superClass, __selfClass: found.owner.superClass, fields: receiver.fields || {} } : null;
        const scope = Object.assign(Object.create(found.owner.closure || null), { this: receiver, super: superReceiver, arguments: args, __class: found.owner });
        bindParams(scope, found.params || [], args);
        const value = interpretNode(found.body, scope);
        return isReturn(value) ? value.value : value;
      };
      const optionalCallMethod = (receiver, method, ...args) => {
        if (receiver == null) return void 0;
        const value = getProp(receiver, method);
        if (value == null) return void 0;
        return callMethod(receiver, method, ...args);
      };
      const makeGenerator = (values) => ({ __kind: "generatorFactory", call: () => {
        let index = 0;
        return { __kind: "iterator", next: () => index < values.length ? { value: values[index++], done: false } : { value: void 0, done: true } };
      } });
      const makeAsyncVessel = (result) => ({ __kind: "asyncFunction", call: () => interpretNode(result, {}) });
      const getProp = (obj, prop) => {
        if (obj == null) throw new TypeError("Cannot read properties of " + String(obj) + " (reading '" + String(prop) + "')");
        if (hasOwn.call(obj, prop)) return obj[prop];
        if (obj.__kind === "instance" && prop === "constructor") return obj.__class;
        if (obj.__kind === "instance") {
          const found = findMethod(obj.__class, prop);
          if (found) return (...args) => callMethod(obj, prop, ...args);
        }
        const value = obj[prop];
        if (typeof value === "function" && obj && (obj.ownerDocument || obj.documentElement || obj.body || obj.tagName)) return value.bind(obj);
        return value;
      };
      const setProp = (obj, prop, value) => {
        if (obj != null) obj[prop] = value;
        return value;
      };
      const defineAccessor = (obj, key, prop, scope) => {
        const cur = Object.getOwnPropertyDescriptor(obj, key);
        const desc = cur && (cur.get || cur.set) ? cur : { enumerable: true, configurable: true };
        if (prop.getter) {
          const g = interpretNode(prop.getter, scope);
          desc.get = function() {
            return g.call([], this);
          };
        }
        if (prop.setter) {
          const s = interpretNode(prop.setter, scope);
          desc.set = function(v) {
            s.call([v], this);
          };
        }
        Object.defineProperty(obj, key, desc);
      };
      const isAccessorKey = (k) => k !== null && typeof k === "object" && !Array.isArray(k) && typeof k.__accessor === "string";
      const host = {
        20: defineClass,
        21: (klass, ...args) => {
          if (typeof klass === "function") return new klass(...args);
          if (klass?.__kind === "compactClass") return newCompactInstance(klass, args, rootScope);
          if (klass?.__kind === "function") {
            const instance = { __kind: "instance", __class: { methods: [], prototype: klass.prototype || {}, superClass: null }, fields: {} };
            klass.call(args, instance);
            return instance;
          }
          return newInstance(klass, args);
        },
        22: callMethod,
        23: getProp,
        24: makeGenerator,
        25: makeAsyncVessel,
        26: callFunction,
        27: (...items) => items,
        // B"H 2026-10-09: __accessor-marked keys become real getters/setters.
        28: (...flat) => {
          const out = {};
          for (let i = 0; i < flat.length; i += 2) {
            const k = flat[i];
            if (isAccessorKey(k)) defineAccessor(out, k.__accessor, flat[i + 1], rootScope);
            else out[k] = flat[i + 1];
          }
          return out;
        },
        29: (kind, ...items) => new (globalThis[kind] || Uint8Array)(items || []),
        30: (node) => interpretNode(node, Object.create(rootScope)),
        31: setProp,
        32: (node) => makeFunction(node, rootScope),
        33: (op, a, b) => interpretNode({ op, args: [{ const: a }, { const: b }] }),
        34: (op, value) => interpretNode({ op, value: { const: value } }),
        35: (test, consequent, alternate) => test ? consequent : alternate,
        36: (...flat) => {
          const out = {};
          for (let i = 0; i < flat.length; ) {
            if (flat[i++] === true) {
              Object.assign(out, flat[i++] || {});
              continue;
            }
            const k = flat[i++], v = flat[i++];
            if (isAccessorKey(k)) defineAccessor(out, k.__accessor, v, rootScope);
            else out[k] = v;
          }
          return out;
        },
        37: (value) => value && value.__kind === "syncPromise" ? value.value : value,
        38: (obj, prop) => obj == null ? void 0 : getProp(obj, prop),
        39: (message) => new Error(message),
        40: (node) => interpretNode(node, Object.create(rootScope)),
        41: (node) => interpretNode(node, Object.create(rootScope)),
        42: (node) => interpretNode(node, Object.create(rootScope)),
        43: (node) => interpretNode({ op: "block", body: node.body || [] }, Object.create(rootScope)),
        44: (receiver, method, ...args) => optionalCallMethod(receiver, method, ...args),
        45: (fn, ...args) => fn == null ? void 0 : callFunction(fn, ...args),
        46: (name) => {
          try {
            return typeof read(name, rootScope);
          } catch (error) {
            if (error instanceof ReferenceError) return "undefined";
            throw error;
          }
        },
        47: (...flat) => spreadFlat(flat),
        48: (fn, ...flat) => callFunction(fn, ...spreadFlat(flat)),
        49: (receiver, method, ...flat) => callMethod(receiver, method, ...spreadFlat(flat)),
        60: (classes) => installCompactClasses(classes, rootScope)
      };
      Object.defineProperty(host, "__nativeTier", { value: nativeTierDebug, enumerable: false, configurable: true });
      return host;
    }
    module2.exports = { createDefaultHost: createDefaultHost2 };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/SangVmRunner.js
var require_SangVmRunner = __commonJS({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/SangVmRunner.js"(exports2, module2) {
    var { decodeSangArtifact } = require_SangCodec();
    var { loadMerkavaVm: loadMerkavaVm2 } = require_MerkavaVmLoader();
    var { createDefaultHost: createDefaultHost2 } = require_DefaultMerkavaHost();
    var { MerkavaRegExp } = require_regex();
    var TinyMemory2 = class {
      constructor(seed = {}) {
        this.globals = { ...seed };
      }
      getGlobal(name) {
        return this.globals[name];
      }
      setGlobal(name, value) {
        this.globals[name] = value;
      }
    };
    function installRuntimeNatives(memory) {
      const g = memory.globals;
      g.Promise = g.Promise || {
        resolve(value) {
          return {
            __kind: "syncPromise",
            value,
            then(fn) {
              return g.Promise.resolve(typeof fn === "function" ? fn(value) : value);
            },
            catch() {
              return this;
            }
          };
        },
        reject(reason) {
          throw reason;
        }
      };
      g.Map = g.Map || Map;
      g.Set = g.Set || Set;
      g.JSON = g.JSON || JSON;
      g.Math = g.Math || Math;
      g.Array = g.Array || Array;
      g.Object = g.Object || Object;
      g.String = g.String || String;
      g.Number = g.Number || Number;
      g.Boolean = g.Boolean || Boolean;
      g.RegExp = g.RegExp || MerkavaRegExp;
      g.Error = g.Error || Error;
      g.TypeError = g.TypeError || TypeError;
      g.RangeError = g.RangeError || RangeError;
      g.SyntaxError = g.SyntaxError || SyntaxError;
      g.Date = g.Date || Date;
      if (!("NaN" in g)) g.NaN = NaN;
      if (!("Infinity" in g)) g.Infinity = Infinity;
      if (!("undefined" in g)) g.undefined = void 0;
      g.parseInt = g.parseInt || parseInt;
      g.parseFloat = g.parseFloat || parseFloat;
      g.isNaN = g.isNaN || isNaN;
      g.isFinite = g.isFinite || isFinite;
      g.encodeURI = g.encodeURI || encodeURI;
      g.decodeURI = g.decodeURI || decodeURI;
      g.encodeURIComponent = g.encodeURIComponent || encodeURIComponent;
      g.decodeURIComponent = g.decodeURIComponent || decodeURIComponent;
      g.Symbol = g.Symbol || Symbol;
    }
    function runSang(buffer, options = {}) {
      loadMerkavaVm2();
      const artifact = Buffer.isBuffer(buffer) ? decodeSangArtifact(buffer) : buffer;
      const memory = new TinyMemory2(options.globals || {});
      const hostAPI = { ...createDefaultHost2(memory.globals), ...options.hostAPI || {} };
      installRuntimeNatives(memory);
      const context = options.context || memory.globals;
      const vm2 = new globalThis.MerkavaVM(memory, hostAPI, context);
      const thread = vm2.spawn({ bytecode: artifact.bytecode, constants: artifact.constants });
      if (thread && thread.environment !== memory.globals && !options.context) {
        thread.environment = memory.globals;
      }
      thread.status = "RUNNING";
      let cycles = options.cycles || 1e4;
      if (typeof thread.run === "function") {
        thread.run(cycles);
      } else {
        while (cycles-- > 0 && thread.status === "RUNNING") {
          thread.step();
        }
      }
      if (thread.environment && thread.environment !== memory.globals) {
        Object.assign(memory.globals, thread.environment);
      }
      const crash = thread.status === "CRASHED" ? thread.lastError || { message: "Merkava thread crashed without stored error", trace: thread.getDivineTrace?.() || [] } : null;
      return {
        ok: thread.status === "COMPLETED",
        status: thread.status,
        result: thread._sp > 0 ? thread.stack[thread._sp - 1] : void 0,
        stack: thread.stack.slice(0, thread._sp || 0),
        globals: { ...memory.globals, ...thread.environment && thread.environment !== memory.globals ? thread.environment : {} },
        environment: thread.environment || {},
        artifact,
        crash,
        error: crash ? crash.message : null,
        trace: crash ? crash.trace : null
      };
    }
    module2.exports = { TinyMemory: TinyMemory2, runSang, installRuntimeNatives };
  }
});

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/merkavaJsCore.mjs
var merkavaJsCore_exports = {};
__export(merkavaJsCore_exports, {
  VERSION: () => VERSION,
  runJs: () => runJs
});
function ensureVmLoaded() {
  if (globalThis.MerkavaVM?.Thread && globalThis.MerkavaExecutor) return;
  try {
    loadMerkavaVm();
    return;
  } catch (e) {
  }
  let dir = null;
  try {
    let here = null;
    if (typeof __dirname !== "undefined") here = __dirname;
    else here = import_path.default.dirname((0, import_url.fileURLToPath)(import_meta2.url));
    for (const cand of [import_path.default.join(here, "vm"), import_path.default.join(here, "..", "vm")]) {
      if (import_fs3.default.existsSync(import_path.default.join(cand, "thread.js"))) {
        dir = cand;
        break;
      }
    }
  } catch {
  }
  if (!dir) throw new Error("Merkava VM files not found (tried loader path and bundle vm/)");
  for (const f of VM_BUNDLE_FILES) {
    const file = import_path.default.join(dir, f);
    import_vm.default.runInThisContext(import_fs3.default.readFileSync(file, "utf8"), { filename: file });
  }
}
function extractScripts(html) {
  const out = [];
  const re = /<script([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let m;
  while (m = re.exec(html)) {
    const attrs = m[1] || "";
    if (/src\s*=/i.test(attrs)) continue;
    if (/type\s*=\s*["']?(application\/ld\+json|application\/json)/i.test(attrs)) continue;
    const code = (m[2] || "").trim();
    if (!code) continue;
    const isModule = /type\s*=\s*["']?module/i.test(attrs);
    out.push({ code, file: "<inline>", isModule });
  }
  return out;
}
function guessLine(source, message) {
  try {
    const src = String(source || "");
    const lines = src.split("\n");
    const m = String(message || "").match(/^([A-Za-z_$][\w$]*)\s+is not defined/);
    if (m) {
      for (let i = 0; i < lines.length; i++) {
        if (new RegExp(`\\b${m[1]}\\b`).test(lines[i])) {
          return { line: i + 1, estimated: true };
        }
      }
    }
    const msg = String(message || "").trim();
    if (msg.length >= 3) {
      const words = msg.split(/[^A-Za-z0-9_$]+/).filter((w) => w.length >= 4);
      for (const w of words) {
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(w)) return { line: i + 1, estimated: true };
        }
      }
    }
  } catch {
  }
  return { line: 0, estimated: true };
}
function quietVm(fn) {
  const orig = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    group: console.group,
    groupEnd: console.groupEnd,
    table: console.table
  };
  console.log = () => {
  };
  console.error = () => {
  };
  console.warn = () => {
  };
  console.group = () => {
  };
  console.groupEnd = () => {
  };
  console.table = () => {
  };
  try {
    return fn();
  } finally {
    Object.assign(console, orig);
  }
}
async function fetchText(url, timeoutMs) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}
async function runJs(opts = {}) {
  const t0 = Date.now();
  const timeoutMs = Math.min(Math.max(opts.timeoutMs || DEFAULT_TIMEOUT_MS, 1e3), 12e4);
  const maxSteps = Math.min(Math.max(opts.maxSteps || DEFAULT_MAX_STEPS, 100), 5e5);
  const consoleLogs = [];
  const jsErrors = [];
  let html = opts.html || "";
  if (!html && opts.url) html = await fetchText(opts.url, timeoutMs);
  let scripts = [];
  if (opts.js) {
    scripts = [{ code: String(opts.js), file: opts.file || "<inline>" }];
  } else if (html) {
    scripts = extractScripts(html);
  }
  if (!scripts.length) {
    return {
      ok: true,
      consoleLogs,
      jsErrors,
      status: "NO_SCRIPTS",
      steps: 0,
      wallMs: Date.now() - t0,
      scriptsRun: 0,
      version: VERSION
    };
  }
  ensureVmLoaded();
  let steps = 0;
  let scriptsRun = 0;
  for (const { code, file, isModule } of scripts) {
    if (Date.now() - t0 > timeoutMs) break;
    if (isModule) {
      jsErrors.push({
        kind: "skipped",
        name: "ModuleNotSupported",
        message: "ES module script skipped: import/export not yet supported by the VM",
        file,
        line: 0,
        estimated: true
      });
      continue;
    }
    const fakeConsole = {
      log: (...a) => consoleLogs.push({ level: "log", text: a.map(String).join(" ") }),
      info: (...a) => consoleLogs.push({ level: "info", text: a.map(String).join(" ") }),
      warn: (...a) => consoleLogs.push({ level: "warn", text: a.map(String).join(" ") }),
      error: (...a) => consoleLogs.push({ level: "error", text: a.map(String).join(" ") }),
      debug: (...a) => consoleLogs.push({ level: "debug", text: a.map(String).join(" ") })
    };
    const dom = html ? parseHtmlToDom(html) : null;
    const documentFacade = {
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      createElement: () => null,
      documentElement: { setAttribute() {
      } },
      body: null,
      title: ""
    };
    const windowFacade = {
      document: documentFacade,
      location: { href: opts.url || "merkava://run-js" },
      addEventListener() {
      }
    };
    const localStorageFacade = {
      _s: {},
      getItem(k) {
        return this._s[k] ?? null;
      },
      setItem(k, v) {
        this._s[k] = String(v);
      },
      removeItem(k) {
        delete this._s[k];
      }
    };
    const navigatorFacade = { userAgent: "Merkava/1.0" };
    let artifact;
    try {
      artifact = await quietVm(() => compileJsToCode(code, { file }));
    } catch (e) {
      jsErrors.push({
        kind: "parse",
        name: e.name || "SyntaxError",
        message: String(e.message || e).slice(0, 500),
        file,
        line: Number(e.line || e.lineNumber || 0) || 0,
        estimated: false
      });
      continue;
    }
    const memory = new TinyMemory({
      console: fakeConsole,
      document: documentFacade,
      window: windowFacade,
      localStorage: localStorageFacade,
      navigator: navigatorFacade
    });
    const hostAPI = { ...createDefaultHost(memory.globals) };
    const vm2 = new globalThis.MerkavaVM(memory, hostAPI, {});
    const thread = vm2.spawn({ bytecode: artifact.bytecode, constants: artifact.constants || [] });
    const _remember = thread.rememberCrash.bind(thread);
    thread.logCrash = (e) => {
      _remember(e);
    };
    thread.status = "RUNNING";
    scriptsRun++;
    quietVm(() => {
      const wallStart = Date.now();
      while (steps < maxSteps && thread.status === "RUNNING") {
        if (Date.now() - wallStart > timeoutMs || Date.now() - t0 > timeoutMs) {
          thread.status = "TIMEOUT";
          break;
        }
        thread.step();
        steps++;
      }
    });
    if (thread.status === "CRASHED" && thread.lastError) {
      const le = thread.lastError;
      const { line, estimated } = guessLine(code, le.message);
      jsErrors.push({
        kind: "runtime",
        name: le.name || "Error",
        message: String(le.message || "").slice(0, 500),
        file,
        line,
        estimated,
        ip: le.ip ?? 0,
        stack: String(le.stack || "").slice(0, 2e3)
      });
    } else if (thread.status === "TIMEOUT") {
      jsErrors.push({
        kind: "timeout",
        name: "TimeoutError",
        message: `script exceeded ${timeoutMs}ms / ${maxSteps} steps`,
        file,
        line: 0,
        estimated: true
      });
    }
  }
  const realErrors = jsErrors.filter((e) => e.kind !== "skipped");
  return {
    ok: realErrors.length === 0,
    consoleLogs,
    jsErrors,
    status: realErrors.length ? "ERRORS" : "COMPLETED",
    steps,
    wallMs: Date.now() - t0,
    scriptsRun,
    version: VERSION
  };
}
var import_MerkavaJsCompiler, import_SangVmRunner, import_MerkavaVmLoader, import_DefaultMerkavaHost, import_url, import_path, import_fs3, import_vm, import_meta2, compileJsToCode, parseJs, TinyMemory, loadMerkavaVm, createDefaultHost, VERSION, DEFAULT_MAX_STEPS, DEFAULT_TIMEOUT_MS, VM_BUNDLE_FILES;
var init_merkavaJsCore = __esm({
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/merkavaJsCore.mjs"() {
    import_MerkavaJsCompiler = __toESM(require_MerkavaJsCompiler(), 1);
    import_SangVmRunner = __toESM(require_SangVmRunner(), 1);
    import_MerkavaVmLoader = __toESM(require_MerkavaVmLoader(), 1);
    import_DefaultMerkavaHost = __toESM(require_DefaultMerkavaHost(), 1);
    init_htmlParser();
    import_url = require("url");
    import_path = __toESM(require("path"), 1);
    import_fs3 = __toESM(require("fs"), 1);
    import_vm = __toESM(require("vm"), 1);
    import_meta2 = {};
    ({ compileJsToCode, parseJs } = import_MerkavaJsCompiler.default);
    ({ TinyMemory } = import_SangVmRunner.default);
    ({ loadMerkavaVm } = import_MerkavaVmLoader.default);
    ({ createDefaultHost } = import_DefaultMerkavaHost.default);
    VERSION = "1.0.0";
    DEFAULT_MAX_STEPS = 5e4;
    DEFAULT_TIMEOUT_MS = 3e4;
    VM_BUNDLE_FILES = [
      "merkava-opcodes.js",
      "flow.js",
      "stack.js",
      "math.js",
      "objects.js",
      "functions.js",
      "json.js",
      "instructions.js",
      "thread.js",
      "index.js"
    ];
  }
});

// merkava-shot.bundle-entry.mjs
var merkava_shot_bundle_entry_exports = {};
__export(merkava_shot_bundle_entry_exports, {
  CORE_VERSION: () => VERSION2,
  JS_CORE_VERSION: () => VERSION,
  VIEWPORT_PRESETS: () => VIEWPORT_PRESETS,
  main: () => main,
  runJs: () => runJs,
  runPage: () => runPage
});
module.exports = __toCommonJS(merkava_shot_bundle_entry_exports);

// merkava-shot.mjs
var import_fs4 = require("fs");
var import_readline = require("readline");
var import_url2 = require("url");

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/pngTools.js
var import_zlib = __toESM(require("zlib"), 1);
var CRC32_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    t[i] = c >>> 0;
  }
  return t;
})();
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
  const idat = level === void 0 || level === null ? import_zlib.default.deflateSync(raw) : import_zlib.default.deflateSync(raw, { level });
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
    const has2 = Object.prototype.hasOwnProperty.call(computed, name);
    const parentVal = parentComputed ? parentComputed[name] : void 0;
    const specified = has2 && computed[name] !== parentVal;
    if (!specified) {
      if (!(reg.inherits && has2)) {
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
  const fs2 = Number(refBox.fontSize) || 16;
  const len = (t, base) => lengthToPx(t, base, fs2);
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
  const fs2 = Number(refBox.fontSize) || 16;
  const z = parts.length >= 3 ? lengthToPx(parts[2], 0, fs2) : 0;
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
  const align2 = String(pStyle["text-align"] || "left").trim().toLowerCase();
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
  const effAlign = (align2 === "left" || align2 === "" || align2 === "start") && _dir === "rtl" ? "right" : align2;
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
  const align2 = String(s["align-items"] || "stretch").trim().toLowerCase();
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
    const baseAlign = laid.some((l) => String(l.it.style["align-self"] || align2).trim().toLowerCase() === "baseline");
    let maxBase = 0;
    if (baseAlign) for (const l of laid) maxBase = Math.max(maxBase, flexBaselineOf(l.it));
    for (const { it, got } of laid) {
      const selfAlign = String(it.style["align-self"] || align2).trim().toLowerCase();
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
          const selfAlign = String(l.it.style["align-self"] || align2).trim().toLowerCase();
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
  const fs2 = dim((it.style || {})["font-size"], 0) || 14;
  return fs2 * 0.8;
}
function layoutFlexColumn(children, parent, ctx, out, opts) {
  const s = parent.style || {};
  const o = opts || {};
  const W = Math.max(1, ctx.width);
  const gap = px(s.gap || s["row-gap"] || 0);
  const colGap = px(s["column-gap"] || s.gap || 0);
  const justify = String(s["justify-content"] || "flex-start").trim().toLowerCase();
  const align2 = String(s["align-items"] || "stretch").trim().toLowerCase();
  const wrap = !!o.wrap;
  const depth = (ctx.depth || 0) + 1;
  const items = children.filter((c) => !hidden(c)).map((child) => {
    const st = styleOf(child);
    const selfAlign = String(st["align-self"] || align2).trim().toLowerCase();
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

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/virtualPngRenderer.js
init_htmlParser();
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

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/verifySession.js
var import_fs2 = require("fs");

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/software/inputSimulator.js
init_htmlParser();
var import_fs = require("fs");
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
    (0, import_fs.writeFileSync)(path2, Buffer.from(this.lastResult.dataUrl.split(",")[1], "base64"));
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
    (0, import_fs2.writeFileSync)(path2, f.png);
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
async function runBatch(pages, defaults = {}) {
  const results = [];
  for (const pg of pages) {
    const t0 = Date.now();
    try {
      let width = defaults.width || 1280, height = defaults.height || 800, dpr = defaults.dpr || 1;
      if (pg.viewport) {
        const m = String(pg.viewport).match(/^(\d+)x(\d+)$/);
        if (m) {
          width = +m[1];
          height = +m[2];
        }
      }
      if (pg.dpr != null) dpr = pg.dpr;
      const sess = new VerifySession(pg.html, {
        width,
        height,
        dpr,
        pngLevel: pg.pngLevel ?? defaults.pngLevel
      });
      const steps = typeof pg.steps === "string" ? parseInteract(pg.steps) : pg.steps || [];
      const report = await sess.runSteps(steps.length ? steps : [{ op: "shot", arg: pg.out || "", raw: "shot" }]);
      results.push({ name: pg.name || "page", ok: report.ok, failed: report.failed, ms: Date.now() - t0, report });
    } catch (e) {
      results.push({ name: pg.name || "page", ok: false, failed: 1, ms: Date.now() - t0, error: e.message });
    }
  }
  return results;
}

// geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/merkavaCore.mjs
init_merkavaJsCore();
var VERSION2 = "1.1.0";
var DEFAULT_TIMEOUT_MS2 = 3e4;
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
function finalDomState(sess, html) {
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
  return { title, textLength, nodeCount, jsExecuted: false };
}
async function runPage(opts = {}) {
  const t0 = Date.now();
  const timeoutMs = Math.min(Math.max(opts.timeoutMs || DEFAULT_TIMEOUT_MS2, 1e3), 12e4);
  let html = opts.html || "";
  if (!html && opts.url) html = await fetchHtml(opts.url, timeoutMs);
  if (!html) throw new Error("runPage: need html or url");
  html = injectCss(html, opts.css);
  let jsResult = null;
  if (opts.executeJs !== false) {
    try {
      jsResult = await runJs({
        html,
        url: opts.url || void 0,
        timeoutMs: Math.min(timeoutMs, 15e3),
        maxSteps: 3e4
      });
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
    finalDom: finalDomState(sess, html),
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

// merkava-shot.mjs
init_merkavaJsCore();
var import_meta3 = {};
function arg(name, def = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : def;
}
var has = (name) => process.argv.includes(name);
function resolveViewport2() {
  const device = arg("--device");
  let width = parseInt(arg("--width", "1280"), 10);
  let height = parseInt(arg("--height", "800"), 10);
  let dpr = parseInt(arg("--dpr", "1"), 10);
  const vp = arg("--viewport");
  if (vp) {
    const m = vp.match(/^(\d+)x(\d+)$/);
    if (!m) {
      console.error(`bad --viewport ${vp}, want WxH`);
      process.exit(1);
    }
    width = +m[1];
    height = +m[2];
  } else if (device) {
    const p = VIEWPORT_PRESETS[device];
    if (!p) {
      console.error(`unknown --device ${device}; try --devices`);
      process.exit(1);
    }
    width = p.width;
    height = p.height;
    dpr = p.dpr;
  }
  return { width, height, dpr: Math.max(1, Math.min(3, dpr || 1)) };
}
async function fetchHtml2(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Merkava/1.0 (screenshot)" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}
async function loadHtml() {
  const url = arg("--url");
  const htmlArg = arg("--html");
  const file = arg("--file");
  if (url) {
    console.log(`Fetching ${url} ...`);
    return await fetchHtml2(url);
  }
  if (file) return (0, import_fs4.readFileSync)(file, "utf8");
  if (htmlArg) return htmlArg;
  console.error("Need one of: --url, --file, --html");
  process.exit(1);
}
function printReport(report) {
  for (const s of report.steps) {
    const mark = s.ok ? "ok" : "FAIL";
    console.log(`  [${mark}] ${s.op}${s.arg ? ":" + s.arg : ""} (${s.ms}ms) ${s.detail}`);
  }
  console.log(report.ok ? `PASS ${report.steps.length} steps, ${report.failed} failed` : `FAIL ${report.failed}/${report.steps.length} steps failed`);
}
async function main() {
  const sub = process.argv[2];
  if (sub === "run-js") {
    const { runJs: runJs2 } = await Promise.resolve().then(() => (init_merkavaJsCore(), merkavaJsCore_exports));
    const target = process.argv[3];
    const jsArg = arg("--js");
    const jsFile = arg("--js-file");
    const htmlArg = arg("--html");
    const fileArg = arg("--file");
    let js = jsArg || null;
    if (jsFile) js = (0, import_fs4.readFileSync)(jsFile, "utf8");
    let html2 = htmlArg || null;
    if (fileArg && !js) html2 = (0, import_fs4.readFileSync)(fileArg, "utf8");
    let url = null;
    if (target && !target.startsWith("--")) url = target;
    else if (!js && !html2) url = arg("--url");
    if (!js && !html2 && !url) {
      console.error('Usage: merkava-shot run-js <url> [--js "code"] [--js-file f.js] [--html "<...>"] [--file page.html]');
      process.exit(1);
    }
    const r = await runJs2({ js: js || void 0, html: html2 || void 0, url: url || void 0, file: url || fileArg || "<inline>" });
    for (const l of r.consoleLogs) console.log(`[${l.level}] ${l.text}`);
    if (!r.jsErrors.length) {
      console.log(`OK: ${r.scriptsRun} script(s), ${r.steps} steps, ${r.wallMs}ms \u2014 no errors`);
    } else {
      for (const e of r.jsErrors) {
        const line = e.line ? `:${e.line}` : "";
        const est = e.estimated ? " (line estimated)" : "";
        console.log(`ERROR [${e.kind}] ${e.name}: ${e.message} @ ${e.file}${line}${est}`);
      }
      console.log(`FAIL: ${r.jsErrors.length} error(s) in ${r.scriptsRun} script(s)`);
    }
    process.exit(r.jsErrors.length ? 1 : 0);
  }
  if (has("--devices")) {
    for (const [k, p] of Object.entries(VIEWPORT_PRESETS))
      console.log(`${k.padEnd(10)} ${p.width}x${p.height} @${p.dpr}x  ${p.label}`);
    return;
  }
  const interact = arg("--interact");
  const batchFile = arg("--batch");
  if (has("--serve")) return serve();
  if (batchFile) {
    const spec = JSON.parse((0, import_fs4.readFileSync)(batchFile, "utf8"));
    const t02 = Date.now();
    for (const pg of spec.pages || []) {
      if (pg.url && !pg.html) {
        console.log(`Fetching ${pg.url} ...`);
        pg.html = await fetchHtml2(pg.url);
      } else if (pg.file && !pg.html) pg.html = (0, import_fs4.readFileSync)(pg.file, "utf8");
    }
    const defaults = spec.defaults || {};
    if (!defaults.width) {
      const v = resolveViewport2();
      defaults.width = v.width;
      defaults.height = v.height;
      defaults.dpr = v.dpr;
    }
    if (has("--fast")) defaults.pngLevel = 1;
    const results = await runBatch(spec.pages || [], defaults);
    let failed = 0;
    for (const r of results) {
      console.log(`== ${r.name}: ${r.ok ? "PASS" : "FAIL"} (${r.ms}ms)${r.error ? " " + r.error : ""}`);
      if (r.report) printReport(r.report);
      if (!r.ok) failed++;
    }
    console.log(`batch done: ${results.length - failed}/${results.length} passed in ${Date.now() - t02}ms (one warm process)`);
    process.exit(failed ? 1 : 0);
  }
  const html = await loadHtml();
  if (interact) {
    const v = resolveViewport2();
    const sess = new VerifySession(html, {
      width: v.width,
      height: v.height,
      dpr: v.dpr,
      pngLevel: has("--fast") ? 1 : void 0
    });
    const t02 = Date.now();
    const report = await sess.runSteps(parseInteract(interact));
    printReport(report);
    console.log(`session total ${Date.now() - t02}ms (parse-once, warm)`);
    if (has("--profile")) console.log(`stages: layout ${sess.timings.layout}ms, paint ${sess.timings.paint}ms, png ${sess.timings.encode}ms, renders ${sess.timings.renders}`);
    process.exit(report.ok ? 0 : 1);
  }
  const out = arg("--out", "/tmp/merkava-shot.png");
  const cv = resolveViewport2();
  const width = cv.width, height = cv.height;
  const fullPage = has("--full");
  const t0 = Date.now();
  const result = renderVirtualSnapshotPng({ html }, { width, height, fullPage });
  const ms = Date.now() - t0;
  const png = Buffer.from(result.dataUrl.split(",")[1], "base64");
  (0, import_fs4.writeFileSync)(out, png);
  console.log(`OK ${out} ${result.width}x${result.height} ${png.length}B in ${ms}ms (no Chrome)`);
}
async function serve() {
  console.log(JSON.stringify({ ready: true, devices: Object.keys(VIEWPORT_PRESETS) }));
  let sess = null;
  const rl = (0, import_readline.createInterface)({ input: process.stdin, crlfDelay: Infinity });
  const send = (o) => console.log(JSON.stringify(o));
  for await (const line of rl) {
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      send({ ok: false, error: "bad JSON" });
      continue;
    }
    try {
      switch (msg.cmd) {
        case "load": {
          let html = msg.html;
          if (msg.url) html = await fetchHtml2(msg.url);
          else if (msg.file) html = (0, import_fs4.readFileSync)(msg.file, "utf8");
          if (html == null) throw new Error("load needs html|url|file");
          let width = 1280, height = 800, dpr = 1;
          if (msg.viewport) {
            const m = String(msg.viewport).match(/^(\d+)x(\d+)$/);
            if (m) {
              width = +m[1];
              height = +m[2];
            }
          }
          if (msg.dpr) dpr = Math.max(1, Math.min(3, +msg.dpr));
          const t0 = Date.now();
          sess = new VerifySession(html, { width, height, dpr, pngLevel: msg.fast ? 1 : void 0 });
          send({ ok: true, ms: Date.now() - t0, viewport: `${width}x${height}`, dpr });
          break;
        }
        case "run": {
          if (!sess) throw new Error("no session; send load first");
          const t0 = Date.now();
          const report = await sess.runSteps(parseInteract(msg.steps || "shot"));
          send({ ok: report.ok, failed: report.failed, ms: Date.now() - t0, steps: report.steps });
          break;
        }
        case "shot": {
          if (!sess) throw new Error("no session; send load first");
          const t0 = Date.now();
          const r = sess.savePng(msg.out || `/tmp/merkava-serve-${Date.now()}.png`);
          send({ ok: true, path: r.path, bytes: r.bytes, ms: Date.now() - t0 });
          break;
        }
        case "viewport": {
          if (!sess) throw new Error("no session; send load first");
          const m = String(msg.viewport || "").match(/^(\d+)x(\d+)$/);
          if (m) sess.setViewport(+m[1], +m[2], msg.dpr);
          send({ ok: true, viewport: `${sess.width}x${sess.height}`, dpr: sess.dpr });
          break;
        }
        case "timings":
          send({ ok: true, timings: sess ? sess.timings : null });
          break;
        case "quit":
          send({ ok: true, bye: true });
          process.exit(0);
          break;
        default:
          send({ ok: false, error: `unknown cmd: ${msg.cmd}` });
      }
    } catch (e) {
      send({ ok: false, error: e.message });
    }
  }
}
var __isMain = (() => {
  try {
    return !!process.argv[1] && import_meta3.url === (0, import_url2.pathToFileURL)(process.argv[1]).href;
  } catch {
    return false;
  }
})();
if (__isMain) main().catch((e) => {
  console.error("FAIL:", e.message);
  process.exit(1);
});

// merkava-shot.bundle-entry.mjs
if (typeof require !== "undefined" && require.main === module) {
  main().catch((e) => {
    console.error("FAIL:", e.message);
    process.exit(1);
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CORE_VERSION,
  JS_CORE_VERSION,
  VIEWPORT_PRESETS,
  main,
  runJs,
  runPage
});
