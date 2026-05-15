
// B"H

/**
 * B"H
 * Professional Control Center enhancer.
 *
 * This module does not replace the working tunnel features. It receives
 * the already-mounted page and reshapes the interface into something a
 * user can understand:
 *
 * - a left control rail
 * - a status-aware dashboard
 * - focused tab pages
 * - normalized headings
 * - hidden diagnostics drawer
 * - safer API-key display
 * - mutation observers for dynamic responses
 *
 * The metaphor is exact: the old page had all vessels open at once.
 * This gives each vessel its chamber.
 */

/**
 * Dashboard cards mapped to existing data-tab values.
 *
 * @type {Array<{tab:string, icon:string, title:string, text:string}>}
 */
const DASHBOARD_CARDS = [
  {
    tab: "setup",
    icon: "🛠️",
    title: "Setup",
    text: "Choose root, save config, and control live permissions."
  },
  {
    tab: "apiKeys",
    icon: "🔐",
    title: "API Keys",
    text: "Create, activate, copy, and protect tunnel access keys."
  },
  {
    tab: "explorer",
    icon: "📁",
    title: "Explorer",
    text: "Browse, read, tree, preview, and bulk-read project files."
  },
  {
    tab: "terminal",
    icon: "⌁",
    title: "Terminal",
    text: "Run controlled commands inside the selected project root."
  },
  {
    tab: "chrome",
    icon: "🌐",
    title: "Chrome",
    text: "Launch, connect, navigate, click, type, and evaluate pages."
  },
  {
    tab: "usage",
    icon: "📊",
    title: "Usage",
    text: "Inspect rate limits, traffic, and active tunnel activity."
  },
  {
    tab: "docs",
    icon: "📜",
    title: "Agent Docs",
    text: "Copy machine-readable instructions for any AI or program."
  },
  {
    tab: "install",
    icon: "⚡",
    title: "Install",
    text: "Restart or reinstall the local Awtsmoos tunnel agent."
  }
];

/**
 * Pane descriptions keyed by data-pane value.
 *
 * @type {Record<string, {kicker:string, title:string, desc:string}>}
 */
const PANE_META = {
  account: {
    kicker: "Account",
    title: "Login and identity",
    desc: "Confirm browser login, session identity, and account-level tunnel access."
  },
  setup: {
    kicker: "Setup",
    title: "Root folder and permissions",
    desc: "Point the agent at the correct local project and keep dangerous abilities explicit."
  },
  apiKeys: {
    kicker: "API Keys",
    title: "Access key vault",
    desc: "Create scoped keys, activate a key for this browser, and keep raw tokens controlled."
  },
  explorer: {
    kicker: "File Explorer",
    title: "Project browser",
    desc: "Use list, tree, markdown, read, and bulk read without drowning in raw JSON."
  },
  usage: {
    kicker: "Usage",
    title: "Usage and rate limits",
    desc: "Watch request activity and limits for the active tunnel."
  },
  terminal: {
    kicker: "Terminal",
    title: "Command runner",
    desc: "Execute commands only when terminal permission and key scopes allow it."
  },
  chrome: {
    kicker: "Chrome",
    title: "Browser control lab",
    desc: "Control Chrome DevTools from the tunnel with visible safety boundaries."
  },
  docs: {
    kicker: "Agent Docs",
    title: "Use this from any AI or program",
    desc: "Copy structured instructions and API docs for external agents."
  },
  install: {
    kicker: "Install",
    title: "Install or restart",
    desc: "Run the bootstrap command and reconnect the local background agent."
  }
};

/**
 * Safely selects one element.
 *
 * @param {string} selector CSS selector.
 * @param {ParentNode} root Search root.
 * @returns {Element|null} Matching element.
 */
function one(selector, root = document) {
  return root.querySelector(selector);
}

/**
 * Safely selects many elements.
 *
 * @param {string} selector CSS selector.
 * @param {ParentNode} root Search root.
 * @returns {Element[]} Matching elements.
 */
function all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/**
 * Creates an element from a small JSON-like vessel.
 *
 * @param {string} tag HTML tag.
 * @param {object} options Element options.
 * @param {string[]} [options.classes] Class names.
 * @param {Record<string,string>} [options.attrs] Attributes.
 * @param {string} [options.text] Text content.
 * @param {Array<Element|string>} [options.children] Children.
 * @returns {HTMLElement} New element.
 */
function el(tag, options = {}) {
  const node = document.createElement(tag);

  for (const cls of options.classes || []) node.classList.add(cls);

  for (const [key, value] of Object.entries(options.attrs || {})) {
    node.setAttribute(key, value);
  }

  if (options.text !== undefined) node.textContent = options.text;

  for (const child of options.children || []) {
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }

  return node;
}

/**
 * Finds the existing app content root.
 *
 * @returns {HTMLElement} Root node to reorganize.
 */
function findAppRoot() {
  return one("main") ||
    one("#app") ||
    one(".app") ||
    one(".wrap") ||
    one(".container") ||
    document.body;
}

/**
 * Finds the existing tab rail.
 *
 * @returns {HTMLElement|null} Existing tab parent.
 */
function findTabRail() {
  const tab = one("[data-tab]");
  return tab ? tab.parentElement : null;
}

/**
 * Ensures one active tab exists.
 *
 * @returns {void}
 */
function ensureActivePane() {
  const panes = all("[data-pane]");
  const tabs = all("[data-tab]");

  if (!panes.length) return;

  const activePane = panes.find(pane => pane.classList.contains("active"));
  if (activePane) return;

  const preferred =
    panes.find(pane => pane.dataset.pane === "setup") ||
    panes.find(pane => pane.dataset.pane === "explorer") ||
    panes[0];

  preferred.classList.add("active");

  const matching = tabs.find(tab => tab.dataset.tab === preferred.dataset.pane);
  if (matching) matching.classList.add("active");
}

/**
 * Activates a tab using the already-existing tab button when possible.
 *
 * @param {string} tabName Tab name.
 * @returns {void}
 */
function activateTab(tabName) {
  const tab = all("[data-tab]").find(button => button.dataset.tab === tabName);

  if (tab) {
    tab.click();
  } else {
    for (const pane of all("[data-pane]")) {
      pane.classList.toggle("active", pane.dataset.pane === tabName);
    }
  }

  syncDashboardActive();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Updates active state on injected dashboard cards.
 *
 * @returns {void}
 */
function syncDashboardActive() {
  const activePane = all("[data-pane]").find(pane => pane.classList.contains("active"));
  const active = activePane?.dataset.pane || "";

  for (const card of all(".awt-action-card")) {
    card.classList.toggle("is-active", card.dataset.targetTab === active);
  }
}

/**
 * Builds the left shell side.
 *
 * @param {HTMLElement|null} tabRail Existing tab rail.
 * @param {object} options Runtime options.
 * @param {Function} options.getTunnelName Tunnel name reader.
 * @param {Function} options.getProjectPath Project path reader.
 * @returns {HTMLElement} Sidebar element.
 */
function buildSide(tabRail, options) {
  const tunnelText = el("strong", { text: options.getTunnelName() || "No tunnel" });
  const rootText = el("strong", { text: options.getProjectPath() || "." });

  const side = el("aside", {
    classes: ["awt-control-side"],
    children: [
      el("div", {
        classes: ["awt-brand-block"],
        children: [
          el("div", { classes: ["awt-brand-kicker"], text: "B\"H Awtsmoos" }),
          el("h1", { classes: ["awt-brand-title"], text: "Tunnel Control" }),
          el("p", {
            classes: ["awt-brand-subtitle"],
            text: "A focused command center for local files, terminal, Chrome, keys, setup, and diagnostics."
          })
        ]
      }),
      el("div", {
        classes: ["awt-status-stack"],
        children: [
          el("div", {
            classes: ["awt-status-chip"],
            children: [document.createTextNode("Tunnel"), tunnelText]
          }),
          el("div", {
            classes: ["awt-status-chip"],
            children: [document.createTextNode("Root"), rootText]
          })
        ]
      })
    ]
  });

  if (tabRail) {
    tabRail.classList.add("awt-side-tabs");
    side.append(tabRail);
  }

  const refreshStatusText = () => {
    tunnelText.textContent = options.getTunnelName() || "No tunnel";
    rootText.textContent = options.getProjectPath() || ".";
  };

  document.addEventListener("input", refreshStatusText, true);
  document.addEventListener("change", refreshStatusText, true);
  setInterval(refreshStatusText, 2500);

  return side;
}

/**
 * Builds a dashboard above the active workspace.
 *
 * @param {object} options Runtime options.
 * @param {Function} options.getTunnelName Tunnel reader.
 * @param {Function} options.getProjectPath Project path reader.
 * @returns {HTMLElement} Dashboard.
 */
function buildDashboard(options) {
  const tunnel = options.getTunnelName() || "waiting for tunnel";
  const root = options.getProjectPath() || ".";

  const grid = el("div", { classes: ["awt-dashboard-grid"] });

  for (const card of DASHBOARD_CARDS) {
    const button = el("button", {
      classes: ["awt-action-card"],
      attrs: {
        type: "button",
        "data-target-tab": card.tab
      },
      children: [
        el("div", { classes: ["awt-action-icon"], text: card.icon }),
        el("div", {
          children: [
            el("strong", { text: card.title }),
            el("span", { text: card.text })
          ]
        })
      ]
    });

    button.addEventListener("click", () => activateTab(card.tab));
    grid.append(button);
  }

  return el("section", {
    classes: ["awt-dashboard"],
    children: [
      el("div", {
        classes: ["awt-dashboard-head"],
        children: [
          el("div", {
            children: [
              el("h2", { text: "Command center" }),
              el("p", {
                text: `Connected workspace for ${tunnel}. Current root: ${root}. Choose one focused action instead of fighting the old long debug scroll.`
              })
            ]
          }),
          el("button", {
            classes: ["awt-dashboard-refresh"],
            attrs: { type: "button" },
            text: "Refresh view"
          })
        ]
      }),
      grid
    ]
  });
}

/**
 * Wraps the existing page with a two-column app shell.
 *
 * @param {object} options Runtime options.
 * @returns {void}
 */
function buildShell(options) {
  const root = findAppRoot();

  if (one(".awt-control-shell")) return;

  ensureActivePane();

  const tabRail = findTabRail();
  const side = buildSide(tabRail, options);
  const dashboard = buildDashboard(options);

  const shell = el("div", { classes: ["awt-control-shell"] });
  const main = el("div", { classes: ["awt-control-main"] });

  const children = Array.from(root.childNodes).filter(node => node !== tabRail);

  main.append(dashboard);
  for (const child of children) main.append(child);

  shell.append(side, main);

  if (root === document.body) {
    document.body.append(shell);
  } else {
    root.append(shell);
  }

  one(".awt-dashboard-refresh")?.addEventListener("click", () => {
    normalizeHeadings();
    collectDiagnostics();
    maskSecrets(document.body);
    syncDashboardActive();
  });
}

/**
 * Adds normalized page headings where the old page had clipped labels.
 *
 * @returns {void}
 */
function normalizeHeadings() {
  for (const pane of all("[data-pane]")) {
    if (one(":scope > .awt-pane-heading", pane)) continue;

    const key = pane.dataset.pane || "";
    const meta = PANE_META[key] || {
      kicker: key || "Panel",
      title: readableTitle(key || "Control Panel"),
      desc: "Focused tunnel controls."
    };

    const heading = el("div", {
      classes: ["awt-pane-heading"],
      children: [
        el("div", { classes: ["awt-pane-kicker"], text: meta.kicker }),
        el("h2", { classes: ["awt-pane-title"], text: meta.title }),
        el("p", { classes: ["awt-pane-desc"], text: meta.desc })
      ]
    });

    pane.prepend(heading);
  }
}

/**
 * Converts programmer identifiers into human text.
 *
 * @param {string} value Raw key.
 * @returns {string} Human title.
 */
function readableTitle(value) {
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, letter => letter.toUpperCase());
}

/**
 * Builds the diagnostics drawer.
 *
 * @returns {HTMLElement} Drawer element.
 */
function ensureDiagnosticsDrawer() {
  let drawer = one(".awt-diagnostics-drawer");
  if (drawer) return drawer;

  const close = el("button", {
    attrs: { type: "button" },
    text: "Close"
  });

  drawer = el("aside", {
    classes: ["awt-diagnostics-drawer"],
    attrs: {
      "aria-label": "Diagnostics drawer"
    },
    children: [
      el("div", {
        classes: ["awt-diagnostics-head"],
        children: [
          el("h2", { text: "Diagnostics" }),
          close
        ]
      }),
      el("div", { classes: ["awt-diagnostics-body"] })
    ]
  });

  const toggle = el("button", {
    classes: ["awt-diagnostics-toggle"],
    attrs: { type: "button" },
    text: "Diagnostics"
  });

  toggle.addEventListener("click", () => {
    drawer.classList.toggle("is-open");
  });

  close.addEventListener("click", () => {
    drawer.classList.remove("is-open");
  });

  document.body.append(toggle, drawer);
  return drawer;
}

/**
 * Collects raw/debug boxes into the diagnostics drawer.
 *
 * @returns {void}
 */
function collectDiagnostics() {
  const drawer = ensureDiagnosticsDrawer();
  const body = one(".awt-diagnostics-body", drawer);
  if (!body) return;

  body.textContent = "";

  const candidates = findDiagnosticCandidates();

  if (!candidates.length) {
    body.append(el("p", {
      text: "No raw diagnostic blocks found yet."
    }));
    return;
  }

  for (const item of candidates) {
    const title = item.title || item.node.id || "Raw response";

    const block = el("div", {
      classes: ["awt-diagnostic-item"],
      children: [
        el("div", { classes: ["awt-diagnostic-title"], text: title }),
        el("div", {
          classes: ["awt-diagnostic-content"],
          text: item.node.textContent || "Ready."
        })
      ]
    });

    body.append(block);

    if (!item.node.closest("[data-pane='explorer']")) {
      item.node.classList.add("awt-diagnostic-moved");
    }
  }
}

/**
 * Finds raw response/debug nodes without relying on one exact old class.
 *
 * @returns {Array<{node:HTMLElement,title:string}>} Diagnostic candidates.
 */
function findDiagnosticCandidates() {
  const nodes = new Set();

  for (const selector of [
    "#statusBox",
    "#identityOut",
    "#connectionOut",
    "#configOut",
    "#keyOut",
    "#usageOut",
    "#actionOut",
    "[id*='Raw']",
    "[id*='raw']",
    "[id$='Response']",
    "pre"
  ]) {
    for (const node of all(selector)) {
      if (node instanceof HTMLElement && !node.closest(".awt-diagnostics-drawer")) {
        nodes.add(node);
      }
    }
  }

  return Array.from(nodes).map(node => ({
    node,
    title: findNearbyTitle(node)
  }));
}

/**
 * Finds nearby text to title a diagnostic block.
 *
 * @param {HTMLElement} node Diagnostic node.
 * @returns {string} Best available title.
 */
function findNearbyTitle(node) {
  let current = node.previousElementSibling;

  for (let i = 0; i < 4 && current; i++) {
    const text = (current.textContent || "").trim();
    if (text && text.length < 80) return text;
    current = current.previousElementSibling;
  }

  return node.id || "Raw response";
}

/**
 * Masks visible API-key-like strings.
 *
 * @param {ParentNode} root Search root.
 * @returns {void}
 */
function maskSecrets(root) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue || !/ak_[A-Za-z0-9_-]{12,}/.test(node.nodeValue)) {
          return NodeFilter.FILTER_REJECT;
        }

        if (node.parentElement?.closest(".awt-secret-token, script, style, textarea, input")) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  for (const textNode of textNodes) {
    replaceSecretTextNode(textNode);
  }
}

/**
 * Replaces one text node containing one or more keys with masked spans.
 *
 * @param {Text} textNode Text node.
 * @returns {void}
 */
function replaceSecretTextNode(textNode) {
  const value = textNode.nodeValue || "";
  const pattern = /ak_[A-Za-z0-9_-]{12,}/g;
  const frag = document.createDocumentFragment();

  let last = 0;
  let match;

  while ((match = pattern.exec(value))) {
    if (match.index > last) {
      frag.append(document.createTextNode(value.slice(last, match.index)));
    }

    frag.append(buildSecretSpan(match[0]));
    last = match.index + match[0].length;
  }

  if (last < value.length) {
    frag.append(document.createTextNode(value.slice(last)));
  }

  textNode.replaceWith(frag);
}

/**
 * Builds a masked key token with reveal/copy controls.
 *
 * @param {string} secret Raw secret.
 * @returns {HTMLElement} Secret wrapper.
 */
function buildSecretSpan(secret) {
  const masked = `${secret.slice(0, 6)}••••••••••••${secret.slice(-4)}`;

  const span = el("span", {
    classes: ["awt-secret-token"],
    attrs: {
      "data-revealed": "0",
      title: "API key masked"
    },
    text: masked
  });

  const reveal = el("button", {
    classes: ["awt-reveal-token"],
    attrs: { type: "button" },
    text: "Reveal"
  });

  const copy = el("button", {
    classes: ["awt-reveal-token"],
    attrs: { type: "button" },
    text: "Copy"
  });

  reveal.addEventListener("click", () => {
    const revealed = span.dataset.revealed === "1";
    span.dataset.revealed = revealed ? "0" : "1";
    span.textContent = revealed ? masked : secret;
    reveal.textContent = revealed ? "Reveal" : "Hide";
  });

  copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(secret);
    const old = copy.textContent;
    copy.textContent = "Copied";
    setTimeout(() => {
      copy.textContent = old;
    }, 900);
  });

  const wrap = el("span");
  wrap.append(span, reveal, copy);
  return wrap;
}

/**
 * Watches dynamic areas so keys, diagnostics, and active cards stay correct
 * after async API responses render.
 *
 * @returns {void}
 */
function mountMutationRepair() {
  const observer = new MutationObserver(() => {
    window.clearTimeout(mountMutationRepair.timer);
    mountMutationRepair.timer = window.setTimeout(() => {
      maskSecrets(document.body);
      collectDiagnostics();
      syncDashboardActive();
    }, 180);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

mountMutationRepair.timer = 0;

/**
 * Adds keyboard and click polish.
 *
 * @returns {void}
 */
function mountInteractionPolish() {
  document.addEventListener("click", event => {
    if (event.target.closest("[data-tab]")) {
      setTimeout(syncDashboardActive, 0);
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      one(".awt-diagnostics-drawer")?.classList.remove("is-open");
    }
  });
}

/**
 * Main mount function.
 *
 * @param {object} options Runtime hooks.
 * @param {Function} options.getTunnelName Tunnel reader.
 * @param {Function} options.getProjectPath Root reader.
 * @returns {void}
 */
export function mountProControlCenter(options = {}) {
  const safeOptions = {
    getTunnelName: typeof options.getTunnelName === "function" ? options.getTunnelName : () => "",
    getProjectPath: typeof options.getProjectPath === "function" ? options.getProjectPath : () => "."
  };

  document.body.classList.add("awt-pro-ready");

  ensureActivePane();
  buildShell(safeOptions);
  normalizeHeadings();
  collectDiagnostics();
  maskSecrets(document.body);
  syncDashboardActive();
  mountInteractionPolish();
  mountMutationRepair();
}
