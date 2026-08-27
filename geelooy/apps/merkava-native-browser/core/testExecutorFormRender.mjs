// B"H
import { buildMerkavaExecutorRenderStream } from './merkavaExecutorRenderStream.js';

const html = `<body>
  <form id="f">
    <label>Name</label>
    <input id="name" value="Yackov">
    <textarea id="msg">shalom</textarea>
    <select id="choice"><option>one</option><option selected>two</option></select>
    <output id="status">ready</output>
  </form>
</body>`;

const js = `
document.querySelector("#status").textContent = "changed";
document.querySelector("#name").value = "Merkava";
`;

const result = await buildMerkavaExecutorRenderStream({ html, scripts: [js] });
const stream = result.stream;
const required = ['Merkava', 'shalom', 'two', 'changed'];
for (const word of required) {
  if (!stream.includes(word)) throw new Error(`missing ${word}: ${stream}`);
}
if (stream.includes('ready')) throw new Error(`stale textContent child remained: ${stream}`);
if (stream.includes('Nameshalom')) throw new Error(`parent aggregate text leaked: ${stream}`);
if (stream.includes('|one|')) throw new Error(`unselected option leaked as paint text: ${stream}`);
console.log(JSON.stringify({ ok: true, summary: result.summary, stream }, null, 2));
