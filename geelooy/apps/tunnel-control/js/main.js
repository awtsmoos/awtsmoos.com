
// B"H

const $ = id => document.getElementById(id);
const qs = selector => document.querySelector(selector);
const qsa = selector => Array.from(document.querySelectorAll(selector));
const params = new URLSearchParams(location.search);

const COMMON_CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser"
];

let currentRootPickerPath = "__ROOTS__";
let selectedRootPath = "";
let lastRootBrowse = null;

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = String(value ?? "");
}

function setValue(id, value) {
  const el = $(id);
  if (el) el.value = String(value ?? "");
}

function showJson(id, value) {
  const el = $(id);
  if (!el) return;
  try {
    el.textContent = JSON.stringify(value, null, 2);
  } catch (e) {
    el.textContent = String(value);
  }
}

function b64Json(value) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(value))));
}

function b64Text(value) {
  return btoa(unescape(encodeURIComponent(value || "")));
}

function getTunnelName() {
  return ($("tunnelName")?.value || "").trim();
}

function setBusy(button, busy) {
  if (!button) return () => {};
  const old = button.textContent;
  button.disabled = !!busy;
  if (busy) button.textContent = "Working...";
  return () => {
    button.disabled = false;
    button.textContent = old;
  };
}

function buildFsUrl(opts = {}) {
  const tunnelName = encodeURIComponent(getTunnelName());
  const u = new URL("/api/tunnel/fs/" + tunnelName, location.origin);

  u.searchParams.set("action", opts.action || "list");

  if (opts.path !== undefined) u.searchParams.set("p", opts.path);
  if (opts.absolutePath !== undefined) u.searchParams.set("absolutePath", opts.absolutePath);
  if (opts.depth !== undefined) u.searchParams.set("depth", String(opts.depth));
  if (opts.limit !== undefined) u.searchParams.set("limit", String(opts.limit));
  if (opts.maxChars !== undefined) u.searchParams.set("maxChars", String(opts.maxChars));
  if (opts.content !== undefined) u.searchParams.set("content64", b64Text(opts.content));
  if (opts.paths !== undefined) u.searchParams.set("paths64", b64Json(opts.paths));
  if (opts.files !== undefined) u.searchParams.set("files64", b64Json(opts.files));
  if (opts.port !== undefined) u.searchParams.set("port", String(opts.port));
  if (opts.chromePath) u.searchParams.set("chromePath", opts.chromePath);
  if (opts.url) u.searchParams.set("url", opts.url);
  if (opts.selector) u.searchParams.set("selector", opts.selector);
  if (opts.text) u.searchParams.set("text", opts.text);
  if (opts.timeoutMs !== undefined) u.searchParams.set("timeoutMs", String(opts.timeoutMs));
  if (opts.expression) u.searchParams.set("expression", opts.expression);
  if (opts.script !== undefined) u.searchParams.set("script64", b64Text(typeof opts.script === "string" ? opts.script : JSON.stringify(opts.script)));
  if (opts.command) u.searchParams.set("command64", b64Text(opts.command));
  if (opts.shell) u.searchParams.set("shell", opts.shell);
  if (opts.cwd) u.searchParams.set("cwd", opts.cwd);

  return u.toString();
}

async function callFs(opts) {
  const url = buildFsUrl(opts);
  setText("actionUrlOut", url);
  const res = await fetch(url);
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch (e) {
    return { ok: false, raw: txt };
  }
}

function switchPane(id) {
  qsa(".tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.tab === id);
  });

  qsa(".pane").forEach(pane => {
    const active = pane.dataset.pane === id;
    pane.classList.toggle("active", active);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function mountTabs() {
  qsa(".tab").forEach(tab => {
    tab.addEventListener("click", () => switchPane(tab.dataset.tab));
  });

  qsa("[data-go]").forEach(card => {
    card.addEventListener("click", () => switchPane(card.dataset.go));
  });
}

function buildPrompt() {
  const tunnelName = getTunnelName();
  const projectPath = $("projectPath")?.value.trim() || ".";
  const mode = $("promptMode")?.value || "explorer";

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
    "Then inspect package.json, README files, and main entry files.",
    "Do not read node_modules, .git, dist, build, .next, coverage, or private secret files.",
    "Tree commands should use depth 2 or 3 and a limit.",
    "Use bulk read when reading multiple files.",
    "If editing, explain intended changes first, then use write or bulkWrite."
  ];

  if (mode === "review") lines.push("", "Mode: read-only reviewer. Do not write files.");
  if (mode === "fixer") lines.push("", "Mode: bug fixer. Trace the issue, identify responsible files, then make minimal targeted edits.");
  if (mode === "vibe") lines.push("", "Mode: vibe coder. Improve UI, CSS, structure, usability, and developer experience aggressively but safely.");

  return lines.join("\n");
}

function renderPrompt() {
  setText("promptBox", buildPrompt());
}

async function copyText(text) {
  await navigator.clipboard.writeText(text || "");
}

function mountCopy() {
  qsa("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const source = $(btn.dataset.copy);
      await copyText(source?.textContent || source?.value || "");
      const old = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(() => btn.textContent = old, 900);
    });
  });

  $("copyPromptBtn")?.addEventListener("click", async () => {
    await copyText($("promptBox")?.textContent || "");
  });

  $("copyActionUrlBtn")?.addEventListener("click", async () => {
    await copyText($("actionUrlOut")?.textContent || "");
  });
}

async function refreshStatus() {
  try {
    const [statusRes, clientsRes] = await Promise.all([
      fetch("/api/tunnel/status").catch(() => null),
      fetch("/api/tunnel/clients").catch(() => null)
    ]);

    const status = statusRes ? await statusRes.json().catch(() => null) : null;
    const clients = clientsRes ? await clientsRes.json().catch(() => null) : null;
    const payload = { status, clients };

    showJson("statusBox", payload);
    showJson("miniStatus", payload);

    const tunnel = getTunnelName() || "No tunnel selected";
    setText("miniTunnel", tunnel);

    const agentOkay = JSON.stringify(payload).includes(getTunnelName()) || JSON.stringify(payload).includes("connected");
    setText("miniAgent", agentOkay ? "Connected / possible" : "Check agent");
    setText("agentPill", "Agent: " + (agentOkay ? "possible" : "checking"));

    setText("miniLogin", "Unknown");
    setText("authPill", "Login: check account");
  } catch (e) {
    showJson("statusBox", { ok: false, error: e.message || String(e) });
    setText("miniAgent", "Error");
    setText("agentPill", "Agent: error");
  }
}

function mountExplorer() {
  const out = $("explorerOut");

  $("listBtn")?.addEventListener("click", async () => {
    const got = await callFs({ action: "list", path: $("explorerPath").value });
    showJson("explorerOut", got);
    renderExplorerList(got);
  });

  $("treeBtn")?.addEventListener("click", async () => {
    const got = await callFs({
      action: "tree",
      path: $("explorerPath").value,
      depth: $("treeDepth").value,
      limit: $("treeLimit").value
    });
    showJson("explorerOut", got);
    setText("explorerPreview", JSON.stringify(got, null, 2));
  });

  $("readBtn")?.addEventListener("click", async () => {
    const got = await callFs({ action: "read", path: $("explorerPath").value });
    showJson("explorerOut", got);
    setText("explorerPreview", got.content || got.text || JSON.stringify(got, null, 2));
  });

  $("mdBtn")?.addEventListener("click", async () => {
    const got = await callFs({ action: "md", path: $("explorerPath").value });
    showJson("explorerOut", got);
    setText("explorerPreview", got.content || got.text || JSON.stringify(got, null, 2));
  });

  $("explorerUpBtn")?.addEventListener("click", () => {
    const current = $("explorerPath").value || ".";
    const next = current.split(/[\\/]/).slice(0, -1).join("/") || ".";
    $("explorerPath").value = next;
  });
}

function renderExplorerList(got) {
  const host = $("explorerList");
  if (!host) return;

  const items = got?.items || got?.files || got?.entries || [];
  host.replaceChildren();

  if (!Array.isArray(items) || !items.length) {
    host.append(makeDiv("empty-state", "No items returned."));
    return;
  }

  items.forEach(item => {
    const name = item.name || item.path || String(item);
    const path = item.path || item.relativePath || name;
    const type = item.type || (item.isDirectory ? "dir" : "file");
    const row = document.createElement("button");
    row.type = "button";
    row.className = "file-row";
    row.innerHTML = "<span>" + (type === "dir" ? "📁" : "📄") + "</span><span></span><span>" + type + "</span>";
    row.children[1].textContent = name;
    row.addEventListener("click", () => {
      $("explorerPath").value = path;
    });
    host.append(row);
  });
}

function makeDiv(className, text) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = text;
  return div;
}

function mountActions() {
  $("runActionBtn")?.addEventListener("click", async () => {
    const action = $("actionName").value;
    const opts = {
      action,
      path: $("actionPath").value,
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
      opts.paths = $("bulkPaths").value.split(/\r?\n/g).map(x => x.trim()).filter(Boolean);
    }

    if (action === "bulkWrite") {
      try {
        opts.files = JSON.parse($("bulkWriteJson").value);
      } catch (e) {
        setText("actionOut", "Invalid bulk write JSON: " + e.message);
        return;
      }
    }

    const got = await callFs(opts);
    showJson("actionOut", got);
  });
}

function readConfigFromForm() {
  return {
    root: $("rootPath")?.value || "",
    permissions: {
      allowWrite: !!$("allowWrite")?.checked,
      allowSecrets: !!$("allowSecrets")?.checked,
      allowCommands: !!$("allowCommands")?.checked,
      enableLocalHttpProxy: !!$("enableLocalHttpProxy")?.checked,
      tools: {
        fsList: !!$("toolFsList")?.checked,
        fsTree: !!$("toolFsTree")?.checked,
        fsRead: !!$("toolFsRead")?.checked,
        fsWrite: !!$("toolFsWrite")?.checked,
        fsBulk: !!$("toolFsBulk")?.checked,
        command: !!$("toolCommand")?.checked,
        chrome: !!$("toolChrome")?.checked
      }
    }
  };
}

function mountConfig() {
  $("loadConfigBtn")?.addEventListener("click", async () => {
    const got = await callFs({ action: "configGet" });
    showJson("configOut", got);
    if (got?.config?.root) setValue("rootPath", got.config.root);
  });

  $("saveConfigBtn")?.addEventListener("click", async () => {
    const got = await callFs({
      action: "configSet",
      content: JSON.stringify(readConfigFromForm())
    });
    showJson("configOut", got);
  });

  $("openRootBtn")?.addEventListener("click", async () => {
    const got = await callFs({ action: "openRoot", absolutePath: $("rootPath").value });
    showJson("configOut", got);
  });

  $("rootsBtn")?.addEventListener("click", async () => {
    const got = await callFs({ action: "roots" });
    showJson("configOut", got);
  });

  $("applyRootToExplorerBtn")?.addEventListener("click", () => {
    setValue("explorerPath", ".");
    switchPane("explorer");
  });
}

function openRootModal() {
  $("rootPickerModal")?.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeRootModal() {
  $("rootPickerModal")?.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function setCurrentRootPath(path) {
  currentRootPickerPath = path || "__ROOTS__";
  setValue("rootPickerPath", currentRootPickerPath);
  renderCrumbs(currentRootPickerPath);
}

function renderCrumbs(path) {
  const host = $("rootPickerLocation");
  if (!host) return;
  host.replaceChildren();

  if (!path || path === "__ROOTS__") {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.textContent = "Drives / roots";
    chip.addEventListener("click", () => browseRoot("__ROOTS__"));
    host.append(chip);
    return;
  }

  const parts = path.split(/[\\/]+/).filter(Boolean);
  let built = path.match(/^[A-Za-z]:/) ? path.slice(0, 2) : "";

  parts.forEach((part, index) => {
    if (index === 0 && /^[A-Za-z]:$/.test(part)) built = part;
    else built += (built.endsWith(":") ? "\\" : "\\") + part;

    const chip = document.createElement("button");
    chip.type = "button";
    chip.textContent = part;
    const target = built;
    chip.addEventListener("click", () => browseRoot(target));
    host.append(chip);
  });
}

async function browseRoot(path) {
  setCurrentRootPath(path || "__ROOTS__");
  setText("rootPickerNice", "Loading folders from local agent...");

  try {
    const got = await callFs({ action: "rootBrowse", absolutePath: currentRootPickerPath });
    lastRootBrowse = got;
    showJson("rootPickerOut", got);

    if (got?.current) setCurrentRootPath(got.current);

    const items = Array.isArray(got?.items) ? got.items : [];
    setText("rootPickerNice", got?.ok ? "Showing " + items.length + " folders in " + (got.current || currentRootPickerPath) : got?.message || got?.error || "Could not browse.");

    renderRootRows(items);
  } catch (e) {
    setText("rootPickerNice", e.message || String(e));
    showJson("rootPickerOut", { ok: false, error: e.message || String(e) });
  }
}

function renderRootRows(items) {
  const list = $("rootPickerList");
  if (!list) return;
  list.replaceChildren();

  if (!items.length) {
    list.append(makeDiv("empty-state", "No folders returned. Try Drives, Up, or another path."));
    return;
  }

  items.forEach(item => {
    const path = item.absolutePath || item.path || item.name || "";
    const name = item.name || path || "Folder";

    const row = document.createElement("button");
    row.type = "button";
    row.className = "root-row";
    row.innerHTML = "<span class='root-icon'>📁</span><span class='root-copy'><span class='root-name'></span><span class='root-path'></span></span><span>Open</span>";
    row.querySelector(".root-name").textContent = name;
    row.querySelector(".root-path").textContent = path;

    row.addEventListener("click", () => {
      qsa(".root-row").forEach(x => x.classList.remove("selected"));
      row.classList.add("selected");
      selectedRootPath = path;
      setText("rootPickerSelected", selectedRootPath || "None selected.");
    });

    row.addEventListener("dblclick", () => {
      selectedRootPath = path;
      browseRoot(path);
    });

    list.append(row);
  });
}

function mountRootPicker() {
  $("chooseRootBtn")?.addEventListener("click", () => {
    openRootModal();
    browseRoot($("rootPath")?.value || "__ROOTS__");
  });

  $("closeRootPickerBtn")?.addEventListener("click", closeRootModal);
  $("rootPickerBackdrop")?.addEventListener("click", closeRootModal);
  $("rootPickerRootsBtn")?.addEventListener("click", () => browseRoot("__ROOTS__"));
  $("rootPickerGoBtn")?.addEventListener("click", () => browseRoot($("rootPickerPath")?.value || "__ROOTS__"));
  $("rootPickerPath")?.addEventListener("keydown", event => {
    if (event.key === "Enter") browseRoot($("rootPickerPath").value || "__ROOTS__");
  });

  $("rootPickerUpBtn")?.addEventListener("click", () => {
    const parent = lastRootBrowse?.parent;
    if (parent) browseRoot(parent);
    else browseRoot("__ROOTS__");
  });

  $("rootPickerSelectBtn")?.addEventListener("click", async () => {
    const target = selectedRootPath || currentRootPickerPath;
    if (!target || target === "__ROOTS__") {
      setText("rootPickerNice", "Select a real folder first.");
      return;
    }

    setValue("rootPath", target);
    const got = await callFs({ action: "rootSelect", absolutePath: target });
    showJson("rootPickerOut", got);
    closeRootModal();
  });
}

function chromeValues() {
  return {
    chromePath: $("chromePath")?.value.trim() || "",
    port: Number($("chromePort")?.value || 9222),
    url: $("chromeUrl")?.value.trim() || "",
    selector: $("chromeSelector")?.value.trim() || "",
    text: $("chromeText")?.value || "",
    timeoutMs: Number($("chromeWaitTimeout")?.value || 10000),
    expression: $("chromeExpression")?.value.trim() || "",
    script: $("chromeScript")?.value || ""
  };
}

function chromeSteps(list) {
  const host = $("chromeDiagnostics");
  if (!host) return;
  host.replaceChildren();
  list.forEach(step => {
    const div = document.createElement("div");
    div.className = "diag-step";
    div.textContent = step;
    host.append(div);
  });
}

function extractChromePath(got) {
  const direct = got?.chromePath || got?.path || got?.foundPath || got?.chrome?.path || got?.data?.chromePath || got?.data?.path;
  if (direct) return String(direct);

  const candidates = got?.candidates || got?.paths || got?.data?.candidates || [];
  if (!Array.isArray(candidates)) return "";
  const first = candidates.find(x => typeof x === "string" || x?.path || x?.chromePath);
  if (!first) return "";
  return typeof first === "string" ? first : String(first.path || first.chromePath || "");
}

async function runChrome(action, button) {
  const done = setBusy(button, true);
  const v = chromeValues();

  const stepMap = {
    chromeFind: ["Searching common Chrome locations", "Asking local agent", "Preparing manual fallback"],
    chromeLaunch: ["Checking Chrome path", "Launching or connecting", "Preparing browser session"],
    chromeStatus: ["Checking debug port", "Reading open pages", "Reporting status"],
    chromeNavigate: ["Reading URL", "Navigating page", "Waiting for browser response"],
    chromeWaitForSelector: ["Reading selector", "Waiting inside page", "Returning selector status"],
    chromeClick: ["Reading selector", "Clicking element", "Returning click status"],
    chromeType: ["Reading selector and text", "Typing into page", "Returning type status"],
    chromeEval: ["Reading expression", "Evaluating in page", "Returning result"],
    chromeRunScript: ["Reading script JSON", "Running browser script", "Returning script result"]
  };

  chromeSteps(stepMap[action] || ["Running Chrome action"]);
  showJson("chromeOut", { ok: true, status: "working", action });

  try {
    const got = await callFs({
      action,
      chromePath: v.chromePath,
      port: v.port,
      url: v.url,
      selector: v.selector,
      text: v.text,
      timeoutMs: v.timeoutMs,
      expression: v.expression,
      script: v.script
    });

    if (action === "chromeFind") {
      const path = extractChromePath(got);
      if (path) {
        setValue("chromePath", path);
        chromeSteps(["Chrome found", "Path copied into Chrome path field", "Next step: Launch / Connect"]);
      } else {
        chromeSteps(["Auto-detect finished", "No clear path returned", "Use Manual"]);
      }
    }

    showJson("chromeOut", got);
  } catch (e) {
    chromeSteps(["Chrome action failed", "Read the output", "Use Manual if the path is missing"]);
    showJson("chromeOut", { ok: false, error: e.message || String(e) });
  } finally {
    done();
  }
}

function openChromeManual() {
  $("chromeManualModal")?.classList.remove("hidden");
  $("chromeManualPathInput").value = $("chromePath")?.value || "";
  document.body.classList.add("modal-open");
}

function closeChromeManual() {
  $("chromeManualModal")?.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function mountChromeManual() {
  const host = $("chromeCandidates");
  if (host) {
    host.replaceChildren();
    COMMON_CHROME_PATHS.forEach(path => {
      const row = document.createElement("div");
      row.className = "candidate";
      const code = document.createElement("code");
      code.textContent = path;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Use";
      btn.addEventListener("click", () => {
        setValue("chromePath", path);
        closeChromeManual();
      });
      row.append(code, btn);
      host.append(row);
    });
  }

  $("chromeManualBtn")?.addEventListener("click", openChromeManual);
  $("closeChromeManualBtn")?.addEventListener("click", closeChromeManual);
  $("chromeManualBackdrop")?.addEventListener("click", closeChromeManual);
  $("useChromeManualPathBtn")?.addEventListener("click", () => {
    setValue("chromePath", $("chromeManualPathInput")?.value || "");
    closeChromeManual();
  });
}

function mountChrome() {
  const map = [
    ["chromeFindBtn", "chromeFind"],
    ["chromeLaunchBtn", "chromeLaunch"],
    ["chromeStatusBtn", "chromeStatus"],
    ["chromeNavigateBtn", "chromeNavigate"],
    ["chromeWaitBtn", "chromeWaitForSelector"],
    ["chromeClickBtn", "chromeClick"],
    ["chromeTypeBtn", "chromeType"],
    ["chromeEvalBtn", "chromeEval"],
    ["chromeRunScriptBtn", "chromeRunScript"]
  ];

  map.forEach(([id, action]) => {
    $(id)?.addEventListener("click", event => runChrome(action, event.currentTarget));
  });

  mountChromeManual();
  chromeSteps(["Chrome controls ready", "Click Find Chrome", "Use Manual if detection fails"]);
}

function mountCommand() {
  $("runCommandBtn")?.addEventListener("click", async event => {
    const done = setBusy(event.currentTarget, true);
    try {
      const got = await callFs({
        action: "commandRun",
        shell: $("commandShell").value,
        cwd: $("commandCwd").value,
        command: $("commandText").value,
        timeoutMs: $("commandTimeout").value
      });
      showJson("terminalOut", got);
    } catch (e) {
      showJson("terminalOut", { ok: false, error: e.message || String(e) });
    } finally {
      done();
    }
  });
}

function mountUsage() {
  $("loadUsageBtn")?.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/tunnel/usage");
      const got = await res.json();
      showJson("usageOut", got);
    } catch (e) {
      showJson("usageOut", { ok: false, error: e.message || String(e) });
    }
  });
}

function mountAccount() {
  $("deviceRefreshBtn")?.addEventListener("click", refreshStatus);
  $("accountLoginBtn")?.addEventListener("click", () => $("loginBtn")?.click());
  $("accountLogoutBtn")?.addEventListener("click", () => $("logoutBtn")?.click());

  $("loginBtn")?.addEventListener("click", () => {
    location.href = "/login?next=" + encodeURIComponent(location.href);
  });

  $("logoutBtn")?.addEventListener("click", () => {
    location.href = "/logout?next=" + encodeURIComponent(location.href);
  });
}

function mountKeys() {
  $("saveApiKeyBtn")?.addEventListener("click", () => {
    const key = $("apiKeyInput")?.value || "";
    localStorage.setItem("awtTunnelApiKey", key);
    setText("miniKey", key ? "Saved locally" : "None");
    setText("activeKeySummary", key ? "Active key saved locally." : "No active key selected.");
  });

  $("clearApiKeyBtn")?.addEventListener("click", () => {
    localStorage.removeItem("awtTunnelApiKey");
    setText("miniKey", "None");
    setText("activeKeySummary", "No active key selected.");
  });

  $("refreshKeysBtn")?.addEventListener("click", async () => {
    const got = await callFs({ action: "keysList" });
    showJson("keysOut", got);
  });

  $("createKeyBtn")?.addEventListener("click", async () => {
    const scopes = [];
    if ($("scopeRead")?.checked) scopes.push("tunnel.read");
    if ($("scopeWrite")?.checked) scopes.push("tunnel.write");
    if ($("scopeCommand")?.checked) scopes.push("tunnel.command");
    if ($("scopeBrowser")?.checked) scopes.push("tunnel.browser");
    if ($("scopeAdmin")?.checked) scopes.push("tunnel.admin");

    const got = await callFs({
      action: "keyCreate",
      content: JSON.stringify({
        name: $("keyName")?.value || "local-dev-key",
        rate: Number($("keyRate")?.value || 120),
        bytes: Number($("keyBytes")?.value || 50000000),
        scopes
      })
    });

    showJson("keysOut", got);
    const key = got?.key || got?.apiKey || got?.token;
    if (key) {
      localStorage.setItem("awtTunnelApiKey", key);
      setText("miniKey", "Created");
      setText("activeKeySummary", "Created and activated key.");
    }
  });
}

function initDefaults() {
  const tunnel = params.get("tunnelName") || params.get("tunnel") || localStorage.getItem("awtTunnelName") || "";
  setValue("tunnelName", tunnel);

  $("tunnelName")?.addEventListener("input", () => {
    localStorage.setItem("awtTunnelName", getTunnelName());
    setText("miniTunnel", getTunnelName() || "No tunnel selected");
    renderPrompt();
  });

  if (localStorage.getItem("awtTunnelApiKey")) {
    setText("miniKey", "Saved locally");
    setText("activeKeySummary", "Active key saved locally.");
  }

  setText("miniTunnel", getTunnelName() || "No tunnel selected");
  renderPrompt();
}

function main() {
  initDefaults();
  mountTabs();
  mountCopy();
  mountExplorer();
  mountActions();
  mountConfig();
  mountRootPicker();
  mountChrome();
  mountCommand();
  mountUsage();
  mountAccount();
  mountKeys();

  $("projectPath")?.addEventListener("input", renderPrompt);
  $("promptMode")?.addEventListener("change", renderPrompt);
  $("refreshBtn")?.addEventListener("click", refreshStatus);

  refreshStatus();
  setInterval(refreshStatus, 8000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main, { once: true });
} else {
  main();
}
