
// B"H

import { $ } from "../lib/dom.js";

export function mountCopyButtons() {
  for (const btn of document.querySelectorAll("[data-copy]")) {
    btn.addEventListener("click", async () => {
      const el = $(btn.dataset.copy);
      await navigator.clipboard.writeText(el.textContent || el.value || "");
      const old = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(() => btn.textContent = old, 900);
    });
  }
}
