// B"H
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB/index.js');
const { createApiKey } = require('../../geelooy/API/social/helper/apiKeys.js');
const repoRoot = process.cwd();
const dbRoot = path.resolve(repoRoot, '../../dayuhChadash');
const suffix = Date.now().toString(36);
const heichelId = `probeHeichel_${suffix}`;
const aliasId = `probeAlias_${suffix}`;
const postId = `probePost_${suffix}`;
const userId = `probeUser_${suffix}`;
const wait = ms => new Promise(r => setTimeout(r, ms));
async function req(route, { method='GET', body, apiKey }={}) {
  const routeWithKey = apiKey && method === 'GET' ? `${route}${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}` : route;
  const finalBody = apiKey && body ? { apiKey, ...body } : body;
  const response = await fetch(`http://127.0.0.1:8080${routeWithKey}`, { method, headers: { ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}), ...(finalBody ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) }, body: finalBody ? new URLSearchParams(finalBody).toString() : undefined });
  const text = await response.text();
  let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: response.status, json, text };
}
async function main() {
  const db = new DosDB(dbRoot); await db.init();
  const made = await createApiKey({ $i: { db, request: { user: { info: { userId } }, headers: {} }, $_POST: { label: 'probe' } }, userid: userId });
  const apiKey = made.success.key;
  await db.write(`/social/heichelos/${heichelId}/info`, { name: heichelId, author: aliasId });
  await db.write(`/social/heichelos/${heichelId}/editors`, [aliasId]);
  const server = spawn('node', ['index'], { cwd: repoRoot, stdio: 'ignore', env: { ...process.env, AWTSMOOS_SKIP_COMMENT_VECTORS: '1' } });
  try {
    for (let i=0;i<40;i++){ try { const r=await req('/api/social/keys/verify?apiKey=probe'); if(r.status===200||r.status===404) break; } catch{} await wait(250); }
    console.log('alias', await req('/api/social/aliases', { method:'POST', apiKey, body:{ aliasName:'Probe', inputId:aliasId }}));
    const sections = JSON.stringify([{ id:'v1', verseSection:'verse-1', segments:[{id:'s1'},{id:'s2'}] },{ id:'v2', verseSection:'verse-2', segments:[] },{ id:'v3', verseSection:'verse-3', segments:[] }]);
    console.log('createPost', await req(`/api/social/content/heichelos/${heichelId}/posts`, { method:'POST', apiKey, body:{ aliasId, postId, title:'Probe', content:'Body', seriesId:'root', sections }}));
    console.log('sections', await req(`/api/social/content/heichelos/${heichelId}/posts/${postId}/sections`, { apiKey }));
  } finally { server.kill('SIGTERM'); }
}
main().catch(e => { console.error(e); process.exit(1); });




