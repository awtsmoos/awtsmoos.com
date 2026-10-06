// B"H
// cssImmediateIssues — one-shot CSS health action for the Awtsmoos Tunnel.
// Point it at a live page URL and get back: conflicting/overridden styles,
// missing or unloaded stylesheets, dead CSS rules, hidden-content traps,
// overflow and text clipping, element overlaps, low-contrast text, and
// unstyled interactive elements. Runs a real headless Chrome on this Mac
// via CDP and evaluates a bounded in-page diagnostic plus matched-style
// sampling. Payload: { url, width=390, height=844 }.

const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");

const CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PROBE_TIMEOUT_MS = 90000;

// Bounded in-page diagnostic. Single IIFE, returns plain JSON.
// Covers: stylesheet load health, dead rules, page overflow, text clipping,
// hidden-content traps, element overlaps, low-contrast text.
const IN_PAGE_JS = `(() => {
  const issues = [];
  const vw = window.innerWidth;
  const R = el => el.getBoundingClientRect();
  const cs = el => getComputedStyle(el);
  const isVis = el => {
    const r = R(el); const s = cs(el);
    return r.width > 0.5 && r.height > 0.5 && s.display !== 'none' &&
      s.visibility !== 'hidden' && parseFloat(s.opacity) > 0;
  };

  // 1. stylesheets that failed to load (404 / blocked)
  document.querySelectorAll('link[rel="stylesheet"]').forEach(l => {
    if (!l.sheet) issues.push({ type: 'stylesheet-failed', severity: 'high',
      detail: 'stylesheet did not load: ' + String(l.href || '(no href)').slice(0, 140) });
  });

  // 2. dead rules (selector matches zero elements) + opaque cross-origin sheets
  let dead = 0; const deadSample = [];
  for (const sh of document.styleSheets) {
    let rules = null;
    try { rules = sh.cssRules; } catch (e) { /* cross-origin */ }
    if (!rules) {
      issues.push({ type: 'stylesheet-opaque', severity: 'info',
        detail: 'cross-origin stylesheet, rules not auditable: ' + String(sh.href || 'inline').slice(0, 120) });
      continue;
    }
    const walk = list => {
      for (const r of list) {
        if (r.selectorText) {
          let hit = true;
          try { hit = !!document.querySelector(r.selectorText); } catch (e) { hit = true; }
          if (!hit) { dead++; if (deadSample.length < 6) deadSample.push(r.selectorText.slice(0, 90)); }
        } else if (r.cssRules) { try { walk(r.cssRules); } catch (e) {} }
        if (dead > 3000) return;
      }
    };
    try { walk(rules); } catch (e) {}
    if (dead > 3000) break;
  }
  if (dead > 0) issues.push({ type: 'dead-rules', severity: 'low',
    detail: dead + ' CSS rules match zero elements', sample: deadSample });

  // 3. page-level horizontal overflow
  const de = document.documentElement;
  if (de.scrollWidth > vw + 1) issues.push({ type: 'page-overflow-x', severity: 'high',
    detail: 'document scrollWidth ' + de.scrollWidth + 'px exceeds viewport ' + vw + 'px' });

  // 3b. container-level horizontal overflow (content column wider than its box)
  let contOverflow = 0; const contOverflowSample = [];
  {
    const all = document.body ? document.body.getElementsByTagName('*') : [];
    const M = Math.min(all.length, 5000);
    for (let i = 0; i < M && contOverflow < 40; i++) {
      const el = all[i];
      if (!isVis(el)) continue;
      const tag = el.tagName;
      if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|HEAD|META|LINK|HTML|BODY)$/.test(tag)) continue;
      const csEl = cs(el);
      if (csEl.overflowX === 'visible') continue;
      if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 4 && el.scrollWidth > vw * 0.5) {
        contOverflow++;
        if (contOverflowSample.length < 6) {
          const cls0 = (el.className && el.className.split) ? String(el.className).split(' ')[0] : '';
          contOverflowSample.push(tag.toLowerCase() + (cls0 ? '.' + cls0 : '') +
            ' sw=' + el.scrollWidth + ' cw=' + el.clientWidth);
        }
      }
    }
  }
  if (contOverflow) issues.push({ type: 'container-overflow-x', severity: 'high',
    detail: contOverflow + ' containers clip overflowing content horizontally', sample: contOverflowSample });

  // 3c. HTTP / document health (C1: dead routes, error pages)
  const docTitle = (document.title || '').toLowerCase();
  const bodyText = (document.body ? document.body.innerText || '' : '').slice(0, 400).toLowerCase();
  if (/404 not found/.test(docTitle) || (bodyText.indexOf('nginx/') >= 0 && /404/.test(bodyText))) {
    issues.push({ type: 'error-page', severity: 'critical',
      detail: 'page renders an error/404 document instead of app content (title: ' +
        String(document.title).slice(0, 80) + ')' });
  }

  // 3d. app boot check (C2: JS app never booted, fallback-only)
  {
    const scripts = document.scripts ? document.scripts.length : 0;
    const hasAppRoot = !!document.querySelector(
      '[data-app-root],[data-reactroot],#root,#app,[data-geelooy-route-outlet],main');
    const fallbackOnly = /fallback|enable javascript|loading/i.test(bodyText) &&
      (document.body ? document.body.getElementsByTagName('*').length : 0) < 60;
    if (!hasAppRoot && scripts > 0) issues.push({ type: 'app-no-root', severity: 'high',
      detail: 'no app root container found (' + scripts + ' scripts present) — JS app may not have booted' });
    else if (fallbackOnly) issues.push({ type: 'fallback-only', severity: 'high',
      detail: 'page shows fallback/loading text with minimal DOM — app content never rendered' });
  }

  const els = document.body ? document.body.getElementsByTagName('*') : [];
  const N = Math.min(els.length, 5000);
  let scanned = 0;

  // 4. text clipped / truncated (ellipsis or hard clip)
  let clipped = 0; const clipSample = [];
  for (let i = 0; i < N; i++) {
    const el = els[i]; scanned++;
    if (!isVis(el)) continue;
    const t = (el.innerText || '').trim();
    if (t.length < 4 || t.length > 400) continue;
    if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 2) {
      clipped++;
      if (clipSample.length < 8) clipSample.push(el.tagName.toLowerCase() + ' "' +
        t.slice(0, 42) + '" sw=' + el.scrollWidth + ' cw=' + el.clientWidth);
    }
  }
  if (clipped) issues.push({ type: 'text-clipped', severity: 'medium',
    detail: clipped + ' visible elements truncate text (scrollWidth > clientWidth)', sample: clipSample });

  // 5. hidden-content traps (substantial text, zero rendered box)
  let hidden = 0; const hiddenSample = [];
  const neverRenders = /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|HEAD|META|LINK)$/;
  for (let i = 0; i < N; i++) {
    const el = els[i];
    if (neverRenders.test(el.tagName)) continue;
    const t = (el.textContent || '').trim();
    if (t.length < 40) continue;
    const r = R(el), s = cs(el);
    const zero = (r.width < 0.5 && r.height < 0.5) || s.display === 'none' || s.visibility === 'hidden';
    if (!zero) continue;
    let kidVis = false;
    for (const c of el.children) { const cr = R(c); if (cr.width > 0.5 && cr.height > 0.5) { kidVis = true; break; } }
    if (!kidVis) { hidden++; if (hiddenSample.length < 5) hiddenSample.push(el.tagName.toLowerCase() + ' "' + t.slice(0, 60) + '"'); }
  }
  if (hidden) issues.push({ type: 'hidden-content', severity: 'medium',
    detail: hidden + ' elements hold 40+ chars of text but render a zero box', sample: hiddenSample });

  // 6. element overlaps (bounded pairwise over visible elements)
  const visList = [];
  for (let i = 0; i < N && visList.length < 500; i++) { const el = els[i]; if (isVis(el)) visList.push(el); }
  let overlaps = 0; const overlapSample = [];
  const area = r => r.width * r.height;
  const cls = el => { try { const c = el.className; return (c && c.split) ? String(c).split(' ')[0] : ''; } catch (e) { return ''; } };
  for (let i = 0; i < visList.length && overlaps < 25; i++) {
    const a = visList[i], ra = R(a);
    if (area(ra) < 200) continue;
    for (let j = i + 1; j < visList.length && overlaps < 25; j++) {
      const b = visList[j], rb = R(b);
      if (area(rb) < 200) continue;
      const aInB = ra.left >= rb.left && ra.top >= rb.top && ra.right <= rb.right && ra.bottom <= rb.bottom;
      const bInA = rb.left >= ra.left && rb.top >= ra.top && rb.right <= ra.right && rb.bottom <= ra.bottom;
      if (aInB || bInA) continue;
      const ix = Math.max(0, Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left));
      const iy = Math.max(0, Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top));
      const inter = ix * iy, small = Math.min(area(ra), area(rb));
      if (small > 0 && inter / small > 0.35) {
        overlaps++;
        if (overlapSample.length < 6) overlapSample.push(
          a.tagName.toLowerCase() + (cls(a) ? '.' + cls(a) : '') + ' x ' +
          b.tagName.toLowerCase() + (cls(b) ? '.' + cls(b) : ''));
      }
    }
  }
  if (overlaps) issues.push({ type: 'overlap', severity: 'high',
    detail: overlaps + ' element pairs overlap >35% of the smaller box', sample: overlapSample });

  // 7. low-contrast text (sampled leaf text nodes)
  const lum = (r, g, b) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const parse = s => { const m = String(s).match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/); return m ? [+m[1], +m[2], +m[3]] : null; };
  const effBg = el => { let n = el; while (n && n !== document.documentElement) { const c = parse(cs(n).backgroundColor); if (c) return c; n = n.parentElement; } return [255, 255, 255]; };
  let lowC = 0; const lowCSample = [];
  let checked = 0;
  for (let i = 0; i < N && lowC < 80 && checked < 1200; i++) {
    const el = els[i];
    if (!isVis(el)) continue;
    const tag = el.tagName;
    const isLeaf = el.children.length === 0;
    const isCtl = /^(BUTTON|A)$/.test(tag);
    if (!isLeaf && !isCtl) continue;
    checked++;
    const t = (el.innerText || '').trim();
    if (t.length < 3 || t.length > 150) continue;
    const fg = parse(cs(el).color); if (!fg) continue;
    const bg = effBg(el);
    const L1 = lum(fg[0], fg[1], fg[2]), L2 = lum(bg[0], bg[1], bg[2]);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    if (ratio < 3.0) { lowC++; if (lowCSample.length < 6) lowCSample.push(tag.toLowerCase() + ' "' + t.slice(0, 36) + '" ratio=' + ratio.toFixed(2)); }
  }
  if (lowC) issues.push({ type: 'low-contrast', severity: 'medium',
    detail: lowC + ' sampled text nodes below 3.0 contrast', sample: lowCSample });

  return { issues, stats: { elementsScanned: scanned, viewport: { w: vw, h: window.innerHeight } } };
})()`;

// Minimal CDP client over Node's built-in WebSocket.
function cdpConnect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let seq = 0;
    const pending = new Map();
    const listeners = new Map();
    const api = {
      send(method, params) {
        return new Promise((res, rej) => {
          const id = ++seq;
          pending.set(id, { res, rej });
          ws.send(JSON.stringify({ id, method, params: params || {} }));
        });
      },
      waitFor(method, ms) {
        return new Promise((res, rej) => {
          const to = setTimeout(() => rej(new Error('cdp timeout: ' + method)), ms);
          const arr = listeners.get(method) || [];
          arr.push(p => { clearTimeout(to); res(p); });
          listeners.set(method, arr);
        });
      },
      close() { try { ws.close(); } catch (e) {} }
    };
    ws.onopen = () => resolve(api);
    ws.onerror = () => reject(new Error('cdp websocket error'));
    ws.onmessage = ev => {
      let m; try { m = JSON.parse(ev.data.toString()); } catch (e) { return; }
      if (m.id && pending.has(m.id)) {
        const { res, rej } = pending.get(m.id);
        pending.delete(m.id);
        if (m.error) rej(new Error(m.error.message || 'cdp error'));
        else res(m.result || {});
      } else if (m.method && listeners.has(m.method)) {
        const cbs = listeners.get(m.method);
        listeners.set(m.method, []);
        cbs.forEach(cb => { try { cb(m.params); } catch (e) {} });
      }
    };
  });
}

async function launchChrome(width, height) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cssgate-'));
  const args = [
    '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=0', '--user-data-dir=' + profile,
    '--window-size=' + width + ',' + height, '--hide-scrollbars', 'about:blank'
  ];
  const child = spawn(CHROME_BIN, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  try {
    const debugUrl = await new Promise((resolve, reject) => {
      const to = setTimeout(() => reject(new Error('chrome devtools timeout')), 20000);
      child.stderr.on('data', d => {
        stderr += d.toString();
        const m = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
        if (m) { clearTimeout(to); resolve(m[1]); }
      });
      child.on('exit', code => { clearTimeout(to); reject(new Error('chrome exited early: ' + stderr.slice(-300))); });
    });
    return { child, profile, debugUrl };
  } catch (e) {
    try { child.kill('SIGKILL'); } catch (x) {}
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (x) {}
    throw e;
  }
}

async function runProbe(url, width, height) {
  const { child, profile, debugUrl } = await launchChrome(width, height);
  try {
    const httpUrl = debugUrl.replace(/^ws:\/\//, 'http://').replace(/\/devtools\/browser\/.*$/, '/json/list');
    const targets = await (await fetch(httpUrl)).json();
    const page = targets.find(t => t.type === 'page') || targets[0];
    if (!page || !page.webSocketDebuggerUrl) throw new Error('no debuggable page target');
    const cdp = await cdpConnect(page.webSocketDebuggerUrl);
    try {
      await cdp.send('Page.enable');
      await cdp.send('Runtime.enable');
      await cdp.send('DOM.enable');
      await cdp.send('CSS.enable');
      const loaded = cdp.waitFor('Page.loadEventFired', 25000);
      await cdp.send('Page.navigate', { url });
      await loaded.catch(() => {});
      await new Promise(r => setTimeout(r, 3000)); // JS settle (bounded; ikar never settles)
      const ev = await cdp.send('Runtime.evaluate', { expression: IN_PAGE_JS, returnByValue: true });
      const inPage = (ev.result && ev.result.value) || { issues: [], stats: {} };

      // conflict / override / unstyled sampling via matched styles
      const doc = await cdp.send('DOM.getDocument', { depth: 0 });
      const q = await cdp.send('DOM.querySelectorAll', {
        nodeId: doc.root.nodeId,
        selector: 'button, a, input, select, textarea, h1, h2, h3, [role="button"]'
      });
      const nodeIds = (q.nodeIds || []).slice(0, 120);
      let conflicts = 0, overrides = 0, unstyled = 0;
      for (const nodeId of nodeIds) {
        try {
          const m = await cdp.send('CSS.getMatchedStylesForNode', { nodeId });
          const rules = (m.matchedCSSRules || []).filter(r => r.rule && r.rule.origin !== 'user-agent');
          if (rules.length === 0) { unstyled++; continue; }
          const seen = Object.create(null);
          for (const r of rules) {
            const props = (r.rule.style && r.rule.style.cssProperties) || [];
            for (const p of props) {
              if (!p.name || p.name.charAt(0) === '-') continue;
              seen[p.name] = (seen[p.name] || 0) + 1;
            }
          }
          let elemConflicts = 0;
          for (const k of Object.keys(seen)) {
            if (seen[k] > 1) { elemConflicts++; overrides += seen[k] - 1; }
          }
          if (elemConflicts > 0) conflicts++;
        } catch (e) { /* skip node */ }
      }

      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      const pngPath = path.join('/tmp', 'cssgate-' + Date.now() + '.png');
      fs.writeFileSync(pngPath, Buffer.from(shot.data, 'base64'));
      const bytes = fs.statSync(pngPath).size;
      const sha256 = crypto.createHash('sha256').update(fs.readFileSync(pngPath)).digest('hex');
      return {
        inPage, conflicts, overrides, unstyled,
        sampled: nodeIds.length,
        screenshot: { path: pngPath, sha256, bytes }
      };
    } finally {
      try { cdp.close(); } catch (e) {}
    }
  } finally {
    try { child.kill('SIGKILL'); } catch (e) {}
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  }
}

function buildCssHealthActions(context) {
  async function cssImmediateIssues() {
    const payload = (context && context.payload) || {};
    let params = {};
    try {
      if (typeof payload.params === 'string' && payload.params) params = JSON.parse(payload.params);
      else if (payload.params && typeof payload.params === 'object') params = payload.params;
      else if (typeof payload.params64 === 'string' && payload.params64)
        params = JSON.parse(Buffer.from(payload.params64.replace(/-/g,'+').replace(/_/g,'/'), 'base64').toString('utf8'));
    } catch (e) { /* keep {} */ }
    const merged = Object.assign({}, payload, params);
    const url = merged.url;
    if (!url) return { ok: false, error: 'cssImmediateIssues: payload.url is required' };
    const width = parseInt(merged.width, 10) || 390;
    const height = parseInt(merged.height, 10) || 844;
    const started = Date.now();
    let probe;
    try {
      probe = await runProbe(url, width, height);
    } catch (e) {
      return { ok: false, url, error: 'probe failed: ' + (e && e.message ? e.message : String(e)) };
    }
    try { fs.writeFileSync("/tmp/cssgate-r-"+Date.now()+".json", JSON.stringify({
      url, viewport:{width,height}, durationMs: Date.now()-started, inPage: probe.inPage,
      conflicts: probe.conflicts, overrides: probe.overrides, unstyled: probe.unstyled,
      sampled: probe.sampled, screenshot: probe.screenshot }).slice(0,400000)); } catch(e) {}
    const issues = (probe.inPage.issues || []).map(i => ({
      type: i.type, severity: i.severity, detail: i.detail,
      ...(i.sample ? { sample: i.sample } : {})
    }));
    if (probe.conflicts > 0) issues.push({ type: 'conflict', severity: 'medium',
      detail: probe.conflicts + ' sampled elements have 2+ author rules setting the same property' });
    if (probe.unstyled > 0) issues.push({ type: 'unstyled-interactive', severity: 'medium',
      detail: probe.unstyled + ' of ' + probe.sampled + ' sampled interactive elements match zero author rules' });
    const byType = {};
    for (const i of issues) byType[i.type] = (byType[i.type] || 0) + 1;
    return {
      ok: true,
      url,
      viewport: { width, height },
      durationMs: Date.now() - started,
      screenshot: probe.screenshot,
      summary: {
        totalIssues: issues.length,
        byType,
        conflicts: probe.conflicts,
        overrides: probe.overrides,
        unstyledInteractive: probe.unstyled,
        sampledElements: probe.sampled,
        inPageStats: probe.inPage.stats || {}
      },
      issues
    };
  }
  return { cssImmediateIssues, cssHealth: cssImmediateIssues };
}

module.exports = { buildCssHealthActions };
