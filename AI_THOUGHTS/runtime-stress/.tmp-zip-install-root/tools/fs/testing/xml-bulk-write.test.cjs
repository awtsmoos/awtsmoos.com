// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { parseXmlWritesFromText, HEBREW_START, HEBREW_END } = require("../xmlWrites.js");
const { buildActions } = require("../actions.js");

/**
 * B"H
 * Chapter 393: XML entered the write gate without breaking its teeth.
 * The AI may write CDATA, vibe Hebrew markers, or explicit placeholders. Every
 * road must arrive as the same guarded full-file write.
 */
const root = process.cwd();
const tmp = path.join("AI_THOUGHTS", "runtime-stress", ".tmp-xml-bulk-write");
const config = { root, allowWrite: true, allowSecrets: false, tools: { fsRead: true, fsWrite: true, fsBulk: true } };

function actions(payload) { return buildActions(config, payload, null); }
async function run(payload) { return await actions(payload)[payload.action](); }
function target(name) { return path.join(tmp, name).replace(/\\/g, "/"); }

function parseCases() {
  const cdata = `<writes><fileWrite path="${target("cdata.js")}"><content><![CDATA[const x = "<tag>";\n]]></content></fileWrite></writes>`;
  const vibe = `<change><file>${target("vibe.js")}</file><operation>write</operation><content>${HEBREW_START}\nconst y = "שלום";\n${HEBREW_END}</content></change>`;
  const placeholder = `<fileWrite path="${target("placeholder.js")}"><content>{{AWTSMOOS_CDATA_START}}\nconst z = "placeholder";\n{{AWTSMOOS_CDATA_END}}</content></fileWrite>`;
  const escaped = `<fileWrite path="${target("escaped.js")}"><content>&lt;div&gt;escaped &amp; safe&lt;/div&gt;</content></fileWrite>`;
  const parsed = [...parseXmlWritesFromText(cdata), ...parseXmlWritesFromText(vibe), ...parseXmlWritesFromText(placeholder), ...parseXmlWritesFromText(escaped)];
  assert.equal(parsed.length, 4);
  assert.ok(parsed[0].content.includes('<tag>'));
  assert.ok(parsed[1].content.includes('שלום'));
  assert.ok(parsed[2].content.includes('placeholder'));
  assert.equal(parsed[3].content, '<div>escaped & safe</div>');
  return parsed;
}

async function bulkWriteXml() {
  fs.rmSync(tmp, { recursive: true, force: true });
  const xml = `<awtsmoosWrites>
    <fileWrite path="${target("a.txt")}"><content>{{AWTSMOOS_CDATA_START}}A < B & C{{AWTSMOOS_CDATA_END}}</content></fileWrite>
    <change><file>${target("b.txt")}</file><operation>write</operation><content>${HEBREW_START}B שלום${HEBREW_END}</content></change>
  </awtsmoosWrites>`;
  const result = await run({ action: "write", mode: "bulk", xml });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(fs.readFileSync(target("a.txt"), "utf8"), "A < B & C");
  assert.equal(fs.readFileSync(target("b.txt"), "utf8"), "B שלום");
  return result;
}

(async () => {
  const parsed = parseCases();
  const wrote = await bulkWriteXml();
  console.log(JSON.stringify({ ok: true, parsed: parsed.length, wrote: { ok: wrote.ok, count: wrote.count, okCount: wrote.okCount } }, null, 2));
  process.exit(0);
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
