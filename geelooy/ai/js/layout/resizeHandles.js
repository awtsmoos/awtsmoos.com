//B"H
/**
 * B"H
 * Chapter 192: The Divider Bar Learned To Hear Beyond Its Own Skin.
 *
 * A seven-pixel handle is too narrow to imprison the user's drag. The Awtsmoos
 * gives the first touch to the handle, then the whole window listens until the
 * motion ends. Width is written into the real LayoutStore, the real CSS
 * variables are applied instantly, and no collapsed ghost is allowed to hide the
 * right resizer while the human is drawing the cockpit wider.
 */
export function mountResizeHandles({ dom, store, onLayout }) {
  wirePanelHandle(dom.leftResizer, "sidebar", 220, 560, store, onLayout, 1);
  wirePanelHandle(dom.rightResizer, "automation", 240, 620, store, onLayout, -1);
  wireVertical(dom.composerResizer, store, onLayout);
}

/**
 * Wires one vertical panel divider.
 *
 * @param {HTMLElement} handle Thin resize bar.
 * @param {"sidebar"|"automation"} panelName Layout key.
 * @param {number} min Minimum desktop width.
 * @param {number} max Maximum desktop width.
 * @param {object} store LayoutStore instance.
 * @param {Function} onLayout Immediate layout applier.
 * @param {1|-1} direction Drag direction multiplier.
 * @returns {void}
 */
function wirePanelHandle(handle, panelName, min, max, store, onLayout, direction) {
  if (!handle) return;
  handle.hidden = false;
  handle.setAttribute("role", "separator");
  handle.setAttribute("aria-orientation", "vertical");
  handle.addEventListener("pointerdown", event => beginPanelDrag(event, { handle, panelName, min, max, store, onLayout, direction }));
}

/** @param {PointerEvent} event Start event. @param {object} ctx Drag context. @returns {void} */
function beginPanelDrag(event, ctx) {
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  const panel = handleForPanel(ctx.panelName);
  const start = snapshotStart(event, panel, ctx.store, ctx.panelName, ctx.min);
  ctx.handle.setPointerCapture?.(event.pointerId);
  document.body.classList.add("is-resizing-panels");
  document.body.dataset.resizingPanel = ctx.panelName;
  const moveHandler = move => isMobile()
    ? resizeMobilePanel(panel, ctx.panelName, start, move, ctx.store, ctx.onLayout)
    : resizeDesktopPanel(ctx.panelName, ctx.min, ctx.max, ctx.direction, start, move, ctx.store, ctx.onLayout);
  const done = () => endDrag(ctx.handle, moveHandler, done, panel);
  window.addEventListener("pointermove", moveHandler, { passive: false });
  window.addEventListener("pointerup", done, { once: true });
  window.addEventListener("pointercancel", done, { once: true });
}

/** @param {PointerEvent} event Pointer start. @param {Element} panel Panel. @param {object} store Store. @param {string} panelName Key. @param {number} fallback Fallback width. @returns {object} Drag start. */
function snapshotStart(event, panel, store, panelName, fallback) {
  const layout = store.load();
  const rect = panel?.getBoundingClientRect?.();
  const width = Number(layout[panelName]?.width || rect?.width || fallback);
  return { x: event.clientX, y: event.clientY, layout, width, height: rect?.height || 0 };
}

/** @param {string} panelName Panel key. @param {number} min Min width. @param {number} max Max width. @param {number} direction Direction. @param {object} start Start state. @param {PointerEvent} move Move event. @param {object} store Store. @param {Function} onLayout Apply layout. @returns {void} */
function resizeDesktopPanel(panelName, min, max, direction, start, move, store, onLayout) {
  move.preventDefault?.();
  const dx = (move.clientX - start.x) * direction;
  const width = clamp(start.width + dx, min, max);
  onLayout(store.save({ [panelName]: { width, collapsed: false, detached: false, fullscreen: false } }));
}

/** @param {Element} panel Panel. @param {string} panelName Key. @param {object} start Start state. @param {PointerEvent} move Move event. @param {object} store Store. @param {Function} onLayout Apply layout. @returns {void} */
function resizeMobilePanel(panel, panelName, start, move, store, onLayout) {
  if (!panel) return;
  move.preventDefault?.();
  const delta = move.clientY - start.y;
  const height = clamp(start.height + delta, 120, Math.round(globalThis.innerHeight * .78));
  const key = panelName === "sidebar" ? "sidebarHeight" : "automationHeight";
  panel.classList.toggle("is-mobile-resizing", true);
  onLayout(store.save({ [panelName]: { collapsed: false }, mobile: { [key]: height } }));
}

/** @param {HTMLElement} handle Handle. @param {Function} moveHandler Move listener. @param {Function} done Done listener. @param {Element} panel Panel. @returns {void} */
function endDrag(handle, moveHandler, done, panel) {
  document.body.classList.remove("is-resizing-panels");
  delete document.body.dataset.resizingPanel;
  panel?.classList?.remove?.("is-mobile-resizing");
  window.removeEventListener("pointermove", moveHandler);
  window.removeEventListener("pointerup", done);
  window.removeEventListener("pointercancel", done);
  try { handle.releasePointerCapture?.(event?.pointerId); } catch {}
}

/** @param {HTMLElement} handle Horizontal composer handle. @param {object} store Store. @param {Function} onLayout Apply layout. @returns {void} */
function wireVertical(handle, store, onLayout) {
  if (!handle) return;
  handle.hidden = false;
  handle.setAttribute("role", "separator");
  handle.setAttribute("aria-orientation", "horizontal");
  handle.addEventListener("pointerdown", event => beginComposerDrag(event, handle, store, onLayout));
}

/** @param {PointerEvent} event Start event. @param {HTMLElement} handle Handle. @param {object} store Store. @param {Function} onLayout Apply layout. @returns {void} */
function beginComposerDrag(event, handle, store, onLayout) {
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  const start = { y: event.clientY, height: store.load().composer.height };
  handle.setPointerCapture?.(event.pointerId);
  document.body.classList.add("is-resizing-panels");
  const moveHandler = move => {
    move.preventDefault?.();
    const height = clamp(start.height - (move.clientY - start.y), 72, isMobile() ? 240 : 300);
    onLayout(store.save({ composer: { height } }));
  };
  const done = () => endDrag(handle, moveHandler, done, null);
  window.addEventListener("pointermove", moveHandler, { passive: false });
  window.addEventListener("pointerup", done, { once: true });
  window.addEventListener("pointercancel", done, { once: true });
}

/** @param {string} panelName Layout key. @returns {HTMLElement|null} Panel element. */
function handleForPanel(panelName) {
  return document.getElementById(panelName === "sidebar" ? "sidebar" : "automation-panel");
}

/** @returns {boolean} Whether the mobile layout is active. */
function isMobile() {
  return Boolean(globalThis.matchMedia?.("(max-width: 760px)")?.matches);
}

/** @param {number} value Value. @param {number} min Minimum. @param {number} max Maximum. @returns {number} Clamped value. */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)));
}
