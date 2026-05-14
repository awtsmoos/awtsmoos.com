
// B"H

function textOf(el, fallback) {
  const h = el.querySelector(":scope > h1,:scope > h2,:scope > h3,:scope > [data-title]");
  const txt = h ? h.textContent.trim() : "";
  return txt || fallback || "Panel";
}

function iconFor(text) {
  const t = String(text || "").toLowerCase();

  if (t.includes("setup") || t.includes("root")) return "🧭";
  if (t.includes("api") || t.includes("key")) return "🔑";
  if (t.includes("file") || t.includes("explorer") || t.includes("project")) return "📁";
  if (t.includes("usage") || t.includes("rate")) return "📊";
  if (t.includes("terminal") || t.includes("command")) return "⌁";
  if (t.includes("chrome") || t.includes("browser")) return "🌐";
  if (t.includes("docs") || t.includes("instruction")) return "📜";
  if (t.includes("account") || t.includes("login")) return "👤";

  return "✦";
}

function isHeroLike(el) {
  return (
    el.matches(".hero, header, [data-hero], .landing-hero, .hero-card") ||
    el.closest(".hero, header, [data-hero], .landing-hero, .hero-card")
  );
}

function isNavLike(el) {
  return (
    el.matches("nav, [data-tabs], .tabs, .tabbar, .awt-floating-map") ||
    el.closest("nav, [data-tabs], .tabs, .tabbar, .awt-floating-map")
  );
}

function shouldWrap(el) {
  if (!el || el.dataset.awtPanelReady === "yes") return false;
  if (isHeroLike(el) || isNavLike(el)) return false;
  if (el.matches("[data-pane]")) return true;
  if (el.matches(".control-section")) return true;
  if (el.matches(".dashboard-section")) return true;
  if (el.matches(".panel-section")) return true;
  return false;
}

function rememberCollapsed(id, value) {
  try {
    localStorage.setItem("awtsmoos.panel.collapsed." + id, value ? "1" : "0");
  } catch (e) {}
}

function readCollapsed(id) {
  try {
    return localStorage.getItem("awtsmoos.panel.collapsed." + id) === "1";
  } catch (e) {
    return false;
  }
}

function makePanelShell(el, index) {
  if (!shouldWrap(el)) return;

  const id = el.id || el.dataset.pane || "panel-" + index;
  const title = textOf(el, id);
  const collapsed = readCollapsed(id);

  el.dataset.awtPanelReady = "yes";
  el.classList.add("awt-section-shell");
  el.dataset.collapsed = collapsed ? "true" : "false";

  const body = document.createElement("div");
  body.className = "awt-section-body";

  while (el.firstChild) {
    body.appendChild(el.firstChild);
  }

  const toolbar = document.createElement("div");
  toolbar.className = "awt-section-toolbar";

  const left = document.createElement("div");
  left.className = "awt-section-title";
  left.innerHTML = "<span>" + iconFor(title) + "</span><span>" + title + "</span>";

  const actions = document.createElement("div");
  actions.className = "awt-section-actions";

  const focus = document.createElement("button");
  focus.className = "awt-jump-btn";
  focus.type = "button";
  focus.textContent = "Focus";
  focus.addEventListener("click", () => {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const collapse = document.createElement("button");
  collapse.className = "awt-collapse-btn";
  collapse.type = "button";
  collapse.textContent = collapsed ? "Expand" : "Collapse";
  collapse.addEventListener("click", () => {
    const next = el.dataset.collapsed !== "true";
    el.dataset.collapsed = next ? "true" : "false";
    collapse.textContent = next ? "Expand" : "Collapse";
    rememberCollapsed(id, next);
  });

  actions.append(focus, collapse);
  toolbar.append(left, actions);
  el.append(toolbar, body);
}

function makeFloatingMap() {
  const existing = document.querySelector(".awt-floating-map");
  if (existing) existing.remove();

  const tabs = [...document.querySelectorAll("[data-tab]")];
  if (!tabs.length) return;

  const nav = document.createElement("nav");
  nav.className = "awt-floating-map";

  const label = document.createElement("span");
  label.className = "awt-map-label";
  label.textContent = "Control Map";
  nav.appendChild(label);

  for (const tab of tabs) {
    const a = document.createElement("a");
    a.href = "#";
    a.className = "awt-map-link";
    a.textContent = tab.textContent.trim() || tab.dataset.tab || "Panel";

    a.addEventListener("click", event => {
      event.preventDefault();
      tab.click();

      const pane = document.querySelector('[data-pane="' + tab.dataset.tab + '"]');
      if (pane) pane.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    nav.appendChild(a);
  }

  const target = document.querySelector("main,.app,.container,body");
  target.insertBefore(nav, target.firstChild);
}

function addKeyboardShortcuts() {
  if (window.__awtsmoosTabKeysMounted) return;
  window.__awtsmoosTabKeysMounted = true;

  window.addEventListener("keydown", event => {
    if (!event.altKey) return;

    const tabs = [...document.querySelectorAll("[data-tab]")];
    if (!tabs.length) return;

    const activeIndex = Math.max(0, tabs.findIndex(x => x.classList.contains("active")));

    if (event.key === "ArrowRight") {
      event.preventDefault();
      tabs[(activeIndex + 1) % tabs.length].click();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      tabs[(activeIndex - 1 + tabs.length) % tabs.length].click();
    }
  });
}

export function mountControlPanels() {
  const candidates = [
    ...document.querySelectorAll("[data-pane]"),
    ...document.querySelectorAll(".control-section"),
    ...document.querySelectorAll(".dashboard-section"),
    ...document.querySelectorAll(".panel-section")
  ];

  candidates.forEach(makePanelShell);
  makeFloatingMap();
  addKeyboardShortcuts();
}
