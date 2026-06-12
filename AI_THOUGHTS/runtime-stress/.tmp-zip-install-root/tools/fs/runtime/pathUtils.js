// B"H
/**
 * @file pathUtils.js
 * @description
 * Chapter 2: The Awtsmoos drew borders in dust and fire. Paths may walk, but
 * they may not flee the root where their mission was spoken into being.
 */

const path = require("path");

function slash(value) {
  return String(value || "").replace(/\\/g, "/");
}

function safeJoin(root, rel) {
  const base = path.resolve(root);
  const abs = path.resolve(base, String(rel || "."));
  return abs === base || abs.startsWith(base + path.sep) ? abs : null;
}

function cleanSpec(spec) {
  return String(spec || "").split("#")[0].split("?")[0].trim();
}

function isHtmlPath(value) {
  return /\.html?$/i.test(String(value || ""));
}

function isJsPath(value) {
  return /\.m?js$/i.test(String(value || ""));
}

module.exports = { slash, safeJoin, cleanSpec, isHtmlPath, isJsPath };
