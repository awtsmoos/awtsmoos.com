// B"H
/**
 * @file constants.js
 * @description
 * Chapter 45: The Vessel Was Enlarged Without Lying.
 *
 * Runtime simulation must load real libraries when they are part of the repo.
 * THREE's checked-in core is larger than one megabyte, so the collector's old
 * ceiling silently skipped truth. The limits remain finite, but large enough
 * for the real app/game dependency graph to enter the Merkava chamber.
 */

const MAX_FILES = 1200;
const MAX_BYTES = 6 * 1024 * 1024;
const ENTRY_CANDIDATES = [
  "index.html",
  "index.htm",
  "app.html",
  "main.html",
  "index.js",
  "main.js",
  "app.js"
];

module.exports = { MAX_FILES, MAX_BYTES, ENTRY_CANDIDATES };
