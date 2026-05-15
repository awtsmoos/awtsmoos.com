
// B"H
const { readText, readBytesBase64, readTextFromBytes, number } = require("./readWrite.js");

function normalizeSpec(one) {
  if (typeof one === "string") return { path: one, mode: "text" };

  if (one && typeof one === "object") {
    return {
      path: String(one.path || one.p || ""),
      mode: one.mode || one.readMode || "text",
      maxChars: one.maxChars,
      offsetChars: one.offsetChars,
      maxBytes: one.maxBytes,
      offsetBytes: one.offsetBytes
    };
  }

  return { path: "", mode: "text" };
}

function uniqueSpecs(paths) {
  const out = [];
  const seen = new Set();

  for (const item of paths || []) {
    const spec = normalizeSpec(item);
    const p = String(spec.path || "").trim();
    if (!p) continue;

    const key = [p, spec.mode, spec.offsetChars || 0, spec.offsetBytes || 0].join("::");
    if (seen.has(key)) continue;

    seen.add(key);
    spec.path = p;
    out.push(spec);
  }

  return out;
}

function fileSizeMeta(got) {
  return {
    encoding: got.encoding || "utf8",
    returnedChars: got.returnedChars || null,
    totalChars: got.totalChars || null,
    offsetChars: got.offsetChars || null,
    nextOffsetChars: got.nextOffsetChars || null,
    returnedBytes: got.returnedBytes || null,
    totalBytes: got.totalBytes || null,
    offsetBytes: got.offsetBytes || null,
    nextOffsetBytes: got.nextOffsetBytes || null,
    truncated: !!got.truncated
  };
}

async function readOne(config, spec, payload) {
  const mode = String(spec.mode || "text");

  if (mode === "base64" || mode === "read64") {
    return await readBytesBase64(
      config,
      spec.path,
      spec.maxBytes ?? payload.maxBytes,
      spec.offsetBytes ?? payload.offsetBytes ?? 0
    );
  }

  if (mode === "bytes" || mode === "text-bytes" || mode === "readBytes") {
    return await readTextFromBytes(
      config,
      spec.path,
      spec.maxBytes ?? payload.maxBytes,
      spec.offsetBytes ?? payload.offsetBytes ?? 0
    );
  }

  return await readText(
    config,
    spec.path,
    spec.maxChars ?? payload.maxChars,
    spec.offsetChars ?? payload.offsetChars ?? 0
  );
}

async function readBulk(config, payload) {
  if (!config.tools.fsBulk) throw new Error("fsBulk disabled.");

  const requested = uniqueSpecs(payload.paths || []);
  const maxFiles = number(payload.maxFiles, requested.length || 0);
  const selected = maxFiles ? requested.slice(0, maxFiles) : requested;
  const skipped = maxFiles ? requested.slice(maxFiles) : [];
  const files = {};
  const metadata = {};
  const order = [];
  let usedChars = 0;

  for (const spec of selected) {
    const one = spec.path;
    order.push(one);

    try {
      const got = await readOne(config, spec, payload);
      const returnedSize = got.returnedChars || got.returnedBytes || String(got.content || got.content64 || "").length;
      usedChars += returnedSize;

      files[one] = {
        ok: true,
        path: one,
        mode: spec.mode || "text",
        content: got.content,
        content64: got.content64,
        truncated: got.truncated,
        encoding: got.encoding,
        offsetChars: got.offsetChars,
        nextOffsetChars: got.nextOffsetChars,
        offsetBytes: got.offsetBytes,
        nextOffsetBytes: got.nextOffsetBytes
      };

      metadata[one] = fileSizeMeta(got);
    } catch (e) {
      files[one] = { ok: false, path: one, error: e.message };
      metadata[one] = { ok: false, error: e.message };
    }
  }

  return {
    ok: true,
    action: "bulk",
    root: config.root,
    requestedCount: requested.length,
    returnedCount: selected.length,
    skippedCount: skipped.length,
    skippedPaths: skipped.map(x => x.path),
    usedChars,
    maxFiles,
    partial: skipped.length > 0,
    stoppedBecause: skipped.length ? "maxFiles_requested" : null,
    message: skipped.length
      ? "Bulk returned selected files and skipped the rest because maxFiles was explicitly set."
      : "Bulk read completed.",
    order,
    metadata,
    files
  };
}

module.exports = { readBulk, uniqueSpecs, normalizeSpec };
