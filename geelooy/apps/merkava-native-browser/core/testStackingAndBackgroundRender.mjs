// B"H
import { buildMerkavaExecutorRenderStream } from './merkavaExecutorRenderStream.js';

const html = `<body>
<style>
  .stage { position:relative; width:220px; height:130px; background:#eeeeee; }
  .low { position:absolute; left:0; top:0; width:120px; height:80px; z-index:1; background:linear-gradient(90deg, red, blue); color:white; }
  .high { position:absolute; left:20px; top:10px; width:120px; height:80px; z-index:7; background:#00aa00; color:white; }
</style>
<div class="stage"><div class="high">HIGH</div><div class="low">LOW</div></div>
</body>`;

const result = await buildMerkavaExecutorRenderStream({ html, scripts: [] });
const stream = result.stream;
for (const needle of ['GRADIENT|', 'linear-gradient', 'HIGH', 'LOW', '#00aa00']) {
  if (!stream.includes(needle)) throw new Error(`missing ${needle}\n${stream}`);
}
const high = stream.indexOf('HIGH');
const low = stream.indexOf('LOW');
if (!(low >= 0 && high > low)) throw new Error(`z-index order wrong\n${stream}`);
console.log(JSON.stringify({ ok: true, stream, summary: result.summary }, null, 2));
