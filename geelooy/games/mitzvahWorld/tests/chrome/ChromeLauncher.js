// B"H
/** Chrome launcher: wait for the requested page, not a false about:blank vessel. */
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, response => {
      let body = "";
      response.on("data", chunk => { body += chunk; });
      response.on("end", () => { try { resolve(JSON.parse(body)); } catch (error) { reject(error); } });
    }).on("error", reject);
  });
}

function targetMatches(page, targetUrl) {
  if (!page?.webSocketDebuggerUrl || page.type !== "page") return false;
  const url = String(page.url || "");
  if (!targetUrl) return url && url !== "about:blank";
  const expected = String(targetUrl).split("#")[0];
  const withoutAudit = expected.replace(/([?&])awtsAudit=[^&]+&?/, "$1").replace(/[?&]$/, "");
  return url === expected || url.startsWith(expected) || url.startsWith(withoutAudit) || (url.includes("mitzvahWorld") && url.includes("path=village.json"));
}

async function waitForPage(debugPort, targetUrl) {
  let fallback = null;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const targets = await getJson(`http://127.0.0.1:${debugPort}/json`);
      const pages = targets.filter(target => target.type === "page" && target.webSocketDebuggerUrl);
      const match = pages.find(page => targetMatches(page, targetUrl));
      if (match) return match;
      fallback ||= pages.find(page => String(page.url || "") !== "about:blank") || pages[0] || null;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  if (fallback) return fallback;
  throw new Error("Chrome DevTools page target did not appear.");
}

function waitForExit(proc, timeoutMs = 2500) {
  return new Promise(resolve => {
    if (proc.exitCode !== null || proc.signalCode) return resolve();
    const timer = setTimeout(resolve, timeoutMs);
    proc.once("exit", () => { clearTimeout(timer); resolve(); });
  });
}

async function removeProfile(dir) {
  let lastError = null;
  for (let attempt = 0; attempt < 18; attempt += 1) {
    try { await rm(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 120 }); return; }
    catch (error) {
      lastError = error;
      if (!["EBUSY", "EPERM", "ENOTEMPTY"].includes(error?.code)) throw error;
      await new Promise(resolve => setTimeout(resolve, 220 + attempt * 140));
    }
  }
  try { await rm(dir, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 }); }
  catch (error) { console.warn('B"H | CHROME_PROFILE_CLEANUP_DEFERRED', { dir, message:String((error || lastError)?.message || error || lastError) }); }
}

export async function launchChrome(browserPath, targetUrl, debugPort = 9223, options = {}) {
  const userDataDir = await mkdtemp(path.join(os.tmpdir(), "mitzvah-chrome-"));
  const args = [
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "--disable-frame-rate-limit",
    "--disable-gpu-vsync",
    `--window-size=${options.width || 1280},${options.height || 720}`,
    targetUrl
  ];
  if (options.headless !== false) args.unshift("--headless=new");
  const proc = spawn(browserPath, args, { stdio: "ignore" });
  const page = await waitForPage(debugPort, targetUrl);
  return {
    page,
    debugPort,
    userDataDir,
    close: async () => {
      if (proc.exitCode === null && !proc.signalCode) proc.kill();
      await waitForExit(proc);
      if (proc.exitCode === null && !proc.signalCode) proc.kill("SIGKILL");
      await waitForExit(proc, 1200);
      await removeProfile(userDataDir);
    }
  };
}
