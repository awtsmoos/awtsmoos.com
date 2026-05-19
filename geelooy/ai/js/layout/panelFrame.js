//B"H
/**
 * B"H — Adds one clean collapse frame to a panel vessel.
 *
 * Exactly one control per panel. The glyph changes direction with state:
 * left open ⇤, left closed ⇥, right open ⇥, right closed ⇤.
 */
export function mountPanelFrame({ panel, name, title, store, onLayout }) {
  panel.dataset.panel = name;
  panel.querySelector(".panel-topbar")?.remove();
  panel.insertAdjacentHTML("afterbegin", `
    <div class="panel-topbar" data-panel-rail tabindex="0" role="button" aria-label="Toggle ${title}">
      <span class="panel-title">${title}</span>
      <span class="panel-actions">
        <button data-panel-action="toggle" title="Collapse / expand" aria-label="Collapse or expand ${title}"></button>
      </span>
    </div>`);

  const rail = panel.querySelector("[data-panel-rail]");
  const toggle = panel.querySelector("[data-panel-action='toggle']");
  const sync = () => syncGlyph(panel, name, toggle);
  sync();
  new MutationObserver(sync).observe(panel, { attributes: true, attributeFilter: ["class"] });

  rail.addEventListener("click", event => {
    const clickedButton = event.target.closest("[data-panel-action]");
    if (isClosed(panel)) return expand(panel, name, store, onLayout);
    if (clickedButton) return collapsePanel(name, store, onLayout);
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
}

function syncGlyph(panel, name, toggle) {
  const closed = isClosed(panel);
  const isRight = name === "automation";
  toggle.textContent = isRight ? (closed ? "⇤" : "⇥") : (closed ? "⇥" : "⇤");
}

function isClosed(panel) {
  return panel.classList.contains("is-collapsed") || panel.classList.contains("is-detached");
}

function collapsePanel(name, store, onLayout) {
  onLayout(store.save({ [name]: { collapsed: true, detached: false } }));
}

function expand(panel, name, store, onLayout) {
  panel.classList.remove("is-collapsed", "is-detached");
  panel.style.left = panel.style.top = panel.style.height = panel.style.width = "";
  onLayout(store.save({ [name]: { collapsed: false, detached: false } }));
}
