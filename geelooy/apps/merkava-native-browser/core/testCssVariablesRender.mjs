// B"H
import { buildMerkavaExecutorRenderStream } from './merkavaExecutorRenderStream.js';

const html = `<body>
<style>
  body { --awts-blue: #123abc; --awts-size: 144px; }
  .card { width: var(--awts-size); height: 44px; background-color: var(--awts-blue); color: currentColor; }
  .fallback { width: 88px; height: 33px; background-color: var(--missing, #fedcba); }
</style>
<div class="card">Variable light</div>
<div class="fallback">Fallback light</div>
</body>`;

const result = await buildMerkavaExecutorRenderStream({ html, scripts: [] });
const stream = result.stream;
for (const needle of ['#123abc', '#fedcba', 'Variable light', 'Fallback light']) {
  if (!stream.includes(needle)) throw new Error(`missing ${needle}\n${stream}`);
}
console.log(JSON.stringify({ ok: true, stream, summary: result.summary }, null, 2));
