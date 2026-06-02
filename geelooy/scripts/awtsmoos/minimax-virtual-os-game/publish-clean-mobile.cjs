// B"H
/**
 * @file publish-clean-mobile.cjs
 * @description
 * Publishes the cleaned mobile UI after the agent-command swarm has finished.
 */

const fs = require("fs/promises");
const path = require("path");
const { cleanMobileHtml } = require("./clean-mobile-template.cjs");
const { readAgent, repoRoot } = require("./agent-command/store.cjs");
const { GAME, PUBLIC_BASE_URL } = require("./config.cjs");
const { writeVirtualFile } = require("./api-client.cjs");

function runId() {
  return `${GAME.runId}-clean-mobile`;
}

function summarize(agent) {
  if (!agent) return "No agent summary found.";
  return agent.children.map(child => [
    `${child.task}: ${child.status} round ${child.round}`,
    ...child.notes.slice(-4)
  ].join("\n")).join("\n\n");
}

async function rawKeys() {
  const file = path.join(repoRoot(), ".awtsmoos", "runtime", "minimax-game-keys.json");
  try { return JSON.parse(await fs.readFile(file, "utf8")); }
  catch (_e) { return []; }
}

async function mirrorVirtual(html, readme) {
  const keys = await rawKeys();
  const orchestrator = keys.find(item => item.role === "orchestrator");
  if (!orchestrator) return { ok: false, skipped: true };
  await writeVirtualFile(orchestrator.apiKey, `${orchestrator.aliasId}/projects/${runId()}/index.html`, html);
  await writeVirtualFile(orchestrator.apiKey, `${orchestrator.aliasId}/projects/${runId()}/README.md`, readme);
  return { ok: true };
}

async function main() {
  const agentId = process.argv[2] || "gameAgent_1780374067939_oe41vx";
  const agent = readAgent(agentId);
  const id = runId();
  const localUrl = `http://localhost:8080/public/virtual-os-games/${id}/`;
  const publicUrl = `${PUBLIC_BASE_URL}/public/virtual-os-games/${id}/`;
  const summary = summarize(agent);
  const html = cleanMobileHtml(summary);
  const readme = `B'H\n# Crystal Critters Clean Mobile\n\nLocal: ${localUrl}\nPublic: ${publicUrl}\n\nAgent: ${agentId}\n\n${summary}\n`;
  const root = path.join(repoRoot(), "geelooy", "public", "virtual-os-games", id);
  await fs.mkdir(root, { recursive: true });
  await fs.writeFile(path.join(root, "index.html"), html, "utf8");
  await fs.writeFile(path.join(root, "README.md"), readme, "utf8");
  let virtualMirror;
  try { virtualMirror = await mirrorVirtual(html, readme); }
  catch (error) { virtualMirror = { ok: false, error: error.message }; }
  console.log(JSON.stringify({ ok: true, agentId, localUrl, publicUrl, root, virtualMirror }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
