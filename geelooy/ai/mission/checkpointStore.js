// B"H
const fs = require("fs");
const path = require("path");
const { nowIso, clone } = require("./state");
const DEFAULT_DIR = "/Users/awtsmoos/ai_thoughts/mission_checkpoints";
function safeName(value) { return String(value).replace(/[^a-zA-Z0-9_.-]/g, "_"); }
function missionDir(id, dir = DEFAULT_DIR) { return path.join(dir, safeName(id)); }
function writeCheckpoint(mission, dir = DEFAULT_DIR) {
  const next = clone(mission); const folder = missionDir(next.id, dir); fs.mkdirSync(folder, { recursive: true });
  const file = path.join(folder, `checkpoint-${nowIso().replace(/[:.]/g, "-")}.json`);
  next.checkpoints.push({ path: file, createdAt: nowIso() }); next.updatedAt = nowIso();
  fs.writeFileSync(file, JSON.stringify(next, null, 2)); return next;
}
function readLatestCheckpoint(id, dir = DEFAULT_DIR) { const folder = missionDir(id, dir); if (!fs.existsSync(folder)) return null; const files = fs.readdirSync(folder).filter(f => f.startsWith("checkpoint-")).sort(); return files.length ? JSON.parse(fs.readFileSync(path.join(folder, files.at(-1)), "utf8")) : null; }
module.exports = { writeCheckpoint, readLatestCheckpoint, DEFAULT_DIR };
