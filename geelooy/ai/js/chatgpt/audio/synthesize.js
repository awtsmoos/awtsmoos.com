//B"H

import { ensureToken } from "../auth/session.js";
import { getConversation } from "../conversations/detail.js";
import { blobToDataURL } from "../util/blob.js";

/**
 * B"H — Old audio synthesis helper, split out without changing its request shape.
 */
export async function getAwtsmoosAudio(mFetch, {
  message_id,
  conversation_id,
  voice = "orbit",
  format = "aac",
  download = true
}) {
  var token = await ensureToken(mFetch);
  var convo = await getConversation(mFetch, conversation_id, token);
  if (!message_id) message_id = convo?.current_node;
  var blob = await (
    await mFetch("https://chatgpt.com/backend-api/synthesize?message_id="
      + message_id
      + "&conversation_id=" + conversation_id
      + "&voice=" + voice
      + "&format=" + format, {
      headers: {
        authorization: "Bearer " + token
      }
    })
  ).blob();
  if (download) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "BH_awtsmoosAudio_" + Date.now() + "." + format;
    a.click();
    return { downloaded: "true" };
  }
  var data = await blobToDataURL(blob);
  return { url: data };
}
