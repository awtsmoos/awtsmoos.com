// B"H
const path = require("path");
const { ROOT } = require("../../../lib/config.js");

/** B"H: durable ChatGPT vessels live outside the project tree. */
function chatgptRoot() { return path.join(ROOT, "chatgpt"); }
function profileDir(name = "default") { return path.join(chatgptRoot(), "profiles", safeName(name)); }
function registryPath() { return path.join(chatgptRoot(), "conversations.json"); }
function statePath() { return path.join(chatgptRoot(), "state.json"); }
function continuationPath() { return path.join(chatgptRoot(), "continuations.json"); }
function sessionsPath() { return path.join(chatgptRoot(), "sessions.json"); }
function sessionDir(sessionId) { return path.join(chatgptRoot(), "sessions", safeName(sessionId)); }
function sessionJournalPath(sessionId) { return path.join(sessionDir(sessionId), "journal.jsonl"); }
function sessionReceiptsPath(sessionId) { return path.join(sessionDir(sessionId), "receipts.jsonl"); }
function sessionMetricsPath(sessionId) { return path.join(sessionDir(sessionId), "metrics.jsonl"); }
function safeName(value) { return String(value || "default").replace(/[^A-Za-z0-9_.-]+/g, "-"); }

module.exports = { chatgptRoot, profileDir, registryPath, statePath, continuationPath, sessionsPath, sessionDir, sessionJournalPath, sessionReceiptsPath, sessionMetricsPath, safeName };
