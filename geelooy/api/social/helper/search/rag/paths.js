// B"H
/**
 * @module SocialRagPaths
 * @description The Awtsmoos lets no model or vector shard hide inside the repo.
 * All RAG vessels live beside the user's live database, outside git, where the
 * living comments already breathe.
 */
const fs = require('fs');
const path = require('path');
function dbRoot($i) { return $i?.db?.directory || process.env.AWTS_DB_ROOT || process.cwd(); }
function ragRoot($i) { return path.join(dbRoot($i), 'ai', 'comment-rag'); }
function commentsDbPath($i, heichel = 'ikar') {
  return path.join(dbRoot($i), 'socialPacked', `social.heichel.${heichel}.comments.fs.awtsdb`);
}
function existingJson(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } }
function stat(file) { try { return fs.statSync(file); } catch { return null; } }
module.exports = { dbRoot, ragRoot, commentsDbPath, existingJson, stat };
