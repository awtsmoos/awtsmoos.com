// B"H
const { readText, writeText } = require("../readWrite.js");
const { scopeOutlineFromText } = require("./scopeOutline.js");

function chooseScope(outline, payload) {
  if (payload.scopeId) return outline.symbols.find(s => s.scopeId === payload.scopeId) || null;
  const wanted = payload.methodName || payload.name || payload.functionName || payload.symbol;
  const kind = payload.kind || (payload.methodName ? "method" : null);
  const matches = outline.symbols.filter(s => {
    if (wanted && s.name !== wanted) return false;
    if (kind && s.kind !== kind) return false;
    if (payload.className && s.className !== payload.className) return false;
    return true;
  });
  return matches.length === 1 ? matches[0] : null;
}

function freshness(scope, payload) {
  const expectedBody = payload.expectedBodyHash || payload.bodyHash;
  if (expectedBody && expectedBody !== scope.bodyHash) {
    return { ok: false, error: "body_hash_mismatch", expected: expectedBody, actual: scope.bodyHash };
  }
  const expectedText = payload.expectedTextHash || payload.textHash;
  if (expectedText && expectedText !== scope.textHash) {
    return { ok: false, error: "text_hash_mismatch", expected: expectedText, actual: scope.textHash };
  }
  return { ok: true };
}

function compose(text, scope, payload) {
  const content = String(payload.content ?? payload.replacement ?? payload.body ?? "");
  if (payload.action === "replaceFunctionBody" || payload.action === "replaceScopeBody") {
    if (!scope.bodyRange) return { ok: false, error: "scope_has_no_body" };
    return { ok: true, next: text.slice(0, scope.bodyRange.start) + "\n" + content + "\n" + text.slice(scope.bodyRange.end) };
  }
  if (payload.action === "insertBeforeFunction" || payload.action === "insertBeforeScope") {
    return { ok: true, next: text.slice(0, scope.range.start) + content + "\n" + text.slice(scope.range.start) };
  }
  if (payload.action === "insertAfterFunction" || payload.action === "insertAfterScope") {
    return { ok: true, next: text.slice(0, scope.range.end) + "\n" + content + text.slice(scope.range.end) };
  }
  return { ok: true, next: text.slice(0, scope.range.start) + content + text.slice(scope.range.end) };
}

async function scopeEdit(config, payload) {
  const p = payload.path || payload.p;
  const got = await readText(config, p, 10000000, 0);
  const text = got.content || "";
  const outline = scopeOutlineFromText(text, p);
  const scope = chooseScope(outline, payload);
  if (!scope) return { ok: false, action: payload.action, error: "scope_not_unique_or_not_found", symbols: outline.symbols };
  const fresh = freshness(scope, payload);
  if (!fresh.ok) return { ok: false, action: payload.action, editedSymbol: scope, ...fresh };
  const made = compose(text, scope, payload);
  if (!made.ok) return { ok: false, action: payload.action, editedSymbol: scope, ...made };
  const afterOutline = scopeOutlineFromText(made.next, p);
  if (payload.preview || payload.action === "semanticEditPreview") {
    return { ok: true, action: payload.action, preview: true, editedSymbol: scope, beforeChars: text.length, afterChars: made.next.length, astOutline: afterOutline };
  }
  const wrote = await writeText(config, p, made.next);
  return { ok: true, action: payload.action, editedSymbol: scope, ...wrote, astOutline: afterOutline };
}

module.exports = { scopeEdit, chooseScope };
