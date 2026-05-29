// B"H
let cachedInstructions = null;

const AGENT_FILES = Object.freeze(["./agents.nd", "./agents.md"]);

/**
 * B"H
 * Chapter 239: The Scroll Could Be Read In Browser Or Node.
 *
 * In the browser the scroll arrives by fetch. In Node tests, file URLs cannot be
 * fetched by default, so the reader opens the same URL through fs. The Awtsmoos
 * lets one instruction stream enter every custom provider from either world.
 *
 * @returns {Promise<string>} System instructions from agents.nd or agents.md.
 */
export async function loadAgentSystemInstructions() {
  if (cachedInstructions !== null) return cachedInstructions;
  cachedInstructions = await firstReadableAgentFile();
  return cachedInstructions;
}

/**
 * Prepends the local agent scroll as the first system message.
 *
 * @param {object[]} messages Provider chat messages.
 * @returns {Promise<object[]>} Messages with system instructions injected.
 */
export async function withAgentSystemInstructions(messages = []) {
  const instructions = await loadAgentSystemInstructions();
  if (!instructions.trim()) return messages;
  const rest = messages.filter(msg => msg?.role !== "system");
  const existing = messages.filter(msg => msg?.role === "system").map(msg => msg.content).filter(Boolean).join("\n\n");
  const content = [instructions.trim(), existing.trim()].filter(Boolean).join("\n\n--- Existing system instructions ---\n\n");
  return [{ role: "system", content }, ...rest];
}

async function firstReadableAgentFile() {
  for (const file of AGENT_FILES) {
    const text = await tryReadText(file);
    if (text.trim()) return text;
  }
  return "";
}

async function tryReadText(path) {
  const url = new URL(path, import.meta.url);
  return await tryFetchText(url) || await tryNodeReadText(url) || "";
}

async function tryFetchText(url) {
  try {
    const res = await fetch(url.href, { cache: "no-cache" });
    return res.ok ? await res.text() : "";
  } catch (_error) {
    return "";
  }
}

async function tryNodeReadText(url) {
  try {
    const fs = await import("node:fs/promises");
    return await fs.readFile(url, "utf8");
  } catch (_error) {
    return "";
  }
}
