// B"H
/**
 * B"H
 * Chapter 397: The visible editor comes before the hidden shadow.
 * ChatGPT keeps a hidden fallback textarea, but the living composer is the
 * ProseMirror contenteditable node. We prefer visible/editable vessels first.
 */
const PROMPT_SELECTORS = [
  '#prompt-textarea[contenteditable="true"]',
  'div[contenteditable="true"][role="textbox"]',
  'div[contenteditable="true"]',
  'textarea[data-id="root"]',
  'textarea[placeholder]'
];

const SEND_SELECTORS = [
  'button[data-testid="send-button"]',
  '#composer-submit-button',
  'button[aria-label*="Send"]'
];

const ASSISTANT_SELECTORS = [
  '[data-message-author-role="assistant"]',
  '.markdown.prose',
  'main article'
];

module.exports = { PROMPT_SELECTORS, SEND_SELECTORS, ASSISTANT_SELECTORS };
