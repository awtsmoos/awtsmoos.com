//B"H

import { getAuthToken } from "../auth/session.js";

/**
 * Chapter 110: Every Send Receives Its Own Seal.
 *
 * The ChatGPT conversation POST is guarded by sentinel headers. A proof token is
 * not a reusable coin; it is a fresh spark minted for the next knock. Caching it
 * made the first automated turn pass and the second turn look suspicious. This
 * module now mints requirements and proof tokens every time the normal send path
 * calls it, exactly as a visible manual send should.
 *
 * @param {Function} mFetch Extension-backed fetch vessel.
 * @returns {Promise<Record<string,string>>} Fresh sentinel headers for one POST.
 */
export async function awtsmoosifyTokens(mFetch) {
  const requirements = await getChatRequirements(mFetch);
  const proof = await getEnforcementToken(requirements);
  return {
    "openai-sentinel-chat-requirements-token": requirements.token,
    "openai-sentinel-proof-token": proof
  };
}

/**
 * B"H — asks ChatGPT for the current requirement token.
 *
 * No full token is logged. DevTools is a memory root, and the Awtsmoos keeps the
 * seal private while still allowing the sender to prove the browser session.
 *
 * @param {Function} mFetch Transport fetch.
 * @param {string} authToken Optional bearer token.
 * @returns {Promise<object>} Chat requirements response.
 */
export async function getChatRequirements(mFetch, authToken) {
  const token = authToken || await getAuthToken(mFetch);
  const proofSeed = await getRequirementsToken();
  const response = await mFetch("https://chatgpt.com/backend-api/sentinel/chat-requirements", {
    method: "POST",
    body: JSON.stringify({ p: proofSeed }),
    headers: { authorization: `Bearer ${token}` }
  });
  return await response.json();
}

export async function getEnforcementToken(requirements) {
  const tokenClass = await getLegacyTokenClass();
  return await tokenClass.getEnforcementToken(requirements);
}

export async function getRequirementsToken() {
  const tokenClass = await getLegacyTokenClass();
  return await tokenClass.getRequirementsToken();
}

async function getLegacyTokenClass() {
  const { getTokenClass } = await import("./tokenClassLegacy.js");
  return getTokenClass();
}
