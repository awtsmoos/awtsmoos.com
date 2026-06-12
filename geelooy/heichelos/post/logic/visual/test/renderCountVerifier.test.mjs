// B"H
import { verifyRenderedSectionCount } from '../renderCountVerifier.js';
globalThis.window = globalThis;
globalThis.document = { querySelectorAll(sel) { return sel.includes('.section') ? [1,2] : [1,2]; } };
const report = verifyRenderedSectionCount({ expected: 2 });
if (!report.ok || report.sections !== 2) throw new Error('render count verifier failed');
console.log('B"H renderCountVerifier.test passed');
