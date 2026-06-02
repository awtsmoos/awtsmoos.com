// B"H
/**
 * @file config.cjs
 * @description
 * Chapter 1: The names of the vessels before the agents descend.
 *
 * The Awtsmoos births every test user as a small kingdom in the hosted Virtual
 * OS. These are test identities for API-key/Virtual-OS work, not full browser
 * OAuth login accounts. The scripts seed API-key records and alias ownership,
 * then speak only through the public tunnel-control HTTP API.
 */

const DEFAULT_BASE_URL = process.env.AWTSMOOS_BASE_URL || "http://127.0.0.1:8080";
const PUBLIC_BASE_URL = process.env.AWTSMOOS_PUBLIC_BASE_URL || "https://awtsmoos.com";
const RUN_ID = process.env.AWTSMOOS_GAME_RUN_ID || `crystal-${Date.now()}`;

const USERS = Object.freeze([
  { userId: "minimax_game_orchestrator", aliasId: "minimaxGameOrchestrator", role: "orchestrator" },
  { userId: "minimax_game_engine", aliasId: "minimaxGameEngine", role: "engine" },
  { userId: "minimax_game_renderer", aliasId: "minimaxGameRenderer", role: "renderer" },
  { userId: "minimax_game_levels", aliasId: "minimaxGameLevels", role: "levels" },
  { userId: "minimax_game_polish", aliasId: "minimaxGamePolish", role: "polish" }
]);

const GAME = Object.freeze({
  title: "Crystal Critters",
  slug: "crystal-critters",
  runId: RUN_ID,
  publicRoot: `geelooy/public/virtual-os-games/${RUN_ID}`,
  virtualRoot: `${USERS[0].aliasId}/projects/${RUN_ID}`
});

module.exports = { DEFAULT_BASE_URL, GAME, PUBLIC_BASE_URL, USERS };
