//B"H
/** Wires splitters that resize the sidebar, automation panel, and composer. */
export function mountResizeHandles({ dom, store, onLayout }) {
  wirePanelHandle(dom.leftResizer, "sidebar", 220, 520, store, onLayout, 1);
  wirePanelHandle(dom.rightResizer, "automation", 240, 560, store, onLayout, -1);
  wireVertical(dom.composerResizer, store, onLayout);
}

function wirePanelHandle(handle, panelName, min, max, store, onLayout, direction) {
  if (!handle) return;
  handle.addEventListener("pointerdown", event => {
    event.preventDefault();
    const mobile = isMobile();
    const startLayout = store.load();
    const panel = handleForPanel(handle, panelName);
    const start = { x: event.clientX, y: event.clientY, layout: startLayout, height: panel?.getBoundingClientRect?.().height || 0 };
    handle.setPointerCapture?.(event.pointerId);
    handle.onpointermove = move => mobile
      ? resizeMobilePanel(panel, panelName, start, move)
      : resizeDesktopPanel(panelName, min, max, direction, start, move, store, onLayout);
    handle.onpointerup = handle.onpointercancel = () => { handle.onpointermove = handle.onpointerup = handle.onpointercancel = null; };
  });
}

function resizeDesktopPanel(panelName, min, max, direction, start, move, store, onLayout) {
  const dx = (move.clientX - start.x) * direction;
  const width = clamp(start.layout[panelName].width + dx, min, max);
  onLayout(store.save({ [panelName]: { width } }));
}

function resizeMobilePanel(panel, panelName, start, move) {
  if (!panel) return;
  const delta = move.clientY - start.y;
  const height = clamp(start.height + delta, 72, Math.round(globalThis.innerHeight * .72));
  panel.style.maxHeight = `${height}px`;
  panel.classList.toggle("is-mobile-resizing", true);
  document.body.dataset[`${panelName}Collapsed`] = "false";
}

function wireVertical(handle, store, onLayout) {
  if (!handle) return;
  handle.addEventListener("pointerdown", event => {
    event.preventDefault();
    const start = { y: event.clientY, height: store.load().composer.height };
    handle.setPointerCapture?.(event.pointerId);
    handle.onpointermove = move => {
      const height = clamp(start.height - (move.clientY - start.y), 72, isMobile() ? 220 : 260);
      onLayout(store.save({ composer: { height } }));
    };
    handle.onpointerup = handle.onpointercancel = () => { handle.onpointermove = handle.onpointerup = handle.onpointercancel = null; };
  });
}

function handleForPanel(handle, panelName) {
  return document.getElementById(panelName === "sidebar" ? "sidebar" : "automation-panel") || handle.closest?.("aside");
}
function isMobile() { return Boolean(globalThis.matchMedia?.("(max-width: 680px)")?.matches); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
