#!/usr/bin/env node
/**
 * B"H
 * Guards the active browser entry and stylesheet contract. Cache-busted URLs are
 * required because mobile Chrome kept stale collider/lava modules alive.
 */
import fs from 'node:fs';
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('main.css', 'utf8');
const stamp = 'final-colliders-all-lava-rewritten-20260609-bh573';
const bootScriptRefs = [...html.matchAll(/<script[^>]+src="\.\/index\.js(?:\?[^\"]+)?"/g)].length;
const cssRefs = [...html.matchAll(/href="\.\/main\.css(?:\?[^\"]+)?"/g)].length;
const bodyRules = [...css.matchAll(/(^|\n)body\s*\{/g)].length;
const checks = { bootScriptRefs, cssRefs, bodyRules, hasCacheBust: html.includes(stamp), hasCanvasShell: css.includes('#ikar,\n#container'), hasMobileGuard: css.includes('touch-action: none'), noStyleTodos: !/TODO|FIXME|HACK/.test(css) };
const ok = bootScriptRefs === 1 && cssRefs === 1 && bodyRules === 1 && checks.hasCacheBust && checks.hasCanvasShell && checks.hasMobileGuard && checks.noStyleTodos;
console.log(JSON.stringify({ ok, checks }, null, 2));
if (!ok) process.exit(1);
