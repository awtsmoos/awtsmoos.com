// B"H
/**
 * @file variableInspector.js
 * @description Variable inspector for the Merkava VM.
 *
 * Reads every variable at every scope of a live (or time-travel-restored)
 * thread: the operand stack, the current scope, every call frame's scope,
 * and the upvalue/scope-parent chain. Formats values safely (depth-limited,
 * cycle-safe) for display in DevTools, tunnel actions, or API responses.
 *
 * Purely additive: reads thread state, never mutates it.
 */

const MAX_DEPTH = 4;
const MAX_KEYS = 40;
const MAX_STR = 200;

function typeOf(v) {
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (Array.isArray(v)) return "array";
  const t = typeof v;
  if (t === "object") {
    if (v.type === "CLOSURE") return "closure";
    if (v.__kind) return String(v.__kind);
    return "object";
  }
  return t;
}

export function formatValue(value, depth = 0, seen = new Set()) {
  const t = typeOf(value);
  if (value === null) return { type: "null", preview: "null", value: null };
  if (value === undefined) return { type: "undefined", preview: "undefined" };
  if (typeof value === "string") {
    const preview = value.length > MAX_STR ? JSON.stringify(value.slice(0, MAX_STR)) + `…(${value.length})` : JSON.stringify(value);
    return { type: "string", preview, value: value.length > 2000 ? value.slice(0, 2000) : value };
  }
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return { type: t, preview: String(value), value };
  }
  if (typeof value === "function") {
    return { type: "function", preview: `[function ${value.name || "anonymous"}]` };
  }
  if (seen.has(value)) return { type: t, preview: "[circular]" };
  if (depth >= MAX_DEPTH) return { type: t, preview: t === "array" ? `Array(${value.length})` : "{…}" };
  seen.add(value);
  if (Array.isArray(value)) {
    const items = value.slice(0, 10).map((item) => formatValue(item, depth + 1, seen).preview);
    return {
      type: "array", preview: `[${items.join(", ")}${value.length > 10 ? `, …(${value.length})` : ""}]`,
      length: value.length,
      children: value.slice(0, 10).map((item, i) => ({ name: String(i), ...formatValue(item, depth + 1, seen) }))
    };
  }
  if (t === "closure") {
    return { type: "closure", preview: `[closure ${value.isArrow ? "=>" : "fn"}]`, isArrow: !!value.isArrow, isAsync: !!value.isAsync };
  }
  const keys = Object.keys(value).filter((k) => k !== "__parent").slice(0, MAX_KEYS);
  const preview = `{${keys.slice(0, 5).map((k) => `${k}: ${formatValue(value[k], depth + 1, seen).preview}`).join(", ")}${keys.length > 5 ? ", …" : ""}}`;
  return {
    type: t, preview, keys,
    children: keys.slice(0, 15).map((k) => ({ name: k, ...formatValue(value[k], depth + 1, seen) }))
  };
}

/** Walk the scope chain: currentScope -> __parent -> ... (cycle-safe). */
export function getScopeChain(thread) {
  const chain = [];
  const seen = new Set();
  let scope = thread.currentScope;
  let level = 0;
  while (scope && typeof scope === "object" && !seen.has(scope) && level < 12) {
    seen.add(scope);
    chain.push({ level, scope });
    scope = scope.__parent;
    level++;
  }
  return chain;
}

/** Full variable snapshot for a thread: stack + every scope level + frames. */
export function getVariables(thread) {
  const scopes = getScopeChain(thread).map(({ level, scope }) => ({
    level,
    label: level === 0 ? "local" : `closure-${level}`,
    variables: Object.keys(scope)
      .filter((k) => k !== "__parent")
      .slice(0, 60)
      .map((k) => ({ name: k, ...formatValue(scope[k]) }))
  }));
  // B"H: top-level `var`s live in thread.environment (synced to VM globals),
  // not in currentScope. Expose it as the outermost scope level.
  if (thread.environment && typeof thread.environment === "object") {
    const envKeys = Object.keys(thread.environment).filter((k) => k !== "__parent");
    if (envKeys.length) {
      scopes.push({
        level: scopes.length,
        label: "global",
        variables: envKeys.slice(0, 80).map((k) => ({ name: k, ...formatValue(thread.environment[k]) }))
      });
    }
  }
  const frames = (thread.frames || []).map((f, i) => ({
    index: i,
    ip: f.ip,
    stackSize: f.stackSize,
    isConstructor: !!f.isConstructor,
    scopeVars: f.scope && typeof f.scope === "object"
      ? Object.keys(f.scope).filter((k) => k !== "__parent").slice(0, 20)
      : []
  }));
  return {
    ip: thread.ip,
    status: thread.status,
    stack: (thread.stack || []).map((v, i) => ({ slot: i, ...formatValue(v) })),
    scopes,
    frames,
    catchDepth: (thread.catchStack || []).length
  };
}

/**
 * Evaluate a watch expression against the thread's scope chain.
 * Supports simple paths: `foo`, `foo.bar`, `foo[0]`, plus literals.
 * Bytecode-level: resolves identifiers through the real scope chain.
 */
export function evaluateWatch(thread, expr) {
  const src = String(expr || "").trim();
  if (!src) return { ok: false, error: "empty expression" };
  if (/^[0-9]+(\.[0-9]+)?$/.test(src)) return { ok: true, ...formatValue(Number(src)) };
  if (/^"(.*)"$/.test(src) || /^'(.*)'$/.test(src)) return { ok: true, ...formatValue(src.slice(1, -1)) };
  if (src === "true" || src === "false") return { ok: true, ...formatValue(src === "true") };
  if (src === "null") return { ok: true, ...formatValue(null) };
  if (!/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[\d+\]|\["[^"]*"\]|\['[^']*'\])*$/.test(src)) {
    return { ok: false, error: "unsupported expression (identifiers, .prop, [n] only)" };
  }
  const chain = getScopeChain(thread);
  // B"H: also resolve through thread.environment (top-level vars live there).
  if (thread.environment && typeof thread.environment === "object") {
    chain.push({ level: chain.length, scope: thread.environment });
  }
  const lookup = (name) => {
    for (const { scope } of chain) {
      if (scope && typeof scope === "object" && name in scope) return scope[name];
    }
    return undefined;
  };
  try {
    const parts = src.split(/\.|(?=\[)/).filter(Boolean);
    let current = lookup(parts[0].replace(/\[.*/, ""));
    if (current === undefined && !parts[0].includes("[")) return { ok: false, error: `'${parts[0]}' is not defined` };
    // Handle first-part index: foo[0]
    const firstIdx = parts[0].match(/\[(\d+)\]/);
    if (firstIdx) current = current?.[Number(firstIdx[1])];
    for (let i = 1; i < parts.length; i++) {
      const p = parts[i];
      if (p.startsWith("[")) {
        const m = p.match(/\[(\d+|"(?:[^"]*)"|'(?:[^']*)')\]/);
        if (!m) return { ok: false, error: `bad index '${p}'` };
        const key = /^\d+$/.test(m[1]) ? Number(m[1]) : m[1].slice(1, -1);
        current = current?.[key];
      } else {
        current = current?.[p];
      }
      if (current === undefined) break;
    }
    return { ok: true, ...formatValue(current) };
  } catch (e) {
    return { ok: false, error: String(e && e.message || e) };
  }
}
