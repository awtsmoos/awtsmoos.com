
// B"H

import { $ } from "../lib/dom.js";
import { callFs } from "../api/tunnel.js";

function parseScript() {
  try {
    return JSON.parse($("chromeScript").value);
  } catch (e) {
    return [{ type: "eval", expression: "({ ok:false, error:" + JSON.stringify(e.message) + " })" }];
  }
}

function chromePayload(action) {
  return {
    action,
    chromePath: $("chromePath").value,
    port: $("chromePort").value,
    url: $("chromeUrl").value,
    selector: $("chromeSelector").value,
    text: $("chromeText").value,
    expression: $("chromeExpression").value,
    script: parseScript(),
    timeoutMs: $("chromeTimeout").value
  };
}

function niceChrome(got) {
  if (!got.ok) {
    if (got.error === "missing_scope") {
      return [
        "Permission missing.",
        "",
        "This API key does not have tunnel.browser.",
        "Create or activate a key with tunnel.browser, then try again.",
        "",
        JSON.stringify(got, null, 2)
      ].join("\n");
    }

    return JSON.stringify(got, null, 2);
  }

  if (got.action === "chromeFind") {
    return [
      "Chrome path:",
      got.chromePath || "Not found",
      "",
      "Candidates:",
      ...(got.candidates || [])
    ].join("\n");
  }

  if (got.action === "chromeStatus") {
    return [
      "Connected: " + got.connected,
      "Port: " + got.port,
      "Chrome path: " + (got.chromePath || ""),
      "",
      "Pages:",
      ...(got.pages || []).map(p => "- " + p.title + " → " + p.url),
      "",
      got.error ? "Error: " + got.error : ""
    ].join("\n");
  }

  return JSON.stringify(got, null, 2);
}

export function mountChrome(getTunnelName) {
  $("chromeFindBtn").onclick = async () => {
    const got = await callFs(getTunnelName(), chromePayload("chromeFind"));
    if (got.chromePath) $("chromePath").value = got.chromePath;
    $("chromeOut").textContent = niceChrome(got);
  };

  $("chromeLaunchBtn").onclick = async () => {
    $("chromeOut").textContent = "Launching / connecting...";
    const got = await callFs(getTunnelName(), chromePayload("chromeLaunch"));
    $("chromeOut").textContent = niceChrome(got);
  };

  $("chromeStatusBtn").onclick = async () => {
    const got = await callFs(getTunnelName(), chromePayload("chromeStatus"));
    $("chromeOut").textContent = niceChrome(got);
  };

  $("chromeNavigateBtn").onclick = async () => {
    const got = await callFs(getTunnelName(), chromePayload("chromeNavigate"));
    $("chromeOut").textContent = niceChrome(got);
  };

  $("chromeWaitBtn").onclick = async () => {
    const got = await callFs(getTunnelName(), chromePayload("chromeWaitForSelector"));
    $("chromeOut").textContent = niceChrome(got);
  };

  $("chromeClickBtn").onclick = async () => {
    const got = await callFs(getTunnelName(), chromePayload("chromeClick"));
    $("chromeOut").textContent = niceChrome(got);
  };

  $("chromeTypeBtn").onclick = async () => {
    const got = await callFs(getTunnelName(), chromePayload("chromeType"));
    $("chromeOut").textContent = niceChrome(got);
  };

  $("chromeEvalBtn").onclick = async () => {
    const got = await callFs(getTunnelName(), chromePayload("chromeEval"));
    $("chromeOut").textContent = niceChrome(got);
  };

  $("chromeRunScriptBtn").onclick = async () => {
    $("chromeOut").textContent = "Running browser script...";
    const got = await callFs(getTunnelName(), chromePayload("chromeRunScript"));
    $("chromeOut").textContent = niceChrome(got);
  };
}
