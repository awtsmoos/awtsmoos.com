// B"H
/**
 * @file test-virtual-users.cjs
 * @description
 * Chapter 8: Every seeded account proves it can touch the hosted machine.
 */

const { listVirtualPath, readVirtualFile, writeVirtualFile } = require("./api-client.cjs");
const { GAME } = require("./config.cjs");

async function main() {
  const raw = process.env.AWTSMOOS_GAME_KEYS_JSON || "";
  if (!raw) throw new Error("Pass AWTSMOOS_GAME_KEYS_JSON from seed-users.cjs raw key file.");
  const users = JSON.parse(raw);
  const results = [];

  for (const user of users) {
    const base = `${user.aliasId}/projects/${GAME.runId}/tests`;
    const marker = `B'H test write for ${user.role}`;
    const content = `${marker} at ${new Date().toISOString()}`;
    const wrote = await writeVirtualFile(user.apiKey, `${base}/proof.txt`, content);
    const read = await readVirtualFile(user.apiKey, `${base}/proof.txt`);
    const listed = await listVirtualPath(user.apiKey, user.aliasId);
    results.push({
      role: user.role,
      aliasId: user.aliasId,
      wrote: wrote.ok,
      readBack: String(read.content || "").includes(marker),
      listedRoot: listed.ok
    });
  }

  console.log(JSON.stringify({ ok: results.every(r => r.wrote && r.readBack && r.listedRoot), results }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
