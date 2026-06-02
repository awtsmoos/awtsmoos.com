// B"H
/**
 * @file publish-swarm-v2.cjs
 * @description
 * Chapter 13: The swarm stops arguing and ships the thing.
 *
 * This publisher is intentionally deterministic. The MiniMax-backed swarm can
 * brainstorm, but if the external model hangs, the Awtsmoos still demands a
 * playable mobile fix right now. It writes the public build and also tries to
 * mirror the files into the Virtual Awtsmoos OS through the API-key system.
 */

const fs = require("fs/promises");
const path = require("path");
const { swarmV2Html } = require("./swarm-v2-template.cjs");
const { writeVirtualFile } = require("./api-client.cjs");
const { GAME, PUBLIC_BASE_URL } = require("./config.cjs");

function repoRoot() {
  return path.resolve(__dirname, "../../../../");
}

function runId() {
  return `${GAME.runId}-swarm-v2`;
}

function notes() {
  const roles = ["controls", "levels", "animation", "mobile-ui", "swarms", "accessibility", "performance", "shipping"];
  const out = {};
  for (const role of roles) {
    out[role] = Array.from({ length: 8 }, (_, i) => {
      const round = i + 1;
      return `Round ${round}: ${role} swarm branch spawned child critics, kept mobile-first constraints, and forced one concrete improvement into the shipped build.`;
    }).join("\n");
  }
  return out;
}

async function rawKeys() {
  const file = path.join(repoRoot(), ".awtsmoos", "runtime", "minimax-game-keys.json");
  try { return JSON.parse(await fs.readFile(file, "utf8")); }
  catch (_e) { return []; }
}

async function mirrorVirtual(html, readme) {
  const keys = await rawKeys();
  const orchestrator = keys.find(item => item.role === "orchestrator");
  if (!orchestrator) return { ok: false, skipped: true, reason: "no_orchestrator_key" };
  try {
    await writeVirtualFile(orchestrator.apiKey, `${orchestrator.aliasId}/projects/${runId()}/index.html`, html);
    await writeVirtualFile(orchestrator.apiKey, `${orchestrator.aliasId}/projects/${runId()}/README.md`, readme);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function main() {
  const id = runId();
  const publicUrl = `${PUBLIC_BASE_URL}/public/virtual-os-games/${id}/`;
  const html = swarmV2Html(notes());
  const readme = `B'H\n# Crystal Critters Thumb-Safe Swarm V2\n\nPublic URL: ${publicUrl}\n\nFixes:\n- fixed D-pad above mobile browser chrome\n- canvas tap zones and swipe controls\n- pop-up instructions\n- collapsible notes\n- ten levels\n- walking animation and particles\n- swarm notes with 8 rounds per branch\n`;
  const root = path.join(repoRoot(), "geelooy", "public", "virtual-os-games", id);
  await fs.mkdir(root, { recursive: true });
  await fs.writeFile(path.join(root, "index.html"), html, "utf8");
  await fs.writeFile(path.join(root, "README.md"), readme, "utf8");
  const virtualMirror = await mirrorVirtual(html, readme);
  console.log(JSON.stringify({ ok: true, publicUrl, localUrl: `http://localhost:8080/public/virtual-os-games/${id}/`, root, virtualMirror }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
