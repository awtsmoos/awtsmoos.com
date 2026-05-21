// B"H
const assert = require("assert");
const { RuntimeAssembler } = require("../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAssembler.js");

async function run(files, entry = "app.js") {
  const assembler = new RuntimeAssembler({ runtime: "browser", files, entry });
  return await assembler.run(entry);
}

function errorText(result) {
  return [
    result?.result?.error?.message,
    result?.result?.error,
    result?.result?.name,
    result?.result?.message,
    result?.error,
    result?.message
  ].filter(Boolean).join(" ");
}

async function main() {
  const syntax = await run({ "app.js": "function broken( {" });
  assert.equal(syntax.ok, false);
  assert(/Unexpected|missing|token|Syntax/i.test(errorText(syntax)));

  const duplicate = await run({ "app.js": "let x = 1; let x = 2;" });
  assert.equal(duplicate.ok, false);
  assert(/already|declared|Identifier|Syntax/i.test(errorText(duplicate)));

  const good = await run({ "app.js": "window.answer = 42;" });
  assert.equal(good.ok, true);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
