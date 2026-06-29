// B"H
function elementFor(win) { return win?.win || win?.el || win?.element || win?.windowDiv || null; }
export function windowNode(win, index = 0) {
  const el = elementFor(win);
  const rect = el?.getBoundingClientRect?.();
  return { id:win?.id || win?.ID || el?.dataset?.id || `window-${index}`, type:"window", title:win?.title || el?.querySelector?.(".window-header")?.textContent?.trim() || "Window", z:index, active:!!win?.active || !!el?.classList?.contains("active"), minimized:el?.style?.display === "none", rect:rect ? { x:rect.x, y:rect.y, width:rect.width, height:rect.height } : null, programId:win?.programId || "unknown" };
}
export function windowsScene(handler) { return (handler?.windows || []).map(windowNode); }
