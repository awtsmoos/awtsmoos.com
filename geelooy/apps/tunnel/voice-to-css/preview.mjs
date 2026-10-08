//B"H
// Voice-to-CSS Tool — preview.mjs
// PREVIEW SHAPE (per SPEC.mjs):
//   { before: string, after: string, diff: object }
// Works WITHOUT a browser for unit tests:
//   - applyDiffToHtml(html, diff) injects a <style> block and returns modified HTML.
//   - capture(url, diff) is optional and degrades gracefully when no browser exists.
// ESM, no external deps, node --check clean.

const STYLE_MARKER = 'data-voice-css-preview';

/**
 * Render the CSS text for a diff.
 * Prefers diff.css (the generator's rendered block); falls back to
 * building "{ selector { prop: value; ... } }" from declarations.
 * Returns '' when the diff carries no usable CSS (empty diff).
 */
function diffToCssText(diff) {
  if (!diff || typeof diff !== 'object') return '';
  if (typeof diff.css === 'string' && diff.css.trim()) return diff.css;
  const selector = typeof diff.selector === 'string' ? diff.selector.trim() : '';
  const declarations = diff.declarations && typeof diff.declarations === 'object'
    ? diff.declarations
    : {};
  const body = Object.entries(declarations)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join('\n');
  if (!selector || !body) return '';
  return `${selector} {\n${body}\n}`;
}

/**
 * Inject a preview <style> block carrying the diff's CSS into an HTML string.
 *
 * - HTML with a </head>: the style block goes right before it, so the
 *   preview override wins over earlier stylesheets.
 * - HTML without a head: the style block is prepended.
 * - Empty/unusable diff: the HTML is returned unchanged.
 *
 * Trusts the diff (it comes from our generator) — nothing is escaped.
 */
export function applyDiffToHtml(html, diff) {
  if (typeof html !== 'string') throw new TypeError('applyDiffToHtml: html must be a string');
  const cssText = diffToCssText(diff);
  if (!cssText) return html;
  const styleBlock = `<style ${STYLE_MARKER}>\n${cssText}\n</style>`;
  const headClose = /<\/head\s*>/i;
  if (headClose.test(html)) {
    return html.replace(headClose, (match) => `${styleBlock}\n${match}`);
  }
  return `${styleBlock}\n${html}`;
}

async function tryLoadBrowser() {
  for (const name of ['playwright', 'puppeteer']) {
    try {
      const mod = await import(name);
      return { name, mod: mod && mod.default ? mod.default : mod };
    } catch {
      // not installed — try the next candidate
    }
  }
  return null;
}

/**
 * OPTIONAL: capture before/after screenshots of `url` with the diff applied.
 * Returns { ok: true, before, after, diff } with data-URL PNGs, or
 * { ok: false, reason } — and NEVER throws, so unit tests stay browser-free.
 */
export async function capture(url, diff) {
  try {
    if (typeof url !== 'string' || !url) {
      return { ok: false, reason: 'missing url' };
    }
    const browser = await tryLoadBrowser();
    if (!browser) {
      return { ok: false, reason: 'no browser available' };
    }
    const { name, mod } = browser;
    let page;
    let browserHandle;
    if (name === 'playwright') {
      const { chromium } = mod;
      browserHandle = await chromium.launch();
      page = await browserHandle.newPage();
    } else {
      browserHandle = await mod.launch({ headless: true });
      page = await browserHandle.newPage();
    }
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const before = await page.screenshot({ encoding: 'base64' });
      const cssText = diffToCssText(diff);
      if (cssText) {
        await page.addStyleTag({ content: cssText });
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      const after = await page.screenshot({ encoding: 'base64' });
      return {
        ok: true,
        before: `data:image/png;base64,${before}`,
        after: `data:image/png;base64,${after}`,
        diff,
      };
    } finally {
      if (browserHandle) await browserHandle.close();
    }
  } catch (err) {
    return { ok: false, reason: err && err.message ? err.message : String(err) };
  }
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Render a small standalone demo page showing before/after side by side
 * with the diff summary. Embeds both HTML strings in sandboxed iframes.
 */
export function renderPreviewPage(beforeHtml, afterHtml, diff) {
  const summary = diff && typeof diff.summary === 'string' ? diff.summary : 'No summary';
  const cssText = diffToCssText(diff);
  const selector = diff && typeof diff.selector === 'string' ? diff.selector : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Voice-to-CSS Preview</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; background: #f5f2ec; color: #2b2118; }
  h1 { font-size: 20px; margin: 0 0 8px; }
  .meta { margin: 0 0 16px; }
  .meta .summary { font-size: 16px; margin-bottom: 8px; }
  .meta .selector { font-family: monospace; font-size: 13px; color: #5a4a3a; }
  .meta pre { background: #2b2118; color: #f5f2ec; padding: 12px; border-radius: 8px; font-size: 13px; overflow-x: auto; }
  .panes { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .pane h2 { font-size: 14px; margin: 0 0 6px; }
  .pane iframe { width: 100%; height: 70vh; border: 1px solid #ccc; border-radius: 8px; background: #fff; }
</style>
</head>
<body>
  <h1>Voice-to-CSS Preview</h1>
  <div class="meta">
    <div class="summary">${escapeHtml(summary)}</div>
    <div class="selector">${escapeHtml(selector)}</div>
    <pre>${escapeHtml(cssText)}</pre>
  </div>
  <div class="panes">
    <div class="pane">
      <h2>Before</h2>
      <iframe sandbox="allow-same-origin" srcdoc="${escapeAttr(beforeHtml || '')}"></iframe>
    </div>
    <div class="pane">
      <h2>After</h2>
      <iframe sandbox="allow-same-origin" srcdoc="${escapeAttr(afterHtml || '')}"></iframe>
    </div>
  </div>
</body>
</html>`;
}
