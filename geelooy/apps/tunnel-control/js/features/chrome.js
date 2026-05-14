
// B"H

import { $ } from "../lib/dom.js";
import { callFs } from "../api/tunnel.js";

function parseScript() {
  const raw = $("chromeScript")?.value || "";

  if (!raw.trim()) {
    return [
      { type: "navigate", url: $("chromeUrl")?.value || "https://awtsmoos.com" },
      { type: "waitForSelector", selector: $("chromeSelector")?.value || "body", timeoutMs: Number($("chromeTimeout")?.value || 10000) },
      { type: "eval", expression: $("chromeExpression")?.value || "document.title" }
    ];
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    return [
      {
        type: "eval",
        expression: "({ ok:false, error:" + JSON.stringify(e.message) + " })"
      }
    ];
  }
}

function chromePayload(action) {
  return {
    action,
    chromePath: $("chromePath")?.value || "",
    port: $("chromePort")?.value || 9222,
    url: $("chromeUrl")?.value || "https://awtsmoos.com",
    selector: $("chromeSelector")?.value || "body",
    text: $("chromeText")?.value || "",
    expression: $("chromeExpression")?.value || "document.title",
    script: parseScript(),
    timeoutMs: $("chromeTimeout")?.value || 10000
  };
}

function niceChrome(got) {
  if (!got) return "No response.";

  if (!got.ok) {
    if (got.error === "missing_active_api_key" || got.error === "api_key_or_oauth_required") {
      return [
        "Permission needed.",
        "",
        "Chrome find/status can run with login.",
        "Chrome launch, navigate, click, type, eval, and scripts require an active API key with tunnel.browser or OAuth with tunnel.browser.",
        "",
        got.message || got.details || "",
        "",
        JSON.stringify(got, null, 2)
      ].join("\n");
    }

    if (got.error === "missing_scope") {
      return [
        "Permission missing.",
        "",
        "This API key does not have " + got.neededScope + ".",
        "Create or activate a key with tunnel.browser, then try again.",
        "",
        JSON.stringify(got, null, 2)
      ].join("\n");
    }

    return [
      "Chrome action failed.",
      got.error || "",
      got.message || "",
      got.details || "",
      "",
      JSON.stringify(got, null, 2)
    ].filter(Boolean).join("\n");
  }

  if (got.action === "chromeFind") {
    return [
      "Chrome path:",
      got.chromePath || "Not found",
      "",
      "Candidates:",
      ...(got.candidates || []).map(x => "- " + x)
    ].join("\n");
  }

  if (got.action === "chromeStatus") {
    return [
      "Connected: " + got.connected,
      "Port: " + got.port,
      "Chrome path: " + (got.chromePath || ""),
      "",
      "Pages:",
      ...(got.pages || []).map(p => "- " + (p.title || "(untitled)") + " → " + p.url),
      "",
      got.error ? "Error: " + got.error : ""
    ].join("\n");
  }

  if (got.action === "chromeLaunch") {
    return [
      "Chrome launched / connected.",
      "Path: " + got.chromePath,
      "Port: " + got.port,
      "Profile: " + got.userDataDir,
      "",
      JSON.stringify(got, null, 2)
    ].join("\n");
  }

  if (got.action === "chromeNavigate") {
    return [
      "Navigated:",
      got.url,
      "",
      JSON.stringify(got.navigation || got, null, 2)
    ].join("\n");
  }

  return JSON.stringify(got, null, 2);
}

async function runChrome(getTunnelName, action) {
  const out = $("chromeOut");

  if (!out) return;

  out.textContent = "Running " + action + "...";

  try {
    const got = await callFs(getTunnelName(), chromePayload(action));

    if (got.chromePath && $("chromePath")) {
      $("chromePath").value = got.chromePath;
    }

    out.textContent = niceChrome(got);
  } catch (e) {
    out.textContent = "Chrome UI error:\n" + (e.stack || e.message || String(e));
  }
}

function bind(id, getTunnelName, action) {
  const btn = $(id);

  if (!btn) {
    console.warn("[AwtsmoosTunnelControl] Missing Chrome button:", id);
    return;
  }

  btn.addEventListener("click", () => runChrome(getTunnelName, action));
}

export function mountChrome(getTunnelName) {
  bind("chromeFindBtn", getTunnelName, "chromeFind");
  bind("chromeLaunchBtn", getTunnelName, "chromeLaunch");
  bind("chromeStatusBtn", getTunnelName, "chromeStatus");
  bind("chromeNavigateBtn", getTunnelName, "chromeNavigate");
  bind("chromeWaitBtn", getTunnelName, "chromeWaitForSelector");
  bind("chromeClickBtn", getTunnelName, "chromeClick");
  bind("chromeTypeBtn", getTunnelName, "chromeType");
  bind("chromeEvalBtn", getTunnelName, "chromeEval");
  bind("chromeRunScriptBtn", getTunnelName, "chromeRunScript");
}
