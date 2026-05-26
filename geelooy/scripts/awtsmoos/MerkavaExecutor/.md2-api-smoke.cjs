// B"H
const api = require('./merkava-binary');

(async () => {
  const files = {
    'index.html': '<main id="out"></main><script>const msg="BH MD2"; out.textContent=msg;</script>'
  };
  const app = await api.compileAndRunMd2App({ files, entry: 'index.html' });
  const js = await api.compileAndRunMd2Js('let x = 40 + 2; x;');
  const inspected = api.inspectMd2(app.bytecode);

  console.log(JSON.stringify({
    appOk: app.ok,
    appMagic: app.magic,
    appBytes: app.bytecode.length,
    appRunOk: app.run && app.run.ok,
    inspectedKind: inspected.kind,
    jsOk: js.ok,
    jsMagic: js.magic,
    jsBytes: js.bytecode.length,
    jsResult: js.run
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
