//B"H
const DEFAULT_PORT = 38488;
const TARGET_ORIGIN = "https://chatgpt.com";
const DEFAULT_AGENT_START_URL = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
const DEFAULT_AUTH_ORIGINS = [
  "https://accounts.google.com",
  "https://ogs.google.com",
  "https://www.gstatic.com",
  "https://ssl.gstatic.com",
  "https://content.googleapis.com"
];

/**
 * Chapter 1: The Nerve Beneath The Door.
 *
 * ChatGPT remains the default mountain. Common Google auth origins are allowed
 * so login popups opened by the mirrored page can still travel through the
 * localhost proxy instead of escaping the vessel. Extra origins remain opt-in.
 */
function loadConfig() {
  const targetOrigin = process.env.AWTSMOOS_SPLIT_TARGET || TARGET_ORIGIN;
  const agentStartUrl = configuredAgentStartUrl();
  const extraOrigins = String(process.env.AWTSMOOS_SPLIT_ALLOWED_ORIGINS || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);
  const allowAuth = process.env.AWTSMOOS_SPLIT_ALLOW_AUTH_ORIGINS !== "0";
  return {
    port: Number(process.env.AWTSMOOS_SPLIT_BROWSER_PORT || DEFAULT_PORT),
    host: process.env.AWTSMOOS_SPLIT_BROWSER_HOST || "127.0.0.1",
    targetOrigin,
    agentStartUrl,
    allowedOrigins: [...new Set([targetOrigin, ...(allowAuth ? DEFAULT_AUTH_ORIGINS : []), ...extraOrigins])],
    verbose: process.env.AWTSMOOS_SPLIT_VERBOSE === "1"
  };
}

function normalizeAgentStartUrl(value = DEFAULT_AGENT_START_URL) {
  const parsed = new URL(String(value || DEFAULT_AGENT_START_URL));
  const path = parsed.pathname.replace(/\/+$/, "");
  const expected = new URL(DEFAULT_AGENT_START_URL);
  if (parsed.origin !== expected.origin || path !== expected.pathname) {
    throw new Error("Website missions must use the Awtsmoos Shliach custom GPT.");
  }
  parsed.pathname = path;
  parsed.search = "";
  parsed.hash = "";
  return parsed.href;
}

function configuredAgentStartUrl() {
  return normalizeAgentStartUrl(DEFAULT_AGENT_START_URL);
}

function requireConfiguredAgentStartUrl(value = configuredAgentStartUrl()) {
  const expected = configuredAgentStartUrl();
  const actual = normalizeAgentStartUrl(value);
  if (actual !== expected) {
    throw new Error("Website missions must use the configured ChatGPT custom GPT.");
  }
  return actual;
}

module.exports = {
  loadConfig,
  normalizeAgentStartUrl,
  configuredAgentStartUrl,
  requireConfiguredAgentStartUrl,
  DEFAULT_AGENT_START_URL,
  DEFAULT_AUTH_ORIGINS
};
