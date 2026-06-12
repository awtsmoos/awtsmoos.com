
// B"H

const fs = require("fs");
const path = require("path");
const os = require("os");
const childProcess = require("child_process");

/**
 * B"H
 * Checks whether a path exists.
 *
 * @param {string} p Path.
 * @returns {boolean} Whether it exists.
 */
function exists(p) {
  try {
    return !!p && fs.existsSync(p);
  } catch (e) {
    return false;
  }
}

/**
 * B"H
 * Pushes only useful unique values.
 *
 * @param {string[]} list Candidate list.
 * @param {...string} values Values.
 * @returns {void}
 */
function add(list, ...values) {
  for (const value of values) {
    if (value && !list.includes(value)) list.push(value);
  }
}

/**
 * B"H
 * Reads possible browser executables from PATH.
 *
 * @returns {string[]} PATH candidates.
 */
function pathCandidates() {
  const names = process.platform === "win32"
    ? ["chrome.exe", "msedge.exe", "brave.exe", "chromium.exe"]
    : ["google-chrome", "chrome", "chromium", "chromium-browser", "microsoft-edge", "brave-browser", "brave"];

  const found = [];

  for (const name of names) {
    try {
      const cmd = process.platform === "win32"
        ? `where ${name}`
        : `command -v ${name}`;

      const out = childProcess.execSync(cmd, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"]
      });

      for (const line of out.split(/\r?\n/)) {
        if (line.trim()) add(found, line.trim());
      }
    } catch (e) {}
  }

  return found;
}

/**
 * B"H
 * Builds Windows browser candidates.
 *
 * @returns {string[]} Candidates.
 */
function windowsCandidates() {
  const home = os.homedir();
  const pf = process.env.ProgramFiles || "C:\\Program Files";
  const pf86 = process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";
  const local = process.env.LOCALAPPDATA || path.join(home, "AppData", "Local");

  const list = [];

  add(
    list,

    path.join(pf, "Google", "Chrome", "Application", "chrome.exe"),
    path.join(pf86, "Google", "Chrome", "Application", "chrome.exe"),
    path.join(local, "Google", "Chrome", "Application", "chrome.exe"),

    path.join(pf, "Google", "Chrome Beta", "Application", "chrome.exe"),
    path.join(pf86, "Google", "Chrome Beta", "Application", "chrome.exe"),
    path.join(local, "Google", "Chrome Beta", "Application", "chrome.exe"),

    path.join(pf, "Google", "Chrome Dev", "Application", "chrome.exe"),
    path.join(pf86, "Google", "Chrome Dev", "Application", "chrome.exe"),
    path.join(local, "Google", "Chrome Dev", "Application", "chrome.exe"),

    path.join(local, "Google", "Chrome SxS", "Application", "chrome.exe"),

    path.join(pf, "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(pf86, "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(local, "Microsoft", "Edge", "Application", "msedge.exe"),

    path.join(pf, "BraveSoftware", "Brave-Browser", "Application", "brave.exe"),
    path.join(pf86, "BraveSoftware", "Brave-Browser", "Application", "brave.exe"),
    path.join(local, "BraveSoftware", "Brave-Browser", "Application", "brave.exe"),

    path.join(pf, "Chromium", "Application", "chrome.exe"),
    path.join(pf86, "Chromium", "Application", "chrome.exe"),
    path.join(local, "Chromium", "Application", "chrome.exe")
  );

  add(list, ...pathCandidates());
  return list;
}

/**
 * B"H
 * Builds macOS browser candidates.
 *
 * @returns {string[]} Candidates.
 */
function macCandidates() {
  const list = [];

  add(
    list,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta",
    "/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev",
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    path.join(os.homedir(), "Applications", "Google Chrome.app", "Contents", "MacOS", "Google Chrome"),
    path.join(os.homedir(), "Applications", "Brave Browser.app", "Contents", "MacOS", "Brave Browser")
  );

  add(list, ...pathCandidates());
  return list;
}

/**
 * B"H
 * Builds Linux browser candidates.
 *
 * @returns {string[]} Candidates.
 */
function linuxCandidates() {
  const list = [];

  add(
    list,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/microsoft-edge",
    "/usr/bin/microsoft-edge-stable",
    "/usr/bin/brave-browser",
    "/snap/bin/chromium",
    "/snap/bin/brave",
    "/opt/google/chrome/chrome",
    "/opt/microsoft/msedge/msedge",
    "/opt/brave.com/brave/brave"
  );

  add(list, ...pathCandidates());
  return list;
}

/**
 * B"H
 * Returns all browser candidates for this platform.
 *
 * @returns {string[]} Candidate paths.
 */
function chromeCandidates() {
  if (process.platform === "win32") return windowsCandidates();
  if (process.platform === "darwin") return macCandidates();
  return linuxCandidates();
}

/**
 * B"H
 * Finds the first existing browser candidate.
 *
 * @returns {string} Browser path.
 */
function findChrome() {
  return chromeCandidates().find(exists) || "";
}

/**
 * B"H
 * Gives a full diagnostic result for the UI.
 *
 * @returns {object} Finder result.
 */
function chromeFindDetails() {
  const candidates = chromeCandidates();
  const existing = candidates.filter(exists);
  const chromePath = existing[0] || "";

  return {
    platform: process.platform,
    arch: process.arch,
    home: os.homedir(),
    chromePath,
    found: !!chromePath,
    existing,
    candidates,
    searchedCount: candidates.length,
    message: chromePath
      ? "Browser found. The dashboard path field can use this automatically."
      : "No browser executable found in standard locations or PATH. Paste the full chrome.exe/msedge.exe/brave.exe path manually."
  };
}

module.exports = {
  chromeCandidates,
  findChrome,
  chromeFindDetails
};
