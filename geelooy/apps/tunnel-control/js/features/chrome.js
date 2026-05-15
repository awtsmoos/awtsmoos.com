
// B"H

/**
 * B"H
 * Browser control feature.
 *
 * This file is intentionally compatible with the older non-module control
 * page. It does not depend on imports. It finds the current Chrome controls,
 * gives every click immediate visible feedback, and adds a manual Chrome path
 * popup so the Find Chrome flow never feels dead.
 */
(function awtChromeFeature() {
  const COMMON_PATHS = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser"
  ];

  /**
   * B"H
   * Gets element by id.
   *
   * @param {string} id Element id.
   * @returns {HTMLElement|null} Element.
   */
  function $(id) {
    return document.getElementById(id);
  }

  /**
   * B"H
   * Creates an element.
   *
   * @param {string} tag Tag name.
   * @param {object} props Properties.
   * @returns {HTMLElement} Element.
   */
  function el(tag, props) {
    const node = document.createElement(tag);
    props = props || {};

    if (props.className) node.className = props.className;
    if (props.id) node.id = props.id;
    if (props.text !== undefined) node.textContent = String(props.text);
    if (props.type) node.setAttribute("type", props.type);
    if (props.placeholder) node.setAttribute("placeholder", props.placeholder);

    if (props.attrs) {
      for (const key of Object.keys(props.attrs)) {
        node.setAttribute(key, String(props.attrs[key]));
      }
    }

    if (props.on) {
      for (const key of Object.keys(props.on)) {
        node.addEventListener(key, props.on[key]);
      }
    }

    for (const child of props.children || []) {
      node.append(child);
    }

    return node;
  }

  /**
   * B"H
   * Finds Chrome pane.
   *
   * @returns {HTMLElement|null} Pane.
   */
  function pane() {
    return (
      document.querySelector("[data-pane='chrome']") ||
      document.querySelector("[data-page='chrome']") ||
      Array.from(document.querySelectorAll("section, .pane, .page")).find(node =>
        /browser control|chrome/i.test(node.textContent || "")
      )
    );
  }

  /**
   * B"H
   * Finds a button by text.
   *
   * @param {HTMLElement} root Root.
   * @param {RegExp} pattern Text pattern.
   * @returns {HTMLButtonElement|null} Button.
   */
  function button(root, pattern) {
    return Array.from(root.querySelectorAll("button")).find(btn =>
      pattern.test((btn.textContent || "").trim())
    ) || null;
  }

  /**
   * B"H
   * Returns all visible text-ish fields.
   *
   * @param {HTMLElement} root Root.
   * @returns {Array<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>} Fields.
   */
  function fields(root) {
    return Array.from(root.querySelectorAll("input, textarea, select")).filter(node =>
      node.type !== "hidden"
    );
  }

  /**
   * B"H
   * Reads fields with fallback order.
   *
   * @param {HTMLElement} root Root.
   * @returns {object} Values and nodes.
   */
  function read(root) {
    const list = fields(root);
    const textareas = Array.from(root.querySelectorAll("textarea"));

    const nodes = {
      chromePath: $("chromePath") || list[0] || null,
      port: $("chromePort") || list[1] || null,
      url: $("chromeUrl") || list[2] || null,
      selector: $("chromeSelector") || list[3] || null,
      text: $("chromeText") || list[4] || null,
      waitTimeout: $("chromeWaitTimeout") || list[5] || null,
      expression: $("chromeExpression") || list[6] || null,
      script: $("chromeScript") || textareas[textareas.length - 1] || list[7] || null
    };

    const value = node => String(node && node.value || "").trim();
    const intValue = (node, fallback) => {
      const n = Number(value(node));
      return Number.isFinite(n) && n > 0 ? n : fallback;
    };

    return {
      nodes,
      values: {
        chromePath: value(nodes.chromePath),
        port: intValue(nodes.port, 9222),
        url: value(nodes.url),
        selector: value(nodes.selector),
        text: value(nodes.text),
        waitTimeout: intValue(nodes.waitTimeout, 10000),
        expression: value(nodes.expression),
        scriptText: value(nodes.script)
      }
    };
  }

  /**
   * B"H
   * Finds output box.
   *
   * @param {HTMLElement} root Root.
   * @returns {HTMLElement} Output.
   */
  function output(root) {
    let out = $("chromeOut") || root.querySelector("pre");
    if (!out) {
      out = el("pre", { id: "chromeOut", text: "Ready." });
      root.append(out);
    }
    out.classList.add("awt-chrome-output");
    return out;
  }

  /**
   * B"H
   * Gets diagnostics host.
   *
   * @param {HTMLElement} root Root.
   * @param {HTMLElement} out Output.
   * @returns {HTMLElement} Diagnostics.
   */
  function diagnostics(root, out) {
    let box = root.querySelector(".awt-chrome-diagnostics");
    if (!box) {
      box = el("div", { className: "awt-chrome-diagnostics" });
      out.before(box);
    }
    return box;
  }

  /**
   * B"H
   * Renders steps.
   *
   * @param {HTMLElement} box Diagnostics box.
   * @param {string[]} steps Steps.
   * @returns {void}
   */
  function steps(box, steps) {
    box.replaceChildren();
    for (const step of steps) {
      box.append(el("div", { className: "awt-chrome-step", text: step }));
    }
  }

  /**
   * B"H
   * Writes output JSON.
   *
   * @param {HTMLElement} out Output.
   * @param {unknown} payload Payload.
   * @returns {void}
   */
  function writeOut(out, payload) {
    try {
      out.textContent = JSON.stringify(payload, null, 2);
    } catch (e) {
      out.textContent = String(payload);
    }
  }

  /**
   * B"H
   * Builds API URL.
   *
   * @param {object} opts Options.
   * @returns {string} URL.
   */
  function buildUrl(opts) {
    const tunnelName = encodeURIComponent(($("tunnelName") && $("tunnelName").value || "").trim());
    const url = new URL("/api/tunnel/fs/" + tunnelName, location.origin);

    for (const key of Object.keys(opts)) {
      if (opts[key] !== undefined && opts[key] !== "") {
        url.searchParams.set(key, String(opts[key]));
      }
    }

    return url.toString();
  }

  /**
   * B"H
   * Calls the tunnel.
   *
   * @param {object} opts Query options.
   * @returns {Promise<object>} Response.
   */
  async function call(opts) {
    const url = buildUrl(opts);
    const actionUrlOut = $("actionUrlOut");
    if (actionUrlOut) actionUrlOut.textContent = url;

    const res = await fetch(url);
    const txt = await res.text();

    try {
      return JSON.parse(txt);
    } catch (e) {
      return { ok: false, raw: txt };
    }
  }

  /**
   * B"H
   * Converts a raw browser action to API query.
   *
   * @param {string} action Action.
   * @param {object} values Values.
   * @returns {object} Query.
   */
  function queryFor(action, values) {
    const base = {
      action,
      port: values.port,
      chromePath: values.chromePath || undefined
    };

    const map = {
      chromeFind: () => ({ action: "chromeFind" }),
      chromeLaunch: () => ({ ...base, action: "chromeLaunch", url: values.url || undefined }),
      chromeStatus: () => ({ ...base, action: "chromeStatus" }),
      chromeNavigate: () => ({ ...base, action: "chromeNavigate", url: values.url }),
      chromeWaitForSelector: () => ({
        ...base,
        action: "chromeWaitForSelector",
        selector: values.selector,
        timeoutMs: values.waitTimeout
      }),
      chromeClick: () => ({ ...base, action: "chromeClick", selector: values.selector }),
      chromeType: () => ({
        ...base,
        action: "chromeType",
        selector: values.selector,
        text: values.text
      }),
      chromeEval: () => ({ ...base, action: "chromeEval", expression: values.expression }),
      chromeRunScript: () => ({
        ...base,
        action: "chromeRunScript",
        script: values.scriptText
      })
    };

    return (map[action] || map.chromeStatus)();
  }

  /**
   * B"H
   * Extracts Chrome path from response.
   *
   * @param {object} got Response.
   * @returns {string} Path.
   */
  function foundPath(got) {
    const direct =
      got && (got.chromePath || got.path || got.foundPath) ||
      got && got.chrome && (got.chrome.path || got.chrome.chromePath) ||
      got && got.data && (got.data.path || got.data.chromePath);

    if (direct) return String(direct);

    const candidates =
      got && (got.candidates || got.paths) ||
      got && got.data && got.data.candidates ||
      [];

    if (!Array.isArray(candidates)) return "";

    const first = candidates.find(item => typeof item === "string" || item.path || item.chromePath);
    if (!first) return "";

    return typeof first === "string" ? first : String(first.path || first.chromePath || "");
  }

  /**
   * B"H
   * Opens manual Chrome modal.
   *
   * @param {object} nodes Field nodes.
   * @returns {void}
   */
  function openManual(nodes) {
    let modal = $("chromeManualModal");

    if (!modal) {
      const input = el("input", {
        id: "chromeManualPathInput",
        type: "text",
        placeholder: "Paste full path to Chrome executable"
      });

      const candidates = el("div", { className: "chrome-candidates" });

      for (const path of COMMON_PATHS) {
        candidates.append(
          el("div", {
            className: "chrome-candidate",
            children: [
              el("code", { text: path }),
              el("button", {
                type: "button",
                className: "btn-sm",
                text: "Use",
                on: {
                  click: () => {
                    if (nodes.chromePath) nodes.chromePath.value = path;
                    closeManual();
                  }
                }
              })
            ]
          })
        );
      }

      modal = el("div", {
        id: "chromeManualModal",
        className: "hidden",
        attrs: { role: "dialog", "aria-modal": "true" },
        children: [
          el("div", {
            id: "chromeManualBackdrop",
            className: "awt-modal-backdrop",
            on: { click: closeManual }
          }),
          el("div", {
            className: "chrome-manual-dialog",
            children: [
              el("div", {
                className: "modal-head",
                children: [
                  el("div", {
                    children: [
                      el("div", { className: "root-picker-eyebrow", text: "Chrome path" }),
                      el("h2", { text: "Choose Chrome manually" }),
                      el("p", { text: "Use this when Find Chrome cannot detect the executable." })
                    ]
                  }),
                  el("button", { type: "button", className: "btn-sm", text: "Close", on: { click: closeManual } })
                ]
              }),
              el("div", {
                className: "chrome-manual-body",
                children: [
                  el("label", { text: "Manual Chrome executable path" }),
                  input,
                  candidates
                ]
              }),
              el("div", {
                className: "modal-foot",
                children: [
                  el("span", { className: "awt-muted", text: "After saving, click Launch / Connect." }),
                  el("button", {
                    type: "button",
                    className: "btn-primary",
                    text: "Use this path",
                    on: {
                      click: () => {
                        if (nodes.chromePath) nodes.chromePath.value = input.value.trim();
                        closeManual();
                      }
                    }
                  })
                ]
              })
            ]
          })
        ]
      });

      document.body.append(modal);
    }

    const input = $("chromeManualPathInput");
    if (input && nodes.chromePath) input.value = nodes.chromePath.value || "";
    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
  }

  /**
   * B"H
   * Closes manual modal.
   *
   * @returns {void}
   */
  function closeManual() {
    const modal = $("chromeManualModal");
    if (modal) modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }

  /**
   * B"H
   * Runs one Chrome action.
   *
   * @param {HTMLElement} root Chrome root.
   * @param {string} action Action.
   * @param {HTMLButtonElement} btn Button.
   * @returns {Promise<void>} Done.
   */
  async function run(root, action, btn) {
    const out = output(root);
    const diag = diagnostics(root, out);
    const readResult = read(root);
    const values = readResult.values;

    const labels = {
      chromeFind: ["Searching common Chrome locations", "Asking local agent", "Preparing manual fallback"],
      chromeLaunch: ["Checking Chrome path", "Launching or connecting", "Preparing control session"],
      chromeStatus: ["Checking debugging port", "Reading open pages", "Reporting status"],
      chromeNavigate: ["Reading URL", "Sending navigation request", "Waiting for browser response"],
      chromeWaitForSelector: ["Reading selector", "Waiting inside page", "Returning selector status"],
      chromeClick: ["Reading selector", "Sending click request", "Returning click status"],
      chromeType: ["Reading selector and text", "Typing into page", "Returning type status"],
      chromeEval: ["Reading JS expression", "Evaluating in page", "Returning result"],
      chromeRunScript: ["Reading script", "Sending browser steps", "Returning script result"]
    };

    steps(diag, labels[action] || ["Running Chrome action"]);
    writeOut(out, { BH: "B\"H", ok: true, status: "working", action });

    const old = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Working...";

    try {
      const got = await call(queryFor(action, values));

      if (action === "chromeFind") {
        const path = foundPath(got);
        if (path && readResult.nodes.chromePath) {
          readResult.nodes.chromePath.value = path;
          steps(diag, ["Chrome found", "Path copied into Chrome path field", "Next step: Launch / Connect"]);
        } else {
          steps(diag, ["Auto-detect finished", "No clear path returned", "Use Choose Chrome manually"]);
        }
      }

      writeOut(out, got);
    } catch (e) {
      steps(diag, ["Chrome action failed", "Read the output", "Use manual picker if path is missing"]);
      writeOut(out, { BH: "B\"H", ok: false, error: "chrome_action_failed", message: e.message || String(e) });
    } finally {
      btn.disabled = false;
      btn.textContent = old;
    }
  }

  /**
   * B"H
   * Wires a button.
   *
   * @param {HTMLElement} root Chrome root.
   * @param {RegExp} pattern Button text pattern.
   * @param {string} action Action.
   * @returns {void}
   */
  function wire(root, pattern, action) {
    const btn = button(root, pattern);
    if (!btn || btn.dataset.awtChromeBound === "1") return;
    btn.dataset.awtChromeBound = "1";
    btn.addEventListener("click", event => {
      event.preventDefault();
      run(root, action, btn);
    });
  }

  /**
   * B"H
   * Mounts browser controls.
   *
   * @returns {void}
   */
  function mount() {
    const root = pane();
    if (!root || root.dataset.awtChromeMounted === "1") return;

    root.dataset.awtChromeMounted = "1";
    root.classList.add("awt-chrome-dashboard");

    const out = output(root);
    const diag = diagnostics(root, out);
    steps(diag, ["Chrome controls ready", "Click Find Chrome", "Use Choose Chrome manually if needed"]);

    const readResult = read(root);
    const findBtn = button(root, /^Find Chrome$/i);

    if (findBtn && !$("chromeManualBtn")) {
      const manual = el("button", {
        id: "chromeManualBtn",
        type: "button",
        className: "btn-sm",
        text: "Choose Chrome manually",
        on: {
          click: event => {
            event.preventDefault();
            openManual(read(root).nodes);
          }
        }
      });
      findBtn.insertAdjacentElement("afterend", manual);
    }

    wire(root, /^Find Chrome$/i, "chromeFind");
    wire(root, /^Launch\s*\/\s*Connect$/i, "chromeLaunch");
    wire(root, /^Status$/i, "chromeStatus");
    wire(root, /^Navigate$/i, "chromeNavigate");
    wire(root, /^Wait$/i, "chromeWaitForSelector");
    wire(root, /^Click$/i, "chromeClick");
    wire(root, /^Type$/i, "chromeType");
    wire(root, /^Evaluate\s*JS$/i, "chromeEval");
    wire(root, /^Run\s*script$/i, "chromeRunScript");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }

  setTimeout(mount, 400);
  setTimeout(mount, 1200);
})();
