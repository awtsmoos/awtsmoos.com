
// B"H

function $(id) {
  return document.getElementById(id);
}

function hasTunnelName() {
  const input = $("tunnelName");
  const url = new URL(location.href);
  return !!(
    (input && input.value && input.value.trim()) ||
    url.searchParams.get("tunnelName")
  );
}

function text(el) {
  return (el && el.textContent || "").replace(/\s+/g, " ").trim();
}

function nearestBlock(el) {
  let node = el;

  while (node && node !== document.body) {
    if (
      node.matches("section, header, main > div, .card, .panel, [data-pane], .hero, .landing-hero")
    ) {
      return node;
    }

    node = node.parentElement;
  }

  return el;
}

function findBlockByHeading(phrase) {
  const needles = String(phrase).toLowerCase();

  for (const h of document.querySelectorAll("h1,h2,h3")) {
    if (text(h).toLowerCase().includes(needles)) {
      return nearestBlock(h);
    }
  }

  return null;
}

function markInstallOnly() {
  const block = findBlockByHeading("Install the local agent first");
  if (block) {
    block.classList.add("awt-install-only", "awt-panel-final");
  }
}

function markHero() {
  const h1 = [...document.querySelectorAll("h1")]
    .find(x => text(x).toLowerCase().includes("control your machine"));

  if (!h1) return;

  const block = nearestBlock(h1);
  block.classList.add("awt-hero-final");
  block.setAttribute("data-hero", "yes");
}

function markTunnelCard() {
  const input = $("tunnelName");
  if (!input) return;

  let node = input.parentElement;

  for (let i = 0; node && node !== document.body && i < 7; i++) {
    if (text(node).toLowerCase().includes("this tunnel")) {
      node.classList.add("awt-tunnel-card-final");
      return;
    }

    node = node.parentElement;
  }

  input.parentElement?.classList.add("awt-tunnel-card-final");
}

function rebuildMiniStatus() {
  const card = document.querySelector(".awt-tunnel-card-final");
  if (!card || card.querySelector(".awt-status-mini-grid")) return;

  const values = [
    ["Agent", text($("agentStatus")) || text(document.querySelector("[data-agent-status]")) || "Checking"],
    ["Login", text($("loginStatus")) || text(document.querySelector("[data-login-status]")) || "Checking"],
    ["API Key", text($("apiKeyStatus")) || text(document.querySelector("[data-api-key-status]")) || "None"]
  ];

  const grid = document.createElement("div");
  grid.className = "awt-status-mini-grid";

  for (const [label, value] of values) {
    const tile = document.createElement("div");
    const low = value.toLowerCase();
    tile.className = "awt-status-mini " + (
      low.includes("connected") || low.includes("logged") || low.includes("active")
        ? "good"
        : low.includes("none") || low.includes("checking")
          ? "warn"
          : "bad"
    );
    tile.innerHTML = "<span></span><strong></strong>";
    tile.querySelector("span").textContent = label;
    tile.querySelector("strong").textContent = value;
    grid.appendChild(tile);
  }

  const input = $("tunnelName");
  if (input && input.parentElement) {
    input.parentElement.insertBefore(grid, input.nextSibling);
  } else {
    card.appendChild(grid);
  }
}

function markPanels() {
  const panels = [
    ["Login status", "account"],
    ["Connection", "agent"],
    ["Root folder and permissions", "setup"],
    ["Access key vault", "api-keys"],
    ["Project browser", "explorer"],
    ["Command runner", "terminal"],
    ["Browser control lab", "chrome"],
    ["Agent instructions", "agent-docs"],
    ["Usage and rate limits", "usage"],
    ["Advanced raw tunnel calls", "advanced"],
    ["Use this from any AI or program", "docs"],
    ["One command", "install"],
    ["Select a local folder", "root-picker"]
  ];

  for (const [heading, name] of panels) {
    const block = findBlockByHeading(heading);
    if (!block) continue;
    if (block.classList.contains("awt-hero-final")) continue;
    block.classList.add("awt-panel-final", "awt-panel-" + name);
  }
}

function groupButtons() {
  const candidates = document.querySelectorAll(".awt-panel-final, .awt-hero-final, .awt-tunnel-card-final");

  for (const block of candidates) {
    const buttons = [...block.children].filter(el => {
      return el.matches && (
        el.matches("button,a.button,.btn") ||
        (el.tagName === "A" && el.textContent.trim().length < 40)
      );
    });

    if (buttons.length < 2) continue;
    if (buttons[0].parentElement?.classList.contains("awt-toolbar-final")) continue;

    const toolbar = document.createElement("div");
    toolbar.className = "awt-toolbar-final";

    block.insertBefore(toolbar, buttons[0]);
    for (const b of buttons) toolbar.appendChild(b);
  }
}

function markPermissionGrid() {
  const heading = [...document.querySelectorAll("*")]
    .find(el => text(el).toLowerCase() === "live agent permissions");

  if (!heading) return;

  let node = heading.parentElement;

  for (let i = 0; node && node !== document.body && i < 5; i++) {
    const labels = node.querySelectorAll("label");
    if (labels.length >= 5) {
      node.classList.add("awt-permission-grid-final");
      return;
    }
    node = node.parentElement;
  }
}

function updateStateClasses() {
  const has = hasTunnelName();
  document.body.classList.toggle("awt-has-tunnel", has);
  document.body.classList.toggle("awt-no-tunnel", !has);
}

export function mountFinalLayout() {
  updateStateClasses();
  markHero();
  markTunnelCard();
  markInstallOnly();
  markPanels();
  rebuildMiniStatus();
  groupButtons();
  markPermissionGrid();

  $("tunnelName")?.addEventListener("input", () => {
    updateStateClasses();
    setTimeout(rebuildMiniStatus, 60);
  });

  window.addEventListener("awtsmoos:status-refresh", () => {
    updateStateClasses();
    setTimeout(rebuildMiniStatus, 60);
  });
}
