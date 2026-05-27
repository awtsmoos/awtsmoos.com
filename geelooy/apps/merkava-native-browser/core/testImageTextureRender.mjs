// B"H
import { buildMerkavaExecutorRenderStream } from './merkavaExecutorRenderStream.js';

const html = `<body>
<style>
  .hero { width: 320px; height: 180px; background-image: url("data:image/png;base64,AAAA"); }
  img.logo { width: 120px; height: 80px; object-fit: cover; }
</style>
<section class="hero"><img class="logo" src="data:image/png;base64,BBBB" alt="awtsmoos"></section>
</body>`;

const result = await buildMerkavaExecutorRenderStream({ html, scripts: [] });
const stream = result.stream;
for (const needle of ['BGIMAGE|', 'IMAGE|', 'data:image/png;base64,AAAA', 'data:image/png;base64,BBBB']) {
  if (!stream.includes(needle)) throw new Error(`missing ${needle}\n${stream}`);
}
console.log(JSON.stringify({ ok: true, stream, summary: result.summary }, null, 2));
