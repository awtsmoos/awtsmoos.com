// B"H
const { randomUUID } = require("crypto");
const { CHATGPT_ORIGIN, requestHeaders } = require("./auth.js");

const F_CONVERSATION_PATH = "/backend-api/f/conversation";
const F_PREPARE_PATH = `${F_CONVERSATION_PATH}/prepare`;
const SENTINEL_PREPARE_PATH = "/backend-api/sentinel/chat-requirements/prepare";
const SENTINEL_FINALIZE_PATH = "/backend-api/sentinel/chat-requirements/finalize";

/**
 * B"H
 * Chapter 428: The Empty Knock Before The Thunder.
 *
 * Before the word crosses `/f/conversation`, the browser now performs quiet
 * prepare knocks. This module gives Node the same map: conduit prepare,
 * sentinel prepare, and sentinel finalize. The Awtsmoos lets the old river and
 * the new river share one request grammar instead of scattering headers across
 * brittle callers.
 *
 * @param {object} input Prepare input.
 * @param {object} input.auth Direct auth vessel.
 * @param {object} [input.payload] User payload.
 * @returns {Promise<object>} Prepared request material.
 */
async function prepareDirectRequest(input = {}) {
  const auth = input.auth || {};
  const payload = input.payload || {};
  const client = clientHeaders(payload);
  const turnTraceId = payload.turnTraceId || randomUUID();
  const conversation = await prepareEndpoint(auth, F_PREPARE_PATH, {
    ...client,
    "x-oai-turn-trace-id": turnTraceId,
    "x-conduit-token": payload.conduitToken || ""
  }).catch(error => failedPrepare(F_PREPARE_PATH, error));
  const sentinelPrepare = await prepareEndpoint(auth, SENTINEL_PREPARE_PATH, client)
    .catch(error => failedPrepare(SENTINEL_PREPARE_PATH, error));
  const sentinelFinalize = await prepareEndpoint(auth, SENTINEL_FINALIZE_PATH, client)
    .catch(error => failedPrepare(SENTINEL_FINALIZE_PATH, error));
  return {
    ok: Boolean(conversation.ok || sentinelPrepare.ok || sentinelFinalize.ok),
    turnTraceId,
    clientHeaders: client,
    conversation,
    sentinelPrepare,
    sentinelFinalize,
    tokens: {
      conduitToken: conversation.json?.conduit_token || "",
      prepareToken: sentinelPrepare.json?.prepare_token || "",
      finalizedToken: sentinelFinalize.json?.token || ""
    }
  };
}

async function prepareEndpoint(auth, targetPath, headers = {}) {
  const response = await fetch(`${CHATGPT_ORIGIN}${targetPath}`, {
    method: "POST",
    headers: prepareHeaders(auth, targetPath, headers),
    redirect: "manual",
    duplex: "half"
  });
  const text = await response.text().catch(() => "");
  return {
    ok: response.ok,
    status: response.status,
    path: targetPath,
    json: parseJson(text),
    text: text.slice(0, 1200)
  };
}

function prepareHeaders(auth, targetPath, headers = {}) {
  return compactHeaders({
    ...requestHeaders({ ...auth, accept: "application/json", contentType: "application/json" }),
    ...headers,
    "x-openai-target-path": targetPath,
    "x-openai-target-route": targetPath
  });
}

function clientHeaders(payload = {}) {
  return compactHeaders({
    "oai-client-build-number": String(payload.oaiClientBuildNumber || payload.clientBuildNumber || "7399582"),
    "oai-client-version": payload.oaiClientVersion || payload.clientVersion || "prod-59fdeee9467dea9ba2491a40d367655c322d74c2",
    "oai-device-id": payload.oaiDeviceId || payload.deviceId || randomUUID(),
    "oai-language": payload.oaiLanguage || payload.language || "en-US",
    "oai-session-id": payload.oaiSessionId || payload.sessionId || randomUUID()
  });
}

function failedPrepare(path, error) {
  return { ok: false, status: 0, path, error: error.message, json: null, text: "" };
}
function parseJson(text) { try { return text ? JSON.parse(text) : null; } catch { return null; } }
function compactHeaders(headers = {}) { return Object.fromEntries(Object.entries(headers).filter(([, value]) => value !== undefined && value !== null && String(value) !== "")); }

module.exports = {
  prepareDirectRequest,
  prepareHeaders,
  clientHeaders,
  F_CONVERSATION_PATH,
  F_PREPARE_PATH,
  SENTINEL_PREPARE_PATH,
  SENTINEL_FINALIZE_PATH
};
