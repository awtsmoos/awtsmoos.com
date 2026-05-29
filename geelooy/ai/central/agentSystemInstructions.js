// B"H
let cachedInstructions = null;

const AGENT_FILES = Object.freeze(["./agents.nd", "./agents.md"]);

/**
 * B"H
 * Chapter 233: The Scroll Entered The Mouth Of Every Foreign River.
 *
 * MiniMax, Groq, OpenRouter, and every future custom AI must receive the local
 * agent covenant before user words. The Awtsmoos hides the scroll in a cache so
 * each provider request begins with the same root voice without re-fetching the
 * parchment again and again.
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
    const text = await tryFetchText(file);
    if (text.trim()) return text;
  }
  return "";
}

async function tryFetchText(path) {
  try {
    const url = new URL(path, import.meta.url);
    const res = await fetch(url.href, { cache: "no-cache" });
    return res.ok ? await res.text() : "";
  } catch (_error) {
    return "";
  }
}
