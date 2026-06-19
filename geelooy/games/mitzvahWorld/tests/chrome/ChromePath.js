// B"H
/**
 * Browser path discovery: the Awtsmoos hides the chrome vessel in many rooms,
 * so this finder knocks on each door before declaring the test impossible.
 */
import { existsSync } from "node:fs";
import path from "node:path";

function localApp(relativePath) {
  return process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, relativePath) : "";
}

export function findBrowser() {
  const candidates = [
    ["CHROME_PATH", process.env.CHROME_PATH || ""],
    ["Chrome", "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"],
    ["Chrome x86", "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"],
    ["Chrome local", localApp("Google\\Chrome\\Application\\chrome.exe")],
    ["Edge", "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"],
    ["Edge x86", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"],
    ["Edge local", localApp("Microsoft\\Edge\\Application\\msedge.exe")]
  ];
  const found = candidates.find(([, file]) => file && existsSync(file));
  return found ? { name: found[0], path: found[1], candidates } : { name: "none", path: "", candidates };
}
