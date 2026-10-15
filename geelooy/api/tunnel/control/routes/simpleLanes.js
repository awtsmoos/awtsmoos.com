// B"H — Simple tunnel lanes file server (Yaakov 2026-10-15)
// Serves simple tunnel agent files for the installer.
// Route: /api/tunnel/lanes/simple/:filename

const fs = require("node:fs");
const path = require("node:path");

const LANES_DIR = path.join(__dirname, "..", "..", "lanes", "simple");
const ALLOWED_FILES = new Set([
  "agent-poll.js",
  "agent-approval.js",
  "agent-websocket.js",
  "agent-file.js",
  "agent-resilient.js",
  "install-lane.js",
  "verify-lanes.js",
  "README.md"
]);

async function serveLaneFile($i, vars = {}) {
  const filename = String(vars.filename || "").slice(0, 100);
  // B"H — Security: only allow specific files, no path traversal
  if (!ALLOWED_FILES.has(filename)) {
    return { statusCode: 404, response: JSON.stringify({ ok: false, error: "not_found" }) };
  }
  try {
    const filePath = path.join(LANES_DIR, filename);
    // B"H — Ensure the resolved path is within LANES_DIR
    if (!filePath.startsWith(LANES_DIR)) {
      return { statusCode: 403, response: JSON.stringify({ ok: false, error: "forbidden" }) };
    }
    const content = fs.readFileSync(filePath, "utf8");
    const isJs = filename.endsWith(".js");
    return {
      statusCode: 200,
      response: content,
      headers: {
        "Content-Type": isJs ? "application/javascript; charset=utf-8" : "text/plain; charset=utf-8",
        "Cache-Control": "no-store"
      }
    };
  } catch (e) {
    return { statusCode: 404, response: JSON.stringify({ ok: false, error: "not_found" }) };
  }
}

module.exports = { serveLaneFile };
