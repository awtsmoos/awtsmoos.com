// B"H
import { reportHeichelScrollHealth } from '../scrollHealth.js';
globalThis.window = globalThis;
globalThis.document = { documentElement: { scrollHeight: 2000, clientHeight: 800 }, querySelectorAll() { return []; } };
const report = reportHeichelScrollHealth();
if (!report.canScroll) throw new Error('scroll health should see scrollability');
console.log('B"H scrollHealth.test passed');
