// B"H
const { chromeEval } = require("../../chrome/actions.js");

/**
 * B"H
 * Chapter 612: The old chat became a feather before the new word entered.
 * This optimizer preserves the composer vessel, send buttons, scripts, styles,
 * and React handlers, while replacing far old turns with inert shells.
 */
async function optimizeDom(payload = {}) {
  const port = Number(payload.port || payload.chromePort || 9223);
  const mode = String(payload.optimizeMode || payload.domPruneMode || "sendOnly");
  const expression = optimizerScript({ mode, tail: Number(payload.keepTurns || payload.tailTurns || 3), maxPrune: Number(payload.maxPrune || 80) });
  const got = await chromeEval({ port, expression, timeoutMs: payload.optimizeTimeoutMs || 20000, maxLogs: 30, maxValueChars: 16000 });
  const value = got.result?.result?.value || got.result?.value || null;
  return { ok: !!value?.ok, action: "chatgptOptimizeDom", port, result: value };
}

function optimizerScript(options = {}) {
  return `(() => {
    const opt = ${JSON.stringify(options)};
    const cls = 'awtsmoos-tunnel-pruned-shell';
    const styleId = 'awtsmoos-tunnel-chatgpt-send-style';
    const turnSel = '[data-testid*="conversation-turn"], article:has([data-message-author-role])';
    const heavySel = 'pre, code, table, [data-testid*="tool"], [data-testid*="result"]';
    const now = () => ({ nodes: document.querySelectorAll('*').length, turns: document.querySelectorAll('[data-testid*="conversation-turn"]').length, shells: document.querySelectorAll('.' + cls).length, pre: document.querySelectorAll('pre').length, code: document.querySelectorAll('code').length, buttons: document.querySelectorAll('button').length, heapBytes: performance.memory ? performance.memory.usedJSHeapSize : null });
    const visible = el => { if (!el) return false; const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 4 && r.height > 4 && s.display !== 'none' && s.visibility !== 'hidden'; };
    const composer = () => ['#prompt-textarea','textarea','[contenteditable="true"]','[role="textbox"]'].flatMap(s => [...document.querySelectorAll(s)]).find(visible);
    const keep = el => {
      const box = composer();
      if (!el || el.closest?.('.' + cls)) return true;
      if (box && (el === box || el.contains(box) || box.contains(el))) return true;
      if (el.closest?.('form,[data-type="unified-composer"],textarea,[contenteditable="true"],[role="textbox"]')) return true;
      if (/^(SCRIPT|STYLE|LINK|META|HEAD|HTML|BODY)$/.test(el.tagName || '')) return true;
      return false;
    };
    const installCss = () => {
      if (document.getElementById(styleId)) return false;
      const st = document.createElement('style'); st.id = styleId;
      st.textContent = '[data-testid*="conversation-turn"],article:has([data-message-author-role]){content-visibility:auto!important;contain-intrinsic-size:1px 360px!important;contain:layout paint style!important}.awtsmoos-tunnel-pruned-shell{contain:size layout paint style!important;content-visibility:hidden!important;overflow:hidden!important;pointer-events:none!important;user-select:none!important}';
      document.documentElement.appendChild(st); return true;
    };
    const label = (el, i, total) => (el.querySelector?.('[data-message-author-role]')?.getAttribute('data-message-author-role') || el.tagName || 'node') + ' ' + (i + 1) + '/' + total;
    const shellFor = (el, kind, text, i, total) => { const r = el.getBoundingClientRect(); const sh = document.createElement('section'); sh.className = cls; sh.dataset.kind = kind; sh.dataset.label = label(el, i, total); sh.style.cssText = 'height:' + Math.max(24, Math.min(Math.round(r.height || 80), 180)) + 'px;margin:2px 0;padding:0;border:0;'; sh.setAttribute('aria-hidden','true'); sh.title = 'B\\"H pruned ' + kind + ' · ' + text.length + ' chars'; return sh; };
    const pruneList = (nodes, kind, tail, max) => { let cut = 0; const total = nodes.length; for (let i = 0; i < total && cut < max; i++) { const el = nodes[i]; if (i >= total - tail || keep(el)) continue; const text = el.innerText || el.textContent || ''; if (kind === 'block' && text.length < 500 && el.querySelectorAll('*').length < 30) continue; el.replaceWith(shellFor(el, kind, text, i, total)); cut++; } return cut; };
    installCss();
    const before = now();
    const box = composer();
    if (box) { let x = box; while (x && x !== document.documentElement) { x.setAttribute('data-awtsmoos-cgpt-preserve', 'true'); x = x.parentElement; } }
    const turns = [...new Set([...document.querySelectorAll(turnSel)])].filter(visible);
    const tail = Math.max(1, Math.min(Number(opt.tail || 3), 20));
    const max = Math.max(1, Math.min(Number(opt.maxPrune || 80), 300));
    const turnPruned = pruneList(turns, 'turn', tail, max);
    const blockPruned = opt.mode === 'off' ? 0 : pruneList([...document.querySelectorAll(heavySel)].filter(visible), 'block', 1, Math.max(0, max - turnPruned));
    const after = now();
    return { ok: true, mode: opt.mode, composerFound: !!box, before, after, pruned: { turns: turnPruned, blocks: blockPruned }, reducedNodes: before.nodes - after.nodes };
  })()`;
}

module.exports = { optimizeDom, optimizerScript };
