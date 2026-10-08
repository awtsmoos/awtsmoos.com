// B"H
/**
 * B"H - Tunnel CSS Style Firewall
 * =============================================================================
 * Runtime self-healing layer of the Airtight CSS Guarantee System
 * (css-guarantee Layer 4: browser-side safety net).
 *
 * Background: Awtsmoos.com shipped a white-on-white bug in light theme where
 * text became invisible. The root cause was two CSS systems fighting. This
 * module is the runtime safety net: it watches for style failures in the live
 * page and auto-corrects them.
 *
 * What it does:
 *   1. On load, via a debounced MutationObserver, and via a periodic 5s sweep,
 *      it checks text elements (p, h1-h6, span, div) for:
 *        - low contrast (WCAG relative-luminance ratio < configured minimum,
 *          default 3.0),
 *        - white-on-white (near-white text on a near-white background),
 *        - invisible text (color alpha 0, or opacity 0, on an element that is
 *          not explicitly hidden via `hidden` / `aria-hidden`).
 *   2. When a violation is found it applies an inline `!important` fix
 *      (`color: #1a1a1a`) and records the correction for telemetry.
 *   3. Elements inside a `[data-firewall-ignore]` subtree are never touched.
 *
 * Usage (plain script, no modules, no dependencies):
 *   <script src="/path/to/styleFirewall.js"></script>
 *
 * Configuration (optional, set before OR after the script loads):
 *   window.__tunnelCssFirewallConfig = { enabled: true, minContrast: 3.0, autoFix: true };
 *     enabled     - false disables all scanning (default true)
 *     minContrast - minimum acceptable contrast ratio (default 3.0, WCAG AA large text)
 *     autoFix     - false = record violations only, do not touch styles (default true)
 *
 * Telemetry:
 *   window.__tunnelCssFirewall = {
 *     corrections: [ { selector, type, property, oldValue, newValue, fixed, timestamp, detail } ],
 *     sweeps: <number>, violations: <number>, ...
 *   }
 *   corrections is capped at 100 entries (oldest evicted) to avoid memory leaks.
 *
 * Manual controls (also handy in tests):
 *   window.__tunnelCssFirewallScan()   - run a sweep immediately
 *   window.__tunnelCssFirewallUtils    - pure functions (contrast math, color parsing)
 */
(function () {
  'use strict';

  var WIN = (typeof window !== 'undefined')
    ? window
    : ((typeof globalThis !== 'undefined') ? globalThis : this);
  var DOC = (WIN && WIN.document)
    ? WIN.document
    : ((typeof document !== 'undefined') ? document : null);

  /* Idempotence: a double <script> include must not double-install. */
  if (WIN.__tunnelCssFirewall && WIN.__tunnelCssFirewall.__installed) { return; }
  if (!DOC || typeof DOC.querySelectorAll !== 'function') { return; }

  /* ------------------------------------------------------------------ */
  /* Constants                                                           */
  /* ------------------------------------------------------------------ */
  var FIX_COLOR = '#1a1a1a';
  var NEAR_WHITE_THRESHOLD = 240;
  var TELEMETRY_CAP = 100;
  var DEBOUNCE_MS = 500;
  var SWEEP_INTERVAL_MS = 5000;
  var TEXT_SELECTORS = 'p, h1, h2, h3, h4, h5, h6, span, div';
  var VERSION = '1.0.0';

  /* Full CSS named-color table (CSS Color Module Level 4). */
  var NAMED_COLORS = {
    aliceblue: '#f0f8ff', antiquewhite: '#faebd7', aqua: '#00ffff',
    aquamarine: '#7fffd4', azure: '#f0ffff', beige: '#f5f5dc',
    bisque: '#ffe4c4', black: '#000000', blanchedalmond: '#ffebcd',
    blue: '#0000ff', blueviolet: '#8a2be2', brown: '#a52a2a',
    burlywood: '#deb887', cadetblue: '#5f9ea0', chartreuse: '#7fff00',
    chocolate: '#d2691e', coral: '#ff7f50', cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc', crimson: '#dc143c', cyan: '#00ffff',
    darkblue: '#00008b', darkcyan: '#008b8b', darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9', darkgreen: '#006400', darkgrey: '#a9a9a9',
    darkkhaki: '#bdb76b', darkmagenta: '#8b008b', darkolivegreen: '#556b2f',
    darkorange: '#ff8c00', darkorchid: '#9932cc', darkred: '#8b0000',
    darksalmon: '#e9967a', darkseagreen: '#8fbc8f', darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f', darkslategrey: '#2f4f4f', darkturquoise: '#00ced1',
    darkviolet: '#9400d3', deeppink: '#ff1493', deepskyblue: '#00bfff',
    dimgray: '#696969', dimgrey: '#696969', dodgerblue: '#1e90ff',
    firebrick: '#b22222', floralwhite: '#fffaf0', forestgreen: '#228b22',
    fuchsia: '#ff00ff', gainsboro: '#dcdcdc', ghostwhite: '#f8f8ff',
    gold: '#ffd700', goldenrod: '#daa520', gray: '#808080',
    green: '#008000', greenyellow: '#adff2f', grey: '#808080',
    honeydew: '#f0fff0', hotpink: '#ff69b4', indianred: '#cd5c5c',
    indigo: '#4b0082', ivory: '#fffff0', khaki: '#f0e68c',
    lavender: '#e6e6fa', lavenderblush: '#fff0f5', lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd', lightblue: '#add8e6', lightcoral: '#f08080',
    lightcyan: '#e0ffff', lightgoldenrodyellow: '#fafad2', lightgray: '#d3d3d3',
    lightgreen: '#90ee90', lightgrey: '#d3d3d3', lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a', lightseagreen: '#20b2aa', lightskyblue: '#87cefa',
    lightslategray: '#778899', lightslategrey: '#778899',
    lightsteelblue: '#b0c4de', lightyellow: '#ffffe0', lime: '#00ff00',
    limegreen: '#32cd32', linen: '#faf0e6', magenta: '#ff00ff',
    maroon: '#800000', mediumaquamarine: '#66cdaa', mediumblue: '#0000cd',
    mediumorchid: '#ba55d3', mediumpurple: '#9370db', mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee', mediumspringgreen: '#00fa9a',
    mediumturquoise: '#48d1cc', mediumvioletred: '#c71585',
    midnightblue: '#191970', mintcream: '#f5fffa', mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5', navajowhite: '#ffdead', navy: '#000080',
    oldlace: '#fdf5e6', olive: '#808000', olivedrab: '#6b8e23',
    orange: '#ffa500', orangered: '#ff4500', orchid: '#da70d6',
    palegoldenrod: '#eee8aa', palegreen: '#98fb98', paleturquoise: '#afeeee',
    palevioletred: '#db7093', papayawhip: '#ffefd5', peachpuff: '#ffdab9',
    peru: '#cd853f', pink: '#ffc0cb', plum: '#dda0dd',
    powderblue: '#b0e0e6', purple: '#800080', rebeccapurple: '#663399',
    red: '#ff0000', rosybrown: '#bc8f8f', royalblue: '#4169e1',
    saddlebrown: '#8b4513', salmon: '#fa8072', sandybrown: '#f4a460',
    seagreen: '#2e8b57', seashell: '#fff5ee', sienna: '#a0522d',
    silver: '#c0c0c0', skyblue: '#87ceeb', slateblue: '#6a5acd',
    slategray: '#708090', slategrey: '#708090', snow: '#fffafa',
    springgreen: '#00ff7f', steelblue: '#4682b4', tan: '#d2b48c',
    teal: '#008080', thistle: '#d8bfd8', tomato: '#ff6347',
    turquoise: '#40e0d0', violet: '#ee82ee', wheat: '#f5deb3',
    white: '#ffffff', whitesmoke: '#f5f5f5', yellow: '#ffff00',
    yellowgreen: '#9acd32'
  };

  /* ------------------------------------------------------------------ */
  /* State + config                                                      */
  /* ------------------------------------------------------------------ */
  var firewallState = {
    __installed: true,
    version: VERSION,
    corrections: [],
    sweeps: 0,
    violations: 0,
    observer: false,
    periodicSweep: false
  };
  WIN.__tunnelCssFirewall = firewallState;

  if (typeof WIN.__tunnelCssFirewallConfig === 'undefined') {
    WIN.__tunnelCssFirewallConfig = { enabled: true, minContrast: 3.0, autoFix: true };
  }

  function readConfig() {
    var user = WIN.__tunnelCssFirewallConfig || {};
    return {
      enabled: user.enabled !== false,
      minContrast: (typeof user.minContrast === 'number' && user.minContrast > 0)
        ? user.minContrast
        : 3.0,
      autoFix: user.autoFix !== false
    };
  }

  /* Per-element memory: { recorded: { "<type>|<property>|<oldValue>": true } }.
   * Prevents telemetry spam and re-fixing when the same violation is seen on
   * every sweep (e.g. the 5s periodic sweep, or a stubbed getComputedStyle
   * that keeps returning the pre-fix value). A genuinely new violation
   * (different oldValue) is always reported again. */
  var elState = (typeof WeakMap !== 'undefined') ? new WeakMap() : null;
  function getElState(el) {
    if (!elState) { return null; }
    var s = elState.get(el);
    if (!s) { s = { recorded: {} }; elState.set(el, s); }
    return s;
  }
  function violationKey(v) {
    return v.type + '|' + v.property + '|' + String(v.oldValue);
  }

  /* ------------------------------------------------------------------ */
  /* Pure functions (also exported for tests)                            */
  /* ------------------------------------------------------------------ */

  function parseRgbComponent(tok) {
    tok = String(tok).trim();
    if (/%$/.test(tok)) {
      var p = parseFloat(tok);
      if (isNaN(p)) { return null; }
      return Math.max(0, Math.min(255, p * 2.55));
    }
    var v = parseFloat(tok);
    if (isNaN(v)) { return null; }
    return Math.max(0, Math.min(255, v));
  }

  function parseAlpha(tok) {
    tok = String(tok).trim();
    if (/%$/.test(tok)) {
      var p = parseFloat(tok);
      if (isNaN(p)) { return null; }
      return Math.max(0, Math.min(1, p / 100));
    }
    var v = parseFloat(tok);
    if (isNaN(v)) { return null; }
    return Math.max(0, Math.min(1, v));
  }

  /**
   * Parse a CSS color string into {r, g, b, a} (r/g/b 0-255, a 0-1).
   * Handles: #rgb, #rgba, #rrggbb, #rrggbbaa, rgb()/rgba() (comma and
   * modern space syntax, incl. "/ alpha" and percentages), named colors,
   * "transparent". Returns null when unparseable (inherit, currentColor,
   * color-mix(), etc.) so callers can skip instead of guessing.
   */
  function parseColor(input) {
    if (input == null) { return null; }
    var s = String(input).trim().toLowerCase();
    if (!s) { return null; }
    if (s === 'transparent') { return { r: 0, g: 0, b: 0, a: 0 }; }
    if (Object.prototype.hasOwnProperty.call(NAMED_COLORS, s)) { s = NAMED_COLORS[s]; }

    if (s.charAt(0) === '#') {
      var hex = s.slice(1);
      if (hex.length === 3 || hex.length === 4) {
        hex = hex.split('').map(function (c) { return c + c; }).join('');
      }
      if (hex.length === 6 || hex.length === 8) {
        var r = parseInt(hex.slice(0, 2), 16);
        var g = parseInt(hex.slice(2, 4), 16);
        var b = parseInt(hex.slice(4, 6), 16);
        var a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
        if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) { return null; }
        return { r: r, g: g, b: b, a: a };
      }
      return null;
    }

    var m = /^rgba?\((.*)\)$/.exec(s);
    if (m) {
      var body = m[1];
      var alpha = 1;
      var slash = body.indexOf('/');
      if (slash !== -1) {
        alpha = parseAlpha(body.slice(slash + 1));
        body = body.slice(0, slash);
        if (alpha == null) { return null; }
      }
      var parts = body.split(',');
      if (parts.length === 1) { parts = body.trim().split(/\s+/); }
      if (parts.length === 3 || parts.length === 4) {
        var cr = parseRgbComponent(parts[0]);
        var cg = parseRgbComponent(parts[1]);
        var cb = parseRgbComponent(parts[2]);
        if (parts.length === 4) { alpha = parseAlpha(parts[3]); }
        if (cr == null || cg == null || cb == null || alpha == null) { return null; }
        return { r: cr, g: cg, b: cb, a: alpha };
      }
      return null;
    }

    return null;
  }

  /** sRGB channel (0-255) -> linear light. WCAG 2.1/2.2 gamma correction. */
  function srgbToLinear(c) {
    var s = Math.max(0, Math.min(255, c)) / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }

  /** WCAG relative luminance: L = 0.2126R + 0.7152G + 0.0722B (linear). */
  function relativeLuminance(rgb) {
    return 0.2126 * srgbToLinear(rgb.r) +
           0.7152 * srgbToLinear(rgb.g) +
           0.0722 * srgbToLinear(rgb.b);
  }

  /** WCAG contrast ratio: (L1 + 0.05) / (L2 + 0.05), always >= 1. */
  function contrastRatio(fg, bg) {
    var l1 = relativeLuminance(fg);
    var l2 = relativeLuminance(bg);
    var hi = Math.max(l1, l2);
    var lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }

  /** Alpha-composite fg over bg (both {r,g,b[,a]}), result opaque. */
  function compositeOver(fg, bg) {
    var a = (fg.a == null) ? 1 : Math.max(0, Math.min(1, fg.a));
    return {
      r: fg.r * a + bg.r * (1 - a),
      g: fg.g * a + bg.g * (1 - a),
      b: fg.b * a + bg.b * (1 - a),
      a: 1
    };
  }

  /** Near-white: every channel above threshold (default 240). */
  function isNearWhite(rgb, threshold) {
    var t = (typeof threshold === 'number') ? threshold : NEAR_WHITE_THRESHOLD;
    return rgb.r > t && rgb.g > t && rgb.b > t;
  }

  /* ------------------------------------------------------------------ */
  /* DOM helpers                                                         */
  /* ------------------------------------------------------------------ */

  /** "Selector-ish" identifier for telemetry: tag#id.class > ... (<=4 deep). */
  function describeElement(el) {
    var parts = [];
    var cur = el;
    var depth = 0;
    while (cur && cur.nodeType === 1 && depth < 4) {
      var label = ((cur.tagName || 'unknown') + '').toLowerCase();
      if (cur.id) {
        label += '#' + cur.id;
      } else if (typeof cur.className === 'string' && cur.className.trim()) {
        label += '.' + cur.className.trim().split(/\s+/)[0];
      }
      parts.unshift(label);
      cur = cur.parentNode;
      depth++;
    }
    return parts.join(' > ') || 'unknown';
  }

  function isExplicitlyHidden(el) {
    return (typeof el.hasAttribute === 'function' && el.hasAttribute('hidden')) ||
           (typeof el.getAttribute === 'function' && el.getAttribute('aria-hidden') === 'true');
  }

  /**
   * The background the text actually sits on: walk up from the element,
   * alpha-compositing each background layer, stopping at the first opaque
   * one. Falls back to white (the default canvas).
   */
  function effectiveBackground(el) {
    var acc = { r: 255, g: 255, b: 255 };
    var layers = [];
    var cur = el;
    while (cur && cur !== DOC && cur.nodeType === 1) {
      var bg = null;
      try { bg = parseColor(WIN.getComputedStyle(cur).backgroundColor); }
      catch (e) { bg = null; }
      if (bg) {
        layers.push(bg);
        if (bg.a >= 0.999) { break; }
      }
      cur = cur.parentNode;
    }
    for (var i = layers.length - 1; i >= 0; i--) {
      acc = compositeOver(layers[i], acc);
    }
    return acc;
  }

  /* ------------------------------------------------------------------ */
  /* Violation detection + correction                                    */
  /* ------------------------------------------------------------------ */

  function nowIso() {
    try { return new Date().toISOString(); }
    catch (e) { return String(Date.now()); }
  }

  function recordCorrection(el, violation, fixed) {
    var entry = {
      selector: describeElement(el),
      type: violation.type,
      property: violation.property,
      oldValue: violation.oldValue,
      newValue: violation.newValue,
      fixed: !!fixed,
      timestamp: nowIso()
    };
    if (violation.detail) { entry.detail = violation.detail; }
    var list = firewallState.corrections;
    list.push(entry);
    while (list.length > TELEMETRY_CAP) { list.shift(); }
  }

  function checkElement(el, cfg) {
    /* Never fight user intent: opt-out subtrees are fully ignored. */
    if (el.closest && el.closest('[data-firewall-ignore]')) { return; }

    var cs;
    try { cs = WIN.getComputedStyle(el); }
    catch (e) { return; }
    if (!cs || cs.display === 'none') { return; }

    /* Explicitly hidden content (hidden attr / aria-hidden) is intentional -
     * never touch it, and never "fix" its contrast either. */
    if (isExplicitlyHidden(el)) { return; }

    var fg = parseColor(cs.color);
    if (!fg) { return; }

    var bg = effectiveBackground(el);
    var opacity = parseFloat(cs.opacity);
    if (isNaN(opacity)) { opacity = 1; }

    var violation = null;

    /* Rule 3: invisible text (alpha-0 color, or opacity 0) on an element that
     * is not explicitly hidden (handled above). A zero-alpha color is almost
     * always a bug, so it is auto-fixable; a zero element opacity is often an
     * intentional animation state, so it is flagged/recorded but never
     * touched. */
    if (fg.a === 0 || opacity === 0) {
      if (fg.a === 0) {
        violation = {
          type: 'invisible-text', property: 'color',
          oldValue: cs.color, newValue: FIX_COLOR, fixable: true,
          detail: { reason: 'color alpha is 0' }
        };
      } else {
        violation = {
          type: 'invisible-text', property: 'opacity',
          oldValue: String(cs.opacity), newValue: '(flagged only - not auto-fixed)',
          fixable: false,
          detail: { reason: 'element opacity is 0 without hidden/aria-hidden' }
        };
      }
    } else {
      /* Rules 1+2: contrast of the visible (alpha-composited) text color
       * against the effective background. */
      var fgVis = compositeOver(fg, bg);
      var ratio = contrastRatio(fgVis, bg);
      if (isNearWhite(fg) && isNearWhite(bg)) {
        violation = {
          type: 'white-on-white', property: 'color',
          oldValue: cs.color, newValue: FIX_COLOR, fixable: true,
          detail: { ratio: Math.round(ratio * 100) / 100 }
        };
      } else if (ratio < cfg.minContrast) {
        violation = {
          type: 'low-contrast', property: 'color',
          oldValue: cs.color, newValue: FIX_COLOR, fixable: true,
          detail: { ratio: Math.round(ratio * 100) / 100, minContrast: cfg.minContrast }
        };
      }
    }

    if (!violation) { return; }
    firewallState.violations++;

    /* Dedupe: an identical violation on the same element is reported once.
     * (In a real browser the inline !important fix also makes the next sweep
     * pass, so this is belt-and-braces against telemetry spam.) */
    var st = getElState(el);
    var key = violationKey(violation);
    if (st && st.recorded[key]) { return; }

    var fixed = false;
    if (violation.fixable && cfg.autoFix) {
      try {
        el.style.setProperty(violation.property, violation.newValue, 'important');
        fixed = true;
      } catch (e) { fixed = false; }
    }
    recordCorrection(el, violation, fixed);
    if (st) { st.recorded[key] = true; }
  }

  /* ------------------------------------------------------------------ */
  /* Sweep, observer, boot                                               */
  /* ------------------------------------------------------------------ */

  function sweep() {
    var cfg = readConfig();
    if (!cfg.enabled) { return 0; }
    var list;
    try { list = DOC.querySelectorAll(TEXT_SELECTORS); }
    catch (e) { return 0; }
    var checked = 0;
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (!el || el.nodeType !== 1) { continue; }
      var t = el.textContent;
      if (typeof t !== 'string' || !t.replace(/\s+/g, '')) { continue; }
      try { checkElement(el, cfg); }
      catch (e) { /* one bad element must never kill the sweep */ }
      checked++;
    }
    firewallState.sweeps++;
    return checked;
  }

  var debounceTimer = 0;
  function scheduleSweep() {
    if (debounceTimer) { return; }
    debounceTimer = WIN.setTimeout(function () {
      debounceTimer = 0;
      try { sweep(); } catch (e) { /* never throw from a timer */ }
    }, DEBOUNCE_MS);
  }

  function install() {
    if (typeof WIN.MutationObserver === 'function' && DOC.documentElement) {
      try {
        var obs = new WIN.MutationObserver(function () { scheduleSweep(); });
        obs.observe(DOC.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class']
        });
        firewallState.observer = true;
      } catch (e) { firewallState.observer = false; }
    }
    try {
      WIN.setInterval(function () {
        try { sweep(); } catch (e) { /* never throw from a timer */ }
      }, SWEEP_INTERVAL_MS);
      firewallState.periodicSweep = true;
    } catch (e) { firewallState.periodicSweep = false; }

    if (DOC.readyState === 'loading' && typeof DOC.addEventListener === 'function') {
      DOC.addEventListener('DOMContentLoaded', function () { scheduleSweep(); });
    } else {
      scheduleSweep();
    }
  }

  /* Public handles (manual trigger, debugging, tests). */
  WIN.__tunnelCssFirewallScan = sweep;
  WIN.__tunnelCssFirewallUtils = {
    parseColor: parseColor,
    srgbToLinear: srgbToLinear,
    relativeLuminance: relativeLuminance,
    contrastRatio: contrastRatio,
    compositeOver: compositeOver,
    isNearWhite: isNearWhite,
    describeElement: describeElement
  };

  install();
})();
