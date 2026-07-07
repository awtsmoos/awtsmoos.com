// B"H
const { chromeEval } = require('../..//chrome/actions.js');
const C = require('./constants.js');

/**
 * B"H
 * Chapter 1975: The hour-loop uses its own tiny eye.
 * This probe is deliberately short, direct, and shape-tolerant so a stuck
 * runtime helper cannot hold continuation hostage.
 */
async function read(input = {}) {
  const port = Number(input.port || input.chromePort || 9222);
  const timeoutMs = Math.max(750, Math.min(Number(input.evalTimeoutMs || C.TICK_TIMEOUT_MS || 1200), 2000));
  const got = await deadline(chromeEval({ ...input, port, expression: script(), returnByValue: true, timeoutMs, maxLogs: 5, maxValueChars: 8000 }), timeoutMs + 500, 'hour_loop_idle_timeout').catch(error => ({ ok:false, error:error.message }));
  const value = unwrap(got);
  return value ? compact(value, port) : { ok:false, port, idle:false, busy:true, busyReason:'empty_eval', href:'', title:'', promptFound:false, assistantTextPreview:'', error:got.error || '' };
}

function script() {
  return `(() => {
    const visible = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
    const label = el => String(el?.innerText || el?.getAttribute('aria-label') || el?.getAttribute('data-testid') || '').trim();
    const active = el => visible(el) && !el.disabled && el.getAttribute('aria-disabled') !== 'true';
    const prompt = ['#prompt-textarea[contenteditable="true"]','div[contenteditable="true"][role="textbox"]','div[contenteditable="true"]','textarea[placeholder]'].map(s => document.querySelector(s)).find(visible) || null;
    const buttons = [...document.querySelectorAll('button')].filter(active);
    const stop = buttons.find(b => /^(stop|stop generating|interrupt)$/i.test(label(b)) || /^stop-button$/i.test(b.getAttribute('data-testid') || '')) || null;
    const streaming = [...document.querySelectorAll('[aria-busy="true"], [data-testid*="spinner"], [class*="result-streaming"]')].some(visible);
    const assistant = [...document.querySelectorAll('[data-message-author-role="assistant"], .markdown.prose, main article')].map(n => (n.innerText || n.textContent || '').trim()).filter(Boolean).pop() || '';
    return { ok:true, idle:!!prompt && !stop && !streaming, busy:!!stop || streaming, busyReason:stop ? 'active_stop_button' : (streaming ? 'streaming_indicator' : ''), promptFound:!!prompt, stopLabel:stop ? label(stop) : '', href:location.href, title:document.title, text:assistant, domNodes:document.querySelectorAll('*').length };
  })()`;
}

function unwrap(got = {}) {
  return got?.result?.result?.valueSummary?.value || got?.result?.valueSummary?.value || got?.result?.result?.value || got?.result?.value || got?.value || null;
}

function compact(got = {}, port = 9222) {
  return { ok: got.ok !== false, port, idle: got.idle === true, busy: got.busy === true, busyReason: got.busyReason || '', href: got.href || '', title: got.title || '', promptFound: got.promptFound === true, assistantTextPreview: short(got.text || '', 500), error: got.error || '' };
}

function deadline(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(label + ' after ' + ms + 'ms')), ms); timer.unref?.(); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
function short(text, max) { const s = String(text || ''); return s.length > max ? `${s.slice(0, max)}…` : s; }
module.exports = { read, compact, short, script, unwrap, deadline };
