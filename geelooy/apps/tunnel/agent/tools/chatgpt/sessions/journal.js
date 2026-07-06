// B"H
const fs = require("fs/promises");
const path = require("path");
const { sessionJournalPath } = require("../storage/paths.js");

async function appendSessionEvent(sessionId, event = {}) {
  const file = sessionJournalPath(sessionId);
  await fs.mkdir(path.dirname(file), { recursive: true });
  const row = { at: new Date().toISOString(), sessionId, ...event };
  await fs.appendFile(file, JSON.stringify(row) + "\n", "utf8");
  return row;
}

module.exports = { appendSessionEvent };
