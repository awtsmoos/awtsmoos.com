// B"H
/**
 * @file chromeScreenshot.js
 * @description
 * The first choice is always a real browser eye. If Chromium/Chrome exists,
 * Merkava asks it to render the HTML into a PNG file using headless screenshot
 * mode. If the local vessel lacks Chrome, the caller can fall back honestly.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";
import { dataUrlFromPng } from "./pngTools.js";

const CANDIDATES = [
  process.env.CHROME_PATH,
  process.env.CHROMIUM_PATH,
  "chromium-browser",
  "chromium",
  "google-chrome",
  "google-chrome-stable",
  "chrome"
].filter(Boolean);

export function findChromeExecutable() {
  for (const candidate of CANDIDATES) {
    const result = spawnSync("bash", ["-lc", `command -v ${JSON.stringify(candidate)} 2>/dev/null || test -x ${JSON.stringify(candidate)} && echo ${JSON.stringify(candidate)}`], { encoding: "utf8", timeout: 3000 });
    const found = String(result.stdout || "").trim().split(/\n/).filter(Boolean)[0];
    if (found) return found;
  }
  return null;
}

export function captureChromeScreenshot({ html = "", width = 960, height = 640, timeoutMs = 20000 } = {}) {
  const chrome = findChromeExecutable();
  if (!chrome) return { ok: false, reason: "chrome_not_found" };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "merkava-shot-"));
  const pngPath = path.join(dir, "snapshot.png");
  const html64 = Buffer.from(String(html || ""), "utf8").toString("base64");
  const url = `data:text/html;base64,${html64}`;
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    `--window-size=${width},${height}`,
    `--screenshot=${pngPath}`,
    url
  ];
  const run = spawnSync(chrome, args, { encoding: "utf8", timeout: timeoutMs });
  if (run.status !== 0 || !fs.existsSync(pngPath)) {
    return { ok: false, reason: "chrome_screenshot_failed", chrome, status: run.status, stderr: run.stderr || "" };
  }
  const png = fs.readFileSync(pngPath);
  return { ok: true, backend: "chrome-headless", chrome, width, height, bytes: png.length, mimeType: "image/png", dataUrl: dataUrlFromPng(png) };
}
