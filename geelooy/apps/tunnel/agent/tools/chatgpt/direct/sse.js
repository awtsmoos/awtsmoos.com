// B"H

/**
 * B"H
 * Chapter 404: The Stream Broke Into Sparks And Became A Voice.
 *
 * ChatGPT answers as event-stream rain. Each packet is a droplet; this parser
 * gathers the droplets without asking Chrome to watch the page. The final text
 * is lifted from the newest assistant message, like letters condensing from the
 * Awtsmoos into audible form.
 *
 * @param {Response} response Fetch response with SSE body.
 * @returns {Promise<{text:string,events:number,assistantMessageId:string,conversationId:string}>} Stream summary.
 */
async function readChatGptSse(response) {
  const reader = response.body?.getReader?.();
  if (!reader) return { text: await response.text(), events: 0, assistantMessageId: "", conversationId: "" };
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let events = 0;
  let assistantMessageId = "";
  let conversationId = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() || "";
    for (const block of blocks) {
      const parsed = parseEvent(block);
      if (!parsed) continue;
      events += 1;
      const message = parsed.message || parsed.data?.message || null;
      text = messageText(message) || text;
      assistantMessageId = message?.id || assistantMessageId;
      conversationId = parsed.conversation_id || parsed.conversationId || conversationId;
    }
  }
  return { text, events, assistantMessageId, conversationId };
}

function parseEvent(block) {
  const data = block.split(/\r?\n/).filter(line => line.startsWith("data:")).map(line => line.slice(5).trimStart()).join("\n").trim();
  if (!data || data === "[DONE]") return null;
  try { return JSON.parse(data); } catch { return null; }
}

function messageText(message) {
  const content = message?.content || {};
  if (Array.isArray(content.parts)) return content.parts.find(part => typeof part === "string" && part.trim()) || "";
  if (typeof content.text === "string") return content.text;
  return "";
}

module.exports = { readChatGptSse, messageText };
