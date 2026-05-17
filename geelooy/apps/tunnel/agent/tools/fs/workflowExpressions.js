// B"H

function getPath(obj, dotted) {
  return String(dotted || "").split(".").filter(Boolean).reduce((cur, key) => cur == null ? undefined : cur[key], obj);
}

function setPath(obj, dotted, value) {
  const parts = String(dotted || "").split(".").filter(Boolean);
  let cur = obj;
  while (parts.length > 1) {
    const key = parts.shift();
    cur[key] = cur[key] && typeof cur[key] === "object" ? cur[key] : {};
    cur = cur[key];
  }
  cur[parts[0]] = value;
}

function resolveString(text, ctx) {
  return String(text).replace(/\$([a-zA-Z0-9_.]+)/g, (_m, path) => {
    const got = getPath(ctx, path);
    return got == null ? "" : String(got);
  });
}

function resolveValue(value, ctx) {
  if (typeof value === "string") return resolveString(value, ctx);
  if (Array.isArray(value)) return value.map(x => resolveValue(x, ctx));
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) out[key] = resolveValue(val, ctx);
    return out;
  }
  return value;
}

function testCondition(cond, ctx) {
  if (!cond) return true;
  if (cond.and) return cond.and.every(x => testCondition(x, ctx));
  if (cond.or) return cond.or.some(x => testCondition(x, ctx));
  if (cond.not) return !testCondition(cond.not, ctx);

  const got = getPath(ctx, String(cond.path || "").replace(/^\$/, ""));
  if ("exists" in cond) return (got !== undefined && got !== null) === !!cond.exists;
  if ("equals" in cond) return got === cond.equals;
  if ("notEquals" in cond) return got !== cond.notEquals;
  if ("contains" in cond) return String(got || "").includes(String(cond.contains));
  if ("gt" in cond) return Number(got) > Number(cond.gt);
  if ("lt" in cond) return Number(got) < Number(cond.lt);
  return true;
}

module.exports = { getPath, setPath, resolveValue, testCondition };
