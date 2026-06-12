// B"H
const path = require("path");
const { ROOT } = require("../../../lib/config.js");

/**
 * B"H
 * Chapter 394: ChatGPT received a private Chrome palace.
 * The tunnel remembers only paths and conversation references. Chrome itself
 * keeps its profile storage in its ordinary user-data-dir vessels.
 */
function chatgptRoot() { return path.join(ROOT, "chatgpt"); }
function profileDir(name = "default") { return path.join(chatgptRoot(), "profiles", safeName(name)); }
function registryPath() { return path.join(chatgptRoot(), "conversations.json"); }
function statePath() { return path.join(chatgptRoot(), "state.json"); }
function safeName(value) { return String(value || "default").replace(/[^A-Za-z0-9_.-]+/g, "-"); }

module.exports = { chatgptRoot, profileDir, registryPath, statePath, safeName };
