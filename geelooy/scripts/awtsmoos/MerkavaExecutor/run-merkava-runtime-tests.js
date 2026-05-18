// B"H
const fs = require('fs');
const path = require('path');
const { RuntimeAssembler } = require('./merkava-runtime/RuntimeAssembler.js');
const { RuntimeSnapshot } = require('./merkava-reality/RuntimeSnapshot.js');
const { RealityScore } = require('./merkava-reality/RealityScore.js');
const { RuntimeScouts } = require('./merkava-scouts/RuntimeScouts.js');

const root = __dirname;
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tests/runtime-manifest.json'), 'utf8'));

function collectFiles(dir, prefix = '') {
    const out = {};
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const rel = path.posix.join(prefix, name);
        if (fs.statSync(full).isDirectory()) Object.assign(out, collectFiles(full, rel));
        else out['tests/runtime/' + rel] = fs.readFileSync(full, 'utf8');
    }
    return out;
}

(async () => {
    const runtimeFiles = collectFiles(path.join(root, 'tests/runtime'));
    const results = [];
    for (const test of manifest.tests) {
        const files = { ...runtimeFiles, '/virtual/data.json': '{"ok":true}', '/tmp/input.txt': 'B"H' };
        const assembler = new RuntimeAssembler({ runtime: test.runtime, entry: test.entry, files, module: test.module });
        const run = await assembler.run(test.entry);
        const snapshot = RuntimeSnapshot.capture(run);
        const score = RealityScore.compute(snapshot);
        const scouts = RuntimeScouts.inspect(snapshot);
        results.push({ name: test.name, ok: score.ok, score, scouts });
    }
    console.log(JSON.stringify({ ok: results.every(r => r.ok), results }, null, 2));
    if (!results.every(r => r.ok)) process.exitCode = 1;
})();
