// B"H
const path = require("path");
const { pathToFileURL } = require("url");
const { randomUUID } = require("crypto");
const { CHATGPT_ORIGIN } = require("./auth.js");
const { legacySentinelHeaders } = require("./legacyRequest.js");

/**
 * B"H
 * Chapter 430: The Old Proof Became A Companion, Not A King.
 *
 * The new browser trace crowns prepare tokens first. The legacy proof still has
 * a place, but it no longer pretends to be the whole sentinel world. This file
 * returns the old proof as a fallback companion while prepared conduit and
 * prepared sentinel tokens are joined later by the request forge.
 */
async function sentinelHeaders(auth) {
  const requirements = await getChatRequirements(auth);
  const tokenClass = await loadTokenClass(auth);
  const proof = await tokenClass.getEnforcementToken(requirements);
  return compactHeaders({
    "openai-sentinel-chat-requirements-token": requirements.token || "",
    "openai-sentinel-proof-token": proof || "",
    "openai-sentinel-turnstile-token": requirements.turnstile_token || requirements.turnstileToken || ""
  });
}

async function getChatRequirements(auth) {
  const tokenClass = await loadTokenClass(auth);
  const proofSeed = await tokenClass.getRequirementsToken();
  const response = await fetch(`${CHATGPT_ORIGIN}/backend-api/sentinel/chat-requirements`, {
    method: "POST",
    headers: legacySentinelHeaders(auth),
    body: JSON.stringify({ p: proofSeed }),
    redirect: "manual",
    duplex: "half"
  });
  if (!response.ok) throw new Error(`Chat requirements failed: ${response.status} ${await response.text().catch(() => "")}`);
  return await response.json();
}

async function loadTokenClass(auth = {}) {
  installBrowserMask(auth);
  const file = path.resolve(__dirname, "../../../../../../ai/js/chatgpt/sentinel/tokenClassLegacy.js");
  const module = await import(pathToFileURL(file).href + `?t=${Date.now()}`);
  return module.getTokenClass();
}

function installBrowserMask(auth = {}) {
  globalThis.window = globalThis.window || globalThis;
  globalThis.self = globalThis.self || globalThis;
  globalThis.window.JS_SHA3_NO_NODE_JS = true;
  globalThis.window.JS_SHA3_NO_COMMON_JS = true;
  globalThis.crypto = globalThis.crypto || { randomUUID };
  globalThis.btoa = globalThis.btoa || (text => Buffer.from(String(text), "binary").toString("base64"));
  globalThis.screen = globalThis.screen || { width: 1920, height: 1080 };
  globalThis.navigator = globalThis.navigator || {};
  globalThis.navigator.userAgent = auth.userAgent || globalThis.navigator.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";
  globalThis.navigator.language = globalThis.navigator.language || "en-US";
  globalThis.navigator.languages = globalThis.navigator.languages || ["en-US", "en"];
  globalThis.navigator.hardwareConcurrency = globalThis.navigator.hardwareConcurrency || 8;
  globalThis.document = globalThis.document || fakeDocument();
  globalThis.performance = globalThis.performance || require("perf_hooks").performance;
  globalThis.performance.memory = globalThis.performance.memory || { jsHeapSizeLimit: 4294705152 };
}

function fakeDocument() {
  return {
    scripts: [{ src: "https://chatgpt.com/_next/static/chunks/main.js" }],
    documentElement: { getAttribute: () => "" },
    body: {},
    head: {}
  };
}

function compactHeaders(headers = {}) {
  return Object.fromEntries(Object.entries(headers).filter(([, value]) => value !== undefined && value !== null && String(value) !== ""));
}

module.exports = { sentinelHeaders, getChatRequirements, installBrowserMask };
