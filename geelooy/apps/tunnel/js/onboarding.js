// B"H

/**
 * B"H
 * Guided first-run for the Tunnel Console: the visitor chooses a real
 * connection method, is pointed at the matching real panel or app, and
 * finishes with the harmless installer-endpoint check that already lives
 * on this page. Nothing here simulates progress — every step is a link,
 * a chooser, or the live status refresh.
 */

const METHODS = {
  native: {
    label: "Native tunnel on your own computer",
    next: "#install",
    detail: "Full local filesystem, shell, Chrome and servers. Pick your platform tab in the install panel — we preselected the likely one, change it freely."
  },
  browser: {
    label: "Browser tunnel — no install",
    next: "#browser-mode",
    detail: "This tab registers as a tunnel with a small browser-local workspace. Sandboxed by the browser; no local filesystem beyond what you mount in the code editor."
  },
  virtual: {
    label: "Virtual OS / existing remote — no install",
    next: "#no-install",
    detail: "Work in the hosted Virtual OS, the browser code editor, or an already-connected remote device. Nothing is installed and no local files move without your say."
  }
};

/** Preselects the install tab matching the visitor's platform. */
export function detectInstallTab() {
  const ua = String(navigator.userAgent || "");
  if (/Windows/i.test(ua)) return "powershell";
  if (/Mac|Linux|X11/i.test(ua)) return "unix";
  return null;
}

/** Mounts the method chooser and the platform preselection. */
export function mountOnboarding() {
  const root = document.getElementById("onboarding");
  if (!root) return;
  const detail = document.getElementById("onboardDetail");
  const go = document.getElementById("onboardGo");
  const choose = (key) => {
    const method = METHODS[key];
    if (!method) return;
    for (const btn of root.querySelectorAll("[data-method]")) {
      const on = btn.dataset.method === key;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    }
    if (detail) detail.textContent = method.detail;
    if (go) { go.textContent = `Continue: ${method.label}`; go.setAttribute("href", method.next); }
  };
  for (const btn of root.querySelectorAll("[data-method]")) {
    btn.addEventListener("click", () => choose(btn.dataset.method));
  }
  const tab = detectInstallTab();
  if (tab) {
    const tabButton = document.querySelector(`[data-tab="${tab}"]`);
    if (tabButton && !tabButton.classList.contains("active")) tabButton.click();
    const note = document.getElementById("platformNote");
    if (note) note.textContent = `Detected platform tab: ${tab === "powershell" ? "Windows PowerShell" : "Mac / Linux"} — choose another tab any time.`;
  }
  choose("native");
}
