// B"H
const path = require("path");
const { refsFrom } = require("./runtime/sourceRefs.js");
const { refsFromJs } = require("./runtime/sourceRefs/jsRefs.js");
const { normalizeRuntimeRef } = require("./runtime/sourceRefs/pathRefs.js");
const { parseWithMerkava } = require("./semantic/merkavaParser.js");

/**
 * B"H
 * @file connectedRefs.js
 * @description
 * Chapter 367: The road was not walked twice.
 * HTML delivery refs are already normalized by the runtime source collector.
 * Merkava AST refs and lexical JS refs are still raw sparks. This module now
 * knows the difference, so connected graph walking stops folding a path into
 * itself like apps/x/apps/x/file.js.
 */

function slash(value) { return String(value || "").replace(/\\/g, "/"); }

function sourceValuesFromAst(node, refs = []) {
  if (!node || typeof node !== "object") return refs;
  if (node.source && typeof node.source.value === "string") refs.push(node.source.value);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(child => sourceValuesFromAst(child, refs));
    else if (value && typeof value === "object" && value.type) sourceValuesFromAst(value, refs);
  }
  return refs;
}

async function merkavaModuleRefs(text) {
  const parsed = await parseWithMerkava(text);
  if (!parsed.ok) return { refs: [], ok: false, error: parsed.error, errors: parsed.errors || [] };
  return { refs: [...new Set(sourceValuesFromAst(parsed.ast))], ok: true, errors: parsed.errors || [] };
}

function extensionCandidates(spec) {
  if (/\.[a-z0-9]+$/i.test(spec)) return [spec];
  return [spec, spec + ".js", spec + ".mjs", spec + ".cjs", spec + ".json", spec + "/index.js"];
}

function alreadyProjectRelative(spec) {
  return /^[\w@.-]+\//.test(spec) && !spec.startsWith("./") && !spec.startsWith("../");
}

function normalizeOne(spec, base) {
  const clean = slash(spec).trim();
  if (!clean || /^(https?:|data:|blob:|#)/i.test(clean)) return null;
  if (alreadyProjectRelative(clean)) return clean.replace(/^\/+/, "");
  return normalizeRuntimeRef(clean, base);
}

function normalizeRefs(specs, fromKey) {
  const base = slash(path.posix.dirname(fromKey));
  const refs = [];
  for (const spec of specs) {
    const normalized = normalizeOne(spec, base);
    if (!normalized) continue;
    refs.push(...extensionCandidates(normalized));
  }
  return [...new Set(refs)];
}

async function refsForConnectedText(text, fromKey) {
  const delivered = refsFrom(text, fromKey);
  const merkava = /\.[cm]?js$/i.test(fromKey) ? await merkavaModuleRefs(text) : { refs: [], ok: null, errors: [] };
  const lexicalJs = /\.[cm]?js$/i.test(fromKey) ? refsFromJs(text) : [];
  return {
    refs: normalizeRefs([...delivered, ...merkava.refs, ...lexicalJs], fromKey),
    sources: { delivered: delivered.length, merkava: merkava.refs.length, lexicalJs: lexicalJs.length },
    merkava: { ok: merkava.ok, errors: merkava.errors, error: merkava.error }
  };
}

module.exports = { refsForConnectedText, merkavaModuleRefs, sourceValuesFromAst, normalizeRefs, normalizeOne };
