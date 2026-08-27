// B"H
const JSON_SUFFIX = ".awtsmoosJSON";
const CONTROL_RX = /[\u0000-\u001f\u007f]/;

/**
 * B"H
 * Chapter 27: The hosted path learned to fear the serpent of dot-dot.
 *
 * Virtual OS paths are DB paths, not native disk paths, but they still need a
 * jail. Every alias and inner segment now passes through one narrow gate before
 * a DB key is composed. No drive letters, no encoded traversal, no control
 * bytes, no hidden slashes inside a segment.
 */
function decodeSafe(value = "") {
  let text = String(value || "");
  for (let i = 0; i < 2; i++) {
    try {
      const decoded = decodeURIComponent(text);
      if (decoded === text) break;
      text = decoded;
    } catch (_) {
      break;
    }
  }
  return text;
}

function stripJsonSuffix(value = "") {
  const text = String(value || "");
  return text.endsWith(JSON_SUFFIX) ? text.slice(0, -JSON_SUFFIX.length) : text;
}

function cleanSegment(segment = "") {
  const raw = stripJsonSuffix(decodeSafe(segment).trim());
  if (!raw || raw === ".") return "";
  if (raw === "..") throw jailError("virtual_os_path_escape_blocked", raw);
  if (CONTROL_RX.test(raw)) throw jailError("virtual_os_control_char_blocked", raw);
  if (/^[A-Za-z]:$/.test(raw) || raw.includes(":")) throw jailError("virtual_os_drive_or_scheme_blocked", raw);
  if (raw.includes("/") || raw.includes("\\")) throw jailError("virtual_os_nested_segment_blocked", raw);
  return raw;
}

function cleanPath(path = ".") {
  const raw = decodeSafe(path).replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");
  if (!raw || raw === ".") return ".";
  const parts = raw.split("/").map(cleanSegment).filter(Boolean);
  return parts.length ? parts.join("/") : ".";
}

function splitPath(path = ".") {
  const clean = cleanPath(path);
  if (clean === ".") return { root: true, aliasId: "", innerPath: "" };
  const parts = clean.split("/").filter(Boolean);
  const aliasId = cleanSegment(parts.shift() || "");
  if (!aliasId) throw jailError("virtual_os_alias_required", path);
  return { root: false, aliasId, innerPath: parts.map(cleanSegment).filter(Boolean).join("/") };
}

function dbPath(sp, aliasId, innerPath = "") {
  const safeAlias = cleanSegment(aliasId);
  if (!safeAlias) throw jailError("virtual_os_alias_required", aliasId);
  const safeInner = cleanPath(innerPath);
  const suffix = safeInner === "." ? "" : safeInner;
  return `${sp}/aliases/${safeAlias}/fileSystem/${suffix}`;
}

function assertSafePath(path = ".") {
  return splitPath(path);
}

function jailError(code, value) {
  const error = new Error(code);
  error.code = code;
  error.status = 400;
  error.pathFragment = String(value || "");
  return error;
}

module.exports = { JSON_SUFFIX, CONTROL_RX, assertSafePath, cleanPath, cleanSegment, dbPath, decodeSafe, jailError, splitPath, stripJsonSuffix };
