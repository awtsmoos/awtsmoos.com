// B"H
/**
 * @file pathRefs.js
 * @description
 * Chapter 106: The CDN Rivers Bent Back Into Real Local Stone.
 *
 * The Awtsmoos lets remote-looking script roads become local only when the
 * repository holds the matching source vessel. No ghost module is invented;
 * only checked-in Three paths are revealed through the mist.
 */
const path = require("path");
const { cleanSpec, slash } = require("../pathUtils.js");

function normalizeRuntimeRef(spec, base) {
  const clean = String(spec || "").trim();
  if (!clean || clean.startsWith("data:") || clean.startsWith("blob:")) return null;
  const remoteAlias = cdnThreeAlias(clean) || httpToLocalPath(clean);
  if (remoteAlias) return remoteAlias;
  const mapped = localAlias(clean);
  if (mapped) return mapped;
  if (/^[a-z]+:/i.test(clean) || clean.startsWith("//")) return null;
  if (clean.startsWith("/")) return clean.replace(/^\/+/, "");
  if (clean.startsWith(".")) return relativePath(base, clean);
  if (isPathLike(clean)) return relativePath(base, clean);
  return bareAlias(clean);
}

function normalizeFromBase(spec, base) {
  return normalizeRuntimeRef(cleanSpec(spec), slash(base));
}

function relativePath(base, spec) {
  return slash(path.posix.normalize(path.posix.join(base, spec)));
}

function isPathLike(spec) {
  return spec.includes("/") || /\.(?:m?js|css|html?|json|wasm|dll|bin|dat|svg|png|jpe?g|gif|webp|mp3|wav|ogg)$/i.test(spec);
}

function httpToLocalPath(spec) {
  try { return localAlias(new URL(spec.startsWith("//") ? "https:" + spec : spec).pathname) || null; }
  catch (_) { return null; }
}

function localAlias(spec) {
  const clean = String(spec || "").replace(/^\/+/, "");
  const legacyEditor = legacyEditorAlias(clean);
  if (legacyEditor) return legacyEditor;
  const cdnAlias = cdnThreeAlias(clean);
  if (cdnAlias) return cdnAlias;
  if (clean.startsWith("geelooy/")) return clean;
  if (clean.startsWith("games/")) return "geelooy/" + clean;
  if (clean.startsWith("scripts/")) return "geelooy/" + clean;
  if (/^three\/addons\//i.test(clean)) return "geelooy/games/scripts/jsm/" + clean.replace(/^three\/addons\//i, "");
  if (/^three@[^/]+\/build\/three\.module\.js$/i.test(clean)) return "geelooy/games/scripts/build/three.module.js";
  if (/^three@[^/]+\/examples\/jsm\//i.test(clean)) return "geelooy/games/scripts/jsm/" + clean.replace(/^three@[^/]+\/examples\/jsm\//i, "");
  if (/^three\/examples\/jsm\//i.test(clean)) return "geelooy/games/scripts/jsm/" + clean.replace(/^three\/examples\/jsm\//i, "");
  if (/^three\/build\/three\.module\.js$/i.test(clean)) return "geelooy/games/scripts/build/three.module.js";
  return null;
}

function cdnThreeAlias(spec) {
  const clean = String(spec || "");
  if (/three\.js@[^/]+\/build\/three\.js$/i.test(clean)) return "geelooy/games/scripts/build/three.module.js";
  if (/three\.js@[^/]+\/examples\/js\/controls\/OrbitControls\.js$/i.test(clean)) return "geelooy/games/scripts/jsm/controls/OrbitControls.js";
  if (/three\.js@[^/]+\/examples\/js\/loaders\/GLTFLoader\.js$/i.test(clean)) return "geelooy/games/scripts/jsm/loaders/GLTFLoader.js";
  return null;
}

function legacyEditorAlias(clean) {
  const prefix = "games/mitzvahWorld/editor/lib/";
  if (!clean.startsWith(prefix)) return null;
  return "geelooy/apps/editor/old/lib/" + clean.slice(prefix.length);
}

function bareAlias(spec) {
  const clean = String(spec || "");
  if (clean === "three") return "geelooy/games/scripts/build/three.module.js";
  if (clean.startsWith("three/")) return localAlias(clean);
  return null;
}

module.exports = { normalizeRuntimeRef, normalizeFromBase, relativePath, isPathLike, localAlias, bareAlias };
