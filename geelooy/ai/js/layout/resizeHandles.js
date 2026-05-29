//B"H
/**
 * B"H
 * Chapter 131: The Divider Bar Became A Handle, Not A Decoration.
 *
 * The resizers write into LayoutStore and immediately re-apply the real CSS
 * variables. Pointer capture stays on the handle, while document-level cleanup
 * prevents stuck drag state if the cursor leaves the thin bar.
 */
export function mountResizeHandles({ dom, store, onLayout }) {
  wirePanelHandle(dom.leftResizer, "sidebar", 220, 560, store, onLayout, 1);
  wirePanelHandle(dom.rightResizer, "automation", 240, 620, store, onLayout, -1);
  wireVertical(dom.composerResizer, store, onLayout);
}

function wirePanelHandle(handle, panelName, min, max, store, onLayout, direction) {
  if (!handle) return;
  handle.hidden = false;
  handle.setAttribute("role", "separator");
  handle.setAttribute("aria-orientation", "vertical");
  handle.addEventListener("pointerdown", event => {
    event.preventDefault();
    const mobile = isMobile();
    const startLayout = store.load();
    const panel = handleForPanel(panelName);
    const start = { x: event.clientX, y: event.clientY, layout: startLayout, height: panel?.getBoundingClientRect?.().height || 0 };
    handle.setPointerCapture?.(event.pointerId);
    document.body.classList.add("is-resizing-panels");
    const moveHandler = move => mobile
      ? resizeMobilePanel(panel, panelName, start, move, store, onLayout)
      : resizeDesktopPanel(panelName, min, max, direction, start, move, store, onLayout);
    const done = () => {
      document.body.classList.remove("is-resizing-panels");
      panel?.classList?.remove?.("is-mobile-resizing");
      handle.removeEventListener("pointermove", moveHandler);
      handle.removeEventListener("pointerup", done);
      handle.removeEventListener("pointercancel", done);
    };
    handle.addEventListener("pointermove", moveHandler);
    handle.addEventListener("pointerup", done, { once: true });
    handle.addEventListener("pointercancel", done, { once: true });
  });
}

function resizeDesktopPanel(panelName, min, max, direction, start, move, store, onLayout) {
  move.preventDefault?.();
  const dx = (move.clientX - start.x) * direction;
  const current = Number(start.layout[panelName]?.width || min);
  const width = clamp(current + dx, min, max);
  onLayout(store.save({ [panelName]: { width, collapsed: false, detached: false, fullscreen: false } }));
}

function resizeMobilePanel(panel, panelName, start, move, store, onLayout) {
  if (!panel) return;
  move.preventDefault?.();
  const delta = move.clientY - start.y;
  const height = clamp(start.height + delta, 120, Math.round(globalThis.innerHeight * .78));
  const key = panelName === "sidebar" ? "sidebarHeight" : "automationHeight";
  panel.classList.toggle("is-mobile-resizing", true);
  onLayout(store.save({ [panelName]: { collapsed: false }, mobile: { [key]: height } }));
}

function wireVertical(handle, store, onLayout) {
  if (!handle) return;
  handle.hidden = false;
  handle.setAttribute("role", "separator");
  handle.setAttribute("aria-orientation", "horizontal");
  handle.addEventListener("pointerdown", event => {
    event.preventDefault();
    const start = { y: event.clientY, height: store.load().composer.height };
    handle.setPointerCapture?.(event.pointerId);
    document.body.classList.add("is-resizing-panels");
    const moveHandler = move => {
      move.preventDefault?.();
      const height = clamp(start.height - (move.clientY - start.y), 72, isMobile() ? 240 : 300);
      onLayout(store.save({ composer: { height } }));
    };
    const done = () => {
      document.body.classList.remove("is-resizing-panels");
      handle.removeEventListener("pointermove", moveHandler);
      handle.removeEventListener("pointerup", done);
      handle.removeEventListener("pointercancel", done);
    };
    handle.addEventListener("pointermove", moveHandler);
    handle.addEventListener("pointerup", done, { once: true });
    handle.addEventListener("pointercancel", done, { once: true });
  });
}

function handleForPanel(panelName) {
  return document.getElementById(panelName === "sidebar" ? "sidebar" : "automation-panel");
}
function isMobile() { return Boolean(globalThis.matchMedia?.("(max-width: 760px)")?.matches); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
