// B"H
import { buildMerkavaExecutorRenderStream } from './merkavaExecutorRenderStream.js';

const html = `<body>
<style>
  section.card > h1.title { width: 180px; height: 28px; background-color: #112233; color: #eeeeee; }
  section.card .note[data-kind=primary] { width: 210px; height: 26px; background-color: #445566; color: #ffffff; }
  h2 + p.adjacent { width: 190px; height: 24px; background-color: #778899; color: #000000; }
  input:checked { background-color: #00aa00; }
  input:disabled { color: #999999; }
</style>
<section id="root" class="card">
  <h1 class="title">Crown</h1>
  <p class="note" data-kind="primary">Nested rule</p>
  <h2>Bridge</h2><p class="adjacent">Next sibling</p>
  <input id="ok" checked value="yes">
  <input id="off" disabled value="no">
</section>
</body>`;

const result = await buildMerkavaExecutorRenderStream({ html, scripts: [] });
const stream = result.stream;
const required = ['#112233', '#445566', '#778899', '#00aa00', '#999999', 'Crown', 'Nested rule', 'Next sibling', 'yes', 'no'];
for (const item of required) if (!stream.includes(item)) throw new Error(`missing ${item}: ${stream}`);
console.log(JSON.stringify({ ok: true, summary: result.summary, stream }, null, 2));
