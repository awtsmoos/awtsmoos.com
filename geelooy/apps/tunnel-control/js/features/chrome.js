
// B"H

import { $ } from "../lib/dom.js";
import { callFs } from "../api/tunnel.js";

function chromePayload(action) {
  return {
    action,
    chromePath: $("chromePath").value,
    port: $("chromePort").value,
    url: $("chromeUrl").value,
    selector: $("chromeSelector").value,
    expression: $("chromeExpression").value,
    timeoutMs: $("chromeTimeout").value
  };
}

function niceChrome(got) {
  if (!got.ok) return JSON.stringify(got, null, 2);

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

  $("chromeEvalBtn").onclick = async () => {
    const got = await callFs(getTunnelName(), chromePayload("chromeEval"));
    $("chromeOut").textContent = niceChrome(got);
  };
}
