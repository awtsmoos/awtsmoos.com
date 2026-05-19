//B"H
/** Adds one clean detach/collapse/drag frame to a panel vessel. */
export function mountPanelFrame({ panel, name, title, store, onLayout }) {
  panel.dataset.panel = name;
  panel.querySelector(".panel-topbar")?.remove();
  panel.insertAdjacentHTML("afterbegin", `
    <div class="panel-topbar" data-drag-handle>
      <span class="panel-title">${title}</span>
      <span class="panel-actions">
        <button data-panel-action="collapse" title="Collapse / expand">◐</button>
        <button data-panel-action="detach" title="Float / dock">⇱</button>
      </span>
    </div>`);
  panel.querySelector("[data-panel-action='collapse']").onclick = () => toggleCollapsed(panel, name, store, onLayout);
  panel.querySelector("[data-panel-action='detach']").onclick = () => toggleDetached(panel, name, store, onLayout);
  wireDrag(panel, name, store, onLayout);
}

function toggleCollapsed(panel, name, store, onLayout) {
  onLayout(store.save({ [name]: { collapsed: !panel.classList.contains("is-collapsed") } }));
}

function toggleDetached(panel, name, store, onLayout) {
  const detached = !panel.classList.contains("is-detached");
  const box = panel.getBoundingClientRect();
  onLayout(store.save({ [name]: { detached, collapsed: false, x: box.left, y: box.top, h: box.height, width: box.width } }));
}

function wireDrag(panel, name, store, onLayout) {
  const handle = panel.querySelector("[data-drag-handle]");
  handle.addEventListener("pointerdown", event => {
    if (!panel.classList.contains("is-detached") || event.target.closest("button")) return;
    const start = { x: event.clientX, y: event.clientY, box: panel.getBoundingClientRect() };
    handle.setPointerCapture(event.pointerId);
    handle.onpointermove = move => {
      const x = Math.max(8, Math.min(innerWidth - 72, start.box.left + move.clientX - start.x));
      const y = Math.max(8, Math.min(innerHeight - 72, start.box.top + move.clientY - start.y));
      panel.style.left = `${x}px`; panel.style.top = `${y}px`;
    };
    handle.onpointerup = () => {
      const box = panel.getBoundingClientRect();
      onLayout(store.save({ [name]: { x: box.left, y: box.top, width: box.width, h: box.height } }));
      handle.onpointermove = handle.onpointerup = null;
    };
  });
}
