// B"H
/**
 * @file publicImportGraphCheck.cjs
 * @description Chapter 90: public HTTPS import graph seer, now including
 * dynamic import(). The Awtsmoos follows both static and constructor-time
 * imports from OlamVessel so no child module can hide behind the parent error.
 */
const start = "https://awtsmoos.com/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamVessel.js";
const seen = new Set();
const bad = [];
const patterns = [
  /import(?:\s+[\s\S]*?from\s*)?["']([^"']+)["']/g,
  /import\(\s*["']([^"']+)["']\s*\)/g
];
const sameOrigin = new URL(start).origin;

function childUrl(parent, specifier) {
  const clean = specifier.split("?")[0];
  if (clean.startsWith("http")) return clean;
  if (clean.startsWith("/")) return sameOrigin + clean;
  if (!clean.startsWith(".")) return null;
  return new URL(clean, parent).href;
}

async function scan(url, depth = 0) {
  if (seen.has(url) || depth > 12) return;
  seen.add(url);
  let res;
  try { res = await fetch(url, { cache: "no-store" }); }
  catch (error) {
    bad.push({ url, kind: "fetch-error", message: error.message });
    return;
  }
  const type = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!res.ok || !type.includes("javascript")) {
    bad.push({ url, kind: "bad-response", status: res.status, type, sample: text.slice(0, 180) });
    return;
  }
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text))) {
      const next = childUrl(url, match[1]);
      if (next && next.startsWith(sameOrigin)) await scan(next, depth + 1);
    }
  }
}

scan(start).then(() => {
  console.log(JSON.stringify({ start, seenCount: seen.size, bad }, null, 2));
  process.exit(bad.length ? 2 : 0);
}).catch(error => {
  console.error(error);
  process.exit(3);
});
