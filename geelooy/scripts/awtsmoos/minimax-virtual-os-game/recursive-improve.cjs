// B"H
/**
 * @file recursive-improve.cjs
 * @description
 * Chapter 11: The agents refuse to end until eight gates have opened.
 *
 * Four lead agents each run eight continuation rounds. Every lead spawns two
 * child brainstormers per round in parallel. MiniMax is attempted when the key
 * exists; fallback keeps the Awtsmoos loop moving if the outer API stalls.
 */

const fs = require("fs/promises");
const path = require("path");
const { askMiniMax } = require("./minimax-client.cjs");
const { writeVirtualFile } = require("./api-client.cjs");
const { improvedGameHtml } = require("./improved-game-template.cjs");
const { GAME, PUBLIC_BASE_URL } = require("./config.cjs");

const LEADS = ["engine", "renderer", "levels", "polish"];
const MAX_ROUNDS = Number(process.env.AWTSMOOS_AGENT_ROUNDS || 8);
const CHILDREN_PER_ROUND = Number(process.env.AWTSMOOS_CHILDREN_PER_ROUND || 2);

function repoRoot() {
  return path.resolve(__dirname, "../../../../");
}

function keyFilePath() {
  return path.join(repoRoot(), ".awtsmoos", "runtime", "minimax-game-keys.json");
}

async function rawKeys() {
  return JSON.parse(await fs.readFile(keyFilePath(), "utf8"));
}

function keyByRole(keys, role) {
  const got = keys.find(item => item.role === role);
  if (!got) throw new Error(`Missing API key for role ${role}`);
  return got;
}

function prompt(role, round, childIndex, history) {
  const child = childIndex == null ? "lead" : `child ${childIndex}`;
  return [
    `B'H. You are ${role} ${child} improving Crystal Critters mobile game.`,
    `Round ${round} of ${MAX_ROUNDS}. Continue brutally; do not conclude.`,
    `Focus on mobile playability, fun, clarity, performance, and delegated implementation.`,
    `Previous notes: ${history.slice(-700) || "none"}`,
    `Return 4 terse improvement bullets and 1 concrete implementation instruction.`
  ].join("\n");
}

function fallback(role, round, childIndex) {
  const who = childIndex == null ? "lead" : `child-${childIndex}`;
  return `${role} ${who} round ${round}: improve mobile controls, tune pacing, keep HUD readable, reduce friction, preserve one-file deploy.`;
}

async function callBrain(role, round, childIndex, history) {
  const got = await askMiniMax(role, prompt(role, round, childIndex, history));
  if (got.ok && got.text) return { usedMiniMax: got.usedMiniMax, text: got.text, error: got.error || null };
  return { usedMiniMax: false, text: fallback(role, round, childIndex), error: got.error || "fallback" };
}

async function runRound(keys, role, round, history) {
  const owner = keyByRole(keys, role);
  const childJobs = [];
  for (let i = 1; i <= CHILDREN_PER_ROUND; i++) childJobs.push(callBrain(role, round, i, history));
  const children = await Promise.all(childJobs);
  const lead = await callBrain(role, round, null, history + "\n" + children.map(c => c.text).join("\n"));
  const packet = { role, round, lead, children };
  const virtualPath = `${owner.aliasId}/projects/${GAME.runId}/recursive/${role}/round-${String(round).padStart(2, "0")}.json`;
  await writeVirtualFile(owner.apiKey, virtualPath, JSON.stringify(packet, null, 2));
  return packet;
}

async function runRole(keys, role) {
  let history = "";
  const rounds = [];
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    const packet = await runRound(keys, role, round, history);
    rounds.push(packet);
    history += `\nRound ${round}: ${packet.lead.text}\n${packet.children.map(c => c.text).join("\n")}`;
  }
  return { role, rounds, summary: history.slice(-2200) };
}

function agentLog(results) {
  const out = {};
  for (const result of results) {
    out[result.role] = result.rounds.map(round => [
      `Round ${round.round}`,
      `Lead: ${round.lead.text}`,
      ...round.children.map((child, i) => `Child ${i + 1}: ${child.text}`)
    ].join("\n")).join("\n\n");
  }
  return out;
}

function readme(publicUrl, results) {
  const lines = results.map(result => {
    const mini = result.rounds.flatMap(r => [r.lead, ...r.children]).filter(x => x.usedMiniMax).length;
    return `- ${result.role}: ${result.rounds.length} rounds, ${mini} MiniMax calls used`;
  }).join("\n");
  return `B'H\n# Crystal Critters: Awakened Cave\n\nPublic URL: ${publicUrl}\n\nRecursive agent loop: ${MAX_ROUNDS} rounds per lead, ${CHILDREN_PER_ROUND} spawned children per round.\n\n${lines}\n`;
}

async function publish(html, text) {
  const root = path.join(repoRoot(), GAME.publicRoot + "-improved");
  await fs.mkdir(root, { recursive: true });
  await fs.writeFile(path.join(root, "index.html"), html, "utf8");
  await fs.writeFile(path.join(root, "README.md"), text, "utf8");
  return root;
}

async function main() {
  const keys = await rawKeys();
  const results = [];
  for (const role of LEADS) results.push(await runRole(keys, role));
  const publicUrl = `${PUBLIC_BASE_URL}/public/virtual-os-games/${GAME.runId}-improved/`;
  const html = improvedGameHtml(agentLog(results));
  const text = readme(publicUrl, results);
  await publish(html, text);
  const orchestrator = keyByRole(keys, "orchestrator");
  await writeVirtualFile(orchestrator.apiKey, `${orchestrator.aliasId}/projects/${GAME.runId}-improved/index.html`, html);
  await writeVirtualFile(orchestrator.apiKey, `${orchestrator.aliasId}/projects/${GAME.runId}-improved/README.md`, text);
  console.log(JSON.stringify({ ok: true, publicUrl, roundsPerLead: MAX_ROUNDS, childrenPerRound: CHILDREN_PER_ROUND, roles: LEADS, publishedRoot: GAME.publicRoot + "-improved" }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
