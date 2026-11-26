#!/usr/bin/env node
// B"H — css-live-probe.mjs
// LIVE leg of the Awtsmoos CSS tracer: drives a real headless Chrome (CDP over
// the debugging pipe, no dependencies) against a page, collects a bounded
// computed-style dump of its elements, and classifies elements that are NOT
// properly styled with the shared core (scripts/css-gate/cssTraceCore.cjs):
// pure browser-default styling, low-contrast text (the white-on-white family),
// unstyled interactive elements, zero-size elements with content.
// Usage: node css-live-probe.mjs --url https://awtsmoos.com/social/ [--width 390] [--height 844] [--out dir] [--name x]
// Output: <name>-live.json + <name>-live.md in --out dir (default .), summary on stdout.

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Core = require('./cssTraceCore.cjs');

const args = process.argv.slice(2);
function opt(name, dflt) { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : dflt; }
const url = opt('url', '');
const width = Number(opt('width', '390'));
const height = Number(opt('height', '844'));
const outDir = opt('out', '.');
const name = opt('name', 'css-live-report');
if (!url) { console.error('Usage: --url <page> [--width W] [--height H] [--out dir] [--name x]'); process.exit(2); }

// In-page dump: bounded scan -> { elements: [...], stylesheetFiles: [...] }
const DUMP_JS = `(() => {
  const MAX_EL = 1500, MAX_SEL = 8000;
  const selectors = [];
  const files = [];
  for (const sh of document.styleSheets) {
    files.push(sh.href || '<inline style>');
    let rules = null;
    try { rules = sh.cssRules; } catch (e) { continue; }
    if (!rules) continue;
    const walk = list => {
      for (const r of list) {
        if (selectors.length >= MAX_SEL) return;
        if (r.selectorText) selectors.push(r.selectorText);
        else if (r.cssRules) { try { walk(r.cssRules); } catch (e) {} }
      }
    };
    try { walk(rules); } catch (e) {}
    if (selectors.length >= MAX_SEL) break;
  }
  const styled = el => {
    for (const sel of selectors) {
      try { if (el.matches(sel)) return true; } catch (e) {}
    }
    return false;
  };
  const effBg = el => {
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      const c = Core_parseBg(bg);
      if (c && c.a > 0) return bg;
      n = n.parentElement;
    }
    return 'rgb(255, 255, 255)';
  };
  function Core_parseBg(s) {
    const m = String(s || '').match(/rgba?\\(\\s*([\\d.]+)[,\\s]+([\\d.]+)[,\\s]+([\\d.]+)(?:[,\\s/]+([\\d.]+))?\\s*\\)/);
    if (!m) return null;
    return { a: m[4] === undefined ? 1 : Number(m[4]) };
  }
  const INTERACTIVE = new Set(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'SUMMARY']);
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'HEAD', 'META', 'LINK', 'BR', 'WBR']);
  const out = [];
  const els = document.body ? document.body.getElementsByTagName('*') : [];
  const N = Math.min(els.length, MAX_EL);
  for (let i = 0; i < N; i++) {
    const el = els[i];
    if (SKIP.has(el.tagName)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    const ownText = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').trim();
    const interactive = INTERACTIVE.has(el.tagName) || el.getAttribute('role') === 'button' || el.onclick != null;
    if (!ownText && !interactive && r.width >= 1 && r.height >= 1) continue; // only interesting elements
    out.push({
      tag: el.tagName, id: el.id || '',
      classes: (typeof el.className === 'string' ? el.className.split(/\\s+/).filter(Boolean) : []).slice(0, 5),
      text: ownText.slice(0, 80),
      color: cs.color, background: effBg(el),
      authorStyled: styled(el),
      interactive,
      width: Math.round(r.width), height: Math.round(r.height)
    });
  }
  return { elements: out, stylesheetFiles: files, title: document.title, url: location.href };
})()`;

function cdpPipe(chrome) {
	let buf = Buffer.alloc(0);
	const pending = new Map();
	let nextId = 1;
	chrome.stdio[4].on('data', chunk => {
		buf = Buffer.concat([buf, chunk]);
		let idx;
		while ((idx = buf.indexOf(0)) >= 0) {
			const raw = buf.subarray(0, idx).toString('utf8');
			buf = buf.subarray(idx + 1);
			if (!raw.trim()) continue;
			let msg; try { msg = JSON.parse(raw); } catch { continue; }
			if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
		}
	});
	return {
		send(method, params = {}, sessionId) {
			const id = nextId++;
			return new Promise((resolve, reject) => {
				pending.set(id, msg => msg.error ? reject(new Error(method + ': ' + JSON.stringify(msg.error))) : resolve(msg.result));
				chrome.stdio[3].write(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }) + '\0');
				setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(method + ' timed out')); } }, 45000);
			});
		}
	};
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
	const profile = '/tmp/css-live-probe-profile-' + process.pid;
	const chrome = spawn('google-chrome', [
		'--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
		'--remote-debugging-pipe', '--user-data-dir=' + profile,
		'--window-size=' + width + ',' + height, 'about:blank'
	], { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
	try {
		const cdp = cdpPipe(chrome);
		const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
		const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
		await cdp.send('Page.enable', {}, sessionId);
		await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 }, sessionId);
		await cdp.send('Page.navigate', { url }, sessionId);
		// Wait for the app to actually boot (SPA): poll DOM size up to ~45s.
		for (let waited = 0; waited < 45000; waited += 2000) {
			await sleep(2000);
			try {
				const probe = await cdp.send('Runtime.evaluate', { expression: "document.body ? document.body.getElementsByTagName('*').length : 0", returnByValue: true }, sessionId);
				if ((probe.result.value || 0) > 80) break;
			} catch {}
		}
		await sleep(1500);
		const res = await cdp.send('Runtime.evaluate', { expression: DUMP_JS, returnByValue: true, awaitPromise: true }, sessionId);
		if (res.exceptionDetails) throw new Error('in-page dump failed: ' + JSON.stringify(res.exceptionDetails).slice(0, 300));
		const dump = res.result.value;
		const live = Core.analyzeComputedElements(dump.elements, { page: dump.url, candidateFiles: dump.stylesheetFiles });
		const report = {
			tool: 'awtsmoos-css-trace', leg: 'live', url: dump.url, title: dump.title,
			viewport: { width, height }, elementsScanned: dump.elements.length,
			stylesheetFiles: dump.stylesheetFiles, generatedAt: new Date().toISOString(),
			unstyledElements: live
		};
		mkdirSync(outDir, { recursive: true });
		writeFileSync(join(outDir, name + '-live.json'), JSON.stringify(report, null, 1));
		const L = ['# CSS live-leg report — ' + dump.url, '',
			'Computed styles from a real Chrome (' + width + 'x' + height + '). Elements scanned (interesting subset): ' + dump.elements.length,
			'Findings: **' + live.totalFindings + '**', ''];
		for (const f of live.findings.slice(0, 60)) L.push('- `' + f.element + '` — **' + f.defect + '**: ' + f.detail + (f.text ? ' · text: "' + f.text + '"' : ''));
		writeFileSync(join(outDir, name + '-live.md'), L.join('\n') + '\n');
		console.log(JSON.stringify({ url: dump.url, elements: dump.elements.length, findings: live.totalFindings, byDefect: live.findings.reduce((a, f) => (a[f.defect] = (a[f.defect] || 0) + 1, a), {}) }, null, 1));
	} finally {
		chrome.kill('SIGKILL');
	}
}

main().catch(e => { console.error('probe failed:', e.message); process.exit(1); });
