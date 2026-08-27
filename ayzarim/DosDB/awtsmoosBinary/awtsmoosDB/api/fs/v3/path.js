// B"H
/**
 * @file path.js
 * @chapter The Road Was Measured Without Waste
 * @description
 * Tiny POSIX-like path helpers for the virtual filesystem. Every function
 * returns normalized slash paths so the indexes never split into duplicate
 * realities such as `/a//b` and `/a/b`.
 */

function normalize(cwd = "/", input = ".") {
  const raw = String(input || ".").replace(/\\/g, "/");
  const parts = raw.startsWith("/") ? [] : String(cwd || "/").split("/").filter(Boolean);
  for (const part of raw.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return `/${parts.join("/")}`;
}

function split(path) {
  return normalize("/", path).split("/").filter(Boolean);
}

function dirname(path) {
  const parts = split(path);
  parts.pop();
  return `/${parts.join("/")}`;
}

function basename(path) {
  return split(path).pop() || "";
}

function join(parent, child) {
  return normalize("/", `${normalize("/", parent)}/${child}`);
}

module.exports = { normalize, split, dirname, basename, join };
