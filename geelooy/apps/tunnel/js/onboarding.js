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

/**
 * The ONE platform detection for this page. A single result drives both
 * the preselected install tab and the "Detected platform tab" label, so
 * the two can never disagree (Run 11: previously the label came from a
 * lumped Mac|Linux regex while the tab depended on a synthetic click
 * that raced the tab wiring in ui.js — the label said "Mac / Linux"
 * while the PowerShell tab stayed selected).
 *
 * @param {string} [ua] User agent to classify; defaults to the browser's.
 * @returns {{id: string, platform: string|null, tab: string,
 *   tabName: string, note: string}} Detection result. `tab` is the
 *   data-tab id to preselect; `note` is the exact label to print.
 */
export function detectPlatform(ua) {
  const text = String(ua != null ? ua
    : (typeof navigator !== "undefined" ? navigator.userAgent || "" : ""));
  if (/Windows/i.test(text)) {
    return {
      id: "windows", platform: "Windows", tab: "powershell",
      tabName: "Windows PowerShell",
      note: "Detected platform tab: Windows PowerShell (detected: Windows) — choose another tab any time."
    };
  }
  if (/Macintosh|Mac OS X/i.test(text)) {
    return {
      id: "macos", platform: "macOS", tab: "unix",
      tabName: "Mac / Linux",
      note: "Detected platform tab: Mac / Linux (detected: macOS) — choose another tab any time."
    };
  }
  if (/Linux|X11|Android/i.test(text)) {
    return {
      id: "linux", platform: "Linux", tab: "unix",
      tabName: "Mac / Linux",
      note: "Detected platform tab: Mac / Linux (detected: Linux) — choose another tab any time."
    };
  }
  return {
    id: "unknown", platform: null, tab: "powershell",
    tabName: "Windows PowerShell",
    note: "Platform not detected — Windows PowerShell tab shown by default; choose another tab any time."
  };
}

/** Back-compat: the install tab id for a user agent. */
export function detectInstallTab(ua) {
  return detectPlatform(ua).tab;
}

/**
 * Applies an install-tab selection directly to the DOM — the same class
 * and ARIA changes activateTab() makes in ui.js — instead of a synthetic
 * click. A click only works once main.js has wired the tab listeners,
 * but this module self-mounts before main.js runs, so the click was a
 * no-op and the hardcoded default tab survived. Direct application is
 * order-independent; the later listener wiring preserves the state.
 */
function selectInstallTab(tab) {
  const all = (sel) => {
    try {
      return document.querySelectorAll ? [...document.querySelectorAll(sel)] : [];
    } catch (e) { return []; }
  };
  const tabs = all("[data-tab]");
  if (!tabs.length) {
    const btn = document.querySelector
      ? document.querySelector(`[data-tab="${tab}"]`) : null;
    if (btn && !btn.classList.contains("active")) btn.click();
    return;
  }
  for (const one of tabs) {
    const on = one.dataset.tab === tab;
    one.classList.toggle("active", on);
    one.setAttribute("aria-selected", on ? "true" : "false");
  }
  for (const pane of all("[data-pane]")) {
    pane.classList.toggle("active", pane.dataset.pane === tab);
  }
}

/** Mounts the method chooser and the platform preselection. */
export function mountOnboarding() {
  const root = document.getElementById("onboarding");
  if (!root || root.dataset.onboardingMounted) return;
  root.dataset.onboardingMounted = "1";
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
  const detected = detectPlatform();
  selectInstallTab(detected.tab);
  const note = document.getElementById("platformNote");
  if (note) note.textContent = detected.note;
  choose("native");
}

// B"H — Self-mount: index.html also loads this module directly, so the
// chooser works even if the main module graph fails or serves stale.
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => mountOnboarding(), { once: true });
  } else {
    mountOnboarding();
  }
}
