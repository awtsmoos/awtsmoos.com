// B"H
/**
 * @file worker.cjs
 * @description
 * Chapter 6: One subprocess, one shard, one spark in the cave.
 */

const { askMiniMax } = require("./minimax-client.cjs");
const { writeVirtualFile } = require("./api-client.cjs");
const { GAME, USERS } = require("./config.cjs");

function promptFor(role) {
  return `B'H. Design only the ${role} slice for a tiny browser game named ${GAME.title}. Be brutal, concise, and practical. Return implementation notes, no markdown fence.`;
}

async function main() {
  const role = process.argv[2];
  const apiKey = process.env.AWTSMOOS_WORKER_API_KEY || "";
  const user = USERS.find(item => item.role === role);
  if (!role || !user || !apiKey) throw new Error("worker requires role and AWTSMOOS_WORKER_API_KEY");

  const got = await askMiniMax(role, promptFor(role));
  const virtualPath = `${user.aliasId}/projects/${GAME.runId}/agents/${role}.txt`;
  await writeVirtualFile(apiKey, virtualPath, got.text);

  const packet = { ok: true, role, virtualPath, usedMiniMax: got.usedMiniMax, error: got.error || null, text: got.text };
  if (process.send) process.send(packet);
  else console.log(JSON.stringify(packet, null, 2));
}

main().catch(error => {
  const packet = { ok: false, error: error.message, stack: error.stack };
  if (process.send) process.send(packet);
  else console.error(JSON.stringify(packet, null, 2));
  process.exit(1);
});
