// B"H
const { pasteIntoComposer } = require("./textareaPaster.js");
const { readLatestAssistantResponse } = require("./responseReader.js");

/**
 * B"H
 * Chapter 18: The legal relay chose the front door.
 *
 * A caller gives this module a debug-Chrome page object. The relay navigates the
 * visible ChatGPT UI, pastes text, clicks send, and reads the visible response.
 * It does not use hidden completion endpoints.
 */
async function sendVisibleChatGptMessage(page, payload = {}) {
  const url = payload.conversationUrl || payload.url || "https://chatgpt.com/";
  if (!page) throw new Error("debug_chrome_page_required");
  if (page.url && !String(page.url()).startsWith("https://chatgpt.com")) await page.goto(url, { waitUntil: "domcontentloaded" });
  await pasteIntoComposer(page, payload.prompt || payload.message || "");
  await clickSend(page);
  return await readLatestAssistantResponse(page, payload);
}

async function clickSend(page) {
  const clicked = await page.evaluate(() => {
    const candidates = [...document.querySelectorAll("button")];
    const send = candidates.find(btn => /send/i.test(btn.getAttribute("aria-label") || "")) || candidates.find(btn => btn.querySelector("svg") && !btn.disabled);
    if (!send) return false;
    send.click();
    return true;
  });
  if (!clicked) throw new Error("chatgpt_send_button_not_found");
  return { ok: true };
}

module.exports = { clickSend, sendVisibleChatGptMessage };
