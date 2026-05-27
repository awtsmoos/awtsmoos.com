// B"H
import { buildMerkavaExecutorRenderStream } from './merkavaExecutorRenderStream.js';

const html = `<body>
<style>
  .card { width:160px; height:90px; overflow:hidden; border-radius:18px; opacity:.55; transform:translate(12px, 8px); background:#224466; color:white; }
  .inner { width:220px; height:50px; background:linear-gradient(90deg, red, blue); }
</style>
<div class="card"><div class="inner">secret overflow</div></div>
</body>`;

const result = await buildMerkavaExecutorRenderStream({ html, scripts: [] });
const stream = result.stream;
for (const needle of ['CLIP_PUSH|', 'CLIP_POP|', 'RADIUS|', 'OPACITY|', 'TRANSFORM|', 'GRADIENT|', 'secret overflow']) {
  if (!stream.includes(needle)) throw new Error(`missing ${needle}\n${stream}`);
}
const push = stream.indexOf('CLIP_PUSH|');
const pop = stream.indexOf('CLIP_POP|');
if (!(push >= 0 && pop > push)) throw new Error(`clip order wrong\n${stream}`);
console.log(JSON.stringify({ ok: true, stream, summary: result.summary }, null, 2));
