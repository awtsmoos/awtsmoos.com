//B"H

import { ensureToken } from "../auth/session.js";

/**
 * B"H — Exact old working conversation list logic, now in a small vessel.
 *
 * Old flow:
 *   1. If token is missing, fetch `/api/auth/session`.
 *   2. Read `session.accessToken`.
 *   3. GET `/backend-api/conversations?offset&limit&order=updated`.
 *   4. Send `authorization: Bearer <token>`.
 */
export async function getConversations(mFetch, { offset = 0, limit = 27 } = {}) {
  var token = await ensureToken(mFetch);
  var url = `https://chatgpt.com/backend-api/conversations?offset=${offset}&limit=${limit}&order=updated`;
  var requestSummary = { url, hasBearer: Boolean(token), limit, offset };
  console.log("B\"H legacy getConversations request JSON", JSON.stringify(requestSummary));
  var response = await mFetch(url, {
    headers: {
      authorization: "Bearer " + token
    }
  });
  var convo = await response.json();
  var responseSummary = {
    status: response.status,
    ok: response.ok,
    keys: Object.keys(convo || {}),
    itemCount: Array.isArray(convo?.items) ? convo.items.length : null,
    total: convo?.total,
    firstIds: Array.isArray(convo?.items) ? convo.items.slice(0, 5).map(item => item?.id || item?.conversation_id || item?.title) : []
  };
  console.log("B\"H legacy getConversations response JSON", JSON.stringify(responseSummary));
  console.log("B\"H legacy getConversations raw", convo);
  return convo;
}
