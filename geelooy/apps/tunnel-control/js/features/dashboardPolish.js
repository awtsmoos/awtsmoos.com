
// B"H

/**
 * B"H
 * DashboardPolish is the little shamash candle that walks through older
 * markup and gives it clear dashboard classes without demanding a giant
 * HTML rewrite.
 *
 * It does not own business logic. It does not move API calls. It only
 * repairs structure: shell, nav, dashboard mission grid, mission cards, and
 * text blocks that were previously collapsing into one ugly line.
 */
(function dashboardPolishBoot() {
  const ICONS = {
    root: "🛠️",
    api: "🔐",
    explorer: "📁",
    command: "⌁",
    browser: "🌐",
    chrome: "🌐",
    docs: "📜",
    usage: "📊",
    account: "👤",
    install: "⚡",
    dashboard: "🏠"
  };

  const DESCRIPTIONS = {
    root: "Choose the project root and control exactly what the agent can do.",
    api: "Create, paste, activate, copy, and inspect scoped tunnel keys.",
    explorer: "List, tree, select, preview, read, and bulk-read files.",
    command: "Run controlled commands inside the selected project root.",
    browser: "Find Chrome, launch/connect, navigate, click, type, evaluate, and script.",
    chrome: "Find Chrome, launch/connect, navigate, click, type, evaluate, and script.",
    docs: "Copy instructions and open human, JSON, and OpenAPI documentation.",
    usage: "Inspect usage, limits, and raw tunnel calls.",
    account: "Check login state and connection identity.",
    install: "Install, refresh, restart, or reconnect the local agent.",
    dashboard: "Return to the mission control overview."
  };

  /**
   * B"H
   * Finds a readable label.
   *
   * @param {Element} node Source node.
   * @returns {string} Clean label text.
   */
  function labelOf(node) {
    return String(node.textContent || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * B"H
   * Classifies a card or tab by text.
   *
   * @param {string} text Label text.
   * @returns {string} Kind key.
   */
  function kindOf(text) {
    const lower = text.toLowerCase();

    if (/root|permission/.test(lower)) return "root";
    if (/api|key|vault/.test(lower)) return "api";
    if (/explorer|project|file/.test(lower)) return "explorer";
    if (/command|terminal|runner/.test(lower)) return "command";
    if (/browser|chrome/.test(lower)) return "browser";
    if (/doc|instruction|openapi/.test(lower)) return "docs";
    if (/usage|raw/.test(lower)) return "usage";
    if (/account|login|connection/.test(lower)) return "account";
    if (/install|restart/.test(lower)) return "install";
    if (/dashboard|home/.test(lower)) return "dashboard";

    return "dashboard";
  }

  /**
   * B"H
   * Returns the first useful page shell.
   *
   * @returns {Element|null} Shell element.
   */
  function findShell() {
    return (
      document.querySelector(".control-app") ||
      document.querySelector(".app") ||
      document.querySelector("main") ||
      document.body.firstElementChild
    );
  }

  /**
   * B"H
   * Adds shell classes without changing behavior.
   *
   * @returns {void}
   */
  function polishShell() {
    const shell = findShell();
    if (!shell || shell === document.body) return;
    shell.classList.add("awt-control-shell");
  }

  /**
   * B"H
   * Makes tab containers stable and professional.
   *
   * @returns {void}
   */
  function polishTabs() {
    const tabNodes = Array.from(document.querySelectorAll("[data-tab], [role='tab']"));
    if (!tabNodes.length) return;

    const parentCounts = new Map();

    for (const tab of tabNodes) {
      const parent = tab.parentElement;
      if (!parent) continue;
      parentCounts.set(parent, (parentCounts.get(parent) || 0) + 1);
    }

    for (const [parent, count] of parentCounts.entries()) {
      if (count >= 3) parent.classList.add("awt-tabs");
    }

    for (const tab of tabNodes) {
      const kind = kindOf(labelOf(tab));
      if (!/^[^\s]/.test(tab.textContent || "")) continue;
      if (!/^[🏠🛠️🔐📁⌁🌐📜📊👤⚡]/.test(labelOf(tab))) {
        tab.textContent = (ICONS[kind] || "•") + " " + labelOf(tab);
      }
    }
  }

  /**
   * B"H
   * Splits jammed card text into title and description.
   *
   * @param {Element} node Mission card.
   * @returns {{title:string, desc:string, kind:string}} Parsed text.
   */
  function missionText(node) {
    const raw = labelOf(node);
    const kind = kindOf(raw);
    const known = {
      root: "Root and permissions",
      api: "API key vault",
      explorer: "Project explorer",
      command: "Command runner",
      browser: "Browser control",
      docs: "Agent docs",
      usage: "Usage and raw actions",
      account: "Account and connection",
      install: "Install or restart",
      dashboard: "Dashboard"
    };

    const title = known[kind] || raw.split(/[.:]/)[0] || "Dashboard";
    const fallback = DESCRIPTIONS[kind] || "Open this control page.";
    let desc = raw.replace(title, "").trim();

    if (!desc || desc === raw || desc.length < 12) desc = fallback;

    return { title, desc, kind };
  }

  /**
   * B"H
   * Upgrades one dashboard mission card.
   *
   * @param {Element} node Card node.
   * @returns {void}
   */
  function upgradeMission(node) {
    if (node.dataset.awtMissionPolished === "1") return;
    node.dataset.awtMissionPolished = "1";

    const data = missionText(node);
    const originalTab = node.getAttribute("data-tab");

    node.classList.add("awt-mission-card");
    node.textContent = "";

    const icon = document.createElement("span");
    icon.className = "awt-mission-icon";
    icon.textContent = ICONS[data.kind] || "•";

    const copy = document.createElement("span");
    copy.className = "awt-mission-copy";

    const title = document.createElement("span");
    title.className = "awt-mission-title";
    title.textContent = data.title;

    const desc = document.createElement("span");
    desc.className = "awt-mission-desc";
    desc.textContent = data.desc;

    copy.append(title, desc);
    node.append(icon, copy);

    if (originalTab) node.setAttribute("data-tab", originalTab);
  }

  /**
   * B"H
   * Finds likely dashboard mission cards.
   *
   * @returns {Element[]} Candidate cards.
   */
  function findMissionCards() {
    const direct = Array.from(
      document.querySelectorAll(
        ".dashboard-mission, .mission-card, .launch-card, .page-card, .control-page-card, [data-mission]"
      )
    );

    const dashboardPane = document.querySelector(
      "[data-pane='dashboard'], [data-page='dashboard'], .dashboard, .control-dashboard"
    );

    const fromDashboard = dashboardPane
      ? Array.from(dashboardPane.querySelectorAll("button, a")).filter(node => {
          const text = labelOf(node);
          return /root|api|explorer|command|browser|chrome|doc|usage|account|install/i.test(text);
        })
      : [];

    return Array.from(new Set([...direct, ...fromDashboard]));
  }

  /**
   * B"H
   * Wraps mission cards in a grid when the old markup forgot one.
   *
   * @param {Element[]} cards Mission cards.
   * @returns {void}
   */
  function ensureMissionGrid(cards) {
    if (!cards.length) return;

    const firstParent = cards[0].parentElement;
    if (!firstParent) return;

    const allSameParent = cards.every(card => card.parentElement === firstParent);
    if (allSameParent) {
      firstParent.classList.add("awt-mission-grid");
      return;
    }

    const grid = document.createElement("div");
    grid.className = "awt-mission-grid";
    cards[0].before(grid);

    for (const card of cards) grid.append(card);
  }

  /**
   * B"H
   * Polishes dashboard landing content.
   *
   * @returns {void}
   */
  function polishDashboard() {
    const cards = findMissionCards();
    if (!cards.length) return;

    ensureMissionGrid(cards);
    for (const card of cards) upgradeMission(card);

    const pane =
      document.querySelector("[data-pane='dashboard']") ||
      document.querySelector("[data-page='dashboard']") ||
      cards[0].closest("section, main, .pane, .page, .dashboard");

    if (pane) pane.classList.add("awt-dashboard");
  }

  /**
   * B"H
   * Runs all dashboard polishing.
   *
   * @returns {void}
   */
  function run() {
    polishShell();
    polishTabs();
    polishDashboard();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }

  window.addEventListener("awt:tabs-mounted", run);
  setTimeout(run, 250);
  setTimeout(run, 1000);
})();
