// B"H
/**
 * B"H
 * Chapter 42: Responses learned to carry the same face in every vessel.
 */
export function okResult(action, data = {}) {
  return { ok: true, action, ...data };
}

export function failResult(action, error, data = {}) {
  return { ok: false, action, error: error?.message || String(error || "unknown_error"), code: error?.code || data.code || "virtual_fs_error", ...data };
}

export function listItem({ name, path, kind = "file", size = 0, lastModified = 0, extra = {} } = {}) {
  return { name, path, kind, type: kind, isDirectory: kind === "directory", size, lastModified, ...extra };
}

export function listResult(action, path, items = [], data = {}) {
  return okResult(action, { path, items, detailedItems: items, count: items.length, ...data });
}

export function readResult(action, path, content = "", { offsetChars = 0, maxChars = null } = {}) {
  const text = String(content ?? "");
  const offset = Number(offsetChars || 0);
  const max = maxChars === null || maxChars === undefined ? text.length : Number(maxChars);
  const page = text.slice(offset, offset + max);
  return okResult(action, { path, content: page, totalChars: text.length, offsetChars: offset, nextOffsetChars: offset + max < text.length ? offset + max : null });
}

export function commandResult({ command = "", cwd = ".", stdout = "", stderr = "", exitCode = 0, simulated = false, data = {} } = {}) {
  return okResult("commandRun", { command, cwd, stdout, stderr, exitCode, simulated, ...data, ok: exitCode === 0 });
}
