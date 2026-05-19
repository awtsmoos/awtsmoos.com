//B"H

import { getAuthToken } from "../auth/session.js";

/**
 * B"H — Old sentinel helper logic, split out. The heavy legacy token engine is
 * imported lazily so conversation listing keeps the old bearer flow without
 * forcing the dev server to serve the large proof module during app boot.
 */
export async function awtsmoosifyTokens(mFetch) {
  console.log("Getting tokens");
  var z = await getChatRequirements(mFetch);
  console.log("Chat", z);
  var p = await getEnforcementToken(z);
  return {
    "openai-sentinel-chat-requirements-token": z.token,
    "openai-sentinel-proof-token": p
  };
}

export async function getChatRequirements(mFetch, authToken) {
  var tok = authToken || await getAuthToken(mFetch);
  console.log("Have token", tok);
  var req = await getRequirementsToken();
  console.log("Got require token", req);
  return await (await mFetch("https://chatgpt.com/backend-api/sentinel/chat-requirements", {
    method: "POST",
    body: JSON.stringify({ p: req }),
    headers: {
      authorization: "Bearer " + tok
    }
  })).json();
}

export async function getEnforcementToken(z) {
  var cl = await getLegacyTokenClass();
  return await cl.getEnforcementToken(z);
}

export async function getRequirementsToken() {
  var cl = await getLegacyTokenClass();
  return await cl.getRequirementsToken();
}

async function getLegacyTokenClass() {
  const { getTokenClass } = await import("./tokenClassLegacy.js");
  return getTokenClass();
}
