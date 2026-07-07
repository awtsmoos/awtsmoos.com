import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const html = readFileSync(join(root, 'geelooy/index.html'), 'utf8');
const boot = readFileSync(join(root, 'geelooy/scripts/awtsmoos/social/home/dashboard/boot.js'), 'utf8');
const safe = readFileSync(join(root, 'geelooy/scripts/awtsmoos/social/home/dashboard/feedSafeLoader.js'), 'utf8');
if (/type="module"[^>]+liveFeed\.js/.test(html)) throw new Error('home has hard liveFeed module script import');
if (!boot.includes('loadFeedSafely')) throw new Error('boot does not use safe feed loader');
for (const token of ['isStaticPreviewHost', 'static-preview-skipped', "port === '8799'", "import('../liveFeed.js').catch"]) {
  if (!safe.includes(token)) throw new Error(`safe loader missing ${token}`);
}
console.log('homeNoHardLiveFeedImport: ok');
