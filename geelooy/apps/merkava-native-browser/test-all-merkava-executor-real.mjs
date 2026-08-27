// B"H
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));

const steps = [
  ['executor-render-stream-contract', ['node', ['core/testExecutorRenderStreamContract.mjs']]],
  ['executor-awtsmoos-css-layout', ['node', ['core/testAwtsmoosCssLayout.mjs']]],
  ['executor-real-dom-stress', ['node', ['core/testRealDomRenderStress.mjs']]],
  ['executor-shader-pipeline', ['node', ['core/testShaderPipeline.mjs']]],
  ['executor-webgl-bytecode-compiler', ['node', ['core/testWebGLBytecodeCompiler.mjs']]],
  ['native-build', ['node', ['build-seed.mjs']]],
  ['native-runtime', ['node', ['test-native-runtime.mjs']]],
  ['native-executor-host-contract', ['node', ['test-native-executor-host-contract.mjs']]],
  ['native-smoke-render-loop', ['dist/merkavaapp.exe', ['--smoke']]],
  ['native-real-http-webgl-dom', ['node', ['test-http-webgl-dom.mjs']]],
  ['native-network-renders-fetched-html', ['node', ['test-network-renders-fetched-html.mjs']]],
  ['native-webgl-opengl-render', ['node', ['test-native-webgl-opengl-render.mjs']]],
  ['embedded-merkava-stream-opengl', ['node', ['test-embedded-merkava-stream-opengl.mjs']]],
  ['network-no-raw-bytecode-render', ['node', ['test-network-no-raw-bytecode-render.mjs']]],
  ['chrome-real-webgl-dom', ['node', ['test-chrome-webgl-dom.mjs']]],
];

function runStep(name, cmd, args) {
  const stdout = execFileSync(cmd, args, { cwd: here, encoding: 'utf8', timeout: 120000 });
  const mustHave = {
    'executor-render-stream-contract': ['"ok": true', '"commandCount": 18', '"streamBytes":'],
    'executor-awtsmoos-css-layout': ['"ok": true', '"boxes": 10', '"texts":'],
    'executor-real-dom-stress': ['"ok": true', '[hydrate]', '[render]', 'Real DOM'],
    'executor-shader-pipeline': ['"ok": true', '[webgl] CREATE_SHADER', '[webgl] LINK_PROGRAM ok=true'],
    'executor-webgl-bytecode-compiler': ['"ok": true', '[webgl] DRAW_ARRAYS', '"bytes":'],
    'native-build': ['"ok": true', '"exe": "merkavaapp.exe"', '"executorBytes":'],
    'native-runtime': ['"ok": true', '"total": 16', '"failed": []'],
    'native-executor-host-contract': ['"ok": true', '"contract": "embedded-executor-host"', 'awts-host-binding[12]=network.fetch', 'awts-host-binding[29]=webgl.drawArrays'],
    'native-smoke-render-loop': ['awts-route-decision route=network-executor-render-stream reason=merkava-executor-compiled-html', 'awts-render-decision route=executor-stream result=drawn', 'opengl_renderer='],
    'native-real-http-webgl-dom': ['"ok": true', 'awts-route-decision route=network-executor-render-stream reason=merkava-executor-compiled-html', 'htmlHints canvas=1 webgl=1 drawArrays=1 local=1'],
    'native-network-renders-fetched-html': ['"ok": true', 'route=network-executor-render-stream reason=merkava-executor-compiled-html'],
    'native-webgl-opengl-render': ['"ok": true', 'awts-opengl-webgl-draw source=network-executor-render-stream', 'drawArrays=1', 'glError=0'],
    'embedded-merkava-stream-opengl': ['"ok": true', 'awts-opengl-webgl-draw source=merkava-bytecode-render-stream', 'drawArrays=1', 'glError=0'],
    'network-no-raw-bytecode-render': ['"ok": true', 'awts-opengl-render-stream-draw source=network-executor-render-stream', 'texts=1'],
    'chrome-real-webgl-dom': ['"ok": true', '"chrome": true', '"shaderOk": true', '"drawOk": true'],
  }[name] || [];
  for (const needle of mustHave) {
    if (!stdout.includes(needle)) throw new Error(`${name} missing ${needle}\n${stdout}`);
  }
  return { name, ok: true, preview: stdout.slice(0, 1200) };
}

const results = [];
for (const [name, [cmd, args]] of steps) {
  results.push(runStep(name, cmd, args));
}

console.log(JSON.stringify({ ok: true, total: results.length, results }, null, 2));
