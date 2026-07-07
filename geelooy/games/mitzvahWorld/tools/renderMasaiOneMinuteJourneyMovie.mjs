// B"H
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { findBrowser } from '../tests/chrome/ChromePath.js';
import { connectCdp } from '../tests/chrome/ChromeDevTools.js';
const seconds = 60, fps = 30, frames = seconds * fps;
const out = '/Users/awtsmoos/Movies/mitzvahWorld/awtsmoos-full-suite-chai-forest-mitzvah-world.mp4';
const proof = 'ai_thoughts/latest-awtsmoos-full-suite-chai-forest-proof', frameDir = `${proof}/frames`;
mkdirSync(frameDir, { recursive: true }); rmSync(frameDir, { recursive: true, force: true }); mkdirSync(frameDir, { recursive: true }); mkdirSync('/Users/awtsmoos/Movies/mitzvahWorld', { recursive: true });
const port = 9867, staticPort = 8080, page = 'awtsmoosFullOneMinuteMitzvahWorldMovie.html';
const root = '/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com';
const url = `http://127.0.0.1:${staticPort}/games/mitzvahWorld/tools/${page}?render=${Date.now()}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function json(u, opts) { const r = await fetch(u, opts); if (!r.ok) throw new Error(`${r.status} ${u}`); return r.json(); }
async function ev(c, e, t = 30000) { const r = await c.send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }, t); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'eval failed'); return r.result?.value; }
const chromePath = findBrowser().path; if (!chromePath) throw new Error('Chrome not found');
const profile = join(tmpdir(), 'awts-full-minute-' + Date.now());
const server = spawn('python3', ['-m', 'http.server', String(staticPort), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
const chrome = spawn(chromePath, [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--window-size=1280,720', 'about:blank'], { stdio: 'ignore', detached: true });
try {
  for (let i = 0; i < 80; i++) { try { const r = await fetch(url); if (r.ok) break; } catch {} await sleep(200); }
  for (let i = 0; i < 100; i++) { try { await json(`http://127.0.0.1:${port}/json/version`); break; } catch { await sleep(200); } }
  const target = await json(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  const client = await connectCdp(target.webSocketDebuggerUrl); await client.send('Runtime.enable'); await client.send('Page.enable'); await client.send('Page.navigate', { url });
  let report = null; for (let i = 0; i < 180; i++) { report = await ev(client, 'window.__MASAI_ONE_MINUTE_REPORT__||null').catch(() => null); if (report?.ok) break; const err = await ev(client, 'window.__MASAI_MOVIE_ERROR__||null').catch(() => null); if (err) throw new Error(err); await sleep(500); }
  if (!report?.ok) throw new Error('movie page did not become ready');
  const samples = [];
  for (let i = 0; i < frames; i++) { await ev(client, `window.__AWTS_CAPTURE_TIME__=${(i / fps).toFixed(6)}`).catch(() => null); await sleep(1000 / fps); if (i % fps === 0) { const r = await ev(client, 'window.__MASAI_ONE_MINUTE_REPORT__||null').catch(() => null); if (r) samples.push(r); } const png = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, 15000); writeFileSync(`${frameDir}/frame_${String(i).padStart(5, '0')}.png`, Buffer.from(png.data, 'base64')); }
  const ptsFilter = 'fps=30,scale=1280:720:flags=lanczos,format=yuv420p,setpts=N/(30*TB)';
  const ffArgs = ['-y', '-framerate', String(fps), '-i', `${frameDir}/frame_%05d.png`, '-vf', ptsFilter, '-r', String(fps), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out];
  const ff = spawnSync('ffmpeg', ffArgs, { encoding: 'utf8' }); if (ff.status !== 0) throw new Error(ff.stderr);
  const fp = spawnSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-count_frames', '-print_format', 'json', out], { encoding: 'utf8' }); if (fp.status !== 0) throw new Error(fp.stderr);
  const final = { ok: true, output: resolve(out), outsideRepo: !resolve(out).includes('/Documents/awtsmoos/git/'), seconds, fps, frames, page, ffmpegArgs: ffArgs, fullSuite:true, samples, regions: [...new Set(samples.map(s => s.region))], clips: [...new Set(samples.map(s => s.clip).filter(Boolean))], trees: report.trees, cliffs: report.cliffs, staticAssetBase: report.staticAssetBase, fullResolutionTextures: report.fullResolutionTextures, grassMeshSuite: report.grassMeshSuite, fancyTreeSuite: report.fancyTreeSuite, ffprobe: JSON.parse(fp.stdout) };
  writeFileSync(`${proof}/final-report.json`, JSON.stringify(final, null, 2)); spawnSync('open', [out]); console.log(JSON.stringify(final, null, 2)); client.close?.();
} finally { try { process.kill(-chrome.pid); } catch { try { chrome.kill(); } catch {} } try { server.kill(); } catch {} }
