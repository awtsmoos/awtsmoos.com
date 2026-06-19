// B"H
/**
 * Chrome launcher: a temporary palace for the browser, opened headlessly so
 * the Awtsmoos can judge the game without a human hand touching Chrome.
 */
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
      response.on("end", () => {
        try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
      });
    }).on("error", reject);
  });
}

async function waitForPage(debugPort) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const targets = await getJson(`http://127.0.0.1:${debugPort}/json`);
      const page = targets.find(target => target.type === "page" && target.webSocketDebuggerUrl);
      if (page) return page;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error("Chrome DevTools page target did not appear.");
}

export async function launchChrome(browserPath, targetUrl, debugPort = 9223) {
  const userDataDir = await mkdtemp(path.join(os.tmpdir(), "mitzvah-chrome-"));
  const args = [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "--window-size=1280,720",
    targetUrl
  ];
  const proc = spawn(browserPath, args, { stdio: "ignore" });
  const page = await waitForPage(debugPort);
  return {
    page,
    debugPort,
    userDataDir,
    close: async () => {
      proc.kill();
      await rm(userDataDir, { recursive: true, force: true });
    }
  };
}
