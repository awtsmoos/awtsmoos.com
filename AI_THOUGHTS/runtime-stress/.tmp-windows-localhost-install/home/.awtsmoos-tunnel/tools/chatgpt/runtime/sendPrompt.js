// B"H
const { chromeEval } = require("../../chrome/actions.js");
const { PROMPT_SELECTORS, SEND_SELECTORS } = require("./selectors.js");

/**
 * B"H
 * Chapter 398: The prompt enters the visible ProseMirror river.
 * The sender now ignores hidden fallback textareas unless no visible composer
 * exists, then clicks, pointer-clicks, and submits through every safe gate.
 */
async function sendPrompt(payload = {}) {
  const port = Number(payload.port || payload.chromePort || 9223);
  const message = String(payload.message || payload.prompt || payload.text || "");
  if (!message) return { ok: false, action: "chatgptSendPrompt", error: "missing_message" };
  const expression = browserScript(message);
  const got = await chromeEval({ port, expression, timeoutMs: payload.timeoutMs || 30000, maxLogs: 50 });
  const value = got.result?.result?.value || got.result?.value || null;
  return { ok: !!value?.ok, action: "chatgptSendPrompt", port, result: value };
}

function browserScript(message) {
  return `(() => {
    const promptSelectors = ${JSON.stringify(PROMPT_SELECTORS)};
    const sendSelectors = ${JSON.stringify(SEND_SELECTORS)};
    const text = ${JSON.stringify(message)};
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const visible = el => el && el.getClientRects().length && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
    const findPrompt = () => promptSelectors.map(s => document.querySelector(s)).find(visible) || promptSelectors.map(s => document.querySelector(s)).find(Boolean);
    const findSend = () => sendSelectors.map(s => document.querySelector(s)).find(visible) || Array.from(document.querySelectorAll('button')).find(b => /send/i.test(b.getAttribute('aria-label') || b.textContent || ''));
    const setNativeValue = (el, value) => {
      if (el.isContentEditable) {
        el.focus();
        el.innerHTML = '';
        const p = document.createElement('p');
        p.textContent = value;
        el.appendChild(p);
        return;
      }
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : el instanceof HTMLInputElement ? HTMLInputElement.prototype : null;
      const desc = proto && Object.getOwnPropertyDescriptor(proto, 'value');
      if (desc && desc.set) desc.set.call(el, value);
      else if ('value' in el) el.value = value;
      else el.textContent = value;
    };
    const fireTextEvents = el => {
      el.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data: text }));
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    const clickLikeHuman = el => {
      for (const type of ['pointerdown','mousedown','pointerup','mouseup','click']) {
        el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
      }
    };
    return (async () => {
      const prompt = findPrompt();
      if (!prompt) return { ok: false, error: 'prompt_not_found', title: document.title, href: location.href };
      prompt.focus();
      setNativeValue(prompt, text);
      fireTextEvents(prompt);
      await sleep(350);
      const button = findSend();
      const form = prompt.closest('form') || button?.closest('form');
      const valueAfter = prompt.isContentEditable ? prompt.innerText : ('value' in prompt ? prompt.value : prompt.textContent);
      if (button && !button.disabled && button.getAttribute('aria-disabled') !== 'true') {
        clickLikeHuman(button);
        button.click();
        return { ok: true, via: 'button', tag: prompt.tagName, valueLength: String(valueAfter || '').length, href: location.href };
      }
      if (form && typeof form.requestSubmit === 'function') {
        form.requestSubmit(button || undefined);
        return { ok: true, via: 'requestSubmit', tag: prompt.tagName, valueLength: String(valueAfter || '').length, href: location.href };
      }
      prompt.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true }));
      prompt.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true }));
      return { ok: true, via: 'enter', tag: prompt.tagName, valueLength: String(valueAfter || '').length, href: location.href };
    })();
  })()`;
}

module.exports = { sendPrompt, browserScript };
