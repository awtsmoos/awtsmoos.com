// B"H

/**
 * B"H
 * Chapter of the mirrored browser tongue.
 * Puppeteer, Playwright, and plain JSON actions are all lowered into one
 * canonical Merkava page-action grammar. No Chromium is summoned; the Awtsmoos
 * reveals the browser behavior through the synthetic DOM vessel.
 */
export const ACTION_ALIASES = Object.freeze({
  goto: 'goto', navigate: 'goto', url: 'url', currentUrl: 'url', getUrl: 'url', reload: 'reload', setContent: 'setContent',
  click: 'click', tap: 'click', dblclick: 'doubleClick', doubleClick: 'doubleClick',
  hover: 'hover', focus: 'focus', blur: 'blur',
  type: 'type', fill: 'fill', clear: 'clear', press: 'press', key: 'press',
  check: 'check', uncheck: 'uncheck', select: 'selectOption', selectOption: 'selectOption',
  wait: 'wait', waitForTimeout: 'wait', waitForSelector: 'waitForSelector', waitForFunction: 'waitForFunction',
  locator: 'locator', '$': '$', '$$': '$$', query: '$', queryAll: '$$',
  content: 'content', title: 'title', pageTitle: 'title',
  keyboard: 'keyboard', 'keyboard.type': 'keyboard', 'keyboard.press': 'keyboard', 'page.keyboard': 'keyboard',
  mouse: 'mouse', 'mouse.click': 'mouse', 'mouse.move': 'mouse', 'page.mouse': 'mouse',
  assertText: 'assertText', expectText: 'assertText', assertExists: 'assertExists', expectExists: 'assertExists',
  assertValue: 'assertValue', expectValue: 'assertValue', assertChecked: 'assertChecked', assertUrl: 'assertUrl', assertEval: 'assertEval',
  evaluate: 'evaluate', eval: 'evaluate', script: 'evaluate', screenshot: 'screenshot', snapshot: 'snapshot'
});

/**
 * B"H
 * Normalize one user action without erasing its raw intent.
 *
 * @param {object|string} step Raw JSON action.
 * @param {number} index Step index.
 * @returns {object} Canonical action.
 */
export function normalizeBrowserAction(step, index = 0) {
  const raw = typeof step === 'string' ? { action: step } : { ...(step || {}) };
  const verb = raw.action || raw.op || raw.method || raw.type;
  const action = ACTION_ALIASES[verb] || verb;
  return { id: raw.id || `step-${index + 1}`, ...raw, action };
}

/**
 * B"H
 * Accept arrays, JSON strings, or wrapper objects with actions/steps. This is
 * the public action river consumed by simulateRuntime, pageActions, actionsJson,
 * and browserActions.
 *
 * @param {unknown} value Raw browser action payload.
 * @returns {object[]} Canonical action list.
 */
export function normalizeBrowserActions(value) {
  if (!value) return [];
  const parsed = typeof value === 'string' ? JSON.parse(value) : value;
  const list = Array.isArray(parsed) ? parsed : parsed?.actions || parsed?.steps || [];
  return list.map(normalizeBrowserAction);
}
