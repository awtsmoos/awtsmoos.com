// B"H
/**
 * B"H
 * Chapter 17: The answer was read from the visible page.
 *
 * This module reads the rendered ChatGPT conversation DOM. It is intentionally
 * conservative: no hidden completion endpoint, no cookie export, no bypass.
 */

const ASSISTANT_SELECTORS = [
  "[data-message-author-role='assistant']",
  "article .markdown",
  ".markdown.prose",
  "main article"
];

async function readLatestAssistantResponse(page, options = {}) {
  const timeoutMs = Number(options.timeoutMs || 120000);
  const startedAt = Date.now();
  let last = "";
  while (Date.now() - startedAt < timeoutMs) {
    const text = await latestText(page);
    if (text && text === last) return { ok: true, text, stable: true };
    last = text || last;
    await sleep(Number(options.pollMs || 1200));
  }
  return last ? { ok: true, text: last, stable: false, timedOut: true } : { ok: false, error: "assistant_response_not_found" };
}

async function latestText(page) {
  return await page.evaluate(selectors => {
    for (const selector of selectors) {
      const nodes = [...document.querySelectorAll(selector)].filter(x => x.textContent.trim());
      if (nodes.length) return nodes[nodes.length - 1].textContent.trim();
    }
    return "";
  }, ASSISTANT_SELECTORS);
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
module.exports = { ASSISTANT_SELECTORS, readLatestAssistantResponse };
