// B"H

/**
 * B"H
 * Chapter 81: The dotted names were sparks scattered on black water.
 * This grammar lowers Puppeteer, Playwright, and plain JSON action names into
 * one Merkava page-action language. The Awtsmoos is revealed in the fact that
 * every alias keeps its intent: keyboard.down becomes keyboard with a down
 * subaction, mouse.up becomes mouse with an up subaction, and no Chromium is
 * invoked to pretend the proof happened elsewhere.
 */
export const ACTION_ALIASES = Object.freeze({
  goto: 'goto', navigate: 'goto', url: 'url', currentUrl: 'url', getUrl: 'url', reload: 'reload', setContent: 'setContent',
  click: 'click', tap: 'click', dblclick: 'doubleClick', doubleClick: 'doubleClick',
  hover: 'hover', focus: 'focus', blur: 'blur', type: 'type', fill: 'fill', clear: 'clear', press: 'press', key: 'press',
  check: 'check', uncheck: 'uncheck', select: 'selectOption', selectOption: 'selectOption',
  wait: 'wait', waitForTimeout: 'wait', waitForSelector: 'waitForSelector', waitForFunction: 'waitForFunction',
  locator: 'locator', '$': '$', '$$': '$$', query: '$', queryAll: '$$', content: 'content', title: 'title', pageTitle: 'title',
  keyboard: 'keyboard', 'page.keyboard': 'keyboard', 'keyboard.type': 'keyboard', 'keyboard.press': 'keyboard', 'keyboard.down': 'keyboard', 'keyboard.up': 'keyboard',
  mouse: 'mouse', 'page.mouse': 'mouse', 'mouse.click': 'mouse', 'mouse.move': 'mouse', 'mouse.down': 'mouse', 'mouse.up': 'mouse', 'mouse.hover': 'mouse',
  assertText: 'assertText', expectText: 'assertText', assertExists: 'assertExists', expectExists: 'assertExists',
  assertValue: 'assertValue', expectValue: 'assertValue', assertChecked: 'assertChecked', assertUrl: 'assertUrl', assertEval: 'assertEval',
  evaluate: 'evaluate', eval: 'evaluate', script: 'evaluate', screenshot: 'screenshot', snapshot: 'snapshot'
});

const DOTTED_SUBACTIONS = Object.freeze({
  'keyboard.type': 'type',
  'keyboard.press': 'press',
  'keyboard.down': 'down',
  'keyboard.up': 'up',
  'mouse.click': 'click',
  'mouse.move': 'move',
  'mouse.down': 'down',
  'mouse.up': 'up',
  'mouse.hover': 'hover'
});

/**
 * B"H
 * Preserve dotted action intent after canonicalization.
 *
 * @param {object} raw User action object.
 * @param {string} verb Original action/op/method/type verb.
 * @returns {object} Extra subaction fields for keyboard/mouse aliases.
 */
function dottedIntent(raw, verb) {
  const subaction = DOTTED_SUBACTIONS[verb];
  if (!subaction) return {};
  if (String(verb).startsWith('keyboard.')) return { keyboardAction: raw.keyboardAction || raw.subaction || raw.method || subaction };
  if (String(verb).startsWith('mouse.')) return { mouseAction: raw.mouseAction || raw.subaction || raw.method || subaction };
  return {};
}

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
  return { id: raw.id || `step-${index + 1}`, ...raw, ...dottedIntent(raw, verb), action };
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
