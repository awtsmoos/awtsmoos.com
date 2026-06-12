//B"H
const DEFAULT_PORT = 38488;
const TARGET_ORIGIN = "https://chatgpt.com";
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
  const extraOrigins = String(process.env.AWTSMOOS_SPLIT_ALLOWED_ORIGINS || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);
  const allowAuth = process.env.AWTSMOOS_SPLIT_ALLOW_AUTH_ORIGINS !== "0";
  return {
    port: Number(process.env.AWTSMOOS_SPLIT_BROWSER_PORT || DEFAULT_PORT),
    host: process.env.AWTSMOOS_SPLIT_BROWSER_HOST || "127.0.0.1",
    targetOrigin,
    allowedOrigins: [...new Set([targetOrigin, ...(allowAuth ? DEFAULT_AUTH_ORIGINS : []), ...extraOrigins])],
    verbose: process.env.AWTSMOOS_SPLIT_VERBOSE === "1"
  };
}

module.exports = { loadConfig, DEFAULT_AUTH_ORIGINS };
