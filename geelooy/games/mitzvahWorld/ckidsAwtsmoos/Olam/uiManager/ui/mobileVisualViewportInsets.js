// B"H
/** @file mobileVisualViewportInsets.js @description CSS bottom inset for browser chrome / visual viewport gaps. */
const KEY = "__awtsMobileVisualViewportInsets";

function bottomGap(win) {
  const vv = win?.visualViewport;
  if (!vv) return 0;
  return Math.max(0, Math.round((win.innerHeight || vv.height) - vv.height - vv.offsetTop));
}

function apply(doc, win) {
  const gap = bottomGap(win);
  doc?.documentElement?.style?.setProperty("--awts-visual-bottom", `${gap}px`);
  return gap;
}

/** Installs resize/scroll listeners once; no per-frame polling. */
export function installMobileVisualViewportInsets(doc = globalThis.document, win = globalThis.window) {
  if (!doc || !win) return 0;
  const current = apply(doc, win);
  if (win[KEY]) return current;
  const update = () => apply(doc, win);
  win[KEY] = true;
  win.visualViewport?.addEventListener?.("resize", update, { passive:true });
  win.visualViewport?.addEventListener?.("scroll", update, { passive:true });
  win.addEventListener?.("resize", update, { passive:true });
  win.addEventListener?.("orientationchange", () => setTimeout(update, 120), { passive:true });
  return current;
}

export default installMobileVisualViewportInsets;
