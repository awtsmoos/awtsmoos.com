// B"H

import { el, text } from "./dom.js";

/**
 * B"H
 * Chapter 411: The Preview Dock Became A Quiet Mirror.
 */
export function mountPreviewDock(root) {
  const meta = el("div", { classes: ["awt-preview-meta"] });
  const body = text("pre", "Open a file in Explorer to mirror its preview here.");
  const dock = el("section", { classes: ["awt-preview-dock"], children: [text("h3", "File Preview Dock"), meta, body] });
  root.append(dock);
  setInterval(() => sync(meta, body), 1800);
  sync(meta, body);
}

function sync(meta, body) {
  const preview = document.getElementById("explorerPreview") || document.querySelector("[data-viewer]");
  const path = document.getElementById("explorerPath")?.value || "Project root";
  meta.textContent = `Source: ${path}`;
  const content = preview?.textContent?.trim();
  body.textContent = content ? content.slice(0, 900) : "No explorer preview loaded yet.";
}
