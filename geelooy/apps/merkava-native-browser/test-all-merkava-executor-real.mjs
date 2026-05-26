// B"H
import { execFileSync } from 'child_process';

const steps = [
  ['executor-render-stream-contract', ['node', ['core/testExecutorRenderStreamContract.mjs']]],
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
  const stdout = execFileSync(cmd, args, { encoding: 'utf8', timeout: 120000 });
  const mustHave = {
    'executor-render-stream-contract': ['"ok": true', '"commandCount": 19', '"streamBytes":'],
    'executor-real-dom-stress': ['"ok": true', '[hydrate]', '[render]', 'Real DOM'],
    'executor-shader-pipeline': ['"ok": true', '[webgl] CREATE_SHADER', '[webgl] LINK_PROGRAM ok=true'],
    'executor-webgl-bytecode-compiler': ['"ok": true', '[webgl] DRAW_ARRAYS', '"bytes":'],
    'native-build': ['"ok": true', '"exe": "merkavaapp.exe"', '"executorBytes":'],
    'native-runtime': ['"ok": true', '"total": 14', '"failed": []'],
    'native-executor-host-contract': ['"ok": true', '"contract": "embedded-executor-host"', 'awts-host-binding[12]=network.fetch', 'awts-host-binding[29]=webgl.drawArrays'],
    'native-smoke-render-loop': ['awts-route-decision route=network-html-dynamic reason=fetched-html-no-webgl', 'awts-render-decision route=dynamic-network result=drawn source=network-fetched', 'opengl_renderer='],
    'native-real-http-webgl-dom': ['"ok": true', 'awts-route-decision route=network-webgl-dynamic reason=webgl-dom-hints', 'htmlHints canvas=1 webgl=1 drawArrays=1 local=1'],
    'native-network-renders-fetched-html': ['"ok": true', 'AWTS_DYNAMIC_URL_CONTENT_18083', 'route=network-html-dynamic reason=fetched-html-no-webgl'],
    'native-webgl-opengl-render': ['"ok": true', 'awts-opengl-webgl-draw source=network-webgl-dynamic', 'drawArrays=1', 'glError=0'],
    'embedded-merkava-stream-opengl': ['"ok": true', 'awts-opengl-webgl-draw source=merkava-bytecode-render-stream', 'drawArrays=1', 'glError=0'],
    'network-no-raw-bytecode-render': ['"ok": true', 'AWTS_NO_RAW_BYTECODE_RENDER_18085', 'route=dynamic-network result=drawn source=network-fetched'],
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
