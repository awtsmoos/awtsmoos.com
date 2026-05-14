
// B"H

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);

/**
 * B"H
 * Encodes JSON to base64 for compact GET payloads.
 *
 * @param {*} value Value to encode.
 * @returns {string} Base64 JSON.
 */
function b64Json(value) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(value))));
}

/**
 * B"H
 * Encodes text to base64.
 *
 * @param {string} value Text.
 * @returns {string} Base64 text.
 */
function b64Text(value) {
  return btoa(unescape(encodeURIComponent(value || "")));
}

/**
 * B"H
 * Reads tunnel name from input.
 *
 * @returns {string} Tunnel name.
 */
function getTunnelName() {
  return $("tunnelName").value.trim();
}

/**
 * B"H
 * Builds raw tunnel API URL.
 *
 * @param {object} opts Options.
 * @returns {string} URL.
 */
function buildFsUrl(opts = {}) {
  const tunnelName = encodeURIComponent(getTunnelName());
  const u = new URL("/api/tunnel/fs/" + tunnelName, location.origin);

  u.searchParams.set("action", opts.action || "list");
  u.searchParams.set("p", opts.path || ".");

  if (opts.depth) u.searchParams.set("depth", String(opts.depth));
  if (opts.limit) u.searchParams.set("limit", String(opts.limit));
  if (opts.maxChars) u.searchParams.set("maxChars", String(opts.maxChars));
  if (opts.content !== undefined) u.searchParams.set("content64", b64Text(opts.content));
  if (opts.paths) u.searchParams.set("paths64", b64Json(opts.paths));
  if (opts.files) u.searchParams.set("files64", b64Json(opts.files));

  return u.toString();
}

/**
 * B"H
 * Calls a tunnel filesystem action.
 *
 * @param {object} opts Action options.
 * @returns {Promise<object>} JSON response.
 */
async function callFs(opts) {
  const url = buildFsUrl(opts);
  $("actionUrlOut").textContent = url;

  const res = await fetch(url);
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    return { ok: false, raw: text };
  }
}

/**
 * B"H
 * Builds prompt for any AI agent.
 *
 * @returns {string} Prompt text.
 */
function buildPrompt() {
  const tunnelName = getTunnelName();
  const projectPath = $("projectPath").value.trim() || ".";
  const mode = $("promptMode").value;

  const lines = [
    'B"H',
    "",
    "Use my Awtsmoos tunnel.",
    "",
    "tunnelName: " + tunnelName,
    "project path: " + projectPath,
    "",
    "Available raw API pattern:",
    "https://awtsmoos.com/api/tunnel/fs/" + tunnelName + "?action=list&p=.",
    "",
    "Start by listing the project folder.",
    "Then inspect package.json, README files, and the main entry files.",
    "Do not read node_modules, .git, dist, build, .next, coverage, or private secret files.",
    "Tree commands should use depth 2 or 3 and a limit.",
    "Use bulk read when reading multiple files.",
    "If editing, explain the intended changes first, then use write or bulkWrite."
  ];

  if (mode === "review") {
    lines.push("", "Mode: read-only reviewer. Do not write files.");
  }

  if (mode === "fixer") {
    lines.push("", "Mode: bug fixer. Trace the issue, identify responsible files, then make minimal targeted edits.");
  }

  if (mode === "vibe") {
    lines.push("", "Mode: vibe coder. Improve UI, CSS, structure, usability, and developer experience aggressively but safely.");
  }

  return lines.join("\n");
}

/**
 * B"H
 * Refreshes server tunnel status.
 *
 * @returns {Promise<void>} Done.
 */
async function refreshStatus() {
  const box = $("statusBox");

  try {
    const [statusRes, clientsRes] = await Promise.all([
      fetch("/api/tunnel/status"),
      fetch("/api/tunnel/clients")
    ]);

    const status = await statusRes.json();
    const clients = await clientsRes.json();

    box.textContent = JSON.stringify({ status, clients }, null, 2);
  } catch (e) {
    box.textContent = e.stack || e.message;
  }
}

/**
 * B"H
 * Renders GPT prompt.
 *
 * @returns {void}
 */
function renderPrompt() {
  $("promptBox").textContent = buildPrompt();
}

/**
 * B"H
 * Mounts tab buttons.
 *
 * @returns {void}
 */
function mountTabs() {
  for (const tab of document.querySelectorAll("[data-tab]")) {
    tab.addEventListener("click", () => {
      const id = tab.dataset.tab;

      for (const one of document.querySelectorAll("[data-tab]")) {
        one.classList.toggle("active", one === tab);
      }

      for (const pane of document.querySelectorAll("[data-pane]")) {
        pane.classList.toggle("active", pane.dataset.pane === id);
      }
    });
  }
}

/**
 * B"H
 * Mounts copy buttons.
 *
 * @returns {void}
 */
function mountCopy() {
  for (const btn of document.querySelectorAll("[data-copy]")) {
    btn.addEventListener("click", async () => {
      const el = $(btn.dataset.copy);
      await navigator.clipboard.writeText(el.textContent || el.value || "");
      const old = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(() => btn.textContent = old, 900);
    });
  }

  $("copyPromptBtn").addEventListener("click", async () => {
    await navigator.clipboard.writeText($("promptBox").textContent);
  });

  $("copyActionUrlBtn").addEventListener("click", async () => {
    await navigator.clipboard.writeText($("actionUrlOut").textContent);
  });
}

/**
 * B"H
 * Mounts explorer buttons.
 *
 * @returns {void}
 */
function mountExplorer() {
  const out = $("explorerOut");

  $("listBtn").onclick = async () => {
    out.textContent = JSON.stringify(await callFs({
      action: "list",
      path: $("explorerPath").value
    }), null, 2);
  };

  $("treeBtn").onclick = async () => {
    out.textContent = JSON.stringify(await callFs({
      action: "tree",
      path: $("explorerPath").value,
      depth: $("treeDepth").value,
      limit: $("treeLimit").value
    }), null, 2);
  };

  $("readBtn").onclick = async () => {
    out.textContent = JSON.stringify(await callFs({
      action: "read",
      path: $("explorerPath").value
    }), null, 2);
  };

  $("mdBtn").onclick = async () => {
    out.textContent = JSON.stringify(await callFs({
      action: "md",
      path: $("explorerPath").value
    }), null, 2);
  };
}

/**
 * B"H
 * Mounts action lab.
 *
 * @returns {void}
 */
function mountActions() {
  $("runActionBtn").onclick = async () => {
    let action = $("actionName").value;
    let path = $("actionPath").value;

    const opts = {
      action,
      path,
      maxChars: $("maxChars").value
    };

    if (action === "tree") {
      opts.depth = $("treeDepth").value;
      opts.limit = $("treeLimit").value;
    }

    if (action === "write") {
      opts.content = $("writeContent").value;
    }

    if (action === "bulk") {
      opts.paths = $("bulkPaths").value
        .split(/\r?\n/g)
        .map(x => x.trim())
        .filter(Boolean);
    }

    if (action === "bulkWrite") {
      try {
        opts.files = JSON.parse($("bulkWriteJson").value);
      } catch (e) {
        $("actionOut").textContent = "Invalid bulk write JSON: " + e.message;
        return;
      }
    }

    $("actionOut").textContent = JSON.stringify(await callFs(opts), null, 2);
  };
}

/**
 * B"H
 * Main.
 *
 * @returns {void}
 */
function main() {
  $("tunnelName").value = params.get("tunnelName") || "";
  renderPrompt();

  $("tunnelName").addEventListener("input", renderPrompt);
  $("projectPath").addEventListener("input", renderPrompt);
  $("promptMode").addEventListener("change", renderPrompt);
  $("refreshBtn").addEventListener("click", refreshStatus);

  mountTabs();
  mountCopy();
  mountExplorer();
  mountActions();

  refreshStatus();
  setInterval(refreshStatus, 5000);
}

main();
