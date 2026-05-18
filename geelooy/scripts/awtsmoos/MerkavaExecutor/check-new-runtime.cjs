// B"H
const { spawnSync } = require('child_process');
const files = [
    'merkava-runtime/RuntimeGraph.js',
    'merkava-runtime/RuntimeAddress.js',
    'merkava-runtime/ImportResolver.js',
    'merkava-runtime/HTMLAssembler.js',
    'merkava-runtime/CSSAssembler.js',
    'merkava-runtime/ModuleExecutor.js',
    'merkava-runtime/RuntimeAssembler.js',
    'merkava-browser/VirtualConsole.js',
    'merkava-browser/VirtualStorage.js',
    'merkava-browser/VirtualElement.js',
    'merkava-browser/VirtualDocument.js',
    'merkava-browser/VirtualFetch.js',
    'merkava-browser/VirtualEvents.js',
    'merkava-browser/VirtualMouse.js',
    'merkava-browser/VirtualKeyboard.js',
    'merkava-browser/VirtualInteractions.js',
    'merkava-browser/RuntimeProbe.js',
    'merkava-browser/VirtualWindow.js',
    'merkava-browser/SyntheticBrowserRuntime.js',
    'merkava-node/VirtualNodeRuntime.js',
    'merkava-reality/RuntimeSnapshot.js',
    'merkava-reality/RealityScore.js',
    'merkava-scouts/RuntimeScouts.js',
    'run-merkava-runtime-tests.js'
];
let ok = true;
for (const file of files) {
    const res = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (res.status !== 0) {
        ok = false;
        console.error('FAIL', file, res.stderr);
    } else console.log('OK', file);
}
if (!ok) process.exit(1);
