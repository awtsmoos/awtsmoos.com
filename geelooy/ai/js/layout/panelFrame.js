//B"H
/**
 * B"H — Adds one clean collapse/fullscreen frame to a panel vessel.
 *
 * Each side panel now has three honest controls: collapse, fullscreen, and a
 * compact rail that expands on click. State is stored in LayoutStore so the
 * cockpit remembers what the user made large or small.
 */
export function mountPanelFrame({ panel, name, title, store, onLayout }) {
  panel.dataset.panel = name;
  panel.querySelector(".panel-topbar")?.remove();
  panel.insertAdjacentHTML("afterbegin", `
    <div class="panel-topbar" data-panel-rail tabindex="0" role="button" aria-label="Toggle ${title}">
      <span class="panel-title">${title}</span>
      <span class="panel-actions">
        <button data-panel-action="toggle" title="Collapse / expand" aria-label="Collapse or expand ${title}"></button>
        <button data-panel-action="fullscreen" title="Fullscreen" aria-label="Fullscreen ${title}">⛶</button>
      </span>
    </div>`);

  const rail = panel.querySelector("[data-panel-rail]");
  const toggle = panel.querySelector("[data-panel-action='toggle']");
  const full = panel.querySelector("[data-panel-action='fullscreen']");
  const sync = () => syncGlyph(panel, name, toggle, full);
  sync();
  new MutationObserver(sync).observe(panel, { attributes: true, attributeFilter: ["class"] });

  rail.addEventListener("click", event => {
    const button = event.target.closest("[data-panel-action]");
    if (button?.dataset.panelAction === "fullscreen") return toggleFullscreen(name, store, onLayout);
    if (isClosed(panel)) return expand(panel, name, store, onLayout);
    if (button) return collapsePanel(name, store, onLayout);
  });

  rail.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (isClosed(panel)) expand(panel, name, store, onLayout);
    else collapsePanel(name, store, onLayout);
  });

  toggle.onclick = event => event.stopPropagation();
  toggle.addEventListener("click", () => {
    if (isClosed(panel)) expand(panel, name, store, onLayout);
    else collapsePanel(name, store, onLayout);
  });

  full.onclick = event => event.stopPropagation();
  full.addEventListener("click", () => toggleFullscreen(name, store, onLayout));
}

function syncGlyph(panel, name, toggle, full) {
  const closed = isClosed(panel);
  const fullscreen = panel.classList.contains("is-panel-fullscreen");
  const isRight = name === "automation";
  toggle.textContent = isRight ? (closed ? "⇤" : "⇥") : (closed ? "⇥" : "⇤");
  full.textContent = fullscreen ? "↙" : "⛶";
  full.setAttribute("aria-pressed", String(fullscreen));
  full.title = fullscreen ? "Exit fullscreen" : "Fullscreen";
}

function isClosed(panel) {
  return panel.classList.contains("is-collapsed") || panel.classList.contains("is-detached");
}

function collapsePanel(name, store, onLayout) {
  onLayout(store.save({ [name]: { collapsed: true, detached: false, fullscreen: false } }));
}

function expand(panel, name, store, onLayout) {
  panel.classList.remove("is-collapsed", "is-detached");
  panel.style.left = panel.style.top = panel.style.height = panel.style.width = "";
  onLayout(store.save({ [name]: { collapsed: false, detached: false, fullscreen: false } }));
}

function toggleFullscreen(name, store, onLayout) {
  const layout = store.load();
  const current = Boolean(layout?.[name]?.fullscreen);
  onLayout(store.save({ [name]: { collapsed: false, detached: false, fullscreen: !current } }));
}
