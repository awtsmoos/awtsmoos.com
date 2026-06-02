// B"H
/**
 * @file seed-users.cjs
 * @description
 * Chapter 2: Test users receive names, aliases, and API keys.
 *
 * This creates Virtual OS test identities by seeding the tunnel-control API key
 * store and the same DosDB root used by the running server. It does not create
 * full OAuth browser accounts. Raw API keys are written only to `.awtsmoos/runtime`.
 */

const fs = require("fs");
const path = require("path");
const DosDB = require("../../../../ayzarim/DosDB/index.js");
const { createApiKeyRecord } = require("../../../api/tunnel/control/core/apiKeyStore.js");
const { GAME, USERS } = require("./config.cjs");

function repoRoot() {
  return path.resolve(__dirname, "../../../../");
}

function serverDbRoot() {
  return path.resolve(repoRoot(), "../../dayuhChadash");
}

function keyFilePath() {
  return path.join(repoRoot(), ".awtsmoos", "runtime", "minimax-game-keys.json");
}

async function seedAlias(db, user) {
  await db.write(`/users/${user.userId}/aliases/${user.aliasId}`, {
    aliasId: user.aliasId,
    name: `${user.role} virtual game account`,
    description: `B'H seeded Virtual OS account for ${GAME.title}`
  });

  await db.write(`/social/aliases/${user.aliasId}/info`, {
    name: `${user.role} virtual game account`,
    user: user.userId
  });

  await db.write(`/social/aliases/${user.aliasId}/fileSystem/projects/${GAME.runId}/README.md`,
    `B'H\n# ${GAME.title}\n\nSeeded for ${user.role}.\n`);
}

function makeKey(user) {
  return createApiKeyRecord({
    userId: user.userId,
    name: `${GAME.title} ${user.role}`,
    scopes: ["tunnel.read", "tunnel.write", "awtsmoos.os"],
    rateLimitPerMinute: 120,
    bytesPerDay: 50000000
  });
}

async function main() {
  process.env.__awtsdir = repoRoot();
  const db = new DosDB(serverDbRoot());
  await db.init();

  const made = [];
  for (const user of USERS) {
    await seedAlias(db, user);
    const key = makeKey(user);
    made.push({ ...user, apiKey: key.rawKey, key: key.key });
  }

  const filePath = keyFilePath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(made.map(({ key, ...raw }) => raw), null, 2), "utf8");

  const safe = made.map(({ apiKey, ...rest }) => ({ ...rest, apiKeyPreview: apiKey.slice(0, 8) + "..." }));
  console.log(JSON.stringify({ ok: true, game: GAME, users: safe, rawKeyFile: filePath, dbRoot: serverDbRoot(), secretsPrinted: false }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
