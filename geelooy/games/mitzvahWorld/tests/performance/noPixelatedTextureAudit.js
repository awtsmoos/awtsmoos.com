// B"H
/** @file noPixelatedTextureAudit.js @description ESM static anti-pixelation regression audit. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name), rel = path.relative(root, p), st = fs.statSync(p);
    if (/node_modules|\.git|AI_THOUGHTS|tests\/performance/.test(rel)) continue;
    if (st.isDirectory()) walk(p, out); else if (st.isFile() && /\.(js|html|css)$/.test(name)) out.push(p);
  }
  return out;
}
function assert(condition, message) { if (!condition) throw new Error(message); }
const offenders = [];
const files = walk(root);
const bad = new RegExp(["NearestFilter", "image-rendering\\s*:\\s*pixelated", "image-rendering\\s*:\\s*crisp", "image-rendering\\s*:\\s*optimizeSpeed"].join("|"), "i");
for (const file of files) if (bad.test(fs.readFileSync(file, "utf8"))) offenders.push(path.relative(root, file));
const visual = read("systems/visuals/VisualTuningBootstrap.js");
const enforcer = read("systems/visuals/TextureQualityEnforcer.js");
const uv = read("systems/visuals/UvDensityAudit.js");
assert(offenders.length === 0, `Pixelated texture regressions: ${offenders.join(", ")}`);
assert(visual.includes("enforceTextureQuality") && visual.includes("auditUvDensity"), "Visual bootstrap must run texture quality and UV audit");
assert(enforcer.includes("MirroredRepeatWrapping") && enforcer.includes("LinearMipmapLinearFilter"), "Texture enforcer must force ping-pong mipmapped filtering");
assert(uv.includes("__AWTSMOOS_UV_DENSITY_AUDIT__"), "UV audit must expose runtime report");
console.log(JSON.stringify({ ok:true, test:"noPixelatedTextureAudit", scanned:files.length }, null, 2));
