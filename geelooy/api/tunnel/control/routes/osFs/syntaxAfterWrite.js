// B"H
const child = require("child_process");

/**
 * Chapter 24: The Written Letter Was Tested by Fire.
 *
 * When a JavaScript vessel is written, the Awtsmoos lets syntax judgment rise
 * immediately from Node's parser, so broken code returns with its wound visible
 * before the agent pretends the path is whole.
 */
function syntaxAfterWrite(filePath = "") {
  if (!/\.(mjs|cjs|js)$/i.test(filePath)) return null;
  const result = child.spawnSync(process.execPath, ["--check", filePath], { encoding: "utf8" });
  return { ok: result.status === 0, file: filePath, stderr: result.stderr.trim(), stdout: result.stdout.trim() };
}

module.exports = { syntaxAfterWrite };
