// B"H
/**
 * B"H
 * Chapter 16: The relay touched only the visible box.
 *
 * This helper is deliberately UI-first. It does not call hidden completion APIs.
 * A debug-Chrome page receives text the same way a user would: focus textarea,
 * set value through DOM events, and let the send button carry it.
 */

const TEXTAREA_SELECTORS = [
  "textarea[data-id='root']",
  "textarea[placeholder]",
  "textarea",
  "[contenteditable='true']"
];

async function pasteIntoComposer(page, text) {
  const selector = await firstSelector(page, TEXTAREA_SELECTORS);
  if (!selector) throw new Error("chatgpt_composer_not_found");
  await page.focus(selector);
  await page.evaluate((sel, value) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error("composer disappeared");
    if (el.matches("textarea,input")) el.value = value;
    else el.textContent = value;
    el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, selector, String(text || ""));
  return { ok: true, selector };
}

async function firstSelector(page, selectors) {
  for (const selector of selectors) {
    try { if (await page.$(selector)) return selector; } catch (_) {}
  }
  return "";
}

module.exports = { TEXTAREA_SELECTORS, pasteIntoComposer };
