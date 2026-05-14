
// B"H

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);

/**
 * B"H
 * Gets tunnelName from URL or input.
 *
 * @returns {string} Tunnel name.
 */
function getTunnelName() {
  return $("tunnelName").value.trim();
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

  return [
    'B"H',
    "",
    "Use my Awtsmoos tunnel.",
    "",
    "tunnelName: " + tunnelName,
    "project path: " + projectPath,
    "",
    "Start by listing the project folder.",
    "Then inspect package.json, README files, and the main entry files.",
    "Do not read node_modules, .git, dist, build, .next, coverage, or private secret files.",
    "Tree commands should use depth 2 or 3 and a limit.",
    "If you need to edit, explain the intended file changes first."
  ].join("\n");
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
  $("refreshBtn").addEventListener("click", refreshStatus);

  mountTabs();
  mountCopy();
  refreshStatus();
  setInterval(refreshStatus, 5000);
}

main();
