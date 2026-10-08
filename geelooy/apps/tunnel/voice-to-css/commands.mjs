//B"H
// Voice-to-CSS Tool — command table (fast-path matching for parser.mjs)
// Canonical home of the TARGET→SELECTOR map; generator.mjs copies it.

/**
 * A command entry:
 * {
 *   name: string,        // unique command id
 *   phrases: string[],   // example / trigger phrases (parser normalizes input and matches)
 *   intent: {            // intent WITHOUT `raw` — parser adds that
 *     action: 'increase' | 'decrease' | 'set' | 'hide' | 'show' | 'toggle',
 *     target: string,    // must be a key of TARGET_SELECTORS
 *     property: string|null,
 *     value: string|null,
 *     amount: string|null
 *   }
 * }
 */

export const COMMANDS = [
  {
    name: 'bigger-title',
    phrases: ['make the title bigger', 'bigger title', 'increase title size'],
    intent: { action: 'increase', target: 'title', property: 'font-size', value: 'bigger', amount: null }
  },
  {
    name: 'smaller-title',
    phrases: ['make the title smaller', 'smaller title', 'decrease title size'],
    intent: { action: 'decrease', target: 'title', property: 'font-size', value: 'smaller', amount: null }
  },
  {
    name: 'bigger-text',
    phrases: ['make the text bigger', 'bigger text', 'increase text size'],
    intent: { action: 'increase', target: 'body text', property: 'font-size', value: 'bigger', amount: null }
  },
  {
    name: 'smaller-text',
    phrases: ['make the text smaller', 'smaller text', 'decrease text size'],
    intent: { action: 'decrease', target: 'body text', property: 'font-size', value: 'smaller', amount: null }
  },
  {
    name: 'bigger-hebrew',
    phrases: ['make the hebrew bigger', 'bigger hebrew', 'increase hebrew size'],
    intent: { action: 'increase', target: 'hebrew text', property: 'font-size', value: 'bigger', amount: null }
  },
  {
    name: 'bigger-english',
    phrases: ['make the english bigger', 'bigger english', 'increase english size'],
    intent: { action: 'increase', target: 'english text', property: 'font-size', value: 'bigger', amount: null }
  },
  {
    name: 'darker-text',
    phrases: ['make the text darker', 'darker text'],
    intent: { action: 'set', target: 'body text', property: 'filter', value: 'darker', amount: null }
  },
  {
    name: 'lighter-bg',
    phrases: ['make the background lighter', 'lighter background'],
    intent: { action: 'set', target: 'background', property: 'filter', value: 'lighter', amount: null }
  },
  {
    name: 'more-spacing',
    phrases: ['more space', 'add spacing', 'more space between sections'],
    intent: { action: 'set', target: 'body text', property: 'spacing', value: 'more', amount: null }
  },
  {
    name: 'less-spacing',
    phrases: ['less space', 'tighter', 'less space between sections'],
    intent: { action: 'set', target: 'body text', property: 'spacing', value: 'less', amount: null }
  },
  {
    name: 'bolder-text',
    phrases: ['make it bolder', 'bolder text'],
    intent: { action: 'set', target: 'body text', property: 'font-weight', value: 'bolder', amount: null }
  },
  {
    name: 'hide-hebrew',
    phrases: ['hide the hebrew', 'hebrew off'],
    intent: { action: 'hide', target: 'hebrew text', property: null, value: null, amount: null }
  },
  {
    name: 'show-hebrew',
    phrases: ['show the hebrew', 'hebrew on'],
    intent: { action: 'show', target: 'hebrew text', property: null, value: null, amount: null }
  },
  {
    name: 'english-only',
    phrases: ['english only', 'english mode'],
    intent: { action: 'set', target: 'page', property: 'language', value: 'english-only', amount: null }
  },
  {
    name: 'hebrew-only',
    phrases: ['hebrew only', 'hebrew mode'],
    intent: { action: 'set', target: 'page', property: 'language', value: 'hebrew-only', amount: null }
  },
  {
    name: 'hide-footnotes',
    phrases: ['hide footnotes', 'hide the notes', 'footnotes off'],
    intent: { action: 'hide', target: 'footnote', property: null, value: null, amount: null }
  },
  {
    name: 'show-footnotes',
    phrases: ['show footnotes', 'show the notes', 'footnotes on'],
    intent: { action: 'show', target: 'footnote', property: null, value: null, amount: null }
  },
  {
    name: 'bigger-buttons',
    phrases: ['make buttons bigger', 'bigger buttons'],
    intent: { action: 'increase', target: 'button', property: 'font-size', value: 'bigger', amount: null }
  },
  {
    name: 'dark-mode',
    phrases: ['dark mode', 'dark theme'],
    intent: { action: 'set', target: 'page', property: 'theme', value: 'dark', amount: null }
  },
  {
    name: 'light-mode',
    phrases: ['light mode', 'light theme'],
    intent: { action: 'set', target: 'page', property: 'theme', value: 'light', amount: null }
  }
];

/**
 * TARGET → SELECTOR MAP (canonical; copied from SPEC.mjs shared spec).
 */
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
