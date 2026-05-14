
// B"H

function safeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', "&quot;");
}

function splitRelative(path) {
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

function splitAbsolute(path) {
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

export function renderRelativeCrumbs(container, path, onPick) {
  container.innerHTML = splitRelative(path).map((part, index) => {
    return [
      index ? '<span class="crumb-sep">/</span>' : "",
      '<button type="button" class="crumb-btn" data-path="' + safeHtml(part.path) + '">' + safeHtml(part.label) + "</button>"
    ].join("");
  }).join("");

  container.querySelectorAll(".crumb-btn").forEach(btn => {
    btn.onclick = () => onPick(btn.dataset.path);
  });
}

export function renderAbsoluteCrumbs(container, path, onPick) {
  container.innerHTML = splitAbsolute(path).map((part, index) => {
    return [
      index ? '<span class="crumb-sep">›</span>' : "",
      '<button type="button" class="crumb-btn" data-path="' + safeHtml(part.path) + '">' + safeHtml(part.label) + "</button>"
    ].join("");
  }).join("");

  container.querySelectorAll(".crumb-btn").forEach(btn => {
    btn.onclick = () => onPick(btn.dataset.path);
  });
}
