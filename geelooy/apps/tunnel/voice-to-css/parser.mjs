//B"H
// Voice-to-CSS Tool — parser.mjs
// Natural language -> intent object (SPEC.mjs INTENT SHAPE).
// Two-stage: (1) fast path against commands.mjs (if it exists),
// (2) keyword-based NLP fallback. ESM, no external deps.

let COMMANDS = [];
try {
  // commands.mjs may not exist yet; fall through to NLP when absent.
  const mod = await import('./commands.mjs');
  if (Array.isArray(mod.commands)) COMMANDS = mod.commands;
  else if (Array.isArray(mod.default)) COMMANDS = mod.default;
} catch {
  COMMANDS = [];
}

const norm = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Amounts: "a little" (x1.1), "a lot" (x1.5), default (x1.25 — generator's job).
const AMOUNT_RULES = [
  { keywords: ['a lot', 'much bigger', 'much smaller', 'way bigger', 'way smaller'], amount: 'a lot' },
  { keywords: ['a little', 'slightly', 'a bit', 'a tad', 'just a touch'], amount: 'a little' },
];

function detectAmount(text) {
  for (const rule of AMOUNT_RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw)) return rule.amount;
    }
  }
  return null;
}

// Targets: longest phrases first so "hebrew text" beats "hebrew".
const TARGET_RULES = [
  { keywords: ['hebrew text', 'hebrew font', 'the hebrew'], target: 'hebrew text' },
  { keywords: ['english text', 'english font', 'the english'], target: 'english text' },
  { keywords: ['body text', 'body', 'paragraph', 'paragraphs', 'text body'], target: 'body text' },
  { keywords: ['title', 'heading', 'header'], target: 'title' },
  { keywords: ['footnote', 'footnotes', 'footnote marker', 'fn marker'], target: 'footnote' },
  { keywords: ['button', 'buttons'], target: 'button' },
  { keywords: ['background', 'backdrop', 'bg '], target: 'background' },
  { keywords: ['page', 'whole page', 'entire page', 'everything', 'all text', 'site'], target: 'page' },
  { keywords: ['hebrew'], target: 'hebrew text' },
  { keywords: ['english'], target: 'english text' },
];

function detectTarget(text) {
  for (const rule of TARGET_RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw.trim())) return rule.target;
    }
  }
  return null;
}

// Action detectors, in priority order. Each returns a partial intent
// (property/value) or null. `target` is supplied so e.g. darker on the
// background maps to background-color.
const ACTION_RULES = [
  {
    name: 'english only',
    keywords: ['english only', 'only english', 'just english'],
    build: () => ({ action: 'hide', property: 'display', value: 'none', target: 'hebrew text' }),
  },
  {
    name: 'hebrew only',
    keywords: ['hebrew only', 'only hebrew', 'just hebrew'],
    build: () => ({ action: 'hide', property: 'display', value: 'none', target: 'english text' }),
  },
  {
    name: 'reset',
    keywords: ['reset', 'restore default', 'back to default', 'undo', 'clear style', 'clear formatting'],
    build: () => ({ action: 'set', property: null, value: 'reset' }),
  },
  {
    name: 'hide',
    keywords: ['hide', 'remove', 'get rid of', 'take away', 'turn off', 'invisible'],
    build: () => ({ action: 'hide', property: 'display', value: 'none' }),
  },
  {
    name: 'show',
    keywords: ['show', 'display', 'unhide', 'reveal', 'bring back', 'turn on'],
    build: () => ({ action: 'show', property: 'display', value: 'block' }),
  },
  {
    name: 'bolder',
    keywords: ['bolder', 'bold ', 'bold the', 'bold it', 'thicker text', 'heavier'],
    build: () => ({ action: 'set', property: 'font-weight', value: 'bolder' }),
  },
  {
    name: 'darker',
    keywords: ['darker', 'darken'],
    build: (target) => ({
      action: 'set',
      property: target === 'background' ? 'background-color' : 'color',
      value: 'darker',
    }),
  },
  {
    name: 'lighter',
    keywords: ['lighter', 'lighten'],
    build: (target) => ({
      action: 'set',
      property: target === 'background' ? 'background-color' : 'color',
      value: 'lighter',
    }),
  },
  {
    name: 'more space',
    keywords: ['more space', 'more spacing', 'spread out', 'space out'],
    build: () => ({ action: 'increase', property: 'margin', value: 'more' }),
  },
  {
    name: 'less space',
    keywords: ['less space', 'less spacing', 'tighter', 'squish', 'compress'],
    build: () => ({ action: 'decrease', property: 'margin', value: 'less' }),
  },
  {
    name: 'increase',
    keywords: ['bigger', 'larger', 'increase', 'grow', 'enlarge', 'zoom in'],
    build: () => ({ action: 'increase', property: 'font-size', value: 'bigger' }),
  },
  {
    name: 'decrease',
    keywords: ['smaller', 'decrease', 'shrink', 'reduce', 'zoom out', 'tinier'],
    build: () => ({ action: 'decrease', property: 'font-size', value: 'smaller' }),
  },
];

function fastPath(text) {
  for (const cmd of COMMANDS) {
    const phrases = cmd.phrases || [];
    for (const phrase of phrases) {
      const p = norm(phrase);
      if (p && (text === p || text.includes(p))) {
        return { ...cmd.intent, raw: text };
      }
    }
  }
  return null;
}

/**
 * Parse natural language into an intent object (SPEC.mjs INTENT SHAPE).
 * @param {string} text
 * @returns {{action: string|null, target: string|null, property: string|null, value: string|null, amount: string|null, raw: string}}
 */
export function parseIntent(text) {
  const raw = String(text || '');
  const t = norm(raw);

  // 1) Fast path: known commands.
  const fast = fastPath(t);
  if (fast) return fast;

  // 2) NLP fallback: keyword parsing.
  const amount = detectAmount(t);
  let forcedTarget = null;
  let action = null;
  let property = null;
  let value = null;

  const target = detectTarget(t);

  for (const rule of ACTION_RULES) {
    if (rule.keywords.some((kw) => t.includes(kw.trim()))) {
      const built = rule.build(target);
      action = built.action;
      property = built.property;
      value = built.value;
      if (built.target) forcedTarget = built.target;
      break;
    }
  }

  return {
    action,
    target: forcedTarget || target || 'page',
    property,
    value,
    amount,
    raw,
  };
}

export const VOICE_CSS_PARSER_VERSION = '0.1.0';
