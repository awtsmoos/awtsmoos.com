// B"H
/**
 * @file run-agents.cjs
 * @description
 * Chapter 7: The orchestrator splits the labor and gathers the shards.
 */

const fs = require("fs/promises");
const path = require("path");
const { fork } = require("child_process");
const { gameHtml } = require("./game-template.cjs");
const { writeVirtualFile } = require("./api-client.cjs");
const { GAME, PUBLIC_BASE_URL, USERS } = require("./config.cjs");

const ROLES = ["engine", "renderer", "levels", "polish"];

function runWorker(role, apiKey) {
  return new Promise(resolve => {
    const child = fork(path.join(__dirname, "worker.cjs"), [role], {
      env: {
        ...process.env,
        AWTSMOOS_GAME_RUN_ID: GAME.runId,
        AWTSMOOS_WORKER_API_KEY: apiKey
      },
      stdio: ["ignore", "pipe", "pipe", "ipc"]
    });
    let settled = false;
    child.on("message", packet => { settled = true; resolve(packet); });
    child.on("exit", code => {
      if (!settled) resolve({ ok: false, role, error: `worker exited ${code}` });
    });
  });
}

function apiKeyMap(rawKeys) {
  const out = new Map();
  for (const item of rawKeys) out.set(item.role, item.apiKey);
  return out;
}

function buildReadme(results, publicUrl) {
  return `B'H\n# ${GAME.title}\n\nPublic URL: ${publicUrl}\n\n## Agent Results\n${results.map(r => `- ${r.role}: ${r.ok ? "ok" : "failed"}${r.usedMiniMax ? " via MiniMax" : " via deterministic fallback"}`).join("\n")}\n`;
}

async function publishPublic(html, readme) {
  const root = path.resolve(__dirname, "../../../../", GAME.publicRoot);
  await fs.mkdir(root, { recursive: true });
  await fs.writeFile(path.join(root, "index.html"), html, "utf8");
  await fs.writeFile(path.join(root, "README.md"), readme, "utf8");
  return root;
}

async function main() {
  const raw = process.env.AWTSMOOS_GAME_KEYS_JSON || "";
  if (!raw) throw new Error("Run seed-users.cjs first and pass AWTSMOOS_GAME_KEYS_JSON.");
  const keys = apiKeyMap(JSON.parse(raw));

  const results = await Promise.all(ROLES.map(role => runWorker(role, keys.get(role))));
  const notes = Object.fromEntries(results.map(result => [result.role || "unknown", result.text || result.error || "No output"]));
  const html = gameHtml(notes);
  const publicUrl = `${PUBLIC_BASE_URL}/public/virtual-os-games/${GAME.runId}/`;
  const readme = buildReadme(results, publicUrl);

  await publishPublic(html, readme);
  await writeVirtualFile(keys.get("orchestrator"), `${USERS[0].aliasId}/projects/${GAME.runId}/index.html`, html);
  await writeVirtualFile(keys.get("orchestrator"), `${USERS[0].aliasId}/projects/${GAME.runId}/README.md`, readme);

  console.log(JSON.stringify({ ok: results.every(r => r.ok), game: GAME, publicUrl, results: results.map(({ text, ...r }) => r) }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
