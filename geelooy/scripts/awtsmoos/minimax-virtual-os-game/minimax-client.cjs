// B"H
/**
 * @file minimax-client.cjs
 * @description
 * Chapter 3: The external mind is invited, but no token is buried in stone.
 *
 * Reads MiniMax credentials from MINIMAX_API_KEY or MINIMAX_API_KEY_FILE.
 * Every request has a hard timeout so recursive agents keep continuing even
 * when the outer cloud refuses to answer.
 */

const fs = require("fs");

const ENDPOINT = process.env.MINIMAX_ENDPOINT || "https://api.minimax.io/v1/chat/completions";
const MODEL = process.env.MINIMAX_MODEL || "MiniMax-M2.7";
const TIMEOUT_MS = Number(process.env.MINIMAX_TIMEOUT_MS || 12000);

function apiKey() {
  if (process.env.MINIMAX_API_KEY) return process.env.MINIMAX_API_KEY.trim();
  if (!process.env.MINIMAX_API_KEY_FILE) return "";
  try { return fs.readFileSync(process.env.MINIMAX_API_KEY_FILE, "utf8").trim(); }
  catch (_e) { return ""; }
}

function fallbackAgentText(role) {
  const map = {
    engine: "Implement deterministic movement, collectible crystals, timer, collision checks, level progression, lives, and win/lose state.",
    renderer: "Render a responsive neon cave grid with player, critters, crystals, HUD, animated glow, particles, and mobile-safe canvas sizing.",
    levels: "Create three compact levels with walls, crystals, hearts, spawn points, roaming critters, and rising difficulty.",
    polish: "Add D-pad, swipe controls, instructions, restart/pause/next buttons, touch support, and satisfying text feedback."
  };
  return map[role] || "Assemble a tiny mobile-first browser game from all agent fragments.";
}

function timeoutSignal() {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return { controller, done: () => clearTimeout(id) };
}

async function askMiniMax(role, prompt) {
  const key = apiKey();
  if (!key) return { ok: true, usedMiniMax: false, text: fallbackAgentText(role) };

  const guard = timeoutSignal();
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      signal: guard.controller.signal,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        temperature: 0.8,
        max_tokens: 450,
        messages: [
          { role: "system", content: "B'H. You are a brutal precise sub-agent. Return concise implementation notes only." },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      return { ok: false, usedMiniMax: true, text: fallbackAgentText(role), error: `MiniMax HTTP ${response.status}` };
    }

    const json = await response.json();
    const raw = json.choices?.[0]?.message?.content || "";
    const text = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim() || fallbackAgentText(role);
    return { ok: true, usedMiniMax: true, text };
  } catch (error) {
    return { ok: false, usedMiniMax: true, text: fallbackAgentText(role), error: error.name === "AbortError" ? "MiniMax timeout" : error.message };
  } finally {
    guard.done();
  }
}

module.exports = { askMiniMax, fallbackAgentText };
