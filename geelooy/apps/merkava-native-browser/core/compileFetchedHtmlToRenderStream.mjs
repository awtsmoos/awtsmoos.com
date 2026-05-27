// B"H
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { fileURLToPath, pathToFileURL } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const streamModulePath = path.basename(here).toLowerCase() === 'dist'
  ? path.join(here, '..', 'core', 'merkavaExecutorRenderStream.js')
  : path.join(here, 'merkavaExecutorRenderStream.js');
const { buildMerkavaExecutorRenderStream } = await import(pathToFileURL(streamModulePath).href);

const [, , htmlPath, url = 'https://awtsmoos.com'] = process.argv;
if (!htmlPath) {
  console.error('missing htmlPath');
  process.exit(64);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const cssAssets = await collectCssAssets(html, url);
const scriptAssets = await collectScriptAssets(html, url);
const cssTag = cssAssets.css ? `<style data-awts-live-css="true">${cssAssets.css}</style>` : '';
const htmlWithCss = injectCssIntoHtml(html, cssTag);
const result = await buildMerkavaExecutorRenderStream({ html: htmlWithCss, scripts: scriptAssets.scripts, url });

process.stdout.write('AWTS_EXECUTOR_RENDER_STREAM_BEGIN\n');
process.stdout.write(result.stream || '');
process.stdout.write('\nAWTS_EXECUTOR_RENDER_STREAM_END\n');
process.stdout.write(JSON.stringify({
  ok: true,
  dom: 'executor-owned',
  cHost: 'native-bindings-only',
  commandCount: result.summary.commandCount,
  streamBytes: result.summary.streamBytes,
  cssLinks: cssAssets.links.length,
  cssBytes: Buffer.byteLength(cssAssets.css, 'utf8'),
  scriptLinks: scriptAssets.links.length,
  scriptBytes: scriptAssets.scripts.reduce((sum, script) => sum + Buffer.byteLength(script, 'utf8'), 0),
  scriptErrors: result.summary.scriptErrors.length,
  url
}) + '\n');

function injectCssIntoHtml(source, cssTag) {
  if (!cssTag) return source;
  if (/<\/head>/i.test(source)) return source.replace(/<\/head>/i, cssTag + '</head>');
  if (/<body[^>]*>/i.test(source)) return source.replace(/<body[^>]*>/i, m => m + cssTag);
  return cssTag + source;
}

async function collectCssAssets(source, baseUrl) {
  const links = [];
  const inline = [];
  for (const m of source.matchAll(/<link\b([^>]*)>/gi)) {
    const attrs = attrsOf(m[1]);
    const rel = String(attrs.rel || '').toLowerCase();
    if (!rel.includes('stylesheet') || !attrs.href) continue;
    links.push(new URL(attrs.href, baseUrl).href);
  }
  for (const m of source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) inline.push(m[1] || '');
  const fetched = [];
  for (const href of links.slice(0, 12)) {
    try { fetched.push(`/* ${href} */\n` + await fetchText(href)); }
    catch (err) { fetched.push(`/* failed ${href}: ${err.message} */`); }
  }
  return { links, css: [...fetched, ...inline].join('\n') };
}

async function collectScriptAssets(source, baseUrl) {
  const links = [];
  const inline = [];
  for (const m of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = attrsOf(m[1]);
    if (attrs.src) links.push(new URL(attrs.src, baseUrl).href);
    else if ((m[2] || '').trim()) inline.push(m[2]);
  }
  const fetched = [];
  for (const href of links.slice(0, 12)) {
    try { fetched.push(`/* ${href} */\n` + await fetchText(href)); }
    catch (err) { fetched.push(`/* failed ${href}: ${err.message} */`); }
  }
  return { links, scripts: [...fetched, ...inline] };
}

function attrsOf(text) {
  const attrs = {};
  for (const m of String(text || '').matchAll(/([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  return attrs;
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.get(url, { timeout: 5000 }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) return resolve(fetchText(new URL(res.headers.location, url).href));
      if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error('HTTP ' + res.statusCode));
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { if (data.length < 250000) data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });
}
