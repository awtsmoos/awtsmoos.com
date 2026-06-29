// B"H
export const WINDOW_SELECTOR = ".window";

export function basicSnapshot() {
  return {
    title:document.title,
    windows:[...document.querySelectorAll(WINDOW_SELECTOR)].map(windowInfo),
    fullscreen:!!document.fullscreenElement
  };
}

export function windowInfo(element) {
  const rect = element.getBoundingClientRect?.();
  return {
    id:windowId(element),
    processId:datasetValue(element, "processId"),
    title:element.querySelector(".window-header")?.textContent?.trim() || element.textContent.slice(0, 80),
    className:element.className,
    rect:rect ? { x:rect.x, y:rect.y, width:rect.width, height:rect.height } : null
  };
}

export function startMenuItems() {
  return [...document.querySelectorAll("#menu-items li")]
    .map(item => item.textContent.trim())
    .filter(Boolean);
}

function windowId(element) {
  return datasetValue(element, "windowId") || datasetValue(element, "id") || "";
}

function datasetValue(element, key) {
  const attr = key === "windowId" ? "data-window-id" : `data-${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}`;
  return element?.dataset?.[key] || element?.getAttribute?.(attr) || "";
}

/**
 * B"H
 * DOM snapshots are the mirror-water of the Virtual OS. Windows now reveal a
 * stable public name: `.window` with `data-window-id`, so remote eyes do not
 * chase generated CSS smoke.
 */
