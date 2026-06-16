// B"H
/**
 * B"H
 * Chapter 41: The path became a guarded river.
 */
const CONTROL_RX = /[\u0000-\u001f\u007f]/;

export function normalizeVirtualPath(path = ".") {
  const raw = String(path || ".").replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");
  if (!raw || raw === ".") return ".";
  const parts = raw.split("/").filter(Boolean).map(cleanSegment);
  return parts.length ? parts.join("/") : ".";
}

export function cleanSegment(segment = "") {
  const text = decodeSafe(segment).trim();
  if (!text || text === ".") return "";
  if (text === "..") throw pathError("virtual_path_escape_blocked", text);
  if (CONTROL_RX.test(text)) throw pathError("virtual_path_control_char_blocked", text);
  if (text.includes("/") || text.includes("\\")) throw pathError("virtual_path_nested_segment_blocked", text);
  if (/^[A-Za-z]:$/.test(text) || text.includes(":")) throw pathError("virtual_path_scheme_blocked", text);
  return text;
}

export function joinVirtualPath(...parts) {
  return normalizeVirtualPath(parts.filter(Boolean).join("/"));
}

export function basename(path = ".") {
  const clean = normalizeVirtualPath(path);
  return clean === "." ? "." : clean.split("/").pop();
}

export function dirname(path = ".") {
  const clean = normalizeVirtualPath(path);
  if (clean === ".") return ".";
  const parts = clean.split("/");
  parts.pop();
  return parts.length ? parts.join("/") : ".";
}

export function decodeSafe(value = "") {
  let text = String(value || "");
  for (let i = 0; i < 2; i++) {
    try {
      const decoded = decodeURIComponent(text);
      if (decoded === text) break;
      text = decoded;
    } catch (_) { break; }
  }
  return text;
}

export function pathError(code, fragment) {
  const error = new Error(code);
  error.code = code;
  error.pathFragment = String(fragment || "");
  return error;
}
