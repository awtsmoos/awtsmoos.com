// B"H
/**
 * @file collector.js
 * @description
 * Chapter 9: File by file, the Awtsmoos gathered sparks into a virtual browser
 * world, refusing oversized giants and following only safe reachable paths.
 */

const fs = require("fs");
const path = require("path");
const { MAX_FILES, MAX_BYTES } = require("./constants.js");
const { refsFrom } = require("./sourceRefs.js");
const { slash, safeJoin } = require("./pathUtils.js");

function collectReachableFiles(root, entryAbs) {
  const files = {};
  const queue = [entryAbs];
  const seen = new Set();
  while (queue.length && Object.keys(files).length < MAX_FILES) {
    const abs = queue.shift();
    if (!isReadableFile(abs, seen)) continue;
    seen.add(abs);
    const stat = fs.statSync(abs);
    if (stat.size > MAX_BYTES) continue;
    const key = slash(path.relative(root, abs));
    const text = fs.readFileSync(abs, "utf8");
    files[key] = text;
    enqueueRefs(root, key, text, queue);
  }
  return files;
}

function enqueueRefs(root, key, text, queue) {
  for (const ref of refsFrom(text, key)) {
    const next = safeJoin(root, ref);
    if (next && fs.existsSync(next) && fs.statSync(next).isFile()) queue.push(next);
  }
}

function isReadableFile(abs, seen) {
  return abs && !seen.has(abs) && fs.existsSync(abs) && fs.statSync(abs).isFile();
}

module.exports = { collectReachableFiles };
