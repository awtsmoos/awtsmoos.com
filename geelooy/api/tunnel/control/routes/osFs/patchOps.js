// B"H
const { cleanPath } = require("./path.js");
const { readWhole } = require("./listRead.js");
const { writeFile, sha256 } = require("./writeOps.js");

function clampRange(payload, length) {
  const start = Math.max(0, Number(payload.start ?? payload.startIndex ?? 0));
  const end = Math.max(start, Number(payload.end ?? payload.endIndex ?? start));
  if (end > length) throw Object.assign(new Error("range_out_of_bounds"), { status: 400 });
  return { start, end };
}

function assertHash(payload, currentSha, action) {
  if (payload.requireHash === false) return null;
  if (!payload.expectedSha256) {
    return {
      ok: false,
      action,
      error: "expected_sha256_required",
      sha256: currentSha
    };
  }
  if (payload.expectedSha256 !== currentSha) {
    return {
      ok: false,
      action,
      error: "sha256_mismatch",
      sha256: currentSha,
      expectedSha256: payload.expectedSha256
    };
  }
  return null;
}

/**
 * B"H
 * Replaces one character range in the hosted Awtsmoos OS with hash guards.
 * This is for AI surgery: read, measure, cut, verify, never rewrite blindly.
 */
async function replaceRange($i, userId, payload) {
  const path = payload.path || payload.p || ".";
  const got = await readWhole($i, userId, path);
  const currentSha = sha256(got.content);

  const hashError = assertHash(payload, currentSha, "replaceRange");
  if (hashError) return hashError;

  const range = clampRange(payload, got.content.length);
  const next = got.content.slice(0, range.start) + String(payload.replacement ?? payload.content ?? "") + got.content.slice(range.end);
  const wrote = await writeFile($i, userId, { ...payload, path, content: next, action: "replaceRange" });

  return {
    ...wrote,
    action: "replaceRange",
    path: cleanPath(path),
    previousSha256: currentSha,
    sha256: sha256(next),
    range
  };
}

async function applyPatch($i, userId, payload) {
  const path = payload.path || payload.p || ".";
  const got = await readWhole($i, userId, path);
  const currentSha = sha256(got.content);

  const hashError = assertHash(payload, currentSha, "applyPatch");
  if (hashError) return hashError;

  const patches = Array.isArray(payload.patches) ? payload.patches : [];
  let text = got.content;

  for (const p of patches.slice().sort((a, b) => Number(b.start) - Number(a.start))) {
    const r = clampRange(p, text.length);
    text = text.slice(0, r.start) + String(p.replacement ?? "") + text.slice(r.end);
  }

  return await writeFile($i, userId, { ...payload, path, content: text, action: "applyPatch" });
}

module.exports = { replaceRange, applyPatch };
