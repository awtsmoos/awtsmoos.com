import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = path => readFileSync(join(root, path), 'utf8');
const manifest = read('geelooy/style/social/home/index.css');
const future = [
  'tokens.css','background.css','borders.css','grids.css','cards.css','hero.css','search.css','feed.css','dock.css','motion.css','mobile.css'
].map(file => read(`geelooy/style/social/home/future/${file}`)).join('\n');
if (!manifest.includes('./future/index.css')) throw new Error('future layer missing from manifest');
for (const token of ['linear-gradient', 'radial-gradient', 'translate3d', 'will-change: transform', 'grid-template-columns']) {
  if (!future.includes(token)) throw new Error(`future performance layer missing ${token}`);
}
if (/filter:\s*blur|backdrop-filter/.test(future)) throw new Error('future layer uses expensive blur filters');
console.log('homeFuturePerformance: ok');
