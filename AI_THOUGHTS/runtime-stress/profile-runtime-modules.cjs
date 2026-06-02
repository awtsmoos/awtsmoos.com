// B"H
const started = Date.now();
const oldError = console.error.bind(console);
console.error = (...args) => oldError('[T+' + (Date.now() - started) + 'ms]', ...args);
process.env.MERKAVA_TRACE_STEPS = '1';
process.env.MERKAVA_TRACE_MODULES = '1';
require('./run-one-runtime.cjs');
