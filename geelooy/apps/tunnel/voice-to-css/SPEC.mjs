//B"H
// Voice-to-CSS Tool — Shared Interface Spec
// All modules live in geelooy/apps/tunnel/voice-to-css/
// Every module is ESM (.mjs), no external deps, node --check clean.

/**
 * INTENT SHAPE (parser.mjs output, generator.mjs input):
 * {
 *   action: 'increase' | 'decrease' | 'set' | 'hide' | 'show' | 'toggle',
 *   target: string,        // e.g. 'title', 'hebrew text', 'english text', 'button', 'footnote'
 *   property: string|null, // e.g. 'font-size', 'color', 'background-color', 'margin', 'padding', 'display'
 *   value: string|null,    // e.g. 'bigger', 'smaller', 'darker', 'lighter', '#2b2118', 'none'
 *   amount: string|null,   // e.g. 'a little', 'a lot', null
 *   raw: string            // original input text
 * }
 *
 * TARGET → SELECTOR MAP (shared, in commands.mjs, imported by generator):
 * {
 *   'title': '.meluket-sefer-title, .meluket-sefer-title-he, .post-title',
 *   'hebrew text': '.meluket-hebrew, [lang="he"]',
 *   'english text': '.meluket-english, [lang="en"]',
 *   'hebrew': '.meluket-sefer [data-lang-mode] .meluket-hebrew',
 *   'button': 'button, .meluket-fn-marker',
 *   'footnote': '.meluket-footnote, .meluket-fn',
 *   'body text': '.meluket-sefer-body, .meluket-section',
 *   'background': '.meluket-sefer',
 *   'page': 'body, .meluket-sefer'
 * }
 *
 * CSS DIFF SHAPE (generator.mjs output):
 * {
 *   selector: string,
 *   declarations: { [property]: value },  // e.g. { 'font-size': 'calc(1em * 1.25)' }
 *   css: string,   // rendered CSS text block
 *   summary: string // human-readable: "Title font-size increased by 25%"
 * }
 *
 * PREVIEW SHAPE (preview.mjs):
 * {
 *   before: string,  // data URL or file path of before screenshot
 *   after: string,   // data URL or file path of after screenshot (with diff applied)
 *   diff: object     // the CSS diff that was previewed
 * }
 * NOTE: preview.mjs must work WITHOUT a browser for unit tests —
 * export `applyDiffToHtml(html, diff)` which injects a <style> block and
 * returns modified HTML. Screenshot capture is a separate optional
 * function `capture(url, diff)` that degrades gracefully if no browser.
 *
 * APPROVER SHAPE (approver.mjs):
 * {
 *   propose(diff) -> { id, diff, status: 'pending' },
 *   approve(id) -> { id, status: 'approved', deployPlan },
 *   reject(id) -> { id, status: 'rejected' }
 * }
 * Deploy plan is { cssFile, cssText, targetPath } — does NOT deploy itself;
 * the tunnel deploy pipeline consumes it.
 *
 * COMMANDS (commands.mjs): array of 20 { name, phrases[], intent } entries.
 * parser.mjs uses these for fast-path matching before NLP fallback.
 */
export const VOICE_CSS_VERSION = '0.1.0';
