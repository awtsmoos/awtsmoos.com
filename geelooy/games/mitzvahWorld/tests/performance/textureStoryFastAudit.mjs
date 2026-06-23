// B"H
/** Audit ping-pong texture law and event-driven story runtime wiring. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('../..', import.meta.url).pathname);
const modules = [
  'systems/performance/PingPongTexturePolicy.js',
  'systems/performance/MaterialTextureGovernor.js',
  'systems/story/LivingStoryPolicy.js',
  'systems/story/StoryMemoryRuntime.js',
  'systems/story/StoryThreadRuntime.js',
  'systems/story/StoryBootstrap.js'
];
function assert(ok, msg) { if (!ok) throw new Error(msg); }
for (const file of modules) {
  const text = await readFile(path.join(root, file), 'utf8');
  assert(/B\"H|B'H/.test(text), `${file} missing B'H marker`);
  const mod = await import(path.join(root, file));
  assert(Object.keys(mod).length > 0, `${file} has no exports`);
}
const ping = await import(path.join(root, 'systems/performance/PingPongTexturePolicy.js'));
const law = ping.pingPongTexturePolicy({ name:'terrain ground material' }, 'map', { tier:'high' });
assert(law.wrapping === 'MirroredRepeatWrapping', 'texture law must prefer mirrored ping-pong wrapping');
assert(law.generateMipmaps === true, 'texture law must generate mipmaps');
assert(law.minFilter === 'LinearMipmapLinearFilter', 'texture law must avoid pixelated min filter');
assert(law.magFilter === 'LinearFilter', 'texture law must avoid pixelated mag filter');
const index = await readFile(path.join(root, 'index.html'), 'utf8');
assert(index.includes('StoryBootstrap.js'), 'index missing StoryBootstrap');
const pkg = await readFile(path.join(root, 'package.json'), 'utf8');
assert(pkg.includes('test:texture-story-fast'), 'package missing test:texture-story-fast');
console.log(JSON.stringify({ ok:true, modules:modules.length, law }, null, 2));
