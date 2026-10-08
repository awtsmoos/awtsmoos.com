//B"H
// Voice-to-CSS Tool — generator.mjs
// generateCss(intent) -> CSS diff { selector, declarations, css, summary }
// Intent shape and target->selector map per SPEC.mjs.
// The map is copied here as a const so this module works standalone;
// commands.mjs is the canonical home of the map.

export const VOICE_CSS_VERSION = '0.1.0';

// TARGET -> SELECTOR MAP (copied from SPEC.mjs)
export const TARGET_SELECTORS = {
  'title': '.meluket-sefer-title, .meluket-sefer-title-he, .post-title',
  'hebrew text': '.meluket-hebrew, [lang="he"]',
  'english text': '.meluket-english, [lang="en"]',
  'hebrew': '.meluket-sefer [data-lang-mode] .meluket-hebrew',
  'button': 'button, .meluket-fn-marker',
  'footnote': '.meluket-footnote, .meluket-fn',
  'body text': '.meluket-sefer-body, .meluket-section',
  'background': '.meluket-sefer',
  'page': 'body, .meluket-sefer'
};

const HEBREW_SELECTOR = TARGET_SELECTORS['hebrew text'];
const ENGLISH_SELECTOR = TARGET_SELECTORS['english text'];

function norm(s) {
  return String(s == null ? '' : s).trim().toLowerCase();
}

function selectorFor(target) {
  const key = norm(target);
  const sel = TARGET_SELECTORS[key];
  if (!sel) {
    throw new Error(`voice-css: unknown target "${target}" (known: ${Object.keys(TARGET_SELECTORS).join(', ')})`);
  }
  return sel;
}

function cap(s) {
  s = norm(s);
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// Build declaration pairs from action/property/value/amount.
function buildDeclarations(intent) {
  const action = norm(intent.action);
  const property = norm(intent.property);
  const value = norm(intent.value);
  const amount = norm(intent.amount);

  // --- font size ---
  const isFontSize = property === 'font-size' || value === 'bigger' || value === 'smaller';
  if (action === 'increase' && (isFontSize || property === 'font size')) {
    const factor = amount === 'a little' ? 1.1 : amount === 'a lot' ? 1.5 : 1.25;
    const f = factor.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
    return { decls: { 'font-size': `calc(1em * ${f})` }, pct: `${Math.round((factor - 1) * 100)}%` };
  }
  if (action === 'decrease' && isFontSize) {
    return { decls: { 'font-size': 'calc(1em * 0.8)' }, pct: '20%' };
  }
  // also allow raw words with action set
  if (action === 'set' && value === 'bigger') {
    return { decls: { 'font-size': 'calc(1em * 1.25)' }, pct: '25%' };
  }
  if (action === 'set' && value === 'smaller') {
    return { decls: { 'font-size': 'calc(1em * 0.8)' }, pct: '20%' };
  }

  // --- color brightness words ---
  if (value === 'darker') {
    return { decls: { 'filter': 'brightness(0.85)' }, pct: null };
  }
  if (value === 'lighter') {
    return { decls: { 'filter': 'brightness(1.15)' }, pct: null };
  }

  // --- spacing words ---
  if (value === 'more space' || value === 'more-space' || value === 'morespace') {
    return { decls: { 'margin': '1.5em 0', 'line-height': '2' }, pct: null };
  }
  if (value === 'less space' || value === 'less-space' || value === 'lessspace') {
    return { decls: { 'margin': '0.25em 0', 'line-height': '1.4' }, pct: null };
  }

  // --- bold words ---
  if (value === 'bolder' || value === 'bold' || property === 'font-weight' && (value === '' || value === 'bold')) {
    return { decls: { 'font-weight': '700' }, pct: null };
  }

  // --- hide / show ---
  if (action === 'hide') {
    return { decls: { 'display': 'none !important' }, pct: null };
  }
  if (action === 'show') {
    return { decls: { 'display': '' }, pct: null };
  }

  // --- language-only views (targeted hide of the other language) ---
  if (value === 'english only' || value === 'english-only' || value === 'englishonly') {
    return { decls: { 'display': 'none !important' }, pct: null, overrideSelector: HEBREW_SELECTOR };
  }
  if (value === 'hebrew only' || value === 'hebrew-only' || value === 'hebrewonly') {
    return { decls: { 'display': 'none !important' }, pct: null, overrideSelector: ENGLISH_SELECTOR };
  }

  // --- direct set: pass the value through ---
  if (action === 'set' && property && value) {
    return { decls: { [property]: value }, pct: null };
  }

  throw new Error(`voice-css: cannot map intent (action="${intent.action}", property="${intent.property}", value="${intent.value}") to declarations`);
}

function renderCss(selector, decls) {
  const lines = Object.entries(decls).map(([prop, val]) => {
    if (val === '') {
      return `  /* ${prop}: removed (show) */`;
    }
    return `  ${prop}: ${val};`;
  });
  return `${selector} {\n${lines.join('\n')}\n}`;
}

function summarize(intent, decls) {
  const target = cap(intent.target);
  const action = norm(intent.action);
  const value = norm(intent.value);

  if (value === 'english only' || value === 'english-only' || value === 'englishonly') {
    return 'Showing English only (Hebrew hidden)';
  }
  if (value === 'hebrew only' || value === 'hebrew-only' || value === 'hebrewonly') {
    return 'Showing Hebrew only (English hidden)';
  }
  if (action === 'hide') {
    return `${target} hidden`;
  }
  if (action === 'show') {
    return `${target} shown`;
  }
  if (decls['font-size']) {
    const m = decls['font-size'].match(/\* ([0-9.]+)\)/);
    const f = m ? parseFloat(m[1]) : 1;
    const dir = f >= 1 ? 'increased' : 'decreased';
    const pct = f >= 1 ? Math.round((f - 1) * 100) : Math.round((1 - f) * 100);
    return `${target} font-size ${dir} by ${pct}%`;
  }
  if (decls['filter']) {
    const dir = value === 'darker' ? 'darker' : value === 'lighter' ? 'lighter' : 'adjusted';
    return `${target} made ${dir}`;
  }
  if (decls['margin'] && decls['line-height']) {
    const dir = value.includes('more') ? 'more' : 'less';
    return `${target} given ${dir} space`;
  }
  if (decls['font-weight']) {
    return `${target} made bolder`;
  }
  if (decls['display'] === '') {
    return `${target} shown`;
  }
  const keys = Object.keys(decls);
  if (keys.length) {
    const pairs = keys.map(k => `${k} set to ${decls[k]}`).join(', ');
    return `${target}: ${pairs}`;
  }
  return `${target} updated`;
}

/**
 * @param {object} intent - INTENT SHAPE per SPEC.mjs
 * @returns {{selector, declarations, css, summary}}
 */
export function generateCss(intent) {
  if (!intent || typeof intent !== 'object') {
    throw new Error('voice-css: intent must be an object');
  }
  const built = buildDeclarations(intent);
  const selector = built.overrideSelector || selectorFor(intent.target);
  const css = renderCss(selector, built.decls);
  const summary = summarize(intent, built.decls);
  return {
    selector,
    declarations: built.decls,
    css,
    summary
  };
}
