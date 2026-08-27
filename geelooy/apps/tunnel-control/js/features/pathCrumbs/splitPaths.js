// B"H

/**
 * B"H
 * Chapter 379: Paths Split Without Losing Their Steps.
 */
export function splitRelative(path) {
  const p = String(path || ".").replace(/\\/g, "/");

  if (p === "." || p === "") {
    return [{ label: ".", path: "." }];
  }

  const parts = p.split("/").filter(Boolean);
  const out = [{ label: ".", path: "." }];
  let current = "";

  for (const part of parts) {
    current = current ? current + "/" + part : part;
    out.push({ label: part, path: current });
  }

  return out;
}

export function splitAbsolute(path) {
  const p = String(path || "__ROOTS__");

  if (p === "__ROOTS__") {
    return [{ label: "Computer", path: "__ROOTS__" }];
  }

  const normalized = p.replace(/\//g, "\\");
  const parts = normalized.split("\\").filter(Boolean);
  const out = [];

  if (/^[A-Za-z]:/.test(parts[0] || "")) {
    let current = parts[0] + "\\";
    out.push({ label: parts[0], path: current });

    for (const part of parts.slice(1)) {
      current = current.replace(/\\$/, "") + "\\" + part;
      out.push({ label: part, path: current });
    }

    return out;
  }

  let current = normalized.startsWith("\\") ? "\\" : "";

  for (const part of parts) {
    current = current ? current.replace(/\\$/, "") + "\\" + part : part;
    out.push({ label: part, path: current });
  }

  return out.length ? out : [{ label: normalized, path: normalized }];
}
