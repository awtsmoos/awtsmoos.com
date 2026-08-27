//B"H

import { ensureToken } from "../auth/session.js";

/**
 * B"H — Exact old conversation-detail logic with the old accept/language/bearer headers.
 */
export async function getConversation(mFetch, conversation_id, token) {
  if (!token) token = await ensureToken(mFetch);
  var url = "https://chatgpt.com/backend-api/conversation/" + conversation_id;
  console.log("B\"H legacy getConversation request JSON", JSON.stringify({ url, conversation_id, hasBearer: Boolean(token) }));
  var response = await mFetch(url, {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      authorization: "Bearer " + token
    },
    method: "GET"
  });
  var convo = await response.json();
  console.log("B\"H legacy getConversation response JSON", JSON.stringify({
    status: response.status,
    ok: response.ok,
    keys: Object.keys(convo || {}),
    current_node: convo?.current_node,
    mappingCount: convo?.mapping ? Object.keys(convo.mapping).length : null,
    title: convo?.title
  }));
  // B"H: do not log full conversation detail. DevTools retains expanded
  // console objects, and a full ChatGPT mapping can be a massive memory root.
  return convo;
}
