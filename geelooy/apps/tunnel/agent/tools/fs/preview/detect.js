// B"H
const Probe = require('./httpProbe.js');
const COMMON = [3000,3001,3002,4173,5173,5174,8000,8080,8787,4321,5000,5001,5175,9000];
function ports(payload = {}) {
  const raw = payload.ports || payload.portList || process.env.AWTSMOOS_PREVIEW_PORTS || '';
  const list = Array.isArray(raw) ? raw : String(raw).split(/[,\s]+/);
  const picked = list.map(Number).filter(n => Number.isInteger(n) && n > 0);
  return [...new Set([...(payload.port ? [Number(payload.port)] : []), ...picked, ...COMMON])];
}
async function detect(payload = {}) {
  const path = payload.proxyPath || payload.path || '/';
  const results = await Promise.all(ports(payload).map(async port => probe(port, path, payload.timeoutMs)));
  return results.filter(x => x.reachable).sort((a,b) => score(b) - score(a));
}
async function probe(port, path, timeoutMs) {
  const url = `http://127.0.0.1:${port}${String(path).startsWith('/') ? path : '/' + path}`;
  const r = await Probe.request(url, Math.min(Number(timeoutMs || 700), 3000));
  return { port, url, reachable:r.ok, statusCode:r.statusCode || null, title:r.title || '', server:r.headers?.server || '', error:r.error || '' };
}
function score(s) { return (s.statusCode === 200 ? 50 : 0) + (s.title ? 10 : 0) - (s.statusCode >= 500 ? 20 : 0); }
module.exports = { COMMON, ports, detect, probe };
