// B"H
import { buildMerkavaExecutorRenderStream } from './merkavaExecutorRenderStream.js';

const html = `<body>
<style>
  body { --pad: 12px; --main: hsl(210 100% 40%); }
  .wrap { display:flex; gap:8px; padding:var(--pad); margin:4px; width:clamp(220px, 260px, 300px); background-color:var(--main); color:white; }
  .a { width:min(80px, 120px); height:max(30px, 22px); background-image:linear-gradient(90deg, red, blue); }
  .b { width:70px; height:30px; background-color:rgba(255, 0, 0, 0.5); color:currentColor; }
</style>
<div class="wrap"><div class="a">A</div><div class="b">B</div></div>
</body>`;

const result = await buildMerkavaExecutorRenderStream({ html, scripts: [] });
const stream = result.stream;
for (const needle of ['#0066cc', 'GRADIENT|', 'linear-gradient', '80.00', '70.00', 'A', 'B']) {
  if (!stream.includes(needle)) throw new Error(`missing ${needle}\n${stream}`);
}
console.log(JSON.stringify({ ok: true, stream, summary: result.summary }, null, 2));
