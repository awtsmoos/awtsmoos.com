import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = join(process.cwd(), 'geelooy/style/social/home');
function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
const tooLong = walk(root).filter(path => path.endsWith('.css')).map(path => [path, readFileSync(path, 'utf8').split('\n').length]).filter(([, lines]) => lines > 120);
if (tooLong.length) throw new Error(`home CSS modules over 120 lines: ${tooLong.map(([p,l]) => `${p}:${l}`).join(', ')}`);
console.log('homeModuleSize: ok');
