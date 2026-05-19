//B"H
/** Wires splitters that resize the sidebar, automation panel, and composer. */
export function mountResizeHandles({ dom, store, onLayout }) {
  wireHorizontal(dom.leftResizer, "sidebar", 220, 520, store, onLayout, 1);
  wireHorizontal(dom.rightResizer, "automation", 240, 560, store, onLayout, -1);
  wireVertical(dom.composerResizer, store, onLayout);
}

function wireHorizontal(handle, panelName, min, max, store, onLayout, direction) {
  if (!handle) return;
  handle.addEventListener("pointerdown", event => {
    const start = { x: event.clientX, layout: store.load() };
    handle.setPointerCapture(event.pointerId);
    handle.onpointermove = move => {
      const dx = (move.clientX - start.x) * direction;
      const width = clamp(start.layout[panelName].width + dx, min, max);
      onLayout(store.save({ [panelName]: { width } }));
    };
    handle.onpointerup = () => { handle.onpointermove = handle.onpointerup = null; };
  });
}

function wireVertical(handle, store, onLayout) {
  if (!handle) return;
  handle.addEventListener("pointerdown", event => {
    const start = { y: event.clientY, height: store.load().composer.height };
    handle.setPointerCapture(event.pointerId);
    handle.onpointermove = move => {
      const height = clamp(start.height - (move.clientY - start.y), 72, 260);
      onLayout(store.save({ composer: { height } }));
    };
    handle.onpointerup = () => { handle.onpointermove = handle.onpointerup = null; };
  });
}
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
