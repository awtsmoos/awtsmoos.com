// B"H
/**
 * @file preflight.js
 * @description
 * Chapter 6: The Awtsmoos kindled syntax-fire only beneath living code. The
 * import map stayed a map, JSON stayed a seed, and scripts were tested honestly.
 */

const { attrsOf } = require("./htmlRefs.js");
const { isExecutableScriptType } = require("./scriptKinds.js");
const { isHtmlPath, isJsPath } = require("./pathUtils.js");

function withPreflight(env) {
  const diagnostics = [...(env.diagnostics || [])];
  for (const [file, source] of Object.entries(env.files || {})) {
    if (isJsPath(file)) pushBad(diagnostics, checkScript(file, source));
    if (isHtmlPath(file)) {
      for (const script of extractInlineScripts(source, file)) {
        pushBad(diagnostics, checkScript(script.file, script.source));
      }
    }
  }
  return { ...env, diagnostics, ok: !env.error && diagnostics.every(x => x.ok !== false) };
}

function extractInlineScripts(html, file) {
  const scripts = [];
  let index = 0;
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  for (const match of String(html || "").matchAll(re)) {
    const attrs = attrsOf(match[1] || "");
    if (attrs.src || !isExecutableScriptType(attrs.type)) continue;
    scripts.push({ file: `${file}#inline-script-${++index}`, source: match[2] || "" });
  }
  return scripts;
}

function checkScript(file, source) {
  try {
    if (/\bimport\s|\bexport\s/.test(source)) return { ok: true, file, skipped: "module_syntax_runtime_checked" };
    new Function(source);
    return { ok: true, file };
  } catch (error) {
    return { ok: false, file, name: error.name, message: error.message, kind: "syntax" };
  }
}

function pushBad(list, item) {
  if (item && item.ok === false) list.push(item);
}

module.exports = { withPreflight, extractInlineScripts, checkScript };
